import { useLocation } from "wouter";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/components/CartItem";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function CartPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { 
    cartItems, 
    isLoading, 
    subtotal, 
    tax, 
    total,
    clearCart 
  } = useCart();
  
  const handleClearCart = () => {
    clearCart();
  };
  
  return (
    <div className="h-full flex flex-col bg-white">
      <header className="bg-white p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-1"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="text-gray-600 h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Your Cart</h1>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              className="text-sm text-gray-600"
              disabled={cartItems.length === 0}
            >
              Clear All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all items from your cart. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearCart}>
                Clear Cart
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>
      
      <div className="flex-grow overflow-y-auto p-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <X className="text-gray-400 h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">Your cart is empty</h3>
            <p className="text-gray-600 mb-4">Start scanning items to add them to your cart</p>
            <Button 
              onClick={() => navigate("/")}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Scanning
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
      
      {cartItems.length > 0 && (
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-semibold text-lg">${total.toFixed(2)}</span>
            </div>
          </div>
          
          <Button 
            className="w-full"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </Button>
        </div>
      )}
    </div>
  );
}
