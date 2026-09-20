"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { validateSchedule, type ScheduleEntry } from "@/lib/scheduling/validation";

function toShift(scheduleId: string, entry: ScheduleEntry) {
  const [startTime, endTime] = entry.value.split("–");
  const start = new Date(`${entry.date}T${startTime}:00+08:00`);
  const end = new Date(`${entry.date}T${endTime}:00+08:00`);
  if (end <= start) end.setDate(end.getDate() + 1);
  return { schedule_id: scheduleId, employee_id: entry.employeeId, starts_at: start.toISOString(), ends_at: end.toISOString(), label: startTime < "12:00" ? "Opening" : startTime < "16:00" ? "Mid" : "Closing", break_minutes: 60 };
}

async function writeDraft(weekStart: string, entries: ScheduleEntry[]) {
  const db = await createClient();
  const { data: schedule, error } = await db.from("schedules").upsert({ week_start: weekStart }, { onConflict: "week_start" }).select("id,status,revision").single();
  if (error) throw error;
  const { error: deleteError } = await db.from("shifts").delete().eq("schedule_id", schedule.id);
  if (deleteError) throw deleteError;
  const working = entries.filter((entry) => entry.value !== "Rest");
  if (working.length) {
    const { error: insertError } = await db.from("shifts").insert(working.map((entry) => toShift(schedule.id, entry)));
    if (insertError) throw insertError;
  }
  return { db, schedule };
}

async function conflictsFor(entries: ScheduleEntry[]) {
  const db = await createClient();
  const employeeIds = [...new Set(entries.map((entry) => entry.employeeId))];
  const dates = [...new Set(entries.map((entry) => entry.date))];
  const [{ data: classes, error: classError }, { data: restDays, error: restError }] = await Promise.all([
    db.from("class_meetings").select("employee_id,weekday,starts_at,ends_at,subject").in("employee_id", employeeIds),
    db.from("rest_day_requests").select("employee_id,requested_date").eq("status", "approved").in("employee_id", employeeIds).in("requested_date", dates),
  ]);
  if (classError) throw classError;
  if (restError) throw restError;
  return validateSchedule(
    entries,
    (classes ?? []).map((item) => ({ employeeId: item.employee_id, weekday: item.weekday, start: item.starts_at.slice(0, 5), end: item.ends_at.slice(0, 5), label: item.subject })),
    (restDays ?? []).map((item) => ({ employeeId: item.employee_id, date: item.requested_date })),
  );
}

export async function saveScheduleDraft(weekStart: string, entries: ScheduleEntry[]) {
  if (!hasSupabaseConfig()) return { ok: true, demo: true, conflicts: [] };
  await requireRole("manager");
  await writeDraft(weekStart, entries);
  revalidatePath("/manager/schedule");
  return { ok: true, demo: false, conflicts: await conflictsFor(entries) };
}

export async function publishSchedule(weekStart: string, entries: ScheduleEntry[]) {
  if (!hasSupabaseConfig()) return { ok: true, demo: true, conflicts: [] };
  await requireRole("manager");
  const conflicts = await conflictsFor(entries);
  if (conflicts.length) return { ok: false, demo: false, conflicts };
  const { db, schedule } = await writeDraft(weekStart, entries);
  const revision = schedule.status === "draft" ? schedule.revision : schedule.revision + 1;
  const status = schedule.status === "draft" ? "published" : "revised";
  const { data: { user } } = await db.auth.getUser();
  const { error } = await db.from("schedules").update({ status, revision, published_at: new Date().toISOString(), published_by: user!.id }).eq("id", schedule.id);
  if (error) throw error;
  const snapshot = entries.filter((entry) => entry.value !== "Rest").map((entry) => toShift(schedule.id, entry));
  const { error: revisionError } = await db.from("schedule_revisions").insert({ schedule_id: schedule.id, revision, published_by: user!.id, snapshot });
  if (revisionError) throw revisionError;
  const recipients = [...new Set(entries.map((entry) => entry.employeeId))];
  if (recipients.length) await db.from("notifications").insert(recipients.map((recipient_id) => ({ recipient_id, title: status === "revised" ? "Schedule revised" : "Schedule published", message: `Your schedule for the week of ${weekStart} is ready.` })));
  revalidatePath("/manager/schedule");
  revalidatePath("/employee/schedule");
  return { ok: true, demo: false, conflicts: [] };
}
