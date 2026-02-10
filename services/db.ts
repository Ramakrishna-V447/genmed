
import { Medicine, Order, CartItem, Address, ActivityLog } from '../types';
import { MEDICINES } from '../constants';
import { sendOrderConfirmationEmail } from './emailService';

// Keys for localStorage
const DB_KEYS = {
  ORDERS: 'upchar_db_orders',
  MEDICINES: 'upchar_db_medicines',
  LOGS: 'upchar_db_logs'
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const db = {
  // --- Medicines (Read/Write) ---
  
  /**
   * Get all medicines. Seeds from constants if LS is empty.
   */
  getMedicines: async (): Promise<Medicine[]> => {
    await delay(300);
    const stored = localStorage.getItem(DB_KEYS.MEDICINES);
    if (!stored) {
      // Seed initial data
      localStorage.setItem(DB_KEYS.MEDICINES, JSON.stringify(MEDICINES));
      return MEDICINES;
    }
    return JSON.parse(stored);
  },

  getMedicineById: async (id: string): Promise<Medicine | undefined> => {
    await delay(200);
    const medicines: Medicine[] = JSON.parse(localStorage.getItem(DB_KEYS.MEDICINES) || JSON.stringify(MEDICINES));
    return medicines.find(m => m.id === id);
  },

  saveMedicine: async (medicine: Medicine): Promise<void> => {
    await delay(500);
    const medicines: Medicine[] = JSON.parse(localStorage.getItem(DB_KEYS.MEDICINES) || JSON.stringify(MEDICINES));
    
    const index = medicines.findIndex(m => m.id === medicine.id);
    if (index >= 0) {
      medicines[index] = medicine; // Update
    } else {
      medicines.push(medicine); // Create
    }
    
    localStorage.setItem(DB_KEYS.MEDICINES, JSON.stringify(medicines));
    await db.logActivity('Medicine Update', `Updated/Added medicine: ${medicine.name}`);
  },

  deleteMedicine: async (id: string): Promise<void> => {
    await delay(400);
    let medicines: Medicine[] = JSON.parse(localStorage.getItem(DB_KEYS.MEDICINES) || JSON.stringify(MEDICINES));
    const name = medicines.find(m => m.id === id)?.name || id;
    medicines = medicines.filter(m => m.id !== id);
    localStorage.setItem(DB_KEYS.MEDICINES, JSON.stringify(medicines));
    await db.logActivity('Medicine Delete', `Deleted medicine: ${name}`);
  },

  // --- Orders (Read/Write) ---
  
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

    sendOrderConfirmationEmail(newOrder).catch(err => console.error("Failed to send email", err));
    
    return newOrder;
  },

  getOrder: async (orderId: string): Promise<Order | null> => {
    await delay(800); 
    const orders: Order[] = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
    return orders.find(o => o.id === orderId) || null;
  },

  getAllOrders: async (): Promise<Order[]> => {
    await delay(500);
    return JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
  },

  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<void> => {
    await delay(400);
    const orders: Order[] = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
    const index = orders.findIndex(o => o.id === orderId);
    if (index >= 0) {
      orders[index].status = status;
      localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
      await db.logActivity('Order Update', `Updated order #${orderId} status to ${status}`);
    }
  },

  getOrdersByEmail: async (email: string): Promise<Order[]> => {
    await delay(600);
    const orders: Order[] = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
    return orders
      .filter(o => o.customerEmail && o.customerEmail.toLowerCase() === email.toLowerCase())
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  // --- Logs ---

  logActivity: async (action: string, details: string) => {
    const logs: ActivityLog[] = JSON.parse(localStorage.getItem(DB_KEYS.LOGS) || '[]');
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      action,
      admin: 'Super Admin',
      timestamp: Date.now(),
      details
    };
    logs.unshift(newLog); // Add to beginning
    if (logs.length > 50) logs.pop(); // Keep last 50
    localStorage.setItem(DB_KEYS.LOGS, JSON.stringify(logs));
  },

  getLogs: async (): Promise<ActivityLog[]> => {
    await delay(300);
    return JSON.parse(localStorage.getItem(DB_KEYS.LOGS) || '[]');
  }
};
