
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Landmark, 
  DollarSign, 
  Plus, 
  Save, 
  X, 
  Pencil, 
  Trash2, 
  User, 
  AlertCircle, 
  Sparkles, 
  ClipboardList,
  RotateCcw
} from 'lucide-react';
import { MOCK_TRANSACTIONS, MICRO_LIMITS } from '../../constants';
import { Transaction } from '../../types';

export const Accounting: React.FC = () => {
  // Clé de stockage unique
  const STORAGE_KEY = 'fabio_pro_accounting_v1';

  // Chargement des données : Priorité au localStorage, sinon MOCKs
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
    return [...MOCK_TRANSACTIONS]; // On clone pour éviter les mutations
  });

  // Synchronisation avec le localStorage à chaque changement de l'état
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const [activeAccount, setActiveAccount] = useState<'JOURNAL' | 'FISCALITE'>('JOURNAL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState = {
    date: new Date().toISOString().split('T')[0],
    label: '',
    customer: '',
    amount: '',
    type: 'IN' as 'IN' | 'OUT',
    category: 'VENTE' as Transaction['category']
  };

  const [formData, setFormData] = useState(initialFormState);

  // Chiffre d'Affaires Encaissé (Somme des revenus de catégorie VENTE)
  const currentYearCA = useMemo(() => {
    return transactions
      .filter(t => t.type === 'IN' && t.category === 'VENTE')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const tvaProgress = (currentYearCA / MICRO_LIMITS.TVA_BASE) * 100;

  // --- ACTIONS ---

  // MODIFICATION
  const handleEdit = (t: Transaction) => {
    const dateParts = t.date.split('/');
    let isoDate = new Date().toISOString().split('T')[0];
    if (dateParts.length === 3) {
      isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    }

    setFormData({
      date: isoDate,
      label: t.label,
      customer: t.customer || '',
      amount: t.amount.toString(),
      type: t.type,
      category: t.category
    });
    setEditingId(t.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SUPPRESSION (Correction forcée)
  const handleDelete = (id: string) => {
    // On retire immédiatement la ligne de l'état local
    const filteredTransactions = transactions.filter(t => t.id !== id);
    setTransactions(filteredTransactions);
    
    // On force la mise à jour du localStorage immédiatement
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTransactions));

    // Si on était en train de modifier cette ligne, on ferme le formulaire
    if (editingId === id) {
      cancelForm();
    }
  };

  // REINITIALISATION
  const resetToDefault = () => {
    if (window.confirm("Voulez-vous réinitialiser le journal ? Toutes vos modifications seront perdues.")) {
      setTransactions([...MOCK_TRANSACTIONS]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_TRANSACTIONS));
    }
  };

  // VALIDATION FORMULAIRE (Ajout ou Edition)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum)) return;

    const dateParts = formData.date.split('-');
    const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : formData.date;

    if (editingId) {
      // Mode Edition
      setTransactions(prev => prev.map(t => t.id === editingId ? {
        ...t,
        date: formattedDate,
        label: formData.label,
        customer: formData.customer,
        amount: amountNum,
        type: formData.type,
        category: formData.category
      } : t));
    } else {
      // Mode Ajout
      const newTx: Transaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        date: formattedDate,
        label: formData.label,
        customer: formData.customer,
        amount: amountNum,
        type: formData.type,
        category: formData.category,
        status: 'PAYÉ'
      };
      setTransactions(prev => [newTx, ...prev]);
    }

    setIsFormOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const cancelForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  return (
    <div className="pb-24 max-w-6xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8 border-b border-[#3d2b1f] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Landmark className="w-8 h-8 text-amber-500" />
            Journal Comptable Fabio
          </h1>
          <p className="text-[#a89080] mt-1 italic">Gestion rigoureuse de la Micro-Entreprise.</p>
        </div>
        <div className="flex gap-4 bg-[#1e1510] p-3 rounded-2xl border border-[#3d2b1f]">
          <div className="text-right">
            <span className="text-[10px] text-[#8c7a6b] uppercase font-bold tracking-tighter">CA 2025</span>
            <p className="text-xl font-black text-emerald-400">{currentYearCA.toFixed(2)}€</p>
          </div>
          <div className="w-px bg-[#3d2b1f]"></div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-[#8c7a6b] uppercase font-bold tracking-tighter">Seuil TVA</span>
            <p className="text-sm font-bold text-white">{MICRO_LIMITS.TVA_BASE.toLocaleString()}€</p>
          </div>
        </div>
      </header>

      {/* MONITORING TVA */}
      <section className="mb-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#1e1510] to-[#120a05] p-6 rounded-3xl border border-amber-600/20 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <DollarSign className="w-32 h-32" />
          </div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Status Franchise TVA
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
              <span className="text-emerald-400">{currentYearCA.toFixed(0)}€ déclarés</span>
              <span className="text-[#8c7a6b]">Seuil {MICRO_LIMITS.TVA_BASE.toLocaleString()}€</span>
            </div>
            <div className="h-3 bg-[#2a1e16] rounded-full overflow-hidden p-0.5 border border-[#3d2b1f]">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${tvaProgress > 80 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(tvaProgress, 100)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-[#a89080]">
              Mention obligatoire : <span className="text-white italic">"TVA non applicable, art. 293 B du CGI"</span>.
            </p>
          </div>
        </div>

        <div className="bg-[#1a120b] p-6 rounded-3xl border border-[#3d2b1f] flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-900/20 rounded-2xl border border-blue-900/20">
              <AlertCircle className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h4 className="font-bold text-white">Zone de Tolérance</h4>
              <p className="text-xs text-[#8c7a6b] mt-1">Limite avant bascule obligatoire : {MICRO_LIMITS.TVA_MAX.toLocaleString()}€.</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#3d2b1f]">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#a89080]">Marge restante :</span>
              <span className="text-lg font-black text-white">{(MICRO_LIMITS.TVA_MAX - currentYearCA).toFixed(0)}€</span>
            </div>
          </div>
        </div>
      </section>

      {/* TABS & TOOLS */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex bg-[#1e1510] p-1 rounded-2xl border border-[#3d2b1f] w-full max-w-sm shadow-xl">
          <button
            onClick={() => setActiveAccount('JOURNAL')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${activeAccount === 'JOURNAL' ? 'bg-amber-600 text-black shadow-lg shadow-amber-900/20' : 'text-[#8c7a6b] hover:text-white'}`}
          >
            Journal de CA
          </button>
          <button
            onClick={() => setActiveAccount('FISCALITE')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${activeAccount === 'FISCALITE' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-[#8c7a6b] hover:text-white'}`}
          >
            Fiscalité
          </button>
        </div>
        
        <button 
          onClick={resetToDefault}
          className="flex items-center gap-2 text-[10px] font-black uppercase text-[#5c4a3e] hover:text-amber-500 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Réinitialiser
        </button>
      </div>

      {activeAccount === 'JOURNAL' ? (
        <div className="space-y-6">
          {/* FORMULAIRE D'EDITION / AJOUT */}
          {isFormOpen && (
            <div className="bg-[#1e1510] border border-amber-500/30 p-6 rounded-3xl shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {editingId ? <Pencil className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-amber-500" />}
                  {editingId ? 'Modifier la ligne' : 'Nouvel encaissement'}
                </h3>
                <button type="button" onClick={cancelForm} className="text-[#8c7a6b] hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1">Date</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 transition-colors shadow-inner" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1">Client / Tiers</label>
                  <input type="text" value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} placeholder="Ex: Dadju Records" className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 transition-colors shadow-inner" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1">Libellé</label>
                  <input type="text" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} placeholder="Ex: Licence Exclusive 'Amour'" className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 transition-colors shadow-inner" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1">Montant Encaissé (€)</label>
                  <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 transition-colors shadow-inner" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1">Type de flux</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as 'IN' | 'OUT'})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 transition-colors shadow-inner">
                    <option value="IN">Encaissement (+)</option>
                    <option value="OUT">Dépense (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8c7a6b] uppercase mb-1">Catégorie</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 transition-colors shadow-inner">
                    <option value="VENTE">Vente de Beat / Masterclass</option>
                    <option value="SACEM">Droits SACEM</option>
                    <option value="AIDE">Aide / France Travail</option>
                    <option value="MATERIEL">Achat Matériel Studio</option>
                    <option value="SERVICE">Abonnements Logiciels</option>
                    <option value="CHARGE_FIXE">Loyer / Charges Fixes</option>
                  </select>
                </div>
                <div className="md:col-span-3 flex gap-3">
                  <button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-900/20">
                    <Save className="w-5 h-5" />
                    {editingId ? 'Valider les modifications' : 'Enregistrer l\'écriture'}
                  </button>
                  <button type="button" onClick={cancelForm} className="px-6 bg-[#2a1e16] hover:bg-[#3d2b1f] text-white font-bold py-4 rounded-xl transition-all border border-[#3d2b1f]">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TABLEAU DES ECRITURES */}
          <div className="bg-[#1e1510] rounded-3xl border border-[#3d2b1f] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#3d2b1f] flex items-center justify-between bg-[#120a05]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-500" />
                Journal des encaissements
              </h3>
              {!isFormOpen && (
                <button onClick={() => setIsFormOpen(true)} className="bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 px-4 py-2 rounded-full text-[10px] font-black border border-amber-600/30 transition-all uppercase tracking-widest">
                  + AJOUTER UNE LIGNE
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#1a120b] text-[10px] uppercase font-black text-[#8c7a6b] tracking-widest border-b border-[#3d2b1f]">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Tiers</th>
                    <th className="px-6 py-4">Libellé</th>
                    <th className="px-6 py-4 text-right">Montant</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3d2b1f]">
                  {transactions.length > 0 ? (
                    transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-[#2a1e16] transition-colors group">
                        <td className="px-6 py-4 text-xs font-mono text-[#a89080]">{t.date}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-amber-900/20 flex items-center justify-center border border-amber-900/10">
                              <User className="w-3 h-3 text-amber-500" />
                            </div>
                            <span className="text-xs font-bold text-white truncate max-w-[150px]">{t.customer || '-'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-[#d1d5db] font-medium line-clamp-1">{t.label}</p>
                          <span className="text-[9px] text-amber-600 uppercase font-black tracking-tighter">{t.category}</span>
                        </td>
                        <td className={`px-6 py-4 text-right font-black ${t.type === 'IN' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {t.type === 'IN' ? '+' : '-'}{t.amount.toFixed(2)}€
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              type="button"
                              onClick={() => handleEdit(t)} 
                              className="p-2 bg-amber-900/10 text-amber-500 rounded-lg border border-amber-900/20 hover:bg-amber-500 hover:text-black transition-all"
                              title="Modifier"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDelete(t.id)} 
                              className="p-2 bg-red-900/10 text-red-500 rounded-lg border border-red-900/20 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                              title="Supprimer la ligne"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-24 text-center text-[#8c7a6b] italic">
                        Le journal est vide. Vos écritures s'afficheront ici.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-bottom-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#1e1510] p-8 rounded-3xl border border-[#3d2b1f] shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                  <Landmark className="w-32 h-32 text-purple-500" />
              </div>
              <h4 className="text-purple-400 font-black uppercase text-[10px] mb-6 tracking-widest">Charges Sociales URSSAF</h4>
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center border-b border-[#3d2b1f] pb-4">
                  <span className="text-sm text-[#a89080]">Taux avec ACRE (Régime BNC) :</span>
                  <span className="px-3 py-1 bg-purple-900/30 text-purple-400 rounded-full text-[10px] font-black border border-purple-900/50">13,10%</span>
                </div>
                <div className="p-6 bg-[#120a05] rounded-2xl border border-[#3d2b1f]">
                  <span className="text-[10px] text-[#8c7a6b] block mb-1 uppercase font-bold tracking-wider">Provision Cotisations :</span>
                  <span className="text-4xl font-black text-white">{(currentYearCA * 0.131).toFixed(2)}€</span>
                </div>
                <p className="text-[10px] text-[#5c4a3e] italic leading-relaxed">
                  *Simulation basée sur le CA encaissé de l'année. À déclarer périodiquement sur autoentrepreneur.urssaf.fr.
                </p>
              </div>
            </div>

            <div className="bg-[#1e1510] p-8 rounded-3xl border border-[#3d2b1f] shadow-lg relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-32 h-32 text-blue-500" />
              </div>
              <h4 className="text-blue-400 font-black uppercase text-[10px] mb-6 tracking-widest">Impôt sur le Revenu (VL)</h4>
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center border-b border-[#3d2b1f] pb-4">
                  <span className="text-sm text-[#a89080]">Versement Libératoire :</span>
                  <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-[10px] font-black border border-blue-900/50">2,20% DU CA</span>
                </div>
                <div className="p-6 bg-[#120a05] rounded-2xl border border-[#3d2b1f]">
                  <span className="text-[10px] text-[#8c7a6b] block mb-1 uppercase font-bold tracking-wider">Montant de l'impôt :</span>
                  <span className="text-4xl font-black text-white">{(currentYearCA * 0.022).toFixed(2)}€</span>
                </div>
                <p className="text-[10px] text-[#5c4a3e] italic leading-relaxed">
                  *Le versement libératoire permet de régler l'impôt en même temps que vos charges sociales.
                </p>
              </div>
            </div>
        </div>
      )}
    </div>
  );
};
