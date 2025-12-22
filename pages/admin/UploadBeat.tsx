
import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  Music, 
  Image as ImageIcon, 
  X, 
  DollarSign, 
  Save, 
  CheckCircle2, 
  Pencil, 
  Trash2,
  Loader2,
  AlertTriangle,
  FileAudio,
  FolderArchive,
  FileCode,
  Zap,
  Tag
} from 'lucide-react';
import { STANDARD_LICENSES } from '../../constants';
import { Beat, License, StorePromotion } from '../../types';
import { saveBeat, getAllBeats, deleteBeat as deleteBeatFromDB } from '../../services/dbService';

export const UploadBeat: React.FC = () => {
  const PROMO_KEY = 'fabio_store_promo';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [myBeats, setMyBeats] = useState<Beat[]>([]);
  
  // Promotion State
  const [promo, setPromo] = useState<StorePromotion>(() => {
    const saved = localStorage.getItem(PROMO_KEY);
    return saved ? JSON.parse(saved) : { isActive: false, discountPercentage: 20, message: 'OFFRE LIMITÉE : -20% SUR TOUT LE CATALOGUE !' };
  });

  const initialMetadata = {
    title: '',
    bpm: '',
    youtubeUrl: '',
    description: ''
  };
  
  const [metadata, setMetadata] = useState(initialMetadata);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  
  // Fichiers
  const [coverBase64, setCoverBase64] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const [mp3Base64, setMp3Base64] = useState<string | null>(null);
  const [mp3Name, setMp3Name] = useState<string | null>(null);
  
  const [wavBase64, setWavBase64] = useState<string | null>(null);
  const [wavName, setWavName] = useState<string | null>(null);
  
  const [stemsBase64, setStemsBase64] = useState<string | null>(null);
  const [stemsName, setStemsName] = useState<string | null>(null);

  const [prices, setPrices] = useState({
    mp3: 29.99,
    wav: 49.99,
    trackout: 99.99,
    exclusive: 499.99,
  });

  const loadBeatsFromDB = async () => {
    try {
      const data = await getAllBeats();
      setMyBeats([...data].reverse());
    } catch (e) {
      console.error("Erreur chargement DB:", e);
    }
  };

  useEffect(() => {
    loadBeatsFromDB();
  }, []);

  const savePromoSettings = () => {
    localStorage.setItem(PROMO_KEY, JSON.stringify(promo));
    alert("Paramètres de promotion mis à jour !");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'mp3' | 'wav' | 'stems') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'cover') {
        setCoverPreview(URL.createObjectURL(file));
        setCoverBase64(base64);
      } else if (type === 'mp3') {
        setMp3Name(file.name);
        setMp3Base64(base64);
      } else if (type === 'wav') {
        setWavName(file.name);
        setWavBase64(base64);
      } else if (type === 'stems') {
        setStemsName(file.name);
        setStemsBase64(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const resetForm = () => {
    setMetadata(initialMetadata);
    setTags([]);
    setCoverBase64(null);
    setCoverPreview(null);
    setMp3Base64(null);
    setMp3Name(null);
    setWavBase64(null);
    setWavName(null);
    setStemsBase64(null);
    setStemsName(null);
    setEditingId(null);
    setPrices({ mp3: 29.99, wav: 49.99, trackout: 99.99, exclusive: 499.99 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metadata.title.trim()) return;

    setIsSubmitting(true);
    
    const customLicenses: License[] = STANDARD_LICENSES.map(l => ({
      ...l,
      price: prices[l.id as keyof typeof prices] || l.price
    }));

    const beatData: Beat = {
      id: editingId || `beat-${Date.now()}`,
      title: metadata.title,
      bpm: parseInt(metadata.bpm) || 100,
      tags: tags,
      coverUrl: coverBase64 || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=60",
      audioUrl: mp3Base64 || wavBase64 || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      mp3Url: mp3Base64 || undefined,
      wavUrl: wavBase64 || undefined,
      stemsUrl: stemsBase64 || undefined,
      licenses: customLicenses,
      youtubeId: metadata.youtubeUrl.split('v=')[1]?.split('&')[0] || '',
      description: metadata.description
    };

    try {
      await saveBeat(beatData);
      await loadBeatsFromDB();

      setIsSubmitting(false);
      setShowSuccess(true);
      resetForm();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Database Save Error:", err);
      alert("Erreur lors de la sauvegarde.");
      setIsSubmitting(false);
    }
  };

  const handleEdit = (beat: Beat) => {
    setEditingId(beat.id);
    setMetadata({
      title: beat.title,
      bpm: beat.bpm.toString(),
      youtubeUrl: beat.youtubeId ? `https://youtube.com/watch?v=${beat.youtubeId}` : '',
      description: beat.description || ''
    });
    setTags(beat.tags);
    setCoverPreview(beat.coverUrl);
    setCoverBase64(beat.coverUrl);
    
    setMp3Base64(beat.mp3Url || null);
    setMp3Name(beat.mp3Url ? "MP3 Actuel conservé" : null);
    
    setWavBase64(beat.wavUrl || null);
    setWavName(beat.wavUrl ? "WAV Actuel conservé" : null);
    
    setStemsBase64(beat.stemsUrl || null);
    setStemsName(beat.stemsUrl ? "Dossier Stems conservé" : null);
    
    const p = { ...prices };
    beat.licenses.forEach(l => {
      if (l.id in p) p[l.id as keyof typeof p] = l.price;
    });
    setPrices(p);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette production du catalogue ?")) {
      try {
        await deleteBeatFromDB(id);
        await loadBeatsFromDB();
      } catch (e) {
        console.error("Erreur suppression:", e);
      }
    }
  };

  return (
    <div className="pb-24 max-w-5xl mx-auto animate-in fade-in">
      <header className="mb-8 border-b border-[#3d2b1f] pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#fff8f0] flex items-center gap-3">
            <UploadCloud className="w-8 h-8 text-amber-500" />
            {editingId ? 'Modifier la production' : 'Gestion des Fichiers Beat'}
          </h1>
          <p className="text-[#a89080] mt-1 italic text-sm">
            {editingId ? `Modification de : ${metadata.title}` : 'Insérez vos fichiers MP3, WAV et Dossier Stems (ZIP) pour ce beat.'}
          </p>
        </div>
        <div className="flex gap-3">
            {editingId && (
              <button onClick={resetForm} className="text-xs bg-[#2a1e16] text-[#8c7a6b] px-4 py-2 rounded-full hover:text-white transition-colors border border-[#3d2b1f]">
                Annuler l'édition
              </button>
            )}
        </div>
      </header>

      {/* SECTION PROMOTION GLOBALE */}
      <section className="mb-12 bg-[#1a120b] border border-amber-600/30 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-900/30">
              <Tag className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Centre de <span className="text-amber-500 text-stroke">Promotions</span></h2>
              <p className="text-sm text-[#a89080] font-medium">Appliquez une remise globale sur tout votre catalogue Fabio.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
             <div className="flex items-center gap-3 bg-[#120a05] px-4 py-3 rounded-xl border border-[#3d2b1f]">
                <span className="text-[10px] font-black text-[#8c7a6b] uppercase tracking-widest">Activer</span>
                <button 
                  onClick={() => setPromo({...promo, isActive: !promo.isActive})}
                  className={`w-12 h-6 rounded-full relative transition-colors ${promo.isActive ? 'bg-emerald-500' : 'bg-[#3d2b1f]'}`}
                >
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${promo.isActive ? 'right-1' : 'left-1'}`}></div>
                </button>
             </div>
             <div className="flex items-center gap-3 bg-[#120a05] px-4 py-3 rounded-xl border border-[#3d2b1f]">
                <span className="text-[10px] font-black text-[#8c7a6b] uppercase tracking-widest">Remise</span>
                <input 
                  type="number" 
                  value={promo.discountPercentage} 
                  onChange={(e) => setPromo({...promo, discountPercentage: parseInt(e.target.value) || 0})}
                  className="w-12 bg-transparent text-white font-black text-center outline-none"
                />
                <span className="text-amber-500 font-bold">%</span>
             </div>
             <button 
              onClick={savePromoSettings}
              className="bg-white text-black font-black px-6 py-3 rounded-xl text-xs uppercase hover:bg-amber-500 transition-all flex items-center gap-2"
             >
                <Save className="w-4 h-4" /> Sauvegarder Offre
             </button>
          </div>
        </div>
        <div className="mt-6 relative z-10">
           <label className="block text-[10px] font-black text-[#8c7a6b] uppercase tracking-widest mb-1.5 ml-1">Message du Bandeau Boutique</label>
           <input 
             type="text" 
             value={promo.message} 
             onChange={(e) => setPromo({...promo, message: e.target.value})}
             className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-4 text-sm text-white focus:border-amber-500 outline-none placeholder-[#3d2b1f]" 
             placeholder="Ex: OFFRE EXCEPTIONNELLE : -30% SUR TOUTES LES PRODS !"
           />
        </div>
      </section>

      {showSuccess && (
        <div className="mb-8 bg-emerald-900/20 border border-emerald-900/50 p-4 rounded-xl flex items-center gap-3 text-emerald-400 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-6 h-6" />
          <p className="font-bold">Catalogue mis à jour ! Tous les fichiers sont enregistrés.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* GRILLE DE FICHIERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* POCHETTE */}
          <div className="bg-[#1e1510] border border-[#3d2b1f] rounded-2xl p-4 shadow-xl flex flex-col items-center">
            <label className="text-[10px] font-black uppercase text-amber-500 mb-3 tracking-widest">Pochette (JPG/PNG)</label>
            <div className="aspect-square w-full rounded-xl border-2 border-dashed border-[#3d2b1f] relative overflow-hidden group hover:border-amber-500/30 transition-colors">
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button type="button" onClick={() => {setCoverPreview(null); setCoverBase64(null)}} className="bg-red-600 p-2 rounded-full shadow-lg"><X className="w-5 h-5 text-white"/></button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#5c4a3e]">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                  <span className="text-[9px] uppercase font-bold text-center">Ajouter Image</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          {/* FICHIER MP3 */}
          <div className="bg-[#1e1510] border border-[#3d2b1f] rounded-2xl p-4 shadow-xl flex flex-col items-center">
            <label className="text-[10px] font-black uppercase text-blue-400 mb-3 tracking-widest">Fichier .MP3</label>
            <div className={`w-full h-32 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center relative ${mp3Base64 ? 'border-blue-500/50 bg-blue-500/5' : 'border-[#3d2b1f] hover:border-blue-500/30'}`}>
               <FileAudio className={`w-8 h-8 mb-2 ${mp3Base64 ? 'text-blue-400' : 'text-[#5c4a3e] opacity-20'}`} />
               <p className="text-[9px] font-bold text-center px-2 line-clamp-1">{mp3Name || 'Sélectionner MP3'}</p>
               <input type="file" accept=".mp3,audio/mpeg" onChange={(e) => handleFileChange(e, 'mp3')} className="absolute inset-0 opacity-0 cursor-pointer" />
               {mp3Base64 && <button type="button" onClick={() => {setMp3Base64(null); setMp3Name(null)}} className="absolute top-1 right-1 p-1 bg-red-600 rounded-full text-white"><X className="w-3 h-3"/></button>}
            </div>
            <p className="mt-2 text-[8px] text-[#5c4a3e] uppercase font-bold tracking-tighter">Utilisé pour préécoute & MP3 Lease</p>
          </div>

          {/* FICHIER WAV */}
          <div className="bg-[#1e1510] border border-[#3d2b1f] rounded-2xl p-4 shadow-xl flex flex-col items-center">
            <label className="text-[10px] font-black uppercase text-cyan-400 mb-3 tracking-widest">Fichier .WAV</label>
            <div className={`w-full h-32 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center relative ${wavBase64 ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-[#3d2b1f] hover:border-cyan-500/30'}`}>
               <FileCode className={`w-8 h-8 mb-2 ${wavBase64 ? 'text-cyan-400' : 'text-[#5c4a3e] opacity-20'}`} />
               <p className="text-[9px] font-bold text-center px-2 line-clamp-1">{wavName || 'Sélectionner WAV'}</p>
               <input type="file" accept=".wav,audio/wav" onChange={(e) => handleFileChange(e, 'wav')} className="absolute inset-0 opacity-0 cursor-pointer" />
               {wavBase64 && <button type="button" onClick={() => {setWavBase64(null); setWavName(null)}} className="absolute top-1 right-1 p-1 bg-red-600 rounded-full text-white"><X className="w-3 h-3"/></button>}
            </div>
            <p className="mt-2 text-[8px] text-[#5c4a3e] uppercase font-bold tracking-tighter">Utilisé pour WAV Lease</p>
          </div>

          {/* DOSSIER STEMS (ZIP) */}
          <div className="bg-[#1e1510] border border-[#3d2b1f] rounded-2xl p-4 shadow-xl flex flex-col items-center">
            <label className="text-[10px] font-black uppercase text-orange-400 mb-3 tracking-widest">Dossier .ZIP (Stems)</label>
            <div className={`w-full h-32 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center relative ${stemsBase64 ? 'border-orange-500/50 bg-orange-500/5' : 'border-[#3d2b1f] hover:border-orange-500/30'}`}>
               <FolderArchive className={`w-8 h-8 mb-2 ${stemsBase64 ? 'text-orange-400' : 'text-[#5c4a3e] opacity-20'}`} />
               <p className="text-[9px] font-bold text-center px-2 line-clamp-1">{stemsName || 'Sélectionner Dossier'}</p>
               <input type="file" accept=".zip,.rar,.7z" onChange={(e) => handleFileChange(e, 'stems')} className="absolute inset-0 opacity-0 cursor-pointer" />
               {stemsBase64 && <button type="button" onClick={() => {setStemsBase64(null); setStemsName(null)}} className="absolute top-1 right-1 p-1 bg-red-600 rounded-full text-white"><X className="w-3 h-3"/></button>}
            </div>
            <p className="mt-2 text-[8px] text-[#5c4a3e] uppercase font-bold tracking-tighter">Utilisé pour Trackout Lease</p>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#1e1510] border border-[#3d2b1f] rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-black uppercase text-white mb-6 border-b border-[#3d2b1f] pb-2">Métadonnées du Beat</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-[#8c7a6b] uppercase mb-1.5">Titre du Beat</label>
                <input type="text" required value={metadata.title} onChange={e => setMetadata({...metadata, title: e.target.value})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" placeholder="Ex: AMOUR | Tayc Type Beat" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[#8c7a6b] uppercase mb-1.5">Tempo (BPM)</label>
                    <input type="number" required value={metadata.bpm} onChange={e => setMetadata({...metadata, bpm: e.target.value})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#8c7a6b] uppercase mb-1.5">YouTube ID (Optionnel)</label>
                    <input type="text" value={metadata.youtubeUrl} onChange={e => setMetadata({...metadata, youtubeUrl: e.target.value})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" placeholder="v=dQw4w9WgXcQ" />
                  </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#8c7a6b] uppercase mb-1.5">Tags (Afro, Love...)</label>
                <div className="flex flex-wrap gap-2 p-2.5 bg-[#120a05] border border-[#3d2b1f] rounded-xl min-h-[50px]">
                  {tags.map(t => (
                    <span key={t} className="bg-amber-600/20 text-amber-500 text-[10px] font-bold px-3 py-1.5 rounded-full border border-amber-600/30 flex items-center gap-1.5">
                      {t} <button type="button" onClick={() => removeTag(t)}><X className="w-3 h-3"/></button>
                    </span>
                  ))}
                  <input type="text" value={currentTag} onChange={e => setCurrentTag(e.target.value)} onKeyDown={handleAddTag} className="bg-transparent text-sm outline-none flex-1 min-w-[120px] text-white" placeholder="Entrée pour ajouter..." />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1e1510] border border-[#3d2b1f] rounded-2xl p-6 shadow-xl">
             <h3 className="text-sm font-black uppercase text-amber-500 mb-6 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Configuration des Prix (€)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(prices).map(key => (
                <div key={key}>
                  <label className="block text-[9px] font-black text-[#8c7a6b] uppercase mb-1">{key.toUpperCase()} LEASE</label>
                  <input type="number" step="0.01" value={prices[key as keyof typeof prices]} onChange={e => setPrices({...prices, [key]: parseFloat(e.target.value) || 0})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-3 py-3 text-white font-black text-sm text-center focus:border-amber-500 outline-none" />
                </div>
              ))}
            </div>
            
            <button type="submit" disabled={isSubmitting} className={`w-full py-5 rounded-2xl font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-4 mt-8 ${isSubmitting ? 'bg-[#3d2b1f] text-[#5c4a3e]' : 'bg-amber-600 text-black hover:bg-amber-500'}`}>
                {isSubmitting ? <><Loader2 className="w-6 h-6 animate-spin" /> SAUVEGARDE...</> : <><Save className="w-6 h-6" /> {editingId ? 'METTRE À JOUR' : 'PUBLIER LA PROD'}</>}
            </button>
          </div>
        </div>
      </form>

      <section className="mt-16">
        <div className="flex items-center gap-5 mb-10">
           <h2 className="text-2xl font-black text-white flex items-center gap-3 italic">
             <Music className="w-7 h-7 text-amber-500" />
             Catalogue Studio Fabio ({myBeats.length})
           </h2>
           <div className="h-px flex-1 bg-[#3d2b1f]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {myBeats.map(beat => (
            <div key={beat.id} className="bg-[#1e1510] border border-[#3d2b1f] p-4 rounded-2xl flex items-center gap-4 group hover:border-amber-600/40 transition-all shadow-lg relative overflow-hidden">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#3d2b1f] relative shrink-0">
                <img src={beat.coverUrl} className="w-full h-full object-cover" alt={beat.title} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[#fff8f0] font-bold truncate text-sm">{beat.title}</h4>
                <div className="flex gap-2 mt-1">
                    {beat.mp3Url && <div className="w-2 h-2 rounded-full bg-blue-500" title="MP3 Présent"></div>}
                    {beat.wavUrl && <div className="w-2 h-2 rounded-full bg-cyan-500" title="WAV Présent"></div>}
                    {beat.stemsUrl && <div className="w-2 h-2 rounded-full bg-orange-500" title="Stems Présents"></div>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(beat)} className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg"><Pencil className="w-5 h-5" /></button>
                <button onClick={() => handleDelete(beat.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};