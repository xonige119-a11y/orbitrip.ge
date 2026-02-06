
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

// --- LAZY LOADING ---
const AdminLogin = React.lazy(() => import('./components/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const DriverDashboard = React.lazy(() => import('./components/DriverDashboard'));
const DriverRegistration = React.lazy(() => import('./components/DriverRegistration'));
const LegalView = React.lazy(() => import('./components/LegalView'));

const DEFAULT_STOPS = ['', ''];

// --- SAFE HISTORY WRAPPERS ---
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
    const [loggedInDriverId, setLoggedInDriverId] = useState<string | null>(() => {
        try { return typeof window !== 'undefined' ? window.localStorage.getItem('orbitrip_driver_session') : null; }
        catch (e) { return null; }
    });

    useEffect(() => {
        // FORCE CLEAR CONSOLE TO SHOW NEW LOGS
        console.clear();
        console.log("APP INIT: v6.8 Loaded Successfully");
        
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
        
        if (isAuto) {
            setIsSearching(true);
            await new Promise(resolve => setTimeout(resolve, 600)); 
            setSearchParams(prev => ({ ...params })); 
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
        
        // GA Tracking
        console.log("[GA4] Attempting begin_checkout event");
        if ((window as any).gtag) {
            (window as any).gtag('event', 'begin_checkout', {
                items: [{
                    item_name: selectedTour ? selectedTour.titleEn : 'Transfer',
                    price: price,
                    category: selectedTour ? 'Tour' : 'Transfer',
                    item_id: selectedTour ? selectedTour.id : 'transfer'
                }],
                currency: 'GEL',
                value: price
            });
            console.log("[GA4] Event sent: begin_checkout");
        } else {
            console.warn("[GA4] gtag not defined");
        }
        
        setCurrentView('BOOKING_PAGE');
        safeHistoryPush({ view: 'BOOKING_PAGE' }, '', '/booking');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBookingSubmit = async (bookingData: any) => {
        try {
            // FIX 409 Conflict: Ensure unique ID by adding random string
            const uniqueId = `bk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const newBooking: Booking = {
                id: uniqueId,
                ...bookingData,
                status: 'PENDING',
                createdAt: Date.now()
            };
            
            console.log("[Booking] Attempting to create booking with ID:", uniqueId);

            // 1. Create Booking in DB
            await db.bookings.create(newBooking);
            console.log("[Booking] DB Write Success!");
            
            // 2. Set State
            setLastBooking(newBooking);
            
            // 3. TRACKING: booking_completed / purchase
            console.log("[GA4] DB Write Success. Now firing booking_completed event...");
            
            if ((window as any).gtag) {
                // Specific event requested for Google Ads
                (window as any).gtag('event', 'booking_completed', {
                    transaction_id: newBooking.id,
                    value: newBooking.numericPrice,
                    currency: 'GEL',
                    items: [{
                        item_id: newBooking.tourId,
                        item_name: newBooking.tourTitle,
                        price: newBooking.numericPrice
                    }],
                    debug_mode: true
                });
                
                // Standard GA4 Purchase Event
                (window as any).gtag('event', 'purchase', {
                    transaction_id: newBooking.id,
                    value: newBooking.numericPrice,
                    currency: 'GEL',
                    items: [{
                        item_id: newBooking.tourId,
                        item_name: newBooking.tourTitle,
                        price: newBooking.numericPrice
                    }],
                    debug_mode: true
                });
                console.log("[GA4] SUCCESS: booking_completed & purchase events fired!");
            } else {
                console.warn("[GA4] WARNING: gtag is NOT defined on window object. Tracking failed.");
            }
            
            // 4. Delay Modal to ensure event dispatch
            setTimeout(() => {
                setIsSuccessModalOpen(true);
            }, 500); 
            
            // --- NOTIFICATIONS ---
            
            // 1. Admin SMS
            smsService.sendAdminNotification({
                tourTitle: newBooking.tourTitle,
                date: newBooking.date,
                price: newBooking.totalPrice,
                customerName: newBooking.customerName,
                contact: newBooking.contactInfo,
                driverName: newBooking.driverName || 'Any'
            }).catch(e => console.error("Admin SMS Error:", e));

            // 2. Customer Email
            emailService.sendBookingConfirmation(newBooking, selectedTour, language).catch(e => console.error("Customer Email Error:", e));

            // 3. Driver Notification (SMS & Email)
            if (selectedDriverForBooking) {
                console.log("[Notification] Sending to Driver:", selectedDriverForBooking.name);
                
                // Driver SMS
                if (selectedDriverForBooking.phoneNumber) {
                    smsService.sendDriverNotification(
                        selectedDriverForBooking.phoneNumber,
                        {
                            id: newBooking.id,
                            tourTitle: newBooking.tourTitle,
                            date: newBooking.date,
                            price: newBooking.totalPrice
                        }
                    ).catch(e => console.error("Driver SMS Error:", e));
                }

                // Driver Email
                if (selectedDriverForBooking.email) {
                    emailService.sendDriverBookingEmail(
                        selectedDriverForBooking.email,
                        newBooking
                    ).catch(e => console.error("Driver Email Error:", e));
                }
            }

        } catch (error: any) {
            console.error("Booking Error:", error);
            const msg = error.message || "Unknown error";
            alert(language === Language.EN ? `Error: ${msg}. Please try again.` : `Ошибка: ${msg}. Попробуйте снова.`);
        }
    };

    const handleReset = () => {
        setSearchParams(null);
        setSelectedTour(null);
        setIsSuccessModalOpen(false);
        setBookingFinalDate('');
        setSearchBoxKey(k => k + 1);
        
        if (currentView !== 'HOME') {
             setCurrentView('HOME');
             safeHistoryPush({ view: 'HOME' }, '', '/');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackFromBooking = () => {
        if (selectedDriverProfile) {
            setCurrentView('DRIVER_PROFILE');
            safeHistoryReplace({ view: 'DRIVER_PROFILE' }, '', `?driver=${selectedDriverProfile.driver.id}`);
        } else {
            setCurrentView('SEARCH_RESULTS');
            safeHistoryReplace({ view: 'SEARCH_RESULTS' }, '', '?step=results');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackToResults = () => {
        setCurrentView('SEARCH_RESULTS');
        safeHistoryReplace({ view: 'SEARCH_RESULTS' }, '', '?step=results');
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
                                                isLoading={isSearching} 
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
                                        onPlanToBook={(search, guests, driver, tour) => {
                                            const d = driver as any;
                                            if (d && d.calculatedPrice) {
                                                if (tour) setSelectedTour(tour);
                                                setSearchGuests(guests);
                                                setSearchParams(search); 
                                                handleInitiateBooking(driver, d.calculatedPrice, search.date);
                                            } else {
                                                handleSearch(search, false, guests, tour);
                                            }
                                        }} 
                                    />
                                    <TourList 
                                        tours={tours} 
                                        language={language} 
                                        onViewDetails={(t) => { setSelectedTour(t); setIsTourDetailOpen(true); }} 
                                        drivers={drivers} // Pass drivers to TourList
                                    />
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

            {['HOME', 'TOURS', 'BLOG', 'SEARCH_RESULTS', 'DRIVER_PROFILE', 'LEGAL_TERMS', 'LEGAL_PRIVACY'].includes(currentView) && (
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
