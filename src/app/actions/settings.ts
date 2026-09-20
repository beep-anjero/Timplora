"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { hasNeonDatabase } from "@/lib/neon/config";
import { getSql } from "@/lib/neon/db";

type TemplateInput = { name: string; start: string; end: string; breakMinutes: number };
export async function saveSchedulingSettings(formData: FormData) {
  if (!hasNeonDatabase()) return { ok: true, demo: true };
  await requireRole("manager");
  const minimumDailyCrew = Number(formData.get("minimumDailyCrew"));
  const finalizationWeekday = Number(formData.get("finalizationWeekday"));
  let templates: TemplateInput[] = [];
  try { templates = JSON.parse(String(formData.get("templates"))) as TemplateInput[]; } catch { return { ok: false, error: "Shift templates are invalid." }; }
  if (!Number.isInteger(minimumDailyCrew) || minimumDailyCrew < 1 || minimumDailyCrew > 50) return { ok: false, error: "Minimum daily crew must be between 1 and 50." };
  if (!templates.length || templates.some((item) => !item.name.trim() || !/^\d{2}:\d{2}$/.test(item.start) || !/^\d{2}:\d{2}$/.test(item.end) || item.start === item.end)) return { ok: false, error: "Each template needs a name and valid start and end times." };
  const sql = getSql();
  await sql`insert into scheduling_settings(id,week_starts,finalization_weekday,minimum_daily_crew) values(true,1,${finalizationWeekday},${minimumDailyCrew}) on conflict(id) do update set finalization_weekday=excluded.finalization_weekday,minimum_daily_crew=excluded.minimum_daily_crew,updated_at=now()`;
  await sql`delete from shift_templates`;
  for (const item of templates) await sql`insert into shift_templates(name,starts_at,ends_at,break_minutes) values(${item.name.trim()},${item.start}::time,${item.end}::time,${Math.max(0, item.breakMinutes)})`;
  revalidatePath("/manager/settings"); revalidatePath("/manager/schedule");
  return { ok: true, demo: false };
}
