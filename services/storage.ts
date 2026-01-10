import { supabase, isSupabaseConfigured } from './supabaseClient';

const BUCKET_NAME = 'driver-gallery';

export const storageService = {
    /**
     * Uploads a file to Supabase storage.
     * Structure: drivers/{driverId}/{type}/{timestamp_filename}
     */
    uploadDriverImage: async (file: File, driverId: string, type: 'avatar' | 'car'): Promise<string | null> => {
        if (!isSupabaseConfigured) {
            alert("Supabase storage is not configured. Please check .env settings.");
            return null;
        }

        try {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                throw new Error('Only image files are allowed');
            }

            // Generate unique path: drivers/123/car/1782323_car.jpg
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
            const filePath = `drivers/${driverId}/${type}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file);

            if (uploadError) {
                // Check for RLS error specifically
                if (uploadError.message.includes('row-level security') || uploadError.message.includes('new row violates')) {
                    alert("⚠️ Storage Permission Error:\nYou need to enable Public Access in Supabase.\n\n1. Go to Supabase -> Storage -> Buckets\n2. Create 'driver-gallery' bucket if missing.\n3. Toggle 'Public' bucket to TRUE.\n4. Add Policy: Enable INSERT for all users (anon).");
                }
                throw uploadError;
            }

            // Get Public URL
            const { data } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            return data.publicUrl;

        } catch (error: any) {
            console.error('Upload failed:', error.message);
            if (!error.message.includes('row-level security')) {
                 alert(`Upload failed: ${error.message}`);
            }
            return null;
        }
    },

    /**
     * Deletes a file from storage (Optional utility)
     */
    deleteImage: async (path: string) => {
        if (!isSupabaseConfigured) return;
        // Logic to parse URL and delete could go here if needed later
    }
};