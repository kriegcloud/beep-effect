/**
 * @fileoverview
 * Delete OAuth2 consent contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for revoking a consent.
 *
 * @module @beep/iam-client/oauth2/delete-consent/contract
 * @category OAuth2/DeleteConsent
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("oauth2/delete-consent");

/**
 * Payload for deleting a consent record.
 *
 * @example
 * ```typescript
 * import { DeleteConsent } from "@beep/iam-client/oauth2"
 *
 * const payload = DeleteConsent.Payload.make({
 *   id: "consent_123"
 * })
 * ```
 *
 * @category OAuth2/DeleteConsent/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: IamEntityIds.OAuthConsentId,
  },
  formValuesAnnotation({
    id: "",
  })
) {}

/**
 * Success response confirming consent deletion.
 *
 * @category OAuth2/DeleteConsent/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Status response confirming consent revocation.",
  })
) {}

/**
 * Contract wrapper for delete OAuth2 consent operations.
 *
 * @category OAuth2/DeleteConsent/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("DeleteOAuth2Consent", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
