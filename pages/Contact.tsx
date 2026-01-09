
import React, { useState } from 'react';
import { Mail, Instagram, Send, User, AtSign, MessageSquare, Loader2, CheckCircle2, ArrowRight, Copy, Check, AlertCircle } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    instagram: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  // Feedback visuel pour la copie
  const [copyStatus, setCopyStatus] = useState<{[key: string]: boolean}>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getEmailData = () => {
      const subject = `Contact Site Web: ${formData.firstName} ${formData.lastName}`;
      const body = `
Nom: ${formData.lastName}
Prénom: ${formData.firstName}
Email: ${formData.email}
Instagram: ${formData.instagram || 'Non renseigné'}

----------------------------------------
MESSAGE :
${formData.message}
----------------------------------------
`;
      return { to: 'fabiodmsbeats@gmail.com', subject, body };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const { to, subject, body } = getEmailData();
      const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Tentative d'ouverture du client mail
      window.location.href = mailtoLink;
      
      setIsSubmitting(false);
      setIsSent(true);
      // Pas de reset automatique pour laisser le temps de copier si besoin
    }, 1500);
  };

  const handleCopy = (text: string, key: string) => {
      navigator.clipboard.writeText(text);
      setCopyStatus(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
          setCopyStatus(prev => ({ ...prev, [key]: false }));
      }, 2000);
  };

  const { to, subject, body } = getEmailData();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-500 pb-20">
      
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-4">
          Collab & <span className="text-amber-500 text-stroke">Contact</span>
        </h1>
        <p className="text-[#a89080] text-lg max-w-2xl mx-auto">
          Un projet ? Une question sur une instru ? Remplis le formulaire ci-dessous.
        </p>
      </div>

      <div className="w-full max-w-2xl bg-[#1a120b] border border-[#3d2b1f] rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none"></div>

        {isSent ? (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in-95 relative z-10">
             <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
             </div>
             <h2 className="text-3xl font-black text-white uppercase italic mb-2">Message Prêt !</h2>
             <p className="text-[#a89080] max-w-md mb-8">
               Ton client mail s'est ouvert. Vérifie et clique sur "Envoyer" pour que <strong>Fabio</strong> reçoive ta demande.
             </p>

             <div className="w-full bg-[#120a05]/50 border border-[#3d2b1f] rounded-xl p-6 text-left mb-8">
                <div className="flex items-center gap-2 mb-4 text-amber-500">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Ça ne s'est pas ouvert ?</span>
                </div>
                <p className="text-[10px] text-[#5c4a3e] mb-4">
                    Copie les éléments ci-dessous et envoie-les manuellement depuis ta boîte mail.
                </p>

                <div className="space-y-3">
                    {/* Destinataire */}
                    <div className="bg-[#0f0f0f] border border-[#2a1e16] rounded-lg p-3 flex items-center justify-between group">
                        <div className="overflow-hidden">
                            <p className="text-[8px] text-[#5c4a3e] uppercase font-bold">Destinataire</p>
                            <p className="text-sm text-white font-medium truncate">{to}</p>
                        </div>
                        <button 
                            onClick={() => handleCopy(to, 'to')}
                            className="p-2 hover:bg-[#2a1e16] rounded-lg text-[#8c7a6b] hover:text-white transition-colors"
                            title="Copier l'email"
                        >
                            {copyStatus['to'] ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Objet */}
                    <div className="bg-[#0f0f0f] border border-[#2a1e16] rounded-lg p-3 flex items-center justify-between group">
                        <div className="overflow-hidden">
                            <p className="text-[8px] text-[#5c4a3e] uppercase font-bold">Objet</p>
                            <p className="text-sm text-white font-medium truncate">{subject}</p>
                        </div>
                        <button 
                            onClick={() => handleCopy(subject, 'subject')}
                            className="p-2 hover:bg-[#2a1e16] rounded-lg text-[#8c7a6b] hover:text-white transition-colors"
                            title="Copier l'objet"
                        >
                            {copyStatus['subject'] ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>

                     {/* Message */}
                     <div className="bg-[#0f0f0f] border border-[#2a1e16] rounded-lg p-3 flex items-center justify-between group">
                        <div className="overflow-hidden">
                            <p className="text-[8px] text-[#5c4a3e] uppercase font-bold">Message</p>
                            <p className="text-xs text-[#a89080] line-clamp-1 italic">Contenu du message formaté...</p>
                        </div>
                        <button 
                            onClick={() => handleCopy(body, 'body')}
                            className="p-2 hover:bg-[#2a1e16] rounded-lg text-[#8c7a6b] hover:text-white transition-colors"
                            title="Copier le message"
                        >
                            {copyStatus['body'] ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
             </div>

             <button 
                onClick={() => setIsSent(false)} 
                className="text-amber-500 hover:text-white font-bold uppercase text-xs tracking-widest flex items-center gap-2 transition-colors"
             >
                Retour au formulaire <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-xs font-bold text-[#8c7a6b] uppercase tracking-wide flex items-center gap-2">
                     <User className="w-3 h-3 text-amber-500" /> Prénom *
                  </label>
                  <input 
                    type="text" 
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white placeholder-[#3d2b1f] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    placeholder="Ton prénom"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-bold text-[#8c7a6b] uppercase tracking-wide flex items-center gap-2">
                     <User className="w-3 h-3 text-amber-500" /> Nom *
                  </label>
                  <input 
                    type="text" 
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white placeholder-[#3d2b1f] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    placeholder="Ton nom"
                  />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8c7a6b] uppercase tracking-wide flex items-center gap-2">
                        <AtSign className="w-3 h-3 text-amber-500" /> Email *
                    </label>
                    <input 
                        type="email" 
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white placeholder-[#3d2b1f] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                        placeholder="ton@email.com"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-[#8c7a6b] uppercase tracking-wide flex items-center gap-2">
                        <Instagram className="w-3 h-3 text-pink-500" /> Instagram <span className="opacity-50 text-[10px] lowercase font-normal ml-auto">(optionnel)</span>
                    </label>
                    <input 
                        type="text" 
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleChange}
                        className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white placeholder-[#3d2b1f] focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                        placeholder="@toninsta"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-[#8c7a6b] uppercase tracking-wide flex items-center gap-2">
                    <MessageSquare className="w-3 h-3 text-amber-500" /> Ton Message *
                </label>
                <textarea 
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full bg-[#120a05] border border-[#3d2b1f] rounded-xl px-4 py-3 text-white placeholder-[#3d2b1f] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none"
                    placeholder="Parle-moi de ton projet, de tes besoins..."
                />
            </div>

            <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-black font-black py-4 rounded-xl shadow-lg hover:shadow-amber-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Envoi en cours...
                    </>
                ) : (
                    <>
                        <Send className="w-5 h-5" /> Envoyer le message
                    </>
                )}
            </button>

            <div className="pt-4 flex justify-center">
                 <p className="text-[10px] text-[#5c4a3e] italic flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Envoi direct vers <span className="text-[#8c7a6b] font-bold">fabiodmsbeats@gmail.com</span>
                 </p>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
