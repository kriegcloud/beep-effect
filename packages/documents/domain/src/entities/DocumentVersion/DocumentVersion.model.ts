import { $DocumentsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { SerializedEditorStateEnvelope } from "../../value-objects";

const $I = $DocumentsDomainId.create("entities/DocumentVersion/DocumentVersion.model");

export class Model extends M.Class<Model>($I`DocumentVersionModel`)(
  makeFields(DocumentsEntityIds.DocumentVersionId, {
    organizationId: SharedEntityIds.OrganizationId,
    documentId: DocumentsEntityIds.DocumentId,
    userId: SharedEntityIds.UserId,
    title: BS.FieldOptionOmittable(S.String.pipe(S.maxLength(500))),
    content: S.optionalWith(S.String, { default: () => "" }),
    contentRich: BS.FieldOptionOmittable(SerializedEditorStateEnvelope),
  }),
  $I.annotations("DocumentVersionModel", {
    description: "Document version model representing version history for documents.",
  })
) {
  static readonly utils = modelKit(Model);
}
