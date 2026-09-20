"use client";

import { useMemo, useState } from "react";
import type { ClassMeeting, Employee, RestDayRequest, ScheduleStatus, Shift } from "@/types";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check, LayoutGrid } from "@/components/ui/icons";
import { publishSchedule, saveScheduleDraft } from "@/app/actions/schedules";
import { generateSchedule } from "@/lib/scheduling/generator";
import type { ShiftTemplate } from "@/lib/data/settings";
import type { WeekDay } from "@/lib/week";

function valueFor(shifts: Shift[], employeeId: string, date: string) {
  const shift = shifts.find((item) => item.employeeId === employeeId && item.start.slice(0, 10) === date);
  if (!shift) return "Rest";
  const format = (value: string) => new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Manila" });
  return `${format(shift.start)}–${format(shift.end)}`;
}

export function ScheduleBuilder({ employees, initialShifts, initialStatus, classes, requests, days, weekStart, templates, minimumDailyCrew }: { employees: Employee[]; initialShifts: Shift[]; initialStatus: ScheduleStatus; classes: ClassMeeting[]; requests: RestDayRequest[]; days: WeekDay[]; weekStart: string; templates: ShiftTemplate[]; minimumDailyCrew: number }) {
  const shiftOptions = useMemo(() => templates.map((template) => `${template.start}–${template.end}`), [templates]);
  const generated = useMemo(() => generateSchedule(employees, days, classes, requests, shiftOptions, minimumDailyCrew), [employees, days, classes, requests, shiftOptions, minimumDailyCrew]);
  const hasSavedWeek = initialShifts.some((shift) => days.some((day) => shift.start.slice(0, 10) === day.date));
  const savedGrid = Object.fromEntries(employees.flatMap((person) => days.map((day) => [`${person.id}-${day.date}`, valueFor(initialShifts, person.id, day.date)])));
  const [grid, setGrid] = useState<Record<string, string>>(hasSavedWeek ? savedGrid : generated.grid);
  const [status, setStatus] = useState<ScheduleStatus>(initialStatus);
  const [notice, setNotice] = useState(hasSavedWeek ? "" : "Draft generated from approved rest days, class schedules, and staffing rules.");
  const [warnings, setWarnings] = useState(generated.warnings);
  const entries = () => employees.flatMap((person) => days.map((day) => ({ employeeId: person.id, date: day.date, value: grid[`${person.id}-${day.date}`] })));

  function regenerate() { const next = generateSchedule(employees, days, classes, requests, shiftOptions, minimumDailyCrew); setGrid(next.grid); setWarnings(next.warnings); setNotice("Schedule regenerated using the latest approved requests and availability."); }
  async function save() { const result = await saveScheduleDraft(weekStart, entries()); setNotice(result.conflicts.length ? `Draft saved with ${result.conflicts.length} issue${result.conflicts.length === 1 ? "" : "s"} to resolve.` : "Draft saved."); }
  async function publish() { const result = await publishSchedule(weekStart, entries()); if (!result.ok) { setNotice(`${result.conflicts.length} issue${result.conflicts.length === 1 ? "" : "s"} must be resolved before publishing.`); return; } setStatus(status === "draft" ? "published" : "revised"); setNotice("Schedule published. Crew members have been notified."); }

  return <>
    <div className="mb-4 grid gap-3 lg:grid-cols-3">
      <div className="panel p-4"><span className="text-xs font-bold uppercase text-[var(--muted)]">Daily coverage</span><p className="mt-1 font-bold">At least {minimumDailyCrew} crew scheduled</p><p className="mt-1 text-xs text-[var(--muted)]">Flexible, overlapping shifts from settings</p></div>
      <div className="panel p-4"><span className="text-xs font-bold uppercase text-[var(--muted)]">Rest-day rules</span><p className="mt-1 font-bold">Approved requests protected</p><p className="mt-1 text-xs text-[var(--muted)]">Unrequested rest days are assigned automatically</p></div>
      <div className="panel p-4"><span className="text-xs font-bold uppercase text-[var(--muted)]">Availability</span><p className="mt-1 font-bold">Class conflicts avoided</p><p className="mt-1 text-xs text-[var(--muted)]">Overnight shifts include the following day</p></div>
    </div>
    <div className="mb-4 flex flex-wrap items-center gap-3"><Badge tone={status === "draft" ? "warning" : "success"}>{status}</Badge><span className="flex items-center gap-1 text-xs font-semibold text-[var(--warning)]"><AlertTriangle className="size-4" />Rules are checked before publish</span><button onClick={regenerate} className="button button-secondary ml-auto"><LayoutGrid className="size-4" />Generate schedule</button><button onClick={save} className="button button-secondary">Save draft</button><button onClick={publish} className="button button-primary"><Check className="size-4" />Publish schedule</button></div>
    {notice && <div role="status" className="mb-4 rounded-xl bg-[var(--success-soft)] px-4 py-3 text-sm font-semibold text-[var(--success)]">{notice}</div>}
    {warnings.length > 0 && <div className="mb-4 rounded-xl bg-[var(--warning-soft)] px-4 py-3 text-sm text-[var(--warning)]"><strong>Needs manager review:</strong><ul className="mt-1 list-disc pl-5">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div>}
    <div className="panel overflow-x-auto"><table className="w-full min-w-[1050px] text-left"><thead><tr className="bg-[var(--surface)]"><th className="sticky left-0 z-10 bg-[var(--surface)] p-4 text-xs uppercase text-[var(--muted)]">Crew member</th>{days.map((day) => <th key={day.date} className="p-4 text-center"><span className="block text-xs text-[var(--muted)]">{day.day}</span><strong>{day.label}</strong></th>)}</tr></thead><tbody className="divide-y divide-[var(--line)]">{employees.map((person) => <tr key={person.id}><th className="sticky left-0 z-10 bg-white p-4"><p className="text-sm font-bold">{person.name}</p><p className="text-xs font-normal text-[var(--muted)]">{person.classification}</p></th>{days.map((day) => { const key = `${person.id}-${day.date}`; const approvedRest = requests.some((request) => request.employeeId === person.id && request.date === day.date && request.status === "approved"); return <td key={key} className={`p-2 ${approvedRest ? "bg-[var(--success-soft)]" : ""}`}><select aria-label={`${person.name} ${day.day} shift`} className={`field min-w-32 p-2 text-xs font-semibold ${grid[key] === "Rest" ? "text-[var(--danger)]" : ""}`} value={grid[key]} onChange={(event) => setGrid({ ...grid, [key]: event.target.value })}>{["Rest", ...shiftOptions].map((template) => <option key={template}>{template}</option>)}</select>{approvedRest && <span className="mt-1 block text-[.65rem] font-bold text-[var(--success)]">Approved rest day</span>}</td>; })}</tr>)}</tbody></table></div>
    <p className="mt-4 text-xs text-[var(--muted)]">Generated shifts are staggered from early morning through closing so employees overlap for hand-offs. Managers can adjust any cell before publishing.</p>
  </>;
}
