/**
 * @fileoverview
 * Layer composition for multi-session handlers.
 *
 * Composes multi-session handlers into a WrapperGroup and provides the complete layer.
 *
 * @module @beep/iam-client/multi-session/layer
 * @category MultiSession
 * @since 0.1.0
 */

import { Wrap } from "@beep/wrap";
import { ListSessions } from "./list-sessions";
import { Revoke } from "./revoke";
import { SetActive } from "./set-active";

/**
 * Wrapper group containing all multi-session wrappers.
 *
 * @example
 * ```typescript
 * import { MultiSession } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const handlers = MultiSession.Group.accessHandlers("ListSessions", "Revoke", "SetActive")
 * ```
 *
 * @category MultiSession/Layers
 * @since 0.1.0
 */
export const Group = Wrap.WrapperGroup.make(ListSessions.Wrapper, Revoke.Wrapper, SetActive.Wrapper);

/**
 * Effect layer providing multi-session service.
 *
 * @example
 * ```typescript
 * import { MultiSession } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 * import * as Layer from "effect/Layer"
 *
 * const program = Effect.gen(function* () {
 *   // Multi-session handlers available via dependency injection
 * }).pipe(Effect.provide(MultiSession.layer))
 * ```
 *
 * @category MultiSession/Layers
 * @since 0.1.0
 */
export const layer = Group.toLayer({
  ListSessions: ListSessions.Handler,
  Revoke: Revoke.Handler,
  SetActive: SetActive.Handler,
});
