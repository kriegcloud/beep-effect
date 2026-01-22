import { $DocumentsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("entities/document-version/document-version.model");

/**
 * DocumentVersion model representing version history for documents.
 * Stores snapshots of document content at specific points in time
 * for version control and rollback capabilities.
 */
export class Model extends M.Class<Model>($I`DocumentVersionModel`)(
  makeFields(DocumentsEntityIds.DocumentVersionId, {
    organizationId: SharedEntityIds.OrganizationId,
    documentId: DocumentsEntityIds.DocumentId,
    userId: SharedEntityIds.UserId,
    title: BS.FieldOptionOmittable(S.String.pipe(S.maxLength(500))),
    contentRich: BS.FieldOptionOmittable(S.Unknown),
  }),
  $I.annotations("DocumentVersionModel", {
    description: "Document version model representing version history for documents.",
  })
) {
  static readonly utils = modelKit(Model);
}
