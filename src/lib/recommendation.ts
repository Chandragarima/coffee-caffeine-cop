import { COFFEES, CoffeeItem } from "@/data/coffees";
import { TimeOfDay, defaultEnergyForTime } from "@/hooks/useTimeOfDay";
import { caffeineRemaining } from "@/lib/caffeine";
import { adjustedMg, SizeOz } from "@/lib/serving";

export type EnergyLevel = "high" | "medium" | "low";

const inRange = (x: number, min: number, max: number) => x >= min && x <= max;

// Safe sleep threshold - caffeine remaining at bedtime should be below this
const SAFE_SLEEP_THRESHOLD_MG = 50;

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const pickVaried = (items: CoffeeItem[], n = 3, energy: EnergyLevel) => {
  if (items.length <= n) return items;
  
  // For high/medium energy, prefer higher caffeine but shuffle for variety
  if (energy === "high" || energy === "medium") {
    const sorted = items.sort((a, b) => b.caffeineMg - a.caffeineMg);
    // Take top 6 and shuffle to get variety in the top picks
    const topCandidates = sorted.slice(0, Math.min(6, items.length));
    return shuffleArray(topCandidates).slice(0, n);
  }
  
  // For low energy, prefer lower caffeine but still add variety
  const sorted = items.sort((a, b) => a.caffeineMg - b.caffeineMg);
  const topCandidates = sorted.slice(0, Math.min(6, items.length));
  return shuffleArray(topCandidates).slice(0, n);
};

export const bestPicksForTime = (
  time: TimeOfDay,
  energy: EnergyLevel = defaultEnergyForTime[time],
  hoursUntilBed?: number,
  halfLife = 5,
  sizeOz = 12,
  shots = 1
): CoffeeItem[] => {
  // Step 1: Filter by energy level (existing logic)
  let pool: CoffeeItem[] = [];
  
  if (energy === "high") {
    pool = COFFEES.filter((c) => inRange(c.caffeineMg, 90, 220));
  } else if (energy === "medium") {
    pool = COFFEES.filter((c) => inRange(c.caffeineMg, 60, 130));
  } else {
    // low energy: prefer low/decaf, teas, milk_light
    pool = COFFEES.filter((c) => c.caffeineMg <= 60 || c.tags?.includes("low_caffeine"));
  }
  
  // Step 2: Apply sleep filter if bedtime is provided
  if (hoursUntilBed !== undefined && hoursUntilBed > 0) {
    // Special handling for late night + high energy requests near bedtime
    if (time === "late_night" && energy === "high" && hoursUntilBed < 3) {
      // Force to low energy for very short time to bed during late night
      energy = "low";
      pool = COFFEES.filter((c) => c.caffeineMg <= 60 || c.tags?.includes("low_caffeine"));
    }
    
    pool = pool.filter((coffee) => {
      const adjustedCaffeine = adjustedMg(coffee, sizeOz as SizeOz, shots as 1 | 2);
      const remainingAtBed = caffeineRemaining(adjustedCaffeine, hoursUntilBed, halfLife);
      return remainingAtBed <= SAFE_SLEEP_THRESHOLD_MG;
    });
    
    // If no coffees pass the sleep test, fall back to lower energy category
    if (pool.length === 0 && energy !== "low") {
      if (energy === "high") {
        // Try medium energy options
        pool = COFFEES.filter((c) => inRange(c.caffeineMg, 60, 130))
          .filter((coffee) => {
            const adjustedCaffeine = adjustedMg(coffee, sizeOz as SizeOz, shots as 1 | 2);
            const remainingAtBed = caffeineRemaining(adjustedCaffeine, hoursUntilBed, halfLife);
            return remainingAtBed <= SAFE_SLEEP_THRESHOLD_MG;
          });
      }
      
      // If still nothing, try low energy options
      if (pool.length === 0) {
        pool = COFFEES.filter((c) => c.caffeineMg <= 60 || c.tags?.includes("low_caffeine"))
          .filter((coffee) => {
            const adjustedCaffeine = adjustedMg(coffee, sizeOz as SizeOz, shots as 1 | 2);
            const remainingAtBed = caffeineRemaining(adjustedCaffeine, hoursUntilBed, halfLife);
            return remainingAtBed <= SAFE_SLEEP_THRESHOLD_MG;
          });
      }
    }
  }
  
  // Step 3: Return varied selection
  return pickVaried(pool, 3, energy);
};
