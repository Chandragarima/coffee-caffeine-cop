import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useCaffeineTracker } from '@/hooks/useCaffeineTracker';
import { getCaffeineColor, getCaffeineBgColor } from '@/lib/caffeineTracker';

interface CaffeineTrackerProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

const CaffeineTracker = ({ className = '', showDetails = true, compact = false }: CaffeineTrackerProps) => {
  const {
    caffeineStatus,
    guidance,
    timeToNextCoffeeFormatted,
    timeToBedtimeFormatted,
    caffeineLevelPercentage,
    getSleepRiskColor,
    getSleepRiskIcon,
    isSafeForNextCoffee
  } = useCaffeineTracker();

  const [isAnimating, setIsAnimating] = useState(false);

  // Trigger animation when caffeine level changes
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [caffeineStatus.currentLevel]);

  const caffeineColor = getCaffeineColor(caffeineStatus.currentLevel, caffeineStatus.dailyLimit);
  const caffeineBgColor = getCaffeineBgColor(caffeineStatus.currentLevel, caffeineStatus.dailyLimit);

  if (compact) {
    return (
      <Card className={`${className} overflow-hidden bg-gradient-to-r from-white via-amber-50/30 to-orange-50/20 border-0 shadow-lg transition-all duration-300 ${isAnimating ? 'scale-105 shadow-xl' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center ${caffeineBgColor} transition-all duration-300 shadow-lg`}>
                <span className={`text-3xl ${isAnimating ? 'animate-bounce' : ''}`}>
                  {guidance.icon}
                </span>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                  <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-2xl font-black ${caffeineColor} tracking-tight`}>
                    {caffeineStatus.currentLevel}mg
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`px-3 py-1 rounded-full font-medium ${
                      guidance.color === 'green' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 
                      guidance.color === 'yellow' ? 'border-amber-200 text-amber-700 bg-amber-50' : 
                      'border-red-200 text-red-700 bg-red-50'
                    }`}
                  >
                    {guidance.reason}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 font-medium mb-2">
                  {guidance.recommendation}
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-gray-600">
                    <span className="font-semibold">{Math.round(caffeineStatus.dailyProgress)}%</span> of daily limit
                  </span>
                  <span className="text-emerald-600 font-semibold">
                    {Math.round(Math.max(0, caffeineStatus.dailyLimit - (caffeineStatus.dailyProgress / 100 * caffeineStatus.dailyLimit)))}mg remaining
                  </span>
                </div>
              </div>
            </div>
            
            {!isSafeForNextCoffee && (
              <div className="text-right bg-amber-50 p-3 rounded-xl border border-amber-200">
                <div className="text-lg font-bold text-amber-700">
                  {timeToNextCoffeeFormatted}
                </div>
                <div className="text-xs text-amber-600 font-medium">
                  until next coffee
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const remainingCaffeine = Math.max(0, caffeineStatus.dailyLimit - (caffeineStatus.dailyProgress / 100 * caffeineStatus.dailyLimit));

  return (
    <Card className={`${className} overflow-hidden bg-gradient-to-br from-white via-gray-50/30 to-amber-50/20 border-0 shadow-xl transition-all duration-500 ${isAnimating ? 'scale-[1.02] shadow-2xl' : ''}`}>
      <CardHeader className="pb-6 bg-gradient-to-r from-amber-50/50 to-orange-50/30 border-b border-amber-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 animate-pulse"></div>
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Daily Caffeine Monitor
            </CardTitle>
          </div>
          <Badge 
            variant="outline" 
            className={`px-3 py-1 rounded-full font-medium backdrop-blur-sm ${
              guidance.color === 'green' ? 'border-emerald-200 text-emerald-700 bg-emerald-50/70' : 
              guidance.color === 'yellow' ? 'border-amber-200 text-amber-700 bg-amber-50/70' : 
              'border-red-200 text-red-700 bg-red-50/70'
            }`}
          >
            {guidance.reason}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 space-y-8">
        {/* Main Progress Circle */}
        <div className="relative">
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* Background Circle */}
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="rgb(249 250 251)"
                  strokeWidth="8"
                />
                {/* Progress Circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={`url(#gradient-${guidance.color})`}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - caffeineStatus.dailyProgress / 100)}`}
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
                  <div className={`text-4xl font-black ${caffeineColor} ${isAnimating ? 'animate-bounce' : ''} tracking-tight`}>
                    {caffeineStatus.currentLevel}
                  </div>
                  <div className="text-xs font-medium text-gray-500 mt-1 tracking-wide">
                    mg active
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Status Icon */}
          <div className={`absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center ${caffeineBgColor} shadow-lg border-4 border-white`}>
            <span className="text-2xl">{guidance.icon}</span>
          </div>
        </div>

        {/* Daily Limit Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Daily Intake Progress</h3>
            <span className="text-2xl font-bold text-gray-900">
              {Math.round(caffeineStatus.dailyProgress)}%
            </span>
          </div>
          
          <div className="relative">
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${
                  guidance.color === 'green' ? 'from-emerald-400 to-emerald-500' : 
                  guidance.color === 'yellow' ? 'from-amber-400 to-orange-500' : 
                  'from-red-400 to-red-500'
                }`}
                style={{ width: `${Math.min(100, caffeineStatus.dailyProgress)}%` }}
              />
            </div>
            {/* Progress markers */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
              <span>0mg</span>
              <span className="transform -translate-x-1/2">{caffeineStatus.dailyLimit / 2}mg</span>
              <span>{caffeineStatus.dailyLimit}mg</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="text-center">
              <div className="text-xl font-bold text-emerald-600">
                {Math.round(remainingCaffeine)}mg
              </div>
              <div className="text-xs text-gray-600">remaining today</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-700">
                {caffeineStatus.dailyLimit}mg
              </div>
              <div className="text-xs text-gray-600">daily limit</div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className={`p-6 rounded-2xl border-l-4 ${
          guidance.color === 'green' ? 'bg-emerald-50/70 border-emerald-400' : 
          guidance.color === 'yellow' ? 'bg-amber-50/70 border-amber-400' : 
          'bg-red-50/70 border-red-400'
        }`}>
          <div className="flex items-start gap-4">
            <span className="text-3xl mt-1">{guidance.icon}</span>
            <div>
              <h4 className="font-semibold text-gray-900 text-lg mb-2">
                {guidance.recommendation}
              </h4>
              {!isSafeForNextCoffee && (
                <p className="text-sm text-gray-700">
                  Wait <span className="font-bold text-amber-600">{timeToNextCoffeeFormatted}</span> before your next coffee for optimal sleep quality.
                </p>
              )}
            </div>
          </div>
        </div>

        {showDetails && (
          <>
            {/* Sleep Risk Assessment */}
            <div className={`p-6 rounded-2xl backdrop-blur-sm border-2 ${getSleepRiskColor(caffeineStatus.sleepRisk)} shadow-lg`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center shadow-md">
                  <span className="text-3xl">{getSleepRiskIcon(caffeineStatus.sleepRisk)}</span>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg text-gray-900 mb-1">
                    Sleep Impact: {caffeineStatus.sleepRisk.charAt(0).toUpperCase() + caffeineStatus.sleepRisk.slice(1)}
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {caffeineStatus.sleepRiskMessage}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-white text-xl font-bold">📈</span>
                </div>
                <div className="text-2xl font-black text-gray-900 mb-1">{caffeineStatus.peakLevel}mg</div>
                <div className="text-sm font-medium text-gray-600">Peak Today</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-white text-xl font-bold">🛏️</span>
                </div>
                <div className="text-2xl font-black text-gray-900 mb-1">{timeToBedtimeFormatted}</div>
                <div className="text-sm font-medium text-gray-600">To Bedtime</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                size="lg"
                className="flex-1 h-14 rounded-2xl border-2 border-amber-200 text-amber-700 font-semibold hover:bg-amber-50 hover:border-amber-300 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => window.location.href = '/ask'}
              >
                <span className="mr-2">☕</span>
                Browse Coffee
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="flex-1 h-14 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => window.location.href = '/coffee-log-demo'}
              >
                <span className="mr-2">📊</span>
                View History
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CaffeineTracker;
