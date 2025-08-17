import type { BetterAuthOptions } from "better-auth";

export const makeOptions = (
  options: BetterAuthOptions,
) =>
  ({

    ...options,
  } satisfies BetterAuthOptions);
