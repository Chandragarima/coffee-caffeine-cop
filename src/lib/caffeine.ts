import { getTimeOfDay } from "@/hooks/useTimeOfDay";

export const caffeineRemaining = (mg: number, hours: number, halfLife = 5) => {
  // exponential decay: remaining = mg * 0.5^(t / halfLife)
  if (mg <= 0) return 0;
  if (hours <= 0) return mg;
  const remaining = mg * Math.pow(0.5, hours / halfLife);
  return Math.max(0, Math.round(remaining));
};

export const getMilestones = (mg: number, halfLife = 5) => {
  const half = halfLife; // 50%
  const quarter = halfLife * 2; // 25%
  return [
    { label: "Half-life", hours: half, remaining: caffeineRemaining(mg, half, halfLife) },
    { label: "Quarter-life", hours: quarter, remaining: caffeineRemaining(mg, quarter, halfLife) },
  ];
};

// ============================================
// PEAK ENERGY CALCULATIONS
// ============================================

// Peak caffeine concentration occurs ~30-60 minutes after consumption
// We use 45 minutes as the default peak time
export const PEAK_MINUTES = 45;

export interface PeakEnergyInfo {
  peakTime: number;           // Unix timestamp of peak
  minutesToPeak: number;      // Minutes until peak (negative if past)
  isPastPeak: boolean;        // Whether peak has already occurred
  peakTimeFormatted: string;  // Human readable time (e.g., "10:30 AM")
  phase: 'absorbing' | 'peak' | 'sustained' | 'declining';
  phaseDescription: string;
}

/**
 * Calculate peak energy info for a coffee consumed at a given time
 * @param consumedAt - Unix timestamp when coffee was consumed
 * @param currentTime - Current time (defaults to now)
 */
export const getPeakEnergyInfo = (
  consumedAt: number,
  currentTime: number = Date.now()
): PeakEnergyInfo => {
  const peakTime = consumedAt + (PEAK_MINUTES * 60 * 1000);
  const minutesToPeak = Math.round((peakTime - currentTime) / (1000 * 60));
  const minutesSinceConsumption = Math.round((currentTime - consumedAt) / (1000 * 60));
  const isPastPeak = minutesToPeak <= 0;
  
  // Format peak time for display
  const peakDate = new Date(peakTime);
  const peakTimeFormatted = peakDate.toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  // Determine phase
  let phase: PeakEnergyInfo['phase'];
  let phaseDescription: string;
  
  if (minutesSinceConsumption < 15) {
    phase = 'absorbing';
    phaseDescription = 'Caffeine is entering your bloodstream';
  } else if (minutesSinceConsumption < 60) {
    phase = 'peak';
    phaseDescription = isPastPeak ? 'You\'re at peak alertness' : 'Approaching peak alertness';
  } else if (minutesSinceConsumption < 180) {
    phase = 'sustained';
    phaseDescription = 'Sustained energy from caffeine';
  } else {
    phase = 'declining';
    phaseDescription = 'Caffeine is gradually clearing';
  }
  
  return {
    peakTime,
    minutesToPeak,
    isPastPeak,
    peakTimeFormatted,
    phase,
    phaseDescription
  };
};

/**
 * Format minutes to peak for display
 * @param minutes - Minutes until peak (can be negative)
 */
export const formatMinutesToPeak = (minutes: number): string => {
  if (minutes <= 0) {
    const pastMinutes = Math.abs(minutes);
    if (pastMinutes < 1) return 'Just peaked';
    if (pastMinutes < 60) return `Peaked ${pastMinutes}m ago`;
    const hours = Math.floor(pastMinutes / 60);
    const mins = pastMinutes % 60;
    return mins > 0 ? `Peaked ${hours}h ${mins}m ago` : `Peaked ${hours}h ago`;
  }
  
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

/**
 * Get the energy curve data points for visualization
 * @param caffeineMg - Amount of caffeine
 * @param consumedAt - When consumed
 * @param halfLife - Half-life in hours (default 5)
 */
export const getEnergyCurvePoints = (
  caffeineMg: number,
  consumedAt: number,
  halfLife: number = 5
): { time: number; level: number; label: string }[] => {
  const points = [];
  const now = Date.now();
  
  // Generate points from consumption to 8 hours after
  for (let minutesAfter = 0; minutesAfter <= 480; minutesAfter += 30) {
    const pointTime = consumedAt + (minutesAfter * 60 * 1000);
    const hoursAfter = minutesAfter / 60;
    
    // Caffeine absorption follows a curve: fast rise to peak, then exponential decay
    let level: number;
    if (minutesAfter <= PEAK_MINUTES) {
      // Absorption phase: linear rise to peak
      level = (minutesAfter / PEAK_MINUTES) * caffeineMg;
    } else {
      // Decay phase: exponential decay from peak
      const hoursAfterPeak = (minutesAfter - PEAK_MINUTES) / 60;
      level = caffeineRemaining(caffeineMg, hoursAfterPeak, halfLife);
    }
    
    // Format label
    const pointDate = new Date(pointTime);
    const label = pointDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    
    points.push({ time: pointTime, level: Math.round(level), label });
  }
  
  return points;
};

export { getTimeOfDay };
