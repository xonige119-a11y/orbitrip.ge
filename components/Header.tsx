
import React, { useState, useEffect } from 'react';
import { Language } from '../types';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onToolSelect: (tool: string) => void;
  currentLocation: string;
  onLocationChange: (loc: string) => void;
  isLoggedIn?: boolean; // NEW PROP
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage, onToolSelect, currentLocation, onLocationChange, isLoggedIn = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleNavClick = (tool: string) => {
      onToolSelect(tool);
      setIsMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLanguage = (lang: Language) => {
      setLanguage(lang);
      setIsMobileMenuOpen(false);
  };

  const isEn = language === Language.EN;

  return (
    <header 
        className={`fixed top-0 left-0 w-full z-[100] font-sans transition-all duration-300 ${isMobileMenuOpen ? 'bg-slate-900 shadow-xl' : 'bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-transparent'} backdrop-blur-[4px]`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          
          {/* Logo Section */}
          <div className="flex items-center cursor-pointer group z-50 mr-auto select-none" onClick={() => handleNavClick('HOME')}>
            <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-white tracking-tight leading-none group-hover:text-indigo-300 transition-colors drop-shadow-md">
                        ORBI<span className="text-indigo-400">TRIP</span>
                    </span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 tracking-[0.3em] uppercase mt-1 group-hover:text-white transition-colors drop-shadow-md">
                    GEORGIA • PRIVATE TOURS
                </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-6">
                <button onClick={() => handleNavClick('HOME')} className="text-sm font-bold text-white/90 hover:text-white transition uppercase tracking-wide drop-shadow-md hover:scale-105 transform duration-200">
                    {isEn ? 'Transfers' : 'Трансфер'}
                </button>
                <button onClick={() => handleNavClick('TOURS')} className="text-sm font-bold text-white/90 hover:text-white transition uppercase tracking-wide drop-shadow-md hover:scale-105 transform duration-200">
                    {isEn ? 'Author Tours' : 'Авторские Туры'}
                </button>
                <button onClick={() => handleNavClick('BLOG')} className="text-sm font-bold text-white/90 hover:text-white transition uppercase tracking-wide drop-shadow-md hover:scale-105 transform duration-200">
                    {isEn ? 'Blog' : 'Блог'}
                </button>
            </nav>

            <div className="h-6 w-px bg-white/30"></div>

            <div className="flex items-center space-x-4">
                {/* Location Display - Glass Effect */}
                <div className="hidden lg:flex items-center text-xs font-bold text-white bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/20 transition-colors cursor-default">
                    <span className="mr-1">📍</span> {currentLocation || 'Georgia'}
                </div>

                {/* Language Switcher - Glass Effect */}
                <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20">
                    <button 
                        onClick={() => toggleLanguage(Language.EN)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === Language.EN ? 'bg-white text-indigo-900 shadow-sm' : 'text-white hover:text-indigo-200'}`}
                    >
                        EN
                    </button>
                    <button 
                        onClick={() => toggleLanguage(Language.RU)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === Language.RU ? 'bg-white text-indigo-900 shadow-sm' : 'text-white hover:text-indigo-200'}`}
                    >
                        RU
                    </button>
                </div>

                {/* Partner Login / Dashboard Link - Glass Button */}
                <button 
                    onClick={() => handleNavClick(isLoggedIn ? 'DRIVER_DASHBOARD' : 'ADMIN_LOGIN')}
                    className={`text-xs font-bold text-white hover:bg-white hover:text-slate-900 transition uppercase tracking-wide border border-white/40 bg-white/5 backdrop-blur-md px-4 py-2 rounded-lg hover:shadow-lg flex items-center gap-2 ${isLoggedIn ? 'ring-2 ring-emerald-400' : ''}`}
                >
                    {isLoggedIn ? (
                        <>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            {isEn ? 'My Cabinet' : 'Мой Кабинет'}
                        </>
                    ) : (
                        isEn ? 'Partner Login' : 'Партнерам'
                    )}
                </button>
            </div>
          </div>

          {/* Mobile Menu Button - White */}
          <div className="md:hidden flex items-center">
             <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white focus:outline-none hover:bg-white/10 rounded-lg transition"
             >
                 <span className="sr-only">Open menu</span>
                 <div className="w-6 flex flex-col items-end space-y-1.5">
                     <span className={`h-0.5 bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6 shadow-sm'}`}></span>
                     <span className={`h-0.5 bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'w-4 shadow-sm'}`}></span>
                     <span className={`h-0.5 bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-5 shadow-sm'}`}></span>
                 </div>
             </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Overlay - Solid Dark Background (slate-900) - No Blur to ensure solid color */}
      <div className={`fixed inset-0 z-40 bg-slate-900 transition-transform duration-300 md:hidden flex flex-col pt-24 px-6 space-y-6 h-screen overflow-y-auto ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="space-y-4">
              <button onClick={() => handleNavClick('HOME')} className="block w-full text-left text-xl font-black text-white hover:text-indigo-400 border-b border-white/10 pb-4">
                  {isEn ? 'Private Transfers' : 'Частный Трансфер'}
              </button>
              <button onClick={() => handleNavClick('TOURS')} className="block w-full text-left text-xl font-black text-white hover:text-indigo-400 border-b border-white/10 pb-4">
                  {isEn ? 'Author Tours' : 'Авторские Туры'}
              </button>
              <button onClick={() => handleNavClick('BLOG')} className="block w-full text-left text-xl font-black text-white hover:text-indigo-400 border-b border-white/10 pb-4">
                  {isEn ? 'Travel Blog' : 'Блог о Путешествиях'}
              </button>
              <button onClick={() => handleNavClick('DRIVER_REGISTRATION')} className="block w-full text-left text-xl font-black text-white hover:text-indigo-400 border-b border-white/10 pb-4">
                  {isEn ? 'Become a Driver' : 'Стать Водителем'}
              </button>
          </div>

          <div className="flex justify-between items-center mt-4">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">{isEn ? 'Language' : 'Язык'}</span>
              <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                  <button onClick={() => toggleLanguage(Language.EN)} className={`px-4 py-2 rounded-md text-sm font-bold ${language === Language.EN ? 'bg-indigo-600 text-white shadow' : 'text-gray-400'}`}>EN</button>
                  <button onClick={() => toggleLanguage(Language.RU)} className={`px-4 py-2 rounded-md text-sm font-bold ${language === Language.RU ? 'bg-indigo-600 text-white shadow' : 'text-gray-400'}`}>RU</button>
              </div>
          </div>

          <button onClick={() => handleNavClick(isLoggedIn ? 'DRIVER_DASHBOARD' : 'ADMIN_LOGIN')} className="w-full py-4 rounded-xl border border-white/20 text-white font-bold hover:bg-white/10 transition mt-auto mb-8 flex items-center justify-center gap-2">
              {isLoggedIn ? (
                  <>
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                    {isEn ? 'My Cabinet' : 'Мой Кабинет'}
                  </>
              ) : (
                  isEn ? 'Partner Login' : 'Вход для Партнеров'
              )}
          </button>
      </div>
    </header>
  );
};

export default Header;
