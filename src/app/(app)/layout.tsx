import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { requireSession } from "@/lib/auth";
import { getStore } from "@/lib/db";

export const instant = false

export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireSession();
  const user = getStore().user;

  return (
    <div className="shell">
      <Sidebar />
      <div className="main">
        <Header userName={user.name} />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
