import { SleepCheckin } from './sleepCheckin';
import { CoffeeLogEntry, CoffeeLogStats } from './coffeeLog';

// Badge system
export type BadgeId =
  | 'power-caffeinator'
  | 'sleep-guardian'
  | 'morning-ritual'
  | 'streak-master'
  | 'mindful-sipper'
  | 'custom-blend';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

export type SensitivityLevel = 'low' | 'moderate' | 'high' | 'unknown';
export type TimingPattern = 'early-bird' | 'steady-sipper' | 'afternoon-booster' | 'unknown';
export type ConsumptionLevel = 'light' | 'moderate' | 'heavy' | 'unknown';

export interface CaffeineProfile {
  sensitivityLevel: SensitivityLevel;
  sensitivityDescription: string;
  timingPattern: TimingPattern;
  timingDescription: string;
  consumptionLevel: ConsumptionLevel;
  consumptionDescription: string;
  badges: Badge[];
  daysTracked: number;
  isUnlocked: boolean;
}

const BADGE_DEFS: Record<BadgeId, { name: string; description: string; icon: string }> = {
  'power-caffeinator': {
    name: 'Power Caffeinator',
    description: '400+mg daily average over 7 days',
    icon: '⚡',
  },
  'sleep-guardian': {
    name: 'Sleep Guardian',
    description: '5+ days of great sleep with mindful caffeine',
    icon: '🛡️',
  },
  'morning-ritual': {
    name: 'Morning Ritual',
    description: '90%+ of coffee before noon for 7 days',
    icon: '🌅',
  },
  'streak-master': {
    name: 'Streak Master',
    description: '7+ day tracking streak',
    icon: '🔥',
  },
  'mindful-sipper': {
    name: 'Mindful Sipper',
    description: '5+ sleep check-ins completed',
    icon: '🧘',
  },
  'custom-blend': {
    name: 'Custom Blend',
    description: 'Logged a custom drink',
    icon: '🎨',
  },
};

function computeSensitivity(checkins: SleepCheckin[]): { level: SensitivityLevel; description: string } {
  if (checkins.length < 5) {
    return { level: 'unknown', description: `Need ${5 - checkins.length} more sleep check-ins to determine sensitivity` };
  }

  const greatDays = checkins.filter((c) => c.quality === 'great');
  const poorDays = checkins.filter((c) => c.quality === 'poor');

  if (greatDays.length === 0 && poorDays.length === 0) {
    return { level: 'moderate', description: 'Your sleep quality is consistently OK regardless of caffeine' };
  }

  const avgGreat = greatDays.length > 0
    ? greatDays.reduce((s, c) => s + c.yesterdayCaffeineMg, 0) / greatDays.length
    : 0;
  const avgPoor = poorDays.length > 0
    ? poorDays.reduce((s, c) => s + c.yesterdayCaffeineMg, 0) / poorDays.length
    : 0;

  // If no poor days, likely low sensitivity
  if (poorDays.length === 0) {
    return { level: 'low', description: 'You sleep well regardless of caffeine intake — low sensitivity' };
  }
  // If no great days, likely high sensitivity
  if (greatDays.length === 0) {
    return { level: 'high', description: 'Your sleep is frequently affected — you may be highly sensitive to caffeine' };
  }

  const diff = avgPoor - avgGreat;
  if (diff > 150) {
    return { level: 'high', description: `Poor sleep days average ${Math.round(diff)}mg more caffeine — you're sensitive` };
  }
  if (diff > 50) {
    return { level: 'moderate', description: 'Moderate sensitivity — higher caffeine days slightly affect your sleep' };
  }
  return { level: 'low', description: 'Caffeine doesn\'t seem to strongly affect your sleep quality' };
}

function computeTimingPattern(logs: CoffeeLogEntry[]): { pattern: TimingPattern; description: string } {
  // Use last 7 days of logs
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentLogs = logs.filter((l) => l.consumedAt >= weekAgo);

  if (recentLogs.length < 3) {
    return { pattern: 'unknown', description: 'Need more data to determine your timing pattern' };
  }

  const hours = recentLogs.map((l) => new Date(l.consumedAt).getHours());
  const beforeNoon = hours.filter((h) => h < 12).length;
  const after2pm = hours.filter((h) => h >= 14).length;
  const total = hours.length;

  if (beforeNoon / total >= 0.8) {
    return { pattern: 'early-bird', description: 'You drink most of your coffee in the morning' };
  }
  if (after2pm / total >= 0.5) {
    return { pattern: 'afternoon-booster', description: 'You tend to drink coffee in the afternoon' };
  }
  return { pattern: 'steady-sipper', description: 'Your coffee is spread throughout the day' };
}

function computeConsumptionLevel(stats: CoffeeLogStats | null): { level: ConsumptionLevel; description: string } {
  if (!stats || stats.totalDrinksWeek === 0) {
    return { level: 'unknown', description: 'Not enough data yet' };
  }

  const avg = stats.averageCaffeinePerDay;
  if (avg < 200) {
    return { level: 'light', description: `${Math.round(avg)}mg/day avg — light caffeine consumer` };
  }
  if (avg <= 400) {
    return { level: 'moderate', description: `${Math.round(avg)}mg/day avg — moderate, within recommended limits` };
  }
  return { level: 'heavy', description: `${Math.round(avg)}mg/day avg — heavy consumer, consider reducing` };
}

function computeBadges(
  checkins: SleepCheckin[],
  logs: CoffeeLogEntry[],
  stats: CoffeeLogStats | null
): Badge[] {
  const badges: Badge[] = [];

  // Power Caffeinator: 400+mg daily avg
  const powerEarned = (stats?.averageCaffeinePerDay ?? 0) >= 400 && (stats?.totalDrinksWeek ?? 0) >= 7;
  badges.push({ ...BADGE_DEFS['power-caffeinator'], id: 'power-caffeinator', earned: powerEarned });

  // Sleep Guardian: 5+ "great" sleep check-ins
  const greatSleepDays = checkins.filter((c) => c.quality === 'great').length;
  badges.push({ ...BADGE_DEFS['sleep-guardian'], id: 'sleep-guardian', earned: greatSleepDays >= 5 });

  // Morning Ritual: 90%+ before noon in last 7 days
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekLogs = logs.filter((l) => l.consumedAt >= weekAgo);
  const morningPct = weekLogs.length > 0
    ? weekLogs.filter((l) => new Date(l.consumedAt).getHours() < 12).length / weekLogs.length
    : 0;
  badges.push({ ...BADGE_DEFS['morning-ritual'], id: 'morning-ritual', earned: morningPct >= 0.9 && weekLogs.length >= 5 });

  // Streak Master: 7+ day streak
  badges.push({ ...BADGE_DEFS['streak-master'], id: 'streak-master', earned: (stats?.trackingStreak ?? 0) >= 7 });

  // Mindful Sipper: 5+ sleep check-ins
  badges.push({ ...BADGE_DEFS['mindful-sipper'], id: 'mindful-sipper', earned: checkins.length >= 5 });

  // Custom Blend: has logged a custom drink
  const hasCustom = logs.some((l) => l.coffeeId.startsWith('custom_'));
  badges.push({ ...BADGE_DEFS['custom-blend'], id: 'custom-blend', earned: hasCustom });

  return badges;
}

function countDaysTracked(logs: CoffeeLogEntry[]): number {
  const days = new Set<string>();
  for (const log of logs) {
    const date = new Date(log.consumedAt);
    // Use local date (midnight to 11:59 PM in user's timezone)
    const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    days.add(localDate);
  }
  return days.size;
}

/** User's sensitivity from settings: 'auto' = use computed from check-ins; otherwise use this value. */
export type UserSensitivityPreference = 'auto' | 'low' | 'moderate' | 'high';

const USER_SENSITIVITY_DESCRIPTIONS: Record<'low' | 'moderate' | 'high', string> = {
  low: 'Set in settings — you tend to tolerate caffeine well before sleep.',
  moderate: 'Set in settings — moderate sensitivity to caffeine before bed.',
  high: 'Set in settings — you’re sensitive to caffeine; keep intake low near bedtime.',
};

export function computeProfile(
  checkins: SleepCheckin[],
  logs: CoffeeLogEntry[],
  stats: CoffeeLogStats | null,
  userSensitivity?: UserSensitivityPreference
): CaffeineProfile {
  const daysTracked = countDaysTracked(logs);
  const isUnlocked = daysTracked >= 7;

  const computed = computeSensitivity(checkins);
  const useManual = userSensitivity && userSensitivity !== 'auto';
  const sensitivityLevel = useManual ? userSensitivity : computed.level;
  const sensitivityDescription = useManual
    ? USER_SENSITIVITY_DESCRIPTIONS[userSensitivity as 'low' | 'moderate' | 'high']
    : computed.description;

  const { pattern: timingPattern, description: timingDescription } = computeTimingPattern(logs);
  const { level: consumptionLevel, description: consumptionDescription } = computeConsumptionLevel(stats);
  const badges = computeBadges(checkins, logs, stats);

  return {
    sensitivityLevel,
    sensitivityDescription,
    timingPattern,
    timingDescription,
    consumptionLevel,
    consumptionDescription,
    badges,
    daysTracked,
    isUnlocked,
  };
}

// For badge unlock detection
const EARNED_BADGES_KEY = 'coffeepolice_earned_badges';

export function getEarnedBadgeIds(): BadgeId[] {
  try {
    const raw = localStorage.getItem(EARNED_BADGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEarnedBadgeIds(ids: BadgeId[]): void {
  localStorage.setItem(EARNED_BADGES_KEY, JSON.stringify(ids));
}
