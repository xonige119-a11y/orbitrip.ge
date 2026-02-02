import React, { useState } from 'react';
import { Booking, Tour } from '../types';
import { generateTourPrices } from '../services/geminiService';

interface AdminPanelProps {
  bookings: Booking[];
  tours: Tour[];
  onAddTour: (tour: Tour) => void;
  onUpdateTour: (tour: Tour) => void;
  onDeleteTour: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ bookings, tours, onAddTour, onUpdateTour, onDeleteTour }) => {
  const [activeTab, setActiveTab] = useState<'BOOKINGS' | 'TOURS'>('BOOKINGS');
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [currentTour, setCurrentTour] = useState<Partial<Tour>>({});
  const [loadingAi, setLoadingAi] = useState(false);

  const handleEditClick = (tour: Tour) => {
    setCurrentTour({ ...tour });
    setIsEditing(true);
  };

  const handleAddNewClick = () => {
    setCurrentTour({
        id: Date.now().toString(),
        titleEn: '', titleRu: '',
        descriptionEn: '', descriptionRu: '',
        price: '', duration: '', image: '',
        rating: 5.0, reviews: [],
        highlightsEn: [], highlightsRu: [],
        itineraryEn: [], itineraryRu: [],
        priceOptions: []
    });
    setIsEditing(true);
  };

  const handleGeneratePrices = async () => {
      if (!currentTour.descriptionEn) {
          alert("Please enter a description in English first.");
          return;
      }
      setLoadingAi(true);
      try {
          const prices = await generateTourPrices(currentTour.descriptionEn);
          if (prices && prices.length > 0) {
              setCurrentTour(prev => ({
                  ...prev,
                  priceOptions: prices,
                  price: `From ${prices[0].price}` // Set display price from lowest option
              }));
          } else {
              alert("AI could not calculate prices.");
          }
      } catch (e) {
          console.error(e);
          alert("Error generating prices.");
      } finally {
          setLoadingAi(false);
      }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTour.id) return;
    
    // Check if it's an existing tour or new
    const exists = tours.find(t => t.id === currentTour.id);
    const tourToSave = {
        ...currentTour,
        priceOptions: currentTour.priceOptions || [] // Ensure array
    } as Tour;

    if (exists) {
        onUpdateTour(tourToSave);
    } else {
        onAddTour(tourToSave);
    }
    setIsEditing(false);
  };

  // Helper for comma separated arrays
  const handleArrayInput = (field: keyof Tour, value: string) => {
      setCurrentTour(prev => ({
          ...prev,
          [field]: value.split(',').map(s => s.trim())
      }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
                <button
                    onClick={() => setActiveTab('BOOKINGS')}
                    className={`${activeTab === 'BOOKINGS' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                >
                    Bookings ({bookings.length})
                </button>
                <button
                    onClick={() => setActiveTab('TOURS')}
                    className={`${activeTab === 'TOURS' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                >
                    Manage Tours ({tours.length})
                </button>
            </nav>
        </div>

        {/* Content */}
        <div className="p-6">
            {activeTab === 'BOOKINGS' && (
                <div className="divide-y divide-gray-200">
                {bookings.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No bookings yet.</div>
                ) : (
                    bookings.map((booking) => (
                        <div key={booking.id} className="py-4 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-indigo-600">{booking.tourTitle}</p>
                                <p className="text-lg font-bold text-gray-900">{booking.customerName}</p>
                                <p className="text-sm text-gray-500">{booking.contactInfo}</p>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {booking.status}
                                </span>
                                <p className="text-sm text-gray-500 mt-1">{booking.date} ({booking.guests} ppl)</p>
                                <p className="text-xs font-bold text-indigo-600 mt-1">{booking.vehicle} - {booking.totalPrice}</p>
                            </div>
                        </div>
                    ))
                )}
                </div>
            )}

            {activeTab === 'TOURS' && !isEditing && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button 
                            onClick={handleAddNewClick}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium text-sm flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add New Tour
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tours.map(tour => (
                            <div key={tour.id} className="border border-gray-200 rounded-lg p-4 flex flex-col">
                                <img src={tour.image} alt={tour.titleEn} className="w-full h-32 object-cover rounded-md mb-4"/>
                                <h4 className="font-bold text-gray-900 mb-1">{tour.titleEn}</h4>
                                <p className="text-xs text-gray-500 mb-4 h-10 overflow-hidden">{tour.descriptionEn}</p>
                                <div className="mt-auto flex space-x-2">
                                    <button 
                                        onClick={() => handleEditClick(tour)}
                                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => onDeleteTour(tour.id)}
                                        className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded text-sm hover:bg-red-100"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Edit Form */}
            {activeTab === 'TOURS' && isEditing && (
                <form onSubmit={handleSave} className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">
                        {currentTour.id && tours.find(t => t.id === currentTour.id) ? 'Edit Tour' : 'Create New Tour'}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title (EN)</label>
                            <input type="text" className="border w-full p-2 rounded" value={currentTour.titleEn || ''} onChange={e => setCurrentTour({...currentTour, titleEn: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title (RU)</label>
                            <input type="text" className="border w-full p-2 rounded" value={currentTour.titleRu || ''} onChange={e => setCurrentTour({...currentTour, titleRu: e.target.value})} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description (EN)</label>
                            <textarea className="border w-full p-2 rounded" rows={3} value={currentTour.descriptionEn || ''} onChange={e => setCurrentTour({...currentTour, descriptionEn: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description (RU)</label>
                            <textarea className="border w-full p-2 rounded" rows={3} value={currentTour.descriptionRu || ''} onChange={e => setCurrentTour({...currentTour, descriptionRu: e.target.value})} required />
                        </div>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
                        <label className="block text-sm font-bold text-indigo-700 mb-2">Pricing Strategy (AI Powered)</label>
                        <div className="flex items-center space-x-4">
                             <button
                                type="button"
                                onClick={handleGeneratePrices}
                                disabled={loadingAi}
                                className="bg-indigo-600 text-white px-3 py-2 rounded text-sm flex items-center hover:bg-indigo-700 disabled:opacity-50"
                             >
                                 {loadingAi ? 'Calculating...' : '🤖 Auto-Calculate with AI'}
                             </button>
                             <div className="text-xs text-gray-500">
                                 AI will analyze the description and set prices for Sedan, Minivan, and Bus.
                             </div>
                        </div>
                        
                        {/* Display Current Prices */}
                        <div className="mt-4 grid grid-cols-3 gap-2">
                             {currentTour.priceOptions?.map((opt, i) => (
                                 <div key={i} className="bg-white p-2 rounded border border-gray-200 text-center text-xs">
                                     <strong>{opt.vehicle}</strong>: {opt.price}
                                 </div>
                             ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Display Price</label>
                            <input type="text" className="border w-full p-2 rounded" value={currentTour.price || ''} onChange={e => setCurrentTour({...currentTour, price: e.target.value})} placeholder="From $100" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Duration</label>
                            <input type="text" className="border w-full p-2 rounded" value={currentTour.duration || ''} onChange={e => setCurrentTour({...currentTour, duration: e.target.value})} placeholder="1 Day" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Image URL</label>
                            <input type="text" className="border w-full p-2 rounded" value={currentTour.image || ''} onChange={e => setCurrentTour({...currentTour, image: e.target.value})} placeholder="https://..." required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Highlights (EN) - Comma separated</label>
                            <input type="text" className="border w-full p-2 rounded" value={currentTour.highlightsEn?.join(', ') || ''} onChange={e => handleArrayInput('highlightsEn', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Highlights (RU) - Comma separated</label>
                            <input type="text" className="border w-full p-2 rounded" value={currentTour.highlightsRu?.join(', ') || ''} onChange={e => handleArrayInput('highlightsRu', e.target.value)} />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Save Tour</button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;