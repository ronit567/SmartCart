import { Minus, Plus, Image as ImageIcon } from "lucide-react";
import { CartItemWithProduct } from "@shared/schema";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";

interface CartItemProps {
  item: CartItemWithProduct;
}

export function CartItem({ item }: CartItemProps) {
  const { updateItemQuantity } = useCart();
  const { id, quantity, product } = item;

  const handleDecrease = () => {
    if (quantity > 1) {
      updateItemQuantity(id, quantity - 1);
    } else {
      updateItemQuantity(id, 0); // This will remove the item
    }
  };

  const handleIncrease = () => {
    updateItemQuantity(id, quantity + 1);
  };

  return (
    <div className="cart-item bg-white rounded-lg shadow-sm border border-gray-100 p-3">
      <div className="flex items-center">
        <div className="w-16 h-16 bg-gray-100 rounded-lg mr-3 flex items-center justify-center">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <ImageIcon className="text-gray-400" />
          )}
        </div>
        <div className="flex-grow">
          <h3 className="font-medium text-gray-800">{product.name}</h3>
          <p className="text-sm text-gray-500">${product.price.toFixed(2)} each</p>
        </div>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleDecrease}
          >
            <Minus className="h-4 w-4 text-gray-500" />
          </Button>
          <span className="quantity mx-2 w-8 text-center font-medium">{quantity}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleIncrease}
          >
            <Plus className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}
