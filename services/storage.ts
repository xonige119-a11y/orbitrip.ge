
import { supabase, isSupabaseConfigured } from './supabaseClient';

// CRITICAL CONFIGURATION:
// In Supabase Dashboard -> Storage -> Create a new bucket
// Name: 'public-gallery' (Do NOT name it just 'public', that is reserved)
// Settings: Ensure "Public bucket" is toggled ON.
const BUCKET_NAME = 'public-gallery';

export const storageService = {
    /**
     * Generic uploader
     * Folder structure: {entityType}/{id}/{timestamp_filename}
     * e.g. tours/123/99999_image.jpg
     */
    uploadImage: async (file: File, entityType: 'drivers' | 'tours' | 'documents', entityId: string): Promise<string | null> => {
        if (!isSupabaseConfigured) {
            console.warn("Storage not configured. Returning mock URL for demo.");
            return "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600";
        }

        try {
            // Validate file type
            if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
                throw new Error('Only image files and PDFs are allowed');
            }

            // Validate file size (e.g., max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                throw new Error('File size too large. Max 10MB allowed.');
            }

            // Sanitize filename
            const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const fileExt = cleanFileName.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
            const filePath = `${entityType}/${entityId}/${fileName}`;

            console.log(`[Storage] Uploading to: ${BUCKET_NAME}/${filePath}`);

            const { data, error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                console.error("Storage Upload Error:", uploadError);
                throw new Error(`Upload Failed: ${uploadError.message}`);
            }

            const { data: publicUrlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            if (!publicUrlData || !publicUrlData.publicUrl) {
                throw new Error("Could not retrieve public URL after upload.");
            }

            return publicUrlData.publicUrl;

        } catch (error: any) {
            console.error('Storage Service Error:', error.message);
            // Re-throw with a user-friendly message
            throw new Error(error.message || "File upload failed due to a technical error.");
        }
    },

    // Wrapper for Drivers
    uploadDriverImage: async (file: File, driverId: string, type: string) => {
        return storageService.uploadImage(file, 'drivers', `${driverId}/${type}`);
    },

    // Wrapper for Documents
    uploadDocument: async (file: File, driverId: string) => {
        return storageService.uploadImage(file, 'documents', driverId);
    },

    // Wrapper for Tours
    uploadTourImage: async (file: File, tourId: string) => {
        return storageService.uploadImage(file, 'tours', tourId);
    }
};
