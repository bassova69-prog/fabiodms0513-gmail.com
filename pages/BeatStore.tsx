
import React, { useState, useEffect } from 'react';
import { FEATURED_BEATS } from '../constants';
import { BeatCard } from '../components/BeatCard';
import { Filter, ShoppingBag, Sparkles, Music } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Beat } from '../types';
import { getAllBeats } from '../services/dbService';

export const BeatStore: React.FC = () => {
  const { cartCount, toggleCart } = useCart();
  const [beats, setBeats] = useState<Beat[]>([]);

  const loadBeats = async () => {
    try {
      const savedCustomBeats = await getAllBeats();
      // On combine les beats personnalisés (nouveaux d'abord) avec les beats statiques
      setBeats([...[...savedCustomBeats].reverse(), ...FEATURED_BEATS]);
    } catch (e) {
      console.error("Error loading beats from storage:", e);
      setBeats(FEATURED_BEATS);
    }
  };

  useEffect(() => {
    loadBeats();
    // On écoute quand même le storage pour les triggers simples si nécessaire
    window.addEventListener('storage', loadBeats);
    return () => window.removeEventListener('storage', loadBeats);
  }, []);

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-r from-[#2e1d13] via-[#4a2c1d] to-[#2e1d13] rounded-2xl p-6 mb-10 border border-[#5c4a3e] relative overflow-hidden shadow-2xl">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/woven-light.png')] opacity-10"></div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
                <h2 className="text-3xl font-black text-[#fff8f0] italic tracking-tighter mb-1">
                    BULK DEALS <span className="text-amber-500">ACTIVÉS</span>
                </h2>
                <p className="text-[#d4a373] text-sm md:text-base">
                    Ajoutez des beats au panier pour activer la remise automatique.
                </p>
            </div>
            <div className="flex gap-4">
                <div className="bg-[#1a120b]/60 backdrop-blur-md border border-[#3d2b1f] p-4 rounded-xl flex flex-col items-center min-w-[120px]">
                    <span className="text-[10px] text-[#8c7a6b] uppercase font-bold tracking-widest">Populaire</span>
                    <span className="text-xl font-bold text-[#fff8f0]">ACHETEZ 2</span>
                    <span className="text-sm text-emerald-400 font-bold">1 OFFERT</span>
                </div>
                <div className="bg-amber-900/30 backdrop-blur-md border border-amber-700/50 p-4 rounded-xl flex flex-col items-center min-w-[120px]">
                    <span className="text-[10px] text-amber-200 uppercase font-bold flex items-center gap-1"><Sparkles className="w-3 h-3" /> Best Value</span>
                    <span className="text-xl font-bold text-[#fff8f0]">ACHETEZ 3</span>
                    <span className="text-sm text-amber-400 font-bold">2 OFFERTS</span>
                </div>
            </div>
         </div>
      </div>

      <div className="flex items-center justify-between mb-6 sticky top-14 bg-[#120a05]/95 backdrop-blur z-30 py-4 border-b border-[#3d2b1f]">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-[#fff8f0]">
            Catalogue Instrumental
            <span className="text-xs bg-[#2a1e16] text-amber-500 px-3 py-1 rounded-full font-black border border-amber-900/30">{beats.length} Beats</span>
          </h1>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 text-sm font-medium bg-[#1e1510] hover:bg-[#2a1e16] text-[#d4a373] px-4 py-2 rounded-full border border-[#3d2b1f] transition-colors">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtres</span>
            </button>
             <button 
                onClick={toggleCart}
                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors shadow-lg font-bold ${cartCount > 0 ? 'bg-amber-600 hover:bg-amber-500 text-[#1a120b] shadow-amber-900/20' : 'bg-[#2a1e16] text-[#8c7a6b] border border-[#3d2b1f] hover:text-[#fff8f0]'}`}
             >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Panier ({cartCount})</span>
                <span className="sm:hidden">({cartCount})</span>
            </button>
          </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
          {beats.length > 0 ? (
            beats.map((beat) => (
              <BeatCard key={beat.id} beat={beat} />
            ))
          ) : (
             <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-30">
                <Music className="w-16 h-16 mb-4" />
                <p className="italic">Chargement du catalogue...</p>
             </div>
          )}
      </div>
    </div>
  );
};
