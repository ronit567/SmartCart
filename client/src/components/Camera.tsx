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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();
  const { addItemToCart, isAddingItem } = useCart();
  
  // Fetch all products to simulate product recognition
  const { data: products = [] } = useQuery<any[]>({
    queryKey: ["/api/products"],
  });
  
  const enableCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          setIsCameraActive(true);
          
          // Wait for video to be ready before capturing frames
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play();
            }
          };
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

  // Enhanced scanning effect - capture frame
  const captureFrame = () => {
    if (videoRef.current && canvasRef.current && streamRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        // Draw current video frame on canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Add visual processing effect
        context.fillStyle = 'rgba(52, 211, 153, 0.2)'; // Light green overlay
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add scan line animation
        const scanLineY = (Date.now() % 1000) / 1000 * canvas.height;
        context.strokeStyle = 'rgba(52, 211, 153, 0.8)';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(0, scanLineY);
        context.lineTo(canvas.width, scanLineY);
        context.stroke();
        
        // Highlight the center target area
        const centerWidth = canvas.width * 0.6;
        const centerHeight = canvas.height * 0.4;
        const centerX = (canvas.width - centerWidth) / 2;
        const centerY = (canvas.height - centerHeight) / 2;
        
        context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        context.lineWidth = 2;
        context.strokeRect(centerX, centerY, centerWidth, centerHeight);
        
        // Add corner markers
        const markerSize = 20;
        context.strokeStyle = '#10b981'; // Emerald
        context.lineWidth = 3;
        
        // Top-left corner
        context.beginPath();
        context.moveTo(centerX, centerY + markerSize);
        context.lineTo(centerX, centerY);
        context.lineTo(centerX + markerSize, centerY);
        context.stroke();
        
        // Top-right corner
        context.beginPath();
        context.moveTo(centerX + centerWidth - markerSize, centerY);
        context.lineTo(centerX + centerWidth, centerY);
        context.lineTo(centerX + centerWidth, centerY + markerSize);
        context.stroke();
        
        // Bottom-left corner
        context.beginPath();
        context.moveTo(centerX, centerY + centerHeight - markerSize);
        context.lineTo(centerX, centerY + centerHeight);
        context.lineTo(centerX + markerSize, centerY + centerHeight);
        context.stroke();
        
        // Bottom-right corner
        context.beginPath();
        context.moveTo(centerX + centerWidth - markerSize, centerY + centerHeight);
        context.lineTo(centerX + centerWidth, centerY + centerHeight);
        context.lineTo(centerX + centerWidth, centerY + centerHeight - markerSize);
        context.stroke();
      }
    }
  };
  
  // Run the frame capture animation when camera is active
  useEffect(() => {
    let animationId: number;
    
    if (isCameraActive) {
      const animate = () => {
        captureFrame();
        animationId = requestAnimationFrame(animate);
      };
      
      animationId = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isCameraActive]);
  
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
            {/* Hidden video element for capturing stream */}
            <video
              ref={videoRef}
              className="hidden"
              autoPlay
              playsInline
              muted
            />
            
            {/* Canvas for displaying modified video */}
            <canvas 
              ref={canvasRef}
              className="h-full w-full object-cover"
            />
            
            {/* Scanning status overlay */}
            {isScanning && (
              <div className="scanning-effect absolute inset-0 bg-primary bg-opacity-10 animate-pulse">
                <div className="h-1 bg-primary animate-scan-line"></div>
              </div>
            )}
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
