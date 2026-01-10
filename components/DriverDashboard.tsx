import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import { Booking, Tour, Driver } from '../types';
import { db } from '../services/db';
import { GEORGIAN_LOCATIONS } from '../data/locations';

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
  const [activeTab, setActiveTab] = useState('WORK'); 
  const [isOnline, setIsOnline] = useState(true);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [commissionRate, setCommissionRate] = useState(0.20); 
  
  // Local state for tracking which job is currently being accepted (Optimistic UI)
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);

  // Calendar Details State
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedDateDetails, setSelectedDateDetails] = useState<Booking[]>([]);
  
  // Profile Settings State
  const [editProfile, setEditProfile] = useState<Partial<Driver>>({});
  const [newPassword, setNewPassword] = useState('');
  const [newPhotoInput, setNewPhotoInput] = useState('');
  const [profileMsg, setProfileMsg] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- SYNC WITH ADMIN SETTINGS ---
  useEffect(() => {
      const fetchSettings = async () => {
          const settings = await db.settings.get();
          if (settings && settings.commissionRate) {
              setCommissionRate(settings.commissionRate);
          }
      };
      fetchSettings();
      // Re-fetch when DB changes (e.g. Admin changes rate)
      window.addEventListener('orbitrip-db-change', fetchSettings);
      return () => window.removeEventListener('orbitrip-db-change', fetchSettings);
  }, []);

  // --- DATA LOADING ---
  const currentProfile = useMemo(() => {
      const found = drivers.find(d => String(d.id) === String(driverId));
      if (found) return found;

      // Fallback
      return {
          id: driverId, name: 'Driver', email: '', city: 'kutaisi', 
          photoUrl: 'https://via.placeholder.com/150', carModel: 'Unknown',
          carPhotoUrl: '', vehicleType: 'Sedan', languages: [], rating: 5.0,
          reviewCount: 0, reviews: [], pricePerKm: 1.0, basePrice: 30,
          features: [], status: 'ACTIVE', blockedDates: []
      } as Driver;
  }, [drivers, driverId]);

  useEffect(() => {
      if (currentProfile) {
          setEditProfile({ ...currentProfile });
          setBlockedDates(currentProfile.blockedDates || []);
      }
  }, [currentProfile]);

  // CRITICAL FIX: Robust Filtering Logic
  const myBookings = useMemo(() => {
      if (!driverId) return [];
      
      return bookings.filter(b => {
          // Normalize IDs to strings for comparison to avoid '1' !== 1 issues
          const bookingDriverId = b.driverId ? String(b.driverId) : '';
          const currentDriverId = String(driverId);
          return bookingDriverId === currentDriverId;
      });
  }, [bookings, driverId]);

  const marketBookings = useMemo(() => {
      return bookings.filter(b => 
          b.status === 'PENDING' && 
          (!b.driverId || b.driverName === 'Any Driver') &&
          b.id !== processingJobId // Hide locally processed jobs immediately
      );
  }, [bookings, processingJobId]);

  const pendingRequests = myBookings.filter(b => b.status === 'PENDING');
  const activeSchedule = myBookings.filter(b => b.status === 'CONFIRMED');
  const completedJobs = myBookings.filter(b => b.status === 'COMPLETED');
  
  // NEW: Cancelled jobs that were assigned to THIS driver.
  const cancelledJobs = myBookings.filter(b => b.status === 'CANCELLED').slice(0, 3); // Show top 3 recent

  // Earnings Calculation (Net Income)
  const earningsAmount = useMemo(() => {
      const totalNet = completedJobs.reduce((sum, b) => {
          const gross = typeof b.numericPrice === 'number' ? b.numericPrice : 0;
          const commission = gross * commissionRate;
          return sum + (gross - commission);
      }, 0);
      return totalNet;
  }, [completedJobs, commissionRate]);

  // Handle Date Click
  const handleDateClick = async (date: Date) => {
      setSelectedDate(date);
      const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      
      const dayBookings = myBookings.filter(b => b.date.includes(dateStr));
      setSelectedDateDetails(dayBookings);

      if (dayBookings.length === 0) {
          let newBlocked = [...blockedDates];
          if (newBlocked.includes(dateStr)) {
              newBlocked = newBlocked.filter(d => d !== dateStr);
          } else {
              newBlocked.push(dateStr);
          }
          setBlockedDates(newBlocked);
          const updatedDriver = { ...currentProfile, blockedDates: newBlocked } as Driver;
          onUpdateDriver(updatedDriver); 
      }
  };

  const handleTakeJob = async (jobId: string) => {
      setProcessingJobId(jobId); // UI Optimism
      
      // LOGIC UPDATE: assignDriver now returns boolean indicating success
      const success = await db.bookings.assignDriver(jobId, currentProfile as Driver);
      
      if (success) {
          // Success!
          setTimeout(() => setActiveTab('WORK'), 500); 
      } else {
          // Failure (Race condition: someone else took it)
          alert("Sorry, this job was just taken by another driver.");
          // Force refresh to update list
          window.dispatchEvent(new Event('orbitrip-db-change'));
      }
      setProcessingJobId(null);
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
      e.preventDefault();
      const updatedDriver = { ...currentProfile, ...editProfile } as Driver;
      if (newPassword && newPassword.length >= 4) {
          updatedDriver.password = newPassword;
      }
      onUpdateDriver(updatedDriver);
      setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setProfileMsg(null), 3000);
  };

  const handleStatusChange = (id: string, s: string) => { onUpdateBookingStatus(id, s); };

  const addCarPhoto = () => {
      if (newPhotoInput.trim()) {
          const currentPhotos = editProfile.carPhotos || [];
          setEditProfile({
              ...editProfile,
              carPhotos: [...currentPhotos, newPhotoInput.trim()]
          });
          setNewPhotoInput('');
      }
  };

  const removeCarPhoto = (index: number) => {
      const currentPhotos = editProfile.carPhotos || [];
      setEditProfile({
          ...editProfile,
          carPhotos: currentPhotos.filter((_, i) => i !== index)
      });
  };

  const handleFeaturesChange = (value: string) => {
      setEditProfile({
          ...editProfile,
          features: value.split(',').map(s => s.trim())
      });
  };

  const forceRefresh = () => {
      window.dispatchEvent(new Event('orbitrip-db-change'));
  };

  const isUrgent = (dateStr: string) => {
      const parts = dateStr.split(' ');
      const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      return dateStr === today;
  }

  const getDayClassName = (date: Date) => {
      const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      const hasBooking = activeSchedule.some(b => b.date.includes(dateStr));
      const isBlocked = blockedDates.includes(dateStr);
      
      if (hasBooking) return 'bg-green-500 text-white rounded-full font-bold hover:bg-green-600';
      if (isBlocked) return 'bg-red-400 text-white rounded-full font-bold hover:bg-red-500';
      return 'hover:bg-gray-100';
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 md:flex-row font-sans overflow-hidden">
        
        {/* MOBILE MENU TOGGLE */}
        <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center z-30 shadow-md">
            <div className="flex items-center space-x-2">
                <span className="text-xl">🚖</span>
                <h1 className="font-bold text-lg">OrbiTrip Partner</h1>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                {mobileMenuOpen ? '✖' : '☰'}
            </button>
        </div>

        {/* SIDEBAR */}
        <div className={`fixed inset-y-0 left-0 z-20 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 w-72 flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} pt-16 md:pt-0`}>
            <div className="p-6 border-b border-slate-700">
                <div className="flex items-center space-x-4 mb-6">
                    <img src={currentProfile.photoUrl} className="w-14 h-14 rounded-full border-2 border-green-500 object-cover" alt="Profile" />
                    <div>
                        <h2 className="font-bold text-lg leading-tight truncate w-32">{currentProfile.name}</h2>
                        <div className="text-yellow-400 text-sm flex items-center">
                            <span>★ {currentProfile.rating}</span>
                            <span className="text-slate-500 text-xs ml-1">({currentProfile.reviewCount})</span>
                        </div>
                    </div>
                </div>
                
                {/* Balance Card */}
                <div className="bg-slate-800 rounded-xl p-4 text-center mb-6 border border-slate-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-5 rounded-full -mr-8 -mt-8 transition group-hover:scale-150"></div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Net Earnings</p>
                    <p className="text-3xl font-black text-emerald-400">{earningsAmount.toFixed(0)} ₾</p>
                    <div className="flex justify-center items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-500">Commission: {(commissionRate * 100).toFixed(1)}%</span>
                        {/* Live Indicator */}
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    </div>
                </div>

                <button onClick={() => setIsOnline(!isOnline)} className={`w-full py-3 rounded-xl font-bold flex items-center justify-center transition-all ${isOnline ? 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-red-600 hover:bg-red-500'}`}>
                    <span className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-white animate-pulse' : 'bg-white/50'}`}></span>
                    {isOnline ? 'Online' : 'Offline'}
                </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <button onClick={() => { setActiveTab('WORK'); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center ${activeTab === 'WORK' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800'}`}>
                    <span className="mr-3">📅</span> My Trips
                    {pendingRequests.length > 0 && <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">{pendingRequests.length}</span>}
                </button>
                <button onClick={() => { setActiveTab('MARKET'); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center ${activeTab === 'MARKET' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800'}`}>
                    <span className="mr-3">📡</span> Market Orders
                    {marketBookings.length > 0 && <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">{marketBookings.length}</span>}
                </button>
                <button onClick={() => { setActiveTab('CALENDAR'); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center ${activeTab === 'CALENDAR' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800'}`}>
                    <span className="mr-3">🗓️</span> Calendar
                </button>
                <button onClick={() => { setActiveTab('PROFILE'); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center ${activeTab === 'PROFILE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800'}`}>
                    <span className="mr-3">⚙️</span> Settings
                </button>
            </nav>
            <div className="p-4 border-t border-slate-800">
                <button onClick={onLogout} className="text-slate-400 hover:text-white transition w-full text-left px-4 py-2 text-sm flex items-center">
                    <span className="mr-2">🚪</span> Logout
                </button>
            </div>
        </div>

        {/* OVERLAY FOR MOBILE */}
        {mobileMenuOpen && <div className="fixed inset-0 bg-black/60 z-10 md:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>}

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
            
            {activeTab === 'WORK' && (
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            Current Workflow
                            <span className="ml-3 text-sm font-normal bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">{activeSchedule.length + pendingRequests.length} Active</span>
                        </h2>
                        <button onClick={forceRefresh} className="text-sm bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg transition shadow-sm font-bold flex items-center">
                            <span className="mr-2 text-lg">↻</span> Refresh
                        </button>
                    </div>
                    
                    {/* CRITICAL: Cancelled Job Alert */}
                    {cancelledJobs.length > 0 && (
                        <div className="mb-8 bg-red-50 border-l-8 border-red-500 p-6 rounded-r-xl shadow-sm animate-pulse">
                            <h3 className="text-red-800 font-bold text-lg mb-2 flex items-center">
                                <span className="mr-2 text-2xl">⚠️</span> URGENT: Job Cancelled
                            </h3>
                            <p className="text-red-700 text-sm mb-4">
                                The following jobs were recently cancelled by the user or admin. Do not proceed to pickup.
                            </p>
                            <div className="space-y-3">
                                {cancelledJobs.map(job => (
                                    <div key={job.id} className="bg-white p-3 rounded-lg border border-red-200 flex justify-between items-center opacity-80">
                                        <div>
                                            <div className="font-bold text-gray-800 line-through">{job.tourTitle}</div>
                                            <div className="text-xs text-gray-500">{job.date} • {job.customerName}</div>
                                        </div>
                                        <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">CANCELLED</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pending Requests - HIGHLIGHTED */}
                    {pendingRequests.length > 0 && (
                        <div className="mb-8 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                                <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span>
                                Pending Confirmations ({pendingRequests.length})
                            </h3>
                            {pendingRequests.map(req => (
                                <div key={req.id} className="bg-white p-6 rounded-2xl shadow-lg mb-4 border-l-8 border-amber-400 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-bl-xl">Needs Attention</div>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <h4 className="font-black text-xl text-gray-900">{req.tourTitle}</h4>
                                            <div className="flex items-center text-gray-600 mt-2 text-sm">
                                                <span className="mr-3">📅 {req.date}</span>
                                                <span className="mr-3">👥 {req.guests} Passengers</span>
                                            </div>
                                            <p className="text-indigo-600 font-bold mt-2 text-lg">{req.totalPrice}</p>
                                        </div>
                                        <div className="flex gap-3 w-full md:w-auto">
                                            <button onClick={() => handleStatusChange(req.id, 'CANCELLED')} className="flex-1 md:flex-none text-red-600 font-bold px-6 py-3 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition">Reject</button>
                                            <button onClick={() => handleStatusChange(req.id, 'CONFIRMED')} className="flex-1 md:flex-none bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-emerald-600 hover:shadow-lg transition transform hover:-translate-y-0.5">Confirm</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Active Schedule */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Active Schedule</h3>
                        {activeSchedule.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                                <div className="text-4xl mb-2">🌴</div>
                                <p className="text-gray-500 font-medium">No confirmed trips currently.</p>
                                <button onClick={() => setActiveTab('MARKET')} className="mt-4 text-indigo-600 font-bold hover:underline">Check Market Orders</button>
                            </div>
                        ) : activeSchedule.map(job => (
                            <div key={job.id} className="bg-white p-6 rounded-2xl shadow-sm mb-4 border border-gray-100 hover:border-indigo-200 transition group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-lg group-hover:text-indigo-600 transition">{job.tourTitle}</h4>
                                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                                            <p>👤 {job.customerName}</p>
                                            <p>📞 <a href={`tel:${job.contactInfo.split('/')[0]}`} className="text-indigo-600 hover:underline">{job.contactInfo}</a></p>
                                            <p>📅 {job.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Confirmed</span>
                                        <div className="mt-2 text-xl font-black text-gray-900">{job.totalPrice}</div>
                                        <div className="text-xs text-gray-400">Commission: -{(job.numericPrice * commissionRate).toFixed(0)}₾</div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                                    <button onClick={() => handleStatusChange(job.id, 'COMPLETED')} className="bg-slate-800 text-white px-6 py-2.5 rounded-lg hover:bg-slate-900 transition shadow-lg flex items-center">
                                        <span className="mr-2">🏁</span> Complete Trip
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Other tabs... (Market, Calendar, Profile) - Kept same logic, just rendering them */}
            {activeTab === 'MARKET' && (
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            New Market Orders 
                            {marketBookings.length > 0 && <span className="ml-2 text-sm text-gray-500">({marketBookings.length})</span>}
                        </h2>
                        <button onClick={forceRefresh} className="text-sm bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg transition shadow-sm font-bold flex items-center">
                            <span className="mr-2 text-lg">↻</span> Live
                        </button>
                    </div>
                    
                    {marketBookings.length === 0 ? (
                        <div className="text-center py-32 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                            <div className="text-6xl mb-4 animate-bounce">📡</div>
                            <h3 className="text-xl font-bold text-gray-600">It's quiet...</h3>
                            <p>No new orders on the market right now. Check back later.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {marketBookings.slice(0, 50).map(req => {
                                const netPrice = (req.numericPrice * (1 - commissionRate)).toFixed(0);
                                const isJobUrgent = isUrgent(req.date);
                                const isExcursion = req.tourId && req.tourId !== 'transfer';

                                return (
                                <div key={req.id} className={`bg-white p-5 rounded-2xl shadow-md border hover:shadow-xl transition duration-300 transform hover:-translate-y-1 relative ${isJobUrgent ? 'border-red-200 bg-red-50/10' : isExcursion ? 'border-purple-200' : 'border-indigo-50'}`}>
                                    {isJobUrgent && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl animate-pulse">URGENT</div>}
                                    {isExcursion && !isJobUrgent && <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">EXCURSION</div>}

                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded">NEW</span>
                                                <span className="text-gray-400 text-xs">#{req.id.slice(-4)}</span>
                                            </div>
                                            <h4 className="font-bold text-lg text-gray-900 leading-tight mb-2">{req.tourTitle}</h4>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                <div className="flex items-center bg-gray-50 p-2 rounded"><span className="mr-2 text-lg">🗓️</span> <span className="font-bold">{req.date}</span></div>
                                                <div className="flex items-center bg-gray-50 p-2 rounded"><span className="mr-2 text-lg">👥</span> <span>{req.guests} Pax</span></div>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-500">Request: <strong>{req.vehicle}</strong></div>
                                        </div>
                                        <div className="flex flex-row md:flex-col justify-between items-center md:items-end border-t md:border-t-0 border-gray-100 pt-4 md:pt-0 mt-2 md:mt-0">
                                            <div className="text-left md:text-right">
                                                <div className="text-xs text-gray-400 uppercase font-bold tracking-wide">Net Profit</div>
                                                <div className="text-2xl font-black text-emerald-600">{netPrice} ₾</div>
                                                <div className="text-[10px] text-gray-400 strike-through">Total: {req.totalPrice}</div>
                                            </div>
                                            <button onClick={() => handleTakeJob(req.id)} disabled={processingJobId === req.id} className={`mt-0 md:mt-3 px-6 py-3 rounded-xl font-bold shadow-lg transition flex items-center ${processingJobId === req.id ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                                                {processingJobId === req.id ? '...' : 'Take Job'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )})}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'CALENDAR' && (
                <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
                    <div className="lg:w-1/2">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Work Schedule</h2>
                        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-200">
                            <DatePicker inline selected={selectedDate} onChange={handleDateClick} dayClassName={getDayClassName} calendarClassName="w-full border-none" />
                        </div>
                    </div>
                    <div className="lg:w-1/2">
                        <h2 className="text-xl font-bold mb-6 text-gray-700 flex items-center">Details: <span className="ml-2 text-indigo-600">{selectedDate?.toLocaleDateString('en-GB')}</span></h2>
                        {selectedDateDetails.length > 0 ? (
                            <div className="space-y-4">
                                {selectedDateDetails.map(booking => (
                                    <div key={booking.id} className="bg-white p-5 rounded-xl border-l-4 border-indigo-500 shadow-sm">
                                        <h4 className="font-bold text-gray-900">{booking.tourTitle}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{booking.customerName} • {booking.contactInfo}</p>
                                    </div>
                                ))}
                            </div>
                        ) : <div className="bg-slate-100 rounded-xl p-8 text-center text-gray-500 h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-300">No trips.</div>}
                    </div>
                </div>
            )}

            {activeTab === 'PROFILE' && (
                <div className="max-w-4xl mx-auto pb-12">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Settings</h2>
                    <form onSubmit={handleProfileUpdate} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                        <div className="grid grid-cols-2 gap-5">
                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Name</label><input className="w-full border p-3 rounded-xl" value={editProfile.name || ''} onChange={e => setEditProfile({...editProfile, name: e.target.value})} /></div>
                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Phone</label><input className="w-full border p-3 rounded-xl" value={editProfile.phoneNumber || ''} onChange={e => setEditProfile({...editProfile, phoneNumber: e.target.value})} /></div>
                        </div>
                        <button type="submit" className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold">Update Profile</button>
                    </form>
                </div>
            )}
        </div>
    </div>
  );
};

export default DriverDashboard;