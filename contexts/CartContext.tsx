
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

  // Calcul du total avec logique "Les moins chers sont offerts"
  const cartTotal = React.useMemo(() => {
    let runningTotal = 0;
    
    // On sépare les articles en promotions groupées (BULK_DEAL) des autres
    const bulkGroups: Record<number, CartItem[]> = {};
    
    cartItems.forEach(item => {
      if (item.promoType === 'BULK_DEAL') {
        const threshold = item.bulkThreshold || 2;
        if (!bulkGroups[threshold]) {
          bulkGroups[threshold] = [];
        }
        bulkGroups[threshold].push(item);
      } else {
        // Articles hors promo groupée ou remise simple
        runningTotal += item.license.price;
      }
    });

    // Traitement des groupes (ex: tous les "2 achetés 1 offert")
    Object.keys(bulkGroups).forEach(key => {
        const threshold = parseInt(key);
        const items = bulkGroups[threshold];
        
        // On trie par prix décroissant (du plus cher au moins cher)
        // Cela permet d'identifier les moins chers qui seront à la fin du tableau
        items.sort((a, b) => b.license.price - a.license.price);

        // Nombre d'articles gratuits : partie entière de (Total / Taille du lot)
        // Taille du lot = threshold + 1 (ex: pour "2 achetés = 1 offert", le lot est de 3)
        const bundleSize = threshold + 1;
        const freeCount = Math.floor(items.length / bundleSize);

        // Les 'freeCount' derniers articles du tableau trié (donc les moins chers) sont gratuits
        const itemsToPay = items.length - freeCount;

        // On additionne le prix des articles à payer (les premiers de la liste triée)
        for (let i = 0; i < itemsToPay; i++) {
            runningTotal += items[i].license.price;
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
