import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import { Language, TripSearch } from '../types';
import { GEORGIAN_LOCATIONS, LocationOption } from '../data/locations';

interface TripSearchBoxProps {
  language: Language;
  onSearch: (search: TripSearch, isAuto?: boolean) => void;
  initialStops?: string[]; 
}

const TripSearchBox: React.FC<TripSearchBoxProps> = ({ language, onSearch, initialStops }) => {
  const [stops, setStops] = useState<string[]>(['', '']);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Autocomplete State
  const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);
  const [filteredLocations, setFilteredLocations] = useState<LocationOption[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const getDistanceFromLatLonInKm = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  }, []);

  // Stable Hash Function for deterministic fallback distances
  const getStableDistanceHash = useCallback((str1: string, str2: string) => {
      const combined = (str1 < str2 ? str1 + str2 : str2 + str1).toLowerCase().replace(/\s/g, '');
      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
          const char = combined.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32bit integer
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

  const calculateRouteData = useCallback((currentStops: string[], date: Date | null): TripSearch | null => {
      const cleanStops = currentStops.filter(s => s.trim() !== '');
      if (cleanStops.length < 2 || !date) return null;
      if (cleanStops.length === 2 && cleanStops[0].toLowerCase().trim() === cleanStops[1].toLowerCase().trim()) return null;

      let calculatedDistance = 0;
      for (let i = 0; i < cleanStops.length - 1; i++) {
          const fromName = cleanStops[i].toLowerCase();
          const toName = cleanStops[i+1].toLowerCase();
          const fromLoc = allLocations.find(l => l.nameEn.toLowerCase() === fromName || l.nameRu.toLowerCase() === fromName);
          const toLoc = allLocations.find(l => l.nameEn.toLowerCase() === toName || l.nameRu.toLowerCase() === toName);

          let segmentDist = 0;
          if (fromLoc && toLoc) {
              const directDist = getDistanceFromLatLonInKm(fromLoc.lat, fromLoc.lng, toLoc.lat, toLoc.lng);
              segmentDist = Math.round(directDist * 1.4); 
          } else {
              segmentDist = getStableDistanceHash(fromName, toName);
          }
          if (segmentDist < 10) segmentDist = 15;
          calculatedDistance += segmentDist;
      }

      // Defensive Date Check
      if (isNaN(date.getTime())) return null;

      const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      return { stops: cleanStops, date: dateStr, totalDistance: calculatedDistance };
  }, [allLocations, getDistanceFromLatLonInKm, getStableDistanceHash]);

  // Sync with prop when a tour is selected from outside
  useEffect(() => {
      if (initialStops && initialStops.length >= 2) {
          setStops(initialStops);
          
          let dateToUse = startDate;
          if (!dateToUse) {
              const tmrw = new Date();
              tmrw.setDate(tmrw.getDate() + 1);
              setStartDate(tmrw);
              dateToUse = tmrw;
          }
          
          // Trigger immediate calculation for the new route
          setTimeout(() => {
              const data = calculateRouteData(initialStops, dateToUse);
              if (data) onSearch(data, true);
          }, 100);
      }
  }, [initialStops]); 

  // Debounced Auto-Search when user edits manually
  useEffect(() => {
      const timer = setTimeout(() => {
          const cleanStops = stops.filter(s => s.trim() !== '');
          if (cleanStops.length < 2) return;
          
          if (cleanStops.length === 2 && cleanStops[0] === '' && cleanStops[1] === '') return;

          const data = calculateRouteData(stops, startDate);
          if (data) onSearch(data, true); 
      }, 1500); 
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

  const handleInputFocus = (index: number, value: string) => {
      setActiveInputIndex(index);
      setErrorMsg(null);
      if (value.trim() === '') setFilteredLocations(allLocations);
      else handleStopChange(index, value);
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

  const reverseRoute = () => {
    const newStops = [...stops].reverse();
    setStops(newStops);
    
    if (startDate) {
        const data = calculateRouteData(newStops, startDate);
        if (data) onSearch(data, true);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!startDate) { setErrorMsg(language === Language.EN ? "Please select a date." : "Пожалуйста, выберите дату."); return; }
    const cleanStops = stops.filter(s => s.trim() !== '');
    if (cleanStops.length < 2) { setErrorMsg(language === Language.EN ? "Enter start and destination." : "Укажите точки маршрута."); return; }
    const data = calculateRouteData(stops, startDate);
    if (data) onSearch(data, false);
    else setErrorMsg(language === Language.EN ? "Check your route." : "Проверьте маршрут.");
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'AIRPORT': return '✈️';
      case 'LANDMARK': return '📸';
      case 'RESORT': return '🏔️';
      case 'BORDER': return '🛂';
      default: return '🏙️';
    }
  };

  const getMarkerLetter = (index: number) => String.fromCharCode(65 + index);

  return (
    <div ref={wrapperRef} className="max-w-4xl mx-auto relative z-30">
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl shadow-indigo-900/10 border border-gray-100/50 backdrop-blur-sm">
        <form onSubmit={handleManualSearch} className="flex flex-col gap-5">
            {errorMsg && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm font-bold flex items-center justify-center animate-pulse border border-red-100">
                    {errorMsg}
                </div>
            )}

            <div className={`relative flex flex-col gap-2 transition-all duration-200 ${activeInputIndex !== null ? 'z-50' : 'z-10'}`}>
                <div 
                    className="absolute left-[27px] top-8 bottom-8 w-0.5 border-l-2 border-dashed border-gray-300 z-0"
                    style={{ display: stops.length > 1 ? 'block' : 'none' }}
                ></div>

                {stops.map((stop, index) => {
                    const isFirst = index === 0;
                    const isLast = index === stops.length - 1;
                    const zIndexStyle = { zIndex: activeInputIndex === index ? 50 : (stops.length - index) + 10 };
                    const letter = getMarkerLetter(index);

                    return (
                        <div key={index} className="relative flex items-center group" style={zIndexStyle}>
                            <div className="w-14 flex justify-center flex-shrink-0 z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shadow-sm transition-colors ${
                                    isFirst ? 'bg-emerald-500 border-emerald-600 text-white' : 
                                    isLast ? 'bg-indigo-600 border-indigo-700 text-white' : 
                                    'bg-white border-gray-300 text-gray-500'
                                }`}>
                                    {letter}
                                </div>
                            </div>
                            
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    required
                                    value={stop}
                                    onChange={(e) => handleStopChange(index, e.target.value)}
                                    onFocus={() => handleInputFocus(index, stop)}
                                    placeholder={isFirst ? (language === Language.EN ? 'Pick-up location' : 'Место отправления') : (language === Language.EN ? 'Destination' : 'Место назначения')}
                                    className={`block w-full pl-4 pr-10 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-900 font-medium text-lg`}
                                    autoComplete="off"
                                />
                                {!isFirst && stops.length > 2 && (
                                    <button type="button" onClick={() => removeStop(index)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 bg-transparent hover:bg-red-50 rounded-full p-2">✕</button>
                                )}
                                {activeInputIndex === index && (
                                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-xl shadow-2xl max-h-72 overflow-y-auto border border-gray-100 z-50">
                                        {filteredLocations.map((loc) => (
                                            <button key={loc.id} type="button" onMouseDown={() => selectLocation(index, loc)} className="w-full text-left px-5 py-3.5 hover:bg-indigo-50 flex items-center space-x-4 border-b border-gray-50 last:border-0 transition-colors group">
                                                <span className="text-2xl opacity-80">{getLocationIcon(loc.type)}</span>
                                                <div>
                                                    <div className="text-gray-900 font-bold text-base">{language === Language.EN ? loc.nameEn : loc.nameRu}</div>
                                                    <div className="text-xs text-gray-400 group-hover:text-indigo-500 font-medium mt-0.5">{loc.type}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex space-x-4 z-20">
                <button type="button" onClick={addStop} className="flex-1 py-3 bg-white border border-gray-200 hover:border-indigo-300 text-indigo-600 font-bold rounded-xl text-sm shadow-sm group transition">
                    + {language === Language.EN ? 'Add Stop' : 'Добавить остановку'}
                </button>
                <button type="button" onClick={reverseRoute} className="w-14 bg-white border border-gray-200 hover:border-indigo-300 text-gray-400 rounded-xl flex items-center justify-center shadow-sm hover:rotate-180 duration-500 transition" title="Reverse Route">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center z-30 pt-2">
                <div className="relative z-30 w-full md:w-auto flex-1 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 hover:bg-white hover:border-indigo-300 rounded-xl h-16 flex items-center">
                         <DatePicker 
                            selected={startDate} 
                            onChange={(date: Date) => setStartDate(date)} 
                            dateFormat="d MMMM yyyy" 
                            className="w-full bg-transparent focus:outline-none font-bold text-gray-900 cursor-pointer text-lg pl-12 pr-4 h-full" 
                            placeholderText={language === Language.EN ? 'Select Date' : 'Выберите Дату'} 
                            minDate={new Date()} 
                            required 
                            popperPlacement="bottom-start"
                            onKeyDown={(e) => e.preventDefault()} 
                         />
                    </div>
                </div>
                
                <button type="submit" className="h-16 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black rounded-xl px-10 text-xl w-full md:w-auto shadow-lg flex-grow md:flex-grow-0 flex items-center justify-center transform active:scale-95 transition">
                    {language === Language.EN ? 'Find a Driver' : 'Найти Водителя'}
                    <svg className="w-6 h-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default TripSearchBox;