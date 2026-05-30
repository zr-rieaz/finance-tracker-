import React from 'react';
import { 
  Home, 
  PieChart, 
  ArrowLeftRight, 
  Sliders, 
  Settings as SettingsIcon,
  Sparkles,
  Wallet,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onUpgrade: () => void;
  userProfile?: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  darkMode, 
  setDarkMode,
  onUpgrade,
  userProfile
}) => {
  const isBengali = userProfile?.language === 'bn';
  
  const menuItems = [
    { id: 'home', label: isBengali ? 'ড্যাশবোর্ড' : 'Home', icon: Home },
    { id: 'graph', label: isBengali ? 'বিলিং রিপোর্ট' : 'Graph', icon: PieChart },
    { id: 'transactions', label: isBengali ? 'লেনদেন রেকর্ড' : 'Transactions', icon: ArrowLeftRight },
    { id: 'category', label: isBengali ? 'মাসিক বাজেট' : 'Category', icon: Sliders },
    { id: 'settings', label: isBengali ? 'সেটিংস' : 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-zinc-950 border-r border-gray-100 dark:border-zinc-800 min-h-screen flex-col justify-between p-6 md:flex hidden sticky top-0 transition-colors duration-200">
      <div className="flex flex-col gap-8">
        {/* Logo Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-none">
            <Wallet size={20} className="stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-gray-900 dark:text-white leading-none">FinTrack</span>
            <span className="text-xs text-gray-400 dark:text-zinc-500 mt-1 font-mono tracking-wider">v1.2.0</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5" aria-label="Sidebar main navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl text-sm font-semibold transition-all group ${
                  isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold scale-[1.02] shadow-sm'
                    : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900/60 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon 
                  size={19} 
                  className={`transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-indigo-600 dark:text-indigo-400 stroke-[2.5]' : 'stroke-[1.8]'
                  }`} 
                />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-6 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        {/* Theme Controller inside Sidebar */}
        <div className="bg-gray-50 dark:bg-zinc-900 p-3 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-zinc-800 transition-colors">
          <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 ml-2">
            {isBengali ? 'থিম কাস্টমাইজ' : 'Theme Mode'}
          </span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 shadow-sm border border-gray-100 dark:border-zinc-700 hover:scale-105 active:scale-95 transition-all"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} />}
          </button>
        </div>

        {/* All Premium Features Free Badge - Declarative assurance */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4.5 rounded-3xl text-white shadow-xl shadow-indigo-150 dark:shadow-none flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-300 fill-amber-300 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {isBengali ? 'FinTrack ফুল ভার্সন' : 'Full Version Active'}
            </span>
          </div>
          <p className="text-xs leading-relaxed opacity-90">
            {isBengali 
              ? 'সকল প্রিমিয়াম ফিচারসমূহ কোনো চার্জ ছাড়াই আপনি আজীবন সম্পূর্ণ নিখরচায় ব্যবহার করতে পারবেন।' 
              : 'All premium features are unlocked and fully active for free, forever!'}
          </p>
        </div>
      </div>
    </aside>
  );
};
