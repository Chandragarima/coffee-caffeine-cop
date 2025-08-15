import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Storage keys for persistence
const STORAGE_KEYS = {
  DISMISSED: 'coffeepolice_install_dismissed',
  DISMISSED_DATE: 'coffeepolice_install_dismissed_date',
  SHOWN_COUNT: 'coffeepolice_install_shown_count',
  LAST_SHOWN: 'coffeepolice_install_last_shown'
};

// Configuration
const CONFIG = {
  MIN_SESSION_TIME: 30, // seconds - minimum time on site before showing
  DISMISS_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  MAX_SHOWS_PER_SESSION: 2, // maximum times to show per session
  MIN_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours between shows
};

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());

  // Helper functions for localStorage
  const getStorageItem = (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const setStorageItem = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore localStorage errors
    }
  };

  const shouldShowPrompt = (): boolean => {
    // Check if already installed
    if (isInstalled) return false;

    // Check if recently dismissed
    const dismissedDate = getStorageItem(STORAGE_KEYS.DISMISSED_DATE);
    if (dismissedDate) {
      const timeSinceDismissed = Date.now() - parseInt(dismissedDate);
      if (timeSinceDismissed < CONFIG.DISMISS_DURATION) {
        return false;
      }
    }

    // Check session time
    const timeOnSite = (Date.now() - sessionStartTime) / 1000;
    if (timeOnSite < CONFIG.MIN_SESSION_TIME) {
      return false;
    }

    // Check show count for this session
    const shownCount = parseInt(getStorageItem(STORAGE_KEYS.SHOWN_COUNT) || '0');
    if (shownCount >= CONFIG.MAX_SHOWS_PER_SESSION) {
      return false;
    }

    // Check minimum interval between shows
    const lastShown = getStorageItem(STORAGE_KEYS.LAST_SHOWN);
    if (lastShown) {
      const timeSinceLastShown = Date.now() - parseInt(lastShown);
      if (timeSinceLastShown < CONFIG.MIN_INTERVAL) {
        return false;
      }
    }

    return true;
  };

  const markAsShown = () => {
    const currentCount = parseInt(getStorageItem(STORAGE_KEYS.SHOWN_COUNT) || '0');
    setStorageItem(STORAGE_KEYS.SHOWN_COUNT, (currentCount + 1).toString());
    setStorageItem(STORAGE_KEYS.LAST_SHOWN, Date.now().toString());
  };

  const markAsDismissed = () => {
    setStorageItem(STORAGE_KEYS.DISMISSED, 'true');
    setStorageItem(STORAGE_KEYS.DISMISSED_DATE, Date.now().toString());
    setStorageItem(STORAGE_KEYS.SHOWN_COUNT, '0'); // Reset count for next time
  };

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // Check if user is on iOS
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIOSDevice);
      return isIOSDevice;
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Only show if conditions are met
      if (shouldShowPrompt()) {
        setVisible(true);
        markAsShown();
      }
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setVisible(false);
      setDeferredPrompt(null);
      // Clear dismissal data since they installed
      setStorageItem(STORAGE_KEYS.DISMISSED, '');
      setStorageItem(STORAGE_KEYS.DISMISSED_DATE, '');
    };

    // Check initial state
    if (!checkIfInstalled()) {
      checkIOS();
      
      // Add event listeners
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      // Show iOS instructions if on iOS and conditions are met
      if (checkIOS() && shouldShowPrompt()) {
        setVisible(true);
        markAsShown();
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, [sessionStartTime]); // Add sessionStartTime as dependency

  // Check if we should show the prompt after minimum session time
  useEffect(() => {
    const timer = setTimeout(() => {
      if (shouldShowPrompt() && !visible && !isInstalled) {
        setVisible(true);
        markAsShown();
      }
    }, CONFIG.MIN_SESSION_TIME * 1000);

    return () => clearTimeout(timer);
  }, [sessionStartTime, visible, isInstalled]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setDeferredPrompt(null);
    markAsDismissed();
  };

  // Don't show if already installed or no prompt to show
  if (isInstalled || !visible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <Card className="bg-white/95 backdrop-blur-sm border-amber-200 shadow-xl max-w-sm mx-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">📱</span>
            </div>
            <div>
              <CardTitle className="text-lg">Install CoffeePolice</CardTitle>
              <p className="text-sm text-gray-600">Get quick access to coffee recommendations</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {isIOS ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-2">Install on your iPhone/iPad:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Tap the <span className="font-mono">Share</span> button <span className="text-lg">⎋</span></li>
                  <li>Scroll down and tap <span className="font-mono">Add to Home Screen</span></li>
                  <li>Tap <span className="font-mono">Add</span> to confirm</li>
                </ol>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDismiss}
                  className="flex-1"
                >
                  Maybe Later
                </Button>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Free to install
                </Badge>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-700">
                <p>Install CoffeePolice on your device for:</p>
                <ul className="list-disc list-inside space-y-1 text-xs mt-2">
                  <li>Quick access from home screen</li>
                  <li>Offline coffee recommendations</li>
                  <li>Push notifications for perfect timing</li>
                  <li>Native app-like experience</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleInstallClick}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  Install App
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDismiss}
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
