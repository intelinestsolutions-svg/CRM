export const ADMIN_COOKIE_NAME = "sp_admin_session";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const PBKDF2_ITERATIONS = 210_000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

export function adminEmail(): string | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return email || null;
}

export function isValidAdminEmail(email: string): boolean {
  const configured = adminEmail();
  return Boolean(configured && email.trim().toLowerCase() === configured);
}

export function authSetupError(): string | null {
  if (!adminEmail()) {
    return "Admin email is not configured. Set ADMIN_EMAIL in hPanel.";
  }
  if (!process.env.ADMIN_PASSWORD_HASH) {
    return "Admin password hash is not configured. Set ADMIN_PASSWORD_HASH in hPanel.";
  }
  if (!process.env.ADMIN_SESSION_SECRET) {
    return "Admin session secret is not configured. Set ADMIN_SESSION_SECRET in hPanel.";
  }
  return null;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 =
    value.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i += 1) difference |= a[i] ^ b[i];
  return difference === 0;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    256,
  );
  return `pbkdf2.${PBKDF2_ITERATIONS}.${bytesToBase64Url(salt)}.${bytesToBase64Url(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [algorithm, iterationsValue, saltValue, hashValue] = stored.split(".");
    if (algorithm !== "pbkdf2" || !iterationsValue || !saltValue || !hashValue) return false;

    const iterations = Number(iterationsValue);
    if (!Number.isInteger(iterations) || iterations < 100_000) return false;

    const salt = base64UrlToBytes(saltValue);
    const expected = base64UrlToBytes(hashValue);
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      key,
      expected.length * 8,
    );
    return constantTimeEqual(expected, new Uint8Array(bits));
  } catch {
    return false;
  }
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(secret: string): Promise<string> {
  const payload = {
    v: 1,
    iat: Date.now(),
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const data = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(data));
  return `${data}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  try {
    const [data, signatureValue] = token.split(".");
    if (!data || !signatureValue) return false;

    const expected = new Uint8Array(
      await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(data)),
    );
    const actual = base64UrlToBytes(signatureValue);
    if (!constantTimeEqual(expected, actual)) return false;

    const payload = JSON.parse(decoder.decode(base64UrlToBytes(data))) as {
      v?: number;
      exp?: number;
    };
    return payload.v === 1 && typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function isAdminRequest(request: Request): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;

  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`),
  );
  if (!match?.[1]) return false;

  return verifySessionToken(decodeURIComponent(match[1]), secret);
}
