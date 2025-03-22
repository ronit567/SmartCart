import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertCartItemSchema } from "@shared/schema";
import { identifyProduct } from "./anthropic";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get("/api/products/barcode/:barcode", async (req, res) => {
    try {
      const barcode = req.params.barcode;
      const product = await storage.getProductByBarcode(barcode);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product by barcode" });
    }
  });

  // Product recognition endpoint for AI camera scanning
  app.post("/api/identify-product", async (req, res) => {
    try {
      const { image } = req.body;
      
      if (!image || typeof image !== 'string') {
        return res.status(400).json({ message: "Image data is required" });
      }
      
      // Remove the data:image/jpeg;base64, prefix if present
      const base64Image = image.replace(/^data:image\/\w+;base64,/, "");
      
      try {
        // Use Anthropic's Claude to identify the product
        const result = await identifyProduct(base64Image);
        
        // Find the closest match in our product database
        const products = await storage.getAllProducts();
        
        console.log("AI identified product:", result.productName, "with confidence:", result.confidence, "isGroceryItem:", result.isGroceryItem);
        
        // Even if confidence is low, we'll still provide the name for the client to decide
        // But we'll indicate that we're not fully confident with recognized: false
        const lowConfidence = result.confidence < 0.6;
        
        // We'll continue with the match process either way, but mark low confidence ones
        // This allows the client to handle low confidence cases differently if it wants to
        
        // Find best match based on product name
        let bestMatch = null;
        let highestScore = 0;
        
        for (const product of products) {
          // Simple matching logic - check if product name contains the identified name or vice versa
          const productNameLower = product.name.toLowerCase();
          const identifiedNameLower = result.productName.toLowerCase();
          
          if (productNameLower.includes(identifiedNameLower) || 
              identifiedNameLower.includes(productNameLower)) {
            const score = Math.min(productNameLower.length, identifiedNameLower.length) / 
                         Math.max(productNameLower.length, identifiedNameLower.length);
            
            if (score > highestScore) {
              highestScore = score;
              bestMatch = product;
            }
          }
        }
        
        if (bestMatch && highestScore > 0.3) { // Reduced threshold to be more lenient
          console.log("Matched product:", bestMatch.name, "with score:", highestScore);
          return res.status(200).json({
            recognized: !lowConfidence, // Set recognized to false for low confidence matches
            product: bestMatch,
            confidence: result.confidence * highestScore,
            isGroceryItem: result.isGroceryItem,
            suggestion: result.productName, // Always provide the suggested name
          });
        }
        
        // No good match found
        return res.status(200).json({
          recognized: false,
          message: "Product not in database",
          suggestion: result.productName,
          isGroceryItem: result.isGroceryItem,
        });
      } catch (aiError) {
        console.error("AI processing error:", aiError);
        
        // If AI processing fails, let the outer catch block handle it
        throw aiError;
      }
    } catch (error) {
      console.error("Error identifying product:", error);
      return res.status(500).json({ message: "Failed to identify product" });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const cartItems = await storage.getCartItems(req.user!.id);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const validationResult = insertCartItemSchema.safeParse({
        ...req.body,
        userId: req.user!.id,
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid cart item data" });
      }
      
      const product = await storage.getProduct(validationResult.data.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const cartItem = await storage.createCartItem(validationResult.data);
      
      // Get the complete cart item with product details
      const cartItems = await storage.getCartItems(req.user!.id);
      const createdCartItemWithProduct = cartItems.find((item) => item.id === cartItem.id);
      
      res.status(201).json(createdCartItemWithProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }
      
      const { quantity } = req.body;
      if (typeof quantity !== "number" || quantity < 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const cartItem = await storage.getCartItem(id);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Check if the cart item belongs to the user
      if (cartItem.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this cart item" });
      }
      
      const updatedCartItem = await storage.updateCartItemQuantity(id, quantity);
      
      if (!updatedCartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      if (quantity === 0) {
        return res.status(200).json({ message: "Item removed from cart" });
      }
      
      // Get the complete cart item with product details
      const cartItems = await storage.getCartItems(req.user!.id);
      const updatedCartItemWithProduct = cartItems.find((item) => item.id === id);
      
      res.json(updatedCartItemWithProduct || { message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }
      
      const cartItem = await storage.getCartItem(id);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Check if the cart item belongs to the user
      if (cartItem.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this cart item" });
      }
      
      await storage.deleteCartItem(id);
      
      res.status(200).json({ message: "Cart item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete cart item" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      await storage.clearCart(req.user!.id);
      res.status(200).json({ message: "Cart cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Create server instance
  const httpServer = createServer(app);
  return httpServer;
}
