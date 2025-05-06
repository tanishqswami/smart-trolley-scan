
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Type definition for our database
export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          price: number;
          barcode: string;
          image_url: string;
          created_at: string;
          updated_at: string;
        };
      };
      cart: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          quantity?: number;
          updated_at?: string;
        };
      };
      barcode_scans: {
        Row: {
          id: string;
          barcode: string;
          scan_timestamp: string;
          user_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          barcode: string;
          scan_timestamp?: string;
          user_id: string;
          status: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

// Use the pre-configured supabase client from the integrations directory
export const supabase = supabaseClient;

// Helper function to handle errors
export const handleError = (error: Error | null) => {
  if (error) {
    console.error('Error:', error);
    toast.error(error.message || 'An error occurred');
    return false;
  }
  return true;
};

// Get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
};
