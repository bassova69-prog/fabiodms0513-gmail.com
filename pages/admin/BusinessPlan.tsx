
import React, { useState } from 'react';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Line, ComposedChart, Area, AreaChart } from 'recharts';
import { TrendingUp, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { generateFinancialProjection } from '../../constants';

export const BusinessPlan: React.FC = () => {
  const [financialData] = useState(generateFinancialProjection());

  return (
    <div className="pb-20 max-w-6xl mx-auto animate-in fade-in">
      <header className="mb-10 border-b border-[#3d2b1f] pb-6">
        <h1 className="text-4xl font-black text-white flex items-center gap-4 tracking-tighter">
            <TrendingUp className="w-10 h-10 text-emerald-500" />
            Plan de Croissance <span className="text-amber-500">2025-2028</span>
        </h1>
        <p className="text-[#a89080] mt-2 font-medium">Projection de rentabilité nette (ACRE incluse).</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#1e1510] p-8 rounded-3xl border border-[#3d2b1f] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-16 h-16 text-emerald-500" />
            </div>
            <h3 className="text-[#8c7a6b] text-xs font-black uppercase tracking-widest mb-2">Net Moyen Projeté</h3>
            <p className="text-4xl font-black text-white">1 850€<span className="text-sm text-emerald-500 ml-1">/m</span></p>
            <div className="mt-3 text-[10px] text-emerald-400 font-bold bg-emerald-900/20 px-2 py-1 rounded inline-block">ACRE + ARE INCLUSES</div>
        </div>

        <div className="bg-[#1e1510] p-8 rounded-3xl border border-[#3d2b1f]">
            <h3 className="text-[#8c7a6b] text-xs font-black uppercase tracking-widest mb-2">Pression Fiscale</h3>
            <p className="text-4xl font-black text-red-400">15.3%</p>
            <div className="mt-3 text-[10px] text-[#8c7a6b] uppercase font-bold">(URSSAF + IR LIBÉRATOIRE)</div>
        </div>

        <div className="bg-gradient-to-br from-amber-600/10 to-transparent p-8 rounded-3xl border border-amber-600/20">
            <h3 className="text-amber-500 text-xs font-black uppercase tracking-widest mb-2">Objectif CA Annuel</h3>
            <p className="text-4xl font-black text-white">25 000€</p>
            <div className="mt-3 text-[10px] text-amber-500 font-bold flex items-center gap-1"><Zap className="w-3 h-3" /> FOCUS : LEASING BEATS</div>
        </div>
      </div>

      <div className="bg-[#1e1510] p-8 rounded-3xl border border-[#3d2b1f] shadow-2xl relative">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Trésorerie Disponible (Le Reste à Vivre)
            </h3>
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2 text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Revenu Brut</span>
                <span className="flex items-center gap-2 text-amber-500"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Argent Net</span>
            </div>
        </div>
        
        <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialData}>
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a1e16" vertical={false} />
                    <XAxis dataKey="month" stroke="#5c4a3e" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#5c4a3e" fontSize={10} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1a120b', border: '1px solid #3d2b1f', borderRadius: '16px', boxShadow: '0 10px 20px rgba(0,0,0,0.4)' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="income" name="Revenu Brut Total" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                    <Area type="monotone" dataKey="net" name="Net après URSSAF/Impôts" stroke="#f59e0b" fillOpacity={1} fill="url(#colorNet)" strokeWidth={3} />
                </AreaChart>
            </ResponsiveContainer>
        </div>

        <div className="mt-8 p-6 bg-amber-900/10 rounded-2xl border border-amber-900/20 flex gap-4 items-start">
             <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
             <div className="space-y-2">
                <p className="text-sm text-white font-bold underline">Analyse Fabio DMS Studio :</p>
                <p className="text-xs text-[#a89080] leading-relaxed">
                    Le graphique montre une chute de revenus relative après le 12ème mois : c'est la <span className="text-white">fin du maintien ARE</span>. 
                    Il est impératif d'avoir stabilisé au moins <span className="text-white font-bold">1 500€/mois</span> de ventes de beats en leasing avant cette échéance pour maintenir votre niveau de vie sans aide.
                </p>
             </div>
        </div>
      </div>
    </div>
  );
};
