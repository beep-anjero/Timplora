import type { ReactNode } from "react";
import { AppShell } from "@/components/ui/app-shell";
import { CalendarDays, ClipboardList, Clock3, LayoutGrid, Users } from "@/components/ui/icons";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/employee", label: "Home", icon: <LayoutGrid /> },
  { href: "/employee/schedule", label: "Schedule", icon: <CalendarDays /> },
  { href: "/employee/requests", label: "Requests", icon: <ClipboardList /> },
  { href: "/employee/availability", label: "Availability", icon: <Clock3 /> },
  { href: "/employee/profile", label: "Profile", icon: <Users /> },
];

export default async function Layout({ children }: { children: ReactNode }) {
  await requireRole("employee");
  return <AppShell role="Employee" name="Maria Santos" nav={nav}>{children}</AppShell>;
}
