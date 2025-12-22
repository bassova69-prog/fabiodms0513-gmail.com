
import React from 'react';
import { Home, Music, GraduationCap, Briefcase, Lock, Unlock, TrendingUp, DollarSign, Scale, FileText, Calendar, PieChart, UploadCloud, FileDigit, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PROFILE_IMAGE_URL, ARTIST_NAME } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  isAdmin: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, isAdmin, onLoginClick, onLogoutClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const publicItems = [
    { icon: Home, label: 'Accueil Studio', path: '/' },
    { icon: Music, label: 'Boutique de Beats', path: '/beats' },
    { icon: GraduationCap, label: 'Masterclass', path: '/masterclass' },
  ];

  const adminItems = [
    { icon: Briefcase, label: 'Tableau de Bord', path: '/admin' },
    { icon: UploadCloud, label: 'Uploader un Beat', path: '/admin/upload' },
    { icon: FileDigit, label: 'Scanner Factures', path: '/admin/invoices' },
    { icon: Calendar, label: 'Planning Studio', path: '/admin/planning' },
    { icon: DollarSign, label: 'Comptabilité Pro', path: '/admin/accounting' },
    { icon: TrendingUp, label: 'Business Plan', path: '/admin/business' },
    { icon: Scale, label: 'Juridique & Contrats', path: '/admin/contracts' },
    { icon: PieChart, label: 'Expertise Fiscale', path: '/admin/tax' },
  ];

  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 top-14 w-60 h-[calc(100vh-56px)] bg-[#0f0f0f] border-r border-[#3d2b1f] overflow-y-auto z-40 pr-2 pb-4 hidden md:flex flex-col custom-scrollbar">
      
      {/* SECTION PROFIL HAUT DE SIDEBAR */}
      <div className="p-6 border-b border-[#3d2b1f] mb-4 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full border-2 border-amber-500 p-1 mb-3 shadow-[0_0_20px_rgba(245,158,11,0.15)] overflow-hidden">
          <img 
            src={PROFILE_IMAGE_URL} 
            alt={ARTIST_NAME} 
            className="w-full h-full rounded-full object-cover transition-transform hover:scale-110 duration-500" 
          />
        </div>
        <div className="flex items-center gap-1">
          <h3 className="text-white font-black text-sm uppercase tracking-tighter italic">{ARTIST_NAME}</h3>
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-current" />
        </div>
        <p className="text-[9px] text-amber-500 font-black uppercase tracking-[0.2em] mt-1">Producteur Platinum</p>
      </div>

      <div className="flex flex-col pt-3 flex-1 px-4">
        
        {/* SECTION PUBLIQUE */}
        <div className="mb-2">
            <h3 className="text-[10px] font-black text-[#5c4a3e] uppercase tracking-[0.2em] mb-3 px-2">Catalogue</h3>
            {publicItems.map((item, index) => (
                <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-3 py-2.5 rounded-xl gap-4 transition-all duration-200 group mb-1 ${
                    location.pathname === item.path 
                    ? 'bg-[#2a1e16] text-amber-500 font-bold' 
                    : 'text-[#a89080] hover:bg-[#1a1a1a] hover:text-white'
                }`}
                >
                <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-amber-500' : 'group-hover:text-amber-500'}`} />
                <span className="text-[13px]">{item.label}</span>
                </button>
            ))}
        </div>

        {/* SECTION PRIVÉE ADMIN */}
        {isAdmin && (
            <div className="mt-6 animate-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-2 mb-3 px-2">
                    <ShieldAlert className="w-3 h-3 text-red-500" />
                    <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Accès Privé Admin</h3>
                </div>
                {adminItems.map((item, index) => (
                    <button
                    key={index}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center px-3 py-2.5 rounded-xl gap-4 transition-all duration-200 group mb-1 border ${
                        location.pathname === item.path 
                        ? 'bg-red-950/20 border-red-900/50 text-white font-bold' 
                        : 'text-[#a89080] border-transparent hover:bg-red-950/10 hover:text-white'
                    }`}
                    >
                    <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-red-500' : 'group-hover:text-red-400'}`} />
                    <span className="text-[13px]">{item.label}</span>
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* FOOTER SIDEBAR - BOUTON DE VERROUILLAGE */}
      <div className="p-4 mt-auto border-t border-[#3d2b1f]">
        <button 
          onClick={isAdmin ? onLogoutClick : onLoginClick}
          className={`w-full flex items-center justify-center gap-3 py-3 rounded-2xl border transition-all text-[11px] font-black uppercase tracking-widest ${
            isAdmin 
            ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/20' 
            : 'bg-[#1e1510] text-[#8c7a6b] border-[#3d2b1f] hover:border-amber-900/50 hover:text-amber-500'
          }`}
        >
          {isAdmin ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          {isAdmin ? 'DECONNEXION ADMIN' : 'CONNEXION ADMIN'}
        </button>
        <div className="mt-4 text-center">
             <p className="text-[9px] text-[#5c4a3e] font-bold uppercase tracking-widest">© 2024 Fabio DMS Studio</p>
        </div>
      </div>
    </aside>
  );
};
