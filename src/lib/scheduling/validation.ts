export type ScheduleEntry = { employeeId: string; date: string; value: string };
export type AvailabilityBlock = { employeeId: string; weekday: number; start: string; end: string; label: string };
export type ApprovedRestDay = { employeeId: string; date: string };
export type ScheduleConflict = { employeeId: string; date: string; kind: "class" | "rest-day" | "invalid"; message: string };

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function minutes(value: string) {
  if (!TIME_PATTERN.test(value)) return null;
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

function nextWeekday(day: number) {
  return day === 7 ? 1 : day + 1;
}

export function validateSchedule(entries: ScheduleEntry[], classes: AvailabilityBlock[], restDays: ApprovedRestDay[]) {
  const conflicts: ScheduleConflict[] = [];
  for (const entry of entries) {
    if (entry.value === "Rest") continue;

    const parts = entry.value.split("–");
    const start = parts.length === 2 ? minutes(parts[0]) : null;
    const rawEnd = parts.length === 2 ? minutes(parts[1]) : null;
    if (start === null || rawEnd === null || start === rawEnd) {
      conflicts.push({ employeeId: entry.employeeId, date: entry.date, kind: "invalid", message: "Shift time is invalid." });
      continue;
    }

    const end = rawEnd <= start ? rawEnd + 24 * 60 : rawEnd;
    if (restDays.some((rest) => rest.employeeId === entry.employeeId && rest.date === entry.date)) {
      conflicts.push({ employeeId: entry.employeeId, date: entry.date, kind: "rest-day", message: "Shift conflicts with an approved rest day." });
    }

    const weekday = new Date(`${entry.date}T12:00:00Z`).getUTCDay() || 7;
    for (const block of classes.filter((item) => item.employeeId === entry.employeeId)) {
      const classStart = minutes(block.start);
      const classEnd = minutes(block.end);
      if (classStart === null || classEnd === null || classStart === classEnd) continue;

      const dayOffset = block.weekday === weekday ? 0 : block.weekday === nextWeekday(weekday) ? 24 * 60 : null;
      if (dayOffset === null) continue;
      const normalizedClassEnd = classEnd <= classStart ? classEnd + 24 * 60 : classEnd;

      if (overlaps(start, end, classStart + dayOffset, normalizedClassEnd + dayOffset)) {
        conflicts.push({ employeeId: entry.employeeId, date: entry.date, kind: "class", message: `Shift overlaps ${block.label}.` });
      }
    }
  }
  return conflicts;
}
