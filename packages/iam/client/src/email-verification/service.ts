/**
 * @fileoverview
 * Effect service providing email verification handlers via dependency injection.
 *
 * Defines the Effect.Service for email verification operations and constructs the atom runtime
 * with all required dependencies. The service exposes handler accessors for send verification.
 *
 * @module @beep/iam-client/email-verification/service
 * @category EmailVerification
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Group, layer } from "./layer.ts";

const $I = $IamClientId.create("email-verification/service");

/**
 * Effect service exposing email verification handlers.
 *
 * @example
 * ```typescript
 * import { EmailVerification } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const emailVerification = yield* EmailVerification.Service
 *   yield* emailVerification.SendVerification({ email: "user@example.com" })
 * })
 * ```
 *
 * @category EmailVerification/Services
 * @since 0.1.0
 */
export class Service extends Effect.Service<Service>()($I`Service`, {
  accessors: true,
  effect: Group.accessHandlers("SendVerification"),
}) {}

/**
 * Atom runtime configured with email verification service layer and dependencies.
 *
 * @example
 * ```typescript
 * import { EmailVerification } from "@beep/iam-client"
 *
 * const myAtom = EmailVerification.runtime.fn(() => {
 *   // Atom logic with email verification service available
 * })
 * ```
 *
 * @category EmailVerification/Runtime
 * @since 0.1.0
 */
export const runtime = Common.makeAtomRuntime(Service.Default.pipe(Layer.provide(layer)));
