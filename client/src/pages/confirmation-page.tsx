import { useEffect } from "react";
import { useLocation } from "wouter";
import { Check, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { Separator } from "@/components/ui/separator";

export default function ConfirmationPage() {
  const [, navigate] = useLocation();
  const { total, clearCart } = useCart();
  
  // Generate a random order number
  const orderNumber = Math.floor(1000000 + Math.random() * 9000000);
  
  // Clear the cart when an order is confirmed
  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-success bg-opacity-10 p-6 rounded-full mb-4">
          <Check className="text-success h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
        <p className="text-gray-600 mb-6">Your order #{orderNumber} has been placed</p>
        
        <div className="bg-gray-50 rounded-lg p-4 w-full mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Total Paid</span>
            <span className="font-semibold">${total.toFixed(2)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method</span>
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-1 text-blue-500" />
              <span>•••• 4242</span>
            </div>
          </div>
        </div>
        
        <div className="w-full">
          <p className="font-medium mb-1">What's next?</p>
          <p className="text-gray-600 text-sm mb-6">
            Show your confirmation to a store associate on your way out.
          </p>
          
          <Button 
            className="w-full"
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
