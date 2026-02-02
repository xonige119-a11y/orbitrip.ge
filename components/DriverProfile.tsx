
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Driver, Language } from '../types';

interface DriverProfileProps {
  driver: Driver;
  language: Language;
  onBack: () => void;
  onBook: (date: string) => void; // Updated to accept date
  price: string;
  date?: string; 
}

const DriverProfile: React.FC<DriverProfileProps> = ({ driver, language, onBack, onBook, price, date }) => {
  const isEn = language === Language.EN;
  
  // Gallery State
  const [activeImage, setActiveImage] = useState(driver.carPhotoUrl);
  
  // Date State - Initialize with passed date or tomorrow
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
      if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
          const [y, m, d] = date.split('-').map(Number);
          return new Date(y, m - 1, d);
      }
      const d = new Date(); 
      d.setDate(d.getDate() + 1); 
      return d;
  });

  // Sync if prop changes
  useEffect(() => {
      if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
          const [y, m, d] = date.split('-').map(Number);
          setSelectedDate(new Date(y, m - 1, d));
      }
  }, [date]);

  // Scroll to top on mount
  useEffect(() => {
      window.scrollTo(0, 0);
  }, []);
  
  // Combine all photos
  const allPhotos = [driver.carPhotoUrl, ...(driver.carPhotos || [])].filter(Boolean).slice(0, 4);

  // Parse numeric price
  const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
  const usdPrice = Math.round(numericPrice / 2.7);

  const handleBookClick = () => {
      // Convert Date object back to YYYY-MM-DD string
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${y}-${m}-${d}`;
      
      onBook(dateString);
  };

  return (
    <>
      {/* MAIN CONTENT CONTAINER */}
      {/* Note: 'animate-fadeIn' applies a transform, which breaks 'position: fixed' children. 
          That is why the sticky bar is moved OUTSIDE this div. */}
      <div className="min-h-screen bg-[#f9f9f9] font-sans text-[#333] pb-48 lg:pb-12 animate-fadeIn pt-24">
        
        {/* 1. Sticky Header with Prominent Back Button (Relative to this container flow) */}
        <div className="bg-white border-b border-gray-200 sticky top-24 z-30 shadow-sm transition-all">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <button 
                  onClick={onBack}
                  className="flex items-center text-gray-700 hover:text-[#00c853] transition font-bold text-sm uppercase tracking-wide bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-200 rounded-lg px-5 py-2 shadow-sm"
              >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  {isEn ? "Back" : "Назад"}
              </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT COLUMN: Gallery, Info, Reviews */}
              <div className="lg:col-span-2 space-y-6 md:space-y-8">
                  
                  {/* A. Gallery */}
                  <div className="bg-white p-1 rounded-2xl shadow-sm overflow-hidden">
                      <div className="relative h-[250px] md:h-[450px] bg-gray-100 overflow-hidden rounded-xl group">
                          <img 
                              src={activeImage} 
                              alt={driver.carModel} 
                              className="w-full h-full object-cover" 
                          />
                          
                          {/* Navigation Arrows */}
                          <div className="absolute inset-y-0 left-0 w-16 flex items-center justify-center bg-gradient-to-r from-black/20 to-transparent text-white cursor-pointer transition active:scale-95" onClick={() => {
                              const idx = allPhotos.indexOf(activeImage);
                              const prev = idx === 0 ? allPhotos.length - 1 : idx - 1;
                              setActiveImage(allPhotos[prev]);
                          }}>
                              <span className="text-4xl font-bold drop-shadow-md">‹</span>
                          </div>
                          <div className="absolute inset-y-0 right-0 w-16 flex items-center justify-center bg-gradient-to-l from-black/20 to-transparent text-white cursor-pointer transition active:scale-95" onClick={() => {
                              const idx = allPhotos.indexOf(activeImage);
                              const next = (idx + 1) % allPhotos.length;
                              setActiveImage(allPhotos[next]);
                          }}>
                              <span className="text-4xl font-bold drop-shadow-md">›</span>
                          </div>
                      </div>
                      
                      {/* Thumbnails */}
                      {allPhotos.length > 1 && (
                          <div className="grid grid-cols-4 gap-2 mt-2 px-1 pb-1">
                              {allPhotos.map((photo, idx) => (
                                  <div 
                                      key={idx} 
                                      onClick={() => setActiveImage(photo)}
                                      className={`h-16 md:h-20 cursor-pointer overflow-hidden rounded-lg relative transition-all ${activeImage === photo ? 'opacity-100 ring-2 ring-[#00c853] ring-offset-1 z-10' : 'opacity-70 hover:opacity-100'}`}
                                  >
                                      <img src={photo} className="w-full h-full object-cover" alt="thumb" />
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>

                  {/* B. Driver & Car Header Block */}
                  <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm border border-gray-100">
                      <div className="flex flex-row items-center gap-4 md:gap-6 border-b border-gray-100 pb-6 mb-6">
                          <div className="relative flex-shrink-0">
                              <img src={driver.photoUrl} className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover border-4 border-gray-50 shadow-md" alt={driver.name} />
                              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] md:text-xs p-1.5 rounded-full border-2 border-white shadow-sm">
                                  <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                              </div>
                          </div>
                          <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h1 className="text-xl md:text-2xl font-black text-gray-900 truncate">{driver.name}</h1>
                                  <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">{isEn ? "Verified" : "Проверен"}</span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                  <span className="text-yellow-400 font-black text-sm">★ {driver.rating.toFixed(1)}</span>
                                  <span className="text-gray-400 text-xs font-bold">({driver.reviewCount} {isEn ? "Reviews" : "Отзывов"})</span>
                              </div>
                              
                              {/* Languages */}
                              <div className="flex flex-wrap gap-1.5">
                                  {driver.languages.map(lang => (
                                      <span key={lang} className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">{lang}</span>
                                  ))}
                              </div>
                          </div>
                      </div>

                      {/* Car Specs */}
                      <div>
                          <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                              <span className="text-2xl">🚗</span> {driver.carModel}
                          </h3>
                          
                          <div className="flex flex-wrap gap-3 text-sm text-gray-700 font-bold mb-6">
                              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
                                  <span className="text-[#00c853] text-lg">💺</span> {driver.maxPassengers} {isEn ? "Seats" : "Мест"}
                              </div>
                              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
                                  <span className="text-[#00c853] text-lg">🎒</span> 4 {isEn ? "Bags" : "Багаж"}
                              </div>
                              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
                                  <span className="text-[#00c853] text-lg">⛽</span> {driver.features?.includes('Gas') ? (isEn ? "Gas" : "Газ") : (isEn ? "Petrol" : "Бензин")}
                              </div>
                          </div>

                          {/* Features Icons */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {['AC', 'WiFi', 'Water', 'Charger'].map((feat, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-white border border-gray-100 p-2 rounded-lg shadow-sm">
                                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-[10px]">✔</div>
                                      {feat}
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* C. Reviews List */}
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between">
                          <span>{isEn ? "Reviews" : "Отзывы"}</span>
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{driver.reviewCount}</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {driver.reviews && driver.reviews.length > 0 ? driver.reviews.map((review, i) => (
                              <div key={i} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col h-full hover:border-gray-200 transition-colors">
                                  <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200">
                                              {review.author.charAt(0)}
                                          </div>
                                          <span className="font-bold text-sm text-gray-900">{review.author}</span>
                                      </div>
                                      <span className="text-[10px] text-gray-400 font-bold uppercase">{review.date}</span>
                                  </div>
                                  
                                  <div className="flex text-yellow-400 text-xs mb-3">
                                      {[...Array(5)].map((_, s) => <span key={s}>{s < review.rating ? '★' : '☆'}</span>)}
                                  </div>

                                  <p className="text-sm text-gray-600 italic leading-relaxed flex-grow">
                                      "{isEn ? review.textEn : review.textRu}"
                                  </p>
                              </div>
                          )) : (
                              <div className="col-span-2 text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                  <span className="text-3xl mb-2 block opacity-50">💬</span>
                                  {isEn ? "No reviews yet." : "Отзывов пока нет."}
                              </div>
                          )}
                      </div>
                  </div>

              </div>

              {/* RIGHT COLUMN: STICKY SIDEBAR (DESKTOP) */}
              <div className="lg:col-span-1 hidden lg:block">
                  <div className="sticky top-48 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 ring-1 ring-black/5">
                      <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-[#00c853] text-4xl font-black">{price} ₾</span>
                          <span className="text-gray-400 text-sm font-bold">~{usdPrice}$</span>
                      </div>
                      <p className="text-xs text-gray-400 font-bold uppercase mb-6 tracking-wide">
                          {isEn ? "Total price per vehicle" : "Цена за весь автомобиль"}
                      </p>

                      {/* INTERACTIVE DATE PICKER */}
                      <div className="mb-6 border-2 border-gray-100 rounded-xl px-4 py-2 bg-gray-50 flex items-center justify-between relative cursor-pointer hover:border-[#00c853] transition group">
                          <div className="flex-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1 group-hover:text-green-600 transition-colors">{isEn ? "Trip Date" : "Дата Поездки"}</span>
                              <DatePicker 
                                  selected={selectedDate}
                                  onChange={(d: Date) => setSelectedDate(d)}
                                  className="bg-transparent font-black text-gray-900 text-base w-full outline-none cursor-pointer p-0"
                                  dateFormat="dd MMMM yyyy"
                                  minDate={new Date()}
                              />
                          </div>
                          <span className="text-2xl group-hover:scale-110 transition-transform">📅</span>
                      </div>

                      <button 
                          onClick={handleBookClick}
                          className="w-full bg-[#00c853] hover:bg-[#00a844] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-95 uppercase tracking-wide mb-6"
                      >
                          {isEn ? "Book Now" : "Забронировать"}
                      </button>

                      <div className="space-y-3 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-3 text-xs font-bold text-gray-600">
                              <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</span> 
                              {isEn ? "Free Cancellation (24h)" : "Бесплатная отмена (24ч)"}
                          </div>
                          <div className="flex items-center gap-3 text-xs font-bold text-gray-600">
                              <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</span> 
                              {isEn ? "Pay Cash to Driver" : "Оплата водителю (Нал)"}
                          </div>
                          <div className="flex items-center gap-3 text-xs font-bold text-gray-600">
                              <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</span> 
                              {isEn ? "Free Waiting Time" : "Бесплатное ожидание"}
                          </div>
                      </div>
                  </div>
              </div>

          </div>
        </div>
      </div>

      {/* --- SMART MOBILE STICKY BOOKING BAR (NEW & IMPROVED) --- */}
      {/* Placed OUTSIDE the animate-fadeIn container to ensure position:fixed works relative to viewport */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 pb-safe z-[100] shadow-[0_-5px_25px_rgba(0,0,0,0.15)] rounded-t-2xl transition-transform duration-300">
          <div className="flex flex-col gap-3">
              {/* Row 1: Price Info & Interactive Date Picker */}
              <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{isEn ? "Total Price" : "Итого"}</span>
                      <div className="flex items-baseline gap-1">
                          <span className="text-[#00c853] text-2xl font-black leading-none">{price} ₾</span>
                          <span className="text-gray-400 text-xs font-bold">~{usdPrice}$</span>
                      </div>
                  </div>
                  
                  {/* Smart Date Trigger */}
                  <div className="relative bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer active:scale-95 transition border border-transparent hover:border-gray-300">
                      <span className="text-lg">📅</span>
                      <div className="flex flex-col items-start">
                          <span className="text-[8px] text-gray-400 font-bold uppercase leading-none">{isEn ? "Date" : "Дата"}</span>
                          <span className="text-xs font-bold text-gray-900 leading-none">
                              {selectedDate.toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})}
                          </span>
                      </div>
                      
                      {/* Invisible Picker Overlay */}
                      <DatePicker 
                          selected={selectedDate}
                          onChange={(d: Date) => setSelectedDate(d)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20"
                          minDate={new Date()}
                          popperPlacement="top-end"
                      />
                  </div>
              </div>

              {/* Bottom Row: Big Action Button */}
              <button 
                  onClick={handleBookClick}
                  className="w-full bg-[#00c853] hover:bg-[#00a844] active:bg-[#008f39] text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-green-200 transition-all transform active:scale-[0.98] uppercase tracking-wide flex items-center justify-center gap-2"
              >
                  <span>{isEn ? "Book Now" : "Забронировать"}</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
          </div>
      </div>
    </>
  );
};

export default DriverProfile;
