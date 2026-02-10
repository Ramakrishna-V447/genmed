
export interface MarketRate {
  shopName: string;
  price: number;
  type: 'Generic' | 'Branded';
}

export interface Medicine {
  id: string;
  name: string; // Generic Name primarily
  brandExample: string;
  saltComposition: string;
  category: MedicineCategory;
  commonUse: string[];
  description: string;
  genericPrice: number;
  brandedPrice: number;
  stock: number;
  expiryDate: string;
  marketRates: MarketRate[]; // Prices at different shops
  imageUrl: string;
  dosage: {
    normal: string;
    maxSafe: string;
    overdoseWarning: string;
  };
  details: {
    mechanism: string;
    sideEffects: string[];
    contraindications: string[]; // Who should avoid
    storage: string;
  };
}

export interface CartItem extends Medicine {
  quantity: number;
}

export enum MedicineCategory {
  FEVER = 'Fever',
  COLD_FLU = 'Cold & Flu',
  PAIN = 'Pain Relief',
  ACIDITY = 'Acidity & Gas',
  ALLERGY = 'Allergy',
  ANTIBIOTIC = 'Antibiotic',
  DIABETES = 'Diabetes',
  HEART = 'Heart Health',
  SUPPLEMENTS = 'Vitamins & Supplements'
}

export interface User {
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, name: string) => void;
  logout: () => void;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Address {
  fullName: string;
  phone: string;
  line: string;
  city: string;
  pincode: string;
  type: 'home' | 'work';
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: 'placed' | 'packed' | 'out_for_delivery' | 'delivered';
  address: Address;
  customerEmail: string;
  createdAt: number;
  deliveryTime: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  admin: string;
  timestamp: number;
  details: string;
}
