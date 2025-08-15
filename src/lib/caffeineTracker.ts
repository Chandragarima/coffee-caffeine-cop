// Smart Caffeine Tracker System
import { CoffeeLogEntry } from './coffeeLog';
import { caffeineRemaining, getMilestones } from './caffeine';
import { HALF_LIFE_HOURS } from '@/data/coffees';

export interface CaffeineStatus {
  currentLevel: number;           // Current caffeine in system (mg)
  peakLevel: number;              // Peak caffeine level today (mg)
  timeToNextCoffee: number;       // Minutes until safe to have next coffee
  timeToBedtime: number;          // Minutes until bedtime
  isSafeForNextCoffee: boolean;   // Whether it's safe to have another coffee
  nextCoffeeRecommendation: string; // Human-readable recommendation
  sleepRisk: 'low' | 'medium' | 'high'; // Risk level for sleep
  sleepRiskMessage: string;       // Sleep risk explanation
  dailyProgress: number;          // Percentage of daily limit consumed
  dailyLimit: number;             // Daily caffeine limit (mg)
}

export interface CaffeineGuidance {
  canHaveCoffee: boolean;
  reason: string;
  waitTime?: string;
  recommendation: string;
  icon: string;
  color: 'green' | 'yellow' | 'red';
}

// Calculate current caffeine level in system
export const calculateCurrentCaffeine = (
  logs: CoffeeLogEntry[],
  currentTime: number = Date.now()
): number => {
  return logs.reduce((total, log) => {
    const hoursSinceConsumption = (currentTime - log.timestamp) / (1000 * 60 * 60);
    const remaining = caffeineRemaining(log.caffeineMg, hoursSinceConsumption, HALF_LIFE_HOURS);
    return total + remaining;
  }, 0);
};

// Calculate peak caffeine level today
export const calculatePeakCaffeine = (logs: CoffeeLogEntry[]): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfToday = today.getTime();
  
  const todayLogs = logs.filter(log => log.timestamp >= startOfToday);
  
  if (todayLogs.length === 0) return 0;
  
  // Find the highest caffeine level at any point today
  let peak = 0;
  const timePoints = []; // Track caffeine levels throughout the day
  
  // Add time points for each log and calculate cumulative levels
  todayLogs.forEach(log => {
    const hoursSinceLog = (Date.now() - log.timestamp) / (1000 * 60 * 60);
    const remainingFromLog = caffeineRemaining(log.caffeineMg, hoursSinceLog, HALF_LIFE_HOURS);
    
    // Calculate what the level was right after consuming this coffee
    const levelAfterThisCoffee = todayLogs
      .filter(prevLog => prevLog.timestamp <= log.timestamp)
      .reduce((sum, prevLog) => {
        const hoursSincePrev = (log.timestamp - prevLog.timestamp) / (1000 * 60 * 60);
        const remainingFromPrev = caffeineRemaining(prevLog.caffeineMg, hoursSincePrev, HALF_LIFE_HOURS);
        return sum + remainingFromPrev;
      }, 0) + log.caffeineMg;
    
    peak = Math.max(peak, levelAfterThisCoffee);
  });
  
  return Math.round(peak);
};

// Calculate time until safe to have next coffee
export const calculateTimeToNextCoffee = (
  currentLevel: number,
  dailyLimit: number = 400,
  bedtime: string = '23:00'
): number => {
  const now = new Date();
  const [bedHour, bedMinute] = bedtime.split(':').map(Number);
  const bedtimeDate = new Date(now);
  bedtimeDate.setHours(bedHour || 23, bedMinute || 0, 0, 0);
  
  // If bedtime is earlier today, it means tomorrow
  if (bedtimeDate.getTime() <= now.getTime()) {
    bedtimeDate.setDate(bedtimeDate.getDate() + 1);
  }
  
  const minutesToBedtime = (bedtimeDate.getTime() - now.getTime()) / (1000 * 60);
  
  // If we're already over the daily limit, wait until tomorrow
  if (currentLevel >= dailyLimit) {
    return minutesToBedtime + (24 * 60); // Wait until tomorrow
  }
  
  // Calculate how long until caffeine drops to safe level for next coffee
  // We want to ensure we don't exceed daily limit and have time for caffeine to clear before bed
  const targetLevel = Math.max(0, dailyLimit - 100); // Leave room for next coffee
  const safeLevel = Math.min(targetLevel, 50); // Ensure sleep safety
  
  if (currentLevel <= safeLevel) {
    return 0; // Safe to have coffee now
  }
  
  // Calculate time for caffeine to decay to safe level
  const hoursToDecay = Math.log(currentLevel / safeLevel) / Math.log(2) * HALF_LIFE_HOURS;
  const minutesToDecay = hoursToDecay * 60;
  
  // Ensure we have enough time before bedtime
  const safeTimeBeforeBed = 8 * 60; // 8 hours before bed
  const latestSafeTime = minutesToBedtime - safeTimeBeforeBed;
  
  return Math.max(0, Math.min(minutesToDecay, latestSafeTime));
};

// Get caffeine guidance
export const getCaffeineGuidance = (
  currentLevel: number,
  timeToNextCoffee: number,
  dailyLimit: number = 400,
  dailyProgress: number
): CaffeineGuidance => {
  if (timeToNextCoffee === 0) {
    if (dailyProgress >= 90) {
      return {
        canHaveCoffee: false,
        reason: 'Daily limit nearly reached',
        recommendation: 'You\'ve had enough caffeine today. Consider decaf or herbal tea.',
        icon: '⚠️',
        color: 'yellow'
      };
    }
    
    return {
      canHaveCoffee: true,
      reason: 'Safe to have coffee',
      recommendation: 'Go ahead and enjoy your coffee!',
      icon: '☕',
      color: 'green'
    };
  }
  
  if (timeToNextCoffee < 60) {
    return {
      canHaveCoffee: false,
      reason: 'Wait a bit longer',
      waitTime: `${Math.ceil(timeToNextCoffee)} minutes`,
      recommendation: `Wait about ${Math.ceil(timeToNextCoffee)} minutes for caffeine to clear.`,
      icon: '⏰',
      color: 'yellow'
    };
  }
  
  const hours = Math.floor(timeToNextCoffee / 60);
  const minutes = Math.ceil(timeToNextCoffee % 60);
  
  return {
    canHaveCoffee: false,
    reason: 'Caffeine still active',
    waitTime: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    recommendation: `Wait ${hours > 0 ? `${hours} hours and ${minutes} minutes` : `${minutes} minutes`} for caffeine to clear.`,
    icon: '⏳',
    color: 'red'
  };
};

// Get sleep risk assessment
export const getSleepRisk = (
  currentLevel: number,
  timeToBedtime: number
): { risk: 'low' | 'medium' | 'high'; message: string } => {
  const hoursToBed = timeToBedtime / 60;
  const projectedLevel = caffeineRemaining(currentLevel, hoursToBed, HALF_LIFE_HOURS);
  
  if (projectedLevel <= 25) {
    return {
      risk: 'low',
      message: 'Your caffeine will clear well before bedtime. Sleep should be unaffected.'
    };
  } else if (projectedLevel <= 50) {
    return {
      risk: 'medium',
      message: 'Some caffeine may remain at bedtime. Consider avoiding caffeine for the next few hours.'
    };
  } else {
    return {
      risk: 'high',
      message: 'Significant caffeine will remain at bedtime. This may affect your sleep quality.'
    };
  }
};

// Main function to get comprehensive caffeine status
export const getCaffeineStatus = (
  logs: CoffeeLogEntry[],
  bedtime: string = '23:00',
  dailyLimit: number = 400
): CaffeineStatus => {
  const currentLevel = calculateCurrentCaffeine(logs);
  const peakLevel = calculatePeakCaffeine(logs);
  const timeToNextCoffee = calculateTimeToNextCoffee(currentLevel, dailyLimit, bedtime);
  
  // Calculate time to bedtime
  const now = new Date();
  const [bedHour, bedMinute] = bedtime.split(':').map(Number);
  const bedtimeDate = new Date(now);
  bedtimeDate.setHours(bedHour || 23, bedMinute || 0, 0, 0);
  
  if (bedtimeDate.getTime() <= now.getTime()) {
    bedtimeDate.setDate(bedtimeDate.getDate() + 1);
  }
  
  const timeToBedtime = (bedtimeDate.getTime() - now.getTime()) / (1000 * 60);
  
  // Calculate daily progress
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfToday = today.getTime();
  const todayLogs = logs.filter(log => log.timestamp >= startOfToday);
  const totalConsumedToday = todayLogs.reduce((sum, log) => sum + log.caffeineMg, 0);
  const dailyProgress = (totalConsumedToday / dailyLimit) * 100;
  
  // Get sleep risk
  const sleepRisk = getSleepRisk(currentLevel, timeToBedtime);
  
  // Generate next coffee recommendation
  const guidance = getCaffeineGuidance(currentLevel, timeToNextCoffee, dailyLimit, dailyProgress);
  
  return {
    currentLevel: Math.round(currentLevel),
    peakLevel,
    timeToNextCoffee: Math.ceil(timeToNextCoffee),
    timeToBedtime: Math.ceil(timeToBedtime),
    isSafeForNextCoffee: timeToNextCoffee === 0,
    nextCoffeeRecommendation: guidance.recommendation,
    sleepRisk: sleepRisk.risk,
    sleepRiskMessage: sleepRisk.message,
    dailyProgress: Math.min(100, dailyProgress),
    dailyLimit
  };
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
