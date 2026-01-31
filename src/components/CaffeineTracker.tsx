import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useCaffeineTracker } from '@/hooks/useCaffeineTracker';
import { usePreferences } from '@/hooks/usePreferences';
import { getCaffeineColor, getCaffeineBgColor, getCaffeineLevelBand, CaffeineGuidance } from '@/lib/caffeineTracker';

// Helper component to render guidance icons (SVG or emoji)
const GuidanceIcon = ({ guidance, className = "" }: { guidance: CaffeineGuidance, className?: string }) => {
  if (guidance.iconType === 'svg' && guidance.iconPath) {
    return (
      <img 
        src={guidance.iconPath} 
        alt={guidance.title}
        className={`w-full h-full object-contain ${className}`}
      />
    );
  }
  return <span className={className}>{guidance.icon}</span>;
};

interface CaffeineTrackerProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
  onOpenSettings?: () => void;
}

const CaffeineTracker = ({ className = '', showDetails = true, compact = false, onOpenSettings }: CaffeineTrackerProps) => {
  const {
    caffeineStatus,
    guidance,
    timeToBedtimeFormatted,
    caffeineLevelPercentage,
    getSleepRiskColor,
    getSleepRiskIcon,
    canHaveCoffee
  } = useCaffeineTracker();
  
  const { bedtime } = usePreferences();

  const [isAnimating, setIsAnimating] = useState(false);

  // Trigger animation when caffeine level changes
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [caffeineStatus.currentLevel]);

  // Format bedtime for display (e.g., "11:00 PM")
  const bedtimeFormatted = useMemo(() => {
    const [hours, minutes] = bedtime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }, [bedtime]);

  // Use guidance-based colors for consistency
  const caffeineColor = guidance.color === 'green' ? 'text-green-600' : 
                        guidance.color === 'yellow' ? 'text-yellow-600' : 'text-red-600';
  const caffeineBgColor = guidance.color === 'green' ? 'bg-green-100' : 
                          guidance.color === 'yellow' ? 'bg-yellow-100' : 'bg-red-100';

  if (compact) {
    const levelBand = getCaffeineLevelBand(caffeineStatus.currentLevel);
    const statusLine = caffeineStatus.currentLevel === 0 ? "Your system is clear" : levelBand.label;

    const isOverLimit = caffeineStatus.dailyConsumed >= caffeineStatus.dailyLimit;

    return (
      <div className={`${className} space-y-2 sm:space-y-3`}>
        {/* Main Tracker Card */}
        <Card className={`overflow-hidden bg-white border border-gray-200 shadow-sm transition-all duration-300 ${isAnimating ? 'scale-[1.02] shadow-md' : ''}`}>
          <CardContent className="p-3 sm:p-4">
            {/* Status Header */}
            <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center ${caffeineBgColor} shadow-sm p-1.5 sm:p-2`}>
                <GuidanceIcon guidance={guidance} className="text-base sm:text-lg" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className={`text-xl sm:text-2xl font-bold ${caffeineColor}`}>
                    {caffeineStatus.currentLevel}mg
                  </span>
                  <span className="text-xs sm:text-sm text-gray-400">active</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">{statusLine}</p>
              </div>
            </div>
            
            {/* Daily Consumption - Simplified */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <Progress 
                  value={Math.min(100, caffeineStatus.dailyProgress)} 
                  className="h-1.5 sm:h-2 bg-gray-100 flex-1 mr-2 sm:mr-3"
                  indicatorClassName={
                    caffeineStatus.dailyProgress < 50 ? 'bg-green-500' :
                    caffeineStatus.dailyProgress < 75 ? 'bg-yellow-500' :
                    caffeineStatus.dailyProgress < 100 ? 'bg-orange-500' : 'bg-red-500'
                  }
                />
                <span className={`text-xs sm:text-sm font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-700'}`}>
                  {caffeineStatus.dailyConsumed} / {caffeineStatus.dailyLimit}mg
                </span>
              </div>
              {isOverLimit && (
                <p className="text-xs sm:text-sm text-red-500">
                  {caffeineStatus.dailyConsumed - caffeineStatus.dailyLimit}mg over your daily limit
                </p>
              )}
            </div>
            
            {/* Guidance Box */}
            {guidance.recommendation && (
              <div className={`mt-2.5 sm:mt-3 p-2.5 sm:p-3 rounded-lg ${
                guidance.color === 'green' 
                  ? 'bg-green-50 border border-green-200' 
                  : guidance.color === 'yellow'
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-xs sm:text-sm ${
                  guidance.color === 'green' 
                    ? 'text-green-700' 
                    : guidance.color === 'yellow'
                      ? 'text-amber-700'
                      : 'text-red-700'
                }`}>
                  {guidance.recommendation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Bedtime Info - Subtle separate row */}
        <div className="flex items-center justify-between px-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500">
            <span>🛏️</span>
            <span>Bed {bedtimeFormatted}</span>
            <span>•</span>
            <span className={caffeineStatus.projectedAtBedtime > 50 ? "text-amber-600 font-medium" : "text-emerald-600 font-medium"}>
              ~{caffeineStatus.projectedAtBedtime}mg at bed
            </span>
            <span className="opacity-40">/</span>
            <span className="bg-gray-100 px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm font-bold tracking-tight">
              50mg LIMIT
            </span>
          </div>
        </div>
      </div>
    );
  }

  const remainingCaffeine = Math.max(0, caffeineStatus.dailyLimit - caffeineStatus.dailyConsumed);

  return (
    <Card className={`${className} overflow-hidden bg-white border border-gray-200 shadow-lg transition-all duration-500 ${isAnimating ? 'scale-[1.02] shadow-xl' : ''}`}>
      <CardHeader className="pb-6 bg-gradient-to-r from-amber-50/50 to-orange-50/30 border-b border-amber-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">☕</span>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Caffeine Tracking</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Real-time monitoring & sleep optimization</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`px-4 py-2 rounded-full font-medium text-sm ${
              guidance.color === 'green' ? 'border-green-200 text-green-700 bg-green-50' : 
              guidance.color === 'yellow' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' : 
              'border-red-200 text-red-700 bg-red-50'
            }`}
          >
            {guidance.title}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Current Level - Large Display */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-50 to-amber-50/30 rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Today's Caffeine Level</h3>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${caffeineBgColor} p-1.5`}>
                  <GuidanceIcon guidance={guidance} className="text-lg" />
                </div>
              </div>
              <div className="text-center">
                {/* Dual Display: Active vs Consumed */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Active Caffeine */}
                  <div className="text-center">
                    <div className={`text-4xl font-black ${caffeineColor} ${isAnimating ? 'animate-bounce' : ''} tracking-tight mb-2`}>
                      {caffeineStatus.currentLevel}
                    </div>
                    <div className="text-sm font-medium text-gray-600 mb-1">mg active</div>
                    <div className="text-xs text-gray-500">
                      {Math.round((caffeineStatus.currentLevel / caffeineStatus.dailyLimit) * 100)}% of limit
                    </div>
                  </div>
                  
                  {/* Consumed Today */}
                  <div className="text-center">
                    <div className="text-4xl font-black text-gray-700 tracking-tight mb-2">
                      {caffeineStatus.dailyConsumed}
                    </div>
                    <div className="text-sm font-medium text-gray-600 mb-1">mg consumed</div>
                    <div className="text-xs text-gray-500">
                      {Math.round(caffeineStatus.dailyProgress)}% of limit
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  {guidance.recommendation}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">📊</span>
                </div>
                <h4 className="font-semibold text-gray-900">Remaining</h4>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {remainingCaffeine}mg
              </div>
              <div className="text-sm text-gray-600">
                of your {caffeineStatus.dailyLimit}mg daily limit
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">🛏️</span>
                </div>
                <h4 className="font-semibold text-gray-900">Time to Bed</h4>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {timeToBedtimeFormatted}
              </div>
              <div className="text-sm text-gray-600">
                ~{caffeineStatus.projectedAtBedtime}mg at bedtime
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Daily Intake Progress</h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{caffeineStatus.dailyConsumed}mg</div>
              <div className="text-sm text-gray-600">consumed of {caffeineStatus.dailyLimit}mg limit</div>
            </div>
          </div>
          
          <div className="relative">
            <div className="h-6 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${
                  guidance.color === 'green' ? 'from-green-400 to-green-500' : 
                  guidance.color === 'yellow' ? 'from-yellow-400 to-orange-500' : 
                  'from-red-400 to-red-500'
                }`}
                style={{ width: `${Math.min(100, caffeineStatus.dailyProgress)}%` }}
              />
            </div>
            {/* Progress markers */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-sm text-gray-500">
              <span>0mg</span>
              <span>{Math.round(caffeineStatus.dailyLimit / 2)}mg</span>
              <span>{caffeineStatus.dailyLimit}mg</span>
            </div>
          </div>
        </div>

        {/* Guidance Banner */}
        {!canHaveCoffee && (
          <div className={`mb-8 p-6 rounded-2xl border ${
            guidance.color === 'yellow' 
              ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' 
              : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center p-2 ${
                guidance.color === 'yellow' ? 'bg-amber-100' : 'bg-red-100'
              }`}>
                <GuidanceIcon guidance={guidance} className="text-xl" />
              </div>
              <div className="flex-1">
                <h4 className={`text-lg font-semibold mb-1 ${
                  guidance.color === 'yellow' ? 'text-amber-800' : 'text-red-800'
                }`}>
                  {guidance.title}
                </h4>
                <p className={`text-sm ${
                  guidance.color === 'yellow' ? 'text-amber-700' : 'text-red-700'
                }`}>
                  {guidance.subtitle}
                </p>
              </div>
              {guidance.waitTimeFormatted && (
                <div className="text-right">
                  <div className={`text-3xl font-bold ${
                    guidance.color === 'yellow' ? 'text-amber-800' : 'text-red-800'
                  }`}>
                    {guidance.waitTimeFormatted}
                  </div>
                  <div className={`text-sm ${
                    guidance.color === 'yellow' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    wait time
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Insights */}
        {showDetails && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sleep Risk Assessment */}
            <div className={`p-6 rounded-2xl border-2 ${
              guidance.color === 'green' ? 'bg-green-50 border-green-200' : 
              guidance.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' : 
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-2xl">{getSleepRiskIcon(caffeineStatus.sleepRisk)}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">Sleep Impact</h4>
                  <p className="text-sm text-gray-600 capitalize">{caffeineStatus.sleepRisk} risk</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {caffeineStatus.sleepRiskMessage}
              </p>
            </div>

            {/* Peak Level */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 text-xl">🔥</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">Today's Peak</h4>
                  <p className="text-sm text-gray-600">Highest caffeine level</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {caffeineStatus.peakLevel}mg
              </div>
              <p className="text-sm text-gray-600">
                {caffeineStatus.peakLevel > caffeineStatus.currentLevel 
                  ? 'Peak reached earlier today' 
                  : 'Current level is your peak'
                }
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {showDetails && (
          <div className="mt-8 flex gap-4">
            <Button 
              variant="outline" 
              size="lg"
              className="flex-1 h-14 rounded-xl border-2 border-amber-200 text-amber-700 font-semibold hover:bg-amber-50 hover:border-amber-300 transition-all duration-300"
              onClick={() => window.location.href = '/ask'}
            >
              <span className="mr-2">☕</span>
              Browse Coffee
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="flex-1 h-14 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
              onClick={() => window.location.href = '/'}
            >
              <span className="mr-2">📊</span>
              View History
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CaffeineTracker;
