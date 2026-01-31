import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { 
  CaffeineStatus, 
  CaffeineGuidance, 
  THRESHOLDS,
  getCaffeineLevelBand
} from '@/lib/caffeineTracker';

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

interface CaffeineStatusHeroProps {
  caffeineStatus: CaffeineStatus;
  guidance: CaffeineGuidance;
  timeToBedtimeFormatted: string;
  bedtimeFormatted: string;
  onDrinkNow?: () => void;
  onSkip?: () => void;
}

// Get sleep forecast message based on projected bedtime caffeine
const getSleepForecast = (projectedMg: number): { headline: string; detail: string; color: 'green' | 'yellow' | 'red'; delta: number } => {
  const delta = Math.abs(projectedMg - THRESHOLDS.SLEEP_SAFE);
  
  if (projectedMg < THRESHOLDS.SLEEP_SAFE) {
    return {
      headline: "Sleep looks great tonight",
      detail: "Caffeine will clear before bedtime",
      color: 'green',
      delta
    };
  } else if (projectedMg < THRESHOLDS.SLEEP_CAUTION) {
    return {
      headline: "Sleep may be affected",
      detail: "Caffeine levels will still be elevated at bedtime",
      color: 'yellow',
      delta
    };
  } else {
    return {
      headline: "Sleep will likely be disrupted",
      detail: "High caffeine levels at bedtime",
      color: 'red',
      delta
    };
  }
};

export const CaffeineStatusHero = ({
  caffeineStatus,
  guidance,
  timeToBedtimeFormatted,
  bedtimeFormatted,
}: CaffeineStatusHeroProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const { currentLevel, projectedAtBedtime } = caffeineStatus;
  const { state, waitTimeFormatted } = guidance;
  
  const sleepForecast = getSleepForecast(projectedAtBedtime);

  // Color configurations
  const forecastColors = {
    green: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: '😴' },
    yellow: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: '😐' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: '😵' }
  };

  const colors = forecastColors[sleepForecast.color];

  // Delta-only copy: over/under bedtime limit (no numbers or sleep status repeated)
  const isOverLimit = projectedAtBedtime >= THRESHOLDS.SLEEP_SAFE;
  const deltaLine = isOverLimit
    ? `${Math.round(projectedAtBedtime - THRESHOLDS.SLEEP_SAFE)}mg over your bedtime limit`
    : sleepForecast.delta > 0
      ? `${sleepForecast.delta}mg under your bedtime limit`
      : 'At your bedtime limit';

  return (
    <Card className="overflow-hidden border shadow-sm">
      {/* Delta only — no repetition of numbers or sleep status (dashboard has that) */}
      <div className={`${colors.bg} ${colors.border} border-b p-4 sm:p-5`}>
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <span className="text-xl sm:text-2xl">{colors.icon}</span>
          <p className={`text-base sm:text-lg font-semibold ${colors.text}`}>
            {isOverLimit ? '!' : '✓'} {deltaLine}
          </p>
        </div>
      </div>
      
      <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Jitter Warning if applicable */}
        {(state === 'jitter_risk' || state === 'both_risks') && waitTimeFormatted && (
          <div className="p-2.5 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg">⚡</span>
              <p className="text-xs sm:text-sm text-amber-800">
                <span className="font-medium">Jitter alert:</span> Another coffee would push you above {THRESHOLDS.JITTER}mg. 
                Wait ~{waitTimeFormatted} before your next one.
              </p>
            </div>
          </div>
        )}
        
        {/* Expandable Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-center gap-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors py-1.5 sm:py-2"
        >
          {showDetails ? (
            <>
              <span>Hide details</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>More details</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
        
        {showDetails && (
          <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
            {/* <h4 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest px-1">
              Why This Matters
            </h4> */}
            
            {/* Two-card educational layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {/* Card 1: Effects - Contextual based on current level (5 bands from getCaffeineLevelBand) */}
              {(() => {
                const band = getCaffeineLevelBand(currentLevel);
                const themeClasses = {
                  green: {
                    card: 'bg-emerald-50/50 border-emerald-100',
                    iconBg: 'bg-emerald-100',
                    title: 'text-emerald-900',
                    intro: 'text-emerald-800',
                    list: 'text-emerald-700',
                  },
                  amber: {
                    card: 'bg-amber-50/50 border-amber-100',
                    iconBg: 'bg-amber-100',
                    title: 'text-amber-900',
                    intro: 'text-amber-800',
                    list: 'text-amber-700',
                  },
                  red: {
                    card: 'bg-red-50/50 border-red-100',
                    iconBg: 'bg-red-100',
                    title: 'text-red-900',
                    intro: 'text-red-800',
                    list: 'text-red-700',
                  },
                  orange: {
                    card: 'bg-amber-50/50 border-amber-100',
                    iconBg: 'bg-amber-100',
                    title: 'text-amber-900',
                    intro: 'text-amber-800',
                    list: 'text-amber-700',
                  },
                };
                const t = themeClasses[band.theme];
                return (
                  <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 border ${t.card}`}>
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center ${t.iconBg}`}>
                        <span className="text-xs sm:text-sm">⚡</span>
                      </div>
                      <h5 className={`text-xs sm:text-sm font-bold ${t.title}`}>
                        {band.title}
                      </h5>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <p className={`text-xs sm:text-sm ${t.intro} leading-relaxed`}>
                        {band.intro}
                      </p>
                      <ul className={`text-xs sm:text-sm ${t.list} space-y-0.5 sm:space-y-1`}>
                        {band.bullets.map((b, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="mt-0.5">{b.char}</span>
                            <span>{b.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* The Science of 50mg Section */}
            <div className="bg-gray-900 text-white rounded-xl sm:rounded-2xl p-4 sm:p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-amber-500/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 blur-3xl"></div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-widest mb-2 sm:mb-3 flex items-center gap-2">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> The Science of 50mg
              </h4>
              <div className="space-y-2 sm:space-y-3 relative z-10">
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Caffeine works by blocking <span className="text-white font-medium">Adenosine</span>—the chemical that builds "sleep pressure" throughout your day.
                </p>
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-amber-200">Deep Sleep Impact</p>
                    <p className="text-xs sm:text-sm text-gray-400">Levels above 50mg reduce NREM (deep) sleep by up to 20%.</p>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-amber-200">Sleep Latency</p>
                    <p className="text-xs sm:text-sm text-gray-400">50mg+ in your system can double the time it takes to fall asleep.</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 italic pt-1 border-t border-white/10">
                  Data based on Sleep Medicine Reviews & clinical half-life studies.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CaffeineStatusHero;
