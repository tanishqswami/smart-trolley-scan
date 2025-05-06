import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/Navbar";
import Products from "./pages/Products";
import Scanner from "./pages/Scanner";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";

// Create a QueryClient
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CartProvider>
          <TooltipProvider>
            <Sonner position="top-right" />

            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Redirect root to products */}
                  <Route path="/" element={<Navigate to="/products" replace />} />
                  
                  {/* Other Routes */}
                  <Route path="/products" element={<Products />} />
                  <Route path="/scanner" element={<Scanner />} />
                  <Route path="/cart" element={<Cart />} />

                  {/* Catch-all for 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </TooltipProvider>
        </CartProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
