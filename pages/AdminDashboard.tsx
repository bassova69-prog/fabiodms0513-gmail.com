
import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, Scale, FileText, Lock, Calendar, PieChart, UploadCloud } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="pb-20 max-w-6xl mx-auto animate-in fade-in">
      <header className="mb-12 border-b border-[#3d2b1f] pb-6">
        <div className="flex items-center gap-3 mb-2">
            <Lock className="w-8 h-8 text-amber-600" />
            <h1 className="text-4xl font-bold text-[#fff8f0]">Hub Administration</h1>
        </div>
        <p className="text-[#a89080]">Bienvenue Fabio. Sélectionnez un outil de gestion.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Upload Beat Card */}
        <Link to="/admin/upload" className="bg-[#1e1510] border border-amber-600/50 rounded-2xl p-8 hover:bg-[#2a1e16] hover:scale-[1.02] transition-all group relative overflow-hidden shadow-lg shadow-amber-900/10">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-24 h-24 text-amber-500" />
            </div>
            <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center mb-6 shadow-lg shadow-amber-600/30">
                    <UploadCloud className="w-6 h-6 text-[#1a120b]" />
                </div>
                <h3 className="text-2xl font-bold text-[#fff8f0] mb-2">Upload Beat</h3>
                <p className="text-[#a89080]">Ajouter une production au catalogue (MP3/WAV/Stems).</p>
            </div>
        </Link>

        {/* Planning Card */}
        <Link to="/admin/planning" className="bg-[#1e1510] border border-[#3d2b1f] rounded-2xl p-8 hover:border-amber-600 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <Calendar className="w-24 h-24 text-emerald-500" />
            </div>
            <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-emerald-900/20 flex items-center justify-center mb-6">
                    <Calendar className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-[#fff8f0] mb-2">Planning</h3>
                <p className="text-[#a89080]">Sessions studio, deadlines rendus, tâches admin.</p>
            </div>
        </Link>

        {/* Business Plan Card */}
        <Link to="/admin/business" className="bg-[#1e1510] border border-[#3d2b1f] rounded-2xl p-8 hover:border-amber-600 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-24 h-24 text-amber-500" />
            </div>
            <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-amber-900/20 flex items-center justify-center mb-6">
                    <TrendingUp className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold text-[#fff8f0] mb-2">Business Plan</h3>
                <p className="text-[#a89080]">Projections financières et rentabilité.</p>
            </div>
        </Link>

        {/* Accounting Card */}
        <Link to="/admin/accounting" className="bg-[#1e1510] border border-[#3d2b1f] rounded-2xl p-8 hover:border-amber-600 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <DollarSign className="w-24 h-24 text-amber-500" />
            </div>
            <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-amber-900/20 flex items-center justify-center mb-6">
                    <DollarSign className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold text-[#fff8f0] mb-2">Comptabilité</h3>
                <p className="text-[#a89080]">Suivi mensuel des entrées/sorties.</p>
            </div>
        </Link>

        {/* Diagnostic Statut Card */}
        <Link to="/admin/legal" className="bg-[#1e1510] border border-[#3d2b1f] rounded-2xl p-8 hover:border-amber-600 transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <Scale className="w-24 h-24 text-blue-500" />
            </div>
            <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-blue-900/20 flex items-center justify-center mb-6">
                    <Scale className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-[#fff8f0] mb-2">Conseiller Juridique</h3>
                <p className="text-[#a89080]">Comparatif Auto vs Société.</p>
            </div>
        </Link>

        {/* Contract AI Card */}
        <Link to="/admin/contracts" className="bg-[#1e1510] border border-[#3d2b1f] rounded-2xl p-8 hover:border-amber-600 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <FileText className="w-24 h-24 text-purple-500" />
            </div>
            <div className="relative z-10">
                 <div className="w-12 h-12 rounded-full bg-purple-900/20 flex items-center justify-center mb-6">
                    <FileText className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-[#fff8f0] mb-2">Assistant Contrats</h3>
                <p className="text-[#a89080]">Analysez vos contrats avec l'IA.</p>
            </div>
        </Link>

         {/* Tax Optimization Card */}
         <Link to="/admin/tax" className="bg-[#1e1510] border border-[#3d2b1f] rounded-2xl p-8 hover:border-amber-600 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <PieChart className="w-24 h-24 text-cyan-500" />
            </div>
            <div className="relative z-10">
                 <div className="w-12 h-12 rounded-full bg-cyan-900/20 flex items-center justify-center mb-6">
                    <PieChart className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-[#fff8f0] mb-2">Optimisation Fiscale</h3>
                <p className="text-[#a89080]">TVA, ACRE et déductions.</p>
            </div>
        </Link>
      </div>
    </div>
  );
};
