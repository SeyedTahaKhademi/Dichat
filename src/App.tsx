/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Room, 
  Message, 
  SystemSettings, 
  ActiveCall, 
  Language, 
  Theme,
  Attachment,
  RoomPermission
} from './types';
import { 
  mockUsers, 
  mockRooms, 
  mockMessages, 
  defaultSettings 
} from './data/mockData';
import { translations } from './data/translations';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import VoiceCallOverlay from './components/VoiceCallOverlay';
import ProfileModal from './components/ProfileModal';
import AdminPanel from './components/AdminPanel';
import AuthScreen from './components/AuthScreen';

import { 
  Menu, 
  X, 
  ShieldCheck, 
  MessageSquareOff, 
  Plus, 
  Lock, 
  Volume2, 
  FileCheck,
  Server
} from 'lucide-react';

export default function App() {
  // --- Persistent States (backed by LocalStorage) ---
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('dichat_users');
    return saved ? JSON.parse(saved) : mockUsers;
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('dichat_rooms');
    return saved ? JSON.parse(saved) : mockRooms;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('dichat_messages');
    return saved ? JSON.parse(saved) : mockMessages;
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('dichat_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('dichat_language');
    return (saved as Language) || 'fa'; // Default to Persian as requested
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('dichat_theme');
    return (saved as Theme) || 'dark'; // Dark theme is preferred for messengers, can switch
  });

  // --- Runtime UI States ---
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('dichat_current_user_id') || '';
  });
  const [activeRoomId, setActiveRoomId] = useState<string>('r1'); // Default to general
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);

  // --- Typing indicator state ---
  const [typingState, setTypingState] = useState<Record<string, { roomId: string; timestamp: number }>>({});

  // --- Modals Toggles ---
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);

  // For Room Creation inside Modal
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');

  const currentUser = (users.find(u => u.id === currentUserId) || users[0]) as User;
  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];

  // --- LocalStorage Synchronization ---
  useEffect(() => {
    localStorage.setItem('dichat_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('dichat_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('dichat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('dichat_settings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  useEffect(() => {
    localStorage.setItem('dichat_language', language);
    // Apply lang and RTL direction to index document html
    const html = document.documentElement;
    html.setAttribute('lang', language);
    html.setAttribute('dir', language === 'fa' ? 'rtl' : 'ltr');
  }, [language]);

  useEffect(() => {
    localStorage.setItem('dichat_theme', theme);
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('dichat_current_user_id', currentUserId);
  }, [currentUserId]);

  // Synchronize typing status from localStorage and other tabs
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('dichat_typing');
        if (saved) {
          setTypingState(JSON.parse(saved));
        } else {
          setTypingState({});
        }
      } catch (err) {
        console.error('Error synchronizing typing status:', err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('dichat_typing_update', handleStorageChange);

    // Initial load
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dichat_typing_update', handleStorageChange);
    };
  }, []);

  // Prune stale typing states periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingState(prev => {
        const now = Date.now();
        let changed = false;
        const next = { ...prev };
        for (const [userId, val] of Object.entries(next)) {
          const info = val as { roomId: string; timestamp: number };
          if (info && now - info.timestamp > 4000) {
            delete next[userId];
            changed = true;
          }
        }
        if (changed) {
          localStorage.setItem('dichat_typing', JSON.stringify(next));
          return next;
        }
        return prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Handle incoming calls (mock simulation trigger)
  useEffect(() => {
    let callTimer: NodeJS.Timeout;
    if (activeCall && activeCall.status === 'ringing' && activeCall.isOutgoing) {
      // Simulate partner answering in 3 seconds
      callTimer = setTimeout(() => {
        setActiveCall(prev => prev ? { ...prev, status: 'connected', startTime: Date.now() } : null);
      }, 3000);
    }
    return () => {
      if (callTimer) clearTimeout(callTimer);
    };
  }, [activeCall]);

  // Switch Active user simulation
  const handleUserChange = (userId: string) => {
    setCurrentUserId(userId);
    // When changing user, check if they have access to the current active room.
    // If not, fall back to the first room they have access to.
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    const currentRoom = rooms.find(r => r.id === activeRoomId);
    if (currentRoom) {
      const permission = currentRoom.permissions[userId] || 'none';
      if (targetUser.role !== 'admin' && permission === 'none') {
        // Find first visible room
        const firstVisible = rooms.find(r => targetUser.role === 'admin' || (r.permissions[userId] || 'none') !== 'none');
        if (firstVisible) {
          setActiveRoomId(firstVisible.id);
        }
      }
    }
  };

  const handleSetTyping = (userId: string, roomId: string, isTyping: boolean) => {
    try {
      const saved = localStorage.getItem('dichat_typing');
      const currentMap: Record<string, { roomId: string; timestamp: number }> = saved ? JSON.parse(saved) : {};
      
      if (isTyping) {
        currentMap[userId] = { roomId, timestamp: Date.now() };
      } else {
        delete currentMap[userId];
      }
      
      localStorage.setItem('dichat_typing', JSON.stringify(currentMap));
      setTypingState(currentMap);
      window.dispatchEvent(new Event('dichat_typing_update'));
    } catch (err) {
      console.error('Error in handleSetTyping:', err);
    }
  };

  // --- Handlers for Secure Messaging ---
  const handleSendMessage = (content: string, attachments?: Attachment[]) => {
    // Basic mock encryption
    let encryptedPayload: string | undefined = undefined;
    if (systemSettings.e2eeEnabled) {
      const rawText = `Payload::${currentUser.username}::${content}`;
      encryptedPayload = 'AES_GCM_256_' + btoa(unescape(encodeURIComponent(rawText)));
    }

    const newMessage: Message = {
      id: 'm_' + Date.now(),
      roomId: activeRoomId,
      senderId: currentUserId,
      content,
      encryptedContent: encryptedPayload,
      timestamp: Date.now(),
      isEncrypted: systemSettings.e2eeEnabled,
      reactions: [],
      attachments: attachments || []
    };

    setMessages(prev => [...prev, newMessage]);

    // OPTIONAL: Mock Auto-reply from other user inside room for interaction!
    if (activeRoom.type === 'dm') {
      const otherMemberId = activeRoom.members.find(m => m !== currentUserId);
      if (otherMemberId) {
        const partner = users.find(u => u.id === otherMemberId);
        if (partner) {
          // Set partner as typing in the current room
          handleSetTyping(partner.id, activeRoomId, true);

          setTimeout(() => {
            let autoReplyText = '';
            if (language === 'fa') {
              autoReplyText = `پیام شما دریافت شد. سپاس از ارتباط امن شما در بستر DIchat.`;
            } else {
              autoReplyText = `Secure payload received successfully. Thank you for utilizing DIchat.`;
            }

            let partnerEncrypted: string | undefined = undefined;
            if (systemSettings.e2eeEnabled) {
              partnerEncrypted = 'AES_GCM_256_' + btoa(unescape(encodeURIComponent(`Payload::${partner.username}::${autoReplyText}`)));
            }

            const autoMsg: Message = {
              id: 'm_reply_' + Date.now(),
              roomId: activeRoomId,
              senderId: partner.id,
              content: autoReplyText,
              encryptedContent: partnerEncrypted,
              timestamp: Date.now(),
              isEncrypted: systemSettings.e2eeEnabled,
              reactions: [],
              attachments: []
            };
            setMessages(prev => [...prev, autoMsg]);

            // Clear partner typing state
            handleSetTyping(partner.id, activeRoomId, false);
          }, 2000);
        }
      }
    }
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;

      // Check if user already reacted with this emoji
      const existingReactionIdx = msg.reactions.findIndex(r => r.emoji === emoji);
      let updatedReactions = [...msg.reactions];

      if (existingReactionIdx !== -1) {
        const rx = updatedReactions[existingReactionIdx];
        if (rx.userIds.includes(currentUserId)) {
          // Remove reaction
          const filteredUsers = rx.userIds.filter(id => id !== currentUserId);
          if (filteredUsers.length === 0) {
            updatedReactions.splice(existingReactionIdx, 1);
          } else {
            updatedReactions[existingReactionIdx] = { ...rx, userIds: filteredUsers };
          }
        } else {
          // Add user to existing emoji
          updatedReactions[existingReactionIdx] = { ...rx, userIds: [...rx.userIds, currentUserId] };
        }
      } else {
        // Create new reaction
        updatedReactions.push({ emoji, userIds: [currentUserId] });
      }

      return {
        ...msg,
        reactions: updatedReactions
      };
    }));
  };

  const handleToggleMessageArchive = (messageId: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;
      return {
        ...msg,
        isArchived: !msg.isArchived
      };
    }));
  };

  // --- Handlers for Secure Calls ---
  const handleStartCall = () => {
    if (!systemSettings.voiceCallsEnabled) return;
    
    // Find call partner based on active room
    let partnerId = 'u2'; // fallback to Sarah
    if (activeRoom.type === 'dm') {
      const other = activeRoom.members.find(m => m !== currentUserId);
      if (other) partnerId = other;
    } else {
      // Channel call: call another room member
      const other = activeRoom.members.find(m => m !== currentUserId);
      if (other) partnerId = other;
    }

    const call: ActiveCall = {
      id: 'call_' + Date.now(),
      roomId: activeRoomId,
      partnerId,
      isOutgoing: true,
      status: 'ringing',
      isMuted: false
    };
    setActiveCall(call);

    // Auto-trigger microphone mock request visual
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => console.log('Mock Secure Microphone authorized.'))
        .catch(() => console.log('Microphone permission ignored or blocked in iframe.'));
    }
  };

  const handleEndCall = () => {
    setActiveCall(null);
  };

  const handleAnswerCall = () => {
    setActiveCall(prev => prev ? { ...prev, status: 'connected', startTime: Date.now() } : null);
  };

  const handleDeclineCall = () => {
    setActiveCall(null);
  };

  const handleToggleMute = () => {
    setActiveCall(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null);
  };

  // --- Handlers for Admin Controls ---
  const handleCreateRoom = (roomName: string, description: string) => {
    const newRoom: Room = {
      id: 'r_custom_' + Date.now(),
      name: roomName,
      type: 'channel',
      description,
      createdBy: currentUserId,
      members: users.map(u => u.id), // Add all users by default
      permissions: users.reduce((acc, user) => {
        acc[user.id] = 'write'; // default full write permission
        return acc;
      }, {} as Record<string, RoomPermission>)
    };

    setRooms(prev => [...prev, newRoom]);
    setActiveRoomId(newRoom.id);
  };

  const handleUpdatePermissions = (roomId: string, userId: string, permission: RoomPermission) => {
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r;
      return {
        ...r,
        permissions: {
          ...r.permissions,
          [userId]: permission
        }
      };
    }));
  };

  // Save current profile details
  const handleSaveProfile = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setShowProfileModal(false);
  };

  const t = translations[language];
  const isRtl = language === 'fa';
  const partnerUser = activeCall ? (users.find(u => u.id === activeCall.partnerId) || users[0]) : users[0];

  const typingUsersInActiveRoom = Object.entries(typingState)
    .filter(([userId, val]) => {
      const info = val as { roomId: string; timestamp: number };
      return info && info.roomId === activeRoomId && userId !== currentUserId && (Date.now() - info.timestamp < 4000);
    })
    .map(([userId]) => users.find(u => u.id === userId))
    .filter((user): user is User => !!user);

  if (!currentUserId || !currentUser) {
    return (
      <AuthScreen
        users={users}
        onLogin={(user) => {
          setCurrentUserId(user.id);
        }}
        onSignup={(newUser) => {
          const isFirstUser = users.length === 0;
          const userWithRole = {
            ...newUser,
            role: isFirstUser ? ('admin' as const) : ('member' as const)
          };
          setUsers(prev => [...prev, userWithRole]);
          setRooms(prev => prev.map(room => {
            if (room.id === 'r1') {
              return {
                ...room,
                members: [...room.members, userWithRole.id],
                permissions: {
                  ...room.permissions,
                  [userWithRole.id]: 'write' as const
                }
              };
            }
            return room;
          }));
          setCurrentUserId(userWithRole.id);
        }}
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeChange={setTheme}
      />
    );
  }

  return (
    <div className={`h-screen flex flex-col overflow-hidden font-sans transition-colors duration-300 ${
      theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-100 text-zinc-900'
    }`} id="dichat-root-container">
      
      {/* Top Navigation Control Bar */}
      <Navbar
        currentUser={currentUser}
        allUsers={users}
        onUserChange={handleUserChange}
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeChange={setTheme}
        onOpenAdmin={() => setShowAdminPanel(true)}
        isAdmin={currentUser.role === 'admin'}
        onOpenProfile={() => setShowProfileModal(true)}
        onLogout={() => {
          setCurrentUserId('');
        }}
      />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Mobile menu trigger sidebar toggle */}
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className={`absolute bottom-6 z-40 p-4 rounded-full shadow-2xl transition-all md:hidden ${
            isRtl ? 'left-6' : 'right-6'
          } ${
            theme === 'dark' ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-900 text-white'
          }`}
          title="Toggle Navigation Menu"
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* SIDEBAR (Channels & Direct Messages) */}
        <div className={`h-full z-30 transition-transform duration-300 md:translate-x-0 md:static absolute ${
          isRtl ? 'right-0' : 'left-0'
        } ${
          mobileSidebarOpen 
            ? 'translate-x-0' 
            : (isRtl ? 'translate-x-full' : '-translate-x-full')
        }`}>
          <Sidebar
            rooms={rooms}
            activeRoomId={activeRoomId}
            onRoomSelect={(roomId) => {
              setActiveRoomId(roomId);
              setMobileSidebarOpen(false);
            }}
            currentUser={currentUser}
            allUsers={users}
            language={language}
            theme={theme}
            systemSettings={systemSettings}
            onOpenCreateRoom={() => setShowCreateRoomModal(true)}
          />
        </div>

        {/* Backdrop for mobile sidebar */}
        {mobileSidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* MAIN CHAT AREA WORKSPACE */}
        <div className="flex-1 h-full min-w-0">
          <ChatArea
            room={activeRoom}
            currentUser={currentUser}
            allUsers={users}
            messages={messages}
            language={language}
            theme={theme}
            systemSettings={systemSettings}
            onSendMessage={handleSendMessage}
            onToggleMessageArchive={handleToggleMessageArchive}
            onAddReaction={handleAddReaction}
            onStartCall={handleStartCall}
            typingUsers={typingUsersInActiveRoom}
            onTyping={(isTyping) => handleSetTyping(currentUserId, activeRoomId, isTyping)}
          />
        </div>

      </div>

      {/* --- MODAL WINDOWS & SECURE OVERLAYS --- */}

      {/* SECURE VOICE CALL OVERLAY */}
      {activeCall && (
        <VoiceCallOverlay
          activeCall={activeCall}
          partnerUser={partnerUser}
          currentUser={currentUser}
          language={language}
          theme={theme}
          onEndCall={handleEndCall}
          onAnswerCall={handleAnswerCall}
          onDeclineCall={handleDeclineCall}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* PROFILE MODAL WINDOW */}
      {showProfileModal && (
        <ProfileModal
          user={currentUser}
          language={language}
          theme={theme}
          onSave={handleSaveProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* CENTRALIZED ADMIN PANEL CONSOLE */}
      {showAdminPanel && currentUser.role === 'admin' && (
        <AdminPanel
          rooms={rooms}
          allUsers={users}
          systemSettings={systemSettings}
          language={language}
          theme={theme}
          onUpdateSettings={setSystemSettings}
          onCreateRoom={handleCreateRoom}
          onUpdatePermissions={handleUpdatePermissions}
          onClose={() => setShowAdminPanel(false)}
        />
      )}

      {/* CREATE ROOM SIMPLE OVERLAY DIALOG */}
      {showCreateRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl p-5 shadow-2xl border ${
            theme === 'dark' 
              ? 'bg-zinc-900 border-zinc-850 text-zinc-100' 
              : 'bg-white border-zinc-100 text-zinc-900'
          }`}>
            <h3 className="text-sm font-bold mb-4">{t.createRoom}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-bold mb-1">
                  {t.roomName}
                </label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. design-assets"
                  className={`w-full py-2 px-3 rounded-xl border text-xs focus:outline-none ${
                    theme === 'dark'
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-bold mb-1">
                  {t.description}
                </label>
                <input
                  type="text"
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  placeholder="e.g. Design review core notes"
                  className={`w-full py-2 px-3 rounded-xl border text-xs focus:outline-none ${
                    theme === 'dark'
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                onClick={() => {
                  setShowCreateRoomModal(false);
                  setNewRoomName('');
                  setNewRoomDesc('');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border ${
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                }`}
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  if (newRoomName.trim()) {
                    handleCreateRoom(newRoomName.trim().toLowerCase().replace(/\s+/g, '-'), newRoomDesc.trim());
                    setShowCreateRoomModal(false);
                    setNewRoomName('');
                    setNewRoomDesc('');
                  }
                }}
                disabled={!newRoomName.trim()}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold ${
                  newRoomName.trim()
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-zinc-150 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                }`}
              >
                {t.createRoom}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
