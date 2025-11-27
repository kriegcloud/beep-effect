import type { SharedEntityIds } from "@beep/shared-domain";
import { KnowledgeManagementEntityIds } from "@beep/shared-domain";
import { OrgTable, user } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { document } from "./document.table";

export const discussion = OrgTable.make(KnowledgeManagementEntityIds.DiscussionId)(
  {
    documentId: pg
      .text("document_id")
      .notNull()
      .references(() => document.id, { onDelete: "cascade" })
      .$type<KnowledgeManagementEntityIds.DocumentId.Type>(),
    userId: pg
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .$type<SharedEntityIds.UserId.Type>(),
    documentContent: pg.text("document_content").notNull(),
    documentContentRich: pg.jsonb("document_content_rich"),
    isResolved: pg.boolean("is_resolved").notNull().default(false),
  },
  (t) => [
    pg.index("discussion_document_idx").on(t.documentId),
    pg.index("discussion_user_idx").on(t.userId),
    pg.index("discussion_is_resolved_idx").on(t.isResolved),
  ]
);
