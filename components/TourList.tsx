import React, { useState, useMemo, useEffect } from 'react';
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
    { id: 'CULTURE', labelEn: 'Culture', labelRu: 'Культура', icon: '🏛️' },
    { id: 'MOUNTAINS', labelEn: 'Mountains', labelRu: 'Горы', icon: '🏔️' },
    { id: 'WINE', labelEn: 'Wine', labelRu: 'Вино', icon: '🍷' },
    { id: 'SEA', labelEn: 'Sea', labelRu: 'Море', icon: '🌊' },
    { id: 'NATURE', labelEn: 'Nature', labelRu: 'Природа', icon: '🌿' }
];

const START_LOCATIONS = [
    { id: 'kutaisi', labelEn: 'From Kutaisi', labelRu: 'Из Кутаиси', icon: '✈️' },
    { id: 'tbilisi', labelEn: 'From Tbilisi', labelRu: 'Из Тбилиси', icon: '🏙️' },
    { id: 'batumi', labelEn: 'From Batumi', labelRu: 'Из Батуми', icon: '🌊' },
];

const ITEMS_PER_PAGE = 12;

const TourList: React.FC<TourListProps> = ({ tours, language, onViewDetails, drivers = [] }) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [userLocation, setUserLocation] = useState('tbilisi');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const calculateDisplayPrice = (tour: Tour): string => {
      if (tour.basePrice && tour.extraPersonFee) {
          const baseForTwo = tour.basePrice + (2 * tour.extraPersonFee);
          return `From ${baseForTwo} GEL`;
      }
      return tour.price;
  };

  const filteredTours = useMemo(() => {
      let list = tours;
      if (activeCategory !== 'ALL') {
          list = list.filter(t => t.category === activeCategory);
      }
      return list.map(t => {
          const isCompatible = !t.routeStops || t.routeStops[0].toLowerCase().includes(userLocation);
          return { ...t, isCompatible };
      });
  }, [tours, activeCategory, userLocation]);

  const currentTours = useMemo(() => {
      return filteredTours.slice(0, visibleCount);
  }, [filteredTours, visibleCount]);

  const handleLoadMore = () => {
      setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  return (
    <div className="py-16 md:py-24 bg-gray-50 border-t border-gray-200" id="tours-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                {language === Language.EN ? 'Top Trending Tours' : 'Популярные Туры'}
            </h2>
            
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                {START_LOCATIONS.map(loc => (
                    <button
                        key={loc.id}
                        onClick={() => setUserLocation(loc.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 ${
                            userLocation === loc.id 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg transform scale-105' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-200'
                        }`}
                    >
                        <span className="text-2xl mb-1">{loc.icon}</span>
                        <span className="font-bold text-xs md:text-sm whitespace-nowrap">
                            {language === Language.EN ? loc.labelEn : loc.labelRu}
                        </span>
                    </button>
                ))}
            </div>
        </div>

        {/* Category Filter */}
        <div className="flex overflow-x-auto pb-4 mb-10 gap-3 no-scrollbar justify-start sm:justify-center px-4 md:px-0">
            {CATEGORIES.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`
                        flex items-center px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap flex-shrink-0
                        ${activeCategory === cat.id 
                            ? 'bg-gray-900 text-white shadow-md transform scale-105' 
                            : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'}
                    `}
                >
                    <span className="mr-2">{cat.icon}</span>
                    {language === Language.EN ? cat.labelEn : cat.labelRu}
                </button>
            ))}
        </div>

        {/* Tours Grid - SYMMETRIC CARDS */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {currentTours.map((tour) => {
                const displayPrice = calculateDisplayPrice(tour);
                
                return (
                <div key={tour.id} 
                     onClick={() => onViewDetails(tour, userLocation)} 
                     className="flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer group h-[480px] border border-gray-100 relative z-10 hover:z-20 transform hover:-translate-y-1"
                >
                  
                  {/* Image Section - Fixed Height */}
                  <div className="relative h-64 overflow-hidden">
                    <img 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        src={tour.image} 
                        alt={tour.titleEn} 
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>

                    {/* Category Tag */}
                    <div className="absolute top-4 left-4 z-10">
                         <span className="bg-white/90 backdrop-blur-md text-gray-800 text-[10px] uppercase font-bold px-3 py-1.5 rounded-full shadow-sm">
                             {tour.category}
                         </span>
                    </div>

                    {/* Rating */}
                    <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-lg flex items-center shadow-sm">
                        <span className="text-yellow-500 text-xs mr-1">★</span>
                        <span className="text-xs font-bold text-gray-800">{tour.rating}</span>
                    </div>
                  </div>
                  
                  {/* Content Section - Flex Grow to fill height */}
                  <div className="flex-1 p-6 flex flex-col justify-between bg-white relative">
                    {/* Hover Effect Line */}
                    <div className="absolute top-0 left-6 right-6 h-1 bg-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition duration-500 pointer-events-none"></div>

                    <div className="relative z-10">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
                          {language === Language.EN ? tour.titleEn : tour.titleRu}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                          {language === Language.EN ? tour.descriptionEn : tour.descriptionRu}
                      </p>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-2 relative z-10">
                      <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              {language === Language.EN ? 'Total Price' : 'Цена за авто'}
                          </span>
                          <span className="text-2xl font-black text-indigo-900">{displayPrice}</span>
                      </div>
                      
                      {/* Explicit Action Button for clarity */}
                      <button className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 shadow-sm group-hover:shadow-md flex items-center">
                          {language === Language.EN ? 'Details' : 'Детали'}
                          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              )})
          }
        </div>
        
        {/* Load More Button */}
        {visibleCount < filteredTours.length && (
            <div className="mt-16 text-center">
                <button 
                    onClick={handleLoadMore}
                    className="bg-white border border-gray-200 text-gray-900 font-bold py-3 px-8 rounded-full hover:bg-gray-50 transition shadow-sm"
                >
                    {language === Language.EN ? "View More Tours" : "Показать еще"}
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default TourList;