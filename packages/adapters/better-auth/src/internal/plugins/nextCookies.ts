import type {BetterAuthPlugin} from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const makeMultiSessionPlugin = () =>
  nextCookies() satisfies BetterAuthPlugin;