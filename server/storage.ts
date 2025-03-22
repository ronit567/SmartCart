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
    // Loblaws product data from the CSV file
    const loblawsProducts = [
      // Vegetables
      { name: 'English Cucumber', price: 1.99, barcode: '20001', imageUrl: '' },
      { name: 'Green Onion', price: 1.69, barcode: '20002', imageUrl: '' },
      { name: "Farmer's Market Yellow Onions", price: 1.99, barcode: '20003', imageUrl: '' },
      { name: 'Tomato On The Vine Red (1 Bunch)', price: 3.12, barcode: '20004', imageUrl: '' },
      { name: 'Celery Stalks', price: 3.69, barcode: '20005', imageUrl: '' },
      { name: 'Lettuce Iceberg', price: 3.49, barcode: '20006', imageUrl: '' },
      { name: 'Broccoli', price: 2.99, barcode: '20007', imageUrl: '' },
      { name: 'Cauliflower', price: 5.99, barcode: '20008', imageUrl: '' },
      { name: 'Romaine Heart, 3 Pack', price: 4.99, barcode: '20009', imageUrl: '' },
      { name: 'Red Peppers', price: 2.11, barcode: '20010', imageUrl: '' },
      { name: 'Roma Tomatoes', price: 0.53, barcode: '20011', imageUrl: '' },
      { name: "Farmer's Market Carrots", price: 1.99, barcode: '20012', imageUrl: '' },
      { name: 'Tomato Beefsteak Red', price: 1.47, barcode: '20013', imageUrl: '' },
      { name: "Farmer's Market English Cucumber 3Ct", price: 4.99, barcode: '20014', imageUrl: '' },
      { name: 'Sweet Potato', price: 2.77, barcode: '20015', imageUrl: '' },
      { name: 'No Name Naturally Imperfect Mixed Sweet Peppers 2.5lb Bag', price: 5.99, barcode: '20016', imageUrl: '' },
      { name: 'Ginger', price: 2.08, barcode: '20017', imageUrl: '' },
      { name: 'Zucchini', price: 1.66, barcode: '20018', imageUrl: '' },
      { name: 'Red Onion', price: 2.03, barcode: '20019', imageUrl: '' },
      { name: 'Pumpkin, Large', price: 5.99, barcode: '20020', imageUrl: '' },
      
      // Fruits
      { name: 'Bananas, Bunch', price: 1.75, barcode: '20021', imageUrl: '' },
      { name: 'Strawberries 1LB', price: 4.99, barcode: '20022', imageUrl: '' },
      { name: 'Raspberries 1/2 pint', price: 4.49, barcode: '20023', imageUrl: '' },
      { name: 'PC Organics Gala Apples', price: 1.94, barcode: '20024', imageUrl: '' },
      { name: 'McIntosh Apples', price: 1.10, barcode: '20025', imageUrl: '' },
      { name: 'Star Fruit', price: 3.99, barcode: '20026', imageUrl: '' },
      { name: 'Red Seedless Watermelon', price: 9.99, barcode: '20027', imageUrl: '' },
      { name: 'Fuyu Persimmon', price: 1.49, barcode: '20028', imageUrl: '' },
      { name: 'Manzano Bananas, Bunch', price: 3.78, barcode: '20029', imageUrl: '' },
      { name: 'Alphonso mango', price: 5.99, barcode: '20030', imageUrl: '' },
      
      // Dairy
      { name: 'Whole Milk', price: 3.49, barcode: '20031', imageUrl: '' },
      { name: 'Natural Yogurt', price: 3.29, barcode: '20032', imageUrl: '' },
      { name: 'Free Range Eggs', price: 5.99, barcode: '20033', imageUrl: '' },
      { name: 'Cheddar Cheese', price: 4.99, barcode: '20034', imageUrl: '' },
      { name: 'Greek Yogurt', price: 3.99, barcode: '20035', imageUrl: '' },
      { name: 'Butter', price: 3.49, barcode: '20036', imageUrl: '' },
      { name: 'Sour Cream', price: 2.49, barcode: '20037', imageUrl: '' },
      
      // Bakery
      { name: 'Whole Wheat Bread', price: 4.29, barcode: '20038', imageUrl: '' },
      { name: 'White Bread', price: 3.99, barcode: '20039', imageUrl: '' },
      { name: 'Bagels', price: 4.99, barcode: '20040', imageUrl: '' },
      { name: 'Croissants', price: 5.99, barcode: '20041', imageUrl: '' },
      { name: 'Muffins', price: 4.49, barcode: '20042', imageUrl: '' },
      
      // Meat & Seafood
      { name: 'Chicken Breast', price: 8.99, barcode: '20043', imageUrl: '' },
      { name: 'Ground Beef', price: 7.99, barcode: '20044', imageUrl: '' },
      { name: 'Salmon Fillet', price: 12.99, barcode: '20045', imageUrl: '' },
      { name: 'Pork Chops', price: 9.99, barcode: '20046', imageUrl: '' },
      { name: 'Bacon', price: 6.99, barcode: '20047', imageUrl: '' },
      
      // Beverages
      { name: 'Coca-Cola', price: 1.79, barcode: '20048', imageUrl: '' },
      { name: 'Diet Coke', price: 1.79, barcode: '20049', imageUrl: '' },
      { name: 'Pepsi', price: 1.79, barcode: '20050', imageUrl: '' },
      { name: 'Orange Juice', price: 3.99, barcode: '20051', imageUrl: '' },
      { name: 'Bottled Water', price: 0.99, barcode: '20052', imageUrl: '' },
      { name: 'Coffee', price: 9.99, barcode: '20053', imageUrl: '' },
      { name: 'Tea Bags', price: 4.99, barcode: '20054', imageUrl: '' },
      
      // Snacks
      { name: 'Potato Chips', price: 3.49, barcode: '20055', imageUrl: '' },
      { name: 'Tortilla Chips', price: 3.49, barcode: '20056', imageUrl: '' },
      { name: 'Pretzels', price: 2.99, barcode: '20057', imageUrl: '' },
      { name: 'Chocolate Cookies', price: 3.99, barcode: '20058', imageUrl: '' },
      { name: 'Popcorn', price: 2.99, barcode: '20059', imageUrl: '' },
      { name: 'Candy Bar', price: 1.29, barcode: '20060', imageUrl: '' },
      { name: 'Granola Bars', price: 4.99, barcode: '20061', imageUrl: '' },
      
      // Prepared Foods & Salads
      { name: "President's Choice Coleslaw", price: 3.49, barcode: '20062', imageUrl: '' },
      { name: "President's Choice Baby Spinach", price: 3.99, barcode: '20063', imageUrl: '' },
      { name: 'Cooking Spinach', price: 3.99, barcode: '20064', imageUrl: '' },
      { name: 'Eat Smart Sweet Kale Salad Kit', price: 5.99, barcode: '20065', imageUrl: '' },
      { name: 'PC Organics Organics Baby Spinach', price: 5.99, barcode: '20066', imageUrl: '' },
      { name: 'Taylor Farms Dill Pickle Chopped Salad Kit', price: 6.99, barcode: '20067', imageUrl: '' },
      { name: "President's Choice Arugula", price: 3.99, barcode: '20068', imageUrl: '' },
      { name: "President's Choice Spring Mix", price: 3.99, barcode: '20069', imageUrl: '' },
      { name: "President's Choice Caesar Salad Kit", price: 4.99, barcode: '20070', imageUrl: '' },
      
      // Canned & Packaged Foods
      { name: 'Canned Tuna', price: 1.99, barcode: '20071', imageUrl: '' },
      { name: 'Canned Soup', price: 2.49, barcode: '20072', imageUrl: '' },
      { name: 'Pasta', price: 1.99, barcode: '20073', imageUrl: '' },
      { name: 'Rice', price: 3.99, barcode: '20074', imageUrl: '' },
      { name: 'Cereal', price: 4.99, barcode: '20075', imageUrl: '' },
      { name: 'Peanut Butter', price: 3.99, barcode: '20076', imageUrl: '' },
      { name: 'Nutella', price: 4.99, barcode: '20077', imageUrl: '' },
      
      // Frozen Foods
      { name: 'Ice Cream', price: 5.99, barcode: '20078', imageUrl: '' },
      { name: 'Frozen Pizza', price: 6.99, barcode: '20079', imageUrl: '' },
      { name: 'Frozen Vegetables', price: 3.99, barcode: '20080', imageUrl: '' },
      { name: 'Frozen Waffles', price: 4.99, barcode: '20081', imageUrl: '' },
      
      // Adding more products from the Loblaws CSV list
      { name: 'Sweet Green Peppers', price: 2.46, barcode: '20082', imageUrl: '' },
      { name: 'Broccoli Crowns', price: 3.34, barcode: '20083', imageUrl: '' },
      { name: 'Rooster Garlic Bulbs, 3-count', price: 1.49, barcode: '20084', imageUrl: '' },
      { name: "Farmer's Market White Potatoes", price: 5.99, barcode: '20085', imageUrl: '' },
      { name: "Farmer's Market Yellow Potato 10lb Bag", price: 6.99, barcode: '20086', imageUrl: '' },
      { name: 'Colossal Garlic', price: 1.98, barcode: '20087', imageUrl: '' },
      { name: "Farmer's Market Grape Tomatoes", price: 3.99, barcode: '20088', imageUrl: '' },
      { name: 'Romaine Lettuce', price: 2.99, barcode: '20089', imageUrl: '' },
      { name: 'Sweet Onion', price: 2.53, barcode: '20090', imageUrl: '' },
      { name: "Farmer's Market Mini Carrots", price: 2.49, barcode: '20091', imageUrl: '' },
      { name: 'Cabbage, Green', price: 4.77, barcode: '20092', imageUrl: '' },
      { name: "Farmer's Market Russet Potatoes", price: 6.99, barcode: '20093', imageUrl: '' },
      { name: "Farmer's Market Grape Tomato 907G", price: 7.99, barcode: '20094', imageUrl: '' },
      { name: "Farmer's Market Mini Cucumbers", price: 4.99, barcode: '20095', imageUrl: '' },
      { name: 'Asparagus', price: 7.79, barcode: '20096', imageUrl: '' },
      { name: 'Green Leaf Lettuce', price: 2.99, barcode: '20097', imageUrl: '' },
      { name: 'Butternut Squash', price: 5.28, barcode: '20098', imageUrl: '' },
      { name: "Farmer's Market Red Onions", price: 5.99, barcode: '20099', imageUrl: '' },
      { name: 'PC Organics White Mushrooms', price: 3.49, barcode: '20100', imageUrl: '' }
    ];
    
    loblawsProducts.forEach(product => {
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
