import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { makeSessionToken, PENDING_COOKIE, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const pending = (await cookies()).get(PENDING_COOKIE)?.value;
  const body = await req.json().catch(() => null);
  const code = (body as { code?: string })?.code;

  if (!pending) {
    return NextResponse.json(
      { error: "Your sign-in session expired. Please start over." },
      { status: 400 }
    );
  }
  if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "Enter the 6-digit security code we sent to your phone." },
      { status: 400 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, makeSessionToken("user_connor"), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  res.cookies.delete(PENDING_COOKIE);
  return res;
}
