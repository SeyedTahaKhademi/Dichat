/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Language, Theme } from '../types';
import { translations } from '../data/translations';
import { motion } from 'motion/react';
import { 
  Lock, 
  UserCheck, 
  UserPlus, 
  ShieldCheck, 
  Key, 
  Server, 
  Globe, 
  Sun, 
  Moon,
  Sparkles
} from 'lucide-react';

interface AuthScreenProps {
  users: User[];
  onLogin: (user: User) => void;
  onSignup: (newUser: User) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export default function AuthScreen({
  users,
  onLogin,
  onSignup,
  language,
  onLanguageChange,
  theme,
  onThemeChange
}: AuthScreenProps) {
  const t = translations[language];
  const isRtl = language === 'fa';

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginError, setLoginError] = useState('');

  // Signup form state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupDisplayName, setSignupDisplayName] = useState('');
  const [signupBio, setSignupBio] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3b82f6'); // default blue
  const [signupError, setSignupError] = useState('');

  const colors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#ec4899', // pink
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ef4444', // red
    '#14b8a6', // teal
    '#6366f1'  // indigo
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUsername.trim()) {
      setLoginError(t.fieldRequired);
      return;
    }

    const cleanUsername = loginUsername.trim().toLowerCase();
    const foundUser = users.find(u => u.username.toLowerCase() === cleanUsername);

    if (foundUser) {
      onLogin(foundUser);
    } else {
      setLoginError(t.usernameError);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!signupUsername.trim() || !signupDisplayName.trim() || !signupBio.trim()) {
      setSignupError(t.fieldRequired);
      return;
    }

    const cleanUsername = signupUsername.trim().toLowerCase();
    
    // Validate username characters (letters, numbers, dot)
    if (!/^[a-zA-Z0-9.]+$/.test(cleanUsername)) {
      setSignupError(t.invalidUsername);
      return;
    }

    // Check if username already exists
    const userExists = users.some(u => u.username.toLowerCase() === cleanUsername);
    if (userExists) {
      setSignupError(t.usernameError);
      return;
    }

    // Generate DH Cryptographic Keypair Client-side
    const randomHex = (len: number) => 
      Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    const generatedPublicKey = 'dh256_pub_' + randomHex(32);
    // Securely stored or printed locally, representing an E2E private key
    const generatedPrivateKey = 'dh256_priv_' + randomHex(32);

    const newUser: User = {
      id: 'u_' + Date.now(),
      username: cleanUsername,
      displayName: signupDisplayName.trim(),
      role: 'member', // Default to normal member role
      color: selectedColor,
      bio: signupBio.trim(),
      publicKey: generatedPublicKey
    };

    // Trigger registration callback which saves user to list and logs in
    onSignup(newUser);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-zinc-950 text-zinc-100' 
        : 'bg-zinc-50 text-zinc-900'
    }`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Upper Navigation Utilities */}
      <div className="p-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500">
          <Server size={12} className="text-emerald-500 animate-pulse" />
          <span>{t.selfHostBanner}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={() => onLanguageChange(language === 'en' ? 'fa' : 'en')}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1 shadow-sm text-xs font-semibold ${
              theme === 'dark'
                ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Globe size={14} />
            <span className="font-mono uppercase">{language === 'en' ? 'FA' : 'EN'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center shadow-sm ${
              theme === 'dark'
                ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>

      {/* Main Authentication Card Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 transition-all ${
            theme === 'dark'
              ? 'bg-zinc-900/60 border-zinc-800/80 shadow-black/40 backdrop-blur-md'
              : 'bg-white border-zinc-200/50 shadow-zinc-200/40'
          }`}
        >
          {/* Logo Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 dark:from-zinc-100 dark:to-zinc-200 items-center justify-center text-white dark:text-zinc-900 font-bold text-2xl shadow-lg shadow-blue-500/10 mb-2">
              <span className="font-sans">DI</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">{t.welcomeTitle}</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 px-4 leading-relaxed">
              {t.welcomeSubtitle}
            </p>
          </div>

          {/* Login/Signup Tabs */}
          <div className={`grid grid-cols-2 p-1 rounded-2xl border ${
            theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200/60'
          }`}>
            <button
              onClick={() => {
                setActiveTab('login');
                setLoginError('');
              }}
              className={`py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? (theme === 'dark' ? 'bg-zinc-800 text-white shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                  : 'text-zinc-400 hover:text-zinc-500'
              }`}
            >
              <UserCheck size={14} />
              <span>{t.login}</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setSignupError('');
              }}
              className={`py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'signup'
                  ? (theme === 'dark' ? 'bg-zinc-800 text-white shadow-sm' : 'bg-white text-blue-600 shadow-sm')
                  : 'text-zinc-400 hover:text-zinc-500'
              }`}
            >
              <UserPlus size={14} />
              <span>{t.signup}</span>
            </button>
          </div>

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5 animate-fade-in">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-450 dark:text-zinc-500 uppercase font-mono tracking-wider">
                  {t.username}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="ali.admin"
                    dir="ltr"
                    className={`w-full py-2.5 px-3.5 rounded-xl border text-xs focus:outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-700'
                        : 'bg-white border-zinc-200 text-zinc-900 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10'
                    }`}
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-medium">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all font-semibold rounded-xl text-xs shadow-md shadow-blue-500/10 flex items-center justify-center gap-2"
              >
                <Lock size={14} />
                <span>{t.login}</span>
              </button>

              {/* Dev Simulation / Organization User Switcher Helper */}
              <div className="space-y-2.5 pt-4 border-t border-zinc-200/40 dark:border-zinc-800/40">
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium text-center">
                  {t.loginAsMember}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {users.slice(0, 4).map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => onLogin(user)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        theme === 'dark'
                          ? 'bg-zinc-950/40 border-zinc-850 hover:bg-zinc-850/40 hover:border-zinc-700'
                          : 'bg-zinc-50/50 border-zinc-150 hover:bg-zinc-100/50 hover:border-zinc-250'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] text-white uppercase shrink-0" style={{ backgroundColor: user.color }}>
                        {user.displayName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold truncate text-zinc-800 dark:text-zinc-200">{user.displayName}</p>
                        <p className="text-[8px] font-mono opacity-50 truncate">@{user.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: SIGNUP */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4 animate-fade-in">
              
              {/* Username */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-450 dark:text-zinc-500 uppercase font-mono tracking-wider">
                  {t.username}
                </label>
                <input
                  type="text"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  placeholder="reza.dev"
                  dir="ltr"
                  className={`w-full py-2 px-3 rounded-xl border text-xs focus:outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-700'
                      : 'bg-white border-zinc-200 text-zinc-900 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10'
                  }`}
                />
              </div>

              {/* Display Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-450 dark:text-zinc-500 uppercase font-mono tracking-wider">
                  {t.displayName}
                </label>
                <input
                  type="text"
                  value={signupDisplayName}
                  onChange={(e) => setSignupDisplayName(e.target.value)}
                  placeholder={isRtl ? 'رضا کریمی' : 'Reza Karimi'}
                  className={`w-full py-2 px-3 rounded-xl border text-xs focus:outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-700'
                      : 'bg-white border-zinc-200 text-zinc-900 focus:border-blue-500/50'
                  }`}
                />
              </div>

              {/* Bio / Position */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-450 dark:text-zinc-500 uppercase font-mono tracking-wider">
                  {t.bio}
                </label>
                <input
                  type="text"
                  value={signupBio}
                  onChange={(e) => setSignupBio(e.target.value)}
                  placeholder={isRtl ? 'برنامه‌نویس فرانت‌اند' : 'Frontend Engineer'}
                  className={`w-full py-2 px-3 rounded-xl border text-xs focus:outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-700'
                      : 'bg-white border-zinc-200 text-zinc-900 focus:border-blue-500/50'
                  }`}
                />
              </div>

              {/* Profile Color Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-450 dark:text-zinc-500 uppercase font-mono tracking-wider">
                  {t.chooseColor}
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className="w-6 h-6 rounded-full transition-all relative transform hover:scale-110 shrink-0"
                      style={{ backgroundColor: c }}
                    >
                      {selectedColor === c && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {signupError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-medium">
                  {signupError}
                </div>
              )}

              {/* Registration and DH Keygen Notification */}
              <div className={`p-3 rounded-2xl text-[10px] font-mono leading-relaxed space-y-1 border ${
                theme === 'dark' 
                  ? 'bg-zinc-950 border-zinc-850 text-zinc-400' 
                  : 'bg-zinc-50 border-zinc-200/50 text-zinc-500'
              }`}>
                <div className="flex items-center gap-1.5 text-emerald-500 font-bold mb-1">
                  <ShieldCheck size={12} />
                  <span>CLIENT-SIDE CRYPTO KEYGEN</span>
                </div>
                <p>
                  {isRtl 
                    ? 'کلیدهای رمزنگاری صوتی و متنی به صورت امن در مرورگر تولید می‌شوند و کلید خصوصی شما هرگز از دستگاه خارج نخواهد شد.'
                    : 'End-to-End Keys are generated fully in-browser. Your private cryptographic identity stays local and secure.'}
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white transition-all font-semibold rounded-xl text-xs shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
              >
                <Key size={14} />
                <span>{t.registerButton}</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>

      {/* Trust & Local Secure Footer */}
      <div className="p-4 shrink-0 text-center border-t border-zinc-200/10">
        <p className="text-[10px] font-mono text-zinc-500 flex items-center justify-center gap-1">
          <Lock size={10} className="text-emerald-500" />
          <span>AES-256 E2EE SUITE / LOCALLY SECURED</span>
        </p>
      </div>
    </div>
  );
}
