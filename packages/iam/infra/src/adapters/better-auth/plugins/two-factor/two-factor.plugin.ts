import { twoFactor } from "better-auth/plugins/two-factor";
import * as Effect from "effect/Effect";

export type TwoFactorPluginEffect = Effect.Effect<ReturnType<typeof twoFactor>, never, never>;
export type TwoFactorPlugin = Effect.Effect.Success<TwoFactorPluginEffect>;
export const twoFactorPlugin: TwoFactorPluginEffect = Effect.succeed(twoFactor());
