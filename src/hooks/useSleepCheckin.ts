import { useState, useEffect, useCallback } from 'react';
import {
  SleepCheckin,
  getSleepCheckins,
  addSleepCheckin as addCheckin,
  getTodayCheckin,
  needsSleepCheckin,
} from '@/lib/sleepCheckin';
import { useCoffeeLogs } from './useCoffeeLogs';

export const useSleepCheckin = () => {
  const [checkins, setCheckins] = useState<SleepCheckin[]>([]);
  const [todayCheckin, setTodayCheckin] = useState<SleepCheckin | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { logs } = useCoffeeLogs();

  // Load checkins
  useEffect(() => {
    setCheckins(getSleepCheckins());
    setTodayCheckin(getTodayCheckin());
  }, []);

  // Compute yesterday's stats for the prompt
  const getYesterdayStats = useCallback(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const yesterdayLogs = logs.filter(
      (l) => l.consumedAt >= yesterday.getTime() && l.consumedAt <= endOfYesterday.getTime()
    );

    const totalMg = yesterdayLogs.reduce((s, l) => s + l.caffeineMg, 0);
    const lastHour = yesterdayLogs.length > 0
      ? new Date(Math.max(...yesterdayLogs.map((l) => l.consumedAt))).getHours()
      : 0;

    return { totalMg, lastHour, count: yesterdayLogs.length };
  }, [logs]);

  // Check if we need to show prompt after a coffee is logged
  const checkAndShowPrompt = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = logs.filter((l) => l.consumedAt >= today.getTime());
    const { count: yesterdayCount } = getYesterdayStats();

    if (needsSleepCheckin(todayLogs.length, yesterdayCount)) {
      setShowPrompt(true);
    }
  }, [logs, getYesterdayStats]);

  // Listen for coffeeLogged events
  useEffect(() => {
    const handler = () => {
      // Small delay to let logs state update
      setTimeout(checkAndShowPrompt, 500);
    };
    window.addEventListener('coffeeLogged', handler);
    return () => window.removeEventListener('coffeeLogged', handler);
  }, [checkAndShowPrompt]);

  const submitCheckin = useCallback(
    (quality: SleepCheckin['quality']) => {
      const { totalMg, lastHour } = getYesterdayStats();
      const entry = addCheckin(quality, totalMg, lastHour);
      setCheckins(getSleepCheckins());
      setTodayCheckin(entry);
      setShowPrompt(false);
      return entry;
    },
    [getYesterdayStats]
  );

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
  }, []);

  return {
    checkins,
    todayCheckin,
    showPrompt,
    submitCheckin,
    dismissPrompt,
    getYesterdayStats,
  };
};
