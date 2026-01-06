
import React, { useEffect, useState } from 'react';
import { ARTIST_NAME } from '../constants';
import { BeatCard } from '../components/BeatCard';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Music4, Headphones, Crown, Layers, GraduationCap, ChevronRight, Zap, Music, User, Video } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { getAllBeats } from '../services/dbService';
import { Beat } from '../types';

export const Home: React.FC = () => {
  const { playBeat, currentBeat, isPlaying } = usePlayer();
  const navigate = useNavigate();
  const [displayBeats, setDisplayBeats] = useState<Beat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeBeats = async () => {
      try {
        const dbBeats = await getAllBeats();
        if (Array.isArray(dbBeats) && dbBeats.length > 0) {
          const validDbBeats = dbBeats.filter(b => b && typeof b === 'object');
          setDisplayBeats(validDbBeats.slice(0, 4));
        } else {
          setDisplayBeats([]);
        }
      } catch (error) {
        console.error("Erreur chargement beats home:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeBeats();
  }, []);

  const featuredBeat = displayBeats.length > 0 ? displayBeats[0] : null;

  const handlePlayFeatured = (e: React.MouseEvent) => {
    e.preventDefault();
    if (featuredBeat) playBeat(featuredBeat);
  };

  const isFeaturedPlaying = isPlaying && featuredBeat && currentBeat?.id === featuredBeat.id;

  return (
    <div className="flex flex-col gap-14 pb-24">
      
      {/* SECTION BANNIÈRE - STYLE STUDIO PRO */}
      <section className="relative h-[450px] md:h-[500px] rounded-[2rem] overflow-hidden group shadow-2xl border border-[#2a2a2a]">
        <img 
          src={featuredBeat?.coverUrl || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop"} 
          alt="Studio Banner" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 saturate-[1.1] transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/40 to-transparent"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
           <div className="animate-in slide-in-from-bottom-6 duration-700">
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl mb-2">
                  {ARTIST_NAME}
                </h1>
                <p className="text-xl md:text-2xl text-amber-500 font-bold uppercase tracking-[0.3em] mb-8 drop-shadow-lg">
                   Beatmaker & Producer
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {featuredBeat ? (
                    <button 
                      onClick={handlePlayFeatured} 
                      className="bg-white text-black font-black px-8 py-4 rounded-xl hover:bg-amber-500 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 group/btn"
                    >
                        {isFeaturedPlaying ? (
                          <div className="flex gap-1 items-end h-4">
                            {[1,2,3].map(i => <div key={i} className="w-1 bg-black animate-pulse" style={{height: `${i*33}%`}}></div>)}
                          </div>
                        ) : <Play className="w-5 h-5 fill-current group-hover/btn:scale-125 transition-transform" />}
                        {isFeaturedPlaying ? 'EN LECTURE' : 'ÉCOUTER MAINTENANT'}
                    </button>
                  ) : (
                    <button onClick={() => navigate('/beats')} className="bg-white text-black font-black px-8 py-4 rounded-xl hover:bg-amber-500 transition-colors uppercase text-xs tracking-widest">
                       VOIR LE CATALOGUE
                    </button>
                  )}
                  
                  <Link 
                    to="/masterclass" 
                    className="bg-black/60 backdrop-blur-md text-white font-black px-8 py-4 rounded-xl hover:bg-white hover:text-black transition-all border border-white/20 uppercase text-xs tracking-widest flex items-center justify-center gap-2 active:scale-95"
                  >
                      <GraduationCap className="w-5 h-5" /> MASTERCLASS
                  </Link>
                </div>
           </div>
        </div>
      </section>

      {/* TARIFS BEATMAKING - GRID PRO */}
      <section className="px-2">
        <div className="flex items-center justify-between mb-8 border-b border-[#2a2a2a] pb-4">
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
              <Headphones className="w-8 h-8 text-amber-500" /> Licences & Tarifs
            </h2>
            <Link to="/beats" className="text-[#8c7a6b] hover:text-white font-bold text-xs uppercase tracking-widest flex items-center gap-1 transition-colors">
               Tout voir <ChevronRight className="w-4 h-4" />
            </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
                { name: 'MP3 LEASE', price: '29.99', icon: <Music className="text-blue-400" />, features: ['MP3 Untagged', '500k Streams', 'Usage Commercial'] },
                { name: 'WAV LEASE', price: '49.99', icon: <Music4 className="text-cyan-400" />, features: ['WAV + MP3', 'Unlimited Streams', 'Radio Ready'] },
                { name: 'TRACKOUT', price: '99.99', icon: <Layers className="text-orange-400" />, features: ['Stems (Pistes séparées)', 'Unlimited Streams', 'Idéal Studio'] },
                { name: 'EXCLUSIF', price: 'Sur devis', icon: <Crown className="text-amber-500" />, features: ['Droits exclusifs', 'Retrait du catalogue', 'Publishing 50/50'] },
            ].map((tier, i) => (
                <div key={i} className="p-6 rounded-2xl bg-[#121212] border border-[#2a2a2a] hover:border-amber-500/30 transition-all flex flex-col justify-between group h-full hover:-translate-y-1">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                           <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center border border-[#3d2b1f]">
                              {tier.icon}
                           </div>
                           <span className="text-2xl font-black text-white">{tier.price}<span className="text-sm align-top">€</span></span>
                        </div>
                        <h3 className="font-black text-lg text-[#fff8f0] uppercase mb-4 tracking-tight">{tier.name}</h3>
                        <ul className="space-y-2 mb-6">
                           {tier.features.map((f, idx) => (
                             <li key={idx} className="text-[10px] text-[#8c7a6b] font-bold uppercase tracking-wide flex items-center gap-2">
                               <div className="w-1 h-1 rounded-full bg-amber-500"></div> {f}
                             </li>
                           ))}
                        </ul>
                    </div>
                    <button 
                      onClick={() => navigate('/beats')} 
                      className="w-full py-3 rounded-lg bg-[#1a1a1a] text-white font-black uppercase text-[10px] hover:bg-white hover:text-black transition-all border border-[#2a2a2a] hover:border-transparent active:scale-95"
                    >
                      Choisir
                    </button>
                </div>
            ))}
        </div>
      </section>

      {/* MASTERCLASS SECTION */}
      <section className="px-2">
        <div className="flex items-center justify-between mb-8 border-b border-[#2a2a2a] pb-4">
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-emerald-500" /> Formation
            </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* CARTE MASTERCLASS 1 */}
             <div className="relative rounded-[2rem] overflow-hidden border border-[#2a2a2a] bg-[#121212] flex flex-col md:flex-row group">
                <div className="p-8 flex flex-col h-full w-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-emerald-900/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
                             <User className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">Populaire</span>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 uppercase italic">Mentorat Privé</h3>
                    <p className="text-[#a89080] text-sm mb-6">
                        2 heures de coaching 1-on-1. Analyse de tes prods, mixage et conseils carrière personnalisés.
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-[#2a2a2a]">
                        <span className="text-2xl font-black text-white">149€</span>
                        <button className="bg-emerald-600 text-white font-black px-6 py-2.5 rounded-lg text-xs uppercase hover:bg-emerald-500 transition-colors">
                            Réserver
                        </button>
                    </div>
                </div>
             </div>

             {/* CARTE MASTERCLASS 2 */}
             <div className="relative rounded-[2rem] overflow-hidden border border-[#2a2a2a] bg-[#121212] flex flex-col md:flex-row group">
                <div className="p-8 flex flex-col h-full w-full">
                     <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-amber-900/20 rounded-xl flex items-center justify-center border border-amber-500/20">
                             <Video className="w-6 h-6 text-amber-500" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 uppercase italic">Pack Formation Vidéo</h3>
                    <p className="text-[#a89080] text-sm mb-6">
                        Accès immédiat à 10h de vidéos. Apprends mes techniques de composition pour les placements Afro/Pop.
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-[#2a2a2a]">
                        <span className="text-2xl font-black text-white">97€</span>
                        <button onClick={() => navigate('/masterclass')} className="bg-white text-black font-black px-6 py-2.5 rounded-lg text-xs uppercase hover:bg-amber-500 transition-colors">
                            Voir le programme
                        </button>
                    </div>
                </div>
             </div>
        </div>
      </section>

      {/* SECTION DERNIERS BEATS */}
      <section className="px-2">
        <div className="flex items-center justify-between mb-8 border-b border-[#2a2a2a] pb-4">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
            <Zap className="w-8 h-8 text-amber-500" /> Nouveautés
          </h2>
        </div>
        
        {displayBeats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayBeats.map((beat) => (
                <BeatCard 
                  key={beat.id} 
                  beat={beat} 
                  onPurchase={() => navigate('/beats')} 
                />
              ))}
            </div>
        ) : (
            <div className="py-20 text-center border-2 border-dashed border-[#2a2a2a] rounded-[2rem] flex flex-col items-center justify-center opacity-50">
                <Music className="w-12 h-12 mb-4 text-[#5c4a3e]" />
                <p className="text-lg font-bold text-[#8c7a6b]">
                    {isLoading ? "Chargement du catalogue..." : "Aucune production disponible pour le moment"}
                </p>
            </div>
        )}
      </section>
    </div>
  );
};
