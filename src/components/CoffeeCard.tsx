import { Card, CardContent } from "@/components/ui/card";
import { CoffeeItem, HALF_LIFE_HOURS } from "@/data/coffees";
import { getSleepVerdict } from "@/lib/sleepVerdict";
import { adjustedMg, SizeOz } from "@/lib/serving";
import { caffeineRemaining } from "@/lib/caffeine";
import QuickLogButton from "@/components/QuickLogButton";

interface CoffeeCardProps {
  coffee: CoffeeItem;
  sizeOz: SizeOz;
  shots: 1 | 2;
  hoursUntilBed: number;
  onSelect: (coffee: CoffeeItem) => void;
  onLogSuccess: () => void;
  viewMode?: 'grid' | 'list';
}

export const CoffeeCard = ({ 
  coffee, 
  sizeOz, 
  shots, 
  hoursUntilBed, 
  onSelect, 
  onLogSuccess,
  viewMode = 'grid'
}: CoffeeCardProps) => {
  const mgAdj = adjustedMg(coffee, sizeOz, shots);
  const v = getSleepVerdict(mgAdj, hoursUntilBed, HALF_LIFE_HOURS);

  if (viewMode === 'list') {
    return (
      <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer bg-white border border-gray-200 hover:border-gray-300" onClick={() => onSelect(coffee)}>
        <CardContent className="p-5">
          <div className="flex items-start gap-6">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Header with title and safety indicator */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 group-hover:text-amber-700 transition-colors leading-tight">
                  {coffee.name}
                </h3>
                <div className="flex items-center gap-1.5 ml-4 flex-shrink-0">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    v.code === 'green' ? 'bg-green-400' : 
                    v.code === 'yellow' ? 'bg-amber-400' : 
                    'bg-red-400'
                  }`}></span>
                  <span className={`text-xs font-medium whitespace-nowrap ${
                    v.code === 'green' ? 'text-green-600' : 
                    v.code === 'yellow' ? 'text-amber-600' : 
                    'text-red-600'
                  }`}>
                    {v.chip}
                  </span>
                </div>
              </div>
              
              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {coffee.description}
              </p>
              
              {/* Bottom row with caffeine and button */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                  {mgAdj}mg caffeine
                </span>
                <div onClick={(e) => e.stopPropagation()}>
                  <QuickLogButton 
                    coffee={coffee} 
                    variant="outline" 
                    size="sm" 
                    className="border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors"
                    showDialog={false}
                    onLogSuccess={onLogSuccess}
                    showUndoAfterLog={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer bg-white border border-gray-200 hover:border-gray-300" onClick={() => onSelect(coffee)}>
      <CardContent className="p-5">
        {/* Header with title and safety indicator */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 group-hover:text-amber-700 transition-colors leading-tight">
            {coffee.name}
          </h3>
          <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
            <span className={`w-2.5 h-2.5 rounded-full ${
              v.code === 'green' ? 'bg-green-400' : 
              v.code === 'yellow' ? 'bg-amber-400' : 
              'bg-red-400'
            }`}></span>
            <span className={`text-xs font-medium whitespace-nowrap ${
              v.code === 'green' ? 'text-green-600' : 
              v.code === 'yellow' ? 'text-amber-600' : 
              'text-red-600'
            }`}>
              {v.chip}
            </span>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4">
          {coffee.description}
        </p>
        
        {/* Caffeine amount - standalone */}
        <div className="mb-4">
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
            {mgAdj}mg caffeine
          </span>
        </div>
        
        {/* Log button */}
        <div onClick={(e) => e.stopPropagation()}>
          <QuickLogButton 
            coffee={coffee} 
            variant="outline" 
            size="sm" 
            className="w-full border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors"
            showDialog={false}
            onLogSuccess={onLogSuccess}
            showUndoAfterLog={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};
