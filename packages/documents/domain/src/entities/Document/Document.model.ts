import { TextStyle } from "@beep/documents-domain/value-objects";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * Document model representing rich-text documents with collaborative editing support.
 * Supports Yjs snapshots for real-time collaboration, rich content storage,
 * and various display options like text style, full width, and table of contents.
 */

export class Model extends M.Class<Model>(`DocumentModel`)(
  makeFields(DocumentsEntityIds.DocumentId, {
    organizationId: SharedEntityIds.OrganizationId,
    userId: SharedEntityIds.UserId,
    templateId: BS.FieldOptionOmittable(S.String),
    parentDocumentId: BS.FieldOptionOmittable(DocumentsEntityIds.DocumentId),
    title: BS.FieldOptionOmittable(S.String.pipe(S.maxLength(500))),
    content: BS.FieldOptionOmittable(S.String),
    contentRich: BS.FieldOptionOmittable(S.Unknown),
    yjsSnapshot: BS.FieldOptionOmittable(S.Uint8ArrayFromBase64),
    coverImage: BS.FieldOptionOmittable(S.String),
    icon: BS.FieldOptionOmittable(S.String),
    isPublished: BS.toOptionalWithDefault(S.Boolean)(false),
    isArchived: BS.toOptionalWithDefault(S.Boolean)(false),
    textStyle: BS.toOptionalWithDefault(TextStyle)("default"),
    smallText: BS.toOptionalWithDefault(S.Boolean)(false),
    fullWidth: BS.toOptionalWithDefault(S.Boolean)(false),
    lockPage: BS.toOptionalWithDefault(S.Boolean)(false),
    toc: BS.toOptionalWithDefault(S.Boolean)(true),
  })
) {
  static readonly utils = modelKit(Model);
}
