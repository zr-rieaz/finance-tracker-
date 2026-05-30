import { Transaction, Budget, MerchantBudget } from './types';

// Requirement 2: Account balance starts at 0, meaning INITIAL_TRANSACTIONS starts empty
export const INITIAL_TRANSACTIONS: Transaction[] = [];

// Requirement 6: Categories updated: ফুড (Food), বাড়িভাড়া (Rent), পরিবহন (Transport), স্বাস্থ্য (Health), শিক্ষা (Education), বিনোদন (Entertainment), ইউটিলিটি (Utility), কেনাকাটা (Shopping), আয় (Income), অন্যান্য (Other). All spent balances start at 0. Limit stored in baseline USD ($).
export const INITIAL_BUDGETS: Budget[] = [
  {
    category: 'Food',
    limit: 250, // Stored in USD baseline ($)
    spent: 0,
    icon: 'Utensils',
    statusMessage: 'Food budgeting is healthy and fresh.'
  },
  {
    category: 'Rent',
    limit: 1000,
    spent: 0,
    icon: 'Building',
    statusMessage: 'Rent budget starts clean.'
  },
  {
    category: 'Transport',
    limit: 150,
    spent: 0,
    icon: 'Car',
    statusMessage: 'Transport spending has zero records.'
  },
  {
    category: 'Health',
    limit: 200,
    spent: 0,
    icon: 'Pill',
    statusMessage: 'Healthcare budget is pristine.'
  },
  {
    category: 'Education',
    limit: 300,
    spent: 0,
    icon: 'GraduationCap',
    statusMessage: 'Education budget starts fresh.'
  },
  {
    category: 'Entertainment',
    limit: 150,
    spent: 0,
    icon: 'Tv',
    statusMessage: 'Entertainment budget starts fresh.'
  },
  {
    category: 'Utility',
    limit: 200,
    spent: 0,
    icon: 'Lightbulb',
    statusMessage: 'Utility budget has no records.'
  },
  {
    category: 'Shopping',
    limit: 300,
    spent: 0,
    icon: 'ShoppingBag',
    statusMessage: 'Shopping budget is pristine.'
  },
  {
    category: 'Other',
    limit: 150,
    spent: 0,
    icon: 'HelpCircle',
    statusMessage: 'Other budget is fresh.'
  }
];

export const INITIAL_MERCHANT_BUDGETS: MerchantBudget[] = [];
