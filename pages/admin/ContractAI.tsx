
import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Send, Save, Trash2, Clock, History, CheckCircle2, ChevronRight, Scale, X, ScrollText } from 'lucide-react';
import { analyzeContract } from '../../services/geminiService';
import { ContractArchive } from '../../types';

export const ContractAI: React.FC = () => {
  const STORAGE_KEY = 'fabio_contract_archives_v1';
  
  const [contractText, setContractText] = useState('');
  const [contractTitle, setContractTitle] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'ANALYZER' | 'ARCHIVES'>('ANALYZER');
  
  const [archives, setArchives] = useState<ContractArchive[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Erreur chargement archives contrats:", e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(archives));
  }, [archives]);

  const handleAnalyze = async () => {
    if (!contractText.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult('');
    try {
      const result = await analyzeContract(contractText);
      setAnalysisResult(result);
    } catch (err) {
      setAnalysisResult("Erreur lors de l'analyse IA.");
    }
    setIsAnalyzing(false);
  };

  const saveToArchives = () => {
    if (!analysisResult || !contractText) return;
    
    const newEntry: ContractArchive = {
      id: `contract-${Date.now()}`,
      title: contractTitle || `Contrat du ${new Date().toLocaleDateString()}`,
      date: new Date().toLocaleDateString(),
      content: contractText,
      analysis: analysisResult
    };
    
    setArchives(prev => [newEntry, ...prev]);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const deleteArchive = (id: string) => {
    if (window.confirm("Supprimer définitivement ce contrat des archives ?")) {
      setArchives(prev => prev.filter(a => a.id !== id));
    }
  };

  const loadFromArchive = (archive: ContractArchive) => {
    setContractTitle(archive.title);
    setContractText(archive.content);
    setAnalysisResult(archive.analysis);
    setActiveTab('ANALYZER');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pb-20 max-w-5xl mx-auto animate-in fade-in">
      <header className="mb-10 border-b border-[#3d2b1f] pb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-900/20">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              IA <span className="text-purple-500 text-stroke">Juridique</span>
            </h1>
            <p className="text-[#a89080] font-medium italic">Analyse et archivage des contrats d'édition & production.</p>
          </div>
        </div>
      </header>

      <div className="flex bg-[#1e1510] p-1 rounded-2xl border border-[#3d2b1f] w-full max-w-sm mb-10 shadow-xl">
          <button
            onClick={() => setActiveTab('ANALYZER')}
            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'ANALYZER' ? 'bg-purple-600 text-white shadow-lg' : 'text-[#8c7a6b] hover:text-white'}`}
          >
            Analyseur
          </button>
          <button
            onClick={() => setActiveTab('ARCHIVES')}
            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'ARCHIVES' ? 'bg-amber-600 text-black shadow-lg' : 'text-[#8c7a6b] hover:text-white'}`}
          >
            Contrathèque
          </button>
      </div>

      {activeTab === 'ANALYZER' ? (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
          <div className="bg-[#1e1510] rounded-[2.5rem] border border-[#3d2b1f] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <ScrollText className="w-48 h-48 text-white" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-[#8c7a6b] uppercase tracking-widest mb-2 ml-1">Titre ou Nom de l'Artiste</label>
                  <input 
                    type="text" 
                    value={contractTitle} 
                    onChange={e => setContractTitle(e.target.value)} 
                    placeholder="Ex: Contrat Édition Warren Saada"
                    className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-6 py-4 text-white focus:border-purple-600 outline-none transition-all placeholder-[#3d2b1f]" 
                  />
                </div>
              </div>

              <label className="block text-[10px] font-black text-[#8c7a6b] uppercase tracking-widest mb-2 ml-1">Contenu du Contrat (Texte)</label>
              <textarea
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  placeholder="Collez ici les clauses du contrat pour analyse..."
                  className="w-full h-64 bg-[#120a05] border border-[#3d2b1f] rounded-2xl p-6 text-sm text-[#d1d5db] focus:outline-none focus:border-purple-600 mb-6 placeholder-[#3d2b1f] resize-none leading-relaxed shadow-inner"
              />

              <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !contractText}
                  className={`w-full py-5 rounded-2xl font-black flex items-center justify-center gap-4 transition-all shadow-xl text-lg tracking-tighter uppercase italic ${isAnalyzing ? 'bg-[#3d2b1f] text-[#5c4a3e]' : 'bg-purple-600 hover:bg-purple-500 text-white active:scale-[0.98]'}`}
              >
                  {isAnalyzing ? (
                      <><div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> ANALYSE EN COURS...</>
                  ) : (
                      <><Send className="w-6 h-6" /> ANALYSER LE CONTRAT</>
                  )}
              </button>
            </div>
          </div>

          {analysisResult && (
              <div className="bg-[#1a120b] border border-purple-900/30 rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-in slide-in-from-top-4 relative group">
                  <div className="flex justify-between items-center mb-8">
                    <h4 className="font-black text-3xl italic tracking-tighter text-white uppercase">Analyse <span className="text-purple-500 text-stroke">Studio</span></h4>
                    <div className="flex gap-4">
                      {showSaveSuccess ? (
                        <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-4 py-2 rounded-xl border border-emerald-500/30 flex items-center gap-2">
                           <CheckCircle2 className="w-4 h-4" /> ARCHIVÉ !
                        </div>
                      ) : (
                        <button 
                          onClick={saveToArchives}
                          className="bg-white hover:bg-purple-600 hover:text-white text-black font-black px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 text-xs uppercase"
                        >
                           <Save className="w-4 h-4" /> Sauvegarder l'analyse
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="bg-[#120a05] p-8 rounded-3xl border border-purple-900/20 text-[#d1d5db] leading-relaxed whitespace-pre-line shadow-inner text-base">
                      {analysisResult}
                  </div>
              </div>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
           <div className="bg-gradient-to-r from-amber-900/20 to-transparent p-8 rounded-[2.5rem] border border-amber-500/30 flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center shadow-lg"><History className="w-8 h-8 text-black" /></div>
                 <div><h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Contrathèque Fabio</h3><p className="text-[#a89080] text-sm font-medium">Tes analyses juridiques sauvegardées pour consultation rapide.</p></div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {archives.map(archive => (
                <div key={archive.id} className="bg-[#1e1510] border border-[#3d2b1f] p-8 rounded-[2rem] hover:border-purple-600/40 transition-all group flex flex-col justify-between shadow-xl">
                   <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="bg-purple-900/10 p-4 rounded-2xl border border-purple-900/20 group-hover:scale-110 transition-transform">
                           <FileText className="w-8 h-8 text-purple-400" />
                        </div>
                        <button onClick={() => deleteArchive(archive.id)} className="text-[#3d2b1f] hover:text-red-500 transition-colors p-2"><Trash2 className="w-5 h-5" /></button>
                      </div>
                      <h4 className="text-white font-black text-2xl uppercase tracking-tighter mb-2 line-clamp-2 italic">{archive.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-[#8c7a6b] font-black uppercase tracking-widest mb-6">
                         <Clock className="w-3 h-3" /> Analysé le {archive.date}
                      </div>
                      <p className="text-xs text-[#a89080] line-clamp-3 leading-relaxed mb-8 italic">
                         {archive.analysis.substring(0, 150)}...
                      </p>
                   </div>
                   <button 
                    onClick={() => loadFromArchive(archive)}
                    className="w-full py-4 bg-[#120a05] text-[#fff8f0] font-black uppercase text-[10px] tracking-widest rounded-xl border border-[#3d2b1f] hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-3"
                   >
                     Consulter l'analyse <ChevronRight className="w-4 h-4" />
                   </button>
                </div>
              ))}
              {archives.length === 0 && (
                <div className="col-span-full py-24 text-center bg-[#1e1510] rounded-[3rem] border border-dashed border-[#3d2b1f] opacity-30">
                   <FileText className="w-20 h-20 mx-auto mb-6 opacity-20" />
                   <p className="text-xl font-bold italic">Aucun contrat archivé.</p>
                   <p className="text-sm mt-2">Utilise l'analyseur pour commencer à bâtir ta contrathèque.</p>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};
