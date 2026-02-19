/**
 * @fileoverview Core authentication service definition and runtime.
 *
 * Defines the Effect.Service for core authentication operations and constructs
 * the atom runtime with all required dependencies. The service exposes handler
 * accessors for sign-out and get-session operations.
 *
 * @module @beep/iam-client/core/service
 * @category Core
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Group, layer } from "./layer.ts";

const $I = $IamClientId.create("core/service");

/**
 * Core authentication service providing access to sign-out and session handlers.
 *
 * Exposes SignOut and GetSession operations as Effect.Service accessors for
 * dependency injection throughout the authentication flow.
 *
 * @example
 * ```typescript
 * import { Service } from "@beep/iam-client/core"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const session = yield* Service.GetSession()
 *   return session
 * })
 * ```
 *
 * @category Core/Services
 * @since 0.1.0
 */
export class Service extends Effect.Service<Service>()($I`Service`, {
  accessors: true,
  effect: Group.accessHandlers("SignOut", "GetSession"),
}) {}

/**
 * Atom runtime instance for reactive authentication state management.
 *
 * Provides the default Service layer pre-configured with core handlers for
 * use in React components via atoms.
 *
 * @example
 * ```typescript
 * import { runtime, Service } from "@beep/iam-client/core"
 * import * as Effect from "effect/Effect"
 *
 * const signOutAtom = runtime.fn(Service.SignOut)
 * ```
 *
 * @category Core/Runtime
 * @since 0.1.0
 */
export const runtime = Common.makeAtomRuntime(Service.Default.pipe(Layer.provide(layer)));
