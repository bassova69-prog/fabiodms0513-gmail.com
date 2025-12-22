
import React from 'react';
import { Home, Music, GraduationCap, Briefcase, Lock, Unlock, UploadCloud, FileDigit, ShieldAlert, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PROFILE_IMAGE_URL, ARTIST_NAME } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  isAdmin: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, isAdmin, onLoginClick, onLogoutClick, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const publicItems = [
    { icon: Home, label: 'Accueil Studio', path: '/' },
    { icon: Music, label: 'Boutique de Beats', path: '/beats' },
    { icon: GraduationCap, label: 'Masterclass', path: '/masterclass' },
  ];

  const adminItems = [
    { icon: Briefcase, label: 'Tableau de Bord', path: '/admin' },
    { icon: UploadCloud, label: 'Upload Beat', path: '/admin/upload' },
    { icon: FileDigit, label: 'Scanner Factures', path: '/admin/invoices' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    // Fermer le sommaire sur mobile après un clic
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop pour mobile uniquement */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] md:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      <aside className={`fixed left-0 top-0 md:top-14 w-72 md:w-60 h-full md:h-[calc(100vh-56px)] bg-[#0f0f0f] border-r border-[#2a2a2a] overflow-y-auto z-[60] md:z-40 transition-transform duration-300 ease-in-out flex flex-col pb-4 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:hidden'
      }`}>
        
        {/* HEADER DE LA SIDEBAR AVEC LA PHOTO DE FABIO */}
        <div className="p-6 flex flex-col items-center border-b border-[#2a2a2a] mb-2 relative">
          {/* Bouton de fermeture sur mobile */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#8c7a6b] hover:text-white md:hidden"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-20 h-20 rounded-full border-2 border-amber-500 p-1 mb-3 shadow-lg shadow-amber-900/20">
              <img src={PROFILE_IMAGE_URL} alt={ARTIST_NAME} className="w-full h-full rounded-full object-cover" />
          </div>
          <div className="flex items-center gap-1">
              <h3 className="text-white font-bold text-sm uppercase tracking-tight">{ARTIST_NAME}</h3>
          </div>
          <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-1">Beatmaker Platinum</p>
        </div>

        <div className="flex flex-col pt-3 flex-1 px-2">
          <div className="px-3 mb-2">
             <h3 className="text-[10px] font-black text-[#5c4a3e] uppercase tracking-[0.2em]">Sommaire</h3>
          </div>
          {publicItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center px-3 py-3 rounded-xl gap-5 transition-all duration-200 group mb-1 ${
                    location.pathname === item.path 
                    ? 'bg-[#2a2a2a] text-white font-bold shadow-lg' 
                    : 'text-[#f1f1f1] hover:bg-[#2a2a2a]'
                }`}
              >
                <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-amber-500' : 'text-[#f1f1f1]'}`} />
                <span className="text-sm">{item.label}</span>
              </button>
          ))}

          {isAdmin && (
              <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
                  <div className="flex items-center gap-2 mb-2 px-3">
                      <ShieldAlert className="w-3 h-3 text-red-500" />
                      <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Administration</h3>
                  </div>
                  {adminItems.map((item, index) => (
                      <button
                      key={index}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center px-3 py-2.5 rounded-xl gap-5 transition-all duration-200 group mb-1 ${
                          location.pathname === item.path 
                          ? 'bg-red-950/20 text-white font-bold' 
                          : 'text-[#f1f1f1] hover:bg-[#2a2a2a]'
                      }`}
                      >
                      <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-red-500' : 'text-[#f1f1f1]'}`} />
                      <span className="text-sm">{item.label}</span>
                      </button>
                  ))}
              </div>
          )}
        </div>

        <div className="p-4 mt-auto">
          <button 
            onClick={() => {
              if (isAdmin) onLogoutClick(); else onLoginClick();
              if (window.innerWidth < 768) onClose();
            }}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-xs font-bold uppercase ${
              isAdmin 
              ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/20' 
              : 'bg-[#1a120b] text-[#8c7a6b] border-[#2a2a2a] hover:text-white hover:border-white'
            }`}
          >
            {isAdmin ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {isAdmin ? 'Quitter Admin' : 'Admin'}
          </button>
        </div>
      </aside>
    </>
  );
};
