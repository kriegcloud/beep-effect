import type { AuthUser } from "./getAuthUser";
import type { AuthSession } from "./lucia";

export type AuthCtx = {
  session: AuthSession | null;
  user: AuthUser | null;
  userId: string | null;
};
