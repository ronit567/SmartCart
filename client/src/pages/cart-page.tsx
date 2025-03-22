import { useLocation } from "wouter";
import { ArrowLeft, X, ShoppingBag } from "lucide-react";
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
      {/* Header - Using the indigo color from the screenshot */}
      <header className="bg-indigo-200 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-1 text-indigo-800 hover:text-indigo-900 hover:bg-indigo-300/50"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-indigo-900">Checkout</h1>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              className="text-sm text-indigo-800 hover:bg-indigo-300/50"
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
              <AlertDialogAction onClick={handleClearCart} className="bg-indigo-600 hover:bg-indigo-700">
                Clear Cart
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>
      
      {/* Main content area */}
      <div className="flex-grow overflow-y-auto p-4 bg-white">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="bg-indigo-100 p-6 rounded-full mb-4">
              <ShoppingBag className="text-indigo-400 h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">Your cart is empty</h3>
            <p className="text-gray-600 mb-4">Start scanning items to add them to your cart</p>
            <Button 
              onClick={() => navigate("/scan")}
              className="flex items-center bg-indigo-600 hover:bg-indigo-700"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Go to Scanner
            </Button>
          </div>
        ) : (
          <div>
            {/* Scanner button - similar to the screenshot */}
            <Button
              variant="outline"
              className="mb-6 text-indigo-700 border-indigo-300 hover:bg-indigo-50"
              onClick={() => navigate("/scan")}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Scanner
            </Button>
            
            {/* Cart items */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-sm text-gray-500">
                      {item.quantity} {item.quantity === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                  <div className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom checkout section */}
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
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </Button>
          
          {/* Chatbot section based on the screenshot */}
          <div className="mt-8 flex items-start gap-3">
            <div className="bg-gray-100 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-600 max-w-[80%]">
              Hi! How can I help you today?
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
