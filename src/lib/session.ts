import "server-only";

import { createHash, randomBytes } from "crypto";
import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/definitions";

const COOKIE_NAME = "session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error("SESSION_SECRET environment variable is not set.");
}
const encodedKey = new TextEncoder().encode(secretKey);

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(
  session: string | undefined,
): Promise<SessionPayload | null> {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const rawToken = randomBytes(32).toString("hex");

  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent") ?? undefined;
  const ipAddress =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;

  const record = await prisma.session.create({
    data: {
      userId,
      tokenHash: sha256(rawToken),
      expiresAt,
      userAgent,
      ipAddress,
    },
  });

  const jwt = await encrypt({
    userId,
    sessionId: record.id,
    expiresAt: expiresAt.toISOString(),
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = await decrypt(token);

  if (payload?.sessionId) {
    await prisma.session
      .delete({ where: { id: payload.sessionId } })
      .catch(() => undefined);
  }

  cookieStore.delete(COOKIE_NAME);
}
