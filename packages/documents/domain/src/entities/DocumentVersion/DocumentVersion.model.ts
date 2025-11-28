import { BS } from "@beep/schema";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * DocumentVersion model representing version history for documents.
 * Stores snapshots of document content at specific points in time
 * for version control and rollback capabilities.
 */
export class Model extends M.Class<Model>(`DocumentVersionModel`)(
  makeFields(DocumentsEntityIds.DocumentVersionId, {
    organizationId: SharedEntityIds.OrganizationId,
    documentId: DocumentsEntityIds.DocumentId,
    userId: SharedEntityIds.UserId,
    title: BS.FieldOptionOmittable(S.String.pipe(S.maxLength(500))),
    contentRich: BS.FieldOptionOmittable(S.Unknown),
  })
) {
  static readonly utils = modelKit(Model);
}
