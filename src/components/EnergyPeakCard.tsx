import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { 
  getPeakEnergyInfo, 
  formatMinutesToPeak,
  PeakEnergyInfo 
} from '@/lib/caffeine';

interface EnergyPeakCardProps {
  coffeeName: string;
  caffeineMg: number;
  consumedAt: number;
  onDismiss?: () => void;
  compact?: boolean;
}

const PHASE_CONFIG = {
  absorbing: {
    icon: TrendingUp,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    progressColor: 'bg-amber-500',
  },
  peak: {
    icon: Zap,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    progressColor: 'bg-green-500',
  },
  sustained: {
    icon: Zap,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    progressColor: 'bg-blue-500',
  },
  declining: {
    icon: TrendingDown,
    color: 'text-gray-500',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    progressColor: 'bg-gray-400',
  },
};

const EnergyPeakCard = ({ 
  coffeeName, 
  caffeineMg, 
  consumedAt, 
  onDismiss,
  compact = false 
}: EnergyPeakCardProps) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Update every 10 seconds for smooth countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  const peakInfo = useMemo(() => {
    return getPeakEnergyInfo(consumedAt, currentTime);
  }, [consumedAt, currentTime]);
  
  const config = PHASE_CONFIG[peakInfo.phase];
  const PhaseIcon = config.icon;
  
  // Calculate progress percentage (0-100) for the visual bar
  // 0 = just consumed, 100 = at or past peak
  const minutesSinceConsumption = Math.round((currentTime - consumedAt) / (1000 * 60));
  const progressPercent = Math.min(100, (minutesSinceConsumption / 45) * 100);
  
  // Auto-dismiss after 2 hours (caffeine is well past peak and into sustained phase)
  useEffect(() => {
    if (minutesSinceConsumption > 120 && onDismiss) {
      onDismiss();
    }
  }, [minutesSinceConsumption, onDismiss]);
  
  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg ${config.bg} ${config.border} border`}>
        <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
          <PhaseIcon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${config.color}`}>
              {peakInfo.isPastPeak ? 'Peak reached' : `Peak in ${formatMinutesToPeak(peakInfo.minutesToPeak)}`}
            </span>
            <span className="text-xs text-gray-500">
              ({peakInfo.peakTimeFormatted})
            </span>
          </div>
          <p className="text-xs text-gray-600 truncate">{peakInfo.phaseDescription}</p>
        </div>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
  
  return (
    <Card className={`overflow-hidden ${config.border} border-2`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
              <PhaseIcon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">{coffeeName}</h4>
              <p className="text-xs text-gray-500">{caffeineMg}mg caffeine</p>
            </div>
          </div>
          {onDismiss && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDismiss}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {/* Peak countdown */}
        <div className={`p-3 rounded-lg ${config.bg} mb-3`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {peakInfo.isPastPeak ? 'Peak Status' : 'Peak Energy'}
            </span>
            <span className={`text-lg font-bold ${config.color}`}>
              {peakInfo.isPastPeak ? 'Reached' : formatMinutesToPeak(peakInfo.minutesToPeak)}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="relative h-2 bg-white/60 rounded-full overflow-hidden mb-2">
            <div 
              className={`absolute inset-y-0 left-0 ${config.progressColor} rounded-full transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            />
            {/* Peak marker */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-2 border-gray-400 rounded-full"
              style={{ left: 'calc(100% - 4px)' }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>Consumed</span>
            <span>Peak ({peakInfo.peakTimeFormatted})</span>
          </div>
        </div>
        
        {/* Phase description */}
        <p className="text-sm text-gray-600 text-center">
          {peakInfo.phaseDescription}
        </p>
        
        {/* Helpful tip based on phase */}
        {peakInfo.phase === 'absorbing' && (
          <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs text-amber-700 text-center">
              💡 Best time for focused work starts in ~{formatMinutesToPeak(peakInfo.minutesToPeak)}
            </p>
          </div>
        )}
        
        {peakInfo.phase === 'peak' && !peakInfo.isPastPeak && (
          <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-100">
            <p className="text-xs text-green-700 text-center">
              🎯 You're approaching your sharpest focus window
            </p>
          </div>
        )}
        
        {peakInfo.phase === 'peak' && peakInfo.isPastPeak && (
          <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-100">
            <p className="text-xs text-green-700 text-center">
              ⚡ You're at peak alertness right now
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnergyPeakCard;
