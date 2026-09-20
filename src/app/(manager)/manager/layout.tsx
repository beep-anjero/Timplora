import type { ReactNode } from "react";
import { AppShell } from "@/components/ui/app-shell";
import { CalendarDays, ClipboardList, LayoutGrid, Settings, Users } from "@/components/ui/icons";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/manager", label: "Overview", icon: <LayoutGrid /> },
  { href: "/manager/employees", label: "Employees", icon: <Users /> },
  { href: "/manager/requests", label: "Requests", icon: <ClipboardList /> },
  { href: "/manager/schedule", label: "Schedule", icon: <CalendarDays /> },
  { href: "/manager/settings", label: "Settings", icon: <Settings /> },
];

export default async function Layout({ children }: { children: ReactNode }) {
  await requireRole("manager");
  return <AppShell role="Manager" name="Daniel Lim" nav={nav}>{children}</AppShell>;
}
