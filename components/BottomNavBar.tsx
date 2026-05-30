import React from 'react';
import { 
  Home, 
  PieChart, 
  ArrowLeftRight, 
  Sliders, 
  Settings as SettingsIcon 
} from 'lucide-react';

interface BottomNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'graph', label: 'Graph', icon: PieChart },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'category', label: 'Category', icon: Sliders },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-gray-100 dark:border-zinc-800 z-40 transition-colors duration-200">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 relative group focus:outline-none"
            >
              {/* Highlight background dot */}
              {isActive && (
                <span className="absolute -top-1 w-10 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all" />
              )}
              
              <Icon 
                size={20} 
                className={`transition-all duration-200 ${
                  isActive 
                    ? 'text-indigo-600 dark:text-indigo-400 stroke-[2.5] scale-110' 
                    : 'text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 stroke-[1.8]'
                }`}
              />
              
              <span 
                className={`text-[10px] mt-1 font-medium tracking-wide transition-all ${
                  isActive 
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold' 
                    : 'text-gray-400 dark:text-zinc-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
