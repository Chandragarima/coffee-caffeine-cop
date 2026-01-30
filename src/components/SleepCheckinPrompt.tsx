import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCaffeineProfile } from '@/hooks/useCaffeineProfile';
import { toast } from '@/components/ui/sonner';
import { SleepCheckin } from '@/lib/sleepCheckin';

const QUALITY_OPTIONS: { value: SleepCheckin['quality']; label: string; color: string; bg: string }[] = [
  { value: 'poor', label: 'Poor', color: 'text-red-700', bg: 'bg-red-50 border-red-200 hover:bg-red-100' },
  { value: 'ok', label: 'OK', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200 hover:bg-amber-100' },
  { value: 'great', label: 'Great', color: 'text-green-700', bg: 'bg-green-50 border-green-200 hover:bg-green-100' },
];

const SleepCheckinPrompt = () => {
  const { showPrompt, submitCheckin, dismissPrompt, getYesterdayStats, checkins } = useCaffeineProfile();
  const { totalMg } = getYesterdayStats();

  const handleSelect = (quality: SleepCheckin['quality']) => {
    submitCheckin(quality);

    // Build insight message
    const qualityLabel = quality === 'great' ? 'great' : quality === 'ok' ? 'OK' : 'poor';
    let insight = `You had ${totalMg}mg yesterday and slept ${qualityLabel}.`;

    // If we have enough data, add a comparison
    if (checkins.length >= 3) {
      const greatDays = checkins.filter((c) => c.quality === 'great');
      const avgGreat = greatDays.length > 0
        ? Math.round(greatDays.reduce((s, c) => s + c.yesterdayCaffeineMg, 0) / greatDays.length)
        : null;
      if (avgGreat !== null) {
        insight += ` Your best sleep happens around ${avgGreat}mg.`;
      }
    }

    toast.info(insight, { duration: 5000 });
  };

  return (
    <Dialog open={showPrompt} onOpenChange={(open) => !open && dismissPrompt()}>
      <DialogContent className="w-[90%] max-w-sm !p-5">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">How'd you sleep?</DialogTitle>
        </DialogHeader>
        <p className="text-center text-sm text-gray-500 -mt-1">
          You had {totalMg}mg caffeine yesterday
        </p>
        <div className="flex gap-3 mt-3">
          {QUALITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`flex-1 py-4 rounded-xl border-2 text-center font-semibold transition-all ${opt.bg} ${opt.color}`}
            >
              <div className="text-2xl mb-1">
                {opt.value === 'poor' ? '😴' : opt.value === 'ok' ? '😐' : '😊'}
              </div>
              <div className="text-sm">{opt.label}</div>
            </button>
          ))}
        </div>
        <button
          onClick={dismissPrompt}
          className="text-xs text-gray-400 text-center mt-1 hover:text-gray-600"
        >
          Skip
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default SleepCheckinPrompt;
