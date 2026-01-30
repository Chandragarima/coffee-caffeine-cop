// Notification system for CoffeePolice
// Uses local notifications (Notification API) - works when app is open
// For true push notifications, would need a backend server

import { loadPreferences, getCutoffTime, formatTimeForDisplay } from './preferences';

// ============================================
// COP-THEMED NOTIFICATION MESSAGES
// ============================================

const MORNING_MESSAGES = [
  { title: "Morning patrol! ☕", body: "No coffee logged yet. Need backup?" },
  { title: "Officer Caffeine reporting! 🚔", body: "Ready for your morning dose?" },
  { title: "Rise and grind! ☀️", body: "Time to fuel up for the day ahead." },
  { title: "Good morning, citizen! 👮", body: "Your caffeine levels are at zero. Want to change that?" },
  { title: "Coffee check! ☕", body: "The day is young and so is your coffee count." },
];

const CUTOFF_WARNING_MESSAGES = [
  { title: "Caffeine curfew approaching! 🚨", body: "Last call for coffee before your sleep is impacted." },
  { title: "Officer Caffeine warning! ⚠️", body: "Cutoff time is near. One more coffee or call it a day?" },
  { title: "Sleep patrol alert! 😴", body: "Your bedtime caffeine limit is approaching. Choose wisely." },
  { title: "Final call! 🔔", body: "After this, any coffee may affect your sleep tonight." },
  { title: "Cutoff in sight! 🛑", body: "Time to wrap up the caffeine intake for today." },
];

const CUTOFF_REACHED_MESSAGES = [
  { title: "Caffeine curfew in effect! 🚫", body: "No more coffee today if you want quality sleep." },
  { title: "You're under caffeine arrest! 🚔", body: "Just kidding. But seriously, switch to decaf." },
  { title: "Coffee shop is closed! 🌙", body: "For tonight's sake, stick to water or herbal tea." },
  { title: "Sleep court is watching! ⚖️", body: "Any caffeine now will be used against your sleep." },
];

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 'morning' | 'cutoff_warning' | 'cutoff_reached';

export interface ScheduledNotification {
  id: string;
  type: NotificationType;
  scheduledFor: number; // Unix timestamp
  shown: boolean;
}

// ============================================
// STORAGE
// ============================================

const STORAGE_KEY = 'coffeepolice_scheduled_notifications';
const LAST_NOTIFICATION_KEY = 'coffeepolice_last_notification';

function getScheduledNotifications(): ScheduledNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveScheduledNotifications(notifications: ScheduledNotification[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

function getLastNotificationTime(type: NotificationType): number {
  try {
    const raw = localStorage.getItem(LAST_NOTIFICATION_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data[type] || 0;
  } catch {
    return 0;
  }
}

function setLastNotificationTime(type: NotificationType): void {
  try {
    const raw = localStorage.getItem(LAST_NOTIFICATION_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[type] = Date.now();
    localStorage.setItem(LAST_NOTIFICATION_KEY, JSON.stringify(data));
  } catch {
    // Ignore
  }
}

// ============================================
// PERMISSION HANDLING
// ============================================

export type NotificationPermission = 'granted' | 'denied' | 'default' | 'unsupported';

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermission;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return 'denied';
  }
}

// ============================================
// NOTIFICATION DISPLAY
// ============================================

function getRandomMessage(messages: { title: string; body: string }[]): { title: string; body: string } {
  return messages[Math.floor(Math.random() * messages.length)];
}

export function showNotification(type: NotificationType, customMessage?: { title: string; body: string }): boolean {
  if (getNotificationPermission() !== 'granted') {
    return false;
  }
  
  // Prevent duplicate notifications within 1 hour
  const lastShown = getLastNotificationTime(type);
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  if (lastShown > oneHourAgo) {
    return false;
  }
  
  let message: { title: string; body: string };
  
  if (customMessage) {
    message = customMessage;
  } else {
    switch (type) {
      case 'morning':
        message = getRandomMessage(MORNING_MESSAGES);
        break;
      case 'cutoff_warning':
        message = getRandomMessage(CUTOFF_WARNING_MESSAGES);
        break;
      case 'cutoff_reached':
        message = getRandomMessage(CUTOFF_REACHED_MESSAGES);
        break;
      default:
        return false;
    }
  }
  
  try {
    const notification = new Notification(message.title, {
      body: message.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: `coffeepolice-${type}`,
      requireInteraction: false,
      silent: false,
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    setLastNotificationTime(type);
    return true;
  } catch (error) {
    console.error('Failed to show notification:', error);
    return false;
  }
}

// ============================================
// NOTIFICATION SCHEDULING LOGIC
// ============================================

export interface NotificationContext {
  hasLoggedToday: boolean;
  todayCaffeineMg: number;
  lastLogTime: number | null;
}

/**
 * Check if a morning notification should be shown
 * - Only between wake time and wake time + 2 hours
 * - Only if no coffee logged today
 * - Only if morning notifications are enabled
 */
export function shouldShowMorningNotification(context: NotificationContext): boolean {
  const prefs = loadPreferences();
  
  if (!prefs.notifications || !prefs.notification_morning) {
    return false;
  }
  
  // Already logged coffee today
  if (context.hasLoggedToday) {
    return false;
  }
  
  const now = new Date();
  const [wakeHour, wakeMinute] = prefs.wake_time.split(':').map(Number);
  
  const wakeTime = new Date();
  wakeTime.setHours(wakeHour, wakeMinute, 0, 0);
  
  const twoHoursAfterWake = new Date(wakeTime);
  twoHoursAfterWake.setHours(twoHoursAfterWake.getHours() + 2);
  
  // Check if we're in the notification window
  return now >= wakeTime && now <= twoHoursAfterWake;
}

/**
 * Check if a cutoff warning notification should be shown
 * - 1 hour before cutoff time
 * - Only if cutoff notifications are enabled
 */
export function shouldShowCutoffWarning(context: NotificationContext): boolean {
  const prefs = loadPreferences();
  
  if (!prefs.notifications || !prefs.notification_cutoff) {
    return false;
  }
  
  const cutoffTime = getCutoffTime(prefs.bedtime);
  const [cutoffHour, cutoffMinute] = cutoffTime.split(':').map(Number);
  
  const now = new Date();
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffHour, cutoffMinute, 0, 0);
  
  // If cutoff is past midnight, adjust to next day
  if (cutoffDate < now && cutoffHour < 12) {
    cutoffDate.setDate(cutoffDate.getDate() + 1);
  }
  
  const oneHourBeforeCutoff = new Date(cutoffDate);
  oneHourBeforeCutoff.setHours(oneHourBeforeCutoff.getHours() - 1);
  
  // Check if we're in the warning window (1 hour before cutoff)
  return now >= oneHourBeforeCutoff && now < cutoffDate;
}

/**
 * Check if a cutoff reached notification should be shown
 * - At or after cutoff time
 * - Only if they logged coffee today (otherwise, why bother)
 */
export function shouldShowCutoffReached(context: NotificationContext): boolean {
  const prefs = loadPreferences();
  
  if (!prefs.notifications || !prefs.notification_cutoff) {
    return false;
  }
  
  // Only show if they've been drinking coffee today
  if (!context.hasLoggedToday) {
    return false;
  }
  
  const cutoffTime = getCutoffTime(prefs.bedtime);
  const [cutoffHour, cutoffMinute] = cutoffTime.split(':').map(Number);
  
  const now = new Date();
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffHour, cutoffMinute, 0, 0);
  
  // Check if we're past cutoff
  return now >= cutoffDate;
}

/**
 * Main function to check and trigger any needed notifications
 * Call this periodically (e.g., every minute) when the app is open
 */
export function checkAndTriggerNotifications(context: NotificationContext): NotificationType | null {
  if (getNotificationPermission() !== 'granted') {
    return null;
  }
  
  // Check in priority order
  if (shouldShowCutoffReached(context)) {
    if (showNotification('cutoff_reached')) {
      return 'cutoff_reached';
    }
  }
  
  if (shouldShowCutoffWarning(context)) {
    if (showNotification('cutoff_warning')) {
      return 'cutoff_warning';
    }
  }
  
  if (shouldShowMorningNotification(context)) {
    if (showNotification('morning')) {
      return 'morning';
    }
  }
  
  return null;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a human-readable description of notification schedule
 */
export function getNotificationScheduleDescription(): string {
  const prefs = loadPreferences();
  
  if (!prefs.notifications) {
    return 'Notifications are disabled';
  }
  
  const parts: string[] = [];
  
  if (prefs.notification_morning) {
    parts.push(`Morning check-in around ${formatTimeForDisplay(prefs.wake_time)}`);
  }
  
  if (prefs.notification_cutoff) {
    const cutoffTime = getCutoffTime(prefs.bedtime);
    parts.push(`Cutoff warning before ${formatTimeForDisplay(cutoffTime)}`);
  }
  
  if (parts.length === 0) {
    return 'No notifications scheduled';
  }
  
  return parts.join(' • ');
}
