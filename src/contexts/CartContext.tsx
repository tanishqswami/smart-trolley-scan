import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  price: number;
  barcode: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper function to handle errors
  const handleError = (error: Error | null) => {
    if (error) {
      console.error('Error:', error);
      toast.error(error.message || 'An error occurred');
      return false;
    }
    return true;
  };

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart')
        .select('*, product:product_id(*)');

      if (handleError(error)) {
        const items = data?.map(item => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          product: item.product
        })) || [];
        
        setCartItems(items);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      setLoading(true);
      
      // Check if product exists
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) throw productError;
      if (!productData) throw new Error('Product not found');

      // Check if item is already in cart
      const { data: existingItem, error: existingError } = await supabase
        .from('cart')
        .select('*')
        .eq('product_id', productId)
        .maybeSingle();

      if (existingError) throw existingError;

      let result;
      
      if (existingItem) {
        // Update quantity if already in cart
        result = await supabase
          .from('cart')
          .update({ quantity: existingItem.quantity + 1, updated_at: new Date().toISOString() })
          .eq('id', existingItem.id);
          
        toast.success(`Added another ${productData.name} to cart`);
      } else {
        // Add new item to cart
        result = await supabase
          .from('cart')
          .insert({
            product_id: productId,
            quantity: 1,
          });
          
        toast.success(`${productData.name} added to cart`);
      }

      if (result.error) throw result.error;
      
      // Refresh cart items
      await fetchCartItems();
      
    } catch (error: any) {
      toast.error(`Failed to add item: ${error.message}`);
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 0) return;

    try {
      setLoading(true);
      
      if (quantity === 0) {
        // Remove item if quantity is 0
        await removeFromCart(itemId);
        return;
      }

      const { error } = await supabase
        .from('cart')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('id', itemId);

      if (error) throw error;
      
      // Refresh cart items
      await fetchCartItems();
      
    } catch (error: any) {
      toast.error(`Failed to update quantity: ${error.message}`);
      console.error('Error updating quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      toast.success('Item removed from cart');
      
      // Refresh cart items
      await fetchCartItems();
      
    } catch (error: any) {
      toast.error(`Failed to remove item: ${error.message}`);
      console.error('Error removing from cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('cart')
        .delete();

      if (error) throw error;
      
      toast.success('Cart cleared');
      setCartItems([]);
      
    } catch (error: any) {
      toast.error(`Failed to clear cart: ${error.message}`);
      console.error('Error clearing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
