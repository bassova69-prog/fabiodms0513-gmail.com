
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { BeatStore } from './pages/BeatStore';
import { MasterclassStore } from './pages/MasterclassStore';
import { Success } from './pages/Success';
import { AdminDashboard } from './pages/AdminDashboard';
import { BusinessPlan } from './pages/admin/BusinessPlan';
import { Accounting } from './pages/admin/Accounting';
import { LegalStatusPage } from './pages/admin/LegalStatus';
import { ContractAI } from './pages/admin/ContractAI';
import { Planning } from './pages/admin/Planning';
import { TaxOptimization } from './pages/admin/TaxOptimization';
import { UploadBeat } from './pages/admin/UploadBeat';
import { InvoiceScanner } from './pages/admin/InvoiceScanner';
import { PlayerProvider } from './contexts/PlayerContext';
import { BottomPlayer } from './components/BottomPlayer';
import { CartProvider } from './contexts/CartContext';
import { CartDrawer } from './components/CartDrawer';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <PlayerProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-[#0f0f0f] text-white">
            <Navbar toggleSidebar={toggleSidebar} />
            
            <div className="flex pt-14">
              <Sidebar isOpen={isSidebarOpen} />
              
              <main className={`flex-1 p-6 overflow-x-hidden transition-all duration-300 ${isSidebarOpen ? 'md:ml-60' : 'ml-0'}`}>
                <div className="max-w-7xl mx-auto">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/beats" element={<BeatStore />} />
                    <Route path="/masterclass" element={<MasterclassStore />} />
                    <Route path="/success" element={<Success />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/invoices" element={<InvoiceScanner />} />
                    <Route path="/admin/upload" element={<UploadBeat />} />
                    <Route path="/admin/business" element={<BusinessPlan />} />
                    <Route path="/admin/accounting" element={<Accounting />} />
                    <Route path="/admin/legal" element={<LegalStatusPage />} />
                    <Route path="/admin/contracts" element={<ContractAI />} />
                    <Route path="/admin/tax" element={<TaxOptimization />} />
                    <Route path="/admin/planning" element={<Planning />} />
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
