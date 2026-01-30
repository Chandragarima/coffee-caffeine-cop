import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CoffeeItem, HALF_LIFE_HOURS, CoffeeCategory } from "@/data/coffees";
import { getSleepVerdict } from "@/lib/sleepVerdict";
import { getMilestones, caffeineRemaining } from "@/lib/caffeine";
import DecayChart from "@/components/DecayChart";
import SleepVerdictBanner from "@/components/SleepVerdictBanner";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePreferences } from "@/hooks/usePreferences";
import { getIconPath } from "@/lib/imageUtils";

// Function to get the appropriate SVG icon based on coffee category
const getCoffeeCategoryIcon = (category: CoffeeCategory): string => {
  switch (category) {
    case "brewed":
      return getIconPath("brewed.svg");
    case "espresso":
      return getIconPath("espresso.svg");
    case "milk":
      return getIconPath("milk-based.svg");
    case "instant":
      return getIconPath("instant.svg");
    case "cold":
      return getIconPath("iced.svg");
    case "tea":
      return getIconPath("tea.svg");
    case "specialty":
      return getIconPath("speciality.svg");
    case "energy":
      return getIconPath("energy.svg");
    case "soda":
      return getIconPath("soda.svg");
    default:
      return getIconPath("brewed.svg"); // Default fallback
  }
};

interface CoffeeDetailDialogProps {
  coffee: CoffeeItem | null;
  hoursUntilBed?: number; // Optional - will calculate from bedtime if not provided
  onClose: () => void;
}

// Helper to calculate hours until bedtime from preference
const calculateHoursUntilBed = (bedtimeStr: string): number => {
  const now = new Date();
  const [hours, minutes] = bedtimeStr.split(':').map(Number);
  
  const bedtime = new Date();
  bedtime.setHours(hours, minutes, 0, 0);
  
  // If bedtime has already passed today, assume tomorrow
  if (bedtime <= now) {
    bedtime.setDate(bedtime.getDate() + 1);
  }
  
  const diffMs = bedtime.getTime() - now.getTime();
  return diffMs / (1000 * 60 * 60); // Convert to hours
};

// Format bedtime for display
const formatBedtime = (bedtimeStr: string): string => {
  const [hours, minutes] = bedtimeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

export const CoffeeDetailDialog = ({ 
  coffee, 
  hoursUntilBed: hoursUntilBedProp, 
  onClose 
}: CoffeeDetailDialogProps) => {
  const isMobile = useIsMobile();
  const { bedtime } = usePreferences();
  
  if (!coffee) {
    return (
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent>
          <DialogDescription>No coffee selected</DialogDescription>
        </DialogContent>
      </Dialog>
    );
  }

  // Use provided hoursUntilBed or calculate from bedtime preference
  const hoursUntilBed = hoursUntilBedProp ?? calculateHoursUntilBed(bedtime);
  const bedtimeFormatted = formatBedtime(bedtime);

  const v = getSleepVerdict(coffee.caffeineMg, hoursUntilBed, HALF_LIFE_HOURS);
  const milestones = getMilestones(coffee.caffeineMg, HALF_LIFE_HOURS);
  const remainingAtBedtime = caffeineRemaining(coffee.caffeineMg, hoursUntilBed, HALF_LIFE_HOURS);

  return (
    <Dialog open={!!coffee} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[95%] sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-amber-50/30 to-white backdrop-blur-sm border-amber-200 shadow-2xl">
        {/* Header Section */}
        <DialogHeader className="pb-4 border-b border-amber-100">
          {isMobile ? (
            // Mobile layout - stacked vertically with better spacing
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <img 
                  src={getCoffeeCategoryIcon(coffee.category)} 
                  alt={`${coffee.category} icon`}
                  className="w-10 h-10"
                />
              </div>
              <DialogTitle className="font-bold text-gray-900 text-xl mb-2">{coffee.name}</DialogTitle>
              <DialogDescription className="text-gray-600 text-sm leading-relaxed">{coffee.description}</DialogDescription>
            </div>
          ) : (
            // Desktop layout - horizontal with icon and text side by side
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-300 rounded-xl flex items-center justify-center flex-shrink-0">
                <img 
                  src={getCoffeeCategoryIcon(coffee.category)} 
                  alt={`${coffee.category} icon`}
                  className="w-8 h-8"
                />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="font-bold text-gray-900 text-2xl mb-1">{coffee.name}</DialogTitle>
                <DialogDescription className="text-gray-600 text-sm">{coffee.description}</DialogDescription>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
          {/* Sleep Verdict Banner */}
          <SleepVerdictBanner
            verdict={v}
            remainingMg={remainingAtBedtime}
            bedtimeFormatted={bedtimeFormatted}
            caffeineMg={coffee.caffeineMg}
          />

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
                  How your body processes <span className="font-medium text-amber-700">{coffee.caffeineMg}mg</span> of caffeine over time
                </p>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>Half-life</div>
                <div className={`font-semibold text-blue-600 ${isMobile ? 'text-sm' : 'text-sm'}`}>{HALF_LIFE_HOURS}h</div>
              </div>
            </div>

            {/* Enhanced Chart - Responsive Height */}
            <div className={`bg-gradient-to-b from-blue-50/30 to-transparent rounded-xl p-3 ${isMobile ? 'h-40 mb-3' : 'h-56 mb-4'}`}>
              <DecayChart mg={coffee.caffeineMg} halfLife={HALF_LIFE_HOURS} />
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

          </div>
      </DialogContent>
    </Dialog>
  );
};
