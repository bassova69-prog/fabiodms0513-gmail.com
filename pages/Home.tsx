
import React from 'react';
import { FEATURED_BEATS, MASTERCLASSES, PROFILE_IMAGE_URL, ARTIST_NAME } from '../constants';
import { BeatCard } from '../components/BeatCard';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Music4, Headphones, Crown, Layers, GraduationCap, ChevronRight, Zap } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';

export const Home: React.FC = () => {
  const { playBeat, currentBeat, isPlaying } = usePlayer();
  const navigate = useNavigate();

  const featuredBeat = FEATURED_BEATS[0];

  const handlePlayFeatured = (e: React.MouseEvent) => {
    e.preventDefault();
    if (featuredBeat) playBeat(featuredBeat);
  };

  const isFeaturedPlaying = isPlaying && currentBeat?.id === featuredBeat?.id;

  return (
    <div className="flex flex-col gap-12 pb-24">
      
      {/* SECTION BANNIÈRE YOUTUBE STYLE */}
      <section className="relative h-[500px] rounded-[2.5rem] overflow-hidden group border border-[#2a2a2a] shadow-2xl">
        {/* Image de fond : Studio d'enregistrement ambiance Afrobeat / Chaleureuse */}
        <img 
          src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop" 
          alt="Afrobeat Recording Studio" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 saturate-[1.1] transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/40 to-transparent"></div>
        
        {/* Motifs géométriques subtils */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')] pointer-events-none"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
           <div className="animate-in slide-in-from-bottom-4 duration-700 relative z-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">
                      {ARTIST_NAME}
                    </h1>
                </div>
                <p className="text-amber-500 font-black uppercase tracking-[0.4em] text-xs md:text-base mb-10 bg-black/40 backdrop-blur-sm px-4 py-1 rounded-full inline-block border border-amber-500/20">
                   <Zap className="w-4 h-4 inline mr-2 animate-pulse" /> Platinum Beatmaker • Afro Love
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={handlePlayFeatured} 
                    className="bg-white text-black font-black px-12 py-5 rounded-2xl hover:bg-amber-500 transition-all flex items-center gap-3 uppercase text-sm shadow-[0_10px_30px_rgba(255,255,255,0.1)] active:scale-95 group/btn"
                  >
                      {isFeaturedPlaying ? (
                        <div className="flex gap-1 items-end h-4">
                          {[1,2,3].map(i => <div key={i} className="w-1 bg-black animate-pulse" style={{height: `${i*33}%`}}></div>)}
                        </div>
                      ) : <Play className="w-5 h-5 fill-current group-hover/btn:scale-125 transition-transform" />}
                      {isFeaturedPlaying ? 'EN LECTURE' : 'Écouter le dernier Beat'}
                  </button>
                  <Link 
                    to="/masterclass" 
                    className="bg-black/60 backdrop-blur-md text-white font-black px-10 py-5 rounded-2xl hover:bg-white hover:text-black transition-all border border-white/20 uppercase text-sm flex items-center gap-2 active:scale-95"
                  >
                      <GraduationCap className="w-5 h-5" /> Masterclasses
                  </Link>
                </div>
           </div>
        </div>
      </section>

      {/* TARIFS BEATMAKING */}
      <section className="px-2">
        <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
              Tarifs <span className="text-amber-500">prod</span> Beat
            </h2>
            <Link to="/beats" className="text-amber-500 font-bold flex items-center gap-1 hover:underline text-sm uppercase tracking-widest">
               Catalogue complet <ChevronRight className="w-4 h-4" />
            </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { name: 'MP3 LEASE', price: '29.99', icon: <Headphones className="text-blue-400" />, features: ['MP3 Untagged', '500k Streams', 'Usage Commercial'] },
                { name: 'WAV LEASE', price: '49.99', icon: <Music4 className="text-cyan-400" />, features: ['WAV + MP3 High Res', 'Unlimited Streams', 'Radio Ready'] },
                { name: 'TRACKOUT', price: '99.99', icon: <Layers className="text-orange-400" />, features: ['Stems séparées (Vocal mix ready)', 'Unlimited Streams', 'Idéal pour Studio'] },
                { name: 'EXCLUSIF', price: 'Sur devis', icon: <Crown className="text-amber-500" />, features: ['Contrat de cession unique', 'Retiré de la vente', 'Production sur mesure'] },
            ].map((tier, i) => (
                <div key={i} className="p-8 rounded-[2rem] bg-[#121212] border border-[#2a2a2a] hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/5 transition-all flex flex-col justify-between h-full group">
                    <div>
                        <div className="mb-6 bg-[#1a1a1a] w-14 h-14 rounded-2xl flex items-center justify-center border border-[#2a2a2a] group-hover:scale-110 transition-transform shadow-lg">{tier.icon}</div>
                        <h3 className="font-black text-xl text-white uppercase mb-2 tracking-tight">{tier.name}</h3>
                        <div className="text-3xl font-black text-amber-500 mb-8 flex items-baseline gap-1">
                          {tier.price}{tier.price.includes('.') ? <span className="text-lg">€</span> : ''}
                        </div>
                        <ul className="space-y-4 mb-10">
                           {tier.features.map((f, idx) => (
                             <li key={idx} className="text-[10px] text-[#8c7a6b] font-black uppercase tracking-widest flex items-center gap-3">
                               <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div> {f}
                             </li>
                           ))}
                        </ul>
                    </div>
                    <button 
                      onClick={() => navigate('/beats')} 
                      className="w-full py-4 rounded-xl bg-[#1a1a1a] text-white font-black uppercase text-xs hover:bg-amber-600 hover:text-black transition-all border border-[#2a2a2a] hover:border-transparent active:scale-95 shadow-md"
                    >
                      Commander
                    </button>
                </div>
            ))}
        </div>
      </section>

      {/* DERNIÈRES PRODUCTIONS */}
      <section className="px-2">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
            Derniers <span className="text-amber-500">Beats</span> mis en ligne
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_BEATS.slice(0, 4).map(beat => (
            <BeatCard 
              key={beat.id} 
              beat={beat} 
              onPurchase={() => navigate('/beats')} 
            />
          ))}
        </div>
      </section>
    </div>
  );
};
