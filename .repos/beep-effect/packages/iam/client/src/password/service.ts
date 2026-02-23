/**
 * @fileoverview
 * Effect service providing password handlers via dependency injection.
 *
 * Defines the Effect.Service for password operations and constructs the atom runtime
 * with all required dependencies. The service exposes handler accessors for change,
 * request-reset, and reset.
 *
 * @module @beep/iam-client/password/service
 * @category Password
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Group, layer } from "./layer.ts";

const $I = $IamClientId.create("password/service");

/**
 * Effect service exposing password handlers.
 *
 * @example
 * ```typescript
 * import { Password } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const password = yield* Password.Service
 *   yield* password.Change({
 *     currentPassword: Redacted.make("old"),
 *     newPassword: Redacted.make("new")
 *   })
 * })
 * ```
 *
 * @category Password/Services
 * @since 0.1.0
 */
export class Service extends Effect.Service<Service>()($I`Service`, {
  accessors: true,
  effect: Group.accessHandlers("Change", "RequestReset", "Reset"),
}) {}

/**
 * Atom runtime configured with password service layer and dependencies.
 *
 * @example
 * ```typescript
 * import { Password } from "@beep/iam-client"
 *
 * const myAtom = Password.runtime.fn(() => {
 *   // Atom logic with password service available
 * })
 * ```
 *
 * @category Password/Runtime
 * @since 0.1.0
 */
export const runtime = Common.makeAtomRuntime(Service.Default.pipe(Layer.provide(layer)));
