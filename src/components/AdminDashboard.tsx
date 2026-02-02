
import React, { useState, useEffect, useMemo } from 'react';
import { Booking, Tour, Driver, SystemSettings, SmsLog, PromoCode, PriceOption, VehicleType, DriverDocument } from '../types';
import { db } from '../services/db';
import { GEORGIAN_LOCATIONS } from '../data/locations';
import { storageService } from '../services/storage';
import { emailService } from '../services/emailService';
import { smsService } from '../services/smsService';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface AdminDashboardProps {
  bookings: Booking[];
  tours: Tour[];
  drivers: Driver[];
  onAddTour: (tour: Tour) => void;
  onUpdateTour: (tour: Tour) => void;
  onDeleteTour: (id: string) => void;
  onUpdateBookingStatus: (id: string, status: any) => void;
  onUpdateBooking: (booking: Booking) => Promise<Booking>;
  onAddDriver: (driver: Driver) => Promise<Driver | void>;
  onUpdateDriver: (driver: Driver) => Promise<Driver | void>;
  onDeleteDriver: (id: string) => void;
  onLogout: () => void;
}

// --- HELPERS ---
const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GEL', maximumFractionDigits: 0 }).format(amount);

const getDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
};

// --- MAIN TABS ---
const TABS = [
    { id: 'DASHBOARD', label: 'Analytics', icon: '📈' },
    { id: 'BOOKINGS', label: 'Bookings', icon: '🗓️' },
    { id: 'DRIVERS', label: 'Drivers', icon: '🚖' },
    { id: 'PENDING', label: 'Verification', icon: '⏳' },
    { id: 'TOURS', label: 'Tours', icon: '🗺️' },
    { id: 'PROMOS', label: 'Promo Codes', icon: '🏷️' },
    { id: 'SMS', label: 'SMS Logs', icon: '💬' },
    { id: 'SETTINGS', label: 'Settings', icon: '⚙️' },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    bookings, tours, drivers, 
    onAddTour, onUpdateTour, onDeleteTour, 
    onUpdateBookingStatus, onUpdateBooking,
    onAddDriver, onUpdateDriver, onDeleteDriver,
    onLogout 
}) => {
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Settings State
  const [settings, setSettings] = useState<SystemSettings>({ 
      id: 'default', 
      smsApiKey: '', 
      adminPhoneNumber: '', 
      commissionRate: 0.13, 
      smsEnabled: true, 
      emailServiceId: '', 
      emailTemplateId: '', 
      emailPublicKey: '', 
      backgroundImageUrl: '',
      minTripPrice: 30,
      socialFacebook: '',
      socialInstagram: '',
      siteTitle: '',
      siteDescription: '',
      maintenanceMode: false,
      driverGuidelines: '',
      aiSystemPrompt: '',
      globalAlertMessage: '',
      bookingWindowDays: 60,
      instantBookingEnabled: false,
      taxRate: 0,
      currencySymbol: 'GEL',
      autoApproveDrivers: false,
      requireDocuments: true,
      aiModelTemperature: 0.7
  });
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]); 
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  // Test SMS State
  const [testSmsNumber, setTestSmsNumber] = useState('');
  const [sendingTestSms, setSendingTestSms] = useState(false);
  
  // DRIVER EDIT STATE
  const [localDrivers, setLocalDrivers] = useState<Driver[]>([]);
  const [isUploadingDriver, setIsUploadingDriver] = useState<string | null>(null);
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null); 
  
  // DRIVER FILTER & SORT STATE
  const [driverSearch, setDriverSearch] = useState('');
  const [driverSortField, setDriverSortField] = useState<keyof Driver>('name');
  const [driverSortDir, setDriverSortDir] = useState<'asc' | 'desc'>('asc');

  // TOUR EDIT STATE
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Partial<Tour>>({});
  const [isUploadingTour, setIsUploadingTour] = useState(false);

  // PROMO EDIT STATE
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoPercent, setNewPromoPercent] = useState(15);
  const [newPromoLimit, setNewPromoLimit] = useState(1000);
  
  // BACKUP STATE
  const [isGeneratingBackup, setIsGeneratingBackup] = useState(false);

  // ANALYTICS TIME RANGE STATE
  const [timeRange, setTimeRange] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('ALL');

  useEffect(() => {
    setLocalDrivers(drivers);
  }, [drivers]);

  // Helper to load data
  const refreshData = async () => {
      try {
          if (activeTab === 'SMS') {
              const logs = await db.smsLogs.getAll();
              setSmsLogs(logs);
          }
          if (activeTab === 'PROMOS') {
              const promos = await db.promoCodes.getAll();
              setPromoCodes(promos);
          }
          if (activeTab === 'SETTINGS') {
              const s = await db.settings.get();
              setSettings(prev => ({ ...prev, ...s }));
              setTestSmsNumber(s.adminPhoneNumber || '995593456876');
          }
      } catch (error) {
          console.error("Failed to refresh data:", error);
      }
  };

  useEffect(() => {
      refreshData();
  }, [activeTab]);

  // --- ANALYTICS ENGINE ---
  const analytics = useMemo(() => {
      const now = new Date();
      
      // Filter bookings by time range
      const filteredBookings = bookings.filter(b => {
          const bookingDate = new Date(b.createdAt);
          if (timeRange === 'ALL') return true;
          if (timeRange === 'TODAY') {
              return bookingDate.getDate() === now.getDate() && 
                     bookingDate.getMonth() === now.getMonth() && 
                     bookingDate.getFullYear() === now.getFullYear();
          }
          if (timeRange === 'WEEK') {
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return bookingDate >= weekAgo;
          }
          if (timeRange === 'MONTH') {
              const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              return bookingDate >= monthAgo;
          }
          return true;
      });

      const confirmed = filteredBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
      const pending = filteredBookings.filter(b => b.status === 'PENDING');
      const cancelled = filteredBookings.filter(b => b.status === 'CANCELLED');
      
      const totalGross = confirmed.reduce((sum, b) => sum + (Number(b.numericPrice) || 0), 0);
      const commission = settings?.commissionRate !== undefined ? settings.commissionRate : 0.13;
      const totalCommission = Math.round(totalGross * commission);
      const netRevenue = totalGross - totalCommission; 

      // Average Order Value
      const aov = confirmed.length > 0 ? Math.round(totalGross / confirmed.length) : 0;

      // Top Drivers
      const driverPerformance: Record<string, { name: string, trips: number, revenue: number }> = {};
      confirmed.forEach(b => {
          if (b.driverId && b.driverName) {
              if (!driverPerformance[b.driverId]) {
                  driverPerformance[b.driverId] = { name: b.driverName, trips: 0, revenue: 0 };
              }
              driverPerformance[b.driverId].trips += 1;
              driverPerformance[b.driverId].revenue += Number(b.numericPrice) || 0;
          }
      });
      const topDrivers = Object.values(driverPerformance).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

      // Top Routes
      const routePopularity: Record<string, number> = {};
      filteredBookings.forEach(b => {
          const title = b.tourTitle || 'Custom';
          routePopularity[title] = (routePopularity[title] || 0) + 1;
      });
      const topRoutes = Object.entries(routePopularity)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

      // Simple Trend Data (Last 7 days of the selected range or just last 7 items if ALL)
      // For simplicity in this demo, we'll map the last 5 confirmed bookings as "trend" bars
      const trendData = confirmed.slice(0, 10).map(b => ({
          date: new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
          amount: b.numericPrice
      })).reverse();


      return { 
          totalBookings: filteredBookings.length, 
          confirmedCount: confirmed.length,
          pendingCount: pending.length,
          cancelledCount: cancelled.length,
          totalGross, 
          totalCommission,
          netRevenue,
          aov,
          topDrivers,
          topRoutes,
          trendData,
          activeDrivers: drivers.filter(d => d.status === 'ACTIVE').length,
          pendingDrivers: drivers.filter(d => d.status === 'PENDING').length
      };
  }, [bookings, drivers, settings, timeRange]);

  // --- DRIVER HANDLERS ---
  const handleLocalDriverChange = (id: string, field: keyof Driver, value: any) => {
    setLocalDrivers(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleInlineSave = async (driver: Driver) => {
    try {
        await onUpdateDriver(driver);
        alert(`Saved ${driver.name}`);
        setExpandedDriverId(null);
    } catch (e) {
        alert("Error saving driver");
    }
  };

  const handleInlineFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, driverId: string, field: 'photoUrl' | 'carPhotoUrl' | 'documents' | 'carPhotos') => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploadingDriver(driverId);
      try {
          const url = await storageService.uploadDriverImage(file, driverId, field === 'photoUrl' ? 'avatar' : 'car');
          if (url) {
              handleLocalDriverChange(driverId, field as keyof Driver, url);
              const driver = localDrivers.find(d => d.id === driverId);
              if (driver) await onUpdateDriver({ ...driver, [field]: url } as Driver);
          }
      } catch (err: any) {
          alert(`Upload failed: ${err.message}`);
      } finally {
          setIsUploadingDriver(null);
      }
  };

  const handleDocumentDelete = async (driverId: string, docIndex: number) => {
      if (!confirm('Delete document?')) return;
      const driver = localDrivers.find(d => d.id === driverId);
      if (!driver || !driver.documents) return;
      const newDocs = [...driver.documents];
      newDocs.splice(docIndex, 1);
      handleLocalDriverChange(driverId, 'documents', newDocs);
      await onUpdateDriver({ ...driver, documents: newDocs } as Driver);
  };

  const handleAddNewDriverRow = () => {
    const newDriver: Driver = {
        id: `drv-${Date.now()}`,
        name: 'New Driver', email: '', password: '123', phoneNumber: '', city: 'tbilisi',
        carModel: 'Toyota Prius', vehicleType: 'Sedan', photoUrl: '', carPhotoUrl: '',
        pricePerKm: 1, basePrice: 30, maxPassengers: 4, languages: ['RU'], features: ['AC'], 
        carPhotos: [], documents: [], status: 'PENDING', rating: 5, reviewCount: 0, reviews: [], blockedDates: [], debt: 0
    };
    onAddDriver(newDriver);
  };

  const processedDrivers = useMemo(() => {
      let filtered = localDrivers;
      if (driverSearch) {
          const q = driverSearch.toLowerCase();
          filtered = filtered.filter(d => d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q));
      }
      if (activeTab === 'PENDING') {
          filtered = filtered.filter(d => d.status === 'PENDING');
      }
      return filtered.sort((a, b) => {
          const valA = a[driverSortField] || '';
          const valB = b[driverSortField] || '';
          if (valA < valB) return driverSortDir === 'asc' ? -1 : 1;
          if (valA > valB) return driverSortDir === 'asc' ? 1 : -1;
          return 0;
      });
  }, [localDrivers, driverSearch, driverSortField, driverSortDir, activeTab]);

  const handleSort = (field: keyof Driver) => {
      if (driverSortField === field) setDriverSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
      else { setDriverSortField(field); setDriverSortDir('asc'); }
  };
  
  // --- BOOKING HANDLERS ---
  const handleAssignDriver = async (bookingId: string, driverId: string) => {
      if (!driverId) return;
      const driver = drivers.find(d => d.id === driverId);
      if (driver) {
          await db.bookings.assignDriver(bookingId, driver);
      }
  };

  // --- TOUR HANDLERS ---
  const openEditTour = (tour?: Tour) => {
      setIsUploadingTour(false);
      if (tour) {
          setEditingTour(JSON.parse(JSON.stringify(tour))); 
      } else {
          setEditingTour({
              id: `tour-${Date.now()}`,
              titleEn: '', titleRu: '', descriptionEn: '', descriptionRu: '',
              price: 'From 100 GEL', basePrice: 100, duration: '1 Day', category: 'CULTURE',
              image: '', highlightsEn: [], highlightsRu: [], routeStops: [],
              priceOptions: [{ vehicle: 'Sedan', price: "100 GEL", guests: "1-4" }],
              rating: 5, reviews: []
          });
      }
      setIsTourModalOpen(true);
  };

  const saveTour = (e: React.FormEvent) => {
      e.preventDefault();
      const tourToSave = editingTour as Tour;
      const exists = tours.find(t => t.id === tourToSave.id);
      exists ? onUpdateTour(tourToSave) : onAddTour(tourToSave);
      setIsTourModalOpen(false);
  };

  const handleTourImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editingTour.id) return;
      setIsUploadingTour(true);
      try {
          const url = await storageService.uploadTourImage(file, editingTour.id);
          if (url) setEditingTour(prev => ({ ...prev, image: url }));
      } catch (err: any) { alert(`Upload Failed: ${err.message}`); } 
      finally { setIsUploadingTour(false); }
  };
  
  const handleArrayInput = (field: keyof Tour, value: string) => {
      setEditingTour(prev => ({
          ...prev,
          [field]: value.split(',').map(s => s.trim())
      }));
  };

  // --- PROMO & SETTINGS HANDLERS ---
  const handleCreatePromo = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newPromoCode) return;
      const promo: PromoCode = {
          id: `promo-${Date.now()}`, code: newPromoCode.toUpperCase().trim(),
          discountPercent: newPromoPercent, usageLimit: newPromoLimit,
          usageCount: 0, status: 'ACTIVE', createdAt: new Date().toISOString()
      };
      await db.promoCodes.create(promo);
      const updated = await db.promoCodes.getAll();
      setPromoCodes(updated);
      setNewPromoCode('');
  };

  const handleDeletePromo = async (id: string) => {
      if(confirm('Delete promo code?')) {
          await db.promoCodes.delete(id);
          const updated = await db.promoCodes.getAll();
          setPromoCodes(updated);
      }
  };

  const saveSettings = async () => {
      setIsSavingSettings(true);
      try {
          // Send all settings to save
          await db.settings.save(settings);
          alert('Settings saved!');
      } catch (e: any) { alert(`Error: ${e.message}`); } 
      finally { setIsSavingSettings(false); }
  };

  const handleTestSms = async () => {
      if (!testSmsNumber) return alert('Enter phone number');
      setSendingTestSms(true);
      try {
          const success = await smsService.sendSms(testSmsNumber, "Test Message from Orbitrip", 'ADMIN_NOTIFY');
          alert(success ? "SMS Sent!" : "SMS Failed. Check Logs.");
      } catch (e) { alert("Error sending SMS"); } 
      finally { setSendingTestSms(false); }
  };
  
  const handleDownloadBackup = async () => {
      setIsGeneratingBackup(true);
      try {
          const sqlDump = await db.backup.generateDump();
          const blob = new Blob([sqlDump], { type: 'text/plain' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `orbitrip_backup_${new Date().toISOString().split('T')[0]}.sql`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
      } catch (e: any) {
          alert('Backup failed: ' + e.message);
      } finally {
          setIsGeneratingBackup(false);
      }
  };

  // Safe wrapper for number input changes
  const handleNumberSetting = (field: keyof SystemSettings, value: string) => {
      const num = parseFloat(value);
      if (!isNaN(num)) {
          setSettings(prev => ({ ...prev, [field]: num }));
      }
  };

  // Safe wrapper for string input changes
  const handleStringSetting = (field: keyof SystemSettings, value: string) => {
      setSettings(prev => ({ ...prev, [field]: value }));
  };

  // Safe wrapper for boolean input changes
  const handleBooleanSetting = (field: keyof SystemSettings, value: boolean) => {
      setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 md:flex-row font-sans overflow-hidden">
        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 z-20 bg-slate-900 text-white w-64 transform transition-transform duration-300 md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 border-b border-gray-700">
                <h1 className="text-2xl font-black text-white">ORBI<span className="text-indigo-400">TRIP</span> <span className="text-xs bg-indigo-600 px-2 py-1 rounded ml-2">ADMIN</span></h1>
            </div>
            <nav className="p-4 space-y-1">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }} className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                        <span className="mr-3">{tab.icon}</span> {tab.label}
                        {tab.id === 'PENDING' && analytics.pendingDrivers > 0 && <span className="ml-auto bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full">{analytics.pendingDrivers}</span>}
                    </button>
                ))}
            </nav>
            <div className="p-4 mt-auto border-t border-gray-700">
                <button onClick={onLogout} className="w-full bg-red-900/30 text-red-400 font-bold py-2 rounded-lg hover:bg-red-900/50 transition">Logout</button>
            </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
            <button className="md:hidden mb-4 bg-slate-900 text-white p-2 rounded" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰ Menu</button>
            
            <div className="max-w-7xl mx-auto min-h-screen">
                
                {/* DASHBOARD TAB */}
                {activeTab === 'DASHBOARD' && (
                    <div className="space-y-6">
                        
                        {/* Time Filter & Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Business Overview</h2>
                                <p className="text-sm text-gray-500">Performance metrics and platform health</p>
                            </div>
                            <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm flex text-xs font-bold">
                                {['TODAY', 'WEEK', 'MONTH', 'ALL'].map(range => (
                                    <button 
                                        key={range}
                                        onClick={() => setTimeRange(range as any)}
                                        className={`px-3 py-1.5 rounded-md transition ${timeRange === range ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 1. FINANCIAL METRICS (HERO CARDS) */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl">💰</div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Revenue</p>
                                <h3 className="text-3xl font-black text-gray-800 mt-1">{formatCurrency(analytics.totalGross)}</h3>
                                <div className="mt-4 flex gap-2 text-xs">
                                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Avg. {formatCurrency(analytics.aov)} / trip</span>
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-2xl shadow-lg border border-indigo-500 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🏦</div>
                                <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider">Net Commission ({settings.commissionRate * 100}%)</p>
                                <h3 className="text-3xl font-black mt-1">{formatCurrency(analytics.totalCommission)}</h3>
                                <p className="text-[10px] text-indigo-300 mt-4 opacity-80">Platform Earnings (Net)</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Bookings Health</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h3 className="text-3xl font-black text-gray-800">{analytics.confirmedCount}</h3>
                                    <span className="text-xs text-gray-400 font-medium">/ {analytics.totalBookings} total</span>
                                </div>
                                {/* Mini Progress Bar for Conversion */}
                                <div className="mt-4 w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                                    <div className="h-full bg-green-500" style={{ width: `${analytics.totalBookings ? (analytics.confirmedCount / analytics.totalBookings) * 100 : 0}%` }}></div>
                                    <div className="h-full bg-amber-400" style={{ width: `${analytics.totalBookings ? (analytics.pendingCount / analytics.totalBookings) * 100 : 0}%` }}></div>
                                    <div className="h-full bg-red-400" style={{ width: `${analytics.totalBookings ? (analytics.cancelledCount / analytics.totalBookings) * 100 : 0}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-bold">
                                    <span>{analytics.confirmedCount} OK</span>
                                    <span>{analytics.pendingCount} WAIT</span>
                                    <span>{analytics.cancelledCount} CANC</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Fleet Status</p>
                                <h3 className="text-3xl font-black text-gray-800 mt-1">{analytics.activeDrivers}</h3>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-bold">{analytics.pendingDrivers} Pending Review</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* 2. REVENUE TREND (Visual Representation) */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                                <h4 className="font-bold text-gray-800 mb-6 text-sm uppercase tracking-wide flex items-center">
                                    <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded flex items-center justify-center mr-2">📊</span>
                                    Revenue Trend (Recent)
                                </h4>
                                
                                {analytics.trendData.length > 0 ? (
                                    <div className="flex items-end justify-between h-48 gap-2">
                                        {analytics.trendData.map((d, i) => {
                                            const maxVal = Math.max(...analytics.trendData.map(t => t.amount));
                                            const heightPerc = maxVal > 0 ? (d.amount / maxVal) * 100 : 0;
                                            return (
                                                <div key={i} className="flex flex-col items-center flex-1 group">
                                                    <div className="relative w-full flex justify-center">
                                                        <div 
                                                            className="w-full max-w-[20px] bg-indigo-500 rounded-t-sm opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:bg-indigo-600"
                                                            style={{ height: `${heightPerc}%`, minHeight: '4px' }}
                                                        ></div>
                                                        {/* Tooltip */}
                                                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap transition-opacity z-10 pointer-events-none">
                                                            {d.amount} ₾
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 mt-2 font-mono rotate-0 sm:rotate-0 truncate w-full text-center">{d.date}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="h-48 flex items-center justify-center text-gray-400 text-sm italic bg-gray-50 rounded-xl border border-dashed">No revenue data for this period</div>
                                )}
                            </div>

                            {/* 3. POPULAR ROUTES LIST */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide flex items-center">
                                    <span className="bg-orange-100 text-orange-600 w-6 h-6 rounded flex items-center justify-center mr-2">🔥</span>
                                    Top Routes
                                </h4>
                                <div className="space-y-3">
                                    {analytics.topRoutes.length > 0 ? analytics.topRoutes.map((r, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <span className="text-gray-400 font-mono text-xs">0{i+1}</span>
                                                <span className="truncate text-gray-700 font-medium">{r.name}</span>
                                            </div>
                                            <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-bold text-xs">{r.count}</span>
                                        </div>
                                    )) : (
                                        <p className="text-gray-400 text-sm text-center py-4">No data yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* 4. TOP DRIVERS LEADERBOARD */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide flex items-center">
                                    <span className="bg-yellow-100 text-yellow-600 w-6 h-6 rounded flex items-center justify-center mr-2">🏆</span>
                                    Driver Leaderboard
                                </h4>
                                <div className="space-y-4">
                                    {analytics.topDrivers.length > 0 ? analytics.topDrivers.map((d, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-sm ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-indigo-100 text-indigo-600'}`}>{i + 1}</div>
                                                <div>
                                                    <p className="font-bold text-sm text-gray-800">{d.name}</p>
                                                    <p className="text-[10px] text-gray-500 font-medium">{d.trips} Trips Completed</p>
                                                </div>
                                            </div>
                                            <span className="font-black text-emerald-600 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm text-sm">{formatCurrency(d.revenue)}</span>
                                        </div>
                                    )) : (
                                        <p className="text-gray-400 text-sm text-center py-4">No performance data available.</p>
                                    )}
                                </div>
                            </div>

                            {/* 5. RECENT ACTIVITY FEED */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                     <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide flex items-center">
                                        <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded flex items-center justify-center mr-2">⚡</span>
                                        Live Feed
                                    </h4>
                                    <button onClick={() => setActiveTab('BOOKINGS')} className="text-[10px] font-bold text-indigo-600 hover:underline">View All</button>
                                </div>
                                
                                <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                                     {bookings.length > 0 ? bookings.slice(0, 8).map(b => (
                                         <div key={b.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-indigo-100 transition-colors bg-white">
                                             <div className="flex items-center gap-3 overflow-hidden">
                                                 <span className={`w-2 h-2 rounded-full flex-shrink-0 ${b.status === 'PENDING' ? 'bg-amber-400 animate-pulse' : b.status === 'CONFIRMED' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                                 <div className="min-w-0">
                                                     <p className="text-xs font-bold text-gray-900 truncate">
                                                        <span className="text-gray-400 font-mono mr-1">#{b.id.slice(-4)}</span>
                                                        {b.customerName}
                                                     </p>
                                                     <p className="text-[10px] text-gray-500 truncate">{b.tourTitle}</p>
                                                 </div>
                                             </div>
                                             <div className="text-right flex-shrink-0">
                                                 <p className="text-xs font-bold text-gray-900">{b.totalPrice}</p>
                                                 <p className="text-[9px] text-gray-400">{new Date(b.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                             </div>
                                         </div>
                                     )) : (
                                        <p className="text-gray-400 text-sm text-center py-4">No recent activity.</p>
                                     )}
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* BOOKINGS TAB */}
                {activeTab === 'BOOKINGS' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                                <tr>
                                    <th className="px-6 py-4">ID / Route</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Driver</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Price</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings.map(b => (
                                    <tr key={b.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-bold">#{b.id.slice(-4)}</div>
                                            <div className="text-xs text-gray-500">{b.tourTitle}</div>
                                            <div className="text-xs text-gray-400">{b.date}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold">{b.customerName}</div>
                                            <div className="text-xs text-gray-500">{b.contactInfo}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {b.driverName ? b.driverName : (
                                                <select className="border rounded text-xs p-1" onChange={(e) => handleAssignDriver(b.id, e.target.value)}>
                                                    <option value="">Assign Driver...</option>
                                                    {drivers.filter(d => d.status === 'ACTIVE').map(d => (
                                                        <option key={d.id} value={d.id}>{d.name}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : b.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{b.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold">{b.totalPrice}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => onUpdateBookingStatus(b.id, 'CANCELLED')} className="text-red-500 hover:underline text-xs font-bold">Cancel</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* DRIVERS & PENDING TABS */}
                {(activeTab === 'DRIVERS' || activeTab === 'PENDING') && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">{activeTab === 'PENDING' ? 'Pending Verification' : 'All Drivers'}</h2>
                            {activeTab === 'DRIVERS' && <button onClick={handleAddNewDriverRow} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">+ New Driver</button>}
                        </div>
                        
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-x-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b">
                                    <tr>
                                        <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>Driver</th>
                                        <th className="px-4 py-3">Car Details</th>
                                        <th className="px-4 py-3">Pricing (GEL)</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Debt</th>
                                        <th className="px-4 py-3">Files</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {processedDrivers.map(d => {
                                        const isExpanded = expandedDriverId === d.id;
                                        return (
                                        <React.Fragment key={d.id}>
                                            <tr className={`hover:bg-gray-50 transition ${isExpanded ? 'bg-indigo-50/30' : ''}`}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <img src={d.photoUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover" />
                                                        <div>
                                                            <input className="font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 w-32" value={d.name} onChange={e => handleLocalDriverChange(d.id, 'name', e.target.value)} />
                                                            <div className="text-xs text-gray-500">{d.phoneNumber}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input className="text-xs bg-transparent border-b border-transparent hover:border-gray-300 w-24" value={d.carModel} onChange={e => handleLocalDriverChange(d.id, 'carModel', e.target.value)} />
                                                    <select className="block text-xs mt-1 bg-transparent" value={d.vehicleType} onChange={e => handleLocalDriverChange(d.id, 'vehicleType', e.target.value)}>
                                                        <option value="Sedan">Sedan</option>
                                                        <option value="Minivan">Minivan</option>
                                                        <option value="SUV">SUV</option>
                                                        <option value="Bus">Bus</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1"><span className="text-gray-400 text-xs">Km:</span><input type="number" className="w-12 border rounded px-1" value={d.pricePerKm} onChange={e => handleLocalDriverChange(d.id, 'pricePerKm', parseFloat(e.target.value))} /></div>
                                                    <div className="flex items-center gap-1 mt-1"><span className="text-gray-400 text-xs">Base:</span><input type="number" className="w-12 border rounded px-1" value={d.basePrice} onChange={e => handleLocalDriverChange(d.id, 'basePrice', parseInt(e.target.value))} /></div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select value={d.status} onChange={e => handleLocalDriverChange(d.id, 'status', e.target.value)} className={`text-xs font-bold rounded px-2 py-1 border-0 ${d.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : d.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                        <option value="ACTIVE">Active</option>
                                                        <option value="PENDING">Pending</option>
                                                        <option value="INACTIVE">Inactive</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <span className={`text-xs font-bold ${d.debt && d.debt > 0 ? 'text-red-500' : 'text-gray-400'}`}>{d.debt || 0} ₾</span>
                                                        <button onClick={() => handleLocalDriverChange(d.id, 'debt', 0)} className="text-[10px] bg-gray-200 px-1 rounded hover:bg-gray-300" title="Reset Debt">↺</button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button onClick={() => setExpandedDriverId(isExpanded ? null : d.id)} className="text-xs text-indigo-600 underline hover:text-indigo-800">
                                                        {isExpanded ? 'Hide' : 'View Files'}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => handleInlineSave(d)} className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-indigo-700 mr-2">Save</button>
                                                    <button onClick={() => { if(confirm('Delete?')) onDeleteDriver(d.id) }} className="text-red-500 text-xs font-bold hover:underline">Del</button>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="bg-gray-50">
                                                    <td colSpan={7} className="px-4 py-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <h4 className="font-bold text-xs text-gray-500 uppercase mb-2">Documents</h4>
                                                                <div className="space-y-1">
                                                                    {d.documents && d.documents.map((doc, i) => (
                                                                        <div key={i} className="flex justify-between text-xs bg-white p-2 rounded border">
                                                                            <a href={doc.url} target="_blank" className="text-blue-600 hover:underline">{doc.type}</a>
                                                                            <button onClick={() => handleDocumentDelete(d.id, i)} className="text-red-500">×</button>
                                                                        </div>
                                                                    ))}
                                                                    {(!d.documents || d.documents.length === 0) && <p className="text-xs text-gray-400">No documents uploaded.</p>}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-xs text-gray-500 uppercase mb-2">Car Photos</h4>
                                                                <div className="flex gap-2 overflow-x-auto">
                                                                    {[d.carPhotoUrl, ...(d.carPhotos || [])].filter(Boolean).map((url, i) => (
                                                                        <img key={i} src={url} className="w-16 h-12 object-cover rounded border" />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                                            <div className="flex gap-4">
                                                                <div className="flex-1">
                                                                    <label className="text-xs font-bold text-gray-500">Email (Login)</label>
                                                                    <input className="w-full border p-2 rounded text-xs mt-1" value={d.email} onChange={e => handleLocalDriverChange(d.id, 'email', e.target.value)} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <label className="text-xs font-bold text-gray-500">Password</label>
                                                                    <input className="w-full border p-2 rounded text-xs mt-1" value={d.password} onChange={e => handleLocalDriverChange(d.id, 'password', e.target.value)} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TOURS TAB */}
                {activeTab === 'TOURS' && (
                    <div>
                         <div className="flex justify-between mb-6">
                            <h2 className="text-2xl font-bold">Tour Packages</h2>
                            <button onClick={() => openEditTour()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">+ New Tour</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tours.map(t => (
                                <div key={t.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                                    <img src={t.image} className="w-full h-40 object-cover" />
                                    <div className="p-4">
                                        <h4 className="font-bold text-lg">{t.titleEn}</h4>
                                        <p className="text-xs text-gray-500 mb-2">{t.category}</p>
                                        <div className="flex justify-between items-center mt-4">
                                            <span className="font-bold text-emerald-600">{t.price}</span>
                                            <div>
                                                <button onClick={() => openEditTour(t)} className="text-indigo-600 font-bold text-xs mr-3 hover:underline">Edit</button>
                                                <button onClick={() => {if(confirm('Delete?')) onDeleteTour(t.id)}} className="text-red-500 font-bold text-xs hover:underline">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PROMOS TAB */}
                {activeTab === 'PROMOS' && (
                    <div className="space-y-6">
                         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                             <h3 className="text-lg font-bold mb-4">Create Promo Code</h3>
                             <form onSubmit={handleCreatePromo} className="flex gap-4 items-end">
                                 <div>
                                     <label className="text-xs font-bold text-gray-500 uppercase">Code</label>
                                     <input className="border p-2 rounded w-32 font-bold uppercase" value={newPromoCode} onChange={e => setNewPromoCode(e.target.value)} placeholder="SUMMER25" required />
                                 </div>
                                 <div>
                                     <label className="text-xs font-bold text-gray-500 uppercase">Discount %</label>
                                     <input className="border p-2 rounded w-20" type="number" value={newPromoPercent} onChange={e => setNewPromoPercent(Number(e.target.value))} min="1" max="100" />
                                 </div>
                                 <div>
                                     <label className="text-xs font-bold text-gray-500 uppercase">Limit</label>
                                     <input className="border p-2 rounded w-24" type="number" value={newPromoLimit} onChange={e => setNewPromoLimit(Number(e.target.value))} />
                                 </div>
                                 <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700">Create</button>
                             </form>
                         </div>

                         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                             <table className="w-full text-sm text-left">
                                 <thead className="bg-gray-50 font-bold text-gray-500 uppercase text-xs border-b">
                                     <tr>
                                         <th className="px-6 py-3">Code</th>
                                         <th className="px-6 py-3">Discount</th>
                                         <th className="px-6 py-3">Usage</th>
                                         <th className="px-6 py-3">Status</th>
                                         <th className="px-6 py-3 text-right">Action</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     {promoCodes.map(p => (
                                         <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                                             <td className="px-6 py-3 font-bold font-mono">{p.code}</td>
                                             <td className="px-6 py-3 text-emerald-600 font-bold">-{p.discountPercent}%</td>
                                             <td className="px-6 py-3">{p.usageCount} / {p.usageLimit}</td>
                                             <td className="px-6 py-3"><span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-bold">{p.status}</span></td>
                                             <td className="px-6 py-3 text-right"><button onClick={() => handleDeletePromo(p.id)} className="text-red-500 font-bold hover:underline">Delete</button></td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                         </div>
                    </div>
                )}

                {/* SMS LOGS TAB */}
                {activeTab === 'SMS' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 font-bold text-gray-500 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Time</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">To</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {smsLogs.map(log => (
                                    <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="px-6 py-3 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-3 font-bold text-xs">{log.type}</td>
                                        <td className="px-6 py-3 font-mono">{log.recipient}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${log.status === 'SENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{log.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'SETTINGS' && (
                     <div className="max-w-4xl mx-auto space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* General & Finance */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                                <h3 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Core Settings</h3>
                                
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Commission Rate (e.g. 0.13)</label>
                                    <input type="number" step="0.01" value={settings.commissionRate} onChange={e => handleNumberSetting('commissionRate', e.target.value)} className="w-full border p-3 rounded-xl" />
                                </div>
                                
                                <div>
                                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min Trip Price (GEL)</label>
                                     <input type="number" value={settings.minTripPrice} onChange={e => handleNumberSetting('minTripPrice', e.target.value)} className="w-full border p-3 rounded-xl" />
                                 </div>
                                 
                                 <div>
                                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tax Rate (%)</label>
                                     <input type="number" value={settings.taxRate} onChange={e => handleNumberSetting('taxRate', e.target.value)} className="w-full border p-3 rounded-xl" />
                                 </div>
                                 
                                 <div>
                                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Currency Symbol</label>
                                     <input type="text" value={settings.currencySymbol} onChange={e => handleStringSetting('currencySymbol', e.target.value)} className="w-full border p-3 rounded-xl" />
                                 </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admin Phone (Notifications)</label>
                                    <input type="text" value={settings.adminPhoneNumber} onChange={e => handleStringSetting('adminPhoneNumber', e.target.value)} className="w-full border p-3 rounded-xl" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SMS API Key</label>
                                    <input type="password" value={settings.smsApiKey} onChange={e => handleStringSetting('smsApiKey', e.target.value)} className="w-full border p-3 rounded-xl" />
                                </div>
                                
                                {/* Booking Rules */}
                                <div className="border-t pt-4 space-y-4">
                                    <h4 className="font-bold text-sm text-gray-800">Booking Rules</h4>
                                    <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Booking Window (Days)</label>
                                         <input type="number" value={settings.bookingWindowDays} onChange={e => handleNumberSetting('bookingWindowDays', e.target.value)} className="w-full border p-3 rounded-xl" />
                                     </div>
                                     <div className="flex items-center justify-between">
                                         <span className="text-xs font-bold text-gray-500">Instant Booking (No Approval)</span>
                                         <button onClick={() => handleBooleanSetting('instantBookingEnabled', !settings.instantBookingEnabled)} className={`w-10 h-5 rounded-full p-1 transition-colors ${settings.instantBookingEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                                             <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${settings.instantBookingEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                         </button>
                                     </div>
                                </div>

                                {/* Maintenance Mode */}
                                <div className="border-t pt-4 flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-800">Maintenance Mode</h4>
                                        <p className="text-xs text-gray-500">Stop new bookings</p>
                                    </div>
                                    <button 
                                        onClick={() => handleBooleanSetting('maintenanceMode', !settings.maintenanceMode)}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Operations & Content */}
                            <div className="space-y-6">
                                {/* Branding */}
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                                     <h3 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Branding & Social</h3>
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 mb-1">SEO Title</label>
                                         <input value={settings.siteTitle || ''} onChange={e => handleStringSetting('siteTitle', e.target.value)} className="w-full border p-3 rounded-xl text-sm" placeholder="OrbiTrip Georgia" />
                                     </div>
                                     <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-xs font-bold text-gray-500 mb-1">Facebook</label><input value={settings.socialFacebook || ''} onChange={e => handleStringSetting('socialFacebook', e.target.value)} className="w-full border p-2 rounded-lg text-xs" /></div>
                                        <div><label className="block text-xs font-bold text-gray-500 mb-1">Instagram</label><input value={settings.socialInstagram || ''} onChange={e => handleStringSetting('socialInstagram', e.target.value)} className="w-full border p-2 rounded-lg text-xs" /></div>
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 mb-1">Global Alert Banner (Optional)</label>
                                         <input value={settings.globalAlertMessage || ''} onChange={e => handleStringSetting('globalAlertMessage', e.target.value)} className="w-full border p-3 rounded-xl text-sm border-red-200 bg-red-50 text-red-800" placeholder="e.g. Discounts due to holiday!" />
                                     </div>
                                </div>

                                {/* AI Config */}
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                                     <h3 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">AI Configuration</h3>
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 mb-1">AI System Prompt (Personality)</label>
                                         <textarea 
                                            rows={3}
                                            value={settings.aiSystemPrompt || ''} 
                                            onChange={e => handleStringSetting('aiSystemPrompt', e.target.value)} 
                                            className="w-full border p-3 rounded-xl text-sm" 
                                            placeholder="You are OrbiTrip AI, a helpful guide..."
                                         />
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 mb-1">AI Temperature (Creativity: 0.0 - 1.0)</label>
                                         <input 
                                            type="number" 
                                            step="0.1" 
                                            min="0" 
                                            max="1" 
                                            value={settings.aiModelTemperature} 
                                            onChange={e => handleNumberSetting('aiModelTemperature', e.target.value)} 
                                            className="w-full border p-3 rounded-xl text-sm" 
                                         />
                                     </div>
                                </div>
                                
                                {/* Driver Policy */}
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                                     <h3 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Driver Policy</h3>
                                     <div className="flex items-center justify-between">
                                         <span className="text-xs font-bold text-gray-500">Auto-Approve Drivers</span>
                                         <button onClick={() => handleBooleanSetting('autoApproveDrivers', !settings.autoApproveDrivers)} className={`w-10 h-5 rounded-full p-1 transition-colors ${settings.autoApproveDrivers ? 'bg-green-500' : 'bg-gray-300'}`}>
                                             <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${settings.autoApproveDrivers ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                         </button>
                                     </div>
                                     <div className="flex items-center justify-between">
                                         <span className="text-xs font-bold text-gray-500">Require Documents Upload</span>
                                         <button onClick={() => handleBooleanSetting('requireDocuments', !settings.requireDocuments)} className={`w-10 h-5 rounded-full p-1 transition-colors ${settings.requireDocuments ? 'bg-green-500' : 'bg-gray-300'}`}>
                                             <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${settings.requireDocuments ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                         </button>
                                     </div>
                                </div>
                            </div>
                         </div>
                         
                         {/* Driver Guidelines (Full Width) */}
                         <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                             <h3 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Driver Guidelines Content</h3>
                             <p className="text-xs text-gray-500 mb-2">This content appears in the Driver Dashboard "Guide" tab. Supports basic HTML.</p>
                             <textarea 
                                rows={10}
                                value={settings.driverGuidelines || ''} 
                                onChange={e => handleStringSetting('driverGuidelines', e.target.value)} 
                                className="w-full border p-4 rounded-xl text-sm font-mono bg-slate-50"
                                placeholder="<h1>Welcome Partner</h1><p>Rules...</p>"
                             />
                         </div>

                         {/* Actions */}
                         <div className="flex justify-end gap-4 pt-4 pb-12">
                             <button onClick={handleTestSms} disabled={sendingTestSms} className="text-indigo-600 font-bold text-sm hover:underline">{sendingTestSms ? 'Sending...' : 'Test SMS'}</button>
                             <button onClick={handleDownloadBackup} disabled={isGeneratingBackup} className="text-emerald-600 font-bold text-sm hover:underline">{isGeneratingBackup ? 'Downloading...' : 'Download DB Backup'}</button>
                             <button onClick={saveSettings} disabled={isSavingSettings} className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:bg-indigo-700 transition flex items-center transform hover:-translate-y-1">
                                 {isSavingSettings && <span className="animate-spin mr-2">⟳</span>}
                                 {isSavingSettings ? 'Saving...' : 'Save All Settings'}
                             </button>
                         </div>
                     </div>
                )}
            </div>

            {/* TOUR EDIT MODAL */}
            {isTourModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                        <h3 className="text-xl font-bold mb-4">{editingTour.id?.startsWith('tour-') ? 'Edit Tour' : 'Create Tour'}</h3>
                        <form onSubmit={saveTour} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-500">Title (EN)</label><input className="w-full border p-2 rounded" value={editingTour.titleEn || ''} onChange={e => setEditingTour({...editingTour, titleEn: e.target.value})} required /></div>
                                <div><label className="text-xs font-bold text-gray-500">Title (RU)</label><input className="w-full border p-2 rounded" value={editingTour.titleRu || ''} onChange={e => setEditingTour({...editingTour, titleRu: e.target.value})} required /></div>
                            </div>
                            <div><label className="text-xs font-bold text-gray-500">Description (EN)</label><textarea className="w-full border p-2 rounded" rows={2} value={editingTour.descriptionEn || ''} onChange={e => setEditingTour({...editingTour, descriptionEn: e.target.value})} /></div>
                            <div><label className="text-xs font-bold text-gray-500">Description (RU)</label><textarea className="w-full border p-2 rounded" rows={2} value={editingTour.descriptionRu || ''} onChange={e => setEditingTour({...editingTour, descriptionRu: e.target.value})} /></div>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <div><label className="text-xs font-bold text-gray-500">Price Display</label><input className="w-full border p-2 rounded" value={editingTour.price || ''} onChange={e => setEditingTour({...editingTour, price: e.target.value})} /></div>
                                <div><label className="text-xs font-bold text-gray-500">Base Price (Numeric)</label><input type="number" className="w-full border p-2 rounded" value={editingTour.basePrice || 0} onChange={e => setEditingTour({...editingTour, basePrice: parseInt(e.target.value)})} /></div>
                                <div><label className="text-xs font-bold text-gray-500">Duration</label><input className="w-full border p-2 rounded" value={editingTour.duration || ''} onChange={e => setEditingTour({...editingTour, duration: e.target.value})} /></div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">Image</label>
                                <input type="file" accept="image/*" className="mb-2 text-sm text-slate-500" onChange={handleTourImageUpload} />
                                <input className="w-full border p-2 rounded text-xs" placeholder="Or Image URL" value={editingTour.image || ''} onChange={e => setEditingTour({...editingTour, image: e.target.value})} />
                                {isUploadingTour && <span className="text-xs text-indigo-500 animate-pulse">Uploading...</span>}
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">Route Stops (Comma Separated)</label>
                                <input className="w-full border p-2 rounded text-xs" placeholder="Tbilisi, Mtskheta, Gudauri" value={editingTour.routeStops?.join(', ') || ''} onChange={e => handleArrayInput('routeStops', e.target.value)} />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsTourModalOpen(false)} className="text-gray-500 font-bold">Cancel</button>
                                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">Save Tour</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    </div>
  );
};

export default AdminDashboard;
