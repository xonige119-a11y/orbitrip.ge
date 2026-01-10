import React, { useState, useMemo, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Language, TripSearch, Driver, Tour, Booking } from '../types';
import { GEORGIAN_LOCATIONS } from '../data/locations';

interface VehicleResultsProps {
  search: TripSearch;
  language: Language;
  onBook: (driver: Driver, price: string, guests: number) => void; 
  onDirectBooking: (bookingData: any) => void; 
  drivers: Driver[];
  tour?: Tour | null; 
  onBack: () => void;
  initialGuests?: number; 
  bookings?: Booking[]; 
}

type SortOption = 'PRICE_ASC' | 'PRICE_DESC' | 'RATING' | 'REVIEWS';

const VALID_PROMO_CODES = ['BOOKLET20', 'ORBI20', 'GEORGIA2024', 'SUMMER24'];
const DRIVERS_PER_PAGE = 12;

export const VehicleResults: React.FC<VehicleResultsProps> = ({ 
    search, language, onBook, onDirectBooking, drivers, tour, onBack, initialGuests = 2, bookings = [] 
}) => {
  const [guestCount, setGuestCount] = useState<number>(initialGuests); 
  const [sortOption, setSortOption] = useState<SortOption>('PRICE_ASC');
  const [visibleDriversCount, setVisibleDriversCount] = useState(DRIVERS_PER_PAGE);
  
  // Modal State
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // --- EMBEDDED FORM STATE ---
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '+995',
      hour: '10',
      minute: '00',
      note: '',
      promoCode: '',
      date: new Date()
  });
  const [formErrors, setFormErrors] = useState({ name: false, email: false, phone: false });
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync Guest Count in Modal with Global Guest Count
  const [modalGuestCount, setModalGuestCount] = useState(guestCount);

  const MAX_GUESTS = 20;
  const isMultiStop = search.stops.length > 2;
  const showTourWarning = tour !== null || isMultiStop;

  // Reset form when driver changes or search updates
  useEffect(() => {
      // Safe Date Parsing
      let initDate = new Date();
      if (search.date) {
         // Attempt to parse "12 January 2025"
         const parsed = new Date(search.date);
         if (!isNaN(parsed.getTime())) {
             initDate = parsed;
         } else {
             // Fallback for non-standard formats, try today
             initDate = new Date();
         }
      }
      // Ensure date is in the future
      if (initDate < new Date()) {
          initDate = new Date();
          initDate.setDate(initDate.getDate() + 1);
      }

      setFormData(prev => ({ 
          ...prev,
          name: '', 
          email: '', 
          phone: '+995', 
          hour: '10', 
          minute: '00', 
          note: '', 
          promoCode: '',
          date: initDate
      }));
      
      setModalGuestCount(guestCount);
      setFormErrors({ name: false, email: false, phone: false });
      setPromoApplied(false);
      setPromoError('');
      setIsSubmitting(false);
  }, [selectedDriver, search.date, guestCount]);

  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  };

  // --- ADVANCED PRICING ENGINE ---
  const calculateTotalCost = (driver: Driver, applyPromo: boolean = false): { total: number, approachFee: number, distancePrice: number, approachCity: string } => {
      // Defensive Checks
      if (!driver || !search || typeof search.totalDistance !== 'number') {
          return { total: 0, approachFee: 0, distancePrice: 0, approachCity: '' };
      }

      // 1. Calculate Route Price (Protect against missing pricePerKm)
      const rate = driver.pricePerKm || 1.2;
      const routePrice = Math.round(search.totalDistance * rate);
      
      // 2. Calculate Approach Fee (Deadhead Cost)
      let approachFee = 0;
      let approachCity = '';
      
      // Only calculate if driver has a valid city and we have a start point
      if (driver.city && search.stops && search.stops.length > 0 && search.stops[0]) {
          const driverCityObj = GEORGIAN_LOCATIONS.find(l => l.id === driver.city);
          const pickupName = (search.stops[0] || '').toLowerCase().trim();
          
          // Fuzzy match logic
          const pickupObj = GEORGIAN_LOCATIONS.find(l => 
              l.id === pickupName || 
              l.nameEn.toLowerCase().includes(pickupName) || 
              l.nameRu.toLowerCase().includes(pickupName)
          );

          if (driverCityObj && pickupObj) {
              const distToPickup = getDistanceFromLatLonInKm(driverCityObj.lat, driverCityObj.lng, pickupObj.lat, pickupObj.lng) * 1.4; // Road factor
              
              // Free approach radius: 15km. Beyond that, charge fuel cost (approx 60% of standard rate)
              if (distToPickup > 15) {
                  approachFee = Math.round(distToPickup * (rate * 0.6));
                  approachCity = language === Language.EN ? driverCityObj.nameEn : driverCityObj.nameRu;
              }
          }
      }

      // 3. Base Price Enforcement
      // The price cannot be lower than driver's base fare (default 30 if missing) + approach fee
      const base = driver.basePrice || 30;
      const rawTotal = Math.max(routePrice, base) + approachFee;
      
      // 4. Promo Logic
      const finalTotal = applyPromo ? Math.round(rawTotal * 0.8) : rawTotal;

      return { total: finalTotal, approachFee, distancePrice: routePrice, approachCity };
  };

  const getApproachInfo = (driver: Driver) => {
      if (!driver.city || !search.stops || !search.stops[0]) return null;
      
      const driverCityObj = GEORGIAN_LOCATIONS.find(l => l.id === driver.city);
      const pickupName = (search.stops[0] || '').toLowerCase();
      const pickupObj = GEORGIAN_LOCATIONS.find(l => 
          l.id === pickupName || 
          l.nameEn.toLowerCase().includes(pickupName) || 
          l.nameRu.toLowerCase().includes(pickupName)
      );

      if (driverCityObj && pickupObj) {
          const dist = getDistanceFromLatLonInKm(driverCityObj.lat, driverCityObj.lng, pickupObj.lat, pickupObj.lng);
          if (dist < 15) return { time: language === Language.EN ? "15-20 min" : "15-20 мин", isLocal: true };
          else {
              const roadDist = dist * 1.4; 
              const hours = roadDist / 60;
              const formattedTime = hours < 1 ? `${Math.round(hours * 60)} min` : `${Math.round(hours)} h`;
              return { time: `~${formattedTime} approach`, isLocal: false };
          }
      }
      return null;
  };

  // Helper to normalize date strings (Safe Version)
  const normalizeDate = (dateStr: string) => {
      if (!dateStr || typeof dateStr !== 'string') return '';
      return dateStr.toLowerCase().replace(/,/g, '').trim();
  }

  // --- OPTIMIZED AVAILABILITY LOGIC (O(1) Lookup) ---
  const busyDriverIds = useMemo(() => {
      if (!search.date) return new Set<string>();
      const searchDateNorm = normalizeDate(search.date);
      const busySet = new Set<string>();

      bookings.forEach(b => {
          if (['CONFIRMED', 'PENDING', 'COMPLETED'].includes(b.status) && b.driverId) {
              const bookingDateNorm = normalizeDate(b.date);
              // Safe include check for substrings (e.g. "12 Jan" inside "12 January 2025")
              if (bookingDateNorm && searchDateNorm && (bookingDateNorm.includes(searchDateNorm) || searchDateNorm.includes(bookingDateNorm.split(' at ')[0]))) {
                  busySet.add(b.driverId);
              }
          }
      });
      return busySet;
  }, [bookings, search.date]);

  // Check if a specific driver is busy on a SPECIFIC date (used inside Modal for dynamic date changes)
  const isDriverBusyOnDate = (driverId: string, date: Date) => {
      const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      const normDate = normalizeDate(dateStr);
      
      // Check explicit blocks
      const driver = drivers.find(d => d.id === driverId);
      if (driver?.blockedDates?.some(bd => normalizeDate(bd) === normDate)) return true;

      // Check bookings
      return bookings.some(b => {
          if (b.driverId !== driverId || !['CONFIRMED', 'PENDING', 'COMPLETED'].includes(b.status)) return false;
          const bookingDateNorm = normalizeDate(b.date);
          return bookingDateNorm && bookingDateNorm.includes(normDate);
      });
  };

  const processedDrivers = useMemo(() => {
    let filtered = drivers.filter(d => d.status === 'ACTIVE');
    
    // 1. Date Availability Filter
    if (search.date) {
        const searchDateNorm = normalizeDate(search.date);
        filtered = filtered.filter(d => {
            if (d.blockedDates && Array.isArray(d.blockedDates) && d.blockedDates.some(bd => normalizeDate(bd) === searchDateNorm)) return false;
            if (busyDriverIds.has(d.id)) return false;
            return true;
        });
    }

    // 2. STRICT Capacity Filter
    filtered = filtered.filter(d => {
        if (d.maxPassengers && d.maxPassengers > 0) return d.maxPassengers >= guestCount;
        if (guestCount > 15) return d.vehicleType === 'Bus';
        if (guestCount > 7) return d.vehicleType === 'Bus';
        if (guestCount > 3) return d.vehicleType !== 'Sedan';
        return true; 
    });

    // 3. Sort by CALCULATED FINAL PRICE
    return filtered.sort((a, b) => {
        const priceA = calculateTotalCost(a).total;
        const priceB = calculateTotalCost(b).total;
        
        switch (sortOption) {
            case 'PRICE_ASC': return priceA - priceB;
            case 'PRICE_DESC': return priceB - priceA;
            case 'RATING': return (b.rating || 0) - (a.rating || 0);
            case 'REVIEWS': return (b.reviewCount || 0) - (a.reviewCount || 0);
            default: return 0;
        }
    });
  }, [sortOption, drivers, tour, guestCount, search.totalDistance, search.date, busyDriverIds]); 

  // Pagination
  const visibleDrivers = useMemo(() => {
      return processedDrivers.slice(0, visibleDriversCount);
  }, [processedDrivers, visibleDriversCount]);

  const handleShowMore = () => {
      setVisibleDriversCount(prev => prev + DRIVERS_PER_PAGE);
  };

  // --- FORM HANDLERS ---
  const handleApplyPromo = () => {
      if (VALID_PROMO_CODES.includes(formData.promoCode.toUpperCase().trim())) {
          setPromoApplied(true);
          setPromoError('');
      } else {
          setPromoApplied(false);
          setPromoError(language === Language.EN ? 'Invalid Code' : 'Неверный код');
      }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // VALIDATION 1: Contact Info
      const errors = {
          name: formData.name.length < 2,
          email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
          phone: formData.phone.length < 6
      };
      setFormErrors(errors);
      if (Object.values(errors).some(v => v)) return;
      if (!selectedDriver) return;

      // VALIDATION 2: Availability on new Date
      if (isDriverBusyOnDate(selectedDriver.id, formData.date)) {
          alert(language === Language.EN ? "Driver is busy on this date. Please choose another." : "Водитель занят в эту дату.");
          return;
      }

      setIsSubmitting(true);

      const pricing = calculateTotalCost(selectedDriver, promoApplied);
      const dateStr = formData.date.toLocaleDateString(language === Language.EN ? 'en-GB' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
      
      // Construct Contact Info WITH NOTE
      let fullContact = `${formData.phone} / ${formData.email}`;
      if (formData.note && formData.note.trim()) {
          fullContact += ` / Note: ${formData.note.trim()}`;
      }

      setTimeout(() => {
          onDirectBooking({
              tourId: tour ? tour.id : 'transfer',
              tourTitle: tour ? (language === Language.EN ? tour.titleEn : tour.titleRu) : `Transfer: ${search.stops[0]} -> ${search.stops[search.stops.length-1]}`,
              customerName: formData.name,
              contactInfo: fullContact,
              date: `${dateStr} at ${formData.hour}:${formData.minute}`,
              guests: modalGuestCount,
              vehicle: selectedDriver.vehicleType,
              driverName: selectedDriver.name,
              driverId: selectedDriver.id,
              numericPrice: pricing.total,
              totalPrice: `${pricing.total} GEL` + (promoApplied ? " (Promo)" : "")
          });
          setIsSubmitting(false);
          setSelectedDriver(null);
      }, 800);
  };

  const getSafeReviews = (driver: Driver | null): any[] => {
      if (!driver || !driver.reviews) return [];
      if (Array.isArray(driver.reviews)) return driver.reviews;
      if (typeof driver.reviews === 'string') {
          try {
              const parsed = JSON.parse(driver.reviews);
              return Array.isArray(parsed) ? parsed : [];
          } catch (e) {
              return [];
          }
      }
      return [];
  };

  const renderStars = (rating: number) => (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className={`h-3 w-3 ${i < rating ? 'fill-current' : 'text-gray-300'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.603 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
  );

  const safeReviews = getSafeReviews(selectedDriver);
  const displayReviews = Array.isArray(safeReviews) ? safeReviews : [];

  const displayStops = useMemo(() => {
      if (tour && tour.routeStops) return tour.routeStops;
      if (search.stops) return search.stops;
      return [];
  }, [tour, search]);

  // Calculations for Modal Warnings
  const isCapacityOverflow = selectedDriver && modalGuestCount > (selectedDriver.maxPassengers || 4);
  const isDateBlocked = selectedDriver && isDriverBusyOnDate(selectedDriver.id, formData.date);

  return (
    <div className="pb-32 bg-gray-50 font-sans w-full max-w-[100vw] overflow-x-hidden">
      
      {/* --- HEADER BAR --- */}
      <div className="bg-white pb-8 shadow-sm w-full">
        <div className="max-w-5xl mx-auto px-4 pt-8">
            <button onClick={onBack} className="text-indigo-600 mb-4 font-medium hover:underline flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" /></svg>
                {language === Language.EN ? 'Back to Search' : 'Назад к поиску'}
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 break-words">
                {tour ? (language === Language.EN ? tour.titleEn : tour.titleRu) : 
                 (isMultiStop ? (language === Language.EN ? 'Custom Excursion Route' : 'Маршрут Экскурсии') : `Transfer: ${search.stops[0] || 'Start'} → ${search.stops[1] || 'End'}`)
                }
            </h1>
            <div className="text-gray-500 text-sm mt-1 flex flex-wrap items-center gap-2">
                <span>📍 {search.totalDistance} km</span>
                <span>•</span>
                <span>📅 {search.date}</span>
                {isMultiStop && <span>•</span>}
                {isMultiStop && <span>🛑 {search.stops.length} Stops</span>}
            </div>
            
            {showTourWarning && (
                <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg flex items-start animate-fadeIn max-w-full">
                    <div className="mr-3 mt-0.5 text-amber-500 flex-shrink-0">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm text-amber-900 font-bold">
                            {language === Language.EN ? "Price includes Vehicle & Driver only." : "Цена включает только Авто и Водителя."}
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                            {language === Language.EN 
                             ? "Entrance tickets, food, and guide services are NOT included. You pay for them separately on the spot." 
                             : "Входные билеты, питание и услуги гида НЕ включены. Вы оплачиваете их отдельно на месте."}
                        </p>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* --- CONTROLS: GUESTS & SORT --- */}
      <div className="max-w-7xl mx-auto px-4 sticky top-16 z-30 pointer-events-none mt-6">
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-lg border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 pointer-events-auto">
            <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
                <span className="font-bold text-gray-700 text-sm md:text-base">{language === Language.EN ? 'Passengers:' : 'Пассажиры:'}</span>
                <div className="flex items-center border rounded-lg bg-gray-50">
                    <button onClick={() => setGuestCount(Math.max(1, guestCount-1))} className="w-10 h-10 hover:bg-gray-200 transition rounded-l-lg font-bold text-lg text-indigo-600 flex items-center justify-center">-</button>
                    <span className="w-10 text-center font-bold text-lg text-gray-800">{guestCount}</span>
                    <button onClick={() => setGuestCount(Math.min(MAX_GUESTS, guestCount+1))} className="w-10 h-10 hover:bg-gray-200 transition rounded-r-lg font-bold text-lg text-indigo-600 flex items-center justify-center">+</button>
                </div>
            </div>
            
            <div className="flex items-center space-x-2 w-full md:w-auto">
                <select onChange={(e) => setSortOption(e.target.value as SortOption)} className="border p-2 rounded-lg bg-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none w-full">
                    <option value="PRICE_ASC">{language === Language.EN ? 'Price: Low to High' : 'Цена: По возрастанию'}</option>
                    <option value="PRICE_DESC">{language === Language.EN ? 'Price: High to Low' : 'Цена: По убыванию'}</option>
                    <option value="RATING">{language === Language.EN ? 'Highest Rated' : 'Сначала высокий рейтинг'}</option>
                    <option value="REVIEWS">{language === Language.EN ? 'Most Reviewed' : 'Больше отзывов'}</option>
                </select>
            </div>
        </div>
      </div>

      {/* --- DRIVER GRID --- */}
      <div className="max-w-7xl mx-auto px-4 pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleDrivers.map((driver, index) => {
            const pricing = calculateTotalCost(driver); 
            const approach = getApproachInfo(driver);
            const isBestValue = index === 0 && sortOption === 'PRICE_ASC';
            const capacity = driver.maxPassengers || (driver.vehicleType === 'Sedan' ? 4 : driver.vehicleType === 'Minivan' ? 7 : driver.vehicleType === 'Bus' ? 20 : 4);

            return (
                <div 
                    key={driver.id} 
                    onClick={() => setSelectedDriver(driver)}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-indigo-200 group overflow-hidden flex flex-col h-full w-full max-w-full active:scale-[0.99]"
                >
                    {/* Card Header Image */}
                    <div className="relative h-56 w-full">
                        <img src={driver.carPhotoUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={driver.carModel} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {isBestValue && (
                                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide">
                                    {language === Language.EN ? 'Best Value' : 'Лучшая Цена'}
                                </span>
                            )}
                        </div>
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur shadow-sm px-2 py-1 rounded-lg flex items-center space-x-1">
                            <span className="text-yellow-400 text-sm">★</span>
                            <span className="font-bold text-gray-900">{driver.rating}</span>
                            <span className="text-xs text-gray-500">({driver.reviewCount})</span>
                        </div>
                        {approach && (
                            <div className={`absolute bottom-3 left-3 px-2 py-1 rounded-md text-xs font-bold shadow-sm ${approach.isLocal ? 'bg-indigo-600 text-white' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                                {approach.isLocal ? '📍 Local Driver' : `🕒 ${approach.time} drive to you`}
                            </div>
                        )}
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="relative flex-shrink-0">
                                <img src={driver.photoUrl} className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover" alt={driver.name} />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-bold text-gray-900 leading-tight text-lg group-hover:text-indigo-600 transition truncate">{driver.name}</h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                    <span className="flex items-center text-yellow-500 font-bold">★ {driver.rating}</span>
                                    <span className="text-xs text-indigo-500 underline cursor-pointer hover:text-indigo-700">
                                        {language === Language.EN ? `Read ${driver.reviewCount} reviews` : `Читать ${driver.reviewCount} отзывов`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="font-medium text-gray-800 truncate mr-2">{driver.carModel}</span>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                                <span className="font-bold bg-white text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 text-xs uppercase">{driver.vehicleType}</span>
                                <span className="text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200" title="Capacity">👤 {capacity}</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 mb-4 overflow-hidden flex-wrap">
                            {(driver.features || []).slice(0, 3).map((f, i) => (
                                <span key={i} className="text-xs text-gray-400 whitespace-nowrap">✓ {f}</span>
                            ))}
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col md:flex-row justify-between items-end md:items-center gap-3">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                                    {language === Language.EN ? 'Total Price' : 'Итоговая Цена'}
                                </p>
                                <div className="text-2xl font-black text-indigo-600 leading-none">
                                    {pricing.total} ₾
                                </div>
                                {pricing.approachFee > 0 && (
                                    <p className="text-[9px] text-amber-600 mt-1 font-medium bg-amber-50 px-1 py-0.5 rounded">
                                        {language === Language.EN 
                                            ? `+ Incl. driver approach from ${pricing.approachCity}` 
                                            : `+ Вкл. подачу авто из г. ${pricing.approachCity}`}
                                    </p>
                                )}
                            </div>
                            <button className="w-full md:w-auto bg-indigo-50 text-indigo-700 px-6 py-4 rounded-xl font-bold text-base hover:bg-indigo-600 hover:text-white transition shadow-sm border border-indigo-100 active:scale-95">
                                {language === Language.EN ? 'Select' : 'Выбрать'}
                            </button>
                        </div>
                    </div>
                </div>
            );
        })}
        
        {/* Empty State / No Drivers */}
        {processedDrivers.length === 0 && (
            <div className="col-span-full py-16 px-6 text-center bg-white rounded-2xl border border-dashed border-indigo-200 shadow-sm flex flex-col items-center">
                <div className="text-5xl mb-4 bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center">🚕</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{language === Language.EN ? 'All drivers booked!' : 'Все водители заняты!'}</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                    {language === Language.EN 
                     ? 'It seems all our partners are busy for this date or car type. Try changing the vehicle type or contact support.' 
                     : 'Похоже, все наши партнеры заняты. Попробуйте сменить тип авто или свяжитесь с поддержкой.'}
                </p>
                <a 
                    href="https://wa.me/995593456876" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition transform hover:-translate-y-1 animate-pulse"
                >
                    <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    {language === Language.EN ? 'Request Custom Ride' : 'Заказать через WhatsApp'}
                </a>
            </div>
        )}
      </div>

      {/* --- DRIVER PROFILE & BOOKING MODAL --- */}
      {selectedDriver && (
        <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={() => setSelectedDriver(null)}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
                    
                    <div className="absolute top-4 right-4 z-10">
                        <button onClick={() => setSelectedDriver(null)} className="bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 backdrop-blur transition shadow-md">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row h-[85vh] md:h-[650px]">
                        {/* LEFT: Driver Info & Gallery (UNCHANGED as requested) */}
                        <div className="md:w-3/5 bg-gray-50 p-6 sm:p-8 overflow-y-auto custom-scrollbar border-r border-gray-200">
                            
                            <div className="flex items-center space-x-4 mb-6">
                                <img src={selectedDriver.photoUrl} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" alt={selectedDriver.name} />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedDriver.name}</h2>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                        <span className="flex items-center text-yellow-500 font-bold">★ {selectedDriver.rating}</span>
                                        <span>•</span>
                                        <span>{selectedDriver.reviewCount} {language === Language.EN ? 'reviews' : 'отзывов'}</span>
                                        <span>•</span>
                                        <div className="flex gap-1">
                                            {(Array.isArray(selectedDriver.languages) ? selectedDriver.languages : []).map(l => (
                                                <span key={l} className="bg-white px-1.5 border rounded text-xs">{l}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{language === Language.EN ? 'Vehicle Photos' : 'Фото Автомобиля'}</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2 h-64 rounded-xl overflow-hidden shadow-sm relative group">
                                        <img src={selectedDriver.carPhotoUrl} className="w-full h-full object-cover" alt="Main Car" />
                                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur">
                                            {selectedDriver.carModel}
                                        </div>
                                    </div>
                                    {(Array.isArray(selectedDriver.carPhotos) ? selectedDriver.carPhotos : [selectedDriver.carPhotoUrl, selectedDriver.carPhotoUrl]).slice(0, 4).map((photo, idx) => (
                                        <div key={idx} className="h-32 rounded-lg overflow-hidden shadow-sm hover:opacity-90 transition cursor-pointer">
                                            <img src={photo} className="w-full h-full object-cover" alt={`Car detail ${idx}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{language === Language.EN ? 'Guest Reviews' : 'Отзывы Гостей'}</h3>
                                <div className="space-y-4">
                                    {displayReviews.slice(0, 5).map((review, idx) => (
                                        <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                                        {review.author?.charAt(0) || '?'}
                                                    </div>
                                                    <span className="font-bold text-sm text-gray-900">{review.author || 'Guest'}</span>
                                                </div>
                                                <div className="text-xs text-gray-400">{review.date}</div>
                                            </div>
                                            <div className="mb-2">{renderStars(review.rating)}</div>
                                            <p className="text-sm text-gray-600 leading-relaxed italic">
                                                "{language === Language.EN ? review.textEn : review.textRu}"
                                            </p>
                                        </div>
                                    ))}
                                    {displayReviews.length === 0 && (
                                        <p className="text-sm text-gray-400 italic">No reviews yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Combined Details & Booking Form - REDESIGNED */}
                        <div className="md:w-2/5 bg-white flex flex-col shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)] overflow-y-auto">
                            
                            <div className="p-6 sm:p-8 flex-1">
                                <h3 className="text-xl font-black text-gray-900 mb-6 border-b border-gray-100 pb-4">
                                    {language === Language.EN ? 'Trip Details' : 'Детали Поездки'}
                                </h3>

                                {/* ROUTE VISUALIZATION */}
                                <div className="mb-6 relative pl-4 border-l-2 border-dashed border-indigo-200 ml-1">
                                    {displayStops.map((stop, idx) => (
                                        <div key={idx} className="mb-4 last:mb-0 relative">
                                            <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${idx === 0 ? 'bg-green-500' : idx === displayStops.length-1 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                                            <p className="text-sm font-bold text-gray-800 leading-tight">{stop}</p>
                                            {idx === 0 && <p className="text-[10px] text-gray-400 uppercase">Start</p>}
                                            {idx === displayStops.length-1 && <p className="text-[10px] text-gray-400 uppercase">End</p>}
                                        </div>
                                    ))}
                                </div>

                                {/* EDITABLE FIELDS GRID */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {/* Date Picker */}
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                                        <div className="relative">
                                            <DatePicker 
                                                selected={formData.date} 
                                                onChange={(date: Date) => setFormData({...formData, date})} 
                                                dateFormat="d MMMM yyyy"
                                                minDate={new Date()}
                                                className={`w-full bg-gray-50 border rounded-lg p-2.5 pl-9 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 cursor-pointer ${isDateBlocked ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                                            />
                                            <span className="absolute left-3 top-2.5 text-gray-400">📅</span>
                                        </div>
                                        {isDateBlocked && (
                                            <p className="text-[10px] text-red-500 font-bold mt-1 animate-pulse">
                                                {language === Language.EN ? "Driver is busy!" : "Водитель занят!"}
                                            </p>
                                        )}
                                    </div>

                                    {/* Time Selector */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time</label>
                                        <div className="flex gap-1">
                                            <select 
                                                className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2 text-sm font-bold text-gray-900"
                                                value={formData.hour}
                                                onChange={e => setFormData({...formData, hour: e.target.value})}
                                            >
                                                {Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                                            </select>
                                            <select 
                                                className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2 text-sm font-bold text-gray-900"
                                                value={formData.minute}
                                                onChange={e => setFormData({...formData, minute: e.target.value})}
                                            >
                                                {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Passengers Counter */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Passengers</label>
                                        <div className={`flex items-center border rounded-lg ${isCapacityOverflow ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                                            <button type="button" onClick={() => setModalGuestCount(Math.max(1, modalGuestCount-1))} className="px-3 py-2 text-gray-500 hover:bg-gray-200 rounded-l-lg font-bold">-</button>
                                            <span className={`flex-1 text-center text-sm font-bold ${isCapacityOverflow ? 'text-red-600' : ''}`}>{modalGuestCount}</span>
                                            <button type="button" onClick={() => setModalGuestCount(Math.min(20, modalGuestCount+1))} className="px-3 py-2 text-indigo-600 hover:bg-gray-200 rounded-r-lg font-bold">+</button>
                                        </div>
                                        {isCapacityOverflow && (
                                            <p className="text-[9px] text-red-500 font-bold mt-1 leading-tight">
                                                {language === Language.EN ? "Exceeds Capacity" : "Мест нет"}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Vehicle Info */}
                                <div className="bg-indigo-50 rounded-lg p-3 flex justify-between items-center mb-6">
                                    <div>
                                        <p className="text-xs text-indigo-400 font-bold uppercase">Vehicle</p>
                                        <p className="font-bold text-indigo-900">{selectedDriver.vehicleType}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-400 font-bold uppercase text-right">Distance</p>
                                        <p className="font-bold text-indigo-900 text-right">{search.totalDistance} km</p>
                                    </div>
                                </div>

                                {/* CONTACT FORM */}
                                <form onSubmit={handleBookingSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">{language === Language.EN ? 'Full Name' : 'Имя'}</label>
                                        <input 
                                            type="text" 
                                            required 
                                            className={`w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">{language === Language.EN ? 'Phone (WhatsApp)' : 'Телефон'}</label>
                                        <input 
                                            type="tel" 
                                            required 
                                            className={`w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                                            value={formData.phone}
                                            onChange={e => setFormData({...formData, phone: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                                        <input 
                                            type="email" 
                                            required 
                                            className={`w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                                            value={formData.email}
                                            onChange={e => setFormData({...formData, email: e.target.value})}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </form>
                            </div>

                            {/* STICKY FOOTER PRICE */}
                            <div className="bg-gray-50 p-6 border-t border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Total Price</p>
                                        <p className="text-[10px] text-gray-400">Transport only. Tickets extra.</p>
                                    </div>
                                    <div className="text-3xl font-black text-indigo-600">
                                        {calculateTotalCost(selectedDriver, promoApplied).total} <span className="text-lg">GEL</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleBookingSubmit}
                                    disabled={isSubmitting || isCapacityOverflow || isDateBlocked}
                                    className={`w-full font-bold py-4 rounded-xl text-lg shadow-lg flex items-center justify-center transition transform hover:-translate-y-1 
                                        ${isCapacityOverflow || isDateBlocked 
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                            : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/30 text-white'}`}
                                >
                                    {isSubmitting 
                                        ? (language === Language.EN ? 'Processing...' : 'Обработка...') 
                                        : (isCapacityOverflow 
                                            ? (language === Language.EN ? 'Too Many Guests' : 'Мест нет')
                                            : (isDateBlocked 
                                                ? (language === Language.EN ? 'Date Unavailable' : 'Дата занята')
                                                : (language === Language.EN ? 'Confirm Booking' : 'Подтвердить')
                                            ))
                                    }
                                    {!isSubmitting && !isCapacityOverflow && !isDateBlocked && <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      )}

    </div>
  );
};