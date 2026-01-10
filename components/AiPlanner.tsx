import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Language, TripSearch } from '../types';
import { sendChatMessage } from '../services/geminiService';
import { GEORGIAN_LOCATIONS } from '../data/locations';

interface AiPlannerProps {
  language: Language;
  onPlanToBook?: (search: TripSearch) => void;
}

interface ParsedRoute {
    stops: string[];
    totalDistance: number;
    duration: string;
    reasoning?: string;
}

const INTERESTS = [
    { id: 'wine', labelEn: '🍷 Wine & Gastronomy', labelRu: '🍷 Вино и Кухня' },
    { id: 'history', labelEn: '🏰 Ancient History', labelRu: '🏰 Древняя История' },
    { id: 'mountains', labelEn: '🏔️ High Mountains', labelRu: '🏔️ Высокие Горы' },
    { id: 'nature', labelEn: '🌿 Green Nature', labelRu: '🌿 Природа и Леса' },
    { id: 'canyons', labelEn: '🌊 Canyons & Waterfalls', labelRu: '🌊 Каньоны и Водопады' },
    { id: 'abandoned', labelEn: '👻 Urbex / Soviet Past', labelRu: '👻 Советское Наследие' },
    { id: 'photo', labelEn: '📸 Instagram Spots', labelRu: '📸 Инста-места' },
    { id: 'relax', labelEn: '🧖 Relax & Spa', labelRu: '🧖 Релакс и Спа' },
];

const START_HUBS = [
    { id: 'kutaisi', labelEn: 'Kutaisi', labelRu: 'Кутаиси' },
    { id: 'tbilisi', labelEn: 'Tbilisi', labelRu: 'Тбилиси' },
    { id: 'batumi', labelEn: 'Batumi', labelRu: 'Батуми' }
];

const AiPlanner: React.FC<AiPlannerProps> = ({ language, onPlanToBook }) => {
  // State
  const [step, setStep] = useState<'INPUT' | 'LOADING' | 'RESULT'>('INPUT');
  const [startPoint, setStartPoint] = useState('kutaisi');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [duration, setDuration] = useState<string>('1 Day');
  const [customWish, setCustomWish] = useState('');
  
  // Date State - Default to tomorrow to ensure availability
  const [plannerDate, setPlannerDate] = useState<Date>(() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d;
  });
  
  const [resultRoute, setResultRoute] = useState<ParsedRoute | null>(null);
  const [aiError, setAiError] = useState('');

  const toggleInterest = (id: string) => {
      setSelectedInterests(prev => 
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
  };

  const parseResponse = (responseText: string): { routeData?: ParsedRoute } => {
      const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
      const match = responseText.match(jsonRegex) || responseText.match(/({[\s\S]*})/);

      if (match && match[1]) {
          try {
              const routeData = JSON.parse(match[1]);
              if (routeData.stops && Array.isArray(routeData.stops)) {
                  return { routeData };
              }
          } catch (e) {
              console.error("Failed to parse route JSON", e);
          }
      }
      return {};
  };

  // ROBUST FALLBACK MECHANISM
  const useFallbackRoute = () => {
        // Mock route generator based on start point
        const fallbackRoutes: Record<string, ParsedRoute> = {
            'kutaisi': {
                stops: ['Kutaisi', 'Prometheus Cave', 'Martvili Canyon', 'Kutaisi'],
                totalDistance: 130,
                duration: '6 Hours',
                reasoning: language === Language.EN ? "A perfect nature day trip visiting the most famous canyons and caves near Kutaisi." : "Идеальный природный тур по знаменитым каньонам и пещерам рядом с Кутаиси."
            },
            'tbilisi': {
                stops: ['Tbilisi', 'Ananuri', 'Gudauri', 'Kazbegi', 'Tbilisi'],
                totalDistance: 320,
                duration: '9 Hours',
                reasoning: language === Language.EN ? "The legendary Georgian Military Highway route with mountain views." : "Легендарная Военно-Грузинская дорога с горными видами."
            },
            'batumi': {
                stops: ['Batumi', 'Makhuntseti Waterfall', 'Gonio Fortress', 'Batumi'],
                totalDistance: 80,
                duration: '5 Hours',
                reasoning: language === Language.EN ? "A relaxing mix of Adjarian nature and ancient history." : "Расслабляющий микс аджарской природы и древней истории."
            }
        };

        const fallback = fallbackRoutes[startPoint] || fallbackRoutes['kutaisi'];
        
        // Show user a 'loading popular route' message instead of an error
        setAiError(language === Language.EN ? "AI is busy, loading best route..." : "AI занят, загружаем лучший маршрут...");
        
        // Delay slightly to simulate processing
        setTimeout(() => {
            setResultRoute(fallback);
            setStep('RESULT');
            setAiError('');
        }, 1200);
  };

  const handleGenerate = async () => {
    if (selectedInterests.length === 0 && !customWish) {
        setAiError(language === Language.EN ? "Please select at least one interest." : "Выберите хотя бы один интерес.");
        return;
    }
    setAiError('');
    setStep('LOADING');
    
    try {
        // Construct Prompt
        const interestsLabels = selectedInterests.map(id => {
            const item = INTERESTS.find(i => i.id === id);
            return language === Language.EN ? item?.labelEn : item?.labelRu;
        }).join(', ');

        const knownLocations = GEORGIAN_LOCATIONS.map(l => language === Language.EN ? l.nameEn : l.nameRu).slice(0, 30).join(', ');

        const prompt = `
          Act as "OrbiTrip Planner". User wants a PRIVATE DRIVER trip in Georgia.
          PARAMETERS: Start: ${startPoint}, Duration: ${duration}, Interests: ${interestsLabels}, Wishes: ${customWish || "None"}
          CONSTRAINTS: Use known locations: ${knownLocations}. Return STRICT JSON.
          JSON TEMPLATE:
          {
            "stops": ["Start City", "Stop 1", "Stop 2", "End City"],
            "totalDistance": 120,
            "duration": "5-6 Hours",
            "reasoning": "Short description in ${language === Language.EN ? 'English' : 'Russian'}"
          }
        `;

        // Attempt API Call with timeout safety
        const history = []; 
        
        // Set a hard timeout for the API call to avoid hanging
        const apiPromise = sendChatMessage(history, prompt, language === Language.EN ? 'EN' : 'RU');
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000));

        const rawResponse = await Promise.race([apiPromise, timeoutPromise]) as string;
        const { routeData } = parseResponse(rawResponse || "");

        if (routeData) {
            setResultRoute(routeData);
            setStep('RESULT');
        } else {
            console.warn("AI returned invalid JSON, switching to fallback.");
            useFallbackRoute();
        }

    } catch (e) {
        console.error("AI Connection Error:", e);
        // CRITICAL: Always use fallback on error, never show "Connection error" to user
        useFallbackRoute();
    }
  };

  const handleBook = () => {
      if (resultRoute && onPlanToBook) {
          const dateStr = plannerDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
          onPlanToBook({
              stops: resultRoute.stops,
              date: dateStr,
              totalDistance: resultRoute.totalDistance
          });
      }
  };

  const reset = () => {
      setStep('INPUT');
      setResultRoute(null);
      setAiError('');
  };

  const estimatePrice = (km: number) => {
      const min = Math.round(km * 1.1 + 40);
      const max = Math.round(km * 1.5 + 60);
      return `${min} - ${max} GEL`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans">
        
        {/* Main Card Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[550px] flex flex-col md:flex-row relative">
            
            {/* Left Side: Concierge Visual */}
            <div className="w-full md:w-1/3 bg-indigo-900 text-white p-8 flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20 text-2xl">
                            🤖
                        </div>
                        <div>
                            <h2 className="text-xl font-bold leading-none">OrbiTrip</h2>
                            <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Smart Planner</p>
                        </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 leading-tight">
                        {language === Language.EN 
                         ? "Let's build your perfect Georgian journey." 
                         : "Давайте создадим ваше идеальное путешествие."}
                    </h3>
                    <p className="text-indigo-200 text-sm leading-relaxed opacity-80">
                        {language === Language.EN 
                         ? "Tell me what you love, and I'll find the best route, driver, and price instantly."
                         : "Расскажите, что вы любите, и я мгновенно подберу лучший маршрут, водителя и цену."}
                    </p>
                </div>

                <div className="relative z-10 space-y-3 mt-8">
                    <div className="flex items-center space-x-3 text-xs font-medium text-indigo-100 bg-indigo-800/50 p-2 rounded-lg">
                        <span>🛡️</span>
                        <span>{language === Language.EN ? "Verified Drivers" : "Проверенные водители"}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs font-medium text-indigo-100 bg-indigo-800/50 p-2 rounded-lg">
                        <span>⏸️</span>
                        <span>{language === Language.EN ? "Stop anywhere for free" : "Остановки бесплатно"}</span>
                    </div>
                </div>

                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-[-20px] left-[-20px] w-40 h-40 bg-purple-600 rounded-full blur-3xl opacity-30"></div>
            </div>

            {/* Right Side: Interactive Area */}
            <div className="flex-1 bg-white p-6 md:p-10 relative">
                
                {/* --- INPUT STEP --- */}
                {step === 'INPUT' && (
                    <div className="space-y-8 animate-fadeIn h-full flex flex-col">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                    {language === Language.EN ? "Start From" : "Откуда начинаем?"}
                                </label>
                                <div className="flex bg-gray-50 p-1 rounded-xl">
                                    {START_HUBS.map(hub => (
                                        <button
                                            key={hub.id}
                                            onClick={() => setStartPoint(hub.id)}
                                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${startPoint === hub.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            {language === Language.EN ? hub.labelEn : hub.labelRu}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                    {language === Language.EN ? "Date & Duration" : "Дата и Длительность"}
                                </label>
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <DatePicker 
                                            selected={plannerDate} 
                                            onChange={(date: Date) => setPlannerDate(date)} 
                                            dateFormat="dd/MM/yyyy" 
                                            className="w-full bg-gray-50 border-none rounded-xl py-2.5 px-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                            minDate={new Date()}
                                        />
                                    </div>
                                    <select 
                                        value={duration} 
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="flex-1 bg-gray-50 border-none rounded-xl py-2.5 px-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="1 Day">1 Day</option>
                                        <option value="One Way">Transfer</option>
                                        <option value="2 Days">2 Days</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-3">
                                {language === Language.EN ? "What interests you? (Select multiple)" : "Что вас интересует? (Можно несколько)"}
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {INTERESTS.map(interest => (
                                    <button
                                        key={interest.id}
                                        onClick={() => toggleInterest(interest.id)}
                                        className={`p-3 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between h-20 ${
                                            selectedInterests.includes(interest.id)
                                            ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500'
                                            : 'bg-white border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="text-xl">{interest.labelEn.split(' ')[0]}</span>
                                        <span className={`text-[10px] font-bold leading-tight ${selectedInterests.includes(interest.id) ? 'text-indigo-700' : 'text-gray-600'}`}>
                                            {language === Language.EN ? interest.labelEn.substring(2) : interest.labelRu.substring(2)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                {language === Language.EN ? "Any specific wishes?" : "Особые пожелания?"}
                            </label>
                            <textarea
                                value={customWish}
                                onChange={(e) => setCustomWish(e.target.value)}
                                placeholder={language === Language.EN ? "e.g. I want to try best Khinkali, avoid crowded places..." : "например: хочу лучшие хинкали, избегать толпы..."}
                                className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 resize-none h-24"
                            />
                        </div>

                        {aiError && <p className="text-amber-500 text-sm font-bold text-center animate-pulse">{aiError}</p>}

                        <button
                            onClick={handleGenerate}
                            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black py-4 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center text-lg"
                        >
                            <span className="mr-2">✨</span> {language === Language.EN ? "Plan My Trip" : "Спланировать"}
                        </button>
                    </div>
                )}

                {/* --- LOADING STEP --- */}
                {step === 'LOADING' && (
                    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-fadeIn">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-indigo-100 rounded-full animate-pulse"></div>
                            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-2xl">🚗</div>
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-gray-900">
                                {language === Language.EN ? "Building your route..." : "Строим маршрут..."}
                            </h3>
                            <div className="text-sm text-gray-500 flex flex-col items-center gap-1">
                                <span className="animate-pulse">✓ {language === Language.EN ? "Checking distances" : "Проверяем дистанции"}</span>
                                <span className="animate-pulse delay-75">✓ {language === Language.EN ? "Matching drivers" : "Ищем водителей"}</span>
                                <span className="animate-pulse delay-150">✓ {language === Language.EN ? "Optimizing stops" : "Оптимизируем остановки"}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- RESULT STEP --- */}
                {step === 'RESULT' && resultRoute && (
                    <div className="h-full flex flex-col animate-fadeIn">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded">
                                    {language === Language.EN ? "Your Custom Plan" : "Ваш План"}
                                </span>
                                <h3 className="text-2xl font-black text-gray-900 mt-2">
                                    {resultRoute.stops[0]} <span className="text-gray-300">➜</span> {resultRoute.stops[resultRoute.stops.length-1]}
                                </h3>
                            </div>
                            <button onClick={reset} className="text-gray-400 hover:text-indigo-600 transition">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-2xl border border-indigo-100 mb-6 flex-1 overflow-y-auto custom-scrollbar">
                            <div className="flex items-start space-x-4 mb-6">
                                <div className="text-3xl">💡</div>
                                <p className="text-sm text-gray-700 leading-relaxed italic">
                                    "{resultRoute.reasoning}"
                                </p>
                            </div>

                            {/* Timeline Visual */}
                            <div className="relative pl-4 space-y-6 border-l-2 border-dashed border-indigo-200 ml-2">
                                {resultRoute.stops.map((stop, i) => (
                                    <div key={i} className="relative group">
                                        <div className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                                            i === 0 ? 'bg-green-500' : 
                                            i === resultRoute.stops.length - 1 ? 'bg-indigo-600' : 'bg-white border-indigo-300'
                                        }`}></div>
                                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group-hover:border-indigo-200 transition">
                                            <span className="font-bold text-gray-800 text-sm">{stop}</span>
                                            {i > 0 && i < resultRoute.stops.length - 1 && (
                                                <span className="text-[10px] font-bold text-indigo-400 uppercase bg-indigo-50 px-2 py-0.5 rounded">Stop</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Estimated Info Bar */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-gray-500 uppercase">{language === Language.EN ? "Est. Price" : "Прим. Цена"}</span>
                                <span className="text-xl font-black text-indigo-600">{estimatePrice(resultRoute.totalDistance)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 uppercase">{language === Language.EN ? "Availability" : "Доступность"}</span>
                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                    {language === Language.EN ? "Drivers Ready" : "Водители готовы"}
                                </span>
                            </div>
                        </div>

                        <button 
                            onClick={handleBook}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center group"
                        >
                            <span>{language === Language.EN ? "Select Driver for this Route" : "Выбрать водителя для маршрута"}</span>
                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                        <p className="text-center text-[10px] text-gray-400 mt-3">
                            {language === Language.EN ? "Free cancellation • Pay cash to driver" : "Бесплатная отмена • Оплата водителю"}
                        </p>
                    </div>
                )}

            </div>
        </div>
    </div>
  );
};

export default AiPlanner;