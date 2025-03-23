import { Link, useLocation } from "wouter";
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
  const [location] = useLocation();
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
                <Link href={link.path}>
                  <a 
                    className={cn(
                      "flex flex-col items-center px-2 py-1 text-xs rounded-md",
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
                  </a>
                </Link>
              </li>
            );
          })}
          <li className="relative">
            <Link href="/profile">
              <a className="flex flex-col items-center px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
                <div className="relative">
                  <UserCircle className="h-5 w-5 mb-1" />
                  {user && user.points > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                      <Star className="h-2 w-2 text-primary-foreground" />
                    </div>
                  )}
                </div>
                Profile
              </a>
            </Link>
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
  const { user, logoutMutation } = useAuth();
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-indigo-900">
        <Star className="h-4 w-4 inline-block mr-1 text-yellow-500" /> 
        {user?.points || 0} points
      </span>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => logoutMutation.mutate()} 
        className="text-indigo-900 hover:text-indigo-700 hover:bg-indigo-100"
      >
        Logout
      </Button>
    </div>
  );
}