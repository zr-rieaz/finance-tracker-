export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: 'Food' | 'Rent' | 'Transport' | 'Health' | 'Education' | 'Entertainment' | 'Utility' | 'Shopping' | 'Income' | 'Other';
  type: 'expense' | 'income';
  date: string; // YYYY-MM-DD
  month: string; // "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  merchant: string;
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
  icon: string; // Lucide icon name
  statusMessage: string;
}

export interface MerchantBudget {
  merchant: string;
  limit: number;
  spent: number;
  icon: string;
  statusMessage: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string; // URL or base64 or placeholder index
  currency: string; // e.g. "৳", "$", "€", "£"
  language: string; // "bn" | "en"
  notifyTransactions: boolean;
  notifyBudgetAlerts: boolean;
}

