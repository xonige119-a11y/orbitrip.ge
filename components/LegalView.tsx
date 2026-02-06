
import React from 'react';
import { Language } from '../types';

interface LegalViewProps {
  type: 'TERMS' | 'PRIVACY';
  language: Language;
  onBack: () => void;
}

const LegalView: React.FC<LegalViewProps> = ({ type, language, onBack }) => {
  const isEn = language === Language.EN;

  const renderTerms = () => (
    <div className="prose prose-indigo max-w-none text-gray-700">
      
      {/* --- DISCLAIMER ALERT: DEMO / PROTOTYPE STATUS --- */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
          <div className="flex items-start">
              <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
              </div>
              <div className="ml-3">
                  <h3 className="text-sm font-bold text-red-800 uppercase">
                      {isEn ? "Prototype / Demo Version Disclaimer" : "Отказ от ответственности: Прототип / Демо-версия"}
                  </h3>
                  <div className="mt-2 text-sm text-red-700 leading-relaxed">
                      <p>
                          {isEn 
                           ? "This website is a non-commercial software prototype designed solely for demonstration and testing purposes. OrbiTrip is NOT a registered business entity and does not conduct financial transactions. All bookings are simulated or arranged directly between private individuals on a voluntary, non-commercial basis. The platform owner bears no financial or legal liability for services rendered."
                           : "Этот веб-сайт является некоммерческим программным прототипом, созданным исключительно для демонстрационных и тестовых целей. OrbiTrip НЕ является зарегистрированным юридическим лицом и не проводит финансовые операции. Все бронирования являются имитацией или осуществляются напрямую между частными лицами на добровольной, некоммерческой основе. Владелец платформы не несет финансовой или юридической ответственности за предоставленные услуги."}
                      </p>
                  </div>
              </div>
          </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">{isEn ? "Terms of Use (Demo)" : "Условия использования (Демо)"}</h2>
      
      {/* 1. Definitions */}
      <h3 className="text-lg font-bold mt-6">{isEn ? "1. Nature of Service" : "1. Суть сервиса"}</h3>
      <p>{isEn 
        ? "1.1. OrbiTrip acts exclusively as an information bulletin board. We do not sell tours, transfer services, or act as a travel agent." 
        : "1.1. OrbiTrip действует исключительно как информационная доска объявлений. Мы не продаем туры, услуги трансфера и не выступаем в качестве туристического агента."}</p>
      <p>{isEn 
        ? "1.2. The platform does not process payments. No funds pass through the platform's accounts." 
        : "1.2. Платформа не обрабатывает платежи. Никакие средства не проходят через счета платформы."}</p>
      <p>{isEn 
        ? "1.3. 'Drivers' listed on the site are independent individuals testing the system functionalities. They are not employees or contractors." 
        : "1.3. «Водители», указанные на сайте, являются независимыми лицами, тестирующими функционал системы. Они не являются сотрудниками или подрядчиками."}</p>

      {/* 2. Liability */}
      <h3 className="text-lg font-bold mt-6">{isEn ? "2. Liability Waiver" : "2. Отказ от ответственности"}</h3>
      <p>{isEn 
        ? "2.1. By using this prototype, you acknowledge that no commercial contract is formed with OrbiTrip. Any arrangement is strictly private between you and the driver." 
        : "2.1. Используя этот прототип, вы признаете, что с OrbiTrip не заключается коммерческий договор. Любая договоренность является строго частной между вами и водителем."}</p>
      <p>{isEn 
        ? "2.2. The platform creators are not liable for any financial losses, accidents, or service failures." 
        : "2.2. Создатели платформы не несут ответственности за любые финансовые потери, несчастные случаи или сбои в обслуживании."}</p>

      {/* 3. Status */}
      <h3 className="text-lg font-bold mt-6">{isEn ? "3. Commercial Status" : "3. Коммерческий статус"}</h3>
      <p>{isEn 
        ? "3.1. This project is currently in the pre-launch phase and does not generate revenue." 
        : "3.1. Данный проект находится на стадии подготовки к запуску и не генерирует прибыль."}</p>
    </div>
  );

  const renderPrivacy = () => (
    <div className="prose prose-indigo max-w-none text-gray-700">
      <h2 className="text-2xl font-bold mb-4">{isEn ? "Data Policy (Demo)" : "Политика данных (Демо)"}</h2>
      
      <p className="mb-4">
        {isEn 
          ? "As a software prototype, we collect minimal data for functionality testing." 
          : "Как программный прототип, мы собираем минимальные данные для тестирования функциональности."}
      </p>

      <h3 className="text-lg font-bold mt-6">{isEn ? "Data Usage" : "Использование данных"}</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>{isEn ? "Data entered (Name, Phone) is used solely to demonstrate the booking flow." : "Введенные данные (Имя, Телефон) используются исключительно для демонстрации процесса бронирования."}</li>
        <li>{isEn ? "No data is sold to third parties." : "Данные не продаются третьим лицам."}</li>
        <li>{isEn ? "We do not store payment information." : "Мы не храним платежную информацию."}</li>
      </ul>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-screen">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition"
      >
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {isEn ? "Back to Home" : "На главную"}
      </button>

      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100">
        {type === 'TERMS' ? renderTerms() : renderPrivacy()}
      </div>
    </div>
  );
};

export default LegalView;
