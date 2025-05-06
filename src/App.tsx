import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Products from "./pages/Products";
import Scanner from "./pages/Scanner";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import { createClient } from '@supabase/supabase-js';

// Create a QueryClient
const queryClient = new QueryClient();

const supabase = createClient('https://rrzekdyumrwvzavuymtg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyeWtlZHl1bXJ3dnphaXZ1eW10ZyIsInJlZ2lvbl91cmwiOiJycXplZHl1bXJ3dnphaXZ1eW10ZyIsInJlc291cmNlX2lkIjoicnJ6ZWtkeXVtcnd2emF2dXltdGciLCJpYXQiOjE3NDU1MDk1OTAsImV4cCI6MjA2MTA4NTU5MH0.0QhNFWEzViT0xSoROfxYn4W0OPWqNJDLJUI7IuCDg-0');

async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    // Handle error (e.g., show message to user)
    console.error(error.message);
  } else {
    // User created! data.user contains the new user info
    console.log('User created:', data.user);
  }
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Sonner position="top-right" />

              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    {/* Redirect root to scanner */}
                    <Route path="/" element={<Navigate to="/scanner" replace />} />
                    
                    {/* Other Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/scanner" element={<Scanner />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/home" element={<Home />} />

                    {/* Catch-all for 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

