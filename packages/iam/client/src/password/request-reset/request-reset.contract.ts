import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("password/request-reset");

/**
 * Payload for requesting a password reset email.
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: S.String,
    redirectTo: S.optional(S.String),
  },
  $I.annotations("Payload", {
    description: "The payload for requesting a password reset email.",
  })
) {}

/**
 * Success response - password reset email sent.
 *
 * Better Auth returns { status: boolean, message: string } on success.
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
    message: S.String,
  },
  $I.annotations("Success", {
    description: "The success response for requesting a password reset.",
  })
) {}
