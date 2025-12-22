
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Landmark, 
  DollarSign, 
  Plus, 
  Save, 
  X, 
  Pencil, 
  Trash2, 
  AlertCircle, 
  Sparkles, 
  ClipboardList,
  RotateCcw,
  FileCheck,
  ChevronRight,
  Copy,
  Check,
  Building2,
  CalendarDays,
  History,
  FileDigit,
  ReceiptText
} from 'lucide-react';
import { MOCK_TRANSACTIONS, MICRO_LIMITS } from '../../constants';
import { Transaction } from '../../types';

export const Accounting: React.FC = () => {
  const STORAGE_KEY = 'fabio_pro_accounting_v1';

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Erreur lors du chargement des transactions:", e);
    }
    return [...MOCK_TRANSACTIONS];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const [activeAccount, setActiveAccount] = useState<'JOURNAL' | 'FISCALITE' | 'ARCHIVES'>('JOURNAL');
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeclarationOpen, setIsDeclarationOpen] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState<1 | 2 | 3 | 4>(4);
  const [copied, setCopied] = useState(false);

  const initialFormState = {
    date: new Date().toISOString().split('T')[0],
    label: '',
    customer: '',
    amount: '',
    type: 'IN' as 'IN' | 'OUT',
    category: 'VENTE' as Transaction['category']
  };

  const [formData, setFormData] = useState(initialFormState);

  const currentYearCA = useMemo(() => {
    return transactions
      .filter(t => {
        const parts = t.date.split('/');
        return t.type === 'IN' && t.category === 'VENTE' && parts[2] === selectedYear.toString();
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, selectedYear]);

  const archivedTransactions = useMemo(() => {
    return transactions.filter(t => t.id.startsWith('scan-'));
  }, [transactions]);

  const tvaProgress = (currentYearCA / MICRO_LIMITS.TVA_BASE) * 100;

  const cfeInfo = useMemo(() => {
    if (selectedYear === 2025) {
      return { amount: 0, status: 'EXONÉRÉ', reason: 'Année de création' };
    }
    if (currentYearCA < 5000) {
      return { amount: 0, status: 'EXONÉRÉ', reason: 'CA < 5 000€' };
    }
    let base = 210;
    if (currentYearCA > 10000) base = 450;
    if (currentYearCA > 32600) base = 850;
    return { amount: base, status: 'À PAYER (EST.)', reason: `Basé sur CA ${selectedYear}` };
  }, [currentYearCA, selectedYear]);

  const quarterlySummary = useMemo(() => {
    const qMonths = { 1: ['01', '02', '03'], 2: ['04', '05', '06'], 3: ['07', '08', '09'], 4: ['10', '11', '12'] };
    const targetMonths = qMonths[selectedQuarter];
    const quarterTransactions = transactions.filter(t => {
      const parts = t.date.split('/');
      return targetMonths.includes(parts[1]) && parts[2] === selectedYear.toString();
    });
    const caVentes = quarterTransactions.filter(t => t.type === 'IN' && t.category === 'VENTE').reduce((sum, t) => sum + t.amount, 0);
    const urssafRate = 0.131;
    const impotRate = 0.022;
    return { ca: caVentes, charges: caVentes * urssafRate, impot: caVentes * impotRate, total: caVentes * (urssafRate + impotRate) };
  }, [transactions, selectedQuarter, selectedYear]);

  const handleCopy = () => {
    navigator.clipboard.writeText(quarterlySummary.ca.toFixed(0));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = (t: Transaction) => {
    const dateParts = t.date.split('/');
    let isoDate = new Date().toISOString().split('T')[0];
    if (dateParts.length === 3) isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    setFormData({ date: isoDate, label: t.label, customer: t.customer || '', amount: t.amount.toString(), type: t.type, category: t.category });
    setEditingId(t.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Supprimer cette écriture ?")) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const resetToDefault = () => {
    if (window.confirm("Réinitialiser le journal ?")) setTransactions([...MOCK_TRANSACTIONS]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum)) return;
    const dateParts = formData.date.split('-');
    const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : formData.date;
    if (editingId) {
      setTransactions(prev => prev.map(t => t.id === editingId ? { ...t, date: formattedDate, label: formData.label, customer: formData.customer, amount: amountNum, type: formData.type, category: formData.category } : t));
    } else {
      const newTx: Transaction = { id: `tx-${Date.now()}`, date: formattedDate, label: formData.label, customer: formData.customer, amount: amountNum, type: formData.type, category: formData.category, status: 'PAYÉ' };
      setTransactions(prev => [newTx, ...prev]);
    }
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  return (
    <div className="pb-24 max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8 border-b border-[#3d2b1f] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <Landmark className="w-8 h-8 text-amber-500" />
             <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                Compta <span className="text-amber-500 text-stroke">Studio</span>
             </h1>
          </div>
          <p className="text-[#a89080] font-bold text-xs uppercase tracking-widest flex items-center gap-2">
            <History className="w-3 h-3" /> Activité depuis Décembre 2025
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-[#1a120b] border border-[#3d2b1f] rounded-xl p-1">
             {[2025, 2026].map(y => (
               <button key={y} onClick={() => setSelectedYear(y)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${selectedYear === y ? 'bg-amber-600 text-black shadow-lg' : 'text-[#8c7a6b] hover:text-white'}`}>EXERCICE {y}</button>
             ))}
          </div>
          <div className="flex gap-4 bg-[#1e1510] p-3 rounded-2xl border border-[#3d2b1f] shadow-xl">
            <div className="text-right">
              <span className="text-[10px] text-[#8c7a6b] uppercase font-bold tracking-tighter">CA {selectedYear}</span>
              <p className="text-xl font-black text-emerald-400">{currentYearCA.toFixed(2)}€</p>
            </div>
          </div>
        </div>
      </header>

      <section className="mb-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#1e1510] to-[#120a05] p-6 rounded-3xl border border-amber-600/20 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5"><DollarSign className="w-32 h-32" /></div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" /> Seuil Franchise TVA</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider"><span className="text-emerald-400">{currentYearCA.toFixed(0)}€ déclarés</span><span className="text-[#8c7a6b]">Max {MICRO_LIMITS.TVA_BASE.toLocaleString()}€</span></div>
            <div className="h-3 bg-[#2a1e16] rounded-full overflow-hidden p-0.5 border border-[#3d2b1f]"><div className={`h-full rounded-full transition-all duration-1000 ${tvaProgress > 80 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(tvaProgress, 100)}%` }}></div></div>
            <p className="text-[11px] text-[#a89080]">Année {selectedYear} • Statut : <span className="text-white italic">{currentYearCA < MICRO_LIMITS.TVA_BASE ? 'Franchise Base' : 'TVA Applicable'}</span>.</p>
          </div>
        </div>
        <div className="bg-[#1a120b] p-6 rounded-3xl border border-[#3d2b1f] flex items-center gap-6 relative overflow-hidden">
          <div className="w-16 h-16 bg-blue-900/10 rounded-2xl flex items-center justify-center border border-blue-900/20 shrink-0"><Building2 className="w-8 h-8 text-blue-500" /></div>
          <div className="flex-1"><h4 className="font-bold text-white uppercase text-sm tracking-tighter italic">Cotisation Foncière (CFE)</h4><div className="mt-2 flex items-end gap-3"><span className={`text-3xl font-black ${cfeInfo.amount === 0 ? 'text-emerald-400' : 'text-blue-500'}`}>{cfeInfo.amount}€</span><span className="text-[10px] font-black text-[#8c7a6b] mb-1 uppercase tracking-widest px-2 py-0.5 bg-[#2a1e16] rounded border border-[#3d2b1f]">{cfeInfo.status}</span></div><p className="text-[10px] text-[#a89080] mt-1 font-medium">{cfeInfo.reason}</p></div>
          {selectedYear === 2025 && <div className="absolute top-0 right-0 p-3"><div className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-tighter">-100% (1ère Année)</div></div>}
        </div>
      </section>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex bg-[#1e1510] p-1 rounded-2xl border border-[#3d2b1f] w-full max-w-lg shadow-xl">
          <button onClick={() => setActiveAccount('JOURNAL')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition-all ${activeAccount === 'JOURNAL' ? 'bg-amber-600 text-black shadow-lg' : 'text-[#8c7a6b] hover:text-white'}`}>Journal de CA</button>
          <button onClick={() => setActiveAccount('FISCALITE')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition-all ${activeAccount === 'FISCALITE' ? 'bg-purple-600 text-white shadow-lg' : 'text-[#8c7a6b] hover:text-white'}`}>Fiscalité</button>
          <button onClick={() => setActiveAccount('ARCHIVES')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition-all ${activeAccount === 'ARCHIVES' ? 'bg-emerald-600 text-white shadow-lg' : 'text-[#8c7a6b] hover:text-white'}`}>Archives Num.</button>
        </div>
        <button onClick={resetToDefault} className="flex items-center gap-2 text-[10px] font-black uppercase text-[#5c4a3e] hover:text-amber-500 transition-colors"><RotateCcw className="w-3 h-3" /> Réinitialiser</button>
      </div>

      {activeAccount === 'JOURNAL' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          {isFormOpen && (
            <div className="bg-[#1e1510] border border-amber-500/30 p-6 rounded-3xl shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-white flex items-center gap-2 uppercase italic tracking-tighter">{editingId ? <Pencil className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-amber-500" />}{editingId ? 'Modifier l\'écriture' : 'Saisie manuelle'}</h3><button type="button" onClick={() => setIsFormOpen(false)} className="text-[#8c7a6b] hover:text-white"><X className="w-6 h-6" /></button></div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><label className="block text-[10px] font-black text-[#8c7a6b] uppercase mb-1">Date</label><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white outline-none" required /></div>
                <div><label className="block text-[10px] font-black text-[#8c7a6b] uppercase mb-1">Client</label><input type="text" value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white outline-none" /></div>
                <div><label className="block text-[10px] font-black text-[#8c7a6b] uppercase mb-1">Libellé</label><input type="text" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white outline-none" required /></div>
                <div><label className="block text-[10px] font-black text-[#8c7a6b] uppercase mb-1">Montant</label><input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white outline-none" required /></div>
                <div><label className="block text-[10px] font-black text-[#8c7a6b] uppercase mb-1">Flux</label><select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white outline-none"><option value="IN">Encaissement</option><option value="OUT">Dépense</option></select></div>
                <div><label className="block text-[10px] font-black text-[#8c7a6b] uppercase mb-1">Catégorie</label><select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white outline-none"><option value="VENTE">Vente de Beat</option><option value="SACEM">SACEM</option><option value="AIDE">Aide</option><option value="MATERIEL">Matériel</option><option value="SERVICE">Service</option></select></div>
                <div className="md:col-span-3"><button type="submit" className="w-full bg-amber-600 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2">Enregistrer</button></div>
              </form>
            </div>
          )}
          <div className="bg-[#1e1510] rounded-3xl border border-[#3d2b1f] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#3d2b1f] flex items-center justify-between bg-[#120a05]"><h3 className="font-bold text-white flex items-center gap-2 uppercase tracking-tighter italic"><ClipboardList className="w-5 h-5 text-amber-500" /> Journal - Exercice {selectedYear}</h3><button onClick={() => setIsFormOpen(true)} className="bg-amber-600 text-black px-6 py-2 rounded-full text-[10px] font-black">Saisir Manuellement</button></div>
            <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-[#1a120b] text-[10px] uppercase font-black text-[#8c7a6b] border-b border-[#3d2b1f]"><tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Client</th><th className="px-6 py-4">Libellé</th><th className="px-6 py-4 text-right">Montant</th><th className="px-6 py-4 text-center">Actions</th></tr></thead><tbody className="divide-y divide-[#3d2b1f]">{transactions.filter(t => t.date.split('/')[2] === selectedYear.toString()).map((t) => (
              <tr key={t.id} className="hover:bg-[#2a1e16] transition-colors"><td className="px-6 py-4 text-xs font-mono text-[#a89080]">{t.date}</td><td className="px-6 py-4"><span className="text-xs font-bold text-white uppercase">{t.customer || '-'}</span></td><td className="px-6 py-4">
                <div className="flex items-center gap-2"><p className="text-xs text-[#d1d5db] font-medium">{t.label}</p>{t.id.startsWith('scan-') && <span className="bg-emerald-900/40 text-emerald-400 text-[8px] font-black px-1 rounded border border-emerald-900/50">SCAN</span>}</div>
                <span className="text-[9px] text-amber-600 uppercase font-black">{t.category}</span>
              </td><td className={`px-6 py-4 text-right font-black ${t.type === 'IN' ? 'text-emerald-400' : 'text-red-400'}`}>{t.type === 'IN' ? '+' : '-'}{t.amount.toFixed(2)}€</td><td className="px-6 py-4 flex justify-center gap-2"><button onClick={() => handleEdit(t)} className="p-2 text-amber-500"><Pencil className="w-4 h-4" /></button><button onClick={() => handleDelete(t.id)} className="p-2 text-red-500"><Trash2 className="w-4 h-4" /></button></td></tr>
            ))}</tbody></table></div>
          </div>
        </div>
      ) : activeAccount === 'ARCHIVES' ? (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6">
           <div className="bg-gradient-to-r from-emerald-900/20 to-transparent p-8 rounded-[2.5rem] border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"><FileDigit className="w-8 h-8 text-white" /></div>
                 <div><h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Archives Numériques</h3><p className="text-[#a89080] text-sm">Toutes les factures numérisées avec le Scanner IA.</p></div>
              </div>
              <div className="text-right">
                 <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest block mb-1">Total Archivé</span>
                 <p className="text-3xl font-black text-white">{archivedTransactions.length} <span className="text-sm">pièces</span></p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {archivedTransactions.map(t => (
                <div key={t.id} className="bg-[#1e1510] border border-[#3d2b1f] p-6 rounded-3xl hover:border-emerald-600/30 transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><ReceiptText className="w-16 h-16" /></div>
                   <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-mono text-[#8c7a6b]">{t.date}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${t.type === 'IN' ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/30' : 'bg-red-950/30 text-red-400 border border-red-900/30'}`}>
                         {t.type === 'IN' ? 'REVENU' : 'DÉPENSE'}
                      </span>
                   </div>
                   <h4 className="text-white font-black uppercase tracking-tighter text-lg mb-1 truncate">{t.customer || 'Client inconnu'}</h4>
                   <p className="text-xs text-[#a89080] italic mb-4 truncate">{t.label}</p>
                   <div className="flex items-end justify-between pt-4 border-t border-[#3d2b1f]">
                      <div>
                        <span className="text-[9px] text-[#5c4a3e] font-black uppercase tracking-widest block">Montant Archivé :</span>
                        <span className="text-2xl font-black text-emerald-400">{t.amount.toFixed(2)}€</span>
                      </div>
                      <button onClick={() => handleEdit(t)} className="text-[9px] font-black text-white bg-[#2a1e16] px-3 py-1.5 rounded-lg border border-[#3d2b1f] hover:bg-emerald-600 transition-all uppercase">Ouvrir</button>
                   </div>
                </div>
              ))}
              {archivedTransactions.length === 0 && (
                <div className="col-span-full py-20 text-center bg-[#1e1510] rounded-[2rem] border border-dashed border-[#3d2b1f] opacity-30">
                   <FileDigit className="w-16 h-16 mx-auto mb-4 opacity-20" />
                   <p className="italic">Aucune facture n'a encore été numérisée.</p>
                </div>
              )}
           </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-8">
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-8 rounded-[2.5rem] border border-purple-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6"><div className="w-16 h-16 bg-white text-purple-700 rounded-2xl flex items-center justify-center shadow-xl"><FileCheck className="w-8 h-8" /></div><div><h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Assistant Déclaration <span className="text-purple-400">URSSAF</span></h3><p className="text-[#a89080] text-sm">Récapitulatif pour ton trimestre T{selectedQuarter} {selectedYear}.</p></div></div>
                <button onClick={() => setIsDeclarationOpen(true)} className="bg-white hover:bg-purple-500 hover:text-white text-black font-black px-8 py-4 rounded-xl transition-all shadow-xl flex items-center gap-3 uppercase text-xs tracking-widest">Ouvrir Récapitulatif <ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="bg-[#1e1510] p-8 rounded-3xl border border-[#3d2b1f] shadow-lg relative overflow-hidden group"><div className="absolute top-0 right-0 p-8 opacity-5"><CalendarDays className="w-24 h-24 text-purple-400" /></div><h4 className="text-purple-400 font-black uppercase text-[10px] mb-6 tracking-widest">Charges Sociales BNC</h4><div className="space-y-6 relative z-10"><div className="flex justify-between items-center border-b border-[#3d2b1f] pb-4"><span className="text-sm text-[#a89080]">Taux Fabio (ACRE) :</span><span className="px-3 py-1 bg-purple-900/30 text-purple-400 rounded-full text-[10px] font-black border border-purple-900/50">13,10%</span></div><div className="p-6 bg-[#120a05] rounded-2xl border border-[#3d2b1f] shadow-inner"><span className="text-[10px] text-[#8c7a6b] block mb-1 uppercase font-bold tracking-wider">Provision {selectedYear} :</span><span className="text-4xl font-black text-white">{(currentYearCA * 0.131).toFixed(2)}€</span></div></div></div><div className="bg-[#1e1510] p-8 rounded-3xl border border-[#3d2b1f] shadow-lg relative overflow-hidden group"><div className="absolute top-0 right-0 p-8 opacity-5"><Building2 className="w-24 h-24 text-blue-400" /></div><h4 className="text-blue-400 font-black uppercase text-[10px] mb-6 tracking-widest">Calculateur CFE Estimé</h4><div className="space-y-6 relative z-10"><div className="flex justify-between items-center border-b border-[#3d2b1f] pb-4"><span className="text-sm text-[#a89080]">Avis d'imposition :</span><span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-[10px] font-black border border-blue-900/50">Mi-Novembre</span></div><div className={`p-6 bg-[#120a05] rounded-2xl border ${cfeInfo.amount === 0 ? 'border-emerald-900/20' : 'border-blue-900/20'} shadow-inner`}><span className="text-[10px] text-[#8c7a6b] block mb-1 uppercase font-bold tracking-wider">Montant Annuel {selectedYear} :</span><span className={`text-4xl font-black ${cfeInfo.amount === 0 ? 'text-emerald-400' : 'text-white'}`}>{cfeInfo.amount}€</span></div><p className="text-[10px] text-[#8c7a6b] italic">*Basé sur les barèmes nationaux moyens.</p></div></div></div>
        </div>
      )}

      {isDeclarationOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setIsDeclarationOpen(false)} /><div className="relative w-full max-w-2xl bg-[#1a120b] border border-[#3d2b1f] rounded-[2.5rem] p-8 md:p-12 animate-in zoom-in-95"><button onClick={() => setIsDeclarationOpen(false)} className="absolute top-8 right-8 text-[#5c4a3e] hover:text-white"><X className="w-6 h-6" /></button><div className="flex items-center gap-4 mb-8"><div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg"><FileCheck className="w-6 h-6 text-white" /></div><div><h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Récapitulatif <span className="text-purple-500">T{selectedQuarter} {selectedYear}</span></h2><p className="text-xs text-[#8c7a6b] font-bold uppercase tracking-widest">Données URSSAF</p></div></div><div className="grid grid-cols-4 gap-2 mb-10">{[1, 2, 3, 4].map(q => (<button key={q} disabled={selectedYear === 2025 && q < 4} onClick={() => setSelectedQuarter(q as any)} className={`py-3 rounded-xl text-[10px] font-black transition-all border ${selectedQuarter === q ? 'bg-purple-600 border-purple-400 text-white' : 'bg-[#120a05] border-[#3d2b1f] text-[#8c7a6b]'}`}>T{q}</button>))}</div><div className="space-y-4 mb-10"><div className="bg-[#120a05] p-6 rounded-2xl border border-[#3d2b1f] flex items-center justify-between shadow-inner"><div><span className="text-[10px] text-[#8c7a6b] font-black uppercase block italic">CA à déclarer :</span><span className="text-4xl font-black text-white tracking-tighter">{quarterlySummary.ca.toFixed(0)}€</span></div><button onClick={handleCopy} className="bg-[#2a1e16] text-amber-500 px-5 py-2.5 rounded-xl border border-amber-900/30 text-[10px] font-black">{copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}{copied ? 'COPIÉ' : 'COPIER'}</button></div><div className="grid grid-cols-2 gap-4"><div className="bg-[#120a05] p-5 rounded-2xl border border-purple-900/20"><span className="text-[9px] text-purple-400 font-black uppercase mb-1 block">Charges (13.1%) :</span><span className="text-xl font-black text-white">{quarterlySummary.charges.toFixed(2)}€</span></div><div className="bg-[#120a05] p-5 rounded-2xl border border-blue-900/20"><span className="text-[9px] text-blue-400 font-black uppercase mb-1 block">Impôt (2.2%) :</span><span className="text-xl font-black text-white">{quarterlySummary.impot.toFixed(2)}€</span></div></div></div><a href="https://www.autoentrepreneur.urssaf.fr/" target="_blank" rel="noopener noreferrer" className="mt-8 w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-4 uppercase text-xs">Accéder au portail URSSAF <ChevronRight className="w-4 h-4" /></a></div></div>
      )}
    </div>
  );
};
