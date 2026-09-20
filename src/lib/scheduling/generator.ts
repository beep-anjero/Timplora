import type { ClassMeeting, Employee, RestDayRequest } from "@/types";

export const AUTO_SHIFT_TEMPLATES = [
  "Rest",
  "04:00–13:00",
  "05:00–14:00",
  "08:00–16:00",
  "09:00–18:00",
  "11:00–20:00",
  "14:00–22:00",
  "16:00–01:00",
] as const;

type Day = { date: string; day: string };
type GeneratedSchedule = { grid: Record<string, string>; warnings: string[] };

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function canWork(employeeId: string, date: string, shift: string, classes: ClassMeeting[]) {
  if (shift === "Rest") return true;
  const [rawStart, rawEnd] = shift.split("–");
  const start = toMinutes(rawStart);
  const endValue = toMinutes(rawEnd);
  const end = endValue <= start ? endValue + 1440 : endValue;
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay() || 7;

  return !classes.some((meeting) => {
    if (meeting.employeeId !== employeeId) return false;
    const offset = meeting.day === weekday ? 0 : meeting.day === (weekday === 7 ? 1 : weekday + 1) ? 1440 : null;
    if (offset === null) return false;
    const classStart = toMinutes(meeting.start) + offset;
    const rawClassEnd = toMinutes(meeting.end);
    const classEnd = rawClassEnd <= toMinutes(meeting.start) ? rawClassEnd + 1440 + offset : rawClassEnd + offset;
    return start < classEnd && classStart < end;
  });
}

function preferenceScore(employee: Employee, shift: string) {
  const start = toMinutes(shift.split("–")[0]);
  if (employee.preferredPeriod === "Morning" && start < 8 * 60) return 3;
  if (employee.preferredPeriod === "Afternoon" && start >= 8 * 60 && start < 14 * 60) return 3;
  if (employee.preferredPeriod === "Evening" && start >= 14 * 60) return 3;
  return 0;
}

export function generateSchedule(
  employees: Employee[],
  days: Day[],
  classes: ClassMeeting[],
  requests: RestDayRequest[],
  shiftTemplates: string[] = AUTO_SHIFT_TEMPLATES.filter((item) => item !== "Rest"),
  minimumDailyCrew = 4,
): GeneratedSchedule {
  const grid: Record<string, string> = {};
  const warnings: string[] = [];
  const restCount = new Map(employees.map((employee) => [employee.id, 0]));
  const closingCount = new Map(employees.map((employee) => [employee.id, 0]));
  const approved = requests.filter((request) => request.status === "approved");

  for (const day of days) {
    const requiredRest = new Set(approved.filter((request) => request.date === day.date).map((request) => request.employeeId));
    const targetWorkers = Math.min(Math.max(1, minimumDailyCrew), employees.length);
    const extraRestNeeded = Math.max(0, employees.length - requiredRest.size - targetWorkers);
    const optionalRest = employees
      .filter((employee) => !requiredRest.has(employee.id))
      .sort((a, b) => (restCount.get(a.id) ?? 0) - (restCount.get(b.id) ?? 0) || a.name.localeCompare(b.name))
      .slice(0, extraRestNeeded);
    optionalRest.forEach((employee) => requiredRest.add(employee.id));

    for (const employee of employees) grid[`${employee.id}-${day.date}`] = requiredRest.has(employee.id) ? "Rest" : "";
    requiredRest.forEach((id) => restCount.set(id, (restCount.get(id) ?? 0) + 1));

    const available = employees.filter((employee) => !requiredRest.has(employee.id));
    // Staggered bands mirror the supplied rota: shifts overlap for hand-offs,
    // but no fixed number of openers, relievers, or closers is imposed.
    const orderedTemplates = [...shiftTemplates].sort((a, b) => toMinutes(a.split("–")[0]) - toMinutes(b.split("–")[0]));
    const shiftBands = Array.from({ length: Math.min(targetWorkers, orderedTemplates.length) }, (_, index) => {
      const templateIndex = targetWorkers === 1 ? 0 : Math.round(index * (orderedTemplates.length - 1) / (targetWorkers - 1));
      return [orderedTemplates[templateIndex]];
    });
    const assigned = new Set<string>();

    for (let bandIndex = 0; bandIndex < shiftBands.length && assigned.size < available.length; bandIndex++) {
      const options = shiftBands[bandIndex];
      const rotatedOptions = options.length > 1 && (days.indexOf(day) + bandIndex) % 2 ? [...options].reverse() : options;
      const candidates = available.filter((employee) => !assigned.has(employee.id));
      const choice = rotatedOptions.flatMap((shift) => candidates.filter((employee) => canWork(employee.id, day.date, shift, classes)).map((employee) => ({ employee, shift })))
        .sort((a, b) => {
          const score = preferenceScore(b.employee, b.shift) - preferenceScore(a.employee, a.shift);
          if (score) return score;
          if (a.shift === "16:00–01:00") return (closingCount.get(a.employee.id) ?? 0) - (closingCount.get(b.employee.id) ?? 0);
          return a.employee.name.localeCompare(b.employee.name);
        })[0];
      if (!choice) {
        warnings.push(`${day.day}: an overlapping shift band could not be filled because of rest days or class schedules.`);
        continue;
      }
      grid[`${choice.employee.id}-${day.date}`] = choice.shift;
      assigned.add(choice.employee.id);
      if (choice.shift === "16:00–01:00") closingCount.set(choice.employee.id, (closingCount.get(choice.employee.id) ?? 0) + 1);
    }

    for (const employee of available.filter((item) => !assigned.has(item.id))) {
      const shift = orderedTemplates.find((item) => canWork(employee.id, day.date, item, classes));
      grid[`${employee.id}-${day.date}`] = shift ?? "Rest";
      if (!shift) {
        restCount.set(employee.id, (restCount.get(employee.id) ?? 0) + 1);
        warnings.push(`${day.day}: ${employee.name} has no shift that fits their class schedule.`);
      }
    }
  }

  for (const employee of employees) {
    if ((restCount.get(employee.id) ?? 0) > 0) continue;
    const replaceable = days.find((day) => {
      const shift = grid[`${employee.id}-${day.date}`];
      return shift !== "Rest" && employees.filter((person) => grid[`${person.id}-${day.date}`] !== "Rest").length > 4;
    });
    if (replaceable) grid[`${employee.id}-${replaceable.date}`] = "Rest";
    else warnings.push(`${employee.name} still needs a weekly rest day; adjust the draft before publishing.`);
  }

  return { grid, warnings: [...new Set(warnings)] };
}
