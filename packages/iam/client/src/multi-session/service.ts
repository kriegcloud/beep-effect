/**
 * @fileoverview
 * Effect service providing multi-session handlers via dependency injection.
 *
 * Defines the Effect.Service for multi-session operations and constructs the atom runtime
 * with all required dependencies. The service exposes handler accessors for list, revoke, and set-active.
 *
 * @module @beep/iam-client/multi-session/service
 * @category MultiSession
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Group, layer } from "./layer.ts";

const $I = $IamClientId.create("multi-session/service");

/**
 * Effect service exposing multi-session handlers.
 *
 * @example
 * ```typescript
 * import { MultiSession } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const multiSession = yield* MultiSession.Service
 *   const sessions = yield* multiSession.ListSessions
 *   yield* multiSession.Revoke({ sessionToken: "..." })
 * })
 * ```
 *
 * @category MultiSession/Services
 * @since 0.1.0
 */
export class Service extends Effect.Service<Service>()($I`Service`, {
  accessors: true,
  effect: Group.accessHandlers("ListSessions", "Revoke", "SetActive"),
}) {}

/**
 * Atom runtime configured with multi-session service layer and dependencies.
 *
 * @example
 * ```typescript
 * import { MultiSession } from "@beep/iam-client"
 *
 * const myAtom = MultiSession.runtime.fn(() => {
 *   // Atom logic with multi-session service available
 * })
 * ```
 *
 * @category MultiSession/Runtime
 * @since 0.1.0
 */
export const runtime = Common.makeAtomRuntime(Service.Default.pipe(Layer.provide(layer)));
