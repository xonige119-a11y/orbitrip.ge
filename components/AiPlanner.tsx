

import React, { useState } from 'react';
import { Language, Driver, Tour, TripSearch, RichRoute } from '../types';
import { planTripWithAi } from '../services/geminiService';
import { GEORGIAN_LOCATIONS } from '../data/locations';

interface AiPlannerProps {
  language: Language;
  userLocation: string;
  drivers: Driver[];
  tours: Tour[];
  onPlanToBook: (search: TripSearch, guests: number, driver: Driver, tour?: Tour) => void;
}

const AiPlanner: React.FC<AiPlannerProps> = ({ language, userLocation, drivers, tours, onPlanToBook }) => {
  const [wishes, setWishes] = useState('');
  const [duration, setDuration] = useState('1 Day');
  const [loading, setLoading] = useState(false);
  const [plannedRoute, setPlannedRoute] = useState<RichRoute | null>(null);
  const [matchedDrivers, setMatchedDrivers] = useState<any[]>([]);
  const [guests, setGuests] = useState(2);

  const isEn = language === Language.EN;

  const getDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  };

  const handlePlan = async () => {
    setLoading(true);
    setPlannedRoute(null);
    setMatchedDrivers([]);

    try {
        const route = await planTripWithAi({
            startPoint: userLocation,
            duration,
            interests: "General",
            wishes,
            knownLocations: GEORGIAN_LOCATIONS.map(l => l.nameEn).join(', ')
        }, language);

        setPlannedRoute(route);

        // --- DRIVER MATCHING LOGIC (UPDATED) ---
        const startStop = route.stops[0];
        const endStop = route.stops[route.stops.length - 1];
        
        // Find existing drivers who match criteria (e.g. status ACTIVE)
        const compatible = drivers.filter(d => d.status === 'ACTIVE');

        const driversWithPrice = compatible.map(d => {
            let approachDist = 0; let returnDist = 0; let approachMinutes = 30;
            const ROAD_FACTOR = 1.4;
            const MIN_HOURLY_RATE = 5;
            const MOUNTAIN_COEFF = 1.2;

            // Case-insensitive lookup
            const dCityCoords = GEORGIAN_LOCATIONS.find(l => l.id.toLowerCase() === (d.city || '').toLowerCase());
            
            // Determine Coordinates
            // Default Coords (Tbilisi) if unknown
            const defLat = 41.7151;
            const defLng = 44.8271;

            const dLat = dCityCoords?.lat || defLat;
            const dLng = dCityCoords?.lng || defLng;
            
            const sLat = startStop.coordinates?.lat || defLat;
            const sLng = startStop.coordinates?.lng || defLng;
            
            const eLat = endStop.coordinates?.lat || defLat;
            const eLng = endStop.coordinates?.lng || defLng;
            
            const routeDistance = route.totalDistance || 100;

            // 1. Approach
            const distToStart = getDist(dLat, dLng, sLat, sLng);
            approachDist = Math.round(distToStart * ROAD_FACTOR);
            approachMinutes = Math.round((approachDist / 50) * 60 + 30); // 50km/h avg + buffer

            // 2. Return
            const distFromEnd = getDist(eLat, eLng, dLat, dLng);
            returnDist = Math.round(distFromEnd * ROAD_FACTOR);

            // 3. Total Calculation
            const totalDrivenKm = approachDist + routeDistance + returnDist;
            
            // Time Cost
            const totalHours = Math.ceil(totalDrivenKm / 50); // Avg speed 50km/h
            const timeCost = totalHours * MIN_HOURLY_RATE;

            // Mountain Factor (Check if any stop is mountainous)
            let complexity = 1.0;
            const isMountainRoute = route.stops.some(s => {
                const loc = GEORGIAN_LOCATIONS.find(l => l.nameEn === s.name || l.nameRu === s.name);
                return loc?.isMountainous;
            });
            if (isMountainRoute) complexity = MOUNTAIN_COEFF;

            const baseCost = (totalDrivenKm * d.pricePerKm * complexity) + (d.basePrice || 30);
            const finalPrice = Math.ceil(baseCost + timeCost);
            
            let approachTimeStr = approachMinutes > 60 ? `${Math.floor(approachMinutes/60)}h` : `${approachMinutes} min`;

            return { ...d, calculatedPrice: finalPrice, approachTime: approachTimeStr };
        }).sort((a, b) => a.calculatedPrice - b.calculatedPrice).slice(0, 3);

        setMatchedDrivers(driversWithPrice);

    } catch (e) {
        console.error(e);
        alert(isEn ? "AI Planning Failed" : "Ошибка AI");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
            <h2 className="text-3xl font-black mb-4">{isEn ? "AI Trip Planner" : "AI Планировщик"}</h2>
            <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-80">{isEn ? "Your Wishes" : "Ваши Пожелания"}</label>
                    <input 
                        type="text" 
                        value={wishes}
                        onChange={(e) => setWishes(e.target.value)}
                        placeholder={isEn ? "e.g. Wine tasting in Kakheti..." : "напр. Винный тур в Кахетию..."}
                        className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none mt-1"
                    />
                </div>
                <div>
                     <label className="text-xs font-bold uppercase tracking-wider opacity-80">{isEn ? "Guests" : "Гостей"}</label>
                     <input 
                        type="number" 
                        value={guests}
                        onChange={(e) => setGuests(parseInt(e.target.value))}
                        className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white focus:outline-none mt-1"
                    />
                </div>
            </div>
            <button 
                onClick={handlePlan}
                disabled={loading}
                className="mt-6 w-full bg-white text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-50 transition"
            >
                {loading ? "Planning..." : (isEn ? "Create Plan" : "Создать Маршрут")}
            </button>
        </div>

        {plannedRoute && (
            <div className="mt-8 space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{plannedRoute.summary}</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                         {plannedRoute.stops.map((stop, i) => (
                             <div key={i} className="flex items-center text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                                 {i > 0 && <span className="mr-2 text-gray-300">➝</span>}
                                 {stop.name}
                             </div>
                         ))}
                    </div>
                    
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{isEn ? "Recommended Drivers" : "Рекомендуемые Водители"}</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                        {matchedDrivers.map(d => (
                            <div key={d.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition bg-white">
                                <div className="flex items-center gap-3 mb-3">
                                    <img src={d.photoUrl} className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                        <div className="font-bold text-sm text-gray-900">{d.name}</div>
                                        <div className="text-xs text-gray-500">{d.carModel}</div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="text-lg font-black text-emerald-600">{d.calculatedPrice} ₾</div>
                                    <button 
                                        onClick={() => {
                                             const search: TripSearch = {
                                                 stops: plannedRoute.stops.map(s => s.name),
                                                 date: new Date().toISOString().split('T')[0],
                                                 totalDistance: plannedRoute.totalDistance
                                             };
                                             // Create a temporary Tour object for the booking flow
                                             const tempTour: Tour = {
                                                 id: `ai-tour-${Date.now()}`,
                                                 titleEn: `AI Trip: ${plannedRoute.stops[0].name} -> ${plannedRoute.stops[plannedRoute.stops.length-1].name}`,
                                                 titleRu: `AI Тур: ${plannedRoute.stops[0].name} -> ${plannedRoute.stops[plannedRoute.stops.length-1].name}`,
                                                 descriptionEn: plannedRoute.summary,
                                                 descriptionRu: plannedRoute.summary,
                                                 price: `From ${d.calculatedPrice} GEL`,
                                                 duration: plannedRoute.totalDuration,
                                                 image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c',
                                                 category: 'AI_UNIQUE',
                                                 rating: 5,
                                                 priceOptions: [],
                                                 routeStops: plannedRoute.stops.map(s => s.name),
                                                 itineraryEn: plannedRoute.stops.map(s => `${s.name}: ${s.description}`),
                                                 itineraryRu: plannedRoute.stops.map(s => `${s.name}: ${s.description}`),
                                                 pricePerPerson: 0,
                                             };
                                             onPlanToBook(search, guests, d, tempTour);
                                        }}
                                        className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-black"
                                    >
                                        {isEn ? "Book" : "Заказать"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AiPlanner;
