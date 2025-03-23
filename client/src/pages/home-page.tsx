import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  ShoppingCart,
  ArrowRight,
  User as UserIcon,
  Download,
  Smartphone,
  History,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ManualEntryModal } from "@/components/ManualEntryModal";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { ChildrenGames } from "@/components/ChildrenGames";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
  const [imageLoaded, setImageLoaded] = useState(false);

  // Preload the placeholder image
  useEffect(() => {
    const img = new Image();
    img.src = "https://placehold.co/300x200/yellow/white?text=Bananas";
    img.onload = () => setImageLoaded(true);
  }, []);

  const handleProfileClick = () => {
    toast({
      title: "Profile",
      description: `Logged in as ${user?.username}`,
      duration: 1000,
    });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleHistoryClick = () => {
    navigate("/order-history");
  };
  
  const handleHelpClick = () => {
    // Navigate to the AI chatbot
    navigate("/ai-assistant");
    toast({
      title: "SmartCart AI Assistant",
      description: "How can I help you today?",
      duration: 1000,
    });
  };

  const handleStartScanning = () => {
    navigate("/scan");
    toast({
      title: "Camera Activated",
      description: "Scan your items by pointing the camera at them",
      duration: 1000,
    });
  };

  return (
    <div className="h-full flex flex-col">
      <Header>
        <div className="flex items-center space-x-6">
          <a
            onClick={handleHelpClick}
            className="text-indigo-900 text-sm font-medium cursor-pointer"
          >
            Help
          </a>

          {/* Desktop user menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hidden sm:inline-flex">
              <Button
                size="sm"
                variant="outline"
                className="bg-white text-indigo-900 border-indigo-300"
              >
                {user?.firstName || user?.username || "Account"}
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
              <DropdownMenuItem onClick={handleHelpClick}>
                <span className="text-indigo-600 font-medium">Help</span>
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
              <Button
                size="sm"
                variant="outline"
                className="bg-white text-indigo-900 border-indigo-300"
              >
                {user?.firstName || user?.username || "Menu"}
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
              <DropdownMenuItem onClick={handleHelpClick}>
                <span className="text-indigo-600 font-medium">Help</span>
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
        <div className="w-full md:w-1/2 px-6 py-6 md:p-12 flex flex-col justify-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-2 text-gray-900 bg-gradient-to-r from-indigo-600 to-indigo-900 bg-clip-text text-transparent">
              SmartCart
            </h1>
            <h2 className="text-lg sm:text-xl md:text-2xl font-medium mb-3 md:mb-4 text-gray-800">
              Shop Smarter, Checkout Faster!
            </h2>
            <p className="text-gray-700 mb-6 md:mb-8 max-w-md mx-auto md:mx-0 text-sm sm:text-base">
              SmartCart revolutionizes grocery shopping with AI-powered, 
              accessible, and seamless checkout solutions — making every 
              trip faster, easier, and smarter for all.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-start space-y-3">
            <Button 
              onClick={handleStartScanning} 
              className="bg-indigo-900 hover:bg-indigo-800 text-white w-full sm:w-56 h-12 text-lg rounded-md mt-4 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              Start Scanning
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <div className="w-full sm:w-56">
              <ChildrenGames />
            </div>
          </div>
          
          <p className="text-gray-600 mt-auto text-center md:text-left text-xs pt-8 hidden md:block">
            Add conveyor belt of fruits and vegetables
          </p>
        </div>

        {/* Right Image - Phone Mockup */}
        <div className="w-full h-[50vh] md:h-auto md:w-1/2 bg-gradient-to-br from-indigo-400 to-indigo-800 relative overflow-hidden flex items-center justify-center">
          {/* Background blobs/orbs - Responsive positioning */}
          <div className="absolute bottom-[10%] right-[10%] w-16 sm:w-24 h-16 sm:h-24 rounded-full bg-indigo-300 opacity-40 blur-xl"></div>
          <div className="absolute top-[20%] left-[10%] w-12 sm:w-20 h-12 sm:h-20 rounded-full bg-indigo-500 opacity-30 blur-xl"></div>

          {/* Wavy pattern (simplified) - Responsive animation */}
          <div className="absolute inset-0 opacity-10 hidden sm:block">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d="M0,50 Q25,30 50,50 T100,50 T150,50"
                stroke="white"
                strokeWidth="2"
                fill="none"
                className="animate-pulse"
              />
              <path
                d="M0,60 Q25,40 50,60 T100,60 T150,60"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
                className="animate-pulse"
              />
              <path
                d="M0,70 Q25,50 50,70 T100,70 T150,70"
                stroke="white"
                strokeWidth="1"
                fill="none"
                className="animate-pulse"
              />
            </svg>
          </div>

          {/* Phone mockup - Responsive sizing with enhanced user experience */}
          <div 
            className="relative z-10 my-4 transform scale-[0.6] xs:scale-[0.7] sm:scale-[0.8] md:scale-90 lg:scale-100 cursor-pointer"
            onClick={handleStartScanning}
          >
            <div
              className="bg-black rounded-[40px] shadow-2xl overflow-hidden border-[14px] border-black transition-all duration-500 hover:scale-105 relative"
              style={{ width: "280px", height: "560px" }}
            >
              {/* Status bar */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-black flex justify-between items-center px-6 z-20">
                <div className="text-white text-[8px]">2:18 PM</div>
                <div className="flex items-center space-x-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                </div>
              </div>
              
              {/* Phone notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-10"></div>
              
              {/* Phone screen */}
              <div className="bg-indigo-100 pt-8 pb-2 relative z-0 h-[510px] flex flex-col">
                {/* App UI */}
                <div className="flex justify-between items-center px-3 pb-2">
                  <div className="flex items-center">
                    <Smartphone className="text-indigo-500 h-3 w-3" />
                    <span className="text-[10px] ml-1 text-indigo-500">SmartCart</span>
                  </div>
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent parent onClick from triggering
                      handleHelpClick();
                    }}
                  >
                    <Mic className="text-indigo-500 h-3 w-3 mr-1 animate-pulse" />
                    <div className="text-[10px] text-right text-indigo-500">
                      Help
                    </div>
                  </div>
                </div>

                {/* Cart button - Enhanced styling */}
                <div className="mx-auto my-1 px-3 py-1 rounded-full bg-indigo-300 hover:bg-indigo-400 cursor-pointer transition-colors duration-300 w-[75%] text-center text-[10px] font-medium text-indigo-800 flex items-center justify-center space-x-1">
                  <ShoppingCart className="h-2.5 w-2.5" />
                  <span>View Cart ({totalItems || 0})</span>
                </div>

                {/* Detected item - Enhanced visuals */}
                <div className="mx-3 my-1.5 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex-grow">
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] font-medium">
                      Banana Bundle - Large
                    </div>
                    <div className="text-green-500 text-[8px] bg-green-50 rounded-full w-4 h-4 flex items-center justify-center">
                      ✓
                    </div>
                  </div>
                  <div className="mt-1 relative overflow-hidden rounded-md">
                    <img
                      src="bananas.jpg"
                      alt="Bananas"
                      className="w-full h-48 object-cover rounded-md transition-transform duration-700 hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/300x200/yellow/white?text=Bananas";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <div className="text-[10px] text-indigo-500 font-medium">$2.99</div>
                    <div className="text-[10px] text-gray-500 flex items-center">
                      <span className="animate-pulse">scanning</span>
                      <span className="animate-[pulse_1.5s_ease-in-out_infinite_0.2s]">.</span>
                      <span className="animate-[pulse_1.5s_ease-in-out_infinite_0.4s]">.</span>
                      <span className="animate-[pulse_1.5s_ease-in-out_infinite_0.6s]">.</span>
                    </div>
                  </div>
                </div>
                
                {/* Other products */}
                <div className="px-3 py-1">
                  <div className="text-[10px] font-medium text-indigo-600">Recommended Items:</div>
                  <div className="flex space-x-2 mt-1 overflow-x-auto pb-1">
                    <div className="flex-shrink-0 w-14 text-center">
                      <div className="h-14 w-14 bg-white rounded-md shadow-sm flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-indigo-300" />
                      </div>
                      <div className="text-[8px] mt-0.5">Apple</div>
                    </div>
                    <div className="flex-shrink-0 w-14 text-center">
                      <div className="h-14 w-14 bg-white rounded-md shadow-sm flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-indigo-300" />
                      </div>
                      <div className="text-[8px] mt-0.5">Bread</div>
                    </div>
                    <div className="flex-shrink-0 w-14 text-center">
                      <div className="h-14 w-14 bg-white rounded-md shadow-sm flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-indigo-300" />
                      </div>
                      <div className="text-[8px] mt-0.5">Milk</div>
                    </div>
                  </div>
                </div>
                
                {/* Touch to scan hint */}
                <div className="text-[10px] text-center text-indigo-600 mt-auto mb-1 animate-pulse font-medium">
                  Tap to try SmartCart!
                </div>
              </div>
            </div>
            
            {/* Phone buttons */}
            <div className="absolute right-0 top-1/4 w-1 h-8 bg-gray-800 rounded-l-lg"></div>
            <div className="absolute left-0 top-1/4 w-1 h-10 bg-gray-800 rounded-r-lg"></div>
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