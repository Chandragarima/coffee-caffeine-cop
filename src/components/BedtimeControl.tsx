import { InputHTMLAttributes, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updatePreference } from "@/lib/preferences";

type BedtimeControlProps = {
  value: string; // HH:mm (24h)
  onChange: (val: string) => void;
  label?: string;
  autoSave?: boolean; // Whether to automatically save to preferences
  showSaveButton?: boolean; // Whether to show save button instead of auto-save
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "autoSave" | "showSaveButton">;

const BedtimeControl = ({ 
  value, 
  onChange, 
  label = "Bedtime", 
  autoSave = true,
  showSaveButton = false,
  ...rest 
}: BedtimeControlProps) => {
  const [localValue, setLocalValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
    
    // Auto-save to preferences if enabled and not using save button
    if (autoSave && !showSaveButton) {
      updatePreference('bedtime', newValue);
    }
  };

  const handleSave = async () => {
    if (showSaveButton) {
      setIsSaving(true);
      setSaveStatus('saving');
      
      try {
        await updatePreference('bedtime', localValue);
        setSaveStatus('saved');
        
        // Clear saved status after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="space-y-1 sm:space-y-2">
      <label className="block text-xs sm:text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="time"
            value={showSaveButton ? localValue : value}
            onChange={(e) => handleChange(e.target.value)}
            className="bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 h-10 sm:h-11 text-sm"
            {...rest}
          />
          {/* <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
            <span className="text-amber-600 text-sm sm:text-base">🌙</span>
          </div> */}
        </div>
        
        {showSaveButton && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className={`h-10 sm:h-11 px-4 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm ${
              localValue === value 
                ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 text-blue-600 hover:text-blue-700' 
                : 'bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 text-blue-600 hover:text-blue-700'
            } ${isSaving ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {saveStatus === 'saving' ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : saveStatus === 'saved' ? (
              'Saved!'
            ) : saveStatus === 'error' ? (
              'Error'
            ) : (
              'Save'
            )}
          </Button>
        )}
      </div>
      
      {showSaveButton && (saveStatus === 'saved' || saveStatus === 'error') && (
        <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md">
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1 text-green-600 bg-green-50">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Bedtime updated!
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-1 text-red-600 bg-red-50">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Failed to save. Please try again.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BedtimeControl;
