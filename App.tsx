
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { BeatStore } from './pages/BeatStore';
import { MasterclassStore } from './pages/MasterclassStore';
import { Success } from './pages/Success';
import { PlayerProvider } from './contexts/PlayerContext';
import { BottomPlayer } from './components/BottomPlayer';
import { CartProvider } from './contexts/CartContext';
import { CartDrawer } from './components/CartDrawer';
import { checkConnection } from './services/dbService';
import { Database, Wifi, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 768;
  });

  const [dbStatus, setDbStatus] = useState<{connected: boolean, message: string} | null>(null);
  const [showDbAlert, setShowDbAlert] = useState(false);

  useEffect(() => {
    // Vérification de la connexion DB au montage
    const verifyDb = async () => {
      const status = await checkConnection();
      setDbStatus({ connected: status.success, message: status.message });
      setShowDbAlert(true);
      
      // Si connecté avec succès, on cache l'alerte après 5 secondes
      if (status.success) {
        setTimeout(() => setShowDbAlert(false), 5000);
      }
    };
    
    verifyDb();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <PlayerProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-[#0f0f0f] text-white">
            <Navbar toggleSidebar={toggleSidebar} />
            
            <div className="flex pt-14">
              <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={closeSidebar}
              />
              
              <main className={`flex-1 p-4 md:p-6 transition-all duration-300 ${isSidebarOpen ? 'md:ml-60' : 'ml-0'}`}>
                <div className="max-w-7xl mx-auto">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/beats" element={<BeatStore />} />
                    <Route path="/masterclass" element={<MasterclassStore />} />
                    <Route path="/success" element={<Success />} />
                  </Routes>
                </div>
              </main>
            </div>
            
            <CartDrawer />
            <BottomPlayer />

            {/* ALERTE STATUT DATABASE NEON */}
            {showDbAlert && dbStatus && (
              <div className={`fixed bottom-24 right-4 z-[100] p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-500 max-w-sm ${dbStatus.connected ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-100' : 'bg-red-950/80 border-red-500/30 text-red-100'}`}>
                <div className={`p-2 rounded-full ${dbStatus.connected ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                   {dbStatus.connected ? <Database className="w-5 h-5 text-emerald-500" /> : <Wifi className="w-5 h-5 text-red-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    {dbStatus.connected ? 'Neon DB' : 'Erreur Connexion'}
                    {dbStatus.connected && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                  </p>
                  <p className="text-[10px] opacity-80 mt-0.5">{dbStatus.message}</p>
                </div>
                <button 
                  onClick={() => setShowDbAlert(false)} 
                  className="p-1 hover:bg-white/10 rounded-full transition-colors self-start -mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </Router>
      </CartProvider>
    </PlayerProvider>
  );
};

export default App;
