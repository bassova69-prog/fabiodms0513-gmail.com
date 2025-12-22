
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
      
      {/* SECTION BANNIÈRE YOUTUBE STYLE */}
      <section className="relative h-[480px] rounded-[2.5rem] overflow-hidden group border border-[#3d2b1f] shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop" 
          alt="Studio Fabio DMS" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-[2000ms] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-black/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 p-10 md:p-14 flex flex-col items-start gap-6 w-full">
          <div className="flex items-center gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
             {/* Médaillon Central de Fabio */}
             <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-amber-500 overflow-hidden bg-[#1a120b] p-1 shadow-[0_0_50px_rgba(245,158,11,0.4)] transition-all hover:scale-110 hover:shadow-amber-500/60 flex items-center justify-center">
                {!imageError ? (
                  <img 
                    src={PROFILE_IMAGE_URL} 
                    className="w-full h-full rounded-full object-cover" 
                    alt={ARTIST_NAME} 
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <User className="w-16 h-16 text-[#3d2b1f]" />
                )}
             </div>
             <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">
                      {ARTIST_NAME}
                    </h1>
                    <div className="bg-blue-400 p-1 rounded-full shadow-lg shadow-blue-500/20">
                      <CheckCircle2 className="w-5 h-5 text-white fill-current" />
                    </div>
                </div>
                <p className="text-amber-500 font-black uppercase tracking-[0.3em] text-sm mt-2 flex items-center gap-2">
                   <Zap className="w-4 h-4 fill-current" /> Platinum Producer • Afro Love & Kompa
                </p>
             </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 animate-in fade-in slide-in-from-bottom-12 duration-1000">
             <button onClick={handlePlayFeatured} className="bg-white text-black font-black px-10 py-5 rounded-2xl hover:bg-amber-500 transition-all flex items-center gap-4 shadow-2xl active:scale-95 text-sm uppercase tracking-widest">
                {isFeaturedPlaying ? (
                  <>EN LECTURE...</>
                ) : (
                  <><Play className="w-6 h-6 fill-current" /> Écouter le dernier Beat</>
                )}
             </button>
             <Link to="/masterclass" className="bg-[#2a1e16]/60 backdrop-blur-xl text-white font-black px-10 py-5 rounded-2xl hover:bg-[#3d2b1f] transition-all border border-[#3d2b1f] text-sm uppercase tracking-widest flex items-center gap-3">
                <GraduationCap className="w-6 h-6" /> Masterclasses
             </Link>
          </div>
        </div>
      </section>

      {/* GRILLE DES TARIFS BEATMAKING */}
      <section className="animate-in fade-in slide-in-from-bottom-16 duration-700">
        <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              Tarifs <span className="text-amber-500 text-stroke">Beatmaking</span>
            </h2>
            <Link to="/beats" className="text-amber-500 font-bold flex items-center gap-2 hover:underline">
               Catalogue Complet <ChevronRight className="w-5 h-5" />
            </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { name: 'MP3 LEASE', price: '29.99', icon: <Headphones className="text-blue-400" />, desc: 'Idéal pour démos', features: ['MP3 Un-tagged', '500,000 Streams'] },
                { name: 'WAV LEASE', price: '49.99', icon: <Music4 className="text-cyan-400" />, desc: 'Qualité Studio Pro', features: ['WAV + MP3', 'Unlimited Streams'] },
                { name: 'TRACKOUT', price: '99.99', icon: <Layers className="text-orange-400" />, desc: 'Pour mixage sur mesure', features: ['Stems séparées', 'Contrat complet'] },
                { name: 'EXCLUSIF', price: 'Sur devis', icon: <Crown className="text-amber-500" />, desc: 'Propriété totale', features: ['Unique propriétaire', 'Retiré de la vente'] },
            ].map((tier, i) => (
                <div key={i} className="p-8 rounded-[2.5rem] bg-[#1a120b] border border-[#3d2b1f] hover:border-amber-500/50 transition-all shadow-xl group flex flex-col justify-between h-full">
                    <div>
                        <div className="mb-6 bg-[#2a1e16] w-14 h-14 rounded-2xl flex items-center justify-center border border-[#3d2b1f] group-hover:scale-110 transition-transform shadow-lg">{tier.icon}</div>
                        <h3 className="font-black text-2xl text-white uppercase tracking-tighter mb-2">{tier.name}</h3>
                        <p className="text-xs font-bold text-[#8c7a6b] mb-6 uppercase tracking-widest">{tier.desc}</p>
                        <div className="text-4xl font-black text-amber-500 mb-8">{tier.price}{tier.price !== 'Sur devis' ? '€' : ''}</div>
                        
                        <ul className="space-y-3 mb-10">
                           {tier.features.map((f, idx) => (
                             <li key={idx} className="text-[10px] text-[#a89080] font-black uppercase tracking-widest flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40"></div> {f}
                             </li>
                           ))}
                        </ul>
                    </div>
                    <button 
                        onClick={() => navigate('/beats')}
                        className="w-full py-4 rounded-xl bg-[#2a1e16] text-[#d4a373] font-black uppercase text-xs tracking-widest hover:bg-amber-600 hover:text-black transition-all border border-[#3d2b1f]"
                    >
                        Choisir
                    </button>
                </div>
            ))}
        </div>
      </section>

      {/* SECTION MASTERCLASS DÉTAILLÉE */}
      <section className="bg-gradient-to-br from-[#1a120b] to-[#0f0f0f] p-10 md:p-16 rounded-[3rem] border border-[#3d2b1f] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
           <GraduationCap className="w-64 h-64 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
                <div className="inline-block bg-amber-500/20 text-amber-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-amber-500/30">
                   L'académie Fabio DMS
                </div>
                <h2 className="text-5xl font-black text-white mb-6 tracking-tighter uppercase italic leading-none">
                  Apprends à produire <br/><span className="text-amber-500">comme un Pro</span>
                </h2>
                <p className="text-[#a89080] text-lg mb-8 max-w-xl font-medium">
                  Je te partage mes sessions studio, mes presets et mes techniques secrètes pour obtenir un son puissant qui accroche les labels.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                   {MASTERCLASSES.map(mc => (
                     <div key={mc.id} className="p-5 bg-black/40 backdrop-blur-md rounded-2xl border border-[#3d2b1f] hover:border-amber-500/30 transition-all cursor-pointer group">
                        <h4 className="font-bold text-white mb-1 group-hover:text-amber-500 transition-colors">{mc.title}</h4>
                        <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">{mc.price}€ • {mc.duration}</p>
                     </div>
                   ))}
                </div>

                <Link to="/masterclass" className="inline-flex items-center gap-3 bg-amber-600 hover:bg-amber-500 text-black font-black px-10 py-5 rounded-2xl transition-all shadow-2xl uppercase tracking-widest text-sm">
                   Voir les programmes <ChevronRight className="w-5 h-5" />
                </Link>
            </div>
            
            <div className="flex-1 relative">
                <div className="aspect-video rounded-3xl overflow-hidden border-2 border-[#3d2b1f] shadow-2xl">
                   <img 
                    src="https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=1200&auto=format" 
                    alt="Masterclass Demo" 
                    className="w-full h-full object-cover"
                   />
                </div>
            </div>
        </div>
      </section>

      {/* DERNIÈRES PRODUCTIONS */}
      <section>
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            Dernières <span className="text-amber-500 text-stroke">Productions</span>
          </h2>
          <Link to="/beats" className="bg-[#1e1510] text-[#a89080] font-black text-[10px] uppercase px-5 py-2.5 rounded-full border border-[#3d2b1f] hover:text-white transition-all">
             Voir Tout
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allBeats.slice(0, 4).map(beat => (
            <BeatCard key={beat.id} beat={beat} />
          ))}
        </div>
      </section>
    </div>
  );
};
