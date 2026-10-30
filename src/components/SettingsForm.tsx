"use client";

import { useState } from "react";

type User = {
  name: string;
  email: string;
  paperless: boolean;
  alerts: boolean;
};

export default function SettingsForm({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [paperless, setPaperless] = useState(user.paperless);
  const [alerts, setAlerts] = useState(user.alerts);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, paperless, alerts }),
      });
      if (res.ok) {
        setSaved(true);
      }
    } finally {
      setBusy(false);
    }
  }

  async function signOutEverywhere() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <form onSubmit={save} className="card" style={{ maxWidth: 560 }}>
      {saved && <div className="form-success">Settings saved.</div>}

      <div className="field">
        <label htmlFor="name">Display name</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" value={user.email} readOnly className="muted" />
        <p className="foot-note">Demo accounts can&apos;t change their email address.</p>
      </div>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={paperless}
          onChange={(e) => setPaperless(e.target.checked)}
        />
        <span>
          Paperless statements
          <div className="muted" style={{ fontSize: 12 }}>
            Get notified when a new statement is ready instead of receiving paper mail.
          </div>
        </span>
      </label>

      <label className="checkbox-row">
        <input type="checkbox" checked={alerts} onChange={(e) => setAlerts(e.target.checked)} />
        <span>
          Security alerts
          <div className="muted" style={{ fontSize: 12 }}>
            New sign-ins, transfer confirmations, and unusual activity.
          </div>
        </span>
      </label>

      <div className="row mt-16">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "20px 0" }} />

      <div className="spread">
        <div>
          <strong>Two-step verification</strong>
          <div className="muted" style={{ fontSize: 12 }}>
            Enabled for this demo (any 6-digit code works).
          </div>
        </div>
        <span className="badge badge-success">On</span>
      </div>

      <div className="spread mt-16">
        <div>
          <strong>Sessions</strong>
          <div className="muted" style={{ fontSize: 12 }}>
            Sign out of all devices.
          </div>
        </div>
        <button className="btn btn-danger btn-sm" onClick={signOutEverywhere} type="button">
          Sign out everywhere
        </button>
      </div>
    </form>
  );
}
