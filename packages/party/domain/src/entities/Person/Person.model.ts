import { BS } from "@beep/schema";
import { PartyEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export class Model extends M.Class<Model>(`PersonModel`)(
  makeFields(PartyEntityIds.PersonId, {
    partyId: PartyEntityIds.PartyId,
    givenName: BS.NameAttribute,
    familyName: BS.NameAttribute,
    preferredName: BS.NameAttribute,
    dateOfBirth: BS.DateFromAllAcceptable,
    primaryJobTitle: BS.FieldOptionOmittable(S.String),
    organizationId: SharedEntityIds.OrganizationId,
    displayName: BS.NameAttribute,
  })
) {
  static readonly utils = modelKit(Model);
}
