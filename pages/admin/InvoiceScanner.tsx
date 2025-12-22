
import React, { useState, useRef } from 'react';
import { Camera, Upload, FileDigit, CheckCircle2, AlertCircle, Loader2, Save, X, Landmark, ReceiptText, User } from 'lucide-react';
import { analyzeInvoice } from '../../services/geminiService';
import { Transaction } from '../../types';

export const InvoiceScanner: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clé unique partagée avec Accounting.tsx
  const ACCOUNTING_STORAGE_KEY = 'fabio_pro_accounting_v1';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('LOADING');
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      setImagePreview(reader.result as string);
      
      try {
        const result = await analyzeInvoice(base64Data, file.type);
        setAnalysisResult(result);
        setStatus('SUCCESS');
      } catch (err) {
        console.error(err);
        setStatus('ERROR');
      }
    };
    reader.readAsDataURL(file);
  };

  const saveToAccounting = () => {
    if (!analysisResult) return;
    
    try {
        const savedTransactions = JSON.parse(localStorage.getItem(ACCOUNTING_STORAGE_KEY) || '[]');
        const newTx: Transaction = {
            id: `scan-${Date.now()}`,
            date: analysisResult.date,
            label: analysisResult.label,
            customer: analysisResult.customerName,
            amount: analysisResult.amount,
            type: analysisResult.type,
            category: analysisResult.category,
            status: 'PAYÉ'
        };
        
        localStorage.setItem(ACCOUNTING_STORAGE_KEY, JSON.stringify([newTx, ...savedTransactions]));
        alert(`Pièce comptable pour "${analysisResult.customerName}" archivée avec succès !`);
        resetScanner();
    } catch (e) {
        alert("Erreur lors de la sauvegarde.");
        console.error(e);
    }
  };

  const resetScanner = () => {
    setImagePreview(null);
    setAnalysisResult(null);
    setStatus('IDLE');
  };

  return (
    <div className="pb-20 max-w-4xl mx-auto animate-in fade-in">
      <header className="mb-8 border-b border-[#3d2b1f] pb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FileDigit className="w-8 h-8 text-amber-500" />
          Scanner de Factures IA
        </h1>
        <p className="text-[#a89080] mt-2">Uploadez vos factures, l'IA extrait les montants et le client facturé.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* DROPZONE / CAMERA */}
        <div className="space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-[3/4] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-8 transition-all cursor-pointer relative overflow-hidden ${imagePreview ? 'border-amber-500 bg-amber-500/5' : 'border-[#3d2b1f] hover:border-amber-500 hover:bg-[#1a120b]'}`}
          >
            {imagePreview ? (
              <img src={imagePreview} className="absolute inset-0 w-full h-full object-contain p-4" alt="Scan preview" />
            ) : (
              <>
                <div className="w-20 h-20 bg-amber-900/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Prendre une photo</h3>
                <p className="text-center text-[#8c7a6b] text-sm">ou glissez-déposez votre facture ici (PDF, JPG, PNG)</p>
              </>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,application/pdf" />
          </div>
          
          {imagePreview && status !== 'LOADING' && (
            <button onClick={resetScanner} className="w-full py-3 rounded-xl border border-red-900/50 text-red-400 hover:bg-red-900/10 font-bold flex items-center justify-center gap-2">
               <X className="w-5 h-5" /> Annuler / Refaire
            </button>
          )}
        </div>

        {/* RESULTS / PIECE COMPTABLE */}
        <div className="flex flex-col gap-6">
           <div className="bg-[#1a120b] border border-[#3d2b1f] rounded-3xl p-6 h-full min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ReceiptText className="w-5 h-5 text-amber-500" />
                  Pièce Comptable
                </h2>
                {status === 'SUCCESS' && <span className="px-2 py-1 bg-emerald-900/30 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-900/50">IA VALIDÉE</span>}
              </div>

              {status === 'IDLE' && (
                <div className="h-64 flex flex-col items-center justify-center text-center opacity-30">
                  <FileDigit className="w-16 h-16 mb-4" />
                  <p className="text-sm">En attente d'une facture...</p>
                </div>
              )}

              {status === 'LOADING' && (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
                  <p className="text-white font-bold">Analyse en cours par l'IA...</p>
                  <p className="text-xs text-[#8c7a6b] mt-2">Identification du client et des montants</p>
                </div>
              )}

              {status === 'ERROR' && (
                <div className="p-6 bg-red-900/20 rounded-2xl border border-red-900/50 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-400 font-bold">Erreur d'analyse</p>
                  <button onClick={() => setStatus('IDLE')} className="mt-4 text-xs text-red-300 underline">Réessayer</button>
                </div>
              )}

              {status === 'SUCCESS' && analysisResult && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <div className="p-4 bg-[#2a1e16] rounded-xl border border-amber-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <User className="w-12 h-12 text-amber-500" />
                    </div>
                    <label className="text-[10px] uppercase font-bold text-[#8c7a6b]">Personne ou Société facturée</label>
                    <p className="text-white font-black text-lg">{analysisResult.customerName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#2a1e16] rounded-xl border border-[#3d2b1f]">
                      <label className="text-[10px] uppercase font-bold text-[#8c7a6b]">Date</label>
                      <p className="text-white font-mono">{analysisResult.date}</p>
                    </div>
                    <div className="p-4 bg-[#2a1e16] rounded-xl border border-[#3d2b1f]">
                      <label className="text-[10px] uppercase font-bold text-[#8c7a6b]">Montant TTC</label>
                      <p className="text-2xl font-black text-amber-500">{analysisResult.amount.toFixed(2)}€</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#2a1e16] rounded-xl border border-[#3d2b1f]">
                    <label className="text-[10px] uppercase font-bold text-[#8c7a6b]">Émetteur / Marchand</label>
                    <p className="text-white font-bold">{analysisResult.label}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#2a1e16] rounded-xl border border-[#3d2b1f]">
                      <label className="text-[10px] uppercase font-bold text-[#8c7a6b]">Flux</label>
                      <p className={`font-bold ${analysisResult.type === 'IN' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {analysisResult.type === 'IN' ? 'Revenu (Vente)' : 'Dépense (Achat)'}
                      </p>
                    </div>
                    <div className="p-4 bg-[#2a1e16] rounded-xl border border-[#3d2b1f]">
                      <label className="text-[10px] uppercase font-bold text-[#8c7a6b]">Catégorie</label>
                      <p className="text-amber-500 font-bold">{analysisResult.category}</p>
                    </div>
                  </div>

                  <button 
                    onClick={saveToAccounting}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-2xl shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                  >
                    <Save className="w-5 h-5" />
                    Archiver pour {analysisResult.customerName}
                  </button>
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};
