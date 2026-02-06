
import React from 'react';
import { OFFERS } from '../constants';

const Offers: React.FC = () => {
  return (
    <section id="offers" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-slate-900">Предложения для вас</h2>
            <p className="text-xl text-slate-500 max-w-xl">Уникальные пакеты услуг, созданные специально под ваши потребности.</p>
          </div>
          <button className="text-indigo-600 font-bold hover:underline flex items-center gap-2">
            Все туры
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {OFFERS.map((offer) => (
            <div key={offer.id} className="group cursor-pointer bg-slate-50 rounded-[2.5rem] p-8 border-2 border-transparent hover:border-indigo-100 hover:bg-white transition-all duration-300">
              <div className="text-4xl mb-6 transform group-hover:scale-125 transition-transform duration-300 inline-block">{offer.icon}</div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-500">{offer.category}</span>
                <h4 className="text-2xl font-bold text-slate-900">{offer.title}</h4>
                <p className="text-slate-500 leading-relaxed">{offer.description}</p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-indigo-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-transform">
                Подробнее
                <span className="text-xl">›</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Offers;
