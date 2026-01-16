import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("two-factor/totp/get-uri");

/**
 * Payload for getting the TOTP URI.
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    password: S.Redacted(S.String),
  },
  $I.annotations("Payload", {
    description: "The payload for getting the TOTP URI.",
  })
) {}

/**
 * Success response - TOTP URI for existing 2FA setup.
 *
 * Used to re-display the QR code for an already-configured authenticator.
 *
 * Source: tmp/better-auth/packages/better-auth/src/plugins/two-factor/totp/index.ts:193-195
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    totpURI: S.String,
  },
  $I.annotations("Success", {
    description: "The success response containing the TOTP URI for authenticator setup.",
  })
) {}
