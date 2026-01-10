import React, { useState, useEffect } from 'react';
import { Language } from '../types';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onToolSelect: (tool: string) => void;
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage, onToolSelect }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll for glass effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (tool: string) => {
      onToolSelect(tool);
      setIsMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLanguage = (lang: Language) => {
      setLanguage(lang);
      setIsMobileMenuOpen(false);
  };

  return (
    <header 
        className={`sticky top-0 z-[100] font-sans transition-all duration-300 ${
            scrolled 
            ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200/50' 
            : 'bg-white border-b border-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <div className="flex items-center cursor-pointer group z-50" onClick={() => handleNavClick('HOME')}>
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-400 blur-lg opacity-20 rounded-full group-hover:opacity-40 transition duration-500"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center mr-3 text-white shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
            </div>
            <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-900 transition">
                    Orbi<span className="text-indigo-600">Trip</span>
                </span>
                <span className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase mt-0.5">
                    Georgia
                </span>
            </div>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-1">
            <button onClick={() => handleNavClick('HOME')} className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-full font-medium transition duration-200">
              {language === Language.EN ? 'Tours & Transfers' : 'Туры и Трансферы'}
            </button>
            <button onClick={() => handleNavClick('BLOG')} className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-full font-medium transition duration-200">
              {language === Language.EN ? 'Blog' : 'Блог'}
            </button>
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
                onClick={() => handleNavClick('ADMIN_LOGIN')} 
                className="text-gray-500 hover:text-indigo-600 font-medium text-sm flex items-center transition"
            >
               {language === Language.EN ? 'For Drivers' : 'Водителям'}
            </button>

            <div className="h-5 w-px bg-gray-200 mx-2"></div>

            <div className="flex bg-gray-100/80 p-1 rounded-lg">
              <button
                onClick={() => setLanguage(Language.EN)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all duration-200 ${
                  language === Language.EN ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage(Language.RU)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all duration-200 ${
                  language === Language.RU ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                RU
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden z-50">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-indigo-600 focus:outline-none p-2 bg-gray-50 rounded-lg"
              >
                  {isMobileMenuOpen ? (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                  ) : (
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                  )}
              </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-white/95 backdrop-blur-xl z-[60] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col justify-center items-center space-y-8 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
          <nav className="flex flex-col space-y-6 text-center text-xl font-bold text-gray-800">
            <button onClick={() => handleNavClick('HOME')} className="hover:text-indigo-600 transition p-4">
              {language === Language.EN ? 'Tours & Transfers' : 'Туры и Трансферы'}
            </button>
            <button onClick={() => handleNavClick('BLOG')} className="hover:text-indigo-600 transition p-4">
              {language === Language.EN ? 'Travel Blog' : 'Блог Путешествий'}
            </button>
            <button onClick={() => handleNavClick('ADMIN_LOGIN')} className="bg-indigo-600 text-white shadow-lg rounded-xl p-4 flex items-center justify-center w-64 mx-auto">
               <span className="mr-2">🚖</span> {language === Language.EN ? 'Driver Portal' : 'Кабинет Водителя'}
            </button>
          </nav>

          <div className="w-24 h-1 bg-gray-200 rounded-full"></div>

          <div className="flex space-x-6">
              <button 
                onClick={() => toggleLanguage(Language.EN)}
                className={`text-lg font-bold px-6 py-3 rounded-xl border-2 transition-colors ${language === Language.EN ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent text-gray-400'}`}
              >
                  English
              </button>
              <button 
                onClick={() => toggleLanguage(Language.RU)}
                className={`text-lg font-bold px-6 py-3 rounded-xl border-2 transition-colors ${language === Language.RU ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent text-gray-400'}`}
              >
                  Русский
              </button>
          </div>
      </div>
    </header>
  );
};

export default Header;