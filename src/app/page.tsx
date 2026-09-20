import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, ShieldCheck } from "@/components/ui/icons";

const features = [
  { icon: CalendarDays, title: "One clear schedule", copy: "See the week at a glance, from opening shifts to late-night close." },
  { icon: Clock3, title: "Requests in one place", copy: "Submit rest days and track every decision without chasing chat threads." },
  { icon: ShieldCheck, title: "Manager controlled", copy: "Managers review availability, resolve conflicts, and publish the final plan." },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--surface)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_78%_10%,rgba(246,177,67,.25),transparent_38%),radial-gradient(circle_at_15%_15%,rgba(30,93,74,.12),transparent_35%)]" />
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <Link className="flex items-center gap-3" href="/"><span className="grid size-10 place-items-center rounded-2xl bg-[var(--brand)] text-lg font-black text-white shadow-sm">T</span><span className="font-display text-xl font-bold tracking-tight text-[var(--ink)]">Timplora</span></Link>
        <div className="flex items-center gap-2"><Link className="button button-ghost hidden sm:inline-flex" href="/employee">Employee view</Link><Link className="button button-primary" href="/manager">Open workspace <ArrowRight className="size-4" /></Link></div>
      </nav>
      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:px-12 lg:pb-28 lg:pt-24">
        <div><span className="eyebrow">Schedule with confidence</span><h1 className="mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.02] tracking-[-.045em] text-[var(--ink)] sm:text-6xl lg:text-7xl">Your team&apos;s week, <span className="text-[var(--brand)]">beautifully aligned.</span></h1><p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)]">Timplora brings schedules, rest day requests, and student availability into one calm workspace built for busy restaurant teams.</p><div className="mt-9 flex flex-wrap gap-3"><Link className="button button-primary h-12 px-6" href="/manager">Explore manager workspace <ArrowRight className="size-4" /></Link><Link className="button button-secondary h-12 px-6" href="/employee">View employee portal</Link></div></div>
        <div className="relative mx-auto w-full max-w-xl"><div className="absolute -inset-5 rotate-2 rounded-[2rem] bg-[var(--accent-soft)]" /><div className="relative rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_28px_80px_rgba(30,51,43,.14)] backdrop-blur sm:p-7"><div className="flex items-center justify-between border-b border-[var(--line)] pb-5"><div><p className="text-sm font-semibold text-[var(--muted)]">THIS WEEK</p><h2 className="mt-1 font-display text-2xl font-bold text-[var(--ink)]">Team overview</h2></div><span className="rounded-full bg-[var(--success-soft)] px-3 py-1.5 text-xs font-bold text-[var(--success)]">Published</span></div><div className="mt-5 grid grid-cols-3 gap-3">{[['24','Shifts'],['12','People'],['3','Requests']].map(([value,label]) => <div key={label} className="rounded-2xl bg-[var(--surface)] p-4"><p className="font-display text-2xl font-bold text-[var(--ink)]">{value}</p><p className="mt-1 text-xs text-[var(--muted)]">{label}</p></div>)}</div><div className="mt-5 space-y-3">{[['Maria Santos','8:00 AM – 5:00 PM','Morning'],['Paolo Reyes','12:00 PM – 9:00 PM','Mid'],['Lea Cruz','4:00 PM – 1:00 AM','Closing']].map(([name,time,label],index) => <div key={name} className="flex items-center gap-3 rounded-2xl border border-[var(--line)] p-3"><span className={`avatar avatar-${index+1}`}>{name.split(' ').map(v=>v[0]).join('')}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[var(--ink)]">{name}</p><p className="text-xs text-[var(--muted)]">{time}</p></div><span className="text-xs font-semibold text-[var(--brand)]">{label}</span></div>)}</div></div></div>
      </section>
      <section className="relative border-t border-[var(--line)] bg-white/70"><div className="mx-auto grid max-w-7xl gap-4 px-5 py-16 sm:px-8 md:grid-cols-3 lg:px-12">{features.map(({icon: Icon,title,copy}) => <article key={title} className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-sm"><span className="grid size-11 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]"><Icon className="size-5" /></span><h2 className="mt-5 font-display text-xl font-bold text-[var(--ink)]">{title}</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy}</p></article>)}</div></section>
    </main>
  );
}
