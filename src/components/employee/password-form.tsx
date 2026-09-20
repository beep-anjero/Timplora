"use client";

import { useState } from "react";
import { changeOwnPassword } from "@/app/actions/employees";

export function PasswordForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setMessage(""); setError("");
    const form = event.currentTarget;
    const result = await changeOwnPassword(new FormData(form));
    setSaving(false);
    if (!result.ok) { setError(result.error ?? "Password could not be changed."); return; }
    form.reset();
    setMessage("Password changed successfully.");
  }

  return <section className="panel mt-6 p-5 sm:p-6"><h2 className="font-display text-xl font-bold">Change password</h2><p className="mt-1 text-sm text-[var(--muted)]">Replace the temporary password provided by your manager.</p>{message && <p role="status" className="mt-4 rounded-xl bg-[var(--success-soft)] p-3 text-sm font-semibold text-[var(--success)]">{message}</p>}{error && <p role="alert" className="mt-4 rounded-xl bg-[var(--danger-soft)] p-3 text-sm font-semibold text-[var(--danger)]">{error}</p>}<form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><label className="label" htmlFor="currentPassword">Current password</label><input className="field" id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required /></div><div><label className="label" htmlFor="newPassword">New password</label><input className="field" id="newPassword" name="newPassword" type="password" minLength={8} autoComplete="new-password" required /></div><div><label className="label" htmlFor="confirmation">Confirm new password</label><input className="field" id="confirmation" name="confirmation" type="password" minLength={8} autoComplete="new-password" required /></div><button disabled={saving} className="button button-primary sm:w-fit" type="submit">{saving ? "Changing…" : "Change password"}</button></form></section>;
}
