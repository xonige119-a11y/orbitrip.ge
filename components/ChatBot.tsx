import React, { useState, useRef, useEffect } from 'react';
import { Language, ChatMessage } from '../types';
import { sendChatMessage } from '../services/geminiService';

interface ChatBotProps {
  language: Language;
  onBookLocation?: (locationName: string) => void;
  userLocation: string; // NEW PROP
}

const ChatBot: React.FC<ChatBotProps> = ({ language, onBookLocation, userLocation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setSelectedImage(file);
          const reader = new FileReader();
          reader.onload = (ev) => setImagePreview(ev.target?.result as string);
          reader.readAsDataURL(file);
      }
  };

  const clearImage = () => {
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input || (language === Language.EN ? "Analyze this image" : "Что это за фото?") };
    setMessages(prev => [...prev, userMsg]);
    
    setInput('');
    setLoading(true);

    try {
      // Convert Image to Base64 if exists
      let base64Image = undefined;
      let mimeType = undefined;

      if (selectedImage && imagePreview) {
          base64Image = imagePreview.split(',')[1];
          mimeType = selectedImage.type;
      }

      // Prepare history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Call Service with Location Context
      const response = await sendChatMessage(history, userMsg.text, base64Image, mimeType, userLocation);
      
      setMessages(prev => [...prev, { 
          role: 'model', 
          text: response.text || '',
          groundingMetadata: response.groundingMetadata
      }]);
      
      // Cleanup image after send
      clearImage();

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Error connecting to OrbiTrip AI.', isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  // Render Google Maps Grounding Chips
  const renderGroundingChips = (metadata: any) => {
      if (!metadata || !metadata.groundingChunks) return null;
      
      const places = metadata.groundingChunks
        .filter((chunk: any) => chunk.web?.title || chunk.web?.uri) // Simple filter for valid map data
        .map((chunk: any) => chunk.web?.title)
        .filter((title: string | undefined): title is string => !!title); // Type guard

      if (places.length === 0) return null;

      // Deduplicate
      const uniquePlaces = Array.from(new Set(places)) as string[];

      return (
          <div className="flex flex-wrap gap-2 mt-2">
              {uniquePlaces.map((place: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                        setIsOpen(false);
                        if (onBookLocation) onBookLocation(place);
                    }}
                    className="flex items-center text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-100 border border-indigo-200 transition font-bold"
                  >
                      <span className="mr-1">🚕</span>
                      {language === Language.EN ? `Book Ride to ${place}` : `Заказать в ${place}`}
                  </button>
              ))}
          </div>
      );
  };

  // BASIC SECURITY: SANITIZE HTML
  // Removes script tags, iframes, and event handlers to prevent XSS
  const sanitizeHtml = (html: string) => {
      if (!html) return '';
      return html
          .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
          .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gm, "")
          .replace(/on\w+="[^"]*"/g, "") // Remove onClick, onError, etc
          .replace(/javascript:/g, "")
          .replace(/\n/g, '<br/>'); // Keep line breaks
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition transform hover:scale-110 flex items-center justify-center relative"
        >
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-xl shadow-2xl w-80 sm:w-96 flex flex-col h-[550px] border border-gray-200 overflow-hidden font-sans">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-bold text-sm">{language === Language.EN ? "OrbiTrip Assistant" : "AI Помощник"}</h3>
                <p className="text-[10px] opacity-80 flex items-center gap-1">
                    <span className="opacity-75">near</span> 
                    <span className="font-bold underline">{userLocation}</span>
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-10">
                <div className="text-4xl mb-2">🤖</div>
                <p className="text-sm font-bold text-gray-800 mb-2">
                    {language === Language.EN ? "Hello! How can I help?" : "Здравствуйте! Чем помочь?"}
                </p>
                <p className="text-xs max-w-[200px] mx-auto text-gray-400">
                    {language === Language.EN 
                        ? "Ask about transfers, free stops, or check pricing. For urgent help, I'll connect you to an operator." 
                        : "Спросите о трансферах, бесплатных остановках или ценах. Если что-то срочное, я переключу вас на оператора."}
                </p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : msg.isError ? 'bg-red-100 text-red-800' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                }`}>
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.text) }} />
                </div>
                {/* Render Booking Chips if Maps Data exists */}
                {msg.role === 'model' && msg.groundingMetadata && renderGroundingChips(msg.groundingMetadata)}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-gray-200 bg-white">
            {imagePreview && (
                <div className="relative mb-2 inline-block">
                    <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-300" />
                    <button onClick={clearImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md">×</button>
                </div>
            )}
            <div className="flex space-x-2 items-center">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-indigo-600 p-2 hover:bg-gray-100 rounded-full transition"
                title="Upload Image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageSelect}
              />
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={language === Language.EN ? "Ask anything..." : "Спросите о чем угодно..."}
                className="flex-1 border border-gray-200 bg-gray-50 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition focus:bg-white"
              />
              <button 
                onClick={handleSend}
                disabled={loading || (!input && !selectedImage)}
                className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;