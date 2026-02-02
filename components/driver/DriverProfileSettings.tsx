
import React, { useEffect, useState } from 'react';
import { Driver } from '../../types';

interface DriverProfileSettingsProps {
    currentProfile: Driver;
    editProfile: Partial<Driver>;
    setEditProfile: React.Dispatch<React.SetStateAction<Partial<Driver>>>;
    handleProfileUpdate: (e: React.FormEvent) => void;
    isSavingProfile: boolean;
}

const DriverProfileSettings: React.FC<DriverProfileSettingsProps> = ({
    currentProfile,
    editProfile,
    setEditProfile,
    handleProfileUpdate,
    isSavingProfile
}) => {
    // Simulator state moved here as it is local to this view
    const [simDistance, setSimDistance] = useState(100);
    const [simCalculatedPrice, setSimCalculatedPrice] = useState(0);

    // Update Simulator whenever inputs change
    useEffect(() => {
        const rate = editProfile.pricePerKm || 1.2;
        const base = editProfile.basePrice || 30;
        
        // Simulation: Distance + Return (x2) + Base
        // Formula: (Total Km * Rate) + Base Price
        const totalKm = simDistance * 2;
        const price = Math.ceil((totalKm * rate) + base);
        setSimCalculatedPrice(price);
    }, [simDistance, editProfile.pricePerKm, editProfile.basePrice]);

    return (
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
                                <span className="text-slate-400">Your Net (87%):</span>
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
    );
};

export default DriverProfileSettings;
