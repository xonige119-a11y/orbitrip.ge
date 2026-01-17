
import React, { useState, useMemo } from 'react';
import { Language, Tour, Driver } from '../types';
import { GEORGIAN_LOCATIONS } from '../data/locations';

interface TourListProps {
  tours: Tour[];
  language: Language;
  onViewDetails: (tour: Tour, startLocationId: string) => void;
  drivers?: Driver[]; 
}

const CATEGORIES = [
    { id: 'ALL', labelEn: 'All Types', labelRu: 'Все типы', icon: '♾️' },
    { id: 'AUTHOR', labelEn: "Author's Tours", labelRu: 'Авторские Туры', icon: '⭐' }, // NEW CATEGORY
    { id: 'CULTURE', labelEn: 'Culture', labelRu: 'Культура', icon: '🏛️' },
    { id: 'MOUNTAINS', labelEn: 'Mountains', labelRu: 'Горы', icon: '🏔️' },
    { id: 'WINE', labelEn: 'Wine', labelRu: 'Вино', icon: '🍷' },
    { id: 'SEA', labelEn: 'Sea', labelRu: 'Море', icon: '🌊' },
    { id: 'NATURE', labelEn: 'Nature', labelRu: 'Природа', icon: '🌿' }
];

const START_LOCATIONS = [
    { id: 'all', labelEn: 'All Locations', labelRu: 'Все локации', icon: '🌍' },
    { id: 'tbilisi', labelEn: 'From Tbilisi', labelRu: 'Из Тбилиси', icon: '🏙️' },
    { id: 'kutaisi', labelEn: 'From Kutaisi', labelRu: 'Из Кутаиси', icon: '✈️' },
    { id: 'batumi', labelEn: 'From Batumi', labelRu: 'Из Батуми', icon: '🌊' },
];

const LOCATION_SYNONYMS: Record<string, string[]> = {
    'tbilisi': ['tbilisi', 'tbs', 'rustavi', 'mtskheta', 'tbilisi airport', 'natakhtari'],
    'kutaisi': ['kutaisi', 'kut', 'tskantubo', 'kopitnari', 'bagdati', 'promethe'],
    'batumi': ['batumi', 'bus', 'kobuleti', 'gonio', 'chakvi', 'kvariati', 'ureki', 'shekvetili']
};

const ITEMS_PER_PAGE = 12;

const TourList: React.FC<TourListProps> = ({ tours, language, onViewDetails, drivers = [] }) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [userLocation, setUserLocation] = useState('all');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const calculateDisplayPrices = (tour: Tour) => {
      let base = tour.basePrice && tour.basePrice > 0 ? tour.basePrice : 0;
      
      // Fallback if basePrice is 0 but price string exists
      if (base === 0 && tour.price) {
          const extracted = parseFloat(tour.price.replace(/[^0-9.]/g, ''));
          if (!isNaN(extracted)) base = extracted;
      }

      if (base === 0) return { original: 'Request' };

      // STRICT REQUIREMENT: No promo display on cards. Always return base price.
      return { original: `${base} GEL` };
  };

  const filteredTours = useMemo(() => {
      let list = [...tours];
      
      if (activeCategory !== 'ALL') {
          list = list.filter(t => t.category === activeCategory);
      }

      if (userLocation !== 'all') {
          list = list.filter(t => {
              const searchKey = userLocation.toLowerCase();
              const allowedKeywords = LOCATION_SYNONYMS[searchKey] || [searchKey];
              let startPoint = '';
              if (Array.isArray(t.routeStops) && t.routeStops.length > 0) {
                  const firstStop = t.routeStops[0];
                  if (firstStop && typeof firstStop === 'string') startPoint = firstStop.toLowerCase();
              } else if (Array.isArray(t.itineraryEn) && t.itineraryEn.length > 0) {
                   startPoint = t.itineraryEn[0].toLowerCase();
              } else {
                  startPoint = (t.titleEn || '').toLowerCase();
              }
              return allowedKeywords.some(keyword => startPoint.includes(keyword));
          });
      }
      
      list.sort((a, b) => {
          // Prioritize Author Tours
          if (a.category === 'AUTHOR' && b.category !== 'AUTHOR') return -1;
          if (b.category === 'AUTHOR' && a.category !== 'AUTHOR') return 1;

          const isAiA = a.id.startsWith('ai-gen');
          const isAiB = b.id.startsWith('ai-gen');
          
          // Prioritize AI Generated routes as they are "fresh"
          if (isAiA && !isAiB) return -1;
          if (!isAiA && isAiB) return 1;
          return b.id.localeCompare(a.id);
      });

      return list;
  }, [tours, activeCategory, userLocation]);

  const currentTours = useMemo(() => {
      return filteredTours.slice(0, visibleCount);
  }, [filteredTours, visibleCount]);

  const handleLoadMore = () => {
      setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  return (
    <div className="py-20 md:py-32 bg-transparent" id="tours-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER & FILTERS --- */}
        <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight drop-shadow-sm">
                {language === Language.EN ? 'Top Trending Tours' : 'Популярные Туры'}
            </h2>
            
            <div className="bg-white/60 backdrop-blur-lg p-2 rounded-[2rem] inline-flex flex-wrap justify-center gap-2 shadow-sm border border-white/50 mb-8">
                {START_LOCATIONS.map(loc => (
                    <button
                        key={loc.id}
                        onClick={() => { setUserLocation(loc.id); setVisibleCount(ITEMS_PER_PAGE); }}
                        className={`
                            flex items-center px-6 py-3 rounded-full text-sm font-bold transition-all duration-300
                            ${userLocation === loc.id 
                                ? 'bg-slate-900 text-white shadow-lg transform scale-105' 
                                : 'bg-transparent text-gray-500 hover:bg-white hover:text-indigo-600'}
                        `}
                    >
                        <span className="mr-2 text-lg">{loc.icon}</span>
                        {language === Language.EN ? loc.labelEn : loc.labelRu}
                    </button>
                ))}
            </div>

            {/* Category Pills - Enhanced for Mobile Scrolling */}
            <div className="w-full overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 flex justify-start sm:justify-center">
                <div className="flex gap-3">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`
                                flex-shrink-0 flex items-center px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all border
                                ${activeCategory === cat.id 
                                    ? 'bg-indigo-50/90 backdrop-blur border-indigo-200 text-indigo-700 shadow-md transform scale-105' 
                                    : 'bg-white/80 backdrop-blur border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700 hover:bg-white'}
                            `}
                        >
                            <span className="mr-2 text-base grayscale opacity-70">{cat.icon}</span>
                            {language === Language.EN ? cat.labelEn : cat.labelRu}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* --- TOURS GRID --- */}
        <div className="grid gap-8 md:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {currentTours.map((tour) => {
                const prices = calculateDisplayPrices(tour);
                const isAiGenerated = tour.id.startsWith('ai-gen');
                const isAuthor = tour.category === 'AUTHOR';
                
                return (
                <div key={tour.id} 
                     onClick={() => onViewDetails(tour, userLocation === 'all' ? 'tbilisi' : userLocation)} 
                     className={`
                        group flex flex-col bg-white rounded-3xl overflow-hidden cursor-pointer relative z-10
                        hover:z-20 transition-all duration-500 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]
                        hover:shadow-[0_25px_50px_-10px_rgba(0,0,0,0.2)] hover:-translate-y-2
                        ${isAiGenerated ? 'ring-2 ring-indigo-50' : ''} 
                        ${isAuthor ? 'ring-2 ring-yellow-400/50' : 'border border-gray-100'}
                     `}
                >
                  
                  {/* Image Container (4:3 Aspect Ratio) */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                        className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110" 
                        src={tour.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
                        alt={tour.titleEn} 
                        loading="lazy"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80';
                        }}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-500"></div>

                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
                         <span className={`backdrop-blur-md text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full shadow-md ${isAuthor ? 'bg-yellow-400 text-black' : 'bg-white/90 text-slate-900'}`}>
                             {isAuthor ? (language === Language.EN ? "Author's Tour" : "Авторский") : (tour.category || 'TOUR')}
                         </span>
                         {isAiGenerated && (
                             <span className="bg-indigo-600/90 backdrop-blur-md text-white text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full shadow-md animate-pulse border border-white/20">
                                 ✨ AI
                             </span>
                         )}
                    </div>

                    <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-full flex items-center shadow-sm border border-white/10">
                        <span className="text-yellow-400 text-xs mr-1">★</span>
                        <span className="text-xs font-bold text-white">{tour.rating || 5.0}</span>
                    </div>

                    {/* Title Overlay on Image (Modern Style) */}
                    <div className="absolute bottom-0 left-0 w-full p-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        <h3 className="text-2xl font-black leading-tight mb-2 drop-shadow-md">
                            {language === Language.EN ? (tour.titleEn || 'Untitled') : (tour.titleRu || 'Без названия')}
                        </h3>
                        <p className="text-xs font-medium opacity-80 line-clamp-1">
                            {language === Language.EN ? (tour.descriptionEn || '') : (tour.descriptionRu || '')}
                        </p>
                    </div>
                  </div>
                  
                  {/* Card Content (Lower Half) */}
                  <div className="flex-1 p-5 flex flex-col justify-between relative bg-white">
                    {/* Route Preview */}
                    <div className="flex items-center gap-2 mb-4 overflow-hidden">
                        <span className="text-emerald-500 text-lg">📍</span>
                        <div className="flex-1 flex items-center text-xs font-bold text-gray-500">
                            {tour.routeStops && tour.routeStops.length > 0 ? (
                                <>
                                    <span className="truncate">{tour.routeStops[0]}</span>
                                    <span className="mx-2 text-gray-300">➝</span>
                                    <span className="truncate">{tour.routeStops[tour.routeStops.length - 1]}</span>
                                </>
                            ) : (
                                <span className="truncate">{language === Language.EN ? "Custom Route" : "Маршрут"}</span>
                            )}
                        </div>
                    </div>
                    
                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                              {language === Language.EN ? 'Start From' : 'Цена От'}
                          </p>
                          <span className="text-2xl font-black text-slate-900 tracking-tight">{prices.original}</span>
                      </div>
                      
                      <button className="bg-slate-900 text-white group-hover:bg-indigo-600 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 shadow-md group-hover:shadow-indigo-500/30 flex items-center transform active:scale-95">
                          {language === Language.EN ? 'View Details' : 'Подробнее'}
                          <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              )})
          }
          
          {currentTours.length === 0 && (
              <div className="col-span-full text-center py-24">
                  <div className="text-6xl mb-6 opacity-30 grayscale">🗺️</div>
                  <h3 className="text-2xl font-bold text-gray-900">
                      {language === Language.EN ? `No tours found starting from ${userLocation}` : `Туры из ${userLocation} не найдены`}
                  </h3>
                  <p className="text-gray-500 mt-2">
                      {language === Language.EN ? "Try selecting a different starting location." : "Попробуйте выбрать другой город отправления."}
                  </p>
              </div>
          )}
        </div>
        
        {visibleCount < filteredTours.length && (
            <div className="mt-20 text-center">
                <button 
                    onClick={handleLoadMore}
                    className="bg-white/90 backdrop-blur border-2 border-gray-200 text-slate-900 font-bold py-4 px-12 rounded-full hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-lg active:scale-95 uppercase tracking-wide text-xs"
                >
                    {language === Language.EN ? "Show More Tours" : "Показать еще"}
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default TourList;
