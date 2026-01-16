import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $IamClientId.create("organization/crud/delete");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: S.String, // Required - must specify which org to delete
  },
  $I.annotations("Payload", {
    description: "Payload for deleting an organization.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Result of organization deletion.",
  })
) {}
