
import React, { useState, useEffect, useRef } from 'react';
import { Language, Tour, PriceOption } from '../types';
import { generateAudioGuide } from '../services/geminiService';
import SEO from './SEO'; // Import SEO component
import { generateTourSchema, generateBreadcrumbSchema } from '../services/schema'; // Import Schema generators

interface TourDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: Tour;
  language: Language;
  onBook: (tour: Tour) => void;
}

const TourDetailModal: React.FC<TourDetailModalProps> = ({ isOpen, onClose, tour, language, onBook }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ITINERARY' | 'REVIEWS'>('OVERVIEW');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // --- SMART PRICING LOGIC ---
  const [calculatedPrice, setCalculatedPrice] = useState<string>(tour.price);

  useEffect(() => {
      if (isOpen) {
          if (tour.priceOptions && tour.priceOptions.length > 0) {
              setCalculatedPrice(tour.priceOptions[0].price);
          } else {
              setCalculatedPrice(tour.price);
          }
          setActiveTab('OVERVIEW');
          document.body.style.overflow = 'hidden';
      }
      return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, tour]);

  const handleAudioGenerate = async () => {
      if (audioUrl) {
          const audio = document.getElementById('tour-audio') as HTMLAudioElement;
          audio?.play();
          return;
      }
      setLoadingAudio(true);
      try {
          const text = language === Language.EN ? tour.descriptionEn : tour.descriptionRu;
          const base64 = await generateAudioGuide(text, language);
          const blob = await (await fetch(`data:audio/mp3;base64,${base64}`)).blob();
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          setTimeout(() => {
              const audio = document.getElementById('tour-audio') as HTMLAudioElement;
              audio?.play();
          }, 100);
      } catch (e) {
          console.error(e);
          alert("Audio guide unavailable right now.");
      } finally {
          setLoadingAudio(false);
      }
  };

  const handleBookingRedirect = () => {
      // Pass the tour back to App.tsx to initiate the Driver Search flow
      onBook(tour);
  };

  if (!isOpen) return null;

  const isEn = language === Language.EN;
  const itinerary = isEn ? tour.itineraryEn : tour.itineraryRu;
  const hasItinerary = itinerary && itinerary.length > 0;

  // SEO Helpers
  const tourTitle = isEn ? tour.titleEn : tour.titleRu;
  const tourDesc = isEn ? tour.descriptionEn : tour.descriptionRu;
  const breadcrumbs = [
      { name: isEn ? "Home" : "Главная", item: "https://orbitrip.ge/" },
      { name: isEn ? "Tours" : "Туры", item: "https://orbitrip.ge/tours" },
      { name: tourTitle, item: window.location.href }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      
      {/* DYNAMIC SEO INJECTION FOR THIS TOUR */}
      <SEO 
        title={`${tourTitle} - Private Tour | OrbiTrip`}
        description={tourDesc.substring(0, 160)}
        image={tour.image}
        type="product"
        keywords={`${tourTitle}, Georgia tour, private driver, Orbitrip, ${tour.category}`}
      />
      
      {/* STRUCTURED DATA INJECTION */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: generateTourSchema(tour) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: generateBreadcrumbSchema(breadcrumbs) }} />

      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal Panel */}
      <div className="flex min-h-screen items-center justify-center p-0 md:p-4">
        <div ref={modalRef} className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[100vh] md:h-[85vh] animate-fadeIn">
            
            {/* CLOSE BUTTON (Mobile Fixed) */}
            <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-white/50 hover:bg-white p-2 rounded-full backdrop-blur-md shadow-sm transition">
                <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* --- LEFT: VISUALS (40%) --- */}
            <div className="w-full md:w-2/5 h-64 md:h-full relative bg-gray-100 flex-shrink-0">
                <img 
                    src={tour.image} 
                    alt={tour.titleEn} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">
                        {tour.category}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black leading-tight mb-2">
                        {isEn ? tour.titleEn : tour.titleRu}
                    </h2>
                    <div className="flex items-center space-x-3 text-sm font-medium opacity-90">
                        <span className="flex items-center">⭐ {tour.rating}</span>
                        <span>•</span>
                        <span>🕒 {tour.duration}</span>
                    </div>
                </div>

                {/* Audio Button */}
                <button 
                    onClick={handleAudioGenerate}
                    className="absolute top-4 left-4 bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full text-white transition flex items-center gap-2 group"
                >
                    <span className="text-xl">{loadingAudio ? '⏳' : '🎧'}</span>
                    <span className="text-xs font-bold max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap">
                        {isEn ? "Listen Guide" : "Аудиогид"}
                    </span>
                </button>
                {audioUrl && <audio id="tour-audio" src={audioUrl} className="hidden" />}
            </div>

            {/* --- RIGHT: CONTENT (60%) --- */}
            <div className="flex-1 flex flex-col bg-white h-full overflow-hidden relative">
                
                {/* TABS */}
                <div className="flex border-b border-gray-100 px-6 pt-4 space-x-6 flex-shrink-0">
                    <button onClick={() => setActiveTab('OVERVIEW')} className={`pb-4 text-sm font-bold border-b-2 transition ${activeTab === 'OVERVIEW' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                        {isEn ? 'Overview' : 'Обзор'}
                    </button>
                    {hasItinerary && (
                        <button onClick={() => setActiveTab('ITINERARY')} className={`pb-4 text-sm font-bold border-b-2 transition ${activeTab === 'ITINERARY' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                            {isEn ? 'Itinerary' : 'Маршрут'}
                        </button>
                    )}
                    <button onClick={() => setActiveTab('REVIEWS')} className={`pb-4 text-sm font-bold border-b-2 transition ${activeTab === 'REVIEWS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                        {isEn ? 'Reviews' : 'Отзывы'} ({tour.reviews?.length || 0})
                    </button>
                </div>

                {/* SCROLLABLE CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar pb-32">
                    
                    {/* OVERVIEW TAB */}
                    {activeTab === 'OVERVIEW' && (
                        <div className="space-y-8 animate-fadeIn">
                            {/* Description */}
                            <div>
                                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                    {isEn ? tour.descriptionEn : tour.descriptionRu}
                                </p>
                            </div>

                            {/* Highlights Grid */}
                            <div>
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4">{isEn ? 'Highlights' : 'Особенности'}</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {(isEn ? tour.highlightsEn : tour.highlightsRu).map((h, i) => (
                                        <div key={i} className="flex items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <span className="text-indigo-500 mr-2 mt-0.5">✓</span>
                                            <span className="text-sm font-medium text-gray-700 leading-snug">{h}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Included / Excluded */}
                            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                                <div>
                                    <h3 className="text-xs font-black text-emerald-600 uppercase tracking-wider mb-3">{isEn ? 'Included' : 'Включено'}</h3>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-center"><span className="mr-2">⛽</span> {isEn ? "Fuel & Transport" : "Топливо и Транспорт"}</li>
                                        <li className="flex items-center"><span className="mr-2">👨‍✈️</span> {isEn ? "Private Driver" : "Личный Водитель"}</li>
                                        <li className="flex items-center"><span className="mr-2">📸</span> {isEn ? "Photo Stops" : "Остановки для фото"}</li>
                                        <li className="flex items-center"><span className="mr-2">💧</span> {isEn ? "Bottled Water" : "Вода"}</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-red-500 uppercase tracking-wider mb-3">{isEn ? 'Not Included' : 'Не включено'}</h3>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-center text-gray-400"><span className="mr-2 text-red-300">✕</span> {isEn ? "Entrance Tickets" : "Входные билеты"}</li>
                                        <li className="flex items-center text-gray-400"><span className="mr-2 text-red-300">✕</span> {isEn ? "Food & Drinks" : "Еда и напитки"}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ITINERARY TAB */}
                    {activeTab === 'ITINERARY' && (
                        <div className="animate-fadeIn pl-2">
                            <div className="relative border-l-2 border-indigo-100 space-y-8 ml-3">
                                {itinerary?.map((step, idx) => (
                                    <div key={idx} className="relative pl-8">
                                        {/* Dot */}
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white bg-indigo-600 shadow-md"></div>
                                        
                                        {/* Content */}
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                                                {isEn ? `Step ${idx + 1}` : `Шаг ${idx + 1}`}
                                            </span>
                                            <p className="text-gray-800 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                                                {step}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div className="relative pl-8">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white bg-green-500 shadow-md"></div>
                                    <p className="font-bold text-gray-900">{isEn ? "Drop-off at your hotel" : "Возвращение в отель"}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* REVIEWS TAB */}
                    {activeTab === 'REVIEWS' && (
                        <div className="space-y-4 animate-fadeIn">
                            {tour.reviews && tour.reviews.length > 0 ? tour.reviews.map((r, i) => (
                                <div key={i} className="bg-gray-50 p-4 rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-gray-900">{r.author}</span>
                                        <span className="text-yellow-500 text-xs">{'★'.repeat(r.rating)}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 italic">"{isEn ? r.textEn : r.textRu}"</p>
                                </div>
                            )) : (
                                <div className="text-center py-10 text-gray-400">
                                    {isEn ? "No reviews yet. Be the first!" : "Отзывов пока нет. Будьте первым!"}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* STICKY FOOTER (Booking Logic) */}
                <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">{isEn ? "Start From" : "Цена От"}</p>
                            <div className="flex items-baseline">
                                <span className="text-3xl font-black text-gray-900 tracking-tight">{calculatedPrice}</span>
                            </div>
                        </div>
                        <button 
                            onClick={handleBookingRedirect}
                            className="bg-gray-900 hover:bg-black text-white px-6 md:px-8 py-4 rounded-xl font-bold text-base md:text-lg shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 active:scale-95 flex items-center"
                        >
                            {isEn ? "Select Driver & Date" : "Выбрать Водителя и Дату"}
                            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailModal;
