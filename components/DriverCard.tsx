
import React, { useState } from 'react';
import { Driver } from '../types';

interface DriverCardProps {
    driver: Driver;
    price: number;
    usdPrice: number;
    approachTime: string;
    isEn: boolean;
    onProfileClick: (d: Driver, p: number) => void;
    onBookClick: (d: Driver, p: string) => void;
}

// --- HELPER: Get Vehicle Category Label ---
export const getVehicleCategoryLabel = (type: string, isEn: boolean) => {
    switch (type) {
        case 'Sedan': return isEn ? 'Standard' : 'Стандарт';
        case 'Minivan': return isEn ? 'Family / Group' : 'Семейный';
        case 'SUV': return isEn ? 'Off-Road 4x4' : 'Внедорожник';
        case 'Bus': return isEn ? 'Large Group' : 'Для групп';
        default: return isEn ? 'Comfort' : 'Комфорт';
    }
};

const DriverCard: React.FC<DriverCardProps> = ({ driver, price, usdPrice, approachTime, isEn, onProfileClick, onBookClick }) => {
    
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Combine main photo and gallery into one array
    const images = [driver.carPhotoUrl, ...(driver.carPhotos || [])].filter(Boolean);
    const hasMultipleImages = images.length > 1;

    const nextImage = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setCurrentImgIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Touch Handlers for Mobile Swipe
    const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            nextImage();
        } else if (isRightSwipe) {
            prevImage();
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden flex flex-col group relative">
            
            {/* 1. CAR IMAGE SLIDER (Top) */}
            <div 
                className="w-full h-48 md:h-56 relative bg-gray-100 cursor-pointer overflow-hidden border-b border-gray-100"
                onClick={() => onProfileClick(driver, price)}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <img 
                    src={images[currentImgIndex]} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                    alt="Car" 
                />
                
                {/* Vehicle Type Badge */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded z-10">
                    {driver.vehicleType}
                </div>

                {/* Arrows Overlay (Visible on Hover or if Multiple) */}
                {hasMultipleImages && (
                    <>
                        <div 
                            onClick={prevImage}
                            className="absolute inset-y-0 left-0 w-12 flex items-center justify-center bg-gradient-to-r from-black/30 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 md:opacity-0 opacity-100"
                        >
                            <span className="text-3xl font-bold drop-shadow-md">‹</span>
                        </div>
                        <div 
                            onClick={nextImage}
                            className="absolute inset-y-0 right-0 w-12 flex items-center justify-center bg-gradient-to-l from-black/30 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 md:opacity-0 opacity-100"
                        >
                            <span className="text-3xl font-bold drop-shadow-md">›</span>
                        </div>
                        
                        {/* Dots Indicator */}
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                            {images.map((_, idx) => (
                                <div 
                                    key={idx} 
                                    className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${idx === currentImgIndex ? 'bg-white scale-110' : 'bg-white/50'}`} 
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* 2. INFO (Middle) */}
            <div className="p-4 md:p-5 flex flex-col flex-1">
            
                {/* Driver Info Row - CLICKABLE */}
                <div 
                        onClick={() => onProfileClick(driver, price)}
                        className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 -mx-4 md:-mx-5 px-4 md:px-5 transition-colors"
                >
                    <img src={driver.photoUrl} className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border border-gray-200 shadow-sm" alt="Driver" />
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-gray-900 text-lg leading-none hover:text-indigo-600 transition underline decoration-transparent hover:decoration-indigo-600">{driver.name}</h3>
                            <span className="text-[#00c853]">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-gray-800 text-sm">{driver.rating.toFixed(1)}</span>
                            <div className="flex text-yellow-400 text-xs">{'★'.repeat(5)}</div>
                            <span className="text-gray-400 text-xs font-bold ml-1 hover:underline">{driver.reviewCount} {isEn ? "Reviews" : "Отзывов"}</span>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold mt-1 uppercase">
                            <span className="text-green-500">💬</span>
                            {driver.languages.includes('RU') ? 'Русский' : ''} {driver.languages.includes('EN') ? '/ English' : ''}
                        </div>
                    </div>
                </div>

                {/* Car & Features */}
                <div className="space-y-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-green-600 text-lg">🚗</span>
                            <span className="font-bold text-gray-800 text-sm">{driver.carModel}</span>
                        </div>
                        <span className="border border-gray-300 rounded-full px-2 py-0.5 text-[10px] font-bold text-gray-500 uppercase">
                            {getVehicleCategoryLabel(driver.vehicleType, isEn)}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs md:text-sm font-bold text-gray-600">
                        <div className="flex items-center gap-1" title="Passengers">
                            <span className="text-green-500 text-lg">💺</span> {driver.maxPassengers}
                        </div>
                        <div className="flex items-center gap-1" title="Luggage">
                            <span className="text-green-500 text-lg">🎒</span> 4
                        </div>
                        <div className="flex items-center gap-1" title="Fuel Type">
                            <span className="text-green-500 text-lg">⛽</span> {driver.features?.includes('Gas') ? (isEn ? "Gas" : "Газ") : (isEn ? "Petrol" : "Бензин")}
                        </div>
                    </div>

                    {/* Feature Icons */}
                    <div className="flex gap-2 flex-wrap">
                        {['AC', 'WiFi'].map((f, i) => (
                            <div key={i} className="w-7 h-7 rounded-full bg-[#00c853] flex items-center justify-center text-white text-xs" title={f}>
                                {f === 'AC' ? '❄️' : '📶'}
                            </div>
                        ))}
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs" title="No Smoking">
                            🚭
                        </div>
                    </div>

                    {/* APPROACH TIME BADGE */}
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg p-2 text-xs text-blue-800">
                        <span className="text-lg">⏱️</span>
                        <span>
                            {isEn ? "Arrives in:" : "Подача:"} <span className="font-bold">{approachTime}</span>
                        </span>
                    </div>
                </div>

                {/* Price & Button */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="text-[10px] text-gray-400 mb-1 font-bold">{isEn ? "Final price (Return Included)" : "Цена окончательная (Обратно бесплатно)"}</div>
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[#00c853] text-lg font-black">GEL {price}</span>
                        <span className="text-[#00c853] text-sm font-bold">(USD {usdPrice})</span>
                    </div>
                    <div className="text-[10px] text-[#00c853] font-bold mb-3">{isEn ? "Price per vehicle" : "Цена за автомобиль"}</div>
                    
                    <button 
                        onClick={(e) => {
                            e.stopPropagation(); 
                            onBookClick(driver, price.toString());
                        }}
                        className="w-full bg-[#00c853] hover:bg-[#00a844] text-white py-3 md:py-4 rounded-xl text-sm font-bold shadow-md transition-all transform active:scale-95 uppercase tracking-wide"
                    >
                        {isEn ? "Book Now" : "Забронировать"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DriverCard;
