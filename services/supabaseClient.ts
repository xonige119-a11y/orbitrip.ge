import { createClient } from '@supabase/supabase-js';

// Environment variables must be set in Vercel for production
// We use a safe accessor to prevent "undefined" errors
const getEnvVar = (key: string) => {
    // @ts-ignore
    return (typeof process !== 'undefined' && process.env && process.env[key]) || '';
};

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = 
    typeof supabaseUrl === 'string' && 
    supabaseUrl.length > 0 && 
    supabaseUrl.startsWith('https://') &&
    typeof supabaseAnonKey === 'string' && 
    supabaseAnonKey.length > 0;

if (!isSupabaseConfigured) {
    console.warn("⚠️ ORBITRIP WARNING: Supabase credentials are missing or invalid.");
    console.warn("The app is running in MOCK mode. Data will not be saved permanently.");
}

// Fallback to prevent crash, but calls will fail gracefully in db.ts
export const supabase = createClient(
    isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co', 
    isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key'
);