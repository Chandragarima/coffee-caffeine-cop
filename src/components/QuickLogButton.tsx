import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const { quickLog, logs, deleteLog, refreshStats } = useCoffeeLogs();
  const { servingSize, shots } = usePreferences();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [mood, setMood] = useState<'great' | 'good' | 'ok' | 'bad'>('good');
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
          shots
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
      const success = await quickLog(
        coffee.id,
        coffee.name,
        dynamicCaffeine,
        servingSize,
        shots,
        notes
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
        
        setIsOpen(false);
        setNotes('');
        setLocation('');
        setMood('good');
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

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'great': return '😍';
      case 'good': return '😊';
      case 'ok': return '😐';
      case 'bad': return '😞';
      default: return '😊';
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
              Log
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Log Your Coffee</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Coffee Info */}
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{coffee.name}</h3>
                    <p className="text-sm text-gray-600">{coffee.description}</p>
                  </div>
                  <Badge variant="outline" className="border-amber-200 text-amber-700">
                    {dynamicCaffeine}mg
                  </Badge>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {servingSize}oz • {shots} shot{shots > 1 ? 's' : ''}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How was it? Any special notes?"
                  className="resize-none"
                  rows={3}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (optional)
                </label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Where did you have it?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No location</SelectItem>
                    <SelectItem value="home">🏠 Home</SelectItem>
                    <SelectItem value="work">💼 Work</SelectItem>
                    <SelectItem value="cafe">☕ Cafe</SelectItem>
                    <SelectItem value="restaurant">🍽️ Restaurant</SelectItem>
                    <SelectItem value="travel">✈️ Travel</SelectItem>
                    <SelectItem value="other">📍 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mood */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How did it make you feel?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['great', 'good', 'ok', 'bad'] as const).map((moodOption) => (
                    <Button
                      key={moodOption}
                      variant={mood === moodOption ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMood(moodOption)}
                      className="flex flex-col items-center gap-1 h-auto py-3"
                    >
                      <span className="text-lg">{getMoodIcon(moodOption)}</span>
                      <span className="text-xs capitalize">{moodOption}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
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
                    'Log Coffee'
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
