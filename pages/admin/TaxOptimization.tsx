
import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle2, PieChart, MessageSquare, Send, Scale, Zap, Info } from 'lucide-react';
import { askTaxAdvisor } from '../../services/geminiService';

export const TaxOptimization: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    const result = await askTaxAdvisor(question);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="pb-20 max-w-6xl mx-auto animate-in fade-in">
       <header className="mb-10 border-b border-[#3d2b1f] pb-6">
        <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tighter">
            <PieChart className="w-10 h-10 text-cyan-500" />
            Optimisation Fiscale <span className="text-amber-500">Micro-BNC</span>
        </h1>
        <p className="text-[#a89080] mt-2 font-medium">Stratégies d'optimisation pour producteur de musique indépendant.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* GAUCHE : LEVIERS D'OPTIMISATION */}
          <div className="lg:col-span-1 space-y-6">
              
              <div className="bg-gradient-to-br from-cyan-900/20 to-transparent p-6 rounded-3xl border border-cyan-800/30">
                  <h3 className="font-bold text-cyan-400 mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      L'Abattement de 34%
                  </h3>
                  <p className="text-sm text-[#d1d5db] leading-relaxed">
                    En micro-entreprise BNC, le fisc considère par défaut que vos frais pro représentent <span className="text-white font-bold">34% de votre CA</span>. 
                    <br/><br/>
                    <span className="text-amber-500 font-bold">Le piège :</span> Si vos frais réels (achat matériel, studio, marketing) sont supérieurs à 34%, la micro-entreprise devient <span className="underline">moins rentable</span> qu'un régime réel (EURL/SASU).
                  </p>
              </div>

              <div className="bg-[#1e1510] p-6 rounded-3xl border border-[#3d2b1f] space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#8c7a6b]">Calendrier Fiscal Fabio</h4>
                  <div className="space-y-3">
                      <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="text-xs text-white">ACRE 13.1% : Jusqu'à Nov 2026</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-xs text-white">CFE Exonéré : Année 2025</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          <span className="text-xs text-white">Seuil TVA : Alerte à 39 100€</span>
                      </div>
                  </div>
              </div>

              <div className="bg-[#1a120b] p-6 rounded-3xl border border-[#3d2b1f] border-dashed">
                  <div className="flex items-center gap-2 text-amber-500 mb-2 font-bold text-sm">
                      <Info className="w-4 h-4" /> Astuce SACEM
                  </div>
                  <p className="text-xs text-[#a89080] leading-relaxed">
                    Les revenus SACEM sont imposés comme des BNC mais avec un abattement spécifique si déclarés en "Traitements et Salaires" ou un barème dégressif. Demandez à l'IA ci-contre comment arbitrer.
                  </p>
              </div>
          </div>

          {/* DROITE : EXPERT IA SPÉCIALISÉ */}
          <div className="lg:col-span-2">
              <div className="bg-[#1e1510] rounded-3xl border border-[#3d2b1f] p-8 h-full flex flex-col shadow-2xl relative">
                  <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-900/20">
                          <MessageSquare className="w-7 h-7 text-white" />
                      </div>
                      <div>
                          <h3 className="font-bold text-2xl text-white tracking-tight">Expert Fiscal Fabio DMS</h3>
                          <p className="text-sm text-[#8c7a6b]">Spécialisé en droits d'auteur, ACRE et micro-BNC.</p>
                      </div>
                  </div>

                  <div className="flex-1 space-y-6 mb-8 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                      {response ? (
                          <div className="p-6 bg-[#120a05] rounded-3xl border border-cyan-900/30 text-sm text-[#d1d5db] leading-loose animate-in fade-in slide-in-from-bottom-4 shadow-inner">
                              <span className="text-cyan-400 font-black uppercase text-[10px] block mb-2 tracking-widest">Conseil IA</span>
                              {response}
                          </div>
                      ) : (
                          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-10">
                              <PieChart className="w-16 h-16 mb-4 text-[#3d2b1f]" />
                              <p className="text-sm">Posez une question sur vos déclarations URSSAF, la TVA ou l'ACRE pour obtenir une simulation.</p>
                          </div>
                      )}
                  </div>

                  <form onSubmit={handleAsk} className="relative mt-auto">
                      <textarea
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder="Ex: J'ai fait 4000€ de CA en Janvier, combien dois-je mettre de côté pour l'URSSAF et l'impôt ?"
                          className="w-full h-32 bg-[#120a05] border border-[#3d2b1f] rounded-2xl p-6 text-sm text-white focus:outline-none focus:border-cyan-600 pr-16 placeholder-[#5c4a3e] resize-none shadow-xl"
                      />
                      <button
                          type="submit"
                          disabled={loading || !question.trim()}
                          className="absolute bottom-4 right-4 w-12 h-12 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all shadow-lg shadow-cyan-900/40 flex items-center justify-center disabled:opacity-50"
                      >
                          {loading ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                              <Send className="w-5 h-5" />
                          )}
                      </button>
                  </form>
              </div>
          </div>

      </div>
    </div>
  );
};
