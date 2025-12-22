
import React, { useState } from 'react';
import { Play, Pause, ShoppingCart, Music2, X, Youtube, Plus, Headphones, Radio, Layers, Crown, Check, ArrowRight } from 'lucide-react';
import { Beat, License } from '../types';
import { usePlayer } from '../contexts/PlayerContext';
import { useCart } from '../contexts/CartContext';

interface BeatCardProps {
  beat: Beat;
}

export const BeatCard: React.FC<BeatCardProps> = ({ beat }) => {
  const { playBeat, currentBeat, isPlaying } = usePlayer();
  const { addToCart, toggleCart, cartCount } = useCart();
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  const isCurrent = currentBeat?.id === beat.id;
  const isCurrentAndPlaying = isCurrent && isPlaying;
  const lowestPrice = beat.licenses[0]?.price || 0;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playBeat(beat);
  };

  const toggleModal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowLicenseModal(!showLicenseModal);
  };

  const handleAddToCart = (e: React.MouseEvent, license: License) => {
    e.stopPropagation();
    addToCart(beat, license);
    // On peut choisir de laisser la modal ouverte ou non. Ici on la ferme pour voir le catalogue.
    setShowLicenseModal(false);
  };

  const handleOpenCartFromModal = () => {
    setShowLicenseModal(false);
    toggleCart();
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
      <div className="flex flex-col gap-3 group relative bg-[#1e1510] p-3 rounded-2xl border border-[#3d2b1f] hover:border-amber-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/10">
        {/* CARD IMAGE */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-[#2a1e16]">
          <img 
            src={beat.coverUrl} 
            alt={beat.title} 
            className={`w-full h-full object-cover transition-transform duration-500 ${isCurrentAndPlaying ? 'scale-105 saturate-150' : 'group-hover:scale-105'}`}
          />
          
          <div className={`absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all flex items-center justify-center ${isCurrent || isCurrentAndPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
               <button 
                  onClick={handlePlayClick}
                  className="p-3 bg-amber-500/90 backdrop-blur-sm rounded-full hover:bg-amber-400 transition-all transform hover:scale-110 shadow-lg shadow-amber-500/20"
               >
                 {isCurrentAndPlaying ? (
                   <Pause className="w-6 h-6 text-[#1a120b] fill-current" />
                 ) : (
                   <Play className="w-6 h-6 text-[#1a120b] fill-current ml-1" />
                 )}
               </button>
          </div>
          
          {isCurrentAndPlaying && (
              <div className="absolute bottom-0 left-0 right-0 h-1 flex items-end gap-0.5 justify-center pb-2 opacity-90">
                  {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-1 bg-amber-400 animate-pulse" style={{ height: Math.random() * 20 + 5 + 'px', animationDuration: '0.4s' }}></div>
                  ))}
              </div>
          )}

          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-[10px] px-2 py-1 rounded-md text-white font-medium border border-white/10">
            {beat.bpm} BPM
          </div>
        </div>
        
        {/* INFO SECTION */}
        <div className="flex gap-3">
          <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-colors shadow-lg ${isCurrentAndPlaying ? 'bg-amber-500 text-black animate-pulse' : 'bg-[#2a1e16] border border-[#3d2b1f]'}`}>
              <Music2 className={`w-5 h-5 ${isCurrentAndPlaying ? 'text-[#1a120b]' : 'text-[#8c7a6b]'}`} />
          </div>
          <div className="flex flex-col flex-1 pr-1">
            <h3 className={`font-bold text-base line-clamp-1 leading-tight transition-colors ${isCurrent ? 'text-amber-500' : 'text-[#fff8f0] group-hover:text-amber-100'}`}>
              {beat.title}
            </h3>
            <div className="text-[#8c7a6b] text-xs mt-1 flex items-center gap-2">
               <span>Fabio DMS</span>
               {beat.youtubeId && <Youtube className="w-3 h-3 text-red-500" />}
            </div>
            
            <div className="mt-3 flex items-center justify-between">
               <div className="flex flex-col">
                  <span className="text-[10px] text-[#5c4a3e] uppercase font-bold tracking-wider">À partir de</span>
                  <span className="text-[#fff8f0] font-bold font-mono">{lowestPrice}€</span>
               </div>
               <button 
                  onClick={toggleModal}
                  className="text-xs px-4 py-2 rounded-full font-bold flex items-center gap-2 transition-all shadow-md bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-900/20"
               >
                  <ShoppingCart className="w-3 h-3" />
                  Acheter
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* LARGE LICENSE MODAL */}
      {showLicenseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowLicenseModal(false)} />
          
          <div className="relative w-full max-w-4xl bg-[#1a120b] border border-[#3d2b1f] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            {/* Header Modal */}
            <div className="p-6 border-b border-[#3d2b1f] flex justify-between items-center bg-[#120a05]">
              <div className="flex items-center gap-4">
                <img src={beat.coverUrl} className="w-16 h-16 rounded-xl object-cover border border-[#3d2b1f]" alt={beat.title} />
                <div>
                  <h2 className="text-xl font-bold text-white">{beat.title}</h2>
                  <p className="text-amber-500 text-sm font-medium">Choisissez votre licence (MP3 ou WAV)</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {cartCount > 0 && (
                   <button 
                    onClick={handleOpenCartFromModal}
                    className="hidden sm:flex items-center gap-2 bg-[#2a1e16] text-amber-500 px-4 py-2 rounded-full border border-amber-900/30 text-xs font-black hover:bg-amber-900/20 transition-all"
                   >
                     RETOUR AU PANIER <ArrowRight className="w-3 h-3" />
                   </button>
                )}
                <button onClick={() => setShowLicenseModal(false)} className="p-2 hover:bg-[#2a1e16] rounded-full text-[#8c7a6b] transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* License Grid */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar">
              {beat.licenses.map((lic) => (
                <div 
                  key={lic.id} 
                  className={`group relative p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                    lic.fileType === 'EXCLUSIVE' 
                    ? 'bg-gradient-to-br from-[#2a1e16] to-[#1a120b] border-amber-600/30' 
                    : 'bg-[#120a05] border-[#3d2b1f] hover:border-[#5c4a3e]'
                  }`}
                >
                  {lic.fileType === 'EXCLUSIVE' && (
                    <div className="absolute top-4 right-4 bg-amber-600 text-[#1a120b] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                      Propriété Totale
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-xl border ${
                        lic.fileType === 'MP3' ? 'bg-blue-900/10 border-blue-900/30' :
                        lic.fileType === 'WAV' ? 'bg-cyan-900/10 border-cyan-900/30' :
                        lic.fileType === 'TRACKOUT' ? 'bg-orange-900/10 border-orange-900/30' :
                        'bg-amber-900/10 border-amber-900/30'
                      }`}>
                        {getLicenseIcon(lic.fileType, "w-6 h-6")}
                      </div>
                      <div>
                        <h4 className="font-black text-white text-lg tracking-tight">{lic.name}</h4>
                        <span className="text-[10px] text-[#8c7a6b] font-bold uppercase tracking-widest">FORMAT {lic.fileType}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-8">
                      {lic.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-[#a89080]">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      <div className="flex items-start gap-2 text-xs text-[#a89080]">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Usage : {lic.streamsLimit === 'Unlimited' ? 'Streams Illimités' : `${Number(lic.streamsLimit).toLocaleString()} Streams Max`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#3d2b1f] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#5c4a3e] uppercase font-bold block">Prix</span>
                      <span className="text-2xl font-black text-white">{lic.price}€</span>
                    </div>
                    <button 
                      onClick={(e) => handleAddToCart(e, lic)}
                      className={`px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-lg ${
                        lic.fileType === 'EXCLUSIVE'
                        ? 'bg-amber-600 text-black hover:bg-amber-500 shadow-amber-900/20'
                        : 'bg-[#2a1e16] text-[#d4a373] hover:bg-[#3d2b1f] border border-[#3d2b1f]'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      AJOUTER AU PANIER
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Back to Cart Button */}
            <div className="sm:hidden p-4 bg-[#120a05] border-t border-[#3d2b1f]">
               {cartCount > 0 && (
                 <button 
                  onClick={handleOpenCartFromModal}
                  className="w-full flex items-center justify-center gap-2 bg-[#2a1e16] text-amber-500 px-4 py-3 rounded-xl border border-amber-900/30 text-xs font-black"
                 >
                   RETOUR AU PANIER ({cartCount})
                 </button>
               )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-[#120a05] border-t border-[#3d2b1f] text-center hidden sm:block">
              <p className="text-[10px] text-[#5c4a3e] uppercase font-bold tracking-widest">
                Contrat de licence instantané envoyé par email après paiement
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
