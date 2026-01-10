import React, { useState, useEffect } from 'react';
import { Language, Tour, VehicleType, Driver, TripSearch } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: Tour | null;
  search?: TripSearch | null;
  language: Language;
  onSubmit: (data: any) => void;
  initialDate?: string;
  initialGuests?: number;
  price?: string; // This is the Single Source of Truth for Driver Cards
  selectedDriver?: Driver | null; 
}

const VALID_PROMO_CODES = ['BOOKLET20', 'ORBI20', 'GEORGIA2024', 'SUMMER24'];

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, tour, search, language, onSubmit, initialDate, initialGuests = 1, price, selectedDriver }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+995');
  const [hour, setHour] = useState('10');
  const [minute, setMinute] = useState('00');
  const [note, setNote] = useState('');
  
  // Validation State
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [phoneValid, setPhoneValid] = useState<boolean | null>(null);
  const [nameValid, setNameValid] = useState<boolean | null>(null);

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  
  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Prices - strictly number for math
  const [finalPriceValue, setFinalPriceValue] = useState<number>(0);
  const [originalPriceValue, setOriginalPriceValue] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
        // Priority: Passed Price (Specific Driver) > Tour Price (Generic)
        const rawPriceStr = price || (tour ? tour.price : '0');
        
        // Robust numeric extraction
        const numeric = parseFloat(rawPriceStr.replace(/[^0-9.]/g, '')) || 0;
        
        setOriginalPriceValue(numeric);
        setFinalPriceValue(numeric);
        
        // Reset Form State
        setDiscountApplied(false);
        setPromoCode('');
        setPromoError('');
        setIsSubmitting(false);
        // Retain user contact info if they re-open, but valid states reset
        setEmailValid(null);
        setPhoneValid(null);
        setNameValid(null);
    }
  }, [tour, price, isOpen]);

  if (!isOpen) return null;
  
  const estimatedVehicle = selectedDriver ? selectedDriver.vehicleType : (initialGuests <= 3 ? 'Sedan' : initialGuests <= 7 ? 'Minivan' : 'Bus');

  const displayTitle = tour 
    ? (language === Language.EN ? tour.titleEn : tour.titleRu)
    : search && search.stops.length >= 2 
        ? `${search.stops[0]} ➝ ${search.stops[search.stops.length - 1]}`
        : (language === Language.EN ? 'Custom Transfer' : 'Трансфер');

  const displayImage = tour 
    ? tour.image 
    : selectedDriver 
        ? selectedDriver.carPhotoUrl 
        : 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800'; 

  // --- VALIDATION HELPERS ---
  const validateEmail = (val: string) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailValid(re.test(val));
      setEmail(val);
  };

  const validatePhone = (val: string) => {
      const clean = val.replace(/[^0-9+]/g, '');
      const digits = clean.replace(/[^0-9]/g, '');
      setPhoneValid(digits.length >= 6);
      setPhone(val);
  };

  const validateName = (val: string) => {
      setNameValid(val.trim().length > 2);
      setName(val);
  };

  const executePromoCheck = (code: string) => {
    setTimeout(() => {
        if (VALID_PROMO_CODES.includes(code)) {
            // Precise calculation: 20% discount, rounded to integer for GEL
            const discount = Math.round(originalPriceValue * 0.20); 
            const newTotal = originalPriceValue - discount;
            
            setFinalPriceValue(newTotal);
            setDiscountApplied(true);
            setPromoError('');
        } else {
            setPromoError(language === Language.EN ? "Invalid or expired code" : "Неверный или истекший код");
            setDiscountApplied(false);
            setFinalPriceValue(originalPriceValue);
        }
    }, 300);
  }

  const handleApplyPromo = () => {
    if (!promoCode) return;
    executePromoCheck(promoCode.trim().toUpperCase());
  };

  const handleQuickApply = () => {
      setPromoCode('ORBI20');
      executePromoCheck('ORBI20');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailValid || !phoneValid || !nameValid) {
        if (emailValid === null) validateEmail(email);
        if (phoneValid === null) validatePhone(phone);
        if (nameValid === null) validateName(name);
        return;
    }

    setIsSubmitting(true);

    // Simulate network request
    setTimeout(() => {
        onSubmit({
          tourId: tour ? tour.id : 'transfer',
          tourTitle: displayTitle,
          customerName: name,
          contactInfo: `${phone} / ${email}`,
          date: `${initialDate || 'Date not set'} at ${hour}:${minute}`,
          guests: initialGuests, 
          vehicle: estimatedVehicle, 
          driverName: selectedDriver ? selectedDriver.name : 'Any Driver',
          driverId: selectedDriver ? selectedDriver.id : undefined, 
          // CRITICAL: Send strictly the final calculated numeric price
          numericPrice: finalPriceValue,
          // Formatted price for UI display in tables
          totalPrice: `${finalPriceValue} GEL` + (discountApplied ? " (Promo)" : "")
        });
        setIsSubmitting(false);
        onClose();
    }, 800);
  };

  const hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  const getInputClass = (isValid: boolean | null) => {
      if (isValid === false) return "border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500";
      if (isValid === true) return "border-green-300 bg-green-50 focus:ring-green-500 focus:border-green-500";
      return "border-gray-300 bg-gray-50 focus:bg-white focus:ring-indigo-500";
  };

  return (
    <div className="fixed inset-0 z-[105] bg-white lg:bg-gray-100 font-sans h-full w-full">
        
        {/* Main Wrapper - Flex to push footer down */}
        <div className="flex flex-col h-full lg:h-auto lg:max-w-5xl lg:mx-auto lg:relative lg:top-10 lg:rounded-xl lg:shadow-2xl lg:overflow-hidden lg:bg-white lg:flex-row">
            
            {/* Header (Sticky on Mobile) */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 flex-shrink-0 lg:hidden">
                <button onClick={onClose} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-lg font-bold text-gray-900 truncate">
                    {language === Language.EN ? 'Checkout' : 'Оформление'}
                </h1>
                <div className="w-8"></div> 
            </div>

            {/* Content Area (Scrollable) */}
            <div className="flex-1 overflow-y-auto lg:overflow-visible">
                <div className="flex flex-col lg:flex-row h-full">
                    
                    {/* LEFT: FORM */}
                    <div className="flex-1 p-6 pb-32 lg:pb-6">
                        {/* Mobile Summary */}
                        <div className="lg:hidden bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 mb-6">
                            <img src={displayImage} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" alt="tour" />
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{displayTitle}</h4>
                                <div className="text-xs text-gray-500 mt-1">
                                    {initialDate} • {initialGuests} Pax
                                </div>
                                <div className="text-xs font-bold text-indigo-600 mt-1">
                                    {finalPriceValue} GEL
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 hidden lg:block mb-6 border-b pb-4">
                                {language === Language.EN ? 'Contact Details' : 'Контактные Данные'}
                            </h2>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                                        <span className="bg-indigo-100 text-indigo-600 p-1 rounded mr-2">👤</span>
                                        {language === Language.EN ? "Full Name" : "Имя Фамилия"}
                                    </label>
                                    <input type="text" required value={name} onChange={(e) => validateName(e.target.value)} className={`w-full border rounded-xl p-4 text-base ${getInputClass(nameValid)}`} placeholder="John Doe"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                                        <span className="bg-indigo-100 text-indigo-600 p-1 rounded mr-2">✉️</span>
                                        {language === Language.EN ? "Email" : "Email"}
                                    </label>
                                    <input type="email" required value={email} onChange={(e) => validateEmail(e.target.value)} className={`w-full border rounded-xl p-4 text-base ${getInputClass(emailValid)}`} placeholder="john@example.com"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                                        <span className="bg-indigo-100 text-indigo-600 p-1 rounded mr-2">📞</span>
                                        {language === Language.EN ? "Phone (WhatsApp)" : "Телефон (WhatsApp)"}
                                    </label>
                                    <input type="tel" required value={phone} onChange={(e) => validatePhone(e.target.value)} className={`w-full border rounded-xl p-4 text-base ${getInputClass(phoneValid)}`} placeholder="+995 5xx xxx xxx"/>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{language === Language.EN ? "Start Time" : "Время начала"}</label>
                                    <div className="flex gap-2">
                                        <select value={hour} onChange={(e) => setHour(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 bg-white text-base h-12">{hours.map(h => <option key={h} value={h}>{h}</option>)}</select>
                                        <select value={minute} onChange={(e) => setMinute(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 bg-white text-base h-12">{minutes.map(m => <option key={m} value={m}>{m}</option>)}</select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{language === Language.EN ? "Notes" : "Пожелания"}</label>
                                <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-base" placeholder="Optional..."/>
                            </div>

                            {/* PROMO SECTION */}
                            <div className={`p-5 rounded-xl border transition-all duration-300 ${discountApplied ? 'bg-green-50 border-green-200' : 'bg-indigo-50 border-indigo-100'}`}>
                                <div className="flex justify-between items-center mb-3">
                                    <label className={`block text-sm font-extrabold uppercase tracking-wide ${discountApplied ? 'text-green-700' : 'text-indigo-800'}`}>
                                        {language === Language.EN ? "Promo Code" : "Промокод"}
                                    </label>
                                    {!discountApplied && (
                                        <button type="button" onClick={handleQuickApply} className="text-orange-600 text-xs font-bold underline">
                                            Use ORBI20
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <input 
                                        type="text" 
                                        disabled={discountApplied}
                                        value={promoCode}
                                        onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); }}
                                        placeholder="CODE"
                                        className={`block w-full px-4 py-3 border rounded-xl focus:outline-none uppercase font-bold text-base ${promoError ? 'border-red-300 bg-red-50' : discountApplied ? 'border-green-300 bg-white' : 'border-indigo-200'}`}
                                    />
                                    <button type="button" onClick={handleApplyPromo} disabled={discountApplied || !promoCode} className={`px-6 rounded-xl font-bold shadow-sm transition ${discountApplied ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                                        {discountApplied ? '✓' : 'Apply'}
                                    </button>
                                </div>
                                {promoError && <div className="mt-2 text-red-600 text-sm font-medium">{promoError}</div>}
                            </div>
                        </form>
                    </div>

                    {/* RIGHT: DESKTOP SUMMARY */}
                    <div className="hidden lg:block w-80 bg-gray-50 p-8 border-l border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-6">Order Summary</h3>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                            <img src={displayImage} className="w-full h-32 object-cover" alt="tour" />
                            <div className="p-4">
                                <h4 className="font-bold text-sm mb-1">{displayTitle}</h4>
                                <p className="text-xs text-gray-500">{initialDate} • {initialGuests} Guests</p>
                            </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 border-t border-gray-200 pt-4">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{originalPriceValue} GEL</span>
                            </div>
                            {discountApplied && (
                                <div className="flex justify-between text-green-600 font-bold">
                                    <span>Discount</span>
                                    <span>-{originalPriceValue - finalPriceValue} GEL</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-black text-gray-900 pt-2 border-t mt-2">
                                <span>Total</span>
                                <span>{finalPriceValue} GEL</span>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button type="submit" onClick={handleSubmit} disabled={isSubmitting} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition ${!isSubmitting ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400'}`}>
                                {isSubmitting ? "Processing..." : "Confirm Booking"}
                            </button>
                            <button type="button" onClick={onClose} className="w-full mt-3 py-2 text-gray-500 font-bold text-sm hover:text-gray-700">Cancel</button>
                        </div>
                    </div>

                </div>
            </div>

            {/* MOBILE STICKY FOOTER */}
            <div className="lg:hidden absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-30 pb-safe">
                <div className="flex justify-between items-center mb-3">
                    <div className="text-sm text-gray-500 font-medium">{language === Language.EN ? "Total:" : "Итого:"}</div>
                    <div className="text-2xl font-black text-indigo-900 leading-none">{finalPriceValue} <span className="text-sm">GEL</span></div>
                </div>
                <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting} 
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center ${!isSubmitting ? 'bg-indigo-600 text-white active:bg-indigo-700' : 'bg-gray-300 text-gray-500'}`}
                >
                    {isSubmitting ? (language === Language.EN ? "Processing..." : "Обработка...") : (language === Language.EN ? 'Confirm Booking' : 'Подтвердить')}
                </button>
            </div>

        </div>
    </div>
  );
};

export default BookingModal;