
import React, { useState, useEffect } from 'react';
import { Music, Tag, CheckCircle2, Pencil, Trash2, Upload, Save, X, RefreshCw, AlertCircle } from 'lucide-react';
import { getAllBeats, saveBeat, deleteBeat, getSetting, saveSetting } from '../../services/dbService';
import { Beat, StorePromotion } from '../../types';

export const UploadBeat: React.FC = () => {
  const [myBeats, setMyBeats] = useState<Beat[]>([]);
  const [isLoadingBeats, setIsLoadingBeats] = useState(true);
  const [promo, setPromo] = useState<StorePromotion>({ isActive: false, message: '', discountPercentage: 0, scope: 'GLOBAL' });
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    bpm: 120,
    coverUrl: '',
    tags: '',
    mp3Url: '',
    wavUrl: '',
    stemsUrl: '',
    youtubeId: ''
  });
  
  // Prices State
  const [prices, setPrices] = useState({
    mp3: 29.99,
    wav: 49.99,
    trackout: 99.99,
    exclusive: 499.99
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoadingBeats(true);
    try {
        const [beatsData, promoData] = await Promise.all([
            getAllBeats(),
            getSetting<StorePromotion>('promo')
        ]);
        setMyBeats(beatsData || []);
        if (promoData) setPromo(promoData);
    } catch(e) { console.error(e); }
    finally { setIsLoadingBeats(false); }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '', bpm: 120, coverUrl: '', tags: '',
      mp3Url: '', wavUrl: '', stemsUrl: '', youtubeId: ''
    });
    setPrices({ mp3: 29.99, wav: 49.99, trackout: 99.99, exclusive: 499.99 });
  };

  const handleEdit = (beat: Beat) => {
    setEditingId(beat.id);
    setFormData({
      title: beat.title,
      bpm: beat.bpm,
      coverUrl: beat.coverUrl,
      tags: beat.tags.join(', '),
      mp3Url: beat.mp3Url || '',
      wavUrl: beat.wavUrl || '',
      stemsUrl: beat.stemsUrl || '',
      youtubeId: beat.youtubeId || ''
    });
    
    // Populate prices if available in licenses
    const newPrices = { ...prices };
    beat.licenses.forEach(l => {
        if(l.id === 'mp3') newPrices.mp3 = l.price;
        if(l.id === 'wav') newPrices.wav = l.price;
        if(l.id === 'trackout') newPrices.trackout = l.price;
        if(l.id === 'exclusive') newPrices.exclusive = l.price;
    });
    setPrices(newPrices);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Êtes-vous sûr de vouloir supprimer ce beat définitivement ?")) return;
    await deleteBeat(id);
    loadData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
        const licenses = [
            { id: 'mp3', name: 'MP3 Lease', price: Number(prices.mp3), fileType: 'MP3', features: ['MP3 Untagged', '500,000 Streams'], streamsLimit: 500000 },
            { id: 'wav', name: 'WAV Lease', price: Number(prices.wav), fileType: 'WAV', features: ['WAV Untagged', 'Unlimited Streams'], streamsLimit: 'Unlimited' },
            { id: 'trackout', name: 'Trackout Lease', price: Number(prices.trackout), fileType: 'TRACKOUT', features: ['All Stems (WAV)', 'Unlimited Streams'], streamsLimit: 'Unlimited' },
            { id: 'exclusive', name: 'Exclusive Rights', price: Number(prices.exclusive), fileType: 'EXCLUSIVE', features: ['Full Ownership', 'Publishing 50/50'], streamsLimit: 'Unlimited' }
        ];

        const beatPayload: any = {
            id: editingId || undefined,
            title: formData.title,
            bpm: Number(formData.bpm),
            coverUrl: formData.coverUrl || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80",
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            mp3Url: formData.mp3Url,
            wavUrl: formData.wavUrl,
            stemsUrl: formData.stemsUrl,
            youtubeId: formData.youtubeId,
            licenses: licenses,
            date: new Date().toISOString()
        };

        // Flatten prices for simpler DB mapping if needed
        beatPayload.price_mp3 = prices.mp3;
        beatPayload.price_wav = prices.wav;
        beatPayload.price_trackout = prices.trackout;
        beatPayload.price_exclusive = prices.exclusive;

        await saveBeat(beatPayload);
        await loadData();
        resetForm();
    } catch (err) {
        console.error(err);
        alert("Erreur lors de la sauvegarde.");
    } finally {
        setIsSaving(false);
    }
  };

  const toggleBeatSelection = async (beatId: string) => {
     // Cette fonction permet d'ajouter/retirer un beat de la promo ciblée
     if (!promo) return;
     
     const currentIds = promo.targetBeatIds || [];
     let newIds;
     
     if (currentIds.includes(beatId)) {
         newIds = currentIds.filter(id => id !== beatId);
     } else {
         newIds = [...currentIds, beatId];
     }
     
     const updatedPromo = { ...promo, targetBeatIds: newIds };
     setPromo(updatedPromo);
     // Note: Pour persister, on pourrait décommenter:
     // await saveSetting('promo', updatedPromo);
  };

  return (
    <div className="pb-20 max-w-5xl mx-auto">
      
      {/* HEADER & FORMULAIRE */}
      <div className="bg-[#1a120b] p-6 md:p-8 rounded-3xl border border-[#3d2b1f] mb-12 shadow-2xl">
         <div className="flex justify-between items-start mb-8">
            <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
                {editingId ? <Pencil className="w-8 h-8 text-amber-500" /> : <Upload className="w-8 h-8 text-amber-500" />}
                {editingId ? 'MODIFIER LE BEAT' : 'NOUVEAU UPLOAD'}
            </h2>
            {editingId && (
                <button onClick={resetForm} className="text-sm text-[#8c7a6b] hover:text-white flex items-center gap-1">
                    <X className="w-4 h-4" /> Annuler
                </button>
            )}
         </div>

         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-[#8c7a6b] tracking-widest mb-1 block">Titre du Beat</label>
                        <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none transition-all font-bold" placeholder="Ex: Afro Love..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-[#8c7a6b] tracking-widest mb-1 block">BPM</label>
                            <input type="number" value={formData.bpm} onChange={e => setFormData({...formData, bpm: Number(e.target.value)})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-[#8c7a6b] tracking-widest mb-1 block">Tags (virgules)</label>
                            <input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" placeholder="Afro, Pop, Love..." />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-[#8c7a6b] tracking-widest mb-1 block">Cover URL</label>
                        <input value={formData.coverUrl} onChange={e => setFormData({...formData, coverUrl: e.target.value})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none text-xs" placeholder="https://..." />
                    </div>
                </div>

                <div className="space-y-4 p-4 bg-[#120a05] rounded-xl border border-[#3d2b1f]">
                    <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-2">Liens Fichiers Audio</h3>
                    <input value={formData.mp3Url} onChange={e => setFormData({...formData, mp3Url: e.target.value})} className="w-full bg-[#1a120b] border border-[#3d2b1f] rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none mb-2" placeholder="Lien MP3 Direct" />
                    <input value={formData.wavUrl} onChange={e => setFormData({...formData, wavUrl: e.target.value})} className="w-full bg-[#1a120b] border border-[#3d2b1f] rounded-lg px-3 py-2 text-white text-xs focus:border-cyan-500 outline-none mb-2" placeholder="Lien WAV Direct" />
                    <input value={formData.stemsUrl} onChange={e => setFormData({...formData, stemsUrl: e.target.value})} className="w-full bg-[#1a120b] border border-[#3d2b1f] rounded-lg px-3 py-2 text-white text-xs focus:border-orange-500 outline-none" placeholder="Lien ZIP Stems" />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#3d2b1f]">
                <div>
                    <label className="text-[10px] uppercase font-bold text-blue-400 tracking-widest mb-1 block">Prix MP3</label>
                    <input type="number" step="0.01" value={prices.mp3} onChange={e => setPrices({...prices, mp3: Number(e.target.value)})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-cyan-400 tracking-widest mb-1 block">Prix WAV</label>
                    <input type="number" step="0.01" value={prices.wav} onChange={e => setPrices({...prices, wav: Number(e.target.value)})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-orange-400 tracking-widest mb-1 block">Prix Trackout</label>
                    <input type="number" step="0.01" value={prices.trackout} onChange={e => setPrices({...prices, trackout: Number(e.target.value)})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                    <label className="text-[10px] uppercase font-bold text-amber-500 tracking-widest mb-1 block">Prix Exclusif</label>
                    <input type="number" step="0.01" value={prices.exclusive} onChange={e => setPrices({...prices, exclusive: Number(e.target.value)})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-3 py-2 text-white font-mono" />
                </div>
            </div>

            <button disabled={isSaving} className="w-full bg-amber-500 hover:bg-white text-black font-black uppercase py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {editingId ? 'ENREGISTRER LES MODIFICATIONS' : 'PUBLIER LE BEAT'}
            </button>
         </form>
      </div>

      {/* --- LISTE DES BEATS (SECTION DEMANDÉE PAR L'UTILISATEUR) --- */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center gap-2">
                Catalogue <span className="text-amber-500">Beats</span>
                <span className="text-sm bg-[#1a120b] px-2 py-0.5 rounded text-[#8c7a6b] not-italic font-bold">{myBeats.length}</span>
            </h2>
            <button onClick={loadData} className="p-2 bg-[#1a120b] border border-[#3d2b1f] rounded-lg hover:bg-[#2a1e16] text-[#8c7a6b]">
                <RefreshCw className={`w-4 h-4 ${isLoadingBeats ? 'animate-spin' : ''}`} />
            </button>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
            {/* Message si aucun beat */}
            {myBeats.length === 0 && !isLoadingBeats && (
                <div className="p-8 text-center border-2 border-dashed border-[#3d2b1f] rounded-2xl bg-[#1e1510]">
                    <Music className="w-12 h-12 text-[#3d2b1f] mx-auto mb-4" />
                    <p className="text-[#8c7a6b] font-bold">Aucune production trouvée dans la base de données.</p>
                </div>
            )}

            {/* Boucle d'affichage des cartes */}
            {myBeats.map(beat => {
                const isInPromo = promo.isActive && (promo.scope === 'GLOBAL' || (promo.scope === 'SPECIFIC' && promo.targetBeatIds?.includes(beat.id)));
                
                // Extraction des prix pour affichage
                const getPrice = (id: string) => beat.licenses?.find(l => l.id === id)?.price;
                const mp3Price = getPrice('mp3');
                const wavPrice = getPrice('wav');
                const trackoutPrice = getPrice('trackout');

                return (
                <div key={beat.id} className="bg-[#1e1510] border border-[#3d2b1f] p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 hover:border-amber-500/50 transition-colors group">
                    <img src={beat.coverUrl} alt={beat.title} className="w-16 h-16 rounded-lg object-cover shadow-lg border border-[#3d2b1f]" />
                    <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row items-center gap-2 mb-1">
                            <h3 className="font-black text-white text-lg uppercase leading-none">{beat.title}</h3>
                            {isInPromo && <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded animate-pulse shadow-red-900/50 shadow-lg">PROMO -{promo.discountPercentage}%</span>}
                        </div>
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-xs text-[#8c7a6b] font-medium">
                            {beat.bpm && <span>{beat.bpm} BPM</span>}
                            <span>•</span>
                            <span className="flex items-center gap-1"><Tag size={10} /> {beat.tags.slice(0,3).join(', ')}</span>
                        </div>

                        {/* Affichage des prix en fonction des fichiers dispos */}
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mt-2">
                                {beat.mp3Url && mp3Price && (
                                    <div className="flex items-center gap-1 bg-[#120a05] border border-blue-900/30 px-2 py-1 rounded-md">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        <span className="text-[9px] font-bold text-blue-400">MP3 {mp3Price}€</span>
                                    </div>
                                )}
                                {beat.wavUrl && wavPrice && (
                                    <div className="flex items-center gap-1 bg-[#120a05] border border-cyan-900/30 px-2 py-1 rounded-md">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                                        <span className="text-[9px] font-bold text-cyan-400">WAV {wavPrice}€</span>
                                    </div>
                                )}
                                {beat.stemsUrl && trackoutPrice && (
                                    <div className="flex items-center gap-1 bg-[#120a05] border border-orange-900/30 px-2 py-1 rounded-md">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                        <span className="text-[9px] font-bold text-orange-400">STEMS {trackoutPrice}€</span>
                                    </div>
                                )}
                        </div>
                    </div>
                    
                    {/* Selecteur Promo */}
                    {promo.isActive && promo.scope === 'SPECIFIC' && (
                        <div className="mr-0 sm:mr-4">
                            <button onClick={() => toggleBeatSelection(beat.id)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${promo.targetBeatIds?.includes(beat.id) ? 'bg-amber-500 border-amber-500 text-black' : 'border-[#3d2b1f] hover:border-amber-500 text-transparent'}`}><CheckCircle2 size={16} /></button>
                        </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            <button onClick={() => handleEdit(beat)} className="p-2 bg-[#120a05] text-[#8c7a6b] rounded-lg hover:text-white hover:bg-amber-600 transition-all border border-[#3d2b1f]"><Pencil size={16} /></button>
                            <button onClick={() => handleDelete(beat.id)} className="p-2 bg-[#120a05] text-[#8c7a6b] rounded-lg hover:text-white hover:bg-red-600 transition-all border border-[#3d2b1f]"><Trash2 size={16} /></button>
                    </div>
                </div>
            )})}
        </div>
    </section>
    </div>
  );
};
