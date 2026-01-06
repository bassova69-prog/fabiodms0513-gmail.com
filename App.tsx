
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
import { Database, Wifi, AlertTriangle, X, CheckCircle2, HardDrive } from 'lucide-react';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 768;
  });

  const [dbStatus, setDbStatus] = useState<{connected: boolean, message: string, mode?: 'CLOUD' | 'LOCAL'} | null>(null);
  const [showDbAlert, setShowDbAlert] = useState(false);

  useEffect(() => {
    // Vérification de la connexion DB au montage
    const verifyDb = async () => {
      const status = await checkConnection();
      setDbStatus({ connected: status.success, message: status.message, mode: status.mode });
      setShowDbAlert(true);
      
      // Cache l'alerte après 5s
      setTimeout(() => setShowDbAlert(false), 5000);
    };
    
    verifyDb();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const isCloud = dbStatus?.mode === 'CLOUD';

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

            {/* ALERTE STATUT DATABASE */}
            {showDbAlert && dbStatus && (
              <div className={`fixed bottom-24 right-4 z-[100] p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-500 max-w-sm ${isCloud ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-100' : 'bg-amber-950/80 border-amber-500/30 text-amber-100'}`}>
                <div className={`p-2 rounded-full ${isCloud ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                   {isCloud ? <Database className="w-5 h-5 text-emerald-500" /> : <HardDrive className="w-5 h-5 text-amber-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    {isCloud ? 'Neon Cloud DB' : 'Stockage Local'}
                    {isCloud && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
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
