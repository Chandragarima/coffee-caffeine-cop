import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Plus, Search, X } from 'lucide-react';
import { COFFEES, CoffeeItem } from '../data/coffees';
import { useCoffeeLogs } from '../hooks/useCoffeeLogs';
import { usePreferences } from '../hooks/usePreferences';
import QuickLogButton from './QuickLogButton';
import { fuzzySearch } from '../lib/fuzzySearch';
import { useIsMobile } from '../hooks/use-mobile';
import CustomDrinkDialog from './CustomDrinkDialog';

interface FloatingLogButtonProps {
  onLogSuccess?: () => void;
}

export const FloatingLogButton = ({ onLogSuccess }: FloatingLogButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomDrink, setShowCustomDrink] = useState(false);
  const { logs } = useCoffeeLogs();
  const { favoriteCoffees } = usePreferences();
  const isMobile = useIsMobile();

  // Get recent drinks (last 5 unique coffees logged today)
  const recentCoffees = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfToday = today.getTime();
    
    const todayLogs = logs
      .filter(log => log.consumedAt >= startOfToday)
      .sort((a, b) => b.consumedAt - a.consumedAt);
    
    // Get unique coffee IDs, preserving order
    const uniqueIds = new Set<string>();
    const recent: CoffeeItem[] = [];
    
    for (const log of todayLogs) {
      if (!uniqueIds.has(log.coffeeId) && recent.length < 5) {
        const coffee = COFFEES.find(c => c.id === log.coffeeId);
        if (coffee) {
          uniqueIds.add(log.coffeeId);
          recent.push(coffee);
        }
      }
    }
    
    return recent;
  }, [logs]);

  // Get favorite coffee items
  const favoriteItems = useMemo(() => {
    return COFFEES.filter(coffee => favoriteCoffees.includes(coffee.id));
  }, [favoriteCoffees]);

  // Get quick category coffees (most common)
  const quickCoffees = useMemo(() => {
    const commonIds = [
      'single-espresso',
      'drip-coffee',
      'small-americano',
      'latte',
      'cappuccino',
      'mocha'
    ];
    return COFFEES.filter(coffee => commonIds.includes(coffee.id));
  }, []);

  // Filter coffees based on search
  const filteredCoffees = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.trim().toLowerCase();
    
    // First try exact/partial matches
    const exactMatches = COFFEES.filter((c) => {
      const name = c.name.toLowerCase();
      const tags = c.tags?.map(t => t.toLowerCase()) || [];
      return name.includes(query) || tags.some(tag => tag.includes(query));
    });

    if (exactMatches.length > 0) {
      return exactMatches.slice(0, 8);
    }

    // Fall back to fuzzy matching
    const fuzzyMatches = fuzzySearch(
      COFFEES,
      query,
      (coffee) => [coffee.name, ...(coffee.tags || [])],
      0.4
    );

    return fuzzyMatches.map(match => match.item).slice(0, 8);
  }, [searchQuery]);

  const handleQuickLog = async (coffee: CoffeeItem) => {
    // The QuickLogButton with instantLog will handle the actual logging
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center p-0"
        size="lg"
        aria-label="Quick log coffee"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Modal - Responsive sizing */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className={`${isMobile ? 'w-[95vw] max-w-none h-[85vh]' : 'w-[90vw] max-w-2xl max-h-[85vh]'} overflow-hidden flex flex-col p-0`}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-xl font-bold">Quick Log Coffee</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a drink..."
                className="pl-10 pr-10 h-12 text-base"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Custom Drink Button */}
            {!searchQuery && (
              <button
                onClick={() => setShowCustomDrink(true)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Plus className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Custom Drink</div>
                  <div className="text-xs text-gray-500">Log a drink not in the list</div>
                </div>
              </button>
            )}

            {/* Search Results */}
            {searchQuery && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Search Results ({filteredCoffees.length})
                </h3>
                {filteredCoffees.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredCoffees.map((coffee) => {
                      const defaultCaffeine = coffee.sizeOptions?.[0]?.caffeine || coffee.caffeineMg;
                      return (
                        <div
                          key={coffee.id}
                          className="bg-white border border-gray-200 rounded-lg p-3 hover:border-amber-300 hover:shadow-md transition-all"
                        >
                          <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                            {coffee.name}
                          </h4>
                          <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-600 mb-2">
                            {defaultCaffeine}mg
                          </Badge>
                          <QuickLogButton
                            coffee={coffee}
                            variant="default"
                            size="sm"
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold"
                            showDialog={false}
                            onLogSuccess={() => {
                              handleQuickLog(coffee);
                              onLogSuccess?.();
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No drinks found. Try a different search term.
                  </p>
                )}
              </div>
            )}

            {/* Recent Drinks */}
            {!searchQuery && recentCoffees.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {recentCoffees.map((coffee) => {
                    const defaultCaffeine = coffee.sizeOptions?.[0]?.caffeine || coffee.caffeineMg;
                    return (
                      <div
                        key={coffee.id}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:border-amber-300 hover:shadow-md transition-all"
                      >
                        <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                          {coffee.name}
                        </h4>
                        <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-600 mb-2">
                          {defaultCaffeine}mg
                        </Badge>
                        <QuickLogButton
                          coffee={coffee}
                          variant="default"
                          size="sm"
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold"
                          showDialog={false}
                          onLogSuccess={() => {
                            handleQuickLog(coffee);
                            onLogSuccess?.();
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Favorites */}
            {!searchQuery && favoriteItems.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Favorites</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {favoriteItems.map((coffee) => {
                    const defaultCaffeine = coffee.sizeOptions?.[0]?.caffeine || coffee.caffeineMg;
                    return (
                      <div
                        key={coffee.id}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:border-amber-300 hover:shadow-md transition-all"
                      >
                        <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                          {coffee.name}
                        </h4>
                        <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-600 mb-2">
                          {defaultCaffeine}mg
                        </Badge>
                        <QuickLogButton
                          coffee={coffee}
                          variant="default"
                          size="sm"
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold"
                          showDialog={false}
                          onLogSuccess={() => {
                            handleQuickLog(coffee);
                            onLogSuccess?.();
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Picks (if no recent/favorites) */}
            {!searchQuery && recentCoffees.length === 0 && favoriteItems.length === 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Picks</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {quickCoffees.map((coffee) => {
                    const defaultCaffeine = coffee.sizeOptions?.[0]?.caffeine || coffee.caffeineMg;
                    return (
                      <div
                        key={coffee.id}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:border-amber-300 hover:shadow-md transition-all"
                      >
                        <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                          {coffee.name}
                        </h4>
                        <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-600 mb-2">
                          {defaultCaffeine}mg
                        </Badge>
                        <QuickLogButton
                          coffee={coffee}
                          variant="default"
                          size="sm"
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold"
                          showDialog={false}
                          onLogSuccess={() => {
                            handleQuickLog(coffee);
                            onLogSuccess?.();
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Drink Dialog */}
      <CustomDrinkDialog
        open={showCustomDrink}
        onOpenChange={setShowCustomDrink}
        onLogSuccess={() => {
          setIsOpen(false);
          setSearchQuery('');
          onLogSuccess?.();
        }}
      />
    </>
  );
};
