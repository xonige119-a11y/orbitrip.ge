import React, { useState, useEffect, useMemo } from 'react';
import { Language, Tour } from '../types';
import SEO from './SEO';
import { generateTourSchema } from '../services/schema';

interface TourDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: Tour | null;
  language: Language;
  onBook: (tour: Tour, guests: number) => void;
  initialStartLocation?: string; 
}

const TourDetailModal: React.FC<TourDetailModalProps> = ({ isOpen, onClose, tour, language, onBook, initialStartLocation }) => {
  const [guestCount, setGuestCount] = useState(2);
  
  // Route Editor State
  const [startLocation, setStartLocation] = useState('kutaisi');
  const [endLocation, setEndLocation] = useState('kutaisi');
  
  // Reset state when modal opens
  useEffect(() => {
      if (isOpen && tour) {
          setGuestCount(2);
          const defaultLoc = initialStartLocation || 'kutaisi';
          setStartLocation(defaultLoc);
          setEndLocation(defaultLoc);
          
          // Disable body scroll when modal is open
          document.body.style.overflow = 'hidden';
      }
      return () => {
          // Re-enable scroll when closed
          document.body.style.overflow = 'auto';
      }
  }, [isOpen, tour, initialStartLocation]);

  // --- SMART CALCULATOR LOGIC ---
  const calculation = useMemo(() => {
      if (!tour) return { price: 0, vehicle: 'Sedan', note: '' };

      // 1. SMART PRICING (Priority)
      if (tour.basePrice && tour.extraPersonFee !== undefined) {
          const total = tour.basePrice + (guestCount * tour.extraPersonFee);
          
          let vehicle = 'Sedan';
          if (guestCount > 3) vehicle = 'Minivan';
          if (guestCount > 7) vehicle = 'Bus';

          return { 
              price: total, 
              vehicle, 
              note: `Base $${tour.basePrice} + $${tour.extraPersonFee}/pax` 
          };
      }

      // 2. FALLBACK: Distance-based Logic (Legacy)
      let vehicleType = 'Sedan';
      let basePrice = 140; 
      if (guestCount > 3) { vehicleType = 'Minivan'; basePrice = 220; }
      if (guestCount > 7) { vehicleType = 'Bus'; basePrice = 350; }
      
      const estimatedKm = (tour.routeStops?.length || 2) * 60; 
      const price = basePrice + Math.round(estimatedKm * 0.5);

      return { price, vehicle: vehicleType, note: 'Estimated based on distance' };

  }, [tour, guestCount]);

  const handleWhatsAppBook = () => {
      if (!tour) return;
      const title = language === Language.EN ? tour.titleEn : tour.titleRu;
      const text = `Hello Orbitrip! I want to book ${title} for ${guestCount} persons. Total price shown on site: ${calculation.price} GEL. Is it available?`;
      const encoded = encodeURIComponent(text);
      window.open(`https://wa.me/995593456876?text=${encoded}`, '_blank');
  };

  if (!isOpen || !tour) return null;

  return (
    // FIX: Z-Index 9999 ensures it sits on top of the Sticky Header (z-100)
    <div className="fixed inset-0 z-[9999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Dynamic SEO for specific tour */}
      <SEO 
        title={language === Language.EN ? tour.titleEn : tour.titleRu}
        description={language === Language.EN ? tour.descriptionEn : tour.descriptionRu}
        image={tour.image}
        type="product"
        url={window.location.href}
      />
      {/* Product Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: generateTourSchema(tour) }} />

      <div className="flex min-h-full items-center justify-center p-0 sm:p-4 text-center">
        {/* Background Overlay */}
        <div className="fixed inset-0 bg-slate-900/90 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={onClose}></div>

        {/* Modal Panel - Centered & Responsive */}
        <div className="relative transform overflow-hidden bg-white text-left shadow-2xl transition-all sm:rounded-3xl w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-6xl flex flex-col my-auto">
          
          <div className="flex flex-col lg:flex-row h-full overflow-hidden">
            
            {/* LEFT: VISUAL & CONTENT (Scrollable) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-white pb-32 lg:pb-0">
                <div className="relative h-64 lg:h-80 flex-shrink-0 group">
                    <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={tour.image} alt={tour.titleEn} />
                    <button onClick={onClose} className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition z-20 backdrop-blur-sm shadow-lg">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/60 to-transparent p-8">
                        <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block uppercase tracking-wider shadow-md">{tour.category}</span>
                        <h2 className="text-2xl md:text-4xl font-black text-white shadow-sm leading-tight">
                            {language === Language.EN ? tour.titleEn : tour.titleRu}
                        </h2>
                    </div>
                </div>

                <div className="p-6 lg:p-10 space-y-10">
                    {/* Description */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center text-xl">
                            <span className="mr-2">📝</span> {language === Language.EN ? 'Experience' : 'Описание'}
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                            {language === Language.EN ? tour.descriptionEn : tour.descriptionRu}
                        </p>
                    </div>

                    {/* Highlights */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center text-xl">
                            <span className="mr-2">✨</span> {language === Language.EN ? 'Highlights' : 'Особенности'}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(language === Language.EN ? tour.highlightsEn : tour.highlightsRu).map((item, idx) => (
                                <div key={idx} className="flex items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                    <span className="text-indigo-500 mr-3 text-xl">✦</span>
                                    <span className="text-sm font-bold text-gray-800">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Route Stops */}
                     {tour.routeStops && (
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center text-xl">
                                <span className="mr-2">🗺️</span> {language === Language.EN ? 'Route' : 'Маршрут'}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {tour.routeStops.map((stop, idx) => (
                                    <React.Fragment key={idx}>
                                        <span className="bg-gray-100 px-3 py-1 rounded-lg font-medium text-gray-700">{stop}</span>
                                        {idx < (tour.routeStops?.length || 0) - 1 && <span className="text-gray-400">➝</span>}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: SMART CALCULATOR (Sticky on Desktop, Bottom on Mobile) */}
            <div className="lg:w-[400px] bg-slate-50 border-t lg:border-t-0 lg:border-l border-gray-200 p-6 lg:p-10 flex flex-col shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.05)] z-20 h-auto lg:h-full justify-between">
                
                <div className="space-y-8">
                    <h3 className="text-2xl font-black text-gray-900 border-b border-gray-200 pb-4 hidden lg:block">
                        {language === Language.EN ? 'Book Trip' : 'Бронирование'}
                    </h3>
                    
                    {/* Guest Counter */}
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">
                            {language === Language.EN ? 'Number of Guests' : 'Количество гостей'}
                        </label>
                        <div className="flex items-center bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
                            <button 
                                onClick={() => setGuestCount(Math.max(1, guestCount - 1))} 
                                className="w-12 h-12 flex items-center justify-center text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 transition font-black text-xl active:scale-95"
                            >-</button>
                            <span className="flex-1 text-center font-black text-3xl text-gray-900">{guestCount}</span>
                            <button 
                                onClick={() => setGuestCount(Math.min(15, guestCount + 1))} 
                                className="w-12 h-12 flex items-center justify-center text-white bg-indigo-600 rounded-xl shadow-md hover:bg-indigo-700 transition font-black text-xl active:scale-95"
                            >+</button>
                        </div>
                    </div>

                    {/* Price Display */}
                    <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-sm relative overflow-hidden group text-center">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-xl opacity-50 -mr-8 -mt-8"></div>
                        <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-2 relative z-10">
                            {language === Language.EN ? 'Total Price (Vehicle + Driver)' : 'Итоговая Цена (Авто + Водитель)'}
                        </p>
                        
                        <div className="flex items-baseline justify-center relative z-10">
                            <span className="text-6xl font-black text-indigo-900 tracking-tighter">{calculation.price}</span>
                            <span className="text-xl font-bold text-indigo-900 ml-1">₾</span>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap justify-center gap-2 relative z-10">
                            <span className="bg-indigo-50 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 border border-indigo-100">
                                {calculation.vehicle}
                            </span>
                            <span className="bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 border border-emerald-100">
                                {language === Language.EN ? 'All Inclusive' : 'Всё включено'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-3">
                    {/* WhatsApp Button */}
                    <button
                        onClick={handleWhatsAppBook}
                        className="w-full bg-[#25D366] hover:bg-[#20b858] text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-green-200 transition transform hover:-translate-y-1 flex justify-center items-center group"
                    >
                        <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                        {language === Language.EN ? 'Book via WhatsApp' : 'Заказать в WhatsApp'}
                    </button>
                    <p className="text-center text-xs text-gray-400 font-medium">
                        {language === Language.EN ? 'Fast response • No prepayment required' : 'Быстрый ответ • Без предоплаты'}
                    </p>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailModal;