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

// --- LAZY COMPONENTS ---
const AdminLogin = React.lazy(() => import('./components/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const DriverDashboard = React.lazy(() => import('./components/DriverDashboard'));
const DriverRegistration = React.lazy(() => import('./components/DriverRegistration'));
const LegalView = React.lazy(() => import('./components/LegalView'));

const DEFAULT_STOPS: [string, string] = ['', ''];

const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
    <span className="text-gray-400 text-sm font-bold tracking-widest animate-pulse uppercase">Orbitrip...</span>
  </div>
);

const App: React.FC = () => {
    // --- BASIC STATE ---
    const [language, setLanguage] = useState<Language>(Language.EN);
    const [currentView, setCurrentView] = useState<string>('HOME'); 
    const [userLocation, setUserLocation] = useState<string>('Tbilisi'); 
    const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
    const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
    const [searchBoxKey, setSearchBoxKey] = useState<number>(0);

    // --- DATA STATE ---
    const [tours, setTours] = useState<Tour[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    
    // --- SEARCH & BOOKING STATE ---
    const [searchParams, setSearchParams] = useState<TripSearch | null>(null);
    const [searchGuests, setSearchGuests] = useState<number>(2); 
    const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
    const [isTourDetailOpen, setIsTourDetailOpen] = useState<boolean>(false);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    
    const [selectedDriverProfile, setSelectedDriverProfile] = useState<{driver: Driver, price: number} | null>(null);
    const [bookingNumericPrice, setBookingNumericPrice] = useState<number>(0);
    const [bookingFinalDate, setBookingFinalDate] = useState<string>(''); 
    const [selectedDriverForBooking, setSelectedDriverForBooking] = useState<Driver | null>(null);

    const [lastBooking, setLastBooking] = useState<Booking | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
    
    const [loggedInDriverId, setLoggedInDriverId] = useState<string | null>(null);

    // --- DB HANDLERS (Explictly Typed for TSC) ---
    const handleAddTour = async (t: Tour) => { await db.tours.create(t); };
    const handleUpdateTour = async (t: Tour) => { await db.tours.update(t); };
    const handleDeleteTour = async (id: string) => { await db.tours.delete(id); };
    const handleUpdateBookingStatus = async (id: string, s: 'PENDING' | 'CONFIRMED' | 'CANCELLED') => { await db.bookings.updateStatus(id, s); };
    const handleUpdateBooking = async (b: Booking) => { await db.bookings.update(b); };
    const handleAddDriver = async (d: Driver) => { await db.drivers.create(d); };
    const handleUpdateDriver = async (d: Driver) => { await db.drivers.update(d); };
    const handleDeleteDriver = async (id: string) => { await db.drivers.delete(id); };

    // --- INITIAL LOAD ---
    useEffect(() => {
        const init = async () => {
            try {
                const [s, t, d, b] = await Promise.all([
                    db.settings.get(),
                    db.tours.getAll(),
                    db.drivers.getAll(),
                    db.bookings.getAll()
                ]);
                setSystemSettings(s);
                setTours(t);
                setDrivers(d);
                setBookings(b);
                
                const savedLang = localStorage.getItem('orbitrip_lang') as Language;
                if (savedLang) setLanguage(savedLang);
                
                const session = localStorage.getItem('orbitrip_driver_session');
                if (session) setLoggedInDriverId(session);

            } catch (err) { console.error(err); }
            finally { setIsDataLoaded(true); }
        };
        init();
        window.addEventListener('orbitrip-db-change', init);
        return () => window.removeEventListener('orbitrip-db-change', init);
    }, []);

    // --- ACTIONS ---
    const navigateTo = (view: string, path: string) => {
        setCurrentView(view);
        window.history.pushState({ view }, '', path);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleReset = () => {
        setSearchParams(null);
        setSelectedTour(null);
        setIsSuccessModalOpen(false);
        setSearchBoxKey(prev => prev + 1);
        navigateTo('HOME', '/');
    };

    const handleSearch = useCallback(async (params: TripSearch, isAuto = false, guests = 2, tourOverride?: Tour) => {
        if (tourOverride) setSelectedTour(tourOverride);
        setSearchGuests(guests);
        if (isAuto) {
            setIsSearching(true);
            await new Promise(r => setTimeout(r, 500));
            setSearchParams({ ...params });
            setIsSearching(false);
        } else {
            setSearchParams(params);
            setCurrentView('SEARCH_RESULTS');
        }
    }, []);

    const handleBookingSubmit = async (data: any) => {
        try {
            const booking: Booking = {
                ...data,
                id: Date.now().toString(),
                status: 'PENDING',
                createdAt: Date.now()
            };
            await db.bookings.create(booking);
            setLastBooking(booking);
            setIsSuccessModalOpen(true);

            // SMS Logic
            smsService.sendAdminNotification({
                id: booking.id,
                tourTitle: booking.tourTitle || 'Transfer',
                date: booking.date,
                price: `${booking.totalPrice} GEL`,
                customerName: booking.customerName,
                contact: booking.contactInfo,
                driverName: booking.driverName || 'Any'
            }).catch(e => console.warn(e));

            if (selectedDriverForBooking?.phone_number) {
                smsService.sendDriverNotification(selectedDriverForBooking.phone_number, {
                    id: booking.id,
                    tourTitle: booking.tourTitle || 'Transfer',
                    date: booking.date,
                    price: `${booking.totalPrice} GEL`
                }).catch(e => console.warn(e));
            }
        } catch (e) { alert("Error"); }
    };

    const isEn = language === Language.EN;

    if (!isDataLoaded) return <PageLoader />;

    return (
        <ErrorBoundary language={language}>
            <SEO title={systemSettings?.siteTitle || "OrbiTrip"} description={systemSettings?.siteDescription || ""} />
            
            <Header 
                language={language} setLanguage={setLanguage} 
                currentLocation={userLocation} onLocationChange={setUserLocation}
                isLoggedIn={!!loggedInDriverId}
                onToolSelect={(t) => {
                    if (t === 'HOME') handleReset();
                    else navigateTo(t, `/${t.toLowerCase()}`);
                }} 
            />

            <Suspense fallback={<PageLoader />}>
                {(() => {
                    switch (currentView) {
                        case 'ADMIN_DASHBOARD':
                            return <AdminDashboard 
                                bookings={bookings} tours={tours} drivers={drivers}
                                onAddTour={handleAddTour} onUpdateTour={handleUpdateTour} onDeleteTour={handleDeleteTour}
                                onUpdateBookingStatus={handleUpdateBookingStatus} onUpdateBooking={handleUpdateBooking}
                                onAddDriver={handleAddDriver} onUpdateDriver={handleUpdateDriver} onDeleteDriver={handleDeleteDriver}
                                onLogout={() => { setLoggedInDriverId(null); handleReset(); }}
                            />;
                        case 'SEARCH_RESULTS':
                            return (
                                <div className="pt-32">
                                    <TripSearchBox key={searchBoxKey} language={language} onSearch={handleSearch} initialStops={searchParams?.stops || DEFAULT_STOPS} />
                                    {searchParams && (
                                        <VehicleResults 
                                            search={searchParams} language={language} drivers={drivers}
                                            onBook={(d, p, g, dt) => { setSelectedDriverForBooking(d); setBookingNumericPrice(parseFloat(p)); setBookingFinalDate(dt); navigateTo('BOOKING_PAGE', '/booking'); }}
                                            onProfileOpen={(d, p) => { setSelectedDriverProfile({ driver: d, price: p }); navigateTo('DRIVER_PROFILE', `?d=${d.id}`); }}
                                            onSearchUpdate={handleSearch} isLoading={isSearching}
                                        />
                                    )}
                                </div>
                            );
                        case 'BOOKING_PAGE':
                            return <BookingModal 
                                onBack={() => setCurrentView('SEARCH_RESULTS')} tour={selectedTour} search={searchParams} 
                                language={language} onSubmit={handleBookingSubmit} initialGuests={searchGuests} 
                                numericPrice={bookingNumericPrice} selectedDriver={selectedDriverForBooking} initialDate={bookingFinalDate} 
                            />;
                        case 'HOME':
                        default:
                            return (
                                <div className="pt-32">
                                    <TripSearchBox key={searchBoxKey} language={language} onSearch={handleSearch} initialStops={DEFAULT_STOPS} />
                                    <HomeLanding language={language} onRouteSelect={(f, t) => handleSearch({ stops: [f, t], date: '', totalDistance: 0 })} onTourSelect={() => {}} />
                                </div>
                            );
                    }
                })()}
            </Suspense>

            <Footer language={language} settings={systemSettings} onNavigate={navigateTo} />
            <BookingSuccessModal isOpen={isSuccessModalOpen} onClose={handleReset} booking={lastBooking} language={language} />
            <FloatingContact language={language} />
        </ErrorBoundary>
    );
};

export default App;
