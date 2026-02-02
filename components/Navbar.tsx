
import React, { useState, useEffect } from 'react';
import { Menu, X, Car, Phone } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${isScrolled ? 'bg-indigo-600 text-white' : 'bg-white/20 backdrop-blur-md text-white'}`}>
              <Car size={24} />
            </div>
            <span className={`text-2xl font-bold tracking-tight ${isScrolled ? 'text-indigo-900' : 'text-white'}`}>
              ORBITRIP
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className={`font-medium transition-colors ${isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white/90 hover:text-white'}`}>Как это работает</a>
            <a href="#offers" className={`font-medium transition-colors ${isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white/90 hover:text-white'}`}>Предложения</a>
            <a href="#reviews" className={`font-medium transition-colors ${isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white/90 hover:text-white'}`}>Отзывы</a>
            <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-lg hover:shadow-indigo-200">
              <Phone size={18} />
              <span>Стать Водителем</span>
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`${isScrolled ? 'text-slate-900' : 'text-white'}`}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white absolute top-full left-0 right-0 shadow-xl border-t animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-4 pb-6 space-y-4">
            <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-slate-700 p-2 hover:bg-slate-50 rounded">Как это работает</a>
            <a href="#offers" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-slate-700 p-2 hover:bg-slate-50 rounded">Предложения</a>
            <a href="#reviews" onClick={() => setIsMenuOpen(false)} className="block text-lg font-medium text-slate-700 p-2 hover:bg-slate-50 rounded">Отзывы</a>
            <button className="w-full flex justify-center items-center space-x-2 bg-indigo-600 text-white py-3 rounded-xl font-bold">
              <Phone size={20} />
              <span>Стать Водителем</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
