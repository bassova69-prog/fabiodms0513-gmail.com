
import React from 'react';
import { Play, ShoppingCart, Youtube, Tag, BarChart3, Calendar, Zap } from 'lucide-react';
import { Beat, StorePromotion } from '../types';
import { usePlayer } from '../contexts/PlayerContext';

interface BeatCardProps {
  beat: Beat;
  promo?: StorePromotion | null;
  onPurchase: (beat: Beat) => void;
}

export const BeatCard: React.FC<BeatCardProps> = ({ beat, promo, onPurchase }) => {
  const { playBeat, currentBeat, isPlaying } = usePlayer();

  if (!beat) return null;

  const isCurrent = currentBeat?.id === beat.id;
  const isCurrentAndPlaying = isCurrent && isPlaying;
  
  const originalLowestPrice = beat.licenses?.[0]?.price || 0;
  
  // Modification : On applique la réduction seulement si ce n'est PAS un Bulk Deal
  const lowestPrice = promo && promo.isActive && promo.type !== 'BULK_DEAL'
    ? Number((originalLowestPrice * (1 - promo.discountPercentage / 100)).toFixed(2))
    : originalLowestPrice;

  const handleCardClick = () => {
    playBeat(beat);
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPurchase(beat);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const displayTags = Array.isArray(beat.tags) ? beat.tags.slice(0, 3) : [];

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative flex flex-col bg-[#1a120b] rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-900/20 cursor-pointer h-full ${isCurrent ? 'border-amber-500 shadow-lg shadow-amber-900/10' : 'border-[#3d2b1f] hover:border-amber-500/50'}`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[#2a1e16]">
        <img 
          src={beat.cover_url || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80'} 
          alt={beat.title || 'Beat'} 
          className={`w-full h-full object-cover transition-transform duration-700 ${isCurrentAndPlaying ? 'scale-110 saturate-150' : 'group-hover:scale-105'}`}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a120b] via-transparent to-transparent opacity-60"></div>

        <div className={`absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] transition-all duration-300 ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
             <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-300 ${isCurrentAndPlaying ? 'bg-amber-500 text-black scale-110' : 'bg-white/10 border border-white/20 text-white hover:bg-amber-500 hover:text-black hover:scale-110 hover:border-transparent'}`}>
               {isCurrentAndPlaying ? (
                 <div className="flex gap-1 items-end h-3">
                    <div className="w-0.5 bg-black animate-[bounce_1s_infinite] h-2"></div>
                    <div className="w-0.5 bg-black animate-[bounce_1.2s_infinite] h-3"></div>
                    <div className="w-0.5 bg-black animate-[bounce_0.8s_infinite] h-2.5"></div>
                 </div>
               ) : (
                 <Play className="w-4 h-4 fill-current ml-0.5" />
               )}
             </div>
        </div>

        <div className="absolute top-2 left-2 right-2 flex justify-between">
          <div className="flex gap-1">
            {promo && promo.isActive && (
                promo.type === 'BULK_DEAL' ? (
                    <div className="bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 fill-current" /> OFFRE
                    </div>
                ) : (
                    <div className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 fill-current" /> -{promo.discountPercentage}%
                    </div>
                )
            )}
          </div>
          <div className="flex gap-1">
            {beat.bpm && (
                <div className="bg-black/60 backdrop-blur-md text-white text-[8px] font-bold px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1">
                    <BarChart3 className="w-2.5 h-2.5" /> {beat.bpm}
                </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-3 flex flex-col flex-1 gap-2 relative">
          {isCurrentAndPlaying && (
               <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-500/20">
                   <div className="h-full bg-amber-500 animate-[pulse_2s_infinite]"></div>
               </div>
          )}

          <div>
              <h3 className={`font-black text-sm line-clamp-1 leading-tight mb-0.5 ${isCurrent ? 'text-amber-500' : 'text-white group-hover:text-amber-100'}`}>
              {beat.title || 'Untitled Beat'}
              </h3>
              <div className="flex items-center justify-between min-h-[16px]">
                  <span className="text-[#8c7a6b] text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      Fabio DMS {beat.key && <span className="text-[#5c4a3e]">• {beat.key}</span>}
                  </span>
                  {beat.youtube_id && <Youtube className="w-3 h-3 text-red-600 opacity-80" />}
              </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-0.5 min-h-[20px]">
               {beat.date && (
                   <span className="flex items-center gap-1 text-[8px] text-[#5c4a3e] font-bold bg-[#1a120b] border border-[#2a1e16] px-1.5 py-0.5 rounded">
                       <Calendar className="w-2.5 h-2.5" /> {formatDate(beat.date)}
                   </span>
               )}
              {displayTags.map((tag, i) => (
                  <span key={i} className="text-[8px] px-1.5 py-px bg-[#2a1e16] border border-[#3d2b1f] rounded text-[#a89080] whitespace-nowrap">
                      #{tag}
                  </span>
              ))}
          </div>
          
          <div className="mt-auto pt-2 flex items-center justify-between gap-2 border-t border-[#2a1e16]">
             <div className="flex flex-col">
                <span className="text-[8px] text-[#5c4a3e] uppercase font-bold tracking-wider">À partir de</span>
                <div className="flex items-baseline gap-1.5">
                    <span className={`font-black text-base ${promo && promo.isActive ? 'text-emerald-400' : 'text-white'}`}>{lowestPrice}€</span>
                    {/* On cache le prix barré si c'est un Bulk Deal */}
                    {promo && promo.isActive && promo.type !== 'BULK_DEAL' && (
                        <span className="text-[9px] text-[#5c4a3e] line-through decoration-red-500/50">{originalLowestPrice}€</span>
                    )}
                </div>
             </div>
             
             <button 
                onClick={handleBuyClick}
                className="flex-1 max-w-[100px] bg-[#fff8f0] hover:bg-amber-500 text-black font-black text-[9px] uppercase tracking-widest py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-95"
             >
                <ShoppingCart className="w-3 h-3" />
                <span>Acheter</span>
             </button>
          </div>
      </div>
    </div>
  );
};
