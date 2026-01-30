import { useState, useEffect, useCallback } from 'react';
import { useCoffeeLogs } from './useCoffeeLogs';
import { usePreferences } from './usePreferences';
import {
  getNotificationPermission,
  requestNotificationPermission,
  checkAndTriggerNotifications,
  NotificationPermission,
  NotificationContext,
} from '@/lib/notifications';

/**
 * Hook to manage notifications
 * - Handles permission state
 * - Triggers notifications when appropriate
 * - Provides permission request function
 */
export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission);
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);
  const { logs, stats } = useCoffeeLogs();
  const { notifications } = usePreferences();
  
  // Update permission state when it changes
  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);
  
  // Build notification context from current state
  const getContext = useCallback((): NotificationContext => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfToday = today.getTime();
    
    const todayLogs = logs.filter(log => log.consumedAt >= startOfToday);
    const lastLog = todayLogs.length > 0 
      ? Math.max(...todayLogs.map(l => l.consumedAt))
      : null;
    
    return {
      hasLoggedToday: todayLogs.length > 0,
      todayCaffeineMg: stats?.totalCaffeineToday || 0,
      lastLogTime: lastLog,
    };
  }, [logs, stats]);
  
  // Check and trigger notifications periodically
  useEffect(() => {
    if (!notifications || permission !== 'granted') {
      return;
    }
    
    // Check immediately on mount
    const context = getContext();
    const triggered = checkAndTriggerNotifications(context);
    if (triggered) {
      setLastTriggered(triggered);
    }
    
    // Check every minute
    const interval = setInterval(() => {
      const ctx = getContext();
      const result = checkAndTriggerNotifications(ctx);
      if (result) {
        setLastTriggered(result);
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [notifications, permission, getContext]);
  
  // Request permission function
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const result = await requestNotificationPermission();
    setPermission(result);
    return result === 'granted';
  }, []);
  
  // Manually trigger a notification check
  const checkNotifications = useCallback(() => {
    const context = getContext();
    return checkAndTriggerNotifications(context);
  }, [getContext]);
  
  return {
    permission,
    isGranted: permission === 'granted',
    isSupported: permission !== 'unsupported',
    isDenied: permission === 'denied',
    isDefault: permission === 'default',
    requestPermission,
    checkNotifications,
    lastTriggered,
  };
};
