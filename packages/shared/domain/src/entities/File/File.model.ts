import { makeFields } from "@beep/shared-domain/common";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as M from "@effect/sql/Model";

export class Model extends M.Class<Model>(`FileModel`)(
  makeFields(SharedEntityIds.FileId, {
    /** Organization ID Reference */
    organizationId: SharedEntityIds.OrganizationId,
  })
) {}
