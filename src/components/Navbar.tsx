/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Language, Theme } from '../types';
import { translations } from '../data/translations';
import { 
  Shield, 
  Globe, 
  Sun, 
  Moon, 
  Users, 
  ChevronDown, 
  Lock, 
  Server,
  Sparkles,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  onUserChange: (userId: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export default function Navbar({
  currentUser,
  allUsers,
  onUserChange,
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  onOpenAdmin,
  isAdmin,
  onOpenProfile,
  onLogout
}: NavbarProps) {
  const t = translations[language];
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const toggleLanguage = () => {
    onLanguageChange(language === 'en' ? 'fa' : 'en');
  };

  const toggleTheme = () => {
    onThemeChange(theme === 'light' ? 'dark' : 'light');
  };

  const isRtl = language === 'fa';

  return (
    <header className={`h-16 border-b flex items-center justify-between px-4 lg:px-6 shrink-0 transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-zinc-950 border-zinc-800 text-zinc-100' 
        : 'bg-white border-zinc-200 text-zinc-900'
    }`} id="dichat-navbar">
      {/* Brand Logo & Server Status */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 dark:from-zinc-100 dark:to-zinc-200 flex items-center justify-center text-white dark:text-zinc-900 font-bold text-xl shadow-md transform hover:scale-105 transition-all">
          <span className="font-sans">DI</span>
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-base tracking-tight font-sans">DIchat</h1>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-500 font-medium">
              <Server size={10} />
              {t.offlineStatus}
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{t.tagline}</p>
        </div>
      </div>

      {/* Dev RBAC Switcher & Utilities */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* User Role Testing / Profile Switcher */}
        <div className="relative">
          <button 
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              theme === 'dark' 
                ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
                : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm text-zinc-700'
            }`}
            title={t.userSwitcherTooltip}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentUser.color }} />
            <span className="max-w-[80px] sm:max-w-none truncate">{currentUser.displayName}</span>
            <ChevronDown size={14} className="opacity-60" />
          </button>

          {showUserDropdown && (
            <div className={`absolute top-full mt-2 z-50 w-64 rounded-2xl border p-2 shadow-xl ${
              isRtl ? 'left-0' : 'right-0'
            } ${
              theme === 'dark' 
                ? 'bg-zinc-900 border-zinc-800 text-zinc-200' 
                : 'bg-white border-zinc-200/60 text-zinc-800'
            }`}>
              <div className="px-3 py-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={10} />
                {t.userSwitcherTooltip}
              </div>
              
              <div className="space-y-1 mt-1">
                {allUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onUserChange(user.id);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                      currentUser.id === user.id
                        ? (theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-blue-650 font-medium')
                        : 'hover:bg-zinc-50/55 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: user.color }} />
                      <div className="text-left">
                        <p className="font-semibold">{user.displayName}</p>
                        <p className="text-[10px] opacity-60 truncate max-w-[150px]">{user.bio}</p>
                      </div>
                    </div>
                    {user.role === 'admin' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-mono bg-blue-500/15 text-blue-500">
                        {user.role}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Panel Button */}
        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-sm ${
              theme === 'dark'
                ? 'bg-blue-950/40 border-blue-900/60 text-blue-400 hover:bg-blue-950/70'
                : 'bg-blue-50 border-blue-200/80 text-blue-600 hover:bg-blue-100/80'
            }`}
          >
            <Shield size={14} />
            <span className="hidden sm:inline">{t.adminPanel}</span>
          </button>
        )}

        {/* Profile Button */}
        <button
          onClick={onOpenProfile}
          className={`p-2 rounded-xl border transition-all shadow-sm ${
            theme === 'dark'
              ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
              : 'bg-white border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900'
          }`}
          title={t.profile}
        >
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0"
            style={{ backgroundColor: currentUser.color }}
          >
            {currentUser.displayName.charAt(0)}
          </div>
        </button>

        <div className="h-6 w-[1px] bg-zinc-200/80 dark:bg-zinc-800" />

        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className={`p-2 rounded-xl border transition-all flex items-center justify-center shadow-sm ${
            theme === 'dark'
              ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
              : 'bg-white border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-650 hover:text-zinc-900'
          }`}
          title={t.language}
        >
          <Globe size={15} />
          <span className="text-[10px] font-bold ml-1 uppercase font-mono">{language === 'en' ? 'FA' : 'EN'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl border transition-all flex items-center justify-center shadow-sm ${
            theme === 'dark'
              ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
              : 'bg-white border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900'
          }`}
          title={t.theme}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className={`p-2 rounded-xl border transition-all flex items-center justify-center shadow-sm ${
            theme === 'dark'
              ? 'bg-rose-950/20 border-rose-900/40 text-rose-400 hover:bg-rose-900/30 hover:text-rose-300'
              : 'bg-white border-rose-200 hover:bg-rose-50/50 text-rose-600 hover:text-rose-700'
          }`}
          title={t.logout}
        >
          <LogOut size={15} />
        </button>

      </div>
    </header>
  );
}
