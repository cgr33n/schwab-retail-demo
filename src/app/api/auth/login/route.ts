import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEMO_PASSWORD, DEMO_USERNAME, PENDING_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { username, password } = body ?? {};

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username.trim().toLowerCase() !== DEMO_USERNAME ||
    password !== DEMO_PASSWORD
  ) {
    // deliberately vague so we don't reveal which field was wrong
    return NextResponse.json(
      { error: "The username or password you entered is incorrect." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true, requiresCode: true });
  res.cookies.set(PENDING_COOKIE, username.trim().toLowerCase(), {
    httpOnly: true,
    maxAge: 300, // 5 min to finish the second step
    path: "/",
  });
  return res;
}
