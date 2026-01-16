import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("email-verification/send-verification");

/**
 * Payload for sending a verification email.
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: S.String,
    callbackURL: S.optional(S.String),
  },
  $I.annotations("Payload", {
    description: "The payload for sending a verification email.",
  })
) {}

/**
 * Success response - verification email sent.
 *
 * Better Auth returns { status: boolean } on success.
 *
 * Source: tmp/better-auth/packages/better-auth/src/api/routes/email-verification.ts:181-202
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
  },
  $I.annotations("Success", {
    description: "The success response for sending a verification email.",
  })
) {}
