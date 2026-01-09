
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Beat, License, CartItem } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (beat: Beat, license: License, originalPrice?: number, promoType?: 'PERCENTAGE' | 'BULK_DEAL', bulkThreshold?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Chargement sécurisé
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('fabio_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch (e) {
      console.warn("Erreur lors de la récupération du panier local:", e);
    }
  }, []);

  // Sauvegarde sécurisée (évite le crash si le quota est dépassé par les gros fichiers base64)
  useEffect(() => {
    try {
      if (cartItems.length > 0) {
        localStorage.setItem('fabio_cart', JSON.stringify(cartItems));
      } else {
        localStorage.removeItem('fabio_cart');
      }
    } catch (e) {
      // Si le stockage échoue (trop lourd), on ne fait rien, le panier restera en mémoire vive
      console.error("Impossible de sauvegarder le panier dans le stockage local (quota dépassé):", e);
    }
  }, [cartItems]);

  const addToCart = (beat: Beat, license: License, originalPrice?: number, promoType?: 'PERCENTAGE' | 'BULK_DEAL', bulkThreshold?: number) => {
    if (!beat || !license) return;

    const newItem: CartItem = {
      id: `${beat.id}-${license.id}-${Date.now()}`,
      beat,
      license,
      originalPrice: originalPrice || license.price,
      promoType: promoType,
      bulkThreshold: bulkThreshold
    };
    
    setCartItems(prev => [...prev, newItem]);
    // Ouverture immédiate pour retour visuel
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem('fabio_cart');
    } catch(e) {}
  };

  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  // Calcul du total avec logique "N achetés = 1 offert" dynamique
  const cartTotal = React.useMemo(() => {
    let runningTotal = 0;
    
    // On utilise un compteur par "type de seuil" pour gérer correctement si jamais il y a des mix (peu probable mais robuste)
    const counts: Record<number, number> = {};
    
    cartItems.forEach(item => {
      if (item.promoType === 'BULK_DEAL') {
        const threshold = item.bulkThreshold || 2; // Par défaut "Buy 2 Get 1" (seuil=2)
        const currentCount = (counts[threshold] || 0) + 1;
        counts[threshold] = currentCount;

        // La gratuité s'applique sur le (threshold + 1)ème élément
        // Ex: Seuil 1 (1 acheté 1 offert) -> Total 2 -> Le 2ème est gratuit (2 % 2 == 0)
        // Ex: Seuil 2 (2 achetés 1 offert) -> Total 3 -> Le 3ème est gratuit (3 % 3 == 0)
        if (currentCount % (threshold + 1) === 0) {
           runningTotal += 0;
        } else {
           runningTotal += item.license.price;
        }
      } else {
        runningTotal += item.license.price;
      }
    });
    
    return runningTotal;
  }, [cartItems]);

  const cartCount = cartItems.length;

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      isCartOpen, 
      addToCart, 
      removeFromCart, 
      clearCart,
      toggleCart, 
      setIsCartOpen,
      cartTotal, 
      cartCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
