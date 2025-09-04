import { useEffect, useMemo, useState } from "react";
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
import EnhancedCaffeineTracker from "@/components/EnhancedCaffeineTracker";
import { CaffeineGuidanceBanner } from "@/components/CaffeineGuidanceBanner";
import { useCaffeineTracker } from "@/hooks/useCaffeineTracker";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Ask = () => {
  const isMobile = useIsMobile();
  
  // Install functionality
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

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
  const [showCoffeeGuide, setShowCoffeeGuide] = useState<boolean>(false);
  
  // Update local state when preferences change
  const [localBedtime, setLocalBedtime] = useState<string>(bedtime);
  const [localSizeOz, setLocalSizeOz] = useState<SizeOz>(servingSize as SizeOz);
  const [localShots, setLocalShots] = useState<1 | 2 | 3>(shots);

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

  // Install functionality
  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user is on iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto">
        <header className="mb-8 sm:mb-12">
          {/* Top controls */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-2">
              {isMobile && !isInstalled && (deferredPrompt || isIOS) && (
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  variant="outline"
                  className="text-xs px-3 py-1.5 h-8"
                >
                  📱 Install
                </Button>
              )}
            </div>
            <ThemeToggle />
          </div>

          {/* Hero section */}
          <div className="text-center space-y-6">
            {/* Logo and branding */}
            <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-amber-50/80 to-orange-50/60 rounded-3xl border border-amber-100/50 shadow-sm">
              <div className="relative">
                <img
                  src="/lovable-uploads/64b50735-018a-49d7-8568-11d380b32163.png"
                  alt="CoffeePolice mascot logo"
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl shadow-lg"
                  loading="lazy"
                />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs">⚡</span>
                </div>
              </div>
              
              <div className="text-left">
                <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-1">
                  Coffee Police
                </h1>
                <p className="text-gray-600 text-base sm:text-xl font-medium">
                  Smart caffeine tracking
                </p>
              </div>
            </div>

            {/* Tagline and CTA */}
            <div className="max-w-2xl mx-auto space-y-4">
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Policing your caffeine intake with <span className="text-amber-600 font-semibold">time-smart picks</span> and personalized recommendations
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => setShowCoffeeGuide(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 text-base font-medium"
                >
                  📋 Explore Coffee Guide
                </Button>
                
                {caffeineStatus && (
                  <div className="text-sm text-muted-foreground">
                    Current caffeine: <span className="font-semibold text-amber-600">{caffeineStatus.currentLevel}mg</span>
                  </div>
                )}
              </div>
            </div>
          </div>
         </header>

                                   {/* Preferences Section - Always Visible */}
          <section className="mb-6 sm:mb-10">
            <div className="bg-card rounded-lg border p-6 sm:p-8">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                                 <div>
                   <h2 className="text-base sm:text-lg font-semibold text-foreground">Smart Preferences</h2>
                   <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">No caffeine 8+ hours before bedtime ensures sound sleep.</p>
                 </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowPreferences(!showPreferences)}
                  className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="hidden sm:inline">{showPreferences ? "Hide" : "Edit"}</span>
                  {/* <span className="sm:hidden">⚙️</span> */}
            </Button>
          </div>
              
                             {/* Current Settings Summary */}
               <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4">
                 <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                   <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                     <span className="text-blue-600 text-xs sm:text-sm">⚡</span>
                   </div>
                   <div className="min-w-0">
                     <p className="text-xs text-gray-500 font-medium">Time of Day</p>
                     <p className="text-xs sm:text-sm font-semibold text-gray-900 capitalize truncate">{currentTime}</p>
                   </div>
                 </div>
                                 <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-green-50/50 rounded-xl border border-green-100">
                   <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                     <span className="text-green-600 text-xs sm:text-sm">🛡️</span>
                   </div>
                   <div className="min-w-0">
                     <p className="text-xs text-gray-500 font-medium">Safe Limit</p>
                     <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">≤50mg sleep</p>
                   </div>
                 </div>
                                                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                   <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                     <span className="text-purple-600 text-xs sm:text-sm">🛏️</span>
                   </div>
                   <div className="min-w-0">
                     <p className="text-xs text-gray-500 font-medium">Bed time</p>
                     <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{localBedtime}</p>
                   </div>
                 </div>
                 
                                   {/* Coffee Stats Summary */}
                  {coffeeStats && (
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-600 text-xs sm:text-sm">📊</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Today's Caffeine</p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{coffeeStats.totalCaffeineToday}mg</p>
                      </div>
                    </div>
                  )}
                   </div>
                   
            {/* Expandable Preferences - Improved Design */}
            {showPreferences && (
              <div className="p-6 bg-gradient-to-r from-amber-50/70 to-orange-50/50 rounded-xl border border-amber-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <span className="text-amber-600 text-lg">⚙️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Edit Your Preferences</h3>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <BedtimeControl value={localBedtime} onChange={setLocalBedtime} />
                  <ServingControl sizeOz={localSizeOz} onSizeChange={setLocalSizeOz} shots={localShots} onShotsChange={setLocalShots} />
                </div>
                <div className="mt-6 pt-4 border-t border-amber-200">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    💡 <strong>Tip:</strong> Changes are automatically saved and will affect your coffee recommendations immediately.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Enhanced Caffeine Tracking Section */}
        <section className="mb-10">
          <div className="bg-card rounded-lg border p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Caffeine Tracking</h3>
                <p className="hidden sm:block text-sm text-muted-foreground">Monitor your daily caffeine intake and sleep impact</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSmartTracker(!showSmartTracker)}
                className="text-blue-700 hover:text-blue-800 hover:bg-blue-50 flex items-center gap-2 px-3 py-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {showSmartTracker ? "Simple View" : "Smart View"}
              </Button>
            </div>
          
            {showSmartTracker ? (
              <EnhancedCaffeineTracker />
            ) : (
              <CaffeineTracker compact={true} />
            )}
          </div>
        </section>
            
        {/* Recently Logged Coffees with Undo */}
        <section className="mb-8">
          <RecentLogUndo 
            showCount={3} 
            onUndo={refreshStats}
          />
        </section>

                                   {/* Coffee Recommendations & Browse Section */}
          <article className="mb-16">
            <div className="bg-card rounded-lg border p-8 sm:p-10">
              
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
        </article>



        {/* Coffee Detail Dialog */}
        <CoffeeDetailDialog
          coffee={selected}
          sizeOz={localSizeOz}
          shots={localShots}
          hoursUntilBed={virtualHoursUntilBed}
          onClose={() => setSelected(null)}
        />

        {/* Coffee Guide Dialog */}
        <Dialog open={showCoffeeGuide} onOpenChange={setShowCoffeeGuide}>
          <DialogContent className="w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto !p-6">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl">Coffee Guide - What's What?</DialogTitle>
            </DialogHeader>
            
                          <div className="space-y-6">
                <div className="text-center">
                {/* <p className="text-sm text-gray-600 mb-4">
                  Click on the image below to see what different coffee drinks look like and their typical caffeine content.
                </p> */}
                <div className="relative inline-block">
                  <img
                    src="/lovable-uploads/poster.png"
                    alt="Coffee Guide - Different types of coffee drinks and their content"
                    className="w-[95%] sm:w-full max-w-2xl rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300"
                    onClick={() => {
                      // Open image in new tab for full view
                      window.open('/lovable-uploads/poster.png', '_blank');
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 rounded-lg flex items-center justify-center">
                    {/* <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-full p-3">
                      <span className="text-gray-700 text-sm font-medium">🔍 Click to enlarge</span>
                    </div> */}
                  </div>
                </div>
              </div>
              
              {/* <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-2">💡 How to use this guide:</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• <strong>Espresso-based drinks</strong> - Concentrated caffeine, quick energy</li>
                  <li>• <strong>Milk-based drinks</strong> - Balanced caffeine with creamy texture</li>
                  <li>• <strong>Brewed coffee</strong> - Traditional coffee with varying strengths</li>
                  <li>• <strong>Caffeine amounts</strong> shown are typical ranges for standard servings</li>
                </ul>
              </div> */}
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </main>
  );
};

export default Ask;