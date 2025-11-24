import { BS } from "@beep/schema";
import { PartyEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export class Model extends M.Class<Model>(`PartyRoleModel`)(
  makeFields(PartyEntityIds.PartyRoleId, {
    partyId: PartyEntityIds.PartyId,
    roleTypeId: PartyEntityIds.PartyRoleTypeId,
    contextType: S.NonEmptyTrimmedString,
    contextId: S.UUID,
    validFrom: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable),
    validTo: BS.FieldOptionOmittable(BS.DateTimeUtcFromAllAcceptable),
    organizationId: SharedEntityIds.OrganizationId,
  })
) {
  static readonly utils = modelKit(Model);
}
