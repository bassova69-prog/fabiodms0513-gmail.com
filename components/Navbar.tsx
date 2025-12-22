
import React from 'react';
import { Menu, Search, Mic2, Bell, Video, ShoppingCart } from 'lucide-react';
import { ARTIST_NAME, CREDITS } from '../constants';
import { useCart } from '../contexts/CartContext';

interface NavbarProps {
  toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { cartCount, toggleCart } = useCart();

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-[#1a120b]/95 backdrop-blur-md flex items-center justify-between px-4 z-50 border-b border-[#3d2b1f]">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 hover:bg-[#3d2b1f] rounded-full text-[#d4a373]">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="bg-gradient-to-br from-amber-600 to-orange-700 p-1.5 rounded-lg shadow-lg shadow-orange-900/20 group-hover:shadow-orange-500/20 transition-all">
            <Mic2 className="text-white w-5 h-5" />
          </div>
          <span className="text-[#fff8f0] font-bold text-xl tracking-tight">
            {ARTIST_NAME} <span className="text-amber-500">.</span>
          </span>
        </div>

        {/* Credits Section (Desktop) */}
        <div className="hidden lg:flex items-center ml-6 border-l border-[#3d2b1f] pl-6 gap-2">
            <span className="text-[10px] uppercase font-bold text-[#5c4a3e] tracking-wider">Prod. for</span>
            <div className="flex items-center gap-2">
                {CREDITS.map((credit, i) => (
                    <React.Fragment key={i}>
                        <span className={`text-xs font-bold transition-colors cursor-default ${credit === 'Warren Saada' ? 'text-emerald-400 hover:text-emerald-300' : 'text-[#a89080] hover:text-amber-500'}`}>
                            {credit}
                        </span>
                        {i < CREDITS.length - 1 && <span className="text-[#3d2b1f] text-[10px]">•</span>}
                    </React.Fragment>
                ))}
            </div>
        </div>
      </div>

      <div className="hidden md:flex flex-1 max-w-[400px] ml-12">
        <div className="flex w-full">
          <input 
            type="text" 
            placeholder="Rechercher (ex: Afro Love, Kompa, Zouk...)" 
            className="w-full bg-[#2a1e16] border border-[#3d2b1f] rounded-l-full px-4 py-2 text-[#fff8f0] placeholder-[#8c7a6b] focus:outline-none focus:border-amber-600 transition-colors"
          />
          <button className="bg-[#3d2b1f] border border-l-0 border-[#3d2b1f] px-5 rounded-r-full hover:bg-[#4e3629] transition-colors">
            <Search className="text-[#d4a373] w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={toggleCart}
          className="p-2 hover:bg-[#3d2b1f] rounded-full text-[#d4a373] relative"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#1a120b] animate-in zoom-in-95">
              {cartCount}
            </span>
          )}
        </button>
        <button className="p-2 hover:bg-[#3d2b1f] rounded-full hidden sm:block text-[#d4a373]">
          <Video className="w-6 h-6" />
        </button>
        <button className="p-2 hover:bg-[#3d2b1f] rounded-full text-[#d4a373]">
          <Bell className="w-6 h-6" />
        </button>
        <div className="ml-2 w-8 h-8 bg-gradient-to-tr from-amber-600 to-yellow-500 rounded-full flex items-center justify-center text-[#1a120b] font-bold cursor-pointer shadow-lg">
          F
        </div>
      </div>
    </nav>
  );
};
