import Link from "next/link";
import { PageHeading } from "@/components/ui/page-heading";
import { StatCard } from "@/components/ui/stat-card";
import { CalendarDays, Clock3, ClipboardList } from "@/components/ui/icons";
import { WeekStrip } from "@/components/employee/week-strip";
import { Badge } from "@/components/ui/badge";
import { getCurrentEmployee } from "@/lib/data/employees";
import { listRestDayRequests } from "@/lib/data/requests";
import { getSchedule } from "@/lib/data/schedules";
import { mondayOf, weekDays, weekRangeLabel } from "@/lib/week";

export default async function CrewDashboard() {
  const weekStart = mondayOf();
  const [person, requests, schedule] = await Promise.all([getCurrentEmployee(), listRestDayRequests("mine"), getSchedule(weekStart, "mine")]);
  const next = schedule.shifts[0];
  const hours = schedule.shifts.reduce((total, shift) => total + (new Date(shift.end).getTime() - new Date(shift.start).getTime()) / 3600000, 0);
  const pending = requests.filter((item) => item.status === "pending");
  return <><PageHeading eyebrow="Current week" title={`Good day, ${person.name.split(" ")[0]}`} description="Here’s what your work week looks like." /><section className="grid gap-4 sm:grid-cols-3"><StatCard label="Next shift" value={next ? new Date(next.start).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" }) : "None"} detail={next ? new Date(next.start).toLocaleDateString("en-PH", { weekday: "long", month: "short", day: "numeric", timeZone: "Asia/Manila" }) : "No upcoming shift"} icon={<Clock3 className="size-5" />} /><StatCard label="Hours this week" value={`${Math.round(hours)}h`} detail={`${schedule.shifts.length} scheduled shift${schedule.shifts.length === 1 ? "" : "s"}`} icon={<CalendarDays className="size-5" />} /><StatCard label="Pending requests" value={String(pending.length)} detail={pending[0] ? `For ${new Date(pending[0].date + "T00:00:00").toLocaleDateString("en", { month: "short", day: "numeric" })}` : "No pending requests"} icon={<ClipboardList className="size-5" />} /></section><section className="panel mt-6 p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-display text-xl font-bold">Your week</h2><p className="text-sm text-[var(--muted)]">{weekRangeLabel(weekStart)}</p></div><Badge tone={schedule.status === "draft" ? "warning" : "success"}>{schedule.status}</Badge></div><WeekStrip days={weekDays(weekStart)} shifts={schedule.shifts} />{next && <div className="mt-5 flex flex-col justify-between gap-3 rounded-2xl bg-[var(--brand-soft)] p-4 sm:flex-row sm:items-center"><div><p className="text-sm font-bold text-[var(--brand)]">Next · {next.label} shift</p><p className="mt-1 text-sm text-[var(--muted)]">{new Date(next.start).toLocaleString("en-PH", { weekday: "long", hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" })}</p></div><Link href="/employee/schedule" className="button button-secondary">View schedule</Link></div>}</section></>;
}
