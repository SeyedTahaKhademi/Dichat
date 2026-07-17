/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Language, Theme } from '../types';
import { translations } from '../data/translations';
import { 
  X, 
  Key, 
  UserCheck, 
  Sparkles, 
  Shuffle, 
  Lock, 
  Briefcase 
} from 'lucide-react';

interface ProfileModalProps {
  user: User;
  language: Language;
  theme: Theme;
  onSave: (updatedUser: User) => void;
  onClose: () => void;
}

export default function ProfileModal({
  user,
  language,
  theme,
  onSave,
  onClose
}: ProfileModalProps) {
  const t = translations[language];
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || '');
  const [color, setColor] = useState(user.color);
  const [publicKey, setPublicKey] = useState(user.publicKey);
  const [privateKey, setPrivateKey] = useState(
    'dh256_priv_' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  );

  const colors = [
    '#3b82f6', // blue
    '#ec4899', // pink
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#6366f1', // indigo
    '#ef4444', // red
    '#14b8a6'  // teal
  ];

  const regenerateKeys = () => {
    const randomHex = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setPublicKey('dh256_pub_' + randomHex(32));
    setPrivateKey('dh256_priv_' + randomHex(32));
  };

  const handleSave = () => {
    onSave({
      ...user,
      displayName,
      bio,
      color,
      publicKey
    });
  };

  const isRtl = language === 'fa';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col transform scale-100 transition-all ${
        theme === 'dark' 
          ? 'bg-zinc-900 border border-zinc-800 text-zinc-100' 
          : 'bg-white border border-zinc-100 text-zinc-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-zinc-500" />
            <h3 className="text-base font-bold tracking-tight">{t.profile}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          
          {/* Avatar Preview & Selection */}
          <div className="flex flex-col items-center gap-4">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold uppercase shadow-inner text-white transition-all"
              style={{ backgroundColor: color }}
            >
              {displayName.charAt(0)}
            </div>

            {/* Color Palette */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-all border ${
                    color === c 
                      ? 'scale-110 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900' 
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c, borderColor: 'transparent' }}
                />
              ))}
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                {t.displayName}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs focus:outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-700'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300'
                }`}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                {t.bio}
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs focus:outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-700'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300'
                }`}
              />
            </div>
          </div>

          {/* E2EE Keys Generation */}
          <div className={`p-4 rounded-2xl font-mono text-[11px] space-y-4 border ${
            theme === 'dark' 
              ? 'bg-zinc-950 border-zinc-850 text-zinc-300' 
              : 'bg-zinc-50 border-zinc-200/50 text-zinc-700'
          }`}>
            <div className={`flex items-center justify-between pb-2.5 border-b ${
              theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'
            }`}>
              <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 flex items-center gap-1.5">
                <Lock size={12} className="text-emerald-500" />
                {t.secureKeys}
              </span>
              <button
                onClick={regenerateKeys}
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-all flex items-center gap-1"
                title="Regenerate Diffie-Hellman Keys"
              >
                <Shuffle size={12} />
                <span>Reset</span>
              </button>
            </div>

            {/* Public Key */}
            <div className="space-y-1">
              <span className="text-zinc-450 dark:text-zinc-500 font-bold block text-[9px] uppercase">{t.publicKey}</span>
              <div className={`border rounded-lg p-2 overflow-x-auto text-[10px] break-all select-all ${
                theme === 'dark'
                  ? 'bg-zinc-900 border-zinc-800 text-emerald-400'
                  : 'bg-white border-zinc-200 text-emerald-600'
              }`}>
                {publicKey}
              </div>
            </div>

            {/* Private Key */}
            <div className="space-y-1">
              <span className="text-zinc-450 dark:text-zinc-500 font-bold block text-[9px] uppercase">{t.privateKey}</span>
              <div className={`border rounded-lg p-2 overflow-x-auto text-[10px] break-all select-all ${
                theme === 'dark'
                  ? 'bg-zinc-900 border-zinc-800 text-rose-400'
                  : 'bg-white border-zinc-200 text-rose-600'
              }`}>
                {privateKey}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              theme === 'dark'
                ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                : 'bg-white border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 shadow transition-all"
          >
            {t.save}
          </button>
        </div>

      </div>
    </div>
  );
}
