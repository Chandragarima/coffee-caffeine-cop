import { useState, useEffect, useCallback } from 'react';
import { 
  UserPreferences, 
  loadPreferences, 
  savePreferences, 
  updatePreference,
  DEFAULT_PREFERENCES 
} from '@/lib/preferences';

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    const load = () => {
      const loaded = loadPreferences();
      setPreferences(loaded);
      setIsLoading(false);
    };

    load();

    // Listen for preference updates from other components
    const handlePreferencesUpdate = (event: CustomEvent) => {
      setPreferences(event.detail);
    };

    window.addEventListener('preferencesUpdated', handlePreferencesUpdate as EventListener);

    return () => {
      window.removeEventListener('preferencesUpdated', handlePreferencesUpdate as EventListener);
    };
  }, []);

  // Update a single preference
  const updatePref = useCallback(<K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ) => {
    const success = updatePreference(key, value);
    if (success) {
      setPreferences(prev => ({ ...prev, [key]: value }));
    }
    return success;
  }, []);

  // Update multiple preferences
  const updatePrefs = useCallback((newPrefs: Partial<UserPreferences>) => {
    const success = savePreferences(newPrefs);
    if (success) {
      setPreferences(prev => ({ ...prev, ...newPrefs }));
    }
    return success;
  }, []);

  // Reset to defaults
  const resetPrefs = useCallback(() => {
    const success = savePreferences(DEFAULT_PREFERENCES);
    if (success) {
      setPreferences(DEFAULT_PREFERENCES);
    }
    return success;
  }, []);

  return {
    preferences,
    isLoading,
    updatePreference: updatePref,
    updatePreferences: updatePrefs,
    resetPreferences: resetPrefs,
    
    // Convenience getters - Schedule
    bedtime: preferences.bedtime,
    wakeTime: preferences.wake_time,
    timezone: preferences.timezone,
    
    // Caffeine limits
    caffeineLimit: preferences.caffeine_limit,
    sensitivity: preferences.sensitivity,
    
    // Notifications
    notifications: preferences.notifications,
    notificationMorning: preferences.notification_morning,
    notificationCutoff: preferences.notification_cutoff,
    
    // Logging preferences
    servingSize: preferences.serving_size,
    shots: preferences.shots,
    shotsManuallySet: preferences.shots_manually_set,
    quickLogMode: preferences.quick_log_mode,
    favoriteCoffees: preferences.favorite_coffees,
    
    // Peak energy
    showPeakEnergy: preferences.show_peak_energy
  };
};
