import { $DocumentsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { SerializedEditorStateEnvelope, TextStyle } from "../../value-objects";

const $I = $DocumentsDomainId.create("entities/Document/Document.model");

export class Model extends M.Class<Model>($I`DocumentModel`)(
  makeFields(DocumentsEntityIds.DocumentId, {
    organizationId: SharedEntityIds.OrganizationId,
    userId: SharedEntityIds.UserId,
    templateId: BS.FieldOptionOmittable(S.String),
    parentDocumentId: BS.FieldOptionOmittable(DocumentsEntityIds.DocumentId),
    title: BS.FieldOptionOmittable(S.String.pipe(S.maxLength(500))),
    content: BS.FieldOptionOmittable(S.String),
    contentRich: BS.JsonFromStringOption(SerializedEditorStateEnvelope),
    yjsSnapshot: BS.FieldOptionOmittable(S.Uint8ArrayFromSelf),
    coverImage: BS.FieldOptionOmittable(S.String),
    icon: BS.FieldOptionOmittable(S.String),
    isPublished: BS.toOptionalWithDefault(S.Boolean)(false),
    isArchived: BS.toOptionalWithDefault(S.Boolean)(false),
    textStyle: BS.toOptionalWithDefault(TextStyle)("default"),
    smallText: BS.toOptionalWithDefault(S.Boolean)(false),
    fullWidth: BS.toOptionalWithDefault(S.Boolean)(false),
    lockPage: BS.toOptionalWithDefault(S.Boolean)(false),
    toc: BS.toOptionalWithDefault(S.Boolean)(true),
  }),
  $I.annotations("DocumentModel", {
    description: "Document model representing rich-text documents with collaborative editing support.",
  })
) {
  static readonly utils = modelKit(Model);
}
