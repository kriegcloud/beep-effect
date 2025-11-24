import { BS } from "@beep/schema";
import { PartyEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export class Model extends M.Class<Model>(`PartyRelationshipModel`)(
  makeFields(PartyEntityIds.PartyRelationshipId, {
    fromPartyId: PartyEntityIds.PartyId,
    toPartyId: PartyEntityIds.PartyId,
    relationshipTypeId: PartyEntityIds.PartyRelationshipTypeId,
    fromRoleTypeId: BS.FieldOptionOmittable(PartyEntityIds.PartyRoleTypeId),
    toRoleTypeId: BS.FieldOptionOmittable(PartyEntityIds.PartyRoleTypeId),
    validFrom: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable),
    validTo: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable),
    priority: BS.FieldOptionOmittable(S.String),
    status: BS.FieldOptionOmittable(S.String),
    metadata: BS.FieldOptionOmittable(BS.Json),
    organizationId: SharedEntityIds.OrganizationId,
  })
) {
  static readonly utils = modelKit(Model);
}
