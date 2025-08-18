import React from 'react';
import { getCaffeineGuidance, CaffeineGuidance } from '@/lib/caffeineTracker';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Helper component to render guidance icons (SVG or emoji)
const GuidanceIcon = ({ guidance, className = "" }: { guidance: CaffeineGuidance, className?: string }) => {
  if (guidance.iconType === 'svg' && guidance.iconPath) {
    return (
      <img 
        src={guidance.iconPath} 
        alt={guidance.reason}
        className={`w-full h-full object-contain ${className}`}
      />
    );
  }
  
  // Fallback to emoji
  return <span className={className}>{guidance.icon}</span>;
};

interface CaffeineGuidanceBannerProps {
  currentCaffeine: number;
  timeToBedtime: number; // minutes until bedtime
  dailyProgress: number; // percentage of daily limit consumed
  timeToNextCoffee: number; // actual wait time from caffeine tracker
  className?: string;
}

export const CaffeineGuidanceBanner: React.FC<CaffeineGuidanceBannerProps> = ({
  currentCaffeine,
  timeToBedtime,
  dailyProgress,
  timeToNextCoffee,
  className = ''
}) => {
  // Calculate guidance based on current state
  const guidance = getCaffeineGuidance(
    currentCaffeine,
    timeToNextCoffee, // Use actual timeToNextCoffee from tracker
    400, // dailyLimit
    dailyProgress,
    timeToBedtime
  );

  // Only show warning/caution messages (yellow/red), not green "safe" messages
  if (guidance.color === 'green') {
    return null;
  }

  return (
    <Card className={`border-l-4 ${
      guidance.color === 'yellow' 
        ? 'border-amber-400 bg-amber-50/70' 
        : 'border-red-400 bg-red-50/70'
    } ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            guidance.color === 'yellow' 
              ? 'bg-amber-100 text-amber-600' 
              : 'bg-red-100 text-red-600'
          }`}>
            <GuidanceIcon guidance={guidance} className="text-2xl" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className={`font-semibold text-lg ${
                guidance.color === 'yellow' ? 'text-amber-800' : 'text-red-800'
              }`}>
                {guidance.reason}
              </h3>
              {guidance.color === 'red' && (
                <Badge variant="destructive" className="text-xs">
                  Sleep Risk
                </Badge>
              )}
            </div>
            <p className={`text-sm leading-relaxed ${
              guidance.color === 'yellow' ? 'text-amber-700' : 'text-red-700'
            }`}>
              {guidance.recommendation}
            </p>
            <div className="mt-3 text-xs text-gray-600">
              Current caffeine: {currentCaffeine}mg • Time to bed: {Math.round(timeToBedtime / 60)}h
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
