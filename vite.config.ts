
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // On définit uniquement la clé nécessaire de manière sécurisée
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
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
