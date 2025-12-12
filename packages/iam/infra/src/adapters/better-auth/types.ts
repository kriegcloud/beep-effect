import type { authServiceEffect } from "@beep/iam-infra/adapters";
import type * as Effect from "effect/Effect";

export type Auth = Effect.Effect.Success<typeof authServiceEffect>["auth"];
