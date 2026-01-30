import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { usePreferences } from '@/hooks/usePreferences';
import { formatTimeForDisplay, getCutoffTime } from '@/lib/preferences';
import { toast } from '@/components/ui/sonner';
import { Moon, Sun, Bell, Coffee, Zap, RotateCcw } from 'lucide-react';

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Time options for dropdowns
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = (i % 2) * 30;
  const value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const label = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  return { value, label };
});

// Caffeine limit presets
const CAFFEINE_LIMITS = [
  { value: 200, label: '200mg (Low)' },
  { value: 300, label: '300mg (Moderate)' },
  { value: 400, label: '400mg (FDA Recommended)' },
  { value: 500, label: '500mg (High)' },
  { value: 600, label: '600mg (Very High)' },
];

const SettingsSheet = ({ open, onOpenChange }: SettingsSheetProps) => {
  const {
    updatePreference,
    resetPreferences,
    bedtime,
    wakeTime,
    caffeineLimit,
    sensitivity,
    notifications,
    notificationMorning,
    notificationCutoff,
    quickLogMode,
  } = usePreferences();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    resetPreferences();
    setShowResetConfirm(false);
    toast.success('Settings reset to defaults');
  };

  const cutoffTime = getCutoffTime(bedtime);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="text-xl font-bold">Settings</SheetTitle>
          <SheetDescription>
            Customize your caffeine tracking experience
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8 pb-8">
          {/* ===== SLEEP SCHEDULE ===== */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
              <Moon className="w-4 h-4" />
              <span>Sleep Schedule</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Wake Time */}
              <div className="space-y-2">
                <Label htmlFor="wake-time" className="text-sm font-medium flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  Wake Time
                </Label>
                <Select
                  value={wakeTime}
                  onValueChange={(value) => updatePreference('wake_time', value)}
                >
                  <SelectTrigger id="wake-time" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {TIME_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bedtime */}
              <div className="space-y-2">
                <Label htmlFor="bedtime" className="text-sm font-medium flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  Bedtime
                </Label>
                <Select
                  value={bedtime}
                  onValueChange={(value) => updatePreference('bedtime', value)}
                >
                  <SelectTrigger id="bedtime" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {TIME_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cutoff time info */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Caffeine cutoff:</span> {formatTimeForDisplay(cutoffTime)}
                <span className="text-amber-600 ml-1">(8 hours before bed)</span>
              </p>
            </div>
          </section>

          {/* ===== CAFFEINE LIMITS ===== */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
              <Coffee className="w-4 h-4" />
              <span>Caffeine Limits</span>
            </div>

            {/* Daily Limit */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Daily Limit</Label>
                <span className="text-lg font-bold text-amber-600">{caffeineLimit}mg</span>
              </div>
              <Slider
                value={[caffeineLimit]}
                onValueChange={([value]) => updatePreference('caffeine_limit', value)}
                min={100}
                max={600}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>100mg</span>
                <span className="text-amber-600 font-medium">400mg FDA</span>
                <span>600mg</span>
              </div>
            </div>

            {/* Sensitivity */}
            <div className="space-y-2">
              <Label htmlFor="sensitivity" className="text-sm font-medium">
                Caffeine Sensitivity
              </Label>
              <Select
                value={sensitivity}
                onValueChange={(value: 'auto' | 'low' | 'moderate' | 'high') => 
                  updatePreference('sensitivity', value)
                }
              >
                <SelectTrigger id="sensitivity" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    <div className="flex flex-col">
                      <span>Auto-detect</span>
                      {/* <span className="text-xs text-gray-500">Learn from your sleep check-ins</span> */}
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex flex-col">
                      <span>Low - Weak effect on sleep</span>
                      {/* <span className="text-xs text-gray-500">Caffeine doesn't affect me much</span> */}
                    </div>
                  </SelectItem>
                  <SelectItem value="moderate">
                    <div className="flex flex-col">
                      <span>Moderate - Medium effect on sleep</span>
                      {/* <span className="text-xs text-gray-500">Average response to caffeine</span> */}
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex flex-col">
                      <span>High - Strong effect on sleep</span>
                      {/* <span className="text-xs text-gray-500">Caffeine affects me strongly</span> */}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* ===== NOTIFICATIONS ===== */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
              <Bell className="w-4 h-4" />
              <span>Reminders</span>
            </div>

            {/* Master toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="notifications" className="text-sm font-medium">
                  Enable Notifications
                </Label>
                <p className="text-xs text-gray-500">Master toggle for all reminders</p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={(checked) => updatePreference('notifications', checked)}
              />
            </div>

            {/* Individual toggles (disabled if master is off) */}
            <div className={`space-y-3 ${!notifications ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <Label htmlFor="notification-morning" className="text-sm font-medium flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500" />
                    Morning Check-in
                  </Label>
                  <p className="text-xs text-gray-500">Reminder around {formatTimeForDisplay(wakeTime)}</p>
                </div>
                <Switch
                  id="notification-morning"
                  checked={notificationMorning}
                  onCheckedChange={(checked) => updatePreference('notification_morning', checked)}
                  disabled={!notifications}
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <Label htmlFor="notification-cutoff" className="text-sm font-medium flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-500" />
                    Cutoff Warning
                  </Label>
                  <p className="text-xs text-gray-500">Alert before {formatTimeForDisplay(cutoffTime)}</p>
                </div>
                <Switch
                  id="notification-cutoff"
                  checked={notificationCutoff}
                  onCheckedChange={(checked) => updatePreference('notification_cutoff', checked)}
                  disabled={!notifications}
                />
              </div>
            </div>
          </section>

          {/* ===== LOGGING PREFERENCES ===== */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
              <Zap className="w-4 h-4" />
              <span>Logging</span>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <Label htmlFor="quick-log" className="text-sm font-medium">
                  Quick Log Mode
                </Label>
                <p className="text-xs text-gray-500">One-tap logging with defaults</p>
              </div>
              <Switch
                id="quick-log"
                checked={quickLogMode}
                onCheckedChange={(checked) => updatePreference('quick_log_mode', checked)}
              />
            </div>

            {/* Peak Energy toggle - Feature coming later
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <Label htmlFor="peak-energy" className="text-sm font-medium">
                  Show Peak Energy
                </Label>
                <p className="text-xs text-gray-500">Countdown to peak alertness after logging</p>
              </div>
              <Switch
                id="peak-energy"
                checked={showPeakEnergy}
                onCheckedChange={(checked) => updatePreference('show_peak_energy', checked)}
              />
            </div>
            */}
          </section>

          {/* ===== RESET ===== */}
          <section className="pt-4 border-t border-gray-200">
            {!showResetConfirm ? (
              <Button
                variant="ghost"
                className="w-full text-gray-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => setShowResetConfirm(true)}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-center text-gray-600">
                  Are you sure? This will reset all settings.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;
