"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS: { label: string; items: { href: string; label: string }[] }[] = [
  { label: "Overview", items: [{ href: "/dashboard", label: "Dashboard" }] },
  { label: "Accounts", items: [{ href: "/accounts", label: "Accounts & positions" }] },
  {
    label: "Banking",
    items: [
      { href: "/banking", label: "Checking & savings" },
      { href: "/transfers", label: "Transfers" },
      { href: "/statements", label: "Statements" },
      { href: "/card", label: "Debit cards" },
    ],
  },
  {
    label: "Research",
    items: [
      { href: "/markets", label: "Markets" },
      { href: "/news", label: "News" },
      { href: "/research", label: "Screener" },
      { href: "/learn", label: "Learning center" },
    ],
  },
  { label: "You", items: [{ href: "/settings", label: "Settings" }] },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">S</div>
        <div>
          <div className="brand-name">Schwab</div>
          <div className="brand-sub">Retail Demo</div>
        </div>
      </div>

      <nav>
        {SECTIONS.map((section) => (
          <div key={section.label} className="nav-section">
            <div className="nav-label">{section.label}</div>
            {section.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "nav-link active" : "nav-link"}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        {/* TODO: remove this before the demo */}
        <Link href="/debug" className="nav-link debug-link">
          Debug (internal)
        </Link>
        <p className="sidebar-note">
          Demo environment. Not affiliated with Charles Schwab &amp; Co. All data is fictional.
        </p>
      </div>
    </aside>
  );
}
