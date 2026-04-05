export const ADMIN_SESSION_COOKIE_NAME = "admin_session";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const textEncoder = new TextEncoder();

type AdminSessionPayload = {
  sub: "admin";
  exp: number;
};

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("ADMIN_PASSWORD is not configured.");
  }

  return password;
}

function getAdminSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD;

  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET or ADMIN_PASSWORD must be configured.",
    );
  }

  return secret;
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);

  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function createSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(getAdminSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(value: string) {
  const key = await createSigningKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(value),
  );

  return bytesToBase64Url(new Uint8Array(signature));
}

function encodePayload(payload: AdminSessionPayload) {
  return bytesToBase64Url(textEncoder.encode(JSON.stringify(payload)));
}

function decodePayload(value: string): AdminSessionPayload | null {
  try {
    return JSON.parse(new TextDecoder().decode(base64UrlToBytes(value)));
  } catch {
    return null;
  }
}

export async function verifyAdminPassword(password: string) {
  const expectedPassword = getAdminPassword();

  if (expectedPassword.startsWith("$2")) {
    const { default: bcrypt } = await import("bcrypt");
    return bcrypt.compare(password, expectedPassword);
  }

  return safeEqual(password, expectedPassword);
}

export async function createAdminSessionToken() {
  const payload: AdminSessionPayload = {
    sub: "admin",
    exp: Date.now() + SESSION_DURATION_MS,
  };

  const encodedPayload = encodePayload(payload);
  const signature = await sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(token?: string | null) {
  if (!token) {
    return false;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = await sign(encodedPayload);

  if (!safeEqual(signature, expectedSignature)) {
    return false;
  }

  const payload = decodePayload(encodedPayload);

  if (!payload || payload.sub !== "admin" || payload.exp <= Date.now()) {
    return false;
  }

  return true;
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
  };
}

export function getClearedAdminSessionCookieOptions() {
  return {
    ...getAdminSessionCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  };
}
