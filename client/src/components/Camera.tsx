import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Camera, CameraOff, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/cart-context";

interface CameraComponentProps {
  onScanSuccess?: (productName: string) => void;
}

export function CameraComponent({ onScanSuccess }: CameraComponentProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; productName?: string }>({ success: false });
  const [lastScannedProducts, setLastScannedProducts] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();
  const { addItemToCart, isAddingItem } = useCart();
  
  // Fetch all products to simulate product recognition
  const { data: products = [] } = useQuery<any[]>({
    queryKey: ["/api/products"],
  });
  
  const enableCamera = async () => {
    try {
      console.log("Enabling camera...");
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log("getUserMedia supported - attempting to access camera");
        
        const constraints = {
          video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("Camera stream obtained successfully");
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          
          // Force camera active status here since we got a stream
          setIsCameraActive(true);
          
          // Wait for video to be ready before capturing frames
          videoRef.current.onloadedmetadata = () => {
            console.log("Video metadata loaded");
            if (videoRef.current) {
              videoRef.current.play()
                .then(() => console.log("Video playback started"))
                .catch(err => console.error("Error playing video:", err));
            }
          };
        } else {
          console.error("Video reference is null");
        }
      } else {
        console.error("getUserMedia not supported");
        toast({
          title: "Camera Error",
          description: "Your browser doesn't support camera access",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Could not access the camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };
  
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // This function would be used if we needed to process frames
  // Currently we're directly displaying the video with overlays
  const captureImageForProcessing = () => {
    if (videoRef.current && streamRef.current) {
      const video = videoRef.current;
      
      // Create a temporary canvas to capture the frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get the image data for processing
        // const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Here you would add code to process the image data
        // (e.g., object detection, barcode scanning, etc.)
        
        // Return the data URL if needed
        return canvas.toDataURL('image/jpeg');
      }
    }
    return null;
  };
  
  // Simulate scanning a product with more realistic behavior
  const scanProduct = () => {
    if (!products || products.length === 0) return;
    
    setIsScanning(true);
    setScanResult({ success: false });
    
    // Play a scan sound effect
    try {
      const scanSound = new Audio('/scan-beep.mp3');
      scanSound.volume = 0.3;
      scanSound.play().catch(err => console.log('Audio play failed, continuing without sound'));
    } catch (error) {
      console.log('Audio not supported, continuing without sound');
    }
    
    // Simulate processing time with visual feedback
    setTimeout(() => {
      const successRate = 0.8; // 80% success rate
      const isSuccess = Math.random() < successRate;
      
      if (isSuccess && products.length > 0) {
        // Intelligent product selection - avoid repeating the last few scanned products
        let availableProducts = [...products];
        if (lastScannedProducts.length > 0) {
          availableProducts = products.filter((product: any) => 
            !lastScannedProducts.includes(product.name)
          );
        }
        
        // If no products left after filtering, use all products
        if (availableProducts.length === 0) {
          availableProducts = [...products];
        }
        
        // Select a product
        const randomIndex = Math.floor(Math.random() * availableProducts.length);
        const selectedProduct = availableProducts[randomIndex];
        
        // Add to cart
        addItemToCart(selectedProduct.id);
        
        // Update scan result and last scanned products
        setScanResult({ 
          success: true,
          productName: selectedProduct.name
        });
        
        // Keep track of last 3 scanned products
        setLastScannedProducts(prev => {
          const updated = [selectedProduct.name, ...prev].slice(0, 3);
          return updated;
        });
        
        if (onScanSuccess) {
          onScanSuccess(selectedProduct.name);
        }
        
        // Play success sound
        try {
          const successSound = new Audio('/success-chime.mp3');
          successSound.volume = 0.2;
          successSound.play().catch(err => console.log('Audio play failed, continuing without sound'));
        } catch (error) {
          console.log('Audio not supported, continuing without sound');
        }
      } else {
        setScanResult({ success: false });
        
        // Play error sound
        try {
          const errorSound = new Audio('/error-beep.mp3');
          errorSound.volume = 0.2;
          errorSound.play().catch(err => console.log('Audio play failed, continuing without sound'));
        } catch (error) {
          console.log('Audio not supported, continuing without sound');
        }
      }
      
      setIsScanning(false);
    }, 1500);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="camera-view relative flex-grow bg-black overflow-hidden">
        {!isCameraActive ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center p-4">
              <CameraOff className="mx-auto h-12 w-12 mb-2" />
              <p>Camera permission required</p>
              <Button 
                onClick={enableCamera} 
                className="mt-3" 
                variant="default"
              >
                Enable Camera
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Video element for direct display */}
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {/* Overlay for scanning effects */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Target frame */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4/5 h-2/5 border-2 border-white/40 rounded-lg">
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary rounded-tl"></div>
                  <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary rounded-tr"></div>
                  <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-primary rounded-bl"></div>
                  <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-primary rounded-br"></div>
                </div>
              </div>
              
              {/* Scanning animation */}
              {isScanning && (
                <div className="scanning-effect absolute inset-0 bg-primary bg-opacity-10 animate-pulse">
                  <div className="h-1 bg-primary animate-scan-line"></div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Bottom panel with results - Always visible */}
      <div className="bg-black bg-opacity-70 backdrop-blur-sm p-3 rounded-t-xl z-10">
        {/* Success indicator */}
        {isCameraActive && !isScanning && scanResult.success && (
          <div className="flex items-center justify-between bg-success bg-opacity-20 p-2 rounded-lg mb-2">
            <div className="flex items-center">
              <ShoppingBasket className="text-white mr-2 h-5 w-5" />
              <div>
                <div className="text-white text-sm font-medium">{scanResult.productName}</div>
                <div className="text-green-300 text-xs">Added to cart</div>
              </div>
            </div>
            <div className="bg-white text-success rounded-full h-6 w-6 flex items-center justify-center">
              <span className="text-xs font-bold">+1</span>
            </div>
          </div>
        )}
        
        {/* Error indicator */}
        {isCameraActive && !isScanning && !scanResult.success && scanResult.success !== undefined && (
          <div className="text-white text-center text-sm mb-2">
            <span className="text-red-400">No product detected.</span> Position item clearly within the frame.
          </div>
        )}
        
        {/* Instructions */}
        {isCameraActive && (
          <div className="text-white/70 text-xs text-center mb-3">
            {isScanning ? 'Analyzing...' : 'Position product in center of frame and tap Scan'}
          </div>
        )}
        
        {/* Enable Camera Button (when camera is not active) */}
        {!isCameraActive ? (
          <Button
            className="w-full scan-button text-white rounded-lg py-3"
            onClick={enableCamera}
          >
            <span className="flex items-center justify-center">
              <Camera className="mr-2 h-5 w-5" />
              Enable Camera
            </span>
          </Button>
        ) : (
          /* Scan button (when camera is active) */
          <Button
            className="w-full scan-button text-white rounded-lg py-3"
            onClick={scanProduct}
            disabled={isScanning || isAddingItem}
          >
            {isScanning ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Scanning...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Camera className="mr-2 h-5 w-5" />
                Scan Product
              </span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
