
import React, { useState, useEffect } from 'react';
import { Driver, Language } from '../types';
import { db } from '../services/db';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface AdminLoginProps {
  onLogin: (role: 'ADMIN' | 'DRIVER', driverId?: string) => void;
  drivers?: Driver[];
  language: Language;
}

const KNOWN_PROJECT_URL = 'https://fhfkdadxvpmmioikkwex.supabase.co';

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, drivers = [], language }) => {
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'DRIVER'>('DRIVER');
  
  // Admin State
  const [adminPass, setAdminPass] = useState('');
  
  // Driver State
  const [driverEmail, setDriverEmail] = useState('');
  const [driverPass, setDriverPass] = useState('');
  
  const [error, setError] = useState('');
  
  // System Status & Manual Config
  const [dbStatus, setDbStatus] = useState<'LOADING' | 'OK' | 'ERROR'>('LOADING');
  const [showDbConfig, setShowDbConfig] = useState(false);
  const [manualUrl, setManualUrl] = useState(localStorage.getItem('orbitrip_supabase_url') || KNOWN_PROJECT_URL);
  const [manualKey, setManualKey] = useState(localStorage.getItem('orbitrip_supabase_key') || '');

  const isEn = language === Language.EN;

  useEffect(() => {
      // Check if configured properly
      if (isSupabaseConfigured) {
          // Double check connectivity
          db.settings.get().then(() => setDbStatus('OK')).catch(() => setDbStatus('ERROR'));
      } else {
          setDbStatus('ERROR');
      }
  }, []);

  const getAdminSecret = () => {
      let secret = '';
      try {
          // @ts-ignore
          if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ADMIN_PASSWORD) {
              // @ts-ignore
              secret = import.meta.env.VITE_ADMIN_PASSWORD;
          }
          // @ts-ignore
          if (!secret && typeof process !== 'undefined' && process.env && process.env.VITE_ADMIN_PASSWORD) {
              // @ts-ignore
              secret = process.env.VITE_ADMIN_PASSWORD;
          }
      } catch (e) {
          console.warn("Env access error", e);
      }
      return secret;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (activeTab === 'ADMIN') {
        const secret = getAdminSecret();
        
        // Allow login if env secret matches OR if hardcoded fallback matches (for recovery) OR 'demo' for preview
        if ((secret && adminPass === secret) || adminPass === 'admin123_recovery' || adminPass === 'demo') {
            onLogin('ADMIN');
        } else {
            setError(isEn ? 'Incorrect Master Password' : 'Неверный Мастер-Пароль');
        }
    } 
    else {
        // Driver Login Logic
        const driver = drivers.find(d => d.email.toLowerCase() === driverEmail.toLowerCase().trim());
        
        if (driver) {
            if (driver.password === driverPass) {
                onLogin('DRIVER', driver.id);
            } else {
                setError(isEn ? 'Incorrect password' : 'Неверный пароль');
            }
        } else {
            setError(isEn ? 'Driver account not found' : 'Аккаунт водителя не найден');
        }
    }
  };

  const handleSaveDbConfig = () => {
      if (!manualUrl.startsWith('https://') || manualKey.length < 20) {
          alert(isEn ? "Invalid URL or Key format." : "Неверный формат URL или Ключа.");
          return;
      }
      localStorage.setItem('orbitrip_supabase_url', manualUrl.trim());
      localStorage.setItem('orbitrip_supabase_key', manualKey.trim());
      alert(isEn ? "Settings Saved. Reloading..." : "Настройки сохранены. Перезагрузка...");
      window.location.reload();
  };

  const handleClearDbConfig = () => {
      localStorage.removeItem('orbitrip_supabase_url');
      localStorage.removeItem('orbitrip_supabase_key');
      window.location.reload();
  };

  const handleDemoFill = () => {
      // Find a mock driver or default one
      const mockDriver = drivers.find(d => d.email.includes('orbitrip')) || drivers[0];
      
      if (mockDriver) {
        setDriverEmail(mockDriver.email);
        setDriverPass(mockDriver.password || 'start');
      } else {
        // Fallback if no drivers loaded yet
        setDriverEmail('giorgi@orbitrip.ge');
        setDriverPass('start');
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
        
        {/* Connection Status Badge */}
        <div className="absolute top-4 right-4 flex items-center bg-gray-50 px-2 py-1 rounded-full border border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => setShowDbConfig(!showDbConfig)}>
            <div className={`w-2 h-2 rounded-full mr-2 ${dbStatus === 'OK' ? 'bg-green-500 animate-pulse' : dbStatus === 'ERROR' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
            <span className="text-[10px] text-gray-500 font-bold uppercase">
                {dbStatus === 'OK' ? (isEn ? 'System Online' : 'Система Онлайн') : (isEn ? 'Offline Mode' : 'Оффлайн Режим')}
            </span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
            <button 
                onClick={() => { setActiveTab('DRIVER'); setError(''); }}
                className={`flex-1 py-5 text-sm font-bold text-center transition ${activeTab === 'DRIVER' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            >
                🚖 {isEn ? "Driver Login" : "Вход Водителя"}
            </button>
            <button 
                onClick={() => { setActiveTab('ADMIN'); setError(''); }}
                className={`flex-1 py-5 text-sm font-bold text-center transition ${activeTab === 'ADMIN' ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            >
                🛡️ {isEn ? "Admin / HQ" : "Админ / Штаб"}
            </button>
        </div>

        {showDbConfig ? (
            <div className="p-8 bg-slate-50">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-extrabold text-gray-900">{isEn ? "Database Configuration" : "Настройка Базы Данных"}</h2>
                    <p className="text-xs text-gray-500 mt-1">{isEn ? "Manually connect to Supabase if .env is missing." : "Ручное подключение к Supabase, если .env отсутствует."}</p>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{isEn ? "Project URL" : "URL Проекта"}</label>
                        <input className="w-full border p-3 rounded-xl text-sm" placeholder="https://xyz.supabase.co" value={manualUrl} onChange={e => setManualUrl(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">{isEn ? "Anon API Key" : "Anon API Ключ"}</label>
                        <input className="w-full border p-3 rounded-xl text-sm" type="password" placeholder="eyJh..." value={manualKey} onChange={e => setManualKey(e.target.value)} />
                    </div>
                    <button onClick={handleSaveDbConfig} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition">{isEn ? "Save & Connect" : "Сохранить и Подключить"}</button>
                    <button onClick={handleClearDbConfig} className="w-full text-red-500 text-xs font-bold hover:underline">{isEn ? "Clear Saved Config" : "Очистить Конфигурацию"}</button>
                    <button onClick={() => setShowDbConfig(false)} className="w-full text-gray-400 text-xs mt-2 hover:text-gray-600">{isEn ? "Cancel" : "Отмена"}</button>
                </div>
            </div>
        ) : (
            <div className="p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-extrabold text-gray-900">
                        {activeTab === 'DRIVER' ? (isEn ? 'Driver Workspace' : 'Кабинет Водителя') : (isEn ? 'System Control' : 'Управление Системой')}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        {activeTab === 'DRIVER' ? (isEn ? 'Access your orders and calendar' : 'Доступ к заказам и календарю') : (isEn ? 'Manage platform settings' : 'Управление настройками платформы')}
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                
                {activeTab === 'ADMIN' ? (
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">{isEn ? "Master Key" : "Мастер-Ключ"}</label>
                        <input
                            type="password"
                            required
                            className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder={isEn ? "Enter password..." : "Введите пароль..."}
                            value={adminPass}
                            onChange={(e) => setAdminPass(e.target.value)}
                            autoComplete="off"
                            name="admin_password_new"
                        />
                    </div>
                ) : (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">{isEn ? "Email Address" : "Email Адрес"}</label>
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
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">{isEn ? "Password" : "Пароль"}</label>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                placeholder="••••••"
                                value={driverPass}
                                onChange={(e) => setDriverPass(e.target.value)}
                            />
                            <div className="text-right mt-1">
                                <a href="#" onClick={(e) => { e.preventDefault(); alert(isEn ? 'Please contact Admin Support: +995 593 456 876 or support@orbitrip.ge' : 'Пожалуйста, свяжитесь с поддержкой: +995 593 456 876 или support@orbitrip.ge'); }} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">{isEn ? "Forgot Password?" : "Забыли пароль?"}</a>
                            </div>
                        </div>
                    </>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl p-3 text-center font-bold">
                    {error}
                    </div>
                )}

                {dbStatus === 'ERROR' && !showDbConfig && activeTab === 'ADMIN' && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-3 text-center">
                        <p className="font-bold mb-1">⚠️ {isEn ? "Database Disconnected" : "База Данных Отключена"}</p>
                        <p>{isEn ? "To view demo interface, enter password:" : "Для просмотра демо интерфейса введите:"} <strong>demo</strong></p>
                    </div>
                )}

                <button
                    type="submit"
                    className={`group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white shadow-lg transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${activeTab === 'DRIVER' ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' : 'bg-gray-800 hover:bg-gray-900 focus:ring-gray-500'}`}
                >
                    {activeTab === 'DRIVER' ? (isEn ? 'Access Dashboard' : 'Войти в Кабинет') : (isEn ? 'Unlock System' : 'Разблокировать')}
                </button>
                
                <div className="mt-8 text-center pt-6 border-t border-gray-100">
                    {activeTab === 'DRIVER' ? (
                        <div className="space-y-2">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">{isEn ? "Demo Credentials" : "Демо Доступ"}</p>
                            <div className="bg-gray-50 rounded-lg p-2 inline-block text-xs text-gray-500 font-mono">
                                User: <span className="text-indigo-600 font-bold">giorgi@orbitrip.ge</span> | Pass: <span className="text-indigo-600 font-bold">start</span>
                            </div>
                            <button type="button" onClick={handleDemoFill} className="block w-full text-xs text-indigo-500 font-bold hover:underline">
                                ⚡ {isEn ? "Auto-Fill Demo" : "Авто-заполнение Демо"}
                            </button>
                        </div>
                    ) : (
                        <div className="text-xs text-gray-400 italic">
                            {isEn ? "Restricted Access. Authorized Personnel Only." : "Ограниченный доступ. Только для персонала."}
                        </div>
                    )}
                </div>

                </form>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
