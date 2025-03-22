import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@shared/schema";
import { useCart } from "@/contexts/cart-context";
import { Loader2, Plus } from "lucide-react";

interface ComplementaryProduct {
  product: Product;
  reason: string;
}

/**
 * Finds complementary products based on cart items
 * For example, if cart has chips, suggests salsa or dip
 */
export function ComplementaryItems() {
  const { cartItems, addItemToCart, isAddingItem } = useCart();
  const [complementaryProducts, setComplementaryProducts] = useState<ComplementaryProduct[]>([]);

  // Fetch all products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  useEffect(() => {
    if (!products.length || !cartItems.length) {
      setComplementaryProducts([]);
      return;
    }

    // Define product complementary relationships
    const complementaryPairs = [
      // Chips and dips
      { 
        category: 'chips', 
        keywords: ['chips', 'tortilla chips', 'corn chips', 'potato chips', 'nachos'],
        complementary: 'dip', 
        complementaryKeywords: ['salsa', 'guacamole', 'dip', 'hummus', 'queso'],
        reason: 'Great with your chips!'
      },
      // Pasta and sauce
      { 
        category: 'pasta', 
        keywords: ['pasta', 'spaghetti', 'penne', 'linguine', 'fettuccine', 'macaroni'],
        complementary: 'pasta sauce', 
        complementaryKeywords: ['pasta sauce', 'marinara', 'alfredo', 'tomato sauce', 'pesto'],
        reason: 'Perfect sauce for your pasta!'
      },
      // Bread and spreads
      { 
        category: 'bread', 
        keywords: ['bread', 'bagel', 'toast', 'baguette', 'roll', 'loaf'],
        complementary: 'spread', 
        complementaryKeywords: ['butter', 'jam', 'jelly', 'peanut butter', 'nutella', 'honey'],
        reason: 'Delicious on your bread!'
      },
      // Crackers and cheese
      { 
        category: 'crackers', 
        keywords: ['crackers', 'ritz', 'wheat thins', 'water crackers', 'rice crackers'],
        complementary: 'cheese', 
        complementaryKeywords: ['cheese', 'cheddar', 'brie', 'cream cheese', 'swiss', 'gouda'],
        reason: 'Perfect cheese pairing!'
      },
      // Coffee and creamer/sweetener
      { 
        category: 'coffee', 
        keywords: ['coffee', 'espresso', 'coffee beans', 'ground coffee'],
        complementary: 'coffee additions', 
        complementaryKeywords: ['creamer', 'milk', 'half and half', 'sugar', 'sweetener'],
        reason: 'For your coffee!'
      },
      // Ice cream and toppings
      { 
        category: 'ice cream', 
        keywords: ['ice cream', 'gelato', 'frozen yogurt', 'sorbet'],
        complementary: 'ice cream toppings', 
        complementaryKeywords: ['chocolate syrup', 'caramel sauce', 'sprinkles', 'whipped cream', 'fudge'],
        reason: 'Top your ice cream!'
      },
      // Cereal and milk
      { 
        category: 'cereal', 
        keywords: ['cereal', 'granola', 'oatmeal'],
        complementary: 'milk', 
        complementaryKeywords: ['milk', 'almond milk', 'soy milk', 'oat milk', 'coconut milk'],
        reason: 'Don\'t forget the milk!'
      },
      // Cookies and milk
      { 
        category: 'cookies', 
        keywords: ['cookies', 'oreos', 'chocolate chip', 'biscuits'],
        complementary: 'milk', 
        complementaryKeywords: ['milk', 'chocolate milk', 'almond milk'],
        reason: 'Perfect with your cookies!'
      },
      // Burgers and condiments
      { 
        category: 'burger', 
        keywords: ['burger', 'patties', 'ground beef', 'burger buns', 'hamburger'],
        complementary: 'condiments', 
        complementaryKeywords: ['ketchup', 'mustard', 'mayonnaise', 'relish', 'pickles'],
        reason: 'For your burger!'
      }
    ];
    
    const suggestions = new Map<number, ComplementaryProduct>();
    const alreadyInCartIds = new Set(cartItems.map(item => item.product.id));
    
    // Find what's in the cart and suggest complementary items
    for (const cartItem of cartItems) {
      const productName = cartItem.product.name.toLowerCase();
      
      for (const pair of complementaryPairs) {
        // Check if cart item matches any keyword
        const keywordMatch = pair.keywords.some(keyword => 
          productName.includes(keyword.toLowerCase())
        );
        
        if (keywordMatch) {
          // Find complementary products that match this pair
          const matchingProducts = products.filter(product => {
            const name = product.name.toLowerCase();
            return pair.complementaryKeywords.some(keyword => 
              name.includes(keyword.toLowerCase())
            ) && !alreadyInCartIds.has(product.id);
          });
          
          // Add up to 2 random matching products to suggestions
          const selectedProducts = matchingProducts
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);
            
          for (const product of selectedProducts) {
            if (!suggestions.has(product.id)) {
              suggestions.set(product.id, {
                product,
                reason: pair.reason
              });
            }
          }
        }
      }
    }
    
    // Convert map to array and take just 3 suggestions
    const finalSuggestions = Array.from(suggestions.values())
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
      
    setComplementaryProducts(finalSuggestions);
  }, [cartItems, products]);

  // No suggestions if cart is empty or no matching products
  if (cartItems.length === 0 || complementaryProducts.length === 0) {
    return null;
  }

  const handleAddItem = (product: Product) => {
    addItemToCart(product.id, 1);
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">You Might Also Want...</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {complementaryProducts.map(({ product, reason }) => (
          <Card key={product.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground mb-2">{reason}</p>
              <p className="font-medium">${product.price.toFixed(2)}</p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                onClick={() => handleAddItem(product)} 
                className="w-full"
                variant="outline"
                disabled={isAddingItem}
              >
                {isAddingItem ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}