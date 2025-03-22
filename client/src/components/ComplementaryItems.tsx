import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { Product } from "@shared/schema";

// Predefined sets of complementary items based on specific products
const complementaryPairings: Record<string, Product[]> = {
  "Potato Chips": [
    { id: 101, name: "Sour Cream Dip", price: 3.49, barcode: "123456789001", imageUrl: null },
    { id: 102, name: "Salsa", price: 4.29, barcode: "123456789002", imageUrl: null }
  ],
  "Bread": [
    { id: 103, name: "Strawberry Jam", price: 4.99, barcode: "123456789003", imageUrl: null },
    { id: 104, name: "Peanut Butter", price: 5.79, barcode: "123456789004", imageUrl: null }
  ],
  "Pasta": [
    { id: 105, name: "Pasta Sauce", price: 3.99, barcode: "123456789005", imageUrl: null },
    { id: 106, name: "Parmesan Cheese", price: 5.49, barcode: "123456789006", imageUrl: null }
  ],
  "Ground Beef": [
    { id: 107, name: "Taco Seasoning", price: 1.99, barcode: "123456789007", imageUrl: null },
    { id: 108, name: "Hamburger Buns", price: 3.49, barcode: "123456789008", imageUrl: null }
  ],
  "Ice Cream": [
    { id: 109, name: "Chocolate Syrup", price: 3.99, barcode: "123456789009", imageUrl: null },
    { id: 110, name: "Sprinkles", price: 2.49, barcode: "123456789010", imageUrl: null }
  ],
  "Hot Dogs": [
    { id: 111, name: "Hot Dog Buns", price: 3.29, barcode: "123456789011", imageUrl: null },
    { id: 112, name: "Ketchup", price: 2.99, barcode: "123456789012", imageUrl: null }
  ],
  "Coffee": [
    { id: 113, name: "Coffee Creamer", price: 2.99, barcode: "123456789013", imageUrl: null },
    { id: 114, name: "Sugar", price: 3.49, barcode: "123456789014", imageUrl: null }
  ],
  "Cereal": [
    { id: 115, name: "Milk", price: 3.99, barcode: "123456789015", imageUrl: null },
    { id: 116, name: "Bananas", price: 1.99, barcode: "123456789016", imageUrl: null }
  ]
};

export function ComplementaryItems() {
  const { cartItems, addItemToCart } = useCart();
  const [addedItems, setAddedItems] = useState<Record<number, boolean>>({});
  
  // Find complementary items for products in cart
  const findComplementaryItems = () => {
    const suggestedItems: Product[] = [];
    const alreadyAdded = new Set<number>();
    
    // Mark items already in cart
    cartItems.forEach(item => {
      alreadyAdded.add(item.product.id);
    });
    
    // Find complementary items
    cartItems.forEach(cartItem => {
      const productName = cartItem.product.name;
      
      // Check if we have complementary items for this product
      for (const [key, items] of Object.entries(complementaryPairings)) {
        if (productName.includes(key)) {
          // Add each complementary item if not already in cart
          items.forEach(item => {
            if (!alreadyAdded.has(item.id) && !suggestedItems.some(p => p.id === item.id)) {
              suggestedItems.push(item);
            }
          });
        }
      }
    });
    
    // Limit to top 3 suggestions
    return suggestedItems.slice(0, 3);
  };
  
  const complementaryItems = findComplementaryItems();
  
  if (complementaryItems.length === 0) {
    return null;
  }
  
  const handleAddItem = (item: Product) => {
    addItemToCart(item.id);
    setAddedItems(prev => ({...prev, [item.id]: true}));
  };
  
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Frequently Bought Together</h3>
      <div className="space-y-2">
        {complementaryItems.map(item => (
          <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
            <div>
              <p className="text-sm">{item.name}</p>
              <p className="text-xs text-gray-500">${item.price.toFixed(2)}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className={addedItems[item.id] ? "bg-green-50 text-green-600 border-green-200" : ""}
              onClick={() => handleAddItem(item)}
              disabled={addedItems[item.id]}
            >
              {addedItems[item.id] ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Added
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}