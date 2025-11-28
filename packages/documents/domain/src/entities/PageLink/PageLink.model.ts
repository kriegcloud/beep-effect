import { LinkType } from "@beep/documents-domain/value-objects";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export class Model extends M.Class<Model>(`PageLinkModel`)(
  makeFields(DocumentsEntityIds.PageLinkId, {
    sourcePageId: DocumentsEntityIds.KnowledgePageId,
    targetPageId: DocumentsEntityIds.KnowledgePageId,
    organizationId: SharedEntityIds.OrganizationId,
    linkType: LinkType, // 'explicit' | 'inline_reference' | 'block_embed'
    sourceBlockId: BS.FieldOptionOmittable(DocumentsEntityIds.KnowledgeBlockId), // For inline refs
    contextSnippet: BS.FieldOptionOmittable(S.String), // 50 chars around link
  })
) {
  static readonly utils = modelKit(Model);
}
