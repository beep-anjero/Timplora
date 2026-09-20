"use server";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/neon/auth";
import { hasNeonAuth, hasNeonDatabase } from "@/lib/neon/config";
import { getSql } from "@/lib/neon/db";
export async function signIn(formData: FormData) {
  if (!hasNeonAuth() || !hasNeonDatabase())
    redirect("/login?error=Configure+Neon+to+sign+in");
  const identifier = String(formData.get("identifier")).trim().toLowerCase();
  const sql = getSql();
  let email = identifier;
  if (!identifier.includes("@")) {
    const rows = await sql`select email from profiles where lower(username)=lower(${identifier}) and active limit 1`;
    email = rows[0]?.email ? String(rows[0].email) : `${identifier}@employees.timplora.internal`;
  }
  const { data, error } = await getAuth().signIn.email({
    email,
    password: String(formData.get("password")),
  });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message || "Sign in failed")}`);
  const user = data?.user;
  if (!user) redirect("/login?error=Unable+to+load+account");
  const rows = await sql`select role from profiles where id=${user.id} and active`;
  if (!rows[0]) {
    await getAuth().signOut();
    redirect("/login?error=This+account+does+not+have+a+Timplora+profile.+Ask+the+manager+to+create+it.");
  }
  redirect(rows[0]?.role === "manager" ? "/manager" : "/employee");
}
