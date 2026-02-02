
import React, { useState } from 'react';
import { MapPin, Calendar, ArrowRight, Droplets, Clock, Zap, Camera, Car } from 'lucide-react';
import { CITIES } from '../constants';

interface HeroProps {
  onSearch: (from: string, to: string, date: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onSearch }) => {
  const [from, setFrom] = useState('Tbilisi');
  const [to, setTo] = useState('Batumi');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(from, to, date);
    // Add a small delay to ensure the BookingFlow component is mounted before scrolling
    setTimeout(() => {
      const flowSection = document.getElementById('booking-flow');
      if (flowSection) flowSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80&w=2000" 
          alt="Tbilisi View" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-slate-50"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <MapPin size={18} className="text-indigo-400" />
              <span className="text-sm font-semibold tracking-wide uppercase">📍 Tbilisi, Georgia</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
              Трансферы по <span className="text-indigo-400 underline decoration-indigo-400/30">Грузии</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 font-medium max-w-xl leading-relaxed">
              Заказ напрямую у местных водителей. Без залога, с бесплатной отменой и лучшим сервисом.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              {[
                { icon: <Droplets className="text-blue-400" />, label: 'Вода', sub: 'Бесплатно' },
                { icon: <Clock className="text-amber-400" />, label: 'Ожидание', sub: 'Безлимитно' },
                { icon: <Camera className="text-green-400" />, label: 'Остановки', sub: 'Любое кол-во' },
                { icon: <Zap className="text-indigo-400" />, label: 'Цена', sub: 'Фиксирована' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-2xl text-center">
                  <div className="flex justify-center mb-1">{item.icon}</div>
                  <div className="text-sm font-bold">{item.label}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                <Car size={20} />
              </div>
              Забронировать поездку
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">Откуда</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" size={20} />
                  <select 
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:ring-0 transition-all text-lg font-medium outline-none appearance-none"
                  >
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">Куда</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" size={20} />
                  <select 
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:ring-0 transition-all text-lg font-medium outline-none appearance-none"
                  >
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">Дата поездки</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" size={20} />
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-600 focus:ring-0 transition-all text-lg font-medium outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-xl hover:shadow-indigo-200 mt-6"
              >
                Подобрать водителя
                <ArrowRight size={24} />
              </button>
            </form>
            
            <p className="text-center text-slate-400 text-sm mt-6 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Никакой предоплаты не требуется
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;