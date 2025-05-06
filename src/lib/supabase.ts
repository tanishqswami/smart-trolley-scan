
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// We'll use environment variables or public project URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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
