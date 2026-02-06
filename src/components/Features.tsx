
import React from 'react';
import { Eye, ShieldCheck, Map, CreditCard, Droplets, Wifi, Clock, MessageSquare } from 'lucide-react';

const benefits = [
  { Icon: MessageSquare, title: 'Больше, чем просто такси', desc: 'Делаем сервис максимально комфортным. Ценим вашу обратную связь.' },
  { Icon: Eye, title: 'Взгляд изнутри', desc: 'Увидите страну глазами местных жителей, которые знают каждый уголок.' },
  { Icon: CreditCard, title: 'Точная цена заранее', desc: 'Стоимость поездки известна сразу и не изменится в процессе.' },
  { Icon: Clock, title: 'Остановки без доплат', desc: 'Останавливайтесь для фото или кофе где угодно абсолютно бесплатно.' },
  { Icon: Droplets, title: 'Вода и детское кресло', desc: 'Даем больше сервиса, чем вы рассчитывали. Безопасность превыше всего.' },
  { Icon: Map, title: 'Маршруты до 10 дней', desc: 'Спланируйте свободные часы или многодневное пребывание в горах.' },
  { Icon: ShieldCheck, title: 'Надежные водители', desc: 'Проводим тренинги для повышения квалификации наших партнеров.' },
  { Icon: Wifi, title: 'Автомобили с WI-FI', desc: 'Подберите авто с интернетом для мгновенных сториз из самых красивых мест.' }
];

const Features: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((b, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                {React.createElement(b.Icon, { size: 28 } as any)}
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3 leading-snug">{b.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
