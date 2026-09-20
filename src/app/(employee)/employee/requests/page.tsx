import { PageHeading } from "@/components/ui/page-heading";
import { RequestCenter } from "@/components/employee/request-center";
import { getRestDayAvailability, listRestDayRequests } from "@/lib/data/requests";
import { upcomingMonday, weekDays, weekRangeLabel } from "@/lib/week";

export default async function RequestsPage() {
  const weekStart = upcomingMonday();
  const days = weekDays(weekStart);
  const [requests, counts] = await Promise.all([listRestDayRequests("mine"), getRestDayAvailability(days.map((day) => day.date))]);
  return <><PageHeading eyebrow="Rest days" title="Choose a day off" description={`Pick your preferred rest day for ${weekRangeLabel(weekStart)}. Your manager will review it before the schedule is generated.`} /><RequestCenter initial={requests} days={days} initialCounts={counts} weekLabel={weekRangeLabel(weekStart)} /></>;
}
