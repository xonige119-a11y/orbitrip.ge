
import React, { useState } from 'react';
import { Language } from '../types';

interface FloatingContactProps {
  language: Language;
}

const FloatingContact: React.FC<FloatingContactProps> = ({ language }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const isEn = language === Language.EN;
  const whatsappNumber = '995593456876';
  const defaultMessage = isEn 
    ? "Hello, I have a question about Orbitrip." 
    : "Здравствуйте, у меня вопрос по Orbitrip.";

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
      {/* Tooltip Label */}
      <div 
        className={`bg-white text-gray-800 px-4 py-2 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 transform origin-right ${isHovered ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-4 pointer-events-none'}`}
      >
        <p className="text-sm font-bold">{isEn ? "Need Help? Chat with us!" : "Нужна помощь? Напишите нам!"}</p>
      </div>

      {/* Main Button */}
      <a 
        href={whatsappLink} 
        target="_blank" 
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl transition-transform hover:scale-110 flex items-center justify-center relative group"
        aria-label="Contact via WhatsApp"
      >
        {/* Ping Animation */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-300"></span>
        </span>

        {/* WhatsApp Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
        </svg>
      </a>
    </div>
  );
};

export default FloatingContact;
