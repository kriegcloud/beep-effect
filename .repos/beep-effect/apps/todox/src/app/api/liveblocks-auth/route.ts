import { serverEnv } from "@beep/shared-env/ServerEnv";
import { Liveblocks } from "@liveblocks/node";
import * as A from "effect/Array";
import * as Either from "effect/Either";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { NextRequest } from "next/server";

const liveblocks = new Liveblocks({
  secret: Redacted.value(serverEnv.liveblocks.secretKey),
});

export const dynamic = "force-dynamic";

const AVATAR_COLORS = ["#D583F0", "#F08385", "#F0D885", "#85EED6", "#85BBF0", "#8594F0", "#85DBF0", "#87EE85"] as const;

const BetterAuthSessionResponse = S.Struct({
  user: S.Struct({
    id: S.String,
    name: S.NullOr(S.String),
    email: S.NullOr(S.String),
    image: S.NullOr(S.String),
  }),
});

// Generate consistent hash from string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Generate consistent color from user ID using hash
function generateUserColor(userId: string): string {
  const index = hashString(userId) % AVATAR_COLORS.length;
  return F.pipe(
    A.get(AVATAR_COLORS, index),
    O.getOrElse(() => AVATAR_COLORS[0])
  );
}

// Get avatar URL with fallback
function getAvatarUrl(image: string | null | undefined, userId: string): string {
  return F.pipe(
    O.fromNullable(image),
    O.getOrElse(() => {
      const avatarNum = (hashString(userId) % 8) + 1;
      return `https://liveblocks.io/avatars/avatar-${avatarNum}.png`;
    })
  );
}

// Derive display name from user, with fallback chain
function getDisplayName(user: { name?: string | null; email?: string | null }): string {
  return F.pipe(
    O.fromNullable(user.name),
    O.orElse(() =>
      F.pipe(
        O.fromNullable(user.email),
        O.flatMap((email) => A.head(Str.split(email, "@")))
      )
    ),
    O.getOrElse(() => "Anonymous")
  );
}

export async function POST(request: NextRequest) {
  const cookie = request.headers.get("cookie");

  // Early check for session cookie presence
  if (!cookie || !cookie.includes("better-auth.session_token")) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const sessionUrl = new URL("/api/v1/auth/get-session", serverEnv.app.api.url);
    const sessionResponse = await fetch(sessionUrl, {
      method: "GET",
      headers: { cookie },
      cache: "no-store",
    });

    if (!sessionResponse.ok) {
      return new Response("Unauthorized", { status: 401 });
    }

    const rawSession: unknown = await sessionResponse.json();
    const parsedSession = S.decodeUnknownEither(BetterAuthSessionResponse)(rawSession);

    if (Either.isLeft(parsedSession)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { user } = parsedSession.right;

    // Map to Liveblocks UserMeta
    const userMeta = {
      id: user.id,
      info: {
        name: getDisplayName(user),
        avatar: getAvatarUrl(user.image, user.id),
        color: generateUserColor(user.id),
      },
    };

    // Create Liveblocks session
    const liveblocksSession = liveblocks.prepareSession(userMeta.id, {
      userInfo: userMeta.info,
    });

    liveblocksSession.allow("liveblocks:playground:*", liveblocksSession.FULL_ACCESS);

    const { body, status } = await liveblocksSession.authorize();

    return new Response(body, { status });
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }
}
