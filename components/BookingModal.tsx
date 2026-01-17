
import React, { useState, useMemo, useEffect } from 'react';
import { Language, Tour, Driver, TripSearch } from '../types';

interface BookingPageProps {
  onBack: () => void; // Navigation back
  tour: Tour | null;
  search?: TripSearch | null;
  language: Language;
  onSubmit: (data: any) => void;
  initialDate?: string;
  initialGuests?: number;
  numericPrice: number; 
  selectedDriver?: Driver | null; 
}

const BookingModal: React.FC<BookingPageProps> = ({ onBack, tour, search, language, onSubmit, initialDate, initialGuests = 1, numericPrice, selectedDriver }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+995 '); 
  const [flightNumber, setFlightNumber] = useState(''); 
  const [notes, setNotes] = useState(''); 
  const [promoCodeInput, setPromoCodeInput] = useState(''); // Separated promo code state
  
  // Hardcoded Payment Method - CASH ONLY
  const paymentMethod = 'CASH'; 

  const [hour, setHour] = useState('10');
  const [minute, setMinute] = useState('00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEn = language === Language.EN;

  // Scroll to top on mount and Detect User Country Code
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Auto-detect country code based on IP
    const detectCountryCode = async () => {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            if (data && data.country_calling_code) {
                setPhone(`${data.country_calling_code} `);
            }
        } catch (error) {
            console.warn('Could not detect country code via IP');
        }
    };

    detectCountryCode();
  }, []);

  const displayDateFormatted = useMemo(() => {
      const dateToParse = initialDate || search?.date;
      if (dateToParse && /^\d{4}-\d{2}-\d{2}$/.test(dateToParse)) {
          const [y, m, d] = dateToParse.split('-').map(Number);
          const monthsEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          const monthsGe = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
          const mName = isEn ? monthsEn[m-1] : monthsGe[m-1];
          const weekDaysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const weekDaysGe = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
          const dayName = isEn ? weekDaysEn[new Date(y, m-1, d).getDay()] : weekDaysGe[new Date(y, m-1, d).getDay()];
          
          return `${d} ${mName}, ${dayName}`;
      }
      return dateToParse || new Date().toLocaleDateString();
  }, [initialDate, search, isEn]);

  const routeStart = tour ? (isEn ? tour.titleEn.split('->')[0] : tour.titleRu.split('->')[0]) : (search?.stops[0] || 'Start');
  const routeEnd = tour ? (isEn ? tour.titleEn.split('->')[1] || '' : tour.titleRu.split('->')[1] || '') : (search?.stops[search.stops.length - 1] || 'End');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
        tourId: tour?.id || 'transfer',
        tourTitle: tour?.titleEn || (search ? `${search.stops[0]} ➝ ${search.stops[search.stops.length - 1]}` : 'Private Transfer'),
        customerName: name,
        contactInfo: `${phone} / ${email}`,
        date: `${initialDate || search?.date} at ${hour}:${minute}`,
        guests: initialGuests,
        vehicle: selectedDriver?.vehicleType || 'Sedan',
        driverName: selectedDriver?.name || 'Any Driver',
        driverId: selectedDriver?.id,
        numericPrice: numericPrice,
        totalPrice: `${numericPrice} GEL`, 
        flightNumber: flightNumber,
        paymentMethod: paymentMethod,
        // Only include promo code if it's a TOUR (not manual transfer)
        promoCode: tour ? promoCodeInput : '' 
    };

    // Append notes to contact info or handle separately if backend supports it
    // For now, adding to contact info for driver visibility
    if (notes) payload.contactInfo += ` (Notes: ${notes})`;

    onSubmit(payload);
  };

  return (
    <div className="min-h-screen bg-[#f5f7f9] font-sans pt-24 md:pt-28 pb-32 animate-fadeIn">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Page Header */}
          <div className="mb-6 md:mb-8 flex items-center justify-between">
              <button 
                onClick={onBack} 
                className="flex items-center text-gray-500 hover:text-gray-900 transition font-bold text-sm bg-white px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm"
              >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  {isEn ? "Back" : "Назад"}
              </button>
              
              <div className="flex items-center gap-2">
                  <span className="text-[#00c853] text-xl md:text-2xl">👣</span>
                  <h1 className="text-xl md:text-2xl font-black text-gray-900">{isEn ? 'Complete Booking' : 'Оформление Заказа'}</h1>
              </div>
              <div className="w-24 hidden md:block"></div>
          </div>

          <form id="booking-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* --- LEFT COLUMN: INPUTS --- */}
              <div className="lg:col-span-2 space-y-6 md:space-y-8">
                  
                  {/* Section 1: Contact Info */}
                  <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <span className="bg-gray-200 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">1</span>
                          {isEn ? "Contact Information" : "Контактная информация"}
                      </h4>
                      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-200 space-y-5">
                          
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{isEn ? "Full Name" : "Имя Фамилия"}</label>
                              <input required type="text" className="w-full border border-gray-300 bg-white p-4 rounded-xl text-base font-medium text-gray-900 focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853] outline-none transition-all placeholder-gray-400" placeholder={isEn ? "e.g. John Doe" : "напр. Иван Петров"} value={name} onChange={e => setName(e.target.value)} />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{isEn ? "Email Address" : "Эл.почта"}</label>
                                  <input required type="email" className="w-full border border-gray-300 bg-white p-4 rounded-xl text-base font-medium text-gray-900 focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853] outline-none transition-all placeholder-gray-400" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                              </div>
                              <div className="relative">
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{isEn ? "Phone (WhatsApp)" : "Телефон (WhatsApp)"}</label>
                                  <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                          <span className="text-gray-500 text-base">📞</span>
                                      </div>
                                      <input required type="tel" className="w-full border border-gray-300 bg-white p-4 pl-12 rounded-xl text-base font-medium text-gray-900 focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853] outline-none transition-all placeholder-gray-400" placeholder="+995 ..." value={phone} onChange={e => setPhone(e.target.value)} />
                                  </div>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{isEn ? "Flight Number (Optional)" : "Номер рейса (Необязательно)"}</label>
                                  <input type="text" className="w-full border border-gray-300 bg-white p-4 rounded-xl text-base font-medium text-gray-900 focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853] outline-none transition-all placeholder-gray-400" placeholder={isEn ? "e.g. W6 1234" : "напр. W6 1234"} value={flightNumber} onChange={e => setFlightNumber(e.target.value)} />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{isEn ? "Pickup Time" : "Время встречи"}</label>
                                  <div className="flex gap-2">
                                      <select value={hour} onChange={e => setHour(e.target.value)} className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-4 text-base font-medium text-gray-900 focus:border-[#00c853] outline-none cursor-pointer">
                                          {Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                                      </select>
                                      <span className="self-center font-bold text-gray-400">:</span>
                                      <select value={minute} onChange={e => setMinute(e.target.value)} className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-4 text-base font-medium text-gray-900 focus:border-[#00c853] outline-none cursor-pointer">
                                          {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                                      </select>
                                  </div>
                              </div>
                          </div>

                          {/* Notes */}
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{isEn ? "Additional Requests" : "Пожелания"}</label>
                              <textarea 
                                className="w-full border border-gray-300 bg-white p-4 rounded-xl text-base font-medium text-gray-900 focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853] outline-none transition-all placeholder-gray-400 resize-none h-24"
                                placeholder={isEn ? "Need child seat? Extra luggage? Let us know." : "Нужно детское кресло? Много багажа? Напишите здесь."}
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                              />
                          </div>

                          {/* PROMO CODE - ONLY FOR TOURS/EXCURSIONS */}
                          {tour && (
                              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                  <label className="block text-xs font-bold text-indigo-700 uppercase mb-1">{isEn ? "Promo Code (Tours Only)" : "Промокод (Только для туров)"}</label>
                                  <input 
                                    type="text" 
                                    className="w-full border border-indigo-200 bg-white p-3 rounded-lg text-sm font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 outline-none uppercase placeholder-indigo-300"
                                    placeholder="CODE"
                                    value={promoCodeInput}
                                    onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                                  />
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Section 2: Payment Method */}
                  <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <span className="bg-gray-200 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">2</span>
                          {isEn ? "Payment Method" : "Способ оплаты"}
                      </h4>
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                          <div className="flex items-center p-4 rounded-xl border-2 border-[#00c853] bg-green-50">
                              <div className="bg-[#00c853] text-white w-10 h-10 rounded-full flex items-center justify-center text-xl mr-4">
                                  💶
                              </div>
                              <div className="flex-1">
                                  <h5 className="font-bold text-gray-900 text-sm">{isEn ? "Cash to Driver" : "Наличными водителю"}</h5>
                                  <p className="text-xs text-gray-500 mt-0.5">{isEn ? "Pay directly after the trip." : "Оплата после поездки."}</p>
                              </div>
                              <div className="w-5 h-5 bg-[#00c853] rounded-full flex items-center justify-center">
                                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                              </div>
                          </div>
                          
                          <p className="text-[10px] text-gray-400 mt-4 ml-1 text-center md:text-left">
                              {isEn ? "By booking, you agree to our Terms of Use." : "Оформляя бронирование, вы принимаете Условия использования."}
                          </p>
                      </div>
                  </div>

              </div>

              {/* --- RIGHT COLUMN: SUMMARY --- */}
              <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:sticky lg:top-32">
                      <h4 className="text-lg font-bold text-gray-900 mb-6">{isEn ? "Your Order" : "Ваш заказ"}</h4>
                      
                      <div className="mb-6 relative pl-2">
                          <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-200"></div>
                          
                          {/* Start */}
                          <div className="flex items-start gap-4 mb-6 relative z-10">
                              <div className="w-4 h-4 rounded-full bg-[#00c853] border-2 border-white shadow-sm mt-1"></div>
                              <div>
                                  <p className="text-sm font-bold text-gray-900 leading-tight">
                                      {routeStart || search?.stops[0]}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">{displayDateFormatted}</p>
                              </div>
                          </div>

                          {/* End */}
                          <div className="flex items-start gap-4 relative z-10">
                              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm mt-1"></div>
                              <div>
                                  <p className="text-sm font-bold text-gray-900 leading-tight">
                                      {routeEnd || search?.stops[search.stops.length - 1]}
                                  </p>
                              </div>
                          </div>
                      </div>

                      <div className="border-t border-gray-100 my-4"></div>

                      {/* Driver Info */}
                      {selectedDriver && (
                          <div className="flex items-center gap-3 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                              <img src={selectedDriver.photoUrl} className="w-12 h-12 rounded-full object-cover border border-gray-200" alt="Driver" />
                              <div>
                                  <p className="text-sm font-bold text-gray-900">{selectedDriver.name}</p>
                                  <p className="text-xs text-gray-500 font-medium">{selectedDriver.carModel} • {selectedDriver.vehicleType}</p>
                              </div>
                          </div>
                      )}

                      {/* Price Breakdown */}
                      <div className="space-y-3 mb-20 md:mb-6">
                          <div className="flex justify-between items-end pt-3 border-t border-gray-100">
                              <span className="text-sm font-bold text-gray-900">{isEn ? "Total (Cash)" : "Итого (Нал)"}</span>
                              <div className="text-right">
                                  <span className="block text-3xl font-black text-[#00c853]">
                                      {numericPrice} GEL
                                  </span>
                                  <span className="text-xs text-gray-400 font-bold block mt-1">
                                      ≈ {Math.ceil(numericPrice / 2.7)} USD
                                  </span>
                              </div>
                          </div>
                      </div>

                      {/* STICKY MOBILE BUTTON */}
                      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200 lg:relative lg:p-0 lg:border-0 lg:bg-transparent z-50">
                          <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="w-full bg-[#00c853] hover:bg-[#00a844] text-white font-bold py-4 rounded-xl shadow-xl lg:shadow-lg transition-transform transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed text-base uppercase tracking-wider flex items-center justify-center gap-2"
                          >
                              {isSubmitting ? (
                                  <><span className="animate-spin text-xl">↻</span> {isEn ? "Processing..." : "Оформление..."}</>
                              ) : (
                                  <>{isEn ? 'Confirm Booking' : 'Подтвердить Заказ'}</>
                              )}
                          </button>
                      </div>

                      <div className="hidden lg:block mt-4 text-center">
                          <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                              {isEn 
                                ? "Driver will be waiting for you. Return trip to start location is included in the price if done on the same day." 
                                : "Водитель будет ждать вас. Обратная дорога в точку старта включена в стоимость, если поездка в один день."}
                          </p>
                      </div>

                  </div>
              </div>

          </form>
      </div>
    </div>
  );
};

export default BookingModal;
