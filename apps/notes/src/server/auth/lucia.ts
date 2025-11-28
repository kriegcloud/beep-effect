import type { Session, User } from "@beep/notes/generated/prisma/client";

import { githubProvider } from "@beep/notes/server/auth/providers/github";
import { prisma } from "@beep/notes/server/db";

import { hashToken } from "./crypto";

const SESSION_REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 24 * 15; // 15 days
const SESSION_MAX_DURATION_MS = SESSION_REFRESH_INTERVAL_MS * 2; // 30 days

/**
 * Create a new session in the DB. We store the SHA-256 hash as the primary key
 * (id) in the `Session` table. By default, let's set expiration to 30 days from
 * now.
 */
export const createSession = async (
  sessionToken: string,
  userId: string,
  { ipAddress, userAgent }: { ipAddress?: string | null; userAgent?: string | null } = {}
) => {
  const sessionId = hashToken(sessionToken);

  const session = {
    id: sessionId,
    expires_at: new Date(Date.now() + SESSION_MAX_DURATION_MS),
    ip_address: ipAddress,
    user_agent: userAgent,
    user_id: userId,
  };

  await prisma.session.create({
    data: session,
  });

  return session;
};

export type AuthSession = Pick<Session, "expires_at" | "id" | "ip_address" | "user_agent" | "user_id">;

export type SessionUser = Pick<
  User,
  | "email"
  | "id"
  | "role"
  // | 'stripeCurrentPeriodEnd'
  // | 'stripePriceId'
  | "username"
>;

export type SessionValidationResult =
  | {
      session: AuthSession;
      user: SessionUser;
    }
  | { session: null; user: null };

/**
 * Validate a user-provided session token from cookies.
 *
 * 1. Hash the token
 * 2. Look up in DB
 * 3. Check expiration
 * 4. Optionally extend if near half-lifetime (like "fresh" logic)
 * 5. Return { session, user } or { session: null, user: null }
 */
export async function validateSessionToken(): Promise<SessionValidationResult>;

export async function validateSessionToken(sessionToken: string | null | undefined): Promise<SessionValidationResult>;

export async function validateSessionToken(sessionToken?: string | null): Promise<SessionValidationResult> {
  if (!sessionToken) {
    return { session: null, user: null };
  }

  const sessionId = hashToken(sessionToken);

  const result = await prisma.session.findUnique({
    select: {
      id: true,
      expires_at: true,
      ip_address: true,
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          // stripeCurrentPeriodEnd: true,
          // stripePriceId: true,
          username: true,
        },
      },
      user_agent: true,
      user_id: true,
    },
    where: { id: sessionId },
  });

  if (!result) {
    return { session: null, user: null };
  }

  const { user, ...session } = result;

  // Check expiration
  if (Date.now() >= session.expires_at.getTime()) {
    // Session is expired, so remove it
    await prisma.session.delete({ where: { id: session.id } });

    return { session: null, user: null };
  }
  // Extend expiration by 30 days from now if near half of the lifetime
  if (session.expires_at.getTime() - Date.now() < SESSION_REFRESH_INTERVAL_MS) {
    session.expires_at = new Date(Date.now() + SESSION_MAX_DURATION_MS);
    await prisma.session.update({
      data: { expires_at: session.expires_at },
      where: { id: session.id },
    });
  }

  return { session, user };
}

/**
 * Invalidate a session by deleting it. If you already know the hashed ID, you
 * can pass that as well.
 */
export async function invalidateSession(sessionId: string): Promise<void> {
  try {
    await prisma.session.delete({ where: { id: sessionId } });
  } catch {
    // It's already invalid or doesn't exist
  }
}

export const authProviders = {
  github: githubProvider,
  // google: googleProvider,
} as const;

export type AuthProviderConfig = {
  name: string;
  pkce?: boolean;
};
