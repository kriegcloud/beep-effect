/**
 * @fileoverview
 * Get OAuth2 consent contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for retrieving a consent record.
 *
 * @module @beep/iam-client/oauth2/get-consent/contract
 * @category OAuth2/GetConsent
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("oauth2/get-consent");

/**
 * Payload for getting a consent record.
 *
 * @example
 * ```typescript
 * import { GetConsent } from "@beep/iam-client/oauth2"
 *
 * const payload = GetConsent.Payload.make({
 *   id: "consent_123"
 * })
 * ```
 *
 * @category OAuth2/GetConsent/Schemas
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
 * OAuth2 consent record.
 *
 * @category OAuth2/GetConsent/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    id: IamEntityIds.OAuthConsentId,
    userId: SharedEntityIds.UserId,
    clientId: IamEntityIds.OAuthClientId,
    scopes: S.Array(S.String),
    createdAt: BS.DateFromAllAcceptable,
    consentGiven: S.Boolean,
  },
  $I.annotations("Success", {
    description: "OAuth2 consent record details.",
  })
) {}

/**
 * Contract wrapper for get OAuth2 consent operations.
 *
 * @category OAuth2/GetConsent/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("GetOAuth2Consent", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
