
import React, { useState, useEffect } from 'react';
import { FEATURED_BEATS, MASTERCLASSES, PROFILE_IMAGE_URL, ARTIST_NAME } from '../constants';
import { BeatCard } from '../components/BeatCard';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Music4, Star, CheckCircle2, Headphones, Crown, Layers, GraduationCap, ChevronRight, Zap, User } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { Beat } from '../types';
import { getAllBeats } from '../services/dbService';

export const Home: React.FC = () => {
  const { playBeat, currentBeat, isPlaying } = usePlayer();
  const [allBeats, setAllBeats] = useState<Beat[]>(FEATURED_BEATS);
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadBeats = async () => {
      try {
        const savedCustomBeats = await getAllBeats();
        setAllBeats([...[...savedCustomBeats].reverse(), ...FEATURED_BEATS]);
      } catch (e) {
        console.error("Error loading beats:", e);
      }
    };
    loadBeats();
  }, []);

  const featuredBeat = allBeats[0] || FEATURED_BEATS[0];

  const handlePlayFeatured = (e: React.MouseEvent) => {
    e.preventDefault();
    if (featuredBeat) playBeat(featuredBeat);
  };

  const isFeaturedPlaying = isPlaying && currentBeat?.id === featuredBeat?.id;

  return (
    <div className="flex flex-col gap-16 pb-32">
      <section className="relative h-[480px] rounded-[2.5rem] overflow-hidden group border border-[#3d2b1f] shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop" 
          alt="Studio Fabio DMS" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-[2000ms] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-10 md:p-14 flex flex-col items-start gap-6 w-full">
          <div className="flex items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-amber-500 overflow-hidden bg-[#1a120b] p-1 shadow-[0_0_50px_rgba(245,158,11,0.4)] transition-all hover:scale-110 hover:shadow-amber-500/60 flex items-center justify-center">
                {!imageError ? (
                  <img src={PROFILE_IMAGE_URL} className="w-full h-full rounded-full object-cover" alt={ARTIST_NAME} onError={() => setImageError(true)} />
                ) : (
                  <User className="w-16 h-16 text-[#3d2b1f]" />
                )}
             </div>
             <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">{ARTIST_NAME}</h1>
                    <div className="bg-blue-400 p-1 rounded-full shadow-lg shadow-blue-500/20"><CheckCircle2 className="w-5 h-5 text-white fill-current" /></div>
                </div>
                <p className="text-amber-500 font-black uppercase tracking-[0.3em] text-sm mt-2 flex items-center gap-2"><Zap className="w-4 h-4 fill-current" /> Platinum Producer • Afro Love & Kompa</p>
             </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 animate-in fade-in slide-in-from-bottom-12 duration-1000">
             <button onClick={handlePlayFeatured} className="bg-white text-black font-black px-10 py-5 rounded-2xl hover:bg-amber-500 transition-all flex items-center gap-4 shadow-2xl active:scale-95 text-sm uppercase tracking-widest">
                {isFeaturedPlaying ? <>EN LECTURE...</> : <><Play className="w-6 h-6 fill-current" /> Écouter le dernier Beat</>}
             </button>
             <Link to="/masterclass" className="bg-[#2a1e16]/60 backdrop-blur-xl text-white font-black px-10 py-5 rounded-2xl hover:bg-[#3d2b1f] transition-all border border-[#3d2b1f] text-sm uppercase tracking-widest flex items-center gap-3"><GraduationCap className="w-6 h-6" /> Masterclasses</Link>
          </div>
        </div>
      </section>
      {/* ... reste de la page ... */}
    </div>
  );
};
