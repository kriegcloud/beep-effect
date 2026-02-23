/**
 * @fileoverview
 * Effect service providing sign-in handlers via dependency injection.
 *
 * Defines the Effect.Service for sign-in operations and constructs the atom runtime
 * with all required dependencies. The service exposes handler accessors for email
 * and username sign-in and integrates with the ReCaptcha layer.
 *
 * @module @beep/iam-client/sign-in/service
 * @category SignIn
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Group, layer } from "./layer.ts";

const $I = $IamClientId.create("sign-in/service");

/**
 * Effect service exposing sign-in handlers for email and username authentication.
 *
 * @example
 * ```typescript
 * import { SignIn } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const signIn = yield* SignIn.Service
 *   yield* signIn.Email({ email: "user@example.com", password: "secret" })
 * })
 * ```
 *
 * @category SignIn/Services
 * @since 0.1.0
 */
export class Service extends Effect.Service<Service>()($I`Service`, {
  accessors: true,
  effect: Group.accessHandlers("Email", "Username"),
}) {}

/**
 * Atom runtime configured with sign-in service layer and dependencies.
 *
 * @example
 * ```typescript
 * import { SignIn } from "@beep/iam-client"
 *
 * const myAtom = SignIn.runtime.fn(() => {
 *   // Atom logic with sign-in service available
 * })
 * ```
 *
 * @category SignIn/Runtime
 * @since 0.1.0
 */
export const runtime = Common.makeAtomRuntime(Service.Default.pipe(Layer.provide(layer)));
