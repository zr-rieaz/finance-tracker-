import React, { useState } from 'react';
import { 
  Library, 
  Car, 
  GraduationCap, 
  Pill, 
  Utensils, 
  Store, 
  Briefcase, 
  ShoppingBag, 
  PlusCircle, 
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Budget, MerchantBudget, Transaction } from '../types';
import { TRANSLATIONS, LanguageCode, displayBalance, getCategoryLabel } from '../utils';
import { LineGraph } from './LineGraph';
import { getCategoryIconComponent } from './DashboardScreen';

interface BudgetScreenProps {
  budgets: Budget[];
  merchantBudgets: MerchantBudget[];
  transactions: Transaction[];
  currentMonth: string;
  currency?: string;
  language?: string;
}

export const BudgetScreen: React.FC<BudgetScreenProps> = ({
  budgets,
  merchantBudgets,
  transactions,
  currentMonth,
  currency = '৳',
  language = 'en'
}) => {
  const currentLang = (language === 'bn' ? 'bn' : 'en') as LanguageCode;
  const t = TRANSLATIONS[currentLang];
  const [activeSubTab, setActiveSubTab] = useState<'CATEGORIES' | 'MERCHANTS'>('CATEGORIES');

  // Filter transactions for current month to compute spending trend
  const currentMonthExpenses = transactions.filter(
    (tx) => tx.month.toLowerCase() === currentMonth.toLowerCase() && tx.type === 'expense'
  );

  const totalSpentInMonthUSD = currentMonthExpenses.reduce((sum, tx) => sum + tx.amount, 0);
  const totalSpentInMonth = displayBalance(totalSpentInMonthUSD, currency);

  // Calculate spending trend using real cumulative values for [1, 5, 10, 15, 20, 25, 30] day intervals
  const normalizedTrend: { [day: number]: number } = {};
  const checkDays = [1, 5, 10, 15, 20, 25, 30];

  checkDays.forEach((dayLimit) => {
    const usdSpentUpToDay = currentMonthExpenses
      .filter((tx) => {
        const dayVal = parseInt(tx.date.split('-')[2]);
        return !isNaN(dayVal) && dayVal <= dayLimit;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
    normalizedTrend[dayLimit] = displayBalance(usdSpentUpToDay, currency);
  });

  const displayTotalValueValue = totalSpentInMonth;

  const daysRemaining = 31 - new Date().getDate();

  const getMerchantIcon = (iconName: string) => {
    switch (iconName) {
      case 'Store': return Store;
      case 'Briefcase': return Briefcase;
      case 'ShoppingBag': return ShoppingBag;
      case 'PlusCircle': return PlusCircle;
      default: return Store;
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 select-none max-w-4xl mx-auto py-2 transition-all">
      
      {/* Large high-end Top Section with vibrant Purple theme containing the line chart */}
      <div className="bg-gradient-to-b from-[#7B3FF2] to-indigo-700 dark:from-zinc-900 dark:to-zinc-950 p-6.5 rounded-3xl text-white shadow-xl shadow-indigo-120/40 dark:shadow-none transition-all">
        
        {/* Title & Static/Dynamic Amount display */}
        <div className="flex flex-col items-center justify-center text-center py-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100/70 dark:text-zinc-400">
            {currentMonth} {t.totalSpentMonth}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl font-black font-sans tracking-tight">
              {currency}{Math.floor(displayTotalValueValue).toLocaleString('en-US')}
            </span>
            <span className="text-lg font-bold">
              .{(displayTotalValueValue % 1).toFixed(2).split('.')[1]}
            </span>
          </div>
          <span className="text-[10px] font-bold text-indigo-100/80 mt-1.5 uppercase tracking-wider font-mono">
            {currentLang === 'bn' ? `লিমিট চক্র রিফ্রেশ হবে ${daysRemaining} দিনে` : `Cycle Refreshes in ${daysRemaining} Days`}
          </span>
        </div>

        {/* Dynamic White Line graph tracking spending */}
        <div className="mt-4">
          <LineGraph monthlySpendingByDay={normalizedTrend} currency={currency} />
        </div>
      </div>

      {/* Sub Tabs Toggle (CATEGORIES vs MERCHANTS) */}
      <div className="flex bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-1.5 transition-colors shadow-xs">
        <button
          onClick={() => setActiveSubTab('CATEGORIES')}
          className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'CATEGORIES'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300'
          }`}
        >
          {currentLang === 'bn' ? 'ক্যাটাগরি ভিত্তিক বাজেট' : 'Category Budgets'}
        </button>
        <button
          onClick={() => setActiveSubTab('MERCHANTS')}
          className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'MERCHANTS'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300'
          }`}
        >
          {currentLang === 'bn' ? 'মার্চেন্ট ভিত্তিক বাজেট' : 'Merchant Budgets'}
        </button>
      </div>

      {/* Card lists with progress limits */}
      <div className="flex flex-col gap-4">
        {activeSubTab === 'CATEGORIES' ? (
          budgets.map((item) => {
            const limitDisplay = displayBalance(item.limit, currency);
            const spentDisplay = displayBalance(item.spent, currency);
            const percent = limitDisplay > 0 ? (spentDisplay / limitDisplay) * 100 : 0;
            const isExceeded = spentDisplay > limitDisplay;
            const isNearing = (limitDisplay > 0 && spentDisplay / limitDisplay > 0.8) && !isExceeded;
            const Icon = getCategoryIconComponent(item.category);

            // Dynamically translate standard status messages
            let statusText = item.statusMessage;
            if (currentLang === 'bn') {
              if (isExceeded) {
                statusText = 'সীমা অতিক্রম করেছে! অবিলম্বে খরচ কমান।';
              } else if (isNearing) {
                statusText = 'সতর্কতা! আপনি বাজেটের সর্বোচ্চ সীমার কাছাকাছি আছেন।';
              } else {
                statusText = 'আপনার বাজেট সীমায় আছে। চমৎকার খরচ নিয়ন্ত্রণ!';
              }
            }

            return (
              <div
                key={item.category}
                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 hover:scale-[1.01] transition-all flex flex-col gap-4 shadow-xs"
              >
                {/* Header detail */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Icon size={18} className="stroke-[2.2]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-800 dark:text-white leading-none">
                        {getCategoryLabel(item.category, currentLang)}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-2 leading-none font-semibold uppercase tracking-wider">
                        {t.limitShield}
                      </span>
                    </div>
                  </div>

                  {/* Limit text */}
                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {currency}{spentDisplay.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 ml-1.5 font-sans leading-none font-medium">
                      of {currency}{limitDisplay.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Customized Horizontal progress line */}
                <div className="w-full h-2.5 bg-gray-100 dark:bg-zinc-805 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isExceeded 
                        ? 'bg-rose-500' 
                        : isNearing 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>

                {/* Status Indicator Statement Inside the Budget card */}
                <div 
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                    isExceeded
                      ? 'bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-400'
                      : isNearing
                        ? 'bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-53/80 dark:bg-emerald-955/15 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isExceeded ? (
                    <AlertTriangle size={14} className="shrink-0" />
                  ) : isNearing ? (
                    <Info size={14} className="shrink-0" />
                  ) : (
                    <CheckCircle size={14} className="shrink-0 animate-pulse" />
                  )}
                  <span className="leading-tight text-[11px]">
                    {statusText}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          merchantBudgets.map((item) => {
            const limitDisplay = displayBalance(item.limit, currency);
            const spentDisplay = displayBalance(item.spent, currency);
            const percent = limitDisplay > 0 ? (spentDisplay / limitDisplay) * 100 : 0;
            const isExceeded = spentDisplay > limitDisplay;
            const isNearing = (limitDisplay > 0 && spentDisplay / limitDisplay > 0.8) && !isExceeded;
            const Icon = getMerchantIcon(item.icon);

            let statusText = item.statusMessage;
            if (currentLang === 'bn') {
              if (isExceeded) {
                statusText = 'মার্চেন্ট খরচ সীমা অতিক্রম করেছে!';
              } else if (isNearing) {
                statusText = 'সতর্কতা! এই মার্চেন্টে আপনার বরাদ্দ শেষের পথে।';
              } else {
                statusText = 'মার্চেন্ট বাজেট নিয়ন্ত্রণে আছে।';
              }
            }

            return (
              <div
                key={item.merchant}
                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 hover:scale-[1.01] transition-all flex flex-col gap-4 shadow-xs"
              >
                {/* Header detail */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Icon size={18} className="stroke-[2.2]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-800 dark:text-white leading-none">
                        {item.merchant}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-2 leading-none font-semibold uppercase tracking-wider">
                        {currentLang === 'bn' ? 'পছন্দের মার্চেন্ট' : 'Preferred Vendor'}
                      </span>
                    </div>
                  </div>

                  {/* Limit text */}
                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400 font-mono">
                      {currency}{spentDisplay.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 ml-1.5 font-sans leading-none font-medium">
                      of {currency}{limitDisplay.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-gray-100 dark:bg-zinc-805 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isExceeded 
                        ? 'bg-rose-500' 
                        : isNearing 
                          ? 'bg-amber-500' 
                          : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>

                {/* Status Indicator Statement Inside the Budget card */}
                <div 
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                    isExceeded
                      ? 'bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-450'
                      : isNearing
                        ? 'bg-amber-50 dark:bg-amber-955/20 text-amber-500 dark:text-amber-400'
                        : 'bg-indigo-50/60 dark:bg-indigo-955/20 text-indigo-600 dark:text-indigo-300'
                  }`}
                >
                  {isExceeded ? (
                    <AlertTriangle size={14} className="shrink-0" />
                  ) : isNearing ? (
                    <Info size={14} className="shrink-0" />
                  ) : (
                    <CheckCircle size={14} className="shrink-0" />
                  )}
                  <span className="leading-tight text-[11px]">
                    {statusText}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
