/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Room, User, Language, Theme, SystemSettings, RoomPermission } from '../types';
import { translations } from '../data/translations';
import { 
  X, 
  Settings, 
  ShieldAlert, 
  Plus, 
  Lock, 
  Users, 
  Key, 
  FolderLock, 
  EyeOff, 
  Eye, 
  Edit3, 
  Save, 
  Trash2,
  LockKeyhole
} from 'lucide-react';

interface AdminPanelProps {
  rooms: Room[];
  allUsers: User[];
  systemSettings: SystemSettings;
  language: Language;
  theme: Theme;
  onUpdateSettings: (settings: SystemSettings) => void;
  onCreateRoom: (roomName: string, description: string) => void;
  onUpdatePermissions: (roomId: string, userId: string, permission: RoomPermission) => void;
  onClose: () => void;
}

export default function AdminPanel({
  rooms,
  allUsers,
  systemSettings,
  language,
  theme,
  onUpdateSettings,
  onCreateRoom,
  onUpdatePermissions,
  onClose
}: AdminPanelProps) {
  const t = translations[language];
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?.id || '');
  const [successMsg, setSuccessMsg] = useState('');

  const handleToggleSetting = (key: keyof SystemSettings) => {
    const updated = {
      ...systemSettings,
      [key]: !systemSettings[key]
    };
    onUpdateSettings(updated);
    showFeedback(t.settingsUpdatedSuccess);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    
    // Convert to lowercase kebab case for consistency
    const formattedName = newRoomName.trim().toLowerCase().replace(/\s+/g, '-');
    onCreateRoom(formattedName, newRoomDesc.trim());
    setNewRoomName('');
    setNewRoomDesc('');
    showFeedback(t.roomCreatedSuccess);
  };

  const handlePermissionChange = (userId: string, perm: RoomPermission) => {
    onUpdatePermissions(selectedRoomId, userId, perm);
    showFeedback(t.permissionUpdatedSuccess);
  };

  const showFeedback = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const currentRoom = rooms.find(r => r.id === selectedRoomId);
  const isRtl = language === 'fa';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-4xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col transform scale-100 transition-all ${
        theme === 'dark' 
          ? 'bg-zinc-900 border border-zinc-800 text-zinc-100' 
          : 'bg-white border border-zinc-100 text-zinc-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-blue-500" />
            <h3 className="text-base font-bold tracking-tight">{t.adminPanel}</h3>
            <span className="text-[10px] uppercase font-mono bg-blue-500/10 text-blue-500 py-0.5 px-1.5 rounded">
              ROOT_ACCESS
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="bg-emerald-500 text-white text-xs py-2.5 px-4 text-center font-semibold animate-pulse shrink-0">
            {successMsg}
          </div>
        )}

        {/* Workspace Body (Two Columns on Large Screen) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6">
          
          {/* COLUMN 1: System Settings & Create Room (Grid Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* System Toggles */}
            <div className={`p-4 rounded-2xl border ${
              theme === 'dark' ? 'bg-zinc-950/40 border-zinc-800' : 'bg-zinc-50/50 border-zinc-200'
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 flex items-center gap-1.5">
                <Settings size={14} />
                <span>{t.settings}</span>
              </h4>

              <div className="space-y-3">
                {/* E2EE Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">{t.e2ee}</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Enable local E2E Diffie-Hellman keys</p>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('e2eeEnabled')}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      systemSettings.e2eeEnabled ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        systemSettings.e2eeEnabled ? (isRtl ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Voice Calls Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">{t.voiceCall}</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Simulate secure voice dialer overlay</p>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('voiceCallsEnabled')}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      systemSettings.voiceCallsEnabled ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        systemSettings.voiceCallsEnabled ? (isRtl ? '-translate-x-4' : 'translate-x-4') : 'translate-x-40'
                      }`}
                      style={{ transform: systemSettings.voiceCallsEnabled ? (isRtl ? 'translateX(-16px)' : 'translateX(16px)') : 'translateX(0)' }}
                    />
                  </button>
                </div>

                {/* File Sharing Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">{t.fileSharing}</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Allow attachments in text fields</p>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('fileSharingEnabled')}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      systemSettings.fileSharingEnabled ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      style={{ transform: systemSettings.fileSharingEnabled ? (isRtl ? 'translateX(-16px)' : 'translateX(16px)') : 'translateX(0)' }}
                    />
                  </button>
                </div>

                {/* Archiving Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold">{t.archiving}</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Enable advanced history filter controls</p>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('archivingEnabled')}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      systemSettings.archivingEnabled ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      style={{ transform: systemSettings.archivingEnabled ? (isRtl ? 'translateX(-16px)' : 'translateX(16px)') : 'translateX(0)' }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Create Room Form */}
            <div className={`p-4 rounded-2xl border ${
              theme === 'dark' ? 'bg-zinc-950/40 border-zinc-800' : 'bg-zinc-50/50 border-zinc-200'
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 flex items-center gap-1.5">
                <Plus size={14} />
                <span>{t.createRoom}</span>
              </h4>

              <form onSubmit={handleCreateRoom} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-bold mb-1">
                    {t.roomName}
                  </label>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="e.g. dev-team, marketing"
                    className={`w-full py-2 px-3 rounded-xl border text-xs focus:outline-none transition-all ${
                      theme === 'dark'
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-zinc-700'
                        : 'bg-white border-zinc-200 text-zinc-900 focus:border-zinc-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-bold mb-1">
                    {t.description}
                  </label>
                  <textarea
                    value={newRoomDesc}
                    onChange={(e) => setNewRoomDesc(e.target.value)}
                    rows={2}
                    placeholder="What is this channel for?"
                    className={`w-full py-2 px-3 rounded-xl border text-xs focus:outline-none transition-all resize-none ${
                      theme === 'dark'
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-zinc-700'
                        : 'bg-white border-zinc-200 text-zinc-900 focus:border-zinc-300'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newRoomName.trim()}
                  className={`w-full py-2 px-4 rounded-xl text-xs font-semibold shadow transition-all ${
                    newRoomName.trim()
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-95'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  {t.createRoom}
                </button>
              </form>
            </div>

          </div>

          {/* COLUMN 2: Room Permissions & Access Matrix (Grid Span 7) */}
          <div className="lg:col-span-7 flex flex-col h-full space-y-4">
            
            <div className={`flex-1 p-4 rounded-2xl border flex flex-col h-full ${
              theme === 'dark' ? 'bg-zinc-950/40 border-zinc-800' : 'bg-zinc-50/50 border-zinc-200'
            }`}>
              {/* Header Title */}
              <div className="shrink-0 mb-4 flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                  <FolderLock size={14} />
                  <span>{t.permissions}</span>
                </h4>

                {/* Room Selector Dropdown */}
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className={`py-1.5 px-3 rounded-xl border text-xs focus:outline-none font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
                      : 'bg-white border-zinc-200 text-zinc-900'
                  }`}
                >
                  {rooms.filter(r => r.type === 'channel').map((r) => (
                    <option key={r.id} value={r.id}>
                      #{r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Matrix Table */}
              <div className="flex-1 overflow-y-auto min-h-[250px]">
                {currentRoom ? (
                  <div className="space-y-3.5">
                    
                    <div className="p-3.5 rounded-xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                      <h5 className="text-xs font-bold font-sans">#{currentRoom.name}</h5>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">{currentRoom.description}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                        {t.userPermissions}
                      </p>

                      {allUsers.map((user) => {
                        // Admins have implicit full write permissions
                        const isUserAdmin = user.role === 'admin';
                        const currentPerm = currentRoom.permissions[user.id] || 'none';

                        return (
                          <div 
                            key={user.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                              theme === 'dark' 
                                ? 'bg-zinc-900/60 border-zinc-850 hover:bg-zinc-900 hover:border-zinc-800' 
                                : 'bg-white border-zinc-150 hover:bg-zinc-50 hover:border-zinc-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: user.color }} />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold truncate">{user.displayName}</p>
                                <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono">@{user.username}</p>
                              </div>
                            </div>

                            {isUserAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono bg-blue-500/10 text-blue-500 border border-blue-500/20 font-semibold">
                                <LockKeyhole size={10} />
                                ADMIN_FULL
                              </span>
                            ) : (
                              /* Permission Selectors */
                              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 p-0.5 rounded-xl border border-zinc-200 dark:border-zinc-850">
                                {/* None */}
                                <button
                                  onClick={() => handlePermissionChange(user.id, 'none')}
                                  className={`px-2 py-1 rounded-lg text-[9px] font-mono font-bold transition-all ${
                                    currentPerm === 'none'
                                      ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                                      : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700'
                                  }`}
                                  title="No Access (Hidden)"
                                >
                                  {language === 'fa' ? 'بدون دسترسی' : 'NONE'}
                                </button>
                                {/* Read Only */}
                                <button
                                  onClick={() => handlePermissionChange(user.id, 'read')}
                                  className={`px-2 py-1 rounded-lg text-[9px] font-mono font-bold transition-all ${
                                    currentPerm === 'read'
                                      ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                                      : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700'
                                  }`}
                                  title="Read Only"
                                >
                                  {language === 'fa' ? 'فقط خواندنی' : 'READ'}
                                </button>
                                {/* Read Write */}
                                <button
                                  onClick={() => handlePermissionChange(user.id, 'write')}
                                  className={`px-2 py-1 rounded-lg text-[9px] font-mono font-bold transition-all ${
                                    currentPerm === 'write'
                                      ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                                      : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700'
                                  }`}
                                  title="Read & Write"
                                >
                                  {language === 'fa' ? 'نوشتن' : 'WRITE'}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 text-center italic mt-12">Create a channel first.</p>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 shadow transition-all"
          >
            {t.cancel}
          </button>
        </div>

      </div>
    </div>
  );
}
