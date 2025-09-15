import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useCoffeeLogs } from "@/hooks/useCoffeeLogs";
import { usePreferences } from "@/hooks/usePreferences";
import { 
  getCaffeineStatus, 
  formatDuration, 
  getCaffeineColor, 
  getCaffeineBgColor 
} from "@/lib/caffeineTracker";

interface SmartCaffeineTrackerProps {
  className?: string;
}

export const SmartCaffeineTracker = ({ className = "" }: SmartCaffeineTrackerProps) => {
  const { logs } = useCoffeeLogs();
  const { bedtime } = usePreferences();
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const caffeineStatus = useMemo(() => {
    return getCaffeineStatus(logs, bedtime, 400);
  }, [logs, bedtime, lastUpdate]);

  const progressPercentage = Math.min(100, (caffeineStatus.currentLevel / caffeineStatus.dailyLimit) * 100);
  const sleepRiskColor = caffeineStatus.sleepRisk === 'low' ? 'green' : 
                        caffeineStatus.sleepRisk === 'medium' ? 'yellow' : 'red';

  // Auto-refresh effect for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Force refresh when bedtime changes
  useEffect(() => {
    setLastUpdate(Date.now());
  }, [bedtime]);

  // Animation trigger when caffeine level changes
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [caffeineStatus.currentLevel]);

  return (
    <div className={`space-y-3 sm:space-y-6 ${className}`}>
      {/* Main Status Card */}
      <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-white backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-400/5 to-blue-400/5"></div>
        
        <CardHeader className="relative pb-2 sm:pb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-base sm:text-xl">🧬</span>
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Smart Caffeine Tracker</CardTitle>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Real-time caffeine monitoring & sleep optimization</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-3 sm:space-y-6">
          {/* Main Circular Progress & Current Level */}
          <div className="flex justify-center mb-4 sm:mb-8">
            <div className="relative">
              {/* Background Circle */}
              <svg className={`w-32 h-32 sm:w-48 sm:h-48 transform -rotate-90 transition-transform duration-500 ${isAnimating ? 'scale-105' : ''}`} viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="rgb(249 250 251)"
                  strokeWidth="6"
                />
                {/* Progress Circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke={`url(#gradient-${sleepRiskColor})`}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
                  className="transition-all duration-1000 ease-out"
                />
                {/* Gradient Definitions */}
                <defs>
                  <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgb(34 197 94)" />
                    <stop offset="100%" stopColor="rgb(22 163 74)" />
                  </linearGradient>
                  <linearGradient id="gradient-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgb(251 191 36)" />
                    <stop offset="100%" stopColor="rgb(245 158 11)" />
                  </linearGradient>
                  <linearGradient id="gradient-red" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgb(239 68 68)" />
                    <stop offset="100%" stopColor="rgb(220 38 38)" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-2xl sm:text-4xl font-black ${sleepRiskColor === 'green' ? 'text-green-600' : sleepRiskColor === 'yellow' ? 'text-yellow-600' : 'text-red-600'} ${isAnimating ? 'animate-pulse' : ''} tracking-tight`}>
                    {caffeineStatus.currentLevel}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-500 mt-1 tracking-wide">
                    mg active
                  </div>
                  <div className="text-xs text-gray-400 mt-1 hidden sm:block">
                    {progressPercentage.toFixed(0)}% of limit
                  </div>
                </div>
              </div>
              
              {/* Floating Status Icon */}
              <div className={`absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${sleepRiskColor === 'green' ? 'bg-green-100' : sleepRiskColor === 'yellow' ? 'bg-yellow-100' : 'bg-red-100'} shadow-lg border-2 sm:border-4 border-white transition-all duration-500 ${isAnimating ? 'scale-110' : ''}`}>
                <span className="text-lg sm:text-2xl">
                  {sleepRiskColor === 'green' ? '😴' : sleepRiskColor === 'yellow' ? '😪' : '😵'}
                </span>
              </div>
            </div>
          </div>

          {/* Current Level & Peak Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm font-medium text-blue-700">Today's High</span>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xs sm:text-sm">🔥</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-2xl font-bold text-blue-600">
                  {caffeineStatus.peakLevel}
                </span>
                <span className="text-xs sm:text-sm text-gray-600">mg</span>
              </div>
              <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                {caffeineStatus.peakLevel > caffeineStatus.currentLevel 
                  ? 'Maximum caffeine level today' 
                  : 'Current is your high'
                }
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm font-medium text-green-700">Remaining</span>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xs sm:text-sm">💧</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-2xl font-bold text-green-600">
                  {Math.max(0, caffeineStatus.dailyLimit - (progressPercentage / 100 * caffeineStatus.dailyLimit)).toFixed(0)}
                </span>
                <span className="text-xs sm:text-sm text-gray-600">mg</span>
              </div>
              <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                Safe to consume
              </div>
            </div>
          </div>

          {/* Real-time Status Header */}
          <div className="hidden sm:flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Live Tracking</span>
            </div>
            <div className="text-xs text-gray-500">
              Updated {new Date(lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Next Coffee Recommendation */}
          <div className={`p-4 rounded-xl border ${
            caffeineStatus.isSafeForNextCoffee 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
              : caffeineStatus.timeToNextCoffee < 60 
                ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
                : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                caffeineStatus.isSafeForNextCoffee 
                  ? 'bg-green-100 text-green-600' 
                  : caffeineStatus.timeToNextCoffee < 60 
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-red-100 text-red-600'
              }`}>
                <span className="text-lg">
                  {caffeineStatus.isSafeForNextCoffee ? '☕' : 
                   caffeineStatus.timeToNextCoffee < 60 ? '⏰' : '⏳'}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {caffeineStatus.isSafeForNextCoffee ? 'Have some more!' : 'WAIT!'}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {caffeineStatus.nextCoffeeRecommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Sleep Risk Assessment */}
          <div className={`p-4 rounded-xl border ${
            sleepRiskColor === 'green' 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
              : sleepRiskColor === 'yellow'
                ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
                : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                sleepRiskColor === 'green' 
                  ? 'bg-green-100 text-green-600' 
                  : sleepRiskColor === 'yellow'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-red-100 text-red-600'
              }`}>
                <span className="text-lg">
                  {sleepRiskColor === 'green' ? '😴' : 
                   sleepRiskColor === 'yellow' ? '😪' : '😵'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">Sleep Impact</h4>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      sleepRiskColor === 'green' 
                        ? 'border-green-200 text-green-700 bg-green-50' 
                        : sleepRiskColor === 'yellow'
                          ? 'border-yellow-200 text-yellow-700 bg-yellow-50'
                          : 'border-red-200 text-red-700 bg-red-50'
                    }`}
                  >
                    {caffeineStatus.sleepRisk.toUpperCase()} RISK
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {caffeineStatus.sleepRiskMessage}
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  Bedtime in {formatDuration(caffeineStatus.timeToBedtime)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Stats Grid */}
      <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Clearance Rate */}
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-md sm:rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xs sm:text-sm">🔄</span>
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">Clearance Rate</span>
            </div>
            <div className="space-y-1">
              <span className="text-base sm:text-lg font-bold text-purple-600">
                {Math.round(caffeineStatus.currentLevel / 5)}mg/hr
              </span>
              <div className="text-xs text-gray-500">
                Metabolizing now
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Caffeine Status */}
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 rounded-md sm:rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 text-xs sm:text-sm">
                  {caffeineStatus.currentLevel > 50 ? '⏳' : '✅'}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                {caffeineStatus.currentLevel > 50 ? 'Time to Sleep-Safe' : 'Sleep Status'}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-base sm:text-lg font-bold text-indigo-600">
                {caffeineStatus.currentLevel > 50 
                  ? (() => {
                      // Calculate time to reach 50mg (safe for sleep)
                      // Using half-life formula: time = (ln(initial/final) / ln(2)) * half_life
                      const timeToSafeLevel = (Math.log(caffeineStatus.currentLevel / 50) / Math.log(2)) * 5 * 60;
                      return formatDuration(Math.max(0, timeToSafeLevel));
                    })()
                  : 'Sleep-Safe'
                }
              </span>
              <div className="text-xs text-gray-500">
                {caffeineStatus.currentLevel > 50 
                  ? 'Until ≤50mg for good sleep' 
                  : 'Safe for quality sleep'
                }
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Half-Life Progress */}
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-md sm:rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-xs sm:text-sm">⏱️</span>
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">Half-Life</span>
            </div>
            <div className="space-y-1">
              <span className="text-base sm:text-lg font-bold text-orange-600">5h</span>
              <div className="text-xs text-gray-500">
                50% elimination time
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scientific Info */}
      <Card className="hidden sm:block bg-gradient-to-r from-gray-50 to-blue-50/30 border border-gray-200 shadow-lg">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
              <span className="text-white text-sm sm:text-lg">🧪</span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">How It Works</h3>
              <p className="text-xs sm:text-sm text-gray-600">Science behind caffeine metabolism</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="p-2 sm:p-3 bg-white/60 rounded-lg border border-blue-100">
              <div className="font-medium text-blue-900 mb-1 text-xs sm:text-sm">⚡ Absorption</div>
              <div className="text-gray-600 text-xs leading-relaxed">
                Caffeine peaks in your bloodstream 30-60 minutes after consumption
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-white/60 rounded-lg border border-green-100">
              <div className="font-medium text-green-900 mb-1 text-xs sm:text-sm">🔄 Metabolism</div>
              <div className="text-gray-600 text-xs leading-relaxed">
                Your liver processes ~50% of caffeine every 5 hours (half-life)
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-white/60 rounded-lg border border-purple-100">
              <div className="font-medium text-purple-900 mb-1 text-xs sm:text-sm">😴 Sleep Impact</div>
              <div className="text-gray-600 text-xs leading-relaxed">
                Less than 50mg at bedtime ensures quality sleep
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
