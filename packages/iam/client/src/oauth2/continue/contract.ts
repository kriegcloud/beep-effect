/**
 * @fileoverview
 * Continue OAuth2 flow contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for continuing an OAuth2 authorization flow.
 *
 * @module @beep/iam-client/oauth2/continue/contract
 * @category OAuth2/Continue
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("oauth2/continue");

/**
 * Payload for continuing an OAuth2 authorization flow.
 *
 * @example
 * ```typescript
 * import { Continue } from "@beep/iam-client/oauth2"
 *
 * const payload = Continue.Payload.make({
 *   selected: true,
 *   postLogin: true
 * })
 * ```
 *
 * @category OAuth2/Continue/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    selected: S.optional(S.Boolean),
    created: S.optional(S.Boolean),
    postLogin: S.optional(S.Boolean),
    oauth_query: S.optional(S.String),
  },
  formValuesAnnotation({
    selected: undefined,
    created: undefined,
    postLogin: undefined,
    oauth_query: undefined,
  })
) {}

/**
 * Success response with redirect URL.
 *
 * @category OAuth2/Continue/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    redirectTo: S.String,
  },
  $I.annotations("Success", {
    description: "Redirect URL to continue OAuth2 authorization flow.",
  })
) {}

/**
 * Contract wrapper for continue OAuth2 flow operations.
 *
 * @category OAuth2/Continue/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("ContinueOAuth2Flow", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
