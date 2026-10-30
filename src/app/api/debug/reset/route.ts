// nukes the in-memory store and reseeds it. useful when a demo session gets
// the data into a weird state.

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { resetStore } from "@/lib/db";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  resetStore();
  return NextResponse.json({ ok: true });
}
