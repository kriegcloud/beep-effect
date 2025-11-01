import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import { SharedEntityIds } from "../../entity-ids";

export class Model extends M.Class<Model>(`FileModel`)(
  makeFields(SharedEntityIds.FileId, {
    /** Organization ID Reference */
    organizationId: SharedEntityIds.OrganizationId,
  })
) {
  static readonly utils = modelKit(Model);
}
