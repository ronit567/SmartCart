import { useState } from "react";
import { useLocation } from "wouter";
import { ShoppingCart, ArrowRight, User as UserIcon, Download, Smartphone, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ManualEntryModal } from "@/components/ManualEntryModal";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
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
    navigate("/order-history");
  };
  
  return (
    <div className="h-full flex flex-col">
      <Header>
        <div className="flex items-center space-x-6">
          <a href="#" className="text-indigo-900 text-sm font-medium hidden sm:inline">Home</a>
          <a href="#" className="text-indigo-900 text-sm font-medium hidden sm:inline">AI</a>
          <a href="#" className="text-indigo-900 text-sm font-medium hidden sm:inline">About Us</a>
          <a href="#" className="text-indigo-900 text-sm font-medium hidden sm:inline">Mission</a>
          <a href="#" className="text-indigo-900 text-sm font-medium hidden sm:inline">Help</a>
          
          {/* Desktop user menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hidden sm:inline-flex">
              <Button size="sm" variant="outline" className="bg-white text-indigo-900 border-indigo-300">
                {user?.firstName || user?.username || 'Account'}
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
          
          {/* Mobile user menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="sm:hidden">
              <Button size="sm" variant="outline" className="bg-white text-indigo-900 border-indigo-300">
                {user?.firstName || user?.username || 'Menu'}
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
      </Header>

      {/* Hero Section - Matched to screenshot */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {/* Left Content */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-2 text-gray-900">
            SmartCart
          </h1>
          <h2 className="text-xl md:text-2xl font-medium mb-4 text-gray-800">
            Shop Smarter, Checkout Faster!
          </h2>
          <p className="text-gray-700 mb-8 max-w-md">
            SmartCart revolutionizes grocery shopping with AI-powered, 
            accessible, and seamless checkout solutions — making every 
            trip faster, easier, and smarter for all.
          </p>
          
          <Button 
            onClick={() => navigate("/scan")} 
            className="bg-indigo-900 hover:bg-indigo-800 text-white w-48 h-12 text-lg rounded-md mb-20 mt-4"
          >
            Start Scanning
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <p className="text-gray-600 mt-auto">
            Add conveyor belt of fruits and vegetables
          </p>
        </div>
        
        {/* Right Image - Phone Mockup */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-indigo-400 to-indigo-800 relative overflow-hidden flex items-center justify-center">
          {/* Background blobs/orbs */}
          <div className="absolute bottom-20 right-20 w-32 h-32 rounded-full bg-indigo-300 opacity-40 blur-xl"></div>
          <div className="absolute top-40 left-20 w-24 h-24 rounded-full bg-indigo-500 opacity-30 blur-xl"></div>
          
          {/* Wavy pattern (simplified) */}
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M0,50 Q25,30 50,50 T100,50 T150,50" stroke="white" strokeWidth="2" fill="none" className="animate-pulse" />
              <path d="M0,60 Q25,40 50,60 T100,60 T150,60" stroke="white" strokeWidth="1.5" fill="none" className="animate-pulse" />
              <path d="M0,70 Q25,50 50,70 T100,70 T150,70" stroke="white" strokeWidth="1" fill="none" className="animate-pulse" />
            </svg>
          </div>
          
          {/* Phone mockup */}
          <div className="relative z-10 mt-8 mb-8">
            <div className="bg-black rounded-[40px] shadow-2xl overflow-hidden border-[14px] border-black" style={{ maxWidth: '280px' }}>
              {/* Phone notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-10"></div>
              {/* Phone screen */}
              <div className="bg-indigo-100 pt-8 pb-4 relative z-0">
                {/* App UI */}
                <div className="flex justify-between items-center px-4 pb-3">
                  <Smartphone className="text-indigo-500 h-4 w-4" />
                  <div className="text-xs text-right text-indigo-500">Settings</div>
                </div>
                
                {/* Cart button */}
                <div className="mx-auto my-2 px-6 py-2 rounded-full bg-indigo-300 w-[80%] text-center text-sm font-medium text-indigo-800 flex items-center justify-center space-x-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>View Cart</span>
                </div>
                
                {/* Detected item */}
                <div className="mx-4 my-3 p-2 bg-white rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-medium">Banana Bundle - Large</div>
                    <div className="text-green-500 text-xs bg-green-50 rounded-full w-5 h-5 flex items-center justify-center">✓</div>
                  </div>
                  <div className="mt-1">
                    <img 
                      src="/bananas.jpg" 
                      alt="Bananas" 
                      className="w-full h-32 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/300x200/yellow/white?text=Bananas";
                      }}
                    />
                  </div>
                  <div className="text-xs text-center text-gray-500 mt-1">scanning...</div>
                </div>
              </div>
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
