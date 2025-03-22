import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/cart-context";
import { useQuery } from "@tanstack/react-query";

const manualItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  price: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Price must be a positive number" }
  ),
  quantity: z.string().refine(
    (val) => !isNaN(parseInt(val)) && parseInt(val) > 0,
    { message: "Quantity must be a positive number" }
  ),
});

type ManualItemFormValues = z.infer<typeof manualItemSchema>;

interface ManualEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManualEntryModal({ open, onOpenChange }: ManualEntryModalProps) {
  const { addItemToCart, isAddingItem } = useCart();

  // Get products for simulation
  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const form = useForm<ManualItemFormValues>({
    resolver: zodResolver(manualItemSchema),
    defaultValues: {
      name: "",
      price: "",
      quantity: "1",
    },
  });

  const onSubmit = (data: ManualItemFormValues) => {
    // In a real app, we would create a new product first, then add it to the cart
    // For this simulation, we'll find a product with a similar name
    
    const searchTerm = data.name.toLowerCase();
    const matchingProduct = products.find(product => 
      product.name.toLowerCase().includes(searchTerm)
    );
    
    if (matchingProduct) {
      // Add existing product to cart
      addItemToCart(matchingProduct.id, parseInt(data.quantity));
    } else if (products.length > 0) {
      // If no match found, just add a random product to demonstrate functionality
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      addItemToCart(randomProduct.id, parseInt(data.quantity));
    }
    
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Item Manually</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input className="pl-8" placeholder="0.00" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isAddingItem}
            >
              {isAddingItem ? "Adding..." : "Add to Cart"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
