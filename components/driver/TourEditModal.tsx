
import React from 'react';
import { Tour } from '../../types';
import { storageService } from '../../services/storage';

interface TourEditModalProps {
    editingTour: Partial<Tour>;
    setEditingTour: React.Dispatch<React.SetStateAction<Partial<Tour>>>;
    isUploadingTour: boolean;
    setIsUploadingTour: React.Dispatch<React.SetStateAction<boolean>>;
    onSave: (e: React.FormEvent) => void;
    onClose: () => void;
    handleArrayInput: (field: keyof Tour, value: string) => void;
}

const TourEditModal: React.FC<TourEditModalProps> = ({
    editingTour,
    setEditingTour,
    isUploadingTour,
    setIsUploadingTour,
    onSave,
    onClose,
    handleArrayInput
}) => {

    const handleTourImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingTour.id) return;
        setIsUploadingTour(true);
        try {
            const url = await storageService.uploadTourImage(file, editingTour.id);
            if (url) setEditingTour(prev => ({ ...prev, image: url }));
        } catch (err: any) { alert(`Upload Failed: ${err.message}`); } 
        finally { setIsUploadingTour(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                <h3 className="text-xl font-bold mb-6 border-b pb-4 text-gray-800">
                    {editingTour.id?.startsWith('tour-author-') ? 'Create New Tour' : 'Edit My Tour'}
                </h3>
                <form onSubmit={onSave} className="space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tour Title (English)</label>
                            <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={editingTour.titleEn || ''} onChange={e => setEditingTour({...editingTour, titleEn: e.target.value})} placeholder="e.g. My Secret Wine Tour" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tour Title (Russian)</label>
                            <input className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={editingTour.titleRu || ''} onChange={e => setEditingTour({...editingTour, titleRu: e.target.value})} placeholder="напр. Мой Винный Тур" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description (English)</label>
                        <textarea className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none" value={editingTour.descriptionEn || ''} onChange={e => setEditingTour({...editingTour, descriptionEn: e.target.value})} placeholder="Describe the experience..." required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description (Russian)</label>
                        <textarea className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none" value={editingTour.descriptionRu || ''} onChange={e => setEditingTour({...editingTour, descriptionRu: e.target.value})} placeholder="Опишите тур..." required />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (GEL)</label>
                            <input className="w-full border p-3 rounded-xl font-bold text-lg" value={editingTour.price || ''} onChange={e => setEditingTour({...editingTour, price: e.target.value})} placeholder="150 GEL" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration</label>
                            <input className="w-full border p-3 rounded-xl" value={editingTour.duration || ''} onChange={e => setEditingTour({...editingTour, duration: e.target.value})} placeholder="e.g. 6 Hours" required />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Main Image</label>
                        <div className="flex gap-4 items-center">
                            <input type="file" accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" onChange={handleTourImageUpload} />
                            {isUploadingTour && <span className="text-xs text-indigo-600 font-bold animate-pulse">Uploading...</span>}
                        </div>
                        {editingTour.image && (
                            <div className="mt-2 h-32 w-full bg-gray-100 rounded-xl overflow-hidden">
                                <img src={editingTour.image} className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition">Cancel</button>
                        <button type="submit" disabled={isUploadingTour} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition transform active:scale-95 disabled:opacity-50">Save Tour</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TourEditModal;
