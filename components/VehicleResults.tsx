
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Language, TripSearch, Driver, Tour, Booking } from '../types';
import { GEORGIAN_LOCATIONS } from '../data/locations';

interface VehicleResultsProps {
  search: TripSearch;
  language: Language;
  onBook: (driver: Driver, numericPrice: string, guests: number, date: string) => void; 
  onDirectBooking: (bookingData: any) => void; 
  onSearchUpdate?: (search: TripSearch, isAuto?: boolean) => void; 
  onProfileOpen: (driver: Driver, price: number) => void; 
  drivers: Driver[]; 
  tour?: Tour | null; 
  onBack: () => void;
  initialGuests?: number; 
  bookings?: Booking[]; 
  minPrice?: number;
  hideSearchHeader?: boolean;
  isLoading?: boolean; 
}

// --- HELPER: Distance Calculation ---
const getDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

// --- HELPER: Calculate Approach Time ---
const calculateApproachTime = (driverCityId: string, startLocationName: string, lang: Language): string => {
    const isEn = lang === Language.EN;
    
    // 1. Normalize Driver City
    const dCity = GEORGIAN_LOCATIONS.find(l => 
        l.id.toLowerCase() === (driverCityId || '').toLowerCase() || 
        l.nameEn.toLowerCase() === (driverCityId || '').toLowerCase()
    );

    // 2. Normalize Start Location (Fuzzy Match)
    const startLower = (startLocationName || '').toLowerCase();
    const sLoc = GEORGIAN_LOCATIONS.find(l =>
        startLower.includes(l.nameEn.toLowerCase()) ||
        startLower.includes(l.nameRu.toLowerCase()) ||
        l.nameEn.toLowerCase().includes(startLower) ||
        l.id.toLowerCase().includes(startLower)
    );

    // Fallback if locations unknown
    if (!dCity || !sLoc) return isEn ? "20-40 min" : "20-40 мин";

    // 3. Calculate Distance
    const dist = getDist(dCity.lat, dCity.lng, sLoc.lat, sLoc.lng);

    // 4. Logic
    // If very close (< 20km), standard pickup time
    if (dist < 20) {
        return isEn ? "20-30 min" : "20-30 мин";
    }

    // If further, calc based on 60km/h avg speed + 15 min buffer
    const speedKmH = 60;
    const hoursDecimal = dist / speedKmH;
    const totalMinutes = Math.round(hoursDecimal * 60 + 15);

    if (totalMinutes < 60) {
        return `${totalMinutes} ${isEn ? 'min' : 'мин'}`;
    }

    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    
    if (m === 0) return `${h} ${isEn ? 'hour' : 'ч'}`;
    return `${h} ${isEn ? 'h' : 'ч'} ${m} ${isEn ? 'min' : 'мин'}`;
};

// --- HELPER: Normalize Date ---
const normalizeToIsoDate = (input: string | undefined | null): string => {
    if (!input) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
    try {
        let cleanStr = input.split(' at ')[0].split('T')[0].trim();
        const d = new Date(cleanStr);
        if (isNaN(d.getTime())) return input; 
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    } catch (e) {
        return input;
    }
};

// --- SUB-COMPONENT: DRIVER CARD (Handles Image Slider) ---
const DriverCard: React.FC<{
    driver: Driver;
    price: number;
    usdPrice: number;
    approachTime: string;
    isEn: boolean;
    onProfileClick: (d: Driver, p: number) => void;
    onBookClick: (d: Driver, p: string) => void;
}> = ({ driver, price, usdPrice, approachTime, isEn, onProfileClick, onBookClick }) => {
    
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Combine main photo and gallery into one array
    const images = [driver.carPhotoUrl, ...(driver.carPhotos || [])].filter(Boolean);
    const hasMultipleImages = images.length > 1;

    const nextImage = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setCurrentImgIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Touch Handlers for Mobile Swipe
    const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            nextImage();
        } else if (isRightSwipe) {
            prevImage();
        }
        // If simply a tap (no swipe), let the click event bubble to open profile
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden flex flex-col group relative">
            
            {/* 1. CAR IMAGE SLIDER (Top) */}
            <div 
                className="w-full h-48 md:h-56 relative bg-gray-100 cursor-pointer overflow-hidden border-b border-gray-100"
                onClick={() => onProfileClick(driver, price)}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <img 
                    src={images[currentImgIndex]} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                    alt="Car" 
                />
                
                {/* Vehicle Type Badge - FIXED: Now shows actual type */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded z-10">
                    {driver.vehicleType}
                </div>

                {/* Arrows Overlay (Visible on Hover or if Multiple) */}
                {hasMultipleImages && (
                    <>
                        <div 
                            onClick={prevImage}
                            className="absolute inset-y-0 left-0 w-12 flex items-center justify-center bg-gradient-to-r from-black/30 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 md:opacity-0 opacity-100"
                        >
                            <span className="text-3xl font-bold drop-shadow-md">‹</span>
                        </div>
                        <div 
                            onClick={nextImage}
                            className="absolute inset-y-0 right-0 w-12 flex items-center justify-center bg-gradient-to-l from-black/30 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 md:opacity-0 opacity-100"
                        >
                            <span className="text-3xl font-bold drop-shadow-md">›</span>
                        </div>
                        
                        {/* Dots Indicator */}
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                            {images.map((_, idx) => (
                                <div 
                                    key={idx} 
                                    className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${idx === currentImgIndex ? 'bg-white scale-110' : 'bg-white/50'}`} 
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* 2. INFO (Middle) */}
            <div className="p-4 md:p-5 flex flex-col flex-1">
            
                {/* Driver Info Row - CLICKABLE */}
                <div 
                        onClick={() => onProfileClick(driver, price)}
                        className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 -mx-4 md:-mx-5 px-4 md:px-5 transition-colors"
                >
                    <img src={driver.photoUrl} className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border border-gray-200 shadow-sm" alt="Driver" />
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-gray-900 text-lg leading-none hover:text-indigo-600 transition underline decoration-transparent hover:decoration-indigo-600">{driver.name}</h3>
                            <span className="text-[#00c853]">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-gray-800 text-sm">{driver.rating.toFixed(1)}</span>
                            <div className="flex text-yellow-400 text-xs">{'★'.repeat(5)}</div>
                            <span className="text-gray-400 text-xs font-bold ml-1 hover:underline">{driver.reviewCount} {isEn ? "Reviews" : "Отзывов"}</span>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold mt-1 uppercase">
                            <span className="text-green-500">💬</span>
                            {driver.languages.includes('RU') ? 'Русский' : ''} {driver.languages.includes('EN') ? '/ English' : ''}
                        </div>
                    </div>
                </div>

                {/* Car & Features - UPDATED: Dynamic Badge */}
                <div className="space-y-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-green-600 text-lg">🚗</span>
                            <span className="font-bold text-gray-800 text-sm">{driver.carModel}</span>
                        </div>
                        <span className={`border rounded-full px-2 py-0.5 text-[10px] font-bold uppercase
                            ${driver.vehicleType === 'Sedan' ? 'border-indigo-200 text-indigo-600 bg-indigo-50' : 
                              driver.vehicleType === 'Minivan' ? 'border-purple-200 text-purple-600 bg-purple-50' : 
                              driver.vehicleType === 'SUV' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 
                              'border-amber-200 text-amber-600 bg-amber-50'}`}>
                            {driver.vehicleType}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs md:text-sm font-bold text-gray-600">
                        <div className="flex items-center gap-1" title="Passengers">
                            <span className="text-green-500 text-lg">💺</span> {driver.maxPassengers}
                        </div>
                        <div className="flex items-center gap-1" title="Luggage">
                            <span className="text-green-500 text-lg">🎒</span> 4
                        </div>
                        <div className="flex items-center gap-1" title="Fuel Type">
                            <span className="text-green-500 text-lg">⛽</span> {driver.features?.includes('Gas') ? (isEn ? "Gas" : "Газ") : (isEn ? "Petrol" : "Бензин")}
                        </div>
                    </div>

                    {/* Feature Icons */}
                    <div className="flex gap-2 flex-wrap">
                        {['AC', 'WiFi'].map((f, i) => (
                            <div key={i} className="w-7 h-7 rounded-full bg-[#00c853] flex items-center justify-center text-white text-xs" title={f}>
                                {f === 'AC' ? '❄️' : '📶'}
                            </div>
                        ))}
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs" title="No Smoking">
                            🚭
                        </div>
                    </div>

                    {/* APPROACH TIME BADGE */}
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg p-2 text-xs text-blue-800">
                        <span className="text-lg">⏱️</span>
                        <span>
                            {isEn ? "Arrives in:" : "Подача:"} <span className="font-bold">{approachTime}</span>
                        </span>
                    </div>
                </div>

                {/* Price & Button */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="text-[10px] text-gray-400 mb-1 font-bold">{isEn ? "Final price (Return Included)" : "Цена окончательная (Обратно бесплатно)"}</div>
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[#00c853] text-lg font-black">GEL {price}</span>
                        <span className="text-[#00c853] text-sm font-bold">(USD {usdPrice})</span>
                    </div>
                    <div className="text-[10px] text-[#00c853] font-bold mb-3">{isEn ? "Price per vehicle" : "Цена за автомобиль"}</div>
                    
                    <button 
                        onClick={(e) => {
                            e.stopPropagation(); 
                            onBookClick(driver, price.toString());
                        }}
                        className="w-full bg-[#00c853] hover:bg-[#00a844] text-white py-3 md:py-4 rounded-xl text-sm font-bold shadow-md transition-all transform active:scale-95 uppercase tracking-wide"
                    >
                        {isEn ? "Book Now" : "Забронировать"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export const VehicleResults: React.FC<VehicleResultsProps> = ({ 
    search, language, onBook, onBack, onProfileOpen, initialGuests = 2, 
    drivers: propDrivers, minPrice = 30, hideSearchHeader = false, onSearchUpdate,
    bookings = [] , isLoading = false
}) => {
  const [guestCount, setGuestCount] = useState<number>(initialGuests);
  const [selectedCategory, setSelectedCategory] = useState<string>('All'); 
  
  // Local state for the date picker UI
  const [uiSelectedDate, setUiSelectedDate] = useState<Date>(() => {
      if (search.date && /^\d{4}-\d{2}-\d{2}$/.test(search.date)) {
          const [y, m, d] = search.date.split('-').map(Number);
          return new Date(y, m - 1, d);
      }
      const d = new Date(); d.setDate(d.getDate() + 1); return d;
  });

  // Sync local date if parent search prop changes
  useEffect(() => {
      if (search.date && /^\d{4}-\d{2}-\d{2}$/.test(search.date)) {
          const [y, m, d] = search.date.split('-').map(Number);
          const newDate = new Date(y, m - 1, d);
          if (newDate.getTime() !== uiSelectedDate.getTime()) {
              setUiSelectedDate(newDate);
          }
      }
  }, [search.date]);

  const toLocalISOString = (d: Date): string => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
  };

  // --- REAL LOGISTICS LOOP PRICING ---
  const calculateTotalCost = (driver: Driver) => {
      const ROAD_FACTOR = 1.4; // Multiplier to convert Air Distance to Road Distance (Mountainous terrain)
      const tripDistance = search.totalDistance || 100;
      
      // 1. Identify Locations
      const startName = search.stops[0] || '';
      const endName = search.stops[search.stops.length - 1] || '';
      const driverCity = driver.city || 'tbilisi';

      // Helper to find coords
      const findCoords = (name: string) => {
          const lower = name.toLowerCase();
          return GEORGIAN_LOCATIONS.find(l => 
              l.id === lower || 
              l.nameEn.toLowerCase().includes(lower) || 
              l.nameRu.toLowerCase().includes(lower)
          );
      };

      const driverLoc = findCoords(driverCity);
      const startLoc = findCoords(startName);
      const endLoc = findCoords(endName);

      // 2. Calculate Approach (Driver Base -> Pickup)
      let approachKm = 0;
      if (driverLoc && startLoc) {
          const airDist = getDist(driverLoc.lat, driverLoc.lng, startLoc.lat, startLoc.lng);
          approachKm = Math.round(airDist * ROAD_FACTOR);
      } else {
          // Fallback Logic if coords missing
          if (!startName.toLowerCase().includes(driverCity.toLowerCase())) {
              approachKm = 50; // Generic buffer for approach
          }
      }

      // 3. Calculate Return (Dropoff -> Driver Base)
      let returnKm = 0;
      if (driverLoc && endLoc) {
          const airDist = getDist(endLoc.lat, endLoc.lng, driverLoc.lat, driverLoc.lng);
          returnKm = Math.round(airDist * ROAD_FACTOR);
      } else {
          // Fallback Logic
          if (!endName.toLowerCase().includes(driverCity.toLowerCase())) {
              returnKm = 50; // Generic buffer for return
          }
      }

      // 4. Total Billable Distance
      const totalBillableKm = approachKm + tripDistance + returnKm;

      const base = driver.basePrice || 30;
      const kmRate = driver.pricePerKm || 1.2;
      
      // Smart Logic: Mountain Coefficient
      // If start or end point is flagged as mountainous, increase price by 20%
      let mountainFactor = 1.0;
      if (startLoc?.isMountainous || endLoc?.isMountainous) {
          mountainFactor = 1.2;
      }

      const totalBase = totalBillableKm * kmRate + base;
      const total = Math.ceil(totalBase * mountainFactor);
      
      return Math.max(total, minPrice);
  };

  // --- HANDLER: Update Search (Sync to Parent) ---
  const handleSearchUpdate = (newDate: Date) => {
      setUiSelectedDate(newDate);
      if (onSearchUpdate) {
          const updatedSearch = { ...search, date: toLocalISOString(newDate) };
          // Triggers auto-update in parent (App.tsx)
          onSearchUpdate(updatedSearch, true); 
      }
  };

  const handleProfileClick = (driver: Driver, price: number) => {
      // 1. Force update parent state with currently selected local date
      if (onSearchUpdate) {
          const dateStr = toLocalISOString(uiSelectedDate);
          const updatedSearch = { ...search, date: dateStr };
          onSearchUpdate(updatedSearch, true);
      }
      
      // 2. Open Profile
      onProfileOpen(driver, price);
  };

  const handleBookClick = (driver: Driver, price: string) => {
      onBook(driver, price, guestCount, toLocalISOString(uiSelectedDate));
  }

  // --- FILTER: Availability Check ---
  const availableDrivers = propDrivers.filter(d => {
      if (d.status !== 'ACTIVE') return false;
      const selectedDateString = toLocalISOString(uiSelectedDate);

      // 1. Check Blocks (Manual)
      if (d.blockedDates && d.blockedDates.length > 0) {
          const isBlocked = d.blockedDates.some(blockedDate => {
              return normalizeToIsoDate(blockedDate) === selectedDateString;
          });
          if (isBlocked) return false;
      }

      // 2. Check Bookings (Pending or Confirmed are considered BUSY)
      if (bookings && bookings.length > 0) {
          const hasActiveBooking = bookings.some(b => {
              if (b.driverId !== d.id) return false;
              if (b.status === 'CANCELLED' || b.status === 'COMPLETED') return false;
              
              // Only exclude if PENDING or CONFIRMED on this specific date
              const bookingDateNormalized = normalizeToIsoDate(b.date);
              return bookingDateNormalized === selectedDateString;
          });
          if (hasActiveBooking) return false;
      }
      return true;
  });

  // --- PROCESSING: Filter by Category AND Sort ---
  const filteredAndSortedDrivers = availableDrivers
      .map(driver => ({
          driver,
          price: calculateTotalCost(driver),
          approachTime: calculateApproachTime(driver.city, search.stops[0], language)
      }))
      .filter(item => {
          if (selectedCategory === 'All') return true;
          if (selectedCategory === 'Bus' && item.driver.vehicleType === 'Bus') return true;
          return item.driver.vehicleType === selectedCategory;
      })
      .sort((a, b) => a.price - b.price); // Strictly sort by price regardless of category

  const isEn = language === Language.EN;
  const filterOptions = ["All", "Sedan", "Minivan", "SUV", "Bus"];

  return (
    <div className="bg-[#fcfcfc] min-h-screen font-sans text-[#333]">
      
      {/* 1. HEADER SEARCH BAR */}
      {!hideSearchHeader && (
          <div className="bg-[#f5f7f9] py-3 md:py-6 relative md:sticky md:top-24 z-40 transition-all border-b border-gray-200 shadow-sm">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex flex-col gap-3">
                 <div className="flex items-center justify-between md:justify-start mb-1 md:mb-4">
                     <button onClick={onBack} className="flex items-center bg-white border border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold transition shadow-sm">
                        <svg className="w-3 h-3 md:w-4 md:h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        {isEn ? "Back" : "Назад"}
                     </button>
                 </div>

                 <div className="flex flex-col lg:flex-row gap-3 items-stretch">
                    <div className="flex-1 flex flex-col md:flex-row bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
                        <div className="flex-1 flex items-center px-4 py-2 md:py-3 border-b md:border-b-0 md:border-r border-gray-200">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-3 flex-shrink-0"></div>
                            <input type="text" readOnly value={search.stops[0]} className="w-full text-sm font-bold text-gray-700 outline-none truncate bg-transparent cursor-default" />
                        </div>
                        <div className="flex-1 flex items-center px-4 py-2 md:py-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-3 flex-shrink-0"></div>
                            <input type="text" readOnly value={search.stops[search.stops.length-1]} className="w-full text-sm font-bold text-gray-700 outline-none truncate bg-transparent cursor-default" />
                        </div>
                    </div>
                    
                    <div className="lg:w-64 bg-white rounded-xl border-2 border-[#00c853] shadow-sm flex items-center px-4 py-1 relative">
                        <span className="text-gray-400 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </span>
                        <DatePicker 
                            selected={uiSelectedDate} 
                            onChange={(d: Date) => handleSearchUpdate(d)} 
                            className="w-full h-full py-2 text-sm font-bold text-gray-800 bg-transparent outline-none cursor-pointer"
                            dateFormat="dd MMMM yyyy"
                            minDate={new Date()}
                            placeholderText="Select Date"
                        />
                    </div>
                 </div>
              </div>
            </div>
          </div>
      )}

      {/* 2. DARK INFO BAR */}
      <div className="bg-[#263238] text-white py-3 shadow-inner">
        <div className="max-w-6xl mx-auto px-4 flex justify-between md:justify-start gap-4 md:gap-8 text-[10px] md:text-xs font-bold uppercase tracking-wider overflow-x-auto no-scrollbar whitespace-nowrap">
           <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[#00c853]">🏁</span> 
              <span className="opacity-80 hidden sm:inline">{isEn ? "Distance" : "Длина"}:</span> 
              <span className="text-white">{search.totalDistance || 124} km</span>
           </div>
           <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[#00c853]">🕒</span> 
              <span className="opacity-80 hidden sm:inline">{isEn ? "Duration" : "Время"}:</span>
              <span className="text-white">~3h 20m</span>
           </div>
           <div className="flex items-center gap-2 md:ml-auto flex-shrink-0">
              <span className="text-[#00c853]">📅</span>
              <span className="text-white">{uiSelectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</span>
           </div>
        </div>
      </div>

      {/* 3. MAIN GRID CONTENT */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        
        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 md:mb-8 border-b border-gray-200 pb-4 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
           {filterOptions.map((f, i) => (
             <button 
                key={f} 
                onClick={() => setSelectedCategory(f)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg border text-xs font-bold transition ${
                    selectedCategory === f 
                    ? 'bg-[#00c853] border-[#00c853] text-white shadow-sm' 
                    : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800'
                }`}
             >
                {f}
             </button>
           ))}
           <div className="flex-1 min-w-[20px]"></div>
           <div className="text-xs font-bold text-gray-500 flex items-center gap-1 whitespace-nowrap">
               {isEn ? "Sort:" : "Сорт.:"} <span className="text-[#00c853] cursor-pointer hover:underline">{isEn ? "Price ▲" : "Цена ▲"}</span>
           </div>
        </div>

        {/* LOADING SKELETON or DRIVERS GRID */}
        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[450px]">
                        <div className="h-48 bg-gray-200"></div>
                        <div className="p-5 space-y-4">
                            <div className="h-12 w-full bg-gray-100 rounded-lg"></div>
                            <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                            <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
                            <div className="mt-auto pt-4 h-12 w-full bg-gray-200 rounded-xl"></div>
                        </div>
                    </div>
                ))}
            </div>
        ) : filteredAndSortedDrivers.length === 0 ? (
            <div className="text-center py-24">
                <div className="text-6xl mb-6 opacity-30 grayscale">🗓️</div>
                <h3 className="text-2xl font-bold text-gray-900">
                    {isEn ? "No drivers available" : "Нет свободных водителей"}
                </h3>
                <p className="text-gray-500 mt-2">
                    {selectedCategory !== 'All' 
                        ? (isEn ? `No ${selectedCategory} found for this date.` : `Машин класса ${selectedCategory} нет на эту дату.`)
                        : (isEn ? "Please try selecting a different date." : "Пожалуйста, попробуйте выбрать другую дату.")
                    }
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedDrivers.map(({ driver, price, approachTime }) => {
                    const usdPrice = Math.ceil(price / 2.7);
                    return (
                        <DriverCard 
                            key={driver.id}
                            driver={driver}
                            price={price}
                            usdPrice={usdPrice}
                            approachTime={approachTime}
                            isEn={isEn}
                            onProfileClick={handleProfileClick}
                            onBookClick={handleBookClick}
                        />
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default VehicleResults;
