import { PageHeading } from "@/components/ui/page-heading";
import { ScheduleBuilder } from "@/components/manager/schedule-builder";
import { listAllClasses, listEmployees } from "@/lib/data/employees";
import { listRestDayRequests } from "@/lib/data/requests";
import { getSchedule } from "@/lib/data/schedules";
import { getSchedulingSettings } from "@/lib/data/settings";
import { upcomingMonday, weekDays, weekRangeLabel } from "@/lib/week";

export default async function SchedulePage() {
  const weekStart = upcomingMonday();
  const [employees, schedule, classes, requests, settings] = await Promise.all([listEmployees(), getSchedule(weekStart, "all"), listAllClasses(), listRestDayRequests("all"), getSchedulingSettings()]);
  return <><PageHeading eyebrow="Weekly planner" title={weekRangeLabel(weekStart)} description="Generate a staffed schedule from class availability and approved rest-day requests, then review and publish it." /><ScheduleBuilder employees={employees} initialShifts={schedule.shifts} initialStatus={schedule.status} classes={classes} requests={requests} days={weekDays(weekStart)} weekStart={weekStart} templates={settings.templates} minimumDailyCrew={settings.minimumDailyCrew} /></>;
}
