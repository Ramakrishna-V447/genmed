import { Medicine, Order, CartItem, Address } from '../types';
import { MEDICINES } from '../constants';
import { sendOrderConfirmationEmail } from './emailService';

// Keys for localStorage
const DB_KEYS = {
  ORDERS: 'upchar_db_orders',
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const db = {
  // --- Medicines (Read-Only from Constants for now) ---
  getMedicines: async (): Promise<Medicine[]> => {
    await delay(300);
    return MEDICINES;
  },

  getMedicineById: async (id: string): Promise<Medicine | undefined> => {
    await delay(200);
    return MEDICINES.find(m => m.id === id);
  },

  // --- Orders (Read/Write) ---
  
  /**
   * Saves a new order to the simulated database and sends confirmation email.
   */
  saveOrder: async (
    items: CartItem[], 
    totalAmount: number, 
    address: Address,
    customerEmail: string
  ): Promise<Order> => {
    await delay(1500); // Simulate processing time
    
    const orders: Order[] = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
    
    const newOrder: Order = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      items,
      totalAmount,
      address,
      customerEmail,
      status: 'placed',
      createdAt: Date.now(),
      deliveryTime: '45 mins' // Simulated ETA
    };
    
    orders.push(newOrder);
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));

    // Trigger Async Email Sending (Fire and forget for UI, but await in simulation to ensure log appears)
    // In a real backend, this would happen in a background job or after DB transaction.
    sendOrderConfirmationEmail(newOrder).catch(err => console.error("Failed to send email", err));
    
    return newOrder;
  },

  /**
   * Retrieves an order by ID.
   */
  getOrder: async (orderId: string): Promise<Order | null> => {
    await delay(800); // Simulate network fetch
    const orders: Order[] = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
    return orders.find(o => o.id === orderId) || null;
  },

  /**
   * Get all orders (Useful for an "My Orders" page in future)
   */
  getAllOrders: async (): Promise<Order[]> => {
    await delay(500);
    return JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
  },

  /**
   * Get all orders for a specific user email, sorted by newest first
   */
  getOrdersByEmail: async (email: string): Promise<Order[]> => {
    await delay(600);
    const orders: Order[] = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
    // Filter by email and Sort by createdAt descending (newest first)
    return orders
      .filter(o => o.customerEmail && o.customerEmail.toLowerCase() === email.toLowerCase())
      .sort((a, b) => b.createdAt - a.createdAt);
  }
};