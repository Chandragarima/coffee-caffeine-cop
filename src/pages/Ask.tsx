import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CoffeeBrowseSection } from "@/components/CoffeeBrowseSection";
import { CoffeeDetailDialog } from "@/components/CoffeeDetailDialog";
import PreferencesDemo from "@/components/PreferencesDemo";
import CaffeineTracker from "@/components/CaffeineTracker";
import { SmartCaffeineTracker } from "@/components/SmartCaffeineTracker";
import { RecommendationsSection } from "@/components/RecommendationsSection";
import { CoffeeItem } from "@/data/coffees";
import { usePreferences } from "@/hooks/usePreferences";
import { useCoffeeLogs } from "@/hooks/useCoffeeLogs";
import { useCaffeineTracker } from "@/hooks/useCaffeineTracker";
import { hoursUntilBedtime, getCurrentTime } from "@/lib/timeUtils";
import { SizeOz } from "@/lib/serving";
import { Settings } from "lucide-react";

const Ask = () => {
  const {
    bedtime,
    servingSize,
    shots,
    caffeineLimit,
    preferences,
    isLoading: preferencesLoading,
    updatePreference
  } = usePreferences();

  // Load coffee logs
  const { stats: coffeeStats, refreshStats } = useCoffeeLogs();
  const { caffeineStatus } = useCaffeineTracker();

  const [selected, setSelected] = useState<CoffeeItem | null>(null);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showSmartTracker, setShowSmartTracker] = useState<boolean>(false);
  
  // Update local state when preferences change
  const [localBedtime, setLocalBedtime] = useState<string>(bedtime);
  const [localSizeOz, setLocalSizeOz] = useState<SizeOz>(servingSize as SizeOz);
  const [localShots, setLocalShots] = useState<1 | 2>(shots);

  // Sync local state with preferences
  useEffect(() => {
    if (!preferencesLoading) {
      setLocalBedtime(bedtime);
      setLocalSizeOz(servingSize as SizeOz);
      setLocalShots(shots);
    }
  }, [bedtime, servingSize, shots, preferencesLoading]);

  const virtualHoursUntilBed = useMemo(() => hoursUntilBedtime(localBedtime), [localBedtime]);
  
  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshCount(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };
  
  useEffect(() => {
    document.title = "CoffeePolice – Smart caffeine tracker";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Browse coffees, see half-life charts, and get time-smart picks.");
  }, []);
  
  // Format time helper function
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/30">
      {/* Mobile-Optimized Header */}
      <header className="px-4 sm:px-6 py-4 sm:py-6 bg-gradient-to-r from-primary/5 via-amber-50/50 to-primary/5 border-b border-amber-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <img
              src="/lovable-uploads/31c42cd4-bee4-40d8-ba66-0438b1c8dc85.png"
              alt="CoffeePolice mascot"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl shadow-md"
              loading="eager"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">CoffeePolice</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Your cheeky caffeine cop—smarter sips, better sleep.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile-Optimized Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-6xl mx-auto">
        {/* Compact Preferences Summary */}
        <section className="mb-6 sm:mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-amber-100 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-lg sm:text-2xl">🌙</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Bedtime</div>
                  <div className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{formatTime(preferences.bedtime)}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-amber-100 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-lg sm:text-2xl">☕</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Size</div>
                  <div className="text-sm sm:text-lg font-semibold text-gray-900">{preferences.serving_size}oz</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-amber-100 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-lg sm:text-2xl">⚡</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Shots</div>
                  <div className="text-sm sm:text-lg font-semibold text-gray-900">{preferences.shots}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-amber-100 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-lg sm:text-2xl">📊</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Limit</div>
                  <div className="text-sm sm:text-lg font-semibold text-gray-900">{preferences.caffeine_limit}mg</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <button 
              onClick={() => setShowPreferences(!showPreferences)}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white/80 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Edit Preferences</span>
              <span className="sm:hidden">Settings</span>
            </button>
          </div>
        </section>

        {/* Collapsible Preferences Panel */}
        {showPreferences && (
          <section className="mb-6 sm:mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-amber-100">
              <PreferencesDemo />
            </div>
          </section>
        )}

        {/* Mobile-Optimized Caffeine Tracker */}
        <section className="mb-6 sm:mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-amber-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Caffeine Status</h2>
                <p className="text-sm text-gray-600">Track your daily intake and sleep impact</p>
              </div>
              <Button
                onClick={() => setShowSmartTracker(!showSmartTracker)}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto min-h-[44px] border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                {showSmartTracker ? "Hide" : "Show"} Smart Tracker
              </Button>
            </div>
            
            {showSmartTracker ? (
              <SmartCaffeineTracker />
            ) : (
              <CaffeineTracker />
            )}
          </div>
        </section>

        {/* Recommendations Section */}
        <section className="mb-6 sm:mb-8">
          <RecommendationsSection
            currentTime="morning"
            currentEnergy="low"
            bedtime={localBedtime}
            hoursUntilBed={virtualHoursUntilBed}
            sizeOz={localSizeOz}
            shots={localShots}
            onSelect={setSelected}
            onLogSuccess={refreshStats}
            refreshCount={refreshCount}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        </section>

        {/* Coffee Browse Section */}
        <section>
          <CoffeeBrowseSection
            sizeOz={localSizeOz}
            shots={localShots}
            hoursUntilBed={virtualHoursUntilBed}
            onSelect={setSelected}
            onLogSuccess={refreshStats}
          />
        </section>
      </main>

      {/* Coffee Detail Dialog */}
      <CoffeeDetailDialog
        coffee={selected}
        sizeOz={localSizeOz}
        shots={localShots}
        hoursUntilBed={virtualHoursUntilBed}
        onClose={() => setSelected(null)}
      />
    </div>
  );
};

export default Ask;