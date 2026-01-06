
import React, { useState, useEffect } from 'react';
import { FEATURED_BEATS } from '../constants';
import { BeatCard } from '../components/BeatCard';
import { Filter, ShoppingBag, Music, Tag, Zap, Search, X, Check, Headphones, Radio, Layers, Crown, Music2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Beat, StorePromotion, License } from '../types';
import { getAllBeats, getSetting } from '../services/dbService';
import { usePlayer } from '../contexts/PlayerContext';

export const BeatStore: React.FC = () => {
  const { cartCount, toggleCart, addToCart } = useCart();
  const { playBeat } = usePlayer();
  const [beats, setBeats] = useState<Beat[]>([]);
  const [filteredBeats, setFilteredBeats] = useState<Beat[]>([]);
  const [promo, setPromo] = useState<StorePromotion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // État pour gérer la modale d'achat
  const [selectedBeatForPurchase, setSelectedBeatForPurchase] = useState<Beat | null>(null);

  const loadData = async () => {
    try {
      // 1. Charger les beats
      const savedCustomBeats = await getAllBeats();
      const allBeats = [...[...savedCustomBeats].reverse(), ...FEATURED_BEATS];
      setBeats(allBeats);
      setFilteredBeats(allBeats);
      
      // 2. Gestion de la promo (Priorité : URL > DB Neon > Défaut)
      
      // A. Vérification URL (pour test ou campagnes spécifiques)
      const params = new URLSearchParams(window.location.hash.split('?')[1]);
      const urlPromoMessage = params.get('promo');
      const urlPromoBG = params.get('bg');
      const urlPct = params.get('pct'); 
      const urlIds = params.get('ids'); 

      if (urlPromoMessage) {
        setPromo({
          isActive: true,
          message: decodeURIComponent(urlPromoMessage),
          discountPercentage: urlPct ? parseInt(urlPct) : 20,
          type: (urlPromoBG === 'orange' || urlPromoMessage.includes('OFFERT')) ? 'BULK_DEAL' : 'PERCENTAGE',
          scope: urlIds ? 'SPECIFIC' : 'GLOBAL',
          targetBeatIds: urlIds ? urlIds.split(',') : []
        });
        return; 
      }

      // B. Récupération Dynamique depuis Neon DB (clé 'promo')
      try {
        const rawDbPromo = await getSetting<any>('promo');
        console.log("Donnée reçue de la DB:", rawDbPromo);

        let dbPromo: StorePromotion | null = rawDbPromo;

        // Correction parsing si c'est une string (double encodage possible)
        if (typeof rawDbPromo === 'string') {
            try {
                dbPromo = JSON.parse(rawDbPromo);
            } catch (e) {
                console.error("Erreur parsing promo JSON:", e);
            }
        }

        if (dbPromo && dbPromo.isActive) {
           setPromo(dbPromo);
           return;
        }
      } catch (err) {
        console.error("Impossible de récupérer la promo DB:", err);
      }

      // C. Fallback par défaut (si aucune promo active en DB)
      setPromo({
          isActive: true,
          discountPercentage: 20,
          message: "OFFRE LIMITÉE : -20% SUR TOUT LE CATALOGUE !"
      });

    } catch (e) {
      console.error("Error loading data:", e);
      setBeats(FEATURED_BEATS);
      setFilteredBeats(FEATURED_BEATS);
    }
  };

  useEffect(() => {
    loadData();
    // On garde l'écouteur storage au cas où
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  useEffect(() => {
    const results = beats.filter(beat => 
      beat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beat.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredBeats(results);
  }, [searchTerm, beats]);

  const handlePurchaseClick = (beat: Beat) => {
    setSelectedBeatForPurchase(beat);
  };

  const closePurchaseModal = () => {
    setSelectedBeatForPurchase(null);
  };

  // Helper pour vérifier si la promo s'applique à un beat donné
  const isPromoValidForBeat = (beatId: string) => {
    if (!promo || !promo.isActive) return false;
    if (promo.scope === 'GLOBAL') return true;
    if (promo.scope === 'SPECIFIC' && promo.targetBeatIds?.includes(beatId)) return true;
    return false;
  };

  const handleAddToCart = (e: React.MouseEvent, beat: Beat, license: License) => {
    e.stopPropagation();
    
    let finalPrice = license.price;

    // Calcul dynamique de la réduction
    if (promo && promo.isActive) {
      const isGlobal = promo.scope === 'GLOBAL';
      const isTargeted = promo.scope === 'SPECIFIC' && (promo.targetBeatIds?.includes(beat.id) ?? false);

      if (isGlobal || isTargeted) {
        if (promo.type === 'PERCENTAGE' || isTargeted) {
          finalPrice = Number((license.price * (1 - promo.discountPercentage / 100)).toFixed(2));
        }
      }
    }

    const finalLicense = { ...license, price: finalPrice };
    addToCart(beat, finalLicense);
    closePurchaseModal();
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
    <div className="pb-28 relative">
      {/* BANDEAU PROMO SI ACTIF */}
      {promo && promo.isActive && !selectedBeatForPurchase && (
        <div className={`mb-6 p-0.5 rounded-2xl shadow-[0_10px_40px_rgba(220,38,38,0.2)] animate-in slide-in-from-top-4 mx-2 mt-4 relative z-0 ${
            promo.type === 'BULK_DEAL' 
            ? 'bg-gradient-to-r from-orange-500 to-amber-500' 
            : 'bg-gradient-to-r from-red-600 to-amber-600'
        }`}>
            <div className="bg-[#120a05] rounded-[14px] p-4 flex items-center justify-center gap-4 relative overflow-hidden group">
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                    promo.type === 'BULK_DEAL'
                    ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/10'
                    : 'bg-gradient-to-r from-red-600/10 to-amber-600/10'
                }`}></div>
                <Zap className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
                <p className="text-white font-black uppercase tracking-tighter text-sm md:text-base italic text-center z-10">
                    {promo.message}
                </p>
                <div className={`hidden sm:flex items-center gap-2 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg z-10 shrink-0 ${
                    promo.type === 'BULK_DEAL' ? 'bg-orange-600' : 'bg-red-600'
                }`}>
                    <Tag className="w-3 h-3" /> {promo.scope === 'SPECIFIC' ? 'Offre Ciblée' : 'Remise Active'}
                </div>
            </div>
        </div>
      )}

      {/* HEADER & FILTERS (Masqué si modale ouverte) */}
      {!selectedBeatForPurchase && (
        <div className="sticky top-14 bg-[#0f0f0f] z-[49] py-6 -mx-4 px-6 md:mx-0 md:px-0 border-b border-[#2a2a2a] mb-12 shadow-2xl transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-2">
                  Catalogue <span className="text-amber-500 text-stroke">Beats</span>
                  <span className="text-xs font-bold text-[#5c4a3e] bg-[#1a120b] border border-[#3d2b1f] px-2 py-1 rounded-md not-italic tracking-normal align-middle">{filteredBeats.length}</span>
                </h1>
                
                <div className="flex gap-3 w-full md:w-auto">
                   <div className="relative flex-1 md:w-64">
                      <input 
                          type="text" 
                          placeholder="Rechercher par titre, tag..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-[#1a120b] border border-[#3d2b1f] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder-[#5c4a3e]"
                      />
                      <Search className="w-4 h-4 text-[#8c7a6b] absolute left-3.5 top-3" />
                   </div>
                   
                   <button className="flex items-center justify-center gap-2 bg-[#1a120b] hover:bg-[#2a1e16] text-[#d4a373] px-4 py-2.5 rounded-xl border border-[#3d2b1f] transition-colors shrink-0">
                      <Filter className="w-4 h-4" />
                   </button>
                   
                   <button 
                      onClick={toggleCart}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all font-black uppercase text-xs tracking-widest shrink-0 ${cartCount > 0 ? 'bg-amber-500 text-black hover:bg-white shadow-lg shadow-amber-500/20' : 'bg-[#1a120b] text-white border border-[#3d2b1f] hover:bg-[#2a1e16]'}`}
                   >
                      <ShoppingBag className="w-4 h-4" />
                      <span className="hidden sm:inline">Panier</span>
                      {cartCount > 0 && <span>({cartCount})</span>}
                  </button>
                </div>
            </div>
        </div>
      )}

      {/* GRID */}
      <div className="relative z-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-6">
          {filteredBeats.length > 0 ? (
            filteredBeats.map((beat) => (
              <div key={beat.id} className="h-full">
                {/* On passe la promo fetchée à la carte SEULEMENT si elle s'applique à ce beat */}
                <BeatCard 
                    beat={beat} 
                    promo={isPromoValidForBeat(beat.id) ? promo : null} 
                    onPurchase={handlePurchaseClick} 
                />
              </div>
            ))
          ) : (
             <div className="col-span-full py-32 text-center flex flex-col items-center justify-center opacity-40 border-2 border-dashed border-[#2a2a2a] rounded-[2rem]">
                <Music className="w-16 h-16 mb-4 text-[#3d2b1f]" />
                <p className="font-bold text-xl text-[#8c7a6b]">Aucun résultat trouvé</p>
                <p className="text-sm italic text-[#5c4a3e] mt-2">Essayez un autre terme de recherche.</p>
             </div>
          )}
      </div>

      {/* --- MODAL LICENCES (Gérée au niveau du Store) --- */}
      {selectedBeatForPurchase && (
        <div className="fixed inset-0 top-[56px] z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={closePurchaseModal} />
          <div className="relative w-full max-w-4xl bg-[#1a120b] border border-[#3d2b1f] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-[#3d2b1f] flex justify-between items-center bg-[#120a05]">
              <div className="flex items-center gap-4">
                <img src={selectedBeatForPurchase.coverUrl} className="w-16 h-16 rounded-xl object-cover border border-[#3d2b1f]" alt={selectedBeatForPurchase.title} />
                <div>
                  <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">{selectedBeatForPurchase.title}</h2>
                  <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mt-1">Sélectionnez votre licence</p>
                </div>
              </div>
              <button onClick={closePurchaseModal} className="p-2 hover:bg-[#2a1e16] rounded-full text-[#8c7a6b] transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar bg-[#0f0f0f]">
              {selectedBeatForPurchase.licenses.map((lic) => {
                const isValid = isPromoValidForBeat(selectedBeatForPurchase.id);
                const discountedPrice = isValid && promo 
                    ? Number((lic.price * (1 - promo.discountPercentage / 100)).toFixed(2)) 
                    : lic.price;
                
                const isExclusive = lic.fileType === 'EXCLUSIVE';
                
                return (
                  <div 
                    key={lic.id} 
                    className={`p-6 rounded-2xl border transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden ${isExclusive ? 'bg-gradient-to-br from-[#2a1e16] to-black border-amber-600/50 hover:border-amber-500' : 'bg-[#1a120b] border-[#3d2b1f] hover:border-[#8c7a6b]'}`}
                    onClick={(e) => handleAddToCart(e, selectedBeatForPurchase, lic)}
                  >
                    {isExclusive && <div className="absolute top-0 right-0 bg-amber-500 text-black text-[9px] font-black px-3 py-1 rounded-bl-xl">BEST SELLER</div>}
                    
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-xl border ${isExclusive ? 'bg-amber-500 text-black border-amber-400' : 'bg-[#2a1e16] border-[#3d2b1f] text-[#a89080] group-hover:text-white'}`}>
                            {getLicenseIcon(lic.fileType, "w-6 h-6")}
                        </div>
                        <h4 className={`font-black text-lg tracking-tight ${isExclusive ? 'text-amber-500' : 'text-white'}`}>{lic.name}</h4>
                      </div>
                      <div className="space-y-2 mb-8 pl-1">
                        {lic.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-[#a89080] group-hover:text-[#d1d5db]">
                              <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isExclusive ? 'text-amber-500' : 'text-emerald-500'}`} />
                              <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-dashed border-[#3d2b1f] flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        {isValid && promo && <span className="text-xs text-[#5c4a3e] line-through">{lic.price}€</span>}
                        <span className={`text-2xl font-black ${isValid && promo ? 'text-emerald-400' : 'text-white'}`}>{discountedPrice}€</span>
                      </div>
                      <button className={`px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${isExclusive ? 'bg-amber-500 text-black hover:bg-white' : 'bg-[#2a1e16] text-white hover:bg-white hover:text-black'}`}>
                        Ajouter
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
