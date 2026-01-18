/**
 * @fileoverview
 * List sessions contract schemas and wrapper for Better Auth integration.
 *
 * Defines the success schema for listing all device sessions.
 * No payload required as this is a read-only operation.
 *
 * @module @beep/iam-client/multi-session/list-sessions/contract
 * @category MultiSession/ListSessions
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { Session } from "@beep/shared-domain/entities";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("multi-session/list-sessions");

/**
 * Success response - array of sessions.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { ListSessions } from "@beep/iam-client/multi-session"
 *
 * const program = Effect.gen(function* () {
 *   const sessions = yield* ListSessions.Handler
 *   console.log(sessions.length)
 * })
 * ```
 *
 * @category MultiSession/ListSessions/Schemas
 * @since 0.1.0
 */
export const Success = S.Array(Session.Model).annotations(
  $I.annotations("Success", {
    description: "Array of sessions.",
  })
);
export type Success = S.Schema.Type<typeof Success>;

/**
 * List sessions contract wrapper combining success and error schemas.
 *
 * @example
 * ```typescript
 * import { ListSessions } from "@beep/iam-client/multi-session"
 *
 * const handler = ListSessions.Wrapper.implement(
 *   () => client.multiSession.listDeviceSessions({})
 * )
 * ```
 *
 * @category MultiSession/ListSessions/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("ListSessions", {
  success: Success,
  error: Common.IamError,
});
