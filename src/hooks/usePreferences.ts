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
    // Convenience getters
    bedtime: preferences.bedtime,
    servingSize: preferences.serving_size,
    shots: preferences.shots,
    shotsManuallySet: preferences.shots_manually_set,
    notifications: preferences.notifications,
    caffeineLimit: preferences.caffeine_limit,
    timezone: preferences.timezone,
    favoriteCoffees: preferences.favorite_coffees ?? [],
    wakeTime: preferences.wake_time ?? '07:00',
    sensitivity: preferences.sensitivity ?? 'auto',
    notificationMorning: preferences.notification_morning ?? false,
    notificationCutoff: preferences.notification_cutoff ?? false,
    quickLogMode: preferences.quick_log_mode ?? false
  };
};
