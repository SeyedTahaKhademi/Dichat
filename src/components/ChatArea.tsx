/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Room, 
  User, 
  Message, 
  Language, 
  Theme, 
  SystemSettings, 
  Attachment, 
  Reaction,
  RoomPermission
} from '../types';
import { translations } from '../data/translations';
import { 
  Send, 
  Paperclip, 
  Phone, 
  Lock, 
  LockOpen,
  Search, 
  Archive, 
  Smile, 
  Users, 
  Check, 
  Sparkles, 
  Download, 
  File, 
  Info, 
  FolderOpen,
  CornerUpLeft,
  X,
  FileCheck,
  RotateCcw
} from 'lucide-react';

interface ChatAreaProps {
  room: Room;
  currentUser: User;
  allUsers: User[];
  messages: Message[];
  language: Language;
  theme: Theme;
  systemSettings: SystemSettings;
  onSendMessage: (content: string, attachments?: Attachment[]) => void;
  onToggleMessageArchive: (messageId: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onStartCall: () => void;
  typingUsers: User[];
  onTyping: (isTyping: boolean) => void;
}

export default function ChatArea({
  room,
  currentUser,
  allUsers,
  messages,
  language,
  theme,
  systemSettings,
  onSendMessage,
  onToggleMessageArchive,
  onAddReaction,
  onStartCall,
  typingUsers,
  onTyping
}: ChatAreaProps) {
  const t = translations[language];
  const [inputText, setInputText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'text' | 'files' | 'archived'>('all');
  const [isE2eeLocal, setIsE2eeLocal] = useState(true);
  
  // Mentions popover state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);

  // Inspector popup for raw E2EE payload
  const [inspectMessage, setInspectMessage] = useState<Message | null>(null);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isRtl = language === 'fa';

  // Room user permission
  const userPermission: RoomPermission = room.permissions[currentUser.id] || 'none';
  const hasWriteAccess = currentUser.role === 'admin' || userPermission === 'write';
  const hasReadAccess = currentUser.role === 'admin' || userPermission === 'read' || userPermission === 'write';

  // Scroll to bottom on room change or new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Reset typing status on room change
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    onTyping(false);
  }, [messages, room.id]);

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Handle Drag & Drop uploading
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFiles = (filesList: FileList) => {
    if (!systemSettings.fileSharingEnabled) return;
    Array.from(filesList).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAttachment: Attachment = {
          id: 'att_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: event.target?.result as string || ''
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  // Autocomplete mentions handler
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputText(value);

    // Trigger typing state
    if (value.trim()) {
      onTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2500);
    } else {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      onTyping(false);
    }

    if (!systemSettings.mentionsEnabled) return;

    // Detect if user typed @
    const lastAtIdx = value.lastIndexOf('@');
    if (lastAtIdx !== -1 && lastAtIdx >= value.length - 15) {
      const query = value.substring(lastAtIdx + 1);
      if (!query.includes(' ')) {
        setMentionQuery(query);
        setShowMentions(true);
        setMentionIndex(0);
        return;
      }
    }
    setShowMentions(false);
  };

  const selectMention = (username: string) => {
    const lastAtIdx = inputText.lastIndexOf('@');
    if (lastAtIdx !== -1) {
      const prefix = inputText.substring(0, lastAtIdx);
      const suffix = ' ';
      setInputText(prefix + '@' + username + suffix);
    }
    setShowMentions(false);
    textInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions) {
      const filtered = filterMentionUsers();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(prev => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(prev => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[mentionIndex]) {
          selectMention(filtered[mentionIndex].username);
        }
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
    } else {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleSend = () => {
    if (!inputText.trim() && attachments.length === 0) return;
    if (!hasWriteAccess) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    onTyping(false);

    onSendMessage(inputText.trim(), attachments);
    setInputText('');
    setAttachments([]);
  };

  const filterMentionUsers = () => {
    return allUsers.filter(u => 
      u.id !== currentUser.id && 
      u.username.toLowerCase().includes(mentionQuery.toLowerCase())
    );
  };

  // Filter messages in room based on advanced archive search query and selected filters
  const filteredMessages = messages
    .filter(msg => msg.roomId === room.id)
    .filter(msg => {
      // Archive Filter
      const isMsgArchived = msg.isArchived || false;
      if (searchFilter === 'archived') {
        return isMsgArchived;
      }
      // If we are not specifically filtering "archived", hide archived messages from general list
      if (!searchOpen && isMsgArchived) {
        return false;
      }
      return true;
    })
    .filter(msg => {
      // Text Filter
      if (searchFilter === 'text' && msg.attachments && msg.attachments.length > 0) {
        return false;
      }
      // Files Filter
      if (searchFilter === 'files' && (!msg.attachments || msg.attachments.length === 0)) {
        return false;
      }
      
      // Keyword search
      if (!searchQuery.trim()) return true;
      return msg.content.toLowerCase().includes(searchQuery.toLowerCase());
    });

  function getSender(senderId: string): User {
    return allUsers.find(u => u.id === senderId) || {
      id: 'deleted',
      username: 'deleted',
      displayName: 'Deleted User',
      color: '#cbd5e1',
      role: 'member',
      publicKey: ''
    };
  }

  const formatMessageTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString(language === 'fa' ? 'fa-IR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Render a parsed message content highlighting mentions
  const renderMessageContent = (msg: Message, isMe: boolean) => {
    if (systemSettings.e2eeEnabled && msg.isEncrypted) {
      return (
        <div className="space-y-1.5 font-sans">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] max-w-max ${
            isMe && theme !== 'dark'
              ? 'bg-blue-700/50 border-blue-500/30 text-blue-100'
              : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/60 text-zinc-500'
          }`}>
            <Lock size={10} className={`${isMe && theme !== 'dark' ? 'text-blue-200' : 'text-emerald-500'} shrink-0`} />
            <span className="font-mono tracking-tight text-[9px]">{msg.encryptedContent?.substring(0, 24)}...</span>
            <button 
              onClick={() => setInspectMessage(msg)}
              className={`hover:underline font-mono text-[9px] shrink-0 font-bold ${
                isMe && theme !== 'dark' ? 'text-white' : 'text-blue-500'
              }`}
              title={t.rawEncryptedData}
            >
              [INSPECT]
            </button>
          </div>
          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
        </div>
      );
    }

    const text = msg.content;
    if (!text) return null;

    const tokens = text.split(/(\s+)/);
    return (
      <p className="whitespace-pre-wrap leading-relaxed">
        {tokens.map((token, idx) => {
          if (token.startsWith('@') && token.length > 1 && systemSettings.mentionsEnabled) {
            const cleanUsername = token.substring(1).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
            const matchingUser = allUsers.find(u => u.username === cleanUsername);
            if (matchingUser) {
              return (
                <span 
                  key={idx} 
                  className={`inline-block px-1.5 py-0.5 rounded-md font-semibold text-[11px] font-mono mx-0.5 shadow-sm ${
                    isMe && theme !== 'dark'
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-500/10 dark:bg-blue-500/15 text-blue-500 dark:text-blue-400'
                  }`}
                >
                  @{matchingUser.username}
                </span>
              );
            }
          }
          return token;
        })}
      </p>
    );
  };

  const reactionEmojis = ['👍', '❤️', '🔥', '😂', '🔒', '🚀'];

  return (
    <div 
      className={`flex-1 flex flex-col h-full min-w-0 transition-colors duration-300 relative ${
        theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      id="dichat-chat-area"
    >
      
      {/* CHAT HEADER */}
      <div className="h-16 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 uppercase shadow-inner ${
              room.type === 'dm' 
                ? 'text-white' 
                : (theme === 'dark' ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-100 text-zinc-600')
            }`} style={room.type === 'dm' ? { backgroundColor: room.permissions[currentUser.id] === 'none' ? '#cbd5e1' : '#3b82f6' } : {}}>
              {room.type === 'dm' ? room.name.charAt(0) : '#'}
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-xs sm:text-sm truncate tracking-tight">{room.type === 'dm' ? room.name : room.name}</h3>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">{room.description || t.offlineStatus}</p>
          </div>
        </div>

        {/* Header Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* E2EE Toggle local */}
          {systemSettings.e2eeEnabled && (
            <button
              onClick={() => setIsE2eeLocal(!isE2eeLocal)}
              className={`p-2 rounded-xl border transition-all ${
                isE2eeLocal
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400'
              }`}
              title={t.toggleE2EE}
            >
              {isE2eeLocal ? <Lock size={15} /> : <LockOpen size={15} />}
            </button>
          )}

          {/* Secure Call Button */}
          {systemSettings.voiceCallsEnabled && (
            <button
              onClick={onStartCall}
              className={`p-2 rounded-xl border transition-all ${
                theme === 'dark'
                  ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                  : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900'
              }`}
              title={t.secureCallButton}
            >
              <Phone size={15} />
            </button>
          )}

          {/* Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={`p-2 rounded-xl border transition-all ${
              searchOpen
                ? 'bg-blue-500/15 border-blue-500/30 text-blue-500'
                : (theme === 'dark' ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900')
            }`}
            title={t.searchTitle}
          >
            <Search size={15} />
          </button>

        </div>
      </div>

      {/* ADVANCED ARCHIVE SEARCH DRAWER */}
      {searchOpen && (
        <div className={`p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col gap-3 shrink-0 animate-fade-in ${
          theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50/50'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Archive size={12} className="text-zinc-500" />
              {t.searchTitle}
            </span>
            <button 
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
                setSearchFilter('all');
              }}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 transition-all"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchMessages}
              className={`flex-1 py-1.5 px-3 rounded-xl border text-xs focus:outline-none transition-all ${
                theme === 'dark'
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-zinc-700'
                  : 'bg-white border-zinc-200 text-zinc-900 focus:border-zinc-300'
              }`}
            />

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {(['all', 'text', 'files', 'archived'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSearchFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all shrink-0 ${
                    searchFilter === filter
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {t[filter] || filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ACCESS DENIED OVERLAY */}
      {!hasReadAccess && (
        <div className="absolute inset-0 bg-zinc-900/40 dark:bg-zinc-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 text-center max-w-sm shadow-2xl">
            <Lock size={36} className="text-rose-500 mx-auto mb-4 animate-bounce" />
            <h4 className="text-sm font-bold text-white mb-2">{t.noAccessWarning}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Ask Ali (System Admin) to grant you access using the Admin Panel.
            </p>
          </div>
        </div>
      )}

      {/* MESSAGES LIST AREA */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <FolderOpen size={36} className="text-zinc-400 mb-3" />
            <p className="text-xs italic">{t.noMessagesFound}</p>
          </div>
        ) : (
          filteredMessages.map((msg, index) => {
            const sender = getSender(msg.senderId);
            const isMe = msg.senderId === currentUser.id;

            return (
              <div 
                key={msg.id}
                className={`flex gap-3 group animate-fade-in ${
                  isMe ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Sender Avatar */}
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white uppercase shrink-0 mt-0.5 shadow-sm"
                  style={{ backgroundColor: sender.color }}
                >
                  {sender.displayName.charAt(0)}
                </div>

                {/* Message Bubble Container */}
                <div className={`max-w-[75%] sm:max-w-[65%] flex flex-col ${
                  isMe ? 'items-end' : 'items-start'
                }`}>
                  
                  {/* Sender Name & Meta */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold text-zinc-500">{sender.displayName}</span>
                    <span className="text-[9px] text-zinc-400 font-mono">{formatMessageTime(msg.timestamp)}</span>
                    {msg.isArchived && (
                      <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1 rounded flex items-center gap-0.5">
                        <Archive size={8} />
                        {t.archived}
                      </span>
                    )}
                  </div>

                  {/* Bubble Content */}
                  <div className={`p-3 rounded-2xl relative shadow-sm border transition-all text-xs leading-relaxed ${
                    isMe
                      ? (theme === 'dark' 
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-100 rounded-tr-none shadow-zinc-950/20' 
                          : 'bg-blue-600 border-blue-600 text-white rounded-tr-none shadow-blue-500/10')
                      : (theme === 'dark' 
                          ? 'bg-zinc-950 border-zinc-800/80 text-zinc-100 rounded-tl-none shadow-zinc-950/20' 
                          : 'bg-zinc-100/80 border-zinc-200/50 text-zinc-900 rounded-tl-none shadow-sm')
                  }`}>
                    {renderMessageContent(msg, isMe)}

                    {/* Attachments inside bubble */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className={`space-y-2 mt-2.5 pt-2.5 border-t ${
                        isMe ? 'border-white/10' : 'border-zinc-200/10 dark:border-zinc-800/50'
                      }`}>
                        {msg.attachments.map((att) => {
                          const isImg = att.type.startsWith('image/');
                          return (
                            <div key={att.id} className={`rounded-xl overflow-hidden border ${
                              isMe 
                                ? 'border-white/15 bg-white/5' 
                                : 'border-zinc-200/30 dark:border-zinc-800/40 bg-zinc-500/5 dark:bg-zinc-950/20'
                            } max-w-sm`}>
                              {isImg ? (
                                <div className="group/att relative">
                                  <img 
                                    src={att.dataUrl} 
                                    alt={att.name} 
                                    className="max-h-48 object-cover w-full cursor-zoom-in"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/att:opacity-100 transition-all flex items-center justify-center">
                                    <a 
                                      href={att.dataUrl} 
                                      download={att.name}
                                      className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white"
                                    >
                                      <Download size={14} />
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-2.5 flex items-center gap-2">
                                  <File size={16} className={isMe ? 'text-white/80' : 'text-zinc-500 shrink-0'} />
                                  <div className="min-w-0 flex-1">
                                    <p className={`text-[10px] font-semibold truncate ${isMe ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>{att.name}</p>
                                    <p className={`text-[9px] font-mono ${isMe ? 'text-white/60' : 'text-zinc-400 dark:text-zinc-500'}`}>{formatFileSize(att.size)}</p>
                                  </div>
                                  <a 
                                    href={att.dataUrl} 
                                    download={att.name}
                                    className={`p-1.5 rounded-lg transition-all ${
                                      isMe 
                                        ? 'bg-white/10 hover:bg-white/20 text-white' 
                                        : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                                    }`}
                                  >
                                    <Download size={12} />
                                  </a>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar (Reactions & Archiving) */}
                  <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1.5 mt-1.5 ${
                    isMe ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    {/* Reactions Trigger Button */}
                    <div className="relative group/react inline-block">
                      <button className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-600 transition-all">
                        <Smile size={13} />
                      </button>
                      <div className={`absolute bottom-full z-20 mb-1 hidden group-hover/react:flex items-center gap-1 p-1 rounded-xl shadow-lg border ${
                        theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                      }`}>
                        {reactionEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => onAddReaction(msg.id, emoji)}
                            className="p-1 rounded text-sm hover:scale-110 active:scale-95 transition-all"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Archive toggle */}
                    {systemSettings.archivingEnabled && (
                      <button
                        onClick={() => onToggleMessageArchive(msg.id)}
                        className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-600 transition-all"
                        title={msg.isArchived ? t.unarchiveMessage : t.archiveMessage}
                      >
                        {msg.isArchived ? <RotateCcw size={13} /> : <Archive size={13} />}
                      </button>
                    )}
                  </div>

                  {/* Displayed Applied Reactions list */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className={`flex flex-wrap items-center gap-1 mt-1.5 ${
                      isMe ? 'justify-end' : 'justify-start'
                    }`}>
                      {msg.reactions.map((react, rIdx) => {
                        const hasReacted = react.userIds.includes(currentUser.id);
                        return (
                          <button
                            key={rIdx}
                            onClick={() => onAddReaction(msg.id, react.emoji)}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-semibold border transition-all ${
                              hasReacted
                                ? 'bg-blue-500/10 border-blue-500/30 text-blue-500'
                                : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850 text-zinc-400 hover:text-zinc-600'
                            }`}
                          >
                            <span>{react.emoji}</span>
                            <span className="font-mono text-[9px]">{react.userIds.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
        
        {typingUsers.length > 0 && (
          <div className={`flex gap-3 items-end animate-fade-in py-1 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Typing User Avatars */}
            <div className={`flex shrink-0 ${isRtl ? 'flex-row-reverse -space-x-reverse' : 'flex-row -space-x-2'}`}>
              {typingUsers.slice(0, 3).map(user => (
                <div 
                  key={user.id}
                  className="w-8 h-8 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm"
                  style={{ backgroundColor: user.color }}
                  title={user.displayName}
                >
                  {user.displayName.charAt(0)}
                </div>
              ))}
            </div>

            {/* Bubble */}
            <div className={`p-3 rounded-2xl relative shadow-sm border text-xs flex items-center gap-2 max-w-[75%] sm:max-w-[65%] ${
              isRtl ? 'rounded-tr-none' : 'rounded-tl-none'
            } ${
              theme === 'dark' 
                ? 'bg-zinc-950 border-zinc-800/80 text-zinc-100' 
                : 'bg-zinc-50 border-zinc-200 text-zinc-900'
            }`}>
              <div className="flex items-center gap-1">
                <span className="font-bold text-[11px] text-zinc-500 dark:text-zinc-400">
                  {typingUsers.map(u => u.displayName).join(', ')}
                </span>
                <span className="text-zinc-400 dark:text-zinc-500 text-[10px] font-medium mx-1">
                  {typingUsers.length === 1 ? t.isTyping : t.areTyping}
                </span>
              </div>
              
              {/* Staggered Dot Wave Bounce */}
              <div className="flex items-center gap-1 px-1.5 py-1 rounded-full bg-zinc-900/10 dark:bg-white/10 shrink-0">
                <span className="w-1.5 h-1.5 bg-zinc-500 dark:bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
                <span className="w-1.5 h-1.5 bg-zinc-500 dark:bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }} />
                <span className="w-1.5 h-1.5 bg-zinc-500 dark:bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      {/* DRAG AND DROP SCREEN BLUR COVER */}
      {dragActive && systemSettings.fileSharingEnabled && (
        <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm border-2 border-dashed border-blue-500 z-30 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl animate-pulse">
            <FileCheck size={48} className="text-blue-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-white">{t.sharedFilesTitle}</p>
            <p className="text-xs text-zinc-400 mt-1">{t.dragAndDrop}</p>
          </div>
        </div>
      )}

      {/* CHAT INPUT AREA */}
      {hasReadAccess && (
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 shrink-0 z-10 bg-zinc-50/30 dark:bg-zinc-950/90 backdrop-blur-md">
          
          {/* Active room read-only message if no write access */}
          {!hasWriteAccess ? (
            <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-2 text-zinc-500 text-xs text-center font-medium animate-fade-in">
              <Lock size={14} className="text-rose-500" />
              <span>{t.readOnlyWarning}</span>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              
              {/* Mentions Suggestion Popover */}
              {showMentions && filterMentionUsers().length > 0 && (
                <div className={`absolute bottom-full mb-2 z-40 w-56 rounded-2xl border p-1 shadow-2xl transition-all ${
                  isRtl ? 'right-4' : 'left-4'
                } ${
                  theme === 'dark' 
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-100' 
                    : 'bg-white border-zinc-200/60 text-zinc-900'
                }`}>
                  {filterMentionUsers().map((user, idx) => (
                    <button
                      key={user.id}
                      onClick={() => selectMention(user.username)}
                      className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs transition-all text-left ${
                        idx === mentionIndex
                          ? (theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-blue-600 font-medium')
                          : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-850/30'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: user.color }} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{user.displayName}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">@{user.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Uploaded File Previews */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2.5 items-center p-2 rounded-2xl bg-zinc-100/60 dark:bg-zinc-900/50 border border-zinc-200/30 dark:border-zinc-850/30">
                  {attachments.map((att) => {
                    const isImg = att.type.startsWith('image/');
                    return (
                      <div key={att.id} className="relative p-1.5 pr-8 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/85 flex items-center gap-2 max-w-xs shadow-sm">
                        {isImg ? (
                          <img 
                            src={att.dataUrl} 
                            alt={att.name} 
                            className="w-8 h-8 rounded-lg object-cover shrink-0" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <File size={16} className="text-zinc-500 shrink-0" />
                        )}
                        <span className="text-[10px] font-semibold truncate max-w-[120px]">{att.name}</span>
                        <button
                          onClick={() => setAttachments(prev => prev.filter(x => x.id !== att.id))}
                          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Main Input Controls Row */}
              <div className="flex items-end gap-2.5">
                
                {/* File Upload Hidden input & trigger */}
                {systemSettings.fileSharingEnabled && (
                  <div className="relative shrink-0">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      multiple
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-3 rounded-xl border transition-all shadow-sm ${
                        theme === 'dark'
                          ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
                          : 'bg-white border-zinc-200/80 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-500 hover:text-zinc-850'
                      }`}
                      title={t.dragAndDrop}
                    >
                      <Paperclip size={16} />
                    </button>
                  </div>
                )}

                {/* Text entry field */}
                <div className="flex-1">
                  <textarea
                    ref={textInputRef}
                    rows={1}
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={t.typingPlaceholder}
                    className={`w-full py-2.5 px-3.5 rounded-xl border text-xs focus:outline-none transition-all resize-none max-h-24 shadow-inner ${
                      theme === 'dark'
                        ? 'bg-zinc-900/60 border-zinc-800 text-zinc-100 focus:border-zinc-700'
                        : 'bg-white border-zinc-200/70 text-zinc-900 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 placeholder-zinc-400'
                    }`}
                  />
                </div>

                {/* Send action Button */}
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() && attachments.length === 0}
                  className={`p-3 rounded-xl transition-all shrink-0 shadow-sm hover:scale-105 active:scale-95 ${
                    (inputText.trim() || attachments.length > 0)
                      ? (theme === 'dark' 
                          ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/10')
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-750 cursor-not-allowed border border-transparent dark:border-zinc-800/40'
                  }`}
                >
                  <Send size={16} className={isRtl ? 'rotate-180' : ''} />
                </button>

              </div>

              {/* Cryptographic encryption status line */}
              {systemSettings.e2eeEnabled && isE2eeLocal && (
                <div className="flex items-center gap-1.5 text-[9px] text-emerald-500 font-mono">
                  <Lock size={10} className="animate-pulse" />
                  <span>AES-256 E2EE CLIENT-SIDE ENCRYPTION SHIELD ACTIVE</span>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* DIALOG FOR INSPECTING RAW ENCRYPTED PAYLOAD */}
      {inspectMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col p-5 border ${
            theme === 'dark' 
              ? 'bg-zinc-900 border-zinc-800 text-zinc-100' 
              : 'bg-white border-zinc-100 text-zinc-900'
          }`}>
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 flex items-center gap-1">
                <Lock size={12} className="text-emerald-500" />
                {t.rawEncryptedData}
              </span>
              <button 
                onClick={() => setInspectMessage(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="my-4 space-y-3.5 text-xs">
              <div>
                <p className="text-[10px] font-bold text-zinc-500 mb-1">DECRYPTED TEXT</p>
                <p className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-950 font-serif leading-relaxed">
                  {inspectMessage.content}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-zinc-500 mb-1">ENCRYPTED PAYLOAD (CIPHERTEXT)</p>
                <p className="p-3 rounded-xl bg-zinc-950 text-emerald-400 font-mono break-all text-[10px]">
                  {inspectMessage.encryptedContent}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-mono leading-normal">
                This payload was encrypted locally using AES-256-GCM. Transiting through database servers, administrators or intruders see ONLY the base64 ciphertext above. Keys never leave users devices.
              </div>
            </div>

            <button
              onClick={() => setInspectMessage(null)}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
