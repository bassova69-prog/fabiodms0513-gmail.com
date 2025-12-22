
import React from 'react';
import { Menu, Search, Bell, ShoppingCart } from 'lucide-react';
import { ARTIST_NAME, CREDITS, PROFILE_IMAGE_URL } from '../constants';
import { useCart } from '../contexts/CartContext';

interface NavbarProps {
  toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { cartCount, toggleCart } = useCart();

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-[#0f0f0f] flex items-center justify-between px-4 z-50 border-b border-[#2a2a2a]">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 hover:bg-[#2a2a2a] rounded-full text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        
        {/* LOGO AVEC LA PHOTO DE FABIO */}
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.location.href = '/'}>
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 overflow-hidden shadow-[0_0_10px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform duration-300">
            <img 
              src={PROFILE_IMAGE_URL} 
              alt="Fabio Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-white font-black text-xl tracking-tighter uppercase italic hidden sm:block">
            {ARTIST_NAME}
          </span>
        </div>
      </div>

      <div className="hidden md:flex flex-1 max-w-2xl mx-10">
        <div className="flex w-full relative group">
          <input 
            type="text" 
            placeholder="Rechercher un beat..." 
            className="w-full bg-[#121212] border border-[#2a2a2a] rounded-full px-5 py-2 text-white placeholder-[#8c8c8c] focus:outline-none focus:border-blue-500 transition-all"
          />
          <button className="absolute right-0 top-0 bottom-0 px-5 bg-[#2a2a2a] border-l border-[#2a2a2a] rounded-r-full text-[#8c8c8c] hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={toggleCart} className="p-2.5 hover:bg-[#2a2a2a] rounded-full text-white relative group transition-colors">
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-[#0f0f0f]">
              {cartCount}
            </span>
          )}
        </button>
        <button className="p-2.5 hover:bg-[#2a2a2a] rounded-full text-white hidden sm:block">
          <Bell className="w-6 h-6" />
        </button>
        
        <div className="ml-2 w-8 h-8 rounded-full overflow-hidden border border-[#2a2a2a] cursor-pointer hover:opacity-80 transition-opacity">
          <img 
            src={PROFILE_IMAGE_URL} 
            alt="Fabio Profile" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </nav>
  );
};
