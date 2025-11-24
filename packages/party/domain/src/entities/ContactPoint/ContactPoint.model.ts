import { ContactPointType } from "@beep/party-domain/value-objects";
import { BS } from "@beep/schema";
import { PartyEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export class Model extends M.Class<Model>(`ContactPointModel`)(
  makeFields(PartyEntityIds.ContactPointId, {
    type: ContactPointType,
    value: S.NonEmptyTrimmedString,
    usage: BS.FieldOptionOmittable(S.NonEmptyTrimmedString),
    organizationId: SharedEntityIds.OrganizationId,
  })
) {
  static readonly utils = modelKit(Model);
}
