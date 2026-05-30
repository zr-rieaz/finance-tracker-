import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { Transaction } from '../types';
import { TRANSLATIONS, LanguageCode, getCategoryLabel } from '../utils';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  selectedMonth?: string;
  currency?: string;
  language?: string;
}

const CATEGORIES: Transaction['category'][] = [
  'Food',
  'Rent',
  'Transport',
  'Health',
  'Education',
  'Entertainment',
  'Utility',
  'Shopping',
  'Income',
  'Other'
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedMonth = 'June',
  currency = '৳',
  language = 'en'
}) => {
  const currentLang = (language === 'bn' ? 'bn' : 'en') as LanguageCode;
  const t = TRANSLATIONS[currentLang];

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Transaction['category']>('Other');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [date, setDate] = useState(() => {
    // Current date in YYYY-MM-DD
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [merchant, setMerchant] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    if (newType === 'income') {
      setCategory('Income');
    } else {
      setCategory('Other');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError(currentLang === 'bn' ? 'অনুগ্রহ করে বিবরণ প্রদান করুন।' : 'Please provide a description/title');
      return;
    }

    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      setError(currentLang === 'bn' ? 'অনুগ্রহ করে সঠিক পরিমাণ প্রদান করুন।' : 'Please provide a valid transaction amount greater than 0');
      return;
    }

    // Merchant is now completely optional. If income, we ignore merchant input or set it blank.
    const finalMerchant = type === 'expense' ? merchant.trim() : '';

    // Determine the Month string from date input
    const parsedDate = new Date(date);
    const monthIndex = parsedDate.getMonth();
    const monthName = MONTHS[monthIndex];

    onSubmit({
      title: title.trim(),
      amount: value,
      category,
      type,
      date,
      month: monthName,
      merchant: finalMerchant
    });

    // Reset fields
    setTitle('');
    setAmount('');
    setCategory('Other');
    setType('expense');
    setMerchant('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-155"
        role="dialog"
        aria-modal="true"
      >
        {/* Header decoration */}
        <div className="bg-indigo-600 dark:bg-zinc-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Plus size={16} className="text-white" />
            </div>
            <span className="font-bold font-sans">{t.addTransaction}</span>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white cursor-pointer"
            title="Close Modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Inputs Body */}
        <form onSubmit={handleFormSubmit} className="p-6 flex flex-col gap-4.5 bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-200">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 p-3 rounded-2xl flex items-center gap-2 border border-rose-100 dark:border-rose-900/40 text-[11px] font-semibold">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Toggle Type Section */}
          <div className="flex bg-gray-100 dark:bg-zinc-900 p-1 rounded-2xl border border-gray-200/50 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-white shadow-xs font-extrabold'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
              }`}
            >
              {t.expense} (-)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-white shadow-xs font-extrabold'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
              }`}
            >
              {t.income} (+)
            </button>
          </div>

          {/* Input Details */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{t.txTitleLabel}</label>
            <input
              type="text"
              placeholder={t.txTitlePlaceholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{t.amountLabel} ({currency})</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-colors font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{t.categoryLabel}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Transaction['category'])}
                className="w-full px-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-colors font-medium text-gray-700 dark:text-zinc-250"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryLabel(cat, currentLang)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={`grid gap-4 ${type === 'expense' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div className="flex flex-col gap-1.5 animate-fadeIn">
              <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{t.dateLabel}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-colors font-mono"
              />
            </div>

            {type === 'expense' && (
              <div className="flex flex-col gap-1.5 animate-fadeIn">
                <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                  {t.merchantLabel} <span className="text-[9px] text-gray-400 dark:text-zinc-550 font-normal">({currentLang === 'bn' ? 'ঐচ্ছিক' : 'Optional'})</span>
                </label>
                <input
                  type="text"
                  placeholder={t.merchantPlaceholder}
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full px-4 py-3 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none transition-colors"
                />
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex gap-3 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-semibold rounded-2xl bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 active:scale-98 transition-all border border-gray-100 dark:border-zinc-800 cursor-pointer"
            >
              {currentLang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 text-xs font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 dark:shadow-none active:scale-98 transition-all cursor-pointer"
            >
              {t.saveBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
