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
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-sm mb-1 text-muted-foreground">Serving size</label>
        <Select value={String(sizeOz)} onValueChange={(v) => onSizeChange(Number(v) as SizeOz)}>
          <SelectTrigger className="w-full">
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
      <div>
        <label className="block text-sm mb-1 text-muted-foreground">Shots</label>
        <Select value={String(shots)} onValueChange={(v) => onShotsChange(Number(v) as 1 | 2)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Shots" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Single</SelectItem>
            <SelectItem value="2">Double</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">Shots apply to espresso drinks</p>
      </div>
    </div>
  );
};

export default ServingControl;
