
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Download, CheckCircle2, Music, ShoppingBag, Share2, ArrowRight, Loader2, Info, FileAudio, Landmark } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Transaction } from '../types';

export const Success: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsCartOpen } = useCart();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showDownloadTip, setShowDownloadTip] = useState(false);
  const processedRef = useRef(false);
  
  // Récupération des articles achetés depuis l'état de navigation
  const purchasedItems = location.state?.items || [];

  // ENREGISTREMENT AUTOMATIQUE DANS LA COMPTABILITÉ
  useEffect(() => {
    if (purchasedItems.length > 0 && !processedRef.current) {
      const ACCOUNTING_STORAGE_KEY = 'fabio_pro_accounting_v1';
      
      try {
        const savedTransactions = JSON.parse(localStorage.getItem(ACCOUNTING_STORAGE_KEY) || '[]');
        
        // Création des transactions pour chaque beat acheté
        const newTransactions: Transaction[] = purchasedItems.map((item: any) => ({
          id: `sale-${item.id}`, // Utilise l'ID unique de l'item du panier
          date: new Date().toLocaleDateString('fr-FR'),
          label: `Vente: ${item.beat.title} (${item.license.name})`,
          customer: "Client Boutique Web",
          category: 'VENTE',
          amount: item.license.price,
          type: 'IN',
          status: 'PAYÉ'
        }));

        // Filtrer pour éviter les doublons si l'ID existe déjà (cas du refresh page)
        const existingIds = new Set(savedTransactions.map((t: any) => t.id));
        const filteredNew = newTransactions.filter(nt => !existingIds.has(nt.id));

        if (filteredNew.length > 0) {
          const updatedTransactions = [...filteredNew, ...savedTransactions];
          localStorage.setItem(ACCOUNTING_STORAGE_KEY, JSON.stringify(updatedTransactions));
          console.log(`${filteredNew.length} vente(s) enregistrée(s) dans le journal de caisse.`);
        }
        
        processedRef.current = true;
      } catch (e) {
        console.error("Erreur lors de l'enregistrement comptable automatique:", e);
      }
    }
  }, [purchasedItems]);

  const handleDownload = (audioUrl: string, title: string, fileType: string, id: string) => {
    if (!audioUrl) return;
    
    setDownloadingId(id);
    setShowDownloadTip(true);

    const extension = fileType === 'WAV' || fileType === 'TRACKOUT' ? 'wav' : 'mp3';
    const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_fabio_dms.${extension}`;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('download', fileName);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadingId(null);
    }, 2000);
  };

  const handleBackToCart = () => {
    navigate('/beats');
    setTimeout(() => {
      setIsCartOpen(true);
    }, 200);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="max-w-3xl w-full bg-[#1a120b] border border-[#3d2b1f] rounded-[3rem] p-8 md:p-14 shadow-2xl relative overflow-hidden">
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
            Félicitations Fabio ! Tes licences sont prêtes. Les ventes ont été ajoutées automatiquement à ton <span className="text-white border-b border-amber-500/30">journal de caisse</span>.
          </p>

          <div className="mb-8 flex items-center gap-2 bg-emerald-950/20 text-emerald-400 px-4 py-2 rounded-full border border-emerald-900/30 text-[10px] font-black uppercase tracking-widest animate-pulse">
            <Landmark className="w-3 h-3" /> Comptabilité à jour
          </div>

          {showDownloadTip && (
            <div className="mb-8 p-4 bg-amber-900/10 border border-amber-900/30 rounded-2xl flex items-start gap-3 text-left animate-in slide-in-from-top-2">
                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200">
                    Le téléchargement s'ouvre dans un nouvel onglet. <span className="font-bold text-white uppercase tracking-tighter">Garde cet onglet ouvert</span> pour revenir à ton panier ou continuer tes achats.
                </p>
            </div>
          )}

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
