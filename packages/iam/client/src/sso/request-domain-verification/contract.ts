/**
 * @fileoverview
 * SSO request domain verification contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for requesting a new domain verification token.
 *
 * @module @beep/iam-client/sso/request-domain-verification/contract
 * @category SSO/RequestDomainVerification
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("sso/request-domain-verification");

/**
 * Payload for requesting a new domain verification token.
 *
 * @example
 * ```typescript
 * import { RequestDomainVerification } from "@beep/iam-client/sso"
 *
 * const payload = RequestDomainVerification.Payload.make({
 *   providerId: "acme-corp"
 * })
 * ```
 *
 * @category SSO/RequestDomainVerification/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    providerId: IamEntityIds.SsoProviderId,
  },
  formValuesAnnotation({
    providerId: "",
  })
) {}

/**
 * Success response containing the new verification token.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { RequestDomainVerification } from "@beep/iam-client/sso"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* RequestDomainVerification.Handler({
 *     providerId: "acme-corp"
 *   })
 *   console.log(`Add TXT record: ${result.txtRecord}`)
 *   console.log(`Token: ${result.verificationToken}`)
 * })
 * ```
 *
 * @category SSO/RequestDomainVerification/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    verificationToken: S.Redacted(S.String),
    txtRecord: S.String,
  },
  $I.annotations("Success", {
    description: "Success response containing the verification token and TXT record.",
  })
) {}

/**
 * Contract wrapper for SSO request domain verification operations.
 *
 * @example
 * ```typescript
 * import { RequestDomainVerification } from "@beep/iam-client/sso"
 *
 * const handler = RequestDomainVerification.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category SSO/RequestDomainVerification/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("SsoRequestDomainVerification", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
