import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');
  
  // CRITICAL: Updated to match your Vercel screenshot (VITE_GEMINI_API_KEY)
  const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.VITE_API_KEY || process.env.API_KEY || 
                 env.VITE_GEMINI_API_KEY || env.VITE_API_KEY || env.API_KEY || '';

  console.log(`Build: API Key detected? ${apiKey ? 'YES (Length: ' + apiKey.length + ')' : 'NO'}`);

  return {
    plugins: [react()],
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },
    define: {
      // Hardcode the key into the build to bypass runtime lookup issues
      'process.env.API_KEY': JSON.stringify(apiKey),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey), 
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''),
      // SECURITY FIX: Removed default fallback password. Must be set in Vercel/Env.
      'process.env.VITE_ADMIN_PASSWORD': JSON.stringify(env.VITE_ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || ''), 
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});