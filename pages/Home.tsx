
import React, { useState, useEffect } from 'react';
import { FEATURED_BEATS, MASTERCLASSES } from '../constants';
import { BeatCard } from '../components/BeatCard';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Music4, ArrowRight, Star, CheckCircle2, Headphones, Crown, Layers } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { Beat } from '../types';
import { getAllBeats } from '../services/dbService';

export const Home: React.FC = () => {
  const { playBeat, currentBeat, isPlaying } = usePlayer();
  const [allBeats, setAllBeats] = useState<Beat[]>(FEATURED_BEATS);
  const navigate = useNavigate();

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
    <div className="flex flex-col gap-16 pb-24">
      
      {/* CHANNEL HERO */}
      <section className="relative h-[450px] rounded-3xl overflow-hidden group border border-[#3d2b1f]">
        <img 
          src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop" 
          alt="Studio Banner" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 p-10 flex flex-col items-start gap-4">
          <div className="flex items-center gap-4">
             <div className="w-20 h-20 rounded-full border-4 border-amber-500 overflow-hidden bg-gradient-to-tr from-amber-600 to-yellow-500 p-0.5">
                <img src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100&h=100&fit=crop" className="w-full h-full rounded-full object-cover" alt="Fabio profile" />
             </div>
             <div>
                <h1 className="text-5xl font-black text-white flex items-center gap-2 tracking-tighter">
                  Fabio DMS <CheckCircle2 className="w-6 h-6 text-blue-400 fill-current" />
                </h1>
                <p className="text-[#a89080] font-medium">1.2M d'auditeurs • Multi-Platine Producer</p>
             </div>
          </div>
          <div className="flex gap-3">
             <button onClick={handlePlayFeatured} className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-gray-200 transition-all flex items-center gap-2 shadow-xl">
                {isFeaturedPlaying ? 'En lecture...' : 'Dernier Release'}
             </button>
             <Link to="/masterclass" className="bg-[#2a2a2a] text-white font-bold px-8 py-3 rounded-full hover:bg-[#3f3f3f] transition-all border border-[#3d2b1f]">
                S'abonner aux Masterclass
             </Link>
          </div>
        </div>
      </section>

      {/* PRICING GRID */}
      <section>
        <div className="flex items-center gap-3 mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">Tarifs de Production</h2>
            <div className="h-px flex-1 bg-[#3d2b1f]"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
                { name: 'Lease MP3', price: '29.99', icon: <Headphones className="text-blue-400" />, desc: 'Idéal pour maquettes', color: 'border-blue-900/50' },
                { name: 'Lease WAV', price: '49.99', icon: <Music4 className="text-cyan-400" />, desc: 'Qualité studio Pro', color: 'border-cyan-900/50' },
                { name: 'Trackout', price: '99.99', icon: <Layers className="text-orange-400" />, desc: 'Mixage complet illimité', color: 'border-orange-900/50' },
                { name: 'Exclusif', price: 'Sur devis', icon: <Crown className="text-amber-500" />, desc: 'Propriété totale', color: 'border-amber-500/50 bg-amber-900/10' },
            ].map((tier, i) => (
                <div key={i} className={`p-6 rounded-2xl border ${tier.color} bg-[#1a120b] hover:scale-[1.02] transition-transform shadow-lg shadow-black/20 flex flex-col justify-between`}>
                    <div>
                        <div className="mb-4">{tier.icon}</div>
                        <h3 className="font-bold text-xl text-white">{tier.name}</h3>
                        <p className="text-2xl font-black text-amber-500 mt-2">{tier.price}{tier.price !== 'Sur devis' ? '€' : ''}</p>
                        <p className="text-sm text-[#8c7a6b] mt-2">{tier.desc}</p>
                    </div>
                    <button 
                        onClick={() => navigate('/beats')}
                        className="w-full mt-6 py-2 rounded-lg bg-[#2a1e16] text-[#d4a373] font-bold hover:bg-[#3d2b1f] transition-colors border border-[#3d2b1f]"
                    >
                        Acheter
                    </button>
                </div>
            ))}
        </div>
      </section>

      {/* MASTERCLASSES */}
      <section>
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">Masterclass en Vedette</h2>
            <Link to="/masterclass" className="text-amber-500 font-bold hover:underline flex items-center gap-2">
                Voir toutes les vidéos <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MASTERCLASSES.map(mc => (
                <div key={mc.id} className="group relative rounded-2xl overflow-hidden border border-[#3d2b1f] bg-[#1a120b] hover:border-amber-500/50 transition-all shadow-xl">
                    <div className="aspect-video relative">
                        <img src={mc.thumbnailUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={mc.title} />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl">
                                <Play className="w-8 h-8 text-white fill-current ml-1" />
                            </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-bold text-white">
                           {mc.duration}
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">{mc.title}</h3>
                            <span className="text-xl font-black text-amber-500">{mc.price}€</span>
                        </div>
                        <p className="text-sm text-[#8c7a6b] line-clamp-2 mb-4">{mc.description}</p>
                        <div className="flex items-center gap-4">
                            <span className="text-xs bg-[#2a1e16] text-[#a89080] px-2 py-1 rounded border border-[#3d2b1f]">{mc.level}</span>
                            <span className="text-xs text-blue-400 font-bold flex items-center gap-1"><Star className="w-3 h-3 fill-current" /> Populaire</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* LATEST BEATS */}
      <section>
        <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">Derniers Beats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allBeats.slice(0, 8).map(beat => (
            <BeatCard key={beat.id} beat={beat} />
          ))}
        </div>
      </section>

    </div>
  );
};
