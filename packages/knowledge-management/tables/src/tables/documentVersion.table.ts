import type { SharedEntityIds } from "@beep/shared-domain";
import { KnowledgeManagementEntityIds } from "@beep/shared-domain";
import { OrgTable, user } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { document } from "./document.table";

export const documentVersion = OrgTable.make(KnowledgeManagementEntityIds.DocumentVersionId)(
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
    title: pg.text("title"),
    contentRich: pg.jsonb("content_rich"),
  },
  (t) => [
    pg.index("document_version_document_idx").on(t.documentId),
    pg.index("document_version_user_idx").on(t.userId),
  ]
);
