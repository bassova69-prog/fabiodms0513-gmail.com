
import React from 'react';
import { FEATURED_BEATS, MASTERCLASSES, PROFILE_IMAGE_URL, ARTIST_NAME } from '../constants';
import { BeatCard } from '../components/BeatCard';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Music4, CheckCircle2, Headphones, Crown, Layers, GraduationCap, ChevronRight, Zap } from 'lucide-react';
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
      <section className="relative h-[500px] rounded-3xl overflow-hidden group border border-[#2a2a2a] shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop" 
          alt="Studio Banner" 
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
           {/* MÉDAILLON CENTRAL FABIO - PHOTO OFFICIELLE GITHUB */}
           <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-amber-500 p-1 bg-[#0f0f0f] shadow-[0_0_60px_rgba(245,158,11,0.5)] mb-8 animate-in fade-in zoom-in-95 duration-700">
              <img 
                src={PROFILE_IMAGE_URL} 
                className="w-full h-full rounded-full object-cover" 
                alt={ARTIST_NAME} 
              />
           </div>

           <div className="animate-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
                      {ARTIST_NAME}
                    </h1>
                    <CheckCircle2 className="w-6 h-6 text-blue-400 fill-current" />
                </div>
                <p className="text-amber-500 font-black uppercase tracking-[0.3em] text-xs md:text-sm mb-10">
                   <Zap className="w-4 h-4 inline mr-2" /> Platinum Producer • Afro Love & Kompa
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <button onClick={handlePlayFeatured} className="bg-white text-black font-black px-10 py-5 rounded-2xl hover:bg-amber-500 transition-all flex items-center gap-3 uppercase text-sm shadow-xl active:scale-95">
                      {isFeaturedPlaying ? 'EN LECTURE...' : <><Play className="w-5 h-5 fill-current" /> Dernier Beat</>}
                  </button>
                  <Link to="/masterclass" className="bg-black/60 backdrop-blur-md text-white font-black px-10 py-5 rounded-2xl hover:bg-[#2a2a2a] transition-all border border-[#2a2a2a] uppercase text-sm flex items-center gap-2 active:scale-95">
                      <GraduationCap className="w-5 h-5" /> Masterclasses
                  </Link>
                </div>
           </div>
        </div>
      </section>

      {/* TARIFS BEATMAKING */}
      <section>
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-white uppercase italic">Tarifs <span className="text-amber-500">Licences</span></h2>
            <Link to="/beats" className="text-amber-500 font-bold flex items-center gap-1 hover:underline">
               Voir catalogue <ChevronRight className="w-4 h-4" />
            </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { name: 'MP3 LEASE', price: '29.99', icon: <Headphones className="text-blue-400" />, features: ['MP3 Untagged', '500k Streams'] },
                { name: 'WAV LEASE', price: '49.99', icon: <Music4 className="text-cyan-400" />, features: ['WAV + MP3', 'Unlimited Streams'] },
                { name: 'TRACKOUT', price: '99.99', icon: <Layers className="text-orange-400" />, features: ['Stems séparées', 'Unlimited Streams'] },
                { name: 'EXCLUSIF', price: 'Sur devis', icon: <Crown className="text-amber-500" />, features: ['Unique propriétaire', 'Retiré de la vente'] },
            ].map((tier, i) => (
                <div key={i} className="p-8 rounded-3xl bg-[#121212] border border-[#2a2a2a] hover:border-amber-500/50 transition-all flex flex-col justify-between h-full">
                    <div>
                        <div className="mb-4 bg-[#1a1a1a] w-12 h-12 rounded-xl flex items-center justify-center border border-[#2a2a2a]">{tier.icon}</div>
                        <h3 className="font-black text-xl text-white uppercase mb-2">{tier.name}</h3>
                        <div className="text-3xl font-black text-amber-500 mb-6">{tier.price}{tier.price.includes('.') ? '€' : ''}</div>
                        <ul className="space-y-2 mb-8">
                           {tier.features.map((f, idx) => (
                             <li key={idx} className="text-[11px] text-[#8c8c8c] font-bold uppercase tracking-widest flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40"></div> {f}
                             </li>
                           ))}
                        </ul>
                    </div>
                    <button onClick={() => navigate('/beats')} className="w-full py-3 rounded-lg bg-[#1a1a1a] text-[#fff] font-bold uppercase text-xs hover:bg-amber-600 hover:text-black transition-all">Choisir</button>
                </div>
            ))}
        </div>
      </section>

      {/* DERNIÈRES PRODUCTIONS */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-white uppercase italic">Derniers <span className="text-amber-500">Beats</span></h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_BEATS.slice(0, 4).map(beat => (
            <BeatCard key={beat.id} beat={beat} />
          ))}
        </div>
      </section>
    </div>
  );
};
