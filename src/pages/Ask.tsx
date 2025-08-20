import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CoffeeItem } from "@/data/coffees";
import { TimeOfDay, getTimeOfDay, defaultEnergyForTime } from "@/hooks/useTimeOfDay";
import { EnergyLevel } from "@/lib/recommendation";
import { hoursUntilBedtime } from "@/lib/timeUtils";
import BedtimeControl from "@/components/BedtimeControl";
import ServingControl from "@/components/ServingControl";
import { SizeOz } from "@/lib/serving";
import { usePreferences } from "@/hooks/usePreferences";
import { useCoffeeLogs } from "@/hooks/useCoffeeLogs";
import CaffeineTracker from "@/components/CaffeineTracker";
import RecentLogUndo from "@/components/RecentLogUndo";
import { RecommendationsSection } from "@/components/RecommendationsSection";
import { CoffeeBrowseSection } from "@/components/CoffeeBrowseSection";
import { CoffeeDetailDialog } from "@/components/CoffeeDetailDialog";
import { SmartCaffeineTracker } from "@/components/SmartCaffeineTracker";
import { CaffeineGuidanceBanner } from "@/components/CaffeineGuidanceBanner";
import { useCaffeineTracker } from "@/hooks/useCaffeineTracker";

const Ask = () => {
  // Load user preferences
  const { 
    bedtime, 
    servingSize, 
    shots, 
    updatePreference,
    isLoading: preferencesLoading 
  } = usePreferences();

  // Load coffee logs
  const { stats: coffeeStats, refreshStats } = useCoffeeLogs();
  const { caffeineStatus } = useCaffeineTracker();

  // Auto-detect time of day and energy level from local time
  const [currentTime, setCurrentTime] = useState<TimeOfDay>(getTimeOfDay());
  const [currentEnergy, setCurrentEnergy] = useState<EnergyLevel>(defaultEnergyForTime[getTimeOfDay()]);
  
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
  
  // Auto-update time and energy level every minute
  useEffect(() => {
    const updateTimeAndEnergy = () => {
      const newTime = getTimeOfDay();
      setCurrentTime(newTime);
      setCurrentEnergy(defaultEnergyForTime[newTime]);
    };

    // Update immediately
    updateTimeAndEnergy();

    // Update every minute
    const interval = setInterval(updateTimeAndEnergy, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.title = "Ask CoffeePolice – Smart coffee picks";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Browse coffees, see half-life charts, and get time-smart picks.");
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/30">
      <section className="px-6 py-8 max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative">
              <img
                src="/lovable-uploads/31c42cd4-bee4-40d8-ba66-0438b1c8dc85.png"
                alt="CoffeePolice mascot logo"
                className="h-12 w-12 rounded-xl shadow-lg"
                loading="lazy"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl blur opacity-20"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Ask CoffeePolice</h1>
              <p className="text-gray-600">Time‑aware picks with caffeine half‑life guidance</p>
            </div>
          </div>
         </header>

                                   {/* Preferences Section - Always Visible */}
          <section className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-100/50">
              <div className="flex items-center justify-between mb-4">
                                 <div>
                   <h2 className="text-lg font-semibold text-gray-900">Smart Preferences</h2>
                   <p className="text-sm text-gray-600">No caffeine 8+ hours before bedtime ensures sound sleep.</p>
                 </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowPreferences(!showPreferences)}
                  className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                                     {showPreferences ? "Hide" : "Edit Preferences"}
            </Button>
          </div>
              
                             {/* Current Settings Summary */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                 <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                   <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                     <span className="text-blue-600 text-sm">⚡</span>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500 font-medium">Time of the Day</p>
                     <p className="text-sm font-semibold text-gray-900 capitalize">{currentTime}</p>
                   </div>
                 </div>
                                 <div className="flex items-center gap-3 p-3 bg-green-50/50 rounded-xl border border-green-100">
                   <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                     <span className="text-green-600 text-sm">🛡️</span>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500 font-medium">Safe Limit</p>
                     <p className="text-sm font-semibold text-gray-900">≤50mg for good sleep</p>
                   </div>
                 </div>
                                                    <div className="flex items-center gap-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                   <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                     <span className="text-purple-600 text-sm">🛏️</span>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500 font-medium">Bed time</p>
                     <p className="text-sm font-semibold text-gray-900">{localBedtime}</p>
                   </div>
                 </div>
                 
                                   {/* Coffee Stats Summary */}
                  {coffeeStats && (
                    <div className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <span className="text-amber-600 text-sm">📊</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Today's Caffeine</p>
                        <p className="text-sm font-semibold text-gray-900">{coffeeStats.totalCaffeineToday}mg</p>
                      </div>
                    </div>
                  )}
                   </div>
                   
            {/* Expandable Preferences - Moved here for better visibility */}
            {showPreferences && (
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50/50 to-orange-50/30 rounded-xl border border-amber-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                    <span className="text-amber-600 text-sm">⚙️</span>
                   </div>
                  <h3 className="text-lg font-semibold text-gray-900">Edit Your Preferences</h3>
              </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <BedtimeControl value={localBedtime} onChange={setLocalBedtime} />
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Serving Size</label>
                      <ServingControl sizeOz={localSizeOz} onSizeChange={setLocalSizeOz} shots={localShots} onShotsChange={setLocalShots} />
                    </div>
                  </div>
                <div className="mt-4 pt-4 border-t border-amber-200">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    💡 <strong>Tip:</strong> Changes are automatically saved and will affect your coffee recommendations immediately.
                        </p>
                      </div>
                    </div>
              )}
                  
            {/* Caffeine Tracker */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Caffeine Tracking</h3>
                                     <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSmartTracker(!showSmartTracker)}
                  className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                     </svg>
                  {showSmartTracker ? "Simple View" : "Smart Tracker"}
                   </Button>
          </div>
          
              {showSmartTracker ? (
                <SmartCaffeineTracker />
              ) : (
                <CaffeineTracker compact={true} />
                             )}
                           </div>
            
            {/* Recently Logged Coffees with Undo */}
            <div className="mb-6">
              <RecentLogUndo 
                showCount={3} 
                onUndo={refreshStats}
                             />
                          </div>
                     </div>
          </section>

                                   {/* Coffee Recommendations & Browse Section */}
          <article className="mb-16">
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-100/30 via-transparent to-orange-100/30 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-amber-100/50 shadow-xl">
              
                            {/* Caffeine Guidance Warning */}
              {/* {caffeineStatus && (
                <CaffeineGuidanceBanner 
                  currentCaffeine={caffeineStatus.currentLevel}
                  timeToBedtime={virtualHoursUntilBed * 60}
                  dailyProgress={caffeineStatus.dailyProgress}
                  className="mb-8"
                />
              )} */}

              {/* Recommendations Section */}
              <RecommendationsSection
                currentTime={currentTime}
                currentEnergy={currentEnergy}
                hoursUntilBed={virtualHoursUntilBed}
                bedtime={localBedtime}
                sizeOz={localSizeOz}
                shots={localShots}
                refreshCount={refreshCount}
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
                onSelect={setSelected}
                onLogSuccess={refreshStats}
              />

              {/* Browse Section */}
              <CoffeeBrowseSection
                sizeOz={localSizeOz}
                shots={localShots}
                hoursUntilBed={virtualHoursUntilBed}
                onSelect={setSelected}
                onLogSuccess={refreshStats}
              />
              
             </div>
          </div>
        </article>

        <div className="text-center">
          <Link to="/">
            <Button variant="outline" className="px-8 py-3 text-lg font-medium border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-colors">
              ← Back to Home
            </Button>
          </Link>
        </div>

        {/* Coffee Detail Dialog */}
        <CoffeeDetailDialog
          coffee={selected}
          sizeOz={localSizeOz}
          shots={localShots}
          hoursUntilBed={virtualHoursUntilBed}
          onClose={() => setSelected(null)}
        />
      </section>
    </main>
  );
};

export default Ask;