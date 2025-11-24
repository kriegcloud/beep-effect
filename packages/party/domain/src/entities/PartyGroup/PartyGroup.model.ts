import { GroupType } from "@beep/party-domain/value-objects";
import { BS } from "@beep/schema";
import { PartyEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export class Model extends M.Class<Model>(`PartyGroupModel`)(
  makeFields(PartyEntityIds.PartyGroupId, {
    partyId: PartyEntityIds.PartyId,
    type: GroupType,
    description: BS.FieldOptionOmittable(S.String),
    organizationId: SharedEntityIds.OrganizationId,
  })
) {
  static readonly utils = modelKit(Model);
}
