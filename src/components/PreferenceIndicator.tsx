import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface PreferenceIndicatorProps {
  isSaving?: boolean;
  lastSaved?: Date;
}

const PreferenceIndicator = ({ isSaving = false, lastSaved }: PreferenceIndicatorProps) => {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (lastSaved) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  if (!isSaving && !showSaved) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge 
        variant={isSaving ? "secondary" : "default"}
        className={`transition-all duration-300 ${
          isSaving 
            ? 'bg-amber-100 text-amber-800 border-amber-200' 
            : 'bg-green-100 text-green-800 border-green-200'
        }`}
      >
        {isSaving ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            Saving...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span>✓</span>
            Saved
          </div>
        )}
      </Badge>
    </div>
  );
};

export default PreferenceIndicator;
