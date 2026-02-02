
import React from 'react';
import { Search, Info, UserCheck, CalendarCheck, PhoneCall, Heart } from 'lucide-react';

const steps = [
  { id: 1, title: 'Маршрут', desc: 'Укажите точки.', icon: <Search /> },
  { id: 2, title: 'Детали', desc: 'Км и Время.', icon: <Info /> },
  { id: 3, title: 'Водитель', desc: 'Фото и отзывы.', icon: <UserCheck /> },
  { id: 4, title: 'Бронь', desc: 'Без предоплаты.', icon: <CalendarCheck /> },
  { id: 5, title: 'Связь', desc: 'Водитель звонит.', icon: <PhoneCall /> },
  { id: 6, title: 'Поездка', desc: 'Наслаждайтесь!', icon: <Heart /> }
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold text-slate-900">Как это работает</h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">Простой и прозрачный процесс бронирования вашего идеального путешествия.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {steps.map((step) => (
            <div key={step.id} className="relative group text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-slate-50 rounded-3xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-indigo-100 transition-all duration-300 transform group-hover:-translate-y-2">
                {React.cloneElement(step.icon as React.ReactElement<any>, { size: 32 } as any)}
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-slate-100 rounded-xl flex items-center justify-center text-slate-900 font-bold text-sm">
                  {step.id}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">{step.title}</h4>
                <p className="text-slate-500 text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;