import React from 'react';
import { Language } from '../types';

interface ContactSectionProps {
  language: Language;
}

const ContactSection: React.FC<ContactSectionProps> = ({ language }) => {
  return (
    <div id="contact" className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-indigo-700 rounded-2xl shadow-xl overflow-hidden lg:grid lg:grid-cols-2 lg:gap-4">
          <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
            <div className="lg:self-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                <span className="block">{language === Language.EN ? "Found us via Booklet?" : "Нашли нас через буклет?"}</span>
                <span className="block text-indigo-200 mt-2">
                    {language === Language.EN ? "Get 20% OFF with Promo Code!" : "Получите скидку 20% с промокодом!"}
                </span>
              </h2>
              <p className="mt-4 text-lg leading-6 text-indigo-100">
                {language === Language.EN 
                  ? "Select a tour or transfer, click 'Book', and enter the code from your booklet to get a 20% discount instantly."
                  : "Выберите тур или трансфер, нажмите «Забронировать» и введите код из буклета, чтобы мгновенно получить скидку 20%."}
              </p>
              <div className="mt-8 flex space-x-4">
                  <div className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white">
                     {language === Language.EN ? "Book & Save Now" : "Забронировать со скидкой"}
                  </div>
              </div>
            </div>
          </div>
          <div className="relative -mt-6 aspect-w-5 aspect-h-3 md:aspect-w-2 md:aspect-h-1 lg:aspect-none lg:mt-0 lg:flex lg:items-center">
             <div className="relative w-full h-full min-h-[300px] bg-indigo-800 flex items-center justify-center p-8">
                <div className="text-center">
                    <p className="text-indigo-300 text-sm uppercase tracking-wider mb-2">
                        {language === Language.EN ? "Meeting Point" : "Место встречи"}
                    </p>
                    <p className="text-white text-xl font-bold">
                        {language === Language.EN ? "Kutaisi International Airport (KUT)" : "Международный аэропорт Кутаиси (KUT)"}
                    </p>
                    <div className="mt-6 border border-indigo-500 rounded-lg p-3 bg-indigo-900/50">
                        <p className="text-xs text-indigo-300 uppercase mb-1">{language === Language.EN ? "Special Offer" : "Специальное предложение"}</p>
                        <p className="text-white font-bold text-lg">PROMO: -20%</p>
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