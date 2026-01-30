// Smart Caffeine Tracker System
import { CoffeeLogEntry } from './coffeeLog';
import { caffeineRemaining, getMilestones } from './caffeine';
import { HALF_LIFE_HOURS } from '@/data/coffees';
import { getIconPath } from './imageUtils';

// ============================================
// THRESHOLDS - Science-backed defaults
// ============================================
export const THRESHOLDS = {
  JITTER: 300,        // mg - Peak level where jitters/anxiety become likely
  SLEEP_SAFE: 50,     // mg - Max caffeine at bedtime for quality sleep
  SLEEP_CAUTION: 90,  // mg - Moderate sleep disruption threshold
  TYPICAL_COFFEE: 100 // mg - Average coffee for projections
};

// Level bands (single source of truth for tracker + hero details). Breakpoints: 50, 100, 200, 300 mg.
export type LevelBand = 'low' | 'moderate' | 'elevated' | 'high' | 'very_high';

export interface LevelBandInfo {
  band: LevelBand;
  label: string;       // Short status line e.g. "Low - won't affect sleep"
  title: string;       // Card title e.g. "Low Caffeine"
  theme: 'green' | 'amber' | 'orange' | 'red';
  intro: string;
  bullets: { char: string; text: string }[];
}

const LEVEL_BAND_BREAKPOINTS = [50, 100, 200, 300] as const;

const LEVEL_BAND_DETAILS: Record<LevelBand, Omit<LevelBandInfo, 'band'>> = {
  low: {
    label: "Low - won't affect sleep",
    title: 'Low Caffeine',
    theme: 'green',
    intro: "You're in the clear zone. At this level:",
    bullets: [
      { char: '✓', text: 'Minimal impact on sleep quality' },
      { char: '✓', text: 'Body can wind down naturally' },
      { char: '✓', text: 'Deep sleep cycles unaffected' },
    ],
  },
  moderate: {
    label: "Moderate - you're alert",
    title: 'Moderate Caffeine',
    theme: 'amber',
    intro: 'Moderate alertness. At this level you may experience:',
    bullets: [
      { char: '•', text: 'Increased focus and energy' },
      { char: '•', text: 'Slight elevation in heart rate' },
      { char: '•', text: 'Delayed sleep onset if near bedtime' },
    ],
  },
  elevated: {
    label: 'Elevated - peak alertness',
    title: 'Elevated Caffeine',
    theme: 'amber',
    intro: 'Peak alertness. At this level:',
    bullets: [
      { char: '•', text: 'Strong focus and alertness' },
      { char: '•', text: 'Heart rate may be elevated' },
      { char: '•', text: 'Avoid more caffeine close to bedtime' },
    ],
  },
  high: {
    label: 'High - avoid more caffeine',
    title: 'High Caffeine',
    theme: 'red',
    intro: 'High levels can lead to:',
    bullets: [
      { char: '!', text: 'Restlessness and anxiety' },
      { char: '!', text: 'Racing heart, jitters' },
      { char: '!', text: 'Significant sleep disruption' },
    ],
  },
  very_high: {
    label: 'Very high - no more coffee today',
    title: 'Very High Caffeine',
    theme: 'red',
    intro: 'Very high levels. At this level:',
    bullets: [
      { char: '!', text: 'Restlessness and anxiety' },
      { char: '!', text: 'Racing heart, jitters' },
      { char: '!', text: 'Significant sleep disruption' },
      { char: '!', text: 'Best to avoid more caffeine today' },
    ],
  },
};

/**
 * Single source of truth for caffeine level bands. Used by CaffeineTracker (status line)
 * and CaffeineStatusHero (Show details card). Breakpoints: 50, 100, 200, 300 mg.
 */
export function getCaffeineLevelBand(level: number): LevelBandInfo {
  const band: LevelBand =
    level < LEVEL_BAND_BREAKPOINTS[0] ? 'low'
    : level < LEVEL_BAND_BREAKPOINTS[1] ? 'moderate'
    : level < LEVEL_BAND_BREAKPOINTS[2] ? 'elevated'
    : level < LEVEL_BAND_BREAKPOINTS[3] ? 'high'
    : 'very_high';
  return { band, ...LEVEL_BAND_DETAILS[band] };
}

// ============================================
// TYPES
// ============================================
export type GuidanceState = 
  | 'all_clear'       // Safe to drink, sleep will be fine
  | 'sleep_impact'    // Adding coffee will affect sleep (but no jitter risk)
  | 'jitter_risk'     // High current level, wait to avoid jitters (sleep OK)
  | 'both_risks'      // Both jitter risk AND sleep impact
  | 'daily_limit';    // Already at/over daily consumption limit

export interface CaffeineStatus {
  currentLevel: number;           // Current caffeine in system (mg)
  peakLevel: number;              // Peak caffeine level today (mg)
  projectedAtBedtime: number;     // Projected caffeine at bedtime (mg)
  projectedPeakIfDrink: number;   // What peak would be if drinking now (mg)
  timeToBedtime: number;          // Minutes until bedtime
  dailyProgress: number;          // Percentage of daily limit consumed
  dailyLimit: number;             // Daily caffeine limit (mg)
  dailyConsumed: number;          // Total mg consumed today
  sleepRisk: 'low' | 'medium' | 'high';
  sleepRiskMessage: string;
}

export interface CaffeineGuidance {
  state: GuidanceState;
  canHaveCoffee: boolean;
  title: string;                  // Short headline
  subtitle: string;               // Explanation
  recommendation: string;         // What to do
  waitTimeMinutes?: number;       // Only for jitter_risk state
  waitTimeFormatted?: string;     // Human readable wait time
  projectedAtBedtime: number;     // mg at bedtime if drinking now
  color: 'green' | 'yellow' | 'red';
  icon: string;                   // Emoji fallback
  iconPath: string;               // SVG icon path
  iconType: 'emoji' | 'svg';      // Which icon to use
  options?: {                     // Actionable options for the user
    primary: { label: string; action: 'drink' | 'skip' | 'wait' };
    secondary?: { label: string; action: 'smaller' | 'decaf' | 'skip' };
  };
}

// Calculate current caffeine level in system (today's logs only)
export const calculateCurrentCaffeine = (
  logs: CoffeeLogEntry[],
  currentTime: number = Date.now()
): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfToday = today.getTime();
  
  // Only consider logs from today for current level display
  const todayLogs = logs.filter(log => log.consumedAt >= startOfToday);
  
  return todayLogs.reduce((total, log) => {
    const hoursSinceConsumption = (currentTime - log.consumedAt) / (1000 * 60 * 60);
    const remaining = caffeineRemaining(log.caffeineMg, hoursSinceConsumption, HALF_LIFE_HOURS);
    return total + remaining;
  }, 0);
};

// Calculate total caffeine level including all historical logs (for sleep risk calculations)
export const calculateTotalCaffeine = (
  logs: CoffeeLogEntry[],
  currentTime: number = Date.now()
): number => {
  return logs.reduce((total, log) => {
    const hoursSinceConsumption = (currentTime - log.consumedAt) / (1000 * 60 * 60);
    const remaining = caffeineRemaining(log.caffeineMg, hoursSinceConsumption, HALF_LIFE_HOURS);
    return total + remaining;
  }, 0);
};

// Calculate peak caffeine level today
export const calculatePeakCaffeine = (logs: CoffeeLogEntry[]): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfToday = today.getTime();
  
  const todayLogs = logs.filter(log => log.consumedAt >= startOfToday);
  
  if (todayLogs.length === 0) return 0;
  
  // Find the highest caffeine level at any point today
  let peak = 0;
  const timePoints = []; // Track caffeine levels throughout the day
  
      // Add time points for each log and calculate cumulative levels
    todayLogs.forEach(log => {
      // Calculate what the level was right after consuming this coffee
      // This includes all previous caffeine (decayed) + the fresh caffeine from this log
      const levelAfterThisCoffee = todayLogs
        .filter(prevLog => prevLog.consumedAt < log.consumedAt) // Use < instead of <= to exclude current log
        .reduce((sum, prevLog) => {
          const hoursSincePrev = (log.consumedAt - prevLog.consumedAt) / (1000 * 60 * 60);
          const remainingFromPrev = caffeineRemaining(prevLog.caffeineMg, hoursSincePrev, HALF_LIFE_HOURS);
          return sum + remainingFromPrev;
        }, 0) + log.caffeineMg; // Add the fresh caffeine from current log
    
    peak = Math.max(peak, levelAfterThisCoffee);
  });
  
  return Math.round(peak);
};

// ============================================
// JITTER CALCULATIONS
// ============================================

/**
 * Calculate time to wait before having coffee to avoid jitters.
 * This is based on keeping peak caffeine below JITTER threshold.
 * 
 * @param currentLevel - Current active caffeine (mg)
 * @param newCoffeeAmount - Amount of caffeine in the coffee to add (mg)
 * @returns Minutes to wait (0 if safe now)
 */
export const calculateJitterWaitTime = (
  currentLevel: number,
  newCoffeeAmount: number = THRESHOLDS.TYPICAL_COFFEE
): number => {
  const projectedPeak = currentLevel + newCoffeeAmount;
  
  // If adding coffee won't exceed jitter threshold, no need to wait
  if (projectedPeak <= THRESHOLDS.JITTER) {
    return 0;
  }
  
  // Calculate target level: we want current + newCoffee <= JITTER
  // So we need current to decay to: JITTER - newCoffee
  const targetLevel = THRESHOLDS.JITTER - newCoffeeAmount;
  
  // If target is negative, even with zero current caffeine we'd exceed threshold
  // This means the coffee itself is > JITTER threshold (very strong drink)
  if (targetLevel <= 0) {
    return 0; // Can't really help, let them decide
  }
  
  // Time for current to decay to target
  // Formula: targetLevel = currentLevel * 0.5^(hours/halfLife)
  // Solving for hours: hours = halfLife * log2(currentLevel / targetLevel)
  const hoursToDecay = Math.log(currentLevel / targetLevel) / Math.log(2) * HALF_LIFE_HOURS;
  
  return Math.max(0, hoursToDecay * 60); // Convert to minutes
};

/**
 * Check if there's a jitter risk with current level + new coffee
 */
export const hasJitterRisk = (
  currentLevel: number,
  newCoffeeAmount: number = THRESHOLDS.TYPICAL_COFFEE
): boolean => {
  return (currentLevel + newCoffeeAmount) > THRESHOLDS.JITTER;
};

// ============================================
// SLEEP IMPACT CALCULATIONS
// ============================================

/**
 * Calculate projected caffeine at bedtime if drinking now.
 * This considers current caffeine decay + new coffee decay.
 * 
 * @param currentLevel - Current active caffeine (mg)
 * @param hoursUntilBed - Hours until bedtime
 * @param newCoffeeAmount - Amount of caffeine in the coffee to add (mg)
 * @returns Projected mg at bedtime
 */
export const calculateBedtimeCaffeineIfDrink = (
  currentLevel: number,
  hoursUntilBed: number,
  newCoffeeAmount: number = THRESHOLDS.TYPICAL_COFFEE
): number => {
  // Current caffeine decayed to bedtime
  const currentDecayed = caffeineRemaining(currentLevel, hoursUntilBed, HALF_LIFE_HOURS);
  // New coffee decayed to bedtime (assuming drinking now)
  const newDecayed = caffeineRemaining(newCoffeeAmount, hoursUntilBed, HALF_LIFE_HOURS);
  
  return currentDecayed + newDecayed;
};

/**
 * Check if adding coffee will negatively impact sleep
 */
export const hasSleepImpact = (
  currentLevel: number,
  hoursUntilBed: number,
  newCoffeeAmount: number = THRESHOLDS.TYPICAL_COFFEE
): boolean => {
  const projected = calculateBedtimeCaffeineIfDrink(currentLevel, hoursUntilBed, newCoffeeAmount);
  return projected > THRESHOLDS.SLEEP_SAFE;
};

// ============================================
// 5-STATE GUIDANCE SYSTEM
// ============================================

/**
 * Determine the guidance state based on jitter risk, sleep impact, and daily limit.
 */
export const determineGuidanceState = (
  currentLevel: number,
  hoursUntilBed: number,
  dailyConsumed: number,
  dailyLimit: number,
  newCoffeeAmount: number = THRESHOLDS.TYPICAL_COFFEE
): GuidanceState => {
  // Check daily limit first
  if (dailyConsumed >= dailyLimit) {
    return 'daily_limit';
  }
  
  const jitterRisk = hasJitterRisk(currentLevel, newCoffeeAmount);
  const sleepImpact = hasSleepImpact(currentLevel, hoursUntilBed, newCoffeeAmount);
  
  if (jitterRisk && sleepImpact) {
    return 'both_risks';
  }
  
  if (jitterRisk) {
    return 'jitter_risk';
  }
  
  if (sleepImpact) {
    return 'sleep_impact';
  }
  
  return 'all_clear';
};

/**
 * Get comprehensive caffeine guidance with the new 5-state system.
 * This replaces the old guidance function with accurate, honest recommendations.
 */
export const getCaffeineGuidance = (
  currentLevel: number,
  hoursUntilBed: number,
  dailyConsumed: number,
  dailyLimit: number = 400,
  newCoffeeAmount: number = THRESHOLDS.TYPICAL_COFFEE
): CaffeineGuidance => {
  const state = determineGuidanceState(currentLevel, hoursUntilBed, dailyConsumed, dailyLimit, newCoffeeAmount);
  const projectedAtBedtime = calculateBedtimeCaffeineIfDrink(currentLevel, hoursUntilBed, newCoffeeAmount);
  const projectedPeak = currentLevel + newCoffeeAmount;
  
  // Calculate jitter wait time if relevant
  const jitterWaitMinutes = calculateJitterWaitTime(currentLevel, newCoffeeAmount);
  const jitterWaitFormatted = formatDuration(jitterWaitMinutes);
  
  // Build guidance based on state
  switch (state) {
    case 'all_clear':
      return {
        state,
        canHaveCoffee: true,
        title: "You're good to go!",
        subtitle: `This coffee will clear well before bedtime`,
        recommendation: "A coffee won't affect your sleep tonight.",
        projectedAtBedtime: Math.round(projectedAtBedtime),
        color: 'green',
        icon: '☕',
        iconPath: getIconPath('low.svg'),
        iconType: 'svg',
        options: {
          primary: { label: 'Drink now', action: 'drink' }
        }
      };
    
    case 'sleep_impact':
      return {
        state,
        canHaveCoffee: true, // User can choose, but we warn them
        title: "This will affect your sleep",
        subtitle: `~${Math.round(projectedAtBedtime)}mg at bedtime (threshold: ${THRESHOLDS.SLEEP_SAFE}mg)`,
        recommendation: "Drink now if you need the energy or skip for better sleep.",
        projectedAtBedtime: Math.round(projectedAtBedtime),
        color: 'yellow',
        icon: '⚠️',
        iconPath: getIconPath('medium.svg'),
        iconType: 'svg',
        options: {
          primary: { label: 'Drink now', action: 'drink' },
          secondary: { label: 'Skip for sleep', action: 'skip' }
        }
      };
    
    case 'jitter_risk':
      return {
        state,
        canHaveCoffee: false, // Should wait
        title: "Wait to avoid jitters",
        subtitle: `You're at ${Math.round(currentLevel)}mg. Adding ${newCoffeeAmount}mg would spike you to ${Math.round(projectedPeak)}mg`,
        recommendation: `Wait ${jitterWaitFormatted} for your level to drop, then you can have more.`,
        waitTimeMinutes: jitterWaitMinutes,
        waitTimeFormatted: jitterWaitFormatted,
        projectedAtBedtime: Math.round(projectedAtBedtime),
        color: 'yellow',
        icon: '⏳',
        iconPath: getIconPath('medium.svg'),
        iconType: 'svg',
        options: {
          primary: { label: `Wait ${jitterWaitFormatted}`, action: 'wait' },
          secondary: { label: 'Try smaller size', action: 'smaller' }
        }
      };
    
    case 'both_risks':
      return {
        state,
        canHaveCoffee: false,
        title: "Skip this one",
        subtitle: `High caffeine (${Math.round(currentLevel)}mg active) + would leave ~${Math.round(projectedAtBedtime)}mg at bedtime`,
        recommendation: "Your caffeine is high, switch to decaf.",
        waitTimeMinutes: jitterWaitMinutes,
        waitTimeFormatted: jitterWaitFormatted,
        projectedAtBedtime: Math.round(projectedAtBedtime),
        color: 'red',
        icon: '🛑',
        iconPath: getIconPath('high.svg'),
        iconType: 'svg',
        options: {
          primary: { label: 'Skip coffee', action: 'skip' },
          secondary: { label: 'Try decaf', action: 'decaf' }
        }
      };
    
    case 'daily_limit':
      return {
        state,
        canHaveCoffee: false,
        title: "You've hit your limit",
        subtitle: `${Math.round(dailyConsumed)}mg consumed today (limit: ${dailyLimit}mg)`,
        recommendation: "Time for water, decaf, or herbal tea.",
        projectedAtBedtime: Math.round(caffeineRemaining(currentLevel, hoursUntilBed, HALF_LIFE_HOURS)),
        color: 'red',
        icon: '🚫',
        iconPath: getIconPath('high.svg'),
        iconType: 'svg',
        options: {
          primary: { label: 'No more today', action: 'skip' },
          secondary: { label: 'Try decaf', action: 'decaf' }
        }
      };
  }
};

// ============================================
// SLEEP RISK ASSESSMENT
// ============================================

/**
 * Get sleep risk assessment based on current caffeine (no new coffee added).
 * This shows risk with current caffeine level only.
 */
export const getSleepRisk = (
  currentCaffeineLevel: number,
  hoursUntilBed: number
): { risk: 'low' | 'medium' | 'high'; message: string; projectedMg: number } => {
  const projectedLevel = caffeineRemaining(currentCaffeineLevel, hoursUntilBed, HALF_LIFE_HOURS);
  
  if (projectedLevel < THRESHOLDS.SLEEP_SAFE) {
    return {
      risk: 'low',
      message: `${Math.round(projectedLevel)}mg at bedtime — sleep should be unaffected.`,
      projectedMg: Math.round(projectedLevel)
    };
  } else if (projectedLevel <= THRESHOLDS.SLEEP_CAUTION) {
    return {
      risk: 'medium',
      message: `${Math.round(projectedLevel)}mg at bedtime — slight tossing and turning.`,
      projectedMg: Math.round(projectedLevel)
    };
  } else {
    return {
      risk: 'high',
      message: `${Math.round(projectedLevel)}mg at bedtime — likely to disrupt sleep quality.`,
      projectedMg: Math.round(projectedLevel)
    };
  }
};

// ============================================
// MAIN STATUS FUNCTION
// ============================================

/**
 * Get comprehensive caffeine status including the new guidance system.
 */
export const getCaffeineStatus = (
  logs: CoffeeLogEntry[],
  bedtime: string = '23:00',
  dailyLimit: number = 400
): CaffeineStatus => {
  const currentLevel = calculateCurrentCaffeine(logs);
  const totalCaffeineLevel = calculateTotalCaffeine(logs);
  const peakLevel = calculatePeakCaffeine(logs);
  
  // Calculate time to bedtime
  const now = new Date();
  const [bedHour, bedMinute] = bedtime.split(':').map(Number);
  const bedtimeDate = new Date(now);
  bedtimeDate.setHours(bedHour ?? 23, bedMinute ?? 0, 0, 0);
  
  if (bedtimeDate.getTime() <= now.getTime()) {
    bedtimeDate.setDate(bedtimeDate.getDate() + 1);
  }
  
  const timeToBedtimeMinutes = (bedtimeDate.getTime() - now.getTime()) / (1000 * 60);
  const hoursUntilBed = timeToBedtimeMinutes / 60;
  
  // Calculate daily consumption
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfToday = today.getTime();
  const todayLogs = logs.filter(log => log.consumedAt >= startOfToday);
  const dailyConsumed = todayLogs.reduce((sum, log) => sum + log.caffeineMg, 0);
  const dailyProgress = (dailyConsumed / dailyLimit) * 100;
  
  // Get sleep risk with current caffeine only (not adding new coffee)
  const sleepRisk = getSleepRisk(totalCaffeineLevel, hoursUntilBed);
  
  // Calculate projected at bedtime with current level only
  const projectedAtBedtime = caffeineRemaining(totalCaffeineLevel, hoursUntilBed, HALF_LIFE_HOURS);
  
  // Calculate what peak would be if drinking now
  const projectedPeakIfDrink = currentLevel + THRESHOLDS.TYPICAL_COFFEE;
  
  return {
    currentLevel: Math.round(currentLevel),
    peakLevel,
    projectedAtBedtime: Math.round(projectedAtBedtime),
    projectedPeakIfDrink: Math.round(projectedPeakIfDrink),
    timeToBedtime: Math.ceil(timeToBedtimeMinutes),
    dailyProgress: Math.min(100, dailyProgress),
    dailyLimit,
    dailyConsumed: Math.round(dailyConsumed),
    sleepRisk: sleepRisk.risk,
    sleepRiskMessage: sleepRisk.message
  };
};

/**
 * Convenience function to get guidance from logs directly.
 * This combines getCaffeineStatus and getCaffeineGuidance.
 */
export const getGuidanceFromLogs = (
  logs: CoffeeLogEntry[],
  bedtime: string = '23:00',
  dailyLimit: number = 400,
  newCoffeeAmount: number = THRESHOLDS.TYPICAL_COFFEE
): CaffeineGuidance => {
  const status = getCaffeineStatus(logs, bedtime, dailyLimit);
  const hoursUntilBed = status.timeToBedtime / 60;
  
  return getCaffeineGuidance(
    status.currentLevel,
    hoursUntilBed,
    status.dailyConsumed,
    dailyLimit,
    newCoffeeAmount
  );
};

// Format time duration for display
export const formatDuration = (minutes: number): string => {
  if (minutes < 1) return 'Now';
  if (minutes < 60) return `${Math.ceil(minutes)}m`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.ceil(minutes % 60);
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

// Get caffeine level color based on amount
export const getCaffeineColor = (level: number, dailyLimit: number = 400): string => {
  const percentage = (level / dailyLimit) * 100;
  
  if (percentage < 30) return 'text-green-600';
  if (percentage < 60) return 'text-yellow-600';
  if (percentage < 90) return 'text-orange-600';
  return 'text-red-600';
};

// Get caffeine level background color
export const getCaffeineBgColor = (level: number, dailyLimit: number = 400): string => {
  const percentage = (level / dailyLimit) * 100;
  
  if (percentage < 30) return 'bg-green-100';
  if (percentage < 60) return 'bg-yellow-100';
  if (percentage < 90) return 'bg-orange-100';
  return 'bg-red-100';
};
