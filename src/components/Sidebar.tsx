/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Room, User, Language, Theme, SystemSettings } from '../types';
import { translations } from '../data/translations';
import { 
  Hash, 
  MessageSquare, 
  Plus, 
  Lock, 
  FolderLock, 
  Search,
  Archive,
  UserX,
  Volume2
} from 'lucide-react';

interface SidebarProps {
  rooms: Room[];
  activeRoomId: string;
  onRoomSelect: (roomId: string) => void;
  currentUser: User;
  allUsers: User[];
  language: Language;
  theme: Theme;
  systemSettings: SystemSettings;
  onOpenCreateRoom: () => void;
}

export default function Sidebar({
  rooms,
  activeRoomId,
  onRoomSelect,
  currentUser,
  allUsers,
  language,
  theme,
  systemSettings,
  onOpenCreateRoom
}: SidebarProps) {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const isRtl = language === 'fa';

  // Filter out rooms that the user does not have permission to access ('none')
  const visibleRooms = rooms.filter(room => {
    const userPermission = room.permissions[currentUser.id] || 'none';
    if (currentUser.role === 'admin') return true; // Admins see everything
    return userPermission !== 'none';
  });

  const filteredRooms = visibleRooms.filter(room => {
    const roomNameString = room.type === 'dm' 
      ? getDmRoomName(room)
      : room.name;
    return roomNameString.toLowerCase().includes(searchQuery.toLowerCase());
  });

  function getDmRoomName(room: Room): string {
    const otherMemberId = room.members.find(mId => mId !== currentUser.id);
    if (!otherMemberId) return room.name;
    const otherUser = allUsers.find(u => u.id === otherMemberId);
    return otherUser ? otherUser.displayName : room.name;
  }

  function getDmUserColor(room: Room): string {
    const otherMemberId = room.members.find(mId => mId !== currentUser.id);
    if (!otherMemberId) return '#10b981';
    const otherUser = allUsers.find(u => u.id === otherMemberId);
    return otherUser ? otherUser.color : '#10b981';
  }

  const channels = filteredRooms.filter(r => r.type === 'channel');
  const dms = filteredRooms.filter(r => r.type === 'dm');

  return (
    <div className={`w-80 border-r flex flex-col shrink-0 h-full transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-zinc-900/60 border-zinc-800 text-zinc-100' 
        : 'bg-zinc-50/40 border-zinc-150 text-zinc-900'
    }`} id="dichat-sidebar">
      
      {/* Search Bar */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full text-xs py-2.5 px-3 rounded-xl border pl-10 focus:outline-none transition-all ${
              theme === 'dark'
                ? 'bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-700 placeholder-zinc-600'
                : 'bg-white border-zinc-200/60 text-zinc-900 focus:border-blue-500/35 focus:ring-2 focus:ring-blue-500/5 placeholder-zinc-400'
            }`}
            style={{ paddingLeft: isRtl ? '12px' : '36px', paddingRight: isRtl ? '36px' : '12px' }}
          />
          <Search 
            size={14} 
            className={`absolute top-1/2 -translate-y-1/2 opacity-40 ${
              isRtl ? 'right-3' : 'left-3'
            }`} 
          />
        </div>
      </div>

      {/* Main Lists (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        
        {/* CHANNELS SECTION */}
        <div>
          <div className="flex items-center justify-between px-2 pb-2 text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
            <span>{t.channels}</span>
            {currentUser.role === 'admin' && (
              <button
                onClick={onOpenCreateRoom}
                className="hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 rounded-md transition-all"
                title={t.createRoom}
              >
                <Plus size={14} />
              </button>
            )}
          </div>

          <div className="space-y-1">
            {channels.length === 0 ? (
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 px-3 py-1.5 italic">
                {t.noMessagesFound}
              </p>
            ) : (
              channels.map((channel) => {
                const isActive = activeRoomId === channel.id;
                const hasE2ee = systemSettings.e2eeEnabled;
                return (
                  <button
                    key={channel.id}
                    onClick={() => onRoomSelect(channel.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all text-left ${
                      isRtl ? 'text-right' : 'text-left'
                    } ${
                      isActive
                        ? (theme === 'dark' ? 'bg-zinc-800 text-white font-semibold' : 'bg-white shadow-sm border border-zinc-200/65 text-blue-600 font-semibold')
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/30 dark:hover:bg-zinc-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Hash size={14} className={isActive && theme !== 'dark' ? 'text-blue-500 opacity-80' : 'opacity-60'} />
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate font-medium">{channel.name}</p>
                          {hasE2ee && (
                            <span title={t.e2eeBadge}>
                              <Lock size={10} className="text-emerald-500 shrink-0" />
                            </span>
                          )}
                        </div>
                        {channel.description && (
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                            {channel.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono shrink-0 px-1 py-0.5 rounded ${
                      isActive && theme !== 'dark'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400'
                    }`}>
                      {channel.members.length}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* DIRECT MESSAGES SECTION */}
        <div>
          <div className="flex items-center justify-between px-2 pb-2 text-[10px] uppercase font-mono tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
            <span>{t.directMessages}</span>
          </div>

          <div className="space-y-1">
            {dms.length === 0 ? (
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 px-3 py-1.5 italic">
                {t.noMessagesFound}
              </p>
            ) : (
              dms.map((dm) => {
                const isActive = activeRoomId === dm.id;
                const dmName = getDmRoomName(dm);
                const dmColor = getDmUserColor(dm);
                return (
                  <button
                    key={dm.id}
                    onClick={() => onRoomSelect(dm.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all text-left ${
                      isRtl ? 'text-right' : 'text-left'
                    } ${
                      isActive
                        ? (theme === 'dark' ? 'bg-zinc-800 text-white font-semibold' : 'bg-white shadow-sm border border-zinc-200/65 text-blue-600 font-semibold')
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/30 dark:hover:bg-zinc-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="relative shrink-0">
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase"
                          style={{ backgroundColor: dmColor }}
                        >
                          {dmName.charAt(0)}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                      </div>
                      <div className="truncate">
                        <p className="truncate font-medium">{dmName}</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                          {systemSettings.e2eeEnabled ? t.e2eeBadge : t.offlineStatus}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Footer Branding Info */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 shrink-0 text-center">
        <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-1">
          <Lock size={10} className="text-emerald-500" />
          <span>AES-256 / SHA-256 SECURITIES</span>
        </p>
      </div>
    </div>
  );
}
