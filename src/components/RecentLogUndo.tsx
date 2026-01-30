import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCoffeeLogs } from '@/hooks/useCoffeeLogs';
import { useIsMobile } from '@/hooks/use-mobile';
import { CoffeeLogEntry } from '@/lib/coffeeLog';
import { addCoffeeLoggedListener, addCoffeeDeletedListener, addCoffeeUpdatedListener } from '@/lib/events';
import { toast } from '@/components/ui/sonner';
import { COFFEES, CoffeeItem, CoffeeCategory } from '@/data/coffees';
import { CoffeeDetailDialog } from '@/components/CoffeeDetailDialog';
import { LogDetailDialog } from '@/components/LogDetailDialog';
import { Plus, Trash2 } from 'lucide-react';

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
  const { logs, deleteLog, addLog, refreshStats, refreshLogs } = useCoffeeLogs();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isRepeating, setIsRepeating] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCoffee, setSelectedCoffee] = useState<CoffeeItem | null>(null);
  const [selectedLog, setSelectedLog] = useState<CoffeeLogEntry | null>(null);
  const isMobile = useIsMobile();

  // Function to get coffee data from coffeeId
  const getCoffeeFromId = (coffeeId: string): CoffeeItem | null => {
    return COFFEES.find(coffee => coffee.id === coffeeId) || null;
  };

  // Function to get the appropriate SVG icon based on coffee category
  const getCoffeeCategoryIcon = (category: CoffeeCategory): string => {
    switch (category) {
      case "brewed":
        return "/icons/brewed.svg";
      case "espresso":
        return "/icons/espresso.svg";
      case "milk":
        return "/icons/milk-based.svg";
      case "instant":
        return "/icons/instant.svg"; // Temporarily use brewed icon until instant.svg is fixed
      case "cold":
        return "/icons/iced.svg";
      case "tea":
        return "/icons/tea.svg";
      case "specialty":
        return "/icons/speciality.svg";
      case "energy":
        return "/icons/energy.svg";
      case "soda":
        return "/icons/soda.svg";
      default:
        return "/icons/brewed.svg"; // Default fallback
    }
  };

  // Listen for coffee logged/deleted/updated events to refresh immediately
  useEffect(() => {
    const handleRefresh = async () => {
      await refreshLogs();
    };

    const removeLoggedListener = addCoffeeLoggedListener(handleRefresh);
    const removeDeletedListener = addCoffeeDeletedListener(handleRefresh);
    const removeUpdatedListener = addCoffeeUpdatedListener(handleRefresh);

    return () => {
      removeLoggedListener();
      removeDeletedListener();
      removeUpdatedListener();
    };
  }, [refreshLogs]);

  // Handle viewing drink info from log detail
  const handleViewDrinkInfo = (coffee: CoffeeItem) => {
    setSelectedLog(null); // Close log detail first
    setSelectedCoffee(coffee);
  };

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

  const handleRepeatLog = async (log: CoffeeLogEntry) => {
    setIsRepeating(log.id);
    try {
      const now = Date.now();
      const id = await addLog({
        coffeeId: log.coffeeId,
        coffeeName: log.coffeeName,
        caffeineMg: log.caffeineMg,
        servingSize: log.servingSize,
        shots: log.shots,
        timestamp: now,
        consumedAt: now,
        notes: log.notes,
        location: log.location,
        mood: log.mood,
      });
      if (id) {
        toast.success(`${log.coffeeName} logged again`, {
          description: 'Logged with current time',
          duration: 3000,
        });
        await refreshStats();
      } else {
        toast.error('Failed to log drink', { description: 'Please try again.', duration: 3000 });
      }
    } catch (error) {
      console.error('Failed to repeat log:', error);
      toast.error('Failed to log drink', { description: 'Please try again.', duration: 3000 });
    } finally {
      setIsRepeating(null);
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
            {recentLogs.map((log) => {
              const coffee = getCoffeeFromId(log.coffeeId);
              const categoryIcon = coffee ? getCoffeeCategoryIcon(coffee.category) : "/icons/brewed.svg";
              
              // Debug logging
              if (coffee?.category === 'instant') {
                console.log('Instant coffee found:', coffee.name, 'Icon path:', categoryIcon);
              }
              
              return (
                <div 
                  key={log.id} 
                  className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-amber-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <img 
                        src={categoryIcon} 
                        alt={coffee?.category || 'coffee'} 
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        onError={(e) => {
                          // Fallback to coffee emoji if icon fails to load
                          const target = e.target as HTMLImageElement;
                          console.log('Icon failed to load:', target.src, 'for coffee:', log.coffeeName);
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <span className="text-amber-600 text-xs sm:text-sm hidden">☕</span>
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
                  
                  <div className="flex items-center gap-0.5 sm:gap-1 ml-1 sm:ml-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRepeatLog(log);
                      }}
                      disabled={isRepeating === log.id}
                      className="text-gray-400 hover:text-amber-600 hover:bg-amber-50 h-7 w-7 sm:h-8 sm:w-8"
                      aria-label="Log same drink again now"
                    >
                      {isRepeating === log.id ? (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUndoLog(log);
                      }}
                      disabled={isDeleting === log.id}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-7 w-7 sm:h-8 sm:w-8"
                      aria-label="Delete log"
                    >
                      {isDeleting === log.id ? (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
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
            Tap a drink to view details or edit
          </div>
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <LogDetailDialog
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        onViewDrinkInfo={handleViewDrinkInfo}
      />

      {/* Coffee Detail Dialog (for viewing drink info) */}
      <CoffeeDetailDialog
        coffee={selectedCoffee}
        hoursUntilBed={8}
        onClose={() => setSelectedCoffee(null)}
      />
    </>
  );
};

export default RecentLogUndo;
