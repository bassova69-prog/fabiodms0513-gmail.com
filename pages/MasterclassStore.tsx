
import React from 'react';
import { GraduationCap, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MasterclassStore: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in-95 duration-500">
      
      <div className="relative mb-8">
         <div className="absolute inset-0 bg-amber-500 blur-[60px] opacity-20 rounded-full animate-pulse"></div>
         <div className="w-32 h-32 bg-[#1a120b] rounded-full flex items-center justify-center border-2 border-[#3d2b1f] relative z-10 shadow-2xl">
            <GraduationCap className="w-16 h-16 text-amber-500" />
         </div>
         <div className="absolute -bottom-2 -right-2 bg-[#1a120b] p-2 rounded-full border border-[#3d2b1f] z-20">
            <Clock className="w-6 h-6 text-[#8c7a6b]" />
         </div>
      </div>

      <h1 className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-6 drop-shadow-2xl">
        Académie <span className="text-amber-500 text-stroke">Fabio DMS</span>
      </h1>

      <div className="bg-[#1a120b] border border-[#3d2b1f] p-10 rounded-[2rem] max-w-2xl w-full relative overflow-hidden group hover:border-amber-900/50 transition-colors">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
        
        <h2 className="text-3xl font-black text-white mb-6 uppercase flex items-center justify-center gap-3">
            <AlertCircle className="w-8 h-8 text-amber-500" />
            Arrive Bientôt
        </h2>
        
        <p className="text-[#a89080] text-lg font-medium leading-relaxed mb-8">
            Je travaille actuellement sur une série de masterclasses exclusives.<br/>
            Vous apprendrez bientôt mes techniques de composition, d'arrangement et de mixage pour atteindre un niveau professionnel.
        </p>

        <div className="inline-flex flex-col gap-2 w-full max-w-xs">
             <button 
                disabled
                className="w-full bg-[#2a1e16] text-[#5c4a3e] font-black py-4 rounded-xl uppercase text-xs tracking-[0.2em] border border-[#3d2b1f] cursor-not-allowed"
             >
                Ouverture Prochaine
             </button>
             <button 
                onClick={() => navigate('/')}
                className="text-[#8c7a6b] text-xs font-bold hover:text-white transition-colors mt-4 uppercase tracking-wider"
             >
                Retour à l'accueil
             </button>
        </div>
      </div>

    </div>
  );
};
