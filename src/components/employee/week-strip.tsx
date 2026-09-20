import type { Shift } from "@/types";
import type { WeekDay } from "@/lib/week";

export function WeekStrip({ days, shifts }: { days: WeekDay[]; shifts: Shift[] }) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  return <div className="grid grid-cols-7 gap-2 overflow-x-auto pb-2">{days.map((day) => {
    const shift = shifts.find((item) => item.start.slice(0, 10) === day.date);
    const active = day.date === today;
    return <div key={day.date} className={`min-w-24 rounded-2xl border p-3 ${active ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-[var(--line)] bg-white"}`}><p className={`text-xs font-bold ${active ? "text-white/70" : "text-[var(--muted)]"}`}>{day.day}</p><p className="mt-1 text-xl font-bold">{day.label}</p><p className={`mt-4 text-[.68rem] font-semibold ${active ? "text-white" : "text-[var(--brand)]"}`}>{shift ? shift.label : "Rest day"}</p></div>;
  })}</div>;
}
