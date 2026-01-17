import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { db } from '../services/db';

interface ContactSectionProps {
  language: Language;
}

const ContactSection: React.FC<ContactSectionProps> = ({ language }) => {
  const [promoCode, setPromoCode] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [activeSession, setActiveSession] = useState<{ code: string, discount: number } | null>(null);

  useEffect(() => {
      // Check for existing session
      const session = db.session.getActivePromo();
      if (session) setActiveSession(session);

      // Listen for global changes
      const handleGlobalChange = () => {
          const s = db.session.getActivePromo();
          setActiveSession(s);
      };
      window.addEventListener('orbitrip-promo-change', handleGlobalChange);
      return () => window.removeEventListener('orbitrip-promo-change', handleGlobalChange);
  }, []);

  const handleActivate = async () => {
      if (!promoCode.trim()) return;
      setStatus('LOADING');
      
      try {
          const result = await db.promoCodes.validate(promoCode.trim());
          if (result.valid) {
              db.session.setActivePromo(promoCode.trim(), result.discount);
              setStatus('SUCCESS');
              setTimeout(() => {
                  const searchSection = document.getElementById('tours-section') || document.body;
                  searchSection.scrollIntoView({ behavior: 'smooth' });
              }, 1500);
          } else {
              setStatus('ERROR');
          }
      } catch (e) {
          setStatus('ERROR');
      }
  };

  const isEn = language === Language.EN;

  return (
    <div id="contact" className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-[2.5rem] shadow-2xl overflow-hidden lg:grid lg:grid-cols-2 lg:gap-4 relative border-4 border-indigo-100/20">
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20 relative z-10 flex flex-col justify-center">
            
            <div className="mb-6">
                {activeSession ? (
                    <span className="inline-block py-2 px-4 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-bold uppercase tracking-widest border border-emerald-500/50 animate-pulse">
                        {isEn ? "✨ VIP Status Active" : "✨ VIP Статус Активен"}
                    </span>
                ) : (
                    <span className="inline-block py-2 px-4 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-widest border border-amber-400/30">
                        {isEn ? "Limited Airport Offer" : "Спецпредложение в Аэропорту"}
                    </span>
                )}
            </div>

            <h2 className="text-3xl font-extrabold text-white sm:text-5xl leading-tight mb-6">
                <span className="block">{isEn ? "Found our Booklet?" : "Нашли наш буклет?"}</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400 mt-2">
                    {activeSession ? (isEn ? "You saved money!" : "Вы сэкономили!") : (isEn ? "Unlock Your Secret VIP Price!" : "Активируйте Секретную VIP Цену!")}
                </span>
            </h2>
            
            {!activeSession && (
                <p className="text-lg leading-relaxed text-indigo-100 mb-8 max-w-lg">
                    {isEn 
                    ? "Don't pay full price. Grab the code from your airport brochure, enter it here, and watch the price drop instantly. Up to 35% OFF for new arrivals."
                    : "Не платите полную стоимость. Найдите код в брошюре аэропорта, введите его здесь и цена мгновенно снизится. Скидки до 35% для новых гостей."}
                </p>
            )}

            {/* SMART INPUT FORM */}
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex flex-col sm:flex-row gap-2 max-w-md relative overflow-hidden transition-all duration-500">
                {activeSession ? (
                    <div className="w-full p-4 flex items-center justify-center text-white font-bold text-lg">
                        <span className="text-3xl mr-3">🎉</span> 
                        {isEn ? `-${activeSession.discount}% Discount Applied!` : `-${activeSession.discount}% Скидка Активирована!`}
                    </div>
                ) : (
                    <>
                        <input 
                            type="text" 
                            placeholder={isEn ? "Enter Code (e.g. AIRPORT25)" : "Введите код (напр. AIRPORT25)"}
                            value={promoCode}
                            onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setStatus('IDLE'); }}
                            className="flex-1 bg-transparent border-none text-white placeholder-indigo-200 px-4 py-3 font-bold uppercase tracking-widest focus:ring-0 outline-none text-lg"
                        />
                        <button 
                            onClick={handleActivate}
                            disabled={status === 'LOADING' || !promoCode}
                            className={`px-8 py-3 rounded-xl font-bold text-indigo-900 shadow-lg transition-all transform active:scale-95 flex items-center justify-center min-w-[140px]
                                ${status === 'ERROR' ? 'bg-red-400 text-white' : 'bg-white hover:bg-indigo-50'}
                            `}
                        >
                            {status === 'LOADING' ? (
                                <svg className="animate-spin h-5 w-5 text-indigo-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : status === 'ERROR' ? (
                                isEn ? "Invalid" : "Ошибка"
                            ) : (
                                isEn ? "Activate" : "Ввести код"
                            )}
                        </button>
                    </>
                )}
            </div>
            
            <div className="mt-4 flex items-center gap-4 text-xs font-medium text-indigo-300">
                <span className="flex items-center cursor-pointer hover:text-white transition">
                    <span className="mr-1">📍</span> {isEn ? "Where to find booklets?" : "Где найти буклет?"}
                </span>
                {status === 'SUCCESS' && <span className="text-emerald-400 font-bold animate-fadeIn">✓ Prices Updated!</span>}
            </div>

          </div>

          {/* Right Visual */}
          <div className="relative -mt-6 aspect-w-5 aspect-h-3 md:aspect-w-2 md:aspect-h-1 lg:aspect-none lg:mt-0 lg:flex lg:items-center">
             <div className="relative w-full h-full min-h-[350px] flex items-center justify-center p-8">
                <div className={`text-center relative z-10 transform transition duration-700 ${activeSession ? 'scale-110 rotate-0' : 'rotate-3 hover:rotate-0'}`}>
                    
                    {/* Visual Ticket Representation */}
                    <div className={`rounded-3xl shadow-2xl p-8 max-w-xs mx-auto border-4 relative overflow-hidden transition-colors duration-500 ${activeSession ? 'bg-gradient-to-b from-emerald-500 to-teal-600 border-emerald-300 text-white' : 'bg-white border-dashed border-gray-300 text-slate-800'}`}>
                        
                        {/* Decorative Holes */}
                        <div className="absolute -left-4 top-1/2 w-8 h-8 bg-indigo-900 rounded-full"></div>
                        <div className="absolute -right-4 top-1/2 w-8 h-8 bg-indigo-900 rounded-full"></div>
                        
                        {activeSession ? (
                            <>
                                <p className="text-emerald-100 text-xs font-black uppercase tracking-widest mb-4">
                                    {isEn ? "VIP Access Granted" : "VIP Доступ Открыт"}
                                </p>
                                <p className="text-6xl font-black mb-2 flex justify-center items-start">
                                    <span>{activeSession.discount}</span>
                                    <span className="text-2xl mt-1">%</span>
                                </p>
                                <div className="text-lg font-bold uppercase tracking-widest mb-6 opacity-90">OFF EVERYTHING</div>
                                <div className="bg-white/20 rounded-lg p-3 font-mono text-sm tracking-widest border border-white/30 text-center">
                                    {activeSession.code}
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-indigo-500 text-xs font-black uppercase tracking-widest mb-2">
                                    {isEn ? "OrbiTrip Welcome Pass" : "Приветственный Бонус"}
                                </p>
                                <div className="text-5xl font-black text-slate-900 mb-1 flex justify-center items-baseline">
                                    -35<span className="text-2xl text-gray-400 line-through ml-1">%</span>
                                </div>
                                <div className="mt-4 bg-gray-100 rounded-lg p-3 font-mono text-sm text-gray-400 tracking-widest border border-gray-200 text-center">
                                    AIRPORT**
                                </div>
                                <p className="text-[10px] text-gray-400 mt-4 text-center">
                                    {isEn ? "Valid for transfers from KUT/TBS/BUS" : "Действует на трансферы из KUT/TBS/BUS"}
                                </p>
                            </>
                        )}
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;