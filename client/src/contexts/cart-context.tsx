import { createContext, ReactNode, useContext, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CartItemWithProduct, Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

type CartContextType = {
  cartItems: CartItemWithProduct[];
  isLoading: boolean;
  error: Error | null;
  addItemToCart: (productId: number, quantity?: number) => void;
  removeItemFromCart: (cartItemId: number) => void;
  updateItemQuantity: (cartItemId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
  isAddingItem: boolean;
};

export const CartContext = createContext<CartContextType | null>(null);

const TAX_RATE = 0.08; // 8% tax rate

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    data: cartItems = [],
    error,
    isLoading,
    refetch
  } = useQuery<CartItemWithProduct[], Error>({
    queryKey: ["/api/cart"],
    enabled: !!user, // Only fetch cart if user is logged in
  });
  
  // Refetch cart when user changes
  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  const addItemMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: number; quantity: number }) => {
      const res = await apiRequest("POST", "/api/cart", { productId, quantity });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item added",
        description: "Item has been added to your cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: number; quantity: number }) => {
      const res = await apiRequest("PATCH", `/api/cart/${cartItemId}`, { quantity });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (cartItemId: number) => {
      await apiRequest("DELETE", `/api/cart/${cartItemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to clear cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addItemToCart = (productId: number, quantity = 1) => {
    addItemMutation.mutate({ productId, quantity });
  };

  const updateItemQuantity = (cartItemId: number, quantity: number) => {
    updateItemMutation.mutate({ cartItemId, quantity });
  };

  const removeItemFromCart = (cartItemId: number) => {
    removeItemMutation.mutate(cartItemId);
  };

  const clearCart = () => {
    clearCartMutation.mutate();
  };

  // Calculate totals
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        error,
        addItemToCart,
        removeItemFromCart,
        updateItemQuantity,
        clearCart,
        totalItems,
        subtotal,
        tax,
        total,
        isAddingItem: addItemMutation.isPending,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
