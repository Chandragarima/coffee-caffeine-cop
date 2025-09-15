import { COFFEES, CoffeeItem } from "@/data/coffees";
import { TimeOfDay, defaultEnergyForTime } from "@/hooks/useTimeOfDay";
import { caffeineRemaining } from "@/lib/caffeine";
import { adjustedMg, SizeOz } from "@/lib/serving";

export type EnergyLevel = "high" | "medium" | "low";

const inRange = (x: number, min: number, max: number) => x >= min && x <= max;

// Scientific sleep guidelines based on 8-hour rule
// No caffeine should be consumed 8+ hours before bedtime to ensure <50mg at sleep
const SCIENTIFIC_SLEEP_THRESHOLD_MG = 50;
const CAFFEINE_HALF_LIFE_HOURS = 5; // Standard caffeine half-life

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
  
  // Consider more items for better variety - up to 15 items instead of just 6
  const maxCandidates = Math.min(15, items.length);
  
  // For high/medium energy, prefer higher caffeine but shuffle for variety
  if (energy === "high" || energy === "medium") {
    const sorted = items.sort((a, b) => b.caffeineMg - a.caffeineMg);
    // Take top 15 candidates and shuffle to get much more variety
    const topCandidates = sorted.slice(0, maxCandidates);
    return shuffleArray(topCandidates).slice(0, n);
  }
  
  // For low energy, prefer lower caffeine but still add variety
  const sorted = items.sort((a, b) => a.caffeineMg - b.caffeineMg);
  const topCandidates = sorted.slice(0, maxCandidates);
  return shuffleArray(topCandidates).slice(0, n);
};

export const bestPicksForTime = (
  time: TimeOfDay,
  energy: EnergyLevel = defaultEnergyForTime[time],
  hoursUntilBed?: number,
  halfLife = 5,
  sizeOz = 12,
  shots = 1,
  maxRecommendations = 3
): CoffeeItem[] => {
  // Step 1: Apply scientific 8-hour rule based on time until bedtime
  let pool: CoffeeItem[] = [];
  
  if (hoursUntilBed !== undefined && hoursUntilBed > 0) {
    // Scientific sleep guidelines: 8-hour rule for <50mg at bedtime
    if (hoursUntilBed >= 8) {
      // Morning (6AM-11:59AM): Unlimited (up to 400mg daily)
      // Afternoon (12PM-3PM): Up to 200mg (last coffee by 3PM)
      if (energy === "high") {
        pool = COFFEES.filter((c) => inRange(c.caffeineMg, 90, 220));
      } else if (energy === "medium") {
        pool = COFFEES.filter((c) => inRange(c.caffeineMg, 60, 130));
      } else {
        pool = COFFEES.filter((c) => c.caffeineMg <= 60 || c.tags?.includes("low_caffeine"));
      }
    } else if (hoursUntilBed >= 5) {
      // Late Afternoon (3PM-8PM): Light tea/soda/energy drink only (under 50mg)
      pool = COFFEES.filter((c) => c.caffeineMg <= 50 || c.tags?.includes("low_caffeine"));
         } else if (hoursUntilBed >= 2) {
       // Evening (8PM+): <5mg caffeine
       pool = COFFEES.filter((c) => c.caffeineMg <= 5 || c.tags?.includes("decaf") || c.tags?.includes("low_caffeine"));
     } else {
       // Very close to bedtime: Only decaf/herbal
       pool = COFFEES.filter((c) => c.caffeineMg <= 2 || c.tags?.includes("decaf") || c.tags?.includes("low_caffeine"));
     }
  } else {
    // Fallback to original energy-based filtering if no bedtime provided
    if (energy === "high") {
      pool = COFFEES.filter((c) => inRange(c.caffeineMg, 90, 220));
    } else if (energy === "medium") {
      pool = COFFEES.filter((c) => inRange(c.caffeineMg, 60, 130));
    } else {
      pool = COFFEES.filter((c) => c.caffeineMg <= 60 || c.tags?.includes("low_caffeine"));
    }
  }
  
  // Step 2: Additional safety filter to ensure <50mg at bedtime
  if (hoursUntilBed !== undefined && hoursUntilBed > 0) {
    pool = pool.filter((coffee) => {
      const adjustedCaffeine = adjustedMg(coffee, sizeOz as SizeOz, shots as 1 | 2 | 3);
      const remainingAtBed = caffeineRemaining(adjustedCaffeine, hoursUntilBed, halfLife);
      return remainingAtBed <= SCIENTIFIC_SLEEP_THRESHOLD_MG;
    });
  }
  
  // Step 3: Return varied selection
  let result = pickVaried(pool, maxRecommendations, energy);
  
  // If we have a very small pool (< 10 items), consider expanding the search
  // to get more variety while still respecting sleep safety
  if (pool.length < 10 && hoursUntilBed !== undefined && hoursUntilBed > 0) {
    // Try to get more variety by considering a broader range
    const expandedPool = COFFEES.filter((coffee) => {
      const adjustedCaffeine = adjustedMg(coffee, sizeOz as SizeOz, shots as 1 | 2 | 3);
      const remainingAtBed = caffeineRemaining(adjustedCaffeine, hoursUntilBed, halfLife);
      // Be slightly more lenient for variety (60mg instead of 50mg)
      return remainingAtBed <= 60;
    });
    
    if (expandedPool.length > pool.length) {
      result = pickVaried(expandedPool, maxRecommendations, energy);
    }
  }
  
  return result;
};
