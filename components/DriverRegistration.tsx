
import React, { useState } from 'react';
import { Driver, VehicleType, DriverDocument, Language } from '../types';
import { storageService } from '../services/storage';
import { db } from '../services/db';

interface DriverRegistrationProps {
  language: Language;
  onRegister: (driver: Driver) => void; // Kept for interface compatibility, but logic moved internal
  onBack: () => void;
}

const DriverRegistration: React.FC<DriverRegistrationProps> = ({ language, onRegister, onBack }) => {
  const [step, setStep] = useState<'RULES' | 'FORM' | 'SUCCESS'>('RULES');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Driver>>({
    name: '',
    email: '',
    password: '',
    phoneNumber: '+995',
    city: 'tbilisi',
    carModel: '',
    vehicleType: 'Sedan',
    pricePerKm: 1.0,
    basePrice: 30,
    maxPassengers: 4,
    languages: ['EN'],
    features: [],
  });

  const isEn = language === Language.EN;

  // File States
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [carFrontFile, setCarFrontFile] = useState<File | null>(null);
  const [carBackFile, setCarBackFile] = useState<File | null>(null);
  const [carSideFile, setCarSideFile] = useState<File | null>(null);
  const [carInteriorFile, setCarInteriorFile] = useState<File | null>(null);

  // Mandatory Documents
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [techFile, setTechFile] = useState<File | null>(null);
  const [policeFile, setPoliceFile] = useState<File | null>(null);

  const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    // 1. Validation
    if (!carFrontFile || !carBackFile || !carSideFile || !carInteriorFile) {
        setErrorMsg(isEn 
            ? "⚠️ All 4 car photos are required (Front, Back, Side, Interior)." 
            : "⚠️ Требуются все 4 фото автомобиля (Спереди, Сзади, Сбоку, Салон)."
        );
        scrollToTop();
        return;
    }

    if (!avatarFile || !licenseFile || !techFile) {
        setErrorMsg(isEn 
            ? "⚠️ Please upload your photo, license and tech passport." 
            : "⚠️ Пожалуйста, загрузите ваше фото, права и техпаспорт."
        );
        scrollToTop();
        return;
    }

    if (!formData.name || !formData.phoneNumber || !formData.carModel) {
        setErrorMsg(isEn ? "⚠️ Please fill in all text fields." : "⚠️ Заполните все текстовые поля.");
        scrollToTop();
        return;
    }

    setLoading(true);

    try {
        const tempId = `drv-${Date.now()}`;
        console.log("Starting registration for:", tempId);
        
        // 2. Upload Images Sequentially
        const uploadedAvatar = await storageService.uploadDriverImage(avatarFile, tempId, 'avatar');
        
        const urlFront = await storageService.uploadDriverImage(carFrontFile, tempId, 'car_front');
        const urlBack = await storageService.uploadDriverImage(carBackFile, tempId, 'car_back');
        const urlSide = await storageService.uploadDriverImage(carSideFile, tempId, 'car_side');
        const urlInterior = await storageService.uploadDriverImage(carInteriorFile, tempId, 'car_interior');

        const documents: DriverDocument[] = [];
        
        const licUrl = await storageService.uploadDocument(licenseFile, tempId);
        if (licUrl) documents.push({ type: 'LICENSE', url: licUrl, uploadedAt: Date.now() });
        
        const techUrl = await storageService.uploadDocument(techFile, tempId);
        if (techUrl) documents.push({ type: 'TECH_PASSPORT', url: techUrl, uploadedAt: Date.now() });
        
        if (policeFile) {
            const polUrl = await storageService.uploadDocument(policeFile, tempId);
            if (polUrl) documents.push({ type: 'POLICE_CLEARANCE', url: polUrl, uploadedAt: Date.now() });
        }

        // 3. Construct Final Object
        const newDriver: Driver = {
            id: tempId,
            name: formData.name!,
            email: formData.email || `${tempId}@orbitrip.local`,
            password: formData.password || 'temp123',
            phoneNumber: formData.phoneNumber!,
            city: formData.city || 'tbilisi',
            carModel: formData.carModel!,
            vehicleType: formData.vehicleType || 'Sedan',
            pricePerKm: Number(formData.pricePerKm) || 1.2,
            basePrice: Number(formData.basePrice) || 30,
            maxPassengers: Number(formData.maxPassengers) || 4,
            languages: formData.languages || ['EN'],
            features: formData.features || [],
            photoUrl: uploadedAvatar || 'https://via.placeholder.com/150',
            carPhotoUrl: urlFront || 'https://via.placeholder.com/400',
            carPhotos: [urlBack, urlSide, urlInterior].filter((u): u is string => !!u),
            documents: documents,
            status: 'PENDING', 
            rating: 5.0,
            reviewCount: 0,
            reviews: [],
            blockedDates: [],
            debt: 0
        };

        console.log("Submitting driver to DB:", newDriver);
        
        // 4. Send to DB directly to ensure we catch errors here
        await db.drivers.create(newDriver);
        
        // 5. Success
        setStep('SUCCESS');
        scrollToTop();

    } catch (err: any) {
        console.error("Registration Error:", err);
        setErrorMsg(isEn 
            ? `Error: ${err.message || "Unknown error occurred"}` 
            : `Ошибка: ${err.message || "Произошла неизвестная ошибка"}`
        );
        scrollToTop();
    } finally {
        setLoading(false);
    }
  };

  const toggleLanguage = (lang: string) => {
      const current = formData.languages || [];
      const updated = current.includes(lang) 
          ? current.filter(l => l !== lang) 
          : [...current, lang];
      setFormData({ ...formData, languages: updated });
  };

  const toggleFeature = (feat: string) => {
      const current = formData.features || [];
      const updated = current.includes(feat) 
          ? current.filter(f => f !== feat) 
          : [...current, feat];
      setFormData({ ...formData, features: updated });
  };

  if (step === 'SUCCESS') {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl border-t-8 border-emerald-500 animate-fadeIn">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                      ✓
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">
                      {isEn ? "Registration Successful!" : "Регистрация успешна!"}
                  </h2>
                  <p className="text-gray-600 mb-8">
                      {isEn 
                        ? "Your application has been sent for moderation. Admin will review your photos and contact you within 24 hours." 
                        : "Ваша заявка отправлена на модерацию. Администратор проверит фото и свяжется с вами в течение 24 часов."}
                  </p>
                  <button onClick={onBack} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition">
                      {isEn ? "Back to Home" : "На главную"}
                  </button>
              </div>
          </div>
      );
  }

  if (step === 'FORM') {
      return (
          <div className="min-h-screen bg-gray-50 py-12 px-4">
              <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
                  <div className="bg-indigo-600 p-6 text-white flex justify-between items-center sticky top-0 z-10">
                      <h2 className="text-xl font-bold">{isEn ? "Driver Application" : "Анкета Водителя"}</h2>
                      <button onClick={() => setStep('RULES')} className="text-sm opacity-80 hover:opacity-100 underline">{isEn ? "Back to Rules" : "Назад к правилам"}</button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-8 space-y-8">
                      
                      {errorMsg && (
                          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start animate-fadeIn">
                              <span className="text-2xl mr-3">⚠️</span>
                              <div>
                                  <h3 className="text-red-800 font-bold">{isEn ? "Error" : "Ошибка"}</h3>
                                  <p className="text-red-700 text-sm">{errorMsg}</p>
                              </div>
                          </div>
                      )}

                      {/* Personal Info */}
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider flex items-center">
                              <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs">1</span> 
                              {isEn ? "Personal Information" : "Личная информация"}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">{isEn ? "Full Name" : "Имя и Фамилия"}</label>
                                  <input required type="text" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Name Surname" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">{isEn ? "Phone" : "Телефон"}</label>
                                  <input required type="tel" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+995 5xx ..." value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">{isEn ? "Email" : "Email"}</label>
                                  <input required type="email" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="mail@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">{isEn ? "Password" : "Пароль (для входа)"}</label>
                                  <input required type="password" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="******" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">{isEn ? "City" : "Город проживания"}</label>
                                  <select className="w-full border p-3 rounded-xl bg-white" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                                      <option value="tbilisi">Tbilisi (Тбилиси)</option>
                                      <option value="kutaisi">Kutaisi (Кутаиси)</option>
                                      <option value="batumi">Batumi (Батуми)</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">{isEn ? "Your Photo (Selfie)" : "Ваше фото (Селфи)"}</label>
                                  <input type="file" accept="image/*" className="w-full border p-2 rounded-xl bg-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" onChange={e => e.target.files && setAvatarFile(e.target.files[0])} required />
                              </div>
                          </div>
                      </div>

                      {/* Car Info */}
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                          <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-wider flex items-center">
                              <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs">2</span>
                              {isEn ? "Vehicle (4 Photos Required)" : "Автомобиль (4 фото обязательно)"}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">{isEn ? "Model & Year" : "Модель и год"}</label>
                                      <input required type="text" className="w-full border p-3 rounded-xl" placeholder="Toyota Prius 2012" value={formData.carModel} onChange={e => setFormData({...formData, carModel: e.target.value})} />
                                  </div>
                                  <div>
                                      <label className="block text-sm font-bold text-gray-700 mb-1">{isEn ? "Category" : "Категория"}</label>
                                      <select className="w-full border p-3 rounded-xl bg-white" value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value as VehicleType})}>
                                          <option value="Sedan">Sedan (Седан)</option>
                                          <option value="Minivan">Minivan (Минивэн)</option>
                                          <option value="SUV">SUV (Внедорожник)</option>
                                          <option value="Bus">Bus (Автобус)</option>
                                      </select>
                                  </div>
                              </div>

                              {/* 4 REQUIRED PHOTOS */}
                              <div className="p-3 bg-white rounded-xl border border-dashed border-indigo-200 hover:bg-indigo-50 transition">
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">1. {isEn ? "Front View" : "Спереди"}</label>
                                  <input type="file" accept="image/*" className="w-full text-sm text-slate-500" onChange={e => e.target.files && setCarFrontFile(e.target.files[0])} required />
                              </div>
                              <div className="p-3 bg-white rounded-xl border border-dashed border-indigo-200 hover:bg-indigo-50 transition">
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">2. {isEn ? "Back View" : "Сзади"}</label>
                                  <input type="file" accept="image/*" className="w-full text-sm text-slate-500" onChange={e => e.target.files && setCarBackFile(e.target.files[0])} required />
                              </div>
                              <div className="p-3 bg-white rounded-xl border border-dashed border-indigo-200 hover:bg-indigo-50 transition">
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">3. {isEn ? "Side View" : "Сбоку"}</label>
                                  <input type="file" accept="image/*" className="w-full text-sm text-slate-500" onChange={e => e.target.files && setCarSideFile(e.target.files[0])} required />
                              </div>
                              <div className="p-3 bg-white rounded-xl border border-dashed border-indigo-200 hover:bg-indigo-50 transition">
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">4. {isEn ? "Interior" : "Салон"}</label>
                                  <input type="file" accept="image/*" className="w-full text-sm text-slate-500" onChange={e => e.target.files && setCarInteriorFile(e.target.files[0])} required />
                              </div>
                          </div>
                      </div>

                      {/* Documents Upload */}
                      <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                          <h3 className="text-sm font-bold text-orange-800 uppercase mb-4 tracking-wider flex items-center">
                              <span className="bg-orange-200 text-orange-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs">3</span>
                              {isEn ? "Required Documents" : "Документы (Конфиденциально)"}
                          </h3>
                          <div className="space-y-4">
                              <div className="border-b border-orange-200 pb-4">
                                  <label className="block text-sm font-bold text-gray-800 mb-1">{isEn ? "Driving License" : "Водительские права"}</label>
                                  <input type="file" accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200" onChange={e => e.target.files && setLicenseFile(e.target.files[0])} required />
                              </div>
                              
                              <div className="border-b border-orange-200 pb-4">
                                  <label className="block text-sm font-bold text-gray-800 mb-1">{isEn ? "Tech Passport" : "Техпаспорт"}</label>
                                  <input type="file" accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200" onChange={e => e.target.files && setTechFile(e.target.files[0])} required />
                              </div>

                              <div>
                                  <label className="block text-sm font-bold text-gray-800 mb-1">{isEn ? "Police Clearance (Optional)" : "Справка о несудимости (Необязательно)"}</label>
                                  <input type="file" accept="image/*,application/pdf" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200" onChange={e => e.target.files && setPoliceFile(e.target.files[0])} />
                              </div>
                          </div>
                      </div>

                      {/* Capabilities */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">{isEn ? "Languages" : "Языки"}</label>
                          <div className="flex gap-2 flex-wrap mb-4">
                              {['EN', 'RU', 'GE', 'DE'].map(lang => (
                                  <button type="button" key={lang} onClick={() => toggleLanguage(lang)} className={`px-4 py-2 rounded-full text-sm font-bold border transition ${formData.languages?.includes(lang) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                                      {lang}
                                  </button>
                              ))}
                          </div>

                          <label className="block text-sm font-bold text-gray-700 mb-2">{isEn ? "Comfort Features" : "Удобства"}</label>
                          <div className="flex gap-2 flex-wrap">
                              {['AC', 'WiFi', 'Water', 'Child Seat', 'Roof Box', 'Non-Smoking'].map(feat => (
                                  <button type="button" key={feat} onClick={() => toggleFeature(feat)} className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${formData.features?.includes(feat) ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-green-300'}`}>
                                      {feat}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div className="pt-4 border-t flex justify-end gap-4 sticky bottom-0 bg-white p-4 z-20 shadow-[0_-5px_10px_rgba(0,0,0,0.05)] rounded-b-2xl -mx-8 -mb-8">
                          <button type="button" onClick={onBack} disabled={loading} className="text-gray-500 font-bold px-4 py-3 hover:text-gray-700">
                              {isEn ? "Cancel" : "Отмена"}
                          </button>
                          <button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition flex items-center transform active:scale-95 disabled:bg-gray-300">
                              {loading ? (isEn ? 'Uploading...' : 'Загрузка...') : (isEn ? 'Submit Application' : 'Отправить заявку')}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      );
  }

  // STEP 1: TERMS AND OBLIGATIONS (RULES)
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
        <div className="relative h-48 bg-slate-900 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-50" alt="Road" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
                <h1 className="text-3xl font-black mb-2">{isEn ? "Partner Agreement" : "Партнерское соглашение"}</h1>
                <p className="opacity-90 font-medium uppercase tracking-widest text-xs">
                    {isEn ? "Please read carefully before registering" : "Пожалуйста, прочтите внимательно"}
                </p>
            </div>
        </div>

        <div className="p-8 md:p-10">
            <div className="prose prose-indigo max-w-none text-gray-700">
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                    <p className="font-bold text-blue-900 text-sm">
                        {isEn 
                         ? "ℹ️ OrbiTrip differs from standard taxi services (Yandex, Bolt). We provide private transfers for tourists."
                         : "ℹ️ OrbiTrip отличается от служб такси (Yandex, Bolt). Мы предоставляем частные трансферы для туристов."}
                    </p>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                    {isEn ? "Obligations & Service Standards" : "Обязательства и Стандарты"}
                </h3>
                
                <ul className="space-y-6 mb-8">
                    <li className="flex items-start">
                        <div className="bg-indigo-100 text-indigo-700 rounded-full p-2 mr-4 mt-1">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <strong className="text-gray-900 block mb-1">{isEn ? "1. Total Fixed Price" : "1. Фиксированная Цена"}</strong> 
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {isEn 
                                 ? "The price shown to the client is FINAL. It includes fuel, driver service, and vehicle usage. You CANNOT ask for extra money for AC, waiting time, or traffic." 
                                 : "Цена, показанная клиенту, ОКОНЧАТЕЛЬНАЯ. Она включает топливо, услуги водителя и авто. НЕЛЬЗЯ просить доплату за кондиционер, ожидание или пробки."}
                            </p>
                        </div>
                    </li>

                    <li className="flex items-start">
                        <div className="bg-indigo-100 text-indigo-700 rounded-full p-2 mr-4 mt-1">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                        </div>
                        <div>
                            <strong className="text-gray-900 block mb-1">{isEn ? "2. Free Stops & Waiting" : "2. Бесплатные остановки и ожидание"}</strong> 
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {isEn 
                                 ? "Tourists can stop ANYWHERE on the route for photos, food, or rest. Waiting time is unlimited and FREE within the day of the trip." 
                                 : "Туристы могут останавливаться ГДЕ УГОДНО на маршруте (фото, еда, отдых). Время ожидания не ограничено и БЕСПЛАТНО в рамках дня поездки."}
                            </p>
                        </div>
                    </li>

                    <li className="flex items-start">
                        <div className="bg-indigo-100 text-indigo-700 rounded-full p-2 mr-4 mt-1">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                        </div>
                        <div>
                            <strong className="text-gray-900 block mb-1">{isEn ? "3. Comfort & Cleanliness" : "3. Чистота и Комфорт"}</strong> 
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {isEn 
                                 ? "Car must be clean (inside/out). Smoking is prohibited unless the guest allows it. AC must be working." 
                                 : "Машина должна быть чистой. Курение запрещено (если гость не разрешил). Кондиционер должен работать."}
                            </p>
                        </div>
                    </li>
                </ul>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg text-sm text-amber-800 mb-8">
                    <strong>{isEn ? "Required for Registration:" : "Для регистрации нужно:"}</strong> 
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>{isEn ? "4 Photos of the car (Front, Back, Side, Interior)" : "4 Фото авто (Спереди, Сзади, Сбоку, Салон)"}</li>
                        <li>{isEn ? "Driving License & Tech Passport" : "Права и Техпаспорт"}</li>
                        <li>{isEn ? "Your Photo (Selfie)" : "Ваше фото (Селфи)"}</li>
                    </ul>
                </div>
            </div>

            <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                <button 
                    onClick={() => setStep('FORM')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center text-lg"
                >
                    {isEn ? "I Agree & Start Registration" : "Согласен, начать регистрацию"}
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
                <button onClick={onBack} className="text-gray-500 font-bold hover:text-gray-800 transition text-sm py-2">
                    {isEn ? "Cancel" : "Отмена"}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DriverRegistration;
