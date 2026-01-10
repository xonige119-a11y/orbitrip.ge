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
        ? "1.2. Platform Operator - GoTrip LLC (ID 405198673), which creates the platform via the website and provides services for Tour Operators and Passengers to communicate. The Platform Operator does not rent vehicles personally and is not a party to the contract between Passenger and Tour Operator." 
        : "1.2. Оператор платформы - ООО \"Гоутрип\" (И/N 405198673), которое создает платформу через веб-сайт и предоставляет пользователям соответствующие услуги для того, чтобы туроператор и пассажир могли общаться друг с другом. Оператор платформы лично не арендует автомобиль и не предоставляет никаких дополнительных услуг, кроме сервиса платформы, он не является участником договорных отношений между пассажиром и туроператором;"}</p>
      <p>{isEn 
        ? "1.3. Passenger - a physical or legal person connected to a Tour Operator via the Platform Operator's website." 
        : "1.3. Пассажир - физическое или юридическое лицо, подключенное к туроператору через веб-сайт оператора платформы;"}</p>
      <p>{isEn 
        ? "1.5. User - a physical or legal person, including Passengers and Tour Operators, using the website services." 
        : "1.5. Пользователь - физическое или юридическое лицо, в том числе пассажир и туроператор, пользующееся услугами сайта;"}</p>
      <p>{isEn ? "1.6. Website - gotrip.ge, gotrip24.com;" : "1.6. Веб-сайт - gotrip.ge, gotrip24.com;"}</p>
      <p>{isEn ? "1.7. Services - types of services offered by the Platform Operator to Users, defined in Annex No. 1;" : "1.7. Услуги - виды услуг, предлагаемых оператором платформы для пользователей, определенные в Приложении №1;"}</p>
      <p>{isEn ? "1.8. User Email - email address needed for account access, unique and modifiable by the user;" : "1.8. Электронная почта пользователя - адрес электронной почты, один из параметров, необходимых для доступа к учетной записи, который является уникальным и который пользователь имеет возможность определить и изменить;"}</p>
      <p>{isEn ? "1.9. Vehicle - a mechanical vehicle used for transporting people or goods;" : "1.9. Автомобильное транспортное средство (Автомобиль) - это механическое транспортное средство, обычно используемое для перевозки людей или грузов по дороге;"}</p>
      <p>{isEn 
        ? "1.10. Direct Debit - deduction of funds from the User's bank account by the Platform Operator without consent in cases provided by this agreement;" 
        : "1.10. Безакцептное списание денег - в случае, предусмотренном настоящим договором, списание оператором платформы денежных средств с банковского счета/счетов пользователя без согласия владельца банковского счета;"}</p>
      <p>{isEn 
        ? "1.11. Confidential Information - any info known to parties via the website or during the Agreement term regarding terms, transactions, financial status, etc." 
        : "1.11. Конфиденциальная информация - любая информация, которая стала известна сторонам в результате использования веб-сайта и/или в течение срока действия настоящего Договора и которая относится к условиям настоящего Договора и любым другим сделкам и/или соглашениям, вытекающим из сотрудничества сторон, а также информация о деятельности, финансового состояния, сделках, трансакциях и других деловых отношениях сторон (компании/филиалов и т.д.);"}</p>
      <p>{isEn 
        ? "1.12. Force Majeure - unforeseen circumstances preventing performance (disasters, wars, epidemics, etc.)." 
        : "1.12. Непреодолимая сила - непредвиденные обстоятельства, которых не существовало на момент подписания настоящего Договора и возникновение и последствия которых стороны не могли предотвратить и преодолеть; В частности, стихийные бедствия, забастовки, саботаж или другие производственные беспорядки, война, блокада, восстание, землетрясения, оползни, эпидемии, наводнения и другие аналогичные события, которые не находятся под контролем сторон и которые невозможно предотвратить;"}</p>
      <p>{isEn ? "1.13. 1 mile = 1.61 km." : "1.13. 1 миля - равна 1,61 километру для целей определения пробега транспортного средства;"}</p>
      <p>{isEn ? "1.14. 1 day = 24 hours." : "1.14. 1 день- 24 часа."}</p>

      {/* 2. Subject */}
      <h3 className="text-lg font-bold mt-6">{isEn ? "2. Subject of the Agreement" : "2. Предмет договора"}</h3>
      <p>{isEn 
        ? "2.1. The Platform Operator provides services to the User via the website to facilitate communication between Passenger and Tour Operator." 
        : "2.1. Оператор платформы предоставляет услуги пользователю через веб-сайт, чтобы он мог воспользоваться предлагаемыми услугами. Оператор платформы является посредником, который помогает пассажиру и туроператору общаться друг с другом;"}</p>
      <p>{isEn ? "2.2. Service costs are defined by the Platform Operator in Annex No. 1." : "2.2. Стоимость каждой услуги определяется оператором платформы и указана в Приложении №1 к настоящим условиям;"}</p>
      <p>{isEn ? "2.3. The Platform Operator does not own vehicles and has no info on their real condition." : "2.3. Оператор платформы не владеет ни одним из транспортных средств, размещенных на веб-сайте, и не располагает какой-либо дополнительной информацией об их реальном состоянии;"}</p>
      <p>{isEn ? "2.4. Quality, safety, legality, and description compliance are not controlled by the Platform Operator." : "2.4. Качество, безопасность, законность и соответствие с описанием транспортных средств, указанных на веб-сайте, не контролируются оператором платформы;"}</p>
      <p>{isEn ? "2.5. Website info serves to establish contact between users." : "2.5. Информация, размещенная на веб-сайте, служит для установления контакта пользователя с другим пользователем;"}</p>
      <p>{isEn ? "2.6. Users post personal info voluntarily." : "2.6. Любое физическое или юридическое лицо размещает личную информацию на веб-сайте по собственному желанию, исходя из своих собственных интересов;"}</p>
      <p>{isEn 
        ? "2.7. Tour Operators agree their info is public. Bank details and passwords remain confidential." 
        : "2.7. Размещая информацию на веб-сайте, туроператор соглашается с тем, что информация о нем будет открыта и любой пользователь сможет ее просмотреть, в том числе оператор платформы уполномочен предоставлять другим пользователям и любым третьим лицам полис автострахования, размещенный туроператором на веб-сайте (если таковой имеется). Информация о банковских счетах пользователя и пароле его профиля является конфиденциальной информацией, и передавать ее третьим лицам не разрешается;"}</p>
      <p>{isEn ? "2.8. User assumes risks of info dissemination." : "2.8. Пользователь принимает на себя все риски, связанные с распространением информации;"}</p>
      <p>{isEn ? "2.9. Users must verify info before financial transactions." : "2.9. Информация о других пользователях, размещенная на сайте, не имеет юридической силы, пользователь обязан проверить правильность информации перед любой финансовой транзакцией;"}</p>
      <p>{isEn ? "2.10. Platform Operator has access to user info and correspondence." : "2.10. Пользователь осознает и соглашается с тем, что оператор платформы имеет неограниченный доступ к информации, размещенной пользователем на веб-сайте, и личной переписке, проводимой через веб-сайт (в том числе через мобильное приложение)."}</p>

      {/* 3. Contract Conclusion */}
      <h3 className="text-lg font-bold mt-6">{isEn ? "3. Conclusion of Contract between Tour Operator and Passenger" : "3. Заключение договора между туроператором и пассажиром"}</h3>
      <p>{isEn 
        ? "3.1. Parties may conclude a service contract on any terms; Platform Operator is not liable. Prices are determined by parties." 
        : "3.1. Туроператор и пассажир вправе заключить между собой договор об оказании услуг на любых приемлемых для них условиях, за которые оператор платформы ответственности не несет. Они сами определяют цену на услуги, дополнительные услуги и сервисное обслуживание, стоимость которых определяется по соглашению сторон;"}</p>
      <p>{isEn ? "3.2. These terms apply unless otherwise agreed." : "3.2. В дополнение к настоящим условиям отношения между туроператором и пассажиром могут регулироваться договорными правилами, дополнительно определенными туроператором;"}</p>
      <p>{isEn ? "3.3. Standard rules apply by default." : "3.3. Если между туроператором и пассажиром нет иного соглашения, между ними применяются правила, предусмотренные настоящими условиями;"}</p>
      <p>{isEn ? "3.4. Tour Operator posts service costs via website." : "3.4. Через веб-сайт туроператор размещает стоимость своих услуг по конкретным маршрутам. Услуги могут включать в себя услуги по транспортировке, и/или услуги гида, и/или другие услуги, связанные с транспортировочными услугами;"}</p>
      <p>{isEn ? "3.5. Passenger selects tour, books, and waits for confirmation." : "3.5. Пассажир выбирает желаемые туры у туроператоров, из размещенных на сайте, оформляет бронирование и ожидает подтверждения бронирования от туроператора;"}</p>
      <p>{isEn ? "3.6. Booking requires contact info and route details." : "3.6. Пассажир совершает бронирование через веб-сайт. При оформлении бронирования он должен указать свое имя и фамилию, номер телефона, электронную почту, пункт отправления и назначения, время начала поездки, способ оплаты, данные банковской карты в случае выбора безналичного способа оплаты и всю другую информацию, которая будет отображаться на веб-сайте;"}</p>
      <p>{isEn ? "3.7. Passenger can change route/time." : "3.7. Пассажир может сократить или изменить маршрут и время поездки;"}</p>
      <p>{isEn ? "3.8. Cancellation allowed before confirmation. Cancellation equals failure to meet." : "3.8. Пассажир имеет право отменить запрос на бронирование в любое время до подтверждения бронирования. Отмена бронирования приравнивается к отказу от встречи с пассажиром в месте отправления."}</p>

      {/* 4. Rights and Obligations */}
      <h3 className="text-lg font-bold mt-6">{isEn ? "4. Rights and Obligations" : "4. Права и обязанности сторон"}</h3>
      <div className="space-y-4">
        <div>
            <strong className="block mb-1">{isEn ? "4.1. Platform Operator Authorized to:" : "4.1. Оператор платформы Уполномочен:"}</strong>
            <ul className="list-disc pl-5 text-sm space-y-1">
                <li>{isEn ? "Block/delete profiles for violations." : "Заблокировать, удалить или не создавать профиль, если туроператор нарушает настоящие правила/условия или есть подозрение, что какое-либо из условий было нарушено или не соблюдено;"}</li>
                <li>{isEn ? "Unilaterally change terms." : "По своему собственному усмотрению в любое время в одностороннем порядке изменять условия и услуги;"}</li>
                <li>{isEn ? "Verify user info (optional)." : "Но не обязан, по своему усмотрению, самостоятельно или через третью сторону проверять достоверность информации, размещенной пользователем, и принимать соответствующие меры в случае обнаружения неверной информации;"}</li>
                <li>{isEn ? "Request info from state/private bodies." : "Но не обязан запрашивать и/или проверять информацию о пользователе у какого-либо государственного или частного учреждения или физического лица, с чем пользователь соглашается и предоставляет оператору платформы полное право запрашивать, проверять и/или получать любую информацию о нем;"}</li>
                <li>{isEn ? "Provide info to authorities/courts." : "Предоставлять любую информацию о пользователе без его согласия/разрешения стороне договора, потерпевшему, следственным органам, прокуратуре, суду;"}</li>
                <li>{isEn ? "Direct debit funds in specific cases." : "В случаях, предусмотренных настоящим договором, произвести безакцептное списание с банковского счета пользователя;"}</li>
                <li>{isEn ? "Monitor user profiles." : "Осуществлять мониторинг профиля пользователя;"}</li>
                <li>{isEn ? "Block passenger for repeated cancellations." : "Заблокировать, удалить или не разрешить пассажиру совершить бронирование, если пассажир необоснованно отменял бронирование несколько раз..."}</li>
            </ul>
        </div>
        <div>
            <strong className="block mb-1">{isEn ? "4.2. Platform Operator Obliged to:" : "4.2. Оператор платформы обязан:"}</strong>
            <ul className="list-disc pl-5 text-sm space-y-1">
                <li>{isEn ? "Provide services properly." : "Своевременно и надлежащим образом оказывать услуги;"}</li>
                <li>{isEn ? "Not violate user rights." : "Не нарушать права пользователя;"}</li>
                <li>{isEn ? "Avoid discrimination and criminal activity." : "Не предпринимать дискриминационные действия; Не заниматься преступной деятельностью..."}</li>
            </ul>
        </div>
        <div>
            <strong className="block mb-1">{isEn ? "4.3. Tour Operator Authorized to:" : "4.3. Туроператор уполномочен:"}</strong>
            <ul className="list-disc pl-5 text-sm space-y-1">
                <li>{isEn ? "Demand timely performance from Passenger." : "Требовать от пассажира своевременного выполнения возложенных на него обязательств;"}</li>
                <li>{isEn ? "Claim damages for Passenger's faults." : "Получить возмещение ущерба через суд, которое связано с виновными действиями пассажира;"}</li>
            </ul>
        </div>
        <div>
            <strong className="block mb-1">{isEn ? "4.4. Tour Operator Obliged to:" : "4.4. Туроператор обязан:"}</strong>
            <ul className="list-disc pl-5 text-sm space-y-1">
                <li>{isEn ? "Provide accurate info and maintain vehicle." : "Предоставлять сторонам полную и достоверную информацию о себе, а также о юридическом и фактическом состоянии транспортного средства; Содержать автомобиль в технически исправном состоянии..."}</li>
                <li>{isEn ? "Obey traffic laws." : "Управляя автомобилем, соблюдать правила закона Грузии о \"дорожном движении\"..."}</li>
                <li>{isEn ? "No alcohol/drugs, keep car clean." : "Не садиться за руль в состоянии алкогольного опьянения... Содержать автомобиль в чистоте..."}</li>
                <li>{isEn ? "No smoking or towing." : "Не буксировать другие транспортные средства; Не курить..."}</li>
                <li>{isEn ? "Not share account credentials." : "Не передавать третьим лицам никакой информации о своей учетной записи..."}</li>
                <li>{isEn ? "Protect user data and not use it illegally." : "Без соответствующего согласия не собирать, не хранить... персональные данные любого лица..."}</li>
            </ul>
        </div>
        <div>
            <strong className="block mb-1">{isEn ? "4.5. Passenger Authorized to:" : "4.5. Пассажир уполномочен:"}</strong>
            <ul className="list-disc pl-5 text-sm space-y-1">
                <li>{isEn ? "Demand performance and claim damages." : "Требовать от туроператора своевременного выполнения возложенных на него обязательств; Получить компенсацию за ущерб..."}</li>
            </ul>
        </div>
        <div>
            <strong className="block mb-1">{isEn ? "4.6. Passenger Obliged to:" : "4.6. Пассажир обязан:"}</strong>
            <ul className="list-disc pl-5 text-sm space-y-1">
                <li>{isEn ? "Use website legally, pay for services." : "Использовать веб-сайт в полном соответствии с требованиями... Оплачивать стоимость услуг..."}</li>
                <li>{isEn ? "Provide accurate info." : "Предоставлять сторонам полную и достоверную информацию..."}</li>
                <li>{isEn ? "Respect others, no discrimination." : "Не оскорблять... Не проявлять дискриминационного отношения..."}</li>
            </ul>
        </div>
      </div>

      {/* 5. Liability */}
      <h3 className="text-lg font-bold mt-6">{isEn ? "5. Liability" : "5. Ответственность сторон"}</h3>
      <p>{isEn 
        ? "5.1. Platform Operator is not a party to agreements and is not liable for user actions." 
        : "5.1. Оператор платформы не является участником какого-либо соглашения и не несет ответственности за действия любого пользователя. Все переговоры ведутся непосредственно между пользователями."}</p>
      <p>{isEn ? "5.2. Platform Operator not liable for info accuracy." : "5.2. Оператор платформы не несет ответственности за точность информации, размещенной на веб-сайте."}</p>
      <p>{isEn ? "5.5. Platform Operator does not guarantee uninterrupted service." : "5.5. Оператор платформы не гарантирует постоянную и бесперебойную работу веб-сайта."}</p>
      <p>{isEn ? "5.7. Platform Operator liable only for intentional/gross negligence." : "5.7. Оператор платформы несет ответственность только за ущерб, причиненный умышленно или по грубой небрежности."}</p>
      <p>{isEn ? "5.12. Direct debit allowed for damages/non-performance." : "5.12. В случае причинения ущерба или неисполнения туроператором оператору платформы или пассажиром своих обязательств оператор платформы может безакцептным образом списать денежные средства со счета пользователя без квитанции."}</p>
      <p>{isEn ? "5.17. Intellectual property belongs to Platform Operator." : "5.17. Все авторские права и товарные знаки, включая программный код... принадлежат оператору платформы..."}</p>

      {/* 6. Confidentiality */}
      <h3 className="text-lg font-bold mt-6">{isEn ? "6. Confidentiality" : "6. Конфиденциальность"}</h3>
      <p>{isEn ? "6.1. Contract info is confidential." : "6.1. Стороны подтверждают, что информация, относящаяся к выполнению условий настоящего договора, носит конфиденциальный характер..."}</p>
      <p>{isEn ? "6.3. Confidentiality obligation is lifelong." : "6.3. Подразумеваемое настоящим Договора обязательство о конфиденциальности действует пожизненно."}</p>

      {/* 7. Force Majeure */}
      <h3 className="text-lg font-bold mt-6">{isEn ? "7. Force Majeure" : "7. Форс-мажор"}</h3>
      <p>{isEn ? "7.1. Exemption from liability for force majeure." : "7.1. Стороны освобождаются от ответственности за несоблюдение или ненадлежащее исполнение условий... в силу непреодолимой силы..."}</p>
      <p>{isEn ? "7.2. Must notify within 24 hours." : "7.2. Сторона... обязана письменно уведомить другую сторону о вышеуказанных обстоятельствах в течение 24 часов после их наступления."}</p>
      <p>{isEn ? "7.6. Passenger not liable for flight delays/objective reasons." : "7.6. Пассажир также не несет ответственности в случае неявки пассажира в место отправления из-за переноса рейса или других объективных причин."}</p>
      <p>{isEn ? "7.7. Tour Operator must wait 24h in such cases." : "7.7. При наличии обстоятельств, указанных в пункте 7.6 настоящего Договора, туроператор обязан с должным усердием дождаться пассажира без получения компенсации, но не более 24 часов."}</p>

      {/* 8. Termination */}
      <h3 className="text-lg font-bold mt-6">{isEn ? "8. Termination" : "8. Расторжение договора"}</h3>
      <p>{isEn ? "8.1. By mutual consent." : "8.1. Настоящий Договор может быть расторгнут по взаимному согласию сторон."}</p>
      <p>{isEn ? "8.2. Platform Operator can terminate for violations." : "8.2. Оператор платформы имеет право удалить профиль и расторгнуть договор с пользователем в одностороннем порядке без предварительного уведомления, если пользователь нарушает настоящие правила/условия..."}</p>

      {/* 9. Dispute Resolution */}
      <h3 className="text-lg font-bold mt-6">{isEn ? "9. Dispute Resolution" : "9. Разрешение споров"}</h3>
      <p>{isEn ? "9.1. By agreement." : "9.1. Все споры и разногласия... будут разрешаться по соглашению сторон."}</p>
      <p>{isEn ? "9.2. Disputes between Passenger/Operator in Tbilisi City Court." : "9.2. Если стороны не придут к соглашению, спор... будет разрешен судом в соответствии с законодательством Грузии на территории Грузии Тбилисским городским судом."}</p>
      <p>{isEn 
        ? "9.3. Disputes involving Platform Operator via 'Dispute Resolution Center' DRC Arbitration in Tbilisi." 
        : "9.3. Любой спор относительно исков, поданных оператором платформы... должен быть передан в Постоянно действующий арбитражный центр „Центр разрешения споров“ DRC..."}</p>
      <p>{isEn ? "9.4. Governed by Georgian Law." : "9.4. Отношения, вытекающие из настоящего Договора, регулируются законодательством Грузии."}</p>

      {/* 10. Other Conditions */}
      <h3 className="text-lg font-bold mt-6">{isEn ? "10. Other Conditions" : "10. Другие условия"}</h3>
      <p>{isEn ? "10.1. Communication via chat, email, phone." : "10.1. Стороны связываются друг с другом посредством использования чата на веб-странице... или любыми другими способами..."}</p>
      <p>{isEn ? "10.2. Prohibition on communication outside platform to avoid fees." : "10.2. Пассажир и туроператор не имеют права общаться друг с другом за пределами веб-сайта, чтобы избежать оплаты сборов за обслуживание или уменьшить комиссию."}</p>
      <p>{isEn ? "10.7. Terms drawn up in Georgian." : "10.7. Данные условия составлены на грузинском языке."}</p>
      <p>{isEn ? "10.9. Unilateral changes allowed with notice." : "10.9. Настоящий Договор может быть изменен оператором платформы в одностороннем порядке..."}</p>
    </div>
  );

  const renderPrivacy = () => (
    <div className="prose prose-indigo max-w-none text-gray-700">
      <h2 className="text-2xl font-bold mb-4">{isEn ? "Privacy Policy" : "Политика конфиденциальности"}</h2>
      
      <p className="mb-4">
        {isEn 
          ? "This website (hereinafter 'Platform') is owned by GoTrip LLC (ID 405198673). These rules inform you how we collect, use, and process the personal data of our Platform users." 
          : "Данный веб-сайт (далее 'Платформа') является собственностью ООО 'Гоутрип' (И/N 405198673). Эти правила информируют вас о том, как мы собираем, используем и обрабатываем персональные данные пользователей нашей Платформы."}
      </p>
      <p className="mb-6">
        {isEn
          ? "We use your personal data to improve our service and platform. By using the Platform, you agree to the processing of your personal data by us as prescribed by law for the purposes specified in this Privacy Policy."
          : "Мы используем ваши персональные данные для улучшения нашего сервиса и платформы. Используя Платформу, вы соглашаетесь на обработку нами ваших персональных данных в порядке, предусмотренном законом, для целей, указанных в настоящей Политике конфиденциальности."}
      </p>

      <h3 className="text-lg font-bold mt-6">{isEn ? "What data do we collect?" : "Какие данные мы собираем?"}</h3>
      <p>{isEn ? "Our company collects data which includes, but is not limited to:" : "Наша компания собирает данные, которые включают, но не ограничиваются:"}</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>{isEn ? "Personal identification data (Name, surname, email address, address, phone number, photo, etc.)" : "Личные идентификационные данные (имя, фамилия, адрес электронной почты, адрес, номер телефона, фотография, и т.д.)"}</li>
        <li>{isEn ? "Your IP address;" : "Ваш IP-адрес;"}</li>
        <li>{isEn ? "Time of visit;" : "Время посещения;"}</li>
        <li>{isEn ? "Type of internet browser and device used;" : "Тип интернет-браузера и тип устройства, на котором расположен указанный браузер;"}</li>
        <li>{isEn ? "Date and duration of stay;" : "Дата и продолжительность пребывания;"}</li>
        <li>{isEn ? "Bank account details;" : "Данные банковского счета;"}</li>
        <li>{isEn ? "Pickup location and destination;" : "Место отправления и пункт назначения;"}</li>
        <li>{isEn ? "Travel start time;" : "Время начала путешествия;"}</li>
        <li>{isEn ? "ID card / Passport;" : "Удостоверение личности;"}</li>
        <li>{isEn ? "Driving license;" : "Водительские права;"}</li>
        <li>{isEn ? "Taxi permit;" : "Разрешение на перевозку на такси;"}</li>
        <li>{isEn ? "Insurance policy;" : "Страховой полис;"}</li>
        <li>{isEn ? "Criminal record information;" : "Информация о судимости;"}</li>
        <li>{isEn ? "Location and travel route;" : "Местоположение и маршрут передвижения;"}</li>
        <li>{isEn ? "Transport data including: vehicle registration number, color, VIN;" : "Транспортные данные, включая и не только: регистрационный номер транспортного средства, цвет транспортного средства, регистрационный номер транспортного средства;"}</li>
        <li>{isEn ? "Professional results and ratings." : "Профессиональные результаты и рейтинги."}</li>
      </ul>

      <h3 className="text-lg font-bold mt-6">{isEn ? "How do we collect your data?" : "Как мы собираем ваши данные?"}</h3>
      <p>{isEn ? "Most of the data we collect is provided by you directly. We collect and process data when you:" : "Большинство собранной нами информации предоставляется вам напрямую. Мы собираем и обрабатываем данные, когда вы:"}</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>{isEn ? "Create your account on our platform using our services." : "Создайте свою учетную запись на нашей платформе, используя сервисы нашей платформы."}</li>
        <li>{isEn ? "Voluntarily complete a user survey or send feedback via email or other means." : "Добровольно заполните опрос пользователя или отправляйте отзыв (feedback) с помощью электронной почты или других средств."}</li>
        <li>{isEn ? "Use our platform and/or offered services in other ways." : "Используете нашу платформу и/или предлагаемые нами услуги по другому."}</li>
      </ul>
      <p className="mt-2 text-sm italic">{isEn ? "The above list is not exhaustive, and personal data may be obtained from other indirect sources during our relationship with you." : "Приведенный выше список не является исчерпывающим, и персональные данные могут быть получены из других косвенных источников в ходе наших отношений с вами."}</p>

      <h3 className="text-lg font-bold mt-6">{isEn ? "How will we use your data?" : "Как мы будем использовать ваши данные?"}</h3>
      <p>{isEn ? "Our company collects your data so that we can:" : "Наша компания собирает ваши данные, чтобы мы могли:"}</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>{isEn ? "Provide services to you, manage your account." : "Предоставлять вам услуги, управлять вашей учетной записью."}</li>
        <li>{isEn ? "Email you special offers on our services and products." : "Присылать вам по электронной почте особые предложения о наших услугах и продуктах."}</li>
        <li>{isEn ? "Technical administration of the platform and its development;" : "Техническое администрирование платформы и ее развитие;"}</li>
        <li>{isEn ? "For other cases defined by this policy;" : "Для других случаев, определенных настоящей политикой;"}</li>
      </ul>

      <h3 className="text-lg font-bold mt-6">{isEn ? "How do we store your data?" : "Как мы храним ваши данные?"}</h3>
      <p>
        {isEn 
         ? "We apply all reasonable technical and organizational security measures available to us to ensure that your personal data obtained through our platform is protected from unauthorized access, use, loss, or destruction."
         : "Мы применяем все разумные технические и организационные меры безопасности, доступные нам, чтобы гарантировать, что ваши персональные данные, полученные через нашу платформу, были защищены от несанкционированного доступа, использования, потери или уничтожения."}
      </p>
      <p className="mt-2">
        {isEn
         ? "Our company will keep your personal data in the manner prescribed by applicable law for the period necessary to achieve our defined goals (marketing purposes, service improvement, etc.). Once the goals defined by our company in accordance with this policy cease to exist, we will delete/destroy your personal data."
         : "Наша компания будет хранить ваши персональные данные в порядке, определенном действующим законодательством, в течение периода, необходимого для реализации определенных нами целей (рекламные цели, улучшение сервиса и т.д.). Как только цели, определенные нашей компанией в соответствии с настоящей политикой, перестанут существовать, мы удалим /уничтожим ваши персональные данные."}
      </p>

      <h3 className="text-lg font-bold mt-6">{isEn ? "Your Data Protection Rights" : "Какими правами вы обладаете в отношении защиты персональных данных"}</h3>
      <p>{isEn ? "Our company wants to make sure we process and store your personal data in accordance with maximum security rules. We also protect and respect your rights regarding data protection. Any user of the platform has the right to:" : "Наша компания хочет убедиться, что мы обрабатываем и храним ваши персональные данные в соответствии с максимальными правилами безопасности. Мы также защищаем и уважаем ваши права в отношении защиты персональных данных. Любой пользователь платформы имеет право:"}</p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>{isEn ? "Right to access" : "Право запрашивать доступ"}</strong> - {isEn ? "You have the right to request copies of your personal data held by us." : "вы имеете право запрашивать копии ваших персональных данных, хранящихся у нас."}</li>
        <li><strong>{isEn ? "Right to rectification" : "Право запросить изменение"}</strong> - {isEn ? "You have the right to request correction of any information you believe is inaccurate or incomplete." : "вы имеете право запросить у нашей компании исправление любой информации, которую вы считаете неверной или неточной. Кроме того, вы имеете право запросить нашу компанию заполнить информацию, которую вы считаете неполной."}</li>
        <li><strong>{isEn ? "Right to erasure" : "Право запросить удаление"}</strong> - {isEn ? "You have the right to request that we erase your personal data, under certain conditions." : "вы имеете право запросить удаление ваших персональных данных у нашей компании при соблюдении определенных условий."}</li>
        <li><strong>{isEn ? "Right to restrict processing" : "Право запросить ограничение обработки"}</strong> - {isEn ? "You have the right to request that we restrict the processing of your personal data, under certain conditions." : "вы имеете право запросить у нашей компании ограничение на обработку ваших персональных данных при соблюдении определенных условий."}</li>
        <li><strong>{isEn ? "Right to data portability" : "Право запросить передачу данных"}</strong> - {isEn ? "You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions." : "вы имеете право запросить передачу собранных нами данных другой организации или непосредственно вам, при соблюдении определенных условий."}</li>
      </ul>
      <p className="mt-2 text-sm">{isEn ? "We have 10 days to respond to your request." : "По запросу мы обязаны ответить вам в течение 10 дней"}</p>

      <h3 className="text-lg font-bold mt-6">{isEn ? "What are Cookies?" : "Что такое файлы 'Cookie'?"}</h3>
      <p>
        {isEn
         ? "Cookies are small text files stored on your computer, tablet, or mobile phone. When you visit the platform, cookies allow the platform to track you and remember how you used the platform during each visit, ensuring the platform adapts better to you. Accordingly, when you visit our platform, we may collect information automatically using Cookies or similar technologies."
         : "Файлы Cookie - это небольшие текстовые файлы, которые хранятся на вашем компьютере, планшете или мобильном телефоне. Когда вы заходите на платформу, файлы 'Сookies' позволяют платформе отслеживать вас и запоминать, как вы использовали платформу во время каждого входа в систему, гарантируя, что платформа лучше адаптируется к вам. Соответственно, когда вы заходите на нашу платформу, мы также можем получать информацию автоматическими средствами, используя 'Сookies' или аналогичные технологии."}
      </p>
      <p className="mt-1"><a href="https://allaboutcookies.org" target="_blank" rel="noreferrer" className="text-indigo-600 underline">{isEn ? "For more info visit allaboutcookies.org" : "Для получения дополнительной информации посетите allaboutcookies.org"}</a>.</p>

      <h3 className="text-lg font-bold mt-6">{isEn ? "How do we use Cookies?" : "Как мы используем файлы 'Cookie'"}</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>{isEn ? "Monitor platform visitor flow and movement patterns;" : "Следить за потоком посетителей платформы и особенностями их передвижения;"}</li>
        <li>{isEn ? "Monitor platform effectiveness and constantly improve it;" : "Следить за эффективностью платформы и постоянно улучшайте ее;"}</li>
        <li>{isEn ? "Provide users with customization options and improve their experience;" : "Предоставить пользователям платформы возможность настройки и улучшить их опыт;"}</li>
        <li>{isEn ? "Otherwise improve our provided service." : "Иным образом улучшить предоставляемый нами сервис."}</li>
      </ul>

      <h3 className="text-lg font-bold mt-6">{isEn ? "What types of Cookies do we use?" : "Какие типы 'Cookie' мы используем"}</h3>
      <p>{isEn ? "In general, there are many types of Cookies, though we use:" : "В общем, существует много типов файлов 'Cookie', хотя мы используем следующие файлы:"}</p>
      <ul className="list-disc pl-5 space-y-2 mt-2">
        <li>
            <strong>{isEn ? "Functionality" : "Функциональности"}</strong> - 
            {isEn 
             ? " Functionality cookies record information about your preferences, allowing us to customize the platform to your interests. These cookies allow us to remember your language, location, frequently viewed products, etc." 
             : " файлы Cookie Функциональности записывают информацию о ваших приоритетах, позволяя нам настраивать платформу в соответствии с вашими интересами. Суть этих файлов Cookie заключается в том, что, когда вы продолжаете использовать платформу или возвращаетесь на нее, мы можем предоставлять вам услуги таким образом, как вы запрашиваете. Например, эти файлы Cookie позволяют нам запоминать язык, который вы использовали, местоположение, из которого вы пришли, часто просматриваемые продукты, и т.д."}
        </li>
        <li>
            <strong>{isEn ? "Advertising" : "Рекламы"}</strong> - 
            {isEn 
             ? " Our company uses these cookies to collect info about your visits, viewed content, links followed, as well as browser/device info and IP address. Sometimes we share this with third parties for advertising purposes." 
             : " наша компания использует такие файлы Cookie о ваших посещениях нашей платформы, материалах, которые вы просмотрели, ссылках, по которым вы перешли, а также информации о вашем браузере, устройстве и IP-адресе. Иногда наша компания делится этой информацией с третьими лицами в рекламных целях."}
        </li>
      </ul>

      <h3 className="text-lg font-bold mt-6">{isEn ? "How to manage Cookies?" : "Как вы можете управлять файлами 'Cookie'?"}</h3>
      <p>
        {isEn 
         ? "You can set your browser not to accept cookies. The website mentioned above tells you how to remove cookies from your browser. However, in some cases, some of our platform features may not function as a result."
         : "Вы можете настроить платформу таким образом, чтобы она не использовала файлы 'Cookie', указанная выше веб-страница скажет вам, как удалить файлы 'Cookie' из вашего браузера. Однако имейте в виду, что в таком случае вы, возможно, не сможете в полной мере использовать определенные функции нашей платформы."}
      </p>

      <h3 className="text-lg font-bold mt-6">{isEn ? "Privacy policies of other websites" : "Политика конфиденциальности других веб-страниц"}</h3>
      <p>
        {isEn
         ? "Our platform may contain links to other websites. Our privacy policy applies only to our platform, so if you click on a link to another website, you should read their privacy policy."
         : "Наша платформа может содержать ссылки на другие веб-страницы. Наша политика конфиденциальности действительна только на нашей платформе, поэтому, если вы переходите по ссылке другого веб-сайта, обязательно ознакомьтесь с их политикой конфиденциальности."}
      </p>

      <h3 className="text-lg font-bold mt-6">{isEn ? "Changes to our Privacy Policy" : "Изменения в нашей Политике конфиденциальности"}</h3>
      <p>
        {isEn
         ? "Our company keeps its privacy policy under regular review and places any updates on this web page."
         : "Наша компания постоянно действует в соответствии с действующим законодательством и принципы Политики конфиденциальности, и соответствующие обновления отражаются на платформе."}
      </p>

      <h3 className="text-lg font-bold mt-6">{isEn ? "How to contact us" : "Как связаться с нами"}</h3>
      <p>{isEn ? "If you have questions about our privacy policy, the data we hold on you, or you would like to exercise one of your data protection rights, please contact us:" : "Если у вас есть какие-либо вопросы о политике конфиденциальности нашей компании, информации, которую мы собираем, или вы просто хотите воспользоваться своими правами в отношении персональных данных, пожалуйста, свяжитесь с нами по следующим адресам:"}</p>
      
      <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="font-bold">{isEn ? "GoTrip LLC" : "ООО \"Гоутрип\""}</p>
          <p>{isEn ? "ID: 405198673" : "И/N 405198673"}</p>
          <p>{isEn ? "7 Innovation Str, Tbilisi" : "Тбилиси, ул. Инноваций 7"}</p>
          <p className="text-indigo-600">support@gotrip.ge</p>
      </div>

      <h3 className="text-lg font-bold mt-6">{isEn ? "How to contact the appropriate authority" : "Как связаться с уполномоченными органами"}</h3>
      <p>
        {isEn
         ? "The Personal Data Protection Service is an independent state authority aimed at monitoring the legality of personal data processing. If you feel that your rights have been violated, please contact:"
         : "Служба защиты персональных данных является независимым государственным органом, целью которого является контроль за законностью обработки персональных данных. Соответственно, если вы считаете, что ваши права были нарушены при обработке ваших персональных данных, пожалуйста, обратитесь в службу защиты персональных данных:"}
      </p>
      <div className="mt-2 text-sm">
          <p>{isEn ? "Tel: (+995 32) 242 1000" : "Тел.: (+995 32) 242 1000"}</p>
          <p>{isEn ? "Email: office@pdps.ge" : "Электронная почта: office@pdps.ge"}</p>
          <p>{isEn ? "Address: 7 N. Vachnadze Str, Tbilisi, 0105, Georgia" : "Адрес: Грузия, Тбилиси, ул. Н. Вачнадзе, 7, 0105"}</p>
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
        {isEn ? "Back to Home" : "Мთავარზე დაბრუნება"}
      </button>

      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100">
        {type === 'TERMS' ? renderTerms() : renderPrivacy()}
      </div>
    </div>
  );
};

export default LegalView;