import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Metadata, Organization } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/crud/create");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    name: S.String,
    slug: S.String, // Required by Better Auth
    logo: S.optional(S.String),
    metadata: S.optional(Metadata),
  },
  $I.annotations("Payload", {
    description: "Payload for creating a new organization.",
  })
) {}

export const Success = Organization;
