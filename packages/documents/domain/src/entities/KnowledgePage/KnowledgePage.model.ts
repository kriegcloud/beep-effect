import { PageStatus } from "@beep/documents-domain/value-objects";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export class Model extends M.Class<Model>(`KnowledgePageModel`)(
  makeFields(DocumentsEntityIds.KnowledgePageId, {
    spaceId: DocumentsEntityIds.KnowledgeSpaceId,
    organizationId: SharedEntityIds.OrganizationId,
    parentPageId: BS.FieldOptionOmittable(DocumentsEntityIds.KnowledgePageId),
    title: S.String.pipe(S.maxLength(500)),
    slug: S.String,
    status: PageStatus,
    order: BS.toOptionalWithDefault(S.Int)(0),
    lastEditedAt: BS.DateTimeUtcFromAllAcceptable,
  })
) {
  static readonly utils = modelKit(Model);
}
