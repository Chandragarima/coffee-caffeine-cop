import { useMemo } from "react";
import { CoffeeItem, COFFEES } from "@/data/coffees";
import { CoffeeCard } from "@/components/CoffeeCard";
import { SizeOz } from "@/lib/serving";

interface SmartNoResultsProps {
  searchQuery: string;
  sizeOz: SizeOz;
  shots: 1 | 2 | 3;
  hoursUntilBed: number;
  onSelect: (coffee: CoffeeItem) => void;
  onLogSuccess: () => void;
}

export const SmartNoResults = ({ 
  searchQuery, 
  sizeOz, 
  shots, 
  hoursUntilBed, 
  onSelect, 
  onLogSuccess 
}: SmartNoResultsProps) => {
  const suggestions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    // Analyze search intent
    const isCaffeineRelated = /\b(caffeine|high|low|strong|weak|decaf|energy|boost)\b/.test(query);
    const isTypeRelated = /\b(coffee|tea|espresso|latte|cappuccino|americano|cold|iced|hot)\b/.test(query);
    
    let suggestedDrinks: CoffeeItem[] = [];
    
    if (isCaffeineRelated) {
      // Suggest by caffeine levels
      if (/\b(high|strong|energy|boost)\b/.test(query)) {
        suggestedDrinks = COFFEES
          .filter(c => c.caffeineMg >= 100)
          .sort((a, b) => b.caffeineMg - a.caffeineMg)
          .slice(0, 4);
      } else if (/\b(low|weak|decaf)\b/.test(query)) {
        suggestedDrinks = COFFEES
          .filter(c => c.caffeineMg <= 50)
          .sort((a, b) => a.caffeineMg - b.caffeineMg)
          .slice(0, 4);
      } else {
        // Medium caffeine
        suggestedDrinks = COFFEES
          .filter(c => c.caffeineMg >= 50 && c.caffeineMg <= 100)
          .sort((a, b) => b.caffeineMg - a.caffeineMg)
          .slice(0, 4);
      }
    } else if (isTypeRelated) {
      // Suggest by category
      if (/\b(tea)\b/.test(query)) {
        suggestedDrinks = COFFEES.filter(c => c.category === 'tea').slice(0, 4);
      } else if (/\b(espresso)\b/.test(query)) {
        suggestedDrinks = COFFEES.filter(c => c.category === 'espresso').slice(0, 4);
      } else if (/\b(cold|iced)\b/.test(query)) {
        suggestedDrinks = COFFEES.filter(c => c.category === 'cold').slice(0, 4);
      } else {
        suggestedDrinks = COFFEES.filter(c => c.category === 'brewed').slice(0, 4);
      }
    } else {
      // Default to popular drinks
      const popularDrinks = ['americano', 'latte', 'cappuccino', 'espresso', 'green-tea', 'black-tea'];
      suggestedDrinks = COFFEES
        .filter(c => popularDrinks.includes(c.id))
        .slice(0, 4);
    }
    
    // Fallback to most popular if no specific suggestions
    if (suggestedDrinks.length === 0) {
      suggestedDrinks = COFFEES
        .sort((a, b) => b.caffeineMg - a.caffeineMg)
        .slice(0, 4);
    }
    
    return suggestedDrinks;
  }, [searchQuery]);

  const getSuggestionReason = () => {
    const query = searchQuery.toLowerCase().trim();
    
    if (/\b(high|strong|energy|boost)\b/.test(query)) {
      return "High caffeine drinks you might like:";
    } else if (/\b(low|weak|decaf)\b/.test(query)) {
      return "Low caffeine options for you:";
    } else if (/\b(tea)\b/.test(query)) {
      return "Tea options you might enjoy:";
    } else if (/\b(cold|iced)\b/.test(query)) {
      return "Cold drinks you might like:";
    } else if (/\b(espresso)\b/.test(query)) {
      return "Espresso-based drinks:";
    }
    
    return "Popular drinks you might enjoy:";
  };

  return (
    <div className="text-center py-8">
      <div className="text-6xl mb-4">🔍</div>
      <h4 className="text-lg font-semibold text-gray-900 mb-2">
        No matches found for "{searchQuery}"
      </h4>
      <p className="text-gray-500 mb-8">
        Try a different search term or browse our suggestions below
      </p>
      
      <div className="text-left">
        <h5 className="text-base font-semibold text-gray-800 mb-4">
          {getSuggestionReason()}
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {suggestions.map(coffee => (
            <CoffeeCard
              key={coffee.id}
              coffee={coffee}
              sizeOz={sizeOz}
              shots={shots}
              hoursUntilBed={hoursUntilBed}
              onSelect={onSelect}
              onLogSuccess={onLogSuccess}
              viewMode="grid"
            />
          ))}
        </div>
      </div>
    </div>
  );
};