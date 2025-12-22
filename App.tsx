
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Home } from './pages/Home.tsx';
import { BeatStore } from './pages/BeatStore.tsx';
import { MasterclassStore } from './pages/MasterclassStore.tsx';
import { Success } from './pages/Success.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { BusinessPlan } from './pages/admin/BusinessPlan.tsx';
import { Accounting } from './pages/admin/Accounting.tsx';
import { LegalStatusPage } from './pages/admin/LegalStatus.tsx';
import { ContractAI } from './pages/admin/ContractAI.tsx';
import { Planning } from './pages/admin/Planning.tsx';
import { TaxOptimization } from './pages/admin/TaxOptimization.tsx';
import { UploadBeat } from './pages/admin/UploadBeat.tsx';
import { InvoiceScanner } from './pages/admin/InvoiceScanner.tsx';
import { PlayerProvider } from './contexts/PlayerContext.tsx';
import { BottomPlayer } from './components/BottomPlayer.tsx';
import { CartProvider } from './contexts/CartContext.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';

// Composant pour protéger les routes Admin
const ProtectedRoute = ({ children, isAdmin }: { children: React.ReactNode, isAdmin: boolean }) => {
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => {
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
              />
              
              <main className={`flex-1 p-6 overflow-x-hidden transition-all duration-300 ${isSidebarOpen ? 'md:ml-60' : 'ml-0'}`}>
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
