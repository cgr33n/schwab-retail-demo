"use client";

import { useEffect, useState } from "react";
import { relativeTime } from "@/lib/dates";

type Notification = {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
};

export default function Header({ userName }: { userName: string }) {
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications ?? []))
      .catch(() => {});
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllRead" }),
    });
    const data = await res.json();
    if (data.notifications) setNotifications(data.notifications);
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="topbar">
      <form className="search" action="/search" method="GET">
        <input
          type="search"
          name="q"
          placeholder="Search accounts, news, symbols…"
          aria-label="Search"
        />
      </form>

      <div className="topbar-right">
        <div className="bell-wrap">
          <button
            className="bell"
            onClick={() => setBellOpen(!bellOpen)}
            aria-label="Notifications"
            type="button"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          {unread > 0 && <span className="bell-badge">{unread}</span>}

          {bellOpen && (
            <div className="bell-menu">
              <div className="bell-menu-head">
                Notifications
                <a onClick={markAllRead}>Mark all read</a>
              </div>
              {notifications.length === 0 && (
                <div className="bell-item muted">You&apos;re all caught up.</div>
              )}
              {notifications.map((n) => (
                <div key={n.id} className={n.read ? "bell-item" : "bell-item unread"}>
                  <div className="bell-item-title">{n.title}</div>
                  <div className="bell-item-body">{n.body}</div>
                  <div className="bell-item-date">{relativeTime(n.date)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="user-chip">
          <span className="avatar">{initials}</span>
          <span className="user-name">{userName}</span>
        </div>

        <button className="btn btn-ghost" onClick={signOut} type="button">
          Sign out
        </button>
      </div>
    </header>
  );
}
