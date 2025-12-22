
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, CreditCard, Lock, Loader2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, toggleCart, cartItems, removeFromCart, cartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isCartOpen]);

  const handleCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cartItems.length === 0 || isProcessing) return;
    
    setIsProcessing(true);
    
    // On capture les items avant de vider le panier pour les passer à la page de succès
    const itemsToPass = [...cartItems];

    // Simulation du paiement
    setTimeout(() => {
      setIsProcessing(false);
      toggleCart(); // On ferme le drawer
      clearCart();   // On vide le panier
      
      // Navigation vers la page de succès avec les données
      navigate('/success', { state: { items: itemsToPass } });
    }, 1500);
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] animate-in fade-in"
        onClick={toggleCart}
      />

      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#120a05] border-l border-[#3d2b1f] shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* HEADER */}
        <div className="p-6 border-b border-[#3d2b1f] flex justify-between items-center bg-[#1a120b]">
            <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-bold text-[#fff8f0]">
                    Mon Panier
                    <span className="text-sm font-normal text-[#8c7a6b] ml-2">({cartItems.length})</span>
                </h2>
            </div>
            <button 
                onClick={toggleCart} 
                className="p-2 hover:bg-[#3d2b1f] rounded-full text-[#8c7a6b] transition-colors"
            >
                <X className="w-6 h-6" />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto relative flex flex-col min-h-0 bg-[#0f0f0f]">
            {/* PROCESSING OVERLAY */}
            {isProcessing && (
                <div className="absolute inset-0 z-[75] bg-[#0f0f0f]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                    <Loader2 className="w-16 h-16 text-amber-500 animate-spin mb-6" />
                    <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2">PAIEMENT EN COURS...</h3>
                    <p className="text-sm text-[#8c7a6b]">Fabio génère tes liens de téléchargement</p>
                </div>
            )}

            {/* CART LIST */}
            <div className="p-6 space-y-4">
                {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-24 opacity-30">
                        <ShoppingBag className="w-16 h-16 mb-6 mx-auto" />
                        <p className="text-xl font-bold">Ton panier est vide</p>
                        <p className="text-sm mt-2 italic">Choisis tes beats dans le catalogue.</p>
                    </div>
                ) : (
                    cartItems.map((item) => (
                        <div key={item.id} className="flex gap-4 p-4 bg-[#1a120b] rounded-2xl border border-[#3d2b1f] animate-in fade-in slide-in-from-right-4">
                            <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-[#3d2b1f] bg-black">
                                <img src={item.beat?.coverUrl} className="w-full h-full object-cover" alt={item.beat?.title} />
                            </div>
                            <div className="flex-1 flex flex-col justify-between overflow-hidden">
                                <div>
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-[#fff8f0] text-sm truncate">{item.beat?.title}</h3>
                                        <button onClick={() => removeFromCart(item.id)} className="text-[#5c4a3e] hover:text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-900/30 bg-amber-900/10 text-amber-400 font-black mt-2 inline-block uppercase">
                                        {item.license?.name}
                                    </span>
                                </div>
                                <div className="flex justify-end">
                                    <span className="font-black text-emerald-400 text-lg">
                                        {(Number(item.license?.price) || 0).toFixed(2)}€
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* FOOTER */}
        {cartItems.length > 0 && (
            <div className="p-8 bg-[#1a120b] border-t border-[#3d2b1f] space-y-6">
                <div className="flex justify-between items-center text-[#fff8f0] text-2xl font-black italic tracking-tighter">
                    <span>TOTAL</span>
                    <span className="text-emerald-400">{cartTotal.toFixed(2)}€</span>
                </div>

                <button 
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-black font-black py-5 rounded-2xl flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                >
                    <CreditCard className="w-6 h-6" />
                    PROCÉDER AU PAIEMENT
                </button>
                
                <div className="flex justify-center items-center gap-3 text-[10px] text-[#5c4a3e] uppercase font-black tracking-widest">
                    <Lock className="w-4 h-4" />
                    SÉCURISÉ PAR STRIPE & PAYPAL
                </div>
            </div>
        )}
      </div>
    </>
  );
};
