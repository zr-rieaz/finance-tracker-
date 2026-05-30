export type LanguageCode = 'en' | 'bn';

export const CONVERSION_RATES: { [currency: string]: number } = {
  '৳': 115.0, // 1 USD = 115 BDT
  '$': 1.0,   // 1 USD = 1 USD
  '€': 0.92,  // 1 USD = 0.92 EUR
  '£': 0.78   // 1 USD = 0.78 GBP
};

// Convert internal USD baseline amount to display currency
export function displayBalance(amountInUSD: number, currency: string = '৳'): number {
  const rate = CONVERSION_RATES[currency] || 115.0;
  return amountInUSD * rate;
}

// Convert user-entered display currency amount back to internal USD baseline
export function convertInputToUSD(amountInLocal: number, currency: string = '৳'): number {
  const rate = CONVERSION_RATES[currency] || 115.0;
  return amountInLocal / rate;
}

// Translate category labels
export function getCategoryLabel(category: string, lang: LanguageCode = 'en'): string {
  const labels: { [key: string]: { en: string; bn: string } } = {
    'Food': { en: 'Food & Restaurant', bn: 'খাবার ও রেস্তোরাঁ' },
    'Rent': { en: 'Rent & House', bn: 'বাড়িভাড়া' },
    'Transport': { en: 'Transport', bn: 'পরিবহন ও যাতায়াত' },
    'Health': { en: 'Health & Medical', bn: 'চিকিৎসা ও স্বাস্থ্য' },
    'Education': { en: 'Education & Study', bn: 'শিক্ষা ও পড়াশোনা' },
    'Entertainment': { en: 'Entertainment & Fun', bn: 'বিনোদন' },
    'Utility': { en: 'Utilities & Bills', bn: 'ইউটিলিটি বিল' },
    'Shopping': { en: 'Shopping & Clothes', bn: 'কেনাকাটা ও শপিং' },
    'Income': { en: 'Income & Salary', bn: 'আয় ও উপার্জিত বেতন' },
    'Other': { en: 'Others', bn: 'অন্যান্য খরচ' }
  };

  // Check normalized comparison (case-insensitive)
  const normalized = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  return labels[normalized]?.[lang] || labels[category]?.[lang] || category;
}

export const TRANSLATIONS = {
  en: {
    todaySpend: "Today's Spent",
    upgrade: "Unlock Pro Accounts",
    savingsTitle: "Monthly Savings",
    saved: "Saved",
    earnedLabel: "Earned",
    spentLabel: "Spent",
    ofLabel: "of",
    topSpending: "Top Spending Categories",
    monthlyBudgetTitle: "Active Category Budgets",
    latestActivity: "Latest Daily Activity",
    noTransactions: "No transaction records in this cycle",
    addTransaction: "Add New Transaction Record",
    txTitleLabel: "Transaction Title / Description",
    txTitlePlaceholder: "e.g., Grocery Shopping, Uber ride",
    amountLabel: "Transaction Amount",
    categoryLabel: "Select Tag Category",
    dateLabel: "Transaction Date",
    merchantLabel: "Merchant / Vendor",
    merchantPlaceholder: "e.g., Shwapno, Foodpanda, Netflix",
    saveBtn: "Save Transaction",
    all: "All Records",
    expense: "Expense",
    income: "Income",
    confirmClear: "Are you absolutely sure you want to clear your database of all transaction logs?",
    clearAll: "Wipe Logs",
    searchPlaceholder: "Search transaction logs...",
    totalSpentMonth: "Total Spent",
    limitShield: "Security budget limit active"
  },
  bn: {
    todaySpend: "আজকের খরচ",
    upgrade: "প্রো অ্যাকাউন্ট আনলক করুন",
    savingsTitle: "মাসিক সঞ্চয়",
    saved: "সঞ্চয় হয়েছে",
    earnedLabel: "মোট আয়",
    spentLabel: "মোট ব্যয়",
    ofLabel: "এর মধ্যে",
    topSpending: "সর্বোচ্চ খরচের ক্যাটাগরি সমূহ",
    monthlyBudgetTitle: "সক্রিয় ক্যাটাগরি ভিত্তিক বাজেট",
    latestActivity: "সাম্প্রতিক দৈনিক লেনদেন সমূহ",
    noTransactions: "এই চক্রে কোনো লেনদেনের রেকর্ড নেই",
    addTransaction: "নতুন লেনদেনের বিবরণ যুক্ত করুন",
    txTitleLabel: "লেনদেনের শিরোনাম / বিবরণ",
    txTitlePlaceholder: "যেমন: কাঁচাবাজার, উবার রাইড খরচ",
    amountLabel: "লেনদেনের পরিমাণ",
    categoryLabel: "ট্যাগ ক্যাটাগরি চয়ন করুন",
    dateLabel: "লেনদেনের তারিখ",
    merchantLabel: "মার্চেন্ট / বিক্রেতা",
    merchantPlaceholder: "যেমন: স্বপ্ন, ফুডপান্ডা, নেটফ্লিক্স",
    saveBtn: "লেনদেন সংরক্ষণ করুন",
    all: "সব রেকর্ড",
    expense: "ব্যয় (খরচ)",
    income: "আয়",
    confirmClear: "আপনি কি নিশ্চিতভাবে আপনার ড্যাশবোর্ড থেকে সর্বপ্রকার লেনদেনের রেকর্ড চিরতরে মুছে দিতে চান?",
    clearAll: "রেকর্ড মুছুন",
    searchPlaceholder: "লেনদেন রেকর্ড খুঁজুন...",
    totalSpentMonth: "সর্বমোট ব্যয়",
    limitShield: "নিরাপদ বাজেট সীমা সক্রিয়"
  }
};
