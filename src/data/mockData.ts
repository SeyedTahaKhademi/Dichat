/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Room, Message, SystemSettings } from '../types';

// Empty by default for direct production onboarding
export const mockUsers: User[] = [];

// Clean initial channels
export const mockRooms: Room[] = [
  {
    id: 'r1',
    name: 'general',
    type: 'channel',
    description: 'اتاق عمومی برای گفتگوهای کلی سازمان / General corporate announcements and chatter',
    createdBy: 'system',
    members: [],
    permissions: {}
  }
];

// No preloaded test messages
export const mockMessages: Message[] = [];

export const defaultSettings: SystemSettings = {
  e2eeEnabled: true,
  fileSharingEnabled: true,
  voiceCallsEnabled: true,
  mentionsEnabled: true,
  archivingEnabled: true
};
