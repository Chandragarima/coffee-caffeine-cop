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
           <DialogContent className="w-[95%] max-w-sm mx-auto max-h-[90vh] overflow-y-auto !p-6">
             <DialogHeader className="pb-3">
               <DialogTitle className="text-lg">Log {coffee.name}</DialogTitle>
             </DialogHeader>
             
             <div className="space-y-4">
               {/* Compact Drink Info */}
               <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                 <div className="flex-1">
                   <div className="flex items-center gap-2">
                     <span className="font-medium text-gray-900">{coffee.name}</span>
                     <Badge variant="outline" className="border-amber-200 text-amber-700 text-xs">
                       {dynamicCaffeine}mg
                     </Badge>
                   </div>
                   <p className="text-xs text-gray-500 mt-1">{servingSize}oz</p>
                 </div>
               </div>

               {/* Time Selection */}
               <div className="space-y-3">
                 <div className="grid grid-cols-2 gap-2">
                   {(() => {
                     const now = new Date();
                     const morning = new Date(now);
                     morning.setHours(8, 0, 0, 0);
                     const afternoon = new Date(now);
                     afternoon.setHours(14, 0, 0, 0);
                     
                     return [
                       { label: 'This morning', time: morning.getTime() },
                       { label: 'This afternoon', time: afternoon.getTime() },
                       { label: 'Just now', time: now.getTime() },
                       { label: '1 hour ago', time: now.getTime() - 60 * 60 * 1000 },
                     ];
                   })().map((option) => (
                     <Button
                       key={option.label}
                       variant={(() => {
                         if (option.label === 'Just now') {
                           return Math.abs(consumedAt - Date.now()) < 60000 ? 'default' : 'outline';
                         } else if (option.label === '1 hour ago') {
                           return Math.abs(consumedAt - (Date.now() - 60 * 60 * 1000)) < 60000 ? 'default' : 'outline';
                         } else {
                           return consumedAt === option.time ? 'default' : 'outline';
                         }
                       })()}
                       size="sm"
                       onClick={() => setConsumedAt(option.time)}
                       className={`h-12 relative ${(() => {
                         if (option.label === 'Just now') {
                           return Math.abs(consumedAt - Date.now()) < 60000 ? 'ring-2 ring-amber-500' : '';
                         } else if (option.label === '1 hour ago') {
                           return Math.abs(consumedAt - (Date.now() - 60 * 60 * 1000)) < 60000 ? 'ring-2 ring-amber-500' : '';
                         } else {
                           return consumedAt === option.time ? 'ring-2 ring-amber-500' : '';
                         }
                       })()}`}
                     >
                       {option.label}
                       {(() => {
                         if (option.label === 'Just now') {
                           return Math.abs(consumedAt - Date.now()) < 60000;
                         } else if (option.label === '1 hour ago') {
                           return Math.abs(consumedAt - (Date.now() - 60 * 60 * 1000)) < 60000;
                         } else {
                           return consumedAt === option.time;
                         }
                       })() && (
                         <span className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                           ✓
                         </span>
                       )}
                     </Button>
                   ))}
                 </div>
                 
                 {/* Custom time - only show if needed */}
                 <div className="border-t pt-3">
                   <div className="flex gap-2">
                     <input
                       type="time"
                       value={new Date(consumedAt).toLocaleTimeString('en-US', { 
                         hour12: false, 
                         hour: '2-digit', 
                         minute: '2-digit' 
                       })}
                       onChange={(e) => {
                         const [hours, minutes] = e.target.value.split(':');
                         const customTime = new Date();
                         customTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                         setConsumedAt(customTime.getTime());
                       }}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                     />
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
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                     />
                   </div>
                 </div>
                 
                 {/* Selected time - compact */}
                 <p className="text-xs text-gray-500 text-center">
                   {new Date(consumedAt).toLocaleString()}
                 </p>
               </div>

               {/* Actions */}
               <div className="flex gap-2 pt-2">
                 <Button
                   variant="outline"
                   onClick={() => setIsOpen(false)}
                   className="flex-1"
                 >
                   Cancel
                 </Button>
                 <Button
                   onClick={handleLogWithDetails}
                   disabled={isLogging}
                   className="flex-1"
                 >
                   {isLogging ? (
                     <>
                       <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                       Logging...
                     </>
                   ) : (
                     'Log'
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
