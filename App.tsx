import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import TourList from './components/TourList';
import AiPlanner from './components/AiPlanner';
import ChatBot from './components/ChatBot';
import ContactSection from './components/ContactSection';
import BookingModal from './components/BookingModal';
import TourDetailModal from './components/TourDetailModal';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import DriverDashboard from './components/DriverDashboard';
import TripSearchBox from './components/TripSearchBox';
import { VehicleResults } from './components/VehicleResults';
import BookingSuccessModal from './components/BookingSuccessModal';
import LegalView from './components/LegalView';
import BlogList from './components/BlogList';
import HomeLanding from './components/HomeLanding'; 
import SitemapView from './components/SitemapView'; 
import ErrorBoundary from './components/ErrorBoundary'; 
import SEO from './components/SEO';
import { generateLocalBusinessSchema, generateFAQSchema } from './services/schema';
import { Language, Tour, Booking, TripSearch, VehicleType, Driver, Review } from './types';
import { db } from './services/db';
import { smsService } from './services/smsService';
import { GEORGIAN_LOCATIONS } from './data/locations';
import { isSupabaseConfigured } from './services/supabaseClient';

// --- REAL DATA INJECTION FROM CSV ---

const REAL_TOURS: Tour[] = [
  {
    id: 'tour-batumi-transfer',
    titleEn: 'Transfer to Batumi with Sightseeing',
    titleRu: 'Трансфер в Батуми с экскурсией',
    descriptionEn: "Don't just drive - explore! Stop at Shekvetili Dendrological Park and Musicians Park on your way to the sea.",
    descriptionRu: "Не просто ехать, а изучать! Остановка в Дендрологическом парке Шекветили и Парке Музыкантов по пути к морю.",
    price: 'From 200 GEL',
    basePrice: 200,
    extraPersonFee: 0,
    pricePerPerson: 0,
    priceOptions: [],
    duration: '4-5 Hours',
    image: 'https://images.unsplash.com/photo-1589882650088-75703f6797b9?auto=format&fit=crop&q=80&w=1000',
    rating: 4.7,
    category: 'SEA',
    reviews: [],
    highlightsEn: ["Dendrological Park", "Magnetic Sands of Ureki", "Black Sea Coast", "Comfortable Drive"],
    highlightsRu: ["Дендрологический парк", "Магнитные пески Уреки", "Побережье", "Комфортная поездка"],
    routeStops: ["Kutaisi", "Shekvetili", "Batumi"]
  },
  {
    id: 'tour-martvili-okatse',
    titleEn: 'Canyons of Imereti: Martvili & Okatse',
    titleRu: 'Каньоны Имерети: Мартвили и Окаце',
    descriptionEn: 'A spectacular day trip visiting the hanging bridges of Okatse Canyon and the emerald waters of Martvili. Includes a stop at Kinchkha Waterfall.',
    descriptionRu: 'Захватывающая поездка по подвесным мостам каньона Окаце и изумрудным водам Мартвили. Включает остановку у водопада Кинчха.',
    price: 'From 180 GEL',
    basePrice: 180,
    extraPersonFee: 0,
    pricePerPerson: 0,
    priceOptions: [],
    duration: '7-8 Hours',
    image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80&w=1000',
    rating: 4.9,
    category: 'NATURE',
    reviews: [],
    highlightsEn: ["Boat ride in Martvili", "Hanging bridge at Okatse", "Kinchkha Waterfall", "Swim in cool waters"],
    highlightsRu: ["Лодка в каньоне Мартвили", "Подвесной мост Окаце", "Водопад Кинчха", "Купание в реке"],
    routeStops: ["Kutaisi", "Martvili Canyon", "Okatse Canyon", "Kinchkha Waterfall", "Kutaisi"]
  },
  {
    id: 'tour-prometheus-sataplia',
    titleEn: 'Cave World: Prometheus & Sataplia',
    titleRu: 'Мир Пещер: Прометей и Сатаплиа',
    descriptionEn: 'Discover the underground legends. Prometheus Cave offers a 1.4km walk and boat ride. Sataplia features real dinosaur footprints.',
    descriptionRu: 'Откройте подземные легенды. Пещера Прометея предлагает прогулку 1.4 км и лодку. В Сатаплиа вы увидите следы динозавров.',
    price: 'From 120 GEL',
    basePrice: 120,
    extraPersonFee: 0,
    pricePerPerson: 0,
    priceOptions: [],
    duration: '4-5 Hours',
    image: 'https://images.unsplash.com/photo-1596306499300-0b7b1689b9e6?auto=format&fit=crop&q=80&w=1000',
    rating: 4.8,
    category: 'NATURE',
    reviews: [],
    highlightsEn: ["Dinosaur footprints", "Underground boat ride", "Glass observation deck", "Stalactites & Stalagmites"],
    highlightsRu: ["Следы динозавров", "Подземная лодка", "Стеклянная смотровая", "Сталактиты и сталагмиты"],
    routeStops: ["Kutaisi", "Prometheus Cave", "Sataplia", "Kutaisi"]
  },
  {
    id: 'tour-racha',
    titleEn: 'Racha: The Georgian Switzerland',
    titleRu: 'Рача: Грузинская Швейцария',
    descriptionEn: 'A long but rewarding day trip to the mountains. See Shaori Lake, Nikortsminda Cathedral and taste famous Khvanchkara wine.',
    descriptionRu: 'Длинный, но стоящий день в горах. Озеро Шаори, собор Никорцминда и дегустация знаменитого вина Хванчкара.',
    price: 'From 280 GEL',
    basePrice: 280,
    extraPersonFee: 0,
    pricePerPerson: 0,
    priceOptions: [],
    duration: '9-10 Hours',
    image: 'https://images.unsplash.com/photo-1569929940173-2476b7384a86?auto=format&fit=crop&q=80&w=1000',
    rating: 5.0,
    category: 'MOUNTAINS',
    reviews: [],
    highlightsEn: ["Shaori Reservoir", "Nikortsminda UNESCO", "Khvanchkara Wine Tasting", "Mountain Pass"],
    highlightsRu: ["Водохранилище Шаори", "Никорцминда ЮНЕСКО", "Дегустация Хванчкары", "Горный перевал"],
    routeStops: ["Kutaisi", "Ambrolauri", "Shovi", "Kutaisi"]
  },
  {
    id: 'tour-tskantubo-otzrkhe',
    titleEn: 'Soviet Sanatoriums & Urbex Tour',
    titleRu: 'Советские Санатории и Урбекс',
    descriptionEn: 'Explore the abandoned beauty of Tskaltubo. Visit Stalin\'s private bathhouse and grand hotels overtaken by nature.',
    descriptionRu: 'Исследуйте заброшенную красоту Цхалтубо. Посетите личную баню Сталина и гранд-отели, поглощенные природой.',
    price: 'From 90 GEL',
    basePrice: 90,
    extraPersonFee: 0,
    pricePerPerson: 0,
    priceOptions: [],
    duration: '3-4 Hours',
    image: 'https://images.unsplash.com/photo-1629196914168-3a958d0426d9?auto=format&fit=crop&q=80&w=1000',
    rating: 5.0,
    category: 'CULTURE',
    reviews: [],
    highlightsEn: ["Stalin's Bathhouse No. 6", "Sanatorium Iveria", "Unique Architecture", "Photography spots"],
    highlightsRu: ["Баня Сталина №6", "Санаторий Иверия", "Уникальная архитектура", "Фото-локации"],
    routeStops: ["Kutaisi", "Tskaltubo", "Kutaisi"]
  },
  {
    id: 'tour-vardzia-rabati',
    titleEn: 'History Tour: Vardzia, Rabati & Borjomi',
    titleRu: 'Исторический тур: Вардзия, Рабат и Боржоми',
    descriptionEn: 'Travel through centuries. The cave city of Vardzia (12th century), the multicultural Rabati Fortress, and Borjomi mineral waters.',
    descriptionRu: 'Путешествие сквозь века. Пещерный город Вардзия (12 век), крепость Рабат и минеральные воды Боржоми.',
    price: 'From 320 GEL',
    basePrice: 320,
    extraPersonFee: 0,
    pricePerPerson: 0,
    priceOptions: [],
    duration: '11-12 Hours',
    image: 'https://images.unsplash.com/photo-1594235048794-fae7526ae79a?auto=format&fit=crop&q=80&w=1000',
    rating: 4.9,
    category: 'CULTURE',
    reviews: [],
    highlightsEn: ["Vardzia Cave City", "Rabati Fortress", "Borjomi Park", "Green Monastery"],
    highlightsRu: ["Пещеры Вардзия", "Крепость Рабат", "Парк Боржоми", "Зеленый Монастырь"],
    routeStops: ["Kutaisi", "Borjomi", "Rabati Fortress", "Vardzia", "Kutaisi"]
  }
];

// --- REAL DRIVER DATA FROM CSV (Subset for Performance) ---
const REAL_DRIVERS: Driver[] = [
    {
        id: 'd1', name: 'Dato (Demo)', email: 'dato@orbitrip.ge', password: 'start', city: 'kutaisi', photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        carModel: 'Toyota Prius', carPhotoUrl: 'https://images.unsplash.com/photo-1626847037657-fd3622613ce3?w=500', vehicleType: 'Sedan', maxPassengers: 4,
        languages: ['EN', 'RU', 'GE'], rating: 4.9, reviewCount: 12, reviews: [], pricePerKm: 1.2, basePrice: 30, features: ['AC', 'WiFi', 'Water'], status: 'ACTIVE', blockedDates: []
    },
    {
        id: 'gen-188', name: 'Gocha Beridze', email: 'gocha.beridze@example.com', city: 'kutaisi', photoUrl: 'https://randomuser.me/api/portraits/men/66.jpg',
        carModel: 'Honda Elysion', carPhotoUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500', vehicleType: 'Minivan', maxPassengers: 7,
        languages: ['EN', 'RU', 'GE'], rating: 4.9, reviewCount: 12, reviews: [], pricePerKm: 1.0, basePrice: 43, features: ['AC', 'WiFi'], status: 'ACTIVE', blockedDates: []
    },
    {
        id: 'gen-88', name: 'Nika Nozadze', email: 'nika.nozadze@example.com', city: 'tbilisi', photoUrl: 'https://randomuser.me/api/portraits/men/6.jpg',
        carModel: 'Honda Elysion', carPhotoUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500', vehicleType: 'Minivan', maxPassengers: 7,
        languages: ['EN', 'RU', 'GE'], rating: 4.9, reviewCount: 12, reviews: [], pricePerKm: 1.0, basePrice: 43, features: ['AC'], status: 'ACTIVE', blockedDates: ["10 January 2026", "11 January 2026", "12 January 2026"]
    },
    {
        id: 'gen-27', name: 'Salome Gelashvili', email: 'salome.gelashvili@example.com', city: 'kutaisi', photoUrl: 'https://randomuser.me/api/portraits/women/39.jpg',
        carModel: 'Toyota Camry', carPhotoUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?w=500', vehicleType: 'Sedan', maxPassengers: 4,
        languages: ['EN', 'RU', 'GE'], rating: 4.9, reviewCount: 12, reviews: [], pricePerKm: 1.0, basePrice: 69, features: ['AC', 'Water'], status: 'ACTIVE', blockedDates: []
    },
    {
        id: 'gen-101', name: 'Lasha Tabatadze', email: 'lasha.tabatadze@example.com', city: 'kutaisi', photoUrl: 'https://randomuser.me/api/portraits/men/5.jpg',
        carModel: 'Toyota Alphard', carPhotoUrl: 'https://images.unsplash.com/photo-1624623348003-997c0cb9d724?w=500', vehicleType: 'Minivan', maxPassengers: 7,
        languages: ['EN', 'RU', 'GE'], rating: 4.9, reviewCount: 12, reviews: [], pricePerKm: 1.19, basePrice: 30, features: ['AC', 'WiFi'], status: 'ACTIVE', blockedDates: []
    },
    {
        id: 'gen-82', name: 'Dato Mchedlishvili', email: 'dato.mchedlishvili@example.com', city: 'kutaisi', photoUrl: 'https://randomuser.me/api/portraits/men/72.jpg',
        carModel: 'Mercedes Viano', carPhotoUrl: 'https://images.unsplash.com/photo-1609520505218-7421da3b3d4f?w=500', vehicleType: 'Minivan', maxPassengers: 7,
        languages: ['EN', 'RU', 'GE'], rating: 4.9, reviewCount: 12, reviews: [], pricePerKm: 1.06, basePrice: 33, features: ['AC', 'Water'], status: 'ACTIVE', blockedDates: []
    },
     {
        id: 'gen-57', name: 'Sandro Japaridze', email: 'sandro.japaridze@example.com', city: 'kutaisi', photoUrl: 'https://randomuser.me/api/portraits/men/13.jpg',
        carModel: 'Mercedes Viano', carPhotoUrl: 'https://images.unsplash.com/photo-1609520505218-7421da3b3d4f?w=500', vehicleType: 'Minivan', maxPassengers: 7,
        languages: ['EN', 'RU', 'GE'], rating: 4.9, reviewCount: 12, reviews: [], pricePerKm: 1.02, basePrice: 38, features: ['AC', 'Water'], status: 'ACTIVE', blockedDates: []
    },
    {
        id: 'gen-160', name: 'Saba Maisuradze', email: 'saba.maisuradze@example.com', city: 'kutaisi', photoUrl: 'https://randomuser.me/api/portraits/men/26.jpg',
        carModel: 'Mercedes Viano', carPhotoUrl: 'https://images.unsplash.com/photo-1609520505218-7421da3b3d4f?w=500', vehicleType: 'Minivan', maxPassengers: 7,
        languages: ['EN', 'RU', 'GE'], rating: 4.9, reviewCount: 12, reviews: [], pricePerKm: 1.01, basePrice: 40, features: ['AC', 'Water'], status: 'ACTIVE', blockedDates: []
    },
    {
        id: 'gen-50', name: 'Zaza Giorgadze', email: 'zaza.giorgadze@example.com', city: 'kutaisi', photoUrl: 'https://randomuser.me/api/portraits/men/91.jpg',
        carModel: 'Toyota Alphard', carPhotoUrl: 'https://images.unsplash.com/photo-1624623348003-997c0cb9d724?w=500', vehicleType: 'Minivan', maxPassengers: 7,
        languages: ['EN', 'RU', 'GE'], rating: 5.0, reviewCount: 12, reviews: [], pricePerKm: 1.32, basePrice: 41, features: ['AC', 'WiFi'], status: 'ACTIVE', blockedDates: []
    }
];

// --- APP COMPONENT ---
const App = () => {
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem('orbitrip_lang');
        return (saved as Language) || Language.EN;
    });

    const [currentView, setCurrentView] = useState('HOME'); 
    
    // DATA LOADING STATE
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    useEffect(() => {
        localStorage.setItem('orbitrip_lang', language);
    }, [language]);

    // Initialize with REAL data immediately
    const [tours, setTours] = useState<Tour[]>(REAL_TOURS);
    const [drivers, setDrivers] = useState<Driver[]>(REAL_DRIVERS);
    const [bookings, setBookings] = useState<Booking[]>([]);
    
    // MODAL STATES
    const [searchParams, setSearchParams] = useState<TripSearch | null>(null);
    const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
    const [isTourDetailOpen, setIsTourDetailOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    
    const [lastBooking, setLastBooking] = useState<Booking | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    
    const [loggedInDriverId, setLoggedInDriverId] = useState<string | null>(null);

    // --- DATA FETCHING ---
    useEffect(() => {
        const initData = async () => {
            // Try to load from DB, otherwise use REAL_TOURS/REAL_DRIVERS constants
            let dbTours = await db.tours.getAll();
            if (dbTours.length > 0) setTours(dbTours);

            let dbDrivers = await db.drivers.getAll();
            if (dbDrivers.length > 0) setDrivers(dbDrivers);

            const dbBookings = await db.bookings.getAll();
            setBookings(dbBookings);
            
            // Mark data as loaded to enable routing
            setIsDataLoaded(true);
        };

        initData();
        const handleDbChange = () => initData();
        window.addEventListener('orbitrip-db-change', handleDbChange);
        return () => window.removeEventListener('orbitrip-db-change', handleDbChange);
    }, []);

    // --- ROUTING LOGIC (Deep Linking) ---
    useEffect(() => {
        // Only run routing logic if data is loaded to prevent race conditions (404 on valid tours)
        if (!isDataLoaded) return;

        const path = window.location.pathname;
        
        // 1. Static Routes
        if (path === '/blog') setCurrentView('BLOG');
        else if (path === '/admin') setCurrentView('ADMIN_LOGIN');
        else if (path === '/sitemap') setCurrentView('SITEMAP');
        else if (path === '/terms') setCurrentView('LEGAL_TERMS');
        else if (path === '/privacy') setCurrentView('LEGAL_PRIVACY');
        
        // 2. Dynamic Tour Routes (/tour/:id)
        else if (path.startsWith('/tour/')) {
            const tourId = path.split('/tour/')[1];
            if (tourId) {
                const foundTour = tours.find(t => t.id === tourId);
                if (foundTour) {
                    setSelectedTour(foundTour);
                    setIsTourDetailOpen(true);
                    setCurrentView('HOME'); // Render Home in background
                    window.scrollTo({ top: 0, behavior: 'instant' });
                } else {
                    // Tour not found in loaded data
                    setCurrentView('NOT_FOUND');
                }
            }
        }
        else if (path === '/' || path === '') setCurrentView('HOME');
        else setCurrentView('NOT_FOUND');
        
    }, [isDataLoaded, tours]); 

    // Browser Back Button Handling
    useEffect(() => {
        const onPopState = () => {
            if (!isDataLoaded) return;
            const newPath = window.location.pathname;
            if (newPath === '/blog') setCurrentView('BLOG');
            else if (newPath === '/admin') setCurrentView('ADMIN_LOGIN');
            else if (newPath === '/' || newPath === '') {
                setCurrentView('HOME');
                setIsTourDetailOpen(false); 
            }
        };
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, [isDataLoaded]);

    const navigateTo = (view: string, path: string) => {
        setCurrentView(view);
        window.history.pushState({}, '', path);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = useCallback((params: TripSearch, isAuto: boolean = false) => {
        setSearchParams(params);
        if (!isAuto) {
            setCurrentView('SEARCH_RESULTS');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, []);

    const handleBookingSubmit = async (bookingData: any) => {
        const newBooking: Booking = {
            id: Date.now().toString(),
            ...bookingData,
            status: 'PENDING',
            createdAt: Date.now()
        };

        setBookings(prev => [newBooking, ...prev]);
        await db.bookings.create(newBooking);

        await smsService.sendAdminNotification({
            tourTitle: newBooking.tourTitle,
            date: newBooking.date,
            price: newBooking.totalPrice,
            customerName: newBooking.customerName,
            contact: newBooking.contactInfo,
            driverName: newBooking.driverName || 'Any'
        });

        if (newBooking.driverId) {
            const driver = drivers.find(d => d.id === newBooking.driverId);
            if (driver && driver.phoneNumber) {
                await smsService.sendDriverNotification(driver.phoneNumber, {
                    tourTitle: newBooking.tourTitle,
                    date: newBooking.date,
                    price: newBooking.totalPrice
                });
            }
        }

        setLastBooking(newBooking);
        setIsBookingModalOpen(false);
        setIsSuccessModalOpen(true);
    };

    const handleLogin = (role: 'ADMIN' | 'DRIVER', driverId?: string) => {
        if (role === 'ADMIN') setCurrentView('ADMIN_DASHBOARD');
        else if (role === 'DRIVER' && driverId) {
            setLoggedInDriverId(driverId);
            setCurrentView('DRIVER_DASHBOARD');
        }
    };

    const handleLogout = () => {
        setLoggedInDriverId(null);
        navigateTo('HOME', '/');
    };

    // --- LOADING SCREEN ---
    if (!isDataLoaded) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight">OrbiTrip<span className="text-indigo-600">.ge</span></h1>
                <p className="text-sm text-gray-500 mt-2">Loading best tours...</p>
            </div>
        );
    }

    const renderContent = () => {
        switch (currentView) {
            case 'ADMIN_LOGIN':
                return <AdminLogin onLogin={handleLogin} drivers={drivers} />;
            case 'ADMIN_DASHBOARD':
                return <AdminDashboard bookings={bookings} tours={tours} drivers={drivers} onAddTour={db.tours.create} onUpdateTour={db.tours.update} onDeleteTour={db.tours.delete} onUpdateBookingStatus={db.bookings.updateStatus} onAddDriver={db.drivers.create} onUpdateDriver={db.drivers.update} onDeleteDriver={db.drivers.delete} onLogout={handleLogout} />;
            case 'DRIVER_DASHBOARD':
                if (!loggedInDriverId) return <div onClick={() => navigateTo('ADMIN_LOGIN', '/admin')}>Access Denied. Click to Login.</div>;
                return <DriverDashboard bookings={bookings} tours={tours} drivers={drivers} driverId={loggedInDriverId} onAddTour={db.tours.create} onUpdateTour={db.tours.update} onDeleteTour={db.tours.delete} onUpdateBookingStatus={db.bookings.updateStatus} onAddDriver={db.drivers.create} onUpdateDriver={db.drivers.update} onDeleteDriver={db.drivers.delete} onLogout={handleLogout} />;
            case 'SEARCH_RESULTS':
                if (!searchParams) return <div>No search params</div>;
                return <VehicleResults search={searchParams} language={language} onBook={(driver, price, guests) => {}} onDirectBooking={handleBookingSubmit} drivers={drivers} tour={selectedTour} onBack={() => navigateTo('HOME', '/')} bookings={bookings} />;
            case 'BLOG':
                return <BlogList language={language} onBookRoute={(from, to) => handleSearch({ stops: [from, to], date: '', totalDistance: 0 }, false)} />;
            case 'LEGAL_TERMS':
                return <LegalView type="TERMS" language={language} onBack={() => navigateTo('HOME', '/')} />;
            case 'LEGAL_PRIVACY':
                return <LegalView type="PRIVACY" language={language} onBack={() => navigateTo('HOME', '/')} />;
            case 'SITEMAP':
                return <SitemapView language={language} onLinkClick={(from, to) => handleSearch({ stops: [from, to], date: '', totalDistance: 0 }, false)} onBack={() => navigateTo('HOME', '/')} />;
            case 'NOT_FOUND':
                return (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                        <div className="text-6xl mb-4">🛸</div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">404 - Not Found</h1>
                        <p className="text-gray-500 mb-6">The page or tour you are looking for does not exist.</p>
                        <button onClick={() => navigateTo('HOME', '/')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition">Return Home</button>
                    </div>
                );
            case 'HOME':
            default:
                return (
                    <div className="font-sans">
                        <SEO 
                            title={language === Language.EN ? "OrbiTrip - Private Transfers & Tours" : "OrbiTrip - Частные Трансферы и Туры"}
                            description={language === Language.EN ? "Book reliable private drivers in Georgia. Tbilisi to Kazbegi, Batumi transfers, and wine tours. Stop anywhere for free." : "Закажите надежного водителя в Грузии. Трансферы из Тбилиси в Казбеги, Батуми и винные туры. Остановки бесплатно."}
                        />
                        <div className="relative bg-slate-900 py-20 lg:py-32 overflow-hidden">
                             <div className="absolute inset-0 z-0 opacity-40"><img src="https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="Background" /></div>
                             <div className="relative z-10 max-w-7xl mx-auto px-4">
                                 <div className="text-center mb-10">
                                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">{language === Language.EN ? 'Plan Your Trip' : 'Спланируй Поездку'}</h1>
                                    <p className="text-xl text-indigo-100 font-medium">{language === Language.EN ? 'Custom routes, verified drivers' : 'Свои маршруты, проверенные водители'}</p>
                                 </div>
                                 <TripSearchBox language={language} onSearch={handleSearch} />
                             </div>
                        </div>
                        <div className="bg-white py-16 border-b border-gray-100">
                             <div className="max-w-7xl mx-auto px-4">
                                 <div className="text-center mb-10"><h2 className="text-3xl font-bold text-gray-900">{language === Language.EN ? 'Not sure where to go?' : 'Не знаете, куда поехать?'}</h2><p className="text-gray-500">{language === Language.EN ? 'Ask our AI Assistant to design a perfect route for you.' : 'Попросите наш ИИ составить идеальный маршрут.'}</p></div>
                                 <AiPlanner language={language} onPlanToBook={(search) => handleSearch(search, false)} />
                             </div>
                        </div>
                        <TourList 
                            tours={tours} 
                            language={language} 
                            onViewDetails={(tour, location) => {
                                // Deep Linking: Update URL
                                window.history.pushState({}, '', `/tour/${tour.id}`);
                                setSelectedTour(tour); 
                                setIsTourDetailOpen(true); 
                            }}
                            drivers={drivers}
                        />
                        <HomeLanding language={language} onRouteSelect={(f, t) => handleSearch({ stops: [f, t], date: '', totalDistance: 0 }, false)} onTourSelect={() => {}} />
                    </div>
                );
        }
    };

    return (
        <ErrorBoundary language={language}>
            {/* INJECT SCHEMA MARKUP GLOBALLY */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: generateLocalBusinessSchema() }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: generateFAQSchema() }} />

            {['ADMIN_DASHBOARD', 'DRIVER_DASHBOARD', 'ADMIN_LOGIN'].indexOf(currentView) === -1 && (
                <Header 
                    language={language} 
                    setLanguage={setLanguage} 
                    onToolSelect={(tool) => {
                        if (tool === 'ADMIN_LOGIN') navigateTo('ADMIN_LOGIN', '/admin');
                        else if (tool === 'BLOG') navigateTo('BLOG', '/blog');
                        else navigateTo('HOME', '/');
                    }} 
                />
            )}

            {renderContent()}

            {['ADMIN_DASHBOARD', 'DRIVER_DASHBOARD', 'ADMIN_LOGIN'].indexOf(currentView) === -1 && (
                <>
                    <ContactSection language={language} />
                    <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
                        {/* Footer Content */}
                        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div><h3 className="text-xl font-black mb-4">OrbiTrip</h3><p className="text-slate-400 text-sm">Your trusted partner for exploring Georgia comfortably and safely.</p></div>
                            <div><h4 className="font-bold mb-4 uppercase text-xs tracking-wider text-slate-500">Company</h4><ul className="space-y-2 text-sm text-slate-300"><li><button onClick={() => navigateTo('BLOG', '/blog')} className="hover:text-white">Travel Blog</button></li><li><button onClick={() => navigateTo('SITEMAP', '/sitemap')} className="hover:text-white">Destinations</button></li><li><button onClick={() => navigateTo('ADMIN_LOGIN', '/admin')} className="hover:text-white">Partner Login</button></li></ul></div>
                            <div><h4 className="font-bold mb-4 uppercase text-xs tracking-wider text-slate-500">Legal</h4><ul className="space-y-2 text-sm text-slate-300"><li><button onClick={() => navigateTo('LEGAL_TERMS', '/terms')} className="hover:text-white">Terms of Service</button></li><li><button onClick={() => navigateTo('LEGAL_PRIVACY', '/privacy')} className="hover:text-white">Privacy Policy</button></li></ul></div>
                            <div><h4 className="font-bold mb-4 uppercase text-xs tracking-wider text-slate-500">Contact</h4><p className="text-sm text-slate-300">WhatsApp: +995 593 456 876</p><p className="text-sm text-slate-300">Email: support@orbitrip.ge</p></div>
                        </div>
                    </footer>
                </>
            )}

            {/* TOUR DETAILS MODAL (High Z-Index & Fixed) */}
            {isTourDetailOpen && selectedTour && (
                <TourDetailModal 
                    isOpen={isTourDetailOpen}
                    onClose={() => {
                        setIsTourDetailOpen(false);
                        // Revert URL to Home
                        window.history.pushState({}, '', '/');
                    }}
                    tour={selectedTour}
                    language={language}
                    onBook={(tour, guests) => {
                        setIsTourDetailOpen(false); 
                    }}
                />
            )}
            
            {/* BOOKING MODAL (For direct transfers or other flows) */}
            <BookingModal 
                isOpen={isBookingModalOpen && !!selectedTour && !currentView.includes('DASHBOARD')} 
                onClose={() => setIsBookingModalOpen(false)}
                tour={selectedTour}
                search={searchParams}
                language={language}
                onSubmit={handleBookingSubmit}
                initialGuests={1}
            />

            <BookingSuccessModal 
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                booking={lastBooking}
                language={language}
            />

            <ChatBot language={language} />
        </ErrorBoundary>
    );
};

export default App;