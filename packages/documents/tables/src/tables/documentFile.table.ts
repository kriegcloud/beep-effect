import type { SharedEntityIds } from "@beep/shared-domain";
import { DocumentsEntityIds } from "@beep/shared-domain";
import { OrgTable, user } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { document } from "./document.table";

export const documentFile = OrgTable.make(DocumentsEntityIds.DocumentFileId)(
  {
    userId: pg
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .$type<SharedEntityIds.UserId.Type>(),
    documentId: pg
      .text("document_id")
      .references(() => document.id, { onDelete: "set null" })
      .$type<DocumentsEntityIds.DocumentId.Type>(),
    size: pg.integer("size").notNull(),
    url: pg.text("url").notNull(),
    appUrl: pg.text("app_url").notNull(),
    type: pg.text("type").notNull(),
  },
  (t) => [
    pg.index("document_file_user_idx").on(t.userId),
    pg.index("document_file_document_idx").on(t.documentId),
    pg.index("document_file_type_idx").on(t.type),
  ]
);
