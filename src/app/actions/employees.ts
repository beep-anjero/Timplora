"use server";
import { revalidatePath } from "next/cache";
import { requireRole, currentUser } from "@/lib/auth";
import { getAuth } from "@/lib/neon/auth";
import { getSql } from "@/lib/neon/db";
import { hasNeonDatabase } from "@/lib/neon/config";
export async function createEmployeeAccount(formData: FormData) {
  if (!hasNeonDatabase()) return { ok: true, demo: true };
  await requireRole("manager");
  const name = String(formData.get("name"));
  const email = String(formData.get("email"));
  const { data, error } = await getAuth().admin.createUser({
    email,
    name,
    password: String(formData.get("password")),
    role: "user",
  });
  if (error) throw new Error(error.message);
  const id = data?.user.id;
  if (!id) throw new Error("Neon Auth did not return a user.");
  await getSql()`insert into profiles(id,full_name,email,position,classification) values(${id},${name},${email},${String(formData.get("position"))},${String(formData.get("classification"))}::employee_classification) on conflict(id) do update set full_name=excluded.full_name,email=excluded.email,position=excluded.position,classification=excluded.classification`;
  revalidatePath("/manager/employees");
  return { ok: true, demo: false };
}
export async function saveAvailability(formData: FormData) {
  if (!hasNeonDatabase()) return { ok: true, demo: true };
  await requireRole("employee");
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");
  const meetings = JSON.parse(
    String(formData.get("meetings") || "[]"),
  ) as Array<{ day: number; subject: string; start: string; end: string }>;
  const sql = getSql();
  await sql`update profiles set preferred_period=${String(formData.get("period"))}::shift_period,updated_at=now() where id=${user.id}`;
  await sql`delete from class_meetings where employee_id=${user.id}`;
  for (const meeting of meetings)
    await sql`insert into class_meetings(employee_id,weekday,subject,starts_at,ends_at) values(${user.id},${meeting.day},${meeting.subject},${meeting.start}::time,${meeting.end}::time)`;
  revalidatePath("/employee/availability");
  return { ok: true, demo: false };
}
