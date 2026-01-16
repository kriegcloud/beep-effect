import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Metadata, Organization } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/crud/update");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: S.optional(S.String), // Uses active org if omitted
    data: S.Struct({
      name: S.optional(S.String),
      slug: S.optional(S.String),
      logo: S.optional(S.String),
      metadata: S.optional(Metadata),
    }),
  },
  $I.annotations("Payload", {
    description: "Payload for updating an organization.",
  })
) {}

export const Success = Organization;
