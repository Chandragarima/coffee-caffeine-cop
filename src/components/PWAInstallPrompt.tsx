import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

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
      setShowInstallPrompt(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // Check initial state
    if (!checkIfInstalled()) {
      checkIOS();
      
      // Add event listeners
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      // Show iOS instructions if on iOS
      if (checkIOS()) {
        setShowInstallPrompt(true);
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

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
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  // Don't show if already installed or no prompt to show
  if (isInstalled || (!showInstallPrompt && !isIOS)) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 bg-white/95 backdrop-blur-sm border-amber-200 shadow-xl max-w-sm mx-auto">
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
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
