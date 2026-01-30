import React from 'react';
import { getCaffeineGuidance, CaffeineGuidance, THRESHOLDS } from '@/lib/caffeineTracker';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CaffeineGuidanceBannerProps {
  currentCaffeine: number;
  timeToBedtime: number; // minutes until bedtime
  dailyConsumed: number; // total mg consumed today
  dailyLimit?: number;
  className?: string;
}

export const CaffeineGuidanceBanner: React.FC<CaffeineGuidanceBannerProps> = ({
  currentCaffeine,
  timeToBedtime,
  dailyConsumed,
  dailyLimit = 400,
  className = ''
}) => {
  // Calculate guidance based on current state using new 5-state system
  const hoursUntilBed = timeToBedtime / 60;
  const guidance = getCaffeineGuidance(
    currentCaffeine,
    hoursUntilBed,
    dailyConsumed,
    dailyLimit,
    THRESHOLDS.TYPICAL_COFFEE
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
            <span className="text-2xl">{guidance.icon}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className={`font-semibold text-lg ${
                guidance.color === 'yellow' ? 'text-amber-800' : 'text-red-800'
              }`}>
                {guidance.title}
              </h3>
              {guidance.color === 'red' && (
                <Badge variant="destructive" className="text-xs">
                  {guidance.state === 'daily_limit' ? 'Limit Reached' : 'Sleep Risk'}
                </Badge>
              )}
            </div>
            <p className={`text-sm leading-relaxed mb-2 ${
              guidance.color === 'yellow' ? 'text-amber-700' : 'text-red-700'
            }`}>
              {guidance.subtitle}
            </p>
            <p className={`text-sm leading-relaxed ${
              guidance.color === 'yellow' ? 'text-amber-600' : 'text-red-600'
            }`}>
              {guidance.recommendation}
            </p>
            
            {/* Show wait time for jitter risk */}
            {guidance.waitTimeFormatted && (guidance.state === 'jitter_risk' || guidance.state === 'both_risks') && (
              <div className="mt-3 inline-flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full">
                <span>⏳</span>
                <span className={`text-sm font-medium ${
                  guidance.color === 'yellow' ? 'text-amber-800' : 'text-red-800'
                }`}>
                  Wait {guidance.waitTimeFormatted}
                </span>
              </div>
            )}
            
            <div className="mt-3 text-xs text-gray-600">
              Current: {currentCaffeine}mg active • ~{guidance.projectedAtBedtime}mg at bedtime • {Math.round(timeToBedtime / 60)}h to bed
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
