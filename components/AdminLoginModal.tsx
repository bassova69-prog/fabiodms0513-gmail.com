
import React, { useState, useRef, useEffect } from 'react';
import { Lock, X, ShieldAlert, Loader2 } from 'lucide-react';

interface AdminLoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose, onSuccess }) => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    
    const newPin = [...pin];
    newPin[index] = value.substring(value.length - 1);
    setPin(newPin);
    setError(false);

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredPin = pin.join('');
    const storedPin = localStorage.getItem('fabio_admin_pin') || '123456';

    setIsVerifying(true);
    setTimeout(() => {
      if (enteredPin === storedPin) {
        onSuccess();
      } else {
        setError(true);
        setPin(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
      setIsVerifying(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-[#1a120b] border border-red-900/30 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-[#5c4a3e] hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center mb-6 border border-red-600/20">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">ZONE RESTREINTE</h2>
          <p className="text-xs text-[#a89080] font-bold uppercase tracking-widest mb-8">Saisir le code d'accès de Fabio</p>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex justify-between gap-2 mb-8">
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  // Fix ref assignment to return void
                  ref={el => { inputRefs.current[idx] = el; }}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className={`w-10 h-14 bg-[#120a05] border-2 rounded-xl text-center text-2xl font-black text-white focus:outline-none transition-all ${
                    error ? 'border-red-600 animate-shake' : digit ? 'border-amber-600' : 'border-[#3d2b1f]'
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="mb-6 flex items-center justify-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest animate-in fade-in">
                <ShieldAlert className="w-4 h-4" /> Code Incorrect
              </div>
            )}

            <button
              disabled={pin.some(d => !d) || isVerifying}
              className="w-full bg-white hover:bg-red-600 hover:text-white text-black font-black py-4 rounded-xl transition-all shadow-xl active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isVerifying ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'DEVERROUILLER'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
