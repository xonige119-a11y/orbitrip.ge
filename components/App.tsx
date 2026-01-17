
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

// --- LAZY LOADING FOR HEAVY & ADMIN COMPONENTS ---
const AdminLogin = React.lazy(() => import('./components/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const DriverDashboard = React.lazy(() => import('./components/DriverDashboard'));
const DriverRegistration = React.lazy(() => import('./components/DriverRegistration'));
const LegalView = React.lazy(() => import('./components/LegalView'));

const DEFAULT_STOPS = ['', ''];

// --- SAFE HISTORY WRAPPERS ---
// Prevents crashes in environments where History API is restricted
const safeHistoryPush = (state: any, title: string, url: string) => {
    try { 
        if (typeof window !== 'undefined' && window.history && typeof window.history.pushState === 'function') {
            window.history.pushState(state, title, url); 
        }
    } catch (e) {
        console.warn("Navigation warning: History API restricted.", e);
    }
};

const safeHistoryReplace = (state: any, title: string, url: string) => {
    try { 
        if (typeof window !== 'undefined' && window.history && typeof window.history.replaceState === 'function') {
            window.history.replaceState(state, title, url); 
        }
    } catch (e) {
        console.warn("Navigation warning: History API restricted.", e);
    }
};

const safeHistoryBack = () => {
    try { 
        if (typeof window !== 'undefined' && window.history && typeof window.history.back === 'function') {
            window.history.back(); 
        }
    } catch (e) {
        console.warn("Navigation warning: History API restricted.", e);
    }
};

const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
    <span className="text-gray-400 text-sm font-bold tracking-widest animate-pulse uppercase">Orbitrip...</span>
  </div>
);

const App = () => {
    const [language, setLanguage] = useState<Language>(() => {
        try {
            const storage = typeof window !== 'undefined' ? window.localStorage : null; 
            if (!storage) return Language.EN;
            const saved = storage.getItem('orbitrip_lang');
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
    
    // VISUAL LOADING STATE FOR AUTO-UPDATES
    const [isSearching, setIsSearching] = useState(false);
    
    const [selectedDriverProfile, setSelectedDriverProfile] = useState<{driver: Driver, price: number} | null>(null);

    const [bookingNumericPrice, setBookingNumericPrice] = useState<number>(0);
    const [bookingFinalDate, setBookingFinalDate] = useState<string>(''); 
    const [selectedDriverForBooking, setSelectedDriverForBooking] = useState<Driver | null>(null);

    const [lastBooking, setLastBooking] = useState<Booking | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    
    const resultsRef = useRef<HTMLDivElement>(null);
    const [manualSearchTimestamp, setManualSearchTimestamp] = useState(0);
    
    const [loggedInDriverId, setLoggedInDriverId] = useState<string | null>(() => {
        try { return typeof window !== 'undefined' ? window.localStorage.getItem('orbitrip_driver_session') : null; }
        catch (e) { return null; }
    });

    useEffect(() => {
        const initData = async () => {
            try {
                const settings = await db.settings.get();
                setSystemSettings(settings);
                if (settings.backgroundImageUrl) {
                    const bgElement = document.getElementById('global-bg-image');
                    if (bgElement) bgElement.style.backgroundImage = `url('${settings.backgroundImageUrl}')`;
                }
                setTours(await db.tours.getAll());
                setDrivers([...await db.drivers.getAll()]);
                setBookings(await db.bookings.getAll());
            } catch (err) { console.error(err); }
            finally { setIsDataLoaded(true); }
        };
        initData();
        window.addEventListener('orbitrip-db-change', initData);
        return () => window.removeEventListener('orbitrip-db-change', initData);
    }, []);

    // --- BROWSER HISTORY MANAGEMENT ---
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (event.state && event.state.view) {
                setCurrentView(event.state.view);
            } else {
                // Intelligent Fallback if history state is missing
                if (currentView === 'BOOKING_PAGE') {
                    setCurrentView(searchParams ? 'SEARCH_RESULTS' : 'HOME');
                } else if (currentView === 'DRIVER_PROFILE') {
                    setCurrentView('SEARCH_RESULTS');
                } else if (currentView === 'SEARCH_RESULTS') {
                    setCurrentView('HOME');
                    setSearchParams(null);
                } else if (currentView.startsWith('LEGAL')) {
                    setCurrentView('HOME');
                }
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [currentView, searchParams]);

    const navigateTo = (view: string, path: string) => {
        setCurrentView(view);
        safeHistoryPush({ view }, '', path);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = useCallback(async (params: TripSearch, isAuto: boolean = false, guests: number = 2, tourOverride?: Tour) => {
        if (tourOverride) setSelectedTour(tourOverride);
        setSearchGuests(guests);
        
        // AUTO-UPDATE LOGIC WITH VISUAL FEEDBACK
        if (isAuto) {
            setIsSearching(true);
            // Artificial delay to show the user that calculation is happening (Visual Feedback)
            // This is crucial for UX so users perceive the price update
            await new Promise(resolve => setTimeout(resolve, 600)); 
            setSearchParams(prev => ({ ...params })); // Force new object ref
            setIsSearching(false);
        } else {
            // Manual search click - instant transition
            setSearchParams(params);
            setCurrentView('SEARCH_RESULTS');
            safeHistoryPush({ view: 'SEARCH_RESULTS' }, '', '?step=results');
            setManualSearchTimestamp(Date.now());
        }
    }, []);

    const handleInitiateBooking = (driver: Driver, price: number, date: string) => {
        setSelectedDriverForBooking(driver);
        setBookingNumericPrice(price);
        // Ensure date is carried over correctly from the selection
        setBookingFinalDate(date);
        
        setCurrentView('BOOKING_PAGE');
        safeHistoryPush({ view: 'BOOKING_PAGE' }, '', '/booking');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
            
            smsService.sendAdminNotification({
                tourTitle: newBooking.tourTitle,
                date: newBooking.date,
                price: newBooking.totalPrice,
                customerName: newBooking.customerName,
                contact: newBooking.contactInfo,
                driverName: newBooking.driverName || 'Any'
            }).catch(() => {});
            emailService.sendBookingConfirmation(newBooking, selectedTour, language).catch(() => {});
        } catch (error) {
            alert(language === Language.EN ? "Network Error. Please try again." : "Ошибка сети. Пожалуйста, попробуйте снова.");
        }
    };

    const handleReset = () => {
        setSearchParams(null);
        setSelectedTour(null);
        setIsSuccessModalOpen(false);
        setBookingFinalDate('');
        setSearchBoxKey(k => k + 1);
        
        // Try to use safeHistoryBack if possible to keep history clean, otherwise push HOME
        if (currentView !== 'HOME') {
             setCurrentView('HOME');
             safeHistoryPush({ view: 'HOME' }, '', '/');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // FIX: EXPLICIT NAVIGATION (No ambiguous history.back calls)
    const handleBackFromBooking = () => {
        // Use safeHistoryBack to return to previous state (Profile or Results) naturally
        safeHistoryBack();
        
        // Fallback check in case history stack is empty (e.g. direct link) handled by useEffect popstate
    };

    // FIX: EXPLICIT NAVIGATION
    const handleBackToResults = () => {
        // Return to search results from profile
        safeHistoryBack();
        
        // Do not scroll to top, try to keep position if possible, or scroll to results container
        setTimeout(() => {
            if (resultsRef.current) {
                resultsRef.current.scrollIntoView({ behavior: 'auto' });
            }
        }, 50);
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
        navigateTo('HOME', '/');
    };

    const isEn = language === Language.EN;

    const baseSeoTitle = useMemo(() => {
        if (systemSettings?.siteTitle) return systemSettings.siteTitle;
        switch(currentView) {
            case 'TOURS': return isEn ? "OrbiTrip - Tours" : "OrbiTrip - Туры";
            case 'BLOG': return isEn ? "Travel Blog" : "Блог о путешествиях";
            case 'ADMIN_LOGIN': return "Partner Login";
            case 'BOOKING_PAGE': return isEn ? "Complete Booking" : "Завершение бронирования";
            default: return isEn ? "OrbiTrip - Transfers" : "OrbiTrip - Трансферы";
        }
    }, [currentView, isEn, systemSettings]);

    const baseSeoDesc = useMemo(() => {
        if (systemSettings?.siteDescription) return systemSettings.siteDescription;
        return isEn ? "Book reliable private drivers in Georgia." : "Закажите надежных частных водителей в Грузии.";
    }, [isEn, systemSettings]);

    if (!isDataLoaded) return <PageLoader />;

    return (
        <ErrorBoundary language={language}>
            <SEO title={baseSeoTitle} description={baseSeoDesc} />
            
            <Header 
                language={language} 
                setLanguage={setLanguage} 
                onToolSelect={(tool) => {
                    if (tool === 'HOME') handleReset();
                    else if (tool === 'TOURS') navigateTo('TOURS', '/tours');
                    else if (tool === 'BLOG') navigateTo('BLOG', '/blog');
                    else if (tool === 'ADMIN_LOGIN') navigateTo('ADMIN_LOGIN', '/admin');
                    else if (tool === 'DRIVER_REGISTRATION') navigateTo('DRIVER_REGISTRATION', '/drive-with-us');
                    else if (tool === 'DRIVER_DASHBOARD') navigateTo('DRIVER_DASHBOARD', '/admin');
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
                                bookings={bookings} 
                                tours={tours} 
                                drivers={drivers} 
                                onAddTour={t => db.tours.create(t)} 
                                onUpdateTour={t => db.tours.update(t)} 
                                onDeleteTour={id => db.tours.delete(id)} 
                                onUpdateBookingStatus={(id, status) => db.bookings.updateStatus(id, status)} 
                                onUpdateBooking={b => db.bookings.update(b)}
                                onAddDriver={d => db.drivers.create(d)} 
                                onUpdateDriver={d => db.drivers.update(d)} 
                                onDeleteDriver={id => db.drivers.delete(id)}
                                onLogout={handleLogout}
                            />;

                        case 'DRIVER_DASHBOARD':
                            return <DriverDashboard 
                                bookings={bookings} 
                                tours={tours} 
                                drivers={drivers} 
                                driverId={loggedInDriverId || ''} 
                                onAddTour={t => db.tours.create(t)} 
                                onUpdateTour={t => db.tours.update(t)} 
                                onDeleteTour={id => db.tours.delete(id)} 
                                onUpdateBookingStatus={(id, status) => db.bookings.updateStatus(id, status)}
                                onAddDriver={d => db.drivers.create(d)} 
                                onUpdateDriver={d => db.drivers.update(d)} 
                                onDeleteDriver={id => db.drivers.delete(id)}
                                onLogout={handleLogout}
                            />;

                        case 'DRIVER_REGISTRATION':
                            return <DriverRegistration language={language} onRegister={d => { db.drivers.create(d); navigateTo('HOME', '/'); alert(isEn ? 'Application Sent!' : 'Заявка отправлена!'); }} onBack={() => navigateTo('HOME', '/')} />;

                        case 'BLOG':
                            return (
                                <div className="pt-24 bg-white">
                                    <BlogList language={language} onBookRoute={(f, t) => handleSearch({ stops: [f, t], date: '', totalDistance: 0 }, false)} />
                                </div>
                            );
                        
                        case 'LEGAL_TERMS':
                            return (
                                <div className="pt-24 bg-white">
                                    <LegalView type="TERMS" language={language} onBack={handleReset} />
                                </div>
                            );

                        case 'LEGAL_PRIVACY':
                            return (
                                <div className="pt-24 bg-white">
                                    <LegalView type="PRIVACY" language={language} onBack={handleReset} />
                                </div>
                            );

                        case 'SEARCH_RESULTS':
                            return (
                                <div className="pt-0 pb-0">
                                    <div className="max-w-4xl mx-auto px-4 mb-12 text-center text-white pt-32">
                                        <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg">
                                            {isEn ? 'Georgia Private Transfers' : 'Трансферы по Грузии'}
                                        </h1>
                                        <p className="text-lg opacity-90 drop-shadow-md">
                                            {isEn ? 'Direct deal with local experts' : 'Заказ напрямую у местных водителей'}
                                        </p>
                                    </div>

                                    <TripSearchBox 
                                        key={searchBoxKey} 
                                        language={language} 
                                        onSearch={handleSearch} 
                                        initialStops={searchParams?.stops || DEFAULT_STOPS} 
                                        initialDate={searchParams?.date}
                                        maintenanceMode={systemSettings?.maintenanceMode} 
                                    />
                                    
                                    {searchParams ? (
                                        <div 
                                            ref={resultsRef} 
                                            className="animate-fadeIn min-h-screen mt-8"
                                        >
                                            <VehicleResults 
                                                search={searchParams} 
                                                language={language} 
                                                onBook={(driver, price, guests, date) => {
                                                    // This handler receives the date from VehicleResults state
                                                    // ensuring that if the user changed the date there, it flows to booking
                                                    handleInitiateBooking(driver, parseFloat(price), date);
                                                }} 
                                                onProfileOpen={(driver, price) => {
                                                    setSelectedDriverProfile({ driver, price });
                                                    setCurrentView('DRIVER_PROFILE');
                                                    safeHistoryPush({ view: 'DRIVER_PROFILE' }, '', `?driver=${driver.id}`);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                onDirectBooking={handleBookingSubmit}
                                                onSearchUpdate={handleSearch}
                                                isLoading={isSearching} // Pass visual loading state
                                                drivers={drivers} 
                                                tour={selectedTour} 
                                                onBack={handleReset} 
                                                initialGuests={searchGuests} 
                                                bookings={bookings}
                                                minPrice={systemSettings?.minTripPrice}
                                                hideSearchHeader={true} 
                                            />
                                        </div>
                                    ) : (
                                        // Fallback if search state is missing or corrupted
                                        <div className="mt-12 text-center pb-32 animate-fadeIn">
                                            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl inline-block">
                                                <p className="text-white font-bold text-lg mb-4">
                                                    {isEn ? "Session expired. Please search again." : "Сессия истекла. Пожалуйста, выполните поиск заново."}
                                                </p>
                                                <button 
                                                    onClick={handleReset}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold transition"
                                                >
                                                    {isEn ? "New Search" : "Новый поиск"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );

                        case 'DRIVER_PROFILE':
                            if (!selectedDriverProfile) {
                                setCurrentView('HOME');
                                return null;
                            }
                            return <DriverProfile 
                                        driver={selectedDriverProfile.driver} 
                                        price={selectedDriverProfile.price.toString()}
                                        language={language}
                                        onBack={handleBackToResults}
                                        date={searchParams?.date}
                                        onBook={(finalDate) => {
                                            handleInitiateBooking(selectedDriverProfile.driver, selectedDriverProfile.price, finalDate);
                                        }}
                                    />;
                        
                        case 'BOOKING_PAGE':
                            return <BookingModal 
                                    onBack={handleBackFromBooking} 
                                    tour={selectedTour} 
                                    search={searchParams} 
                                    language={language} 
                                    onSubmit={handleBookingSubmit} 
                                    initialGuests={searchGuests} 
                                    numericPrice={bookingNumericPrice} 
                                    selectedDriver={selectedDriverForBooking}
                                    initialDate={bookingFinalDate} 
                                />;

                        case 'TOURS':
                            return (
                                <div className="pt-24 bg-white/80">
                                    <AiPlanner 
                                        language={language} 
                                        userLocation={userLocation} 
                                        drivers={drivers} 
                                        tours={tours} 
                                        onPlanToBook={(search, guests, driver, tour) => handleSearch(search, false, guests, tour)} 
                                    />
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

            {['HOME', 'TOURS', 'BLOG', 'SEARCH_RESULTS', 'DRIVER_PROFILE', 'LEGAL_TERMS', 'LEGAL_PRIVACY', 'DRIVER_REGISTRATION'].includes(currentView) && (
                <Footer language={language} settings={systemSettings} onNavigate={navigateTo} />
            )}

            {isTourDetailOpen && selectedTour && (
                <TourDetailModal 
                    isOpen={isTourDetailOpen} 
                    onClose={() => setIsTourDetailOpen(false)} 
                    tour={selectedTour} 
                    language={language} 
                    onBook={(t) => handleSearch({ stops: t.routeStops || [], date: '', totalDistance: 200 }, false, 2, t)} 
                />
            )}

            <BookingSuccessModal isOpen={isSuccessModalOpen} onClose={handleReset} booking={lastBooking} language={language} />
            <FloatingContact language={language} />
        </ErrorBoundary>
    );
};

export default App;
