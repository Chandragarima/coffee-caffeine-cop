import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COFFEES, CoffeeCategory, CoffeeItem, byCategory } from "@/data/coffees";
import { SizeOz } from "@/lib/serving";
import { CoffeeCard } from "@/components/CoffeeCard";

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
  shots: 1 | 2;
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
    
    return COFFEES.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      (c.tags?.some((t) => t.includes(q)) ?? false)
    );
  }, [query]);

  return (
    <div className="border-t border-amber-100 pt-8">
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Browse all coffees</h3>
        <p className="text-gray-600">Discover your perfect brew from our extensive collection</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for your perfect brew (e.g., latte, decaf, tea, espresso)"
          className="pl-12 pr-12 h-14 text-base bg-white border-gray-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {query ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900">
              {showAllItems ? (
                `All ${filtered.length} options`
              ) : (
                `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${query.replace('show-all-', '')}"`
              )}
            </h4>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {showAllItems ? 
                  `Showing all ${filtered.length}` : 
                  `Showing ${Math.min(filtered.length, 12)} of ${filtered.length}`
                }
              </span>
              <div className="flex items-center gap-2 text-sm">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <div className="space-y-4">
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
            <div className="text-center py-16">
              <div className="text-6xl mb-4">☕</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No matches found</h4>
              <p className="text-gray-500">Try searching for something else</p>
            </div>
          )}
          
          {!showAllItems && filtered.length > 12 && (
            <div className="text-center mt-8">
              <Button 
                variant="outline"
                onClick={() => {
                  setShowAllItems(true);
                  setQuery(query || "show-all-all");
                }}
                className="px-6 py-3 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300"
              >
                View all {filtered.length} results
              </Button>
            </div>
          )}
          
          {showAllItems && (
            <div className="text-center mt-8">
              <Button 
                variant="outline"
                onClick={() => {
                  setShowAllItems(false);
                  setQuery("");
                }}
                className="px-6 py-3 border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                ← Back to browse
              </Button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Category Navigation */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Browse by category</h4>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setActiveTab("all");
                  setShowAllItems(false);
                  setQuery("");
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === "all"
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent"
                }`}
              >
               All
              </button>
              {(Object.keys(categoryLabels) as CoffeeCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveTab(cat);
                    setShowAllItems(false);
                    setQuery("");
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === cat
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent"
                  }`}
                >
                  {categoryLabels[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              Showing {Math.min((activeTab === "all" ? COFFEES : byCategory(activeTab as CoffeeCategory)).length, 12)} drinks
            </p>
            <div className="flex items-center gap-2 text-sm">
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

          {/* Dynamic Layout based on view mode */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <div className="space-y-4">
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
            <div className="text-center mt-8">
              <Button 
                variant="outline"
                onClick={() => {
                  setQuery("show-all-" + activeTab);
                  setShowAllItems(true);
                }}
                className="px-6 py-3 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300"
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
