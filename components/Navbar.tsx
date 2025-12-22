
import React from 'react';
import { Menu, Search, Mic2, Bell, ShoppingCart } from 'lucide-react';
import { ARTIST_NAME, CREDITS, PROFILE_IMAGE_URL } from '../constants';
import { useCart } from '../contexts/CartContext';

interface NavbarProps {
  toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { cartCount, toggleCart } = useCart();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0f0f0f]/95 backdrop-blur-xl flex items-center justify-between px-6 z-50 border-b border-[#3d2b1f] shadow-lg">
      <div className="flex items-center gap-6">
        <button onClick={toggleSidebar} className="p-2 hover:bg-[#1a120b] rounded-xl text-[#d4a373] transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        
        {/* LOGO PERSONNALISÉ AVEC LA PHOTO DE FABIO */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-full border-2 border-amber-500 overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <img 
              src={PROFILE_IMAGE_URL} 
              alt="Fabio Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-white font-black text-2xl tracking-tighter uppercase italic group-hover:text-amber-500 transition-colors">
            {ARTIST_NAME}
          </span>
        </div>

        <div className="hidden xl:flex items-center ml-8 border-l border-[#3d2b1f] pl-8 gap-3">
            <span className="text-[10px] uppercase font-black text-[#5c4a3e] tracking-widest">Collaborations :</span>
            <div className="flex items-center gap-3">
                {CREDITS.map((credit, i) => (
                    <React.Fragment key={i}>
                        <span className="text-[11px] font-black text-[#a89080] hover:text-amber-500 transition-colors cursor-default">
                            {credit}
                        </span>
                        {i < CREDITS.length - 1 && <span className="text-[#3d2b1f] text-[10px]">•</span>}
                    </React.Fragment>
                ))}
            </div>
        </div>
      </div>

      <div className="hidden md:flex flex-1 max-w-lg mx-12">
        <div className="flex w-full relative group">
          <input 
            type="text" 
            placeholder="Rechercher un beat, un style..." 
            className="w-full bg-[#1a120b] border border-[#3d2b1f] rounded-2xl px-5 py-2.5 text-white placeholder-[#5c4a3e] focus:outline-none focus:border-amber-600 transition-all shadow-inner"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5c4a3e] group-hover:text-amber-500 transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={toggleCart} className="p-2.5 hover:bg-[#1a120b] rounded-xl text-[#d4a373] relative group transition-colors">
          <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 bg-amber-500 text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0f0f0f] shadow-lg">
              {cartCount}
            </span>
          )}
        </button>
        <button className="p-2.5 hover:bg-[#1a120b] rounded-xl text-[#d4a373] transition-colors">
          <Bell className="w-6 h-6" />
        </button>
        
        {/* MÉDAILLON DE PROFIL DE FABIO */}
        <div className="ml-2 w-10 h-10 rounded-full border-2 border-amber-500 p-0.5 shadow-lg overflow-hidden cursor-pointer hover:scale-110 transition-transform">
          <img 
            src={PROFILE_IMAGE_URL} 
            alt="Fabio Profile" 
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      </div>
    </nav>
  );
};
