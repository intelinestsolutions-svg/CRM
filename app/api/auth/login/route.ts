import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  authSetupError,
  createSessionToken,
  isValidAdminEmail,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  for (const [key, value] of attempts) {
    if (value.resetAt <= now) attempts.delete(key);
  }
  const current = attempts.get(ip);
  return Boolean(current && current.count >= MAX_ATTEMPTS && current.resetAt > now);
}

function recordFailure(ip: string): void {
  const now = Date.now();
  const current = attempts.get(ip);
  if (!current || current.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  current.count += 1;
}

export async function POST(request: Request) {
  const setupError = authSetupError();
  if (setupError) {
    return NextResponse.json({ error: setupError }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    email?: unknown;
    password?: unknown;
  };
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const rateLimitKey = `${clientIp(request)}:${email.toLowerCase() || "unknown"}`;

  if (isRateLimited(rateLimitKey)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 },
    );
  }

  const storedHash = process.env.ADMIN_PASSWORD_HASH as string;

  if (!isValidAdminEmail(email) || !(await verifyPassword(password, storedHash))) {
    recordFailure(rateLimitKey);
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  attempts.delete(rateLimitKey);
  const secret = process.env.ADMIN_SESSION_SECRET as string;
  const token = await createSessionToken(secret);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, sessionCookieOptions);
  return response;
}
