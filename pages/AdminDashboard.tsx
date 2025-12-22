
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Add 'X' to imports
import { TrendingUp, DollarSign, Scale, FileText, Lock, Calendar, PieChart, UploadCloud, ShieldCheck, Activity, Users, FileDigit, Key, Save, CheckCircle2, X } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeStatus, setPinChangeStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length === 6 && newPin === confirmPin) {
      localStorage.setItem('fabio_admin_pin', newPin);
      setPinChangeStatus('SUCCESS');
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => setPinChangeStatus('IDLE'), 3000);
    } else {
      setPinChangeStatus('ERROR');
    }
  };

  return (
    <div className="pb-20 max-w-6xl mx-auto animate-in fade-in">
      <header className="mb-12 border-b border-[#3d2b1f] pb-8 relative">
        <div className="absolute top-0 right-0 bg-red-600/10 text-red-500 px-4 py-1.5 rounded-full text-[10px] font-black border border-red-900/30 flex items-center gap-2">
            <Activity className="w-3 h-3 animate-pulse" /> SYSTÈME PRIVÉ SÉCURISÉ
        </div>
        <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-900/40">
                <Lock className="w-7 h-7 text-white" />
            </div>
            <div>
                <h1 className="text-4xl font-black text-[#fff8f0] tracking-tighter uppercase italic">Command <span className="text-red-600 text-stroke">Center</span></h1>
                <p className="text-[#a89080] font-medium">Gestion Juridique, Financière et Opérationnelle • Fabio DMS</p>
            </div>
        </div>
      </header>

      {/* QUICK STATS - ADMIN ONLY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
           <div className="bg-[#1e1510] p-5 rounded-2xl border border-[#3d2b1f] flex items-center gap-4">
               <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                   <DollarSign className="w-5 h-5 text-emerald-500" />
               </div>
               <div>
                   <p className="text-[10px] font-black text-[#5c4a3e] uppercase tracking-widest">Revenus Mois</p>
                   <p className="text-xl font-black text-white">4 250€</p>
               </div>
           </div>
           <div className="bg-[#1e1510] p-5 rounded-2xl border border-[#3d2b1f] flex items-center gap-4">
               <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                   <Users className="w-5 h-5 text-blue-500" />
               </div>
               <div>
                   <p className="text-[10px] font-black text-[#5c4a3e] uppercase tracking-widest">Ventes Beats</p>
                   <p className="text-xl font-black text-white">128</p>
               </div>
           </div>
           <div className="bg-[#1e1510] p-5 rounded-2xl border border-[#3d2b1f] flex items-center gap-4">
               <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20">
                   <ShieldCheck className="w-5 h-5 text-purple-500" />
               </div>
               <div>
                   <p className="text-[10px] font-black text-[#5c4a3e] uppercase tracking-widest">Contrats Signés</p>
                   <p className="text-xl font-black text-white">14</p>
               </div>
           </div>
           <div className="bg-[#1e1510] p-5 rounded-2xl border border-[#3d2b1f] flex items-center gap-4">
               <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
                   <Activity className="w-5 h-5 text-amber-500" />
               </div>
               <div>
                   <p className="text-[10px] font-black text-[#5c4a3e] uppercase tracking-widest">Score Business</p>
                   <p className="text-xl font-black text-white">92%</p>
               </div>
           </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {/* Cards Grid */}
        <Link to="/admin/upload" className="bg-[#1e1510] border border-red-600/30 rounded-[2rem] p-8 hover:bg-[#251a14] hover:border-red-600/50 transition-all group relative overflow-hidden shadow-xl active:scale-[0.98]">
            <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center mb-6 shadow-xl shadow-red-900/30 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-[#fff8f0] mb-2 uppercase italic tracking-tighter">Catalogue Beats</h3>
                <p className="text-sm text-[#a89080] font-medium">Ajouter, modifier ou supprimer des productions du catalogue public.</p>
            </div>
        </Link>

        <Link to="/admin/accounting" className="bg-[#1e1510] border border-[#3d2b1f] rounded-[2rem] p-8 hover:border-emerald-600/50 transition-all group relative overflow-hidden active:scale-[0.98]">
            <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center mb-6 shadow-xl shadow-emerald-900/30 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-[#fff8f0] mb-2 uppercase italic tracking-tighter">Comptabilité</h3>
                <p className="text-sm text-[#a89080] font-medium">Journal des recettes BNC, charges URSSAF et suivi de trésorerie.</p>
            </div>
        </Link>

        <Link to="/admin/invoices" className="bg-[#1e1510] border border-[#3d2b1f] rounded-[2rem] p-8 hover:border-amber-600/50 transition-all group relative overflow-hidden active:scale-[0.98]">
            <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center mb-6 shadow-xl shadow-amber-900/30 group-hover:scale-110 transition-transform">
                    <FileDigit className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-2xl font-black text-[#fff8f0] mb-2 uppercase italic tracking-tighter">Scanner IA</h3>
                <p className="text-sm text-[#a89080] font-medium">Extraire automatiquement les données de vos factures fournisseurs.</p>
            </div>
        </Link>

        <Link to="/admin/planning" className="bg-[#1e1510] border border-[#3d2b1f] rounded-[2rem] p-8 hover:border-blue-600/50 transition-all group relative overflow-hidden active:scale-[0.98]">
            <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-900/30 group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-[#fff8f0] mb-2 uppercase italic tracking-tighter">Planning Studio</h3>
                <p className="text-sm text-[#a89080] font-medium">Échéances SACEM, sessions studio et deadlines de mixage.</p>
            </div>
        </Link>

        <Link to="/admin/contracts" className="bg-[#1e1510] border border-[#3d2b1f] rounded-[2rem] p-8 hover:border-purple-600/50 transition-all group relative overflow-hidden active:scale-[0.98]">
            <div className="relative z-10">
                 <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center mb-6 shadow-xl shadow-purple-900/30 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-[#fff8f0] mb-2 uppercase italic tracking-tighter">IA Juridique</h3>
                <p className="text-sm text-[#a89080] font-medium">Analyse instantanée des clauses de vos contrats d'édition.</p>
            </div>
        </Link>

        <Link to="/admin/business" className="bg-[#1e1510] border border-[#3d2b1f] rounded-[2rem] p-8 hover:border-cyan-600/50 transition-all group relative overflow-hidden active:scale-[0.98]">
            <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-cyan-600 flex items-center justify-center mb-6 shadow-xl shadow-cyan-900/30 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-[#fff8f0] mb-2 uppercase italic tracking-tighter">Business Plan</h3>
                <p className="text-sm text-[#a89080] font-medium">Projections financières sur 3 ans et stratégie de croissance.</p>
            </div>
        </Link>
      </div>

      {/* SÉCURITÉ : MODIFIER LE PIN */}
      <section className="bg-[#1a120b] border border-[#3d2b1f] rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
           <Key className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10 max-w-xl">
           <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4 flex items-center gap-3">
             <ShieldCheck className="w-6 h-6 text-amber-500" /> 
             Sécurité du Studio
           </h3>
           <p className="text-sm text-[#a89080] mb-8 font-medium italic">
             Fabio, tu peux modifier ici ton code d'accès à 6 chiffres pour protéger tes données financières et juridiques.
           </p>

           <form onSubmit={handleUpdatePin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[10px] font-black text-[#8c7a6b] uppercase tracking-widest mb-1.5 ml-1">Nouveau Code PIN</label>
                    <input 
                      type="password" 
                      maxLength={6}
                      placeholder="6 chiffres"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white focus:border-amber-600 outline-none font-black tracking-[0.5em] text-center"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-[#8c7a6b] uppercase tracking-widest mb-1.5 ml-1">Confirmer le Code</label>
                    <input 
                      type="password" 
                      maxLength={6}
                      placeholder="6 chiffres"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white focus:border-amber-600 outline-none font-black tracking-[0.5em] text-center"
                    />
                 </div>
              </div>

              {pinChangeStatus === 'SUCCESS' && (
                <div className="p-3 bg-emerald-900/20 text-emerald-400 border border-emerald-900/30 rounded-xl text-xs font-black flex items-center gap-2 animate-in fade-in zoom-in-95">
                  <CheckCircle2 className="w-4 h-4" /> CODE PIN MIS À JOUR AVEC SUCCÈS
                </div>
              )}

              {pinChangeStatus === 'ERROR' && (
                <div className="p-3 bg-red-900/20 text-red-400 border border-red-900/30 rounded-xl text-xs font-black flex items-center gap-2 animate-in fade-in zoom-in-95">
                  <X className="w-4 h-4" /> LES CODES NE CORRESPONDENT PAS OU FORMAT INVALIDE
                </div>
              )}

              <button 
                type="submit"
                disabled={newPin.length !== 6 || newPin !== confirmPin}
                className="bg-white hover:bg-amber-600 hover:text-white text-black font-black px-8 py-4 rounded-xl transition-all shadow-xl active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 uppercase text-xs"
              >
                <Save className="w-4 h-4" /> Mettre à jour le code secret
              </button>
           </form>
        </div>
      </section>

      <div className="mt-12 p-6 bg-red-950/10 border border-red-900/30 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-red-500" />
              <div>
                  <h4 className="font-black text-white text-sm uppercase tracking-widest">SÉCURITÉ DU SYSTÈME</h4>
                  <p className="text-xs text-red-500/70 font-medium italic">Accès restreint au propriétaire du compte (Fabio DMS).</p>
              </div>
          </div>
          <p className="text-[10px] text-[#5c4a3e] font-bold uppercase tracking-[0.2em]">Dernière connexion : Aujourd'hui à {new Date().getHours()}h{new Date().getMinutes()}</p>
      </div>
    </div>
  );
};
