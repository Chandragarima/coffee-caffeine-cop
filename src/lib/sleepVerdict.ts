export type VerdictCode = "green" | "yellow" | "red";

import { caffeineRemaining } from "@/lib/caffeine";

export type SleepVerdict = {
  code: VerdictCode;
  chip: string; // Emoji + label for quick glance
  headline: string; // Plain-English verdict
  detail: string; // Reasoning text
  suggestion: string; // Optional suggestion
  remainingMg: number; // Rounded remaining mg at bedtime
};

export const getSleepVerdict = (
  mg: number,
  hoursUntilBed: number,
  halfLife = 5
): SleepVerdict => {
  const remaining = caffeineRemaining(mg, hoursUntilBed, halfLife);

  if (remaining < 50) {
    return {
      code: "green",
      chip: "🟢 Sleep-Friendly",
      headline: "Clear to Sip",
      detail: `This cup’s ~${mg} mg will mellow out to ~${remaining} mg by bedtime — Mr. Brew approves. Sleep should be sweet!`,
      suggestion: "You could even go medium roast here and still be fine.",
      remainingMg: remaining,
    };
  }

  if (remaining <= 100) {
    return {
      code: "yellow",
      chip: "🟡 Might Keep You Up",
      headline: "Sip Smart",
      detail: `If you sip this now, you’ll still have about ${remaining} mg buzzing at bedtime — not a total no-go, but you might be tossing a bit.`,
      suggestion: "Want to play it safe? Try a smaller size or half-caff and be bedtime-ready.",
      remainingMg: remaining,
    };
  }

  return {
    code: "red",
    chip: "🔴 Wide Awake Tonight",
    headline: "Better Hold Off",
    detail: `This ${mg} mg drink will leave you with over ${remaining} mg by bedtime — hello, 2 AM TikTok scroll. Swap for decaf or tea to stay on Mr. Brew’s good side.`,
    suggestion: "You can still enjoy coffee now — just make it a small or a lighter roast.",
    remainingMg: remaining,
  };
};
