import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("password/reset");

/**
 * Payload for resetting a password with a token.
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    newPassword: S.String,
    token: S.String,
  },
  $I.annotations("Payload", {
    description: "The payload for resetting a password with a token.",
  })
) {}

/**
 * Success response - password reset completed.
 *
 * Better Auth returns { status: boolean } on success.
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
  },
  $I.annotations("Success", {
    description: "The success response for resetting a password.",
  })
) {}
