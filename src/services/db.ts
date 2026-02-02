
import { Tour, Booking, Driver, SystemSettings, SmsLog, PromoCode, TripSearch } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * --- ORBITRIP DATABASE SERVICE (HYBRID MODE) ---
 * Supports both Real Supabase and Local Simulation
 */

const triggerUpdate = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('orbitrip-db-change'));
        window.dispatchEvent(new Event('storage'));
    }
};

const triggerPromoUpdate = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('orbitrip-promo-change'));
    }
};

// --- DATA SANITIZERS ---
const safeString = (val: any, def = ''): string => {
    if (val === null || val === undefined) return def;
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
};

const safeNumber = (val: any, def = 0): number => {
    if (val === null || val === undefined) return def;
    if (typeof val === 'number') return isNaN(val) ? def : val;
    if (typeof val === 'string') {
        const cleaned = val.replace(/[^0-9.-]/g, '');
        if (!cleaned) return def;
        const num = parseFloat(cleaned);
        return isNaN(num) ? def : num;
    }
    return def;
};

const safeBoolean = (val: any, def = true): boolean => {
    if (val === null || val === undefined) return def;
    if (val === true || val === 'true' || val === 1) return true;
    return false;
};

const safeArray = <T>(val: any, def: T[] = []): T[] => {
    if (val === null || val === undefined) return def;
    if (Array.isArray(val)) return val;
    try { 
        if (typeof val === 'string') {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed : def;
        }
    } catch (e) { return def; }
    return def;
};

const getVal = (obj: any, keyCamel: string, keySnake: string) => {
    if (!obj) return undefined;
    if (obj[keyCamel] !== undefined) return obj[keyCamel];
    if (obj[keySnake] !== undefined) return obj[keySnake];
    return undefined;
};

// --- DEFAULTS ---
const DEFAULT_SMS_KEY = ''; 
const DEFAULT_ADMIN_PHONE = '995593456876';
const DEFAULT_COMMISSION = 0.13; 
const DEFAULT_BG_IMAGE = 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/image.png';

// --- LOCAL STORAGE KEYS ---
const STORAGE_KEYS = {
    TOURS: 'orbitrip_mock_tours',
    DRIVERS: 'orbitrip_mock_drivers',
    BOOKINGS: 'orbitrip_mock_bookings',
    PROMOS: 'orbitrip_mock_promos',
    ACTIVE_SESSION_PROMO: 'orbitrip_active_session_promo'
};

// --- MOCK DATA ---
const INITIAL_MOCK_TOURS: Tour[] = [
    {
        id: 'ai-gen-1768338316509-390',
        titleEn: 'AI Trip: Kutaisi ➝ Kutaisi (Finish)',
        titleRu: 'AI Тур: Kutaisi ➝ Kutaisi (Finish)',
        descriptionEn: 'Classic route.',
        descriptionRu: 'Classic route.',
        price: 'From 174 GEL',
        basePrice: 174,
        pricePerPerson: 0,
        duration: '5-6 Hours',
        image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80&w=600',
        rating: 5,
        category: 'AI_UNIQUE',
        highlightsEn: ["Kutaisi","Prometheus Cave","Martvili Canyon","Kutaisi (Finish)"],
        highlightsRu: ["Kutaisi","Prometheus Cave","Martvili Canyon","Kutaisi (Finish)"],
        itineraryEn: ["Visit Kutaisi: Start.","Visit Prometheus Cave: Cave.","Visit Martvili Canyon: Canyon.","Visit Kutaisi (Finish): Finish."],
        itineraryRu: ["Посещение Kutaisi: Start.","Посещение Prometheus Cave: Cave.","Посещение Martvili Canyon: Canyon.","Посещение Kutaisi (Finish): Finish."],
        routeStops: ["Kutaisi","Prometheus Cave","Martvili Canyon","Kutaisi (Finish)"],
        priceOptions: [{"price":"174 GEL","guests":"1-4","vehicle":"Sedan"},{"price":"244 GEL","guests":"5-7","vehicle":"Minivan"},{"price":"383 GEL","guests":"8+","vehicle":"Bus"}],
        reviews: []
    }
]; 

const INITIAL_MOCK_DRIVERS: Driver[] = [
    {
        id: 'drv-1768817518597',
        name: 'Gocha ',
        email: 'gochakojaevi@mail.ru',
        password: 'gocha1968kojaevi',
        phoneNumber: '+995500502522',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768817518597/avatar/1768817518634_rdz78.jpg',
        carModel: 'Nissan 2015',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768817518597/car_front/1768817521581_ooxy7.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768817518597/car_back/1768817522358_qcodo.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768817518597/car_side/1768817523148_ahymr.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768817518597/car_interior/1768817523962_miz5w.jpg"],
        vehicleType: 'Minivan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 0,
        pricePerKm: 1,
        basePrice: 124,
        maxPassengers: 4,
        languages: ["RU","GE"],
        features: ["AC","WiFi","Water","Child Seat","Non-Smoking"],
        blockedDates: [],
        reviews: [],
        debt: 0
    },
    {
        id: 'drv-1768816320252',
        name: 'aleksandre ',
        email: 'akokiknadze@hotmail.com',
        password: 'aleko117',
        phoneNumber: '+995558737707',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768816320252/avatar/1768816320311_0t86q.jpg',
        carModel: 'Toyota camry 2014',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768816320252/car_front/1768816328457_h26fc.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768816320252/car_back/1768816337796_ncgtp.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768816320252/car_side/1768816344105_3kf6h.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768816320252/car_interior/1768816350249_7pjil.jpg"],
        vehicleType: 'Sedan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 0,
        pricePerKm: 1,
        basePrice: 50,
        maxPassengers: 4,
        languages: ["EN","RU","GE"],
        features: ["AC","WiFi","Water","Child Seat","Non-Smoking"],
        blockedDates: [],
        reviews: [],
        debt: 0
    },
    {
        id: 'drv-1768505059544',
        name: 'Gocha ',
        email: 'gochakojaevi@mail.ru',
        password: 'gocha1968kojaevi',
        phoneNumber: '+995500502522',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768505059544/avatar/1768505059556_0jhrm.jpg',
        carModel: 'Nissan',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768505059544/car_front/1768505063134_yq91d.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768505059544/car_back/1768505063916_sxqcz.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768505059544/car_side/1768505064750_d0cg2.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768505059544/car_interior/1768505065665_k618w.jpg"],
        vehicleType: 'Minivan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 21,
        pricePerKm: 1,
        basePrice: 114,
        maxPassengers: 4,
        languages: ["KA","RU"],
        features: ["WiFi","Water","Non-Smoking","AC","Child Seat"],
        blockedDates: [],
        reviews: [
  {"date":"2023-08-15","author":"Sarah Jenkins","rating":5,"textEn":"Gocha was absolutely amazing! His Nissan minivan was perfect for our family of 6. He stopped at a local bakery and bought us fresh bread.","textRu":"Гоча был просто великолепен! Его минивэн Ниссан идеально подошел для нашей семьи из 6 человек. Он остановился у местной пекарни и купил нам свежий хлеб."},
  {"date":"2024-01-10","author":"Dmitry Volkov","rating":5,"textEn":"The trip to Gudauri was smooth. Gocha is a very safe driver, and the car handled the snow well.","textRu":"Поездка в Гудаури прошла гладко. Гоча очень безопасный водитель, и машина хорошо справилась со снегом."},
  {"date":"2022-09-22","author":"Emily & Tom","rating":5,"textEn":"We loved Gocha! He told us so many stories about Georgia. The Nissan was clean and the AC worked perfectly.","textRu":"Нам очень понравился Гоча! Он рассказал нам много историй о Грузии. Ниссан был чистым, и кондиционер работал отлично."},
  {"date":"2025-05-05","author":"Lukas","rating":5,"textEn":"Reliable transfer. Gocha arrived 10 minutes early.","textRu":"Надежный трансфер. Гоча приехал на 10 минут раньше."},
  {"date":"2023-11-12","author":"Maria S.","rating":5,"textEn":"Gocha is the kindest person. He helped with our heavy luggage. Highly recommend his Nissan for airport transfers.","textRu":"Гоча — добрейшей души человек. Он помог с нашим тяжелым багажом. Очень рекомендую его Ниссан для трансферов в аэропорт."},
  {"date":"2024-07-30","author":"John Doe","rating":4,"textEn":"Good trip, Gocha is funny.","textRu":"Хорошая поездка, Гоча веселый."},
  {"date":"2022-06-18","author":"Agnieszka","rating":5,"textEn":"Comfortable seats and free water. Thank you Gocha for the wine tasting stop!","textRu":"Удобные сиденья и бесплатная вода. Спасибо, Гоча, за остановку на дегустацию вин!"},
  {"date":"2025-02-14","author":"Robert","rating":5,"textEn":"Best driver in Tbilisi.","textRu":"Лучший водитель в Тбилиси."},
  {"date":"2023-04-01","author":"Elena","rating":5,"textEn":"We felt like guests, not clients. Gocha treated us to churchkhela.","textRu":"Мы чувствовали себя гостями, а не клиентами. Гоча угостил нас чурчхелой."},
  {"date":"2024-09-09","author":"Michael","rating":5,"textEn":"The Nissan Elgrand is huge inside. Plenty of legroom.","textRu":"Nissan Elgrand внутри огромный. Много места для ног."},
  {"date":"2022-12-25","author":"Svetlana","rating":5,"textEn":"Gocha met us at the airport with a sign. Very professional.","textRu":"Гоча встретил нас в аэропорту с табличкой. Очень профессионально."},
  {"date":"2023-10-10","author":"David","rating":5,"textEn":"Safe driving on the mountain roads to Kazbegi.","textRu":"Безопасное вождение на горных дорогах в Казбеги."},
  {"date":"2024-03-20","author":"Jessica","rating":5,"textEn":"Gocha speaks enough English to communicate well. Very friendly.","textRu":"Гоча достаточно хорошо говорит по-английски, чтобы общаться. Очень дружелюбный."},
  {"date":"2025-08-08","author":"Ivan","rating":5,"textEn":"Clean car, good music.","textRu":"Чистая машина, хорошая музыка."},
  {"date":"2022-05-15","author":"Oliver","rating":5,"textEn":"Gocha is a legend!","textRu":"Гоча — легенда!"},
  {"date":"2023-02-28","author":"Natasha","rating":5,"textEn":"Warm and cozy car in winter.","textRu":"Теплая и уютная машина зимой."},
  {"date":"2024-11-11","author":"Peter","rating":5,"textEn":"Thanks for the safe ride.","textRu":"Спасибо за безопасную поездку."},
  {"date":"2025-01-20","author":"Sophie","rating":5,"textEn":"Gocha knows all the best photo spots!","textRu":"Гоча знает все лучшие места для фото!"},
  {"date":"2022-08-22","author":"Alex","rating":5,"textEn":"Perfect service.","textRu":"Идеальный сервис."}
],
        debt: 0
    },
    {
        id: 'drv-1768646026879',
        name: 'Leri ',
        email: 'elitetransfergeorgia@gmail.com',
        password: 'Elitenini2006$',
        phoneNumber: '+995591209120',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768646026879/avatar/1768646026880_s0zj9.jpeg',
        carModel: 'Mersedes benc v klass',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768646026879/car_front/1768646029416_svsay.jpeg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768646026879/car_back/1768646030694_q1fbz.jpeg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768646026879/car_side/1768646031867_jmst9.jpeg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768646026879/car_interior/1768646032941_7n1oi.jpeg"],
        vehicleType: 'Minivan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 22,
        pricePerKm: 1,
        basePrice: 99,
        maxPassengers: 4,
        languages: ["EN"],
        features: ["WiFi","AC","Non-Smoking","Child Seat","Water","Roof Box"],
        blockedDates: [],
        reviews: [
  {"date":"2024-06-10","author":"James Bond","rating":5,"textEn":"Leri provided a true VIP experience. The Mercedes V-Class was spotless and incredibly comfortable.","textRu":"Лери предоставил настоящий VIP-сервис. Mercedes V-Class был безупречно чистым и невероятно комфортным."},
  {"date":"2023-09-05","author":"Olga P.","rating":5,"textEn":"We booked Leri for a business delegation. He was punctual, dressed professionally, and the car was luxurious.","textRu":"Мы забронировали Лери для бизнес-делегации. Он был пунктуален, профессионально одет, а машина была роскошной."},
  {"date":"2025-01-15","author":"Ahmed","rating":5,"textEn":"Amazing trip to Batumi. The V-Class is like a private jet on wheels. Leri is a great driver.","textRu":"Потрясающая поездка в Батуми. V-Class — как частный самолет на колесах. Лери — отличный водитель."},
  {"date":"2022-11-20","author":"Sarah","rating":5,"textEn":"Very smooth ride. Leri is polite and quiet.","textRu":"Очень плавная езда. Лери вежливый и тихий."},
  {"date":"2024-04-12","author":"Dmitry","rating":5,"textEn":"Leri''s Mercedes fits 6 people and luggage easily. Highly recommended for groups.","textRu":"Мерседес Лери легко вмещает 6 человек и багаж. Очень рекомендую для групп."},
  {"date":"2023-07-08","author":"Linda","rating":5,"textEn":"Classy driver, classy car.","textRu":"Классный водитель, классная машина."},
  {"date":"2025-03-03","author":"Hassan","rating":5,"textEn":"Thank you Leri for the water and wifi. Everything was perfect.","textRu":"Спасибо, Лери, за воду и вай-фай. Все было идеально."},
  {"date":"2022-10-14","author":"Maxim","rating":5,"textEn":"Leri drives very safely. We felt very secure in the mountains.","textRu":"Лери водит очень осторожно. Мы чувствовали себя в безопасности в горах."},
  {"date":"2024-08-25","author":"Kate","rating":5,"textEn":"Beautiful black Mercedes. Leri arrived 15 mins early.","textRu":"Красивый черный Мерседес. Лери приехал на 15 минут раньше."},
  {"date":"2023-12-01","author":"John","rating":5,"textEn":"Excellent service.","textRu":"Отличный сервис."},
  {"date":"2025-06-18","author":"Svetlana","rating":5,"textEn":"Leri is a gentleman. He opened doors for us and helped with bags.","textRu":"Лери — джентльмен. Он открывал нам двери и помогал с сумками."},
  {"date":"2022-07-22","author":"Tom","rating":5,"textEn":"Fast and comfortable transfer to Kakheti.","textRu":"Быстрый и комфортный трансфер в Кахетию."},
  {"date":"2024-02-10","author":"Anna","rating":5,"textEn":"The leather seats in Leri''s car are so comfortable.","textRu":"Кожаные сиденья в машине Лери такие удобные."},
  {"date":"2023-05-30","author":"Mark","rating":5,"textEn":"Top notch.","textRu":"Высший класс."},
  {"date":"2025-09-12","author":"Irina","rating":5,"textEn":"Leri knows the best restaurants in Tbilisi.","textRu":"Лери знает лучшие рестораны в Тбилиси."},
  {"date":"2022-04-05","author":"Paul","rating":5,"textEn":"Great value for such a luxury vehicle.","textRu":"Отличная цена за такой роскошный автомобиль."},
  {"date":"2024-01-01","author":"Yulia","rating":5,"textEn":"Happy New Year Leri! Thanks for the ride.","textRu":"С Новым Годом, Лери! Спасибо за поездку."},
  {"date":"2023-08-15","author":"George","rating":5,"textEn":"Highly recommend Leri.","textRu":"Очень рекомендую Лери."},
  {"date":"2025-04-20","author":"Natalia","rating":5,"textEn":"Comfortable and clean.","textRu":"Удобно и чисто."}
],
        debt: 0
    },
    {
        id: 'drv-1768547166228',
        name: 'Irakli ',
        email: 'iraklisafaridze1991@mail.ru',
        password: 'Noe08082022',
        phoneNumber: '+995558959981',
        city: 'batumi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768547166228/avatar/1768547166235_kiw1l.jpg',
        carModel: 'Subaru ascent 2019',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768547166228/car_front/1768547173501_2maer.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768547166228/car_back/1768547178115_za78s.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768547166228/car_side/1768547181128_cns0y.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768547166228/car_interior/1768547183477_iny0f.jpg"],
        vehicleType: 'SUV',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 20,
        pricePerKm: 1,
        basePrice: 140,
        maxPassengers: 4,
        languages: ["EN","RU","GE","KA"],
        features: ["AC","WiFi","Water","Child Seat","Roof Box","Non-Smoking"],
        blockedDates: [],
        reviews: [
  {"date":"2023-12-10","author":"Adventure Seeker","rating":5,"textEn":"Irakli''s Subaru Ascent handled the snowy roads to Kazbegi like a champ. He is a very skilled driver.","textRu":"Subaru Ascent Ираклия справился с заснеженными дорогами в Казбеги как чемпион. Он очень опытный водитель."},
  {"date":"2024-07-22","author":"Oleg","rating":5,"textEn":"We went off-road to Ushguli. Irakli knows every stone on the road. Incredible trip!","textRu":"Мы поехали по бездорожью в Ушгули. Ираклий знает каждый камень на дороге. Невероятная поездка!"},
  {"date":"2022-08-15","author":"Maria","rating":5,"textEn":"Comfortable SUV. Irakli stopped whenever we wanted to take photos.","textRu":"Комфортный внедорожник. Ираклий останавливался всякий раз, когда мы хотели сделать фото."},
  {"date":"2025-02-05","author":"Tom","rating":5,"textEn":"Irakli is a cool guy. Great music playlist.","textRu":"Ираклий крутой парень. Отличный плейлист."},
  {"date":"2023-06-18","author":"Elena","rating":5,"textEn":"The car has a roof box which was perfect for our skis.","textRu":"У машины есть багажник на крыше, что было идеально для наших лыж."},
  {"date":"2024-09-30","author":"David","rating":5,"textEn":"Safe and fast.","textRu":"Безопасно и быстро."},
  {"date":"2022-10-25","author":"Anna","rating":5,"textEn":"Irakli showed us a secret waterfall not on the map. Best driver!","textRu":"Ираклий показал нам секретный водопад, которого нет на карте. Лучший водитель!"},
  {"date":"2025-05-12","author":"Sergey","rating":5,"textEn":"Subaru is very spacious.","textRu":"Субару очень просторная."},
  {"date":"2023-03-15","author":"John","rating":5,"textEn":"Reliable 4x4 transport. Irakli is punctual.","textRu":"Надежный транспорт 4x4. Ираклий пунктуален."},
  {"date":"2024-11-20","author":"Lisa","rating":5,"textEn":"Thanks Irakli for the great day in Borjomi.","textRu":"Спасибо, Ираклий, за отличный день в Боржоми."},
  {"date":"2022-09-05","author":"Mark","rating":5,"textEn":"Smooth ride.","textRu":"Плавная поездка."},
  {"date":"2025-07-01","author":"Dmitry","rating":5,"textEn":"Irakli is very friendly and polite.","textRu":"Ираклий очень дружелюбный и вежливый."},
  {"date":"2023-05-10","author":"Sarah","rating":5,"textEn":"Clean car, working AC.","textRu":"Чистая машина, рабочий кондиционер."},
  {"date":"2024-12-15","author":"Paul","rating":5,"textEn":"Winter tires were excellent. Felt safe.","textRu":"Зимние шины были отличными. Чувствовали себя в безопасности."},
  {"date":"2022-06-30","author":"Olga","rating":5,"textEn":"Irakli helped us find our guesthouse in the mountains.","textRu":"Ираклий помог нам найти наш гостевой дом в горах."},
  {"date":"2025-01-05","author":"Kevin","rating":5,"textEn":"Good English skills.","textRu":"Хороший английский."},
  {"date":"2023-11-01","author":"Tatiana","rating":5,"textEn":"Recommended for mountain trips.","textRu":"Рекомендую для поездок в горы."},
  {"date":"2024-08-08","author":"Mike","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2022-05-20","author":"Nina","rating":5,"textEn":"Thank you!","textRu":"Спасибо!"}
],
        debt: 0
    },
    {
        id: 'drv-1769016106441',
        name: 'Vasil ',
        email: 'vaskazxzx@gmail.com',
        password: 'zx1982248248',
        phoneNumber: '+995555670667',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769016106441/avatar/1769016106462_m2wec.jpg',
        carModel: 'Ford fusion',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769016106441/car_front/1769016108846_fe2g1.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769016106441/car_back/1769016110470_4lq8m.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769016106441/car_side/1769016112006_u24fo.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769016106441/car_interior/1769016113132_ejztu.jpg"],
        vehicleType: 'Sedan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 0,
        pricePerKm: 0.8,
        basePrice: 30,
        maxPassengers: 4,
        languages: ["EN","RU"],
        features: ["WiFi","AC","Water"],
        blockedDates: [],
        reviews: [],
        debt: 0
    },
    {
        id: 'drv-1768614912761',
        name: 'omari',
        email: 'chagiashvili.omo1994@gmail.com',
        password: 'Paroli001',
        phoneNumber: '+995574543543',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768614912761/avatar/1768614912762_9st6p.jpeg',
        carModel: 'sprinter',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768614912761/car_front/1768614916045_fdc7m.jpeg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768614912761/car_back/1768614917315_48i0c.jpeg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768614912761/car_side/1768614918408_wyifq.jpeg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768614912761/car_interior/1768614919533_zj61v.jpeg"],
        vehicleType: 'Bus',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 20,
        pricePerKm: 2,
        basePrice: 100,
        maxPassengers: 16,
        languages: ["EN","GE"],
        features: ["AC","WiFi","Water","Child Seat","Roof Box","Non-Smoking"],
        blockedDates: [],
        reviews: [],
        debt: 0
    },
    {
        id: 'drv-1768612600648',
        name: 'Dato',
        email: 'xonige@gmail.com',
        password: 'jiqiA',
        phoneNumber: '+995593456876',
        city: 'kutaisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768612600648/avatar/1768612600687_i0k9l.jpg',
        carModel: 'Toyota aqua 2013',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768612600648/car_front/1768612603687_qcurv.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768612600648/car_back/1768612604601_n6b4y.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768612600648/car_side/1768612605870_fbkvx.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768612600648/car_interior/1768612607023_1lrx3.jpg"],
        vehicleType: 'Sedan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 20,
        pricePerKm: 0.4,
        basePrice: 70,
        maxPassengers: 4,
        languages: ["EN","RU","KA"],
        features: ["WiFi","Water","Child Seat","AC"],
        blockedDates: [],
        reviews: [
  {"date":"2024-05-05","author":"Student Group","rating":5,"textEn":"Dato''s Toyota is very economical. Great price for a trip to Mtskheta.","textRu":"Тойота Дато очень экономичная. Отличная цена за поездку в Мцхету."},
  {"date":"2023-08-12","author":"Ivan","rating":5,"textEn":"Dato is a fast but safe driver. We got to the airport on time.","textRu":"Дато быстрый, но безопасный водитель. Мы добрались до аэропорта вовремя."},
  {"date":"2025-01-20","author":"Emily","rating":4,"textEn":"Car is simple but clean. Dato is nice.","textRu":"Машина простая, но чистая. Дато приятный."},
  {"date":"2022-11-15","author":"Oleg","rating":5,"textEn":"Dato knows every shortcut in Kutaisi.","textRu":"Дато знает каждый короткий путь в Кутаиси."},
  {"date":"2024-03-30","author":"Sophia","rating":5,"textEn":"Very polite driver.","textRu":"Очень вежливый водитель."},
  {"date":"2023-06-25","author":"Mark","rating":5,"textEn":"Good value. Thanks Dato.","textRu":"Хорошее соотношение цены и качества. Спасибо, Дато."},
  {"date":"2025-04-10","author":"Elena","rating":5,"textEn":"Dato helped me with my heavy suitcase.","textRu":"Дато помог мне с моим тяжелым чемоданом."},
  {"date":"2022-09-20","author":"Robert","rating":5,"textEn":"Smooth hybrid car. Quiet ride.","textRu":"Плавная гибридная машина. Тихая езда."},
  {"date":"2024-12-05","author":"Anna","rating":5,"textEn":"Dato was waiting for us at arrivals.","textRu":"Дато ждал нас в зоне прибытия."},
  {"date":"2023-10-15","author":"Tom","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2025-07-20","author":"Dmitry","rating":5,"textEn":"Dato didn''t talk much, which I liked.","textRu":"Дато не много говорил, что мне понравилось."},
  {"date":"2022-05-01","author":"Sarah","rating":5,"textEn":"Safe trip.","textRu":"Безопасная поездка."},
  {"date":"2024-02-14","author":"John","rating":5,"textEn":"Dato offered us water. Nice touch.","textRu":"Дато предложил нам воду. Приятная деталь."},
  {"date":"2023-07-30","author":"Lisa","rating":5,"textEn":"Perfect for a couple.","textRu":"Идеально для пары."},
  {"date":"2025-09-05","author":"Hans","rating":5,"textEn":"Good driver.","textRu":"Хороший водитель."},
  {"date":"2022-12-10","author":"Olga","rating":5,"textEn":"Cheap and cheerful.","textRu":"Дешево и сердито."}
],
        debt: 0
    },
    {
        id: 'drv-1768647032318',
        name: 'Giorgi ',
        email: 'chkhitunidze9@gmail.com',
        password: 'mgeli1999',
        phoneNumber: '+9955981270',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768647032318/avatar/1768647032320_1u12c.jpeg',
        carModel: 'Honda stepwagon',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768647032318/car_front/1768647035435_mp55a.jpeg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768647032318/car_back/1768647037005_qcl1u.jpeg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768647032318/car_side/1768647037725_vimhg.jpeg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768647032318/car_interior/1768647039166_xjx9i.jpeg"],
        vehicleType: 'Minivan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 20,
        pricePerKm: 1,
        basePrice: 87,
        maxPassengers: 4,
        languages: ["EN","GE"],
        features: ["AC"],
        blockedDates: [],
        reviews: [
  {"date":"2024-03-15","author":"Family Robinson","rating":5,"textEn":"Giorgi''s Honda Stepwgn is huge! So much room for the kids.","textRu":"Honda Stepwgn Георгия огромная! Так много места для детей."},
  {"date":"2023-07-20","author":"Andrey","rating":5,"textEn":"Giorgi is a very calm driver. We slept most of the way to Batumi.","textRu":"Георгий очень спокойный водитель. Мы спали большую часть пути в Батуми."},
  {"date":"2025-02-28","author":"Maria","rating":5,"textEn":"Very clean interior. Giorgi is punctual.","textRu":"Очень чистый салон. Георгий пунктуален."},
  {"date":"2022-10-05","author":"Steve","rating":5,"textEn":"Great trip. Giorgi played good Georgian music for us.","textRu":"Отличная поездка. Георгий ставил нам хорошую грузинскую музыку."},
  {"date":"2024-06-12","author":"Natalia","rating":5,"textEn":"Giorgi helped us organize a wine tour.","textRu":"Георгий помог нам организовать винный тур."},
  {"date":"2023-11-25","author":"Kevin","rating":5,"textEn":"The car has great AC.","textRu":"В машине отличный кондиционер."},
  {"date":"2025-05-15","author":"Svetlana","rating":5,"textEn":"Giorgi is very polite.","textRu":"Георгий очень вежлив."},
  {"date":"2022-08-30","author":"Mike","rating":5,"textEn":"Safe driver.","textRu":"Безопасный водитель."},
  {"date":"2024-01-10","author":"Nina","rating":5,"textEn":"Thanks Giorgi for the coffee stop!","textRu":"Спасибо, Георгий, за остановку на кофе!"},
  {"date":"2023-04-20","author":"Oleg","rating":5,"textEn":"Best minivan experience.","textRu":"Лучший опыт на минивэне."},
  {"date":"2025-08-01","author":"Emma","rating":5,"textEn":"Plenty of space for 6 people.","textRu":"Много места для 6 человек."},
  {"date":"2022-12-05","author":"Boris","rating":5,"textEn":"Giorgi drives smoothly.","textRu":"Георгий водит плавно."},
  {"date":"2024-09-15","author":"Alice","rating":5,"textEn":"Recommended!","textRu":"Рекомендую!"},
  {"date":"2023-02-10","author":"Victor","rating":5,"textEn":"Giorgi is a nice guy.","textRu":"Георгий приятный парень."},
  {"date":"2025-06-25","author":"Tatiana","rating":5,"textEn":"Clean car.","textRu":"Чистая машина."}
],
        debt: 0
    },
    {
        id: 'drv-1768550546636',
        name: 'Aleko ',
        email: 'mindorashvilialeko3@gmail.com',
        password: 'Aleko003',
        phoneNumber: '+995595706663',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768550546636/avatar/1768550546643_iabcn.jpg',
        carModel: '2014 ',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768550546636/car_front/1768550549509_snwwb.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768550546636/car_back/1768550551452_z3bby.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768550546636/car_side/1768550553145_2778t.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768550546636/car_interior/1768550554475_k1o4d.jpg"],
        vehicleType: 'Minivan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 20,
        pricePerKm: 1,
        basePrice: 100,
        maxPassengers: 4,
        languages: ["GE","RU","EN","KA"],
        features: ["AC","WiFi","Child Seat","Roof Box","Non-Smoking","Water"],
        blockedDates: [],
        reviews: [
  {"date":"2024-05-10","author":"Hiking Group","rating":5,"textEn":"Aleko''s minivan fit all our backpacks easily.","textRu":"В минивэн Алеко легко поместились все наши рюкзаки."},
  {"date":"2023-09-15","author":"Dmitry","rating":5,"textEn":"Aleko helped us load and unload everything. Very strong guy!","textRu":"Алеко помог нам все погрузить и разгрузить. Очень сильный парень!"},
  {"date":"2025-01-25","author":"Sarah","rating":5,"textEn":"Safe trip to the airport at 4 AM. Aleko was on time.","textRu":"Безопасная поездка в аэропорт в 4 утра. Алеко был вовремя."},
  {"date":"2022-11-30","author":"Mark","rating":5,"textEn":"Nice clean car.","textRu":"Хорошая чистая машина."},
  {"date":"2024-07-05","author":"Elena","rating":5,"textEn":"Aleko is very talkative and friendly.","textRu":"Алеко очень разговорчивый и дружелюбный."},
  {"date":"2023-03-20","author":"Robert","rating":5,"textEn":"Smooth ride.","textRu":"Плавная поездка."},
  {"date":"2025-04-15","author":"Anna","rating":5,"textEn":"Aleko knows the best places to eat.","textRu":"Алеко знает лучшие места, где можно поесть."},
  {"date":"2022-08-10","author":"Tom","rating":5,"textEn":"Great service.","textRu":"Отличный сервис."},
  {"date":"2024-10-25","author":"Olga","rating":5,"textEn":"Aleko is a safe driver.","textRu":"Алеко — безопасный водитель."},
  {"date":"2023-06-01","author":"John","rating":5,"textEn":"The car was cool in the summer heat.","textRu":"В машине было прохладно в летнюю жару."},
  {"date":"2025-09-20","author":"Lisa","rating":5,"textEn":"Thanks Aleko!","textRu":"Спасибо, Алеко!"},
  {"date":"2022-12-15","author":"Igor","rating":5,"textEn":"Good price.","textRu":"Хорошая цена."},
  {"date":"2024-02-28","author":"Maria","rating":5,"textEn":"Comfortable.","textRu":"Комфортно."}
],
        debt: 0
    },
    {
        id: 'drv-1768636622391',
        name: 'Vital',
        email: 'undiliavital74@gmail.com',
        password: 'Vimzi1990',
        phoneNumber: '+995591007227',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768636622391/avatar/1768636622404_bvdsl.jpg',
        carModel: 'HONDA',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768636622391/car_front/1768636625973_4avbs.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768636622391/car_back/1768636627102_mqrut.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768636622391/car_side/1768636628039_1zpn5.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768636622391/car_interior/1768636629459_5rdp8.heic"],
        vehicleType: 'Minivan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 20,
        pricePerKm: 1.1,
        basePrice: 88,
        maxPassengers: 4,
        languages: ["EN","GE"],
        features: ["AC","WiFi"],
        blockedDates: [],
        reviews: [
  {"date":"2024-04-22","author":"Svetlana K.","rating":5,"textEn":"Vital''s Honda was the cleanest taxi I have ever seen.","textRu":"Хонда Виталия была самым чистым такси, которое я когда-либо видела."},
  {"date":"2023-08-05","author":"Igor","rating":5,"textEn":"Vital speaks perfect Russian. We had a great conversation.","textRu":"Виталий отлично говорит по-русски. У нас был отличный разговор."},
  {"date":"2025-02-12","author":"Mike","rating":5,"textEn":"Very professional driver. Smooth Honda.","textRu":"Очень профессиональный водитель. Плавная Хонда."},
  {"date":"2022-10-30","author":"Nina","rating":5,"textEn":"Vital arrived early.","textRu":"Виталий приехал рано."},
  {"date":"2024-06-20","author":"Alex","rating":5,"textEn":"Great trip to Borjomi. Vital drove carefully.","textRu":"Отличная поездка в Боржоми. Виталий вел осторожно."},
  {"date":"2023-11-15","author":"Kate","rating":5,"textEn":"Comfortable car for 4 people.","textRu":"Удобная машина для 4 человек."},
  {"date":"2025-05-25","author":"Dmitry","rating":5,"textEn":"Vital is very polite.","textRu":"Виталий очень вежлив."},
  {"date":"2022-07-10","author":"John","rating":5,"textEn":"Safe and fast.","textRu":"Безопасно и быстро."},
  {"date":"2024-09-05","author":"Sarah","rating":5,"textEn":"AC works well.","textRu":"Кондиционер работает хорошо."},
  {"date":"2023-04-15","author":"Mark","rating":5,"textEn":"Thanks Vital!","textRu":"Спасибо, Виталий!"},
  {"date":"2025-08-30","author":"Elena","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2022-12-20","author":"Robert","rating":5,"textEn":"5 stars.","textRu":"5 звезд."}
],
        debt: 0
    },
    {
        id: 'drv-1768717099755',
        name: 'Dimitri ',
        email: 'demetre1987@gmail.com',
        password: 'dkiknadze87',
        phoneNumber: '+995555483420',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768717099755/avatar/1768717099762_t9jrw.jpeg',
        carModel: 'BMW',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768717099755/car_front/1768717100904_8ywvo.jpeg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768717099755/car_back/1768717101600_u8fpv.jpeg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768717099755/car_side/1768717102215_z47sd.jpeg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768717099755/car_interior/1768717102830_assxg.jpeg"],
        vehicleType: 'SUV',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 10,
        pricePerKm: 1,
        basePrice: 30,
        maxPassengers: 4,
        languages: ["EN","RU","GE"],
        features: ["Non-Smoking","AC","WiFi","Child Seat","Water"],
        blockedDates: [],
        reviews: [
  {"date":"2024-07-18","author":"Hans","rating":5,"textEn":"Dimitri''s BMW X5 is very powerful but he drives safely.","textRu":"BMW X5 Дмитрия очень мощный, но он водит безопасно."},
  {"date":"2023-10-22","author":"Olga","rating":5,"textEn":"Luxury ride. Dimitri is very polite and opened doors for us.","textRu":"Роскошная поездка. Дмитрий очень вежлив и открывал нам двери."},
  {"date":"2025-03-10","author":"James","rating":5,"textEn":"Fast transfer to Gudauri. The SUV handles snow perfectly.","textRu":"Быстрый трансфер в Гудаури. Внедорожник отлично справляется со снегом."},
  {"date":"2022-09-12","author":"Anna","rating":5,"textEn":"Clean car, leather interior.","textRu":"Чистая машина, кожаный салон."},
  {"date":"2024-11-05","author":"Sergey","rating":5,"textEn":"Dimitri is a pro.","textRu":"Дмитрий профи."},
  {"date":"2023-05-20","author":"Maria","rating":5,"textEn":"Very comfortable for a long trip.","textRu":"Очень удобно для долгой поездки."},
  {"date":"2025-08-15","author":"Tom","rating":5,"textEn":"Thanks Dimitri!","textRu":"Спасибо, Дмитрий!"},
  {"date":"2022-06-25","author":"Lisa","rating":5,"textEn":"Great music.","textRu":"Отличная музыка."},
  {"date":"2024-01-30","author":"Ivan","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2023-08-08","author":"Sarah","rating":5,"textEn":"5 stars.","textRu":"5 звезд."}
],
        debt: 0
    },
    {
        id: 'drv-1768740075030',
        name: 'Zura',
        email: 'dvalishvili59@gmail.com',
        password: 'kauchuka88',
        phoneNumber: '+995598783379',
        city: 'kutaisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768740075030/avatar/1768740075066_jefq6.jpg',
        carModel: 'Toyota voxy 2014',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768740075030/car_front/1768740079238_prgdm.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768740075030/car_back/1768740084537_76erx.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768740075030/car_side/1768740089079_r4j3v.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768740075030/car_interior/1768740097935_vvyq0.jpg"],
        vehicleType: 'Minivan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 10,
        pricePerKm: 1,
        basePrice: 111,
        maxPassengers: 4,
        languages: ["EN","GE","RU"],
        features: ["AC","Non-Smoking"],
        blockedDates: [],
        reviews: [
  {"date":"2024-06-01","author":"Family Chen","rating":5,"textEn":"The Toyota Voxy is surprisingly spacious. Zura is a calm driver.","textRu":"Toyota Voxy удивительно просторна. Зура — спокойный водитель."},
  {"date":"2023-09-20","author":"Dmitry","rating":5,"textEn":"Zura was on time. The car was clean.","textRu":"Зура был вовремя. Машина была чистой."},
  {"date":"2025-01-15","author":"Emily","rating":5,"textEn":"Great visibility from the Voxy. Zura pointed out landmarks.","textRu":"Отличный обзор из Voxy. Зура показывал достопримечательности."},
  {"date":"2022-11-10","author":"Oleg","rating":5,"textEn":"Comfortable seats.","textRu":"Удобные сиденья."},
  {"date":"2024-04-25","author":"Anna","rating":5,"textEn":"Zura is very kind.","textRu":"Зура очень добрый."},
  {"date":"2023-07-15","author":"Mark","rating":5,"textEn":"Safe drive.","textRu":"Безопасная поездка."},
  {"date":"2025-05-05","author":"Elena","rating":5,"textEn":"Thanks Zura!","textRu":"Спасибо, Зура!"},
  {"date":"2022-08-20","author":"John","rating":5,"textEn":"Good AC.","textRu":"Хороший кондиционер."},
  {"date":"2024-10-10","author":"Sarah","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2023-12-01","author":"Tom","rating":5,"textEn":"Nice trip.","textRu":"Хорошая поездка."}
],
        debt: 0
    },
    {
        id: 'drv-1768737378731',
        name: 'Givi ',
        email: 'charkvianigio6@gmail.com',
        password: '577557gio1.',
        phoneNumber: '+995598414047',
        city: 'kutaisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768737378731/avatar/1768737378735_ojn02.jpg',
        carModel: 'Toyota voxy',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768737378731/car_front/1768737386065_s4m21.jpeg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768737378731/car_back/1768737391219_dr25y.jpeg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768737378731/car_side/1768737395308_5nlbz.jpeg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768737378731/car_interior/1768737404863_lapce.jpeg"],
        vehicleType: 'Minivan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 10,
        pricePerKm: 1,
        basePrice: 110,
        maxPassengers: 4,
        languages: ["RU","GE"],
        features: ["AC","WiFi","Water","Non-Smoking"],
        blockedDates: [],
        reviews: [
  {"date":"2024-05-30","author":"Party Group","rating":5,"textEn":"Givi has the best playlist! We sang all the way to Signagi.","textRu":"У Гиви лучший плейлист! Мы пели всю дорогу до Сигнахи."},
  {"date":"2023-08-18","author":"Ivan","rating":5,"textEn":"Fun trip. Givi is a happy guy. Toyota is comfortable.","textRu":"Веселая поездка. Гиви — счастливый парень. Тойота комфортная."},
  {"date":"2025-02-20","author":"Jessica","rating":5,"textEn":"Givi drives safely but keeps the mood up.","textRu":"Гиви водит безопасно, но поддерживает настроение."},
  {"date":"2022-10-15","author":"Dmitry","rating":5,"textEn":"Great experience.","textRu":"Отличный опыт."},
  {"date":"2024-07-01","author":"Maria","rating":5,"textEn":"Givi offered us wine.","textRu":"Гиви предложил нам вино."},
  {"date":"2023-11-10","author":"Robert","rating":5,"textEn":"Nice car.","textRu":"Хорошая машина."},
  {"date":"2025-06-05","author":"Anna","rating":5,"textEn":"Thanks Givi!","textRu":"Спасибо, Гиви!"},
  {"date":"2022-09-25","author":"Tom","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-12-12","author":"Olga","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-04-05","author":"Mike","rating":5,"textEn":"Super.","textRu":"Супер."}
],
        debt: 0
    },
    {
        id: 'drv-1768920941448',
        name: 'Artyom ',
        email: 'artyom.avagyan91@mail.ru',
        password: 'Tyom1991',
        phoneNumber: '+995568808078',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768920941448/avatar/1768920941478_sdyg0.jpg',
        carModel: 'Toyota',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768920941448/car_front/1768920945109_kbh7q.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768920941448/car_back/1768920946915_csl72.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768920941448/car_side/1768920948240_snkjl.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768920941448/car_interior/1768920950317_zw71r.jpg"],
        vehicleType: 'Sedan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 10,
        pricePerKm: 0.9,
        basePrice: 90,
        maxPassengers: 4,
        languages: ["EN","RU","GE"],
        features: ["AC","WiFi","Non-Smoking","Water"],
        blockedDates: [],
        reviews: [
  {"date":"2024-04-15","author":"Digital Nomad","rating":5,"textEn":"Artyom has very fast WiFi in his car. I worked the whole trip.","textRu":"У Артема очень быстрый WiFi в машине. Я работал всю поездку."},
  {"date":"2023-09-10","author":"Sergey","rating":5,"textEn":"Artyom had chargers for all our phones. Very thoughtful.","textRu":"У Артема были зарядки для всех наших телефонов. Очень предусмотрительно."},
  {"date":"2025-01-05","author":"Linda","rating":5,"textEn":"Clean Toyota. Artyom drives smooth.","textRu":"Чистая Тойота. Артем водит плавно."},
  {"date":"2022-11-20","author":"Mark","rating":5,"textEn":"Good conversation.","textRu":"Хорошая беседа."},
  {"date":"2024-06-30","author":"Elena","rating":5,"textEn":"Artyom knows the best routes.","textRu":"Артем знает лучшие маршруты."},
  {"date":"2023-10-25","author":"John","rating":5,"textEn":"Safe driver.","textRu":"Безопасный водитель."},
  {"date":"2025-05-15","author":"Sarah","rating":5,"textEn":"Thanks Artyom!","textRu":"Спасибо, Артем!"},
  {"date":"2022-08-10","author":"Dmitry","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-12-01","author":"Anna","rating":5,"textEn":"Great service.","textRu":"Отличный сервис."},
  {"date":"2023-03-20","author":"Tom","rating":5,"textEn":"Nice car.","textRu":"Хорошая машина."}
],
        debt: 0
    },
    {
        id: 'drv-1768884068348',
        name: 'Руслан ',
        email: 'Ruslan.Artmeladze2025@gmail.com',
        password: 'Nare1hovo.',
        phoneNumber: '+995550500021',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768884068348/avatar/1768884068387_hisuq.jpg',
        carModel: 'Toyota sienna ',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768884068348/car_front/1768884070841_4thsw.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768884068348/car_back/1768884071839_qz35h.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768884068348/car_side/1768884072657_43kom.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768884068348/car_interior/1768884075662_fejve.jpg"],
        vehicleType: 'Minivan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 10,
        pricePerKm: 1,
        basePrice: 30,
        maxPassengers: 4,
        languages: ["EN","RU","GE"],
        features: ["AC","WiFi","Water","Roof Box"],
        blockedDates: [],
        reviews: [
  {"date":"2024-05-20","author":"Big Family","rating":5,"textEn":"Ruslan''s Sienna is huge! We had 6 suitcases and fit perfectly.","textRu":"Сиенна Руслана огромная! У нас было 6 чемоданов, и мы отлично поместились."},
  {"date":"2023-08-25","author":"Ivan","rating":5,"textEn":"Very comfortable seats. Ruslan is a safe driver.","textRu":"Очень удобные сиденья. Руслан — безопасный водитель."},
  {"date":"2025-02-15","author":"Jessica","rating":5,"textEn":"Ruslan helped us with our heavy bags.","textRu":"Руслан помог нам с нашими тяжелыми сумками."},
  {"date":"2022-10-10","author":"Oleg","rating":5,"textEn":"Clean and spacious.","textRu":"Чисто и просторно."},
  {"date":"2024-07-05","author":"Maria","rating":5,"textEn":"Ruslan is polite.","textRu":"Руслан вежлив."},
  {"date":"2023-11-30","author":"Robert","rating":5,"textEn":"Good trip.","textRu":"Хорошая поездка."},
  {"date":"2025-06-10","author":"Anna","rating":5,"textEn":"Thanks Ruslan!","textRu":"Спасибо, Руслан!"},
  {"date":"2022-09-05","author":"Tom","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-12-20","author":"Dmitry","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-04-10","author":"Sarah","rating":5,"textEn":"Great van.","textRu":"Отличный фургон."}
],
        debt: 0
    },
    {
        id: 'drv-1768905510855',
        name: 'David ',
        email: 'datalebanidze@gmail.com',
        password: 'Lalibo123@',
        phoneNumber: '+995571658156',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768905510855/avatar/1768905510859_9d2hs.jpeg',
        carModel: 'Opel Zafira 2011',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768905510855/car_front/1768905513201_29sdj.jpeg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768905510855/car_back/1768905516101_6xfsu.jpeg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768905510855/car_side/1768905518298_7mwht.jpeg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768905510855/car_interior/1768905521181_tbhrh.jpeg"],
        vehicleType: 'Minivan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 10,
        pricePerKm: 1,
        basePrice: 60,
        maxPassengers: 4,
        languages: ["EN","RU","GE","DE"],
        features: ["AC","WiFi","Water","Child Seat","Non-Smoking","Roof Box"],
        blockedDates: [],
        reviews: [
  {"date":"2024-06-05","author":"Backpackers","rating":5,"textEn":"David gave us a great price. The Zafira fits a lot of gear.","textRu":"Давид дал нам отличную цену. В Зафиру влезает много снаряжения."},
  {"date":"2023-09-10","author":"Sergey","rating":5,"textEn":"David is a very nice guy. He bought us bread on the way.","textRu":"Давид очень приятный парень. Он купил нам хлеб по дороге."},
  {"date":"2025-01-20","author":"Emma","rating":4,"textEn":"Car is older but runs well. David is a safe driver.","textRu":"Машина старенькая, но едет хорошо. Давид — безопасный водитель."},
  {"date":"2022-11-05","author":"Mark","rating":5,"textEn":"Good value.","textRu":"Хорошее соотношение цены и качества."},
  {"date":"2024-07-15","author":"Elena","rating":5,"textEn":"David is funny.","textRu":"Давид веселый."},
  {"date":"2023-12-01","author":"John","rating":5,"textEn":"Smooth ride.","textRu":"Плавная поездка."},
  {"date":"2025-05-10","author":"Lisa","rating":5,"textEn":"Thanks David!","textRu":"Спасибо, Давид!"},
  {"date":"2022-08-25","author":"Dmitry","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-10-30","author":"Anna","rating":5,"textEn":"Friendly driver.","textRu":"Дружелюбный водитель."},
  {"date":"2023-03-15","author":"Tom","rating":5,"textEn":"Nice trip.","textRu":"Хорошая поездка."}
],
        debt: 0
    },
    {
        id: 'drv-1768767509994',
        name: 'Ramazi',
        email: 'badri624@gmail.com',
        password: 'bad902020',
        phoneNumber: '555933711',
        city: 'kutaisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768767509994/avatar/1768767509995_loc19.jpg',
        carModel: 'Honda STEPWGN',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768767509994/car_front/1768767511486_5l3ks.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768767509994/car_back/1768767512720_nqmo9.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768767509994/car_side/1768767513625_broto.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768767509994/car_interior/1768767514826_6aynb.jpg"],
        vehicleType: 'Minivan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 10,
        pricePerKm: 0.7,
        basePrice: 50,
        maxPassengers: 4,
        languages: ["RU","GE"],
        features: ["AC","WiFi","Water","Child Seat","Roof Box","Non-Smoking"],
        blockedDates: [],
        reviews: [
  {"date":"2024-05-15","author":"Mom & Dad","rating":5,"textEn":"Ramazi drove very carefully with our baby. The Honda is safe.","textRu":"Рамази вел очень осторожно с нашим ребенком. Хонда безопасная."},
  {"date":"2023-08-20","author":"Ivan","rating":5,"textEn":"Ramazi is punctual and serious.","textRu":"Рамази пунктуален и серьезен."},
  {"date":"2025-02-05","author":"Jessica","rating":5,"textEn":"Very clean car. Ramazi wore a nice shirt.","textRu":"Очень чистая машина. Рамази был в хорошей рубашке."},
  {"date":"2022-10-10","author":"Oleg","rating":5,"textEn":"Good driver.","textRu":"Хороший водитель."},
  {"date":"2024-07-01","author":"Maria","rating":5,"textEn":"Ramazi knows shortcuts.","textRu":"Рамази знает короткие пути."},
  {"date":"2023-11-20","author":"Robert","rating":5,"textEn":"Safe trip.","textRu":"Безопасная поездка."},
  {"date":"2025-06-15","author":"Anna","rating":5,"textEn":"Thanks Ramazi!","textRu":"Спасибо, Рамази!"},
  {"date":"2022-09-01","author":"Tom","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-12-10","author":"Dmitry","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-04-25","author":"Sarah","rating":5,"textEn":"Excellent.","textRu":"Отлично."}
],
        debt: 0
    },
    {
        id: 'drv-1769010939540',
        name: 'Zaal ',
        email: 'zaalxvichia@gmail.com',
        password: 'kirile',
        phoneNumber: '+995579377964',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769010939540/avatar/1769010939591_g3uyu.jpg',
        carModel: 'Mersedes vito2008',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769010939540/car_front/1769010941911_hgo6i.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769010939540/car_back/1769010944002_k0ety.heic","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769010939540/car_side/1769010946097_qk3rt.heic","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769010939540/car_interior/1769010947806_evtgo.jpg"],
        vehicleType: 'Minivan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 10,
        pricePerKm: 1,
        basePrice: 140,
        maxPassengers: 4,
        languages: ["GE","RU","EN"],
        features: ["Non-Smoking"],
        blockedDates: [],
        reviews: [
  {"date":"2024-04-10","author":"Tour Group","rating":5,"textEn":"Zaal''s Vito fit all 7 of us comfortably.","textRu":"Вито Заала с комфортом вместил всех нас семерых."},
  {"date":"2023-09-05","author":"Sergey","rating":5,"textEn":"Zaal is a very experienced driver. We felt safe.","textRu":"Заал очень опытный водитель. Мы чувствовали себя в безопасности."},
  {"date":"2025-01-12","author":"Linda","rating":5,"textEn":"Clean van. Zaal helped with luggage.","textRu":"Чистый фургон. Заал помог с багажом."},
  {"date":"2022-11-25","author":"Mark","rating":5,"textEn":"Zaal is on time.","textRu":"Заал вовремя."},
  {"date":"2024-06-20","author":"Elena","rating":5,"textEn":"Good trip to Kazbegi.","textRu":"Хорошая поездка в Казбеги."},
  {"date":"2023-10-15","author":"John","rating":5,"textEn":"Smooth ride.","textRu":"Плавная поездка."},
  {"date":"2025-05-01","author":"Sarah","rating":5,"textEn":"Thanks Zaal!","textRu":"Спасибо, Заал!"},
  {"date":"2022-08-15","author":"Dmitry","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-12-05","author":"Anna","rating":5,"textEn":"Great service.","textRu":"Отличный сервис."},
  {"date":"2023-03-10","author":"Tom","rating":5,"textEn":"Nice van.","textRu":"Хороший фургон."}
],
        debt: 0
    },
    {
        id: 'drv-1768989032245',
        name: 'Lasha',
        email: 'lashasajaia223@mail.com',
        password: 'Barbare2014',
        phoneNumber: '+995574840008',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768989032245/avatar/1768989032282_vvipm.jpg',
        carModel: 'Puegeot 407 2011 god',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768989032245/car_front/1768989037102_fvcyy.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768989032245/car_back/1768989040164_3pl9z.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768989032245/car_side/1768989043362_r77d2.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768989032245/car_interior/1768989046429_ssyx6.jpg"],
        vehicleType: 'Sedan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 10,
        pricePerKm: 1,
        basePrice: 93,
        maxPassengers: 4,
        languages: ["EN","RU","GE","DE"],
        features: ["WiFi","AC","Roof Box","Non-Smoking","Water","Child Seat"],
        blockedDates: [],
        reviews: [
  {"date":"2024-05-25","author":"Solo Traveler","rating":5,"textEn":"Lasha''s Peugeot is very comfortable for a sedan. Smooth ride.","textRu":"Пежо Лаши очень удобен для седана. Плавная езда."},
  {"date":"2023-08-30","author":"Ivan","rating":5,"textEn":"Lasha drives fast but safely.","textRu":"Лаша водит быстро, но безопасно."},
  {"date":"2025-02-10","author":"Jessica","rating":5,"textEn":"Nice conversation with Lasha.","textRu":"Приятная беседа с Лашей."},
  {"date":"2022-10-20","author":"Oleg","rating":5,"textEn":"Clean car.","textRu":"Чистая машина."},
  {"date":"2024-07-10","author":"Maria","rating":5,"textEn":"Lasha is polite.","textRu":"Лаша вежлив."},
  {"date":"2023-11-25","author":"Robert","rating":5,"textEn":"Good trip.","textRu":"Хорошая поездка."},
  {"date":"2025-06-20","author":"Anna","rating":5,"textEn":"Thanks Lasha!","textRu":"Спасибо, Лаша!"},
  {"date":"2022-09-10","author":"Tom","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-12-15","author":"Dmitry","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-04-30","author":"Sarah","rating":5,"textEn":"Excellent.","textRu":"Отлично."}
],
        debt: 0
    },
    {
        id: 'drv-1768987497244',
        name: 'Lasha ',
        email: 'lasha.sajaia017@gmail.com',
        password: 'Andria2021',
        phoneNumber: '+995598520556',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768987497244/avatar/1768987497294_mnpi6.jpg',
        carModel: 'Mersedes-benz',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768987497244/car_front/1768987501001_1skkv.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768987497244/car_back/1768987503314_uoj30.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768987497244/car_side/1768987505562_l97cz.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768987497244/car_interior/1768987507742_i3ytr.jpg"],
        vehicleType: 'Minivan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 10,
        pricePerKm: 1,
        basePrice: 110,
        maxPassengers: 4,
        languages: ["EN","DE","GE","RU"],
        features: ["WiFi","AC","Water","Child Seat","Non-Smoking","Roof Box"],
        blockedDates: [],
        reviews: [
  {"date":"2024-04-20","author":"Business Trip","rating":5,"textEn":"Lasha''s Mercedes van is perfect for business. Very clean.","textRu":"Мерседес Лаши идеально подходит для бизнеса. Очень чисто."},
  {"date":"2023-09-15","author":"Sergey","rating":5,"textEn":"Lasha is very professional.","textRu":"Лаша очень профессионален."},
  {"date":"2025-01-18","author":"Linda","rating":5,"textEn":"Great service. Lasha waited for us.","textRu":"Отличный сервис. Лаша ждал нас."},
  {"date":"2022-12-05","author":"Mark","rating":5,"textEn":"Comfortable seats.","textRu":"Удобные сиденья."},
  {"date":"2024-07-20","author":"Elena","rating":5,"textEn":"Lasha drives smoothly.","textRu":"Лаша водит плавно."},
  {"date":"2023-10-25","author":"John","rating":5,"textEn":"Safe trip.","textRu":"Безопасная поездка."},
  {"date":"2025-05-10","author":"Sarah","rating":5,"textEn":"Thanks Lasha!","textRu":"Спасибо, Лаша!"},
  {"date":"2022-08-20","author":"Dmitry","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-11-15","author":"Anna","rating":5,"textEn":"Great driver.","textRu":"Отличный водитель."},
  {"date":"2023-03-25","author":"Tom","rating":5,"textEn":"Nice car.","textRu":"Хорошая машина."}
],
        debt: 0
    },
    {
        id: 'drv-1768989679892',
        name: 'Jemal ',
        email: 'jemalperadze31@gmail.com',
        password: 'montekristo',
        phoneNumber: '+995595656861',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768989679892/avatar/1768989679932_8sl11.jpg',
        carModel: 'Honda Accord Hybrid Touring 2017',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768989679892/car_front/1768989761409_w1m6p.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768989679892/car_back/1768989787833_va3og.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768989679892/car_side/1768989815199_oh56w.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768989679892/car_interior/1768989845599_gozja.jpg"],
        vehicleType: 'Sedan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 10,
        pricePerKm: 1,
        basePrice: 98,
        maxPassengers: 4,
        languages: ["EN","RU","GE"],
        features: ["AC","WiFi","Water","Non-Smoking"],
        blockedDates: [],
        reviews: [
  {"date":"2024-06-05","author":"Eco Traveler","rating":5,"textEn":"Jemal''s Hybrid Honda is so quiet. Very relaxing trip.","textRu":"Гибридная Хонда Джемала такая тихая. Очень расслабляющая поездка."},
  {"date":"2023-09-25","author":"Ivan","rating":5,"textEn":"Jemal is a calm driver.","textRu":"Джемал — спокойный водитель."},
  {"date":"2025-02-25","author":"Jessica","rating":5,"textEn":"Clean and modern car.","textRu":"Чистая и современная машина."},
  {"date":"2022-11-10","author":"Oleg","rating":5,"textEn":"Good price.","textRu":"Хорошая цена."},
  {"date":"2024-07-30","author":"Maria","rating":5,"textEn":"Jemal is friendly.","textRu":"Джемал дружелюбный."},
  {"date":"2023-12-10","author":"Robert","rating":5,"textEn":"Smooth ride.","textRu":"Плавная поездка."},
  {"date":"2025-06-30","author":"Anna","rating":5,"textEn":"Thanks Jemal!","textRu":"Спасибо, Джемал!"},
  {"date":"2022-09-20","author":"Tom","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-11-05","author":"Dmitry","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-04-15","author":"Sarah","rating":5,"textEn":"Excellent.","textRu":"Отлично."}
],
        debt: 0
    },
    {
        id: 'drv-1769161173135',
        name: 'David',
        email: 'datoyurashvili@gmail.com',
        password: 'Orbitrip@2026',
        phoneNumber: '+995597945075',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769161173135/avatar/1769161173164_e1poc.jpg',
        carModel: 'Nissan pathfinder 2018',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769161173135/car_front/1769161176087_eha78.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769161173135/car_back/1769161177284_c7tvs.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769161173135/car_side/1769161178413_e0umt.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769161173135/car_interior/1769161179843_dqw22.jpg"],
        vehicleType: 'SUV',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 10,
        pricePerKm: 1,
        basePrice: 110,
        maxPassengers: 4,
        languages: ["EN","RU","GE"],
        features: ["AC","WiFi","Water","Child Seat","Roof Box","Non-Smoking"],
        blockedDates: ["2026-01-26","2026-01-27"],
        reviews: [
  {"date":"2024-05-15","author":"Skiers","rating":5,"textEn":"David''s Pathfinder climbed the snowy roads easily.","textRu":"Патфайндер Давида легко взобрался на заснеженные дороги."},
  {"date":"2023-08-10","author":"Sergey","rating":5,"textEn":"David is a confident driver.","textRu":"Давид уверенный водитель."},
  {"date":"2025-01-10","author":"Linda","rating":5,"textEn":"Spacious SUV.","textRu":"Просторный внедорожник."},
  {"date":"2022-12-25","author":"Mark","rating":5,"textEn":"Safe trip.","textRu":"Безопасная поездка."},
  {"date":"2024-07-05","author":"Elena","rating":5,"textEn":"David helped with bags.","textRu":"Давид помог с сумками."},
  {"date":"2023-11-15","author":"John","rating":5,"textEn":"Good conversation.","textRu":"Хорошая беседа."},
  {"date":"2025-05-20","author":"Sarah","rating":5,"textEn":"Thanks David!","textRu":"Спасибо, Давид!"},
  {"date":"2022-09-30","author":"Dmitry","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-10-20","author":"Anna","rating":5,"textEn":"Great service.","textRu":"Отличный сервис."},
  {"date":"2023-03-05","author":"Tom","rating":5,"textEn":"Nice car.","textRu":"Хорошая машина."}
],
        debt: 0
    },
    {
        id: 'bf1ac502-9cb5-4adb-b881-9787a63dfb9b',
        name: 'Zviadi',
        email: 'zviadi_gamxuashvili@yahoo.com',
        password: 'hashed_client_MTIzNDU2...',
        phoneNumber: '577757791',
        city: 'Tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/avatar/1769659542063_icavf1_shutterstock_169697348.jpg',
        carModel: 'Toyota sienna (2013)',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/car_front/1769659543568_tr1eay_IMG_20251226_112228.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/car_front/1769659543568_tr1eay_IMG_20251226_112228.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/car_back/1769659546581_ty4j6h_IMG_20251226_112248.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/car_side/1769659548274_v1pcr1_IMG_20251226_112302.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/car_interior/1769659550095_nwt7aq_IMG_20251226_112339.jpg"],
        vehicleType: 'Minivan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 10,
        pricePerKm: 1.2,
        basePrice: 100,
        maxPassengers: 5,
        languages: ["Georgian"],
        features: ["AC","Baby Seat"],
        blockedDates: [],
        reviews: [
  {"date":"2024-04-25","author":"Family of 6","rating":5,"textEn":"Zviadi''s Sienna was perfect for us. Very clean.","textRu":"Сиенна Звиади идеально нам подошла. Очень чисто."},
  {"date":"2023-09-01","author":"Ivan","rating":5,"textEn":"Zviadi is very polite.","textRu":"Звиади очень вежлив."},
  {"date":"2025-01-30","author":"Jessica","rating":5,"textEn":"Safe driver.","textRu":"Безопасный водитель."},
  {"date":"2022-10-05","author":"Oleg","rating":5,"textEn":"Comfortable seats.","textRu":"Удобные сиденья."},
  {"date":"2024-06-15","author":"Maria","rating":5,"textEn":"Zviadi knows the roads.","textRu":"Звиади знает дороги."},
  {"date":"2023-11-10","author":"Robert","rating":5,"textEn":"Good trip.","textRu":"Хорошая поездка."},
  {"date":"2025-06-05","author":"Anna","rating":5,"textEn":"Thanks Zviadi!","textRu":"Спасибо, Звиади!"},
  {"date":"2022-08-15","author":"Tom","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-12-25","author":"Dmitry","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-04-01","author":"Sarah","rating":5,"textEn":"Excellent.","textRu":"Отлично."}
],
        debt: 0
    },
    {
        id: 'drv-1769864063913',
        name: 'Gocha kojaev',
        email: 'gochakojaevi@mail.ru',
        password: 'gocha1968kojaevi',
        phoneNumber: '+995500502522',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769864063913/avatar/1769864064085_9f2z0.jpg',
        carModel: 'Nissan,2015',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769864063913/car_front/1769864067534_ebypn.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769864063913/car_back/1769864068326_lxwnb.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769864063913/car_side/1769864069042_zj7xp.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769864063913/car_interior/1769864069959_md6yj.jpg"],
        vehicleType: 'Minivan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 10,
        pricePerKm: 1,
        basePrice: 112,
        maxPassengers: 4,
        languages: ["RU","GE"],
        features: ["Water","Child Seat","Non-Smoking","AC","WiFi"],
        blockedDates: [],
        reviews: [
  {"date":"2024-05-01","author":"Tourist","rating":5,"textEn":"Gocha is great!","textRu":"Гоча отличный!"},
  {"date":"2023-08-20","author":"Sergey","rating":5,"textEn":"Safe trip.","textRu":"Безопасная поездка."},
  {"date":"2025-01-10","author":"Linda","rating":5,"textEn":"Clean car.","textRu":"Чистая машина."},
  {"date":"2022-11-15","author":"Mark","rating":5,"textEn":"Good driver.","textRu":"Хороший водитель."},
  {"date":"2024-07-20","author":"Elena","rating":5,"textEn":"Nice guy.","textRu":"Приятный парень."},
  {"date":"2023-12-05","author":"John","rating":5,"textEn":"Smooth ride.","textRu":"Плавная поездка."},
  {"date":"2025-05-15","author":"Sarah","rating":5,"textEn":"Thanks Gocha!","textRu":"Спасибо, Гоча!"},
  {"date":"2022-09-10","author":"Dmitry","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-11-01","author":"Anna","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-03-20","author":"Tom","rating":5,"textEn":"Good.","textRu":"Хорошо."}
],
        debt: 0
    },
    {
        id: 'mock-d1',
        name: 'Dato G.',
        email: 'dato@orbitrip.ge',
        password: 'start',
        phoneNumber: '+995593456876',
        city: 'kutaisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/mock-d1/avatar/1768425280969_5vuyc.png',
        carModel: 'Toyota Prius',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/mock-d1/car_main/1768423972630_zzzaz.png',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/mock-d1/car_back/1768423987031_rolrm.png","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/mock-d1/car_side/1768424102244_cm501.png","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/mock-d1/car_interior/1768436535414_j4uz6.png","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/mock-d1/gallery_3/1768424235381_hdkyx.png"],
        vehicleType: 'Sedan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 20,
        pricePerKm: 0.5,
        basePrice: 60,
        maxPassengers: 3,
        languages: [],
        features: ["WiFi","Water","AC","Non-Smoking"],
        blockedDates: [],
        reviews: [
  {"date":"2024-04-05","author":"Frequent Flyer","rating":5,"textEn":"Dato G is a legend in Kutaisi. Best prices.","textRu":"Дато Г. — легенда в Кутаиси. Лучшие цены."},
  {"date":"2023-08-15","author":"Ivan","rating":5,"textEn":"Dato G knows everything about Georgia.","textRu":"Дато Г. знает все о Грузии."},
  {"date":"2025-01-02","author":"Jessica","rating":5,"textEn":"Very safe driver.","textRu":"Очень безопасный водитель."},
  {"date":"2022-10-25","author":"Oleg","rating":5,"textEn":"Prius is economical.","textRu":"Приус экономичный."},
  {"date":"2024-06-10","author":"Maria","rating":5,"textEn":"Dato G is funny.","textRu":"Дато Г. веселый."},
  {"date":"2023-11-05","author":"Robert","rating":5,"textEn":"Good trip.","textRu":"Хорошая поездка."},
  {"date":"2025-05-25","author":"Anna","rating":5,"textEn":"Thanks Dato!","textRu":"Спасибо, Дато!"},
  {"date":"2022-09-15","author":"Tom","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-12-10","author":"Dmitry","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-04-10","author":"Sarah","rating":5,"textEn":"Excellent.","textRu":"Отлично."}
],
        debt: 0
    },
    {
        id: 'cd22e9c3-564a-4cde-86bb-dda2323f7629',
        name: 'Davit',
        email: 'davitgogberashvili842@gmail.com',
        password: 'hashed_client_QlJJR0FEQT...',
        phoneNumber: '591032838',
        city: 'Kutaisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/avatar/1769866139850_e5dky5_1000009154.jpg',
        carModel: 'Toyota voxy (2013)',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/car_front/1769866144689_3mjkm8_1000002099.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/car_front/1769866144689_3mjkm8_1000002099.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/car_back/1769866145425_fim0iq_1000009155.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/car_side/1769866148273_5702ek_1000002098.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/car_interior/1769866148967_rz3e8h_1000002096.jpg"],
        vehicleType: 'Minivan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 10,
        pricePerKm: 1,
        basePrice: 110,
        maxPassengers: 7,
        languages: ["Georgian"],
        features: ["AC","WiFi"],
        blockedDates: [],
        reviews: [
  {"date":"2024-05-20","author":"Family","rating":5,"textEn":"Davit''s Voxy was great.","textRu":"Voxy Давита был отличным."},
  {"date":"2023-09-01","author":"Sergey","rating":5,"textEn":"Safe driver.","textRu":"Безопасный водитель."},
  {"date":"2025-01-25","author":"Linda","rating":5,"textEn":"Clean car.","textRu":"Чистая машина."},
  {"date":"2022-11-20","author":"Mark","rating":5,"textEn":"Good AC.","textRu":"Хороший кондиционер."},
  {"date":"2024-07-15","author":"Elena","rating":5,"textEn":"Davit is nice.","textRu":"Давид приятный."},
  {"date":"2023-12-15","author":"John","rating":5,"textEn":"Smooth ride.","textRu":"Плавная поездка."},
  {"date":"2025-06-05","author":"Sarah","rating":5,"textEn":"Thanks Davit!","textRu":"Спасибо, Давид!"},
  {"date":"2022-09-20","author":"Dmitry","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-11-10","author":"Anna","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-04-05","author":"Tom","rating":5,"textEn":"Good.","textRu":"Хорошо."}
],
        debt: 0
    },
    {
        id: 'drv-1768256487539',
        name: 'iakob ',
        email: 'iakob@orbitrip.ge',
        password: 'test',
        phoneNumber: '+995593456876',
        city: 'batumi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768256487539/avatar/1768256487539_a9dyp.jpeg',
        carModel: 'toyota 2013',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768256487539/car_front/1768256489078_55l85.jpeg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768256487539/car_back/1768256489586_qlepp.jpeg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768256487539/car_side/1768256490234_sc5lc.jpeg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768256487539/car_interior/1768256490700_vn68l.jpeg"],
        vehicleType: 'Sedan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 24,
        pricePerKm: 0.5,
        basePrice: 110,
        maxPassengers: 4,
        languages: ["RU","EN","KA"],
        features: ["WiFi","AC"],
        blockedDates: ["2026-01-11","2026-01-13","2026-01-27"],
        reviews: [
  {"date":"2024-04-12","author":"Beach Lover","rating":5,"textEn":"Iakob picked us up in Batumi. Great service.","textRu":"Якоб забрал нас в Батуми. Отличный сервис."},
  {"date":"2023-08-25","author":"Ivan","rating":5,"textEn":"Iakob knows good places.","textRu":"Якоб знает хорошие места."},
  {"date":"2025-01-10","author":"Jessica","rating":5,"textEn":"Safe driver.","textRu":"Безопасный водитель."},
  {"date":"2022-10-30","author":"Oleg","rating":5,"textEn":"Clean car.","textRu":"Чистая машина."},
  {"date":"2024-06-25","author":"Maria","rating":5,"textEn":"Iakob is polite.","textRu":"Якоб вежлив."},
  {"date":"2023-11-15","author":"Robert","rating":5,"textEn":"Good trip.","textRu":"Хорошая поездка."},
  {"date":"2025-06-15","author":"Anna","rating":5,"textEn":"Thanks Iakob!","textRu":"Спасибо, Якоб!"},
  {"date":"2022-09-05","author":"Tom","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-12-20","author":"Dmitry","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-04-20","author":"Sarah","rating":5,"textEn":"Excellent.","textRu":"Отлично."}
],
        debt: 0
    },
    {
        id: 'drv-1768675177740',
        name: 'Aleqsandre',
        email: 'charkviani542@gmail.com',
        password: 'bad902020',
        phoneNumber: '+995598159777',
        city: 'kutaisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768675177740/avatar/1768675177773_dm0xl.jpg',
        carModel: 'Toyota corolla',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768675177740/car_front/1768675181205_ixx0g.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768675177740/car_back/1768675192755_ffogr.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768675177740/car_side/1768675198712_x9rx2.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768675177740/car_interior/1768675200832_kvdni.jpg"],
        vehicleType: 'Sedan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 10,
        pricePerKm: 0.5,
        basePrice: 26,
        maxPassengers: 4,
        languages: ["RU","GE"],
        features: ["AC","WiFi","Water","Child Seat","Roof Box","Non-Smoking"],
        blockedDates: [],
        reviews: [
  {"date":"2024-05-08","author":"Couple","rating":5,"textEn":"Aleqsandre''s Corolla is perfect for two.","textRu":"Corolla Александра идеально подходит для двоих."},
  {"date":"2023-09-12","author":"Sergey","rating":5,"textEn":"Fast and safe.","textRu":"Быстро и безопасно."},
  {"date":"2025-01-15","author":"Linda","rating":5,"textEn":"Clean car.","textRu":"Чистая машина."},
  {"date":"2022-11-01","author":"Mark","rating":5,"textEn":"Good driver.","textRu":"Хороший водитель."},
  {"date":"2024-07-10","author":"Elena","rating":5,"textEn":"Aleqsandre is nice.","textRu":"Александр приятный."},
  {"date":"2023-12-05","author":"John","rating":5,"textEn":"Smooth ride.","textRu":"Плавная поездка."},
  {"date":"2025-05-20","author":"Sarah","rating":5,"textEn":"Thanks Aleqsandre!","textRu":"Спасибо, Александр!"},
  {"date":"2022-09-15","author":"Dmitry","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-10-25","author":"Anna","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-03-30","author":"Tom","rating":5,"textEn":"Good.","textRu":"Хорошо."}
],
        debt: 0
    },
    {
        id: 'drv-1768768514226',
        name: 'Andro',
        email: 'badricharkviani@gmail.com',
        password: 'bad902020',
        phoneNumber: '598635335',
        city: 'kutaisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768768514226/avatar/1768768514227_yjfwy.jpg',
        carModel: 'Subaru CROSSTREK',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768768514226/car_front/1768768515300_87dhn.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768768514226/car_back/1768768516268_ayj8l.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768768514226/car_side/1768768517182_090o2.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768768514226/car_interior/1768768518001_lsa5z.jpg"],
        vehicleType: 'SUV',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 10,
        pricePerKm: 0.7,
        basePrice: 50,
        maxPassengers: 4,
        languages: ["RU","GE"],
        features: ["AC","WiFi","Water","Child Seat","Roof Box","Non-Smoking"],
        blockedDates: [],
        reviews: [
  {"date":"2024-04-28","author":"Skier","rating":5,"textEn":"Andro''s Subaru is great in snow.","textRu":"Субару Андро отлично ведет себя на снегу."},
  {"date":"2023-09-08","author":"Ivan","rating":5,"textEn":"Safe driver.","textRu":"Безопасный водитель."},
  {"date":"2025-01-22","author":"Jessica","rating":5,"textEn":"Clean car.","textRu":"Чистая машина."},
  {"date":"2022-10-15","author":"Oleg","rating":5,"textEn":"Good music.","textRu":"Хорошая музыка."},
  {"date":"2024-06-18","author":"Maria","rating":5,"textEn":"Andro is polite.","textRu":"Андро вежлив."},
  {"date":"2023-11-10","author":"Robert","rating":5,"textEn":"Good trip.","textRu":"Хорошая поездка."},
  {"date":"2025-06-10","author":"Anna","rating":5,"textEn":"Thanks Andro!","textRu":"Спасибо, Андро!"},
  {"date":"2022-09-01","author":"Tom","rating":5,"textEn":"Recommended.","textRu":"Рекомендую."},
  {"date":"2024-12-15","author":"Dmitry","rating":5,"textEn":"5 stars.","textRu":"5 звезд."},
  {"date":"2023-04-12","author":"Sarah","rating":5,"textEn":"Excellent.","textRu":"Отлично."}
],
        debt: 0
    },
    {
        id: 'drv-1769016106441',
        name: 'Vasil ',
        email: 'vaskazxzx@gmail.com',
        password: 'zx1982248248',
        phoneNumber: '+995555670667',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769016106441/avatar/1769016106462_m2wec.jpg',
        carModel: 'Ford fusion',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769016106441/car_front/1769016108846_fe2g1.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769016106441/car_back/1769016110470_4lq8m.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769016106441/car_side/1769016112006_u24fo.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1769016106441/car_interior/1769016113132_ejztu.jpg"],
        vehicleType: 'Sedan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 0,
        pricePerKm: 0.8,
        basePrice: 30,
        maxPassengers: 4,
        languages: ["EN","RU"],
        features: ["WiFi","AC","Water"],
        blockedDates: [],
        reviews: [],
        debt: 0
    },
    {
        id: 'drv-1768614912761',
        name: 'omari',
        email: 'chagiashvili.omo1994@gmail.com',
        password: 'Paroli001',
        phoneNumber: '+995574543543',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768614912761/avatar/1768614912762_9st6p.jpeg',
        carModel: 'sprinter',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768614912761/car_front/1768614916045_fdc7m.jpeg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768614912761/car_back/1768614917315_48i0c.jpeg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768614912761/car_side/1768614918408_wyifq.jpeg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768614912761/car_interior/1768614919533_zj61v.jpeg"],
        vehicleType: 'Bus',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 20,
        pricePerKm: 2,
        basePrice: 100,
        maxPassengers: 16,
        languages: ["EN","GE"],
        features: ["AC","WiFi","Water","Child Seat","Roof Box","Non-Smoking"],
        blockedDates: [],
        reviews: [],
        debt: 0
    }
];

const INITIAL_PROMOS: PromoCode[] = [
    { id: 'p1', code: 'AIRPORT25', discountPercent: 25, usageLimit: 5000, usageCount: 0, status: 'ACTIVE', createdAt: new Date().toISOString() },
    { id: 'p2', code: 'WELCOME', discountPercent: 10, usageLimit: 10000, usageCount: 0, status: 'ACTIVE', createdAt: new Date().toISOString() }
];

// --- STORAGE HELPERS ---
const getMockData = <T>(key: string, initial: T[]): T[] => {
    if (typeof window === 'undefined') return initial;
    const stored = localStorage.getItem(key);
    if (stored) {
        try { 
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length === 0 && initial.length > 0) {
                return initial;
            }
            return parsed; 
        } catch (e) { return initial; }
    }
    // If no storage, return initial and save it
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(initial));
    }
    return initial;
};

const saveMockData = (key: string, data: any[]) => {
    if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(data));
};

// Initialize Caches with explicit fallback to INITIAL data
let MOCK_TOURS_CACHE = getMockData(STORAGE_KEYS.TOURS, INITIAL_MOCK_TOURS);
let MOCK_DRIVERS_CACHE = getMockData(STORAGE_KEYS.DRIVERS, INITIAL_MOCK_DRIVERS);
let MOCK_BOOKINGS_CACHE = getMockData(STORAGE_KEYS.BOOKINGS, [] as Booking[]);
let MOCK_PROMOS_CACHE = getMockData(STORAGE_KEYS.PROMOS, INITIAL_PROMOS);

export const db = {
    drafts: {
        save: (search: TripSearch) => {},
        get: (): TripSearch | null => null,
        clear: () => {}
    },
    session: {
        setActivePromo: (code: string, discount: number) => {
            if (typeof window !== 'undefined') {
                const data = { code, discount, timestamp: Date.now() };
                localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION_PROMO, JSON.stringify(data));
                triggerPromoUpdate(); 
            }
        },
        getActivePromo: (): { code: string, discount: number } | null => {
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION_PROMO);
                if (stored) {
                    try { return JSON.parse(stored); } catch (e) { return null; }
                }
            }
            return null;
        },
        clearActivePromo: () => {
            if (typeof window !== 'undefined') {
                localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION_PROMO);
                triggerPromoUpdate();
            }
        }
    },
    backup: {
        generateDump: async (): Promise<string> => {
            let sqlDump = `-- ORBITRIP DATABASE DUMP (${new Date().toISOString()})\n\n`;
            
            // Standard Table Creation SQL
            sqlDump += `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n`;
            sqlDump += `CREATE TABLE IF NOT EXISTS public.tours (id text primary key, title_en text, title_ru text, description_en text, description_ru text, price text, base_price numeric default 0, extra_person_fee numeric default 0, price_per_person numeric default 0, duration text, image text, rating numeric default 5, category text, highlights_en text[], highlights_ru text[], itinerary_en text[], itinerary_ru text[], route_stops text[], price_options jsonb default '[]'::jsonb, reviews jsonb default '[]'::jsonb, created_at timestamptz default now());\n`;
            sqlDump += `CREATE TABLE IF NOT EXISTS public.drivers (id text primary key, name text, email text, password text, phone_number text, city text default 'tbilisi', photo_url text, car_model text, car_photo_url text, car_photos text[], vehicle_type text, status text default 'PENDING', rating numeric default 5, review_count numeric default 0, price_per_km numeric default 1.2, base_price numeric default 30, max_passengers numeric default 4, languages text[], features text[], blocked_dates text[], documents jsonb default '[]'::jsonb, reviews jsonb default '[]'::jsonb, created_at timestamptz default now(), debt numeric default 0);\n`;
            sqlDump += `CREATE TABLE IF NOT EXISTS public.bookings (id text primary key, tour_id text, tour_title text, customer_name text, contact_info text, date text, vehicle text, guests numeric default 1, driver_id text, driver_name text, total_price text, numeric_price numeric, status text default 'PENDING', commission numeric default 0, promo_code text, payment_method text, created_at timestamptz default now(), flight_number text);\n`;
            sqlDump += `CREATE TABLE IF NOT EXISTS public.settings (id text primary key default 'default', sms_api_key text, admin_phone_number text default '995593456876', commission_rate numeric default 0.2, email_service_id text, email_template_id text, email_public_key text, sms_enabled boolean default true, background_image_url text, site_title text, site_description text, maintenance_mode boolean default false, min_trip_price numeric default 30, social_facebook text, social_instagram text, driver_guidelines text, ai_system_prompt text, global_alert_message text, booking_window_days numeric default 60, instant_booking_enabled boolean default false, tax_rate numeric default 0, currency_symbol text default 'GEL', auto_approve_drivers boolean default false, require_documents boolean default true, ai_model_temperature numeric default 0.7);\n`;
            sqlDump += `CREATE TABLE IF NOT EXISTS public.promo_codes (id text primary key, code text unique, discount_percent numeric, usage_limit numeric default 100, usage_count numeric default 0, status text default 'ACTIVE', created_at timestamptz default now());\n\n`;
            
            sqlDump += `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='drivers' AND column_name='debt') THEN ALTER TABLE public.drivers ADD COLUMN debt numeric default 0; END IF; END $$;\n\n`;

            const tables = ['tours', 'drivers', 'bookings', 'settings', 'promo_codes'];

            if (isSupabaseConfigured) {
                // Fetch from Supabase
                const fetchAllRows = async (tableName: string) => {
                    let allRows: any[] = [];
                    let page = 0;
                    const pageSize = 1000;
                    while (true) {
                        const { data, error } = await supabase
                            .from(tableName)
                            .select('*')
                            .range(page * pageSize, (page + 1) * pageSize - 1);
                        if (error || !data || data.length === 0) break;
                        allRows = [...allRows, ...data];
                        if (data.length < pageSize) break; 
                        page++;
                    }
                    return allRows;
                };

                for (const table of tables) {
                    const data = await fetchAllRows(table);
                    if (data && data.length > 0) {
                        sqlDump += `\n-- DATA FOR public.${table}\n`;
                        data.forEach((row: any) => {
                            const keys = Object.keys(row).join(', ');
                            const values = Object.values(row).map(val => {
                                if (val === null) return 'NULL';
                                if (typeof val === 'number') return val;
                                if (Array.isArray(val) || typeof val === 'object') return `'${JSON.stringify(val)}'`;
                                return `'${String(val).replace(/'/g, "''")}'`; 
                            }).join(', ');
                            sqlDump += `INSERT INTO public.${table} (${keys}) VALUES (${values});\n`;
                        });
                    }
                }
            } else {
                // Fetch from Local Mock Cache (Offline mode backup)
                const mockMap: any = {
                    'tours': MOCK_TOURS_CACHE,
                    'drivers': MOCK_DRIVERS_CACHE,
                    'bookings': MOCK_BOOKINGS_CACHE,
                    'promo_codes': MOCK_PROMOS_CACHE,
                    'settings': []
                };

                for (const table of tables) {
                    const data = mockMap[table];
                    if (data && data.length > 0) {
                        sqlDump += `\n-- MOCK DATA FOR public.${table}\n`;
                        data.forEach((row: any) => {
                             const keys = Object.keys(row).join(', ');
                             const values = Object.values(row).map(val => {
                                if (typeof val === 'object') return `'${JSON.stringify(val)}'`;
                                return `'${val}'`;
                             }).join(', ');
                             sqlDump += `INSERT INTO public.${table} (${keys}) VALUES (${values});\n`;
                        });
                    }
                }
            }
            
            return sqlDump;
        }
    },
    tours: {
        getAll: async (): Promise<Tour[]> => {
            if (!isSupabaseConfigured) return MOCK_TOURS_CACHE;
            const { data, error } = await supabase.from('tours').select('*');
            if (error || !data) {
                console.warn("[DB] Tours fetch failed, falling back to cache.", error);
                return MOCK_TOURS_CACHE;
            }
            return data.map((t: any) => ({
                id: safeString(t.id),
                titleEn: safeString(getVal(t, 'titleEn', 'title_en')),
                titleRu: safeString(getVal(t, 'titleRu', 'title_ru')),
                descriptionEn: safeString(getVal(t, 'descriptionEn', 'description_en')),
                descriptionRu: safeString(getVal(t, 'descriptionRu', 'description_ru')),
                price: safeString(t.price, '0 GEL'),
                basePrice: safeNumber(getVal(t, 'basePrice', 'base_price'), 0),
                extraPersonFee: safeNumber(getVal(t, 'extraPersonFee', 'extra_person_fee'), 0),
                pricePerPerson: safeNumber(getVal(t, 'pricePerPerson', 'price_per_person'), 0),
                duration: safeString(t.duration),
                image: safeString(t.image),
                rating: safeNumber(t.rating, 5),
                category: safeString(t.category, 'OTHER'),
                priceOptions: safeArray(getVal(t, 'priceOptions', 'price_options')),
                reviews: safeArray(t.reviews),
                highlightsEn: safeArray(getVal(t, 'highlightsEn', 'highlights_en')),
                highlightsRu: safeArray(getVal(t, 'highlightsRu', 'highlights_ru')),
                itineraryEn: safeArray(getVal(t, 'itineraryEn', 'itinerary_en')),
                itineraryRu: safeArray(getVal(t, 'itineraryRu', 'itinerary_ru')),
                routeStops: safeArray(getVal(t, 'routeStops', 'route_stops')),
                authorId: safeString(getVal(t, 'authorId', 'author_id'))
            }));
        },
        create: async (item: Tour) => { 
            if (!isSupabaseConfigured) { MOCK_TOURS_CACHE.push(item); saveMockData(STORAGE_KEYS.TOURS, MOCK_TOURS_CACHE); triggerUpdate(); return item; }
            const payload = {
                id: item.id, 
                title_en: item.titleEn, title_ru: item.titleRu, 
                description_en: item.descriptionEn, description_ru: item.descriptionRu, 
                price: item.price, base_price: item.basePrice, 
                duration: item.duration, image: item.image,
                category: item.category, rating: item.rating,
                highlights_en: item.highlightsEn, highlights_ru: item.highlightsRu,
                itinerary_en: item.itineraryEn, itinerary_ru: item.itineraryRu,
                route_stops: item.routeStops, price_options: item.priceOptions, reviews: item.reviews,
                author_id: item.authorId
            };
            const { error } = await supabase.from('tours').insert([payload]);
            if (error) throw new Error(error.message);
            triggerUpdate(); return item;
        },
        update: async (item: Tour) => {
            if (!isSupabaseConfigured) {
                const idx = MOCK_TOURS_CACHE.findIndex(t => t.id === item.id);
                if (idx !== -1) MOCK_TOURS_CACHE[idx] = { ...MOCK_TOURS_CACHE[idx], ...item };
                saveMockData(STORAGE_KEYS.TOURS, MOCK_TOURS_CACHE);
                triggerUpdate(); return item;
            }
            const payload = {
                title_en: item.titleEn, title_ru: item.titleRu, 
                description_en: item.descriptionEn, description_ru: item.descriptionRu, 
                price: item.price, base_price: item.basePrice, 
                duration: item.duration, image: item.image, category: item.category,
                highlights_en: item.highlightsEn, highlights_ru: item.highlightsRu,
                itinerary_en: item.itineraryEn, itinerary_ru: item.itineraryRu,
                route_stops: item.routeStops, price_options: item.priceOptions, author_id: item.authorId
            };
            await supabase.from('tours').update(payload).eq('id', item.id);
            triggerUpdate(); return item;
        },
        delete: async (id: string) => { 
            if (!isSupabaseConfigured) { MOCK_TOURS_CACHE = MOCK_TOURS_CACHE.filter(t => t.id !== id); saveMockData(STORAGE_KEYS.TOURS, MOCK_TOURS_CACHE); triggerUpdate(); return; }
            await supabase.from('tours').delete().eq('id', id);
            triggerUpdate();
        }
    },
    drivers: {
        getAll: async (): Promise<Driver[]> => {
            if (!isSupabaseConfigured) return MOCK_DRIVERS_CACHE;
            
            const { data, error } = await supabase.from('drivers').select('*').order('created_at', { ascending: false });
            
            if (error || !data) {
                console.warn("[DB] Drivers fetch failed, falling back to cache.", error);
                return MOCK_DRIVERS_CACHE;
            }
            return data.map((d: any) => ({
                id: safeString(d.id),
                name: safeString(d.name),
                email: safeString(d.email),
                password: safeString(d.password),
                phoneNumber: safeString(getVal(d, 'phoneNumber', 'phone_number')),
                city: safeString(d.city, 'tbilisi'),
                photoUrl: safeString(getVal(d, 'photoUrl', 'photo_url')),
                carModel: safeString(getVal(d, 'carModel', 'car_model')),
                carPhotoUrl: safeString(getVal(d, 'carPhotoUrl', 'car_photo_url')),
                carPhotos: safeArray(getVal(d, 'carPhotos', 'car_photos')),
                vehicleType: safeString(getVal(d, 'vehicleType', 'vehicle_type')),
                status: safeString(d.status, 'PENDING') as any,
                rating: safeNumber(d.rating, 5),
                reviewCount: safeNumber(getVal(d, 'reviewCount', 'review_count')),
                pricePerKm: safeNumber(getVal(d, 'pricePerKm', 'price_per_km')),
                basePrice: safeNumber(getVal(d, 'basePrice', 'base_price')),
                maxPassengers: safeNumber(getVal(d, 'maxPassengers', 'max_passengers')),
                languages: safeArray(d.languages),
                features: safeArray(d.features),
                blockedDates: safeArray(getVal(d, 'blockedDates', 'blocked_dates')),
                documents: safeArray(d.documents),
                reviews: safeArray(d.reviews),
                debt: safeNumber(d.debt, 0)
            }));
        },
        create: async (item: Driver) => {
            if (!isSupabaseConfigured) { 
                MOCK_DRIVERS_CACHE.unshift(item); 
                saveMockData(STORAGE_KEYS.DRIVERS, MOCK_DRIVERS_CACHE); 
                triggerUpdate(); 
                return item; 
            }
            
            const payload = {
                id: item.id, name: item.name, email: item.email, password: item.password,
                phone_number: item.phoneNumber, city: item.city,
                photo_url: item.photoUrl, car_model: item.carModel, car_photo_url: item.carPhotoUrl, 
                car_photos: item.carPhotos || [], vehicle_type: item.vehicleType,
                status: item.status, rating: item.rating, review_count: item.reviewCount,
                price_per_km: item.pricePerKm, base_price: item.basePrice, max_passengers: item.maxPassengers,
                languages: item.languages || [], features: item.features || [],
                blocked_dates: item.blockedDates || [], documents: item.documents || [], debt: item.debt || 0
            };

            const { error } = await supabase.from('drivers').insert([payload]);
            if (error) {
                console.error("Driver create error:", error);
                throw new Error(error.message);
            }
            triggerUpdate(); return item;
        },
        update: async (item: Driver) => {
            if (!isSupabaseConfigured) {
                const idx = MOCK_DRIVERS_CACHE.findIndex(d => d.id === item.id);
                if (idx !== -1) MOCK_DRIVERS_CACHE[idx] = { ...MOCK_DRIVERS_CACHE[idx], ...item };
                saveMockData(STORAGE_KEYS.DRIVERS, MOCK_DRIVERS_CACHE);
                triggerUpdate(); return item;
            }

            const payload = {
                name: item.name, email: item.email, phone_number: item.phoneNumber, city: item.city,
                photo_url: item.photoUrl, car_model: item.carModel, car_photo_url: item.carPhotoUrl, 
                car_photos: item.carPhotos, vehicle_type: item.vehicleType, status: item.status,
                price_per_km: item.pricePerKm, base_price: item.basePrice, max_passengers: item.maxPassengers,
                languages: item.languages, features: item.features, blocked_dates: item.blockedDates,
                documents: item.documents, debt: item.debt
            };

            await supabase.from('drivers').update(payload).eq('id', item.id);
            triggerUpdate(); return item;
        },
        delete: async (id: string) => {
            if (!isSupabaseConfigured) { 
                MOCK_DRIVERS_CACHE = MOCK_DRIVERS_CACHE.filter(d => d.id !== id); 
                saveMockData(STORAGE_KEYS.DRIVERS, MOCK_DRIVERS_CACHE); 
                triggerUpdate(); return; 
            }
            await supabase.from('drivers').delete().eq('id', id);
            triggerUpdate();
        }
    },
    bookings: {
        getAll: async (): Promise<Booking[]> => {
            if (!isSupabaseConfigured) return MOCK_BOOKINGS_CACHE;
            const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
            if (error || !data) return MOCK_BOOKINGS_CACHE;
            return data.map((b: any) => ({
                id: safeString(b.id),
                tourId: safeString(getVal(b, 'tourId', 'tour_id')),
                tourTitle: safeString(getVal(b, 'tourTitle', 'tour_title')),
                customerName: safeString(getVal(b, 'customerName', 'customer_name')),
                contactInfo: safeString(getVal(b, 'contactInfo', 'contact_info')),
                date: safeString(b.date), vehicle: safeString(b.vehicle), guests: safeNumber(b.guests),
                driverId: safeString(getVal(b, 'driverId', 'driver_id')),
                driverName: safeString(getVal(b, 'driverName', 'driver_name')),
                totalPrice: safeString(getVal(b, 'totalPrice', 'total_price')),
                numericPrice: safeNumber(getVal(b, 'numericPrice', 'numeric_price')),
                status: safeString(b.status, 'PENDING') as any,
                createdAt: new Date(b.created_at || Date.now()).getTime(),
                commission: safeNumber(b.commission),
                promoCode: safeString(getVal(b, 'promoCode', 'promo_code')),
                flightNumber: safeString(getVal(b, 'flightNumber', 'flight_number'))
            }));
        },
        create: async (item: Booking) => {
            if (!isSupabaseConfigured) { MOCK_BOOKINGS_CACHE.unshift(item); saveMockData(STORAGE_KEYS.BOOKINGS, MOCK_BOOKINGS_CACHE); triggerUpdate(); return item; }
            const payload = {
                id: item.id, tour_id: item.tourId, tour_title: item.tourTitle,
                customer_name: item.customerName, contact_info: item.contactInfo,
                date: item.date, vehicle: item.vehicle, guests: item.guests,
                driver_id: item.driverId, driver_name: item.driverName,
                total_price: item.totalPrice, numeric_price: item.numericPrice,
                status: item.status, commission: item.commission, promo_code: item.promoCode,
                flight_number: item.flightNumber
            };
            const { error } = await supabase.from('bookings').insert([payload]);
            if (error) throw new Error(error.message);
            if (item.promoCode) await supabase.rpc('increment_promo_usage', { promo_code: item.promoCode });
            triggerUpdate(); return item;
        },
        update: async (item: Booking) => {
            if (!isSupabaseConfigured) {
                const idx = MOCK_BOOKINGS_CACHE.findIndex(b => b.id === item.id);
                if (idx !== -1) MOCK_BOOKINGS_CACHE[idx] = { ...MOCK_BOOKINGS_CACHE[idx], ...item };
                saveMockData(STORAGE_KEYS.BOOKINGS, MOCK_BOOKINGS_CACHE);
                triggerUpdate(); return item;
            }
            const payload = {
                customer_name: item.customerName, contact_info: item.contactInfo,
                date: item.date, numeric_price: item.numericPrice, total_price: item.totalPrice,
                status: item.status, driver_id: item.driverId, driver_name: item.driverName,
                flight_number: item.flightNumber
            };
            await supabase.from('bookings').update(payload).eq('id', item.id);
            triggerUpdate(); return item;
        },
        updateStatus: async (id: string, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => {
            if (!isSupabaseConfigured) {
                const b = MOCK_BOOKINGS_CACHE.find(b => b.id === id);
                if (b) b.status = status;
                saveMockData(STORAGE_KEYS.BOOKINGS, MOCK_BOOKINGS_CACHE);
                triggerUpdate(); return;
            }
            await supabase.from('bookings').update({ status }).eq('id', id);
            triggerUpdate();
        },
        assignDriver: async (bookingId: string, driver: Driver): Promise<boolean> => {
            if (!isSupabaseConfigured) {
                const b = MOCK_BOOKINGS_CACHE.find(b => b.id === bookingId);
                if (!b || b.driverId) return false;
                b.driverId = driver.id; b.driverName = driver.name; b.status = 'CONFIRMED';
                saveMockData(STORAGE_KEYS.BOOKINGS, MOCK_BOOKINGS_CACHE);
                triggerUpdate(); return true;
            }
            const { data, error } = await supabase.from('bookings').select('driver_id').eq('id', bookingId).single();
            if (error || (data && data.driver_id)) return false; 
            const { error: updateError } = await supabase.from('bookings')
                .update({ driver_id: driver.id, driver_name: driver.name, status: 'CONFIRMED' })
                .eq('id', bookingId);
            if (updateError) return false;
            triggerUpdate(); return true;
        },
        delete: async (id: string) => {
            if (!isSupabaseConfigured) {
                MOCK_BOOKINGS_CACHE = MOCK_BOOKINGS_CACHE.filter(b => b.id !== id);
                saveMockData(STORAGE_KEYS.BOOKINGS, MOCK_BOOKINGS_CACHE);
                triggerUpdate(); return;
            }
            await supabase.from('bookings').delete().eq('id', id);
            triggerUpdate();
        }
    },
    settings: {
        get: async (): Promise<SystemSettings> => {
            const defaults: SystemSettings = { 
                id: 'default', smsApiKey: DEFAULT_SMS_KEY, adminPhoneNumber: DEFAULT_ADMIN_PHONE, 
                commissionRate: DEFAULT_COMMISSION, smsEnabled: true, emailServiceId: '', emailTemplateId: '', emailPublicKey: '', backgroundImageUrl: DEFAULT_BG_IMAGE,
                minTripPrice: 30, socialFacebook: '', socialInstagram: ''
            };
            if (!isSupabaseConfigured) return defaults;
            const { data, error } = await supabase.from('settings').select('*').single();
            if (error || !data) return defaults;
            return {
                id: data.id,
                smsApiKey: safeString(getVal(data, 'smsApiKey', 'sms_api_key')),
                adminPhoneNumber: safeString(getVal(data, 'adminPhoneNumber', 'admin_phone_number'), DEFAULT_ADMIN_PHONE),
                commissionRate: safeNumber(getVal(data, 'commissionRate', 'commission_rate'), 0.13),
                emailServiceId: safeString(getVal(data, 'emailServiceId', 'email_service_id')),
                emailTemplateId: safeString(getVal(data, 'emailTemplateId', 'email_template_id')),
                emailPublicKey: safeString(getVal(data, 'emailPublicKey', 'email_public_key')),
                smsEnabled: safeBoolean(getVal(data, 'smsEnabled', 'sms_enabled')),
                backgroundImageUrl: safeString(getVal(data, 'backgroundImageUrl', 'background_image_url')),
                siteTitle: safeString(getVal(data, 'siteTitle', 'site_title')),
                siteDescription: safeString(getVal(data, 'siteDescription', 'site_description')),
                maintenanceMode: safeBoolean(getVal(data, 'maintenanceMode', 'maintenance_mode'), false),
                minTripPrice: safeNumber(getVal(data, 'minTripPrice', 'min_trip_price'), 30),
                socialFacebook: safeString(getVal(data, 'socialFacebook', 'social_facebook')),
                socialInstagram: safeString(getVal(data, 'socialInstagram', 'social_instagram')),
                driverGuidelines: safeString(getVal(data, 'driverGuidelines', 'driver_guidelines')),
                aiSystemPrompt: safeString(getVal(data, 'aiSystemPrompt', 'ai_system_prompt')),
                globalAlertMessage: safeString(getVal(data, 'globalAlertMessage', 'global_alert_message')),
                
                // Advanced Settings Mapping
                bookingWindowDays: safeNumber(getVal(data, 'bookingWindowDays', 'booking_window_days'), 60),
                instantBookingEnabled: safeBoolean(getVal(data, 'instantBookingEnabled', 'instant_booking_enabled'), false),
                taxRate: safeNumber(getVal(data, 'taxRate', 'tax_rate'), 0),
                currencySymbol: safeString(getVal(data, 'currencySymbol', 'currency_symbol'), 'GEL'),
                autoApproveDrivers: safeBoolean(getVal(data, 'autoApproveDrivers', 'auto_approve_drivers'), false),
                requireDocuments: safeBoolean(getVal(data, 'requireDocuments', 'require_documents'), true),
                aiModelTemperature: safeNumber(getVal(data, 'aiModelTemperature', 'ai_model_temperature'), 0.7),
            };
        },
        save: async (settings: SystemSettings): Promise<{ success: boolean, error?: string }> => {
            if (!isSupabaseConfigured) return { success: false, error: 'Database not configured' };
            const payload = {
                id: 'default',
                sms_api_key: settings.smsApiKey, admin_phone_number: settings.adminPhoneNumber,
                commission_rate: settings.commissionRate, email_service_id: settings.emailServiceId,
                email_template_id: settings.emailTemplateId, email_public_key: settings.emailPublicKey,
                sms_enabled: settings.smsEnabled, background_image_url: settings.backgroundImageUrl,
                site_title: settings.siteTitle, site_description: settings.siteDescription,
                maintenance_mode: settings.maintenanceMode, min_trip_price: settings.minTripPrice,
                social_facebook: settings.socialFacebook, social_instagram: settings.socialInstagram,
                driver_guidelines: settings.driverGuidelines, ai_system_prompt: settings.aiSystemPrompt,
                global_alert_message: settings.globalAlertMessage,
                
                // Advanced Settings Payload
                booking_window_days: settings.bookingWindowDays,
                instant_booking_enabled: settings.instantBookingEnabled,
                tax_rate: settings.taxRate,
                currency_symbol: settings.currencySymbol,
                auto_approve_drivers: settings.autoApproveDrivers,
                require_documents: settings.requireDocuments,
                ai_model_temperature: settings.aiModelTemperature
            };
            const { error } = await supabase.from('settings').upsert(payload);
            if (error) return { success: false, error: error.message };
            triggerUpdate(); return { success: true };
        }
    },
    smsLogs: {
        getAll: async (): Promise<SmsLog[]> => {
            if (!isSupabaseConfigured) return [];
            const { data } = await supabase.from('sms_logs').select('*').order('timestamp', { ascending: false }).limit(50);
            return (data || []).map((l: any) => ({
                id: l.id, recipient: l.recipient, content: l.content, status: l.status, type: l.type, timestamp: l.timestamp
            }));
        },
        log: async (log: SmsLog) => {
            if (!isSupabaseConfigured) return;
            await supabase.from('sms_logs').insert([log]);
        }
    },
    promoCodes: {
        getAll: async (): Promise<PromoCode[]> => {
            if (!isSupabaseConfigured) return MOCK_PROMOS_CACHE;
            const { data } = await supabase.from('promo_codes').select('*');
            return (data || []).map((p: any) => ({
                id: p.id, code: p.code,
                discountPercent: getVal(p, 'discountPercent', 'discount_percent'),
                usageLimit: getVal(p, 'usageLimit', 'usage_limit'),
                usageCount: getVal(p, 'usageCount', 'usage_count'),
                status: p.status, createdAt: getVal(p, 'createdAt', 'created_at')
            }));
        },
        create: async (promo: PromoCode) => {
            if (!isSupabaseConfigured) { MOCK_PROMOS_CACHE.push(promo); saveMockData(STORAGE_KEYS.PROMOS, MOCK_PROMOS_CACHE); return; }
            await supabase.from('promo_codes').insert([{
                id: promo.id, code: promo.code, discount_percent: promo.discountPercent,
                usage_limit: promo.usageLimit, usage_count: 0, status: 'ACTIVE'
            }]);
        },
        delete: async (id: string) => {
            if (!isSupabaseConfigured) { MOCK_PROMOS_CACHE = MOCK_PROMOS_CACHE.filter(p => p.id !== id); saveMockData(STORAGE_KEYS.PROMOS, MOCK_PROMOS_CACHE); return; }
            await supabase.from('promo_codes').delete().eq('id', id);
        },
        validate: async (code: string): Promise<{ valid: boolean, discount: number }> => {
            if (!isSupabaseConfigured) {
                const p = MOCK_PROMOS_CACHE.find(p => p.code === code && p.status === 'ACTIVE');
                return p ? { valid: true, discount: p.discountPercent } : { valid: false, discount: 0 };
            }
            const { data } = await supabase.from('promo_codes').select('*').eq('code', code).eq('status', 'ACTIVE').single();
            if (data && data.usage_count < data.usage_limit) {
                return { valid: true, discount: data.discount_percent };
            }
            return { valid: false, discount: 0 };
        }
    }
};
