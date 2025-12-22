
import React, { useState, useEffect } from 'react';
import { FEATURED_BEATS } from '../constants';
import { BeatCard } from '../components/BeatCard';
import { Filter, ShoppingBag, Music, Tag, Zap } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Beat, StorePromotion } from '../types';
import { getAllBeats } from '../services/dbService';
import { usePlayer } from '../contexts/PlayerContext';

export const BeatStore: React.FC = () => {
  const { cartCount, toggleCart } = useCart();
  const { playBeat } = usePlayer();
  const [beats, setBeats] = useState<Beat[]>([]);
  const [promo, setPromo] = useState<StorePromotion | null>(null);

  const loadData = async () => {
    try {
      const savedCustomBeats = await getAllBeats();
      setBeats([...[...savedCustomBeats].reverse(), ...FEATURED_BEATS]);
      
      const savedPromo = localStorage.getItem('fabio_store_promo');
      if (savedPromo) {
        const p = JSON.parse(savedPromo);
        if (p.isActive) setPromo(p);
      }
    } catch (e) {
      console.error("Error loading beats from storage:", e);
      setBeats(FEATURED_BEATS);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const handlePlayBeat = (beat: Beat) => {
    playBeat(beat, beats);
  };

  return (
    <div className="pb-20">
      {/* BANDEAU PROMO SI ACTIF */}
      {promo && (
        <div className="mb-6 bg-gradient-to-r from-amber-600 to-orange-600 p-4 rounded-2xl flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(217,119,6,0.3)] animate-in slide-in-from-top-4 overflow-hidden relative group">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Zap className="w-5 h-5 text-black animate-pulse" />
          <p className="text-black font-black uppercase tracking-tighter text-sm md:text-base italic text-center">
            {promo.message}
          </p>
          <div className="hidden sm:flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">
            <Tag className="w-3 h-3" /> Remise Active
          </div>
        </div>
      )}

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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8 mt-4">
          {beats.length > 0 ? (
            beats.map((beat) => (
              <div key={beat.id} onClick={() => handlePlayBeat(beat)}>
                <BeatCard beat={beat} />
              </div>
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