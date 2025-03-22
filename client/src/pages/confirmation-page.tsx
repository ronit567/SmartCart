import { useEffect } from "react";
import { useLocation } from "wouter";
import { Check, CreditCard, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";

export default function ConfirmationPage() {
  const [, navigate] = useLocation();
  const { total, subtotal, tax, cartItems, clearCart } = useCart();
  const { toast } = useToast();
  
  // Generate a random order number
  const orderNumber = Math.floor(1000000 + Math.random() * 9000000);

  // Create an order in the database
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (cartItems.length === 0) return;
      
      await apiRequest('POST', '/api/orders', {
        total,
        subtotal,
        tax
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save order",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Create the order and clear the cart when the page loads
  useEffect(() => {
    createOrderMutation.mutate();
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
        
        <div className="w-full space-y-3">
          <p className="font-medium mb-1">What's next?</p>
          <p className="text-gray-600 text-sm">
            Show your confirmation to a store associate on your way out.
          </p>
          
          <div className="flex flex-col space-y-2">
            <Button 
              className="w-full"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/order-history")}
            >
              <Clock className="h-4 w-4 mr-2" />
              View Order History
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
