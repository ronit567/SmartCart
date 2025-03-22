import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Camera, CameraOff, ShoppingBasket, AlertCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/cart-context";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CameraComponentProps {
  onScanSuccess?: (productName: string) => void;
}

// Export the interface for use in parent components
export interface CameraComponentRef {
  stopCamera: () => void;
}

export const CameraComponent = forwardRef<CameraComponentRef, CameraComponentProps>(
  ({ onScanSuccess }, ref) => {
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<{ success: boolean; productName?: string }>({ success: false });
    const [lastScannedProducts, setLastScannedProducts] = useState<string[]>([]);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [nonGroceryItem, setNonGroceryItem] = useState<{name: string, productId: number | null, suggestion: string} | null>(null);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    
    const { toast } = useToast();
    const { addItemToCart, isAddingItem } = useCart();
    
    // Stop camera function
    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setIsCameraActive(false);
      }
    };
    
    // Expose the stopCamera method to the parent component through the ref
    useImperativeHandle(ref, () => ({
      stopCamera
    }), []);
    
    // Fetch all products to simulate product recognition
    const { data: products = [] } = useQuery<any[]>({
      queryKey: ["/api/products"],
    });
    
    // Function to access camera and set up video
    const setupCamera = async () => {
      try {
        // Check if camera API is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported in this browser");
        }
        
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        // Store the stream reference
        streamRef.current = stream;
        
        // Find video element and attach stream
        const videoElement = document.getElementById('camera-video') as HTMLVideoElement;
        if (!videoElement) {
          throw new Error("Video element not found in DOM");
        }
        
        videoElement.srcObject = stream;
        
        // Wait for video to be ready
        return new Promise<void>((resolve) => {
          videoElement.onloadedmetadata = () => {
            videoElement.play()
              .then(() => {
                console.log("Camera is active and video is playing");
                resolve();
              })
              .catch(err => {
                console.error("Error playing video:", err);
                throw err;
              });
          };
        });
      } catch (error) {
        console.error("Camera setup error:", error);
        throw error;
      }
    };
    
    // Camera enable function that the user triggers
    const enableCamera = async () => {
      try {
        console.log("Enabling camera...");
        
        // Set camera active state - this renders the video element
        setIsCameraActive(true);
        
        // Wait a moment for the video element to be in the DOM
        setTimeout(async () => {
          try {
            await setupCamera();
            console.log("Camera setup complete!");
          } catch (error) {
            console.error("Error in camera setup:", error);
            setIsCameraActive(false);
            toast({
              title: "Camera Error",
              description: "Could not access the camera. Please check permissions.",
              variant: "destructive",
              duration: 500, // 0.5 seconds
            });
          }
        }, 500);
      } catch (error) {
        console.error("Fatal camera error:", error);
        setIsCameraActive(false);
        toast({
          title: "Camera Error",
          description: "Could not access the camera. Please check permissions.",
          variant: "destructive",
          duration: 500, // 0.5 seconds
        });
      }
    };
    
    // Cleanup on unmount
    useEffect(() => {
      return () => {
        stopCamera();
      };
    }, []);
  
    // Capture and optimize the camera frame for processing
    const captureImageForProcessing = () => {
      if (videoRef.current && streamRef.current) {
        const video = videoRef.current;
        
        // Create a temporary canvas to capture the frame
        const canvas = document.createElement('canvas');
        
        // Reduce the image size to optimize for API transfer
        const maxWidth = 640;
        const maxHeight = 480;
        
        // Calculate scaled dimensions while maintaining aspect ratio
        let width = video.videoWidth || 640;
        let height = video.videoHeight || 480;
        
        if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
        }
        
        if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
        }
        
        // Set canvas dimensions to the optimized size
        canvas.width = width;
        canvas.height = height;
        
        const context = canvas.getContext('2d');
        if (context) {
          // Draw the current video frame to the canvas at the reduced size
          context.drawImage(video, 0, 0, width, height);
          
          // Return the data URL with reduced quality to minimize payload size
          return canvas.toDataURL('image/jpeg', 0.7); // 0.7 quality (70%)
        }
      }
      return null;
    };
    
    // Define the product identification mutation
    const identifyMutation = useMutation({
      mutationFn: async (imageData: string) => {
        const response = await apiRequest('POST', '/api/identify-product', { image: imageData });
        return response.json();
      },
      onError: (error) => {
        console.error('Product identification failed:', error);
        toast({
          title: 'Identification Error',
          description: 'Could not analyze the image. Please try again.',
          variant: 'destructive',
          duration: 500, // 0.5 seconds
        });
        setIsScanning(false);
      }
    });
  
    // Confirmation handler for non-grocery items
    const handleAddNonGroceryItem = () => {
      if (nonGroceryItem && nonGroceryItem.productId) {
        // Add the item to cart
        addItemToCart(nonGroceryItem.productId);
        
        // Update scan result
        setScanResult({ 
          success: true,
          productName: nonGroceryItem.name
        });
        
        // Keep track of last 3 scanned products
        setLastScannedProducts(prev => {
          const updated = [nonGroceryItem.name, ...prev].slice(0, 3);
          return updated;
        });
        
        if (onScanSuccess) {
          onScanSuccess(nonGroceryItem.name);
        }
        
        // Play success sound
        try {
          const successSound = new Audio('/success-chime.mp3');
          successSound.volume = 0.2;
          successSound.play().catch(err => console.log('Audio play failed, continuing without sound'));
        } catch (error) {
          console.log('Audio not supported, continuing without sound');
        }
      }
      
      // Close dialog and reset
      setShowConfirmDialog(false);
      setNonGroceryItem(null);
    };
  
    // Cancel handler for non-grocery items
    const handleCancelNonGroceryItem = () => {
      setShowConfirmDialog(false);
      setNonGroceryItem(null);
      
      // Show feedback toast
      toast({
        title: 'Item Not Added',
        description: 'The item was not added to your cart.',
        variant: 'default',
        duration: 500, // 0.5 seconds
      });
    };
  
    // Actual scan product function using AI recognition
    const scanProduct = async () => {
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
      
      try {
        // Capture the current video frame as an image
        const imageData = captureImageForProcessing();
        if (!imageData) {
          throw new Error('Failed to capture image from camera');
        }
        
        // Send the image to the API for analysis
        const result = await identifyMutation.mutateAsync(imageData);
        
        // First check if it's recognized as a grocery item
        if (result.recognized && result.product) {
          // Check if it's a grocery item
          if (result.isGroceryItem) {
            // Add the identified product to the cart
            addItemToCart(result.product.id);
            
            // Update scan result and last scanned products
            setScanResult({ 
              success: true,
              productName: result.product.name
            });
            
            // Keep track of last 3 scanned products
            setLastScannedProducts(prev => {
              const updated = [result.product.name, ...prev].slice(0, 3);
              return updated;
            });
            
            if (onScanSuccess) {
              onScanSuccess(result.product.name);
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
            // It's recognized but not a grocery item - ask for confirmation
            setNonGroceryItem({
              name: result.product.name,
              productId: result.product.id,
              suggestion: result.suggestion || "non-grocery item"
            });
            setShowConfirmDialog(true);
            
            // Play alert sound
            try {
              const alertSound = new Audio('/alert-tone.mp3');
              alertSound.volume = 0.2;
              alertSound.play().catch(err => console.log('Audio play failed, continuing without sound'));
            } catch (error) {
              console.log('Audio not supported, continuing without sound');
            }
          }
        } else {
          // Product not recognized with confidence but add anyway if there's a suggestion
          if (result.suggestion) {
            // Find the closest match in products based on the suggestion
            let bestMatch = null;
            let highestScore = 0;
            
            for (const product of products) {
              // Simple matching logic - check if product name contains the suggested name or vice versa
              const productNameLower = product.name.toLowerCase();
              const suggestionLower = result.suggestion.toLowerCase();
              
              if (productNameLower.includes(suggestionLower) || 
                  suggestionLower.includes(productNameLower)) {
                const score = Math.min(productNameLower.length, suggestionLower.length) / 
                            Math.max(productNameLower.length, suggestionLower.length);
                
                if (score > highestScore) {
                  highestScore = score;
                  bestMatch = product;
                }
              }
            }
            
            if (bestMatch) {
              // Add the suggested product to the cart
              addItemToCart(bestMatch.id);
              
              // Update scan result
              setScanResult({ 
                success: true,
                productName: bestMatch.name
              });
              
              // Keep track of last 3 scanned products
              setLastScannedProducts(prev => {
                const updated = [bestMatch.name, ...prev].slice(0, 3);
                return updated;
              });
              
              if (onScanSuccess) {
                onScanSuccess(bestMatch.name);
              }
              
              // Show toast that we added the suggested item
              toast({
                title: 'Added Suggested Item',
                description: `Added ${bestMatch.name} to your cart based on our best guess.`,
                variant: 'default',
                duration: 500, // 0.5 seconds
              });
              
              // Play success sound
              try {
                const successSound = new Audio('/success-chime.mp3');
                successSound.volume = 0.2;
                successSound.play().catch(err => console.log('Audio play failed, continuing without sound'));
              } catch (error) {
                console.log('Audio not supported, continuing without sound');
              }
            } else {
              // Could not match any product
              setScanResult({ success: false });
              
              toast({
                title: 'Product Not Found',
                description: `Could not find "${result.suggestion}" in our database.`,
                variant: 'destructive',
                duration: 500, // 0.5 seconds
              });
              
              // Play error sound
              try {
                const errorSound = new Audio('/error-beep.mp3');
                errorSound.volume = 0.2;
                errorSound.play().catch(err => console.log('Audio play failed, continuing without sound'));
              } catch (error) {
                console.log('Audio not supported, continuing without sound');
              }
            }
          } else {
            // No suggestion available
            setScanResult({ success: false });
            
            toast({
              title: 'Product Not Recognized',
              description: 'Unable to identify this item. Please try again.',
              variant: 'destructive',
              duration: 500, // 0.5 seconds
            });
            
            // Play error sound
            try {
              const errorSound = new Audio('/error-beep.mp3');
              errorSound.volume = 0.2;
              errorSound.play().catch(err => console.log('Audio play failed, continuing without sound'));
            } catch (error) {
              console.log('Audio not supported, continuing without sound');
            }
          }
        }
      } catch (error) {
        console.error('Error during scan:', error);
        toast({
          title: 'Scan Failed',
          description: 'Could not complete the scan. Please try again.',
          variant: 'destructive',
          duration: 500, // 0.5 seconds
        });
      } finally {
        setIsScanning(false);
      }
    };
    
    return (
      <div className="flex flex-col h-full">
        {/* Non-grocery item confirmation dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-amber-500" />
                Non-grocery Item Detected
              </AlertDialogTitle>
              <AlertDialogDescription>
                {nonGroceryItem ? (
                  <>
                    <p className="mb-2">
                      This appears to be <span className="font-semibold">{nonGroceryItem.name}</span>, which doesn't look like a typical grocery item.
                    </p>
                    <p>Would you still like to add it to your cart?</p>
                  </>
                ) : (
                  <p>This doesn't appear to be a typical grocery item. Would you still like to add it to your cart?</p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelNonGroceryItem}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleAddNonGroceryItem}>
                Add To Cart
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
              {/* Video element for direct display with both ID and ref */}
              <video
                id="camera-video"
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
                  Scan Item
                </span>
              )}
            </Button>
          )}
          
          {/* Product history */}
          {lastScannedProducts.length > 0 && (
            <div className="mt-3 overflow-hidden">
              <div className="text-white/50 text-xs mb-1">Recently scanned:</div>
              <div className="flex flex-wrap">
                {lastScannedProducts.map((product, index) => (
                  <div key={index} className="text-white/70 text-xs mr-2 mb-1">
                    ✓ {product}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);