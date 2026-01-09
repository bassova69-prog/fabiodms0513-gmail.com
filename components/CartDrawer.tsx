
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, CreditCard, Lock, Loader2, Tag, Zap, ChevronLeft, User, MapPin, Mail } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { CustomerDetails, CartItem } from '../types';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, toggleCart, cartItems, removeFromCart, cartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [view, setView] = useState<'cart' | 'checkout'>('cart');
  const navigate = useNavigate();

  // État du formulaire
  const [customer, setCustomer] = useState<CustomerDetails>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'France'
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetails, boolean>>>({});

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      // Reset view when closing
      setTimeout(() => setView('cart'), 300);
    }
  }, [isCartOpen]);

  // Calcul des IDs des articles gratuits (pour l'affichage "OFFERT")
  // Doit correspondre à la logique du CartContext (Les moins chers sont offerts)
  const freeItemIds = useMemo(() => {
    const freeIds = new Set<string>();
    const bulkGroups: Record<number, CartItem[]> = {};

    // Groupement
    cartItems.forEach(item => {
      if (item.promoType === 'BULK_DEAL') {
        const threshold = item.bulkThreshold || 2;
        if (!bulkGroups[threshold]) bulkGroups[threshold] = [];
        bulkGroups[threshold].push(item);
      }
    });

    // Identification des gratuits
    Object.keys(bulkGroups).forEach(key => {
        const threshold = parseInt(key);
        const items = [...bulkGroups[threshold]]; // Copie pour ne pas muter l'original
        
        // Tri décroissant par prix
        items.sort((a, b) => b.license.price - a.license.price);

        const bundleSize = threshold + 1;
        const freeCount = Math.floor(items.length / bundleSize);

        // Les 'freeCount' derniers articles sont gratuits
        const freeItems = items.slice(items.length - freeCount);
        freeItems.forEach(item => freeIds.add(item.id));
    });

    return freeIds;
  }, [cartItems]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name as keyof CustomerDetails]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof CustomerDetails, boolean>> = {};
    let isValid = true;

    if (!customer.firstName.trim()) { newErrors.firstName = true; isValid = false; }
    if (!customer.lastName.trim()) { newErrors.lastName = true; isValid = false; }
    if (!customer.email.trim() || !customer.email.includes('@')) { newErrors.email = true; isValid = false; }
    if (!customer.address.trim()) { newErrors.address = true; isValid = false; }
    if (!customer.city.trim()) { newErrors.city = true; isValid = false; }
    if (!customer.zipCode.trim()) { newErrors.zipCode = true; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;
    setView('checkout');
  };

  const handleBackToCart = () => {
    setView('cart');
  };

  const handlePayment = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    const itemsToPass = [...cartItems];
    const customerToPass = { ...customer };

    setTimeout(() => {
      setIsProcessing(false);
      toggleCart(); 
      clearCart();
      navigate('/success', { state: { items: itemsToPass, customer: customerToPass } });
    }, 2000);
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
                {view === 'checkout' ? (
                  <button onClick={handleBackToCart} className="mr-2 text-[#8c7a6b] hover:text-white transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                ) : (
                  <ShoppingBag className="w-5 h-5 text-amber-500" />
                )}
                <h2 className="text-xl font-bold text-[#fff8f0]">
                    {view === 'checkout' ? 'Informations' : 'Mon Panier'}
                    {view === 'cart' && <span className="text-sm font-normal text-[#8c7a6b] ml-2">({cartItems.length})</span>}
                </h2>
            </div>
            <button 
                onClick={toggleCart} 
                className="p-2 hover:bg-[#3d2b1f] rounded-full text-[#8c7a6b] transition-colors"
            >
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto relative flex flex-col min-h-0 bg-[#0f0f0f]">
            {isProcessing && (
                <div className="absolute inset-0 z-[75] bg-[#0f0f0f]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center">
                    <Loader2 className="w-16 h-16 text-amber-500 animate-spin mb-6" />
                    <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2">PAIEMENT SÉCURISÉ...</h3>
                    <p className="text-sm text-[#8c7a6b]">Génération de la facture et du contrat de licence au nom de {customer.firstName}</p>
                </div>
            )}

            {view === 'cart' ? (
              // VUE PANIER LISTE
              <div className="p-6 space-y-4">
                  {cartItems.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-24 opacity-30">
                          <ShoppingBag className="w-16 h-16 mb-6 mx-auto" />
                          <p className="text-xl font-bold">Ton panier est vide</p>
                          <p className="text-sm mt-2 italic">Choisis tes beats dans le catalogue.</p>
                      </div>
                  ) : (
                      cartItems.map((item) => {
                          const isFree = freeItemIds.has(item.id);
                          const isPercentage = item.promoType === 'PERCENTAGE';
                          const hasDiscount = isPercentage && item.originalPrice && item.originalPrice > item.license.price;
                          
                          return (
                              <div key={item.id} className={`flex gap-4 p-4 rounded-2xl border animate-in fade-in slide-in-from-right-4 group transition-colors ${isFree ? 'bg-amber-900/10 border-amber-500/30' : 'bg-[#1a120b] border-[#3d2b1f] hover:border-amber-900/50'}`}>
                                  <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-[#3d2b1f] bg-black">
                                      <img src={item.beat?.cover_url} className="w-full h-full object-cover" alt={item.beat?.title} />
                                  </div>
                                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                                      <div>
                                          <div className="flex justify-between items-start gap-2">
                                              <h3 className="font-bold text-[#fff8f0] text-sm truncate">{item.beat?.title}</h3>
                                              <button onClick={() => removeFromCart(item.id)} className="text-[#5c4a3e] hover:text-red-400 transition-colors">
                                                  <Trash2 className="w-4 h-4" />
                                              </button>
                                          </div>
                                          <div className="flex items-center gap-2 mt-2">
                                              <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-900/30 bg-amber-900/10 text-amber-400 font-black inline-block uppercase">
                                                  {item.license?.name}
                                              </span>
                                              {isFree ? (
                                                  <span className="text-[9px] flex items-center gap-1 font-bold text-amber-500">
                                                      <Zap className="w-3 h-3" /> OFFERT
                                                  </span>
                                              ) : hasDiscount && (
                                                  <span className="text-[9px] flex items-center gap-1 font-bold text-emerald-400">
                                                      <Tag className="w-3 h-3" /> REMISE
                                                  </span>
                                              )}
                                          </div>
                                      </div>
                                      <div className="flex justify-end items-center gap-2">
                                          {hasDiscount && (
                                              <span className="text-xs text-[#5c4a3e] line-through decoration-red-500/50">
                                                  {item.originalPrice?.toFixed(2)}€
                                              </span>
                                          )}
                                          <span className={`font-black text-lg ${isFree || hasDiscount ? (isFree ? 'text-amber-500' : 'text-emerald-400') : 'text-white'}`}>
                                              {isFree ? '0.00€' : `${(Number(item.license?.price) || 0).toFixed(2)}€`}
                                          </span>
                                      </div>
                                  </div>
                              </div>
                          );
                      })
                  )}
              </div>
            ) : (
              // VUE FORMULAIRE CHECKOUT
              <div className="p-6 space-y-6 animate-in slide-in-from-right-8">
                 <div className="bg-amber-900/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                    <Lock className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-xs text-[#a89080]">
                      Ces informations sont obligatoires pour établir votre <strong>facture</strong> et votre <strong>contrat de licence</strong> légal.
                    </p>
                 </div>

                 <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#8c7a6b] uppercase tracking-wide flex items-center gap-1.5">
                            <User className="w-3 h-3" /> Prénom *
                          </label>
                          <input 
                            type="text" 
                            name="firstName"
                            value={customer.firstName}
                            onChange={handleInputChange}
                            className={`w-full bg-[#1a120b] border ${errors.firstName ? 'border-red-500' : 'border-[#3d2b1f]'} rounded-lg p-3 text-white text-sm focus:border-amber-500 focus:outline-none transition-colors`}
                            placeholder="Votre prénom"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#8c7a6b] uppercase tracking-wide">Nom *</label>
                          <input 
                            type="text" 
                            name="lastName"
                            value={customer.lastName}
                            onChange={handleInputChange}
                            className={`w-full bg-[#1a120b] border ${errors.lastName ? 'border-red-500' : 'border-[#3d2b1f]'} rounded-lg p-3 text-white text-sm focus:border-amber-500 focus:outline-none transition-colors`}
                            placeholder="Votre nom"
                          />
                       </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#8c7a6b] uppercase tracking-wide flex items-center gap-1.5">
                           <Mail className="w-3 h-3" /> Email *
                        </label>
                        <input 
                          type="email" 
                          name="email"
                          value={customer.email}
                          onChange={handleInputChange}
                          className={`w-full bg-[#1a120b] border ${errors.email ? 'border-red-500' : 'border-[#3d2b1f]'} rounded-lg p-3 text-white text-sm focus:border-amber-500 focus:outline-none transition-colors`}
                          placeholder="exemple@email.com"
                        />
                        <p className="text-[10px] text-[#5c4a3e] italic">Vos fichiers seront envoyés à cette adresse.</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#8c7a6b] uppercase tracking-wide flex items-center gap-1.5">
                           <MapPin className="w-3 h-3" /> Adresse Postale *
                        </label>
                        <input 
                          type="text" 
                          name="address"
                          value={customer.address}
                          onChange={handleInputChange}
                          className={`w-full bg-[#1a120b] border ${errors.address ? 'border-red-500' : 'border-[#3d2b1f]'} rounded-lg p-3 text-white text-sm focus:border-amber-500 focus:outline-none transition-colors`}
                          placeholder="Numéro et rue"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#8c7a6b] uppercase tracking-wide">Code Postal *</label>
                          <input 
                            type="text" 
                            name="zipCode"
                            value={customer.zipCode}
                            onChange={handleInputChange}
                            className={`w-full bg-[#1a120b] border ${errors.zipCode ? 'border-red-500' : 'border-[#3d2b1f]'} rounded-lg p-3 text-white text-sm focus:border-amber-500 focus:outline-none transition-colors`}
                            placeholder="75000"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#8c7a6b] uppercase tracking-wide">Ville *</label>
                          <input 
                            type="text" 
                            name="city"
                            value={customer.city}
                            onChange={handleInputChange}
                            className={`w-full bg-[#1a120b] border ${errors.city ? 'border-red-500' : 'border-[#3d2b1f]'} rounded-lg p-3 text-white text-sm focus:border-amber-500 focus:outline-none transition-colors`}
                            placeholder="Paris"
                          />
                       </div>
                    </div>
                 </form>
              </div>
            )}
        </div>

        {cartItems.length > 0 && (
            <div className="p-8 bg-[#1a120b] border-t border-[#3d2b1f] space-y-6">
                <div className="flex justify-between items-center text-[#fff8f0] text-2xl font-black italic tracking-tighter">
                    <span>TOTAL</span>
                    <span className="text-emerald-400">{cartTotal.toFixed(2)}€</span>
                </div>

                {view === 'cart' ? (
                  <button 
                      onClick={handleProceedToCheckout}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-black font-black py-5 rounded-2xl flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                  >
                      <CreditCard className="w-6 h-6" />
                      PROCÉDER AU PAIEMENT
                  </button>
                ) : (
                  <button 
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                  >
                      <Lock className="w-5 h-5" />
                      PAYER {cartTotal.toFixed(2)}€
                  </button>
                )}
                
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
