import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { ShoppingBag, ShoppingCart, Bot, Trash2, Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CameraComponent, CameraComponentRef } from "@/components/Camera";
import { useCart } from "@/contexts/cart-context";
import { CartItem } from "@/components/CartItem";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

export default function ScanPage() {
  const [, navigate] = useLocation();
  const { cartItems, totalItems, subtotal, total, tax } = useCart();
  const [lastScannedItem, setLastScannedItem] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const cameraRef = useRef<{ stopCamera?: () => void }>(null);
  
  const handleScanSuccess = (productName: string) => {
    setLastScannedItem(productName);
  };
  
  // Mobile layout has camera on top, cart on bottom
  // Desktop layout has camera on left, cart on right
  const isDesktop = !isMobile;

  const toggleCamera = () => {
    if (isCameraOn) {
      // Reference to the camera component's stopCamera method
      if (cameraRef.current?.stopCamera) {
        cameraRef.current.stopCamera();
      }
      setIsCameraOn(false);
      toast({
        title: "Camera disabled",
        description: "Camera has been turned off",
        duration: 500, // 0.5 seconds
      });
    } else {
      setIsCameraOn(true);
      toast({
        title: "Camera enabled",
        description: "Camera is now active",
        duration: 500, // 0.5 seconds
      });
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-indigo-100">
      {/* Header */}
      <header className="bg-indigo-200 text-indigo-900 p-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center">
          <ShoppingCart className="text-indigo-900 mr-2 h-5 w-5" />
          <h1 className="text-xl font-bold">SMARTCART</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="text-indigo-900"
            onClick={toggleCamera}
          >
            {isCameraOn ? (
              <>
                <CameraOff className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Turn Off Camera</span>
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Turn On Camera</span>
              </>
            )}
          </Button>
          
          {isMobile && (
            <Button 
              variant="ghost" 
              className="text-indigo-900 relative"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 min-w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </header>
      
      {/* Main Content - Responsive Layout */}
      <div className={`flex-grow flex ${isDesktop ? 'flex-row' : 'flex-col'} overflow-hidden`}>
        {/* Camera Section */}
        <div className={`bg-indigo-900 relative ${isDesktop ? 'w-1/2' : 'h-3/5'}`}>
          <div className="absolute top-3 left-3 bg-indigo-800 text-white px-3 py-1 rounded-lg z-10">
            <h2 className="text-base font-medium">Scanner</h2>
          </div>
          {isCameraOn ? (
            <CameraComponent 
              onScanSuccess={handleScanSuccess} 
              ref={cameraRef}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white">
              <Camera className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">Camera is turned off</p>
              <p className="text-sm text-center max-w-xs text-gray-300 mb-4">
                Turn on the camera to scan your grocery items
              </p>
              <Button
                variant="outline"
                onClick={toggleCamera}
                className="border-white text-white hover:bg-indigo-800"
              >
                <Camera className="mr-2 h-4 w-4" />
                Enable Camera
              </Button>
            </div>
          )}
        </div>
        
        {/* Cart Section */}
        <div className={`bg-white ${isDesktop ? 'w-1/2' : 'h-2/5'} flex flex-col overflow-hidden`}>
          <div className="bg-white p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
          </div>
          
          {/* Cart Items */}
          <div className="flex-grow overflow-y-auto">
            {cartItems.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-4 flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-medium">{item.product.name}: {item.quantity}</div>
                    </div>
                    <div className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
                <ShoppingCart className="h-12 w-12 mb-2 opacity-20" />
                <p>Your cart is empty</p>
              </div>
            )}
          </div>
          
          {/* Cart Totals */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between text-lg font-bold mb-1">
              <span>Total:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                onClick={() => navigate("/checkout")}
                className="bg-indigo-900 hover:bg-indigo-800"
                disabled={cartItems.length === 0}
              >
                Checkout
              </Button>
            </div>
          </div>
          
          {/* AI Assistant */}
          {isDesktop && (
            <div className="p-4 border-t border-gray-200 flex items-start">
              <div className="bg-gray-200 rounded-full p-2 mr-3">
                <Bot className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1 bg-gray-100 rounded-lg p-3">
                <p className="text-gray-700">Hi! How can I help you today?</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}