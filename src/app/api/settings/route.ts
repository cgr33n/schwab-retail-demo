import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const store = getStore();
  const body = await req.json().catch(() => null);
  const { name, paperless, alerts } = (body ?? {}) as {
    name?: string;
    paperless?: boolean;
    alerts?: boolean;
  };

  if (typeof name === "string" && name.trim().length > 0 && name.length < 80) {
    store.user.name = name.trim();
  }
  if (typeof paperless === "boolean") {
    store.user.paperless = paperless;
  }
  if (typeof alerts === "boolean") {
    store.user.alerts = alerts;
  }

  return NextResponse.json({ user: store.user });
}
