import { useState } from "react";
import { useLocation } from "wouter";
import {
  ShoppingCart,
  ArrowRight,
  User,
  Download,
  Smartphone,
  History,
  Mic,
  Home,
  Clock,
  LogOut,
  Menu,
  Scan,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ManualEntryModal } from "@/components/ManualEntryModal";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { ChildrenGames } from "@/components/ChildrenGames";
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
        <div className="flex items-center justify-between w-full">
          {/* Main navigation - optimized for mobile */}
          <div className="hidden sm:flex items-center space-x-6">
            <a
              href="#"
              className="text-indigo-900 text-sm font-medium hover:text-indigo-700 transition-colors"
            >
              Home
            </a>
            <a
              href="#"
              className="text-indigo-900 text-sm font-medium hover:text-indigo-700 transition-colors"
            >
              AI
            </a>
            <a
              href="#"
              className="text-indigo-900 text-sm font-medium hover:text-indigo-700 transition-colors"
            >
              About Us
            </a>
            <a
              href="#"
              className="text-indigo-900 text-sm font-medium hover:text-indigo-700 transition-colors"
            >
              Mission
            </a>
            <a
              href="#"
              className="text-indigo-900 text-sm font-medium hover:text-indigo-700 transition-colors"
            >
              Help
            </a>
          </div>
          
          {/* Mobile brand label */}
          <div className="sm:hidden flex items-center">
            <span className="font-semibold text-indigo-900 text-lg">SmartCart</span>
          </div>

          {/* User menu wrapper - positioning for both mobile and desktop */}
          <div className="flex items-center space-x-2">
            {/* Cart icon with indicator */}
            <Button
              variant="ghost"
              size="icon"
              className="relative mr-1"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="h-5 w-5 text-indigo-900" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          
            {/* Desktop user menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="hidden sm:inline-flex">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white text-indigo-900 border-indigo-300 hover:bg-indigo-50"
                >
                  {user?.firstName || user?.username || "Account"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-medium">
                  {user?.firstName} {user?.lastName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleHistoryClick} className="cursor-pointer">
                  <Clock className="mr-2 h-4 w-4" />
                  Order History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
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
                  className="bg-white text-indigo-900 border-indigo-300 h-9 w-9 p-0"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="font-medium">
                  {user?.firstName} {user?.lastName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/")} className="cursor-pointer">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/scan")} className="cursor-pointer">
                  <Scan className="mr-2 h-4 w-4" />
                  Scan Items
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleHistoryClick} className="cursor-pointer">
                  <Clock className="mr-2 h-4 w-4" />
                  Order History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Header>

      {/* Hero Section - Mobile optimized */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {/* Left Content */}
        <div className="w-full md:w-1/2 px-4 sm:px-6 py-4 sm:py-6 md:p-12 flex flex-col justify-center">
          <div className="text-center md:text-left">
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-1 sm:mb-2 text-gray-900 bg-gradient-to-r from-indigo-600 to-indigo-900 bg-clip-text text-transparent">
              SmartCart
            </h1>
            <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-medium mb-2 sm:mb-3 md:mb-4 text-gray-800">
              Shop Smarter, Checkout Faster!
            </h2>
            <p className="text-gray-700 mb-4 sm:mb-6 md:mb-8 max-w-md mx-auto md:mx-0 text-xs xs:text-sm sm:text-base">
              SmartCart revolutionizes grocery shopping with AI-powered, 
              accessible, and seamless checkout solutions — making every 
              trip faster, easier, and smarter for all.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-start space-y-3">
            <Button 
              onClick={() => navigate("/scan")} 
              className="bg-indigo-900 hover:bg-indigo-800 text-white w-[90%] xs:w-full sm:w-56 h-10 sm:h-12 text-sm sm:text-lg rounded-md mt-2 sm:mt-4 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 font-medium"
            >
              Start Scanning
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            <div className="w-[90%] xs:w-full sm:w-56 mt-2">
              <ChildrenGames />
            </div>
          </div>
          
          <p className="text-gray-600 mt-auto text-center md:text-left text-xs pt-4 sm:pt-8 hidden md:block">
            Add conveyor belt of fruits and vegetables
          </p>
        </div>

        {/* Right Image - Phone Mockup */}
        <div className="w-full h-[55vh] md:h-auto md:w-1/2 bg-gradient-to-br from-indigo-400 to-indigo-800 relative overflow-hidden flex items-center justify-center">
          {/* Background blobs/orbs - Responsive positioning */}
          <div className="absolute bottom-[10%] right-[10%] w-20 sm:w-32 h-20 sm:h-32 rounded-full bg-indigo-300 opacity-40 blur-xl"></div>
          <div className="absolute top-[20%] left-[10%] w-14 sm:w-24 h-14 sm:h-24 rounded-full bg-indigo-500 opacity-30 blur-xl"></div>

          {/* Wavy pattern (simplified) - Responsive animation */}
          <div className="absolute inset-0 opacity-10">
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

          {/* Phone mockup - Smaller on mobile */}
          <div className="relative z-10 my-6 transform scale-[0.6] xs:scale-65 sm:scale-75 md:scale-90">
            <div
              className="bg-black rounded-[40px] shadow-2xl overflow-hidden border-[14px] border-black transition-all duration-500 hover:scale-105"
              style={{ maxWidth: "280px" }}
            >
              {/* Phone notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-10"></div>
              {/* Phone screen */}
              <div className="bg-indigo-100 pt-8 pb-4 relative z-0">
                {/* App UI */}
                <div className="flex justify-between items-center px-4 pb-3">
                  <Smartphone className="text-indigo-500 h-4 w-4" />
                  <div className="flex items-center">
                    <Mic className="text-indigo-500 h-4 w-4 mr-2 animate-pulse" />
                    <div className="text-xs text-right text-indigo-500">
                      Settings
                    </div>
                  </div>
                </div>

                {/* Cart button - Enhanced styling */}
                <div className="mx-auto my-2 px-6 py-2 rounded-full bg-indigo-300 hover:bg-indigo-400 cursor-pointer transition-colors duration-300 w-[80%] text-center text-sm font-medium text-indigo-800 flex items-center justify-center space-x-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>View Cart</span>
                </div>

                {/* Detected item - Enhanced visuals */}
                <div className="mx-4 my-3 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-medium">
                      Banana Bundle - Large
                    </div>
                    <div className="text-green-500 text-xs bg-green-50 rounded-full w-5 h-5 flex items-center justify-center">
                      ✓
                    </div>
                  </div>
                  <div className="mt-1">
                    <img
                      src="bananas.jpg"
                      alt="Bananas"
                      className="w-full h-28 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/300x200/yellow/white?text=Bananas";
                      }}
                    />
                  </div>
                  <div className="text-xs text-center text-gray-500 mt-1">
                    scanning...
                  </div>
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
