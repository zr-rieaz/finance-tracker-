import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  Trash2, 
  Database, 
  Lock,
  User,
  Mail,
  Bell,
  Download,
  Upload,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Sun,
  Moon
} from 'lucide-react';
import { Budget, UserProfile } from '../types';
import { TRANSLATIONS, LanguageCode, displayBalance, convertInputToUSD, getCategoryLabel } from '../utils';

interface SettingsScreenProps {
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  isPremium: boolean;
  onUpgrade: () => void;
  onReset: () => void;
  budgets: Budget[];
  onUpdateBudget: (category: string, newLimit: number) => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile> & { password?: string }) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onImportData: (dataStr: string) => boolean;
  onExportData: () => string;
}

const LOCAL_TRANSLATIONS = {
  en: {
    title: "Settings & Preferences",
    subtitle: "Adjust sandbox parameters, profile, currency, notifications, and backups.",
    profile: "Profile Settings",
    name: "Full Name",
    email: "Email Address",
    avatar: "Profile Image Link",
    password: "New Password",
    lang: "Language & Currency",
    currency: "Default Currency",
    language: "App Language",
    notifications: "Notifications & Alerts",
    notifRemind: "Transaction Reminders",
    notifRemindDesc: "Get gentle daily alerts to record expenses",
    notifLimit: "Budget Limit Warnings",
    notifLimitDesc: "Receive warnings when exceeding 80% category limit",
    backup: "Data Backup & Restore",
    backupDesc: "Download offline data backups securely as a local JSON file or restore a past checkpoint.",
    backupBtn: "Export JSON Backup",
    restoreBtn: "Restore from backup",
    restoreSucceed: "Backup imported successfully!",
    restoreFailed: "Invalid backup format! Please use a valid FinTrack JSON file.",
    dangerZone: "Danger Zone",
    logout: "Sign Out of Account",
    delete: "Delete Account Permanently",
    deleteConfirm: "This will permanently purge your local profile, transactions, budgets, settings, and reload the login phase. Are you absolutely sure?",
    saveProfile: "Save Profile Changes",
    profileUpdated: "Profile information saved successfully!",
    limitsTitle: "Category Budget Ceilings"
  },
  bn: {
    title: "সেটিংস এবং সেটিংস কাস্টমাইজেশন",
    subtitle: "স্যান্ডবক্স প্যারামিটার, প্রোফাইল, মুদ্রা, নোটিফিকেশন এবং ব্যাকআপ সামঞ্জস্য করুন।",
    profile: "প্রোফাইল সেটিংস",
    name: "পূর্ণ নাম",
    email: "ইমেইল ঠিকানা",
    avatar: "প্রোফাইল ছবির লিংক",
    password: "নতুন পাসওয়ার্ড",
    lang: "ভাষা ও কারেন্সি",
    currency: "ডিফল্ট মুদ্রা",
    language: "অ্যাপের ভাষা",
    notifications: "নোটিফিকেশন ও অ্যালার্ট",
    notifRemind: "লেনদেনের রিমাইন্ডার",
    notifRemindDesc: "প্রতিদিনের খরচ রেকর্ড করার জন্য পুশ নোটিফিকেশন",
    notifLimit: "বাজেট সীমা অতিক্রমের নোটিফিকেশন",
    notifLimitDesc: "ক্যাটাগরির ৮০% সীমা অতিক্রম করলে সতর্কবার্তা পাঠানো হবে",
    backup: "ডেটা ব্যাকআপ ও রিস্টোর",
    backupDesc: "নিরাপদে আপনার বর্তমান ডেটা একটি লোকাল JSON ফাইল হিসেবে ডাউনলোড করুন বা পুরানো ব্যাকআপ পুনরুদ্ধার করুন।",
    backupBtn: "JSON ব্যাকআপ এক্সপোর্ট করুন",
    restoreBtn: "ব্যাকআপ রিস্টোর করুন",
    restoreSucceed: "ডেটা সফলভাবে রিস্টোর করা হয়েছে!",
    restoreFailed: "ভুল ব্যাকআপ ফাইল! অনুগ্রহ করে সঠিক FinTrack JSON ব্যবহার করুন।",
    dangerZone: "ডেঞ্জার জোন (ঝুঁকিপূর্ণ)",
    logout: "অ্যাকাউন্ট থেকে লগআউট করুন",
    delete: "অ্যাকাউন্ট চিরতরে মুছে ফেলুন",
    deleteConfirm: "এর ফলে আপনার লোকাল প্রোফাইল, লেনদেন, পুরো বাজেট এবং যাবতীয় রেকর্ড চিরতরে মুছে যাবে। আপনি কি নিশ্চিত?",
    saveProfile: "প্রোফাইল আপডেট করুন",
    profileUpdated: "প্রোফাইল তথ্য সফলভাবে সেভ করা হয়েছে!",
    limitsTitle: "ক্যাটেগরি বাজেট সীমা পরিবর্তন করুন"
  }
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  darkMode,
  setDarkMode,
  isPremium,
  onUpgrade,
  onReset,
  budgets,
  onUpdateBudget,
  userProfile,
  onUpdateProfile,
  onLogout,
  onDeleteAccount,
  onImportData,
  onExportData
}) => {
  const currentLang = (userProfile.language === 'bn' ? 'bn' : 'en') as LanguageCode;
  const t = LOCAL_TRANSLATIONS[currentLang];

  // Forms local states
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [avatar, setAvatar] = useState(userProfile.avatar);
  const [password, setPassword] = useState('••••••••••••');
  const [isPassEditing, setIsPassEditing] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [backupFeedback, setBackupFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // PIN Verification Overlay and Factory reset states
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'RESET' | 'DELETE' | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isPinVerified, setIsPinVerified] = useState(false);

  const handleResetClick = () => {
    setPendingAction('RESET');
    setPinInput('');
    setPinError('');
    setIsPinVerified(false);
    setShowPinModal(true);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save profile change including password if edited
    const profileUpdates: Partial<UserProfile> & { password?: string } = {
      name,
      email,
      avatar,
    };

    if (isPassEditing && password && password !== '••••••••••••') {
      profileUpdates.password = password;
    }

    onUpdateProfile(profileUpdates);
    
    setFeedbackMsg(t.profileUpdated);
    setIsPassEditing(false);
    setPassword('••••••••••••');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Export File Downloader
  const handleExportClick = () => {
    try {
      const dataStr = onExportData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timeStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `fintrack-backup-${timeStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setBackupFeedback({ type: 'success', text: currentLang === 'bn' ? 'ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে!' : 'Backup downloaded successfully!' });
      setTimeout(() => setBackupFeedback(null), 3500);
    } catch (err) {
      setBackupFeedback({ type: 'error', text: 'Failed to generate backup.' });
    }
  };

  // Import File Reader Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onImportData(content);
      if (success) {
        setBackupFeedback({ type: 'success', text: t.restoreSucceed });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setBackupFeedback({ type: 'error', text: t.restoreFailed });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setTimeout(() => setBackupFeedback(null), 4000);
  };

  const handleDeleteAccountClick = () => {
    setPendingAction('DELETE');
    setPinInput('');
    setPinError('');
    setIsPinVerified(false);
    setShowPinModal(true);
  };

  return (
    <div className="w-full flex flex-col gap-6 select-none max-w-4xl mx-auto py-2 transition-all">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white font-sans tracking-tight">{t.title}</h2>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
          {t.subtitle}
        </p>
      </div>

      {feedbackMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-4.5 py-3 rounded-2xl flex items-center gap-2.5 border border-emerald-100 dark:border-emerald-900/40 text-xs font-semibold animate-pulse">
          <CheckCircle2 size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {backupFeedback && (
        <div className={`px-4.5 py-3 rounded-2xl flex items-center gap-2.5 border text-xs font-semibold ${
          backupFeedback.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40'
            : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/40'
        }`}>
          {backupFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{backupFeedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Profile Settings Left Section */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <form onSubmit={handleProfileSave} className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-5.5 flex flex-col gap-4.5 shadow-xs transition-colors">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-100 dark:border-zinc-800">
              <User size={16} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                {t.profile}
              </h3>
            </div>

            {/* Avatar display */}
            <div className="flex items-center gap-4 py-1">
              <img
                src={avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"}
                alt="Profile Preview"
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-xs"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1534066214030-1498b3DB04b4?auto=format&fit=crop&w=150&q=80";
                }}
              />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-gray-800 dark:text-white leading-none">{name || 'Finance Enthusiast'}</span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-550 font-mono mt-1">{email || 'fintrack-user@domain.com'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{t.name}</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-3 text-gray-400 dark:text-zinc-550" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none transition-colors font-medium font-sans animate-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{t.email}</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-3 text-gray-400 dark:text-zinc-550" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-zinc-805 bg-white dark:bg-zinc-955 text-gray-800 dark:text-zinc-101 focus:border-indigo-500 focus:outline-none transition-colors font-mono font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{t.avatar}</label>
                <input
                  type="text"
                  value={avatar}
                  placeholder="Image link URL"
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none transition-colors font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{t.password}</label>
                {!isPassEditing ? (
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsPassEditing(true);
                      setPassword('');
                    }}
                    className="text-[10px] text-indigo-650 dark:text-indigo-400 font-extrabold hover:underline cursor-pointer"
                  >
                    {currentLang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Change Password'}
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsPassEditing(false);
                      setPassword('••••••••••••');
                    }}
                    className="text-[10px] text-gray-400 hover:text-indigo-600 font-extrabold hover:underline cursor-pointer"
                  >
                    {currentLang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-3 text-gray-400 dark:text-zinc-500" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  disabled={!isPassEditing}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 disabled:bg-gray-50/50 dark:disabled:bg-zinc-900 text-gray-850 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none transition-all font-mono"
                  placeholder={currentLang === 'bn' ? 'নতুন পাসওয়ার্ড লিখুন' : 'New master password'}
                />
                {isPassEditing && (
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 cursor-pointer"
                    title="Toggle Visibility"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs active:scale-98 cursor-pointer text-center"
            >
              {t.saveProfile}
            </button>
          </form>

          {/* Data Backup & Restore Panel */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5.5 flex flex-col gap-4 shadow-xs transition-colors">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-100 dark:border-zinc-805">
              <Database size={16} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">{t.backup}</h3>
            </div>
            
            <p className="text-xs text-gray-550 dark:text-zinc-400 leading-relaxed font-sans font-medium">
              {t.backupDesc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
              <button
                type="button"
                onClick={handleExportClick}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white hover:bg-gray-50 dark:bg-zinc-950 dark:hover:bg-zinc-850 text-indigo-605 dark:text-indigo-400 text-xs font-bold active:scale-98 transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>{t.backupBtn}</span>
              </button>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-indigo-120 dark:border-zinc-800 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 text-xs font-bold active:scale-98 transition-all cursor-pointer"
              >
                <Upload size={14} />
                <span>{t.restoreBtn}</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".json" 
                className="hidden" 
              />
            </div>
          </div>
        </div>

        {/* Currency/Languages & Toggles Right Section */}
        <div className="md:col-span-5 flex flex-col gap-6">

          {/* Core Configuration parameters card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 flex flex-col gap-4 shadow-xs transition-colors">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-100 dark:border-zinc-800">
              <SettingsIcon size={16} className="text-indigo-600 dark:text-indigo-400 animate-spin-slow" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                {t.lang}
              </h3>
            </div>

            {/* Currency select Dropdown */}
            <div className="flex flex-col gap-1.5 py-1">
              <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                {t.currency}
              </span>
              <select
                value={userProfile.currency}
                onChange={(e) => onUpdateProfile({ currency: e.target.value })}
                className="px-3 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-700 dark:text-zinc-200 focus:border-indigo-505 focus:outline-none font-sans font-bold transition-colors"
              >
                <option value="৳">৳ (BDT Taka)</option>
                <option value="$">$ (USD Dollar)</option>
                <option value="€">€ (Euro)</option>
                <option value="£">£ (Pound Sterling)</option>
              </select>
            </div>

            {/* Language select Dropdown */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                {t.language}
              </span>
              <select
                value={userProfile.language}
                onChange={(e) => onUpdateProfile({ language: e.target.value as 'en' | 'bn' })}
                className="px-3 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-gray-700 dark:text-zinc-200 focus:border-indigo-505 focus:outline-none font-sans font-extrabold transition-colors"
              >
                <option value="en">English (US)</option>
                <option value="bn">বাংলা (Bengali)</option>
              </select>
            </div>
          </div>

          {/* Notifications config */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 flex flex-col gap-4 shadow-xs transition-colors">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-100 dark:border-zinc-800">
              <Bell size={16} className="text-indigo-600 dark:text-indigo-400 animate-bounce-slow" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                {t.notifications}
              </h3>
            </div>

            {/* Toggle Switch Transaction Reminders */}
            <div className="flex items-center justify-between py-1">
              <div className="flex flex-col gap-1 max-w-[80%]">
                <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 leading-none">{t.notifRemind}</span>
                <span className="text-[10px] text-gray-400 mt-1 lines-clamp-2 leading-tight">{t.notifRemindDesc}</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateProfile({ notifyTransactions: !userProfile.notifyTransactions })}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-all focus:outline-none cursor-pointer ${
                  userProfile.notifyTransactions ? 'bg-indigo-600' : 'bg-gray-250 dark:bg-zinc-800'
                }`}
                title="Toggle Reminders"
              >
                <div
                  className={`w-4.5 h-4.5 bg-white rounded-full shadow-xs transition-transform ${
                    userProfile.notifyTransactions ? 'translate-x-4.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle Switch Budget Warnings */}
            <div className="flex items-center justify-between py-1 border-t border-gray-100/50 dark:border-zinc-800/40 pt-3">
              <div className="flex flex-col gap-1 max-w-[80%] flex-1">
                <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 leading-none">{t.notifLimit}</span>
                <span className="text-[10px] text-gray-400 mt-1 leading-tight">{t.notifLimitDesc}</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateProfile({ notifyBudgetAlerts: !userProfile.notifyBudgetAlerts })}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-all focus:outline-none cursor-pointer ${
                  userProfile.notifyBudgetAlerts ? 'bg-indigo-600' : 'bg-gray-250 dark:bg-zinc-800'
                }`}
                title="Toggle Warning Alerts"
              >
                <div
                  className={`w-4.5 h-4.5 bg-white rounded-full shadow-xs transition-transform ${
                    userProfile.notifyBudgetAlerts ? 'translate-x-4.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Theme custom selector directly visible in body settings */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 flex flex-col gap-3 shadow-xs transition-colors">
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest leading-none font-sans">
              {currentLang === 'bn' ? 'অ্যাপ থিম পরিবর্তন' : 'Appearance Mode'}
            </h4>
            <div className="flex bg-gray-50 dark:bg-zinc-950 p-1 rounded-2xl border border-gray-200/50 dark:border-zinc-800 mt-1">
              <button
                type="button"
                onClick={() => setDarkMode(false)}
                className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  !darkMode
                    ? 'bg-white dark:bg-zinc-850 text-indigo-600 dark:text-white shadow-xs font-extrabold'
                    : 'text-gray-400 dark:text-zinc-500 hover:text-gray-750'
                }`}
              >
                <Sun size={13} />
                <span>{currentLang === 'bn' ? 'লাইট মোড' : 'Light'}</span>
              </button>
              <button
                type="button"
                onClick={() => setDarkMode(true)}
                className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  darkMode
                    ? 'bg-white dark:bg-zinc-850 text-indigo-400 dark:text-white shadow-xs font-extrabold'
                    : 'text-gray-405 dark:text-zinc-500 hover:text-gray-755'
                }`}
              >
                <Moon size={13} />
                <span>{currentLang === 'bn' ? 'ডার্ক মোড' : 'Dark'}</span>
              </button>
            </div>
          </div>

          {/* Reset button custom parameters in Danger settings box */}
          <div className="bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800/80 rounded-3xl p-5.5 flex flex-col gap-3.5 shadow-xs transition-colors">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 border-b border-rose-50 dark:border-zinc-800/50 pb-2.5">
              {t.dangerZone}
            </h3>
            
            <button
               type="button"
               onClick={onLogout}
               className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-indigo-400 text-gray-700 dark:text-zinc-300 text-xs font-bold active:scale-97 transition-all cursor-pointer"
            >
              <LogOut size={13} className="text-gray-405" />
              <span>{t.logout}</span>
            </button>

            <button
              type="button"
              onClick={handleResetClick}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-amber-200 dark:border-amber-950/40 hover:bg-amber-50 dark:hover:bg-amber-950/10 text-amber-650 dark:text-amber-400 text-xs font-bold active:scale-97 transition-all cursor-pointer"
            >
              <AlertTriangle size={13} className="text-amber-500" />
              <span>{currentLang === 'bn' ? 'সব ডেটা সম্পূর্ণ রিসেট করুন' : 'Reset All App Data'}</span>
            </button>

            <button
              type="button"
              onClick={handleDeleteAccountClick}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-extrabold active:scale-97 transition-all cursor-pointer border border-rose-100/50 dark:border-none"
            >
              <Trash2 size={13} />
              <span>{t.delete}</span>
            </button>
          </div>

        </div>

      </div>

      {/* category budget limits editor list */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-110 dark:border-zinc-800 rounded-3xl p-5.5 mt-2 flex flex-col gap-4 shadow-xs transition-colors">
        <div className="pb-2 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2">
          <SettingsIcon size={16} className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            {t.limitsTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {budgets.map((b) => {
            // Display budget limit in active currency
            const localDisplayLimit = Math.round(displayBalance(b.limit, userProfile.currency));
            return (
              <div 
                key={b.category}
                className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-zinc-950/50 border border-gray-150 dark:border-zinc-850/30 rounded-2xl"
              >
                <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                  {getCategoryLabel(b.category, currentLang)}
                </span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs text-gray-400 font-bold">{userProfile.currency}</span>
                  <input
                    type="number"
                    value={localDisplayLimit || ''}
                    placeholder="0"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0) {
                        // Store the value converted back to base USD
                        const usdCalculatedValue = convertInputToUSD(val, userProfile.currency);
                        onUpdateBudget(b.category, usdCalculatedValue);
                      }
                    }}
                    className="w-20 px-2 py-1 text-xs text-right border border-gray-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 rounded font-bold focus:outline-none focus:border-indigo-500 text-gray-850 dark:text-white"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Security PIN / Password verification overlay dialog popup */}
      {showPinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-zinc-950/70 transition-all duration-300">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-[32px] w-full max-w-md p-6 shadow-2xl relative flex flex-col gap-5 animate-in fade-in zoom-in duration-200">
            
            {/* Header row */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Lock className="text-rose-500 shrink-0" size={18} />
                <span className="text-sm font-black font-sans text-gray-900 dark:text-white tracking-tight">
                  {currentLang === 'bn' 
                    ? 'নিরাপত্তা ভেরিফিকেশন' 
                    : 'System Security Verification'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPinModal(false);
                  setPendingAction(null);
                  setPinInput('');
                  setPinError('');
                  setIsPinVerified(false);
                }}
                className="w-7 h-7 rounded-full bg-gray-50 dark:bg-zinc-800 text-gray-400 hover:text-rose-500 flex items-center justify-center text-xs ml-auto transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Verification phase / state matching */}
            {!isPinVerified ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setPinError('');
                  
                  // Fetch saved custom user password from local persistent records
                  const savedAccountsStr = localStorage.getItem('fintrack_saved_accounts');
                  const accounts = savedAccountsStr ? JSON.parse(savedAccountsStr) : {};
                  const account = accounts[userProfile.email.toLowerCase().trim()];
                  const correctPassword = account ? account.password : '1234';

                  if (pinInput === correctPassword) {
                    setIsPinVerified(true);
                  } else {
                    setPinError(currentLang === 'bn' 
                      ? 'ভুল নিরাপত্তা PIN বা লক পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিন।' 
                      : 'Incorrect security PIN or master password! Please enter the correct code.');
                  }
                }}
                className="flex flex-col gap-4 text-center py-2"
              >
                <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center mx-auto mb-1">
                  <Lock size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider">
                    {currentLang === 'bn' ? 'মাস্টার পাসওয়ার্ড / পিন প্রদান করুন' : 'Enter security password / PIN'}
                  </h4>
                  <p className="text-[11px] text-gray-450 dark:text-zinc-500 mt-2 leading-relaxed">
                    {currentLang === 'bn' 
                      ? `"${pendingAction === 'RESET' ? 'সব ডেটা রিসেট' : 'অ্যাকাউন্ট ডিলেট'}" করার নিরাপত্তা ব্যতিক্রম অনুমোদন করতে আপনার লগইন পিন প্রদান করুন।` 
                      : `Please enter your login password/PIN to authorize "${pendingAction === 'RESET' ? 'Reset App Data' : 'Delete Account Permanently'}".`}
                  </p>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <input
                    type="password"
                    placeholder={currentLang === 'bn' ? 'মাস্টার পিন / পাসওয়ার্ড লিখুন' : 'Enter security password'}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full text-center tracking-widest text-sm font-bold p-3.5 rounded-2xl border border-gray-250 dark:border-zinc-805 bg-gray-50 dark:bg-zinc-950/30 text-gray-900 dark:text-white focus:outline-none focus:border-rose-500 font-mono transition-all"
                    required
                    autoFocus
                  />
                  {pinError && (
                    <span className="text-[10px] text-red-500 font-bold text-center mt-1">
                      {pinError}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 mt-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs active:scale-97 cursor-pointer transition-all shadow-sm"
                >
                  {currentLang === 'bn' ? 'পিন যাচাই করুন' : 'Verify PIN & Continue'}
                </button>
              </form>
            ) : (
              /* Are you sure confirmation page */
              <div className="flex flex-col gap-5 text-center py-2">
                <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center mx-auto mb-1 animate-bounce">
                  <AlertTriangle size={24} />
                </div>
                
                <div>
                  <h4 className="text-sm font-black text-amber-600 dark:text-amber-400">
                    {currentLang === 'bn' ? 'চূড়ান্ত নিশ্চিতকরণ অ্যালার্ট!' : 'Final Confirmation Required!'}
                  </h4>
                  <p className="text-[11.5px] text-gray-550 dark:text-zinc-300 mt-2.5 leading-relaxed font-semibold">
                    {pendingAction === 'RESET'
                      ? (currentLang === 'bn' 
                         ? 'আপনি কি নিশ্চিতভাবে আপনার ড্যাশবোর্ড থেকে সর্বপ্রকার লেনদেনের রেকর্ড, বাজেট সীমা এবং হিস্টোরি চিরতরে মুছে দিতে চান? এই অ্যাকশনটি আর ফিরিয়ে আনা যাবে না।' 
                         : 'Are you absolutely sure you want to permanently purge all transaction logs, custom budgets, and reset settings to default pristine factory state? This action is irreversible.')
                      : (currentLang === 'bn' 
                         ? 'এর ফলে আপনার ড্যাশবোর্ড রেকর্ড, অ্যাকাউন্ট ফাইল এবং লোকাল ক্রেডেনশিয়াল চিরতরে মুছে যাবে। আপনি কি নিশ্চিত?' 
                         : 'This will permanently destroy your user profile, transactions ledger database, offline limits database and log you out. Are you absolutely sure?')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPinModal(false);
                      setPendingAction(null);
                      setPinInput('');
                      setIsPinVerified(false);
                    }}
                    className="py-3 rounded-2xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-zinc-850 cursor-pointer active:scale-97 transition-all"
                  >
                    {currentLang === 'bn' ? 'বাতিল করুন' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Perform final confirm actions
                      if (pendingAction === 'RESET') {
                        onReset();
                        setBackupFeedback({ 
                          type: 'success', 
                          text: currentLang === 'bn' ? 'ডাটাবেজ সফলভাবে সম্পূর্ণ রিসেট বা মুছে ফেলা হয়েছে!' : 'Database successfully reset to pristine factory state!' 
                        });
                      } else if (pendingAction === 'DELETE') {
                        onDeleteAccount();
                      }
                      
                      // Close overlay modal
                      setShowPinModal(false);
                      setPendingAction(null);
                      setPinInput('');
                      setIsPinVerified(false);
                      setPinError('');
                      setTimeout(() => {
                        setBackupFeedback(null);
                      }, 4000);
                    }}
                    className="py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-black text-xs cursor-pointer active:scale-97 transition-all shadow-md"
                  >
                    {currentLang === 'bn' ? 'হ্যাঁ, নিশ্চিত করুন' : 'Yes, Permanently Purge'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
