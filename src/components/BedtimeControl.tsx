import { InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { updatePreference } from "@/lib/preferences";

interface BedtimeControlProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "autoSave"> {
  value: string; // HH:mm (24h)
  onChange: (val: string) => void;
  label?: string;
  autoSave?: boolean; // Whether to automatically save to preferences
}

const BedtimeControl = ({ 
  value, 
  onChange, 
  label = "Bedtime", 
  autoSave = true,
  ...rest 
}: BedtimeControlProps) => {
  
  const handleChange = (newValue: string) => {
    onChange(newValue);
    
    // Auto-save to preferences if enabled
    if (autoSave) {
      updatePreference('bedtime', newValue);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <Input
          type="time"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20"
          {...rest}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="text-amber-600">🌙</span>
        </div>
      </div>
    </div>
  );
};

export default BedtimeControl;