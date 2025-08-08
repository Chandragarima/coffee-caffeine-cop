import { COFFEES, CoffeeItem } from "@/data/coffee";
import { TimeOfDay, defaultEnergyForTime } from "@/hooks/useTimeOfDay";

export type EnergyLevel = "high" | "medium" | "low";

const inRange = (x: number, min: number, max: number) => x >= min && x <= max;

const pickTop = (items: CoffeeItem[], n = 3) =>
  items
    .sort((a, b) => b.caffeineMg - a.caffeineMg)
    .slice(0, n);

export const bestPicksForTime = (
  time: TimeOfDay,
  energy: EnergyLevel = defaultEnergyForTime[time]
): CoffeeItem[] => {
  if (energy === "high") {
    // Prefer higher caffeine, but cap extremes
    const pool = COFFEES.filter((c) => inRange(c.caffeineMg, 90, 220));
    return pickTop(pool, 3);
  }
  if (energy === "medium") {
    const pool = COFFEES.filter((c) => inRange(c.caffeineMg, 60, 130));
    return pickTop(pool, 3);
  }
  // low energy: prefer low/decaf, teas, milk_light
  const pool = COFFEES.filter((c) => c.caffeineMg <= 60 || c.tags?.includes("low_caffeine"));
  // sort ascending for low energy so we don't overdo it
  return pool.sort((a, b) => a.caffeineMg - b.caffeineMg).slice(0, 3);
};
