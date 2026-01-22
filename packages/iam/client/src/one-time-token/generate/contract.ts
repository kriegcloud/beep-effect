/**
 * @fileoverview
 * Generate one-time token contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for generating a one-time token.
 *
 * @module @beep/iam-client/one-time-token/generate/contract
 * @category OneTimeToken/Generate
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("one-time-token/generate");

/**
 * Payload for generating a one-time token.
 *
 * @example
 * ```typescript
 * import { Generate } from "@beep/iam-client/one-time-token"
 *
 * const payload = Generate.Payload.make({
 *   email: "user@example.com"
 * })
 * ```
 *
 * @category OneTimeToken/Generate/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: S.String,
  },
  formValuesAnnotation({
    email: "",
  })
) {}

/**
 * Success response containing the generated token.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Generate } from "@beep/iam-client/one-time-token"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Generate.Handler({ email: "user@example.com" })
 *   console.log(`Token: ${result.token}`)
 * })
 * ```
 *
 * @category OneTimeToken/Generate/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    token: S.String,
  },
  $I.annotations("Success", {
    description: "Success response containing the generated one-time token.",
  })
) {}

/**
 * Contract wrapper for one-time token generate operations.
 *
 * @example
 * ```typescript
 * import { Generate } from "@beep/iam-client/one-time-token"
 *
 * const handler = Generate.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category OneTimeToken/Generate/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("GenerateOneTimeToken", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
