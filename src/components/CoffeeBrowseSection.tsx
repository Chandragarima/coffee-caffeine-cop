import { useMemo, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COFFEES, CoffeeCategory, CoffeeItem, byCategory } from "@/data/coffees";
import { SizeOz } from "@/lib/serving";
import { CoffeeCard } from "@/components/CoffeeCard";
import { useDynamicCoffee } from "@/hooks/useDynamicCaffeine";
import { toast } from "@/components/ui/sonner";
import { ChevronDown } from "lucide-react";
import { SearchAutoComplete } from "@/components/SearchAutoComplete";
import { SmartNoResults } from "@/components/SmartNoResults";

const categoryLabels: Record<CoffeeCategory, string> = {
  brewed: "Brewed",
  espresso: "Espresso-Based",
  milk: "Milk-Based", 
  cold: "Iced",
  tea: "Tea",
  specialty: "Specialty",
  energy: "Energy Drinks",
  soda: "Soda",
};

interface CoffeeBrowseSectionProps {
  sizeOz: SizeOz;
  shots: 1 | 2 | 3;
  hoursUntilBed: number;
  onSelect: (coffee: CoffeeItem) => void;
  onLogSuccess: () => void;
}

export const CoffeeBrowseSection = ({ 
  sizeOz, 
  shots, 
  hoursUntilBed,
  onSelect, 
  onLogSuccess 
}: CoffeeBrowseSectionProps) => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [query, setQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAllItems, setShowAllItems] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [showAutoComplete, setShowAutoComplete] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as CoffeeItem[];
    
    // Handle "show-all" special case
    if (q.startsWith("show-all-")) {
      const category = q.replace("show-all-", "");
      setShowAllItems(true);
      if (category === "all") {
        return COFFEES;
      }
      return byCategory(category as CoffeeCategory);
    }
    
    return COFFEES.filter((c) => {
      const name = c.name.toLowerCase();
      const tags = c.tags?.map(t => t.toLowerCase()) || [];
      
      // Split search query into words
      const searchWords = q.split(/\s+/).filter(word => word.length > 0);
      
      // Check each search word against the item (NAME AND TAGS ONLY)
      return searchWords.some(searchWord => {
        // First check for exact word matches (word boundaries)
        const wordBoundaryRegex = new RegExp(`\\b${searchWord}\\b`, 'i');
        const hasExactWordMatch = (
          wordBoundaryRegex.test(name) ||
          tags.some(tag => wordBoundaryRegex.test(tag))
        );
        
        // If no exact word match, check for partial matches (for better UX)
        const hasPartialMatch = (
          name.includes(searchWord) ||
          tags.some(tag => tag.includes(searchWord))
        );
        
        return hasExactWordMatch || hasPartialMatch;
      });
    });
  }, [query]);

  // Auto-complete suggestions (only for name matching)
  const autoCompleteSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    
    return COFFEES.filter((c) => {
      const name = c.name.toLowerCase();
      const tags = c.tags?.map(t => t.toLowerCase()) || [];
      
      return name.includes(q) || tags.some(tag => tag.includes(q));
    }).slice(0, 8);
  }, [query]);

  // Handle click outside to close auto-complete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowAutoComplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (category: string) => {
    setActiveTab(category);
    setShowAllItems(false);
    setQuery("");
    setIsDropdownOpen(false);
    setShowAutoComplete(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowAutoComplete(value.length >= 2);
  };

  const handleAutoCompleteSelect = (coffee: CoffeeItem) => {
    setQuery(coffee.name);
    setShowAutoComplete(false);
    onSelect(coffee);
  };

  return (
    <div className="border-t border-amber-100 pt-4 sm:pt-8">
      {/* Header - Mobile Optimized */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3 sm:mb-2">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Browse all drinks</h3>
          <button
            onClick={() => {
              toast.info("Serving Size & Shot Preferences", {
                description: "Some drinks (like Single Espresso, Ristretto, Cortado) have fixed sizes and caffeine amounts that don't change with your preferences. This is because these drinks are typically served in standard sizes at coffee shops.",
                duration: 4000,
              });
            }}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
            title="Info about serving size and shot limitations"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
        <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Discover your perfect brew from our extensive collection</p>
      </div>

      {/* Search and Browse Controls - Inline on Desktop */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 mb-6 sm:mb-8">
        {/* Search Bar */}
        <div ref={searchRef} className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Input
            value={query}
            onChange={handleSearchChange}
            onFocus={() => query.length >= 2 && setShowAutoComplete(true)}
            placeholder="Search coffees..."
            className="pl-12 pr-12 h-10 sm:h-14 text-base sm:text-base bg-white border-2 border-gray-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-2xl shadow-sm transition-all duration-200"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setShowAutoComplete(false);
              }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          <SearchAutoComplete
            suggestions={autoCompleteSuggestions}
            onSelect={handleAutoCompleteSelect}
            searchQuery={query}
            isVisible={showAutoComplete}
            onClose={() => setShowAutoComplete(false)}
          />
        </div>

        {/* Category Dropdown - Inline on Desktop */}
        <div className="lg:w-64">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 lg:hidden">Browse by category</h4>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between pl-12 pr-12 h-12 sm:h-14 bg-white border-2 border-gray-200 rounded-2xl text-left hover:border-gray-300 transition-all duration-200 shadow-sm"
            >
              <span className="text-base font-medium text-gray-900">
                {activeTab === "all" ? "All Categories" : categoryLabels[activeTab as CoffeeCategory]}
              </span>
              <ChevronDown 
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white border-2 border-gray-200 rounded-2xl shadow-xl z-10 max-h-72 overflow-y-auto">
                <button
                  onClick={() => handleCategorySelect("all")}
                  className={`w-full px-5 py-4 text-left text-base font-medium transition-all duration-200 ${
                    activeTab === "all"
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  All Categories
                </button>
                {(Object.keys(categoryLabels) as CoffeeCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`w-full px-5 py-4 text-left text-base font-medium transition-all duration-200 ${
                      activeTab === cat
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {categoryLabels[cat]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {query ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-6 gap-2 sm:gap-4">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900">
              {showAllItems ? (
                `All ${filtered.length} options`
              ) : (
                `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`
              )}
            </h4>
            <div className="flex items-center justify-between sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-500">
                {showAllItems ? 
                  `Showing all ${filtered.length}` : 
                  `Showing ${Math.min(filtered.length, 12)} of ${filtered.length}`
                }
              </span>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`px-2 py-1 rounded transition-colors ${
                    viewMode === 'grid' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Grid
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-2 py-1 rounded transition-colors ${
                    viewMode === 'list' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
          {filtered.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {(showAllItems ? filtered : filtered.slice(0, 12)).map(coffee => (
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
            ) : (
              <div className="space-y-2 sm:space-y-4">
                {(showAllItems ? filtered : filtered.slice(0, 12)).map(coffee => (
                  <CoffeeCard
                    key={coffee.id}
                    coffee={coffee}
                    sizeOz={sizeOz}
                    shots={shots}
                    hoursUntilBed={hoursUntilBed}
                    onSelect={onSelect}
                    onLogSuccess={onLogSuccess}
                    viewMode="list"
                  />
                ))}
              </div>
            )
          ) : (
            <SmartNoResults
              searchQuery={query}
              sizeOz={sizeOz}
              shots={shots}
              hoursUntilBed={hoursUntilBed}
              onSelect={onSelect}
              onLogSuccess={onLogSuccess}
            />
          )}
          
          {!showAllItems && filtered.length > 12 && (
            <div className="text-center mt-4 sm:mt-8">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAllItems(true);
                  setQuery(query || "show-all-all");
                }}
                className="px-4 sm:px-6 py-2 sm:py-3 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 text-sm"
              >
                View all {filtered.length} results
              </Button>
            </div>
          )}
          
          {showAllItems && (
            <div className="text-center mt-4 sm:mt-8">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAllItems(false);
                  setQuery("");
                }}
                className="px-4 sm:px-6 py-2 sm:py-3 border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
              >
                ← Back to browse
              </Button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Results Count - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-6 gap-3 sm:gap-4">
            <p className="text-sm sm:text-sm text-gray-600 font-medium">
              Showing {Math.min((activeTab === "all" ? COFFEES : byCategory(activeTab as CoffeeCategory)).length, 12)} drinks
            </p>
            <div className="flex items-center gap-2 sm:gap-2 text-sm sm:text-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  viewMode === 'grid' ? 'text-blue-600 bg-blue-50 border-2 border-blue-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-2 border-transparent'
                }`}
              >
                Grid
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  viewMode === 'list' ? 'text-blue-600 bg-blue-50 border-2 border-blue-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-2 border-transparent'
                }`}
              >
                List
              </button>
            </div>
          </div>

          {/* Dynamic Layout based on view mode */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {(activeTab === "all" ? COFFEES : byCategory(activeTab as CoffeeCategory))
                .slice(0, 12)
                .map(coffee => (
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
          ) : (
            <div className="space-y-2 sm:space-y-4">
              {(activeTab === "all" ? COFFEES : byCategory(activeTab as CoffeeCategory))
                .slice(0, 12)
                .map(coffee => (
                  <CoffeeCard
                    key={coffee.id}
                    coffee={coffee}
                    sizeOz={sizeOz}
                    shots={shots}
                    hoursUntilBed={hoursUntilBed}
                    onSelect={onSelect}
                    onLogSuccess={onLogSuccess}
                    viewMode="list"
                  />
                ))}
            </div>
          )}

          {(activeTab === "all" ? COFFEES : byCategory(activeTab as CoffeeCategory)).length > 12 && (
            <div className="text-center mt-4 sm:mt-8">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery("show-all-" + activeTab);
                  setShowAllItems(true);
                }}
                className="px-4 sm:px-6 py-2 sm:py-3 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 text-sm"
              >
                View all {(activeTab === "all" ? COFFEES : byCategory(activeTab as CoffeeCategory)).length} options
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
