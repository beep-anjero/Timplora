"use server";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/neon/auth";
export async function signOut(){await getAuth().signOut();redirect("/login")}
