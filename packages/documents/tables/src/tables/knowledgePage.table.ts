import { PageStatus } from "@beep/documents-domain/value-objects";
import { BS } from "@beep/schema";
import { DocumentsEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { knowledgeSpace } from "./knowledgeSpace.table";

export const pageStatusPgEnum = BS.toPgEnum(PageStatus)("page_status_enum");

export const knowledgePage = OrgTable.make(DocumentsEntityIds.KnowledgePageId)(
  {
    spaceId: pg
      .text("space_id")
      .notNull()
      .references(() => knowledgeSpace.id, { onDelete: "cascade" })
      .$type<DocumentsEntityIds.KnowledgeSpaceId.Type>(),
    parentPageId: pg.text("parent_page_id").$type<DocumentsEntityIds.KnowledgePageId.Type>(),
    title: pg.text("title").notNull(),
    slug: pg.text("slug").notNull(),
    status: pageStatusPgEnum("status").notNull(),
    order: pg.integer("order").notNull().default(0),
    lastEditedAt: pg.timestamp("last_edited_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    pg.uniqueIndex("knowledge_page_space_slug_idx").on(t.spaceId, t.slug),
    pg.index("knowledge_page_space_idx").on(t.spaceId),
    pg.index("knowledge_page_parent_idx").on(t.parentPageId),
    pg.index("knowledge_page_status_idx").on(t.status),
  ]
);
