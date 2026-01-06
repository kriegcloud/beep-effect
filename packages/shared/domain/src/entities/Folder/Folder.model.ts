import { $SharedDomainId } from "@beep/identity/packages";
import { makeFields } from "@beep/shared-domain/common";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("entities/Folder/Folder.model");

/**
 * Folder model representing organizational folders for documents.
 * Maps to the `folder` table in the database.
 */
export class Model extends M.Class<Model>($I`FolderModel`)(
  makeFields(SharedEntityIds.FolderId, {
    organizationId: SharedEntityIds.OrganizationId,
    userId: SharedEntityIds.UserId,
    name: S.String,
  }),
  $I.annotations("FolderModel", {
    description: "Folder model representing organizational folders for documents.",
  })
) {
  static readonly utils = modelKit(Model);
}
