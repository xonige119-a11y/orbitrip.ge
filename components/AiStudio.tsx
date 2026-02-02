import React, { useState } from 'react';
import { Language, ToolType } from '../types';
import { 
  searchTravelInfo, 
  generateTourImage, 
  editTourImage, 
  analyzeTourImage, 
  generateVeoVideo 
} from '../services/geminiService';

interface AiStudioProps {
  language: Language;
}

const AiStudio: React.FC<AiStudioProps> = ({ language }) => {
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.SEARCH);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<any>(null); // Text or Image URL
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  // Specific Options
  const [imgSize, setImgSize] = useState<"1K" | "2K" | "4K">("1K");
  const [videoAspect, setVideoAspect] = useState<"16:9" | "9:16">("16:9");

  // Helper to read file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const checkApiKey = async () => {
    if ((activeTool === ToolType.VIDEO_GEN || activeTool === ToolType.IMAGE_GEN) && window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await window.aistudio.openSelectKey();
        }
    }
  }

  const executeAction = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      await checkApiKey(); // Ensure key for paid models

      if (activeTool === ToolType.SEARCH) {
        const res = await searchTravelInfo(prompt, language);
        setResult(res);
      } 
      else if (activeTool === ToolType.IMAGE_GEN) {
        const url = await generateTourImage(prompt, imgSize);
        setResult(url);
      }
      else if (activeTool === ToolType.IMAGE_EDIT) {
        if (!selectedFile) throw new Error("Please upload an image to edit.");
        const base64 = await fileToBase64(selectedFile);
        const url = await editTourImage(base64, prompt, selectedFile.type);
        setResult(url);
      }
      else if (activeTool === ToolType.ANALYZE) {
        if (!selectedFile) throw new Error("Please upload an image to analyze.");
        const base64 = await fileToBase64(selectedFile);
        const text = await analyzeTourImage(base64, selectedFile.type, language);
        setResult(text);
      }
      else if (activeTool === ToolType.VIDEO_GEN) {
        let base64 = undefined;
        let mime = undefined;
        if (selectedFile) {
           base64 = await fileToBase64(selectedFile);
           mime = selectedFile.type;
        }
        const videoUrl = await generateVeoVideo(prompt, base64, mime, videoAspect);
        setResult(videoUrl);
      }

    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("Requested entity was not found") && window.aistudio) {
          await window.aistudio.openSelectKey();
          setError("Key error. Please try again.");
      } else {
          setError(err.message || "An error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getToolTitle = () => {
      switch(activeTool) {
          case ToolType.SEARCH: return language === Language.EN ? 'Travel Search' : 'Поиск Информации';
          case ToolType.IMAGE_GEN: return language === Language.EN ? 'Generate Dream Image' : 'Генерация Фото';
          case ToolType.IMAGE_EDIT: return language === Language.EN ? 'Edit Your Photo' : 'Редактировать Фото';
          case ToolType.ANALYZE: return language === Language.EN ? 'Analyze Landmark' : 'Анализ Мест';
          case ToolType.VIDEO_GEN: return language === Language.EN ? 'Create Magic Video' : 'Создать Видео';
          default: return '';
      }
  }

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden min-h-[600px] flex flex-col md:flex-row">
      {/* Sidebar - Horizontal on Mobile, Vertical on Desktop */}
      <div className="bg-slate-800 text-white w-full md:w-64 flex-shrink-0 p-4 md:p-6 space-x-2 md:space-x-0 md:space-y-2 flex flex-row md:flex-col overflow-x-auto no-scrollbar">
        <h3 className="text-xl font-bold mb-0 md:mb-6 text-indigo-400 hidden md:block">OrbiTrip AI</h3>
        
        <button 
            onClick={() => { setActiveTool(ToolType.SEARCH); setResult(null); setError(''); }}
            className={`whitespace-nowrap md:w-full text-left p-3 rounded-lg flex items-center space-x-2 transition ${activeTool === ToolType.SEARCH ? 'bg-indigo-600' : 'hover:bg-slate-700 bg-slate-700/50 md:bg-transparent'}`}>
            <span>🔍</span><span className="text-sm md:text-base">{language === Language.EN ? 'Search' : 'Поиск'}</span>
        </button>

        <button 
            onClick={() => { setActiveTool(ToolType.ANALYZE); setResult(null); setError(''); }}
            className={`whitespace-nowrap md:w-full text-left p-3 rounded-lg flex items-center space-x-2 transition ${activeTool === ToolType.ANALYZE ? 'bg-indigo-600' : 'hover:bg-slate-700 bg-slate-700/50 md:bg-transparent'}`}>
            <span>📷</span><span className="text-sm md:text-base">{language === Language.EN ? 'Analyze' : 'Анализ'}</span>
        </button>

        <button 
            onClick={() => { setActiveTool(ToolType.IMAGE_GEN); setResult(null); setError(''); }}
            className={`whitespace-nowrap md:w-full text-left p-3 rounded-lg flex items-center space-x-2 transition ${activeTool === ToolType.IMAGE_GEN ? 'bg-indigo-600' : 'hover:bg-slate-700 bg-slate-700/50 md:bg-transparent'}`}>
            <span>🎨</span><span className="text-sm md:text-base">{language === Language.EN ? 'Create' : 'Фото'}</span>
        </button>

        <button 
            onClick={() => { setActiveTool(ToolType.IMAGE_EDIT); setResult(null); setError(''); }}
            className={`whitespace-nowrap md:w-full text-left p-3 rounded-lg flex items-center space-x-2 transition ${activeTool === ToolType.IMAGE_EDIT ? 'bg-indigo-600' : 'hover:bg-slate-700 bg-slate-700/50 md:bg-transparent'}`}>
            <span>✏️</span><span className="text-sm md:text-base">{language === Language.EN ? 'Edit' : 'Редактор'}</span>
        </button>

        <button 
            onClick={() => { setActiveTool(ToolType.VIDEO_GEN); setResult(null); setError(''); }}
            className={`whitespace-nowrap md:w-full text-left p-3 rounded-lg flex items-center space-x-2 transition ${activeTool === ToolType.VIDEO_GEN ? 'bg-indigo-600' : 'hover:bg-slate-700 bg-slate-700/50 md:bg-transparent'}`}>
            <span>🎬</span><span className="text-sm md:text-base">{language === Language.EN ? 'Video' : 'Видео'}</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 bg-slate-50 overflow-y-auto">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">{getToolTitle()}</h2>

        <div className="space-y-6 max-w-3xl mx-auto">
            {/* File Input for Edit/Analyze/Video */}
            {(activeTool === ToolType.IMAGE_EDIT || activeTool === ToolType.ANALYZE || activeTool === ToolType.VIDEO_GEN) && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === Language.EN ? "Upload Source Image" : "Загрузить Исходное Фото"}
                    </label>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {filePreview && <img src={filePreview} alt="Preview" className="mt-4 h-48 rounded-lg object-cover mx-auto" />}
                </div>
            )}

            {/* Configs */}
            {activeTool === ToolType.IMAGE_GEN && (
                <div className="flex space-x-2 md:space-x-4">
                    {(['1K', '2K', '4K'] as const).map(size => (
                        <button 
                            key={size}
                            onClick={() => setImgSize(size)}
                            className={`flex-1 px-4 py-2 rounded-md border text-sm ${imgSize === size ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300'}`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            )}

            {activeTool === ToolType.VIDEO_GEN && (
                <div className="flex space-x-2 md:space-x-4">
                     <button 
                        onClick={() => setVideoAspect("16:9")}
                        className={`flex-1 px-4 py-2 rounded-md border text-sm ${videoAspect === "16:9" ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300'}`}
                    >
                        16:9
                    </button>
                    <button 
                        onClick={() => setVideoAspect("9:16")}
                        className={`flex-1 px-4 py-2 rounded-md border text-sm ${videoAspect === "9:16" ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300'}`}
                    >
                        9:16 (Story)
                    </button>
                </div>
            )}

            {/* Text Input */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {activeTool === ToolType.SEARCH && (language === Language.EN ? "What do you want to know?" : "Что вы хотите узнать?")}
                    {activeTool === ToolType.IMAGE_GEN && (language === Language.EN ? "Describe the image to generate" : "Опишите желаемое изображение")}
                    {activeTool === ToolType.IMAGE_EDIT && (language === Language.EN ? "What should be changed?" : "Что изменить?")}
                    {activeTool === ToolType.VIDEO_GEN && (language === Language.EN ? "Describe the video motion" : "Опишите движение видео")}
                    {activeTool === ToolType.ANALYZE && (language === Language.EN ? "Optional: Question about image" : "Опционально: Вопрос по фото")}
                </label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border p-2"
                    placeholder="..."
                />
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 text-sm">
                    {error}
                </div>
            )}

            <button
                onClick={executeAction}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-md shadow text-white font-medium bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex justify-center items-center`}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </>
                ) : (language === Language.EN ? 'Run AI Magic' : 'Запустить AI')}
            </button>

            {/* Results Area */}
            {result && (
                <div className="mt-8 bg-white p-4 md:p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Result:</h3>
                    
                    {/* Search Text */}
                    {activeTool === ToolType.SEARCH && (
                        <div className="prose prose-indigo max-w-none text-gray-700 text-sm md:text-base">
                            <div dangerouslySetInnerHTML={{ __html: result.text.replace(/\n/g, '<br/>') }} />
                            {result.sources && result.sources.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h4 className="text-sm font-bold">Sources:</h4>
                                    <ul className="list-disc pl-5 text-xs text-gray-500">
                                        {result.sources.map((chunk: any, i: number) => (
                                           <li key={i}>
                                               <a href={chunk.web?.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                                 {chunk.web?.title || 'Source link'}
                                               </a>
                                           </li> 
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Analysis Text */}
                    {activeTool === ToolType.ANALYZE && (
                        <div className="prose max-w-none text-gray-700 text-sm md:text-base">
                           {result}
                        </div>
                    )}

                    {/* Generated/Edited Image */}
                    {(activeTool === ToolType.IMAGE_GEN || activeTool === ToolType.IMAGE_EDIT) && (
                        <div className="flex justify-center">
                            <img src={result} alt="Generated" className="rounded-lg shadow-lg max-h-[300px] md:max-h-[500px] w-full object-contain" />
                        </div>
                    )}

                    {/* Generated Video */}
                    {activeTool === ToolType.VIDEO_GEN && (
                         <div className="flex justify-center">
                            <video controls autoPlay loop className="rounded-lg shadow-lg max-h-[300px] md:max-h-[500px] w-full">
                                <source src={result} type="video/mp4" />
                                Your browser does not support video.
                            </video>
                         </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AiStudio;