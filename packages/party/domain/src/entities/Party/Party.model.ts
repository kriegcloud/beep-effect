import { PartyType } from "@beep/party-domain/value-objects";
import { BS } from "@beep/schema";
import { PartyEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";

export class Model extends M.Class<Model>(`PartyModel`)(
  makeFields(PartyEntityIds.PartyId, {
    type: PartyType,
    organizationId: SharedEntityIds.OrganizationId,
    displayName: BS.NameAttribute,
  })
) {
  static readonly utils = modelKit(Model);
}
