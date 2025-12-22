
import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  Music, 
  Image as ImageIcon, 
  X, 
  DollarSign, 
  Youtube, 
  Save, 
  CheckCircle2, 
  Pencil, 
  Trash2,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { STANDARD_LICENSES } from '../../constants';
import { Beat, License } from '../../types';
import { saveBeat, getAllBeats, deleteBeat as deleteBeatFromDB } from '../../services/dbService';

export const UploadBeat: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [myBeats, setMyBeats] = useState<Beat[]>([]);
  
  const initialMetadata = {
    title: '',
    bpm: '',
    key: '',
    youtubeUrl: '',
    description: ''
  };
  
  const [metadata, setMetadata] = useState(initialMetadata);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [coverBase64, setCoverBase64] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'cover') {
        setCoverPreview(URL.createObjectURL(file));
        setCoverBase64(base64);
      } else {
        setAudioFileName(file.name);
        setAudioBase64(base64);
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
    setAudioBase64(null);
    setAudioFileName(null);
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
      key: metadata.key,
      tags: tags,
      coverUrl: coverBase64 || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=60",
      audioUrl: audioBase64 || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      licenses: customLicenses,
      youtubeId: metadata.youtubeUrl.split('v=')[1]?.split('&')[0] || ''
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
      key: beat.key,
      youtubeUrl: beat.youtubeId ? `https://youtube.com/watch?v=${beat.youtubeId}` : '',
      description: beat.description || ''
    });
    setTags(beat.tags);
    setCoverPreview(beat.coverUrl);
    setCoverBase64(beat.coverUrl);
    setAudioFileName("Audio actuel conservé");
    setAudioBase64(beat.audioUrl || null);
    
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

  const handleClearAll = async () => {
    if (window.confirm("⚠️ ACTION IRRÉVERSIBLE : Supprimer TOUT votre catalogue personnalisé ?")) {
      for (const beat of myBeats) {
        await deleteBeatFromDB(beat.id);
      }
      await loadBeatsFromDB();
    }
  };

  return (
    <div className="pb-24 max-w-5xl mx-auto animate-in fade-in">
      <header className="mb-8 border-b border-[#3d2b1f] pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#fff8f0] flex items-center gap-3">
            <UploadCloud className="w-8 h-8 text-amber-500" />
            {editingId ? 'Modifier la production' : 'Upload Nouveau Beat'}
          </h1>
          <p className="text-[#a89080] mt-1 italic text-sm">
            {editingId ? `Modification de : ${metadata.title}` : 'Ajoutez un beat qui sera jouable immédiatement dans le catalogue.'}
          </p>
        </div>
        <div className="flex gap-3">
            {myBeats.length > 0 && (
                <button onClick={handleClearAll} className="text-[10px] bg-red-900/10 text-red-500 px-4 py-2 rounded-full hover:bg-red-600 hover:text-white transition-all border border-red-900/20 flex items-center gap-2 font-black uppercase">
                   <AlertTriangle className="w-3 h-3" /> Vider Catalogue
                </button>
            )}
            {editingId && (
              <button onClick={resetForm} className="text-xs bg-[#2a1e16] text-[#8c7a6b] px-4 py-2 rounded-full hover:text-white transition-colors border border-[#3d2b1f]">
                Annuler l'édition
              </button>
            )}
        </div>
      </header>

      {showSuccess && (
        <div className="mb-8 bg-emerald-900/20 border border-emerald-900/50 p-4 rounded-xl flex items-center gap-3 text-emerald-400 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-6 h-6" />
          <p className="font-bold">Catalogue mis à jour ! Votre beat est maintenant en ligne.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1e1510] border border-[#3d2b1f] rounded-2xl p-5 shadow-xl">
            <label className="block text-[10px] font-black uppercase tracking-widest text-amber-500/70 mb-3">Pochette du Beat</label>
            <div className="aspect-square rounded-xl border-2 border-dashed border-[#3d2b1f] relative overflow-hidden group hover:border-amber-500/30 transition-colors">
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button type="button" onClick={() => {setCoverPreview(null); setCoverBase64(null)}} className="bg-red-600 p-2 rounded-full shadow-lg"><X className="w-5 h-5 text-white"/></button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#5c4a3e]">
                  <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
                  <span className="text-[10px] uppercase font-bold text-center px-4">Cliquer pour choisir</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="bg-[#1e1510] border border-[#3d2b1f] rounded-2xl p-5 shadow-xl">
            <label className="block text-[10px] font-black uppercase tracking-widest text-amber-500/70 mb-3">Fichier Master (Audio)</label>
            <div className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${audioBase64 ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-[#120a05] border-[#3d2b1f]'}`}>
              <div className={`p-2 rounded-lg ${audioBase64 ? 'bg-emerald-500 text-black' : 'bg-amber-900/20 text-amber-500'}`}>
                <Music className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{audioFileName || 'Aucun fichier'}</p>
                <p className="text-[10px] text-[#5c4a3e]">{audioBase64 ? 'Audio prêt' : 'MP3/WAV'}</p>
              </div>
              <label className="cursor-pointer bg-[#3d2b1f] hover:bg-amber-600 hover:text-black text-white text-[10px] font-black uppercase px-3 py-2 rounded-full transition-all">
                Choisir
                <input type="file" accept="audio/*" onChange={(e) => handleFileChange(e, 'audio')} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1e1510] border border-[#3d2b1f] rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-black uppercase text-white mb-6 border-b border-[#3d2b1f] pb-2">Informations Générales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-[#8c7a6b] uppercase mb-1.5">Titre du Beat</label>
                <input type="text" required value={metadata.title} onChange={e => setMetadata({...metadata, title: e.target.value})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" placeholder="Ex: AMOUR | Tayc Type Beat" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#8c7a6b] uppercase mb-1.5">Tempo (BPM)</label>
                <input type="number" required value={metadata.bpm} onChange={e => setMetadata({...metadata, bpm: e.target.value})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[#8c7a6b] uppercase mb-1.5">Tonalité</label>
                <input type="text" required value={metadata.key} onChange={e => setMetadata({...metadata, key: e.target.value})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-[#8c7a6b] uppercase mb-1.5">Tags</label>
                <div className="flex flex-wrap gap-2 p-2.5 bg-[#120a05] border border-[#3d2b1f] rounded-xl min-h-[50px]">
                  {tags.map(t => (
                    <span key={t} className="bg-amber-600/20 text-amber-500 text-[10px] font-bold px-3 py-1.5 rounded-full border border-amber-600/30 flex items-center gap-1.5">
                      {t} <button type="button" onClick={() => removeTag(t)}><X className="w-3 h-3"/></button>
                    </span>
                  ))}
                  <input type="text" value={currentTag} onChange={e => setCurrentTag(e.target.value)} onKeyDown={handleAddTag} className="bg-transparent text-sm outline-none flex-1 min-w-[120px] text-white" placeholder="Ajouter un tag..." />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1e1510] border border-[#3d2b1f] rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-black uppercase text-amber-500 mb-6 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Tarifs Licences (€)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.keys(prices).map(key => (
                <div key={key}>
                  <label className="block text-[9px] font-black text-[#8c7a6b] uppercase mb-1">{key.toUpperCase()}</label>
                  <input type="number" step="0.01" value={prices[key as keyof typeof prices]} onChange={e => setPrices({...prices, [key]: parseFloat(e.target.value) || 0})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-3 py-3 text-white font-black text-sm text-center focus:border-amber-500 outline-none" />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className={`w-full py-5 rounded-2xl font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-4 ${isSubmitting ? 'bg-[#3d2b1f] text-[#8c7a6b]' : 'bg-amber-600 text-black hover:bg-amber-500'}`}>
            {isSubmitting ? <><Loader2 className="w-6 h-6 animate-spin" /> PUBLICATION...</> : <><Save className="w-6 h-6" /> {editingId ? 'METTRE À JOUR' : 'PUBLIER LE BEAT'}</>}
          </button>
        </div>
      </form>

      <section className="mt-20">
        <div className="flex items-center gap-5 mb-10">
           <h2 className="text-2xl font-black text-white flex items-center gap-3">
             <Music className="w-7 h-7 text-amber-500" />
             Mon Catalogue ({myBeats.length})
           </h2>
           <div className="h-px flex-1 bg-[#3d2b1f]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {myBeats.map(beat => (
            <div key={beat.id} className="bg-[#1e1510] border border-[#3d2b1f] p-4 rounded-2xl flex items-center gap-4 group hover:border-amber-600/40 transition-all shadow-lg">
              <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#3d2b1f] relative shrink-0">
                <img src={beat.coverUrl} className="w-full h-full object-cover" alt={beat.title} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[#fff8f0] font-bold truncate text-sm">{beat.title}</h4>
                <p className="text-[10px] text-[#8c7a6b] font-mono mt-1">{beat.bpm} BPM • {beat.key}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(beat)} className="p-3 bg-amber-900/10 text-amber-500 rounded-xl hover:bg-amber-600 hover:text-black transition-all border border-amber-900/20"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(beat.id)} className="p-3 bg-red-900/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-900/20"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
