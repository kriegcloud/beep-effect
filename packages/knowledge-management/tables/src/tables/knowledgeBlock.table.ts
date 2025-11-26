import { BlockType } from "@beep/knowledge-management-domain/value-objects";
import { BS } from "@beep/schema";
import type { SharedEntityIds } from "@beep/shared-domain";
import { KnowledgeManagementEntityIds } from "@beep/shared-domain";
import { OrgTable, user } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { knowledgePage } from "./knowledgePage.table";

const blockTypePgEnum = BS.toPgEnum(BlockType)("block_type_enum");

export const knowledgeBlock = OrgTable.make(KnowledgeManagementEntityIds.KnowledgeBlockId)(
  {
    pageId: pg
      .text("page_id")
      .notNull()
      .references(() => knowledgePage.id, { onDelete: "cascade" })
      .$type<KnowledgeManagementEntityIds.KnowledgePageId.Type>(),
    parentBlockId: pg.text("parent_block_id").$type<KnowledgeManagementEntityIds.KnowledgeBlockId.Type>(),
    type: blockTypePgEnum("type").notNull(),
    order: pg.text("order").notNull(), // Fractional indexing (text type for string keys like "a0", "a0V")
    encryptedContent: pg.text("encrypted_content").notNull(), // Encrypted JSON blob (BlockNote content)
    contentHash: pg.text("content_hash").notNull(), // SHA256 for deduplication/integrity
    lastEditedBy: pg
      .text("last_edited_by")
      .notNull()
      .references(() => user.id)
      .$type<SharedEntityIds.UserId.Type>(),
  },
  (t) => [
    pg.index("knowledge_block_page_idx").on(t.pageId),
    pg.index("knowledge_block_parent_idx").on(t.parentBlockId),
    pg.index("knowledge_block_order_idx").on(t.pageId, t.order),
    pg.index("knowledge_block_content_hash_idx").on(t.contentHash),
  ]
);
