/**
 * @fileoverview Sign-up service definition and runtime.
 *
 * Defines the Effect.Service for sign-up operations and constructs the atom runtime
 * with all required dependencies. The service exposes handler accessors for email
 * sign-up and integrates with the ReCaptcha layer.
 *
 * @module @beep/iam-client/sign-up/service
 * @category SignUp
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Group, layer } from "./layer.ts";

const $I = $IamClientId.create("sign-up/service");

/**
 * Sign-up service providing access to email registration handlers.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Service } from "@beep/iam-client/sign-up"
 *
 * const program = Effect.gen(function* () {
 *   const service = yield* Service
 *   const result = yield* service.Email({ email: "user@example.com", password: "secret" })
 * })
 * ```
 *
 * @category SignUp/Services
 * @since 0.1.0
 */
export class Service extends Effect.Service<Service>()($I`Service`, {
  accessors: true,
  effect: Group.accessHandlers("Email"),
}) {}

/**
 * Atom runtime for sign-up operations with all dependencies provided.
 *
 * Composes the sign-up service layer with ReCaptcha and provides a runtime
 * suitable for atom-based reactive flows.
 *
 * @example
 * ```typescript
 * import { runtime } from "@beep/iam-client/sign-up"
 * import * as F from "effect/Function"
 *
 * const myAtom = runtime.fn(
 *   F.flow(Service.Email, Effect.asVoid)
 * )
 * ```
 *
 * @category SignUp/Runtime
 * @since 0.1.0
 */
export const runtime = Common.makeAtomRuntime(Service.Default.pipe(Layer.provide(layer)));
