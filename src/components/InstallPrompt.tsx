import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 inset-x-0 px-4 z-50">
      <div className="mx-auto max-w-md rounded-lg border bg-card text-card-foreground shadow-lg p-3 flex items-center gap-3 animate-enter">
        <div className="flex-1">
          <div className="font-medium">Install CoffeePolice</div>
          <div className="text-sm text-muted-foreground">Add to home screen for a faster, app-like experience.</div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setVisible(false);
            }}
          >
            Not now
          </Button>
          <Button
            onClick={async () => {
              if (!deferredPrompt) return;
              deferredPrompt.prompt();
              const { outcome } = await deferredPrompt.userChoice;
              if (outcome) setVisible(false);
              setDeferredPrompt(null);
            }}
          >
            Install
          </Button>
        </div>
      </div>
    </div>
  );
}
