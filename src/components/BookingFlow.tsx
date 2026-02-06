
import React, { useState, useEffect } from 'react';
import { Star, User, Languages, Check, MapPin, Sparkles, MessageSquare } from 'lucide-react';
import { MOCK_DRIVERS } from '../constants';
import { getTravelAdvice } from '../services/geminiService';
import { RouteInfo, Driver } from '../types';

interface BookingFlowProps {
  route: RouteInfo | null;
}

const BookingFlow: React.FC<BookingFlowProps> = ({ route }) => {
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [advice, setAdvice] = useState<{ place: string, description: string }[]>([]);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    if (route) {
      setLoadingAdvice(true);
      setAdvice([]); // Clear previous advice
      getTravelAdvice(route.from, route.to).then(res => {
        setAdvice(res.suggestions);
        setLoadingAdvice(false);
      });
    }
  }, [route]);

  if (!route) return null;

  const handleBooking = (driver: Driver) => {
    setSelectedDriver(driver.id);
    setBooked(true);
  };

  if (booked) {
    const driver = MOCK_DRIVERS.find(d => d.id === selectedDriver);
    return (
      <section id="booking-flow" className="py-20 bg-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/50">
            <Check size={48} />
          </div>
          <h2 className="text-4xl font-bold">Успешно забронировано!</h2>
          <p className="text-xl text-indigo-200">
            {driver?.name} свяжется с вами по указанному в профиле номеру в ближайшее время для подтверждения деталей маршрута из {route.from} в {route.to}.
          </p>
          <div className="bg-white/10 p-6 rounded-3xl border border-white/20 inline-block">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-300 mb-2">Детали заказа</p>
            <p className="text-2xl font-bold">{route.date} • {route.from} → {route.to}</p>
          </div>
          <div>
             <button onClick={() => setBooked(false)} className="underline text-indigo-300 hover:text-white transition-colors">Выбрать другого водителя</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking-flow" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="flex-1 space-y-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Доступные водители</h2>
                <p className="text-slate-500">Маршрут: {route.from} → {route.to} на {route.date}</p>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-sm font-bold text-indigo-600 block">≈ 160 км</span>
                <span className="text-xs text-slate-400">~2 ч 45 мин</span>
              </div>
            </div>

            <div className="space-y-6">
              {MOCK_DRIVERS.map((driver) => (
                <div key={driver.id} className="bg-white border-2 border-slate-100 rounded-3xl p-6 hover:border-indigo-500 transition-all group relative">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="relative">
                      <img src={driver.photoUrl} alt={driver.name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-lg" />
                      <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs">
                        {driver.rating}
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            {driver.name}
                            <span className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Math.floor(driver.rating) ? 'currentColor' : 'none'} />)}
                            </span>
                          </h4>
                          <p className="text-slate-500 font-medium">{driver.carModel}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-extrabold text-indigo-900">₾ {driver.basePrice * 3 /* Estimation for demo */}</div>
                          <div className="text-xs font-bold text-slate-400 uppercase">Все включено</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                          <Languages size={14} />
                          {driver.languages.join(', ')}
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                          <User size={14} />
                          {driver.reviewCount} отзывов
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {driver.features.map(f => (
                          <span key={f} className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleBooking(driver)}
                    className="w-full sm:w-auto mt-6 sm:mt-0 sm:absolute sm:bottom-6 sm:right-6 bg-slate-900 hover:bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold transition-all"
                  >
                    Забронировать
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-96 space-y-6">
            <div className="bg-indigo-600 text-white rounded-3xl p-8 shadow-xl shadow-indigo-100 relative overflow-hidden">
              <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-white/10 rotate-12" />
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles size={20} />
                Советы по маршруту
              </h3>
              
              {loadingAdvice ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-white/20 rounded w-3/4"></div>
                  <div className="h-4 bg-white/20 rounded w-1/2"></div>
                </div>
              ) : advice.length > 0 ? (
                <div className="space-y-6">
                  {advice.map((item, idx) => (
                    <div key={idx} className="relative pl-6 border-l-2 border-white/20">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                      </div>
                      <h5 className="font-bold text-indigo-50">{item.place}</h5>
                      <p className="text-sm text-indigo-100 leading-relaxed mt-1">{item.description}</p>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs font-medium text-indigo-200 uppercase tracking-widest">Powered by Gemini AI</p>
                  </div>
                </div>
              ) : (
                <p className="text-indigo-100">Не удалось загрузить рекомендации для этого маршрута или список пуст.</p>
              )}
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MessageSquare size={20} className="text-indigo-600" />
                Почему OrbiTrip?
              </h3>
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <Check size={12} />
                  </div>
                  <span>Оплата наличными водителю в конце поездки</span>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <Check size={12} />
                  </div>
                  <span>Никаких скрытых платежей за парковки и платные дороги</span>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <Check size={12} />
                  </div>
                  <span>Проверенные водители с реальными отзывами</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BookingFlow;
