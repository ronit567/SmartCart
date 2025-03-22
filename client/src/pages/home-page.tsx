import { useState } from "react";
import { useLocation } from "wouter";
import { ShoppingCart, ArrowRight, User as UserIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ManualEntryModal } from "@/components/ManualEntryModal";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HomePage() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { cartItems, totalItems, subtotal } = useCart();
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  
  const handleProfileClick = () => {
    toast({
      title: "Profile",
      description: `Logged in as ${user?.username}`,
    });
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const handleHistoryClick = () => {
    toast({
      title: "Order History",
      description: "This feature is coming soon!",
    });
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-indigo-200 p-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center">
          <ShoppingCart className="text-indigo-700 mr-2 h-5 w-5" />
          <h1 className="text-xl font-semibold text-indigo-900">SMARTCART</h1>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="text-indigo-900 text-sm font-medium hidden sm:inline">Home</a>
          <a href="#" className="text-indigo-900 text-sm font-medium hidden sm:inline">About Us</a>
          <a href="#" className="text-indigo-900 text-sm font-medium hidden sm:inline">Mission</a>
          <a href="#" className="text-indigo-900 text-sm font-medium hidden sm:inline">Help</a>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="bg-white text-indigo-900 border-indigo-300">
                {user?.firstName || 'Account'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.firstName} {user?.lastName}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfileClick}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleHistoryClick}>
                Order History
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout} 
                className="text-destructive focus:text-destructive"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-grow flex flex-col md:flex-row items-stretch">
        {/* Left Content */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900">
            SmartCart
          </h1>
          <h2 className="text-xl md:text-2xl font-medium mb-6 text-gray-700">
            Shop Smarter, Checkout Faster!
          </h2>
          <p className="text-gray-600 mb-8 max-w-md">
            SmartCart revolutionizes grocery shopping with AI-powered detection, streamlined checkout, and seamless payment solutions — making every shopping trip efficient and hassle-free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => navigate("/scan")} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              size="lg"
            >
              Start Scanning
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              onClick={() => navigate("/cart")} 
              variant="outline" 
              size="lg"
              className="border-indigo-300"
              disabled={cartItems.length === 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              View Cart {totalItems > 0 && `(${totalItems})`}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Add conveyer belt of fruits and vegetables for best experience.
          </p>
        </div>
        
        {/* Right Image */}
        <div className="w-full md:w-1/2 bg-indigo-100 relative overflow-hidden flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-indigo-600 opacity-10 rounded-bl-[100px]"></div>
          <div className="relative max-w-sm mx-auto">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-8 border-white" style={{ maxWidth: '280px' }}>
              <div className="bg-indigo-200 p-2 text-center text-xs text-indigo-800 font-medium">
                SCANNER
              </div>
              <img 
                src="https://i.imgur.com/XUyCfPl.jpg" 
                alt="Bananas in scanner" 
                className="w-full aspect-[3/4] object-cover"
                onError={(e) => {
                  // Fallback for image loading error
                  e.currentTarget.src = "https://placehold.co/300x400/indigo/white?text=Product+Scanner";
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Manual Entry Modal */}
      <ManualEntryModal 
        open={isManualEntryOpen} 
        onOpenChange={setIsManualEntryOpen} 
      />
    </div>
  );
}
