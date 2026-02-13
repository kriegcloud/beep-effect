import { $WorkspacesDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { WorkspacesEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $WorkspacesDomainId.create("entities/DocumentFile/DocumentFile.model");

export class Model extends M.Class<Model>($I`DocumentFileModel`)(
  makeFields(WorkspacesEntityIds.DocumentFileId, {
    organizationId: SharedEntityIds.OrganizationId,
    userId: SharedEntityIds.UserId,
    documentId: BS.FieldOptionOmittable(WorkspacesEntityIds.DocumentId),
    size: S.Int,
    url: S.String,
    appUrl: S.String,
    type: S.String,
  }),
  $I.annotations("DocumentFileModel", {
    description: "Document file model representing files attached to documents.",
  })
) {
  static readonly utils = modelKit(Model);
}
