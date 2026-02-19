import { env } from "@beep/notes/env";
import { UserRole } from "@beep/notes/generated/prisma/client";
import { generateFromUsername, generateUsername } from "@beep/notes/lib/generateFromUsername";
import { nid } from "@beep/notes/lib/nid";
import { prisma } from "@beep/notes/server/db";

export const findOrCreateUser = async ({
  // bio,
  email,
  firstName,
  lastName,
  // location,
  name,
  profileImageUrl,
  providerId,
  providerUserId,
  username,
  // x,
}: {
  readonly email: string;
  readonly providerId: "github" | "google";
  readonly providerUserId: string;
  readonly bio?: undefined | string;
  readonly firstName?: undefined | string;
  readonly github?: undefined | string;
  readonly lastName?: undefined | string;
  readonly location?: undefined | string;
  readonly name?: undefined | string;
  readonly profileImageUrl?: undefined | string;
  readonly username?: undefined | string;
  readonly x?: undefined | string;
}) => {
  const existingUser = await prisma.user.findFirst({
    select: {
      id: true,
      oauthAccounts: {
        where: {
          providerId,
          providerUserId,
        },
      },
    },
    where: {
      email,
    },
  });

  // existing user with that email (could be another oauth account)
  if (existingUser) {
    if (existingUser.oauthAccounts.length === 0) {
      // link oauth account
      await prisma.oauthAccount.create({
        data: {
          id: nid(),
          providerId,
          providerUserId,
          userId: existingUser.id,
        },
      });
    }

    return {
      id: existingUser.id,
    };
  }

  const invalidUsername = !username || (await prisma.user.count({ where: { username } })) > 0;

  // new user, check for available username
  if (invalidUsername) {
    let usernameIdSize = 3;

    let retry = 10;

    while (retry > 0) {
      retry -= 1;
      usernameIdSize += 1;

      username = generateFromUsername(name ?? generateUsername(), usernameIdSize);

      const existingRandomUsername = await prisma.user.count({
        where: { username },
      });

      if (!existingRandomUsername) {
        break;
      }
    }
  }

  // await resend.emails.send({
  //   from:
  //     process.env.NODE_ENV === 'development'
  //       ? 'Todox <onboarding@resend.dev>'
  //       : 'Todox <ziad.beyens@gmail.com>',
  //   to:
  //     process.env.NODE_ENV === 'development'
  //       ? 'delivered@resend.dev'
  //       : email,
  //   subject: 'Welcome to Todox!',
  //   react: WelcomeEmail({
  //     name: googleUser.given_name as string,
  //   }),
  //   // Set this to prevent Gmail from threading emails.
  //   // More info: https://resend.com/changelog/custom-email-headers
  //   headers: {
  //     'X-Entity-Ref-ID': Date.now() + '',
  //   },
  // });

  const createData: any = {
    id: nid(),
    email,
    oauthAccounts: {
      create: {
        id: nid(),
        providerId,
        providerUserId,
      },
    },
    role: env.SUPERADMIN === email ? UserRole.SUPERADMIN : UserRole.USER,
    username: username!,
  };
  if (firstName !== undefined) createData.firstName = firstName ?? null;
  if (lastName !== undefined) createData.lastName = lastName ?? null;
  if (name !== undefined) createData.name = name ?? null;
  if (profileImageUrl !== undefined) createData.profileImageUrl = profileImageUrl ?? null;

  const user = await prisma.user.create({
    data: createData,
    select: {
      id: true,
    },
  });

  await prisma.document.createMany({
    data: [
      {
        id: nid(),
        icon: "🔗",
        templateId: "link",
        title: "Link",
        userId: user.id,
      },
      {
        id: nid(),
        icon: "👤",
        templateId: "mention",
        title: "Mention",
        userId: user.id,
      },
      {
        id: nid(),
        icon: "🌳",
        templateId: "playground",
        title: "Playground",
        userId: user.id,
      },
      {
        id: nid(),
        icon: "🧠",
        templateId: "ai",
        title: "AI",
        userId: user.id,
      },
      {
        id: nid(),
        icon: "🤖",
        templateId: "copilot",
        title: "Copilot",
        userId: user.id,
      },
      {
        id: nid(),
        icon: "📢",
        templateId: "callout",
        title: "Callout",
        userId: user.id,
      },
      {
        id: nid(),
        icon: "🧮",
        templateId: "equation",
        title: "Equation",
        userId: user.id,
      },
      {
        id: nid(),
        icon: "📤",
        templateId: "upload",
        title: "Upload",
        userId: user.id,
      },
      {
        id: nid(),
        icon: "/",
        templateId: "slash-menu",
        title: "Slash Menu",
        userId: user.id,
      },
      {
        id: nid(),
        icon: "📋",
        templateId: "context-menu",
        title: "Context Menu",
        userId: user.id,
      },
      {
        id: nid(),
        icon: "🧰",
        templateId: "floating-toolbar",
        title: "Floating Toolbar",
        userId: user.id,
      },
      {
        id: nid(),
        icon: "🎮",
        templateId: "media-toolbar",
        title: "Media Toolbar",
        userId: user.id,
      },
      {
        id: nid(),
        icon: "📚",
        templateId: "table-of-contents",
        title: "Table of Contents",
        userId: user.id,
      },
    ],
  });

  return user;
};
