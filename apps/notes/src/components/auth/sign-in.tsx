import { generateRandomToken } from "@beep/notes/server/auth/crypto";
import { createSession } from "@beep/notes/server/auth/lucia";
import { createSessionCookie } from "@beep/notes/server/auth/session-cookie";
import { prisma } from "@beep/notes/server/db";
import { verify } from "@node-rs/argon2";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { signUp } from "./sign-up";

export async function signIn(
  formData: FormData
): Promise<{ error?: string; code?: number; data?: null; message?: string } | never> {
  "use server";

  const username = formData.get("username");

  if (typeof username !== "string" || username.length < 3 || username.length > 31 || !/^[\d_a-z-]+$/.test(username)) {
    return {
      error: "Invalid username",
    };
  }

  const password = formData.get("password");

  if (typeof password !== "string" || password.length < 6 || password.length > 255) {
    return {
      error: "Invalid password",
    };
  }

  const existingUser = await prisma.user.findUnique({
    select: {
      id: true,
      password_hash: true,
    },
    where: {
      username: username.toLowerCase(),
    },
  });

  if (!existingUser) {
    // If user doesn't exist, automatically sign them up
    return signUp(formData);
  }
  if (!existingUser.password_hash)
    return {
      error: "Incorrect username or password",
    };

  const validPassword = await verify(existingUser.password_hash, password, {
    memoryCost: 19_456,
    outputLen: 32,
    parallelism: 1,
    timeCost: 2,
  });

  if (!validPassword) {
    return {
      error: "Incorrect username or password",
    };
  }

  const requestHeaders = headers();

  const ip = (await requestHeaders).get("X-Forwarded-For") ?? "127.0.0.1";
  const userAgent = (await requestHeaders).get("user-agent");

  const sessionToken = generateRandomToken();
  const session = await createSession(sessionToken, existingUser.id, {
    ipAddress: ip,
    userAgent: userAgent,
  });

  const sessionCookie = createSessionCookie(sessionToken, session.expires_at);
  (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  return redirect("/");
}
