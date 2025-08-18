import { CoffeeItem } from "@/data/coffees";

export type SizeOz = 8 | 12 | 16 | 20;

// Size multipliers for drinks that can scale proportionally
export const sizeMultipliers: Record<SizeOz, number> = {
  8: 1,
  12: 1.5,
  16: 2,
  20: 2.5,
};

// Base caffeine per extra espresso shot (industry standard)
export const ESPRESSO_SHOT_MG = 75;

// Drinks that have fixed serving sizes and don't scale with size selection
const FIXED_SIZE_DRINKS = [
  // Brewed category - mostly fixed at their specified sizes
  "espresso_machine_home", "moka_pot",
  
  // Espresso category - all fixed small sizes
  "single_espresso", "decaf_espresso", "double_espresso", "ristretto",
  "americano_8oz", "americano_12oz", "affogato", "cortado", "flat_white",
  
  // Cold category - fixed at 12oz standard
  "iced_americano", "nitro_cold_brew", "cold_brew",
  
  // Specialty category - mostly fixed traditional sizes
  "turkish_coffee", "vietnamese_coffee", "frappuccino"
];

// Drinks that can scale proportionally with size
const SCALABLE_DRINKS = [
  // Brewed category - brewing methods that can scale
  "drip_coffee", "pour_over", "french_press", "decaf_drip_coffee",
  
  // Milk-based category - can be made in different sizes
  "cappuccino", "cafe_au_lait", "latte", "caramel_macchiato", "mocha", 
  "shaken_espresso", "decaf_latte", "chai_latte", "matcha_latte",
  
  // Tea category - can be brewed in different sizes
  "green_tea", "oolong_tea", "black_tea", "earl_grey", "masala_chai", 
  "iced_tea", "boba_tea"
];

// Drinks that can have double shots added (single-shot espresso-based drinks)
const DOUBLE_SHOT_ELIGIBLE = [
  "single_espresso", "cappuccino", "cafe_au_lait", "latte", 
  "caramel_macchiato", "mocha", "decaf_latte"
];

export const adjustedMg = (
  coffee: CoffeeItem,
  sizeOz: SizeOz,
  shots: 1 | 2
): number => {
  let mg = coffee.caffeineMg;

  // Handle double shot addition for eligible single-shot drinks
  if (shots === 2 && DOUBLE_SHOT_ELIGIBLE.includes(coffee.id)) {
    mg += ESPRESSO_SHOT_MG; // add one extra shot worth of caffeine
  }

  // Apply size scaling only for scalable drinks
  if (SCALABLE_DRINKS.includes(coffee.id)) {
    // Determine the base size for this drink to calculate scaling
    let baseSize = 8; // default
    
    // Some drinks have different base sizes based on their data
    if (["latte", "caramel_macchiato", "mocha", "chai_latte", "matcha_latte", "iced_tea", "boba_tea"].includes(coffee.id)) {
      baseSize = 12; // These are typically served in 12oz as standard
    }
    
    // Calculate scaling factor relative to the drink's base size
    const scalingFactor = sizeOz / baseSize;
    mg = Math.round(mg * scalingFactor);
  }

  // For fixed size drinks, caffeine doesn't change regardless of size selection
  // (User can still select size but it's more for UI consistency)

  return Math.max(0, mg);
};
