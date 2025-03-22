import { useLocation } from "wouter";
import { ArrowLeft, CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/cart-context";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ComplementaryItems } from "@/components/ComplementaryItems";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { cartItems, subtotal, tax, total } = useCart();
  const { toast } = useToast();
  
  // Create an order in the database
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (cartItems.length === 0) {
        throw new Error("Your cart is empty");
      }
      
      await apiRequest('POST', '/api/orders', {
        total,
        subtotal,
        tax
      });
    },
    onSuccess: () => {
      navigate("/confirmation");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Cannot place an order with an empty cart",
        variant: "destructive",
      });
      return;
    }
    
    createOrderMutation.mutate();
  };
  
  return (
    <div className="h-full flex flex-col bg-white">
      <header className="bg-white p-4 flex items-center shadow-sm">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-1"
          onClick={() => navigate("/cart")}
        >
          <ArrowLeft className="text-gray-600 h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Checkout</h1>
      </header>
      
      <div className="flex-grow overflow-y-auto p-4">
        <div className="space-y-6">
          <section className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-medium mb-3">Payment Method</h2>
            <RadioGroup defaultValue="card" className="space-y-3">
              <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                <RadioGroupItem value="card" id="card" className="mr-3" />
                <Label htmlFor="card" className="flex-grow">
                  <div className="flex items-center">
                    <CreditCard className="text-blue-500 mr-2 h-5 w-5" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-500">Expires 12/24</p>
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                <RadioGroupItem value="new" id="new" className="mr-3" />
                <Label htmlFor="new" className="flex-grow">
                  <div className="flex items-center">
                    <Plus className="text-gray-400 mr-2 h-5 w-5" />
                    <p>Add new payment method</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </section>
          
          <section className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium">Order Summary</h2>
              <Button 
                variant="link" 
                className="text-primary text-sm p-0"
                onClick={() => navigate("/cart")}
              >
                Edit
              </Button>
            </div>
            
            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span>
                    {item.product.name}{" "}
                    <span className="text-gray-500">x{item.quantity}</span>
                  </span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <Separator className="my-3" />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Complementary Items */}
            <ComplementaryItems />
          </section>
        </div>
      </div>
      
      <div className="border-t border-gray-200 p-4 bg-white">
        <Button 
          className="w-full"
          onClick={handlePlaceOrder}
          disabled={createOrderMutation.isPending || cartItems.length === 0}
        >
          {createOrderMutation.isPending ? "Processing..." : "Place Order"}
        </Button>
        <p className="text-xs text-center text-gray-500 mt-3">
          By placing your order, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
