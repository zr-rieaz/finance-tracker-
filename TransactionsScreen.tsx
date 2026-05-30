import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Edit2,
  ArrowDownLeft, 
  ArrowUpRight, 
  Filter, 
  Calendar,
  Layers
} from 'lucide-react';
import { Transaction } from '../types';
import { TRANSLATIONS, LanguageCode, displayBalance, getCategoryLabel } from '../utils';

interface TransactionsScreenProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onClearAll: () => void;
  currentMonth: string;
  currency?: string;
  language?: string;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  transactions,
  onDeleteTransaction,
  onEditTransaction,
  onClearAll,
  currentMonth,
  currency = '৳',
  language = 'en'
}) => {
  const currentLang = (language === 'bn' ? 'bn' : 'en') as LanguageCode;
  const t = TRANSLATIONS[currentLang];

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Find unique categories from global transaction state
  const categories: string[] = ['all', ...Array.from(new Set<string>(transactions.map((tx) => tx.category)))];

  // Perform search & bounds checking
  const filtered = transactions.filter((tx) => {
    const matchesSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
    const matchesDate = !dateFilter || tx.date === dateFilter;
    return matchesSearch && matchesType && matchesCategory && matchesDate;
  }).sort((a, b) => b.date.localeCompare(a.date)); // Sort by date descending

  const handleClearAlert = () => {
    if (window.confirm(t.confirmClear)) {
      onClearAll();
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 select-none max-w-4xl mx-auto py-2 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white font-sans tracking-tight">
            {currentLang === 'bn' ? 'লেনদেনের বিস্তারিত রেকর্ড' : 'Transaction Logs'}
          </h2>
          <p className="text-xs text-gray-450 dark:text-zinc-500 mt-1">
            {currentLang === 'bn' ? 'আপনার স্যান্ডবক্স লেজার খুঁজুন, ফিল্টার করুন এবং নিখুঁত হিসাব রাখুন' : 'Search, filter, and audit local database records'}
          </p>
        </div>
        <button
          onClick={handleClearAlert}
          className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-950/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold self-start sm:self-auto active:scale-95 transition-all cursor-pointer"
        >
          {t.clearAll}
        </button>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 flex flex-col gap-4 shadow-xs transition-colors">
        {/* Search & Date Input row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-3.5 text-gray-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200 font-medium transition-all"
            />
          </div>

          <div className="relative shrink-0 sm:w-56">
            <Calendar size={14} className="absolute left-4 top-3.5 text-indigo-500" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200 font-medium transition-all font-mono"
              title={currentLang === 'bn' ? 'তারিখ দিয়ে খুঁজুন' : 'Search by specific date'}
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-rose-500 font-black text-[13px] p-0.5 cursor-pointer leading-none"
                title={currentLang === 'bn' ? 'ফিল্টার পরিষ্কার করুন' : 'Clear search date'}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Type trigger */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1 font-sans">
              <Filter size={11} /> {currentLang === 'bn' ? 'লেনদেনের ধরণ' : 'Transaction Type'}
            </span>
            <div className="flex bg-gray-50 dark:bg-zinc-950 p-1 rounded-xl border border-gray-150 dark:border-zinc-800">
              {(['all', 'expense', 'income'] as const).map((typeVal) => (
                <button
                  key={typeVal}
                  onClick={() => setTypeFilter(typeVal)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    typeFilter === typeVal
                      ? 'bg-white dark:bg-zinc-850 text-indigo-650 dark:text-white shadow-xs font-extrabold'
                      : 'text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
                  }`}
                >
                  {typeVal === 'all' ? t.all : typeVal === 'expense' ? t.expense : t.income}
                </button>
              ))}
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1 font-sans">
              <Layers size={11} /> {currentLang === 'bn' ? 'ক্যাটাগরি ফিল্টার' : 'Filter Category'}
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-700 dark:text-zinc-350 focus:border-indigo-500 focus:outline-none font-semibold transition-colors"
            >
              <option value="all">{currentLang === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
              {categories.filter(c => c !== 'all').map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat, currentLang)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs transition-colors">
        <div className="px-5 py-4.5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest leading-none font-sans">
            {currentLang === 'bn' ? `অনুসন্ধান ফলাফল (${filtered.length})` : `Query Results (${filtered.length})`}
          </span>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-zinc-800/60 max-h-[500px] overflow-y-auto">
          {filtered.length > 0 ? (() => {
            // Group transactions by date
            const grouped: { [date: string]: Transaction[] } = {};
            filtered.forEach((tx) => {
              const dt = tx.date;
              if (!grouped[dt]) {
                grouped[dt] = [];
              }
              grouped[dt].push(tx);
            });

            const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

            return sortedDates.map((dateStr) => {
              const dayTransactions = grouped[dateStr];
              
              const dayExpenseUSD = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
              const dayIncomeUSD = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
              const dayExpense = displayBalance(dayExpenseUSD, currency);
              const dayIncome = displayBalance(dayIncomeUSD, currency);

              let prettyDate = dateStr;
              try {
                const d = new Date(dateStr + "T00:00:00");
                if (!isNaN(d.getTime())) {
                  const currentYear = 2026;
                  const transactionYear = d.getFullYear();
                  
                  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
                  const monthName = d.toLocaleDateString('en-US', { month: 'short' });
                  const dayNum = d.getDate();
                  
                  if (transactionYear === currentYear) {
                    prettyDate = `${weekday}, ${monthName} ${dayNum}`;
                  } else {
                    prettyDate = `${weekday}, ${monthName} ${dayNum}, ${transactionYear}`;
                  }
                }
              } catch (e) {
                // fallback
              }

              return (
                <div key={dateStr} className="flex flex-col animate-fadeIn">
                  {/* Google Photos-style Date Banner */}
                  <div className="bg-gray-50/90 dark:bg-zinc-900/90 px-5 py-2.5 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md border-y border-gray-100/65 dark:border-zinc-800/50">
                    <span className="text-[13px] md:text-sm font-extrabold text-gray-800 dark:text-zinc-200 font-sans flex items-center gap-2 animate-fadeIn">
                      <Calendar size={15} className="text-indigo-500 stroke-[2.2]" />
                      {prettyDate}
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      {dayIncome > 0 && (
                        <span className="text-[10px] font-bold text-emerald-605 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md">
                          +{currency}{dayIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}
                        </span>
                      )}
                      {dayExpense > 0 && (
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-455 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-md">
                          -{currency}{dayExpense.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Transactions of this date */}
                  <div className="divide-y divide-gray-100/60 dark:divide-zinc-800/40">
                    {dayTransactions.map((tx) => {
                      const displayTxAmount = displayBalance(tx.amount, currency);
                      return (
                        <div
                          key={tx.id}
                          className="p-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-zinc-850/40 transition-colors group animate-fadeIn"
                        >
                          <div className="flex items-center gap-4.5">
                            {/* Circle graphic type indicator */}
                            <div
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs transition-colors shrink-0 ${
                                tx.type === 'expense'
                                  ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500'
                                  : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500'
                              }`}
                            >
                              {tx.type === 'expense' ? (
                                <ArrowDownLeft size={16} className="stroke-[2.5]" />
                              ) : (
                                <ArrowUpRight size={16} className="stroke-[2.5]" />
                              )}
                            </div>

                            <div className="flex flex-col select-all">
                              <span className="text-xs font-bold text-gray-800 dark:text-white leading-tight">
                                {tx.title}
                              </span>
                              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1.5 text-[10px] text-gray-450 dark:text-zinc-500 font-semibold">
                                {tx.merchant && (
                                  <>
                                    <span className="font-bold text-gray-600 dark:text-zinc-400">{tx.merchant}</span>
                                    <span>•</span>
                                  </>
                                )}
                                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{getCategoryLabel(tx.category, currentLang)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-xs font-black font-mono select-all mr-2 ${
                                tx.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'
                              }`}
                            >
                              {tx.type === 'expense' ? '-' : '+'}{currency}{displayTxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>

                            {/* Edit Button */}
                            <button
                              onClick={() => onEditTransaction(tx)}
                              className="p-2 text-gray-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                              title={currentLang === 'bn' ? 'সম্পাদনা করুন' : 'Edit record'}
                            >
                              <Edit2 size={13} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => onDeleteTransaction(tx.id)}
                              className="p-2 text-gray-400 dark:text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                              title={currentLang === 'bn' ? 'মুছে ফেলুন' : 'Delete record'}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            });
          })() : (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-400 mb-4">
                <Search size={20} />
              </div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-zinc-300">
                {currentLang === 'bn' ? 'কোনো লেনদেন মিলছে না' : 'No transactions match'}
              </h3>
              <p className="text-xs text-gray-450 dark:text-zinc-500 mt-1 uppercase font-semibold">
                {currentLang === 'bn' ? 'অনুগ্রহ করে ভিন্ন কিছু দিয়ে খুঁজুন' : 'Try revising your filters or search keywords'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
