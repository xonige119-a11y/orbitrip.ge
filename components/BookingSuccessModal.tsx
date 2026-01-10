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

  // Format Booking ID for display (e.g., last 6 chars)
  const displayId = booking.id.slice(-6).toUpperCase();

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Background Overlay */}
        <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" 
            aria-hidden="true" 
            onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal Panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border-t-8 border-emerald-500">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex flex-col items-center">
              
              {/* Success Icon */}
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mb-6 animate-bounce">
                <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div className="text-center w-full">
                <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-2" id="modal-title">
                  {language === Language.EN ? 'Booking Confirmed!' : 'Бронирование Подтверждено!'}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {language === Language.EN 
                    ? 'Your trip request has been successfully received.' 
                    : 'Ваш запрос на поездку успешно получен.'}
                </p>

                {/* Booking Details Card */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-left w-full relative overflow-hidden">
                    {/* ID Badge */}
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        ID: #{displayId}
                    </div>

                    <div className="space-y-3 mt-2">
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span className="text-gray-500 text-sm">{language === Language.EN ? 'Route' : 'Маршрут'}</span>
                            <span className="font-bold text-gray-800 text-sm text-right">{booking.tourTitle}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span className="text-gray-500 text-sm">{language === Language.EN ? 'Date' : 'Дата'}</span>
                            <span className="font-medium text-gray-800 text-sm">{booking.date}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span className="text-gray-500 text-sm">{language === Language.EN ? 'Passenger' : 'Пассажир'}</span>
                            <span className="font-medium text-gray-800 text-sm">{booking.customerName}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-gray-500 text-sm">{language === Language.EN ? 'Total Price' : 'Итого'}</span>
                            <span className="font-extrabold text-emerald-600 text-lg">{booking.totalPrice}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start text-left">
                     <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     <p>
                        {language === Language.EN 
                         ? "We have sent the details to your email. Dato or one of our drivers will contact you via WhatsApp/Phone shortly to confirm details."
                         : "Мы отправили детали на вашу почту. Дато или один из наших водителей скоро свяжется с вами через WhatsApp или по телефону для подтверждения."}
                     </p>
                </div>

              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-3 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              {language === Language.EN ? 'Great, thanks!' : 'Отлично, спасибо!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessModal;