
import React from 'react';
import { Scale, Calculator } from 'lucide-react';
import { MOCK_TRANSACTIONS } from '../../constants';

export const LegalStatusPage: React.FC = () => {
  // --- LOGIC FOR STATUS DIAGNOSTIC ---
  const totalIncome = MOCK_TRANSACTIONS.filter(t => t.type === 'IN').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = MOCK_TRANSACTIONS.filter(t => t.type === 'OUT').reduce((acc, t) => acc + t.amount, 0);
  
  // Projection annuelle simpliste (x12 sur le mois en cours pour l'exemple)
  const projectedAnnualRevenue = totalIncome * 12; 
  const projectedAnnualExpenses = totalExpenses * 12;
  const expensesRatio = projectedAnnualRevenue > 0 ? (projectedAnnualExpenses / projectedAnnualRevenue) * 100 : 0;

  const getStatusRecommendation = () => {
      if (projectedAnnualRevenue > 77700) return { type: 'SOCIÉTÉ (EURL/SASU)', color: 'text-purple-400', reason: "Vous dépassez le plafond de la micro-entreprise en prestation de services." };
      if (expensesRatio > 50) return { type: 'RÉEL (EURL)', color: 'text-blue-400', reason: "Vos charges réelles dépassent l'abattement forfaitaire de 34% de la micro." };
      return { type: 'AUTO-ENTREPRENEUR', color: 'text-emerald-400', reason: "Vos charges sont faibles (<34%) et votre CA est sous les seuils. C'est le plus rentable." };
  };

  const recommendation = getStatusRecommendation();

  return (
    <div className="pb-20 max-w-6xl mx-auto animate-in fade-in">
       <header className="mb-8 border-b border-[#3d2b1f] pb-6">
        <h1 className="text-3xl font-bold text-[#fff8f0] flex items-center gap-3">
            <Scale className="w-8 h-8 text-blue-400" />
            Diagnostic Statut Juridique
        </h1>
        <p className="text-[#a89080] mt-2">Comparatif en temps réel basé sur votre comptabilité.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-left-4">
              <div className="bg-[#1e1510] p-6 rounded-xl border border-[#3d2b1f]">
                  <h3 className="text-xl font-bold text-[#fff8f0] mb-6 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-emerald-500" />
                      Données Comptables (Projection)
                  </h3>
                  <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-[#2a1e16] rounded-lg">
                          <span className="text-[#a89080]">CA Annuel Projeté</span>
                          <span className="font-bold text-[#fff8f0]">{projectedAnnualRevenue.toFixed(0)}€</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-[#2a1e16] rounded-lg">
                          <span className="text-[#a89080]">Charges Annuelles Projetées</span>
                          <span className="font-bold text-red-400">{projectedAnnualExpenses.toFixed(0)}€</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-[#2a1e16] rounded-lg border border-[#3d2b1f]">
                          <span className="text-[#a89080]">Ratio Charges/CA</span>
                          <span className={`font-bold ${expensesRatio > 34 ? 'text-orange-500' : 'text-emerald-500'}`}>
                              {expensesRatio.toFixed(1)}%
                          </span>
                      </div>
                      <p className="text-xs text-[#5c4a3e] mt-2 italic">
                          *Basé sur votre comptabilité actuelle x 12 mois.
                      </p>
                  </div>
              </div>

              <div className="bg-gradient-to-br from-[#1e1510] to-[#120a05] p-6 rounded-xl border border-blue-900/30 shadow-lg relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Scale className="w-32 h-32 text-blue-500" />
                   </div>
                   <h3 className="text-xl font-bold text-[#fff8f0] mb-4 relative z-10">Verdict de l'Algorithme</h3>
                   <div className="mb-6 relative z-10">
                       <p className="text-[#8c7a6b] text-sm mb-1">Statut Recommandé :</p>
                       <p className={`text-3xl font-black ${recommendation.color}`}>{recommendation.type}</p>
                   </div>
                   <div className="bg-[#1a120b]/80 backdrop-blur p-4 rounded-lg border border-[#3d2b1f] relative z-10">
                       <p className="text-[#d1d5db] text-sm leading-relaxed">
                           <span className="font-bold text-amber-500">Pourquoi ?</span> {recommendation.reason}
                       </p>
                   </div>
              </div>
      </div>
    </div>
  );
};
