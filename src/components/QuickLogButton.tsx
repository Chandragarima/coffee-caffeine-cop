import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Badge } from '@/components/ui/badge';
import { useCoffeeLogs } from '@/hooks/useCoffeeLogs';
import { usePreferences } from '@/hooks/usePreferences';
import { CoffeeItem } from '@/data/coffees';
import { adjustedMg } from '@/lib/serving';
import { toast } from '@/components/ui/sonner';
import { useDynamicCaffeine } from '@/hooks/useDynamicCaffeine';

interface QuickLogButtonProps {
  coffee: CoffeeItem;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showDialog?: boolean;
  onLogSuccess?: () => void;
  showUndoAfterLog?: boolean; // Show undo option after logging
}

const QuickLogButton = ({ 
  coffee, 
  variant = 'default', 
  size = 'default',
  className = '',
  showDialog = true,
  onLogSuccess,
  showUndoAfterLog = false
}: QuickLogButtonProps) => {
  const { quickLog, addLog, logs, deleteLog, refreshStats } = useCoffeeLogs();
  const { servingSize, shots } = usePreferences();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [consumedAt, setConsumedAt] = useState<number>(Date.now());
  const [lastLoggedId, setLastLoggedId] = useState<string | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  const dynamicCaffeine = useDynamicCaffeine(coffee);

  const handleQuickLog = async () => {
    if (!showDialog) {
      // Direct log without dialog
      setIsLogging(true);
      try {
        const success = await quickLog(
          coffee.id,
          coffee.name,
          dynamicCaffeine,
          servingSize,
          shots,
          undefined, // notes
          consumedAt
        );
        
        if (success) {
          // Show success toast
          toast.success(`${coffee.name} logged!`, {
            description: `+${dynamicCaffeine}mg caffeine added to your daily intake`,
            duration: 4000,
          });
          
          // Find the most recent log for this coffee
          const recentLog = logs
            .filter(log => log.coffeeId === coffee.id)
            .sort((a, b) => b.timestamp - a.timestamp)[0];
          
          if (recentLog && showUndoAfterLog) {
            setLastLoggedId(recentLog.id);
            setShowUndo(true);
            // Auto-hide undo option after 10 seconds
            setTimeout(() => setShowUndo(false), 10000);
          }
          
          // Notify parent component to refresh stats
          onLogSuccess?.();
        }
      } catch (error) {
        console.error('Failed to log coffee:', error);
        toast.error('Failed to log coffee', {
          description: 'Please try again.',
          duration: 4000,
        });
      } finally {
        setIsLogging(false);
      }
      return;
    }

    setIsOpen(true);
  };

  const handleLogWithDetails = async () => {
    setIsLogging(true);
    try {
      const success = await addLog({
        coffeeId: coffee.id,
        coffeeName: coffee.name,
        caffeineMg: dynamicCaffeine,
        servingSize,
        shots,
        timestamp: Date.now(),
        consumedAt
      });
      
      if (success) {
        // Show success toast
        toast.success(`${coffee.name} logged!`, {
          description: `+${dynamicCaffeine}mg caffeine added to your daily intake`,
          duration: 4000,
        });
        
        // Find the most recent log for this coffee
        const recentLog = logs
          .filter(log => log.coffeeId === coffee.id)
          .sort((a, b) => b.timestamp - a.timestamp)[0];
        
        if (recentLog && showUndoAfterLog) {
          setLastLoggedId(recentLog.id);
          setShowUndo(true);
          // Auto-hide undo option after 10 seconds
          setTimeout(() => setShowUndo(false), 10000);
        }
        
        // Notify parent component to refresh stats
        onLogSuccess?.();
        
        setIsOpen(false);
        setConsumedAt(Date.now());
      }
    } catch (error) {
      console.error('Failed to log coffee:', error);
      toast.error('Failed to log coffee', {
        description: 'Please try again.',
        duration: 4000,
      });
    } finally {
      setIsLogging(false);
    }
  };



  const handleUndo = async () => {
    if (!lastLoggedId) return;
    
    try {
      const success = await deleteLog(lastLoggedId);
      if (success) {
        toast.success(`${coffee.name} removed`, {
          description: 'Coffee log has been undone',
          duration: 3000,
        });
        setShowUndo(false);
        setLastLoggedId(null);
        await refreshStats();
        onLogSuccess?.();
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
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <Button
          variant={variant}
          size={size}
          onClick={handleQuickLog}
          disabled={isLogging}
          className={`${className} ${isLogging ? 'opacity-50' : ''}`}
        >
          {isLogging ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
              Logging...
            </>
          ) : (
            <>
              {/* <span className="mr-2">☕</span> */}
              {showDialog ? 'Log' : 'Log'}
            </>
          )}
        </Button>
        
        {/* Undo button that appears after logging */}
        {/* {showUndo && showUndoAfterLog && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
          >
            <span className="mr-1">↶</span>
            Undo {coffee.name}
          </Button>
        )} */}
      </div>



      {showDialog && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="w-[95%] max-w-md mx-auto p-0 gap-0 overflow-hidden">
            <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-primary/5 to-primary/10">
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <span className="text-2xl">☕</span>
                Log {coffee.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="p-6 space-y-6">
              {/* Coffee Info Card */}
              <div className="p-4 bg-card rounded-xl border border-border/50 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg">{coffee.name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary font-medium">
                        {dynamicCaffeine}mg caffeine
                      </Badge>
                      <span className="text-sm text-muted-foreground">{servingSize}oz serving</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Selection */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground">When did you have this?</h4>
                
                {/* Quick Time Options */}
                <div className="grid grid-cols-2 gap-3">
                  {(() => {
                    const now = new Date();
                    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
                    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
                    const morning = new Date(now);
                    morning.setHours(8, 0, 0, 0);
                    
                    return [
                      { label: 'Just now', time: now.getTime(), icon: '⚡' },
                      { label: '1 hour ago', time: hourAgo.getTime(), icon: '🕐' },
                      { label: '2 hours ago', time: twoHoursAgo.getTime(), icon: '🕑' },
                      { label: 'This morning', time: morning.getTime(), icon: '🌅' },
                    ];
                  })().map((option) => {
                    const isSelected = Math.abs(consumedAt - option.time) < 60000;
                    return (
                      <Button
                        key={option.label}
                        variant={isSelected ? 'default' : 'outline'}
                        size="lg"
                        onClick={() => setConsumedAt(option.time)}
                        className={`h-16 flex-col gap-1 text-xs font-medium transition-all ${
                          isSelected ? 'ring-2 ring-primary/20 scale-[1.02]' : 'hover:scale-[1.01]'
                        }`}
                      >
                        <span className="text-lg">{option.icon}</span>
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
                
                {/* Custom Time Picker */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">Or choose a specific time:</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground uppercase tracking-wide">Time</label>
                      <select
                        value={new Date(consumedAt).toLocaleTimeString('en-US', { 
                          hour12: false, 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(':');
                          const customTime = new Date(consumedAt);
                          customTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                          setConsumedAt(customTime.getTime());
                        }}
                        className="w-full px-3 py-3 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        {Array.from({ length: 24 }, (_, hour) => 
                          ['00', '15', '30', '45'].map(minute => {
                            const timeString = `${hour.toString().padStart(2, '0')}:${minute}`;
                            return (
                              <option key={timeString} value={timeString}>
                                {new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </option>
                            );
                          })
                        ).flat()}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground uppercase tracking-wide">Date</label>
                      <input
                        type="date"
                        value={new Date(consumedAt).toISOString().split('T')[0]}
                        onChange={(e) => {
                          const selectedDate = new Date(e.target.value);
                          const currentTime = new Date(consumedAt);
                          selectedDate.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0);
                          setConsumedAt(selectedDate.getTime());
                        }}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-3 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Selected Time Display */}
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <span className="text-sm text-muted-foreground">Selected time: </span>
                  <span className="font-medium text-foreground">
                    {new Date(consumedAt).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 h-12"
                  disabled={isLogging}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLogWithDetails}
                  disabled={isLogging}
                  className="flex-1 h-12 font-medium"
                >
                  {isLogging ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Logging...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">✓</span>
                      Log Coffee
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default QuickLogButton;
