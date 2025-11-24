import { BS } from "@beep/schema";
import { PartyEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";

export class Model extends M.Class<Model>(`PartyContactPointModel`)(
  makeFields(PartyEntityIds.PartyContactPointId, {
    partyId: PartyEntityIds.PartyId,
    contactPointId: PartyEntityIds.ContactPointId,
    isPrimary: BS.BoolFalse,
    organizationId: SharedEntityIds.OrganizationId,
  })
) {
  static readonly utils = modelKit(Model);
}
