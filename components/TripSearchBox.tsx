
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import { Language, TripSearch } from '../types';
import { GEORGIAN_LOCATIONS, LocationOption } from '../data/locations';
// Removed db import for drafts retrieval

interface TripSearchBoxProps {
  language: Language;
  onSearch: (search: TripSearch, isAuto?: boolean) => void;
  initialStops?: string[]; 
  initialDate?: string;
  maintenanceMode?: boolean; 
}

const TripSearchBox: React.FC<TripSearchBoxProps> = ({ language, onSearch, initialStops, initialDate, maintenanceMode = false }) => {
  // --- LOGIC: DATE PARSING (STRING -> OBJECT) ---
  const parseLocalYyyyMmDd = (dateStr?: string): Date | null => {
      if (!dateStr) return null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          const [y, m, d] = dateStr.split('-').map(Number);
          return new Date(y, m - 1, d); 
      }
      return null;
  };

  // --- LOGIC: DATE FORMATTING (OBJECT -> STRING) ---
  const toLocalString = (date: Date): string => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
  };

  // INITIALIZATION: STRICTLY FROM PROPS (No LocalStorage)
  const [stops, setStops] = useState<string[]>(() => {
      if (initialStops && initialStops.length > 0) return initialStops;
      return ['', ''];
  });

  const [startDate, setStartDate] = useState<Date | null>(() => {
      const propDate = parseLocalYyyyMmDd(initialDate);
      if (propDate) return propDate;
      return null;
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);
  const [filteredLocations, setFilteredLocations] = useState<LocationOption[]>([]);
  
  // Drag and Drop State
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const lastEmittedSearch = useRef<string>("");

  // Sync with props when they update (e.g., from external state change in App.tsx)
  useEffect(() => {
      if (initialStops && initialStops.length > 0) {
          if (JSON.stringify(initialStops) !== JSON.stringify(stops)) {
              setStops(initialStops);
          }
      }
      if (initialDate) {
          const parsed = parseLocalYyyyMmDd(initialDate);
          if (parsed && (!startDate || parsed.getTime() !== startDate?.getTime())) {
              setStartDate(parsed);
          }
      } else {
          // If prop is explicitly empty, clear local state
          if (initialDate === '') {
              setStartDate(null);
          }
      }
  }, [initialStops, initialDate]);

  const getDistanceFromLatLonInKm = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  }, []);

  const getStableDistanceHash = useCallback((str1: string, str2: string) => {
      const combined = (str1 < str2 ? str1 + str2 : str2 + str1).toLowerCase().replace(/[^a-z0-9]/g, '');
      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
          const char = combined.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; 
      }
      const absHash = Math.abs(hash);
      return (absHash % 400) + 50; 
  }, []);

  const allLocations = useMemo(() => {
    return [...GEORGIAN_LOCATIONS].sort((a, b) => {
        const nameA = language === Language.EN ? a.nameEn : a.nameRu;
        const nameB = language === Language.EN ? b.nameEn : b.nameRu;
        return nameA.localeCompare(nameB);
    });
  }, [language]);

  const findLocationSmart = useCallback((input: string) => {
      if (!input) return null;
      const cleanInput = input.toLowerCase().trim();
      const exact = allLocations.find(l => 
          l.id.toLowerCase() === cleanInput ||
          l.nameEn.toLowerCase() === cleanInput || 
          l.nameRu.toLowerCase() === cleanInput
      );
      if (exact) return exact;

      const inputTokens = cleanInput.split(/[\s,()-]+/).filter(t => t.length > 2);
      if (inputTokens.length === 0) return null;

      return allLocations.find(l => {
          const dbNameEn = l.nameEn.toLowerCase();
          const dbNameRu = l.nameRu.toLowerCase();
          const dbId = l.id.toLowerCase();
          const matchesEn = inputTokens.every(token => dbNameEn.includes(token));
          const matchesRu = inputTokens.every(token => dbNameRu.includes(token));
          const matchesId = inputTokens.every(token => dbId.includes(token));
          return matchesEn || matchesRu || matchesId;
      });
  }, [allLocations]);

  const calculateRouteData = useCallback((currentStops: string[], date: Date | null): TripSearch | null => {
      const cleanStops = currentStops.filter(s => s.trim() !== '');
      if (cleanStops.length < 2 || !date) return null;
      
      let calculatedDistance = 0;
      for (let i = 0; i < cleanStops.length - 1; i++) {
          const fromName = cleanStops[i];
          const toName = cleanStops[i+1];
          
          const fromLoc = findLocationSmart(fromName);
          const toLoc = findLocationSmart(toName);

          let segmentDist = 0;
          if (fromLoc && toLoc) {
              const directDist = getDistanceFromLatLonInKm(fromLoc.lat, fromLoc.lng, toLoc.lat, toLoc.lng);
              segmentDist = Math.round(directDist * 1.4); 
          } else {
              segmentDist = getStableDistanceHash(fromName, toName);
          }
          if (segmentDist < 15) segmentDist = 15;
          calculatedDistance += segmentDist;
      }

      if (isNaN(date.getTime())) return null;

      const dateString = toLocalString(date);

      return { stops: cleanStops, date: dateString, totalDistance: calculatedDistance };
  }, [findLocationSmart, getDistanceFromLatLonInKm, getStableDistanceHash]);

  // Debounced Auto-Search
  useEffect(() => {
      const timer = setTimeout(() => {
          const data = calculateRouteData(stops, startDate);
          if (data) {
              const currentHash = JSON.stringify(data);
              if (currentHash !== lastEmittedSearch.current) {
                  lastEmittedSearch.current = currentHash;
                  onSearch(data, true); 
              }
          }
      }, 1000); 
      return () => clearTimeout(timer);
  }, [stops, startDate, calculateRouteData, onSearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setActiveInputIndex(null);
        setErrorMsg(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, [wrapperRef]);

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      setDraggedItemIndex(index);
      // Create ghost image effect
      if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = "move";
          // Optional: Set a custom drag image if needed, but default is usually fine
      }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault(); // Necessary to allow dropping
      e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      if (draggedItemIndex === null || draggedItemIndex === index) return;

      const newStops = [...stops];
      const itemToMove = newStops[draggedItemIndex];
      
      // Remove from old position
      newStops.splice(draggedItemIndex, 1);
      // Insert at new position
      newStops.splice(index, 0, itemToMove);

      setStops(newStops);
      setDraggedItemIndex(null);
  };

  const handleSwapStartEnd = () => {
      if (stops.length < 2) return;
      const newStops = [...stops];
      const first = newStops[0];
      const lastIndex = newStops.length - 1;
      
      newStops[0] = newStops[lastIndex];
      newStops[lastIndex] = first;
      
      setStops(newStops);
  };

  const handleFocus = (index: number) => {
      setActiveInputIndex(index);
      const val = stops[index] || '';
      
      if (val.trim() === '') {
          setFilteredLocations(allLocations);
      } else {
          const lowerVal = val.toLowerCase().trim();
          const filtered = allLocations.filter(loc => 
            loc.nameEn.toLowerCase().includes(lowerVal) || 
            loc.nameRu.toLowerCase().includes(lowerVal) ||
            loc.id.includes(lowerVal)
          );
          setFilteredLocations(filtered);
      }
  };

  const handleStopChange = (index: number, value: string) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
    setActiveInputIndex(index);
    setErrorMsg(null);

    const lowerVal = value.toLowerCase().trim();
    if (lowerVal === '') {
      setFilteredLocations(allLocations);
    } else {
      const filtered = allLocations.filter(loc => 
        loc.nameEn.toLowerCase().includes(lowerVal) || 
        loc.nameRu.toLowerCase().includes(lowerVal) ||
        loc.id.includes(lowerVal)
      );
      setFilteredLocations(filtered);
    }
  };

  const selectLocation = (index: number, location: LocationOption) => {
    const selectedName = language === Language.EN ? location.nameEn : location.nameRu;
    const newStops = [...stops];
    newStops[index] = selectedName;
    setStops(newStops);
    setActiveInputIndex(null);
    setFilteredLocations([]);
    setErrorMsg(null);
  };

  const addStop = () => {
    const newStops = [...stops];
    newStops.splice(newStops.length - 1, 0, '');
    setStops(newStops);
  };

  const removeStop = (index: number) => {
    if (stops.length <= 2) return; 
    const newStops = stops.filter((_, i) => i !== index);
    setStops(newStops);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (maintenanceMode) return; 

    setErrorMsg(null);
    if (!startDate) { setErrorMsg(language === Language.EN ? "Please select a date." : "Пожалуйста, выберите дату."); return; }
    const cleanStops = stops.filter(s => s.trim() !== '');
    if (cleanStops.length < 2) { setErrorMsg(language === Language.EN ? "Enter start and destination." : "Укажите точки маршрута."); return; }
    
    const data = calculateRouteData(stops, startDate);
    if (data) {
        lastEmittedSearch.current = JSON.stringify(data);
        onSearch(data, false); 
    }
    else {
        setErrorMsg(language === Language.EN ? "Check your route." : "Проверьте маршрут.");
    }
  };

  const getLocationIcon = (type: string) => {
      switch (type) {
          case 'AIRPORT': return '✈️';
          case 'CITY': return '🏙️';
          case 'LANDMARK': return '🏰';
          case 'RESORT': return '🏔️';
          case 'BORDER': return '🛂';
          default: return '📍';
      }
  };

  const getLocationLabel = (type: string, lang: Language) => {
      const isEn = lang === Language.EN;
      switch (type) {
          case 'AIRPORT': return isEn ? 'Airport' : 'Аэропорт';
          case 'CITY': return isEn ? 'City' : 'Город';
          case 'LANDMARK': return isEn ? 'Landmark' : 'Достопримечательность';
          case 'RESORT': return isEn ? 'Resort' : 'Курорт';
          case 'BORDER': return isEn ? 'Border' : 'Граница';
          default: return isEn ? 'Location' : 'Локация';
      }
  };

  return (
    <div ref={wrapperRef} className="max-w-4xl mx-auto relative z-30">
      <div className={`bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-2xl border border-white/10 ${maintenanceMode ? 'opacity-75 pointer-events-none grayscale' : ''}`}>
        
        {maintenanceMode && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-2xl backdrop-blur-[2px]">
                <div className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-2xl transform rotate-3 border-2 border-white">
                    🚧 {language === Language.EN ? "Maintenance Mode" : "Технические работы"}
                </div>
            </div>
        )}

        <form onSubmit={handleManualSearch} className="flex flex-col gap-3">
            {errorMsg && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold text-center mb-2 shadow-sm">
                    {errorMsg}
                </div>
            )}

            <div className="flex flex-col gap-3">
                {stops.map((stop, index) => {
                    const isFirst = index === 0;
                    const isLast = index === stops.length - 1;
                    
                    return (
                        <div 
                            key={index} 
                            className={`relative group transition-all duration-200 ${draggedItemIndex === index ? 'opacity-50 scale-95' : 'opacity-100'}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={(e) => handleDrop(e, index)}
                        >
                            <div className="relative flex items-center">
                                {/* DRAG HANDLE */}
                                <div className="absolute left-2 z-20 text-gray-400 cursor-move p-2 hover:text-white transition-colors" title="Drag to reorder">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                                    </svg>
                                </div>

                                {/* INPUT FIELD */}
                                <input
                                    type="text"
                                    required
                                    value={stop}
                                    onChange={(e) => handleStopChange(index, e.target.value)}
                                    onFocus={() => handleFocus(index)}
                                    placeholder={isFirst ? (language === Language.EN ? 'Pick-up location' : 'Откуда') : (isLast ? (language === Language.EN ? 'Drop-off location' : 'Куда') : (language === Language.EN ? 'Stopover' : 'Остановка'))}
                                    className="block w-full pl-10 pr-12 py-4 bg-white border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 font-bold text-base shadow-sm transition-transform transform active:scale-[0.99]"
                                    autoComplete="off"
                                />
                                
                                {/* MARKER ICON (Right Side of Text) */}
                                <div className={`absolute right-12 z-20 ${isFirst ? 'text-green-500' : isLast ? 'text-red-500' : 'text-amber-500'}`}>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                    </svg>
                                </div>

                                {/* REMOVE BUTTON */}
                                {stops.length > 2 && (
                                    <button 
                                        type="button" 
                                        onClick={() => removeStop(index)} 
                                        className="absolute right-0 top-0 bottom-0 px-4 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-r-xl transition"
                                        title="Remove stop"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                            
                            {/* DROPDOWN */}
                            {activeInputIndex === index && (
                                <div className="absolute top-full left-0 w-full bg-white rounded-xl shadow-xl max-h-72 overflow-y-auto z-50 mt-2 border border-gray-100">
                                    {filteredLocations.map((loc) => (
                                        <button key={loc.id} type="button" onMouseDown={() => selectLocation(index, loc)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors flex items-center">
                                            <span className="mr-3 text-xl">{getLocationIcon(loc.type)}</span>
                                            <div>
                                                <div className="text-gray-900 font-bold text-sm">{language === Language.EN ? loc.nameEn : loc.nameRu}</div>
                                                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mt-0.5">
                                                    {getLocationLabel(loc.type, language)}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ACTION ROW: Add Stop & Swap */}
            <div className="flex items-center gap-4 pl-1">
                <button type="button" onClick={addStop} className="flex items-center space-x-2 text-white/90 hover:text-white font-bold text-sm transition group py-2">
                    <span className="w-6 h-6 rounded-full border border-white/50 flex items-center justify-center text-sm group-hover:border-white bg-white/10">+</span>
                    <span className="border-b border-dashed border-white/50 pb-0.5 group-hover:border-white">{language === Language.EN ? 'Add Stop' : 'Добавить остановку'}</span>
                </button>

                <div className="h-4 w-px bg-white/30"></div>

                <button type="button" onClick={handleSwapStartEnd} className="flex items-center space-x-2 text-white/90 hover:text-white font-bold text-sm transition group py-2" title={language === Language.EN ? "Swap Start & End" : "Поменять местами"}>
                    <span className="w-6 h-6 rounded-full border border-white/50 flex items-center justify-center text-sm group-hover:border-white bg-white/10">⇅</span>
                    <span className="border-b border-dashed border-white/50 pb-0.5 group-hover:border-white">{language === Language.EN ? 'Swap' : 'Обмен'}</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-3 mt-2">
                <div className="relative md:w-1/3">
                    <div className={`bg-white rounded-xl h-14 flex items-center shadow-sm overflow-hidden transition ${!startDate && errorMsg ? 'ring-2 ring-red-500' : ''}`}>
                         <div className="pl-4 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                         </div>
                         <DatePicker 
                            selected={startDate} 
                            onChange={(date: Date) => {
                                setStartDate(date);
                                const data = calculateRouteData(stops, date);
                                if (data) {
                                    lastEmittedSearch.current = JSON.stringify(data);
                                    onSearch(data, true); 
                                }
                            }} 
                            dateFormat="d MMMM yyyy" 
                            className="w-full bg-transparent focus:outline-none font-bold text-gray-900 cursor-pointer text-base pl-3 h-14" 
                            placeholderText={language === Language.EN ? 'Select Date' : 'Выберите дату'} 
                            minDate={new Date()} 
                            required 
                            popperPlacement="bottom-start"
                            onKeyDown={(e) => e.preventDefault()} 
                         />
                    </div>
                </div>
                
                {/* ENHANCED SEARCH BUTTON */}
                <button 
                    type="submit" 
                    disabled={maintenanceMode} 
                    className="w-full md:flex-1 h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black rounded-xl px-6 text-lg shadow-xl shadow-emerald-500/20 transition-all transform active:scale-95 uppercase tracking-wider flex items-center justify-center gap-3 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:shadow-none disabled:from-gray-500 disabled:to-gray-600"
                >
                    <svg className="w-6 h-6 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>{language === Language.EN ? 'Search Drivers' : 'Найти Водителя'}</span>
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default TripSearchBox;
