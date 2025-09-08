import { CoffeeItem } from "@/data/coffees";

export type SizeOz = 8 | 12 | 16 | 20 | 24;

// Size multipliers for drinks that can scale proportionally
export const sizeMultipliers: Record<SizeOz, number> = {
  8: 1,
  12: 1.5,
  16: 2,
  20: 2.5,
  24: 3,
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
  // Brewed category - brewing methods that can scale (NOTE: brewed_coffee and caffe_americano have custom logic)
  "pour_over", "french_press", "decaf_drip_coffee",
  
  // Milk-based category - can be made in different sizes (excluding shot-based drinks)
  "decaf_latte",
  
  // Tea category - can be brewed in different sizes
  "black_tea", "earl_grey", "green_tea", "masala_chai", "herbal_tea",
  "chai_latte", "matcha_latte", "chamomile_tea",
  
  // Iced category - can be served in different sizes
  "iced_coffee", "cold_brew", "nitro_cold_brew", "iced_shaken_espresso", 
  "iced_latte", "iced_mocha", "iced_americano",
  "iced_black_tea", "iced_green_tea", "iced_chai_latte", "iced_matcha_latte",
  
  // Specialty category - can be served in different sizes
  "coffee_frappuccino", "mocha_frappuccino", "caramel_frappuccino", 
  "espresso_frappuccino", "matcha_creme_frappuccino"
];

// Drinks that can have double shots added (manual shot adjustments)
// Excluding size-based shot drinks since they have automatic shot logic
const DOUBLE_SHOT_ELIGIBLE = [
  "single_espresso", "decaf_latte"
  // Note: shaken_espresso has its own special logic
];

// Categories that should NOT be affected by shot settings
const SHOT_EXCLUDED_CATEGORIES = ["tea", "energy", "soda", "cold", "specialty"];

// Drinks that already have multiple shots built-in and should not be modified
const MULTI_SHOT_DRINKS = [
  "double_espresso"
  // Note: cortado moved to milk category, flat_white has custom logic, shaken_espresso has special logic
];

// Milk-based drinks that use size-based automatic shot logic (DEPRECATED - moved to specific logic)
const SIZE_BASED_SHOT_DRINKS = [
  // These drinks now have specific logic in adjustedMg function
];

// Chocolate caffeine content in mocha drinks
const CHOCOLATE_CAFFEINE_MG = 15;

export const adjustedMg = (
  coffee: CoffeeItem,
  sizeOz: SizeOz,
  shots: 1 | 2 | 3,
  shotsManuallySet: boolean = false
): number => {
  // Validate inputs to prevent NaN calculations
  if (typeof sizeOz !== 'number' || ![8, 12, 16, 20, 24].includes(sizeOz)) {
    console.warn('Invalid sizeOz value:', sizeOz, 'using default 12');
    sizeOz = 12;
  }
  
  if (typeof shots !== 'number' || ![1, 2, 3].includes(shots)) {
    console.warn('Invalid shots value:', shots, 'using default 1');
    shots = 1;
  }
  
  if (typeof coffee.caffeineMg !== 'number' || isNaN(coffee.caffeineMg)) {
    console.warn('Invalid caffeineMg value for coffee:', coffee.id, coffee.caffeineMg);
    return 0;
  }

  // SHOT-ONLY DRINKS (ignore size, only shots matter)
  const SHOT_ONLY_DRINKS = [
    "single_espresso", "ristretto", "affogato", "decaf_espresso", "espresso_machine_home"
  ];
  
  if (SHOT_ONLY_DRINKS.includes(coffee.id)) {
    const baseCaffeine = coffee.caffeineMg; // Base caffeine per shot
    return baseCaffeine * shots;
  }

  // FIXED DRINKS (ignore both size and shots)
  const FIXED_DRINKS = [
    "turkish_coffee", "vietnamese_coffee"
  ];
  
  if (FIXED_DRINKS.includes(coffee.id)) {
    return coffee.caffeineMg; // Always return fixed value
  }

  // SIZE-ONLY DRINKS (ignore shots, only size matters)
  const SIZE_ONLY_DRINKS = [
    "brewed_coffee", "pour_over", "french_press", "decaf_drip_coffee",
    "iced_coffee", "cold_brew", "nitro_cold_brew", "iced_americano",
    "iced_black_tea", "iced_green_tea", "iced_chai_latte", "iced_matcha_latte",
    "black_tea", "earl_grey", "green_tea", "masala_chai", "herbal_tea",
    "chai_latte", "matcha_latte", "chamomile_tea",
    "coffee_frappuccino", "mocha_frappuccino", "caramel_frappuccino", 
    "espresso_frappuccino", "matcha_creme_frappuccino"
  ];
  
  if (SIZE_ONLY_DRINKS.includes(coffee.id)) {
    // Size-based lookup tables
    const sizeMaps: Record<string, Record<number, number>> = {
      // Brewed Coffee
      "brewed_coffee": { 8: 155, 12: 235, 16: 310, 20: 410 },
      
      // Pour Over and French Press (already implemented)
      "pour_over": { 8: 128, 12: 192, 16: 256, 20: 320 },
      "french_press": { 8: 107, 12: 160, 16: 214, 20: 268 },
      
      // Decaf Drip (proportional scaling)
      "decaf_drip_coffee": { 8: 3, 12: 5, 16: 6, 20: 8 },
      
      // Iced Drinks
      "iced_coffee": { 12: 120, 16: 165, 24: 235 },
      "cold_brew": { 12: 155, 16: 205, 24: 310 },
      "nitro_cold_brew": { 12: 215, 16: 280 },
      "iced_americano": { 12: 150, 16: 225, 24: 300 },
      
      // Iced Teas
      "iced_black_tea": { 12: 20, 16: 25, 24: 40 },
      "iced_green_tea": { 12: 20, 16: 25, 24: 40 },
      "iced_chai_latte": { 12: 70, 16: 95, 24: 145 },
      "iced_matcha_latte": { 12: 55, 16: 80, 24: 110 },
      
      // Hot Teas (fixed for some sizes)
      "black_tea": { 12: 40, 16: 40, 24: 40 },
      "earl_grey": { 12: 40, 16: 40, 24: 40 },
      "masala_chai": { 12: 40, 16: 40, 24: 40 },
      "green_tea": { 12: 16, 16: 16, 24: 16 },
      "herbal_tea": { 12: 0, 16: 0, 24: 0 },
      
      // Tea Lattes
      "chai_latte": { 8: 50, 12: 70, 16: 95, 20: 120 },
      "matcha_latte": { 8: 20, 12: 45, 16: 65, 20: 85 },
      "chamomile_tea": { 8: 16, 12: 16, 16: 25, 20: 25 },
      
      // Frappuccinos
      "coffee_frappuccino": { 12: 65, 16: 95, 24: 125 },
      "mocha_frappuccino": { 12: 70, 16: 100, 24: 130 },
      "caramel_frappuccino": { 12: 65, 16: 90, 24: 120 },
      "espresso_frappuccino": { 12: 130, 16: 155, 24: 185 },
      "matcha_creme_frappuccino": { 12: 40, 16: 65, 24: 85 }
    };
    
    const sizeMap = sizeMaps[coffee.id];
    if (sizeMap && sizeMap[sizeOz] !== undefined) {
      return sizeMap[sizeOz];
    }
    
    // Fallback to proportional scaling for drinks not in the map
    const scalingFactor = sizeOz / 8;
    return Math.round(coffee.caffeineMg * scalingFactor);
  }

  // HYBRID DRINKS (both size and shots matter, manual shots override automatic)
  const HYBRID_DRINKS = [
    "caffe_americano", "latte", "cappuccino", "flat_white", "caramel_macchiato",
    "mocha", "blonde_latte", "iced_shaken_espresso", "iced_latte", "iced_mocha"
  ];
  
  if (HYBRID_DRINKS.includes(coffee.id)) {
    // Size-based automatic shot calculation
    const autoShotMaps: Record<string, Record<number, number>> = {
      "caffe_americano": { 8: 1, 12: 2, 16: 3, 20: 4 },
      "latte": { 8: 1, 12: 1, 16: 2, 20: 2 },
      "cappuccino": { 8: 1, 12: 1, 16: 2, 20: 2 },
      "flat_white": { 8: 2, 12: 2, 16: 3, 20: 3 },
      "caramel_macchiato": { 8: 1, 12: 1, 16: 2, 20: 2 },
      "mocha": { 8: 1, 12: 1, 16: 2, 20: 2 },
      "blonde_latte": { 8: 1, 12: 1, 16: 2, 20: 2 },
      "iced_shaken_espresso": { 12: 2, 16: 3, 24: 4 },
      "iced_latte": { 12: 1, 16: 2, 24: 3 },
      "iced_mocha": { 12: 1, 16: 2, 24: 3 }
    };
    
    const autoShots = autoShotMaps[coffee.id]?.[sizeOz] || 1;
    
    // Use manual shots only if user has manually set them, otherwise use automatic shots
    const finalShots = shotsManuallySet ? shots : autoShots;
    
    // Calculate base caffeine based on shot type
    let baseCaffeinePerShot = 75; // Standard espresso
    if (coffee.id === "flat_white") {
      baseCaffeinePerShot = 65; // Ristretto shots
    }
    
    let totalCaffeine = finalShots * baseCaffeinePerShot;
    
    // Add chocolate for mocha drinks
    if (coffee.id === "mocha" || coffee.id === "iced_mocha") {
      let chocolateMg = 15; // Base chocolate
      if (sizeOz >= 16) {
        chocolateMg = sizeOz >= 20 ? 25 : 20;
      }
      totalCaffeine += chocolateMg;
    }
    
    return totalCaffeine;
  }

  // Fallback for any drinks not covered above
  return coffee.caffeineMg;
};

// Check if a coffee should be affected by shot settings
export const isShotEligible = (coffee: CoffeeItem): boolean => {
  // Shot-only drinks: always eligible
  const SHOT_ONLY_DRINKS = [
    "single_espresso", "ristretto", "affogato", "decaf_espresso", "espresso_machine_home"
  ];
  
  // Hybrid drinks: eligible for manual shot adjustments
  const HYBRID_DRINKS = [
    "caffe_americano", "latte", "cappuccino", "flat_white", "caramel_macchiato",
    "mocha", "blonde_latte", "iced_shaken_espresso", "iced_latte", "iced_mocha"
  ];
  
  return SHOT_ONLY_DRINKS.includes(coffee.id) || HYBRID_DRINKS.includes(coffee.id);
};

// Check if a coffee can have additional shots added (beyond 1)
export const canAddShots = (coffee: CoffeeItem): boolean => {
  // All shot-eligible drinks can have multiple shots
  return isShotEligible(coffee);
};

// Check if a coffee uses size-based automatic shot logic
export const usesSizeBasedShots = (coffee: CoffeeItem): boolean => {
  // Hybrid drinks use size-based automatic shot logic
  const HYBRID_DRINKS = [
    "caffe_americano", "latte", "cappuccino", "flat_white", "caramel_macchiato",
    "mocha", "blonde_latte", "iced_shaken_espresso", "iced_latte", "iced_mocha"
  ];
  
  return HYBRID_DRINKS.includes(coffee.id);
};
