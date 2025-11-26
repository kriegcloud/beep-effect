import { LinkType } from "@beep/knowledge-management-domain/value-objects";
import { BS } from "@beep/schema";
import { KnowledgeManagementEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { knowledgeBlock } from "./knowledgeBlock.table";
import { knowledgePage } from "./knowledgePage.table";

export const linkTypePgEnum = BS.toPgEnum(LinkType)("link_type_enum");

export const pageLink = OrgTable.make(KnowledgeManagementEntityIds.PageLinkId)(
  {
    sourcePageId: pg
      .text("source_page_id")
      .notNull()
      .references(() => knowledgePage.id, { onDelete: "cascade" })
      .$type<KnowledgeManagementEntityIds.KnowledgePageId.Type>(),
    targetPageId: pg
      .text("target_page_id")
      .notNull()
      .references(() => knowledgePage.id, { onDelete: "cascade" })
      .$type<KnowledgeManagementEntityIds.KnowledgePageId.Type>(),
    linkType: linkTypePgEnum("link_type").notNull(),
    sourceBlockId: pg
      .text("source_block_id")
      .references(() => knowledgeBlock.id, { onDelete: "cascade" })
      .$type<KnowledgeManagementEntityIds.KnowledgeBlockId.Type>(),
    contextSnippet: pg.text("context_snippet"), // 50 chars around link
  },
  (t) => [
    pg.index("page_link_source_idx").on(t.sourcePageId),
    pg.index("page_link_target_idx").on(t.targetPageId),
    pg.index("page_link_type_idx").on(t.linkType),
    pg.uniqueIndex("page_link_source_target_block_idx").on(t.sourcePageId, t.targetPageId, t.sourceBlockId),
  ]
);
