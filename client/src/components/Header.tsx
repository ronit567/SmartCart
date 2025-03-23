import { ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";

interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  const [, navigate] = useLocation();

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
      {children}
    </header>
  );
}