
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BeatCard } from '../components/BeatCard';
import { ShoppingBag, Tag, Zap, Search, X, Check, Headphones, Radio, Layers, Crown, Music2, RefreshCw, AlertTriangle, WifiOff, Database, FileX, Filter } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Beat, StorePromotion, License } from '../types';
import { getAllBeats, getSetting } from '../services/dbService';
import { usePlayer } from '../contexts/PlayerContext';

export const BeatStore: React.FC = () => {
  const { cartCount, toggleCart, addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [beats, setBeats] = useState<Beat[]>([]);
  const [filteredBeats, setFilteredBeats] = useState<Beat[]>([]);
  const [promo, setPromo] = useState<StorePromotion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [selectedBeatForPurchase, setSelectedBeatForPurchase] = useState<Beat | null>(null);

  // Récupération du filtre de type depuis l'URL
  const filterType = searchParams.get('type');

  const loadBeats = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const savedCustomBeats = await getAllBeats();
      
      if (Array.isArray(savedCustomBeats)) {
        if (savedCustomBeats.length === 0) {
           setErrorMsg("Le catalogue est vide.");
        }
        const validBeats = savedCustomBeats.filter(b => b && typeof b === 'object' && b.id);
        setBeats(validBeats);
        // Le filtrage se fera via le useEffect qui dépend de beats, searchTerm et filterType
      } else {
        setBeats([]);
        setFilteredBeats([]);
        setErrorMsg("Format de données invalide reçu de l'API.");
      }
    } catch (e: any) {
      console.error("Error loading beats:", e);
      setBeats([]);
      setFilteredBeats([]);
      setErrorMsg(e.message || "Erreur de connexion.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForceRefresh = () => {
      localStorage.removeItem('fabio_data_beats'); 
      loadBeats();
  };

  const clearFilter = () => {
      setSearchParams(params => {
          params.delete('type');
          return params;
      });
  };

  const checkPromo = useCallback(async () => {
    const urlPromoMessage = searchParams.get('promo');
    
    if (urlPromoMessage) {
        const urlPromoBG = searchParams.get('bg');
        const urlPct = searchParams.get('pct') || searchParams.get('percent') || searchParams.get('discount') || searchParams.get('val') || searchParams.get('value'); 
        const urlIds = searchParams.get('ids'); 
        
        setPromo({
          isActive: true,
          message: urlPromoMessage,
          discountPercentage: urlPct ? parseInt(urlPct) : 20,
          type: (urlPromoBG === 'orange' || urlPromoMessage.includes('OFFERT')) ? 'BULK_DEAL' : 'PERCENTAGE',
          scope: urlIds ? 'SPECIFIC' : 'GLOBAL',
          targetBeatIds: urlIds ? urlIds.split(',') : []
        });
        return;
    }

    try {
      const rawDbPromo = await getSetting<any>('promo');
      let dbPromo: StorePromotion | null = rawDbPromo;
      if (typeof rawDbPromo === 'string') {
          try { dbPromo = JSON.parse(rawDbPromo); } catch (e) {}
      }
      if (dbPromo && dbPromo.isActive) setPromo(dbPromo);
      else setPromo(null);
    } catch (err) {}
  }, [searchParams]);

  useEffect(() => {
    loadBeats();
    checkPromo();
  }, [checkPromo]);

  // Logique de filtrage principale
  useEffect(() => {
    const results = beats.filter(beat => {
        // 1. Recherche Textuelle
        const titleMatch = beat.title ? beat.title.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        const tagMatch = beat.tags ? beat.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) : false;
        
        // 2. Filtrage par Type de Fichier (MP3, WAV, etc.)
        let typeMatch = true;
        if (filterType) {
            switch (filterType) {
                case 'MP3':
                    // Vérification stricte du lien MP3
                    typeMatch = !!beat.mp3_url;
                    break;
                case 'WAV':
                    typeMatch = !!beat.wav_url;
                    break;
                case 'TRACKOUT':
                    typeMatch = !!beat.stems_url;
                    break;
                case 'EXCLUSIVE':
                    typeMatch = !!beat.stems_url;
                    break;
                default:
                    typeMatch = true;
            }
        }

        return (titleMatch || tagMatch) && typeMatch;
    });
    setFilteredBeats(results);
  }, [searchTerm, beats, filterType]);

  const handlePurchaseClick = (beat: Beat) => {
    setSelectedBeatForPurchase(beat);
  };

  const closePurchaseModal = () => {
    setSelectedBeatForPurchase(null);
  };

  const isPromoValidForBeat = (beatId: string) => {
    if (!promo || !promo.isActive) return false;
    if (promo.scope === 'GLOBAL') return true;
    
    // Comparaison sécurisée (String vs String)
    if (promo.scope === 'SPECIFIC' && promo.targetBeatIds) {
        return promo.targetBeatIds.some(id => String(id) === String(beatId));
    }
    return false;
  };

  const isLicenseAvailableForBeat = (fileType: string, beat: Beat) => {
    switch (fileType) {
        case 'MP3': return !!beat.mp3_url;
        case 'WAV': return !!beat.wav_url;
        case 'TRACKOUT': return !!beat.stems_url;
        case 'EXCLUSIVE': return !!beat.stems_url;
        default: return false;
    }
  };

  const handleAddToCart = (e: React.MouseEvent, beat: Beat, license: License) => {
    e.stopPropagation();
    if (!isLicenseAvailableForBeat(license.fileType, beat)) return;

    const originalPrice = license.price;
    let finalPrice = license.price;
    let appliedPromoType: 'PERCENTAGE' | 'BULK_DEAL' | undefined = undefined;

    if (promo && promo.isActive) {
      const isGlobal = promo.scope === 'GLOBAL';
      const isTargeted = promo.scope === 'SPECIFIC' && promo.targetBeatIds?.some(id => String(id) === String(beat.id));
      
      if (isGlobal || isTargeted) {
          if (promo.type === 'BULK_DEAL') {
             // Pour les offres groupées, on garde le prix original unitaire. 
             // La réduction (gratuité) se fera dans le panier.
             finalPrice = originalPrice;
             appliedPromoType = 'BULK_DEAL';
          } else {
             finalPrice = Number((originalPrice * (1 - promo.discountPercentage / 100)).toFixed(2));
             appliedPromoType = 'PERCENTAGE';
          }
      }
    }

    const finalLicense = { ...license, price: finalPrice };
    addToCart(beat, finalLicense, originalPrice, appliedPromoType);
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
      {promo && promo.isActive && !selectedBeatForPurchase && (
        <div className={`mb-6 p-0.5 rounded-2xl shadow-[0_10px_40px_rgba(220,38,38,0.2)] animate-in slide-in-from-top-4 mx-2 mt-4 relative z-0 ${
            promo.type === 'BULK_DEAL' ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gradient-to-r from-red-600 to-amber-600'
        }`}>
            <div className="bg-[#120a05] rounded-[14px] p-4 flex items-center justify-center gap-4 relative overflow-hidden group">
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                    promo.type === 'BULK_DEAL' ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/10' : 'bg-gradient-to-r from-red-600/10 to-amber-600/10'
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

      {!selectedBeatForPurchase && (
        <div className="sticky top-14 bg-[#0f0f0f] z-[49] py-6 -mx-4 px-6 md:mx-0 md:px-0 border-b border-[#2a2a2a] mb-12 shadow-2xl transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-2">
                    Catalogue <span className="text-amber-500 text-stroke">Beats</span>
                    <span className="text-xs font-bold text-[#5c4a3e] bg-[#1a120b] border border-[#3d2b1f] px-2 py-1 rounded-md not-italic tracking-normal align-middle">{filteredBeats.length}</span>
                    </h1>
                    {filterType && (
                        <div className="flex items-center gap-2 mt-2 animate-in slide-in-from-left-2">
                             <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-500 text-xs font-bold uppercase tracking-wide">
                                <Filter className="w-3 h-3" />
                                Filtré par : {filterType}
                                <button onClick={clearFilter} className="ml-1 hover:text-white transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                             </div>
                        </div>
                    )}
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                   <div className="relative flex-1 md:w-64">
                      <input 
                          type="text" 
                          placeholder="Rechercher..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-[#1a120b] border border-[#3d2b1f] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder-[#5c4a3e]"
                      />
                      <Search className="w-4 h-4 text-[#8c7a6b] absolute left-3.5 top-3" />
                   </div>
                   
                   <button 
                    onClick={handleForceRefresh}
                    className="flex items-center justify-center gap-2 bg-[#1a120b] hover:bg-[#2a1e16] text-[#d4a373] px-3 py-2.5 rounded-xl border border-[#3d2b1f] transition-colors shrink-0"
                    title="Forcer le rechargement"
                   >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
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

      <div className="relative z-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-6">
          {filteredBeats.length > 0 ? (
            filteredBeats.map((beat) => (
              <div key={beat.id} className="h-full">
                <BeatCard 
                    beat={beat} 
                    promo={isPromoValidForBeat(beat.id) ? promo : null} 
                    onPurchase={handlePurchaseClick} 
                />
              </div>
            ))
          ) : (
             <div className="col-span-full py-32 text-center flex flex-col items-center justify-center border-2 border-dashed border-[#2a2a2a] rounded-[2rem] bg-[#1a120b]">
                {isLoading ? (
                    <>
                         <RefreshCw className="w-16 h-16 mb-4 text-amber-500 animate-spin" />
                         <p className="font-bold text-xl text-white">Chargement du studio...</p>
                    </>
                ) : (
                    <>
                        {errorMsg?.includes("connexion") ? (
                            <WifiOff className="w-16 h-16 mb-4 text-red-500/50" />
                        ) : (
                            <AlertTriangle className="w-16 h-16 mb-4 text-[#3d2b1f]" />
                        )}
                        <p className="font-bold text-xl text-[#8c7a6b] mb-2">
                           {errorMsg || (filterType ? `Aucun beat disponible en version ${filterType}` : "Aucun beat trouvé")}
                        </p>
                        {errorMsg && <p className="text-red-400 text-sm mb-4 max-w-md mx-auto">{errorMsg}</p>}
                        
                        {filterType && (
                           <button onClick={clearFilter} className="mt-2 text-amber-500 hover:text-white underline text-sm font-bold">
                               Voir tout le catalogue
                           </button>
                        )}
                        
                        {(errorMsg === "Le catalogue est vide." || errorMsg?.includes("connexion")) && (
                           <a href="/api/debug" target="_blank" className="flex items-center gap-2 text-[10px] text-amber-500 uppercase tracking-widest mt-2 hover:text-white transition-colors">
                              <Database className="w-3 h-3" /> Vérifier l'état de la base de données
                           </a>
                        )}

                        <button onClick={handleForceRefresh} className="bg-amber-500 text-black font-black px-6 py-3 rounded-xl hover:bg-white transition-all uppercase text-xs tracking-widest mt-6">
                            Réessayer
                        </button>
                    </>
                )}
             </div>
          )}
      </div>

      {selectedBeatForPurchase && (
        <div className="fixed inset-0 top-[56px] z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={closePurchaseModal} />
          <div className="relative w-full max-w-4xl bg-[#1a120b] border border-[#3d2b1f] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-[#3d2b1f] flex justify-between items-center bg-[#120a05]">
              <div className="flex items-center gap-4">
                <img src={selectedBeatForPurchase.cover_url} className="w-16 h-16 rounded-xl object-cover border border-[#3d2b1f]" alt={selectedBeatForPurchase.title} />
                <div>
                  <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">{selectedBeatForPurchase.title}</h2>
                  <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mt-1">Sélectionnez votre licence</p>
                </div>
              </div>
              <button onClick={closePurchaseModal} className="p-2 hover:bg-[#2a1e16] rounded-full text-[#8c7a6b] transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar bg-[#0f0f0f]">
              {selectedBeatForPurchase.licenses?.length > 0 ? (
                  selectedBeatForPurchase.licenses.map((lic) => {
                    const isValidPromo = isPromoValidForBeat(selectedBeatForPurchase.id);
                    const isAvailable = isLicenseAvailableForBeat(lic.fileType, selectedBeatForPurchase);

                    const discountedPrice = isValidPromo && promo 
                        ? (promo.type === 'BULK_DEAL' ? lic.price : Number((lic.price * (1 - promo.discountPercentage / 100)).toFixed(2)))
                        : lic.price;
                    const isExclusive = lic.fileType === 'EXCLUSIVE';

                    return (
                      <div 
                        key={lic.id} 
                        className={`p-6 rounded-2xl border transition-all flex flex-col justify-between group relative overflow-hidden ${
                          !isAvailable 
                            ? 'bg-[#120a05] border-[#2a1e16] opacity-60 cursor-not-allowed grayscale' 
                            : isExclusive 
                                ? 'bg-gradient-to-br from-[#2a1e16] to-black border-amber-600/50 hover:border-amber-500 cursor-pointer' 
                                : 'bg-[#1a120b] border-[#3d2b1f] hover:border-[#8c7a6b] cursor-pointer'
                        }`}
                        onClick={(e) => isAvailable && handleAddToCart(e, selectedBeatForPurchase, lic)}
                      >
                        {isExclusive && isAvailable && <div className="absolute top-0 right-0 bg-amber-500 text-black text-[9px] font-black px-3 py-1 rounded-bl-xl">BEST SELLER</div>}
                        
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`p-3 rounded-xl border ${
                                !isAvailable ? 'bg-[#1a120b] border-[#2a1e16] text-[#3d2b1f]' :
                                isExclusive ? 'bg-amber-500 text-black border-amber-400' : 'bg-[#2a1e16] border-[#3d2b1f] text-[#a89080] group-hover:text-white'
                            }`}>
                                {isAvailable ? getLicenseIcon(lic.fileType, "w-6 h-6") : <FileX className="w-6 h-6 text-[#3d2b1f]" />}
                            </div>
                            <h4 className={`font-black text-lg tracking-tight ${!isAvailable ? 'text-[#3d2b1f]' : (isExclusive ? 'text-amber-500' : 'text-white')}`}>{lic.name}</h4>
                          </div>
                          <div className="space-y-2 mb-8 pl-1">
                            {lic.features.map((feature, idx) => (
                              <div key={idx} className={`flex items-start gap-2 text-xs ${!isAvailable ? 'text-[#3d2b1f]' : 'text-[#a89080] group-hover:text-[#d1d5db]'}`}>
                                  <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${!isAvailable ? 'text-[#3d2b1f]' : (isExclusive ? 'text-amber-500' : 'text-emerald-500')}`} />
                                  <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className={`pt-4 border-t border-dashed ${!isAvailable ? 'border-[#1a120b]' : 'border-[#3d2b1f]'} flex items-center justify-between mt-auto`}>
                          <div className="flex flex-col">
                            {/* On n'affiche pas de prix barré pour BULK_DEAL dans la modale non plus */}
                            {isValidPromo && promo && isAvailable && promo.type !== 'BULK_DEAL' && (
                                <span className="text-xs text-[#5c4a3e] line-through">{lic.price}€</span>
                            )}
                            <span className={`text-2xl font-black ${!isAvailable ? 'text-[#3d2b1f]' : (isValidPromo && promo && promo.type !== 'BULK_DEAL' ? 'text-emerald-400' : 'text-white')}`}>
                                {isAvailable ? `${discountedPrice}€` : '-'}
                            </span>
                          </div>
                          <button 
                            disabled={!isAvailable}
                            className={`px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${
                                !isAvailable 
                                    ? 'bg-[#1a120b] text-[#3d2b1f] cursor-not-allowed' 
                                    : isExclusive 
                                        ? 'bg-amber-500 text-black hover:bg-white' 
                                        : 'bg-[#2a1e16] text-white hover:bg-white hover:text-black'
                            }`}
                          >
                            {isAvailable ? 'Ajouter' : 'Indisponible'}
                          </button>
                        </div>
                      </div>
                    );
                  })
              ) : (
                  <div className="col-span-full text-center text-[#8c7a6b] italic py-10">
                      Aucune licence configurée pour ce beat.
                  </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
