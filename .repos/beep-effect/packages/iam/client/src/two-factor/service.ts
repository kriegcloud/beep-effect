/**
 * @fileoverview
 * Effect service providing two-factor handlers via dependency injection.
 *
 * This service exposes Enable and Disable handlers.
 * Submodule handlers (Backup, OTP, TOTP) have their own dedicated services.
 *
 * @module @beep/iam-client/two-factor/service
 * @category TwoFactor
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Group, layer } from "./layer.ts";

const $I = $IamClientId.create("two-factor/service");

/**
 * Effect service exposing top-level two-factor handlers.
 *
 * @example
 * ```typescript
 * import { TwoFactor } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const twoFactor = yield* TwoFactor.Service
 *   yield* twoFactor.Enable({ password: Redacted.make("pass") })
 * })
 * ```
 *
 * @category TwoFactor
 * @since 0.1.0
 */
export class Service extends Effect.Service<Service>()($I`Service`, {
  accessors: true,
  effect: Group.accessHandlers("Enable", "Disable"),
}) {}

/**
 * Atom runtime configured with two-factor service layer and dependencies.
 *
 * @category TwoFactor
 * @since 0.1.0
 */
export const runtime = Common.makeAtomRuntime(Service.Default.pipe(Layer.provide(layer)));
