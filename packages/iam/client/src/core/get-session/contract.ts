/**
 * @fileoverview Contract definitions for the get-session operation.
 *
 * Provides schemas for retrieving the current authenticated session
 * with user data, or Option.none() when no session exists.
 *
 * @module @beep/iam-client/core/get-session/contract
 * @category Core/GetSession
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("core/get-session");

/**
 * Schema combining session and user data from Better Auth.
 *
 * @example
 * ```typescript
 * import { GetSession } from "@beep/iam-client/core"
 * import * as S from "effect/Schema"
 *
 * const decoded = S.decodeUnknownSync(GetSession.SessionData)({
 *   session: { id: "sess_123", userId: "user_456" },
 *   user: { id: "user_456", email: "alice@example.com" }
 * })
 * ```
 *
 * @category Core/GetSession/Schemas
 * @since 0.1.0
 */
export const SessionData = S.Struct({
  session: Common.DomainSessionFromBetterAuthSession,
  user: Common.DomainUserFromBetterAuthUser,
});

/**
 * Type alias for decoded SessionData.
 *
 * @example
 * ```typescript
 * import type { GetSession } from "@beep/iam-client/core"
 *
 * const handleSession = (data: GetSession.SessionData) => {
 *   console.log(data.user.email)
 * }
 * ```
 *
 * @category Core/GetSession/Schemas
 * @since 0.1.0
 */
export type SessionData = typeof SessionData.Type;

/**
 * Success response wrapping optional SessionData.
 *
 * Returns Option.none() when no active session exists, or Option.some(SessionData)
 * when a session is present.
 *
 * @example
 * ```typescript
 * import { GetSession } from "@beep/iam-client/core"
 * import * as Effect from "effect/Effect"
 * import * as O from "effect/Option"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* GetSession.Handler
 *   yield* O.match(result.data, {
 *     onNone: () => Effect.log("No session"),
 *     onSome: (session) => Effect.log("User:", session.user.email)
 *   })
 * })
 * ```
 *
 * @category Core/GetSession/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)({
  data: S.OptionFromNullOr(SessionData),
}) {}

/**
 * Contract wrapper combining success and error schemas for get-session.
 *
 * @example
 * ```typescript
 * import { GetSession } from "@beep/iam-client/core"
 *
 * const handler = GetSession.Wrapper.implement(() => {
 *   // Implementation logic
 * })
 * ```
 *
 * @category Core/GetSession/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("GetSession", {
  success: Success,
  error: Common.IamError,
});
