import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCoffeeLogs } from '@/hooks/useCoffeeLogs';
import { useIsMobile } from '@/hooks/use-mobile';
import { CoffeeLogEntry } from '@/lib/coffeeLog';
import { addCoffeeLoggedListener, addCoffeeDeletedListener } from '@/lib/events';
import { toast } from '@/components/ui/sonner';
import { CoffeeItem, COFFEES } from '@/data/coffees';

// Helper component to render coffee icons (SVG or emoji fallback)
const CoffeeIcon = ({ iconId, className = "" }: { iconId: string, className?: string }) => {
  // Mapping of icon IDs to SVG paths and emoji fallbacks
  const iconMap = {
    'espresso': { svg: '/icons/espresso.svg', emoji: '☕' },
    'brewed': { svg: '/icons/brewed.svg', emoji: '☕' },
    'milk': { svg: '/icons/milk-based.svg', emoji: '🥛' },
    'instant': { svg: '/icons/instant.svg', emoji: '☕' },
    'tea': { svg: '/icons/tea.svg', emoji: '🫖' },
    'iced': { svg: '/icons/iced.svg', emoji: '🧊' },
    'specialty': { svg: '/icons/speciality.svg', emoji: '✨' },
    'energy': { svg: '/icons/energy.svg', emoji: '⚡' },
    'soda': { svg: '/icons/soda.svg', emoji: '🥤' },
    'chocolate': { svg: '/icons/speciality.svg', emoji: '🍫' },
    'boba': { svg: '/icons/boba.svg', emoji: '🌿' },
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

// Get coffee-specific icon ID based on category and name
const getCoffeeIcon = (coffeeName: string, category?: string): string => {
  const name = coffeeName.toLowerCase();
  
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
    return 'brewed'; // Use brewed icon for strong coffee
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

interface RecentLogUndoProps {
  className?: string;
  showCount?: number; // Number of recent logs to show
  onUndo?: () => void; // Callback when a log is undone
}

const RecentLogUndo = ({ 
  className = '', 
  showCount = 3,
  onUndo 
}: RecentLogUndoProps) => {
  const { logs, deleteLog, refreshStats, refreshLogs } = useCoffeeLogs();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  // Listen for coffee logged/deleted events to refresh immediately
  useEffect(() => {
    const handleCoffeeLogged = async () => {
      await refreshLogs(); // Refresh logs when coffee is logged
    };

    const handleCoffeeDeleted = async () => {
      await refreshLogs(); // Refresh logs when coffee is deleted
    };

    const removeLoggedListener = addCoffeeLoggedListener(handleCoffeeLogged);
    const removeDeletedListener = addCoffeeDeletedListener(handleCoffeeDeleted);

    return () => {
      removeLoggedListener();
      removeDeletedListener();
    };
  }, [refreshLogs]);

  // Get all recent logs (last 24 hours) for count
  const allRecentLogs = logs.filter(log => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    return log.consumedAt >= oneDayAgo;
  });

  // Get limited recent logs for display - show fewer on mobile
  const effectiveShowCount = isMobile ? Math.min(showCount, 2) : showCount;
  const recentLogs = allRecentLogs
    .sort((a, b) => b.consumedAt - a.consumedAt)
    .slice(0, isExpanded ? allRecentLogs.length : effectiveShowCount);

  const handleUndoLog = async (log: CoffeeLogEntry) => {
    setIsDeleting(log.id);
    try {
      const success = await deleteLog(log.id);
      if (success) {
        toast.success(`${log.coffeeName} removed`, {
          description: 'Coffee log has been undone',
          duration: 3000,
        });
        await refreshStats();
        onUndo?.();
      } else {
        toast.error('Failed to remove coffee log', {
          description: 'Please try again.',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to delete log:', error);
      toast.error('Failed to remove coffee log', {
        description: 'Please try again.',
        duration: 3000,
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - timestamp;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // Show actual time for recent entries, with "Just now" for <1 minute
    if (diffMinutes < 1) return 'Just now';
    
    // For today, show time only
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // For older entries, show date + time
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMoodIcon = (mood?: string) => {
    switch (mood) {
      case 'great': return '😍';
      case 'good': return '😊';
      case 'ok': return '😐';
      case 'bad': return '😞';
      default: return '☕';
    }
  };

  if (allRecentLogs.length === 0) {
    return null;
  }

  const hasMoreLogs = allRecentLogs.length > effectiveShowCount;
  const remainingCount = allRecentLogs.length - effectiveShowCount;

  return (
    <>
      <Card className={`${className} border-amber-200 bg-amber-50/30`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Recently Logged</h3>
            <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">
              {allRecentLogs.length} drink{allRecentLogs.length > 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="space-y-1.5 sm:space-y-2">
            {recentLogs.map((log) => (
              <div 
                key={log.id} 
                className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-amber-100 shadow-sm"
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CoffeeIcon 
                      iconId={getCoffeeIcon(log.coffeeName, COFFEES.find(c => c.id === log.coffeeId)?.category)} 
                      className="w-4 h-4 sm:w-5 sm:h-5" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="font-medium text-gray-900 truncate text-sm sm:text-base">
                        {log.coffeeName}
                      </span>
                      <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 px-1 sm:px-2">
                        {log.caffeineMg}mg
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500">
                      <span>{formatTime(log.consumedAt)}</span>
                      {log.notes && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate hidden sm:inline">{log.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUndoLog(log)}
                  disabled={isDeleting === log.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-1 sm:ml-2 px-2 sm:px-3 h-7 sm:h-9"
                >
                  {isDeleting === log.id ? (
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="text-sm">↶</span>
                      <span className="ml-0.5 sm:ml-1 text-xs hidden sm:inline">Undo</span>
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
          
          {/* Expandable "Show More" Button */}
          {hasMoreLogs && !isExpanded && (
            <div className="mt-2 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-2 py-1 h-auto"
              >
                + {remainingCount} more
              </Button>
            </div>
          )}

          {/* Collapse Button when Expanded */}
          {isExpanded && hasMoreLogs && (
            <div className="mt-2 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-2 py-1 h-auto"
              >
                Show less
              </Button>
            </div>
          )}
          
          <div className="mt-2 sm:mt-3 text-xs text-gray-500 text-center hidden sm:block">
            💡 You can undo recent logs if you made a mistake or were just testing
          </div>
        </CardContent>
      </Card>

    </>
  );
};

export default RecentLogUndo;
