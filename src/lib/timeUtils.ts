// hoursUntil: compute hours from now until a given HH:mm bedtime (today or tomorrow)
export const hoursUntil = (timeStr: string, now: Date = new Date()): number => {
  const [hh, mm] = timeStr.split(":").map(Number);
  const bed = new Date(now);
  bed.setHours(hh ?? 23, mm ?? 0, 0, 0);
  if (bed.getTime() <= now.getTime()) {
    bed.setDate(bed.getDate() + 1);
  }
  const ms = bed.getTime() - now.getTime();
  return Math.max(0, ms / 36e5);
};

// Get current local time in HH:mm format
export const getCurrentTime = (): string => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Compute hours from current time to bedtime HH:mm within 24h window
export const hoursUntilBedtime = (bedHHMM: string): number => {
  const now = new Date();
  const [bh, bm] = bedHHMM.split(":").map(Number);
  const bed = new Date(now);
  bed.setHours(bh ?? 23, bm ?? 0, 0, 0);
  
  // If bedtime is earlier today, it means tomorrow
  if (bed.getTime() <= now.getTime()) {
    bed.setDate(bed.getDate() + 1);
  }
  
  const diffMs = bed.getTime() - now.getTime();
  return Math.max(0, diffMs / (1000 * 60 * 60)); // Convert to hours
};
