import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStore } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ notifications: getStore().notifications });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if ((body as { action?: string })?.action !== "markAllRead") {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  const store = getStore();
  store.notifications.forEach((n) => {
    n.read = true;
  });
  return NextResponse.json({ notifications: store.notifications });
}
