import { nid } from "@beep/notes/lib/nid";
import { generateRandomToken } from "@beep/notes/server/auth/crypto";
import { createSession } from "@beep/notes/server/auth/lucia";
import { createSessionCookie } from "@beep/notes/server/auth/session-cookie";
import { prisma } from "@beep/notes/server/db";
import { hash } from "@node-rs/argon2";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData): Promise<{ code?: number; data?: null; message?: string } | never> {
  "use server";

  const username = formData.get("username");

  // username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
  // keep in mind some database (e.g. mysql) are case insensitive
  if (typeof username !== "string" || username.length < 3 || username.length > 31 || !/^[\d_a-z-]+$/.test(username)) {
    return {
      code: 201,
      data: null,
      message: "Invalid username",
    };
  }

  const password = formData.get("password");

  if (typeof password !== "string" || password.length < 6 || password.length > 255) {
    return {
      code: 201,
      data: null,
      message: "Invalid password",
    };
  }

  const passwordHash = await hash(password, {
    // recommended minimum parameters
    memoryCost: 19_456,
    outputLen: 32,
    parallelism: 1,
    timeCost: 2,
  });

  // const userId = generateIdFromEntropySize(10); // 16 characters long

  // TODO: check if username is already used

  const { id: userId } = await prisma.user.create({
    data: {
      id: nid(),
      password_hash: passwordHash,
      username: username,
    },
    select: {
      id: true,
    },
  });

  await prisma.document.createMany({
    data: [
      {
        id: nid(),
        icon: "🌳",
        templateId: "playground",
        title: "Playground",
        userId: userId,
      },
      {
        id: nid(),
        icon: "🧠",
        templateId: "ai",
        title: "AI",
        userId: userId,
      },
      {
        id: nid(),
        icon: "🤖",
        templateId: "copilot",
        title: "Copilot",
        userId: userId,
      },
      {
        id: nid(),
        icon: "📢",
        templateId: "callout",
        title: "Callout",
        userId: userId,
      },
      {
        id: nid(),
        icon: "🧮",
        templateId: "equation",
        title: "Equation",
        userId: userId,
      },
      {
        id: nid(),
        icon: "📤",
        templateId: "upload",
        title: "Upload",
        userId: userId,
      },
      {
        id: nid(),
        icon: "/",
        templateId: "slash-menu",
        title: "Slash Menu",
        userId: userId,
      },
      {
        id: nid(),
        icon: "📋",
        templateId: "context-menu",
        title: "Context Menu",
        userId: userId,
      },
      {
        id: nid(),
        icon: "🧰",
        templateId: "floating-toolbar",
        title: "Floating Toolbar",
        userId: userId,
      },
      {
        id: nid(),
        icon: "🎮",
        templateId: "media-toolbar",
        title: "Media Toolbar",
        userId: userId,
      },
      {
        id: nid(),
        icon: "📚",
        templateId: "table-of-contents",
        title: "Table of Contents",
        userId: userId,
      },
    ],
  });

  const requestHeaders = await headers();

  const ip = requestHeaders.get("X-Forwarded-For") ?? "127.0.0.1";
  const userAgent = requestHeaders.get("user-agent");

  const sessionToken = generateRandomToken();
  const session = await createSession(sessionToken, userId, {
    ipAddress: ip,
    userAgent: userAgent,
  });

  const sessionCookie = createSessionCookie(sessionToken, session.expires_at);

  (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  return redirect("/");
}
