import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Booking, Tour, Driver, SystemSettings, PriceOption, SmsLog } from '../types';
import { generateTourPrices } from '../services/geminiService';
import { db } from '../services/db';
import { smsService } from '../services/smsService'; 
import { storageService } from '../services/storage';

interface AdminDashboardProps {
  bookings: Booking[];
  tours: Tour[];
  drivers: Driver[];
  onAddTour: (tour: Tour) => void;
  onUpdateTour: (tour: Tour) => void;
  onDeleteTour: (id: string) => void;
  onUpdateBookingStatus: (id: string, status: any) => void;
  onAddDriver: (driver: Driver) => void;
  onUpdateDriver: (driver: Driver) => void;
  onDeleteDriver: (id: string) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    bookings, tours, drivers, 
    onAddTour, onUpdateTour, onDeleteTour, 
    onUpdateBookingStatus,
    onAddDriver, onUpdateDriver, onDeleteDriver,
    onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'BOOKINGS' | 'DRIVERS' | 'TOURS' | 'SETTINGS' | 'SMS_LOGS'>('DASHBOARD');
  const [commissionRate, setCommissionRate] = useState(0.2278);
  
  // -- FORMS STATE --
  const [isEditingTour, setIsEditingTour] = useState(false);
  const [tourFormTab, setTourFormTab] = useState<'GENERAL' | 'EN' | 'RU' | 'PRICING'>('GENERAL');
  const [currentTour, setCurrentTour] = useState<Partial<Tour>>({});
  
  const [isEditingDriver, setIsEditingDriver] = useState(false);
  const [currentDriver, setCurrentDriver] = useState<Partial<Driver>>({});
  
  // File Input Refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const carInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [loadingAi, setLoadingAi] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({ id: 'default', smsApiKey: '', adminPhoneNumber: '', commissionRate: 0.2278 });
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [testSmsPhone, setTestSmsPhone] = useState('995');
  const [testSmsStatus, setTestSmsStatus] = useState('');
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS'>('IDLE');
  
  // -- FILTERS --
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('ALL');

  // Load Settings & Logs
  useEffect(() => {
      const loadData = async () => {
          const s = await db.settings.get();
          setSettings(s);
          if (s.commissionRate) setCommissionRate(s.commissionRate);
      };
      loadData();
  }, []);

  // Fetch logs when tab active
  useEffect(() => {
      if (activeTab === 'SMS_LOGS') {
          db.smsLogs.getAll().then(setSmsLogs);
      }
  }, [activeTab]);

  // --- ANALYTICS ENGINE (Wide Spectrum) ---
  const analytics = useMemo(() => {
      const totalBookings = bookings.length;
      const completed = bookings.filter(b => b.status === 'COMPLETED');
      const confirmed = bookings.filter(b => b.status === 'CONFIRMED');
      const cancelled = bookings.filter(b => b.status === 'CANCELLED');
      const pending = bookings.filter(b => b.status === 'PENDING');

      // Financials
      const totalRevenue = bookings.reduce((sum, b) => sum + (b.numericPrice || 0), 0);
      const realizedRevenue = completed.reduce((sum, b) => sum + (b.numericPrice || 0), 0);
      const totalCommission = realizedRevenue * commissionRate;

      // Top Tours Logic
      const tourCounts: Record<string, number> = {};
      bookings.forEach(b => { tourCounts[b.tourTitle] = (tourCounts[b.tourTitle] || 0) + 1; });
      const topTours = Object.entries(tourCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5);

      // Driver Performance Logic
      const driverPerformance = drivers.map(d => {
          const jobs = completed.filter(b => b.driverId === d.id);
          const earned = jobs.reduce((sum, b) => sum + (b.numericPrice || 0), 0);
          return { name: d.name, jobs: jobs.length, earned, rating: d.rating };
      }).sort((a, b) => b.earned - a.earned).slice(0, 5);

      // Revenue Trend (Simulated for Demo based on array index)
      const trendData = bookings.slice(0, 10).map(b => b.numericPrice).reverse();

      return { totalBookings, completed, confirmed, cancelled, pending, totalRevenue, realizedRevenue, totalCommission, topTours, driverPerformance, trendData };
  }, [bookings, drivers, commissionRate]);

  // --- HANDLERS ---
  const handleSaveTour = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentTour.titleEn) return alert("Title required");
      
      const tourData = { 
          ...currentTour, 
          id: currentTour.id || Date.now().toString(),
          priceOptions: currentTour.priceOptions || [],
          reviews: currentTour.reviews || [],
          // Ensure arrays are initialized for DB compatibility
          highlightsEn: currentTour.highlightsEn || [],
          highlightsRu: currentTour.highlightsRu || [],
          routeStops: currentTour.routeStops || [],
          itineraryEn: currentTour.itineraryEn || [],
          itineraryRu: currentTour.itineraryRu || []
      } as Tour;

      if (tours.find(t => t.id === tourData.id)) {
          onUpdateTour(tourData);
      } else {
          onAddTour(tourData);
      }
      setIsEditingTour(false);
  };

  const handleSaveDriver = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentDriver.name) return alert("Name required");

      const driverData = {
          ...currentDriver,
          id: currentDriver.id || `driver-${Date.now()}`,
          status: currentDriver.status || 'ACTIVE',
          languages: currentDriver.languages || [],
          features: currentDriver.features || [],
          carPhotos: currentDriver.carPhotos || []
      } as Driver;

      if (drivers.find(d => d.id === driverData.id)) {
          onUpdateDriver(driverData);
      } else {
          onAddDriver(driverData);
      }
      setIsEditingDriver(false);
  };

  // --- IMAGE UPLOAD HANDLERS ---
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      
      setUploading(true);
      const file = e.target.files[0];
      // Use temp ID if creating new driver, or actual ID
      const driverId = currentDriver.id || `temp-${Date.now()}`;
      
      const url = await storageService.uploadDriverImage(file, driverId, 'avatar');
      
      if (url) {
          setCurrentDriver(prev => ({ ...prev, photoUrl: url }));
      }
      setUploading(false);
  };

  const handleCarPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;

      setUploading(true);
      const file = e.target.files[0];
      const driverId = currentDriver.id || `temp-${Date.now()}`;

      const url = await storageService.uploadDriverImage(file, driverId, 'car');

      if (url) {
          setCurrentDriver(prev => ({
              ...prev,
              carPhotos: [...(prev.carPhotos || []), url],
              // If it's the first photo, set as main thumbnail too
              carPhotoUrl: prev.carPhotoUrl || url 
          }));
      }
      setUploading(false);
  };

  const removeCarPhoto = (index: number) => {
      const photos = [...(currentDriver.carPhotos || [])];
      photos.splice(index, 1);
      setCurrentDriver(prev => ({ ...prev, carPhotos: photos }));
  };

  // AI Price Generation
  const handleGenerateAiPrice = async () => {
      if (!currentTour.descriptionEn) return alert("Enter English description first");
      setLoadingAi(true);
      try {
          const prices = await generateTourPrices(currentTour.descriptionEn);
          if (prices.length > 0) {
              setCurrentTour(prev => ({
                  ...prev,
                  priceOptions: prices,
                  price: `From ${prices[0].price}`
              }));
          }
      } catch (e) { console.error(e); alert("AI Error. Try again."); }
      setLoadingAi(false);
  };

  const handleTestSms = async () => {
      setTestSmsStatus('Sending...');
      const success = await smsService.sendSms(testSmsPhone, "Test SMS from OrbiTrip System. Connection Success!", 'ADMIN_NOTIFY');
      setTestSmsStatus(success ? '✅ Request Sent' : '❌ Request Failed');
      // Refresh logs
      setTimeout(() => db.smsLogs.getAll().then(setSmsLogs), 1000);
  };

  const handleSaveSettings = async () => {
      setSaveStatus('SAVING');
      // Ensure commissionRate is synced
      const finalSettings = { ...settings, commissionRate: commissionRate };
      await db.settings.save(finalSettings);
      
      // Update local state to reflect what was saved
      setSettings(finalSettings);
      
      setSaveStatus('SUCCESS');
      setTimeout(() => setSaveStatus('IDLE'), 2000);
  };

  // Pricing Table Helpers
  const addPriceOption = () => {
      const newOption: PriceOption = { vehicle: 'Sedan', price: '100 GEL', guests: '1-3' };
      setCurrentTour(prev => ({
          ...prev,
          priceOptions: [...(prev.priceOptions || []), newOption]
      }));
  };

  const updatePriceOption = (index: number, field: keyof PriceOption, value: string) => {
      const newOptions = [...(currentTour.priceOptions || [])];
      newOptions[index] = { ...newOptions[index], [field]: value };
      setCurrentTour({ ...currentTour, priceOptions: newOptions });
  };

  const removePriceOption = (index: number) => {
      const newOptions = [...(currentTour.priceOptions || [])];
      newOptions.splice(index, 1);
      setCurrentTour({ ...currentTour, priceOptions: newOptions });
  };

  // --- RENDER HELPERS ---
  const StatCard = ({ title, value, sub, color }: any) => (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col justify-between h-36 transform transition hover:-translate-y-1 hover:shadow-2xl">
          <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest">{title}</h3>
          <div className={`text-4xl font-black ${color}`}>{value}</div>
          <p className="text-xs text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded w-fit">{sub}</p>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-gray-900">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-80 bg-slate-900 text-white flex-shrink-0 md:h-screen sticky top-0 overflow-y-auto z-40 shadow-2xl">
            <div className="p-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
                <h1 className="text-2xl font-black flex items-center gap-3 tracking-tight">
                    <span className="text-3xl">🛡️</span> 
                    <span>Orbi<span className="text-indigo-500">Admin</span></span>
                </h1>
                <p className="text-[10px] text-slate-500 mt-2 font-bold tracking-[0.2em] uppercase">Enterprise Control</p>
            </div>
            <nav className="p-6 space-y-3">
                {[
                    { id: 'DASHBOARD', icon: '📊', label: 'Analytics Hub' },
                    { id: 'BOOKINGS', icon: '📅', label: 'Live Bookings', count: bookings.filter(b => b.status === 'PENDING').length },
                    { id: 'TOURS', icon: '🗺️', label: 'Product Catalog' },
                    { id: 'DRIVERS', icon: '🚖', label: 'Driver Fleet' },
                    { id: 'SMS_LOGS', icon: '💬', label: 'SMS Logs' },
                    { id: 'SETTINGS', icon: '⚙️', label: 'System Config' }
                ].map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-300 group ${
                            activeTab === item.id 
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-900/50 translate-x-2' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <span className={`text-xl group-hover:scale-110 transition ${activeTab === item.id ? 'opacity-100' : 'opacity-70'}`}>{item.icon}</span>
                            <span className="font-bold text-sm tracking-wide">{item.label}</span>
                        </div>
                        {item.count ? <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm animate-pulse">{item.count}</span> : null}
                    </button>
                ))}
            </nav>
            <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-slate-900 to-slate-900/0">
                <button onClick={onLogout} className="text-slate-400 hover:text-rose-400 text-sm flex items-center gap-3 transition w-full px-4 py-3 rounded-lg hover:bg-slate-800 font-bold border border-transparent hover:border-rose-900/30">
                    <span>🚪</span> Sign Out
                </button>
            </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto h-screen p-4 md:p-10 bg-slate-50">
            
            {/* --- DASHBOARD OVERVIEW --- */}
            {activeTab === 'DASHBOARD' && (
                <div className="space-y-10 animate-fadeIn">
                    <div className="flex justify-between items-end border-b border-gray-200 pb-6">
                        <div>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Executive Dashboard</h2>
                            <p className="text-gray-500 text-sm mt-2 font-medium">Real-time platform performance and financial metrics.</p>
                        </div>
                        <div className="text-right bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Platform Commission</p>
                            <p className="text-3xl font-black text-indigo-600">{(commissionRate * 100).toFixed(1)}%</p>
                        </div>
                    </div>

                    {/* KPI CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Gross Revenue" value={`${analytics.totalRevenue} ₾`} sub="Total Booking Value" color="text-gray-900" />
                        <StatCard title="Net Profit" value={`${analytics.totalCommission.toFixed(0)} ₾`} sub="Realized Commission" color="text-emerald-600" />
                        <StatCard title="Pending Orders" value={analytics.pending.length} sub="Requires Action" color="text-amber-500" />
                        <StatCard title="Active Drivers" value={drivers.filter(d => d.status === 'ACTIVE').length} sub={`Total Fleet: ${drivers.length}`} color="text-blue-600" />
                    </div>

                    {/* CHARTS & TABLES ROW */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* REVENUE CHART (CSS) */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none"></div>
                            <h3 className="font-bold text-lg text-gray-800 mb-8">Revenue Stream (Last 10 Orders)</h3>
                            <div className="flex items-end justify-between h-64 space-x-4">
                                {analytics.trendData.length > 0 ? analytics.trendData.map((val, i) => {
                                    const h = Math.min(100, Math.max(10, (val / 500) * 100)); // Scale logic
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center group relative">
                                            <div className="w-full bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t-xl relative transition-all duration-500 group-hover:to-indigo-600 shadow-sm" style={{ height: `${h}%` }}>
                                                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 shadow-lg">
                                                    {val} ₾
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }) : <p className="text-gray-400 w-full text-center">No recent data</p>}
                            </div>
                        </div>

                        {/* TOP TOURS */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50">
                            <h3 className="font-bold text-lg text-gray-800 mb-6">Top Products</h3>
                            <div className="space-y-6">
                                {analytics.topTours.map(([name, count], i) => (
                                    <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center">
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-4 ${i===0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{i+1}</span>
                                            <span className="text-sm font-bold text-gray-700 truncate w-40" title={name}>{name}</span>
                                        </div>
                                        <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-xs">{count} orders</span>
                                    </div>
                                ))}
                                {analytics.topTours.length === 0 && <p className="text-sm text-gray-400">No tour data available.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- BOOKINGS MANAGEMENT --- */}
            {activeTab === 'BOOKINGS' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-200 pb-6">
                        <h2 className="text-3xl font-black text-gray-900">Bookings Control</h2>
                        <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
                            {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(s => (
                                <button 
                                    key={s}
                                    onClick={() => setBookingFilterStatus(s)}
                                    className={`px-5 py-2.5 rounded-lg text-xs font-bold transition ${bookingFilterStatus === s ? 'bg-slate-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-8 py-5">Order ID</th>
                                    <th className="px-8 py-5">Route & Service</th>
                                    <th className="px-8 py-5">Customer</th>
                                    <th className="px-8 py-5">Assigned Driver</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings.filter(b => bookingFilterStatus === 'ALL' || b.status === bookingFilterStatus).map(b => (
                                    <tr key={b.id} className="hover:bg-gray-50 transition group">
                                        <td className="px-8 py-5">
                                            <div className="font-mono text-xs text-indigo-400 font-bold mb-1">#{b.id.slice(-6)}</div>
                                            <div className="font-bold text-gray-900">{b.date}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-gray-800 text-base">{b.tourTitle}</div>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded">{b.vehicle}</span>
                                                <span className="font-bold text-emerald-600">{b.totalPrice}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="font-medium text-gray-900">{b.customerName}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{b.contactInfo}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {b.driverId ? (
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                    <span className="font-bold text-indigo-900">{b.driverName}</span>
                                                </div>
                                            ) : (
                                                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                                                b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                b.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                            }`}>{b.status}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {b.status === 'PENDING' && (
                                                <button onClick={() => onUpdateBookingStatus(b.id, 'CANCELLED')} className="text-red-500 hover:text-white hover:bg-red-500 font-bold text-xs border border-red-200 px-4 py-2 rounded-lg transition">Reject</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- TOURS --- */}
            {activeTab === 'TOURS' && (
                <div className="space-y-6 animate-fadeIn relative">
                    {!isEditingTour ? (
                        <>
                            <div className="sticky top-0 bg-slate-50 z-20 flex justify-between items-center border-b border-gray-200 pb-6 pt-2 backdrop-blur-sm bg-slate-50/90">
                                <h2 className="text-3xl font-black text-gray-900">Product Catalog</h2>
                                <button 
                                    onClick={() => { setCurrentTour({}); setIsEditingTour(true); }}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition flex items-center transform active:scale-95"
                                >
                                    <span className="mr-2 text-xl">+</span> Add Tour
                                </button>
                            </div>

                            {tours.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-300">
                                    <div className="text-6xl mb-4 opacity-50">🗺️</div>
                                    <h3 className="text-xl font-bold text-gray-500 mb-6">No tours found</h3>
                                    <button 
                                        onClick={() => { setCurrentTour({}); setIsEditingTour(true); }}
                                        className="bg-indigo-100 text-indigo-700 px-6 py-3 rounded-xl font-bold hover:bg-indigo-200 transition"
                                    >
                                        Create First Tour
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {tours.map(tour => (
                                        <div key={tour.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition border border-gray-100 overflow-hidden flex flex-col group">
                                            <div className="relative h-48 overflow-hidden">
                                                <img src={tour.image} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" alt="tour" />
                                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                                                    {tour.category}
                                                </div>
                                            </div>
                                            <div className="p-5 flex-1 flex flex-col">
                                                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{tour.titleEn}</h3>
                                                <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{tour.descriptionEn}</p>
                                                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                                    <span className="font-black text-indigo-600">{tour.price}</span>
                                                    <div className="flex space-x-2">
                                                        <button onClick={() => { setCurrentTour(tour); setIsEditingTour(true); }} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">✏️</button>
                                                        <button onClick={() => onDeleteTour(tour.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">🗑️</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 max-w-4xl mx-auto relative">
                            <button 
                                onClick={() => setIsEditingTour(false)}
                                className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 flex items-center gap-1 font-bold text-sm"
                            >
                                ✕ Cancel
                            </button>
                            
                            <div className="flex justify-between items-center mb-8 border-b pb-4">
                                <h3 className="text-2xl font-bold text-gray-900">{currentTour.id ? 'Edit Tour' : 'Create New Tour'}</h3>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    {(['GENERAL', 'EN', 'RU', 'PRICING'] as const).map(tab => (
                                        <button 
                                            key={tab}
                                            onClick={() => setTourFormTab(tab)}
                                            className={`px-4 py-2 rounded-md text-xs font-bold transition ${tourFormTab === tab ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleSaveTour} className="space-y-6">
                                {/* Tour form fields remain unchanged for brevity, focusing on Drivers */}
                                {tourFormTab === 'GENERAL' && (
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image URL</label>
                                            <input type="text" className="w-full border p-3 rounded-xl" value={currentTour.image || ''} onChange={e => setCurrentTour({...currentTour, image: e.target.value})} placeholder="https://..." />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                            <select className="w-full border p-3 rounded-xl bg-white" value={currentTour.category || 'CITY'} onChange={e => setCurrentTour({...currentTour, category: e.target.value})}>
                                                <option value="CITY">City / Culture</option>
                                                <option value="NATURE">Nature</option>
                                                <option value="MOUNTAINS">Mountains</option>
                                                <option value="WINE">Wine & Food</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Duration</label>
                                            <input type="text" className="w-full border p-3 rounded-xl" value={currentTour.duration || ''} onChange={e => setCurrentTour({...currentTour, duration: e.target.value})} placeholder="e.g. 5 Hours" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Route Stops (Comma separated)</label>
                                            <input type="text" className="w-full border p-3 rounded-xl" value={currentTour.routeStops?.join(', ') || ''} onChange={e => setCurrentTour({...currentTour, routeStops: e.target.value.split(',').map(s=>s.trim())})} placeholder="Kutaisi, Martvili, Okatse, Kutaisi" />
                                        </div>
                                    </div>
                                )}
                                {/* ... Other tour tabs ... */}
                                {tourFormTab === 'EN' && (
                                    <div className="space-y-4">
                                        <div><label className="block text-sm font-bold">Title (EN)</label><input type="text" className="w-full border p-3 rounded-xl" value={currentTour.titleEn || ''} onChange={e => setCurrentTour({...currentTour, titleEn: e.target.value})} /></div>
                                        <div><label className="block text-sm font-bold">Description (EN)</label><textarea rows={4} className="w-full border p-3 rounded-xl" value={currentTour.descriptionEn || ''} onChange={e => setCurrentTour({...currentTour, descriptionEn: e.target.value})} /></div>
                                        <div><label className="block text-sm font-bold">Highlights (EN, comma separated)</label><input type="text" className="w-full border p-3 rounded-xl" value={currentTour.highlightsEn?.join(', ') || ''} onChange={e => setCurrentTour({...currentTour, highlightsEn: e.target.value.split(',').map(s=>s.trim())})} /></div>
                                    </div>
                                )}
                                {tourFormTab === 'RU' && (
                                    <div className="space-y-4">
                                        <div><label className="block text-sm font-bold">Title (RU)</label><input type="text" className="w-full border p-3 rounded-xl" value={currentTour.titleRu || ''} onChange={e => setCurrentTour({...currentTour, titleRu: e.target.value})} /></div>
                                        <div><label className="block text-sm font-bold">Description (RU)</label><textarea rows={4} className="w-full border p-3 rounded-xl" value={currentTour.descriptionRu || ''} onChange={e => setCurrentTour({...currentTour, descriptionRu: e.target.value})} /></div>
                                        <div><label className="block text-sm font-bold">Highlights (RU, comma separated)</label><input type="text" className="w-full border p-3 rounded-xl" value={currentTour.highlightsRu?.join(', ') || ''} onChange={e => setCurrentTour({...currentTour, highlightsRu: e.target.value.split(',').map(s=>s.trim())})} /></div>
                                    </div>
                                )}
                                {tourFormTab === 'PRICING' && (
                                    <div>
                                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-6 flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-indigo-900">AI Pricing Agent</h4>
                                                <p className="text-xs text-indigo-600 mt-1">Generate prices based on tour description.</p>
                                            </div>
                                            <button type="button" onClick={handleGenerateAiPrice} disabled={loadingAi} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg hover:bg-indigo-700 disabled:opacity-50">
                                                {loadingAi ? 'Thinking...' : '⚡ Auto-Calculate'}
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {currentTour.priceOptions?.map((opt, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input type="text" value={opt.vehicle} onChange={e => updatePriceOption(idx, 'vehicle', e.target.value)} className="w-1/3 border p-2 rounded-lg font-bold" />
                                                    <input type="text" value={opt.guests} onChange={e => updatePriceOption(idx, 'guests', e.target.value)} className="w-1/3 border p-2 rounded-lg" />
                                                    <input type="text" value={opt.price} onChange={e => updatePriceOption(idx, 'price', e.target.value)} className="w-1/3 border p-2 rounded-lg text-emerald-600 font-bold" />
                                                    <button type="button" onClick={() => removePriceOption(idx)} className="text-red-500 px-2">×</button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={addPriceOption} className="text-sm font-bold text-indigo-600 mt-2 hover:underline">+ Add Option</button>
                                        </div>
                                        <div className="mt-6">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Display Price</label>
                                            <input type="text" className="w-full border p-3 rounded-xl font-bold" value={currentTour.price || ''} onChange={e => setCurrentTour({...currentTour, price: e.target.value})} />
                                        </div>
                                    </div>
                                )}

                                <div className="pt-6 border-t flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsEditingTour(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
                                    <button type="submit" className="px-8 py-3 rounded-xl font-bold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700">Save Tour</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* --- DRIVERS --- */}
            {activeTab === 'DRIVERS' && (
                <div className="space-y-6 animate-fadeIn relative">
                    {!isEditingDriver ? (
                        <>
                            <div className="sticky top-0 bg-slate-50 z-20 flex justify-between items-center border-b border-gray-200 pb-6 pt-2 backdrop-blur-sm bg-slate-50/90">
                                <h2 className="text-3xl font-black text-gray-900">Driver Fleet</h2>
                                <button 
                                    onClick={() => { setCurrentDriver({}); setIsEditingDriver(true); }}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition flex items-center transform active:scale-95"
                                >
                                    <span className="mr-2 text-xl">+</span> Add Driver
                                </button>
                            </div>

                            {drivers.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-300">
                                    <div className="text-6xl mb-4 opacity-50">🚖</div>
                                    <h3 className="text-xl font-bold text-gray-500 mb-6">No drivers found</h3>
                                    <button 
                                        onClick={() => { setCurrentDriver({}); setIsEditingDriver(true); }}
                                        className="bg-indigo-100 text-indigo-700 px-6 py-3 rounded-xl font-bold hover:bg-indigo-200 transition"
                                    >
                                        Add First Driver
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">Driver Profile</th>
                                                <th className="px-6 py-4">Vehicle</th>
                                                <th className="px-6 py-4">Rates & Stats</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {drivers.map(driver => (
                                                <tr key={driver.id} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center">
                                                            <img src={driver.photoUrl} className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200" alt="" />
                                                            <div>
                                                                <div className="font-bold text-gray-900">{driver.name}</div>
                                                                <div className="text-xs text-gray-500">{driver.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-gray-900 font-medium">{driver.carModel}</div>
                                                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">{driver.vehicleType}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-emerald-600">{driver.pricePerKm} ₾ / km</div>
                                                        <div className="text-xs text-gray-400 mt-1">★ {driver.rating} ({driver.reviewCount})</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${driver.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {driver.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right space-x-2">
                                                        <button onClick={() => { setCurrentDriver(driver); setIsEditingDriver(true); }} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded font-bold">Edit</button>
                                                        <button onClick={() => onDeleteDriver(driver.id)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded font-bold">Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 max-w-4xl mx-auto relative">
                            <button 
                                onClick={() => setIsEditingDriver(false)}
                                className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 flex items-center gap-1 font-bold text-sm"
                            >
                                ✕ Cancel
                            </button>

                            <h3 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">{currentDriver.id ? 'Edit Driver' : 'New Driver'}</h3>
                            <form onSubmit={handleSaveDriver} className="space-y-6">
                                
                                {/* GENERAL INFO */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-bold mb-1">Full Name</label><input type="text" className="w-full border p-3 rounded-xl" value={currentDriver.name || ''} onChange={e => setCurrentDriver({...currentDriver, name: e.target.value})} required /></div>
                                    <div><label className="block text-sm font-bold mb-1">Email (Login)</label><input type="email" className="w-full border p-3 rounded-xl" value={currentDriver.email || ''} onChange={e => setCurrentDriver({...currentDriver, email: e.target.value})} required /></div>
                                    <div><label className="block text-sm font-bold mb-1">Password</label><input type="text" className="w-full border p-3 rounded-xl" value={currentDriver.password || ''} onChange={e => setCurrentDriver({...currentDriver, password: e.target.value})} required /></div>
                                    <div><label className="block text-sm font-bold mb-1">Phone</label><input type="text" className="w-full border p-3 rounded-xl" value={currentDriver.phoneNumber || ''} onChange={e => setCurrentDriver({...currentDriver, phoneNumber: e.target.value})} /></div>
                                </div>

                                {/* AVATAR UPLOAD */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <label className="block text-sm font-bold mb-2">Driver Photo (Avatar)</label>
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <img src={currentDriver.photoUrl || 'https://via.placeholder.com/100'} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm" />
                                            <input 
                                                type="file" 
                                                ref={avatarInputRef} 
                                                className="hidden" 
                                                accept="image/*" 
                                                onChange={handleAvatarUpload} 
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <button type="button" disabled={uploading} onClick={() => avatarInputRef.current?.click()} className="bg-indigo-600 text-white text-xs px-3 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50">
                                                {uploading ? 'Uploading...' : '📁 Upload New Photo'}
                                            </button>
                                            <input 
                                                type="text" 
                                                className="w-full border p-2 rounded-lg text-xs" 
                                                value={currentDriver.photoUrl || ''} 
                                                onChange={e => setCurrentDriver({...currentDriver, photoUrl: e.target.value})} 
                                                placeholder="Or paste URL..." 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* VEHICLE INFO & GALLERY */}
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                    <div className="font-bold text-gray-500 uppercase text-xs mb-4">Vehicle Information</div>
                                    
                                    <div className="grid grid-cols-3 gap-6 mb-6">
                                        <div><label className="block text-sm font-bold mb-1">Car Model</label><input type="text" className="w-full border p-3 rounded-xl" value={currentDriver.carModel || ''} onChange={e => setCurrentDriver({...currentDriver, carModel: e.target.value})} /></div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Type</label>
                                            <select className="w-full border p-3 rounded-xl bg-white" value={currentDriver.vehicleType || 'Sedan'} onChange={e => setCurrentDriver({...currentDriver, vehicleType: e.target.value as any})}>
                                                <option value="Sedan">Sedan</option>
                                                <option value="Minivan">Minivan</option>
                                                <option value="SUV">SUV</option>
                                                <option value="Bus">Bus</option>
                                            </select>
                                        </div>
                                        <div><label className="block text-sm font-bold mb-1">Rate (₾/km)</label><input type="number" step="0.1" className="w-full border p-3 rounded-xl" value={currentDriver.pricePerKm || 1} onChange={e => setCurrentDriver({...currentDriver, pricePerKm: parseFloat(e.target.value)})} /></div>
                                    </div>

                                    {/* CAR PHOTOS GALLERY */}
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Car Photos</label>
                                        <div className="grid grid-cols-4 gap-3 mb-3">
                                            {currentDriver.carPhotos?.map((url, idx) => (
                                                <div key={idx} className="relative group h-24 rounded-lg overflow-hidden border border-gray-300">
                                                    <img src={url} alt={`Car ${idx}`} className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => removeCarPhoto(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">×</button>
                                                </div>
                                            ))}
                                            <button 
                                                type="button" 
                                                onClick={() => carInputRef.current?.click()} 
                                                className="h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-white transition"
                                            >
                                                <span className="text-2xl">+</span>
                                                <span className="text-xs font-bold">{uploading ? '...' : 'Upload'}</span>
                                            </button>
                                            <input 
                                                type="file" 
                                                ref={carInputRef} 
                                                className="hidden" 
                                                accept="image/*" 
                                                onChange={handleCarPhotoUpload} 
                                            />
                                        </div>
                                        <input 
                                            type="text" 
                                            className="w-full border p-2 rounded-lg text-xs" 
                                            placeholder="Paste Image URL to add..." 
                                            onKeyDown={(e) => {
                                                if(e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const val = e.currentTarget.value;
                                                    if(val) {
                                                        setCurrentDriver(prev => ({
                                                            ...prev,
                                                            carPhotos: [...(prev.carPhotos || []), val],
                                                            carPhotoUrl: prev.carPhotoUrl || val
                                                        }));
                                                        e.currentTarget.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6">
                                    <button type="button" onClick={() => setIsEditingDriver(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
                                    <button type="submit" className="px-8 py-3 rounded-xl font-bold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700">Save Driver</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* --- SMS LOGS --- */}
            {activeTab === 'SMS_LOGS' && (
                <div className="space-y-6 animate-fadeIn">
                    {/* ... Existing SMS Logs UI ... */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-200 pb-6">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900">SMS Gateway Logs</h2>
                            <p className="text-sm text-gray-500 mt-1">Sender ID: <span className="font-bold font-mono">localltrip</span></p>
                        </div>
                        
                        <div className="flex gap-2">
                            {/* Test SMS Widget */}
                            <div className="flex items-center bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                                <input 
                                    type="text" 
                                    value={testSmsPhone}
                                    onChange={e => setTestSmsPhone(e.target.value)}
                                    placeholder="995..."
                                    className="border-none bg-transparent text-sm p-2 w-32 focus:ring-0"
                                />
                                <button 
                                    onClick={handleTestSms}
                                    disabled={testSmsStatus === 'Sending...'}
                                    className="bg-indigo-600 text-white text-xs font-bold px-3 py-2 rounded-md hover:bg-indigo-700"
                                >
                                    {testSmsStatus === 'Sending...' ? '...' : 'Send Test'}
                                </button>
                            </div>
                            <button onClick={() => db.smsLogs.getAll().then(setSmsLogs)} className="text-sm bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg transition shadow-sm font-bold">
                                ↻ Refresh
                            </button>
                        </div>
                    </div>
                    
                    {testSmsStatus && <p className="text-center text-xs font-bold text-gray-500">{testSmsStatus}</p>}

                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4">Recipient</th>
                                    <th className="px-6 py-4">Content</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {smsLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">No SMS logs found.</td>
                                    </tr>
                                ) : (
                                    smsLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                {log.recipient}
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded whitespace-pre-wrap">{log.content}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                                    {log.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    log.status === 'SENT' ? 'bg-green-100 text-green-700' :
                                                    log.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- SETTINGS --- */}
            {activeTab === 'SETTINGS' && (
                <div className="max-w-3xl mx-auto animate-fadeIn">
                    <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-200">
                        <h2 className="text-3xl font-black text-gray-900 mb-8 border-b border-gray-100 pb-6">Global Configuration</h2>
                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Platform Commission Rate (Decimal)</label>
                                <div className="flex items-center">
                                    <input 
                                        type="number" 
                                        step="0.0001" 
                                        className="w-32 border border-gray-300 p-3.5 rounded-l-xl focus:ring-2 focus:ring-indigo-500 font-mono text-center font-bold text-lg" 
                                        value={commissionRate} 
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            setCommissionRate(val);
                                            setSettings(prev => ({ ...prev, commissionRate: val }));
                                        }} 
                                    />
                                    <div className="bg-gray-100 border border-l-0 border-gray-300 p-3.5 rounded-r-xl text-gray-500 font-bold">
                                        = {(commissionRate * 100).toFixed(2)}%
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Determines the cut taken from each booking.</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Admin Phone (For Notifications)</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-gray-300 p-3.5 rounded-xl font-medium" 
                                    value={settings.adminPhoneNumber} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSettings(prev => ({ ...prev, adminPhoneNumber: val }));
                                    }} 
                                    placeholder="+995..."
                                />
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <label className="block text-sm font-bold text-slate-700 mb-2">SMS API Key (smsoffice.ge)</label>
                                <input 
                                    type="password" 
                                    className="w-full border border-slate-300 p-3.5 rounded-xl bg-white font-mono text-sm" 
                                    value={settings.smsApiKey} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSettings(prev => ({ ...prev, smsApiKey: val }));
                                    }} 
                                    placeholder="Paste API Key here..."
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    <strong>Important:</strong> Copy your API Key from 
                                    <a href="https://smsoffice.ge" target="_blank" className="text-indigo-600 hover:underline ml-1">smsoffice.ge</a> 
                                    dashboard and paste it here. Ensure Sender Name is 'localltrip'.
                                </p>
                            </div>

                            <button 
                                onClick={handleSaveSettings}
                                disabled={saveStatus === 'SAVING'}
                                className={`w-full font-bold py-4 rounded-xl mt-8 shadow-lg transition-all transform active:scale-95 flex items-center justify-center ${
                                    saveStatus === 'SUCCESS' ? 'bg-green-500 text-white' : 
                                    saveStatus === 'SAVING' ? 'bg-gray-400 text-white' : 
                                    'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                            >
                                {saveStatus === 'SUCCESS' ? '✅ Settings Saved!' : 
                                 saveStatus === 'SAVING' ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </main>
    </div>
  );
};

export default AdminDashboard;