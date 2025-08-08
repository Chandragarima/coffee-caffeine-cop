export type CoffeeCategory =
  | "espresso"
  | "milk"
  | "water"
  | "tea"
  | "cold"
  | "specialty";

export type CoffeeItem = {
  id: string;
  name: string;
  category: CoffeeCategory;
  caffeineMg: number; // per serving
  description: string;
  tags?: ("low_caffeine" | "decaf")[];
};

// Deduplicated list across categories, primary component decides category
export const COFFEES: CoffeeItem[] = [
  // Espresso category (espresso-based)
  { id: "espresso", name: "Espresso Shot", category: "espresso", caffeineMg: 63, description: "A concentrated 1 oz shot of coffee.", },
  { id: "americano", name: "Americano", category: "espresso", caffeineMg: 63, description: "Espresso diluted with hot water.", },
  { id: "macchiato", name: "Macchiato", category: "espresso", caffeineMg: 75, description: "Espresso with a dollop of foam.", },
  { id: "cortado", name: "Cortado", category: "espresso", caffeineMg: 80, description: "Equal parts espresso and warm milk.", },
  { id: "shaken_espresso", name: "Shaken Espresso", category: "espresso", caffeineMg: 126, description: "Double espresso shaken with ice.", },
  { id: "ristretto", name: "Ristretto", category: "espresso", caffeineMg: 55, description: "Shorter pull for a sweeter, syrupy shot.", },
  { id: "lungo", name: "Lungo", category: "espresso", caffeineMg: 80, description: "Longer pull for a larger, milder shot.", },

  // Milk category (contains milk)
  { id: "latte", name: "Latte", category: "milk", caffeineMg: 80, description: "Espresso with steamed milk and light foam.", },
  { id: "cappuccino", name: "Cappuccino", category: "milk", caffeineMg: 80, description: "Espresso with equal parts steamed milk and foam.", },
  { id: "flat_white", name: "Flat White", category: "milk", caffeineMg: 130, description: "Double espresso with velvety microfoam.", },
  { id: "mocha", name: "Mocha", category: "milk", caffeineMg: 90, description: "Latte with chocolate.", },
  { id: "caramel_macchiato", name: "Caramel Macchiato", category: "milk", caffeineMg: 150, description: "Milk-forward drink with vanilla and caramel.", },
  { id: "chai_latte", name: "Chai Latte", category: "milk", caffeineMg: 50, description: "Spiced black tea with milk.", tags: ["low_caffeine"] },
  { id: "matcha_latte", name: "Matcha Latte", category: "milk", caffeineMg: 70, description: "Stone-ground green tea with milk.", },
  { id: "milk_tea", name: "Milk Tea", category: "milk", caffeineMg: 45, description: "Black tea blended with milk.", tags: ["low_caffeine"] },
  { id: "decaf_latte", name: "Decaf Latte", category: "milk", caffeineMg: 5, description: "Latte with decaf espresso.", tags: ["decaf", "low_caffeine"] },

  // Water category (brewed with water only)
  { id: "drip_coffee", name: "Drip Coffee", category: "water", caffeineMg: 95, description: "Classic filtered coffee.", },
  { id: "pour_over", name: "Pour Over", category: "water", caffeineMg: 100, description: "Hand-poured filter coffee.", },
  { id: "french_press", name: "French Press", category: "water", caffeineMg: 110, description: "Full-bodied immersion brew.", },
  { id: "black_coffee", name: "Black Coffee", category: "water", caffeineMg: 95, description: "No milk, no sugar, just coffee.", },

  // Tea category
  { id: "green_tea", name: "Green Tea", category: "tea", caffeineMg: 30, description: "Light and grassy.", tags: ["low_caffeine"] },
  { id: "black_tea", name: "Black Tea", category: "tea", caffeineMg: 47, description: "Bold and robust.", },
  { id: "earl_grey", name: "Earl Grey", category: "tea", caffeineMg: 40, description: "Black tea with bergamot.", tags: ["low_caffeine"] },
  { id: "oolong_tea", name: "Oolong Tea", category: "tea", caffeineMg: 38, description: "Semi-oxidized tea with floral notes.", tags: ["low_caffeine"] },

  // Cold category
  { id: "cold_brew", name: "Cold Brew", category: "cold", caffeineMg: 200, description: "Slow-steeped, super smooth.", },
  { id: "iced_coffee", name: "Iced Coffee", category: "cold", caffeineMg: 120, description: "Chilled brewed coffee over ice.", },
  { id: "nitro_cold_brew", name: "Nitro Cold Brew", category: "cold", caffeineMg: 230, description: "Cold brew infused with nitrogen.", },
  { id: "frappuccino", name: "Frappuccino", category: "cold", caffeineMg: 95, description: "Blended icy treat.", },

  // Specialty category (methods/signature drinks not above)
  { id: "turkish_coffee", name: "Turkish Coffee", category: "specialty", caffeineMg: 120, description: "Unfiltered coffee simmered in a cezve.", },
  { id: "moka_pot", name: "Moka Pot", category: "specialty", caffeineMg: 100, description: "Stovetop pressure-brewed coffee.", },
  { id: "siphon", name: "Siphon Coffee", category: "specialty", caffeineMg: 120, description: "Vacuum brewing with theatrical flair.", },
  { id: "affogato", name: "Affogato", category: "specialty", caffeineMg: 63, description: "Espresso over ice cream. Dessert meets coffee!", },

  // Low caffeine/decaf options as items
  { id: "decaf_coffee", name: "Decaf Coffee", category: "water", caffeineMg: 5, description: "Brewed decaf coffee.", tags: ["decaf", "low_caffeine"] },
];

export const HALF_LIFE_HOURS = 5; // default half-life

export const byCategory = (category: CoffeeCategory) =>
  COFFEES.filter((c) => c.category === category);
