
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { AdminLoginModal } from './components/AdminLoginModal';

// Fix: Use React.PropsWithChildren to ensure children are recognized correctly by TypeScript in element prop
const ProtectedRoute = ({ children, isAdmin }: React.PropsWithChildren<{ isAdmin: boolean }>) => {
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Par défaut, fermée sur mobile, ouverte sur desktop
    return window.innerWidth >= 768;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // Fix: Explicitly type the isAdmin state to prevent inference issues
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('fabio_admin_mode') === 'true';
  });

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('fabio_admin_mode', 'true');
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('fabio_admin_mode');
  };

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
                isAdmin={isAdmin} 
                onLoginClick={() => setIsLoginModalOpen(true)}
                onLogoutClick={handleLogout}
                onClose={closeSidebar}
              />
              
              <main className={`flex-1 p-4 md:p-6 overflow-x-hidden transition-all duration-300 ${isSidebarOpen ? 'md:ml-60' : 'ml-0'}`}>
                <div className="max-w-7xl mx-auto">
                  <Routes>
                    {/* Routes Publiques */}
                    <Route path="/" element={<Home />} />
                    <Route path="/beats" element={<BeatStore />} />
                    <Route path="/masterclass" element={<MasterclassStore />} />
                    <Route path="/success" element={<Success />} />

                    {/* Routes Privées Administrateur */}
                    <Route path="/admin" element={<ProtectedRoute isAdmin={isAdmin}><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/invoices" element={<ProtectedRoute isAdmin={isAdmin}><InvoiceScanner /></ProtectedRoute>} />
                    <Route path="/admin/upload" element={<ProtectedRoute isAdmin={isAdmin}><UploadBeat /></ProtectedRoute>} />
                    <Route path="/admin/business" element={<ProtectedRoute isAdmin={isAdmin}><BusinessPlan /></ProtectedRoute>} />
                    <Route path="/admin/accounting" element={<ProtectedRoute isAdmin={isAdmin}><Accounting /></ProtectedRoute>} />
                    <Route path="/admin/legal" element={<ProtectedRoute isAdmin={isAdmin}><LegalStatusPage /></ProtectedRoute>} />
                    <Route path="/admin/contracts" element={<ProtectedRoute isAdmin={isAdmin}><ContractAI /></ProtectedRoute>} />
                    <Route path="/admin/tax" element={<ProtectedRoute isAdmin={isAdmin}><TaxOptimization /></ProtectedRoute>} />
                    <Route path="/admin/planning" element={<ProtectedRoute isAdmin={isAdmin}><Planning /></ProtectedRoute>} />
                  </Routes>
                </div>
              </main>
            </div>
            
            <CartDrawer />
            <BottomPlayer />
            
            {isLoginModalOpen && (
              <AdminLoginModal 
                onClose={() => setIsLoginModalOpen(false)} 
                onSuccess={handleLoginSuccess}
              />
            )}
          </div>
        </Router>
      </CartProvider>
    </PlayerProvider>
  );
};

export default App;
