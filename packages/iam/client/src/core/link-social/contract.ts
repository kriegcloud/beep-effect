/**
 * @fileoverview
 * Link social account contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for linking a social provider
 * to an existing user account.
 *
 * @module @beep/iam-client/core/link-social/contract
 * @category Core/LinkSocial
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("core/link-social");

/**
 * Payload for linking a social provider to the current user.
 *
 * @example
 * ```typescript
 * import { LinkSocial } from "@beep/iam-client/core"
 *
 * const payload = LinkSocial.Payload.make({
 *   provider: "google",
 *   callbackURL: "/dashboard"
 * })
 * ```
 *
 * @category Core/LinkSocial/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    provider: S.String,
    callbackURL: S.optional(S.String),
  },
  formValuesAnnotation({
    provider: "",
    callbackURL: "",
  })
) {}

/**
 * Success response for linking a social provider.
 *
 * Returns the OAuth redirect URL when the linking flow requires user consent.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { LinkSocial } from "@beep/iam-client/core"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* LinkSocial.Handler({ provider: "google" })
 *   if (result.url) {
 *     window.location.href = result.url
 *   }
 * })
 * ```
 *
 * @category Core/LinkSocial/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    url: S.optional(S.String),
  },
  $I.annotations("Success", {
    description: "Success response with optional OAuth redirect URL for social account linking.",
  })
) {}

/**
 * Contract wrapper for link social operations.
 *
 * @example
 * ```typescript
 * import { LinkSocial } from "@beep/iam-client/core"
 *
 * const handler = LinkSocial.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Core/LinkSocial/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("LinkSocial", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
