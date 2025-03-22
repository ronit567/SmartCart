import { useState } from "react";
import { useLocation } from "wouter";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CameraComponent } from "@/components/Camera";
import { useCart } from "@/contexts/cart-context";

export default function ScanPage() {
  const [, navigate] = useLocation();
  const { totalItems, subtotal } = useCart();
  const [lastScannedItem, setLastScannedItem] = useState<string | null>(null);
  
  const handleScanSuccess = (productName: string) => {
    setLastScannedItem(productName);
  };
  
  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-primary text-white p-3 flex justify-between items-center">
        <div className="flex items-center">
          <ShoppingBag className="text-white mr-2 h-5 w-5" />
          <h1 className="text-xl font-semibold">Scanner</h1>
        </div>
        
        <Button 
          variant="ghost" 
          className="text-white relative"
          onClick={() => navigate("/cart")}
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge variant="secondary" className="absolute -top-2 -right-2 min-w-5 h-5 flex items-center justify-center">
              {totalItems}
            </Badge>
          )}
        </Button>
      </header>
      
      {/* Main Camera Area */}
      <div className="flex-grow relative">
        <CameraComponent onScanSuccess={handleScanSuccess} />
      </div>
      
      {/* Footer with cart summary */}
      <div className="bg-white p-3 border-t flex justify-between items-center">
        <div>
          <div className="text-xs text-gray-500">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in cart
          </div>
          <div className="font-semibold">${subtotal.toFixed(2)}</div>
        </div>
        
        <Button 
          onClick={() => navigate("/cart")}
          className="flex items-center"
          variant="default"
        >
          View Cart
          <ShoppingCart className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}