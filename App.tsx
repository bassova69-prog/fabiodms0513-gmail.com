
import React, { useState } from 'react';
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

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Par défaut, fermée sur mobile, ouverte sur desktop
    return window.innerWidth >= 768;
  });

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
                    {/* Routes Publiques Uniquement */}
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
          </div>
        </Router>
      </CartProvider>
    </PlayerProvider>
  );
};

export default App;
