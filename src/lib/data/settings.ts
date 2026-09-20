import "server-only";
import { hasNeonDatabase } from "@/lib/neon/config";
import { getSql } from "@/lib/neon/db";

export type ShiftTemplate = { id: string; name: string; start: string; end: string; breakMinutes: number };
export type SchedulingSettings = { finalizationWeekday: number; minimumDailyCrew: number; templates: ShiftTemplate[] };

const defaults: SchedulingSettings = { finalizationWeekday: 5, minimumDailyCrew: 4, templates: [
  { id: "early", name: "Early", start: "04:00", end: "13:00", breakMinutes: 60 }, { id: "early-2", name: "Early 2", start: "05:00", end: "14:00", breakMinutes: 60 },
  { id: "day", name: "Day", start: "08:00", end: "16:00", breakMinutes: 60 }, { id: "day-2", name: "Day 2", start: "09:00", end: "18:00", breakMinutes: 60 },
  { id: "swing", name: "Swing", start: "11:00", end: "20:00", breakMinutes: 60 }, { id: "late", name: "Late", start: "14:00", end: "22:00", breakMinutes: 60 },
  { id: "closing", name: "Closing", start: "16:00", end: "01:00", breakMinutes: 60 },
] };

export async function getSchedulingSettings(): Promise<SchedulingSettings> {
  if (!hasNeonDatabase()) return defaults;
  const sql = getSql();
  const [settings, templates] = await Promise.all([
    sql`select finalization_weekday,minimum_daily_crew from scheduling_settings where id=true`,
    sql`select id,name,starts_at::text,ends_at::text,break_minutes from shift_templates order by starts_at,name`,
  ]);
  return { finalizationWeekday: Number(settings[0]?.finalization_weekday ?? 5), minimumDailyCrew: Number(settings[0]?.minimum_daily_crew ?? 4), templates: templates.map((row) => ({ id: String(row.id), name: String(row.name), start: String(row.starts_at).slice(0,5), end: String(row.ends_at).slice(0,5), breakMinutes: Number(row.break_minutes) })) };
}
