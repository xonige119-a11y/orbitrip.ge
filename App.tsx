import React, { useState, useEffect, useMemo, useCallback, Suspense, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import TourList from './components/TourList';
import AiPlanner from './components/AiPlanner';
import FloatingContact from './components/FloatingContact';
import BookingModal from './components/BookingModal';
import TourDetailModal from './components/TourDetailModal';
import TripSearchBox from './components/TripSearchBox';
import { VehicleResults } from './components/VehicleResults';
import BookingSuccessModal from './components/BookingSuccessModal';
import BlogList from './components/BlogList';
import HomeLanding from './components/HomeLanding'; 
import ErrorBoundary from './components/ErrorBoundary'; 
import DriverProfile from './components/DriverProfile'; 
import SEO from './components/SEO';
import { Language, Tour, Booking, TripSearch, Driver, SystemSettings } from './types';
import { db } from './services/db';
import { smsService } from './services/smsService';
import { emailService } from './services/emailService';

// --- LAZY LOADING COMPONENTS ---
const AdminLogin = React.lazy(() => import('./components/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const DriverDashboard = React.lazy(() => import('./components/DriverDashboard'));
const DriverRegistration = React.lazy(() => import('./components/DriverRegistration'));
const LegalView = React.lazy(() => import('./components/LegalView'));

const DEFAULT_STOPS = ['', ''];

// --- NAVIGATION HELPERS ---
const safeHistoryPush = (state: any, title: string, url: string) => {
    try { 
        if (typeof window !== 'undefined' && window.history.pushState) {
            window.history.pushState(state, title, url); 
        }
    } catch (e) { console.warn("History API restricted.", e); }
};

const safeHistoryReplace = (state: any, title: string, url: string) => {
    try { 
        if (typeof window !== 'undefined' && window.history.replaceState) {
            window.history.replaceState(state, title, url); 
        }
    } catch (e) { console.warn("History API restricted.", e); }
};

const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
    <span className="text-gray-400 text-sm font-bold tracking-widest animate-pulse uppercase">Orbitrip...</span>
  </div>
);

const App = () => {
    // --- STATE ---
    const [language, setLanguage] = useState<Language>(() => {
        try {
            const saved = localStorage.getItem('orbitrip_lang');
            return (saved as Language) || Language.EN;
        } catch (e) { return Language.EN; }
    });

    const [currentView, setCurrentView] = useState('HOME'); 
    const [userLocation, setUserLocation] = useState('Tbilisi'); 
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
    const [searchBoxKey, setSearchBoxKey] = useState(0);

    const [tours, setTours] = useState<Tour[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    
    const [searchParams, setSearchParams] = useState<TripSearch | null>(null);
    const [searchGuests, setSearchGuests] = useState<number>(2); 
    const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
    const [isTourDetailOpen, setIsTourDetailOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    
    const [selectedDriverProfile, setSelectedDriverProfile] = useState<{driver: Driver, price: number} | null>(null);
    const [bookingNumericPrice, setBookingNumericPrice] = useState<number>(0);
    const [bookingFinalDate, setBookingFinalDate] = useState<string>(''); 
    const [selectedDriverForBooking, setSelectedDriverForBooking] = useState<Driver | null>(null);

    const [lastBooking, setLastBooking] = useState<Booking | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    
    const resultsRef = useRef<HTMLDivElement>(null);
    
    const [loggedInDriverId, setLoggedInDriverId] = useState<string | null>(() => {
        try { return localStorage.getItem('orbitrip_driver_session'); } catch (e) { return null; }
    });

    // --- INITIALIZATION ---
    useEffect(() => {
        const initData = async () => {
            try {
                const [settings, allTours, allDrivers, allBookings] = await Promise.all([
                    db.settings.get(),
                    db.tours.getAll(),
                    db.drivers.getAll(),
                    db.bookings.getAll()
                ]);
                
                setSystemSettings(settings);
                setTours(allTours);
                setDrivers([...allDrivers]);
                setBookings(allBookings);

                if (settings.backgroundImageUrl) {
                    const bgElement = document.getElementById('global-bg-image');
                    if (bgElement) bgElement.style.backgroundImage = `url('${settings.backgroundImageUrl}')`;
                }
            } catch (err) { console.error("Data load error:", err); }
            finally { setIsDataLoaded(true); }
        };
        initData();
        window.addEventListener('orbitrip-db-change', initData);
        return () => window.removeEventListener('orbitrip-db-change', initData);
    }, []);

    // --- NAVIGATION ---
    const navigateTo = (view: string, path: string) => {
        setCurrentView(view);
        safeHistoryPush({ view }, '', path);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleReset = () => {
        setSearchParams(null);
        setSelectedTour(null);
        setIsSuccessModalOpen(false);
        setBookingFinalDate('');
        setSearchBoxKey(k => k + 1);
        navigateTo('HOME', '/');
    };

    const handleSearch = useCallback(async (params: TripSearch, isAuto: boolean = false, guests: number = 2, tourOverride?: Tour) => {
        if (tourOverride) setSelectedTour(tourOverride);
        setSearchGuests(guests);
        
        if (isAuto) {
            setIsSearching(true);
            await new Promise(r => setTimeout(r, 600));
            setSearchParams({ ...params }); 
            setIsSearching(false);
        } else {
            setSearchParams(params);
            setCurrentView('SEARCH_RESULTS');
            safeHistoryPush({ view: 'SEARCH_RESULTS' }, '', '?step=results');
        }
    }, []);

    const handleInitiateBooking = (driver: Driver, price: number, date: string) => {
        setSelectedDriverForBooking(driver);
        setBookingNumericPrice(price);
        setBookingFinalDate(date);
        navigateTo('BOOKING_PAGE', '/booking');
    };

    // --- BOOKING LOGIC (With SMS) ---
    const handleBookingSubmit = async (bookingData: any) => {
        try {
            const newBooking: Booking = {
                id: Date.now().toString(),
                ...bookingData,
                status: 'PENDING',
                createdAt: Date.now()
            };
            
            await db.bookings.create(newBooking);
            setBookings(prev => [newBooking, ...prev]);
            setLastBooking(newBooking);
            setIsSuccessModalOpen(true);
            
            // 1. SMS ადმინისტრატორს
            smsService.sendAdminNotification({
                id: newBooking.id,
                tourTitle: newBooking.tourTitle || 'Transfer',
                date: newBooking.date,
                price: `${newBooking.totalPrice} GEL`,
                customerName: newBooking.customerName,
                contact: newBooking.contactInfo,
                driverName: newBooking.driverName || 'Any'
            }).catch(e => console.warn("Admin SMS failed", e));

            // 2. SMS მძღოლს
            if (selectedDriverForBooking?.phone_number) {
                smsService.sendDriverNotification(selectedDriverForBooking.phone_number, {
                    id: newBooking.id,
                    tourTitle: newBooking.tourTitle || 'Transfer',
                    date: newBooking.date,
                    price: `${newBooking.totalPrice} GEL`
                }).catch(e => console.warn("Driver SMS failed", e));
            }

            // 3. Email
            emailService.sendBookingConfirmation(newBooking, selectedTour, language).catch(() => {});
            
        } catch (error) {
            alert(language === Language.EN ? "Booking Error. Try again." : "Ошибка бронирования. Попробуйте снова.");
        }
    };

    const handleLogin = (role: 'ADMIN' | 'DRIVER', driverId?: string) => {
        if (role === 'ADMIN') {
            navigateTo('ADMIN_DASHBOARD', '/admin/dashboard');
        } else if (role === 'DRIVER' && driverId) {
            setLoggedInDriverId(driverId);
            localStorage.setItem('orbitrip_driver_session', driverId);
            navigateTo('DRIVER_DASHBOARD', '/driver/dashboard');
        }
    };

    const handleLogout = () => {
        setLoggedInDriverId(null);
        localStorage.removeItem('orbitrip_driver_session');
        handleReset();
    };

    const isEn = language === Language.EN;

    // --- SEO ---
    const baseSeoTitle = useMemo(() => {
        if (systemSettings?.siteTitle) return systemSettings.siteTitle;
        if (currentView === 'TOURS') return isEn ? "Tours in Georgia" : "Туры по Грузии";
        return isEn ? "OrbiTrip - Georgia Transfers" : "OrbiTrip - Трансферы по Грузии";
    }, [currentView, isEn, systemSettings]);

    if (!isDataLoaded) return <PageLoader />;

    return (
        <ErrorBoundary language={language}>
            <SEO title={baseSeoTitle} description={systemSettings?.siteDescription || "Private drivers in Georgia"} />
            
            <Header 
                language={language} 
                setLanguage={setLanguage} 
                onToolSelect={(tool) => {
                    if (tool === 'HOME') handleReset();
                    else if (tool === 'TOURS') navigateTo('TOURS', '/tours');
                    else if (tool === 'BLOG') navigateTo('BLOG', '/blog');
                    else if (tool === 'ADMIN_LOGIN') navigateTo('ADMIN_LOGIN', '/admin');
                    else if (tool === 'DRIVER_REGISTRATION') navigateTo('DRIVER_REGISTRATION', '/drive-with-us');
                    else if (tool === 'DRIVER_DASHBOARD') navigateTo('DRIVER_DASHBOARD', '/driver/dashboard');
                }} 
                currentLocation={userLocation}
                onLocationChange={setUserLocation}
                isLoggedIn={!!loggedInDriverId}
            />

            <Suspense fallback={<PageLoader />}>
                {(() => {
                    switch (currentView) {
                        case 'ADMIN_LOGIN':
                            return <AdminLogin onLogin={handleLogin} drivers={drivers} language={language} />;
                        
                        case 'ADMIN_DASHBOARD':
                            return <AdminDashboard 
                                bookings={bookings} tours={tours} drivers={drivers}
                                onAddTour={db.tours.create} onUpdateTour={db.tours.update} onDeleteTour={db.tours.delete}
                                onUpdateBookingStatus={db.bookings.updateStatus} onUpdateBooking={db.bookings.update}
                                onAddDriver={db.drivers.create} onUpdateDriver={db.drivers.update} onDeleteDriver={db.drivers.delete}
                                onLogout={handleLogout}
                            />;

                        case 'DRIVER_DASHBOARD':
                            return <DriverDashboard 
                                bookings={bookings} tours={tours} drivers={drivers}
                                driverId={loggedInDriverId || ''}
                                onUpdateBookingStatus={db.bookings.updateStatus}
                                onLogout={handleLogout}
                            />;

                        case 'DRIVER_REGISTRATION':
                            return <DriverRegistration language={language} onRegister={d => { db.drivers.create(d); handleReset(); }} onBack={handleReset} />;

                        case 'BLOG':
                            return <div className="pt-24 bg-white"><BlogList language={language} onBookRoute={(f, t) => handleSearch({ stops: [f, t], date: '', totalDistance: 0 }, false)} /></div>;

                        case 'SEARCH_RESULTS':
                            return (
                                <div className="pt-32 pb-20">
                                    <TripSearchBox 
                                        key={searchBoxKey} 
                                        language={language} 
                                        onSearch={handleSearch} 
                                        initialStops={searchParams?.stops || DEFAULT_STOPS} 
                                        initialDate={searchParams?.date}
                                        maintenanceMode={systemSettings?.maintenanceMode} 
                                    />
                                    {searchParams && (
                                        <div ref={resultsRef} className="animate-fadeIn mt-8">
                                            <VehicleResults 
                                                search={searchParams} language={language} drivers={drivers}
                                                onBook={(d, p, g, dt) => handleInitiateBooking(d, parseFloat(p), dt)}
                                                onProfileOpen={(d, p) => { setSelectedDriverProfile({ driver: d, price: p }); navigateTo('DRIVER_PROFILE', `?driver=${d.id}`); }}
                                                onSearchUpdate={handleSearch}
                                                isLoading={isSearching} tour={selectedTour} minPrice={systemSettings?.minTripPrice}
                                            />
                                        </div>
                                    )}
                                </div>
                            );

                        case 'DRIVER_PROFILE':
                            return selectedDriverProfile ? (
                                <DriverProfile 
                                    driver={selectedDriverProfile.driver} price={selectedDriverProfile.price.toString()} 
                                    language={language} date={searchParams?.date} onBack={() => setCurrentView('SEARCH_RESULTS')}
                                    onBook={(dt) => handleInitiateBooking(selectedDriverProfile.driver, selectedDriverProfile.price, dt)}
                                />
                            ) : null;

                        case 'BOOKING_PAGE':
                            return <BookingModal 
                                onBack={() => setCurrentView('SEARCH_RESULTS')} tour={selectedTour} search={searchParams} 
                                language={language} onSubmit={handleBookingSubmit} initialGuests={searchGuests} 
                                numericPrice={bookingNumericPrice} selectedDriver={selectedDriverForBooking} initialDate={bookingFinalDate} 
                            />;

                        case 'TOURS':
                            return (
                                <div className="pt-24">
                                    <AiPlanner language={language} userLocation={userLocation} drivers={drivers} tours={tours} onPlanToBook={handleSearch} />
                                    <TourList tours={tours} language={language} onViewDetails={(t) => { setSelectedTour(t); setIsTourDetailOpen(true); }} />
                                </div>
                            );

                        case 'HOME':
                        default:
                            return (
                                <div className="pt-32 pb-0">
                                    <div className="max-w-4xl mx-auto px-4 mb-12 text-center text-white">
                                        <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg">
                                            {isEn ? 'Georgia Private Transfers' : 'Трансферы по Грузии'}
                                        </h1>
                                        <p className="text-lg opacity-90 drop-shadow-md">
                                            {isEn ? 'Direct deal with local experts' : 'Заказ напрямую у местных водителей'}
                                        </p>
                                    </div>
                                    <TripSearchBox key={searchBoxKey} language={language} onSearch={handleSearch} initialStops={DEFAULT_STOPS} maintenanceMode={systemSettings?.maintenanceMode} />
                                    <HomeLanding language={language} onRouteSelect={(f, t) => handleSearch({ stops: [f, t], date: '', totalDistance: 0 }, false)} onTourSelect={() => {}} />
                                </div>
                            );
                    }
                })()}
            </Suspense>

            <Footer language={language} settings={systemSettings} onNavigate={navigateTo} />
            
            {isTourDetailOpen && selectedTour && (
                <TourDetailModal 
                    isOpen={isTourDetailOpen} onClose={() => setIsTourDetailOpen(false)} 
                    tour={selectedTour} language={language} 
                    onBook={(t) => handleSearch({ stops: t.routeStops || [], date: '', totalDistance: 200 }, false, 2, t)} 
                />
            )}

            <BookingSuccessModal isOpen={isSuccessModalOpen} onClose={handleReset} booking={lastBooking} language={language} />
            <FloatingContact language={language} />
        </ErrorBoundary>
    );
};

export default App;
