import { useState } from "react";
import { useLocation } from "wouter";
import { ShoppingCart, History, User as UserIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CameraComponent } from "@/components/Camera";
import { ManualEntryModal } from "@/components/ManualEntryModal";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";

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
      <header className="bg-white p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center">
          <ShoppingCart className="text-primary mr-2 h-5 w-5" />
          <h1 className="text-xl font-semibold">ScanGo</h1>
        </div>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={handleHistoryClick}
          >
            <History className="text-gray-600 h-5 w-5" />
          </Button>
          <div className="relative ml-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={handleProfileClick}
            >
              <UserIcon className="text-gray-600 h-5 w-5" />
            </Button>
            <div className="absolute top-10 right-0 w-48 bg-white shadow-lg rounded-md p-2 hidden group-hover:block">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Camera View */}
      <CameraComponent />
      
      {/* Bottom Bar */}
      <div className="bg-white p-4 shadow-lg border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Cart Total</p>
            <p className="text-xl font-semibold">${subtotal.toFixed(2)}</p>
          </div>
          <div className="flex">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full mr-3"
              onClick={() => setIsManualEntryOpen(true)}
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button 
              variant="default" 
              className="px-5"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              <span>{totalItems} items</span>
            </Button>
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
