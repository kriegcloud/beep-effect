import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("multi-session/revoke");

/**
 * Payload for revoking a session.
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    sessionToken: S.String,
  },
  $I.annotations("Payload", {
    description: "The payload for revoking a session.",
  })
) {}

/**
 * Success response - session revocation confirmed.
 *
 * Better Auth returns { status: boolean } on success.
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
  },
  $I.annotations("Success", {
    description: "The success response for revoking a session.",
  })
) {}
