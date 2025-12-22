import React from 'react';
import { MASTERCLASSES } from '../constants';
import { CheckCircle2, PlayCircle } from 'lucide-react';

export const MasterclassStore: React.FC = () => {
  return (
    <div className="pb-20 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-[#fff8f0]">L'Académie <span className="text-amber-500">Fabio DMS</span></h1>
        <p className="text-xl text-[#a89080] max-w-2xl mx-auto">
            Passez de beatmaker amateur à producteur pro. J'analyse mes sessions avec Tayc et Dadju pour vous montrer mes techniques.
        </p>
      </div>

      <div className="grid gap-8">
        {MASTERCLASSES.map(mc => (
            <div key={mc.id} className="flex flex-col md:flex-row bg-[#1e1510] rounded-2xl overflow-hidden border border-[#3d2b1f] group hover:border-amber-700/30 transition-all">
                <div className="md:w-2/5 relative">
                    <img src={mc.thumbnailUrl} alt={mc.title} className="w-full h-full object-cover min-h-[200px] sepia-[.2]" />
                    <div className="absolute inset-0 bg-[#1a120b]/20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircle className="w-16 h-16 text-[#fff8f0] opacity-80 group-hover:scale-110 transition-transform" />
                    </div>
                </div>
                <div className="p-6 md:w-3/5 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <h2 className="text-2xl font-bold mb-2 text-[#fff8f0]">{mc.title}</h2>
                            <span className="bg-amber-900/30 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-800">{mc.level}</span>
                        </div>
                        <p className="text-[#a89080] mb-6">{mc.description}</p>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center gap-2 text-sm text-[#8c7a6b]">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Accès illimité aux vidéos
                            </li>
                            <li className="flex items-center gap-2 text-sm text-[#8c7a6b]">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Fichiers sources inclus (Stems)
                            </li>
                             <li className="flex items-center gap-2 text-sm text-[#8c7a6b]">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                Certification de fin de parcours
                            </li>
                        </ul>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-[#3d2b1f]">
                         <div>
                            <span className="block text-xs text-[#5c4a3e]">Prix total</span>
                            <span className="text-2xl font-bold text-[#fff8f0]">{mc.price}€</span>
                         </div>
                         <button className="bg-[#d4a373] text-[#1a120b] font-bold py-2 px-6 rounded-full hover:bg-[#e6b98e] transition-colors shadow-lg">
                            Rejoindre
                         </button>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};