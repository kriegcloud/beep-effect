import type { BetterAuthPlugin } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const makeNextCookiesPlugin = () => nextCookies() satisfies BetterAuthPlugin;
