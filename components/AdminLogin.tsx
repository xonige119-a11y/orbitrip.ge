import React, { useState, useEffect } from 'react';
import { Driver } from '../types';
import { db } from '../services/db';

interface AdminLoginProps {
  onLogin: (role: 'ADMIN' | 'DRIVER', driverId?: string) => void;
  drivers?: Driver[];
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, drivers = [] }) => {
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'DRIVER'>('DRIVER');
  
  // Admin State - Start empty!
  const [adminPass, setAdminPass] = useState('');
  
  // Driver State
  const [driverEmail, setDriverEmail] = useState('');
  const [driverPass, setDriverPass] = useState('');
  
  const [error, setError] = useState('');
  
  // System Status
  const [dbStatus, setDbStatus] = useState<'LOADING' | 'OK' | 'ERROR'>('LOADING');

  useEffect(() => {
      // Simple ping to check if DB is reachable (try fetching settings)
      const checkDb = async () => {
          try {
              await db.settings.get();
              setDbStatus('OK');
          } catch (e) {
              setDbStatus('ERROR');
          }
      };
      checkDb();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (activeTab === 'ADMIN') {
        // Secure check via Env Variable (defined in vite.config.ts)
        const secret = process.env.VITE_ADMIN_PASSWORD;
        if (adminPass === secret) {
            onLogin('ADMIN');
        } else {
            setError('Incorrect Master Password');
        }
    } 
    else {
        // Driver Login Logic (Verified against DB)
        const driver = drivers.find(d => d.email.toLowerCase() === driverEmail.toLowerCase().trim());
        
        if (driver) {
            // Check password (simple check, in prod use bcrypt)
            if (driver.password === driverPass) {
                onLogin('DRIVER', driver.id);
            } else {
                setError('Incorrect password');
            }
        } else {
            setError('Driver account not found');
        }
    }
  };

  const handleDemoFill = () => {
      setDriverEmail('dato@orbitrip.ge');
      setDriverPass('start');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
        
        {/* Connection Status Badge */}
        <div className="absolute top-4 right-4 flex items-center bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
            <div className={`w-2 h-2 rounded-full mr-2 ${dbStatus === 'OK' ? 'bg-green-500 animate-pulse' : dbStatus === 'ERROR' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
            <span className="text-[10px] text-gray-500 font-bold uppercase">
                {dbStatus === 'OK' ? 'System Online' : dbStatus === 'ERROR' ? 'DB Error' : 'Connecting...'}
            </span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
            <button 
                onClick={() => { setActiveTab('DRIVER'); setError(''); }}
                className={`flex-1 py-5 text-sm font-bold text-center transition ${activeTab === 'DRIVER' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            >
                🚖 Driver Login
            </button>
            <button 
                onClick={() => { setActiveTab('ADMIN'); setError(''); }}
                className={`flex-1 py-5 text-sm font-bold text-center transition ${activeTab === 'ADMIN' ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            >
                🛡️ Admin / HQ
            </button>
        </div>

        <div className="p-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-extrabold text-gray-900">
                    {activeTab === 'DRIVER' ? 'Driver Workspace' : 'System Control'}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                    {activeTab === 'DRIVER' ? 'Access your orders and calendar' : 'Manage platform settings'}
                </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
            
            {activeTab === 'ADMIN' ? (
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Master Key</label>
                    <input
                        type="password"
                        required
                        className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Enter password..."
                        value={adminPass}
                        onChange={(e) => setAdminPass(e.target.value)}
                        autoComplete="off"
                        name="admin_password_new"
                    />
                </div>
            ) : (
                <>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="name@orbitrip.ge"
                            value={driverEmail}
                            onChange={(e) => setDriverEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="••••••"
                            value={driverPass}
                            onChange={(e) => setDriverPass(e.target.value)}
                        />
                        <div className="text-right mt-1">
                            <a href="#" onClick={(e) => { e.preventDefault(); alert('Please contact Admin Support: +995 593 456 876'); }} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Forgot Password?</a>
                        </div>
                    </div>
                </>
            )}

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl p-3 text-center font-bold">
                {error}
                </div>
            )}

            <button
                type="submit"
                className={`group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white shadow-lg transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${activeTab === 'DRIVER' ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' : 'bg-gray-800 hover:bg-gray-900 focus:ring-gray-500'}`}
            >
                {activeTab === 'DRIVER' ? 'Access Dashboard' : 'Unlock System'}
            </button>
            
            <div className="mt-8 text-center pt-6 border-t border-gray-100">
                {activeTab === 'DRIVER' ? (
                    <div className="space-y-2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Demo Credentials</p>
                        <div className="bg-gray-50 rounded-lg p-2 inline-block text-xs text-gray-500 font-mono">
                            User: <span className="text-indigo-600 font-bold">dato@orbitrip.ge</span> | Pass: <span className="text-indigo-600 font-bold">start</span>
                        </div>
                        <button type="button" onClick={handleDemoFill} className="block w-full text-xs text-indigo-500 font-bold hover:underline">
                            ⚡ Auto-Fill Demo
                        </button>
                    </div>
                ) : (
                    <div className="text-xs text-gray-400 italic">
                        Restricted Access. Authorized Personnel Only.
                    </div>
                )}
            </div>

            </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;