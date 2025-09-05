import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoffeeItem, HALF_LIFE_HOURS } from "@/data/coffees";
import { getSleepVerdict } from "@/lib/sleepVerdict";
import { adjustedMg, SizeOz } from "@/lib/serving";
import { TimeOfDay } from "@/hooks/useTimeOfDay";
import QuickLogButton from "@/components/QuickLogButton";

// Helper component to render coffee icons (SVG or emoji fallback)
const CoffeeIcon = ({ iconId, className = "" }: { iconId: string, className?: string }) => {
  // Mapping of icon IDs to SVG paths and emoji fallbacks
  const iconMap = {
    'espresso': { svg: '/icons/espresso.svg', emoji: '☕' },
    // 'strong-coffee': { svg: '/icons/strong-coffee.svg', emoji: '☕' },
    'brewed': { svg: '/icons/brewed.svg', emoji: '☕' },
    'milk': { svg: '/icons/milk-based.svg', emoji: '🥛' },
    'instant': { svg: '/icons/brewed.svg', emoji: '☕' },
    'tea': { svg: '/icons/tea.svg', emoji: '🫖' },
    'iced': { svg: '/icons/iced.svg', emoji: '🧊' },
    'specialty': { svg: '/icons/speciality.svg', emoji: '✨' },
    'energy': { svg: '/icons/energy.svg', emoji: '⚡' },
    'soda': { svg: '/icons/soda.svg', emoji: '🥤' },
    'chocolate': { svg: '/icons/speciality.svg', emoji: '🍫' },
    'boba': { svg: '/icons/boba.svg', emoji: '🌿' },
    // 'pour-over': { svg: '/icons/brewed.svg', emoji: '💧' },
    // 'siphon': { svg: '/icons/speciality.svg', emoji: '🧪' },
    'default': { svg: '/icons/brewed.svg', emoji: '☕' }
  };

  const icon = iconMap[iconId as keyof typeof iconMap] || iconMap.default;
  
  return (
    <img 
      src={icon.svg} 
      alt={iconId}
      className={`w-full h-full object-contain ${className}`}
      onError={(e) => {
        // Fallback to emoji if SVG fails to load
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const emojiSpan = document.createElement('span');
        emojiSpan.textContent = icon.emoji;
        emojiSpan.className = className;
        target.parentNode?.replaceChild(emojiSpan, target);
      }}
    />
  );
};

interface RecommendationCardProps {
  coffee: CoffeeItem;
  hoursUntilBed: number;
  bedtime: string;
  currentTime: TimeOfDay;
  index: number;
  onSelect: (coffee: CoffeeItem) => void;
  onLogSuccess: () => void;
}

// Get coffee-specific icon ID based on category and name
const getCoffeeIcon = (coffee: CoffeeItem): string => {
  const name = coffee.name.toLowerCase();
  const category = coffee.category;
  
  // PRIORITY 1: Category-based icons (primary mapping)
  let categoryIcon: string;
  switch (category) {
    case 'espresso': categoryIcon = 'espresso'; break;
    case 'milk': categoryIcon = 'milk'; break;
    case 'instant': categoryIcon = 'instant'; break;
    case 'tea': categoryIcon = 'tea'; break;
    case 'cold': categoryIcon = 'iced'; break;
    case 'specialty': categoryIcon = 'specialty'; break;
    case 'energy': categoryIcon = 'energy'; break;
    case 'soda': categoryIcon = 'soda'; break;
    case 'brewed': categoryIcon = 'brewed'; break;
    default: categoryIcon = 'default'; break;
  }
  
  // PRIORITY 2: Special name-based overrides (only for specific cases)
  // High caffeine drinks get special strong-coffee icon regardless of category
  if (name.includes('red eye') || name.includes('black eye') || name.includes('dead eye') || name.includes('cold brew')) {
    return 'strong-coffee';
  }
  
  // Iced drinks get iced icon regardless of category (visual priority)
  if (name.includes('iced') || name.includes('frappé') || name.includes('cold')) {
    return 'iced';
  }
  
  // Boba tea gets special boba icon
  if (name.includes('boba') || name.includes('bubble tea')) {
    return 'boba';
  }
  
  // Default to category-based icon
  return categoryIcon;
};

const getRecommendationContext = (index: number, coffee: CoffeeItem, verdict: any, currentTime: TimeOfDay, bedtime: string) => {
  const contexts = [
    {
      title: "Perfect timing",
      description: `This ${coffee.name.toLowerCase()} will give you the right energy boost for your ${currentTime} activities.`,
      icon: getCoffeeIcon(coffee)
    },
    {
      title: "Smart choice",
      description: `With ${verdict.remainingAtBedtime || "minimal"} caffeine remaining at bedtime, this ${coffee.name.toLowerCase()} strikes the perfect balance for your energy needs.`,
      icon: getCoffeeIcon(coffee)
    },
    {
      title: "Sleep-friendly",
      description: `This ${coffee.name.toLowerCase()} provides gentle energy that naturally fades, helping you maintain your sleep schedule without disruption.`,
      icon: getCoffeeIcon(coffee)
    }
  ];
  return contexts[index % contexts.length];
};

export const RecommendationCard = ({ 
  coffee, 
  hoursUntilBed, 
  bedtime,
  currentTime,
  index,
  onSelect, 
  onLogSuccess 
}: RecommendationCardProps) => {
  const mgAdj = coffee.caffeineMg;
  const v = getSleepVerdict(mgAdj, hoursUntilBed, HALF_LIFE_HOURS);
  const context = getRecommendationContext(index, coffee, v, currentTime, bedtime);

  return (
    <Card 
      className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer bg-gradient-to-br from-white via-amber-50/20 to-white backdrop-blur-sm flex flex-col h-full" 
      onClick={() => onSelect(coffee)}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-orange-400/5 to-amber-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Card Header */}
      <CardHeader className="relative pb-3 sm:pb-6">
        <div className="flex items-start justify-between mb-2 sm:mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CoffeeIcon iconId={context.icon} className="w-5 h-5 sm:w-8 sm:h-8" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base sm:text-xl font-bold text-gray-900 group-hover:text-amber-800 transition-colors leading-tight">
                  {coffee.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 font-medium">
                    {mgAdj}mg caffeine
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2 sm:line-clamp-none">
              <span className="hidden sm:inline">{coffee.description} </span>
              <span className="sm:hidden">{coffee.description}</span>
              <span className="hidden sm:inline">{context.description}</span>
            </p>
          </div>
        </div>
      </CardHeader>
      
      {/* Card Content */}
      <CardContent className="relative pt-0 flex flex-col h-full">
        {/* Description area - flex-grow to push bottom content down */}
        <div className="flex-grow">
          {/* Quick Info - status indicators */}
          <div className="flex items-center justify-between text-xs mb-4">
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${
                v.code === 'green' ? 'bg-green-400' : 
                v.code === 'yellow' ? 'bg-amber-400' : 
                'bg-red-400'
              }`}></span>
              <span className={`font-medium ${
                v.code === 'green' ? 'text-green-600' : 
                v.code === 'yellow' ? 'text-amber-600' : 
                'text-red-600'
              }`}>
                {v.chip}
              </span>
            </span>
            <span className="flex items-center gap-1 text-gray-500 hidden sm:flex">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Perfect timing
            </span>
          </div>
        </div>
        
        {/* Bottom section - always at bottom */}
        <div className="mt-auto space-y-3">
          {/* Quick Log Button */}
          <div onClick={(e) => e.stopPropagation()}>
            <QuickLogButton 
              coffee={coffee} 
              variant="outline" 
              size="sm" 
              className="w-full text-xs sm:text-sm h-8 sm:h-9"
              showDialog={true}
              onLogSuccess={onLogSuccess}
              showUndoAfterLog={true}
            />
          </div>
        </div>
      </CardContent>
      
      {/* Hover effect indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
    </Card>
  );
};
