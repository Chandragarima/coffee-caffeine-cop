export type TimeOfDay = "morning" | "afternoon" | "evening" | "late_night";

export const getTimeOfDay = (d: Date = new Date()): TimeOfDay => {
  const h = d.getHours();
  if (h >= 5 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "afternoon";
  if (h >= 17 && h < 22) return "evening";
  return "late_night";
};

export const defaultEnergyForTime: Record<TimeOfDay, "high" | "medium" | "low"> = {
  morning: "high",
  afternoon: "medium",
  evening: "low",
  late_night: "low",
};
