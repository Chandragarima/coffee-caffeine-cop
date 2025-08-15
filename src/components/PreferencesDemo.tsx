import { usePreferences } from '@/hooks/usePreferences';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BedtimeControl from './BedtimeControl';
import ServingControl from './ServingControl';

const PreferencesDemo = () => {
  const { 
    preferences, 
    isLoading, 
    updatePreference, 
    resetPreferences,
    bedtime,
    servingSize,
    shots
  } = usePreferences();

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2">Loading preferences...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">Preferences Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Current Preferences</h3>
          <div className="text-sm space-y-1">
            <p><strong>Bedtime:</strong> {bedtime}</p>
            <p><strong>Serving Size:</strong> {servingSize} oz</p>
            <p><strong>Shots:</strong> {shots}</p>
            <p><strong>Theme:</strong> {preferences.theme}</p>
            <p><strong>Notifications:</strong> {preferences.notifications ? 'On' : 'Off'}</p>
            <p><strong>Caffeine Limit:</strong> {preferences.caffeine_limit}mg</p>
          </div>
        </div>

        <div className="space-y-4">
          <BedtimeControl 
            value={bedtime} 
            onChange={(value) => updatePreference('bedtime', value)}
            label="Bedtime"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Serving Size</label>
            <ServingControl 
              sizeOz={servingSize as any}
              onSizeChange={(value) => updatePreference('serving_size', value)}
              shots={shots}
              onShotsChange={(value) => updatePreference('shots', value)}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updatePreference('theme', preferences.theme === 'light' ? 'dark' : 'light')}
            >
              Toggle Theme
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updatePreference('notifications', !preferences.notifications)}
            >
              Toggle Notifications
            </Button>
          </div>

          <Button 
            variant="destructive" 
            size="sm"
            onClick={resetPreferences}
            className="w-full"
          >
            Reset to Defaults
          </Button>
        </div>

        <div className="text-xs text-gray-500">
          <p>💡 Preferences are automatically saved to localStorage</p>
          <p>🔄 Try refreshing the page to see persistence</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferencesDemo;
