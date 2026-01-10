import React from 'react';
import { Language } from '../types';

interface HomeLandingProps {
  language: Language;
  onRouteSelect: (from: string, to: string) => void;
  onTourSelect: (id: string) => void;
}

const HomeLanding: React.FC<HomeLandingProps> = ({ language, onRouteSelect, onTourSelect }) => {
  const isEn = language === Language.EN;

  const BENEFITS = [
    { 
        titleEn: "No Deposit", titleRu: "Без залога",
        descEn: "Book now, pay later", descRu: "Бронь сейчас, оплата потом",
        icon: "🛡️"
    },
    { 
        titleEn: "Free Water", titleRu: "Вода бесплатно",
        descEn: "For every passenger", descRu: "Каждому пассажиру",
        icon: "💧"
    },
    { 
        titleEn: "Free Waiting", titleRu: "Бесплатное ожидание",
        descEn: "We wait as long as needed", descRu: "Ждем сколько потребуется",
        icon: "⏳"
    },
    { 
        titleEn: "Photo Stops", titleRu: "Фото-остановки",
        descEn: "Unlimited & free", descRu: "Неограниченно и бесплатно",
        icon: "📸"
    }
  ];

  return (
    <div className="bg-white">
      
      {/* BENEFITS BAR */}
      <div className="bg-white py-12 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
              {BENEFITS.map((b, i) => (
                  <div key={i} className="flex flex-col items-center text-center group">
                      <div className="text-4xl mb-4 transform group-hover:scale-110 transition duration-300 bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center">{b.icon}</div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{isEn ? b.titleEn : b.titleRu}</h3>
                      <p className="text-gray-500 text-sm">{isEn ? b.descEn : b.descRu}</p>
                  </div>
              ))}
          </div>
      </div>

      {/* TRUST INDICATORS */}
      <div className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-3xl font-black text-gray-900 mb-6">
                  {isEn ? "Thousands of happy travelers" : "Тысячи довольных путешественников"}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
                  {[
                      { num: "50k+", label: "Trips Completed" },
                      { num: "4.9/5", label: "Average Rating" },
                      { num: "500+", label: "Vetted Drivers" },
                      { num: "24/7", label: "Support" }
                  ].map((stat, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                          <div className="text-3xl font-black text-indigo-600 mb-1">{stat.num}</div>
                          <div className="text-sm font-bold text-gray-500 uppercase tracking-wide">{stat.label}</div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

    </div>
  );
};

export default HomeLanding;