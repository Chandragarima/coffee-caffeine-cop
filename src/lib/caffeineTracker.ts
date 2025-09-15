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
  iconType: 'emoji' | 'svg';
  iconPath?: string;
  color: 'green' | 'yellow' | 'red';
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

// Calculate time until safe to have next coffee
export const calculateTimeToNextCoffee = (
  currentLevel: number,
  dailyLimit: number = 400,
  bedtime: string = '23:00'
): number => {
  const now = new Date();
  const [bedHour, bedMinute] = bedtime.split(':').map(Number);
  const bedtimeDate = new Date(now);
  bedtimeDate.setHours(bedHour ?? 23, bedMinute ?? 0, 0, 0);
  
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
  
  // If we're too close to bedtime (within 8 hours), use decay time only
  // but warn that it might affect sleep
  if (latestSafeTime <= 0) {
    return Math.max(0, minutesToDecay);
  }
  
  const finalWaitTime = Math.max(0, Math.min(minutesToDecay, latestSafeTime));
  
  return finalWaitTime;
};

// Get caffeine guidance based on projected bedtime caffeine levels
export const getCaffeineGuidance = (
  currentLevel: number,
  timeToNextCoffee: number,
  dailyLimit: number = 400,
  dailyProgress: number,
  timeToBedtime: number = 999 // minutes until bedtime
): CaffeineGuidance => {
  const hoursUntilBed = timeToBedtime / 60;
  
  // Calculate projected caffeine at bedtime
  const projectedAtBedtime = caffeineRemaining(currentLevel, hoursUntilBed, HALF_LIFE_HOURS);
  
  // Determine sleep risk based on projected bedtime caffeine
  let sleepRisk: 'low' | 'medium' | 'high';
  let color: 'green' | 'yellow' | 'red';
  let iconPath: string;
  let reason: string;
  
  if (projectedAtBedtime < 50) {
    sleepRisk = 'low';
    color = 'green';
    iconPath = '/coffee-caffeine-cop/icons/low.svg';
    reason = 'Sleep looks good';
  } else if (projectedAtBedtime <= 90) {
    sleepRisk = 'medium';
    color = 'yellow';
    iconPath = '/coffee-caffeine-cop/icons/medium.svg';
    reason = 'May affect sleep';
  } else {
    sleepRisk = 'high';
    color = 'red';
    iconPath = '/coffee-caffeine-cop/icons/high.svg';
    reason = 'Sleep at risk';
  }
  
  // Generate recommendation based on sleep risk and current status
  let recommendation: string;
  let canHaveCoffee: boolean;
  
  if (timeToNextCoffee === 0) {
    // No wait time - safe to have coffee now
    if (dailyProgress >= 90) {
      canHaveCoffee = false;
      reason = 'Daily limit reached';
      recommendation = 'You\'ve had enough caffeine today. Consider decaf or herbal tea.';
      color = 'yellow';
      iconPath = '/coffee-caffeine-cop/icons/medium.svg';
    } else if (sleepRisk === 'low') {
      canHaveCoffee = true;
      recommendation = 'Go ahead and enjoy your coffee! It will clear well before bedtime.';
    } else if (sleepRisk === 'medium') {
      canHaveCoffee = true;
      recommendation = 'You can have coffee, but consider a smaller size to protect sleep quality.';
    } else {
      canHaveCoffee = false;
      recommendation = 'Skip coffee for now - it would significantly disrupt your sleep tonight.';
    }
  } else {
    // Need to wait - explain WHY based on sleep risk
    canHaveCoffee = false;
    const hours = Math.floor(timeToNextCoffee / 60);
    const minutes = Math.ceil(timeToNextCoffee % 60);
    const waitTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    
    if (timeToNextCoffee < 60) {
      reason = 'Almost ready for coffee';
      recommendation = `Just ${Math.ceil(timeToNextCoffee)} more minutes to avoid exceeding your daily limit.`;
    } else {
      // Be specific about why they need to wait based on sleep risk
      if (sleepRisk === 'high') {
        reason = 'Too late for coffee';
        recommendation = `Wait ${waitTime} - coffee now would leave ${Math.round(projectedAtBedtime)}mg+ at bedtime, disrupting your sleep.`;
      } else if (sleepRisk === 'medium') {
        reason = 'Coffee timing warning';
        recommendation = `Wait ${waitTime} to keep bedtime caffeine under 50mg for better sleep quality.`;
      } else {
        reason = 'Wait for next coffee';
        recommendation = `Wait ${waitTime} to maintain good sleep while getting the most from your daily caffeine.`;
      }
    }
  }
  
  return {
    canHaveCoffee,
    reason,
    waitTime: timeToNextCoffee > 0 ? (timeToNextCoffee < 60 ? `${Math.ceil(timeToNextCoffee)} minutes` : `${Math.floor(timeToNextCoffee / 60)}h ${Math.ceil(timeToNextCoffee % 60)}m`) : undefined,
    recommendation,
    icon: sleepRisk === 'low' ? '😴' : sleepRisk === 'medium' ? '😐' : '😵',
    iconType: 'svg',
    iconPath,
    color
  };
};

// Get sleep risk assessment (uses total caffeine including previous days for accuracy)
export const getSleepRisk = (
  totalCaffeineLevel: number,
  timeToBedtime: number
): { risk: 'low' | 'medium' | 'high'; message: string } => {
  const hoursToBed = timeToBedtime / 60;
  const projectedLevel = caffeineRemaining(totalCaffeineLevel, hoursToBed, HALF_LIFE_HOURS);
  
  if (projectedLevel < 50) {
    return {
      risk: 'low',
      message: `${Math.round(projectedLevel)}mg will remain at bedtime. Sleep should be unaffected.`
    };
  } else if (projectedLevel <= 90) {
    return {
      risk: 'medium',
      message: `${Math.round(projectedLevel)}mg will remain at bedtime. May slightly affect sleep quality.`
    };
  } else {
    return {
      risk: 'high',
      message: `${Math.round(projectedLevel)}mg will remain at bedtime. Likely to disrupt sleep quality.`
    };
  }
};

// Main function to get comprehensive caffeine status
export const getCaffeineStatus = (
  logs: CoffeeLogEntry[],
  bedtime: string = '23:00',
  dailyLimit: number = 400
): CaffeineStatus => {
  const currentLevel = calculateCurrentCaffeine(logs); // Today's caffeine only
  const totalCaffeineLevel = calculateTotalCaffeine(logs); // All historical caffeine
  const peakLevel = calculatePeakCaffeine(logs);
  const timeToNextCoffee = calculateTimeToNextCoffee(currentLevel, dailyLimit, bedtime);
  
  // Calculate time to bedtime
  const now = new Date();
  const [bedHour, bedMinute] = bedtime.split(':').map(Number);
  const bedtimeDate = new Date(now);
  bedtimeDate.setHours(bedHour ?? 23, bedMinute ?? 0, 0, 0);
  
  if (bedtimeDate.getTime() <= now.getTime()) {
    bedtimeDate.setDate(bedtimeDate.getDate() + 1);
  }
  
  const timeToBedtime = (bedtimeDate.getTime() - now.getTime()) / (1000 * 60);
  
  // Calculate daily progress
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfToday = today.getTime();
  const todayLogs = logs.filter(log => log.consumedAt >= startOfToday);
  const totalConsumedToday = todayLogs.reduce((sum, log) => sum + log.caffeineMg, 0);
  const dailyProgress = (totalConsumedToday / dailyLimit) * 100;
  
  // Get sleep risk using total caffeine (including previous days) for accuracy
  const sleepRisk = getSleepRisk(totalCaffeineLevel, timeToBedtime);
  
  // Generate next coffee recommendation
  const guidance = getCaffeineGuidance(currentLevel, timeToNextCoffee, dailyLimit, dailyProgress, timeToBedtime);
  
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
