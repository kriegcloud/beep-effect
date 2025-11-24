import { PartyOrganizationType } from "@beep/party-domain/value-objects";
import { BS } from "@beep/schema";
import { PartyEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export class Model extends M.Class<Model>(`PartyOrganizationModel`)(
  makeFields(PartyEntityIds.PartyOrganizationId, {
    partyId: PartyEntityIds.PartyId,
    legalName: S.NonEmptyTrimmedString,
    organizationType: PartyOrganizationType,
    registrationNumber: BS.FieldOptionOmittable(S.NonEmptyTrimmedString),
    taxIdMasked: BS.FieldOptionOmittable(S.NonEmptyTrimmedString),
    industry: BS.FieldOptionOmittable(S.NonEmptyTrimmedString),
    organizationId: SharedEntityIds.OrganizationId,
  })
) {
  static readonly utils = modelKit(Model);
}
