import { ShoppingCart, Menu, X } from "lucide-react";
import { useLocation } from "wouter";
import { HeaderNav, MobileNav } from "./Navigation";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  const [, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const goToHomePage = () => {
    navigate("/");
  };

  return (
    <header className="bg-indigo-200 py-2 px-4 flex justify-between items-center shadow-sm">
      <div 
        className="flex items-center cursor-pointer" 
        onClick={goToHomePage}
        role="button"
        tabIndex={0}
        aria-label="Go to home page"
      >
        <ShoppingCart className="text-indigo-900 mr-2 h-5 w-5" />
        <h1 className="text-xl font-bold text-indigo-900">SMARTCART</h1>
      </div>
      
      {/* Header Content (if provided) */}
      {children && (
        <div className="flex items-center">
          {children}
        </div>
      )}
      
      {/* Quick Navigation (for both desktop and mobile) */}
      {!children && (
        <div className="flex items-center">
          {/* Points display always visible */}
          <HeaderNav />
          
          {/* Menu button (for both desktop and mobile) */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2 text-indigo-900">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white p-0">
              <div className="p-4">
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
                <div className="mt-8">
                  <MobileNav onClose={() => setMenuOpen(false)} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </header>
  );
}