import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { updatePreference } from "@/lib/preferences";
import { Clock } from "lucide-react";

type BedtimeControlProps = {
  value: string; // HH:mm (24h)
  onChange: (val: string) => void;
  label?: string;
  autoSave?: boolean; // Whether to automatically save to preferences
  className?: string;
};

const BedtimeControl = ({ 
  value, 
  onChange, 
  label = "Bedtime", 
  autoSave = true,
  className 
}: BedtimeControlProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleChange = (newValue: string) => {
    onChange(newValue);
    
    // Auto-save to preferences if enabled
    if (autoSave) {
      updatePreference('bedtime', newValue);
    }
  };

  // Parse current time
  const [currentHour, currentMinute] = value.split(':').map(Number);
  
  // Generate hours (1-12 for display)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Fixed minutes: 00, 15, 30, 45
  const minutes = [0, 15, 30, 45];
  
  // Convert 24h to 12h format for display
  const displayHour = currentHour === 0 ? 12 : currentHour > 12 ? currentHour - 12 : currentHour;
  const period = currentHour >= 12 ? 'PM' : 'AM';
  
  const handleTimeSelect = (hour: number, minute: number, newPeriod: 'AM' | 'PM') => {
    // Convert back to 24h format
    let hour24 = hour;
    if (newPeriod === 'PM' && hour !== 12) {
      hour24 = hour + 12;
    } else if (newPeriod === 'AM' && hour === 12) {
      hour24 = 0;
    }
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    handleChange(timeString);
    setIsOpen(false);
  };

  const formatDisplayTime = () => {
    const displayMinute = currentMinute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  return (
    <div className="space-y-1 sm:space-y-2">
      <label className="block text-xs sm:text-sm font-medium text-foreground">{label}</label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full h-10 sm:h-11 justify-between text-left font-normal ${className || ''}`}
          >
            <span>{formatDisplayTime()}</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-600">🌙</span>
              <Clock className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            <div className="text-center text-sm font-medium text-foreground">Select Time</div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Hours */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground text-center">Hour</div>
                <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                  {hours.map((hour) => (
                    <Button
                      key={hour}
                      variant={hour === displayHour ? "default" : "ghost"}
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleTimeSelect(hour, currentMinute, period)}
                    >
                      {hour}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Minutes */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground text-center">Min</div>
                <div className="space-y-1">
                  {minutes.map((minute) => (
                    <Button
                      key={minute}
                      variant={minute === currentMinute ? "default" : "ghost"}
                      size="sm"
                      className="h-8 text-xs w-full"
                      onClick={() => handleTimeSelect(displayHour, minute, period)}
                    >
                      {minute.toString().padStart(2, '0')}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* AM/PM */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground text-center">Period</div>
                <div className="space-y-1">
                  {['AM', 'PM'].map((p) => (
                    <Button
                      key={p}
                      variant={p === period ? "default" : "ghost"}
                      size="sm"
                      className="h-8 text-xs w-full"
                      onClick={() => handleTimeSelect(displayHour, currentMinute, p as 'AM' | 'PM')}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default BedtimeControl;
