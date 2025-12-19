import type * as Effect from "effect/Effect";
import type { AuthEffect } from "./Options";

export type Auth = Effect.Effect.Success<typeof AuthEffect>;
