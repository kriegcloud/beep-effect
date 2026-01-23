/**
 * @fileoverview
 * Grant OAuth2 consent contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for granting consent to an OAuth2 client.
 *
 * @module @beep/iam-client/oauth2/consent/contract
 * @category OAuth2/Consent
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("oauth2/consent");

/**
 * Payload for granting consent to an OAuth2 client.
 *
 * @example
 * ```typescript
 * import { Consent } from "@beep/iam-client/oauth2"
 *
 * const payload = Consent.Payload.make({
 *   accept: true,
 *   scope: "read write profile"
 * })
 * ```
 *
 * @category OAuth2/Consent/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    accept: S.Boolean,
    scope: S.optional(S.String),
    oauth_query: S.optional(S.String),
  },
  formValuesAnnotation({
    accept: true,
    scope: undefined,
    oauth_query: undefined,
  })
) {}

/**
 * Success response with created consent record.
 *
 * @category OAuth2/Consent/Schemas
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
    description: "Created OAuth2 consent record.",
  })
) {}

/**
 * Contract wrapper for grant OAuth2 consent operations.
 *
 * @category OAuth2/Consent/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("GrantOAuth2Consent", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
