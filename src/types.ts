/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'fa';
export type Theme = 'light' | 'dark';

export type UserRole = 'admin' | 'member';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  color: string; // Tailwind hex or class name
  role: UserRole;
  bio?: string;
  publicKey: string;
}

export type RoomPermission = 'none' | 'read' | 'write';

export type RoomType = 'channel' | 'dm';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  description?: string;
  createdBy: string;
  members: string[]; // List of User IDs
  isArchived?: boolean;
  permissions: Record<string, RoomPermission>; // Maps userId to RoomPermission
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  encryptedContent?: string;
  timestamp: number;
  isEncrypted: boolean;
  reactions: Reaction[];
  attachments?: Attachment[];
  isArchived?: boolean;
  mentions?: string[]; // list of username handles or user ids
}

export interface SystemSettings {
  e2eeEnabled: boolean;
  fileSharingEnabled: boolean;
  voiceCallsEnabled: boolean;
  mentionsEnabled: boolean;
  archivingEnabled: boolean;
}

export interface ActiveCall {
  id: string;
  roomId: string;
  partnerId: string; // The user you are calling or who is calling you
  isOutgoing: boolean;
  status: 'ringing' | 'connected' | 'disconnected';
  isMuted: boolean;
  startTime?: number;
}
