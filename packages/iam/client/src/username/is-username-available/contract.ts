/**
 * @fileoverview
 * Username availability contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for checking if a username
 * is available for registration.
 *
 * @module @beep/iam-client/username/is-username-available/contract
 * @category Username/IsUsernameAvailable
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("username/is-username-available");

/**
 * Payload for checking username availability.
 *
 * @example
 * ```typescript
 * import { IsUsernameAvailable } from "@beep/iam-client/username"
 *
 * const payload = IsUsernameAvailable.Payload.make({
 *   username: "desired-username"
 * })
 * ```
 *
 * @category Username/IsUsernameAvailable/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    username: S.String,
  },
  formValuesAnnotation({
    username: "",
  })
) {}

/**
 * Success response indicating whether the username is available.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { IsUsernameAvailable } from "@beep/iam-client/username"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* IsUsernameAvailable.Handler({ username: "desired-username" })
 *   if (result.status) {
 *     console.log("Username is available!")
 *   } else {
 *     console.log("Username is already taken.")
 *   }
 * })
 * ```
 *
 * @category Username/IsUsernameAvailable/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Response indicating whether the username is available (true) or taken (false).",
  })
) {}

/**
 * Contract wrapper for username availability check operations.
 *
 * @example
 * ```typescript
 * import { IsUsernameAvailable } from "@beep/iam-client/username"
 *
 * const handler = IsUsernameAvailable.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Username/IsUsernameAvailable/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("IsUsernameAvailable", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
