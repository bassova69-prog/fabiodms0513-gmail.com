
import React, { useState } from 'react';
import { FileText, Send } from 'lucide-react';
import { analyzeContract } from '../../services/geminiService';

export const ContractAI: React.FC = () => {
  const [contractText, setContractText] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!contractText.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult('');
    const result = await analyzeContract(contractText);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="pb-20 max-w-3xl mx-auto animate-in fade-in">
      <header className="mb-8 border-b border-[#3d2b1f] pb-6">
        <h1 className="text-3xl font-bold text-[#fff8f0] flex items-center gap-3">
            <FileText className="w-8 h-8 text-purple-400" />
            Assistant Juridique IA
        </h1>
        <p className="text-[#a89080] mt-2">Analysez vos contrats d'édition et protégez vos droits.</p>
      </header>

      <div className="bg-[#1e1510] rounded-xl border border-[#3d2b1f] p-6">
        <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-900/30 p-2 rounded-lg border border-purple-800">
                <FileText className="w-6 h-6 text-purple-300" />
            </div>
            <div>
                <h3 className="font-bold text-xl text-[#fff8f0]">Analyseur de Contrat</h3>
                <p className="text-sm text-[#8c7a6b]">Collez une clause ou un contrat complet.</p>
            </div>
        </div>

        <textarea
            value={contractText}
            onChange={(e) => setContractText(e.target.value)}
            placeholder="Collez le texte du contrat ici... (Ex: 'L'éditeur percevra 50% des revenus mécaniques à perpétuité...')"
            className="w-full h-48 bg-[#120a05] border border-[#3d2b1f] rounded-lg p-4 text-sm text-[#fff8f0] focus:outline-none focus:border-amber-600 mb-4 placeholder-[#5c4a3e]"
        />

        <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !contractText}
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${isAnalyzing ? 'bg-[#3d2b1f] cursor-not-allowed' : 'bg-[#d4a373] text-[#1a120b] hover:bg-[#e6b98e]'}`}
        >
            {isAnalyzing ? (
                <>Analyse en cours...</>
            ) : (
                <><Send className="w-4 h-4" /> Analyser avec l'Assistant Juridique</>
            )}
        </button>

        {analysisResult && (
            <div className="mt-8 pt-8 border-t border-[#3d2b1f] animate-fade-in">
                <h4 className="font-bold text-lg mb-4 text-purple-300">Analyse de l'Assistant :</h4>
                <div className="bg-[#120a05] p-6 rounded-lg border border-purple-900/20 text-[#d1d5db] leading-relaxed whitespace-pre-line shadow-inner">
                    {analysisResult}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
