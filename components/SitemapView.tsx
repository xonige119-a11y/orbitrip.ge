import React, { useState, useMemo } from 'react';
import { Language } from '../types';
import { GEORGIAN_LOCATIONS } from '../data/locations';

interface SitemapViewProps {
  language: Language;
  onLinkClick: (from: string, to: string) => void;
  onBack: () => void;
}

const SitemapView: React.FC<SitemapViewProps> = ({ language, onLinkClick, onBack }) => {
  const isEn = language === Language.EN;
  const [searchTerm, setSearchTerm] = useState('');

  const PRIORITY_ORIGINS = ['Abastumani', 'Abasha', 'Bus Station Ortachala', 'Kutaisi', 'Tbilisi', 'Batumi'];
  
  const ALL_ORIGINS = useMemo(() => {
      const dbNames = GEORGIAN_LOCATIONS.map(l => isEn ? l.nameEn : l.nameRu);
      const extras = PRIORITY_ORIGINS.filter(p => !dbNames.some(d => d.includes(p)));
      return [...extras, ...dbNames].sort();
  }, [isEn]);

  // Generate and Group Routes
  const GROUPED_ROUTES = useMemo(() => {
      const groups: { [key: string]: { from: string, to: string }[] } = {};
      const popularDestinations = isEn 
        ? ['Tbilisi', 'Kutaisi Airport', 'Batumi', 'Gudauri', 'Kazbegi']
        : ['Тбилиси', 'Аэропорт Кутаиси', 'Батуми', 'Гудаури', 'Казбеги'];

      ALL_ORIGINS.forEach(from => {
          // Determine group letter
          const letter = from.charAt(0).toUpperCase();
          if (!groups[letter]) groups[letter] = [];

          // Generate routes for this origin
          const destinations = GEORGIAN_LOCATIONS
            .map(l => isEn ? l.nameEn : l.nameRu)
            .filter(to => to !== from)
            .slice(0, 15); // Limit connections per origin for DOM performance in this view

          destinations.forEach(to => {
              if (
                  !searchTerm || 
                  from.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  to.toLowerCase().includes(searchTerm.toLowerCase())
              ) {
                  groups[letter].push({ from, to });
              }
          });
      });
      return groups;
  }, [ALL_ORIGINS, isEn, searchTerm]);

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Sticky Header */}
      <div className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center w-full md:w-auto">
                <button 
                    onClick={onBack}
                    className="flex items-center text-gray-500 hover:text-indigo-600 font-bold transition mr-6"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {isEn ? "Back" : "Назад"}
                </button>
                <h1 className="text-xl font-black text-gray-900 uppercase tracking-wide">
                    {isEn ? "Transfer Directory" : "Каталог Трансферов"}
                </h1>
            </div>

            <div className="w-full md:w-96 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input 
                    type="text"
                    placeholder={isEn ? "Find specific route..." : "Найти маршрут..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
            </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {Object.keys(GROUPED_ROUTES).sort().map(letter => (
            <div key={letter} className="mb-12">
                <div className="flex items-center mb-6 sticky top-20 z-10 bg-slate-50/95 backdrop-blur py-2 border-b border-gray-200">
                    <span className="text-4xl font-black text-indigo-200 mr-4">{letter}</span>
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">{GROUPED_ROUTES[letter].length} routes</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {GROUPED_ROUTES[letter].map((route, idx) => (
                        <button 
                            key={`${route.from}-${route.to}-${idx}`}
                            onClick={() => onLinkClick(route.from, route.to)}
                            className="text-left bg-white p-3 rounded-lg border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all group flex items-center"
                        >
                            <div className="w-1 h-8 bg-gray-200 rounded-full mr-3 group-hover:bg-indigo-500 transition-colors"></div>
                            <div className="truncate">
                                <span className="block text-xs text-gray-400 uppercase font-bold mb-0.5">{isEn ? "Transfer" : "Трансфер"}</span>
                                <span className="text-sm text-gray-700 font-medium group-hover:text-indigo-700 truncate block" title={`${route.from} → ${route.to}`}>
                                    {route.from} <span className="text-gray-300 mx-1">→</span> {route.to}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        ))}

        {Object.keys(GROUPED_ROUTES).length === 0 && (
            <div className="text-center py-32">
                <div className="text-6xl mb-4">🛣️</div>
                <h3 className="text-xl font-bold text-gray-900">{isEn ? "No routes found" : "Маршруты не найдены"}</h3>
                <p className="text-gray-500">{isEn ? "Try adjusting your search terms." : "Попробуйте изменить поиск."}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SitemapView;