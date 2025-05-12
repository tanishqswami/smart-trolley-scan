import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { Barcode, Camera, Check, X, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuagga } from '../hooks/useQuagga';

const Scanner = () => {
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [manualBarcode, setManualBarcode] = useState('');
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [scannedProduct, setScannedProduct] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [scanCooldown, setScanCooldown] = useState(false);
  
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const scannerRef = useRef<HTMLDivElement>(null);
  const { initScanner, stopScanner } = useQuagga(scannerRef, handleDetection);

  // Start or stop scanner based on active tab
  useEffect(() => {
    if (activeTab === 'camera') {
      initScanner();
    } else {
      stopScanner();
    }
    
    return () => {
      stopScanner();
    };
  }, [activeTab, initScanner, stopScanner]);

  // Process barcode detection
  function handleDetection(barcode: string) {
    if (barcode === lastScanned || isProcessing || scanCooldown) return;
    setLastScanned(barcode);
    setScanCooldown(true);
    setTimeout(() => setScanCooldown(false), 5000); // 5 seconds cooldown
    processBarcode(barcode);
  }

  // Process barcode manually or from camera
  const processBarcode = async (barcode: string) => {
    try {
      setIsProcessing(true);
      
      // Look up product by barcode
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('Product not found. Please check the barcode and try again.');
        } else {
          toast.error(`Error: ${error.message}`);
        }
        setScannedProduct(null);
        return;
      }
      
      setScannedProduct(data);
      setShowConfirmation(true);
      
    } catch (error: any) {
      console.error('Error processing barcode:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
      
      // Reset manual input
      if (activeTab === 'manual') {
        setManualBarcode('');
      }
    }
  };

  const handleAddToCart = async () => {
    if (!scannedProduct) return;
    
    try {
      await addToCart(scannedProduct.id);
      toast.success(`${scannedProduct.name} added to cart!`, {
        action: {
          label: 'View Cart',
          onClick: () => navigate('/cart')
        }
      });
      setShowConfirmation(false);
      
      // Reset last scanned after a delay to allow scanning the same code again
      setTimeout(() => {
        setLastScanned(null);
        setScannedProduct(null);
      }, 3000);
    } catch (error: any) {
      toast.error('Failed to add item to cart');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode) {
      processBarcode(manualBarcode);
    }
  };

  return (
    <div className="container py-6 max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Barcode className="mr-2 h-6 w-6" /> Barcode Scanner
          </CardTitle>
          <CardDescription>
            Scan a product barcode to add it to your cart
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'camera' | 'manual')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="camera">
                <Camera className="mr-2 h-4 w-4" /> Camera
              </TabsTrigger>
              <TabsTrigger value="manual">
                <Barcode className="mr-2 h-4 w-4" /> Manual Entry
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="camera">
              <div className="bg-gray-100 rounded-md overflow-hidden mb-4">
                <div 
                  ref={scannerRef} 
                  className="aspect-video w-full relative"
                >
                  {/* Camera will be initialized here */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="border-2 border-red-500 w-3/4 h-40 opacity-50 flex items-center justify-center">
                      <Barcode className="h-12 w-12 text-red-500" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Position the barcode within the frame to scan
              </div>
            </TabsContent>
            
            <TabsContent value="manual">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Enter barcode number"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!manualBarcode || isProcessing}>
                    Scan
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          {/* Scanned Product Result */}
          {scannedProduct && (
            <div className="mt-6 p-4 border rounded-md bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-green-600">
                  <Check className="h-5 w-5 mr-2" /> Product Found
                </div>
                <div className="text-sm text-muted-foreground">
                  Barcode: {lastScanned}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-lg">{scannedProduct.name}</h3>
                <p className="text-lg font-bold text-primary mt-1">
                  ${scannedProduct.price.toFixed(2)}
                </p>
                
                {showConfirmation ? (
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      onClick={handleAddToCart}
                      className="flex-1"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowConfirmation(false);
                        setScannedProduct(null);
                        setLastScanned(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-green-600">
                    Added to cart successfully!
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Scanner;
