import { useCallback, useRef } from 'react';
import Quagga from '@ericblade/quagga2';
import { toast } from 'sonner';

export function useQuagga(
  scannerRef: React.RefObject<HTMLDivElement>,
  onDetected: (barcode: string) => void
) {
  const isInitialized = useRef(false);

  const initScanner = useCallback(() => {
    if (!scannerRef.current || isInitialized.current) {
      return;
    }

    // Make sure Quagga is ready to be used
    Quagga.init(
      {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: {
            facingMode: 'environment', // Use the rear camera
            width: { min: 450 },
            height: { min: 300 },
            aspectRatio: { min: 1, max: 2 }
          },
        },
        locator: {
          patchSize: 'medium',
          halfSample: true,
        },
        numOfWorkers: navigator.hardwareConcurrency || 4,
        decoder: {
          readers: ['ean_reader', 'ean_8_reader', 'code_128_reader', 'code_39_reader', 'upc_reader'],
        },
        locate: true,
      },
      (err) => {
        if (err) {
          console.error('Error initializing Quagga:', err);
          toast.error('Could not access camera. Please check permissions.');
          return;
        }
        
        isInitialized.current = true;
        
        // Start Quagga
        Quagga.start();
        
        // Set up detection callback
        let lastScanTime = 0;
        const cooldownPeriod = 2000; // 2 seconds cooldown

        Quagga.onDetected((result) => {
          const currentTime = Date.now();
          if (currentTime - lastScanTime < cooldownPeriod) {
            return; // Ignore scans during cooldown
          }
          lastScanTime = currentTime;

          // Get the highest confidence result
          if (result && result.codeResult) {
            // Format the barcode
            const barcode = result.codeResult.code || '';
            
            // Filter out low confidence or invalid scans
            if (result.codeResult.startInfo.error > 0.22) {
              return;
            }
            
            onDetected(barcode);
          }
        });
      }
    );

    return () => {
      stopScanner();
    };
  }, [scannerRef, onDetected]);

  const stopScanner = useCallback(() => {
    if (isInitialized.current) {
      Quagga.stop();
      isInitialized.current = false;
    }
  }, []);

  return { initScanner, stopScanner };
}
