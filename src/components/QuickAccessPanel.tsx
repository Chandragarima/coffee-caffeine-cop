import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { COFFEES, CoffeeItem } from '@/data/coffees';
import { usePreferences } from '@/hooks/usePreferences';
import QuickLogButton from '@/components/QuickLogButton';
import { Badge } from '@/components/ui/badge';
import { Star, StarOff, Plus } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface QuickAccessPanelProps {
  onLogSuccess?: () => void;
  hoursUntilBed?: number;
}

export const QuickAccessPanel = ({ onLogSuccess, hoursUntilBed = 8 }: QuickAccessPanelProps) => {
  const { favoriteCoffees, updatePreference } = usePreferences();

  // Get favorite coffee items
  const favoriteItems = useMemo(() => {
    return COFFEES.filter(coffee => favoriteCoffees.includes(coffee.id));
  }, [favoriteCoffees]);

  // Get suggested coffees if favorites are empty (most common drinks)
  const suggestedCoffees = useMemo(() => {
    if (favoriteItems.length > 0) return [];
    
    const commonIds = [
      'single-espresso',
      'drip-coffee',
      'small-americano',
      'latte',
      'cappuccino',
      'mocha'
    ];
    
    return COFFEES.filter(coffee => commonIds.includes(coffee.id)).slice(0, 6);
  }, [favoriteItems.length]);

  const displayCoffees = favoriteItems.length > 0 ? favoriteItems : suggestedCoffees;

  const toggleFavorite = (coffeeId: string) => {
    const isFavorite = favoriteCoffees.includes(coffeeId);
    let newFavorites: string[];
    
    if (isFavorite) {
      newFavorites = favoriteCoffees.filter(id => id !== coffeeId);
      toast.success('Removed from favorites');
    } else {
      newFavorites = [...favoriteCoffees, coffeeId];
      if (newFavorites.length > 6) {
        newFavorites = newFavorites.slice(-6); // Keep only last 6
        toast.info('Favorites limited to 6 items');
      } else {
        toast.success('Added to favorites');
      }
    }
    
    updatePreference('favorite_coffees', newFavorites);
  };

  if (displayCoffees.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Quick Access
          </CardTitle>
          {favoriteItems.length === 0 && (
            <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">
              Suggested
            </Badge>
          )}
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          {favoriteItems.length > 0 
            ? 'Tap to log instantly • Star to manage favorites'
            : 'Tap the star to add drinks to your quick access panel'
          }
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {displayCoffees.map((coffee) => {
            const isFavorite = favoriteCoffees.includes(coffee.id);
            const defaultCaffeine = coffee.sizeOptions?.[0]?.caffeine || coffee.caffeineMg;
            
            return (
              <div
                key={coffee.id}
                className="group relative bg-white rounded-lg border border-amber-200 hover:border-amber-300 hover:shadow-md transition-all duration-200 p-2 sm:p-3 flex flex-col items-center gap-2"
              >
                {/* Favorite toggle button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(coffee.id);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full hover:bg-amber-100 transition-colors z-10"
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isFavorite ? (
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ) : (
                    <StarOff className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {/* Coffee name */}
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 text-center line-clamp-2 leading-tight mt-4 sm:mt-0">
                  {coffee.name}
                </h4>

                {/* Caffeine amount */}
                <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                  {defaultCaffeine}mg
                </Badge>

                {/* Quick log button */}
                <QuickLogButton
                  coffee={coffee}
                  variant="default"
                  size="sm"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold mt-auto"
                  instantLog={true}
                  onLogSuccess={onLogSuccess}
                />
              </div>
            );
          })}
        </div>

        {/* Add more favorites hint */}
        {favoriteItems.length === 0 && (
          <div className="mt-4 p-3 bg-white/60 rounded-lg border border-amber-200 text-center">
            <p className="text-xs text-gray-600">
              <Plus className="w-3 h-3 inline mr-1" />
              Browse drinks and tap the star icon to add them here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
