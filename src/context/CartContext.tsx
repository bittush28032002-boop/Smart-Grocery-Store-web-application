import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '../types';
import { getCart, addToCart, updateCartQuantity, clearCart, getProducts } from '../services/groceryService';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  total: number;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const p = await getProducts();
      setProducts(p);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = getCart(user.uid, (cartItems) => {
        const enrichedItems = cartItems.map(item => ({
          ...item,
          product: products.find(p => p.id === item.productId)
        }));
        setItems(enrichedItems);
      });
      return unsubscribe;
    } else {
      setItems([]);
    }
  }, [user, products]);

  const total = items.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  const addItem = async (productId: string, quantity: number = 1) => {
    if (user) await addToCart(user.uid, productId, quantity);
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (user) await updateCartQuantity(user.uid, itemId, quantity);
  };

  const clear = async () => {
    if (user) await clearCart(user.uid);
  };

  return (
    <CartContext.Provider value={{ items, total, addItem, updateQuantity, clear }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
