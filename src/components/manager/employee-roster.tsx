"use client";
import { useState } from "react";
import type { AccountRole, Employee } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Plus } from "@/components/ui/icons";
import { createTeamAccount } from "@/app/actions/employees";
import { AccountActions } from "@/components/manager/account-actions";
export function EmployeeRoster({ initial }: { initial: Employee[] }) {
  const [people, setPeople] = useState(initial);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [accountRole, setAccountRole] = useState<AccountRole>("employee");
  const filtered = people.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) || p.username?.toLowerCase().includes(query.toLowerCase()),
  );
  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const person: Employee = {
      id: crypto.randomUUID(),
      name: String(f.get("name")),
      username: String(f.get("username")),
      email: "",
      phone: "",
      role: accountRole,
      classification: String(
        f.get("classification"),
      ) as Employee["classification"],
      position: accountRole === "manager" ? "Restaurant Manager" : String(f.get("position")),
      active: true,
    };
    const result = await createTeamAccount(f);
    if (!result.ok) { setError(result.error ?? "Account could not be created."); return; }
    setPeople([...people, person]);
    setOpen(false);
    setError("");
    setNotice(`${accountRole === "manager" ? "Manager" : "Crew"} account created.`);
  }
  return (
    <>
      {notice && (
        <div
          role="status"
          className="mb-4 rounded-xl bg-[var(--success-soft)] px-4 py-3 text-sm font-semibold text-[var(--success)]"
        >
          {notice}
        </div>
      )}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          className="field sm:max-w-sm"
          placeholder="Search team accounts"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="button button-primary sm:ml-auto"
          onClick={() => setOpen(!open)}
        >
          <Plus className="size-4" />
          Add account
        </button>
      </div>
      {open && (
        <form
          onSubmit={add}
          className="panel mb-5 grid gap-3 p-5 md:grid-cols-4"
        >
          <input
            className="field"
            name="name"
            placeholder="Full name"
            required
          />
          <select className="field" name="role" value={accountRole} onChange={(event) => setAccountRole(event.target.value as AccountRole)}>
            <option value="employee">Crew</option>
            <option value="manager">Manager</option>
          </select>
          <input
            className="field"
            name="username"
            autoComplete="off"
            placeholder="Username"
            minLength={3}
            maxLength={30}
            pattern="[A-Za-z0-9._-]+"
            required
          />
          <input
            className="field"
            name="password"
            type="password"
            placeholder="Temporary password"
            minLength={8}
            required
          />
          {accountRole === "employee" && <input
            className="field"
            name="position"
            placeholder="Position"
            required
          />}
          {accountRole === "employee" && <select className="field" name="classification">
            <option>FreeSched</option>
            <option>Working Student</option>
          </select>}
          {error && <p role="alert" className="rounded-xl bg-[var(--danger-soft)] p-3 text-sm font-semibold text-[var(--danger)] md:col-span-4">{error}</p>}
          <button className="button button-primary md:col-span-4 md:w-fit">
            Create profile
          </button>
        </form>
      )}
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead className="bg-[var(--surface)] text-xs uppercase tracking-wide text-[var(--muted)]">
            <tr>
              <th className="p-4">Account</th>
              <th className="p-4">Role</th>
              <th className="p-4">Position</th>
              <th className="p-4">Classification</th>
              <th className="p-4">Preference</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {filtered.map((p, i) => (
              <tr key={p.id}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className={`avatar avatar-${(i % 3) + 1}`}>
                      {p.name
                        .split(" ")
                        .map((v) => v[0])
                        .join("")}
                    </span>
                    <div>
                      <p className="text-sm font-bold">{p.name}</p>
                      <p className="text-xs text-[var(--muted)]">@{p.username ?? "username not set"}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4"><Badge tone={p.role === "manager" ? "brand" : "neutral"}>{p.role === "employee" ? "crew" : "manager"}</Badge></td>
                <td className="p-4 text-sm">{p.position}</td>
                <td className="p-4">
                  {p.role === "employee" ? <Badge
                    tone={
                      p.classification === "Working Student"
                        ? "brand"
                        : "neutral"
                    }
                  >
                    {p.classification}
                  </Badge> : <span className="text-sm text-[var(--muted)]">—</span>}
                </td>
                <td className="p-4 text-sm text-[var(--muted)]">
                  {p.role === "employee" ? p.preferredPeriod ?? "Flexible" : "—"}
                </td>
                <td className="p-4">
                  <Badge tone={p.active ? "success" : "neutral"}>{p.active ? "Active" : "Inactive"}</Badge>
                </td>
                <td className="p-4"><AccountActions person={p} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
