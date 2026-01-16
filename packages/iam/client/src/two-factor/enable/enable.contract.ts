import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("two-factor/enable");

/**
 * Payload for enabling two-factor authentication.
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    password: S.Redacted(S.String),
    issuer: S.optional(S.String),
  },
  $I.annotations("Payload", {
    description: "The payload for enabling two-factor authentication.",
  })
) {}

/**
 * Success response - two-factor authentication initialized.
 *
 * Returns TOTP URI for authenticator app setup and backup codes.
 * Note: 2FA is not fully enabled until verifyTotp is called (unless skipVerificationOnEnable is set).
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/two-factor/index.ts:200
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    totpURI: S.String,
    backupCodes: S.Array(S.String),
  },
  $I.annotations("Success", {
    description: "The success response containing TOTP URI and backup codes.",
  })
) {}
