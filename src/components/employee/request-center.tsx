"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { RestDayRequest } from "@/types";
import { CalendarDays } from "@/components/ui/icons";
import { cancelRestDayRequest, submitRestDayRequest } from "@/app/actions/requests";

type RequestDay = { day: string; longDay: string; date: string; label: string };

export function RequestCenter({ initial, days, initialCounts, weekLabel }: { initial: RestDayRequest[]; days: RequestDay[]; initialCounts: Record<string, number>; weekLabel: string }) {
  const [items, setItems] = useState(initial);
  const [counts, setCounts] = useState(initialCounts);
  const [selected, setSelected] = useState<RequestDay | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setError("");
    const form = new FormData(e.currentTarget);
    form.set("date", selected.date);
    const result = await submitRestDayRequest(form);
    setSubmitting(false);
    if (!result.ok) { setError(result.error ?? "Request could not be submitted."); return; }
    setItems([{ id: crypto.randomUUID(), employeeId: "current", date: selected.date, reason: String(form.get("reason")), status: "pending", submittedAt: new Date().toISOString() }, ...items]);
    setCounts({ ...counts, [selected.date]: (counts[selected.date] ?? 0) + 1 });
    setSelected(null);
    setNotice(`Rest day requested for ${selected.longDay}.`);
  }

  async function cancel(id: string) {
    const item = items.find((request) => request.id === id);
    await cancelRestDayRequest(id);
    setItems(items.map((request) => request.id === id ? { ...request, status: "cancelled" } : request));
    if (item) setCounts({ ...counts, [item.date]: Math.max(0, (counts[item.date] ?? 0) - 1) });
    setNotice("Pending request cancelled.");
  }

  return <>
    {notice && <div role="status" className="mb-5 rounded-xl bg-[var(--success-soft)] px-4 py-3 text-sm font-semibold text-[var(--success)]">{notice}</div>}
    <section className="panel p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-xl font-bold">Choose your preferred rest day</h2><p className="mt-1 text-sm text-[var(--muted)]">Select a day, then tell your manager why. Up to 3 crew members may request each day.</p></div><span className="rounded-full bg-[var(--brand-soft)] px-3 py-1.5 text-xs font-bold text-[var(--brand)]">{weekLabel}</span></div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {days.map((day) => { const used = counts[day.date] ?? 0; const own = items.some((item) => item.date === day.date && (item.status === "pending" || item.status === "approved")); const full = used >= 3 && !own; return <button key={day.date} type="button" disabled={full || own} onClick={() => { setSelected(day); setError(""); setNotice(""); }} className={`group min-h-32 rounded-2xl border p-4 text-left transition ${own ? "border-[var(--brand)] bg-[var(--brand-soft)]" : full ? "cursor-not-allowed border-[var(--line)] bg-[var(--surface)] opacity-60" : "border-[var(--line)] bg-white hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-md"}`}><span className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{day.day}</span><span className="mt-1 block text-2xl font-black">{day.label}</span><span className={`mt-3 block text-xs font-bold ${used >= 3 ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>{own ? "Your request" : used >= 3 ? "Full" : `${3 - used} spot${3 - used === 1 ? "" : "s"} left`}</span></button>; })}
      </div>
    </section>
    <section className="panel mt-6 overflow-hidden"><div className="border-b border-[var(--line)] px-5 py-4"><h2 className="font-display text-lg font-bold">Request history</h2></div><div className="divide-y divide-[var(--line)]">{items.length === 0 ? <p className="p-5 text-sm text-[var(--muted)]">No requests yet.</p> : items.map(item => <article key={item.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center"><div className="flex-1"><p className="font-bold">{new Date(item.date + "T00:00:00").toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}</p><p className="mt-1 text-sm text-[var(--muted)]">{item.reason} · Submitted {new Date(item.submittedAt).toLocaleDateString()}</p>{item.managerNote && <p className="mt-1 text-xs text-[var(--muted)]">Manager note: {item.managerNote}</p>}</div><Badge tone={item.status === "approved" ? "success" : item.status === "pending" ? "warning" : item.status === "declined" ? "danger" : "neutral"}>{item.status}</Badge>{item.status === "pending" && <button className="button button-ghost text-[var(--danger)]" onClick={() => cancel(item.id)}>Cancel</button>}</article>)}</div></section>
    {selected && <div className="fixed inset-0 z-50 grid place-items-center bg-[#17251f]/45 p-4" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setSelected(null); }}><div role="dialog" aria-modal="true" aria-labelledby="request-title" className="panel w-full max-w-md p-6 shadow-2xl"><div className="flex size-11 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]"><CalendarDays className="size-5" /></div><h2 id="request-title" className="mt-4 font-display text-2xl font-bold">Request {selected.longDay} off</h2><p className="mt-1 text-sm text-[var(--muted)]">{new Date(selected.date + "T00:00:00").toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })} · {3 - (counts[selected.date] ?? 0)} spots currently available</p><form className="mt-5" onSubmit={submit}><label className="label" htmlFor="reason">Reason for your request</label><textarea autoFocus className="field min-h-28 resize-none" id="reason" name="reason" placeholder="Share a brief reason with your manager" minLength={3} maxLength={500} required />{error && <p role="alert" className="mt-3 rounded-xl bg-[var(--danger-soft)] px-3 py-2 text-sm font-semibold text-[var(--danger)]">{error}</p>}<div className="mt-5 flex justify-end gap-2"><button className="button button-ghost" type="button" onClick={() => setSelected(null)}>Cancel</button><button disabled={submitting} className="button button-primary" type="submit">{submitting ? "Submitting…" : "Send request"}</button></div></form></div></div>}
  </>;
}
