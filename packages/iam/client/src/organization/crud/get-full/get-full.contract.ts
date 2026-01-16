import { $IamClientId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { FullOrganization } from "../../_common/index.ts";

const $I = $IamClientId.create("organization/crud/get-full");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    query: S.optional(
      S.Struct({
        organizationId: S.optional(S.String),
      })
    ),
  },
  $I.annotations("Payload", {
    description: "Payload for getting full organization details.",
  })
) {}

export const Success = FullOrganization;
