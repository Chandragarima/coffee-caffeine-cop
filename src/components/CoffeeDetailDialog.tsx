import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CoffeeItem, HALF_LIFE_HOURS } from "@/data/coffees";
import { getSleepVerdict } from "@/lib/sleepVerdict";
import { adjustedMg, SizeOz } from "@/lib/serving";
import { getMilestones, caffeineRemaining } from "@/lib/caffeine";
import DecayChart from "@/components/DecayChart";
import { useDynamicCaffeine } from "@/hooks/useDynamicCaffeine";
import { useIsMobile } from "@/hooks/use-mobile";

interface CoffeeDetailDialogProps {
  coffee: CoffeeItem | null;
  hoursUntilBed: number;
  onClose: () => void;
}

export const CoffeeDetailDialog = ({ 
  coffee, 
  hoursUntilBed, 
  onClose 
}: CoffeeDetailDialogProps) => {
  if (!coffee) return null;

  const isMobile = useIsMobile();
  const dynamicCaffeine = useDynamicCaffeine(coffee);
  const v = getSleepVerdict(dynamicCaffeine, hoursUntilBed, HALF_LIFE_HOURS);
  const milestones = getMilestones(dynamicCaffeine, HALF_LIFE_HOURS);
  const remainingAtBedtime = caffeineRemaining(dynamicCaffeine, hoursUntilBed, HALF_LIFE_HOURS);

  return (
    <Dialog open={!!coffee} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[95%] sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-amber-50/30 to-white backdrop-blur-sm border-amber-200 shadow-2xl">
        {/* Header Section */}
        <DialogHeader className="pb-4 border-b border-amber-100">
          {isMobile ? (
            // Mobile layout - stacked vertically with better spacing
            <div className="text-center">
              {/* <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-2xl">☕</span>
              </div> */}
              <DialogTitle className="font-bold text-gray-900 text-xl mb-2">{coffee.name}</DialogTitle>
              <p className="text-gray-600 text-sm leading-relaxed">{coffee.description}</p>
            </div>
          ) : (
            // Desktop layout - horizontal with icon and text side by side
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl">☕</span>
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="font-bold text-gray-900 text-2xl mb-1">{coffee.name}</DialogTitle>
                <p className="text-gray-600 text-sm">{coffee.description}</p>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
          {/* Sleep Verdict - Improved Mobile Layout */}
          <div className={`rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 ${isMobile ? 'p-3' : 'p-4'}`}>
            {isMobile ? (
              /* Mobile Layout - Stacked for better readability */
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50/50 text-xs px-2 py-0.5">
                    {v.chip}
                  </Badge>
                  <span className="text-xs text-gray-600 font-mono bg-white/60 px-2 py-1 rounded">
                    {remainingAtBedtime}mg at bedtime
                  </span>
                </div>
                <div className="ml-1 text-sm font-medium text-gray-900 leading-tight">
                  {v.headline}
                </div>
              </div>
            ) : (
              /* Desktop Layout - Horizontal */
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50/50 text-sm">
                    {v.chip}
                  </Badge>
                  <span className="text-sm font-medium text-gray-900 truncate">{v.headline}</span>
                </div>
                <span className="text-xs text-gray-600 font-mono bg-white/60 px-2 py-1 rounded flex-shrink-0">
                  {remainingAtBedtime}mg at bedtime
                </span>
              </div>
            )}
          </div>

          {/* Hero: Caffeine Decay Chart - Optimized for Mobile */}
          <div className={`bg-white rounded-2xl border border-gray-200 shadow-lg ${isMobile ? 'p-4' : 'p-6'}`}>
            <div className={`flex items-center justify-between mb-3 ${isMobile ? 'mb-2' : 'mb-4'}`}>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-gray-900 flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                  <span className={`bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`}>
                    <span className={`text-white ${isMobile ? 'text-xs' : 'text-xs'}`}>📈</span>
                  </span>
                  Caffeine Decay Timeline
                </h3>
                <p className={`text-gray-600 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  How your body processes <span className="font-medium text-amber-700">{dynamicCaffeine}mg</span> of caffeine over time
                </p>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>Half-life</div>
                <div className={`font-semibold text-blue-600 ${isMobile ? 'text-sm' : 'text-sm'}`}>{HALF_LIFE_HOURS}h</div>
              </div>
            </div>

            {/* Enhanced Chart - Responsive Height */}
            <div className={`bg-gradient-to-b from-blue-50/30 to-transparent rounded-xl p-3 ${isMobile ? 'h-40 mb-3' : 'h-56 mb-4'}`}>
              <DecayChart mg={dynamicCaffeine} halfLife={HALF_LIFE_HOURS} />
            </div>

            {/* Key Milestones - Essential Info Only */}
            <div className="space-y-2">
              <h4 className={`font-medium text-gray-700 flex items-center gap-2 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                <span className={`bg-orange-100 rounded flex items-center justify-center ${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`}>
                  <span className={`text-orange-600 ${isMobile ? 'text-xs' : 'text-xs'}`}>⏱️</span>
                </span>
                Key Milestones
              </h4>
              <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {milestones.map((m) => (
                  <div key={m.label} className={`bg-gray-50 rounded-lg border border-gray-100 ${isMobile ? 'p-2' : 'p-3'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium text-gray-600 ${isMobile ? 'text-xs' : 'text-xs'}`}>{m.label}</span>
                      <span className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>{m.hours}h</span>
                    </div>
                    <div className={`font-semibold text-orange-600 ${isMobile ? 'text-sm' : 'text-sm'}`}>{m.remaining}mg remaining</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Suggestion - Compact */}
          <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 ${isMobile ? 'p-3' : 'p-4'}`}>
            <p className={`text-gray-700 ${isMobile ? 'text-sm' : 'text-sm'}`}>
              <span className="font-medium">💡 Tip:</span> {v.suggestion}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
