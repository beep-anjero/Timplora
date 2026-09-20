"use server";
import { revalidatePath } from "next/cache";
import { requireRole, currentUser } from "@/lib/auth";
import { getAuth } from "@/lib/neon/auth";
import { getSql } from "@/lib/neon/db";
import { hasNeonDatabase } from "@/lib/neon/config";
export async function createTeamAccount(formData: FormData) {
  if (!hasNeonDatabase()) return { ok: true, demo: true };
  await requireRole("manager");
  const name = String(formData.get("name")).trim();
  const username = String(formData.get("username")).trim().toLowerCase();
  const password = String(formData.get("password"));
  const role = formData.get("role") === "manager" ? "manager" : "employee";
  if (!/^[a-z0-9._-]{3,30}$/.test(username)) return { ok: false, error: "Username must be 3–30 characters using letters, numbers, dots, dashes, or underscores." };
  if (password.length < 8) return { ok: false, error: "Temporary password must contain at least 8 characters." };
  const sql = getSql();
  const existing = await sql`select 1 from profiles where lower(username)=lower(${username}) limit 1`;
  if (existing[0]) return { ok: false, error: "That username is already in use." };
  const email = `${username}@accounts.timplora.internal`;
  const { data, error } = await getAuth().admin.createUser({
    email,
    name,
    password,
    role: role === "manager" ? "admin" : "user",
  });
  if (error) return { ok: false, error: error.message || "Account could not be created." };
  const id = data?.user.id;
  if (!id) throw new Error("Neon Auth did not return a user.");
  const position = role === "manager" ? "Restaurant Manager" : String(formData.get("position"));
  const classification = role === "manager" ? "FreeSched" : String(formData.get("classification"));
  await sql`insert into profiles(id,full_name,username,email,role,position,classification) values(${id},${name},${username},${email},${role}::account_role,${position},${classification}::employee_classification) on conflict(id) do update set full_name=excluded.full_name,username=excluded.username,email=excluded.email,role=excluded.role,position=excluded.position,classification=excluded.classification`;
  revalidatePath("/manager/employees");
  return { ok: true, demo: false };
}

export async function changeOwnPassword(formData: FormData) {
  if (!hasNeonDatabase()) return { ok: true, demo: true };
  const user = await currentUser();
  if (!user) return { ok: false, error: "You are not signed in." };
  const currentPassword = String(formData.get("currentPassword"));
  const newPassword = String(formData.get("newPassword"));
  const confirmation = String(formData.get("confirmation"));
  if (newPassword.length < 8) return { ok: false, error: "New password must contain at least 8 characters." };
  if (newPassword !== confirmation) return { ok: false, error: "New passwords do not match." };
  const { error } = await getAuth().changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
  if (error) return { ok: false, error: error.message || "Password could not be changed." };
  return { ok: true, demo: false };
}
export async function updateTeamAccount(id: string, formData: FormData) {
  if (!hasNeonDatabase()) return { ok: true, demo: true };
  const manager = await requireRole("manager");
  if (!manager || manager.id === id) return { ok: false, error: "You cannot edit your own account here." };
  const name = String(formData.get("name")).trim();
  const position = String(formData.get("position")).trim();
  const classification = String(formData.get("classification") || "FreeSched");
  if (!name || !position) return { ok: false, error: "Name and position are required." };
  await getSql()`update profiles set full_name=${name},position=${position},classification=${classification}::employee_classification,updated_at=now() where id=${id}`;
  revalidatePath("/manager/employees");
  return { ok: true, demo: false };
}
export async function setTeamAccountActive(id: string, active: boolean) {
  if (!hasNeonDatabase()) return { ok: true, demo: true };
  const manager = await requireRole("manager");
  if (!manager || manager.id === id) return { ok: false, error: "You cannot deactivate your own account." };
  await getSql()`update profiles set active=${active},updated_at=now() where id=${id}`;
  revalidatePath("/manager/employees");
  return { ok: true, demo: false };
}
export async function resetTeamAccountPassword(id: string, password: string) {
  if (!hasNeonDatabase()) return { ok: true, demo: true };
  const manager = await requireRole("manager");
  if (!manager || manager.id === id) return { ok: false, error: "Use your own profile to change your password." };
  if (password.length < 8) return { ok: false, error: "Password must contain at least 8 characters." };
  const { error } = await getAuth().admin.setUserPassword({ userId: id, newPassword: password });
  if (error) return { ok: false, error: error.message || "Password could not be reset." };
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
