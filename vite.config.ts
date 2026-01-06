
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // On définit uniquement la clé nécessaire de manière sécurisée
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  server: {
    proxy: {
      // Redirige les appels /api locaux vers le site en prod pour éviter les 404 en dev
      '/api': {
        target: 'https://fabio-seven.vercel.app',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'recharts'],
        },
      },
    },
  },
});
