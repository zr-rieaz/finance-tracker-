import React, { useRef, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Pill, 
  Utensils, 
  Shirt, 
  GraduationCap, 
  Car, 
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Building,
  Lightbulb,
  Tv,
  HelpCircle
} from 'lucide-react';
import { Transaction } from '../types';
import { DonutChart } from './DonutChart';
import { LanguageCode, displayBalance, getCategoryLabel, TRANSLATIONS } from '../utils';

interface BillingReportsScreenProps {
  transactions: Transaction[];
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  onOpenAddModal: () => void;
  currency?: string;
  language?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const BillingReportsScreen: React.FC<BillingReportsScreenProps> = ({
  transactions,
  currentMonth,
  setCurrentMonth,
  onOpenAddModal,
  currency = '৳',
  language = 'en'
}) => {
  const monthScrollRef = useRef<HTMLDivElement>(null);
  const currentLang = (language === 'bn' ? 'bn' : 'en') as LanguageCode;
  const t = TRANSLATIONS[currentLang];

  // Center selected month in scroll view on load
  useEffect(() => {
    if (monthScrollRef.current) {
      const activeEl = monthScrollRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentMonth]);

  // Filter transactions by SELECTED month and by EXPENSE type
  const monthlyExpenses = transactions.filter(
    (tx) => tx.month.toLowerCase() === currentMonth.toLowerCase() && tx.type === 'expense'
  );

  // Calculate total expense in display currency
  const totalExpense = monthlyExpenses.reduce((sum, tx) => sum + displayBalance(tx.amount, currency), 0);

  // Aggregate by Category (matching standard database keys in layout)
  const categoriesToTally: { [key: string]: { value: number; count: number; color: string; icon: any } } = {
    Food: { value: 0, count: 0, color: '#F97316', icon: Utensils }, // Orange
    Rent: { value: 0, count: 0, color: '#6366F1', icon: Building }, // Indigo/Purple
    Transport: { value: 0, count: 0, color: '#EC4899', icon: Car }, // Pink
    Health: { value: 0, count: 0, color: '#F43F5E', icon: Pill }, // Rose
    Education: { value: 0, count: 0, color: '#8B5CF6', icon: GraduationCap }, // Violet
    Entertainment: { value: 0, count: 0, color: '#EAB308', icon: Tv }, // Amber
    Utility: { value: 0, count: 0, color: '#14B8A6', icon: Lightbulb }, // Teal
    Shopping: { value: 0, count: 0, color: '#10B981', icon: Shirt }, // Emerald
    Other: { value: 0, count: 0, color: '#64748B', icon: HelpCircle } // Slate/Gray
  };

  monthlyExpenses.forEach((tx) => {
    // Normalise key to match existing structure case-insensitively
    const categoryKey = Object.keys(categoriesToTally).find(
      (k) => k.toLowerCase() === tx.category.toLowerCase()
    ) || 'Other';
    
    // Display converted balance
    const localizedVal = displayBalance(tx.amount, currency);
    categoriesToTally[categoryKey].value += localizedVal;
    categoriesToTally[categoryKey].count += 1;
  });

  // Calculate percentages & filter empty categories just for Donut Chart
  const donutData = Object.keys(categoriesToTally)
    .map((name) => {
      const value = categoriesToTally[name].value;
      const pct = totalExpense > 0 ? (value / totalExpense) * 100 : 0;
      return {
        name: getCategoryLabel(name, currentLang),
        value,
        color: categoriesToTally[name].color,
        percentage: pct
      };
    })
    .filter((item) => item.value > 0);

  // Vertical list display items (representing all categories with transactions > 0)
  const categorySummaryList = Object.keys(categoriesToTally)
    .map((name) => {
      const { value, count, color, icon: Icon } = categoriesToTally[name];
      return { name, value, count, color, icon: Icon };
    })
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value); // Descending sort order

  return (
    <div className="w-full flex flex-col gap-6 select-none max-w-4xl mx-auto py-2">
      {/* Scrollable Month Selector at top */}
      <div className="relative flex items-center bg-white dark:bg-zinc-950 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800 transition-colors">
        <button 
          onClick={() => {
            const idx = MONTHS.indexOf(currentMonth);
            if (idx > 0) setCurrentMonth(MONTHS[idx - 1]);
          }}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-500 dark:text-zinc-400 shrink-0"
          aria-label="Previous Month"
        >
          <ChevronLeft size={16} />
        </button>

        <div 
          ref={monthScrollRef}
          className="flex-1 flex gap-5 overflow-x-auto no-scrollbar scroll-smooth px-3 py-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {MONTHS.map((month) => {
            const isActive = month.toLowerCase() === currentMonth.toLowerCase();
            return (
              <button
                key={month}
                data-active={isActive}
                onClick={() => setCurrentMonth(month)}
                className={`py-1.5 px-4 rounded-xl text-sm font-semibold transition-all shrink-0 relative ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300'
                }`}
              >
                {currentLang === 'bn' && month === 'January' ? 'জানুয়ারি' : 
                 currentLang === 'bn' && month === 'February' ? 'ফেব্রুয়ারি' :
                 currentLang === 'bn' && month === 'March' ? 'মার্চ' :
                 currentLang === 'bn' && month === 'April' ? 'এপ্রিল' :
                 currentLang === 'bn' && month === 'May' ? 'মে' :
                 currentLang === 'bn' && month === 'June' ? 'জুন' :
                 currentLang === 'bn' && month === 'July' ? 'জুলাই' :
                 currentLang === 'bn' && month === 'August' ? 'আগস্ট' :
                 currentLang === 'bn' && month === 'September' ? 'সেপ্টেম্বর' :
                 currentLang === 'bn' && month === 'October' ? 'অক্টোবর' :
                 currentLang === 'bn' && month === 'November' ? 'নভেম্বর' :
                 currentLang === 'bn' && month === 'December' ? 'ডিসেম্বর' : month}
                {isActive && (
                  <span className="absolute bottom-0 left-12 right-12 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
              </button>
            );
          })}
        </div>

        <button 
          onClick={() => {
            const idx = MONTHS.indexOf(currentMonth);
            if (idx < MONTHS.length - 1) setCurrentMonth(MONTHS[idx + 1]);
          }}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-500 dark:text-zinc-400 shrink-0"
          aria-label="Next Month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Main Grid: Responsive 1 or 2 Column depending on screens */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Graph & Stats Section */}
        <div className="md:col-span-6 flex flex-col gap-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-0 px-1">
            {currentLang === 'bn' ? 'ব্যয় বিশ্লেষণ' : 'Expenses Overview'}
          </h2>
          {donutData.length > 0 ? (
            <DonutChart data={donutData} totalAmount={totalExpense} currency={currency} />
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-10 flex flex-col items-center justify-center text-center animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500 mb-4 animate-pulse">
                <TrendingDown size={20} />
              </div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                {currentLang === 'bn' ? 'কোনো ব্যয়ের রেকর্ড পাওয়া যায়নি' : 'No expense entries found'}
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 max-w-[200px]">
                {currentLang === 'bn' ? 'বাজেট বাটন দিয়ে একটি নতুন বিবরণ যুক্ত করুন।' : 'Create a new transaction using the floating budget button.'}
              </p>
            </div>
          )}
        </div>

        {/* Transaction Categories Summary List */}
        <div className="md:col-span-6 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 animate-fadeIn">
              {currentLang === 'bn' ? 'লেনদেনের সারসংক্ষেপ' : 'Recent Transactions'}
            </h2>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full border border-indigo-100 dark:border-zinc-800 leading-none">
              {monthlyExpenses.length} {currentLang === 'bn' ? 'টি এন্ট্রি' : 'entries'}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {categorySummaryList.length > 0 ? (
              categorySummaryList.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xs hover:translate-x-1 transition-transform animate-fadeIn"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Stylized rounded colored category background circle */}
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: item.color }}
                      >
                        <Icon size={18} className="stroke-[2.2]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800 dark:text-white leading-none">
                          {getCategoryLabel(item.name, currentLang)}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-zinc-500 mt-2 leading-none font-medium">
                          {item.count} {currentLang === 'bn' ? 'টি লেনদেন' : `transaction${item.count > 1 ? 's' : ''}`}
                        </span>
                      </div>
                    </div>
                    <span 
                      className="text-sm font-bold text-gray-950 dark:text-gray-50 font-mono select-all"
                    >
                      {currency}{item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-12 text-center text-gray-400 animate-fadeIn">
                <p className="text-xs font-medium">
                  {currentLang === 'bn' ? `${currentMonth} এর জন্য কোনো রেকর্ড নেই।` : `No records available for ${currentMonth}.`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Mobile / Adaptive FAB button aligned to viewport bounds */}
      <button
        onClick={onOpenAddModal}
        className="fixed bottom-20 md:bottom-8 right-6 md:right-10 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-108 active:scale-92 transition-all group z-40 cursor-pointer"
        title={currentLang === 'bn' ? 'যুক্ত করুন' : 'Add Entry'}
      >
        <Plus size={26} className="transition-transform duration-200 group-hover:rotate-90 stroke-[2.5]" />
      </button>
    </div>
  );
};
