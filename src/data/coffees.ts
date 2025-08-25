export type CoffeeCategory =
  | "brewed"
  | "espresso"
  | "milk"
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
};

// Coffee data organized by new category structure with exact values from specifications
export const COFFEES: CoffeeItem[] = [
  // BREWED CATEGORY - Drip & Manual Brew Methods
  { id: "moka_pot", name: "1-Cup Moka Pot", category: "brewed", caffeineMg: 105, description: "Stovetop pressure-brewed coffee (2oz).", },
  { id: "brewed_coffee", name: "Brewed Coffee", category: "brewed", caffeineMg: 155, description: "Classic brewed coffee with size-based scaling (8oz base).", },
  { id: "caffe_americano", name: "Caffè Americano", category: "brewed", caffeineMg: 75, description: "Espresso shots diluted with hot water, shot-based scaling (8oz base).", },
  { id: "pour_over", name: "Pour Over", category: "brewed", caffeineMg: 85, description: "Hand-poured filter coffee (8oz).", },
  { id: "french_press", name: "French Press", category: "brewed", caffeineMg: 107, description: "Full-bodied coffee steeped in hot water, then pressed (8oz).", },
  { id: "decaf_drip_coffee", name: "Decaf Drip", category: "brewed", caffeineMg: 5, description: "Decaffeinated drip coffee (8oz).", tags: ["decaf", "low_caffeine"] },

  // ESPRESSO-BASED CATEGORY - Fixed Small-Size Espresso Drinks
  { id: "espresso_machine_home", name: " 1 Espresso Pod", category: "espresso", caffeineMg: 65, description: "Single shot from home espresso machine (1oz).", },
  { id: "single_espresso", name: "Single Espresso", category: "espresso", caffeineMg: 75, description: "Single concentrated shot of coffee (1oz).", },
  { id: "double_espresso", name: "Double Espresso", category: "espresso", caffeineMg: 150, description: "Double concentrated shot of coffee (2oz).", },
  { id: "ristretto", name: "Ristretto", category: "espresso", caffeineMg: 65, description: "Short extraction espresso shot with concentrated flavor (1oz).", },
  { id: "affogato", name: "Affogato", category: "espresso", caffeineMg: 75, description: "Espresso shot over ice cream (3-4oz).", },
  { id: "flat_white", name: "Flat White", category: "espresso", caffeineMg: 130, description: "Ristretto shot-based scaling with velvety microfoam (8oz base).", },
  { id: "decaf_espresso", name: "Decaf Espresso", category: "espresso", caffeineMg: 3, description: "Decaffeinated espresso shot (1oz).", tags: ["decaf", "low_caffeine"] },

  // MILK-BASED CATEGORY - Milk-Based Espresso Drinks
  { id: "cappuccino", name: "Cappuccino", category: "milk", caffeineMg: 75, description: "Espresso shot-based scaling with steamed milk and foam (8oz base).", },
  { id: "cafe_au_lait", name: "Café au Lait", category: "milk", caffeineMg: 75, description: "Espresso shot-based scaling with steamed milk (8oz base).", },
  { id: "cortado", name: "Cortado", category: "milk", caffeineMg: 150, description: "Double shot espresso with equal parts warm milk (4oz).", },
  { id: "latte", name: "Caffè Latte", category: "milk", caffeineMg: 75, description: "Espresso shot-based scaling with steamed milk and light foam (8oz base).", },
  { id: "blonde_latte", name: "Blonde Latte", category: "milk", caffeineMg: 85, description: "Blonde espresso shot-based scaling with steamed milk (8oz base).", },
  { id: "caramel_macchiato", name: "Caramel Macchiato", category: "milk", caffeineMg: 75, description: "Espresso shot-based scaling with steamed milk, vanilla, and caramel drizzle (8oz base).", },
  { id: "mocha", name: "Mocha", category: "milk", caffeineMg: 95, description: "Single shot espresso with chocolate and steamed milk.", },
  { id: "shaken_espresso", name: "Shaken Espresso", category: "milk", caffeineMg: 150, description: "Double shot espresso shaken with ice and milk (12oz).", },
  { id: "decaf_latte", name: "Decaf Latte", category: "milk", caffeineMg: 5, description: "Latte made with decaf espresso.", tags: ["decaf", "low_caffeine"] },

  // ICED CATEGORY - Iced & Cold Brewed Coffee
  { id: "iced_coffee", name: "Iced Coffee", category: "cold", caffeineMg: 120, description: "Brewed coffee served over ice (12oz base).", },
  { id: "cold_brew", name: "Cold Brew", category: "cold", caffeineMg: 155, description: "Slow-steeped, super smooth cold coffee (12oz base).", },
  { id: "nitro_cold_brew", name: "Nitro Cold Brew", category: "cold", caffeineMg: 215, description: "Cold brew infused with nitrogen for creamy texture (12oz base).", },
  { id: "iced_shaken_espresso", name: "Iced Shaken Espresso", category: "cold", caffeineMg: 150, description: "Espresso shots shaken with ice and milk (12oz base).", },
  { id: "iced_latte", name: "Iced Latte", category: "cold", caffeineMg: 75, description: "Espresso shots with cold milk over ice (12oz base).", },
  { id: "iced_mocha", name: "Iced Mocha", category: "cold", caffeineMg: 95, description: "Espresso shots with chocolate and cold milk over ice (12oz base).", },
  { id: "iced_americano", name: "Iced Americano", category: "cold", caffeineMg: 150, description: "Espresso shots with cold water over ice (12oz base).", },
  { id: "iced_black_tea", name: "Iced Black Tea", category: "cold", caffeineMg: 20, description: "Chilled black tea served over ice (12oz base).", },
  { id: "iced_green_tea", name: "Iced Green Tea", category: "cold", caffeineMg: 20, description: "Chilled green tea served over ice (12oz base).", },
  { id: "iced_chai_latte", name: "Iced Chai Latte", category: "cold", caffeineMg: 70, description: "Spiced black tea blended with cold milk over ice (12oz base).", },
  { id: "iced_matcha_latte", name: "Iced Matcha Latte", category: "cold", caffeineMg: 55, description: "Stone-ground green tea whisked with cold milk over ice (12oz base).", },

  // TEA CATEGORY - Tea & Tea-Based Drinks
  { id: "black_tea", name: "Black Tea", category: "tea", caffeineMg: 40, description: "Bold and robust with a strong finish (12oz base).", tags: ["low_caffeine"] },
  { id: "earl_grey", name: "Earl Grey Tea", category: "tea", caffeineMg: 40, description: "Black tea infused with citrusy bergamot (12oz base).", tags: ["low_caffeine"] },
  { id: "green_tea", name: "Green Tea", category: "tea", caffeineMg: 16, description: "Light and grassy with gentle caffeine (12oz base).", tags: ["low_caffeine"] },
  { id: "masala_chai", name: "Indian Masala Tea", category: "tea", caffeineMg: 40, description: "Spiced black tea with aromatic spices (12oz base).", tags: ["low_caffeine"] },
  { id: "herbal_tea", name: "Herbal Tea", category: "tea", caffeineMg: 0, description: "Caffeine-free herbal infusion (12oz base).", tags: ["decaf", "low_caffeine"] },
  { id: "chai_latte", name: "Chai Latte", category: "tea", caffeineMg: 50, description: "Spiced black tea blended with steamed milk (8oz base).", tags: ["low_caffeine"] },
  { id: "matcha_latte", name: "Matcha Tea", category: "tea", caffeineMg: 20, description: "Stone-ground green tea whisked with milk (8oz base).", },
  { id: "chamomile_tea", name: "Chamomile Tea", category: "tea", caffeineMg: 16, description: "Calming chamomile infusion (8oz base).", tags: ["low_caffeine"] },

  // SPECIALTY CATEGORY - Specialty & International
  { id: "turkish_coffee", name: "Turkish Coffee", category: "specialty", caffeineMg: 50, description: "Unfiltered coffee simmered in a cezve (2-5oz).", },
  { id: "vietnamese_coffee", name: "Vietnamese Coffee", category: "specialty", caffeineMg: 150, description: "Strong dark roast coffee with sweetened condensed milk (8oz).", },
  { id: "coffee_frappuccino", name: "Coffee Frappuccino", category: "specialty", caffeineMg: 65, description: "Blended iced coffee sweetened with flavored syrup (12oz base).", },
  { id: "mocha_frappuccino", name: "Mocha Frappuccino", category: "specialty", caffeineMg: 70, description: "Blended iced coffee with chocolate and flavored syrup (12oz base).", },
  { id: "caramel_frappuccino", name: "Caramel Frappuccino", category: "specialty", caffeineMg: 65, description: "Blended iced coffee with caramel and flavored syrup (12oz base).", },
  { id: "espresso_frappuccino", name: "Espresso Frappuccino", category: "specialty", caffeineMg: 130, description: "Blended iced coffee with extra espresso shots (12oz base).", },
  { id: "matcha_creme_frappuccino", name: "Matcha Crème Frappuccino", category: "specialty", caffeineMg: 40, description: "Blended iced matcha with cream and flavored syrup (12oz base).", },

  // Energy Drinks category (based on standard serving sizes)
  { id: "red_bull", name: "Red Bull", category: "energy", caffeineMg: 80, description: "Classic energy drink, 8.4 fl oz can." },
  { id: "monster_energy", name: "Monster Energy", category: "energy", caffeineMg: 160, description: "High-caffeine energy drink, 16 fl oz can." },
  { id: "rockstar", name: "Rockstar", category: "energy", caffeineMg: 160, description: "Performance energy drink, 16 fl oz can." },
  { id: "five_hour_energy", name: "5-Hour Energy", category: "energy", caffeineMg: 200, description: "Concentrated energy shot, 1.93 fl oz bottle." },
  { id: "bang_energy", name: "Bang Energy", category: "energy", caffeineMg: 300, description: "Super creatine energy drink, 16 fl oz can." },
  { id: "celsius", name: "Celsius", category: "energy", caffeineMg: 200, description: "Fitness energy drink, 12 fl oz can." },

  // Soda category (based on 12 fl oz servings)
  { id: "coke", name: "Coca-Cola", category: "soda", caffeineMg: 34, description: "Classic cola, 12 fl oz can.", tags: ["low_caffeine"] },
  { id: "pepsi", name: "Pepsi", category: "soda", caffeineMg: 38, description: "Cola beverage, 12 fl oz can.", tags: ["low_caffeine"] },
  { id: "dr_pepper", name: "Dr Pepper", category: "soda", caffeineMg: 41, description: "Unique blend of 23 flavors, 12 fl oz can.", tags: ["low_caffeine"] },
  { id: "mountain_dew", name: "Mountain Dew", category: "soda", caffeineMg: 54, description: "Citrus soda with caffeine, 12 fl oz can.", tags: ["low_caffeine"] },
  { id: "diet_coke", name: "Diet Coke", category: "soda", caffeineMg: 46, description: "Sugar-free cola, 12 fl oz can.", tags: ["low_caffeine"] },
  { id: "diet_pepsi", name: "Diet Pepsi", category: "soda", caffeineMg: 36, description: "Sugar-free cola, 12 fl oz can.", tags: ["low_caffeine"] },
  { id: "cherry_coke", name: "Cherry Coke", category: "soda", caffeineMg: 34, description: "Cherry-flavored cola, 12 fl oz can.", tags: ["low_caffeine"] },
  { id: "sprite", name: "Sprite", category: "soda", caffeineMg: 0, description: "Caffeine-free lemon-lime soda, 12 fl oz can.", tags: ["low_caffeine"] },
  { id: "root_beer", name: "Root Beer", category: "soda", caffeineMg: 0, description: "Traditional root beer, 12 fl oz can.", tags: ["low_caffeine"] },
  { id: "orange_soda", name: "Orange Soda", category: "soda", caffeineMg: 0, description: "Orange-flavored soda, 12 fl oz can.", tags: ["low_caffeine"] },
];

export const HALF_LIFE_HOURS = 5; // default half-life

export const byCategory = (category: CoffeeCategory) =>
  COFFEES.filter((c) => c.category === category);
