
import React, { useRef, useState } from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { useCart } from '../contexts/CartContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ShoppingCart } from 'lucide-react';

export const BottomPlayer: React.FC = () => {
  const { 
    currentBeat, isPlaying, togglePlay, progress, seek, 
    currentTime, duration, volume, setVolume, nextTrack, prevTrack 
  } = usePlayer();
  
  const { toggleCart, cartCount } = useCart();
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);

  if (!currentBeat) return null;

  const lowestPrice = currentBeat.licenses?.[0]?.price || 0;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const percentage = (x / width) * 100;
      seek(Math.max(0, Math.min(100, percentage)));
    }
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (volumeBarRef.current) {
      const rect = volumeBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const newVolume = x / width;
      setVolume(newVolume);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#1a120b] border-t border-[#3d2b1f] z-50 flex items-center px-4 md:px-8 shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
      
      {/* Barre de progression interactive */}
      <div 
        ref={progressBarRef}
        className="absolute -top-3 left-0 right-0 h-6 cursor-pointer group z-50 flex items-center"
        onClick={handleProgressClick}
        onMouseEnter={() => setIsHoveringProgress(true)}
        onMouseLeave={() => setIsHoveringProgress(false)}
      >
        <div className="w-full h-1 bg-[#2a1e16] relative transition-all group-hover:h-2">
            <div 
              className="absolute top-0 left-0 h-full bg-amber-500 transition-all duration-100 ease-linear shadow-[0_0_10px_#f59e0b]"
              style={{ width: `${progress}%` }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border-2 border-amber-500"
              style={{ left: `${progress}%`, marginLeft: '-8px' }}
            />
            {/* Tooltip temps au survol */}
            {isHoveringProgress && (
              <div className="absolute -top-10 bg-black text-white text-[10px] px-2 py-1 rounded font-bold pointer-events-none" style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            )}
        </div>
      </div>
      
      <div className="flex items-center w-full max-w-7xl mx-auto gap-4 md:gap-8 pt-1">
        
        {/* Infos du morceau */}
        <div className="flex items-center gap-3 w-1/3 min-w-0">
            <img src={currentBeat.coverUrl} alt="Cover" className="w-12 h-12 rounded bg-[#2a1e16] object-cover border border-[#3d2b1f]" />
            <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-[#fff8f0] text-sm truncate">{currentBeat.title}</span>
                <span className="text-amber-600 text-[10px] truncate font-black uppercase tracking-widest">Fabio DMS</span>
            </div>
        </div>

        {/* Contrôles principaux */}
        <div className="flex flex-1 justify-center items-center gap-4 md:gap-6">
            <button onClick={prevTrack} className="text-[#8c7a6b] hover:text-white transition-colors p-2">
                <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button 
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 hover:bg-amber-500 transition-all shadow-xl"
            >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
            </button>
            <button onClick={nextTrack} className="text-[#8c7a6b] hover:text-white transition-colors p-2">
                <SkipForward className="w-5 h-5 fill-current" />
            </button>
        </div>

        {/* Volume / Panier / Prix */}
        <div className="flex items-center justify-end w-1/3 gap-3">
             <div className="hidden lg:flex items-center gap-3 mr-4">
                <button onClick={() => setVolume(volume > 0 ? 0 : 0.8)}>
                  {volume === 0 ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-[#8c7a6b]" />}
                </button>
                <div 
                  ref={volumeBarRef}
                  className="w-24 h-1 bg-[#3d2b1f] rounded-full overflow-hidden cursor-pointer relative group"
                  onClick={handleVolumeClick}
                >
                    <div 
                      className="absolute inset-y-0 left-0 bg-white group-hover:bg-amber-500 transition-colors"
                      style={{ width: `${volume * 100}%` }}
                    />
                </div>
             </div>
             
             <button 
                onClick={toggleCart}
                className="relative flex items-center gap-3 px-4 py-2 bg-[#2a1e16] hover:bg-[#3d2b1f] text-amber-500 rounded-xl border border-[#3d2b1f] transition-all group"
             >
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline font-black text-[10px] tracking-widest uppercase">Panier</span>
                {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-white text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg border border-amber-500">
                        {cartCount}
                    </span>
                )}
             </button>

             <div className="ml-2 font-black text-[#fff8f0] whitespace-nowrap bg-emerald-950/20 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-900/30 text-sm hidden sm:block">
                 {lowestPrice}€
             </div>
        </div>
      </div>
    </div>
  );
};
