"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// two-step sign in: credentials, then a (fake) security code.
export default function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitCredentials(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
      } else {
        setStep(2);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
      } else {
        router.replace("/dashboard");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-card">
      <div className="login-logo">
        <div className="brand-mark">S</div>
        <div>
          <div className="brand-name" style={{ color: "var(--navy)" }}>Schwab</div>
          <div className="brand-sub">Retail Demo</div>
        </div>
      </div>

      {step === 1 ? (
        <>
          <h1 style={{ marginBottom: 4 }}>Sign in</h1>
          <p className="login-sub">Access your demo accounts</p>
          <form onSubmit={submitCredentials}>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button className="btn btn-primary w-full" disabled={busy} type="submit">
              {busy ? "Checking…" : "Continue"}
            </button>
          </form>
          <p className="muted mt-16" style={{ fontSize: 12.5 }}>
            <a href="#" title="Not wired up in the demo" onClick={(e) => e.preventDefault()}>
              Forgot password?
            </a>
          </p>
        </>
      ) : (
        <>
          <h1 style={{ marginBottom: 4 }}>Security code</h1>
          <p className="login-sub">
            We sent a 6-digit code to the phone ending in •• 34. It expires in 10 minutes.
          </p>
          <form onSubmit={submitCode}>
            <div className="field">
              <label htmlFor="code">Enter code</label>
              <input
                id="code"
                className="code-input"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                autoFocus
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button className="btn btn-primary w-full" disabled={busy} type="submit">
              {busy ? "Verifying…" : "Verify"}
            </button>
          </form>
          <p className="muted mt-16" style={{ fontSize: 12.5 }}>
            <a onClick={() => { setStep(1); setCode(""); setError(null); }} href="#">
              Use a different ID
            </a>
          </p>
        </>
      )}

      <div className="demo-hint">
        <strong>Demo credentials</strong>
        <div>
          username <code>connor.demo</code> · password <code>Demo!2026</code>
        </div>
        <div>
          security code: <code>any 6 digits</code> (e.g. 123456)
        </div>
      </div>
    </div>
  );
}
