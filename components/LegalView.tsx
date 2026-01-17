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
      <h2 className="text-2xl font-bold mb-4">{isEn ? "Standard Terms of Service" : "Стандартные условия предоставления услуг"}</h2>
      
      {/* 1. Definitions */}
      <h3 className="text-lg font-bold mt-6">{isEn ? "1. Definition of Terms" : "1. Определение терминов"}</h3>
      <p>{isEn ? "1.1. Agreement - these rules and conditions posted on the website." : "1.1. Договор - настоящие правила и условия, размещенные на веб-сайте."}</p>
      <p>{isEn 
        ? "1.2. Platform Operator - OrbiTrip (hereinafter 'The Platform'), which provides information society services allowing Tour Operators (Drivers) and Passengers to connect. The Platform Operator IS NOT a transportation carrier, does not rent vehicles personally, and is not a party to the transportation contract." 
        : "1.2. Оператор платформы - OrbiTrip (далее «Платформа»), который предоставляет информационные услуги, позволяющие Туроператорам (Водителям) и Пассажирам связываться друг с другом. Оператор платформы НЕ ЯВЛЯЕТСЯ перевозчиком, лично не арендует автомобили и не является стороной договора перевозки;"}</p>
      <p>{isEn 
        ? "1.3. Passenger - a physical or legal person connected to a Tour Operator via the Platform." 
        : "1.3. Пассажир - физическое или юридическое лицо, подключенное к туроператору через Платформу;"}</p>
      <p>{isEn 
        ? "1.4. Tour Operator (Driver) - an independent contractor providing transportation services using their own vehicle." 
        : "1.4. Туроператор (Водитель) - независимый подрядчик, предоставляющий транспортные услуги на собственном автомобиле."}</p>
      <p>{isEn ? "1.6. Website - orbitrip.ge;" : "1.6. Веб-сайт - orbitrip.ge;"}</p>
      <p>{isEn ? "1.7. Services - information services offered by the Platform to facilitate booking." : "1.7. Услуги - информационные услуги, предлагаемые Платформой для упрощения бронирования."}</p>
      
      {/* 2. Subject */}
      <h3 className="text-lg font-bold mt-6">{isEn ? "2. Subject of the Agreement" : "2. Предмет договора"}</h3>
      <p>{isEn 
        ? "2.1. The Platform acts exclusively as an intermediary marketplace. We connect travelers with independent local drivers." 
        : "2.1. Платформа действует исключительно как посредническая торговая площадка (маркетплейс). Мы соединяем путешественников с независимыми местными водителями;"}</p>
      <p>{isEn ? "2.3. The Platform Operator does not own vehicles and acts only as an agent for data processing." : "2.3. Оператор платформы не владеет транспортными средствами и действует только как агент по обработке данных;"}</p>
      <p>{isEn ? "2.4. Quality, safety, legality, and technical condition of vehicles are the sole responsibility of the Driver." : "2.4. Качество, безопасность, законность и техническое состояние транспортных средств являются исключительной ответственностью Водителя;"}</p>

      {/* 3. Contract Conclusion */}
      <h3 className="text-lg font-bold mt-6">{isEn ? "3. Limitation of Liability" : "3. Ограничение ответственности"}</h3>
      <p>{isEn 
        ? "3.1. OrbiTrip is NOT liable for any direct, indirect, incidental, or consequential damages resulting from the use of the service, including but not limited to car accidents, delays, or missed flights." 
        : "3.1. OrbiTrip НЕ несет ответственности за любой прямой, косвенный, случайный или последующий ущерб, возникший в результате использования сервиса, включая, помимо прочего, автомобильные аварии, задержки или опоздания на рейсы;"}</p>
      <p>{isEn ? "3.2. All transportation services are provided directly by the Driver to the Passenger. A separate contract is formed between Driver and Passenger upon pickup." : "3.2. Все транспортные услуги предоставляются непосредственно Водителем Пассажиру. Отдельный договор заключается между Водителем и Пассажиром в момент посадки;"}</p>
      <p>{isEn ? "3.3. Drivers are NOT employees of OrbiTrip. They are independent partners." : "3.3. Водители НЕ являются сотрудниками OrbiTrip. Они являются независимыми партнерами;"}</p>

      {/* 4. Rights and Obligations */}
      <h3 className="text-lg font-bold mt-6">{isEn ? "4. Cancellation & Refunds" : "4. Отмена и возврат средств"}</h3>
      <div className="space-y-4">
        <div>
            <strong className="block mb-1">{isEn ? "4.1. Free Cancellation:" : "4.1. Бесплатная отмена:"}</strong>
            <ul className="list-disc pl-5 text-sm space-y-1">
                <li>{isEn ? "Passengers can cancel for free up to 24 hours before the trip." : "Пассажиры могут бесплатно отменить поездку за 24 часа до ее начала."}</li>
                <li>{isEn ? "In case of late cancellation, the Platform reserves the right to charge a fee." : "В случае поздней отмены Платформа оставляет за собой право взимать комиссию."}</li>
            </ul>
        </div>
      </div>

      {/* 5. Dispute Resolution */}
      <h3 className="text-lg font-bold mt-6">{isEn ? "5. Governing Law" : "5. Применимое право"}</h3>
      <p>{isEn ? "5.1. These terms are governed by the laws of Georgia." : "5.1. Настоящие условия регулируются законодательством Грузии."}</p>
      <p>{isEn ? "5.2. Any disputes regarding the Platform's software shall be resolved in Tbilisi City Court." : "5.2. Любые споры, касающиеся программного обеспечения Платформы, решаются в Тбилисском городском суде."}</p>
    </div>
  );

  const renderPrivacy = () => (
    <div className="prose prose-indigo max-w-none text-gray-700">
      <h2 className="text-2xl font-bold mb-4">{isEn ? "Privacy Policy" : "Политика конфиденциальности"}</h2>
      
      <p className="mb-4">
        {isEn 
          ? "This website orbitrip.ge (hereinafter 'Platform') values your privacy. This policy explains how we handle your data." 
          : "Этот веб-сайт orbitrip.ge (далее «Платформа») ценит вашу конфиденциальность. Эта политика объясняет, как мы обрабатываем ваши данные."}
      </p>

      <h3 className="text-lg font-bold mt-6">{isEn ? "What data do we collect?" : "Какие данные мы собираем?"}</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>{isEn ? "Contact info (Name, Phone, Email) for booking facilitation." : "Контактная информация (Имя, Телефон, Email) для оформления бронирования."}</li>
        <li>{isEn ? "Trip details (Route, Date, Passengers)." : "Детали поездки (Маршрут, Дата, Пассажиры)."}</li>
        <li>{isEn ? "We DO NOT store credit card details. Payments are processed securely by third-party providers." : "Мы НЕ храним данные кредитных карт. Платежи обрабатываются безопасными сторонними провайдерами."}</li>
      </ul>

      <h3 className="text-lg font-bold mt-6">{isEn ? "Data Sharing" : "Передача данных"}</h3>
      <p>{isEn ? "We share your contact details (Name, Phone) ONLY with the assigned Driver to enable communication for pickup." : "Мы передаем ваши контактные данные (Имя, Телефон) ТОЛЬКО назначенному Водителю для связи при встрече."}</p>

      <h3 className="text-lg font-bold mt-6">{isEn ? "Contact" : "Контакты"}</h3>
      <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="font-bold">OrbiTrip Support</p>
          <p className="text-indigo-600 font-bold">support@orbitrip.ge</p>
          <p>{isEn ? "Tbilisi, Georgia" : "Тбилиси, Грузия"}</p>
      </div>
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