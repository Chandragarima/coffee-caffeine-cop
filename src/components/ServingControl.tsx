import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SizeOz } from "@/lib/serving";
import { updatePreference } from "@/lib/preferences";

interface ServingControlProps {
  sizeOz: SizeOz;
  onSizeChange: (s: SizeOz) => void;
  shots: 1 | 2 | 3;
  onShotsChange: (n: 1 | 2 | 3) => void;
  autoSave?: boolean; // Whether to automatically save to preferences
}

const ServingControl = ({ 
  sizeOz, 
  onSizeChange, 
  shots, 
  onShotsChange, 
  autoSave = true 
}: ServingControlProps) => {
  
  const handleSizeChange = (newSize: SizeOz) => {
    onSizeChange(newSize);
    
    // Auto-save to preferences if enabled
    if (autoSave) {
      updatePreference('serving_size', newSize);
    }
  };

  const handleShotsChange = (newShots: 1 | 2 | 3) => {
    onShotsChange(newShots);
    
    // Auto-save to preferences if enabled
    if (autoSave) {
      updatePreference('shots', newShots);
      // Mark shots as manually set when user changes them
      updatePreference('shots_manually_set', true);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
      <div className="space-y-1 sm:space-y-2">
        <label className="block text-xs sm:text-sm font-medium text-gray-700">Serving Size</label>
        <Select value={String(sizeOz)} onValueChange={(v) => handleSizeChange(Number(v) as SizeOz)}>
          <SelectTrigger className="w-full bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 h-10 sm:h-11 text-sm">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="8">Small (8 oz)</SelectItem>
            <SelectItem value="12">Regular (12 oz)</SelectItem>
            <SelectItem value="16">Large (16 oz)</SelectItem>
            <SelectItem value="20">Extra Large (20 oz)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1 sm:space-y-2">
        <label className="block text-xs sm:text-sm font-medium text-gray-700">Shots</label>
        <Select value={String(shots)} onValueChange={(v) => handleShotsChange(Number(v) as 1 | 2 | 3)}>
          <SelectTrigger className="w-full bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 h-10 sm:h-11 text-sm">
            <SelectValue placeholder="Shots" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">⚡ Single</SelectItem>
            <SelectItem value="2">⚡⚡ Double</SelectItem>
            <SelectItem value="3">⚡⚡⚡ Triple</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 font-medium hidden sm:block">Shots apply to espresso drinks</p>
      </div>
    </div>
  );
};

export default ServingControl;
