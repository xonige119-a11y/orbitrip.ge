
import React from 'react';
import { Language, Booking } from '../types';

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  language: Language;
}

const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({ isOpen, onClose, booking, language }) => {
  if (!isOpen || !booking) return null;

  const isEn = language === Language.EN;

  // --- UNIVERSAL DATA ACCESSOR ---
  // Helps read data whether it comes from Local State (camelCase) or Raw Database (snake_case)
  // This solves the issue of empty fields when the object structure is inconsistent.
  const getField = (keyCamel: keyof Booking, keySnake: string, fallback: string = 'N/A') => {
      // @ts-ignore - allowing dynamic access for safety against raw objects
      const val = booking[keyCamel] !== undefined ? booking[keyCamel] : booking[keySnake];
      
      if (val === undefined || val === null || val === '') return fallback;
      return String(val);
  };

  const id = getField('id', 'id', 'NEW');
  const displayId = id.length > 8 ? id.slice(-6).toUpperCase() : id;
  
  const tourTitle = getField('tourTitle', 'tour_title', isEn ? 'Custom Trip' : 'Поездка');
  const date = getField('date', 'date', 'N/A');
  const customerName = getField('customerName', 'customer_name', isEn ? 'Guest' : 'Гость');
  const totalPrice = getField('totalPrice', 'total_price', '0 GEL');

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Background Overlay - CLICK DISABLED to prevent accidental closing */}
        <div 
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm transition-opacity" 
            aria-hidden="true" 
            // onClick removed to enforce button click
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal Panel */}
        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full relative">
          
          {/* Decorative Header */}
          <div className="bg-emerald-500 h-32 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-md shadow-inner animate-bounce">
                <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
          </div>

          <div className="px-6 pt-8 pb-6">
            <div className="text-center">
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  {isEn ? 'Booking Received!' : 'Заявка Принята!'}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                    {isEn 
                     ? "Your request has been successfully sent to the driver."
                     : "Ваш запрос успешно отправлен водителю."}
                </p>

                {/* Booking Details Card */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-left relative shadow-sm">
                    {/* ID Badge */}
                    <div className="absolute -top-3 right-4 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md tracking-wider">
                        #{displayId}
                    </div>

                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-start border-b border-gray-200 pb-3 border-dashed">
                            <span className="text-gray-400 font-medium text-xs uppercase tracking-wide mt-1">{isEn ? 'Route' : 'Маршрут'}</span>
                            <span className="font-bold text-gray-800 text-right max-w-[60%] leading-tight">{tourTitle}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-3 border-dashed">
                            <span className="text-gray-400 font-medium text-xs uppercase tracking-wide">{isEn ? 'Date' : 'Дата'}</span>
                            <span className="font-bold text-gray-800">{date}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-3 border-dashed">
                            <span className="text-gray-400 font-medium text-xs uppercase tracking-wide">{isEn ? 'Name' : 'Имя'}</span>
                            <span className="font-bold text-gray-800">{customerName}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-gray-400 font-medium text-xs uppercase tracking-wide">{isEn ? 'Total' : 'Итого'}</span>
                            <span className="font-black text-emerald-600 text-xl">{totalPrice}</span>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 flex items-start gap-3 bg-blue-50 p-4 rounded-xl text-left border border-blue-100">
                     <span className="text-2xl">📱</span>
                     <div>
                        <p className="text-xs font-bold text-blue-800 mb-1">
                            {isEn ? "What's Next?" : "Что дальше?"}
                        </p>
                        <p className="text-xs text-blue-600 leading-relaxed">
                            {isEn 
                            ? "The driver will contact you via WhatsApp/Phone shortly to confirm the details."
                            : "Водитель свяжется с вами по WhatsApp или телефону в ближайшее время для подтверждения."}
                        </p>
                     </div>
                </div>

            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-lg px-4 py-3 bg-gray-900 text-sm font-bold text-white hover:bg-black focus:outline-none transition transform active:scale-95"
              onClick={handleClose}
            >
              {isEn ? 'Return to Home' : 'На Главную'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessModal;
