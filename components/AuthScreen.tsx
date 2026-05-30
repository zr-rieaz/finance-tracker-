import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  Wallet, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Globe,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (profile: UserProfile) => void;
}

const AUTH_TRANSLATIONS = {
  en: {
    title: "FinTrack Portal",
    tagline: "Your clean, persistent, personal sandbox ledger",
    loginTitle: "Access Safe Lockbox",
    registerTitle: "Initialize Ledger Account",
    emailLabel: "Email Address",
    passwordLabel: "Master Password",
    nameLabel: "Your Name",
    loginBtn: "Authenticate & Enter",
    registerBtn: "Create Secure Profile",
    noAccount: "Initializing a new ledger? ",
    hasAccount: "Already registered your profile? ",
    registerLink: "Create profile",
    loginLink: "Access portal",
    guestTip: "Default sandbox credentials: ",
    forgotPass: "Forgot master key?",
    showPassLabel: "Show password",
    bilingualToggle: "বাংলা ভাষায় দেখুন",
    errorHeader: "Authentication Failure",
    successHeader: "Verified Successfully",
    invalidPass: "The master password provided is incorrect for this sandbox account.",
    accCreated: "Ledger account initialized! Redirecting to dashboard...",
    passLength: "Master password must be at least 4 characters long.",
    avatarLabel: "Profile Picture Preset Link (Optional)",
    
    // Forgot password translations
    forgotTitle: "Reset Master Password",
    forgotDesc: "Recover your account by specifying a new password for your email address.",
    recoveryMail: "Registered Email",
    newPassLabel: "New Master Password",
    resetBtn: "Confirm Password Reset",
    backBtn: "Back to Login",
    resetSuccessMsg: "Password reset completed successfully!",
    resetErrorMsg: "Email address not found in local sandbox records."
  },
  bn: {
    title: "ফিনট্যাক পোর্টাল",
    tagline: "আপনার পরিচ্ছন্ন, নিরাপদ এবং ব্যক্তিগত লোকাল লেজার",
    loginTitle: "নিরাপদ লকবক্স এক্সেস করুন",
    registerTitle: "নতুন লেজার অ্যাকাউন্ট তৈরি করুন",
    emailLabel: "ইমেইল অ্যাড্রেস",
    passwordLabel: "মাস্টার পাসওয়ার্ড",
    nameLabel: "আপনার পূর্ণ নাম",
    loginBtn: "প্রবেশ করুন",
    registerBtn: "নিরাপদ প্রোফাইল তৈরি করুন",
    noAccount: "নতুন অ্যাকাউন্ট খুলতে চান? ",
    hasAccount: "ইতিমধ্যে প্রোফাইল তৈরি করেছেন? ",
    registerLink: "রেজিস্ট্রেশন করুন",
    loginLink: "লগইন করুন",
    guestTip: "ডিফল্ট লগইন তথ্য: ",
    forgotPass: "পাসওয়ার্ড ভুলে গেছেন?",
    showPassLabel: "পাসওয়ার্ড দেখান",
    bilingualToggle: "View in English",
    errorHeader: "অনুপ্রবেশ ব্যর্থ হয়েছে",
    successHeader: "সফলভাবে ভেরিফাইড",
    invalidPass: "আপনার ক্যাশ-লকিং পাসওয়ার্ডটি সঠিক নয়।",
    accCreated: "অ্যাকাউন্ট তৈরি হয়েছে! ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...",
    passLength: "মাস্টার পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।",
    avatarLabel: "প্রোফাইল ছবির লিংক (ঐচ্ছিক)",

    // Forgot password translations
    forgotTitle: "মাস্টার পাসওয়ার্ড রিসেট",
    forgotDesc: "আপনার নিবন্ধিত ইমেল ঠিকানা এবং নতুন লক পাসওয়ার্ড দিয়ে আপনার অ্যাকাউন্ট রিকভার করুন।",
    recoveryMail: "নিবন্ধিত ইমেল",
    newPassLabel: "নতুন মাস্টার পাসওয়ার্ড",
    resetBtn: "পাসওয়ার্ড পরিবর্তন নিশ্চিত করুন",
    backBtn: "লগইনে ফিরে যান",
    resetSuccessMsg: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!",
    resetErrorMsg: "এই ইমেল ঠিকানাটি লোকাল ডাটাবেজে খুঁজে পাওয়া যায়নি।"
  }
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [lang, setLang] = useState<'en' | 'bn'>('bn'); // Default to Bengali as per user prompt preference
  const t = AUTH_TRANSLATIONS[lang];

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showForgotForm, setShowForgotForm] = useState(false);

  // States for Login/Register (now empty by default)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80');
  
  const [showPassword, setShowPassword] = useState(false);
  const [errorAlert, setErrorAlert] = useState('');
  const [successAlert, setSuccessAlert] = useState('');

  // States for Forgot Password Reset
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorAlert('');
    setSuccessAlert('');

    if (!email || !password) {
      setErrorAlert(lang === 'bn' ? 'অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড দিন।' : 'Please enter email and password.');
      return;
    }

    if (!isLoginMode && password.length < 4) {
      setErrorAlert(t.passLength);
      return;
    }

    // Retrieve accounts
    const savedAccountsStr = localStorage.getItem('fintrack_saved_accounts');
    const accounts = savedAccountsStr ? JSON.parse(savedAccountsStr) : {};

    if (isLoginMode) {
      // Login flow
      const account = accounts[email.toLowerCase().trim()];
      if (account) {
        if (account.password === password) {
          setSuccessAlert(lang === 'bn' ? 'ভেরিফিকেশন সফল! প্রবেশ করা হচ্ছে...' : 'Verified! Entering dashboard...');
          
          setTimeout(() => {
            onLoginSuccess({
              name: account.name,
              email: account.email,
              avatar: account.avatar || avatar,
              currency: account.currency || '৳',
              language: account.language || 'bn',
              notifyTransactions: account.notifyTransactions !== false,
              notifyBudgetAlerts: account.notifyBudgetAlerts !== false
            });
          }, 1000);
        } else {
          setErrorAlert(t.invalidPass);
        }
      } else {
        setErrorAlert(lang === 'bn' 
          ? 'এই ইমেইল দিয়ে অ্যাকাউন্ট তৈরি করা হয়নি। নিচে "রেজিস্ট্রেশন করুন" লিংকে ক্লিক করুন।' 
          : 'Email address not found. Switch to the Register account creation phase below.'
        );
      }
    } else {
      // Register flow
      const exists = accounts[email.toLowerCase().trim()];
      if (exists) {
        setErrorAlert(lang === 'bn' ? 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা আছে।' : 'An account with this email already exists.');
        return;
      }

      const newProfile = {
        name: name || 'Anonymous Ledger Manager',
        email: email.toLowerCase().trim(),
        avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        currency: lang === 'bn' ? '৳' : '$',
        language: lang,
        notifyTransactions: true,
        notifyBudgetAlerts: true,
        password: password
      };

      accounts[email.toLowerCase().trim()] = newProfile;
      localStorage.setItem('fintrack_saved_accounts', JSON.stringify(accounts));

      setSuccessAlert(t.accCreated);
      setTimeout(() => {
        onLoginSuccess({
          name: newProfile.name,
          email: newProfile.email,
          avatar: newProfile.avatar,
          currency: newProfile.currency,
          language: newProfile.language as 'en' | 'bn',
          notifyTransactions: newProfile.notifyTransactions,
          notifyBudgetAlerts: newProfile.notifyBudgetAlerts
        });
      }, 1200);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorAlert('');
    setSuccessAlert('');

    if (!forgotEmail || !newPassword) {
      setErrorAlert(lang === 'bn' ? 'অনুগ্রহ করে সব তথ্য দিন।' : 'Please supply both email and new password.');
      return;
    }

    if (newPassword.length < 4) {
      setErrorAlert(t.passLength);
      return;
    }

    const savedAccountsStr = localStorage.getItem('fintrack_saved_accounts');
    const accounts = savedAccountsStr ? JSON.parse(savedAccountsStr) : {};
    
    // Check main admin account or storage
    const targetKey = forgotEmail.toLowerCase().trim();
    if (accounts[targetKey]) {
      accounts[targetKey].password = newPassword;
      localStorage.setItem('fintrack_saved_accounts', JSON.stringify(accounts));
      
      setSuccessAlert(t.resetSuccessMsg);
      setTimeout(() => {
        setShowForgotForm(false);
        setEmail(forgotEmail);
        setPassword(newPassword);
        setSuccessAlert('');
      }, 1500);
    } else {
      setErrorAlert(t.resetErrorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/70 dark:bg-zinc-950 flex flex-col justify-center items-center p-4 transition-colors duration-200">
      
      {/* Top Floating Language Switcher */}
      <button
        type="button"
        onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-600 dark:text-zinc-300 shadow-xs hover:border-indigo-400 active:scale-95 transition-all cursor-pointer font-sans"
      >
        <Globe size={13} className="text-indigo-500" />
        <span>{t.bilingualToggle}</span>
      </button>

      {/* Main card */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-3xl p-6.5 sm:p-8 shadow-xl relative transition-all">
        
        {/* Logo and Brand */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg mb-3">
            <Wallet size={24} className="stroke-[2.5]" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none font-sans flex items-center gap-1.5">
            <span>{t.title}</span>
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold px-1.5 py-0.5 rounded uppercase">v2.0</span>
          </h1>
          <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-2 max-w-xs leading-normal font-medium">
            {t.tagline}
          </p>
        </div>

        {/* Display feedback Alerts */}
        {errorAlert && (
          <div className="mb-5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-2xl text-[11px] flex gap-2.5 items-start">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-extrabold">{t.errorHeader}</span>
              <span className="mt-0.5 leading-relaxed">{errorAlert}</span>
            </div>
          </div>
        )}

        {successAlert && (
          <div className="mb-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-2xl text-[11px] flex gap-2.5 items-start animate-pulse">
            <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-extrabold">{t.successHeader}</span>
              <span className="mt-0.5 leading-relaxed">{successAlert}</span>
            </div>
          </div>
        )}

        {/* ----------------- FORGOT PASSWORD SCREEN ----------------- */}
        {showForgotForm ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button 
                type="button"
                onClick={() => {
                  setShowForgotForm(false);
                  setErrorAlert('');
                  setSuccessAlert('');
                }}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-550 dark:text-zinc-400"
              >
                <ArrowLeft size={16} />
              </button>
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-250 uppercase tracking-wider">
                {t.forgotTitle}
              </h2>
            </div>
            
            <p className="text-xs text-gray-550 dark:text-zinc-400 leading-normal mb-5">
              {t.forgotDesc}
            </p>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">{t.recoveryMail}</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3.5 top-3.5 text-gray-400 dark:text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">{t.newPassLabel}</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3.5 top-3.5 text-gray-400 dark:text-zinc-505" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="new_password_here"
                    className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 font-mono transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-650"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="mt-3 py-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md active:scale-98 transition-all cursor-pointer"
              >
                {t.resetBtn}
              </button>
            </form>
          </div>
        ) : (
          /* ----------------- LOGIN / REGISTER FORMS ----------------- */
          <div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-1.5">
                {isLoginMode ? t.loginTitle : t.registerTitle}
              </h2>

              {/* Registration Name Field */}
              {!isLoginMode && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">{t.nameLabel}</label>
                  <div className="relative">
                    <User size={13} className="absolute left-3.5 top-3 text-gray-400 dark:text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Riazul Islam"
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none transition-all font-sans font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Email input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">{t.emailLabel}</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3.5 top-3 text-gray-400 dark:text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rsrieaz70@gmail.com"
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none transition-all font-mono font-medium"
                  />
                </div>
              </div>

              {/* Registration Avatar Preset Field */}
              {!isLoginMode && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">{t.avatarLabel}</label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="Image link URL"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none transition-all font-mono text-[10px]"
                  />
                </div>
              )}

              {/* Password input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">{t.passwordLabel}</label>
                  {isLoginMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotForm(true);
                        setErrorAlert('');
                        setSuccessAlert('');
                      }}
                      className="text-[10px] text-gray-400 hover:text-indigo-600 dark:text-zinc-500 cursor-pointer hover:underline"
                    >
                      {t.forgotPass}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={13} className="absolute left-3.5 top-3.5 text-gray-400 dark:text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password123"
                    className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-800 dark:text-zinc-100 focus:border-indigo-500 focus:outline-none transition-all font-mono font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-650 dark:hover:text-zinc-300 cursor-pointer"
                    title={t.showPassLabel}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                
                {/* Visible show password Checkbox / Label as per Requirement 1 option */}
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="checkbox"
                    id="show_pass_chk"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="show_pass_chk" className="text-[10px] text-gray-500 dark:text-zinc-400 font-semibold cursor-pointer select-none">
                    {t.showPassLabel}
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="mt-3 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md active:scale-98 transition-all cursor-pointer text-center"
              >
                {isLoginMode ? t.loginBtn : t.registerBtn}
              </button>
            </form>

            {/* Dynamic mode switcher */}
            <div className="mt-5 text-center text-xs text-gray-500 dark:text-zinc-400">
              <span>{isLoginMode ? t.noAccount : t.hasAccount}</span>
              <button
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setErrorAlert('');
                  setSuccessAlert('');
                }}
                className="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline cursor-pointer"
              >
                {isLoginMode ? t.registerLink : t.loginLink}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
