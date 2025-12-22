
import React from 'react';
import { Home, Music, GraduationCap, Briefcase, Settings, Flag, TrendingUp, DollarSign, Scale, FileText, Calendar, PieChart, UploadCloud, FileDigit } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Accueil (Chaîne)', path: '/' },
    { icon: Music, label: 'Catalogue Beats', path: '/beats' },
    { icon: GraduationCap, label: 'Masterclass (VOD)', path: '/masterclass' },
    { type: 'divider' },
    { icon: Briefcase, label: 'Hub Studio Pro', path: '/admin' },
    { icon: FileDigit, label: 'Scanner Factures', path: '/admin/invoices' },
    { icon: UploadCloud, label: 'Upload Beat', path: '/admin/upload' },
    { icon: Calendar, label: 'Planning Studio', path: '/admin/planning' },
    { type: 'divider' },
    { icon: TrendingUp, label: 'Business Plan', path: '/admin/business' },
    { icon: DollarSign, label: 'Comptabilité', path: '/admin/accounting' },
    { icon: Scale, label: 'IA Contrats', path: '/admin/contracts' },
    { icon: PieChart, label: 'Fiscalité IA', path: '/admin/tax' },
  ];

  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 top-14 w-60 h-[calc(100vh-56px)] bg-[#0f0f0f] border-r border-[#3d2b1f] overflow-y-auto z-40 pr-2 pb-4 hidden md:block custom-scrollbar">
      <div className="flex flex-col pt-3">
        {menuItems.map((item, index) => (
          item.type === 'divider' ? (
            <div key={index} className="h-[px] bg-[#3d2b1f] my-3 mx-4 opacity-50"></div>
          ) : (
            <button
              key={index}
              onClick={() => item.path && navigate(item.path)}
              className={`flex items-center px-4 py-2.5 mx-2 rounded-lg gap-4 transition-all duration-200 group ${
                location.pathname === item.path 
                  ? 'bg-[#2a2a2a] text-white font-bold' 
                  : 'text-[#a89080] hover:bg-[#1a1a1a] hover:text-white'
              }`}
            >
              {item.icon && <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-amber-500' : 'group-hover:text-amber-500'}`} />}
              <span className="text-[13px]">{item.label}</span>
            </button>
          )
        ))}
        
        <div className="mt-auto px-6 pt-10 text-[10px] text-[#5c4a3e]">
          <div className="flex flex-wrap gap-2 mb-4">
             <a href="#" className="hover:text-white">À propos</a>
             <a href="#" className="hover:text-white">Copyright</a>
             <a href="#" className="hover:text-white">Contact</a>
          </div>
          <p>© 2024 Fabio DMS Studio</p>
        </div>
      </div>
    </aside>
  );
};
