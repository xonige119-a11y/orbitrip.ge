
import React from 'react';
import { Language, SystemSettings } from '../types';

interface FooterProps {
  language: Language;
  settings: SystemSettings | null;
  onNavigate: (view: string, path: string) => void;
}

const Footer: React.FC<FooterProps> = ({ language, settings, onNavigate }) => {
  const isEn = language === Language.EN;
  const year = new Date().getFullYear();

  // --- DYNAMIC DATA FROM DB (With Fallbacks) ---
  const phone = settings?.adminPhoneNumber || '995593456876';
  const email = 'support@orbitrip.ge'; 
  
  // Logic: Use DB setting if exists, otherwise fallback to official pages so icons are always visible for users
  const fbLink = settings?.socialFacebook || 'https://facebook.com/orbitrip.ge';
  const igLink = settings?.socialInstagram || 'https://instagram.com/orbitrip.ge';

  return (
    <footer className="bg-[#0f172a] text-slate-400 font-sans pt-10 md:pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Adjusted grid gap for mobile (gap-8) vs desktop (gap-12) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12 md:mb-16">
          
          {/* 1. BRAND, DESCRIPTION & SOCIALS */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('HOME', '/')}>
                <span className="text-2xl font-black text-white tracking-tight leading-none">
                    ORBI<span className="text-indigo-500">TRIP</span>
                </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs text-slate-500">
              {isEn 
                ? "Your trusted platform for private transfers and tours in Georgia. Verified drivers, fixed prices, and unforgettable experiences." 
                : "Ваша надежная платформа для частных трансферов и туров по Грузии. Проверенные водители, фиксированные цены и незабываемые впечатления."}
            </p>
            
            {/* SOCIAL ICONS (Facebook & Instagram) */}
            <div className="flex gap-4">
                <a 
                    href={fbLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-[#1877F2] transition-colors shadow-lg border border-slate-700"
                    aria-label="Facebook"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                
                <a 
                    href={igLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-[#E1306C] transition-colors shadow-lg border border-slate-700"
                    aria-label="Instagram"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
            </div>
          </div>

          {/* 2. NAVIGATION */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">{isEn ? "Explore" : "Навигация"}</h3>
            <ul className="space-y-4 text-sm">
                <li><button onClick={() => onNavigate('HOME', '/')} className="hover:text-white transition-colors">{isEn ? "Transfers" : "Трансферы"}</button></li>
                <li><button onClick={() => onNavigate('TOURS', '/tours')} className="hover:text-white transition-colors">{isEn ? "Author Tours" : "Авторские Туры"}</button></li>
                <li><button onClick={() => onNavigate('BLOG', '/blog')} className="hover:text-white transition-colors">{isEn ? "Blog & Guides" : "Блог и Гиды"}</button></li>
                <li><button onClick={() => onNavigate('DRIVER_REGISTRATION', '/drive-with-us')} className="hover:text-emerald-400 transition-colors">{isEn ? "Become a Driver" : "Стать Водителем"}</button></li>
            </ul>
          </div>

          {/* 3. LEGAL */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">{isEn ? "Legal" : "Информация"}</h3>
            <ul className="space-y-4 text-sm">
                <li><button onClick={() => onNavigate('LEGAL_TERMS', '/terms')} className="hover:text-white transition-colors">{isEn ? "Terms of Service" : "Условия использования"}</button></li>
                <li><button onClick={() => onNavigate('LEGAL_PRIVACY', '/privacy')} className="hover:text-white transition-colors">{isEn ? "Privacy Policy" : "Политика конфиденциальности"}</button></li>
                <li><button onClick={() => onNavigate('ADMIN_LOGIN', '/admin')} className="hover:text-white transition-colors">{isEn ? "Partner Login" : "Вход для партнеров"}</button></li>
            </ul>
          </div>

          {/* 4. CONTACT */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">{isEn ? "Contact Us" : "Контакты"}</h3>
            <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                    <span className="text-indigo-500 mt-0.5">📞</span>
                    <div>
                        <p className="text-xs uppercase font-bold text-slate-500 mb-1">{isEn ? "Phone / WhatsApp" : "Телефон / WhatsApp"}</p>
                        <a href={`tel:${phone}`} className="text-white font-mono hover:text-indigo-400 transition-colors">+{phone}</a>
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="text-indigo-500 mt-0.5">✉️</span>
                    <div>
                        <p className="text-xs uppercase font-bold text-slate-500 mb-1">{isEn ? "Email Support" : "Эл. почта"}</p>
                        <a href={`mailto:${email}`} className="text-white font-mono hover:text-indigo-400 transition-colors">{email}</a>
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="text-indigo-500 mt-0.5">📍</span>
                    <div>
                        <p className="text-xs uppercase font-bold text-slate-500 mb-1">{isEn ? "HQ Location" : "Офис"}</p>
                        <span className="text-white">Tbilisi, Georgia</span>
                    </div>
                </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
            <p>© {year} OrbiTrip Georgia. {isEn ? "All rights reserved." : "Все права защищены."}</p>
            <div className="flex gap-6">
                <span className="text-emerald-400 font-bold">v2.8.0 (Smart Logistics & AI)</span>
            </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
