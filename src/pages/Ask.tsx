import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CoffeeItem } from "@/data/coffees";
import { TimeOfDay, getTimeOfDay, defaultEnergyForTime } from "@/hooks/useTimeOfDay";
import { EnergyLevel } from "@/lib/recommendation";
import { hoursUntilBedtime } from "@/lib/timeUtils";
import { usePreferences } from "@/hooks/usePreferences";
import { useCoffeeLogs } from "@/hooks/useCoffeeLogs";
import CaffeineTracker from "@/components/CaffeineTracker";
import RecentLogUndo from "@/components/RecentLogUndo";
import { RecommendationsSection } from "@/components/RecommendationsSection";
import { CoffeeBrowseSection } from "@/components/CoffeeBrowseSection";
import { CoffeeDetailDialog } from "@/components/CoffeeDetailDialog";
import { FloatingLogButton } from "@/components/FloatingLogButton";
import { useCaffeineTracker } from "@/hooks/useCaffeineTracker";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLovableUploadPath } from "@/lib/imageUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import CoffeeLogHistory from "@/components/CoffeeLogHistory";
import { getCaffeineColor, getCaffeineBgColor } from "@/lib/caffeineTracker";
import WeeklyCaffeineChart from "@/components/WeeklyCaffeineChart";
import CaffeineStatusHero from "@/components/CaffeineStatusHero";
import CaffeineProfileCard from "@/components/CaffeineProfileCard";
import SettingsSheet from "@/components/SettingsSheet";
import EnergyPeakCard from "@/components/EnergyPeakCard";
import { usePeakEnergy } from "@/hooks/usePeakEnergy";
import { Settings, ChevronDown, ChevronUp } from "lucide-react";
import SleepHistoryCard from "@/components/SleepHistoryCard";

const Ask = () => {
  const isMobile = useIsMobile();
  
  // Install functionality
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Load user preferences
  const { 
    bedtime, 
    updatePreference,
    quickLogMode,
    favoriteCoffees,
    isLoading: preferencesLoading 
  } = usePreferences();

  // Load coffee logs
  const { stats: coffeeStats, refreshStats } = useCoffeeLogs();
  const {
    caffeineStatus,
    guidance,
    timeToBedtimeFormatted,
    caffeineLevelPercentage,
    getSleepRiskColor,
    getSleepRiskIcon,
    canHaveCoffee,
    refreshCaffeineStatus
  } = useCaffeineTracker();
  const { bedtime: prefBedtime, caffeineLimit } = usePreferences();
  
  // Peak energy tracking
  const { activePeak, dismissPeak } = usePeakEnergy();

  // Auto-detect time of day and energy level from local time
  const [currentTime, setCurrentTime] = useState<TimeOfDay>(getTimeOfDay());
  const [currentEnergy, setCurrentEnergy] = useState<EnergyLevel>(defaultEnergyForTime[getTimeOfDay()]);
  
  const [selected, setSelected] = useState<CoffeeItem | null>(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState<boolean>(false);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showCoffeeGuide, setShowCoffeeGuide] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<string>("recommendations");
  const [mainTab, setMainTab] = useState<string>("dashboard");
  const [showCaffeineScience, setShowCaffeineScience] = useState<boolean>(false);
  const [showTipsSection, setShowTipsSection] = useState<boolean>(false);
  
  // Update local state when preferences change
  const [localBedtime, setLocalBedtime] = useState<string>(bedtime);

  // Sync local state with preferences
  useEffect(() => {
    if (!preferencesLoading) {
      setLocalBedtime(bedtime);
    }
  }, [bedtime, preferencesLoading]);

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
    document.title = "Your Caffeine Cop";
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

  const caffeineColor = getCaffeineColor(caffeineStatus.currentLevel, caffeineStatus.dailyLimit);
  const caffeineBgColor = getCaffeineBgColor(caffeineStatus.currentLevel, caffeineStatus.dailyLimit);

  const bedtimeFormatted = useMemo(() => {
    const [hours, minutes] = bedtime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }, [bedtime]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/30">
      <section className="px-3 sm:px-6 py-3 sm:py-8 pb-16 sm:pb-8 max-w-6xl mx-auto">
        <header className="mb-4 sm:mb-12 relative">
          {/* Top right buttons - Install only */}
          <div className="absolute top-0 right-0 z-10 flex items-center gap-2">
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

          {/* Hero section */}
          <div className="text-center space-y-4 sm:space-y-6">
            {/* Logo and branding */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              <div className="relative">
                <img
                  src={getLovableUploadPath("31c42cd4-bee4-40d8-ba66-0438b1c8dc85.png")}
                  alt="CoffeePolice mascot logo"
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl shadow-md"
                  loading="lazy"
                />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs">⚡</span>
                </div>
              </div>
              
              <div className="text-center sm:text-left space-y-1 sm:space-y-2">
                <h1 className="text-2xl sm:text-5xl font-black tracking-tight text-gray-900">
                  Coffee Police
                </h1>
                {/* <p className="text-gray-600 text-sm sm:text-lg text-center font-medium">
                  Smart caffeine tracking
                </p> */}
              </div>
            </div>

            {/* Tagline and CTA */}
            <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
              <p className="hidden sm:block text-gray-600 text-sm sm:text-base leading-relaxed">
                Policing your caffeine intake with{" "}
                <span className="text-amber-600 font-semibold">time-smart picks</span> and personalized recommendations
              </p>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCoffeeGuide(true)}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50/50 text-sm px-4 py-2 rounded-lg border border-amber-200/50 hover:border-amber-300 transition-all duration-200"
              >
                📋 Coffee Guide
              </Button>
            </div>
          </div>
        </header>

        {/* Main Navigation with Settings */}
        <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
          <div className="flex items-center gap-2 mb-4 sm:mb-8">
            <TabsList className="grid flex-1 grid-cols-3 bg-gray-100 p-1 rounded-2xl h-11 sm:h-12">
              <TabsTrigger
                value="dashboard"
                className="text-xs sm:text-sm font-semibold px-2 sm:px-4 py-2 rounded-xl transition-all duration-300 ease-out data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md data-[state=inactive]:text-gray-600"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="text-xs sm:text-sm font-semibold px-2 sm:px-4 py-2 rounded-xl transition-all duration-300 ease-out data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md data-[state=inactive]:text-gray-600"
              >
                Insights
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="text-xs sm:text-sm font-semibold px-2 sm:px-4 py-2 rounded-xl transition-all duration-300 ease-out data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md data-[state=inactive]:text-gray-600"
              >
                History
              </TabsTrigger>
            </TabsList>
            
            <Button
              onClick={() => setShowSettingsDialog(true)}
              variant="ghost"
              size="icon"
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-all duration-300 shadow-sm"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </Button>
          </div>

          {/* ===== DASHBOARD TAB ===== */}
          <TabsContent value="dashboard" className="mt-0 space-y-4 sm:space-y-6">

        {/* 1. Caffeine Tracking — Status first with bedtime */}
        <section>
          <div className="bg-card rounded-lg border p-4 sm:p-6">
            <CaffeineTracker compact={true} onOpenSettings={() => setShowSettingsDialog(true)} />
          </div>
        </section>

        {/* 2. Recently Logged */}
        <section>
          <RecentLogUndo
            showCount={2}
            onUndo={refreshStats}
          />
        </section>

        {/* 3. Coffee Recommendations & Browse */}
        <article>
          <div className="bg-card rounded-lg border p-4 sm:p-6 md:p-10">
            <Tabs value={mobileTab} onValueChange={setMobileTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 bg-gray-100 p-1 rounded-xl sm:rounded-2xl h-10 sm:h-12">
                <TabsTrigger
                  value="recommendations"
                  className="text-xs sm:text-sm font-semibold px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 ease-out data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800 data-[state=inactive]:hover:bg-gray-50"
                >
                  Recommendations
                </TabsTrigger>
                <TabsTrigger
                  value="search"
                  className="text-xs sm:text-sm font-semibold px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 ease-out data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800 data-[state=inactive]:hover:bg-gray-50"
                >
                  Explore
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recommendations" className="mt-0">
                <RecommendationsSection
                  currentTime={currentTime}
                  currentEnergy={currentEnergy}
                  hoursUntilBed={virtualHoursUntilBed}
                  bedtime={localBedtime}
                  refreshCount={refreshCount}
                  isRefreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  onSelect={setSelected}
                  onLogSuccess={refreshStats}
                />
              </TabsContent>

              <TabsContent value="search" className="mt-0">
                <CoffeeBrowseSection
                  hoursUntilBed={virtualHoursUntilBed}
                  onSelect={setSelected}
                  onLogSuccess={refreshStats}
                />
              </TabsContent>
            </Tabs>
          </div>
        </article>

          </TabsContent>

          {/* ===== INSIGHTS TAB ===== */}
          <TabsContent value="insights" className="mt-0 space-y-4 sm:space-y-6">
            {/* Caffeine Status Hero */}
            <CaffeineStatusHero
              caffeineStatus={caffeineStatus}
              guidance={guidance}
              timeToBedtimeFormatted={timeToBedtimeFormatted}
              bedtimeFormatted={bedtimeFormatted}
            />

            {/* Caffeine Profile — patterns & badges */}
            <CaffeineProfileCard />

            {/* Caffeine Science & Smart Tips - Collapsible */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
              {/* Caffeine Science - HOW caffeine works (educational) */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 overflow-hidden">
                <button
                  onClick={() => setShowCaffeineScience(!showCaffeineScience)}
                  className="w-full text-left"
                >
                  <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-1.5 sm:gap-2">
                      <span className="text-sm sm:text-base">🧪</span> How Caffeine Works
                    </CardTitle>
                    {showCaffeineScience ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    )}
                  </CardHeader>
                </button>
                {showCaffeineScience && (
                  <CardContent className="space-y-2 sm:space-y-3 pt-0 px-3 sm:px-4 pb-3 sm:pb-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-2.5 sm:p-3 bg-white/60 rounded-lg border border-blue-100">
                      <div className="font-medium text-blue-900 mb-0.5 sm:mb-1 text-xs sm:text-sm">⚡ Absorption</div>
                      <div className="text-gray-600 text-[10px] sm:text-xs">Caffeine enters your bloodstream in 15 min, peaks at 30-60 min, then gradually declines</div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-white/60 rounded-lg border border-green-100">
                      <div className="font-medium text-green-900 mb-0.5 sm:mb-1 text-xs sm:text-sm">🔄 Decay Rate</div>
                      <div className="text-gray-600 text-[10px] sm:text-xs">Every 5 hours, half is eliminated. 200mg → 100mg (5h) → 50mg (10h) → 25mg (15h)</div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-white/60 rounded-lg border border-purple-100">
                      <div className="font-medium text-purple-900 mb-0.5 sm:mb-1 text-xs sm:text-sm">🧠 Brain Chemistry</div>
                      <div className="text-gray-600 text-[10px] sm:text-xs">Caffeine blocks adenosine receptors, preventing the "sleepy" signal from reaching your brain</div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-white/60 rounded-lg border border-indigo-100">
                      <div className="font-medium text-indigo-900 mb-0.5 sm:mb-1 text-xs sm:text-sm">👤 Individual Variation</div>
                      <div className="text-gray-600 text-[10px] sm:text-xs">Genetics affect how fast you metabolize caffeine — some people are "slow metabolizers"</div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Smart Tips - WHAT to do (actionable, personalized) */}
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 overflow-hidden">
                <button
                  onClick={() => setShowTipsSection(!showTipsSection)}
                  className="w-full text-left"
                >
                  <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-1.5 sm:gap-2">
                      <span className="text-sm sm:text-base">💡</span> Tips for You
                    </CardTitle>
                    {showTipsSection ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                    )}
                  </CardHeader>
                </button>
                {showTipsSection && (
                  <CardContent className="space-y-2 sm:space-y-3 pt-0 px-3 sm:px-4 pb-3 sm:pb-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="p-2.5 sm:p-3 bg-white/60 rounded-lg border border-amber-100">
                      <div className="font-medium text-amber-900 mb-0.5 sm:mb-1 text-xs sm:text-sm">🌅 Morning Routine</div>
                      <div className="text-gray-600 text-[10px] sm:text-xs">Wait 90 min after waking — let cortisol peak naturally first, then caffeine works better</div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-amber-100/70 rounded-lg border border-amber-300">
                      <div className="font-medium text-amber-900 mb-0.5 sm:mb-1 text-xs sm:text-sm">⏰ Your Cutoff Time</div>
                      <div className="text-gray-700 text-[10px] sm:text-xs font-medium">
                        Based on your {localBedtime} bedtime → Last coffee by{' '}
                        {(() => {
                          const [h, m] = localBedtime.split(':').map(Number);
                          const cutoffHour = (h - 8 + 24) % 24;
                          const period = cutoffHour >= 12 ? 'PM' : 'AM';
                          const displayHour = cutoffHour > 12 ? cutoffHour - 12 : cutoffHour === 0 ? 12 : cutoffHour;
                          return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
                        })()}
                      </div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-white/60 rounded-lg border border-orange-100">
                      <div className="font-medium text-orange-900 mb-0.5 sm:mb-1 text-xs sm:text-sm">🍎 Pair with Food</div>
                      <div className="text-gray-600 text-[10px] sm:text-xs">Eating slows caffeine absorption, giving you a smoother, longer-lasting energy boost</div>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-white/60 rounded-lg border border-blue-100">
                      <div className="font-medium text-blue-900 mb-0.5 sm:mb-1 text-xs sm:text-sm">💧 Stay Hydrated</div>
                      <div className="text-gray-600 text-[10px] sm:text-xs">Coffee is a mild diuretic — drink a glass of water for every cup of coffee</div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* ===== HISTORY TAB ===== */}
          <TabsContent value="history" className="mt-0 space-y-4 sm:space-y-6">
            {/* Quick Stats — 4 key metrics */}
            {coffeeStats && (
              <Card>
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-green-700">{Math.round(coffeeStats.averageCaffeinePerDay)}</div>
                      <div className="text-xs sm:text-sm text-gray-600">mg/day avg</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-blue-700">
                        {coffeeStats.peakConsumptionHour > 12
                          ? `${coffeeStats.peakConsumptionHour - 12} PM`
                          : coffeeStats.peakConsumptionHour === 0
                            ? '12 AM'
                            : coffeeStats.peakConsumptionHour === 12
                              ? '12 PM'
                              : `${coffeeStats.peakConsumptionHour} AM`}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Peak consumption</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-orange-700">{coffeeStats.totalDaysWithLogs}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Days logging</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-purple-700">{favoriteCoffees?.length ?? 0}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Favorited drinks</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weekly Trends Chart */}
            <WeeklyCaffeineChart />

            {/* Sleep Quality History */}
            <SleepHistoryCard />

            {/* Full Coffee Log History */}
            <CoffeeLogHistory />
          </TabsContent>
        </Tabs>

        {/* Coffee Detail Dialog */}
        <CoffeeDetailDialog
          coffee={selected}
          hoursUntilBed={virtualHoursUntilBed}
          onClose={() => setSelected(null)}
        />

        {/* Settings Sheet */}
        <SettingsSheet 
          open={showSettingsDialog} 
          onOpenChange={setShowSettingsDialog} 
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
                    src={getLovableUploadPath("poster.png")}
                    alt="Coffee Guide - Different types of coffee drinks and their content"
                    className="w-[95%] sm:w-full max-w-2xl rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300"
                    onClick={() => {
                      // Open image in new tab for full view
                      window.open(getLovableUploadPath("poster.png"), '_blank');
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