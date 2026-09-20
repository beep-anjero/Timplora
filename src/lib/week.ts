export type WeekDay = { day: string; longDay: string; date: string; label: string };

function isoDate(date: Date) { return date.toISOString().slice(0, 10); }

export function mondayOf(date = new Date()) {
  const manila = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  manila.setHours(12, 0, 0, 0);
  const offset = (manila.getDay() + 6) % 7;
  manila.setDate(manila.getDate() - offset);
  return isoDate(manila);
}

export function addDays(date: string, amount: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + amount);
  return isoDate(value);
}

export function weekDays(weekStart: string): WeekDay[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const value = new Date(`${date}T12:00:00Z`);
    return { day: value.toLocaleDateString("en", { weekday: "short", timeZone: "UTC" }), longDay: value.toLocaleDateString("en", { weekday: "long", timeZone: "UTC" }), date, label: String(value.getUTCDate()) };
  });
}

export function weekRangeLabel(weekStart: string) {
  const start = new Date(`${weekStart}T12:00:00Z`);
  const end = new Date(`${addDays(weekStart, 6)}T12:00:00Z`);
  const startLabel = start.toLocaleDateString("en", { month: "long", day: "numeric", timeZone: "UTC" });
  const endLabel = end.toLocaleDateString("en", { month: start.getUTCMonth() === end.getUTCMonth() ? undefined : "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  return `${startLabel} – ${endLabel}`;
}

export function upcomingMonday(date = new Date()) { return addDays(mondayOf(date), 7); }
