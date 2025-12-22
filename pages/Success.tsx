
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Download, CheckCircle2, Music, ShoppingBag, Share2, ArrowRight, Loader2, Info, FileAudio } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export const Success: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsCartOpen } = useCart();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showDownloadTip, setShowDownloadTip] = useState(false);
  
  // Récupération des articles achetés depuis l'état de navigation
  const purchasedItems = location.state?.items || [];

  const handleDownload = (audioUrl: string, title: string, fileType: string, id: string) => {
    if (!audioUrl) return;
    
    setDownloadingId(id);
    setShowDownloadTip(true);

    // Extension basée sur la licence
    const extension = fileType === 'WAV' || fileType === 'TRACKOUT' ? 'wav' : 'mp3';
    const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_fabio_dms.${extension}`;

    // Utilisation d'un lien invisible pour déclencher le téléchargement
    // Note: 'download' attribut ne fonctionne que sur le même domaine, 
    // mais target="_blank" permet d'ouvrir le fichier dans un nouvel onglet sans quitter la page actuelle
    const link = document.createElement('a');
    link.href = audioUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('download', fileName);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Feedback visuel temporaire
    setTimeout(() => {
      setDownloadingId(null);
    }, 2000);
  };

  const handleBackToCart = () => {
    navigate('/beats');
    // On attend un peu que la navigation soit effectuée
    setTimeout(() => {
      setIsCartOpen(true);
    }, 200);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="max-w-3xl w-full bg-[#1a120b] border border-[#3d2b1f] rounded-[3rem] p-8 md:p-14 shadow-2xl relative overflow-hidden">
        {/* Effet visuel d'arrière-plan */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-8 border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-4 leading-none">
            PAIEMENT <span className="text-amber-500 text-stroke">REUSSI</span>
          </h1>
          <p className="text-[#a89080] text-lg mb-8 max-w-lg font-medium">
            Félicitations Fabio ! Tes licences sont prêtes. Tes fichiers seront téléchargés au format demandé.
          </p>

          {showDownloadTip && (
            <div className="mb-8 p-4 bg-amber-900/10 border border-amber-900/30 rounded-2xl flex items-start gap-3 text-left animate-in slide-in-from-top-2">
                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200">
                    Le téléchargement s'ouvre dans un nouvel onglet. <span className="font-bold text-white uppercase tracking-tighter">Garde cet onglet ouvert</span> pour revenir à ton panier ou continuer tes achats.
                </p>
            </div>
          )}

          {/* LISTE DES TÉLÉCHARGEMENTS */}
          <div className="w-full space-y-4 mb-12">
            <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-4 text-left border-b border-[#3d2b1f] pb-2">Tes Fichiers (MP3 / WAV)</h2>
            {purchasedItems.length > 0 ? (
              purchasedItems.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-[#120a05] border border-[#3d2b1f] rounded-2xl group hover:border-amber-900/40 transition-all hover:shadow-xl">
                  <div className="flex items-center gap-5 overflow-hidden">
                    <div className="w-14 h-14 bg-amber-900/10 rounded-xl flex items-center justify-center border border-amber-900/10 shrink-0">
                      <FileAudio className="w-7 h-7 text-amber-500" />
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="font-black text-white text-base truncate">{item.beat.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">{item.license.fileType}</span>
                        <span className="text-[10px] text-[#5c4a3e]">•</span>
                        <span className="text-[10px] text-[#8c7a6b] font-bold uppercase tracking-widest">{item.license.name}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDownload(item.beat.audioUrl, item.beat.title, item.license.fileType, item.id)}
                    disabled={downloadingId === item.id}
                    className="flex items-center gap-2 bg-white hover:bg-amber-500 hover:text-black text-black px-6 py-3.5 rounded-xl text-xs font-black transition-all shadow-lg active:scale-95 shrink-0 disabled:opacity-50"
                  >
                    {downloadingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline uppercase">
                      {downloadingId === item.id ? 'Patientez...' : `TÉLÉCHARGER ${item.license.fileType}`}
                    </span>
                  </button>
                </div>
              ))
            ) : (
              <div className="py-14 bg-[#120a05] rounded-3xl border border-dashed border-[#3d2b1f] text-[#5c4a3e] italic text-sm">
                Aucun article trouvé dans cette session.
              </div>
            )}
          </div>

          {/* ACTIONS PRINCIPALES */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button 
              onClick={handleBackToCart}
              className="flex-[1.5] flex items-center justify-center gap-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-black font-black py-6 rounded-2xl shadow-[0_10px_30px_rgba(217,119,6,0.3)] transition-all group active:scale-[0.98] animate-bounce-subtle"
            >
              <ShoppingBag className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              RETOUR AU PANIER
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex-1 flex items-center justify-center gap-3 bg-[#2a1e16] text-[#fff8f0] font-black py-6 rounded-2xl hover:bg-[#3d2b1f] border border-[#3d2b1f] transition-all active:scale-[0.98]"
            >
              ACCUEIL STUDIO <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <p className="mt-10 text-[10px] text-[#5c4a3e] font-bold uppercase tracking-widest">
            Support technique : contact@fabiodms.com
          </p>
        </div>
      </div>
    </div>
  );
};
