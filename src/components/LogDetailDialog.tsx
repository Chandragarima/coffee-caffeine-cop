import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Pencil, Coffee, Clock, MapPin } from 'lucide-react';
import { CoffeeLogEntry } from '@/lib/coffeeLog';
import { COFFEES, CoffeeItem } from '@/data/coffees';
import { useCoffeeLogs } from '@/hooks/useCoffeeLogs';
import { toast } from '@/components/ui/sonner';

interface LogDetailDialogProps {
  log: CoffeeLogEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDrinkInfo?: (coffee: CoffeeItem) => void;
}

export const LogDetailDialog = ({ log, isOpen, onClose, onViewDrinkInfo }: LogDetailDialogProps) => {
  const { updateLog, refreshStats } = useCoffeeLogs();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Edit state
  const [editedSize, setEditedSize] = useState<number>(8);
  const [editedShots, setEditedShots] = useState<number>(1);
  const [editedTeaspoons, setEditedTeaspoons] = useState<number>(1);
  const [editedConsumedAt, setEditedConsumedAt] = useState<number>(Date.now());

  // Find the coffee item from the catalog
  const coffeeItem = useMemo(() => {
    if (!log) return null;
    return COFFEES.find(c => c.id === log.coffeeId) || null;
  }, [log]);

  // Initialize edit state when log changes or editing starts
  useEffect(() => {
    if (log) {
      setEditedSize(log.servingSize);
      setEditedShots(log.shots);
      setEditedConsumedAt(log.consumedAt);
      // Try to infer teaspoons from caffeine if it's a teaspoon-based coffee
      if (coffeeItem?.scalingType === 'teaspoon' && coffeeItem.teaspoonOptions) {
        const matchingOption = coffeeItem.teaspoonOptions.find(opt => opt.caffeine === log.caffeineMg);
        setEditedTeaspoons(matchingOption?.teaspoons || 1);
      }
    }
  }, [log, coffeeItem]);

  // Reset editing state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

  // Calculate caffeine based on current selections
  const calculateCaffeine = (): number => {
    if (!coffeeItem) return log?.caffeineMg || 0;

    switch (coffeeItem.scalingType) {
      case 'size_only':
        const sizeOption = coffeeItem.sizeOptions?.find(opt => opt.oz === editedSize);
        return sizeOption?.caffeine || coffeeItem.caffeineMg;
      case 'shots_only':
        const shotOption = coffeeItem.shotOptions?.find(opt => opt.shots === editedShots);
        return shotOption?.caffeine || coffeeItem.caffeineMg;
      case 'both_size_shots':
        if (coffeeItem.sizeAndShotOptions) {
          const sizeAndShotOption = coffeeItem.sizeAndShotOptions.find(opt => opt.oz === editedSize);
          if (sizeAndShotOption) {
            const caffeinePerShot = sizeAndShotOption.baseCaffeine / sizeAndShotOption.defaultShots;
            return caffeinePerShot * editedShots;
          }
        }
        return coffeeItem.caffeineMg;
      case 'teaspoon':
        const tspOption = coffeeItem.teaspoonOptions?.find(opt => opt.teaspoons === editedTeaspoons);
        return tspOption?.caffeine || coffeeItem.caffeineMg;
      case 'fixed_size':
      default:
        return coffeeItem.caffeineMg;
    }
  };

  const editedCaffeine = useMemo(() => calculateCaffeine(), [editedSize, editedShots, editedTeaspoons, coffeeItem]);

  // Auto-update shots when size changes for both_size_shots drinks
  useEffect(() => {
    if (coffeeItem?.scalingType === 'both_size_shots' && coffeeItem.sizeAndShotOptions) {
      const selectedSizeOption = coffeeItem.sizeAndShotOptions.find(opt => opt.oz === editedSize);
      if (selectedSizeOption) {
        setEditedShots(selectedSizeOption.defaultShots);
      }
    }
  }, [editedSize, coffeeItem]);

  const handleSave = async () => {
    if (!log) return;
    setIsLoading(true);
    
    try {
      const updatedLog: CoffeeLogEntry = {
        ...log,
        servingSize: editedSize,
        shots: editedShots as 1 | 2 | 3,
        caffeineMg: editedCaffeine,
        consumedAt: editedConsumedAt,
      };

      const success = await updateLog(updatedLog);
      if (success) {
        toast.success('Log updated!', {
          description: `${log.coffeeName} entry has been updated`,
          duration: 3000,
        });
        await refreshStats();
        setIsEditing(false);
      } else {
        toast.error('Failed to update log');
      }
    } catch (error) {
      console.error('Failed to update log:', error);
      toast.error('Failed to update log');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
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
      default: return null;
    }
  };

  const getLocationIcon = (location?: string) => {
    switch (location) {
      case 'home': return '🏠';
      case 'work': return '💼';
      case 'cafe': return '☕';
      case 'restaurant': return '🍽️';
      case 'travel': return '✈️';
      case 'other': return '📍';
      default: return null;
    }
  };

  const getSizeName = (oz: number): string => {
    if (!coffeeItem?.sizeOptions) return `${oz}oz`;
    const option = coffeeItem.sizeOptions.find(opt => opt.oz === oz);
    return option ? `${option.size} (${oz}oz)` : `${oz}oz`;
  };

  if (!log) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95%] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 pr-10">
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? 'Edit Log' : 'Log Details'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Coffee Name & Caffeine Card */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Coffee className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{log.coffeeName}</h3>
                <p className="text-xs text-gray-500">
                  {isEditing ? 'Editing...' : formatTime(log.consumedAt)}
                </p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`text-base font-bold px-3 py-1 ${
                isEditing 
                  ? 'border-blue-300 text-blue-700 bg-blue-50' 
                  : 'border-amber-300 text-amber-700 bg-amber-50'
              }`}
            >
              {isEditing ? editedCaffeine : log.caffeineMg}mg
            </Badge>
          </div>

          {/* Edit action — clear button below the card when not editing */}
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="w-full justify-center gap-2 text-amber-700 border-amber-200 hover:bg-amber-50 hover:border-amber-300"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          )}

          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-4">
              {/* Serving Size */}
              {coffeeItem && (coffeeItem.scalingType === 'size_only' || coffeeItem.scalingType === 'both_size_shots') && coffeeItem.sizeOptions && (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Serving Size</Label>
                  <Select value={editedSize.toString()} onValueChange={(v) => setEditedSize(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {coffeeItem.sizeOptions.map((option) => (
                        <SelectItem key={option.oz} value={option.oz.toString()}>
                          {option.size} ({option.oz}oz) - {option.caffeine}mg
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Shots */}
              {coffeeItem && (coffeeItem.scalingType === 'shots_only' || coffeeItem.scalingType === 'both_size_shots') && coffeeItem.shotOptions && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-gray-600">Number of Shots</Label>
                    {coffeeItem.scalingType === 'both_size_shots' && (
                      <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                        Auto-updated
                      </span>
                    )}
                  </div>
                  <Select value={editedShots.toString()} onValueChange={(v) => setEditedShots(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {coffeeItem.shotOptions.filter(opt => opt.shots <= 4).map((option) => {
                        let shotCaffeine = option.caffeine;
                        if (coffeeItem.scalingType === 'both_size_shots' && coffeeItem.sizeAndShotOptions) {
                          const sizeOpt = coffeeItem.sizeAndShotOptions.find(s => s.oz === editedSize);
                          if (sizeOpt) {
                            const caffeinePerShot = sizeOpt.baseCaffeine / sizeOpt.defaultShots;
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
                </div>
              )}

              {/* Teaspoons */}
              {coffeeItem && coffeeItem.scalingType === 'teaspoon' && coffeeItem.teaspoonOptions && (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Teaspoons</Label>
                  <Select value={editedTeaspoons.toString()} onValueChange={(v) => setEditedTeaspoons(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {coffeeItem.teaspoonOptions.filter(opt => opt.teaspoons > 0).map((option) => (
                        <SelectItem key={option.teaspoons} value={option.teaspoons.toString()}>
                          {option.teaspoons} tsp ({option.caffeine}mg)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Time */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">When did you have it?</Label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={new Date(editedConsumedAt).toLocaleTimeString('en-US', {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(editedConsumedAt);
                      newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                      setEditedConsumedAt(newDate.getTime());
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <input
                    type="date"
                    value={(() => {
                      const d = new Date(editedConsumedAt);
                      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    })()}
                    onChange={(e) => {
                      const [year, month, day] = e.target.value.split('-').map(Number);
                      const currentTime = new Date(editedConsumedAt);
                      const selectedDate = new Date(year, month - 1, day, currentTime.getHours(), currentTime.getMinutes(), 0, 0);
                      setEditedConsumedAt(selectedDate.getTime());
                    }}
                    max={(() => {
                      const d = new Date();
                      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    })()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset to original values
                    setEditedSize(log.servingSize);
                    setEditedShots(log.shots);
                    setEditedConsumedAt(log.consumedAt);
                  }}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-4">
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Serving</p>
                  <p className="font-medium text-gray-900">{getSizeName(log.servingSize)}</p>
                </div>
                {log.shots > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Shots</p>
                    <p className="font-medium text-gray-900">{log.shots} shot{log.shots > 1 ? 's' : ''}</p>
                  </div>
                )}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <Clock className="w-3 h-3" />
                    <span>Time</span>
                  </div>
                  <p className="font-medium text-gray-900">
                    {new Date(log.consumedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {log.location && log.location !== 'none' && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <MapPin className="w-3 h-3" />
                      <span>Location</span>
                    </div>
                    <p className="font-medium text-gray-900 capitalize">
                      {getLocationIcon(log.location)} {log.location}
                    </p>
                  </div>
                )}
              </div>

              {/* Mood */}
              {log.mood && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">How it felt</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {getMoodIcon(log.mood)} {log.mood}
                  </p>
                </div>
              )}

              {/* Notes */}
              {log.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{log.notes}</p>
                </div>
              )}

              {/* View Drink Info Link */}
              {coffeeItem && onViewDrinkInfo && (
                <button
                  onClick={() => onViewDrinkInfo(coffeeItem)}
                  className="w-full text-center text-sm text-amber-600 hover:text-amber-700 hover:underline py-2"
                >
                  View drink info →
                </button>
              )}

            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogDetailDialog;
