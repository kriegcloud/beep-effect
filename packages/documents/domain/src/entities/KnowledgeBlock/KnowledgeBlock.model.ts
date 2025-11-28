import { BlockType } from "@beep/documents-domain/value-objects";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
export class Model extends M.Class<Model>(`KnowledgeBlockModel`)(
  makeFields(DocumentsEntityIds.KnowledgeBlockId, {
    pageId: DocumentsEntityIds.KnowledgePageId,
    parentBlockId: BS.FieldOptionOmittable(DocumentsEntityIds.KnowledgeBlockId),
    organizationId: SharedEntityIds.OrganizationId,
    type: BlockType, // 'paragraph' | 'heading' | 'code' | 'image' | ...
    order: S.String, // Fractional indexing (text type for string keys like "a0", "a0V")
    encryptedContent: S.String, // Encrypted JSON blob (BlockNote content)
    contentHash: S.String, // SHA256 for deduplication/integrity
    lastEditedBy: SharedEntityIds.UserId, // Domain-specific: tracks content editor
  })
) {
  static readonly utils = modelKit(Model);
}
