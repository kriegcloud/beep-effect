import { auth } from "@beep/notes/components/auth/rsc/auth";

import type { AppRouter } from "@beep/notes/server/api/root";
import { createCaller } from "@beep/notes/server/api/root";
import { createTRPCContext } from "@beep/notes/server/api/trpc";
import type { AuthUser } from "@beep/notes/server/auth/getAuthUser";
import type { AuthSession } from "@beep/notes/server/auth/lucia";
import { createQueryClient } from "@beep/notes/trpc/query-client";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies, headers } from "next/headers";
import { cache } from "react";

/**
 * This wraps the `createTRPCContext` helper and provides the required context
 * for the tRPC API when handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");
  const { session, user } = await auth();

  const contextOpts: {
    readonly headers: Headers;
    readonly session: AuthSession | null;
    readonly user: AuthUser | null;
    readonly cookies?: undefined | RequestCookie[];
  } = {
    headers: heads,
    session,
    user,
  };

  if (process.env.NODE_ENV !== "production") {
    const cooks = (await cookies()).getAll();
    return createTRPCContext({
      ...contextOpts,
      cookies: cooks,
    });
  }

  return createTRPCContext(contextOpts);
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const helpers: ReturnType<typeof createHydrationHelpers<AppRouter>> = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient
);
export const trpc: ReturnType<typeof createHydrationHelpers<AppRouter>>["trpc"] = helpers.trpc;

export const HydrateClient = helpers.HydrateClient;
