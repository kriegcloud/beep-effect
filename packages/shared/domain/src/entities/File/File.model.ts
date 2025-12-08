import { BS } from "@beep/schema";
import { makeFields } from "@beep/shared-domain/common";
import * as M from "@effect/sql/Model";
import { SharedEntityIds } from "../../entity-ids";
import { modelKit } from "../../factories";
import { UploadPath } from "./schemas";

export class Model extends M.Class<Model>(`FileModel`)(
  makeFields(SharedEntityIds.FileId, {
    /** Organization ID Reference */
    organizationId: SharedEntityIds.OrganizationId,
    /** File Path */
    key: UploadPath.to,
    /** Url */
    url: BS.URLString,
  })
) {
  static readonly utils = modelKit(Model);
}
