import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addCoffeeLog } from '@/lib/coffeeLog';
import { toast } from 'sonner';

type Category = 'espresso' | 'brewed' | 'instant' | 'tea' | 'energy' | 'soda';
type Size = 'small' | 'medium' | 'large';

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'espresso', label: 'Espresso', emoji: '☕' },
  { id: 'brewed', label: 'Brewed Coffee', emoji: '🫗' },
  { id: 'instant', label: 'Instant', emoji: '☕️' },
  { id: 'tea', label: 'Tea', emoji: '🍵' },
  { id: 'energy', label: 'Energy Drink', emoji: '⚡' },
  { id: 'soda', label: 'Soda', emoji: '🥤' },
];

const SIZES: { id: Size; label: string; oz: number }[] = [
  { id: 'small', label: 'Small', oz: 8 },
  { id: 'medium', label: 'Medium', oz: 12 },
  { id: 'large', label: 'Large', oz: 16 },
];

const CAFFEINE_TABLE: Record<Category, Record<Size, number>> = {
  espresso: { small: 75, medium: 150, large: 225 },
  brewed:   { small: 95, medium: 150, large: 200 },
  instant:  { small: 65, medium: 95, large: 130 },
  tea:      { small: 25, medium: 40, large: 55 },
  energy:   { small: 80, medium: 160, large: 300 },
  soda:     { small: 30, medium: 40, large: 55 },
};

interface CustomDrinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogSuccess?: () => void;
}

const CustomDrinkDialog = ({ open, onOpenChange, onLogSuccess }: CustomDrinkDialogProps) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('brewed');
  const [size, setSize] = useState<Size>('medium');
  const [caffeineMg, setCaffeineMg] = useState(150);
  const [manualOverride, setManualOverride] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  // Update caffeine estimate when category/size changes (unless manually overridden)
  useEffect(() => {
    if (!manualOverride) {
      setCaffeineMg(CAFFEINE_TABLE[category][size]);
    }
  }, [category, size, manualOverride]);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setName('');
      setCategory('brewed');
      setSize('medium');
      setCaffeineMg(150);
      setManualOverride(false);
    }
  }, [open]);

  const handleCaffeineChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0 && num <= 1000) {
      setCaffeineMg(num);
      setManualOverride(true);
    } else if (value === '') {
      setCaffeineMg(0);
      setManualOverride(true);
    }
  };

  const handleResetEstimate = () => {
    setManualOverride(false);
    setCaffeineMg(CAFFEINE_TABLE[category][size]);
  };

  const handleLog = async () => {
    if (!name.trim() || caffeineMg <= 0) return;
    setIsLogging(true);

    try {
      const sizeObj = SIZES.find(s => s.id === size)!;
      const now = Date.now();

      await addCoffeeLog({
        coffeeId: `custom_${now}`,
        coffeeName: name.trim(),
        caffeineMg,
        servingSize: sizeObj.oz,
        shots: 1,
        timestamp: now,
        consumedAt: now,
      });

      window.dispatchEvent(new CustomEvent('coffeeLogged'));
      toast.success(`+${caffeineMg}mg logged`, {
        description: name.trim(),
      });

      onOpenChange(false);
      onLogSuccess?.();
    } catch {
      toast.error('Failed to log drink');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] max-w-md !p-5">
        <DialogHeader>
          <DialogTitle className="text-lg">Log Custom Drink</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Drink Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Drink name</label>
            <Input
              placeholder="e.g. Local cafe latte"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10"
              autoFocus
            />
          </div>

          {/* Category - "Similar to" */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Similar to</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setCategory(cat.id); setManualOverride(false); }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    category === cat.id
                      ? 'bg-amber-100 border-amber-300 text-amber-800'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Size</label>
            <div className="flex gap-2">
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSize(s.id); setManualOverride(false); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                    size === s.id
                      ? 'bg-amber-100 border-amber-300 text-amber-800'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {s.label}
                  <span className="block text-xs opacity-60">{s.oz}oz</span>
                </button>
              ))}
            </div>
          </div>

          {/* Estimated Caffeine */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">
                {manualOverride ? 'Caffeine (custom)' : 'Estimated caffeine'}
              </label>
              {manualOverride && (
                <button
                  onClick={handleResetEstimate}
                  className="text-xs text-amber-600 hover:text-amber-700"
                >
                  Reset estimate
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={1000}
                value={caffeineMg}
                onChange={(e) => handleCaffeineChange(e.target.value)}
                className="h-10 w-24 text-center font-semibold"
              />
              <span className="text-sm text-gray-500">mg</span>
              {!manualOverride && (
                <span className="text-xs text-gray-400 ml-auto">Tap to override</span>
              )}
            </div>
          </div>

          {/* Log Button */}
          <Button
            onClick={handleLog}
            disabled={!name.trim() || caffeineMg <= 0 || isLogging}
            className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
          >
            {isLogging ? 'Logging...' : `Log ${caffeineMg}mg`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomDrinkDialog;
