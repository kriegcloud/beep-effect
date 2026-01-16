import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Organization } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/crud/set-active");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: S.String,
  },
  $I.annotations("Payload", {
    description: "Payload for setting the active organization.",
  })
) {}

// Returns the organization or null
export const Success = S.NullOr(Organization).annotations(
  $I.annotations("Success", {
    description: "The newly active organization, or null if setting failed.",
  })
);
