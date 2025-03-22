import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Camera, CameraOff } from "lucide-react";
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
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();
  const { addItemToCart, isAddingItem } = useCart();
  
  // Fetch all products to simulate product recognition
  const { data: products } = useQuery({
    queryKey: ["/api/products"],
  });
  
  const enableCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setIsCameraActive(true);
        }
      } else {
        toast({
          title: "Camera Error",
          description: "Your browser doesn't support camera access",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access the camera. Please check permissions.",
        variant: "destructive",
      });
      console.error("Error accessing camera:", error);
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
  
  // Simulate scanning a product
  const scanProduct = () => {
    if (!products || products.length === 0) return;
    
    setIsScanning(true);
    setScanResult({ success: false });
    
    // Simulate processing time
    setTimeout(() => {
      const successRate = 0.8; // 80% success rate
      const isSuccess = Math.random() < successRate;
      
      if (isSuccess && products.length > 0) {
        // Pick a random product from our database
        const randomIndex = Math.floor(Math.random() * products.length);
        const randomProduct = products[randomIndex];
        
        // Add to cart
        addItemToCart(randomProduct.id);
        
        setScanResult({ 
          success: true,
          productName: randomProduct.name
        });
        
        if (onScanSuccess) {
          onScanSuccess(randomProduct.name);
        }
      } else {
        setScanResult({ success: false });
      }
      
      setIsScanning(false);
    }, 1500);
  };
  
  return (
    <div className="camera-view relative flex-grow bg-black">
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
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            autoPlay
            playsInline
          />
          
          {/* Scanning overlay */}
          <div className="scan-overlay absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[70%] h-[35%] border-2 border-primary rounded-xl">
            <div className="scan-corners before:absolute before:top-[-2px] before:left-[-2px] before:w-5 before:h-5 before:border-t-2 before:border-l-2 before:border-primary after:absolute after:bottom-[-2px] after:right-[-2px] after:w-5 after:h-5 after:border-b-2 after:border-r-2 after:border-primary"></div>
          </div>
          
          {/* Scanning indicator */}
          {isScanning && (
            <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center">
              <div className="animate-pulse bg-primary bg-opacity-20 text-primary px-4 py-2 rounded-full mb-2">
                <span className="text-sm font-medium">Scanning...</span>
              </div>
              <p className="text-white text-xs">Position item within the frame</p>
            </div>
          )}
          
          {/* Success indicator */}
          {!isScanning && scanResult.success && (
            <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center">
              <div className="bg-success text-white px-4 py-2 rounded-full mb-2">
                <span className="text-sm font-medium">Item Added!</span>
              </div>
              <p className="text-white text-sm font-medium">{scanResult.productName}</p>
            </div>
          )}
          
          {/* Error indicator */}
          {!isScanning && !scanResult.success && scanResult.success !== undefined && (
            <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center">
              <div className="bg-destructive text-white px-4 py-2 rounded-full mb-2">
                <span className="text-sm font-medium">Scan Failed</span>
              </div>
              <p className="text-white text-xs">Try again or add manually</p>
            </div>
          )}
          
          {/* Scan button */}
          <Button
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-primary rounded-full p-4 shadow-lg hover:bg-gray-100"
            size="icon"
            onClick={scanProduct}
            disabled={isScanning || isAddingItem}
          >
            <Camera className="h-6 w-6" />
          </Button>
        </>
      )}
    </div>
  );
}
