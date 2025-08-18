import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CoffeeItem, HALF_LIFE_HOURS } from "@/data/coffees";
import { getSleepVerdict } from "@/lib/sleepVerdict";
import { adjustedMg, SizeOz } from "@/lib/serving";
import { getMilestones, caffeineRemaining } from "@/lib/caffeine";
import DecayChart from "@/components/DecayChart";

interface CoffeeDetailDialogProps {
  coffee: CoffeeItem | null;
  sizeOz: SizeOz;
  shots: 1 | 2;
  hoursUntilBed: number;
  onClose: () => void;
}

export const CoffeeDetailDialog = ({ 
  coffee, 
  sizeOz, 
  shots, 
  hoursUntilBed, 
  onClose 
}: CoffeeDetailDialogProps) => {
  if (!coffee) return null;

  const mgAdj = adjustedMg(coffee, sizeOz, shots);
  const v = getSleepVerdict(mgAdj, hoursUntilBed, HALF_LIFE_HOURS);
  const milestones = getMilestones(mgAdj, HALF_LIFE_HOURS);
  const remainingAtBedtime = caffeineRemaining(mgAdj, hoursUntilBed, HALF_LIFE_HOURS);

  return (
    <Dialog open={!!coffee} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-amber-50/30 to-white backdrop-blur-sm border-amber-200 shadow-2xl">
        {/* Header Section */}
        <DialogHeader className="pb-4 border-b border-amber-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl">☕</span>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-1">{coffee.name}</DialogTitle>
              <p className="text-gray-600 text-sm">{coffee.description}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sleep Verdict - Compact */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50/50">
                  {v.chip}
                </Badge>
                <span className="text-sm font-medium text-gray-900">{v.headline}</span>
              </div>
              <span className="text-xs text-gray-600 font-mono bg-white/60 px-2 py-1 rounded">
                {remainingAtBedtime}mg at bedtime
              </span>
            </div>
          </div>

          {/* Hero: Caffeine Decay Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">📈</span>
                  </span>
                  Caffeine Decay Timeline
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  How your body processes <span className="font-medium text-amber-700">{mgAdj}mg</span> of caffeine over time
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Half-life</div>
                <div className="text-sm font-semibold text-blue-600">{HALF_LIFE_HOURS}h</div>
              </div>
            </div>

            {/* Enhanced Chart */}
            <div className="h-56 mb-4 bg-gradient-to-b from-blue-50/30 to-transparent rounded-xl p-4">
              <DecayChart mg={mgAdj} halfLife={HALF_LIFE_HOURS} />
            </div>

            {/* Scientific Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Milestones */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center">
                    <span className="text-orange-600 text-xs">⏱️</span>
                  </span>
                  Key Milestones
                </h4>
                {milestones.map((m) => (
                  <div key={m.label} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-600">{m.label}</span>
                      <span className="text-xs text-gray-500">{m.hours}h</span>
                    </div>
                    <div className="text-sm font-semibold text-orange-600">{m.remaining}mg remaining</div>
                  </div>
                ))}
              </div>

              {/* Science Facts */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 text-xs">🧬</span>
                  </span>
                  Science Facts
                </h4>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="p-2 bg-blue-50/50 rounded border border-blue-100">
                    <span className="font-medium">Absorption:</span> Peak levels in 30-60 minutes
                  </div>
                  <div className="p-2 bg-green-50/50 rounded border border-green-100">
                    <span className="font-medium">Metabolism:</span> Liver processes ~50% every {HALF_LIFE_HOURS}h
                  </div>
                  <div className="p-2 bg-purple-50/50 rounded border border-purple-100">
                    <span className="font-medium">Sleep impact:</span> &lt;50mg at bedtime is ideal
                  </div>
                </div>
              </div>

              {/* Personal Impact */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                    <span className="text-green-600 text-xs">👤</span>
                  </span>
                  Your Timeline
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-amber-50 rounded border border-amber-100">
                    <div className="font-medium text-amber-700">Now</div>
                    <div className="text-gray-600">{mgAdj}mg enters bloodstream</div>
                  </div>
                  <div className="p-2 bg-blue-50 rounded border border-blue-100">
                    <div className="font-medium text-blue-700">In {HALF_LIFE_HOURS}h</div>
                    <div className="text-gray-600">{milestones[0]?.remaining}mg remaining</div>
                  </div>
                  <div className="p-2 bg-green-50 rounded border border-green-100">
                    <div className="font-medium text-green-700">At bedtime ({hoursUntilBed.toFixed(1)}h)</div>
                    <div className="text-gray-600">{remainingAtBedtime}mg in your system</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Suggestion */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <p className="text-sm text-gray-700">
              <span className="font-medium">💡 Tip:</span> {v.suggestion}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
