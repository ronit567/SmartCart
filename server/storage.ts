import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  cartItems, type CartItem, type InsertCartItem, type CartItemWithProduct
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItemWithProduct[]>;
  getCartItem(id: number): Promise<CartItem | undefined>;
  createCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  deleteCartItem(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  sessionStore: session.SessionStore;
  
  private currentUserId: number;
  private currentProductId: number;
  private currentCartItemId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentCartItemId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24h
    });
    
    // Initialize with demo products
    this.initializeProducts();
  }

  private initializeProducts(): void {
    const demoProducts: InsertProduct[] = [
      // Produce
      { name: 'Organic Banana', price: 0.99, barcode: '12345', imageUrl: '' },
      { name: 'Organic Avocado', price: 1.99, barcode: '45678', imageUrl: '' },
      { name: 'Green Bell Pepper', price: 0.79, barcode: '67890', imageUrl: '' },
      { name: 'Red Apple', price: 1.29, barcode: '10001', imageUrl: '' },
      { name: 'Broccoli', price: 2.99, barcode: '10002', imageUrl: '' },
      { name: 'Spinach', price: 2.49, barcode: '10003', imageUrl: '' },
      { name: 'Tomato', price: 0.69, barcode: '10004', imageUrl: '' },
      { name: 'Cucumber', price: 0.99, barcode: '10005', imageUrl: '' },
      
      // Dairy
      { name: 'Whole Milk', price: 3.49, barcode: '23456', imageUrl: '' },
      { name: 'Natural Yogurt', price: 3.29, barcode: '78901', imageUrl: '' },
      { name: 'Free Range Eggs', price: 5.99, barcode: '56789', imageUrl: '' },
      { name: 'Cheddar Cheese', price: 4.99, barcode: '10006', imageUrl: '' },
      { name: 'Greek Yogurt', price: 3.99, barcode: '10007', imageUrl: '' },
      { name: 'Butter', price: 3.49, barcode: '10008', imageUrl: '' },
      { name: 'Sour Cream', price: 2.49, barcode: '10009', imageUrl: '' },
      
      // Bakery
      { name: 'Whole Wheat Bread', price: 4.29, barcode: '34567', imageUrl: '' },
      { name: 'White Bread', price: 3.99, barcode: '10010', imageUrl: '' },
      { name: 'Bagels', price: 4.99, barcode: '10011', imageUrl: '' },
      { name: 'Croissants', price: 5.99, barcode: '10012', imageUrl: '' },
      { name: 'Muffins', price: 4.49, barcode: '10013', imageUrl: '' },
      
      // Meat & Seafood
      { name: 'Chicken Breast', price: 8.99, barcode: '89012', imageUrl: '' },
      { name: 'Ground Beef', price: 7.99, barcode: '10014', imageUrl: '' },
      { name: 'Salmon Fillet', price: 12.99, barcode: '10015', imageUrl: '' },
      { name: 'Pork Chops', price: 9.99, barcode: '10016', imageUrl: '' },
      { name: 'Bacon', price: 6.99, barcode: '10017', imageUrl: '' },
      
      // Beverages
      { name: 'Coca-Cola', price: 1.79, barcode: '10018', imageUrl: '' },
      { name: 'Diet Coke', price: 1.79, barcode: '10019', imageUrl: '' },
      { name: 'Pepsi', price: 1.79, barcode: '10020', imageUrl: '' },
      { name: 'Orange Juice', price: 3.99, barcode: '10021', imageUrl: '' },
      { name: 'Bottled Water', price: 0.99, barcode: '10022', imageUrl: '' },
      { name: 'Coffee', price: 9.99, barcode: '10023', imageUrl: '' },
      { name: 'Tea Bags', price: 4.99, barcode: '10024', imageUrl: '' },
      
      // Snacks
      { name: 'Potato Chips', price: 3.49, barcode: '10025', imageUrl: '' },
      { name: 'Tortilla Chips', price: 3.49, barcode: '10026', imageUrl: '' },
      { name: 'Pretzels', price: 2.99, barcode: '10027', imageUrl: '' },
      { name: 'Chocolate Cookies', price: 3.99, barcode: '10028', imageUrl: '' },
      { name: 'Popcorn', price: 2.99, barcode: '10029', imageUrl: '' },
      { name: 'Candy Bar', price: 1.29, barcode: '10030', imageUrl: '' },
      { name: 'Granola Bars', price: 4.99, barcode: '10031', imageUrl: '' },
      
      // Canned & Packaged Foods
      { name: 'Canned Tuna', price: 1.99, barcode: '10032', imageUrl: '' },
      { name: 'Canned Soup', price: 2.49, barcode: '10033', imageUrl: '' },
      { name: 'Pasta', price: 1.99, barcode: '10034', imageUrl: '' },
      { name: 'Rice', price: 3.99, barcode: '10035', imageUrl: '' },
      { name: 'Cereal', price: 4.99, barcode: '10036', imageUrl: '' },
      { name: 'Peanut Butter', price: 3.99, barcode: '10037', imageUrl: '' },
      { name: 'Nutella', price: 4.99, barcode: '10038', imageUrl: '' },
      
      // Frozen Foods
      { name: 'Ice Cream', price: 5.99, barcode: '10039', imageUrl: '' },
      { name: 'Frozen Pizza', price: 6.99, barcode: '10040', imageUrl: '' },
      { name: 'Frozen Vegetables', price: 3.99, barcode: '10041', imageUrl: '' },
      { name: 'Frozen Waffles', price: 4.99, barcode: '10042', imageUrl: '' }
    ];
    
    demoProducts.forEach(product => {
      this.createProduct(product);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.barcode === barcode,
    );
  }
  
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }
  
  // Cart operations
  async getCartItems(userId: number): Promise<CartItemWithProduct[]> {
    const items = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId,
    );
    
    const result: CartItemWithProduct[] = [];
    
    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (product) {
        result.push({
          id: item.id,
          quantity: item.quantity,
          product,
        });
      }
    }
    
    return result;
  }
  
  async getCartItem(id: number): Promise<CartItem | undefined> {
    return this.cartItems.get(id);
  }
  
  async createCartItem(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if the product is already in the cart
    const existingItem = Array.from(this.cartItems.values()).find(
      (item) => item.userId === insertCartItem.userId && item.productId === insertCartItem.productId,
    );
    
    if (existingItem) {
      // Update quantity instead
      return this.updateCartItemQuantity(existingItem.id, existingItem.quantity + insertCartItem.quantity) as Promise<CartItem>;
    }
    
    const id = this.currentCartItemId++;
    const cartItem: CartItem = { ...insertCartItem, id };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }
  
  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    
    if (!cartItem) {
      return undefined;
    }
    
    if (quantity <= 0) {
      // If quantity is zero or negative, remove the item
      this.cartItems.delete(id);
      return { ...cartItem, quantity: 0 };
    }
    
    const updatedItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(userId: number): Promise<boolean> {
    const items = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId,
    );
    
    for (const item of items) {
      this.cartItems.delete(item.id);
    }
    
    return true;
  }
}

export const storage = new MemStorage();
