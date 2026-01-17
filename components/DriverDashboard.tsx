
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import { Booking, Tour, Driver } from '../types';
import { db } from '../services/db';
import { GEORGIAN_LOCATIONS } from '../data/locations';
import { storageService } from '../services/storage';

interface DriverDashboardProps {
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
  driverId: string;
  onLogout: () => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ 
    bookings, tours, drivers, 
    onAddTour, onUpdateTour, onDeleteTour, onUpdateBookingStatus, 
    onAddDriver, onUpdateDriver, onDeleteDriver,
    driverId, onLogout 
}) => {
  const [activeTab, setActiveTab] = useState(() => {
      if (typeof window !== 'undefined') {
          return sessionStorage.getItem('orbitrip_driver_active_tab') || 'JOBS';
      }
      return 'JOBS';
  });

  const [isOnline, setIsOnline] = useState(true);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [commissionRate, setCommissionRate] = useState(0.13); // Default 13%
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedDateDetails, setSelectedDateDetails] = useState<Booking[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [blockProcessing, setBlockProcessing] = useState(false);
  
  // Profile Editing State (Now Editable for Price Settings)
  const [editProfile, setEditProfile] = useState<Partial<Driver>>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Pricing Simulator State
  const [simDistance, setSimDistance] = useState(100);
  const [simCalculatedPrice, setSimCalculatedPrice] = useState(0);

  useEffect(() => {
      if (typeof window !== 'undefined') {
          sessionStorage.setItem('orbitrip_driver_active_tab', activeTab);
      }
  }, [activeTab]);

  useEffect(() => {
      const fetchSettingsAndData = async () => {
          setIsRefreshing(true);
          window.dispatchEvent(new Event('orbitrip-db-change'));
          
          const settings = await db.settings.get();
          if (settings && settings.commissionRate) {
              setCommissionRate(settings.commissionRate);
          }
          setTimeout(() => setIsRefreshing(false), 500);
      };
      fetchSettingsAndData();
      
      window.addEventListener('orbitrip-db-change', fetchSettingsAndData);
      return () => window.removeEventListener('orbitrip-db-change', fetchSettingsAndData);
  }, []);

  const currentProfile = useMemo(() => {
      const found = drivers.find(d => String(d.id) === String(driverId));
      if (found) return found;
      return {
          id: driverId, name: 'Driver', email: '', city: 'tbilisi', 
          photoUrl: 'https://via.placeholder.com/150', carModel: 'Unknown',
          carPhotoUrl: '', vehicleType: 'Sedan', languages: [], rating: 5.0,
          reviewCount: 0, reviews: [], pricePerKm: 1.2, basePrice: 30,
          features: [], status: 'ACTIVE', blockedDates: []
      } as Driver;
  }, [drivers, driverId]);

  useEffect(() => {
      if (currentProfile) {
          setEditProfile({ 
              ...currentProfile,
              pricePerKm: currentProfile.pricePerKm || 1.2,
              basePrice: currentProfile.basePrice || 30
          });
          setBlockedDates(currentProfile.blockedDates || []);
      }
  }, [currentProfile]);

  // Update Simulator whenever inputs change
  useEffect(() => {
      const rate = editProfile.pricePerKm || 1.2;
      const base = editProfile.basePrice || 30;
      
      // Simulation: Distance + Return (x2) + Base
      // This is a simplified version of the main algorithm for quick estimation
      const totalKm = simDistance * 2; // Simple Round Trip Logic for simulator
      const price = Math.ceil((totalKm * rate) + base);
      setSimCalculatedPrice(price);
  }, [simDistance, editProfile.pricePerKm, editProfile.basePrice]);


  const myBookings = useMemo(() => {
      if (!driverId) return [];
      return bookings.filter(b => {
          const bookingDriverId = b.driverId ? String(b.driverId) : '';
          const currentDriverId = String(driverId);
          return bookingDriverId === currentDriverId;
      });
  }, [bookings, driverId]);

  const marketBookings = useMemo(() => {
      return bookings.filter(b => 
          b.status === 'PENDING' && 
          (!b.driverId || b.driverName === 'Any Driver') &&
          b.id !== processingJobId 
      );
  }, [bookings, processingJobId]);

  const pendingRequests = myBookings.filter(b => b.status === 'PENDING');
  const activeSchedule = myBookings.filter(b => b.status === 'CONFIRMED');
  const completedJobs = myBookings.filter(b => b.status === 'COMPLETED');

  // --- CALENDAR LOGIC (COLOR CODING) ---
  const getDayKey = (dateInput: any): string => {
      if (!dateInput) return '';
      try {
          let dateStr = typeof dateInput === 'string' ? dateInput.split(' at ')[0] : dateInput;
          let date = new Date(dateStr);
          if (isNaN(date.getTime())) return '';
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
      } catch (e) {
          return '';
      }
  };

  const dateStatusMap = useMemo(() => {
      const map = new Map<string, 'PENDING' | 'CONFIRMED' | 'BLOCKED'>();
      blockedDates.forEach(dateStr => {
          const key = getDayKey(dateStr); 
          if (key) map.set(key, 'BLOCKED');
      });
      myBookings.forEach(b => {
          if (['CANCELLED', 'COMPLETED'].includes(b.status)) return;
          const key = getDayKey(b.date); 
          if (key) {
              const currentStatus = map.get(key);
              if (b.status === 'CONFIRMED') {
                  map.set(key, 'CONFIRMED');
              } else if (b.status === 'PENDING') {
                  if (currentStatus !== 'CONFIRMED') {
                      map.set(key, 'PENDING');
                  }
              }
          }
      });
      return map;
  }, [myBookings, blockedDates]);

  const earningsAmount = useMemo(() => {
      const totalNet = completedJobs.reduce((sum, b) => {
          const gross = typeof b.numericPrice === 'number' ? b.numericPrice : parseFloat(String(b.numericPrice || 0));
          if (isNaN(gross)) return sum;
          const commission = Math.round(gross * commissionRate);
          return sum + (gross - commission);
      }, 0);
      return Math.floor(totalNet); 
  }, [completedJobs, commissionRate]);

  const handleDateClick = async (date: Date) => {
      if (blockProcessing) return;
      setBlockProcessing(true);
      
      setSelectedDate(date);
      const key = getDayKey(date);
      const dayBookings = myBookings.filter(b => getDayKey(b.date) === key);
      setSelectedDateDetails(dayBookings);
      
      if (dayBookings.length === 0) {
          let newBlocked = [...blockedDates];
          const isCurrentlyBlocked = dateStatusMap.get(key) === 'BLOCKED';
          if (isCurrentlyBlocked) {
              newBlocked = newBlocked.filter(d => getDayKey(d) !== key);
          } else {
              newBlocked.push(key); 
          }
          setBlockedDates(newBlocked);
          const updatedDriver = { ...currentProfile, blockedDates: newBlocked } as Driver;
          await onUpdateDriver(updatedDriver); 
      }
      setTimeout(() => setBlockProcessing(false), 300);
  };

  const renderDayContents = (day: number, date: Date) => {
      const key = getDayKey(date);
      const status = dateStatusMap.get(key);
      const isSelected = selectedDate && getDayKey(selectedDate) === key;
      let colorClass = 'bg-white text-gray-700 hover:bg-gray-100 border-gray-100';
      let statusIcon = null;

      if (status === 'CONFIRMED') {
          colorClass = 'bg-green-500 text-white hover:bg-green-600 font-bold shadow-md border-green-500';
          statusIcon = <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>;
      } else if (status === 'PENDING') {
          colorClass = 'bg-amber-400 text-white hover:bg-amber-500 font-bold shadow-md animate-pulse border-amber-400';
          statusIcon = <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>;
      } else if (status === 'BLOCKED') {
          colorClass = 'bg-red-50 text-red-400 hover:bg-red-100 font-bold shadow-inner border-red-100';
          statusIcon = <div className="absolute top-0.5 right-0.5 text-[8px]">⛔</div>;
      }

      return (
          <div className={`w-full h-full flex items-center justify-center rounded-xl transition-all duration-200 border-2 relative ${colorClass} ${isSelected ? 'ring-2 ring-indigo-600 ring-offset-1 z-10' : ''}`}>
              {day}
              {statusIcon}
          </div>
      );
  };

  const handleTakeJob = async (jobId: string) => {
      setProcessingJobId(jobId);
      const success = await db.bookings.assignDriver(jobId, currentProfile as Driver);
      if (success) {
          setTimeout(() => setActiveTab('JOBS'), 500); 
      } else {
          alert("Sorry, this job was just taken by another driver.");
          window.dispatchEvent(new Event('orbitrip-db-change'));
      }
      setProcessingJobId(null);
  };

  const handleManualRefresh = () => {
      setIsRefreshing(true);
      window.dispatchEvent(new Event('orbitrip-db-change'));
      setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleStatusChange = (id: string, s: string) => { onUpdateBookingStatus(id, s); };

  const handleProfileUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSavingProfile(true);
      try {
          const updatedDriver = {
              ...currentProfile,
              pricePerKm: editProfile.pricePerKm,
              basePrice: editProfile.basePrice
          } as Driver;
          
          await onUpdateDriver(updatedDriver);
          alert("Pricing settings updated successfully!");
      } catch (err) {
          console.error(err);
          alert("Failed to update profile.");
      } finally {
          setIsSavingProfile(false);
      }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 md:flex-row font-sans overflow-hidden">
        
        {/* MOBILE HEADER */}
        <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center z-30 shadow-md">
            <div className="flex items-center space-x-2">
                <span className="text-xl">🚖</span>
                <h1 className="font-bold text-lg">OrbiTrip Partner</h1>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={onLogout} className="text-xs font-bold text-red-300 border border-red-900 bg-red-900/20 px-3 py-1.5 rounded-lg hover:bg-red-900/40 transition">Exit</button>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white">{mobileMenuOpen ? '✖' : '☰'}</button>
            </div>
        </div>

        {/* SIDEBAR NAVIGATION */}
        <div className={`fixed inset-y-0 left-0 z-20 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 w-72 flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} pt-16 md:pt-0`}>
            <div className="p-6 border-b border-slate-700">
                <div className="flex items-center space-x-4 mb-6">
                    <img src={currentProfile.photoUrl} className="w-14 h-14 rounded-full border-2 border-green-500 object-cover" alt="Profile" />
                    <div>
                        <h2 className="font-bold text-lg leading-tight truncate w-32">{currentProfile.name}</h2>
                        <div className="text-yellow-400 text-sm flex items-center"><span>★ {currentProfile.rating}</span></div>
                    </div>
                </div>
                
                <div className="bg-slate-800 rounded-xl p-4 text-center mb-6 border border-slate-700 relative overflow-hidden group">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Net Earnings</p>
                    <p className="text-3xl font-black text-emerald-400">{earningsAmount.toFixed(0)} ₾</p>
                    <div className="flex justify-center items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-500">Comm: {(commissionRate * 100).toFixed(0)}%</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    </div>
                </div>

                <button onClick={() => setIsOnline(!isOnline)} className={`w-full py-3 rounded-xl font-bold flex items-center justify-center transition-all ${isOnline ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'}`}>
                    {isOnline ? '● Online' : '○ Offline'}
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {[
                    { id: 'MARKET', icon: '🌍', label: 'Marketplace' },
                    { id: 'JOBS', icon: '🚙', label: 'My Jobs' },
                    { id: 'CALENDAR', icon: '📅', label: 'Calendar' },
                    { id: 'GUIDE', icon: '📖', label: 'Instruction' }, 
                    { id: 'EARNINGS', icon: '💰', label: 'Earnings' },
                    { id: 'PROFILE', icon: '⚙️', label: 'Settings & Price' }
                ].map(item => (
                    <button 
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all relative ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg translate-x-1' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <span className="mr-3 text-lg">{item.icon}</span>
                        {item.label}
                        {item.id === 'MARKET' && marketBookings.length > 0 && <span className="ml-auto bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">{marketBookings.length}</span>}
                        {item.id === 'JOBS' && pendingRequests.length > 0 && <span className="ml-auto bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{pendingRequests.length}</span>}
                        {item.id === 'GUIDE' && <span className="ml-auto text-yellow-400 text-[10px]">ℹ️</span>}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-700">
                <button onClick={onLogout} className="w-full flex items-center px-4 py-3 text-sm font-bold text-red-400 hover:bg-slate-800 rounded-xl transition">
                    <span className="mr-3">🚪</span> Logout
                </button>
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                
                {/* --- TAB: MARKETPLACE --- */}
                {activeTab === 'MARKET' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-gray-800">Available Orders</h3>
                                <p className="text-sm text-gray-500">Pick up new passengers here</p>
                            </div>
                            <button onClick={handleManualRefresh} className={`bg-white text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:shadow transition border border-indigo-100 flex items-center ${isRefreshing ? 'opacity-50 cursor-wait' : ''}`}>
                                <span className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`}>↻</span> Refresh
                            </button>
                        </div>
                        
                        {marketBookings.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <div className="text-6xl mb-4 grayscale opacity-30">🌍</div>
                                <h4 className="text-lg font-bold text-gray-400">No open orders at the moment.</h4>
                                <p className="text-sm text-gray-400">Check back later or enable notifications.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {marketBookings.map(job => (
                                    <div key={job.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-indigo-50 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl shadow-md">NEW</div>
                                        <div className="mb-4">
                                            <h4 className="font-bold text-lg text-gray-900 leading-tight mb-2 line-clamp-2 h-14">{job.tourTitle}</h4>
                                            <div className="flex items-center text-sm text-gray-500 font-medium bg-gray-50 p-2 rounded-lg"><span className="mr-2">📅</span> {job.date}</div>
                                        </div>
                                        <div className="flex justify-between items-end border-t border-gray-100 pt-4 mt-auto">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Client Pays</p>
                                                <span className="text-2xl font-black text-indigo-600">{job.numericPrice} ₾</span>
                                            </div>
                                            <button onClick={() => handleTakeJob(job.id)} disabled={!!processingJobId} className="bg-indigo-900 hover:bg-black text-white text-sm font-bold px-6 py-3 rounded-xl transition shadow-lg transform active:scale-95 disabled:opacity-50">
                                                {processingJobId === job.id ? 'Taking...' : 'Accept Job'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- TAB: MY JOBS --- */}
                {activeTab === 'JOBS' && (
                    <div className="space-y-8 animate-fadeIn">
                        
                        {/* PENDING REQUESTS */}
                        {pendingRequests.length > 0 && (
                            <div className="bg-amber-50 border-l-8 border-amber-400 rounded-2xl p-6 shadow-md mb-8">
                                <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center"><span className="mr-2 text-2xl">⚠️</span> Action Required: Pending Requests</h3>
                                <div className="space-y-4">
                                    {pendingRequests.map(job => (
                                        <div key={job.id} className="bg-white rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 text-lg">{job.tourTitle}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wider">#{job.id.slice(-6).toUpperCase()}</span>
                                                    <span className="text-sm text-gray-600 font-bold">📅 {job.date} • {job.guests} Guests</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right mr-4">
                                                    <span className="block text-2xl font-black text-gray-900">{job.numericPrice} ₾</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase">Cash on Arrival</span>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <button onClick={() => handleStatusChange(job.id, 'CONFIRMED')} className="bg-green-500 text-white px-8 py-3 rounded-lg font-bold shadow hover:bg-green-600 transition text-sm w-full">✓ Confirm Job</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ACTIVE SCHEDULE */}
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><span className="mr-3">🗓️</span> Upcoming Schedule</h3>
                            {activeSchedule.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <p className="text-gray-400">No confirmed jobs yet.</p>
                                    <button onClick={() => setActiveTab('MARKET')} className="mt-4 text-indigo-600 font-bold hover:underline">Check Marketplace →</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {activeSchedule.map(job => (
                                        <div key={job.id} className="bg-white border-l-8 border-green-500 rounded-r-2xl p-6 shadow-sm hover:shadow-md transition">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-[10px] font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full uppercase tracking-wide">Confirmed</span>
                                                    <h4 className="font-bold text-gray-900 mt-2 text-lg">{job.tourTitle}</h4>
                                                    <div className="mt-1 text-[10px] font-bold text-gray-400 bg-gray-50 inline-block px-1 rounded">#{job.id.slice(-6).toUpperCase()}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2 mb-6">
                                                <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg"><span className="mr-3">📅</span> <strong>{job.date}</strong></div>
                                                <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg"><span className="mr-3">👤</span> {job.customerName} ({job.guests} pax)</div>
                                                <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg"><span className="mr-3">📞</span> <a href={`tel:${job.contactInfo}`} className="text-blue-600 hover:underline font-bold">{job.contactInfo}</a></div>
                                                {job.flightNumber && <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg"><span className="mr-3">✈️</span> Flight: {job.flightNumber}</div>}
                                            </div>

                                            {/* FINANCIAL BREAKDOWN */}
                                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-6 grid grid-cols-3 gap-2 text-center">
                                                <div>
                                                    <div className="text-[10px] font-bold text-indigo-400 uppercase">Collect Cash</div>
                                                    <div className="text-lg font-black text-indigo-900">{job.numericPrice} ₾</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-red-400 uppercase">Platform Fee</div>
                                                    <div className="text-lg font-black text-red-600">-{Math.round(job.numericPrice * commissionRate)} ₾</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-emerald-500 uppercase">Your Net</div>
                                                    <div className="text-lg font-black text-emerald-600">{Math.round(job.numericPrice * (1-commissionRate))} ₾</div>
                                                </div>
                                            </div>

                                            <button onClick={() => handleStatusChange(job.id, 'COMPLETED')} className="w-full bg-white border-2 border-indigo-100 text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-50 transition flex items-center justify-center">
                                                <span className="mr-2">🏁</span> Mark as Completed
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- TAB: CALENDAR --- */}
                {activeTab === 'CALENDAR' && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-12 animate-fadeIn">
                        <div className="md:w-1/2">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Availability Calendar</h3>
                            <div className="calendar-wrapper driver-calendar">
                                <style>{`
                                    .driver-calendar .react-datepicker { border: none; font-family: inherit; width: 100%; }
                                    .driver-calendar .react-datepicker__month-container { width: 100%; }
                                    .driver-calendar .react-datepicker__header { background: white; border: none; padding-top: 1rem; }
                                    .driver-calendar .react-datepicker__day-name { color: #9ca3af; font-weight: bold; width: 3rem; margin: 0.2rem; }
                                    .driver-calendar .react-datepicker__day { width: 3rem; height: 3rem; margin: 0.2rem; position: relative; }
                                    .driver-calendar .react-datepicker__day--selected { background-color: transparent !important; }
                                    .driver-calendar .react-datepicker__day--keyboard-selected { background-color: transparent !important; }
                                `}</style>
                                <DatePicker inline selected={selectedDate} onChange={handleDateClick} renderDayContents={renderDayContents} />
                            </div>
                            
                            <div className="flex flex-col gap-3 mt-6 text-xs font-bold text-gray-600 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                <div className="flex items-center"><span className="w-4 h-4 bg-green-500 rounded-full mr-3 shadow-sm ring-2 ring-green-200"></span> Confirmed Job</div>
                                <div className="flex items-center"><span className="w-4 h-4 bg-amber-400 rounded-full mr-3 shadow-sm ring-2 ring-amber-200 animate-pulse"></span> Pending Request</div>
                                <div className="flex items-center"><span className="w-4 h-4 bg-red-100 border border-red-200 rounded-full mr-3 shadow-sm"></span> Blocked Day</div>
                                <div className="flex items-center"><span className="w-4 h-4 bg-white border border-gray-300 rounded-full mr-3 shadow-sm"></span> Available</div>
                            </div>
                        </div>
                        
                        <div className="md:w-1/2 border-l border-gray-100 pl-0 md:pl-12">
                            <h4 className="font-bold text-gray-900 mb-6 flex items-center text-lg"><span className="text-2xl mr-3 bg-gray-100 p-2 rounded-lg">📅</span> Details for {selectedDate?.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</h4>
                            {selectedDateDetails.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedDateDetails.map(job => (
                                        <div key={job.id} className={`rounded-xl p-5 border-l-4 shadow-sm ${job.status === 'CONFIRMED' ? 'bg-green-50 border-green-500' : 'bg-amber-50 border-amber-400'}`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${job.status === 'CONFIRMED' ? 'bg-green-200 text-green-800' : 'bg-amber-200 text-amber-800'}`}>{job.status}</span>
                                                <span className="font-black text-gray-900 text-lg">{job.numericPrice} ₾</span>
                                            </div>
                                            <div className="font-bold text-gray-900 text-md mb-1">{job.tourTitle}</div>
                                            {job.status === 'PENDING' && <div className="mt-4 pt-4 border-t border-amber-200/50 flex gap-2"><button onClick={() => handleStatusChange(job.id, 'CONFIRMED')} className="flex-1 bg-green-500 text-white text-xs font-bold py-2 rounded shadow hover:bg-green-600">Accept Request</button></div>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 h-full flex flex-col justify-center">
                                    <div className="text-4xl mb-4 opacity-50">{blockedDates.includes(selectedDate ? getDayKey(selectedDate) : '') ? '⛔' : '✨'}</div>
                                    <p className="text-gray-500 text-sm font-bold">{blockedDates.includes(selectedDate ? getDayKey(selectedDate) : '') ? "Day marked as BUSY/OFF" : "Day is OPEN for bookings"}</p>
                                    <button onClick={() => handleDateClick(selectedDate || new Date())} disabled={blockProcessing} className={`mt-6 px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition self-center disabled:opacity-50 ${blockedDates.includes(selectedDate ? getDayKey(selectedDate) : '') ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100' : 'bg-red-500 text-white hover:bg-red-600'}`}>{blockProcessing ? "Updating..." : (blockedDates.includes(selectedDate ? getDayKey(selectedDate) : '') ? "Unblock" : "Block Date")}</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- TAB: GUIDE (INSTRUCTIONS) --- */}
                {activeTab === 'GUIDE' && (
                    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
                        {/* HERO HEADER */}
                        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-4xl font-black mb-4">Partner Guidelines / პარტნიორის გზამკვლევი</h2>
                                <p className="text-indigo-200 text-lg max-w-2xl font-bold">კეთილი იყოს თქვენი მობრძანება OrbiTrip-ის ოჯახში! ჩვენ ვქმნით დაუვიწყარ მოგონებებს ტურისტებისთვის.</p>
                            </div>
                            <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {/* RULE 1: FINANCIALS (13%) */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl group-hover:scale-110 transition-transform">💰</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                                    ფინანსები და 13% საკომისიო / Finances & 13% Commission
                                </h3>
                                <div className="space-y-4">
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        <strong>ანგარიშსწორება:</strong> კლიენტი გიხდით სრულ თანხას ნაღდი ანგარიშსწორებით (Cash) მგზავრობის დასრულებისას.
                                    </p>
                                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                        <p className="text-indigo-900 text-sm font-bold mb-2">როგორ მუშაობს 13%?</p>
                                        <p className="text-indigo-800 text-xs leading-relaxed">
                                            პლატფორმის მომსახურების საკომისიო არის <strong>13%</strong>. ეს თანხა ავტომატურად აისახება თქვენს ბალანსზე როგორც <strong>"დავალიანება" (Debt)</strong>.
                                            <br/><br/>
                                            მაგალითად: თუ ტურის ფასი 100 ლარია, კლიენტი გიხდით 100 ლარს. 87 ლარი თქვენია, 13 ლარი კი გეწერებათ ვალად.
                                            ეს დაგროვილი დავალიანება პერიოდულად უნდა ჩარიცხოთ პლატფორმის ანგარიშზე.
                                        </p>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        აკრძალულია კლიენტისთვის დამატებითი თანხის მოთხოვნა (კონდიციონერზე, გაჩერებებზე ან საცობებზე).
                                    </p>
                                </div>
                            </div>

                            {/* RULE 2: CANCELLATION */}
                            <div className="bg-red-50 p-8 rounded-3xl shadow-sm border border-red-200 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl text-red-900">⚠️</div>
                                <h3 className="text-xl font-black text-red-900 mb-4 flex items-center">
                                    <span className="bg-red-200 text-red-800 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                                    ჯარიმები / Penalties
                                </h3>
                                <p className="text-red-800 text-sm leading-relaxed mb-4">
                                    დადასტურებული ჯავშნის გაუქმება იწვევს პრობლემებს.
                                </p>
                                <div className="bg-white/60 p-4 rounded-xl border border-red-200">
                                    <p className="text-red-900 text-xs font-bold mb-1">ჯარიმის წესი:</p>
                                    <p className="text-red-800 text-xs leading-relaxed">
                                        თუ თქვენი მიზეზით გაუქმდება ჯავშანი და ადმინისტრატორს მოუწევს უფრო ძვირადღირებული მძღოლის დანიშვნა, სხვაობა დაგეკისრებათ ვალად.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: EARNINGS --- */}
                {activeTab === 'EARNINGS' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                <p className="text-xs text-gray-400 font-bold uppercase">Total Jobs</p>
                                <p className="text-3xl font-black text-gray-900">{completedJobs.length}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                <p className="text-xs text-gray-400 font-bold uppercase">Your Net Profit</p>
                                <p className="text-3xl font-black text-emerald-500">{earningsAmount} ₾</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                <p className="text-xs text-gray-400 font-bold uppercase">Current Debt</p>
                                <p className={`text-3xl font-black ${currentProfile.debt && currentProfile.debt > 0 ? 'text-red-500' : 'text-gray-400'}`}>-{currentProfile.debt || 0} ₾</p>
                            </div>
                        </div>

                        {currentProfile.debt && currentProfile.debt > 0 && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex justify-between items-center shadow-sm">
                                <div>
                                    <h4 className="text-red-800 font-black text-lg uppercase">Commission Debt / დავალიანება</h4>
                                    <p className="text-red-700 text-sm">You owe platform fees (13%) from previous trips.</p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-2xl font-black text-red-600">-{currentProfile.debt} ₾</span>
                                    <button onClick={() => alert("Contact Admin to transfer: 995 593 456 876")} className="text-xs font-bold underline text-red-800 hover:text-red-900">Pay Now</button>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Cash from Client</th>
                                        <th className="px-6 py-4">Platform Fee (13%)</th>
                                        <th className="px-6 py-4 text-right">Your Profit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {completedJobs.map(job => {
                                        const gross = job.numericPrice || 0;
                                        const fee = Math.round(gross * commissionRate);
                                        const net = gross - fee;
                                        return (
                                            <tr key={job.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-800">{job.date}</div>
                                                    <div className="text-xs text-gray-500">{job.tourTitle}</div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-indigo-900">{gross} ₾</td>
                                                <td className="px-6 py-4 font-bold text-red-500">-{fee} ₾</td>
                                                <td className="px-6 py-4 text-right font-black text-emerald-600">+{net} ₾</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {completedJobs.length === 0 && <div className="p-8 text-center text-gray-400">No completed jobs yet.</div>}
                        </div>
                    </div>
                )}

                {/* --- TAB: PROFILE (EDITABLE PRICING) --- */}
                {activeTab === 'PROFILE' && (
                    <div className="animate-fadeIn max-w-4xl mx-auto space-y-8">
                        
                        {/* 1. INFO BOX: HOW PRICING WORKS */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-2xl shadow-sm">
                            <h3 className="text-lg font-bold text-blue-900 mb-2">How Your Tariff Works / როგორ მუშაობს ტარიფი</h3>
                            <p className="text-sm text-blue-800 leading-relaxed mb-4">
                                The system automatically calculates trip prices based on the <strong>"Real Logistics Loop"</strong> model.
                                <br/>
                                სისტემა ავტომატურად ითვლის ფასს <strong>"რეალური ლოჯისტიკური ციკლის"</strong> მოდელით.
                            </p>
                            <div className="bg-white/60 p-4 rounded-xl text-xs space-y-2 font-medium text-blue-900">
                                <p>1. <strong>Approach (მისვლა):</strong> Distance from your City ({currentProfile.city}) to Client Pickup.</p>
                                <p>2. <strong>Route (მარშრუტი):</strong> Total distance of the tour/transfer.</p>
                                <p>3. <strong>Return (დაბრუნება):</strong> Distance from Drop-off back to your City.</p>
                                <p>4. <strong>Time Fee (დროის საფასური):</strong> +5 GEL for every hour of driving (estimated).</p>
                                <div className="mt-3 pt-3 border-t border-blue-200">
                                    <p className="font-bold">Formula: (Total Km × Rate) + Base Price + Time Fee</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* 2. PRICING SETTINGS FORM */}
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                    <span className="bg-green-100 text-green-600 p-2 rounded-lg mr-3 text-lg">⚙️</span>
                                    Your Rates / თქვენი ტარიფები
                                </h3>
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Price per KM (GEL)</label>
                                        <input 
                                            type="number" 
                                            step="0.1" 
                                            min="0.5" 
                                            max="5"
                                            className="w-full border p-4 rounded-xl bg-gray-50 font-bold text-lg text-gray-900 focus:ring-2 focus:ring-green-500 outline-none transition" 
                                            value={editProfile.pricePerKm || 1.2} 
                                            onChange={e => setEditProfile({...editProfile, pricePerKm: parseFloat(e.target.value)})}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">Recommended: 1.0 - 1.5 GEL</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Base Price / Start Fee (GEL)</label>
                                        <input 
                                            type="number" 
                                            min="10" 
                                            max="100"
                                            className="w-full border p-4 rounded-xl bg-gray-50 font-bold text-lg text-gray-900 focus:ring-2 focus:ring-green-500 outline-none transition" 
                                            value={editProfile.basePrice || 30} 
                                            onChange={e => setEditProfile({...editProfile, basePrice: parseFloat(e.target.value)})}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">Fixed fee added to every trip.</p>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isSavingProfile}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95 disabled:opacity-50"
                                    >
                                        {isSavingProfile ? "Saving..." : "Save Rates / შენახვა"}
                                    </button>
                                </form>
                            </div>

                            {/* 3. SIMULATOR */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl -mr-10 -mt-10 opacity-30"></div>
                                <h3 className="text-xl font-bold mb-6 relative z-10">Price Simulator / კალკულატორი</h3>
                                
                                <div className="space-y-6 relative z-10">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Test Distance (One Way)</label>
                                        <input 
                                            type="range" 
                                            min="10" 
                                            max="500" 
                                            step="10"
                                            value={simDistance}
                                            onChange={(e) => setSimDistance(parseInt(e.target.value))}
                                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                                        />
                                        <div className="flex justify-between mt-2 font-mono text-sm text-indigo-300">
                                            <span>{simDistance} km</span>
                                            <span>Round Trip: {simDistance * 2} km</span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Estimated Total Price</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-green-400">{simCalculatedPrice} ₾</span>
                                            <span className="text-sm text-slate-500 font-bold">Cash</span>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between text-xs">
                                            <span className="text-slate-400">Your Net:</span>
                                            <span className="text-white font-bold">{Math.round(simCalculatedPrice * 0.87)} ₾</span>
                                        </div>
                                    </div>
                                    
                                    <p className="text-[10px] text-slate-500 italic">
                                        * Simulation assumes start & end are in your city. Real prices vary based on pickup location.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 4. READ ONLY DETAILS */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 opacity-75">
                            <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">Locked Details (Contact Admin to Change)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-gray-300 uppercase mb-1">Name</label><input type="text" disabled className="w-full border p-3 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" value={currentProfile.name || ''} /></div>
                                <div><label className="block text-xs font-bold text-gray-300 uppercase mb-1">Car Model</label><input type="text" disabled className="w-full border p-3 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" value={currentProfile.carModel || ''} /></div>
                                <div><label className="block text-xs font-bold text-gray-300 uppercase mb-1">City</label><input type="text" disabled className="w-full border p-3 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" value={currentProfile.city || ''} /></div>
                                <div><label className="block text-xs font-bold text-gray-300 uppercase mb-1">Phone</label><input type="text" disabled className="w-full border p-3 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" value={currentProfile.phoneNumber || ''} /></div>
                            </div>
                        </div>

                    </div>
                )}

            </div>
        </div>
    </div>
  );
};

export default DriverDashboard;
