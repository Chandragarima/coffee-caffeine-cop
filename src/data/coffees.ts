export type CoffeeCategory =
  | "brewed"
  | "espresso"
  | "milk"
  | "instant"
  | "cold"
  | "tea"
  | "specialty"
  | "energy"
  | "soda";

export type CoffeeItem = {
  id: string;
  name: string;
  category: CoffeeCategory;
  caffeineMg: number; // per serving
  description: string;
  tags?: ("low_caffeine" | "decaf")[];
  scalingType: "size_only" | "shots_only" | "both_size_shots" | "teaspoon" | "fixed_size";
  sizeOptions?: { size: string; oz: number; caffeine: number }[];
  shotOptions?: { shots: number; caffeine: number }[];
  teaspoonOptions?: { teaspoons: number; caffeine: number }[];
  sizeAndShotOptions?: { size: string; oz: number; defaultShots: number; baseCaffeine: number }[];
  defaultSize?: string;
  defaultShots?: number;
  defaultTeaspoons?: number;
};

// Coffee data with exact Starbucks values and scaling information
export const COFFEES: CoffeeItem[] = [
  // BREWED CATEGORY - Size-based scaling only
  { 
    id: "moka_pot", 
    name: "1-Cup Moka Pot", 
    category: "brewed", 
    caffeineMg: 110, 
    description: "Stovetop pressure-brewed coffee.", 
    scalingType: "fixed_size"
  },
  { 
    id: "starbucks_brewed_coffee", 
    name: "Starbucks Brewed Coffee", 
    category: "brewed", 
    caffeineMg: 155, 
    description: "Classic medium roast brewed coffee at Starbucks.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Short", oz: 8, caffeine: 155 },
      { size: "Tall", oz: 12, caffeine: 235 },
      { size: "Grande", oz: 16, caffeine: 315 },
      { size: "Venti", oz: 24, caffeine: 400 }
    ],
    defaultSize: "Short"
  },
  { 
    id: "brewed_coffee", 
    name: "Brewed Coffee", 
    category: "brewed", 
    caffeineMg: 95, 
    description: "Classic brewed coffee at home with the drip machine.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Short", oz: 8, caffeine: 95 },
      { size: "Tall", oz: 12, caffeine: 142 },
      { size: "Grande", oz: 16, caffeine: 190 },
      { size: "Venti", oz: 24, caffeine: 238 }
    ],
    defaultSize: "Short"
  },
  { 
    id: "caffe_americano", 
    name: "Caffè Americano", 
    category: "brewed", 
    caffeineMg: 75, 
    description: "Espresso shots diluted with hot water.", 
    scalingType: "both_size_shots",
    sizeOptions: [
      { size: "Short", oz: 8, caffeine: 75 },
      { size: "Tall", oz: 12, caffeine: 150 },
      { size: "Grande", oz: 16, caffeine: 225 },
      { size: "Venti", oz: 24, caffeine: 300 }
    ],
    shotOptions: [
      { shots: 1, caffeine: 75 },
      { shots: 2, caffeine: 150 },
      { shots: 3, caffeine: 225 },
      { shots: 4, caffeine: 300 }
    ],
    sizeAndShotOptions: [
      { size: "Short", oz: 8, defaultShots: 1, baseCaffeine: 75 },
      { size: "Tall", oz: 12, defaultShots: 2, baseCaffeine: 150 },
      { size: "Grande", oz: 16, defaultShots: 3, baseCaffeine: 225},
      { size: "Venti", oz: 24, defaultShots: 4, baseCaffeine: 300 }
    ],
    defaultSize: "Short",
    defaultShots: 1
  },
  { 
    id: "pour_over", 
    name: "Pour Over", 
    category: "brewed", 
    caffeineMg: 125, 
    description: "Hand-poured filter coffee.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Short", oz: 8, caffeine: 125 },
      { size: "Tall", oz: 12, caffeine: 187 },
      { size: "Grande", oz: 16, caffeine: 250 }
    ],
    defaultSize: "Short"
  },
  { 
    id: "french_press", 
    name: "French Press", 
    category: "brewed", 
    caffeineMg: 107, 
    description: "Full-bodied coffee steeped in hot water, then pressed.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Short", oz: 8, caffeine: 107 },
      { size: "Tall", oz: 12, caffeine: 160 },
      { size: "Grande", oz: 16, caffeine: 214 }
    ],
    defaultSize: "Short"
  },
  { 
    id: "decaf_drip_coffee", 
    name: "Decaf Drip", 
    category: "brewed", 
    caffeineMg: 3, 
    description: "Decaffeinated drip coffee.", 
    tags: ["decaf", "low_caffeine"],
    scalingType: "size_only",
    sizeOptions: [
      { size: "Short", oz: 8, caffeine: 3 },
      { size: "Tall", oz: 12, caffeine: 4.5 },
      { size: "Grande", oz: 16, caffeine: 6 }
    ],
    defaultSize: "Short"
  },

  // ESPRESSO CATEGORY - Shots-based scaling only
  { 
    id: "single_espresso", 
    name: "Espresso", 
    category: "espresso", 
    caffeineMg: 75, 
    description: "Single concentrated shot of coffee (1oz).", 
    scalingType: "shots_only",
    shotOptions: [
      { shots: 1, caffeine: 75 },
      { shots: 2, caffeine: 150 },
      { shots: 3, caffeine: 225 }
    ],
    defaultShots: 1
  },
  { 
    id: "affogato", 
    name: "Affogato", 
    category: "espresso", 
    caffeineMg: 75, 
    description: "Espresso shot over ice cream (3-4oz).", 
    scalingType: "shots_only",
    shotOptions: [
      { shots: 1, caffeine: 75 },
      { shots: 2, caffeine: 150 },
      { shots: 3, caffeine: 225 }
    ],
    defaultShots: 1
  },
  { 
    id: "ristretto", 
    name: "Ristretto Shot", 
    category: "espresso", 
    caffeineMg: 65, 
    description: "Short extraction espresso shot with concentrated flavor (1oz).", 
    scalingType: "shots_only",
    shotOptions: [
      { shots: 1, caffeine: 65 },
      { shots: 2, caffeine: 130 },
      { shots: 3, caffeine: 195 }
    ],
    defaultShots: 1
  },
  { 
    id: "decaf_espresso", 
    name: "Decaf Espresso", 
    category: "espresso", 
    caffeineMg: 3, 
    description: "Decaffeinated espresso shot (1oz).", 
    tags: ["decaf", "low_caffeine"],
    scalingType: "shots_only",
    shotOptions: [
      { shots: 1, caffeine: 3 },
      { shots: 2, caffeine: 6 },
      { shots: 3, caffeine: 9 }
    ],
    defaultShots: 1
  },

  // MILK-BASED CATEGORY - Both size and shots scaling
  { 
    id: "cappuccino", 
    name: "Cappuccino", 
    category: "milk", 
    caffeineMg: 75, 
    description: "Espresso shot-based scaling with steamed milk and foam.", 
    scalingType: "both_size_shots",
    sizeOptions: [
      { size: "Short", oz: 8, caffeine: 75 },
      { size: "Tall", oz: 12, caffeine: 75 },
      { size: "Grande", oz: 16, caffeine: 150 },
      { size: "Venti", oz: 20, caffeine: 150 }
    ],
    shotOptions: [
      { shots: 1, caffeine: 75 },
      { shots: 2, caffeine: 150 }
    ],
    sizeAndShotOptions: [
      { size: "Short", oz: 8, defaultShots: 1, baseCaffeine: 75 },
      { size: "Tall", oz: 12, defaultShots: 1, baseCaffeine: 75 },
      { size: "Grande", oz: 16, defaultShots: 2, baseCaffeine: 150 },
      { size: "Venti", oz: 20, defaultShots: 2, baseCaffeine: 150 }
    ],
    defaultSize: "Short",
    defaultShots: 1
  },
  { 
    id: "cafe_au_lait", 
    name: "Café au Lait", 
    category: "milk", 
    caffeineMg: 70, 
    description: "Espresso shot-based scaling with steamed milk.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Short", oz: 8, caffeine: 70 },
      { size: "Tall", oz: 12, caffeine: 110 },
      { size: "Grande", oz: 16, caffeine: 150 }
    ],
    defaultSize: "Short"
  },
  { 
    id: "cortado", 
    name: "Cortado", 
    category: "milk", 
    caffeineMg: 130, 
    description: "Double shot espresso with equal parts warm milk (4oz).", 
    scalingType: "fixed_size"
  },
  { 
    id: "starbucks_cortado", 
    name: "Starbucks Cortado", 
    category: "milk", 
    caffeineMg: 230, 
    description: "Triple ristretto shots espresso with equal parts warm milk (8oz).", 
    scalingType: "fixed_size"
  },
  { 
    id: "latte", 
    name: "Caffè Latte", 
    category: "milk", 
    caffeineMg: 75, 
    description: "Espresso shot-based scaling with steamed milk and light foam.", 
    scalingType: "both_size_shots",
    sizeOptions: [
      { size: "Short", oz: 8, caffeine: 75 },
      { size: "Tall", oz: 12, caffeine: 75 },
      { size: "Grande", oz: 16, caffeine: 150 },
      { size: "Venti", oz: 20, caffeine: 150 }
    ],
    shotOptions: [
      { shots: 1, caffeine: 75 },
      { shots: 2, caffeine: 150 }
    ],
    sizeAndShotOptions: [
      { size: "Short", oz: 8, defaultShots: 1, baseCaffeine: 75 },
      { size: "Tall", oz: 12, defaultShots: 1, baseCaffeine: 75 },
      { size: "Grande", oz: 16, defaultShots: 2, baseCaffeine: 150 },
      { size: "Venti", oz: 20, defaultShots: 2, baseCaffeine: 150 }
    ],
    defaultSize: "Short",
    defaultShots: 1
  },
  { 
    id: "blonde_latte", 
    name: "Blonde Latte", 
    category: "milk", 
    caffeineMg: 85, 
    description: "Blonde espresso shot-based scaling with steamed milk.", 
    scalingType: "both_size_shots",
    sizeOptions: [
      { size: "Short", oz: 8, caffeine: 85 },
      { size: "Tall", oz: 12, caffeine: 85 },
      { size: "Grande", oz: 16, caffeine: 170 },
      { size: "Venti", oz: 20, caffeine: 170 }
    ],
    shotOptions: [
      { shots: 1, caffeine: 85 },
      { shots: 2, caffeine: 170 }
    ],
    sizeAndShotOptions: [
      { size: "Short", oz: 8, defaultShots: 1, baseCaffeine: 85 },
      { size: "Tall", oz: 12, defaultShots: 1, baseCaffeine: 85 },
      { size: "Grande", oz: 16, defaultShots: 2, baseCaffeine: 170},
      { size: "Venti", oz: 20, defaultShots: 2, baseCaffeine: 170 }
    ],
    defaultSize: "Short",
    defaultShots: 1
  },
  { 
    id: "caramel_macchiato", 
    name: "Caramel Macchiato", 
    category: "milk", 
    caffeineMg: 75, 
    description: "Espresso shot-based scaling with steamed milk, vanilla, and caramel drizzle.", 
    scalingType: "both_size_shots",
    sizeOptions: [
      { size: "Short", oz: 8, caffeine: 75 },
      { size: "Tall", oz: 12, caffeine: 75 },
      { size: "Grande", oz: 16, caffeine: 150 },
      { size: "Venti", oz: 20, caffeine: 150 }
    ],
    shotOptions: [
      { shots: 1, caffeine: 75 },
      { shots: 2, caffeine: 150 }
    ],
    sizeAndShotOptions: [
      { size: "Short", oz: 8, defaultShots: 1, baseCaffeine: 75 },
      { size: "Tall", oz: 12, defaultShots: 1, baseCaffeine: 75 },
      { size: "Grande", oz: 16, defaultShots: 2, baseCaffeine: 150},
      { size: "Venti", oz: 20, defaultShots: 2, baseCaffeine: 150 }
    ],
    defaultSize: "Short",
    defaultShots: 1
  },
  { 
    id: "mocha", 
    name: "Caffè Mocha", 
    category: "milk", 
    caffeineMg: 95, 
    description: "Single shot espresso with chocolate and steamed milk.", 
    scalingType: "both_size_shots",
    sizeOptions: [
      { size: "Short", oz: 8, caffeine: 95 },
      { size: "Tall", oz: 12, caffeine: 95 },
      { size: "Grande", oz: 16, caffeine: 175 },
      { size: "Venti", oz: 20, caffeine: 185 }
    ],
    shotOptions: [
      { shots: 1, caffeine: 95 },
      { shots: 2, caffeine: 175 }
    ],
    sizeAndShotOptions: [
      { size: "Short", oz: 8, defaultShots: 1, baseCaffeine: 95 },
      { size: "Tall", oz: 12, defaultShots: 1, baseCaffeine: 95 },
      { size: "Grande", oz: 16, defaultShots: 2, baseCaffeine: 175},
      { size: "Venti", oz: 20, defaultShots: 2, baseCaffeine: 185 }
    ],
    defaultSize: "Short",
    defaultShots: 1
  },
  { 
    id: "flat_white", 
    name: "Flat White", 
    category: "milk", 
    caffeineMg: 130, 
    description: "Ristretto shot-based scaling with velvety microfoam.", 
    scalingType: "both_size_shots",
    sizeOptions: [
      { size: "Short", oz: 8, caffeine: 130 },
      { size: "Tall", oz: 12, caffeine: 130 },
      { size: "Grande", oz: 16, caffeine: 195 },
      { size: "Venti", oz: 20, caffeine: 195 }
    ],
    shotOptions: [
      { shots: 2, caffeine: 130 },
      { shots: 3, caffeine: 195 }
    ],
    sizeAndShotOptions: [
      { size: "Short", oz: 8, defaultShots: 2, baseCaffeine: 130 },
      { size: "Tall", oz: 12, defaultShots: 2, baseCaffeine: 130 },
      { size: "Grande", oz: 16, defaultShots: 3, baseCaffeine: 195},
      { size: "Venti", oz: 20, defaultShots: 3, baseCaffeine: 195 }
    ],
    defaultSize: "Short",
    defaultShots: 2
  },
  { 
    id: "decaf_latte", 
    name: "Decaf Latte", 
    category: "milk", 
    caffeineMg: 5, 
    description: "Latte made with decaf espresso.", 
    tags: ["decaf", "low_caffeine"],
    scalingType: "both_size_shots",
    sizeOptions: [
      { size: "Short", oz: 8, caffeine: 5 },
      { size: "Tall", oz: 12, caffeine: 5 },
      { size: "Grande", oz: 16, caffeine: 10 },
      { size: "Venti", oz: 20, caffeine: 10 }
    ],
    shotOptions: [
      { shots: 1, caffeine: 5 },
      { shots: 2, caffeine: 10 }
    ],
    sizeAndShotOptions: [
      { size: "Short", oz: 8, defaultShots: 1, baseCaffeine: 5 },
      { size: "Tall", oz: 12, defaultShots: 1, baseCaffeine: 5 },
      { size: "Grande", oz: 16, defaultShots: 2, baseCaffeine: 10},
      { size: "Venti", oz: 20, defaultShots: 2, baseCaffeine: 10 }
    ],
    defaultSize: "Short",
    defaultShots: 1
  },

  // INSTANT COFFEE CATEGORY - Teaspoon-based scaling
  { 
    id: "nescafe_instant", 
    name: "Nescafé Gold", 
    category: "instant", 
    caffeineMg: 50, 
    description: "Classic instant coffee, teaspoon-based.", 
    scalingType: "teaspoon",
    teaspoonOptions: [
      { teaspoons: 1, caffeine: 50 },
      { teaspoons: 2, caffeine: 100 },
      { teaspoons: 3, caffeine: 150 }
    ],
    defaultTeaspoons: 1
  },
  { 
    id: "bru_instant", 
    name: "Bru Instant", 
    category: "instant", 
    caffeineMg: 60, 
    description: "Popular Indian instant coffee, teaspoon-based.", 
    scalingType: "teaspoon",
    teaspoonOptions: [
      { teaspoons: 1, caffeine: 60 },
      { teaspoons: 2, caffeine: 120 },
      { teaspoons: 3, caffeine: 180 }
    ],
    defaultTeaspoons: 1
  },
  { 
    id: "folgers_instant", 
    name: "Folgers", 
    category: "instant", 
    caffeineMg: 72, 
    description: "American instant coffee, teaspoon-based.", 
    scalingType: "teaspoon",
    teaspoonOptions: [
      { teaspoons: 1, caffeine: 72 },
      { teaspoons: 2, caffeine: 144 },
      { teaspoons: 3, caffeine: 216 }
    ],
    defaultTeaspoons: 1
  },
  { 
    id: "maxwell_house_instant", 
    name: "Maxwell House", 
    category: "instant", 
    caffeineMg: 61, 
    description: "Classic American instant coffee, teaspoon-based.", 
    scalingType: "teaspoon",
    teaspoonOptions: [
      { teaspoons: 1, caffeine: 61 },
      { teaspoons: 2, caffeine: 122 },
      { teaspoons: 3, caffeine: 183 }
    ],
    defaultTeaspoons: 1
  },

  // ICED CATEGORY - Size-based scaling
  { 
    id: "iced_coffee", 
    name: "Iced Coffee", 
    category: "cold", 
    caffeineMg: 135, 
    description: "Brewed coffee served over ice.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 135 },
      { size: "Grande", oz: 16, caffeine: 185 },
      { size: "Venti", oz: 24, caffeine: 265 }
    ],
    defaultSize: "Tall"
  },
  { 
    id: "cold_brew", 
    name: "Cold Brew", 
    category: "cold", 
    caffeineMg: 155, 
    description: "Slow-steeped, super smooth cold coffee.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 155 },
      { size: "Grande", oz: 16, caffeine: 205 },
      { size: "Venti", oz: 24, caffeine: 310 }
    ],
    defaultSize: "Tall"
  },
  { 
    id: "nitro_cold_brew", 
    name: "Nitro Cold Brew", 
    category: "cold", 
    caffeineMg: 215, 
    description: "Cold brew infused with nitrogen for creamy texture.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 215 },
      { size: "Grande", oz: 16, caffeine: 280 }
    ],
    defaultSize: "Tall"
  },
  { 
    id: "iced_shaken_espresso", 
    name: "Iced Shaken Espresso", 
    category: "cold", 
    caffeineMg: 150, 
    description: "Espresso shots shaken with ice and milk.", 
    scalingType: "both_size_shots",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 150 },
      { size: "Grande", oz: 16, caffeine: 225 },
      { size: "Venti", oz: 24, caffeine: 300 }
    ],
    shotOptions: [
      { shots: 2, caffeine: 150 },
      { shots: 3, caffeine: 225 },
      { shots: 4, caffeine: 300 }
    ],
    sizeAndShotOptions: [
      { size: "Tall", oz: 12, defaultShots: 2, baseCaffeine: 150 },
      { size: "Grande", oz: 16, defaultShots: 3, baseCaffeine: 225 },
      { size: "Venti", oz: 24, defaultShots: 4, baseCaffeine: 300 }
    ],
    defaultSize: "Tall",
    defaultShots: 2
  },
  { 
    id: "iced_latte", 
    name: "Iced Caffè Latte", 
    category: "cold", 
    caffeineMg: 75, 
    description: "Espresso shots with cold milk over ice.", 
    scalingType: "both_size_shots",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 75 },
      { size: "Grande", oz: 16, caffeine: 150 },
      { size: "Venti", oz: 24, caffeine: 225 }
    ],
    shotOptions: [
      { shots: 1, caffeine: 75 },
      { shots: 2, caffeine: 150 },
      { shots: 3, caffeine: 225 }
    ],
    sizeAndShotOptions: [
      { size: "Tall", oz: 12, defaultShots: 1, baseCaffeine: 75 },
      { size: "Grande", oz: 16, defaultShots: 2, baseCaffeine: 150},
      { size: "Venti", oz: 20, defaultShots: 3, baseCaffeine: 225 }
    ],
    defaultSize: "Tall",
    defaultShots: 1
  },
  { 
    id: "iced_mocha", 
    name: "Iced Caffè Mocha", 
    category: "cold", 
    caffeineMg: 95, 
    description: "Espresso shots with chocolate and cold milk over ice.", 
    scalingType: "both_size_shots",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 95 },
      { size: "Grande", oz: 16, caffeine: 175 },
      { size: "Venti", oz: 24, caffeine: 265 }
    ],
    shotOptions: [
      { shots: 1, caffeine: 95 },
      { shots: 2, caffeine: 175 },
      { shots: 3, caffeine: 265 }
    ],
    sizeAndShotOptions: [
      { size: "Tall", oz: 12, defaultShots: 1, baseCaffeine: 95 },
      { size: "Grande", oz: 16, defaultShots: 2, baseCaffeine: 175},
      { size: "Venti", oz: 20, defaultShots: 3, baseCaffeine: 265 }
    ],
    defaultSize: "Tall",
    defaultShots: 1
  },
  { 
    id: "iced_americano", 
    name: "Iced Americano", 
    category: "cold", 
    caffeineMg: 150, 
    description: "Espresso shots with cold water over ice.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 150 },
      { size: "Grande", oz: 16, caffeine: 225 },
      { size: "Venti", oz: 24, caffeine: 300 }
    ],
    defaultSize: "Tall"
  },
  { 
    id: "iced_black_tea", 
    name: "Iced Black Tea", 
    category: "cold", 
    caffeineMg: 20, 
    description: "Chilled black tea served over ice.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 20 },
      { size: "Grande", oz: 16, caffeine: 25 },
      { size: "Venti", oz: 24, caffeine: 40 }
    ],
    defaultSize: "Tall"
  },
  { 
    id: "iced_green_tea", 
    name: "Iced Green Tea", 
    category: "cold", 
    caffeineMg: 20, 
    description: "Chilled green tea served over ice.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 20 },
      { size: "Grande", oz: 16, caffeine: 25 },
      { size: "Venti", oz: 24, caffeine: 40 }
    ],
    defaultSize: "Tall"
  },
  { 
    id: "iced_chai_latte", 
    name: "Iced Chai Tea Latte", 
    category: "cold", 
    caffeineMg: 70, 
    description: "Spiced black tea blended with cold milk over ice.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 70 },
      { size: "Grande", oz: 16, caffeine: 95 },
      { size: "Venti", oz: 24, caffeine: 145 }
    ],
    defaultSize: "Tall"
  },
  { 
    id: "iced_matcha_latte", 
    name: "Iced Matcha Tea Latte", 
    category: "cold", 
    caffeineMg: 55, 
    description: "Stone-ground green tea whisked with cold milk over ice.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 55 },
      { size: "Grande", oz: 16, caffeine: 80 },
      { size: "Venti", oz: 24, caffeine: 110 }
    ],
    defaultSize: "Tall"
  },

  // TEA CATEGORY - Size-based scaling
  { 
    id: "black_tea", 
    name: "Black Tea", 
    category: "tea", 
    caffeineMg: 40, 
    description: "Bold and robust with a strong finish.", 
    tags: ["low_caffeine"],
    scalingType: "size_only",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 40 },
      { size: "Grande", oz: 16, caffeine: 40 },
      { size: "Venti", oz: 20, caffeine: 40 }
    ],
    defaultSize: "Tall"
  },
  { 
    id: "earl_grey", 
    name: "Earl Grey Tea", 
    category: "tea", 
    caffeineMg: 40, 
    description: "Black tea infused with citrusy bergamot.", 
    tags: ["low_caffeine"],
    scalingType: "size_only",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 40 },
      { size: "Grande", oz: 16, caffeine: 40 },
      { size: "Venti", oz: 20, caffeine: 40 }
    ],
    defaultSize: "Tall"
  },
  { 
    id: "green_tea", 
    name: "Green Tea", 
    category: "tea", 
    caffeineMg: 16, 
    description: "Light and grassy with gentle caffeine.", 
    tags: ["low_caffeine"],
    scalingType: "size_only",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 16 },
      { size: "Grande", oz: 16, caffeine: 16 },
      { size: "Venti", oz: 20, caffeine: 16 }
    ],
    defaultSize: "Tall"
  },
  { 
    id: "masala_chai", 
    name: "Indian Masala Tea", 
    category: "tea", 
    caffeineMg: 40, 
    description: "Spiced black tea with aromatic spices.", 
    tags: ["low_caffeine"],
    scalingType: "size_only",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 40 },
      { size: "Grande", oz: 16, caffeine: 40 },
      { size: "Venti", oz: 20, caffeine: 40 }
    ],
    defaultSize: "Tall"
  },
  { 
    id: "herbal_tea", 
    name: "Herbal Tea", 
    category: "tea", 
    caffeineMg: 0, 
    description: "Caffeine-free herbal infusion.", 
    tags: ["decaf", "low_caffeine"],
    scalingType: "size_only",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 0 },
      { size: "Grande", oz: 16, caffeine: 0 },
      { size: "Venti", oz: 20, caffeine: 0 }
    ],
    defaultSize: "Tall"
  },
  { 
    id: "chai_latte", 
    name: "Chai Latte", 
    category: "tea", 
    caffeineMg: 50, 
    description: "Spiced black tea blended with steamed milk.", 
    tags: ["low_caffeine"],
    scalingType: "size_only",
    sizeOptions: [
      { size: "Short", oz: 8, caffeine: 50 },
      { size: "Tall", oz: 12, caffeine: 70 },
      { size: "Grande", oz: 16, caffeine: 95 },
      { size: "Venti", oz: 20, caffeine: 120 }
    ],
    defaultSize: "Short"
  },
  { 
    id: "matcha_latte", 
    name: "Matcha Tea Latte", 
    category: "tea", 
    caffeineMg: 20, 
    description: "Stone-ground green tea whisked with milk.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Short", oz: 8, caffeine: 20 },
      { size: "Tall", oz: 12, caffeine: 45 },
      { size: "Grande", oz: 16, caffeine: 65 },
      { size: "Venti", oz: 20, caffeine: 85 }
    ],
    defaultSize: "Short"
  },
  { 
    id: "chamomile_tea", 
    name: "Chamomile Tea", 
    category: "tea", 
    caffeineMg: 0, 
    description: "Calming chamomile infusion.", 
    tags: ["low_caffeine"],
    scalingType: "size_only",
    sizeOptions: [
      { size: "Short", oz: 8, caffeine: 0 },
      { size: "Tall", oz: 12, caffeine: 0 },
      { size: "Grande", oz: 16, caffeine: 0 },
      { size: "Venti", oz: 20, caffeine: 0 }
    ],
    defaultSize: "Short"
  },

  // SPECIALTY CATEGORY - Fixed sizes and size-based scaling
  { 
    id: "turkish_coffee", 
    name: "Turkish Coffee", 
    category: "specialty", 
    caffeineMg: 60, 
    description: "Unfiltered coffee simmered in a cezve.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Small", oz: 2, caffeine: 60 },
      { size: "Medium", oz: 4, caffeine: 120 },
      { size: "Large", oz: 8, caffeine: 240 }
    ],
    defaultSize: "Small"
  },
  { 
    id: "vietnamese_coffee", 
    name: "Vietnamese Coffee", 
    category: "specialty", 
    caffeineMg: 100, 
    description: "Strong dark roast coffee with sweetened condensed milk.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Small", oz: 2, caffeine: 100 },
      { size: "Medium", oz: 4, caffeine: 200 },
      { size: "Large", oz: 8, caffeine: 400 }
    ],
    defaultSize: "Small"
  },
  { 
    id: "coffee_frappuccino", 
    name: "Coffee Frappuccino", 
    category: "specialty", 
    caffeineMg: 65, 
    description: "Blended iced coffee sweetened with flavored syrup.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 65 },
      { size: "Grande", oz: 16, caffeine: 95 },
      { size: "Venti", oz: 24, caffeine: 125 }
    ],
    defaultSize: "Tall"
  },
  { 
    id: "mocha_frappuccino", 
    name: "Mocha Frappuccino", 
    category: "specialty", 
    caffeineMg: 70, 
    description: "Blended iced coffee with chocolate and flavored syrup.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 70 },
      { size: "Grande", oz: 16, caffeine: 100 },
      { size: "Venti", oz: 24, caffeine: 130 }
    ],
    defaultSize: "Tall"
  },
  { 
    id: "caramel_frappuccino", 
    name: "Caramel Frappuccino", 
    category: "specialty", 
    caffeineMg: 65, 
    description: "Blended iced coffee with caramel and flavored syrup.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 65 },
      { size: "Grande", oz: 16, caffeine: 90 },
      { size: "Venti", oz: 24, caffeine: 120 }
    ],
    defaultSize: "Tall"
  },
  { 
    id: "espresso_frappuccino", 
    name: "Espresso Frappuccino", 
    category: "specialty", 
    caffeineMg: 130, 
    description: "Blended iced coffee with extra espresso shots.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 130 },
      { size: "Grande", oz: 16, caffeine: 155 },
      { size: "Venti", oz: 24, caffeine: 185 }
    ],
    defaultSize: "Tall"
  },
  { 
    id: "matcha_creme_frappuccino", 
    name: "Matcha Crème Frappuccino", 
    category: "specialty", 
    caffeineMg: 40, 
    description: "Blended iced matcha with cream and flavored syrup.", 
    scalingType: "size_only",
    sizeOptions: [
      { size: "Tall", oz: 12, caffeine: 40 },
      { size: "Grande", oz: 16, caffeine: 65 },
      { size: "Venti", oz: 24, caffeine: 85 }
    ],
    defaultSize: "Tall"
  },

  // Energy Drinks category (fixed sizes, no scaling)
  { id: "red_bull", name: "Red Bull", category: "energy", caffeineMg: 80, description: "Classic energy drink, 8.4 fl oz can.", scalingType: "fixed_size" },
  { id: "monster_energy", name: "Monster Energy", category: "energy", caffeineMg: 160, description: "High-caffeine energy drink, 16 fl oz can.", scalingType: "fixed_size" },
  { id: "rockstar", name: "Rockstar", category: "energy", caffeineMg: 160, description: "Performance energy drink, 16 fl oz can.", scalingType: "fixed_size" },
  { id: "five_hour_energy", name: "5-Hour Energy", category: "energy", caffeineMg: 200, description: "Concentrated energy shot, 1.93 fl oz bottle.", scalingType: "fixed_size" },
  { id: "bang_energy", name: "Bang Energy", category: "energy", caffeineMg: 300, description: "Super creatine energy drink, 16 fl oz can.", scalingType: "fixed_size" },
  { id: "celsius", name: "Celsius", category: "energy", caffeineMg: 200, description: "Fitness energy drink, 12 fl oz can.", scalingType: "fixed_size" },
  { id: "prime", name: "Prime", category: "energy", caffeineMg: 200, description: "Fitness energy drink, 12 fl oz can.", scalingType: "fixed_size" },
 
  // Soda category (fixed sizes, no scaling)
  { id: "coke", name: "Coca-Cola", category: "soda", caffeineMg: 34, description: "Classic cola, 12 fl oz can.", tags: ["low_caffeine"], scalingType: "fixed_size" },
  { id: "coke_zero", name: "Coke Zero", category: "soda", caffeineMg: 34, description: "Cola Cola zero sugar beverage, 12 fl oz can.", tags: ["low_caffeine"], scalingType: "fixed_size" },
  { id: "pepsi", name: "Pepsi", category: "soda", caffeineMg: 38, description: "Cola beverage, 12 fl oz can.", tags: ["low_caffeine"], scalingType: "fixed_size" },
  { id: "dr_pepper", name: "Dr Pepper", category: "soda", caffeineMg: 41, description: "Unique blend of 23 flavors, 12 fl oz can.", tags: ["low_caffeine"], scalingType: "fixed_size" },
  { id: "mountain_dew", name: "Mountain Dew", category: "soda", caffeineMg: 54, description: "Citrus soda with caffeine, 12 fl oz can.", tags: ["low_caffeine"], scalingType: "fixed_size" },
  { id: "cherry_coke", name: "Cherry Coke", category: "soda", caffeineMg: 34, description: "Cherry-flavored cola, 12 fl oz can.", tags: ["low_caffeine"], scalingType: "fixed_size" },
  { id: "sprite", name: "Sprite", category: "soda", caffeineMg: 0, description: "Caffeine-free lemon-lime soda, 12 fl oz can.", tags: ["low_caffeine"], scalingType: "fixed_size" },
  { id: "root_beer", name: "Root Beer", category: "soda", caffeineMg: 0, description: "Traditional root beer, 12 fl oz can.", tags: ["low_caffeine"], scalingType: "fixed_size" },
  { id: "orange_soda", name: "Orange Soda", category: "soda", caffeineMg: 0, description: "Orange-flavored soda, 12 fl oz can.", tags: ["low_caffeine"], scalingType: "fixed_size" },
];

export const HALF_LIFE_HOURS = 5; // default half-life

export const byCategory = (category: CoffeeCategory) =>
  COFFEES.filter((c) => c.category === category);
