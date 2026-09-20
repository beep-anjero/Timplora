"use server";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/neon/auth";
import { hasNeonAuth, hasNeonDatabase } from "@/lib/neon/config";
import { getSql } from "@/lib/neon/db";
export async function signIn(formData: FormData) {
  if (!hasNeonAuth() || !hasNeonDatabase())
    redirect("/login?error=Configure+Neon+to+sign+in");
  const { data, error } = await getAuth().signIn.email({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message || "Sign in failed")}`);
  const user = data?.user;
  if (!user) redirect("/login?error=Unable+to+load+account");
  const sql = getSql();
  await sql`insert into profiles(id,full_name,email) values(${user.id},${user.name || "Employee"},${user.email || String(formData.get("email"))}) on conflict(id) do nothing`;
  const rows = await sql`select role from profiles where id=${user.id}`;
  redirect(rows[0]?.role === "manager" ? "/manager" : "/employee");
}
