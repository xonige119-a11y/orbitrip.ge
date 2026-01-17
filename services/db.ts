
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

// --- MOCK DATA (RESTORED FROM SQL DUMP) ---
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
        image: 'https://image.pollinations.ai/prompt/A%20photorealistic%2C%20cinematic%20travel%20photo%20of%20Prometheus%20Cave%2C%20professional%20photography%2C%204k%20%2C%20realistic%2C%208k%2C%20georgia%20travel?width=1280&height=720&model=flux&nologo=true&seed=44146',
        rating: 5,
        category: 'AI_UNIQUE',
        highlightsEn: ["Kutaisi","Prometheus Cave","Martvili Canyon","Kutaisi (Finish)"],
        highlightsRu: ["Kutaisi","Prometheus Cave","Martvili Canyon","Kutaisi (Finish)"],
        itineraryEn: ["Visit Kutaisi: Start.","Visit Prometheus Cave: Cave.","Visit Martvili Canyon: Canyon.","Visit Kutaisi (Finish): Finish."],
        itineraryRu: ["Посещение Kutaisi: Start.","Посещение Prometheus Cave: Cave.","Посещение Martvili Canyon: Canyon.","Посещение Kutaisi (Finish): Finish."],
        routeStops: ["Kutaisi","Prometheus Cave","Martvili Canyon","Kutaisi (Finish)"],
        priceOptions: [{"price":"174 GEL","guests":"1-4","vehicle":"Sedan"},{"price":"244 GEL","guests":"5-7","vehicle":"Minivan"},{"price":"383 GEL","guests":"8+","vehicle":"Bus"}],
        reviews: []
    },
    {
        id: 'ai-gen-1768335943046-898',
        titleEn: 'AI Trip: Kutaisi ➝ Kutaisi (Finish)',
        titleRu: 'AI Тур: Kutaisi ➝ Kutaisi (Finish)',
        descriptionEn: "Classic route through Imereti's best rated spots.",
        descriptionRu: "Classic route through Imereti's best rated spots.",
        price: 'From 174 GEL',
        basePrice: 174,
        pricePerPerson: 0,
        duration: '5-6 Hours',
        image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80&w=600',
        rating: 5,
        category: 'AI_UNIQUE',
        highlightsEn: ["Kutaisi","Prometheus Cave","Martvili Canyon","Kutaisi (Finish)"],
        highlightsRu: ["Kutaisi","Prometheus Cave","Martvili Canyon","Kutaisi (Finish)"],
        itineraryEn: ["Visit Kutaisi: Departure from city center.","Visit Prometheus Cave: Legendary cave with underground rivers. Rating 4.8.","Visit Martvili Canyon: Emerald waters and boat trips. Top rated location.","Visit Kutaisi (Finish): Return and dinner."],
        itineraryRu: ["Посещение Kutaisi: Departure from city center.","Посещение Prometheus Cave: Legendary cave with underground rivers. Rating 4.8.","Посещение Martvili Canyon: Emerald waters and boat trips. Top rated location.","Посещение Kutaisi (Finish): Return and dinner."],
        routeStops: ["Kutaisi","Prometheus Cave","Martvili Canyon","Kutaisi (Finish)"],
        priceOptions: [{"price":"174 GEL","guests":"1-4","vehicle":"Sedan"},{"price":"244 GEL","guests":"5-7","vehicle":"Minivan"},{"price":"383 GEL","guests":"8+","vehicle":"Bus"}],
        reviews: []
    },
    {
        id: 'ai-gen-1768337919530-344',
        titleEn: 'AI Trip: Tbilisi ➝ Tbilisi (Finish)',
        titleRu: 'AI Тур: Tbilisi ➝ Tbilisi (Finish)',
        descriptionEn: 'Tour through top-rated locations.',
        descriptionRu: 'Tour through top-rated locations.',
        price: 'From 222 GEL',
        basePrice: 222,
        pricePerPerson: 0,
        duration: '5-6 Hours',
        image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=600',
        rating: 5,
        category: 'CULTURE',
        highlightsEn: ["Tbilisi","Jvari Monastery","Ananuri Fortress","Tbilisi"],
        highlightsRu: ["Tbilisi","Jvari Monastery","Ananuri Fortress","Tbilisi"],
        itineraryEn: ["Visit Tbilisi: Start of journey","Visit Jvari Monastery: View of two rivers merging.","Visit Ananuri Fortress: Medieval fortress on the lake.","Visit Tbilisi: Return to the capital."],
        itineraryRu: ["Посещение Tbilisi: Start of journey","Посещение Jvari Monastery: View of two rivers merging.","Посещение Ananuri Fortress: Medieval fortress on the lake.","Посещение Tbilisi: Return to the capital."],
        routeStops: ["Tbilisi","Jvari Monastery","Ananuri Fortress","Tbilisi"],
        priceOptions: [{"price":"222 GEL","guests":"1-4","vehicle":"Sedan"},{"price":"311 GEL","guests":"5-7","vehicle":"Minivan"},{"price":"489 GEL","guests":"8+","vehicle":"Bus"}],
        reviews: []
    },
    {
        id: 'ai-gen-1768332245134-778',
        titleEn: 'AI Trip: Tbilisi ➝ Tbilisi (Finish)',
        titleRu: 'AI Тур: Tbilisi ➝ Tbilisi (Finish)',
        descriptionEn: 'Tour through top-rated locations.',
        descriptionRu: 'Tour through top-rated locations.',
        price: 'From 222 GEL',
        basePrice: 222,
        pricePerPerson: 0,
        duration: '5-6 Hours',
        image: 'https://images.unsplash.com/photo-1551830463-6f6e0c529d18?auto=format&fit=crop&q=80&w=600',
        rating: 5,
        category: 'AI_UNIQUE',
        highlightsEn: ["Tbilisi","Jvari Monastery","Ananuri Fortress","Tbilisi (Finish)"],
        highlightsRu: ["Tbilisi","Jvari Monastery","Ananuri Fortress","Tbilisi (Finish)"],
        itineraryEn: ["Visit Tbilisi: Departure from city.","Visit Jvari Monastery: UNESCO Heritage.","Visit Ananuri Fortress: Complex on the Aragvi River.","Visit Tbilisi (Finish): Return."],
        itineraryRu: ["Посещение Tbilisi: Departure from city.","Посещение Jvari Monastery: UNESCO Heritage.","Посещение Ananuri Fortress: Complex on the Aragvi River.","Посещение Tbilisi (Finish): Return."],
        routeStops: ["Tbilisi","Jvari Monastery","Ananuri Fortress","Tbilisi (Finish)"],
        priceOptions: [{"price":"222 GEL","guests":"1-4","vehicle":"Sedan"},{"price":"311 GEL","guests":"5-7","vehicle":"Minivan"},{"price":"489 GEL","guests":"8+","vehicle":"Bus"}],
        reviews: []
    },
    {
        id: 'ai-gen-1768332486639-181',
        titleEn: 'AI Trip: Tbilisi ➝ Tbilisi (Finish)',
        titleRu: 'AI Тур: Tbilisi ➝ Tbilisi (Finish)',
        descriptionEn: 'Tour through top-rated locations.',
        descriptionRu: 'Tour through top-rated locations.',
        price: 'From 222 GEL',
        basePrice: 222,
        pricePerPerson: 0,
        duration: '5-6 Hours',
        image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=600',
        rating: 5,
        category: 'AI_UNIQUE',
        highlightsEn: ["Tbilisi","Jvari Monastery","Ananuri Fortress","Tbilisi (Finish)"],
        highlightsRu: ["Tbilisi","Jvari Monastery","Ananuri Fortress","Tbilisi (Finish)"],
        itineraryEn: ["Visit Tbilisi: Departure from city.","Visit Jvari Monastery: UNESCO Heritage.","Visit Ananuri Fortress: Complex on the Aragvi River.","Visit Tbilisi (Finish): Return."],
        itineraryRu: ["Посещение Tbilisi: Departure from city.","Посещение Jvari Monastery: UNESCO Heritage.","Посещение Ananuri Fortress: Complex on the Aragvi River.","Посещение Tbilisi (Finish): Return."],
        routeStops: ["Tbilisi","Jvari Monastery","Ananuri Fortress","Tbilisi (Finish)"],
        priceOptions: [{"price":"222 GEL","guests":"1-4","vehicle":"Sedan"},{"price":"311 GEL","guests":"5-7","vehicle":"Minivan"},{"price":"489 GEL","guests":"8+","vehicle":"Bus"}],
        reviews: []
    },
    {
        id: 'ai-gen-1768349969123-261',
        titleEn: 'AI Trip: Tbilisi ➝ Tbilisi',
        titleRu: 'AI Тур: Tbilisi ➝ Tbilisi',
        descriptionEn: 'Classic route (AI Offline).',
        descriptionRu: 'Классический маршрут (AI Offline).',
        price: 'From 282 GEL',
        basePrice: 282,
        pricePerPerson: 0,
        duration: '5-6 Hours',
        image: 'https://image.pollinations.ai/prompt/A%20photorealistic%2C%20cinematic%20travel%20photo%20of%20%D0%94%D0%B6%D0%B2%D0%B0%D1%80%D0%B8%2C%20professional%20photography%2C%204k%20%2C%20realistic%2C%208k%2C%20georgia%20travel?width=1280&height=720&model=flux&nologo=true&seed=35134',
        rating: 5,
        category: 'AI_UNIQUE',
        highlightsEn: ["Tbilisi","Jvari","Ananuri","Tbilisi (Finish)"],
        highlightsRu: ["Tbilisi","Джвари","Ананури","Тбилиси (Финиш)"],
        itineraryEn: ["Visit Tbilisi: Departure from city.","Visit Jvari: UNESCO Heritage.","Visit Ananuri: Complex on the Aragvi River.","Visit Tbilisi (Finish): Return."],
        itineraryRu: ["Посещение Tbilisi: Выезд из города.","Посещение Джвари: UNESCO Heritage.","Посещение Ананури: Complex on the Aragvi River.","Посещение Тбилиси (Финиш): Return."],
        routeStops: ["Tbilisi","Джвари","Ананури","Тбилиси (Финиш)"],
        priceOptions: [{"price":"282 GEL","guests":"1-4","vehicle":"Sedan"},{"price":"395 GEL","guests":"5-7","vehicle":"Minivan"},{"price":"621 GEL","guests":"8+","vehicle":"Bus"}],
        reviews: []
    },
    {
        id: 'ai-gen-1768349996256-35',
        titleEn: 'AI Trip: Batumi ➝ Batumi',
        titleRu: 'AI Тур: Batumi ➝ Batumi',
        descriptionEn: 'Classic route (AI Offline).',
        descriptionRu: 'Классический маршрут (AI Offline).',
        price: 'From 150 GEL',
        basePrice: 150,
        pricePerPerson: 0,
        duration: '5-6 Hours',
        image: 'https://image.pollinations.ai/prompt/A%20photorealistic%2C%20cinematic%20travel%20photo%20of%20%D0%91%D0%BE%D1%82%D0%B0%D0%BD%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B9%20%D0%A1%D0%B0%D0%B4%2C%20professional%20photography%2C%204k%20%2C%20realistic%2C%208k%2C%20georgia%20travel?width=1280&height=720&model=flux&nologo=true&seed=54061',
        rating: 5,
        category: 'AI_UNIQUE',
        highlightsEn: ["Batumi","Botanical Garden","Petra","Batumi (Finish)"],
        highlightsRu: ["Batumi","Ботанический Сад","Петра","Батуми (Финиш)"],
        itineraryEn: ["Visit Batumi: Start.","Visit Botanical Garden: Garden.","Visit Petra: Fortress.","Visit Batumi (Finish): Finish."],
        itineraryRu: ["Посещение Batumi: Start.","Посещение Ботанический Сад: Garden.","Посещение Петра: Fortress.","Посещение Батуми (Финиш): Finish."],
        routeStops: ["Batumi","Ботанический Сад","Петра","Батуми (Финиш)"],
        priceOptions: [{"price":"150 GEL","guests":"1-4","vehicle":"Sedan"},{"price":"210 GEL","guests":"5-7","vehicle":"Minivan"},{"price":"330 GEL","guests":"8+","vehicle":"Bus"}],
        reviews: []
    },
    {
        id: 'ai-gen-1768350687035-991',
        titleEn: 'AI Trip: Tbilisi ➝ Tbilisi (Finish)',
        titleRu: 'AI Тур: Tbilisi ➝ Tbilisi (Finish)',
        descriptionEn: 'Classic route (AI Offline).',
        descriptionRu: 'Classic route (AI Offline).',
        price: 'From 222 GEL',
        basePrice: 222,
        pricePerPerson: 0,
        duration: '5-6 Hours',
        image: 'https://image.pollinations.ai/prompt/A%20photorealistic%2C%20cinematic%20travel%20photo%20of%20Jvari%20Monastery%2C%20professional%20photography%2C%204k%20%2C%20realistic%2C%208k%2C%20georgia%20travel?width=1280&height=720&model=flux&nologo=true&seed=75641',
        rating: 5,
        category: 'AI_UNIQUE',
        highlightsEn: ["Tbilisi","Jvari Monastery","Ananuri Fortress","Tbilisi (Finish)"],
        highlightsRu: ["Tbilisi","Jvari Monastery","Ananuri Fortress","Tbilisi (Finish)"],
        itineraryEn: ["Visit Tbilisi: Departure from city.","Visit Jvari Monastery: UNESCO Heritage.","Visit Ananuri Fortress: Complex on the Aragvi River.","Visit Tbilisi (Finish): Return."],
        itineraryRu: ["Посещение Tbilisi: Departure from city.","Посещение Jvari Monastery: UNESCO Heritage.","Посещение Ananuri Fortress: Complex on the Aragvi River.","Посещение Tbilisi (Finish): Return."],
        routeStops: ["Tbilisi","Jvari Monastery","Ananuri Fortress","Tbilisi (Finish)"],
        priceOptions: [{"price":"222 GEL","guests":"1-4","vehicle":"Sedan"},{"price":"311 GEL","guests":"5-7","vehicle":"Minivan"},{"price":"489 GEL","guests":"8+","vehicle":"Bus"}],
        reviews: []
    },
    {
        id: 'ai-gen-1768351478343-476',
        titleEn: 'AI Trip: Kutaisi ➝ Kutaisi',
        titleRu: 'AI Тур: Kutaisi ➝ Kutaisi',
        descriptionEn: 'Classic route (AI Offline).',
        descriptionRu: 'Классический маршрут (AI Offline).',
        price: 'From 234 GEL',
        basePrice: 234,
        pricePerPerson: 0,
        duration: '5-6 Hours',
        image: 'https://image.pollinations.ai/prompt/A%20photorealistic%2C%20cinematic%20travel%20photo%20of%20%D0%9F%D0%B5%D1%89%D0%B5%D1%80%D0%B0%20%D0%9F%D1%80%D0%BE%D0%BC%D0%B5%D1%82%D0%B5%D1%8F%2C%20professional%20photography%2C%204k%20%2C%20realistic%2C%208k%2C%20georgia%20travel?width=1280&height=720&model=flux&nologo=true&seed=28687',
        rating: 5,
        category: 'AI_UNIQUE',
        highlightsEn: ["Kutaisi","Prometheus Cave","Martvili Canyon","Kutaisi (Finish)"],
        highlightsRu: ["Kutaisi","Пещера Прометея","Каньон Мартвили","Кутаиси (Финиш)"],
        itineraryEn: ["Visit Kutaisi: Start.","Visit Prometheus Cave: Cave.","Visit Martvili Canyon: Canyon.","Visit Kutaisi (Finish): Finish."],
        itineraryRu: ["Посещение Kutaisi: Start.","Посещение Пещера Прометея: Cave.","Посещение Каньон Мартвили: Canyon.","Посещение Кутаиси (Финиш): Finish."],
        routeStops: ["Kutaisi","Пещера Прометея","Каньон Мартвили","Кутаиси (Финиш)"],
        priceOptions: [{"price":"234 GEL","guests":"1-4","vehicle":"Sedan"},{"price":"328 GEL","guests":"5-7","vehicle":"Minivan"},{"price":"515 GEL","guests":"8+","vehicle":"Bus"}],
        reviews: []
    }
]; 

const INITIAL_MOCK_DRIVERS: Driver[] = [
    {
        id: 'drv-1768646026879',
        name: 'Leri denosashvili',
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
        reviewCount: 0,
        pricePerKm: 1,
        basePrice: 30,
        maxPassengers: 4,
        languages: ["EN"],
        features: ["WiFi","AC","Non-Smoking","Child Seat","Water","Roof Box"],
        blockedDates: [],
        reviews: [],
        debt: 0
    },
    {
        id: 'drv-1768505059544',
        name: 'Gocha',
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
        reviewCount: 0,
        pricePerKm: 1.4,
        basePrice: 30,
        maxPassengers: 4,
        languages: ["KA","RU"],
        features: ["WiFi","Water","Non-Smoking","AC","Child Seat"],
        blockedDates: [],
        reviews: [],
        debt: 0
    },
    {
        id: 'drv-1768267158162',
        name: 'DaTo t',
        email: 'mail@orbitrip.ge',
        password: 'jiqiA',
        phoneNumber: '+995593456876',
        city: 'kutaisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768267158162/avatar/1768267158163_gjzk9.jpg',
        carModel: 'Toyota',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768267158162/car_front/1768267164637_nlm6z.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768267158162/car_back/1768267166130_v5u8u.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768267158162/car_side/1768267167219_pave0.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768267158162/car_interior/1768267168356_osa8y.jpg"],
        vehicleType: 'Sedan',
        status: 'INACTIVE',
        rating: 5,
        reviewCount: 25,
        pricePerKm: 1,
        basePrice: 30,
        maxPassengers: 4,
        languages: ["KA","EN"],
        features: ["WiFi"],
        blockedDates: [],
        reviews: [{"date":"2024-05-15","author":"Jessica M.","rating":5,"textEn":"Absolutely fantastic driver! Dato showed us hidden viewpoints in Kazbegi.","textRu":"Абсолютно фантастический водитель! Дато показал нам скрытые смотровые площадки в Казбеги."}],
        debt: 0
    },
    {
        id: 'drv-1768256487539',
        name: 'iakob',
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
        reviewCount: 25,
        pricePerKm: 0.7,
        basePrice: 30,
        maxPassengers: 4,
        languages: ["RU","EN","KA"],
        features: ["WiFi","AC"],
        blockedDates: [],
        reviews: [{"date":"2024-05-12","author":"Sarah Jenkins","rating":5,"textEn":"Amazing trip to Kazbegi! Iakob was very safe and stopped at all the best photo spots. The car was super comfortable.","textRu":"Потрясающая поездка в Казбеги! Якоб вел очень аккуратно и останавливался в лучших местах для фото."}],
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
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/mock-d1/car_back/1768423987031_rolrm.png","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/mock-d1/car_side/1768424102244_cm501.png","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/mock-d1/car_interior/1768436535414_j4uz6.png"],
        vehicleType: 'Sedan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 1,
        pricePerKm: 0.7,
        basePrice: 30,
        maxPassengers: 3,
        languages: [],
        features: ["WiFi","Water","AC","Non-Smoking"],
        blockedDates: [],
        reviews: [{"date":"2024-05-10","author":"John","rating":5,"textEn":"Great driver!","textRu":"Отличный водитель!"}],
        debt: 0
    },
    {
        id: 'drv-1768547166228',
        name: 'Irakli saparidze',
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
        reviewCount: 0,
        pricePerKm: 0.7,
        basePrice: 30,
        maxPassengers: 4,
        languages: ["EN","RU","GE","KA"],
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
        reviewCount: 0,
        pricePerKm: 0.6,
        basePrice: 30,
        maxPassengers: 4,
        languages: ["EN","RU","KA"],
        features: ["WiFi","Water","Child Seat","AC"],
        blockedDates: [],
        reviews: [],
        debt: 0
    },
    {
        id: 'drv-1768550546636',
        name: 'Aleko mindorashvili',
        email: 'mindorashvilialeko3@gmail.com',
        password: 'Aleko003',
        phoneNumber: '+995595706663',
        city: 'tbilisi',
        photoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768550546636/avatar/1768550546643_iabcn.jpg',
        carModel: '2014',
        carPhotoUrl: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768550546636/car_front/1768550549509_snwwb.jpg',
        carPhotos: ["https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768550546636/car_back/1768550551452_z3bby.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768550546636/car_side/1768550553145_2778t.jpg","https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768550546636/car_interior/1768550554475_k1o4d.jpg"],
        vehicleType: 'Minivan',
        status: 'ACTIVE',
        rating: 5,
        reviewCount: 0,
        pricePerKm: 1.6,
        basePrice: 30,
        maxPassengers: 4,
        languages: ["GE","RU","EN","KA"],
        features: ["AC","WiFi","Child Seat","Roof Box","Non-Smoking","Water"],
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
        reviewCount: 0,
        pricePerKm: 2,
        basePrice: 30,
        maxPassengers: 16,
        languages: ["EN","GE"],
        features: ["AC","WiFi","Water","Child Seat","Roof Box","Non-Smoking"],
        blockedDates: [],
        reviews: [],
        debt: 0
    },
    {
        id: 'drv-1768647032318',
        name: 'Giorgi chkhitunidze',
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
        reviewCount: 0,
        pricePerKm: 1,
        basePrice: 30,
        maxPassengers: 4,
        languages: ["EN","GE"],
        features: ["AC"],
        blockedDates: [],
        reviews: [],
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
        reviewCount: 0,
        pricePerKm: 1,
        basePrice: 30,
        maxPassengers: 4,
        languages: ["EN","GE"],
        features: ["AC","WiFi"],
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
            sqlDump += `CREATE TABLE IF NOT EXISTS public.settings (id text primary key default 'default', sms_api_key text, admin_phone_number text default '995593456876', commission_rate numeric default 0.2, email_service_id text, email_template_id text, email_public_key text, sms_enabled boolean default true, background_image_url text, site_title text, site_description text, maintenance_mode boolean default false, min_trip_price numeric default 30, social_facebook text, social_instagram text);\n`;
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
                routeStops: safeArray(getVal(t, 'routeStops', 'route_stops'))
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
                route_stops: item.routeStops, price_options: item.priceOptions, reviews: item.reviews
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
                route_stops: item.routeStops, price_options: item.priceOptions
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
                social_facebook: settings.socialFacebook, social_instagram: settings.socialInstagram
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
