import { SleepVerdict } from '@/lib/sleepVerdict';

interface SleepVerdictBannerProps {
  verdict: SleepVerdict;
  remainingMg: number;
  bedtimeFormatted: string; // e.g., "11:00 PM"
  caffeineMg: number; // original amount
}

// Sleep-safe threshold constants
const SAFE_THRESHOLD = 50;
const CAUTION_THRESHOLD = 100;

export const SleepVerdictBanner = ({ 
  verdict, 
  remainingMg, 
  bedtimeFormatted,
  caffeineMg 
}: SleepVerdictBannerProps) => {
  // Calculate progress for the threshold bar
  const maxThreshold = CAUTION_THRESHOLD + 50; // 150mg for scale
  const progressPercent = Math.min((remainingMg / maxThreshold) * 100, 100);
  const safePercent = (SAFE_THRESHOLD / maxThreshold) * 100;
  const cautionPercent = (CAUTION_THRESHOLD / maxThreshold) * 100;

  // Get contextual message based on verdict
  const getContextualMessage = () => {
    switch (verdict.code) {
      case 'green':
        return {
          emoji: '😴',
          title: "You're in the clear",
          subtitle: `By ${bedtimeFormatted}, only ${Math.round(remainingMg)}mg will remain — well under the ${SAFE_THRESHOLD}mg sleep threshold.`,
        };
      case 'yellow':
        return {
          emoji: '⚠️',
          title: "Might push bedtime back",
          subtitle: `At ${bedtimeFormatted}, you'll still have ${Math.round(remainingMg)}mg active — could keep you up an extra hour or two.`,
        };
      case 'red':
        return {
          emoji: '🚫',
          title: "Sleep disruption likely",
          subtitle: `${Math.round(remainingMg)}mg at ${bedtimeFormatted} is way above safe levels. You'll be counting sheep until 2am.`,
        };
    }
  };

  const message = getContextualMessage();

  // Color schemes for each verdict
  const colorSchemes = {
    green: {
      bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
      border: 'border-emerald-200',
      titleColor: 'text-emerald-800',
      progressColor: 'bg-emerald-500',
      iconBg: 'bg-emerald-100',
    },
    yellow: {
      bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
      border: 'border-amber-200',
      titleColor: 'text-amber-800',
      progressColor: 'bg-amber-500',
      iconBg: 'bg-amber-100',
    },
    red: {
      bg: 'bg-gradient-to-r from-red-50 to-rose-50',
      border: 'border-red-200',
      titleColor: 'text-red-800',
      progressColor: 'bg-red-500',
      iconBg: 'bg-red-100',
    },
  };

  const colors = colorSchemes[verdict.code];

  return (
    <div className={`rounded-xl ${colors.bg} border ${colors.border} p-4 space-y-3`}>
      {/* Main message */}
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 ${colors.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
          <span className="text-xl">{message.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${colors.titleColor} text-base`}>
            {message.title}
          </h3>
          <p className="text-sm text-gray-600 mt-0.5 leading-snug">
            {message.subtitle}
          </p>
        </div>
      </div>

      {/* Visual threshold bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Caffeine at bedtime</span>
          <span className="font-mono font-medium">{Math.round(remainingMg)}mg</span>
        </div>
        
        {/* Progress bar with threshold markers */}
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          {/* Threshold zones */}
          <div 
            className="absolute inset-y-0 left-0 bg-emerald-200/50" 
            style={{ width: `${safePercent}%` }}
          />
          <div 
            className="absolute inset-y-0 bg-amber-200/50" 
            style={{ left: `${safePercent}%`, width: `${cautionPercent - safePercent}%` }}
          />
          <div 
            className="absolute inset-y-0 right-0 bg-red-200/50" 
            style={{ left: `${cautionPercent}%` }}
          />
          
          {/* Actual progress */}
          <div 
            className={`absolute inset-y-0 left-0 ${colors.progressColor} rounded-full transition-all duration-500`}
            style={{ width: `${progressPercent}%` }}
          />
          
          {/* Threshold markers */}
          <div 
            className="absolute inset-y-0 w-0.5 bg-gray-400"
            style={{ left: `${safePercent}%` }}
          />
          <div 
            className="absolute inset-y-0 w-0.5 bg-gray-400"
            style={{ left: `${cautionPercent}%` }}
          />
        </div>

        {/* Threshold labels */}
        <div className="flex text-xs text-gray-400 relative h-4">
          <span 
            className="absolute transform -translate-x-1/2"
            style={{ left: `${safePercent}%` }}
          >
            {SAFE_THRESHOLD}mg
          </span>
          <span 
            className="absolute transform -translate-x-1/2"
            style={{ left: `${cautionPercent}%` }}
          >
            {CAUTION_THRESHOLD}mg
          </span>
        </div>
      </div>

      {/* Tip - only show if there's a suggestion and it's not green */}
      {verdict.code !== 'green' && verdict.suggestion && (
        <div className="pt-2 border-t border-gray-200/50">
          <p className="text-xs text-gray-600">
            <span className="font-medium">💡 Tip:</span> {verdict.suggestion}
          </p>
        </div>
      )}
    </div>
  );
};

export default SleepVerdictBanner;
