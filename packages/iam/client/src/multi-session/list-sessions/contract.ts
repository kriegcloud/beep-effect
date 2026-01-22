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
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("multi-session/list-sessions");

/**
 * Session schema based on Better Auth response.
 *
 * Note: Better Auth client SDK returns Date objects, not ISO strings.
 *
 * @category MultiSession/ListSessions/Schemas
 * @since 0.1.0
 */
export class Session extends S.Class<Session>($I`Session`)(
  {
    id: S.String,
    userId: S.String,
    token: S.String,
    expiresAt: S.Date,
    ipAddress: S.optionalWith(S.String, { nullable: true }),
    userAgent: S.optionalWith(S.String, { nullable: true }),
    createdAt: S.Date,
    updatedAt: S.Date,
  },
  $I.annotations("Session", {
    description: "A user session from the multi-session plugin.",
  })
) {}

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
export const Success = S.Array(Session);
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
export const Wrapper = Wrap.Wrapper.make("ListSessions", {
  success: Success,
  error: Common.IamError,
});
