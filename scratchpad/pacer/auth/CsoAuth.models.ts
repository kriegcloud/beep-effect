/**
 * Schema-first request/response models for the PACER Authentication API
 * (`/services/cso-auth` and `/services/cso-logout`).
 *
 * NOTE: the Authentication API returns failures as HTTP 200 with a body-level
 * `loginResult` code and an empty `nextGenCSO`, so these are decoded with the
 * lower-level `effect/unstable/http` client (not `httpapi`) and branched on in
 * the service layer.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $ScratchpadId } from "@beep/identity";
import { SchemaUtils } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ScratchpadId.create("pacer/auth/CsoAuth.models");

/**
 * `cso-auth` login request body.
 *
 * `clientCode` is optional billing/matter attribution; `otpCode` is required
 * only when the account is MFA-enrolled; `redactFlag` (`"1"`) is required only
 * for registered filers.
 *
 * @category schemas
 * @since 0.0.0
 */
export class CsoAuthRequest extends S.Class<CsoAuthRequest>($I`CsoAuthRequest`)(
  {
    loginId: S.String,
    password: S.String,
    clientCode: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    otpCode: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    redactFlag: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("CsoAuthRequest", {
    description: "PACER cso-auth login request body.",
  })
) {}

/**
 * `cso-auth` login response body.
 *
 * `loginResult` `"0"` means a token was issued; `nextGenCSO` is empty on
 * failure; `errorDescription` is `""` on clean success, otherwise a warning or
 * error message.
 *
 * @category schemas
 * @since 0.0.0
 */
export class CsoAuthResponse extends S.Class<CsoAuthResponse>($I`CsoAuthResponse`)(
  {
    nextGenCSO: S.String,
    loginResult: S.String,
    errorDescription: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("CsoAuthResponse", {
    description: "PACER cso-auth login response body.",
  })
) {}

/**
 * `cso-logout` request body — the token to invalidate.
 *
 * @category schemas
 * @since 0.0.0
 */
export class CsoLogoutRequest extends S.Class<CsoLogoutRequest>($I`CsoLogoutRequest`)(
  {
    nextGenCSO: S.String,
  },
  $I.annote("CsoLogoutRequest", {
    description: "PACER cso-logout request body.",
  })
) {}

/**
 * `cso-logout` response body.
 *
 * @category schemas
 * @since 0.0.0
 */
export class CsoLogoutResponse extends S.Class<CsoLogoutResponse>($I`CsoLogoutResponse`)(
  {
    loginResult: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    errorDescription: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
    nextGenCSO: S.OptionFromOptionalKey(S.String).pipe(SchemaUtils.withNoneDefault),
  },
  $I.annote("CsoLogoutResponse", {
    description: "PACER cso-logout response body.",
  })
) {}
