import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SizeOz } from "@/lib/serving";

interface ServingControlProps {
  sizeOz: SizeOz;
  onSizeChange: (s: SizeOz) => void;
  shots: 1 | 2;
  onShotsChange: (n: 1 | 2) => void;
}

const ServingControl = ({ sizeOz, onSizeChange, shots, onShotsChange }: ServingControlProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Cup size</label>
        <Select value={String(sizeOz)} onValueChange={(v) => onSizeChange(Number(v) as SizeOz)}>
          <SelectTrigger className="w-full bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20">
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
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Shots</label>
        <Select value={String(shots)} onValueChange={(v) => onShotsChange(Number(v) as 1 | 2)}>
          <SelectTrigger className="w-full bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20">
            <SelectValue placeholder="Shots" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">⚡ Single</SelectItem>
            <SelectItem value="2">⚡⚡ Double</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 font-medium">Shots apply to espresso drinks</p>
      </div>
    </div>
  );
};

export default ServingControl;
