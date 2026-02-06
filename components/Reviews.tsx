
import React from 'react';
import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../constants';

const Reviews: React.FC = () => {
  return (
    <section id="reviews" className="py-24 bg-slate-900 overflow-hidden relative">
      <Quote className="absolute -top-12 -left-12 w-64 h-64 text-white/[0.03]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold text-white">Отзывы Туристов</h2>
          <p className="text-slate-400">Нам доверяют тысячи путешественников со всего мира.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[2.5rem] relative group hover:bg-white/10 transition-colors">
              <div className="flex text-amber-400 mb-6">
                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
              </div>
              <p className="text-lg text-slate-200 italic mb-8 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-4 border-t border-white/10 pt-8">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/30">
                  {t.initial}
                </div>
                <div>
                  <h5 className="font-bold text-white text-lg">{t.author}</h5>
                  <p className="text-sm text-slate-500">Верифицированный клиент</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
