import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCoffeeLogs } from '@/hooks/useCoffeeLogs';
import { usePreferences } from '@/hooks/usePreferences';
import { CoffeeItem } from '@/data/coffees';
import { toast } from '@/components/ui/sonner';
import { getLocalDateString, parseLocalDateString } from '@/lib/timeUtils';

interface QuickLogButtonProps {
  coffee: CoffeeItem;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showDialog?: boolean; // If undefined, uses quick_log_mode preference
  onLogSuccess?: () => void;
  showUndoAfterLog?: boolean; // Show undo option after logging
  instantLog?: boolean; // Force instant logging (no dialog, no customization)
}

const QuickLogButton = ({ 
  coffee, 
  variant = 'default', 
  size = 'default',
  className = '',
  showDialog, // undefined means use preference
  onLogSuccess,
  showUndoAfterLog = false,
  instantLog = false // Force instant logging
}: QuickLogButtonProps) => {
  const { quickLog, addLog, logs, deleteLog, refreshStats } = useCoffeeLogs();
  const { quickLogMode } = usePreferences();
  
  // Determine if we should show dialog
  // instantLog takes precedence, then showDialog prop, then preference
  const shouldShowDialog = instantLog ? false : (showDialog !== undefined ? showDialog : !quickLogMode);
  const [isOpen, setIsOpen] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [consumedAt, setConsumedAt] = useState<number>(Date.now());
  const [lastLoggedId, setLastLoggedId] = useState<string | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  // Serving customization state
  const [selectedSize, setSelectedSize] = useState<number>(
    coffee.sizeOptions?.[0]?.oz || 8
  );
  const [selectedShots, setSelectedShots] = useState<number>(
    coffee.shotOptions?.[0]?.shots || 1
  );
  const [selectedTeaspoons, setSelectedTeaspoons] = useState<number>(
    coffee.teaspoonOptions?.[0]?.teaspoons || 1
  );

  // Calculate current caffeine based on selections
  const getCurrentCaffeine = (): number => {
    switch (coffee.scalingType) {
      case 'size_only':
        const sizeOption = coffee.sizeOptions?.find(option => option.oz === selectedSize);
        return sizeOption?.caffeine || coffee.caffeineMg;
      case 'shots_only':
        const shotOption = coffee.shotOptions?.find(option => option.shots === selectedShots);
        return shotOption?.caffeine || coffee.caffeineMg;
      case 'both_size_shots':
        // For drinks with both size and shots, use the exact values from sizeAndShotOptions
        if (coffee.sizeAndShotOptions) {
          const sizeAndShotOption = coffee.sizeAndShotOptions.find(option => option.oz === selectedSize);
          if (sizeAndShotOption) {
            // Use the exact baseCaffeine value from sizeAndShotOptions
            const caffeinePerShot = sizeAndShotOption.baseCaffeine / sizeAndShotOption.defaultShots;
            return caffeinePerShot * selectedShots;
            // return sizeAndShotOption.baseCaffeine;
          }
        }
        // Fallback to old logic if sizeAndShotOptions not available
        const sizeOption2 = coffee.sizeOptions?.find(option => option.oz === selectedSize);
        return sizeOption2?.caffeine || coffee.caffeineMg;
      case 'teaspoon':
        const teaspoonOption = coffee.teaspoonOptions?.find(option => option.teaspoons === selectedTeaspoons);
        return teaspoonOption?.caffeine || coffee.caffeineMg;
      case 'fixed_size':
      default:
        return coffee.caffeineMg;
    }
  };

  // Set defaults when coffee changes
  useEffect(() => {
    if (coffee.sizeOptions && coffee.sizeOptions.length > 0) {
      setSelectedSize(coffee.sizeOptions[0].oz);
    }
    if (coffee.shotOptions && coffee.shotOptions.length > 0) {
      setSelectedShots(coffee.shotOptions[0].shots);
    }
    if (coffee.teaspoonOptions && coffee.teaspoonOptions.length > 0) {
      setSelectedTeaspoons(coffee.teaspoonOptions[0].teaspoons);
    }
  }, [coffee]);

  // Auto-update shots when size changes for both_size_shots drinks
  useEffect(() => {
    if (coffee.scalingType === 'both_size_shots' && coffee.sizeAndShotOptions) {
      // Find the selected size option
      const selectedSizeOption = coffee.sizeAndShotOptions.find(option => option.oz === selectedSize);
      
      if (selectedSizeOption) {
        // Automatically update shots to match the size selection
        setSelectedShots(selectedSizeOption.defaultShots);
      }
    }
  }, [selectedSize, coffee]);

  // Calculate current caffeine based on selections - automatically recalculates when selections change
  const currentCaffeine = useMemo(() => getCurrentCaffeine(), [selectedSize, selectedShots, selectedTeaspoons, coffee]);

  // Helper function to calculate default caffeine for instant logging
  const getDefaultCaffeine = (): { caffeine: number; size: number; shots: 1 | 2 | 3 } => {
    const defaultSize = coffee.sizeOptions?.[0]?.oz || 8;
    const defaultShots = (coffee.shotOptions?.[0]?.shots || 1) as 1 | 2 | 3;
    const defaultTeaspoons = coffee.teaspoonOptions?.[0]?.teaspoons || 1;
    
    let defaultCaffeine = coffee.caffeineMg;
    
    switch (coffee.scalingType) {
      case 'size_only':
        const sizeOption = coffee.sizeOptions?.find(opt => opt.oz === defaultSize);
        defaultCaffeine = sizeOption?.caffeine || coffee.caffeineMg;
        break;
      case 'shots_only':
        const shotOption = coffee.shotOptions?.find(opt => opt.shots === defaultShots);
        defaultCaffeine = shotOption?.caffeine || coffee.caffeineMg;
        break;
      case 'both_size_shots':
        if (coffee.sizeAndShotOptions) {
          const sizeOption = coffee.sizeAndShotOptions.find(opt => opt.oz === defaultSize);
          if (sizeOption) {
            const caffeinePerShot = sizeOption.baseCaffeine / sizeOption.defaultShots;
            defaultCaffeine = caffeinePerShot * defaultShots;
          }
        }
        break;
      case 'teaspoon':
        const tspOption = coffee.teaspoonOptions?.find(opt => opt.teaspoons === defaultTeaspoons);
        defaultCaffeine = tspOption?.caffeine || coffee.caffeineMg;
        break;
      case 'fixed_size':
      default:
        defaultCaffeine = coffee.caffeineMg;
    }
    
    return { caffeine: defaultCaffeine, size: defaultSize, shots: defaultShots };
  };

  const handleQuickLog = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (shouldShowDialog) {
      setIsOpen(true);
      return;
    }
    // Direct log without dialog - use defaults
    setIsLogging(true);
      try {
        const defaults = getDefaultCaffeine();
        
        const success = await quickLog(
          coffee.id,
          coffee.name,
          defaults.caffeine,
          defaults.size,
          defaults.shots,
          undefined, // notes
          Date.now() // Use current time for instant log
        );
        
        if (success) {
          // Show success toast
          toast.success(`${coffee.name} logged!`, {
            description: `+${defaults.caffeine}mg caffeine added`,
            duration: 3000,
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
  };

  const handleLogWithDetails = async () => {
    setIsLogging(true);
    try {
              const success = await addLog({
          coffeeId: coffee.id,
          coffeeName: coffee.name,
          caffeineMg: currentCaffeine,
          servingSize: selectedSize,
          shots: selectedShots as 1 | 2 | 3,
          timestamp: Date.now(),
          consumedAt
        });
      
      if (success) {
        // Show success toast
        toast.success(`${coffee.name} logged!`, {
          description: `+${currentCaffeine}mg caffeine added`,
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
          onClick={(e) => handleQuickLog(e)}
          disabled={isLogging}
          className={`${className} ${isLogging ? 'opacity-50' : ''}`}
        >
          {isLogging ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
              Logging...
            </>
          ) : (
            instantLog ? 'Log' : 'Customize'
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



      {shouldShowDialog && (
                 <Dialog open={isOpen} onOpenChange={setIsOpen}>
           <DialogContent className="w-[95%] max-w-sm mx-auto max-h-[90vh] overflow-y-auto !p-6">
             <DialogHeader className="pb-3">
               <DialogTitle className="text-lg">Log {coffee.name}</DialogTitle>
             </DialogHeader>
             
             <div className="space-y-4">
               {/* Compact Drink Info */}
               {/* <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                 <div className="flex-1">
                   <div className="flex items-center gap-2">
                     <span className="font-medium text-gray-900">{coffee.name}</span>
                     <Badge variant="outline" className="border-amber-200 text-amber-700 text-xs">
                       {currentCaffeine}mg
                     </Badge>
                   </div>
                   <p className="text-xs text-gray-500 mt-1">
                     {coffee.scalingType === 'teaspoon' ? `${selectedTeaspoons} tsp` : `${selectedSize}oz`}
                                            {coffee.scalingType === 'shots_only' || coffee.scalingType === 'both_size_shots' ? `, ${selectedShots} shot${Number(selectedShots) > 1 ? 's' : ''}` : ''}
                   </p>
                 </div>
               </div> */}

               {/* Serving Customization Controls */}
               {coffee.scalingType !== 'fixed_size' && (
                 <div className="space-y-3 p-3 bg-amber-50 rounded-lg border border-gray-200">
                   <h4 className="text-sm font-medium text-gray-700">Customize Serving</h4>
                   
                   {/* Size Controls - Always separate from shots */}
                   {(coffee.scalingType === 'size_only' || coffee.scalingType === 'both_size_shots') && coffee.sizeOptions && (
                     <div className="space-y-2">
                       <Label className="text-xs text-gray-600">Serving Size</Label>
                       <Select value={selectedSize.toString()} onValueChange={(value) => setSelectedSize(parseInt(value))}>
                         <SelectTrigger className="h-8 text-sm">
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           {coffee.sizeOptions.map((option) => (
                             <SelectItem key={option.oz} value={option.oz.toString()}>
                               {option.size} ({option.oz}oz) - {option.caffeine}mg
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                   )}

                   {/* Shot Controls - Always separate from size */}
                   {(coffee.scalingType === 'shots_only' || coffee.scalingType === 'both_size_shots') && coffee.shotOptions && (
                     <div className="space-y-2">
                       <div className="flex items-center justify-between">
                         <Label className="text-xs text-gray-600">Number of Shots</Label>
                         {coffee.scalingType === 'both_size_shots' && (
                           <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
                             Auto-updated
                           </span>
                         )}
                       </div>
                       <Select value={selectedShots.toString()} onValueChange={(value) => setSelectedShots(parseInt(value))}>
                         <SelectTrigger className="h-8 text-sm">
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           {coffee.shotOptions
                             .filter((option) => option.shots <= 4) // Limit to maximum 4 shots
                             .map((option) => {
                               // Calculate caffeine based on number of shots
                               let shotCaffeine = option.caffeine;
                               if (coffee.scalingType === 'both_size_shots' && coffee.sizeAndShotOptions) {
                                 const sizeOption = coffee.sizeAndShotOptions.find(s => s.oz === selectedSize);
                                 if (sizeOption) {
                                   // For both_size_shots, multiply base caffeine by number of shots
                                   const caffeinePerShot = sizeOption.baseCaffeine / sizeOption.defaultShots;
                                   shotCaffeine = caffeinePerShot * option.shots;
                                 }
                               }
                               
                               return (
                                 <SelectItem key={option.shots} value={option.shots.toString()}>
                                   {option.shots} shot{option.shots > 1 ? 's' : ''} ({shotCaffeine}mg)
                                 </SelectItem>
                               );
                             })}
                         </SelectContent>
                       </Select>
                       {/* {coffee.scalingType === 'both_size_shots' && (
                         <p className="text-xs text-gray-500">
                           Shots automatically update based on serving size selection
                         </p>
                       )} */}
                     </div>
                   )}

                   {/* Teaspoon Controls */}
                   {coffee.scalingType === 'teaspoon' && coffee.teaspoonOptions && (
                     <div className="space-y-2">
                       <Label className="text-xs text-gray-600">Teaspoons</Label>
                       <Select value={selectedTeaspoons.toString()} onValueChange={(value) => setSelectedTeaspoons(parseInt(value))}>
                         <SelectTrigger className="h-8 text-sm">
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           {coffee.teaspoonOptions
                             .filter((option) => option.teaspoons > 0) // Remove 0tsp option
                             .map((option) => (
                               <SelectItem key={option.teaspoons} value={option.teaspoons.toString()}>
                                 {option.teaspoons} tsp ({option.caffeine}mg)
                               </SelectItem>
                             ))}
                         </SelectContent>
                       </Select>
                     </div>
                   )}

                   {/* Updated Caffeine Display */}
                   <div className="pt-2 border-t border-gray-200">
                     <div className="flex items-center justify-between">
                       <span className="text-xs text-gray-600">Total Caffeine:</span>
                       <span className="text-sm font-semibold text-blue-600">{currentCaffeine}mg</span>
                     </div>
                   </div>
                 </div>
               )}

               {/* Time Selection */}
               <div className="space-y-3">
                 <Label className="text-xs text-gray-600">When did you have it?</Label>
                 <div className="flex flex-wrap gap-2">
                   {(() => {
                     const now = Date.now();
                     const MINUTE = 60 * 1000;
                     const HOUR = 60 * MINUTE;
                     return [
                       { label: 'Just now', offset: 0 },
                       { label: '30m ago', offset: 30 * MINUTE },
                       { label: '1h ago', offset: 1 * HOUR },
                       { label: '2h ago', offset: 2 * HOUR },
                       { label: '3h ago', offset: 3 * HOUR },
                     ].map((option) => {
                       const time = now - option.offset;
                       const isSelected = Math.abs(consumedAt - time) < 2 * MINUTE;
                       return (
                         <button
                           key={option.label}
                           onClick={() => setConsumedAt(time)}
                           className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                             isSelected
                               ? 'bg-amber-100 border-amber-300 text-amber-800'
                               : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                           }`}
                         >
                           {option.label}
                         </button>
                       );
                     });
                   })()}
                 </div>

                 {/* Custom time - collapsible */}
                 <details className="group">
                   <summary className="text-xs text-amber-600 cursor-pointer hover:text-amber-700">
                     Pick exact time
                   </summary>
                   <div className="flex gap-2 mt-2">
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
                       value={getLocalDateString(consumedAt)}
                       onChange={(e) => {
                         const selectedDate = parseLocalDateString(e.target.value);
                         const currentTime = new Date(consumedAt);
                         selectedDate.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0);
                         setConsumedAt(selectedDate.getTime());
                       }}
                       max={getLocalDateString(Date.now())}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                     />
                   </div>
                 </details>

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
