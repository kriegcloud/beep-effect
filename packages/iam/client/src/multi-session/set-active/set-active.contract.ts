import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("multi-session/set-active");

/**
 * Payload for setting a session as active.
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    sessionToken: S.String,
  },
  $I.annotations("Payload", {
    description: "The payload for setting a session as active.",
  })
) {}

/**
 * Success response - session activation confirmed.
 *
 * Better Auth returns { status: boolean } on success.
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
  },
  $I.annotations("Success", {
    description: "The success response for setting a session as active.",
  })
) {}
