"use client";
import { useState } from "react";
import type { Employee, ScheduleStatus, Shift } from "@/types";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check } from "@/components/ui/icons";
import { publishSchedule, saveScheduleDraft } from "@/app/actions/schedules";
const days = [
  { day: "Mon", date: "2026-09-28", label: "28" },
  { day: "Tue", date: "2026-09-29", label: "29" },
  { day: "Wed", date: "2026-09-30", label: "30" },
  { day: "Thu", date: "2026-10-01", label: "1" },
  { day: "Fri", date: "2026-10-02", label: "2" },
  { day: "Sat", date: "2026-10-03", label: "3" },
  { day: "Sun", date: "2026-10-04", label: "4" },
];
const templates = [
  "Rest",
  "08:00–17:00",
  "10:00–19:00",
  "12:00–21:00",
  "16:00–01:00",
];
function valueFor(shifts: Shift[], employeeId: string, date: string) {
  const shift = shifts.find(
    (s) => s.employeeId === employeeId && s.start.slice(0, 10) === date,
  );
  if (!shift) return "Rest";
  const start = new Date(shift.start).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Manila",
  });
  const end = new Date(shift.end).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Manila",
  });
  return `${start}–${end}`;
}
export function ScheduleBuilder({
  employees,
  initialShifts,
  initialStatus,
}: {
  employees: Employee[];
  initialShifts: Shift[];
  initialStatus: ScheduleStatus;
}) {
  const defaults = Object.fromEntries(
    employees.flatMap((p, pi) =>
      days.map((d, di) => [
        `${p.id}-${d.date}`,
        valueFor(initialShifts, p.id, d.date) !== "Rest"
          ? valueFor(initialShifts, p.id, d.date)
          : di === (pi + 5) % 7
            ? "Rest"
            : templates[((pi + di) % 4) + 1],
      ]),
    ),
  );
  const [grid, setGrid] = useState<Record<string, string>>(defaults);
  const [status, setStatus] = useState<ScheduleStatus>(initialStatus);
  const [notice, setNotice] = useState("");
  const entries = () =>
    employees.flatMap((p) =>
      days.map((d) => ({
        employeeId: p.id,
        date: d.date,
        value: grid[`${p.id}-${d.date}`],
      })),
    );
  async function save() {
    await saveScheduleDraft("2026-09-28", entries());
    setNotice("Draft saved.");
  }
  async function publish() {
    const result = await publishSchedule("2026-09-28", entries());
    if (!result.ok) {
      setNotice(`${result.conflicts.length} conflict${result.conflicts.length === 1 ? "" : "s"} must be resolved before publishing.`);
      return;
    }
    setStatus(status === "draft" ? "published" : "revised");
    setNotice("Schedule published. Employees have been notified.");
  }
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Badge tone={status === "draft" ? "warning" : "success"}>
          {status}
        </Badge>
        <span className="flex items-center gap-1 text-xs font-semibold text-[var(--warning)]">
          <AlertTriangle className="size-4" />
          Conflicts are checked before publish
        </span>
        <button onClick={save} className="button button-secondary ml-auto">
          Save draft
        </button>
        <button onClick={publish} className="button button-primary">
          <Check className="size-4" />
          Publish schedule
        </button>
      </div>
      {notice && (
        <div
          role="status"
          className="mb-4 rounded-xl bg-[var(--success-soft)] px-4 py-3 text-sm font-semibold text-[var(--success)]"
        >
          {notice}
        </div>
      )}
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left">
          <thead>
            <tr className="bg-[var(--surface)]">
              <th className="sticky left-0 z-10 bg-[var(--surface)] p-4 text-xs uppercase text-[var(--muted)]">
                Employee
              </th>
              {days.map((d) => (
                <th key={d.date} className="p-4 text-center">
                  <span className="block text-xs text-[var(--muted)]">
                    {d.day}
                  </span>
                  <strong>{d.label}</strong>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {employees.map((p) => (
              <tr key={p.id}>
                <th className="sticky left-0 z-10 bg-white p-4">
                  <p className="text-sm font-bold">{p.name}</p>
                  <p className="text-xs font-normal text-[var(--muted)]">
                    {p.classification}
                  </p>
                </th>
                {days.map((d, di) => {
                  const key = `${p.id}-${d.date}`;
                  const conflict =
                    p.classification === "Working Student" &&
                    di === 2 &&
                    grid[key] !== "Rest";
                  return (
                    <td
                      key={key}
                      className={`p-2 ${conflict ? "bg-[var(--danger-soft)]" : ""}`}
                    >
                      <select
                        aria-label={`${p.name} ${d.day} shift`}
                        className={`field min-w-28 p-2 text-xs font-semibold ${conflict ? "border-[var(--danger)] text-[var(--danger)]" : ""}`}
                        value={grid[key]}
                        onChange={(e) =>
                          setGrid({ ...grid, [key]: e.target.value })
                        }
                      >
                        {templates.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                      {conflict && (
                        <span className="mt-1 block text-[.65rem] font-bold text-[var(--danger)]">
                          Class overlap
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-[var(--muted)]">
        Times after midnight belong to the following calendar day. A 16:00–01:00
        shift is stored with complete start and end timestamps.
      </p>
    </>
  );
}
