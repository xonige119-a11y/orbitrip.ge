
import React from 'react';
import { Language } from '../types';

interface HomeLandingProps {
  language: Language;
  onRouteSelect: (from: string, to: string) => void;
  onTourSelect: (id: string) => void;
}

const HomeLanding: React.FC<HomeLandingProps> = ({ language, onRouteSelect, onTourSelect }) => {
  const isEn = language === Language.EN;

  const CORE_BENEFITS = [
    { 
        titleEn: "No Deposit", titleRu: "Без залога",
        descEn: "Free cancellation", descRu: "Бесплатная отмена",
        icon: "💸"
    },
    { 
        titleEn: "Free Water", titleRu: "Вода",
        descEn: "Included", descRu: "Бесплатно",
        icon: "💧"
    },
    { 
        titleEn: "Free Waiting", titleRu: "Ожидание",
        descEn: "Unlimited", descRu: "Безлимитно",
        icon: "🕒"
    },
    { 
        titleEn: "Stops", titleRu: "Остановки",
        descEn: "Unlimited", descRu: "Любое кол-во",
        icon: "📸"
    }
  ];

  const HOW_IT_WORKS_STEPS = [
      { num: "1", titleEn: "Choose Route", titleRu: "Маршрут", descEn: "Start & End points.", descRu: "Укажите точки." },
      { num: "2", titleEn: "See Details", titleRu: "Детали", descEn: "Distance & Time.", descRu: "Км и Время." },
      { num: "3", titleEn: "Pick Driver", titleRu: "Водитель", descEn: "Photos & Reviews.", descRu: "Фото и отзывы." },
      { num: "4", titleEn: "Book", titleRu: "Бронь", descEn: "No prepayment.", descRu: "Без предоплаты." },
      { num: "5", titleEn: "Connect", titleRu: "Связь", descEn: "Driver calls you.", descRu: "Водитель звонит." },
      { num: "6", titleEn: "Ride", titleRu: "Поездка", descEn: "Enjoy Georgia!", descRu: "Наслаждайтесь!" },
  ];

  const DETAILED_FEATURES = [
      { titleEn: "Inside View", titleRu: "Взгляд изнутри", descEn: "See Georgia through local eyes.", descRu: "Увидите страну глазами местных жителей." },
      { titleEn: "Exact Price", titleRu: "Точная цена заранее", descEn: "No hidden fees.", descRu: "Стоимость поездки известна сразу и не изменится." },
      { titleEn: "Free Stops", titleRu: "Остановки без доплат", descEn: "Stop anywhere you want.", descRu: "Останавливайтесь где угодно бесплатно." },
      { titleEn: "Free Water & Seats", titleRu: "Вода и детское кресло", descEn: "Comfort included.", descRu: "Даем больше сервиса, чем вы рассчитывали." },
      { titleEn: "10 Day Routes", titleRu: "Маршруты до 10 дней", descEn: "Plan long trips.", descRu: "Спланируйте свободные часы или многодневное пребывание." },
      { titleEn: "Trained Drivers", titleRu: "Надежные водители", descEn: "Quality assured.", descRu: "Тренинги для повышения квалификации партнеров." },
      { titleEn: "Passenger Insurance", titleRu: "Страховка пассажиров", descEn: "Safety first.", descRu: "Почти все водители предоставляют страховку." },
      { titleEn: "WiFi Cars", titleRu: "Автомобили с WI-FI", descEn: "Stay connected.", descRu: "Подберите авто с интернетом для мгновенных сториз." },
  ];

  const SUGGESTIONS = [
      { icon: "⏱️", textEn: "Fast Plan", textRu: "Быстрый план" },
      { icon: "⭐", textEn: "Premium", textRu: "Премиум" },
      { icon: "🗺️", textEn: "Long Trips", textRu: "Долгие туры" },
      { icon: "👨‍👩‍👧‍👦", textEn: "Family", textRu: "Для семьи" },
      { icon: "👑", textEn: "History", textRu: "История" },
      { icon: "🎁", textEn: "Gift", textRu: "Подарок" },
      { icon: "❤️", textEn: "Romance", textRu: "Романтика" },
      { icon: "🔄", textEn: "Revisit", textRu: "Повторно" },
  ];

  const REVIEWS_DATA = [
      {
          textEn: "Great experience! The driver was very polite and the car was clean.",
          textRu: "Прекрасный водитель: спокойный, вежливый. Машина чистая.",
          authorEn: "Alexey D.",
          authorRu: "Алексей Д."
      },
      {
          textEn: "Comfortable ride from Kutaisi to Batumi. Driver Dato was punctual.",
          textRu: "Комфортная поездка из Кутаиси в Батуми. Водитель Дато пунктуален.",
          authorEn: "Sarah J.",
          authorRu: "Сара Дж."
      },
      {
          textEn: "Amazing tour to Kazbegi! We had enough time for photos.",
          textRu: "Потрясающий тур в Казбеги! Было много времени для фото.",
          authorEn: "Michael K.",
          authorRu: "Михаил К."
      }
  ];

  return (
    <div className="bg-transparent font-sans text-slate-800">
      
      {/* 1. CORE BENEFITS BAR */}
      <div className="bg-white/95 backdrop-blur-sm py-8 md:py-12 border-b border-gray-100 shadow-sm relative z-10 -mt-4 md:-mt-8 mx-4 md:mx-auto max-w-7xl rounded-3xl md:rounded-none md:shadow-none md:mt-0 md:border-none">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {CORE_BENEFITS.map((b, i) => (
                  <div key={i} className="flex flex-col items-center text-center p-2 md:p-4">
                      <div className="text-3xl md:text-4xl mb-2 md:mb-4 text-emerald-500 drop-shadow-sm">{b.icon}</div>
                      <h3 className="font-bold text-gray-900 text-sm md:text-lg leading-tight mb-1">{isEn ? b.titleEn : b.titleRu}</h3>
                      <p className="text-gray-500 text-xs md:text-sm">{isEn ? b.descEn : b.descRu}</p>
                  </div>
              ))}
          </div>
      </div>

      {/* 2. HOW IT WORKS */}
      <div className="py-12 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-xl my-8 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-white/60">
          <div className="mb-8 md:mb-12 text-center md:text-left">
              <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-2">
                  {isEn ? "How it works" : "Как это работает"}
              </h2>
              <div className="w-16 md:w-24 h-1.5 bg-emerald-500 rounded-full mx-auto md:mx-0"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10 md:gap-x-12 md:gap-y-16 pl-2 md:pl-0">
              {HOW_IT_WORKS_STEPS.map((step, i) => (
                  <div key={i} className="relative group">
                      <div className="text-4xl md:text-6xl font-black text-emerald-100 group-hover:text-emerald-200 transition-colors mb-2 md:mb-4 opacity-100 absolute -top-4 -left-2 md:-top-5 md:-left-4 -z-10">{step.num}</div>
                      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-3">{isEn ? step.titleEn : step.titleRu}</h3>
                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-medium">
                          {isEn ? step.descEn : step.descRu}
                      </p>
                  </div>
              ))}
          </div>
      </div>

      {/* 3. MORE THAN JUST A SERVICE */}
      <div className="bg-gray-100/90 backdrop-blur-md py-12 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-10 md:mb-12 text-center md:text-left">
                  <h2 className="text-xl md:text-4xl font-extrabold text-slate-900 mb-3 leading-tight">
                      {isEn ? "More than just a driver" : "Больше, чем просто такси"}
                  </h2>
                  <div className="w-16 md:w-24 h-1.5 bg-emerald-500 rounded-full mb-4 md:mb-6 mx-auto md:mx-0"></div>
                  <p className="text-xs md:text-sm text-gray-600 max-w-3xl font-medium mx-auto md:mx-0">
                      {isEn 
                        ? "We strive to make your service comfortable. We value feedback." 
                        : "Делаем сервис максимально комфортным. Ценим вашу обратную связь."}
                  </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                  {DETAILED_FEATURES.map((feat, i) => (
                      <div key={i} className="flex items-start">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 mr-3 flex-shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                          <div>
                              <h4 className="font-bold text-gray-900 mb-1 text-sm md:text-base">{isEn ? feat.titleEn : feat.titleRu}</h4>
                              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{isEn ? feat.descEn : feat.descRu}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* 4. OUR SUGGESTION */}
      <div className="py-12 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-xl my-8 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-white/60">
          <div className="mb-8 md:mb-12 text-center md:text-left">
              <h2 className="text-lg md:text-3xl font-extrabold text-slate-900 mb-3">
                  {isEn ? "Offers for you:" : "Предложения для вас:"}
              </h2>
              <div className="w-16 md:w-24 h-1.5 bg-emerald-500 rounded-full mb-4 mx-auto md:mx-0"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-8">
              {SUGGESTIONS.map((sug, i) => (
                  <div key={i} className="flex flex-col items-center md:items-start text-center md:text-left hover:transform hover:scale-105 transition-transform duration-300 p-3 md:p-0 bg-white/50 rounded-xl md:bg-transparent">
                      <div className="text-2xl md:text-4xl text-emerald-600 mb-2 md:mb-3 drop-shadow-sm">{sug.icon}</div>
                      <p className="text-xs md:text-sm font-bold text-gray-700 leading-snug">
                          {isEn ? sug.textEn : sug.textRu}
                      </p>
                  </div>
              ))}
          </div>
      </div>

      {/* 5. REVIEWS */}
      <div className="bg-white/95 backdrop-blur-md py-12 md:py-16 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8 md:mb-10 text-center md:text-left">
                  <div className="w-16 md:w-24 h-1.5 bg-emerald-500 rounded-full mb-4 mx-auto md:mx-0"></div>
                  <h2 className="text-xl md:text-3xl font-extrabold text-slate-900">
                      {isEn ? "Tourist Reviews" : "Отзывы Туристов"}
                  </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {REVIEWS_DATA.map((review, i) => (
                      <div key={i} className="bg-gray-50/80 p-6 md:p-8 border border-gray-100 shadow-lg rounded-3xl hover:shadow-xl transition-shadow">
                          <div className="flex text-yellow-400 text-xs md:text-sm mb-3">★★★★★</div>
                          <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-4 italic">
                              "{isEn ? review.textEn : review.textRu}"
                          </p>
                          <div className="flex items-center mt-auto">
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600 mr-3 text-xs md:text-sm">
                                  {isEn ? review.authorEn.charAt(0) : review.authorRu.charAt(0)}
                              </div>
                              <p className="text-xs md:text-sm font-bold text-gray-900">
                                  {isEn ? review.authorEn : review.authorRu}
                              </p>
                          </div>
                      </div>
                  ))}
              </div>
              
              {/* Instagram Promo */}
              <div className="mt-12 md:mt-16 flex justify-center md:justify-start">
                  <a href="https://instagram.com/orbitrip.ge" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-3 md:px-6 md:py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-xs md:text-base">
                      <span className="text-xl md:text-2xl">📷</span>
                      <span>{isEn ? "Follow on Instagram" : "Мы в Instagram"}</span>
                  </a>
              </div>
          </div>
      </div>
    </div>
  );
};

export default HomeLanding;
