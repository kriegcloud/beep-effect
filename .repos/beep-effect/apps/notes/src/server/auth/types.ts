import type { AuthUser } from "./getAuthUser";
import type { AuthSession } from "./lucia";

export type AuthCtx = {
  readonly session: AuthSession | null;
  readonly user: AuthUser | null;
  readonly userId: string | null;
};
