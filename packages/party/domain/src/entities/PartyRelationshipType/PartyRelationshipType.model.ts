import { BS } from "@beep/schema";
import { PartyEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export class Model extends M.Class<Model>(`PartyRelationshipTypeModel`)(
  makeFields(PartyEntityIds.PartyRelationshipTypeId, {
    code: S.NonEmptyTrimmedString,
    description: BS.FieldOptionOmittable(S.String),
    organizationId: SharedEntityIds.OrganizationId,
  })
) {
  static readonly utils = modelKit(Model);
}
