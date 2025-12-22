
import React, { useState, useMemo } from 'react';
import { Play, Pause, ShoppingCart, Music2, X, Youtube, Headphones, Radio, Layers, Crown, Check, Tag } from 'lucide-react';
import { Beat, License, StorePromotion } from '../types';
import { usePlayer } from '../contexts/PlayerContext';
import { useCart } from '../contexts/CartContext';

interface BeatCardProps {
  beat: Beat;
}

export const BeatCard: React.FC<BeatCardProps> = ({ beat }) => {
  const { playBeat, currentBeat, isPlaying } = usePlayer();
  const { addToCart, toggleCart } = useCart();
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  // Charger la promo si présente
  const promo: StorePromotion | null = useMemo(() => {
    const saved = localStorage.getItem('fabio_store_promo');
    if (!saved) return null;
    const p = JSON.parse(saved);
    return p.isActive ? p : null;
  }, []);

  const isCurrent = currentBeat?.id === beat.id;
  const isCurrentAndPlaying = isCurrent && isPlaying;
  
  const originalLowestPrice = beat.licenses[0]?.price || 0;
  const lowestPrice = promo 
    ? Number((originalLowestPrice * (1 - promo.discountPercentage / 100)).toFixed(2))
    : originalLowestPrice;

  const handleCardClick = (e: React.MouseEvent) => {
    playBeat(beat);
  };

  const toggleModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowLicenseModal(!showLicenseModal);
  };

  const handleAddToCart = (e: React.MouseEvent, license: License) => {
    e.stopPropagation();
    
    // Appliquer la réduction si promo active
    const finalLicense = promo ? {
      ...license,
      price: Number((license.price * (1 - promo.discountPercentage / 100)).toFixed(2))
    } : license;

    addToCart(beat, finalLicense);
    setShowLicenseModal(false);
  };

  const getLicenseIcon = (type: string, size = "w-5 h-5") => {
    switch (type) {
        case 'MP3': return <Headphones className={`${size} text-blue-400`} />;
        case 'WAV': return <Radio className={`${size} text-cyan-400`} />;
        case 'TRACKOUT': return <Layers className={`${size} text-orange-400`} />;
        case 'EXCLUSIVE': return <Crown className={`${size} text-amber-500`} />;
        default: return <Music2 className={`${size} text-gray-400`} />;
    }
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className={`flex flex-col gap-3 group relative bg-[#1e1510] p-3 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/10 cursor-pointer ${isCurrent ? 'border-amber-500 shadow-lg shadow-amber-900/5' : 'border-[#3d2b1f] hover:border-amber-700/50'}`}
      >
        {/* CARD IMAGE AREA */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-[#2a1e16]">
          <img 
            src={beat.coverUrl} 
            alt={beat.title} 
            className={`w-full h-full object-cover transition-transform duration-500 ${isCurrentAndPlaying ? 'scale-105 saturate-150' : 'group-hover:scale-105'}`}
          />
          
          <div className={`absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
               <div className={`p-4 rounded-full transform transition-all shadow-xl ${isCurrentAndPlaying ? 'bg-white scale-110' : 'bg-amber-500/90 backdrop-blur-sm group-hover:scale-110'}`}>
                 {isCurrentAndPlaying ? (
                   <Pause className="w-6 h-6 text-black fill-current" />
                 ) : (
                   <Play className={`w-6 h-6 fill-current ml-1 ${isCurrent ? 'text-black' : 'text-[#1a120b]'}`} />
                 )}
               </div>
          </div>

          {promo && (
            <div className="absolute top-2 left-2 bg-emerald-500 text-black text-[9px] font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
              <Tag className="w-3 h-3" /> -{promo.discountPercentage}%
            </div>
          )}
          
          {isCurrentAndPlaying && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 flex items-end gap-0.5 justify-center pb-2 opacity-90">
                  {[...Array(8)].map((_, i) => (
                      <div key={i} className="w-1 bg-amber-400 animate-pulse" style={{ height: (Math.random() * 15 + 5) + 'px', animationDuration: (0.3 + Math.random() * 0.4) + 's' }}></div>
                  ))}
              </div>
          )}

          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-[10px] px-2 py-1 rounded-md text-white font-black border border-white/10 tracking-widest">
            {beat.bpm} BPM
          </div>
        </div>
        
        {/* INFO SECTION */}
        <div className="flex gap-3">
          <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-all shadow-lg ${isCurrentAndPlaying ? 'bg-amber-500 text-black animate-pulse' : 'bg-[#2a1e16] border border-[#3d2b1f]'}`}>
              <Music2 className={`w-5 h-5 ${isCurrentAndPlaying ? 'text-[#1a120b]' : 'text-[#8c7a6b]'}`} />
          </div>
          <div className="flex flex-col flex-1 pr-1 min-w-0">
            <h3 className={`font-bold text-sm line-clamp-1 leading-tight transition-colors ${isCurrent ? 'text-amber-500' : 'text-[#fff8f0] group-hover:text-amber-100'}`}>
              {beat.title}
            </h3>
            <div className="text-[#8c7a6b] text-[10px] mt-1 flex items-center gap-2 font-bold uppercase tracking-widest">
               <span>Fabio DMS</span>
               {beat.youtubeId && <Youtube className="w-3 h-3 text-red-600" />}
            </div>
            
            <div className="mt-3 flex items-center justify-between gap-2">
               <div className="flex flex-col">
                  {promo && <span className="text-[8px] text-[#5c4a3e] line-through">{originalLowestPrice}€</span>}
                  <span className={`${promo ? 'text-emerald-400' : 'text-[#fff8f0]'} font-black text-sm`}>{lowestPrice}€</span>
               </div>
               <button 
                  onClick={toggleModal}
                  className="text-[10px] px-4 py-2 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg bg-[#2a1e16] text-amber-500 border border-amber-900/30 hover:bg-amber-600 hover:text-black hover:border-transparent"
               >
                  <ShoppingCart className="w-3 h-3" />
                  Acheter
               </button>
            </div>
          </div>
        </div>
      </div>

      {showLicenseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowLicenseModal(false)} />
          <div className="relative w-full max-w-4xl bg-[#1a120b] border border-[#3d2b1f] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-[#3d2b1f] flex justify-between items-center bg-[#120a05]">
              <div className="flex items-center gap-4">
                <img src={beat.coverUrl} className="w-16 h-16 rounded-xl object-cover border border-[#3d2b1f]" alt={beat.title} />
                <div>
                  <h2 className="text-xl font-bold text-white">{beat.title}</h2>
                  <p className="text-amber-500 text-sm font-medium">Formats disponibles : MP3, WAV, Stems</p>
                </div>
              </div>
              <button onClick={() => setShowLicenseModal(false)} className="p-2 hover:bg-[#2a1e16] rounded-full text-[#8c7a6b] transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar">
              {beat.licenses.map((lic) => {
                const discountedPrice = promo ? Number((lic.price * (1 - promo.discountPercentage / 100)).toFixed(2)) : lic.price;
                return (
                  <div key={lic.id} className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${lic.fileType === 'EXCLUSIVE' ? 'bg-gradient-to-br from-[#2a1e16] to-[#1a120b] border-amber-600/30' : 'bg-[#120a05] border-[#3d2b1f]'}`}>
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-amber-900/10 border border-amber-900/20">{getLicenseIcon(lic.fileType, "w-6 h-6")}</div>
                        <h4 className="font-black text-white text-lg tracking-tight">{lic.name}</h4>
                      </div>
                      <div className="space-y-2 mb-8">
                        {lic.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-[#a89080]"><Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><span>{feature}</span></div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-[#3d2b1f] flex items-center justify-between">
                      <div className="flex flex-col">
                        {promo && <span className="text-xs text-[#5c4a3e] line-through">{lic.price}€</span>}
                        <span className={`text-2xl font-black ${promo ? 'text-emerald-400' : 'text-white'}`}>{discountedPrice}€</span>
                      </div>
                      <button onClick={(e) => handleAddToCart(e, lic)} className="px-6 py-3 rounded-xl font-black text-sm bg-white text-black hover:bg-amber-500 transition-all uppercase">Ajouter</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};