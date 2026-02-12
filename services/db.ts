
import { Medicine, Order, CartItem, Address, ActivityLog, User, EmailLog } from '../types';
import { MEDICINES } from '../constants';

// Keys for localStorage
const DB_KEYS = {
  USERS: 'medigen_db_users',
  ORDERS: 'medigen_db_orders',
  MEDICINES: 'medigen_db_medicines',
  LOGS: 'medigen_db_logs',
  EMAILS: 'medigen_db_emails'
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- INTERNAL HELPERS ---
const getStorage = <T>(key: string, defaultVal: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
};

const setStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage Full or Error", e);
  }
};

// --- INITIALIZATION ---
// Ensure Admin user exists on first load
const seedUsers = () => {
    const users = getStorage<User[]>(DB_KEYS.USERS, []);
    const adminExists = users.some(u => u.email === 'admin@medigen.com');
    if (!adminExists) {
        const adminUser: User = {
            id: 'usr_admin',
            name: 'Super Admin',
            email: 'admin@medigen.com',
            password: 'admin', // In a real app, this would be hashed
            role: 'admin',
            createdAt: Date.now()
        };
        users.push(adminUser);
        setStorage(DB_KEYS.USERS, users);
        console.log("Database: Seeded Admin User");
    }
};

seedUsers();

export const db = {
  // --- USER & AUTH ---

  registerUser: async (name: string, email: string, password: string): Promise<User> => {
      await delay(800);
      const users = getStorage<User[]>(DB_KEYS.USERS, []);
      
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error("User already exists with this email.");
      }

      const newUser: User = {
          id: `usr_${Date.now()}`,
          name,
          email,
          password, // NOTE: In production, never store plain text passwords!
          role: 'user',
          createdAt: Date.now()
      };

      users.push(newUser);
      setStorage(DB_KEYS.USERS, users);
      await db.logActivity('User Registration', `New user registered: ${email}`);
      return newUser;
  },

  authenticateUser: async (email: string, password: string): Promise<User> => {
      await delay(600);
      const users = getStorage<User[]>(DB_KEYS.USERS, []);
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      
      if (!user) {
          throw new Error("Invalid email or password.");
      }
      
      // Return user without password
      const { password: _, ...safeUser } = user;
      return safeUser as User;
  },

  getUserByEmail: async (email: string): Promise<User | undefined> => {
      await delay(200);
      const users = getStorage<User[]>(DB_KEYS.USERS, []);
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
           const { password: _, ...safeUser } = user;
           return safeUser as User;
      }
      return undefined;
  },

  // --- MEDICINES ---
  
  getMedicines: async (): Promise<Medicine[]> => {
    await delay(300);
    const stored = localStorage.getItem(DB_KEYS.MEDICINES);
    if (!stored) {
      setStorage(DB_KEYS.MEDICINES, MEDICINES);
      return MEDICINES;
    }
    return JSON.parse(stored);
  },

  getMedicineById: async (id: string): Promise<Medicine | undefined> => {
    await delay(200);
    const medicines = getStorage<Medicine[]>(DB_KEYS.MEDICINES, MEDICINES);
    return medicines.find(m => m.id === id);
  },

  saveMedicine: async (medicine: Medicine): Promise<void> => {
    await delay(500);
    const medicines = getStorage<Medicine[]>(DB_KEYS.MEDICINES, MEDICINES);
    
    const index = medicines.findIndex(m => m.id === medicine.id);
    if (index >= 0) {
      medicines[index] = medicine;
    } else {
      medicines.push(medicine);
    }
    
    setStorage(DB_KEYS.MEDICINES, medicines);
    await db.logActivity('Medicine Update', `Updated/Added medicine: ${medicine.name}`);
  },

  deleteMedicine: async (id: string): Promise<void> => {
    await delay(400);
    let medicines = getStorage<Medicine[]>(DB_KEYS.MEDICINES, MEDICINES);
    const name = medicines.find(m => m.id === id)?.name || id;
    medicines = medicines.filter(m => m.id !== id);
    setStorage(DB_KEYS.MEDICINES, medicines);
    await db.logActivity('Medicine Delete', `Deleted medicine: ${name}`);
  },

  // --- ORDERS ---
  
  saveOrder: async (
    items: CartItem[], 
    totalAmount: number, 
    address: Address,
    customerEmail: string
  ): Promise<Order> => {
    await delay(1500);
    
    const orders = getStorage<Order[]>(DB_KEYS.ORDERS, []);
    
    const newOrder: Order = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      items,
      totalAmount,
      address,
      customerEmail,
      status: 'placed',
      createdAt: Date.now(),
      deliveryTime: '45 mins'
    };
    
    orders.push(newOrder);
    setStorage(DB_KEYS.ORDERS, orders);

    // Import here to avoid circular dependency issues if possible, or handle externally
    // For this structure, we call the email service which calls db.saveEmail
    const { sendOrderConfirmationEmail } = await import('./emailService');
    sendOrderConfirmationEmail(newOrder).catch(err => console.error("Failed to process email", err));
    
    return newOrder;
  },

  getOrder: async (orderId: string): Promise<Order | null> => {
    await delay(800); 
    const orders = getStorage<Order[]>(DB_KEYS.ORDERS, []);
    return orders.find(o => o.id === orderId) || null;
  },

  getAllOrders: async (): Promise<Order[]> => {
    await delay(500);
    return getStorage<Order[]>(DB_KEYS.ORDERS, []);
  },

  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<void> => {
    await delay(400);
    const orders = getStorage<Order[]>(DB_KEYS.ORDERS, []);
    const index = orders.findIndex(o => o.id === orderId);
    if (index >= 0) {
      orders[index].status = status;
      setStorage(DB_KEYS.ORDERS, orders);
      await db.logActivity('Order Update', `Updated order #${orderId} status to ${status}`);
    }
  },

  getOrdersByEmail: async (email: string): Promise<Order[]> => {
    await delay(600);
    const orders = getStorage<Order[]>(DB_KEYS.ORDERS, []);
    return orders
      .filter(o => o.customerEmail && o.customerEmail.toLowerCase() === email.toLowerCase())
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  // --- EMAILS ---

  saveEmail: async (to: string, subject: string, body: string): Promise<void> => {
      const emails = getStorage<EmailLog[]>(DB_KEYS.EMAILS, []);
      const newEmail: EmailLog = {
          id: `email_${Date.now()}`,
          to,
          subject,
          body,
          sentAt: Date.now(),
          status: 'sent'
      };
      emails.push(newEmail);
      setStorage(DB_KEYS.EMAILS, emails);
      // await db.logActivity('Email Sent', `Email sent to ${to}: ${subject}`);
  },

  getEmails: async (): Promise<EmailLog[]> => {
      await delay(200);
      return getStorage<EmailLog[]>(DB_KEYS.EMAILS, []);
  },

  // --- LOGS ---

  logActivity: async (action: string, details: string) => {
    const logs = getStorage<ActivityLog[]>(DB_KEYS.LOGS, []);
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      action,
      admin: 'System/Admin',
      timestamp: Date.now(),
      details
    };
    logs.unshift(newLog);
    if (logs.length > 100) logs.pop(); // Increased log retention
    setStorage(DB_KEYS.LOGS, logs);
  },

  getLogs: async (): Promise<ActivityLog[]> => {
    await delay(300);
    return getStorage<ActivityLog[]>(DB_KEYS.LOGS, []);
  }
};
