
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Using process.cwd() is generally safer in CI/CD environments like Vercel.
  const env = loadEnv(mode, '.', '');
  
  // Safe extraction of API keys with fallbacks to empty strings to prevent build crashes
  const apiKey = env.VITE_GEMINI_API_KEY || env.VITE_API_KEY || env.API_KEY || '';
  const supabaseUrl = env.VITE_SUPABASE_URL || '';
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY || '';
  const adminPass = env.VITE_ADMIN_PASSWORD || '';

  return {
    base: './', // Ensures relative paths for assets, critical for some hosting providers
    plugins: [react()],
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },
    server: {
        headers: {
            'Cache-Control': 'no-store',
        },
    },
    // Define global constants replacement
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey), 
      'process.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseKey),
      'process.env.VITE_ADMIN_PASSWORD': JSON.stringify(adminPass), 
      
      // Polyfill process.env for libraries that might expect it.
      // IMPORTANT: We do NOT spread ...env here. Spreading all system env vars into the client bundle
      // causes Vercel builds to fail due to size limits or sensitive keys.
      // We only inject specific safe keys.
      'process.env': JSON.stringify({
         NODE_ENV: mode,
         VITE_SUPABASE_URL: supabaseUrl,
         VITE_SUPABASE_ANON_KEY: supabaseKey,
         VITE_ADMIN_PASSWORD: adminPass,
         API_KEY: apiKey
      })
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Reliable file naming for caching
          entryFileNames: `assets/[name].[hash].js`,
          chunkFileNames: `assets/[name].[hash].js`,
          assetFileNames: `assets/[name].[hash].[ext]`
        }
      }
    }
  };
});
