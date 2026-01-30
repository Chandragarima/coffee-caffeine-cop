import { getLocalDateString } from './timeUtils';

export interface SleepCheckin {
  id: string;
  date: string; // YYYY-MM-DD
  quality: 'poor' | 'ok' | 'great';
  timestamp: number;
  yesterdayCaffeineMg: number;
  yesterdayLastCoffeeHour: number;
}

const STORAGE_KEY = 'coffeepolice_sleep_checkins';

export function getSleepCheckins(): SleepCheckin[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSleepCheckins(checkins: SleepCheckin[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checkins));
}

export function addSleepCheckin(
  quality: SleepCheckin['quality'],
  yesterdayCaffeineMg: number,
  yesterdayLastCoffeeHour: number
): SleepCheckin {
  const date = getLocalDateString(new Date());
  const entry: SleepCheckin = {
    id: `sleep_${Date.now()}`,
    date,
    quality,
    timestamp: Date.now(),
    yesterdayCaffeineMg,
    yesterdayLastCoffeeHour,
  };
  const checkins = getSleepCheckins();
  // Replace if already exists for today (shouldn't happen, but safety)
  const filtered = checkins.filter((c) => c.date !== date);
  filtered.push(entry);
  saveSleepCheckins(filtered);
  return entry;
}

export function getTodayCheckin(): SleepCheckin | null {
  const today = getLocalDateString(new Date());
  return getSleepCheckins().find((c) => c.date === today) || null;
}

/** Returns true if we should prompt for a sleep check-in */
export function needsSleepCheckin(todayLogCount: number, yesterdayLogCount: number): boolean {
  // Must be before 2pm
  if (new Date().getHours() >= 14) return false;
  // Must not already have a checkin today
  if (getTodayCheckin()) return false;
  // Must have logs from yesterday
  if (yesterdayLogCount === 0) return false;
  // Must be the first log today (this was just logged, so count is 1)
  if (todayLogCount > 1) return false;
  return true;
}
