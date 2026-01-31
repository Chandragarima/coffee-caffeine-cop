import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CoffeeItem, HALF_LIFE_HOURS } from "@/data/coffees";
import { getSleepVerdict } from "@/lib/sleepVerdict";
import { caffeineRemaining } from "@/lib/caffeine";
import QuickLogButton from "@/components/QuickLogButton";
import { usePreferences } from "@/hooks/usePreferences";
import { Star, StarOff } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { trackCoffeeView } from "@/lib/analytics";

interface CoffeeCardProps {
  coffee: CoffeeItem;
  hoursUntilBed: number;
  onSelect: (coffee: CoffeeItem) => void;
  onLogSuccess: () => void;
  viewMode?: 'grid' | 'list';
}

export const CoffeeCard = ({ 
  coffee, 
  hoursUntilBed, 
  onSelect, 
  onLogSuccess,
  viewMode = 'grid'
}: CoffeeCardProps) => {
  const { quickLogMode, favoriteCoffees, updatePreference } = usePreferences();
  const isFavorite = favoriteCoffees.includes(coffee.id);
  
  // Get the default caffeine value (smallest size)
  const defaultCaffeine = coffee.defaultSize ? 
    (coffee.sizeOptions?.[coffee.defaultSize] || coffee.caffeineMg) : 
    coffee.caffeineMg;
  
  const v = getSleepVerdict(defaultCaffeine, hoursUntilBed, HALF_LIFE_HOURS);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = isFavorite
      ? favoriteCoffees.filter(id => id !== coffee.id)
      : [...favoriteCoffees, coffee.id].slice(-6); // Keep max 6
    
    updatePreference('favorite_coffees', newFavorites);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  if (viewMode === 'list') {
    return (
      <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer bg-white border border-gray-200 hover:border-gray-300" onClick={() => {
        trackCoffeeView('explore', {
          id: coffee.id,
          name: coffee.name,
          caffeineMg: defaultCaffeine,
          category: coffee.category
        });
        onSelect(coffee);
      }}>
        <CardContent className="p-3 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-6">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Header with title and safety indicator */}
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-amber-700 transition-colors leading-tight flex-1">
                  {coffee.name}
                </h3>
                <div className="flex items-center gap-1 sm:gap-1.5 ml-2 sm:ml-4 flex-shrink-0">
                  <button
                    onClick={toggleFavorite}
                    className="p-1 rounded-full hover:bg-amber-100 transition-colors"
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {isFavorite ? (
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    ) : (
                      <StarOff className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </button>
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    v.code === 'green' ? 'bg-green-400' : 
                    v.code === 'yellow' ? 'bg-amber-400' : 
                    'bg-red-400'
                  }`}></span>
                  <span className={`text-xs font-medium whitespace-nowrap hidden sm:inline ${
                    v.code === 'green' ? 'text-green-600' : 
                    v.code === 'yellow' ? 'text-amber-600' : 
                    'text-red-600'
                  }`}>
                    {v.chip}
                  </span>
                </div>
              </div>
              
              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-2 sm:mb-4 line-clamp-1 sm:line-clamp-none">
                {coffee.description}
              </p>
              
              {/* Bottom row with caffeine and buttons */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                  {defaultCaffeine}mg
                </span>
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {quickLogMode && (
                    <QuickLogButton 
                      coffee={coffee} 
                      variant="default" 
                      size="sm" 
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm px-2 sm:px-3 font-semibold"
                      instantLog={true}
                      onLogSuccess={onLogSuccess}
                      showUndoAfterLog={true}
                    />
                  )}
                  <QuickLogButton 
                    coffee={coffee} 
                    variant={quickLogMode ? "outline" : "default"}
                    size="sm" 
                    className={quickLogMode 
                      ? "border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors text-xs sm:text-sm px-2 sm:px-3"
                      : "bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm px-2 sm:px-3 font-semibold"
                    }
                    showDialog={true}
                    onLogSuccess={onLogSuccess}
                    showUndoAfterLog={true}
                    source="explore"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col h-full min-h-0" onClick={() => {
      trackCoffeeView('explore', {
        id: coffee.id,
        name: coffee.name,
        caffeineMg: defaultCaffeine,
        category: coffee.category
      });
      onSelect(coffee);
    }}>
      <CardContent className="p-4 sm:p-6 flex flex-col h-full min-h-0">
        {/* Header with title and safety indicator */}
        <div className="flex items-start justify-between mb-3 sm:mb-4 flex-shrink-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-amber-700 transition-colors leading-tight flex-1">
            {coffee.name}
          </h3>
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            <button
              onClick={toggleFavorite}
              className="p-1 rounded-full hover:bg-amber-100 transition-colors"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? (
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              ) : (
                <StarOff className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <span className={`w-3 h-3 rounded-full ${
              v.code === 'green' ? 'bg-green-400' : 
              v.code === 'yellow' ? 'bg-amber-400' : 
              'bg-red-400'
            }`}></span>
            <span className={`text-xs font-medium whitespace-nowrap hidden sm:inline ${
              v.code === 'green' ? 'text-green-600' : 
              v.code === 'yellow' ? 'text-amber-600' : 
              'text-red-600'
            }`}>
              {v.chip}
            </span>
          </div>
        </div>
        
        {/* Description - flex-grow to push bottom content down, clamped to 3 lines for consistency */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-grow min-h-0 line-clamp-3">
          {coffee.description}
        </p>
        
        {/* Bottom section - always at bottom with consistent spacing */}
        <div className="mt-auto space-y-3 flex-shrink-0">
          {/* Caffeine amount */}
          <div>
            <span className="text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
              {defaultCaffeine}mg
            </span>
          </div>
          
          {/* Log buttons */}
          <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            {quickLogMode && (
              <QuickLogButton 
                coffee={coffee} 
                variant="default" 
                size="sm" 
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                instantLog={true}
                onLogSuccess={onLogSuccess}
                showUndoAfterLog={true}
              />
            )}
            <QuickLogButton 
              coffee={coffee} 
              variant={quickLogMode ? "outline" : "default"}
              size="sm" 
              className={quickLogMode 
                ? "w-full border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors"
                : "w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              }
              showDialog={true}
              onLogSuccess={onLogSuccess}
              showUndoAfterLog={true}
              source="explore"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
