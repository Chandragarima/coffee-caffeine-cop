import { CoffeeItem } from "@/data/coffees";

export type SizeOz = 12 | 16 | 20;

// Treat 16 oz as baseline (1.0). Approximate scaling for brewed drinks.
export const sizeMultipliers: Record<SizeOz, number> = {
  12: 0.75,
  16: 1,
  20: 1.25,
};

// Base caffeine per extra espresso shot (approx.)
export const ESPRESSO_SHOT_MG = 63;

export const adjustedMg = (
  coffee: CoffeeItem,
  sizeOz: SizeOz,
  shots: 1 | 2
): number => {
  let mg = coffee.caffeineMg;

  // Add shot for espresso-based drinks when user selects double
  if (shots === 2 && (coffee.category === "espresso" || coffee.category === "milk")) {
    mg += ESPRESSO_SHOT_MG; // add one extra shot worth of caffeine
  }

  // Apply size scaling for non-espresso-only beverages
  if (
    coffee.category === "water" ||
    coffee.category === "tea" ||
    coffee.category === "cold" ||
    coffee.category === "specialty"
  ) {
    mg = Math.round(mg * sizeMultipliers[sizeOz]);
  }

  // For pure espresso or milk drinks, size doesn't change caffeine by default here
  return Math.max(0, mg);
};
