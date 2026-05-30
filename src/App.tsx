import { useState, useEffect } from 'react';
import { 
  Wallet, 
  Moon, 
  Sun, 
  Sparkles,
  Award,
  Check,
  ShieldCheck,
  Calendar,
  X
} from 'lucide-react';

import { Transaction, Budget, MerchantBudget, UserProfile } from './types';
import { 
  INITIAL_TRANSACTIONS, 
  INITIAL_BUDGETS, 
  INITIAL_MERCHANT_BUDGETS 
} from './initialData';
import { convertInputToUSD } from './utils';

// Modular Component imports
import { Sidebar } from './components/Sidebar';
import { BottomNavBar } from './components/BottomNavBar';
import { BillingReportsScreen } from './components/BillingReportsScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { BudgetScreen } from './components/BudgetScreen';
import { TransactionsScreen } from './components/TransactionsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AddTransactionModal } from './components/AddTransactionModal';
import { EditTransactionModal } from './components/EditTransactionModal';
import { AuthScreen } from './components/AuthScreen';

export default function App() {
  // Navigation Routing Tab State
  const [activeTab, setActiveTab] = useState<string>('home'); // Defaults: home, graph, transactions, category, settings
  
  // Current Authenticated User (persists key preferences reliably)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('fintrack_current_user');
    return cached ? JSON.parse(cached) : null;
  });
  
  // Storage State Managers (synchronously partitioned by user email if logged in)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const cachedUser = localStorage.getItem('fintrack_current_user');
    const email = cachedUser ? JSON.parse(cachedUser).email.toLowerCase().trim() : '';
    const key = email ? `fintrack_transactions_db_${email}` : 'fintrack_transactions_db';
    
    const cached = localStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached);
    } else {
      localStorage.setItem(key, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const cachedUser = localStorage.getItem('fintrack_current_user');
    const email = cachedUser ? JSON.parse(cachedUser).email.toLowerCase().trim() : '';
    const key = email ? `fintrack_budgets_db_${email}` : 'fintrack_budgets_db';

    const cached = localStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached);
    } else {
      localStorage.setItem(key, JSON.stringify(INITIAL_BUDGETS));
      return INITIAL_BUDGETS;
    }
  });

  const [merchantBudgets, setMerchantBudgets] = useState<MerchantBudget[]>(() => {
    const cachedUser = localStorage.getItem('fintrack_current_user');
    const email = cachedUser ? JSON.parse(cachedUser).email.toLowerCase().trim() : '';
    const key = email ? `fintrack_merchants_db_${email}` : 'fintrack_merchants_db';

    const cached = localStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached);
    } else {
      localStorage.setItem(key, JSON.stringify(INITIAL_MERCHANT_BUDGETS));
      return INITIAL_MERCHANT_BUDGETS;
    }
  });

  // Selected Month (Globally linked between Screen 1 Month Selector and Dashboard)
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const MONTHS = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return MONTHS[new Date().getMonth()];
  });

  // Dark Mode Appearance State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('fin_dark_mode');
    return saved === 'true';
  });

  // Upgrade Premium Modal Screen (All Features Free)
  const [isPremium, setIsPremium] = useState<boolean>(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  // Add Transaction Entry popup states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Edit Transaction Entry states
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  // Update HTML body theme when dark mode changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('fin_dark_mode', darkMode.toString());
  }, [darkMode]);

  // Handle adding new transaction records (ensures reliable atomicity/saving)
  const handleAddTransaction = (newT: Omit<Transaction, 'id'>) => {
    const amountInUSD = convertInputToUSD(newT.amount, userProfile?.currency || '৳');
    const id = `t-${Date.now()}`;
    const transactionRecord: Transaction = { ...newT, id, amount: amountInUSD };

    const email = userProfile?.email.toLowerCase().trim() || '';
    const txKey = email ? `fintrack_transactions_db_${email}` : 'fintrack_transactions_db';
    const budgetsKey = email ? `fintrack_budgets_db_${email}` : 'fintrack_budgets_db';
    const merchantsKey = email ? `fintrack_merchants_db_${email}` : 'fintrack_merchants_db';

    // Instantly switch dashboard view month to the newly added transaction month so it displays immediately
    setCurrentMonth(newT.month);

    // Update transactions with functional state to prevent stale references
    setTransactions((prev) => {
      const updated = [transactionRecord, ...prev];
      localStorage.setItem(txKey, JSON.stringify(updated));
      return updated;
    });

    // After adding transaction, automatically update corresponding custom budgets spent total
    if (newT.type === 'expense') {
      // 1. Update Category Budget Spent
      setBudgets((prevBudgets) => {
        const updatedBudgets = prevBudgets.map((b) => {
          if (b.category.toLowerCase() === newT.category.toLowerCase()) {
            const nextSpent = b.spent + amountInUSD;
            const limit = b.limit;
            const status = nextSpent > limit 
              ? `You have exceeded your ${b.category.toLowerCase()} limit!`
              : nextSpent / limit > 0.8
                ? `Careful, your spending on ${b.category.toLowerCase()} is almost exceeded`
                : `Your ${b.category.toLowerCase()} spending still on track`;
            return { ...b, spent: nextSpent, statusMessage: status };
          }
          return b;
        });
        localStorage.setItem(budgetsKey, JSON.stringify(updatedBudgets));
        return updatedBudgets;
      });

      // 2. Update Merchant Budget Spent
      setMerchantBudgets((prevMerchants) => {
        const updatedMerchantBudgets = prevMerchants.map((m) => {
          if (m.merchant.toLowerCase() === newT.merchant.toLowerCase()) {
            const nextSpent = m.spent + amountInUSD;
            const limit = m.limit;
            const status = nextSpent > limit 
              ? `Exceeded limit of payments to ${m.merchant}`
              : `Favourable shopping at ${m.merchant} on track`;
            return { ...m, spent: nextSpent, statusMessage: status };
          }
          return m;
        });
        localStorage.setItem(merchantsKey, JSON.stringify(updatedMerchantBudgets));
        return updatedMerchantBudgets;
      });
    }
  };

  // Handle deleting individual transaction items
  const handleDeleteTransaction = (id: string) => {
    const transactionToDelete = transactions.find((t) => t.id === id);
    if (!transactionToDelete) return;

    const email = userProfile?.email.toLowerCase().trim() || '';
    const txKey = email ? `fintrack_transactions_db_${email}` : 'fintrack_transactions_db';
    const budgetsKey = email ? `fintrack_budgets_db_${email}` : 'fintrack_budgets_db';
    const merchantsKey = email ? `fintrack_merchants_db_${email}` : 'fintrack_merchants_db';

    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    localStorage.setItem(txKey, JSON.stringify(updated));

    // Reverse budget constraints as well
    if (transactionToDelete.type === 'expense') {
      const updatedBudgets = budgets.map((b) => {
        if (b.category.toLowerCase() === transactionToDelete.category.toLowerCase()) {
          const nextSpent = Math.max(0, b.spent - transactionToDelete.amount);
          return { ...b, spent: nextSpent };
        }
        return b;
      });
      setBudgets(updatedBudgets);
      localStorage.setItem(budgetsKey, JSON.stringify(updatedBudgets));

      const updatedMerchantBudgets = merchantBudgets.map((m) => {
        if (m.merchant.toLowerCase() === transactionToDelete.merchant.toLowerCase()) {
          const nextSpent = Math.max(0, m.spent - transactionToDelete.amount);
          return { ...m, spent: nextSpent };
        }
        return m;
      });
      setMerchantBudgets(updatedMerchantBudgets);
      localStorage.setItem(merchantsKey, JSON.stringify(updatedMerchantBudgets));
    }
  };

  // Handle editing/updating transaction changes accurately
  const handleUpdateTransaction = (updatedT: Transaction) => {
    const originalT = transactions.find((t) => t.id === updatedT.id);
    if (!originalT) return;

    const email = userProfile?.email.toLowerCase().trim() || '';
    const txKey = email ? `fintrack_transactions_db_${email}` : 'fintrack_transactions_db';
    const budgetsKey = email ? `fintrack_budgets_db_${email}` : 'fintrack_budgets_db';
    const merchantsKey = email ? `fintrack_merchants_db_${email}` : 'fintrack_merchants_db';

    // Instantly switch dashboard view month to the updated transaction month so it displays immediately
    setCurrentMonth(updatedT.month);

    // Convert updated display currency amount to internal base USD rate
    const amountInUSD = convertInputToUSD(updatedT.amount, userProfile?.currency || '৳');
    const updatedRecord: Transaction = {
      ...updatedT,
      amount: amountInUSD // store in internal baseline USD representation
    };

    // 1. Update Transactions Array
    setTransactions((prev) => {
      const updated = prev.map((t) => (t.id === updatedT.id ? updatedRecord : t));
      localStorage.setItem(txKey, JSON.stringify(updated));
      return updated;
    });

    // 2. Re-calculate entire Budgets spending totals safely and reliably to prevent any out-of-sync states
    setBudgets((prevBudgets) => {
      // First, map budgets to reverse the old expense (if it was an expense)
      let tempBudgets = prevBudgets.map((b) => {
        if (originalT.type === 'expense' && b.category.toLowerCase() === originalT.category.toLowerCase()) {
          return { ...b, spent: Math.max(0, b.spent - originalT.amount) };
        }
        return b;
      });

      // Then, add the new expense (if it is an expense)
      const finalBudgets = tempBudgets.map((b) => {
        if (updatedRecord.type === 'expense' && b.category.toLowerCase() === updatedRecord.category.toLowerCase()) {
          const nextSpent = b.spent + amountInUSD;
          const limit = b.limit;
          const status = nextSpent > limit 
            ? `You have exceeded your ${b.category.toLowerCase()} limit!`
            : nextSpent / limit > 0.8
              ? `Careful, your spending on ${b.category.toLowerCase()} is almost exceeded`
              : `Your ${b.category.toLowerCase()} spending still on track`;
          return { ...b, spent: nextSpent, statusMessage: status };
        }
        return b;
      });

      localStorage.setItem(budgetsKey, JSON.stringify(finalBudgets));
      return finalBudgets;
    });

    // 3. Re-calculate Merchant Budgets
    setMerchantBudgets((prevMerchants) => {
      // Revert old merchant spent (if it was an expense and had a merchant value)
      let tempMerchants = prevMerchants.map((m) => {
        if (originalT.type === 'expense' && originalT.merchant && m.merchant.toLowerCase() === originalT.merchant.toLowerCase()) {
          return { ...m, spent: Math.max(0, m.spent - originalT.amount) };
        }
        return m;
      });

      // Add new merchant spent (if it is an expense and has a merchant value)
      const finalMerchants = tempMerchants.map((m) => {
        if (updatedRecord.type === 'expense' && updatedRecord.merchant && m.merchant.toLowerCase() === updatedRecord.merchant.toLowerCase()) {
          const nextSpent = m.spent + amountInUSD;
          const limit = m.limit;
          const status = nextSpent > limit 
            ? `Exceeded limit of payments to ${m.merchant}`
            : `Favourable shopping at ${m.merchant} on track`;
          return { ...m, spent: nextSpent, statusMessage: status };
        }
        return m;
      });

      localStorage.setItem(merchantsKey, JSON.stringify(finalMerchants));
      return finalMerchants;
    });
  };

  // Update budget allocations directly from Settings Screen
  const handleUpdateBudgetLimit = (category: string, newLimit: number) => {
    const email = userProfile?.email.toLowerCase().trim() || '';
    const budgetsKey = email ? `fintrack_budgets_db_${email}` : 'fintrack_budgets_db';

    const updated = budgets.map((b) => {
      if (b.category === category) {
        return { 
          ...b, 
          limit: newLimit,
          statusMessage: b.spent > newLimit 
            ? `You have exceeded your ${b.category.toLowerCase()} limit!`
            : b.spent / newLimit > 0.8
              ? `Careful, your spending on ${b.category.toLowerCase()} is almost exceeded`
              : `Your ${b.category.toLowerCase()} spending still on track`
        };
      }
      return b;
    });
    setBudgets(updated);
    localStorage.setItem(budgetsKey, JSON.stringify(updated));
  };

  // Hard factory reset of data
  const handleResetToFactory = () => {
    const email = userProfile?.email.toLowerCase().trim() || '';
    const txKey = email ? `fintrack_transactions_db_${email}` : 'fintrack_transactions_db';
    const budgetsKey = email ? `fintrack_budgets_db_${email}` : 'fintrack_budgets_db';
    const merchantsKey = email ? `fintrack_merchants_db_${email}` : 'fintrack_merchants_db';

    localStorage.removeItem(txKey);
    localStorage.removeItem(budgetsKey);
    localStorage.removeItem(merchantsKey);
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setMerchantBudgets(INITIAL_MERCHANT_BUDGETS);
    localStorage.setItem(txKey, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(budgetsKey, JSON.stringify(INITIAL_BUDGETS));
    localStorage.setItem(merchantsKey, JSON.stringify(INITIAL_MERCHANT_BUDGETS));
    setActiveTab('home');
  };

  // Complete Pro Account upgrading simulation
  const handleUpgradeAccount = () => {
    setIsPremium(true);
    localStorage.setItem('fin_premium', 'true');
    setShowUpgradeModal(true);
  };

  const handleLoginSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('fintrack_current_user', JSON.stringify(profile));
    
    // Switch immediately to loaded profile's partitioned budgets and ledger sheets
    const email = profile.email.toLowerCase().trim();
    const txKey = `fintrack_transactions_db_${email}`;
    const budgetsKey = `fintrack_budgets_db_${email}`;
    const merchantsKey = `fintrack_merchants_db_${email}`;

    const cachedTx = localStorage.getItem(txKey);
    if (cachedTx) {
      setTransactions(JSON.parse(cachedTx));
    } else {
      localStorage.setItem(txKey, JSON.stringify(INITIAL_TRANSACTIONS));
      setTransactions(INITIAL_TRANSACTIONS);
    }

    const cachedBudgets = localStorage.getItem(budgetsKey);
    if (cachedBudgets) {
      setBudgets(JSON.parse(cachedBudgets));
    } else {
      localStorage.setItem(budgetsKey, JSON.stringify(INITIAL_BUDGETS));
      setBudgets(INITIAL_BUDGETS);
    }

    const cachedMerchants = localStorage.getItem(merchantsKey);
    if (cachedMerchants) {
      setMerchantBudgets(JSON.parse(cachedMerchants));
    } else {
      localStorage.setItem(merchantsKey, JSON.stringify(INITIAL_MERCHANT_BUDGETS));
      setMerchantBudgets(INITIAL_MERCHANT_BUDGETS);
    }
  };

  const handleUpdateProfile = (partial: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...partial };
    setUserProfile(updated);
    localStorage.setItem('fintrack_current_user', JSON.stringify(updated));

    // Update in saved credentials list
    const savedAccountsStr = localStorage.getItem('fintrack_saved_accounts');
    const accounts = savedAccountsStr ? JSON.parse(savedAccountsStr) : {};
    if (accounts[updated.email.toLowerCase()]) {
      accounts[updated.email.toLowerCase()] = {
        ...accounts[updated.email.toLowerCase()],
        ...updated
      };
      localStorage.setItem('fintrack_saved_accounts', JSON.stringify(accounts));
    }
  };

  const handleLogout = () => {
    setUserProfile(null);
    localStorage.removeItem('fintrack_current_user');
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setMerchantBudgets(INITIAL_MERCHANT_BUDGETS);
    setActiveTab('home');
  };

  const handleDeleteAccount = () => {
    if (userProfile) {
      const email = userProfile.email.toLowerCase().trim();
      const savedAccountsStr = localStorage.getItem('fintrack_saved_accounts');
      const accounts = savedAccountsStr ? JSON.parse(savedAccountsStr) : {};
      delete accounts[email];
      localStorage.setItem('fintrack_saved_accounts', JSON.stringify(accounts));
      
      localStorage.removeItem(`fintrack_transactions_db_${email}`);
      localStorage.removeItem(`fintrack_budgets_db_${email}`);
      localStorage.removeItem(`fintrack_merchants_db_${email}`);
    }
    
    localStorage.removeItem('fintrack_current_user');
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setMerchantBudgets(INITIAL_MERCHANT_BUDGETS);
    setUserProfile(null);
    setActiveTab('home');
  };

  const handleExportData = () => {
    const data = {
      transactions,
      budgets,
      merchantBudgets,
      userProfile,
      version: 'fintrack-v2.0'
    };
    return JSON.stringify(data, null, 2);
  };

  const handleImportData = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.transactions) && Array.isArray(parsed.budgets)) {
        const email = userProfile?.email.toLowerCase().trim() || parsed.userProfile?.email.toLowerCase().trim() || '';
        const txKey = email ? `fintrack_transactions_db_${email}` : 'fintrack_transactions_db';
        const budgetsKey = email ? `fintrack_budgets_db_${email}` : 'fintrack_budgets_db';
        const merchantsKey = email ? `fintrack_merchants_db_${email}` : 'fintrack_merchants_db';

        setTransactions(parsed.transactions);
        localStorage.setItem(txKey, JSON.stringify(parsed.transactions));
        
        setBudgets(parsed.budgets);
        localStorage.setItem(budgetsKey, JSON.stringify(parsed.budgets));

        if (Array.isArray(parsed.merchantBudgets)) {
          setMerchantBudgets(parsed.merchantBudgets);
          localStorage.setItem(merchantsKey, JSON.stringify(parsed.merchantBudgets));
        }

        if (parsed.userProfile) {
          setUserProfile(parsed.parsedProfile || parsed.userProfile);
          localStorage.setItem('fintrack_current_user', JSON.stringify(parsed.userProfile));
        }
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  // Helper title renderer for Top Header Mobile bar
  const getHeaderTitle = () => {
    const isBn = userProfile?.language === 'bn';
    switch (activeTab) {
      case 'home':
        return isBn ? 'ড্যাশবোর্ড ওভারভিউ' : 'Overview Dashboard';
      case 'graph':
        return isBn ? 'বিলিং রিপোর্ট' : 'Billing Reports';
      case 'transactions':
        return isBn ? 'লেনদেন রেকর্ডসমূহ' : 'Statement Logs';
      case 'category':
        return isBn ? 'মাসিক বাজেটসীমা' : 'Monthly Budgets';
      case 'settings':
        return isBn ? 'ডিভাইস সেটিংস' : 'Device Options';
      default:
        return 'FinTrack';
    }
  };

  if (!userProfile) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const isBengali = userProfile?.language === 'bn';

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 font-sans text-gray-800 dark:text-zinc-100 flex flex-col md:flex-row transition-colors duration-200">
      
       {/* 1. Large-screen Side Navigation Menu (md:flex hidden) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        onUpgrade={handleUpgradeAccount}
        userProfile={userProfile}
      />

      {/* Main viewport Container */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-6">
        
        {/* 2. Top Navigation Bar (Mobile & Adaptive Header) */}
        <header className="sticky top-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-gray-100 dark:border-zinc-900 z-30 px-6 py-4 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2.5">
            {/* Small Wallet Logo on mobile viewport */}
            <div className="md:hidden w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Wallet size={16} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none">
                {getHeaderTitle()}
              </h1>
              <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono tracking-wide mt-1.5 leading-none">
                {isBengali ? `হিসাব মাস: ${currentMonth}` : `Cycle Month: ${currentMonth}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Pro Badge if user upgraded */}
            {isPremium && (
              <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Award size={10} className="text-indigo-600 dark:text-indigo-400 fill-indigo-600/25" />
                <span>PRO</span>
              </span>
            )}

            {/* Dark mode toggle icon button specifically in header for quick mobile user click */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900 active:scale-95 transition-all text-center"
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={17} className="text-amber-500" /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        {/* 3. Screen Viewport Core Body */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto" id="main-viewport">
          
          {activeTab === 'home' && (
            <DashboardScreen 
              transactions={transactions} 
              budgets={budgets}
              currentMonth={currentMonth}
              onUpgrade={handleUpgradeAccount}
              onViewTransactions={() => setActiveTab('category')}
              currency={userProfile?.currency}
              language={userProfile?.language}
            />
          )}

          {activeTab === 'graph' && (
            <BillingReportsScreen 
              transactions={transactions}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              onOpenAddModal={() => setShowAddModal(true)}
              currency={userProfile?.currency}
              language={userProfile?.language}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsScreen 
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
              onEditTransaction={(tx) => {
                setEditingTransaction(tx);
                setShowEditModal(true);
              }}
              onClearAll={handleResetToFactory}
              currentMonth={currentMonth}
              currency={userProfile?.currency}
              language={userProfile?.language}
            />
          )}

          {activeTab === 'category' && (
            <BudgetScreen 
              budgets={budgets}
              merchantBudgets={merchantBudgets}
              transactions={transactions}
              currentMonth={currentMonth}
              currency={userProfile?.currency}
              language={userProfile?.language}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen 
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              isPremium={isPremium}
              onUpgrade={handleUpgradeAccount}
              onReset={handleResetToFactory}
              budgets={budgets}
              onUpdateBudget={handleUpdateBudgetLimit}
              userProfile={userProfile}
              onUpdateProfile={handleUpdateProfile}
              onLogout={handleLogout}
              onDeleteAccount={handleDeleteAccount}
              onExportData={handleExportData}
              onImportData={handleImportData}
            />
          )}
        </main>
      </div>

      {/* 4. Sticky Bottom Tab Navigation Bar for Phones (md:hidden) */}
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 5. Trigger Add Transactions Dialog Screen Modal */}
      <AddTransactionModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddTransaction}
        selectedMonth={currentMonth}
        currency={userProfile?.currency}
        language={userProfile?.language}
      />

      {/* 5.5 Trigger Edit Transactions Dialog Screen Modal */}
      <EditTransactionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleUpdateTransaction}
        transaction={editingTransaction}
        currency={userProfile?.currency}
        language={userProfile?.language}
      />

      {/* 6. High-end custom Sparkle upgraded congrats panel */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 p-6 rounded-3xl text-center border border-indigo-100 dark:border-zinc-800 shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Elegant Sparkles Graphic badge */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-200 dark:shadow-none mb-4.5">
              <Sparkles size={28} className="fill-amber-300 text-amber-300" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white font-sans">
              Upgrade Activated!
            </h3>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-2 leading-relaxed">
              Congratulations! All premium capabilities have been enabled on your local sandbox database. You have full access to pro charts.
            </p>

            <div className="flex flex-col gap-2.5 mt-5 bg-indigo-50/50 dark:bg-zinc-900/60 p-4 rounded-2xl text-left border border-indigo-100/30">
              <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-zinc-300 font-semibold">
                <Check size={14} className="text-indigo-600 dark:text-indigo-400 stroke-[3]" />
                <span>Unlimited Local Transaction SQL logs</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-zinc-300 font-semibold">
                <Check size={14} className="text-indigo-600 dark:text-indigo-400 stroke-[3]" />
                <span>Custom vendor budgets tracker</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-zinc-300 font-semibold">
                <Check size={14} className="text-indigo-600 dark:text-indigo-400 stroke-[3]" />
                <span>Seamless Dark Mode configurations</span>
              </div>
            </div>

            <button
              onClick={() => setShowUpgradeModal(false)}
              className="mt-6 w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg active:scale-98 transition-all"
              title="Close upgrade congrats modal"
            >
              Great, Let's Start
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

