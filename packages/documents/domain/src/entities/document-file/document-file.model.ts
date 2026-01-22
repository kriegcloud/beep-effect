import { $DocumentsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("entities/document-file/document-file.model");

/**
 * DocumentFile model representing files attached to documents.
 * Stores file metadata including size, type, and URLs for both
 * direct access and app-specific routing.
 */
export class Model extends M.Class<Model>($I`DocumentFileModel`)(
  makeFields(DocumentsEntityIds.DocumentFileId, {
    organizationId: SharedEntityIds.OrganizationId,
    userId: SharedEntityIds.UserId,
    documentId: BS.FieldOptionOmittable(DocumentsEntityIds.DocumentId),
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
