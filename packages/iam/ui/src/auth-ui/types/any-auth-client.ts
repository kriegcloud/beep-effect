import type { createAuthClient } from "better-auth/react";

export type AnyAuthClient = Omit<ReturnType<typeof createAuthClient>, "signUp" | "getSession">;
