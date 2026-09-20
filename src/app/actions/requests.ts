"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
export async function submitRestDayRequest(formData: FormData) {
  if (!hasSupabaseConfig()) return { ok: true, demo: true };
  await requireRole("employee");
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  const { error } = await db
    .from("rest_day_requests")
    .insert({
      employee_id: user!.id,
      requested_date: String(formData.get("date")),
      reason: String(formData.get("reason")),
    });
  if (error) throw error;
  revalidatePath("/employee/requests");
  revalidatePath("/manager/requests");
  return { ok: true, demo: false };
}
export async function cancelRestDayRequest(id: string) {
  if (!hasSupabaseConfig()) return { ok: true, demo: true };
  await requireRole("employee");
  const db = await createClient();
  const { error } = await db
    .from("rest_day_requests")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("status", "pending");
  if (error) throw error;
  revalidatePath("/employee/requests");
  return { ok: true, demo: false };
}
export async function reviewRestDayRequest(
  id: string,
  status: "approved" | "declined",
  note?: string,
) {
  if (!hasSupabaseConfig()) return { ok: true, demo: true };
  await requireRole("manager");
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  const { data: request, error } = await db
    .from("rest_day_requests")
    .update({
      status,
      manager_note: note || null,
      reviewed_by: user!.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "pending")
    .select("employee_id,requested_date")
    .single();
  if (error) throw error;
  await db.from("notifications").insert({
    recipient_id: request.employee_id,
    title: `Rest day request ${status}`,
    message: `Your request for ${request.requested_date} was ${status}.`,
  });
  revalidatePath("/manager/requests");
  revalidatePath("/employee/requests");
  return { ok: true, demo: false };
}
