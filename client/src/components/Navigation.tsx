import { useLocation } from "wouter";
import { 
  Home, 
  ShoppingCart, 
  CreditCard, 
  History, 
  Star, 
  MessageCircle, 
  Camera, 
  UserCircle 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  const links = [
    { path: "/", label: "Home", icon: Home },
    { path: "/scan", label: "Scan", icon: Camera },
    { path: "/cart", label: "Cart", icon: ShoppingCart },
    { path: "/order-history", label: "Orders", icon: History },
    { path: "/rewards", label: "Rewards", icon: Star },
    { path: "/ai-assistant", label: "Assistant", icon: MessageCircle },
  ];

  return (
    <nav className="py-2 bg-background border-t border-border">
      <div className="container max-w-screen-lg mx-auto">
        <ul className="flex justify-between items-center">
          {links.map((link) => {
            const IconComponent = link.icon;
            const isActive = location === link.path;
            
            return (
              <li key={link.path}>
                <button
                  onClick={() => navigate(link.path)}
                  className={cn(
                    "flex flex-col items-center px-2 py-1 text-xs rounded-md w-full",
                    isActive ? 
                      "text-primary font-medium" : 
                      "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <IconComponent className={cn(
                    "h-5 w-5 mb-1",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                  {link.label}
                </button>
              </li>
            );
          })}
          <li className="relative">
            <button 
              onClick={() => navigate("/profile")}
              className="flex flex-col items-center px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <div className="relative">
                <UserCircle className="h-5 w-5 mb-1" />
                {user && user.points > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                    <Star className="h-2 w-2 text-primary-foreground" />
                  </div>
                )}
              </div>
              Profile
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export function FloatingNavigation() {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-background/80 backdrop-blur-lg rounded-full shadow-lg border border-border">
        <Navigation />
      </div>
    </div>
  );
}

export function HeaderNav() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  return (
    <div className="flex items-center">
      <button 
        onClick={() => navigate("/rewards")}
        className="flex items-center text-sm text-indigo-900 hover:text-indigo-700 px-2 py-1 rounded-md hover:bg-indigo-100"
      >
        <Star className="h-4 w-4 inline-block mr-1 text-yellow-500" /> 
        {user?.points || 0} points
      </button>
    </div>
  );
}

interface MobileNavProps {
  onClose?: () => void;
}

export function MobileNav({ onClose = () => {} }: MobileNavProps) {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();

  const menuItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/scan", label: "Scan Items", icon: Camera },
    { path: "/cart", label: "Shopping Cart", icon: ShoppingCart },
    { path: "/rewards", label: "Rewards", icon: Star },
    { path: "/order-history", label: "Order History", icon: History },
    { path: "/ai-assistant", label: "AI Assistant", icon: MessageCircle },
    { path: "/profile", label: "My Profile", icon: UserCircle },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div>
      <div className="mb-6 p-4 bg-indigo-100 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <UserCircle className="h-5 w-5 text-indigo-700" />
          <span className="font-medium">{user?.username || 'User'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-sm">{user?.points || 0} points</span>
        </div>
      </div>

      <nav>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location === item.path;
            
            return (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "flex items-center w-full p-3 text-left text-sm rounded-md",
                    isActive 
                      ? "bg-indigo-100 text-indigo-900 font-medium" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <IconComponent className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-8 pt-4 border-t">
        <Button
          variant="ghost"
          className="flex items-center w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => {
            logoutMutation.mutate();
            onClose();
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </Button>
      </div>
    </div>
  );
}