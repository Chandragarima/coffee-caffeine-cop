import { InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";

type BedtimeControlProps = {
  value: string; // HH:mm (24h)
  onChange: (val: string) => void;
  label?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">;

const BedtimeControl = ({ value, onChange, label = "Bedtime", ...rest }: BedtimeControlProps) => {
  return (
    <div>
      <label className="block text-sm mb-1 text-muted-foreground">{label}</label>
      <Input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </div>
  );
};

export default BedtimeControl;
