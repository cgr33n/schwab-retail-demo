import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE = "schwab_demo_session";
export const PENDING_COOKIE = "schwab_demo_mfa";

// demo credentials. a real deployment would obviously never do it this way.
export const DEMO_USERNAME = "connor.demo";
export const DEMO_PASSWORD = "Demo!2026";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export type Session = { userId: string };

export function makeSessionToken(userId: string): string {
  const payload = { userId, exp: Date.now() + SESSION_TTL_MS };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export async function getSession(): Promise<Session | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const payload = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
    if (!payload.userId || payload.exp < Date.now()) return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
