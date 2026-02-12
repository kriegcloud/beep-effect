import type { SharedEntityIds } from "@beep/shared-domain";
import { DocumentsEntityIds } from "@beep/shared-domain";
import { OrgTable, user } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";
import { document } from "./document.table";

export const documentVersion = OrgTable.make(DocumentsEntityIds.DocumentVersionId)(
  {
    documentId: pg
      .text("document_id")
      .notNull()
      .references(() => document.id, { onDelete: "cascade" })
      .$type<DocumentsEntityIds.DocumentId.Type>(),
    userId: pg
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .$type<SharedEntityIds.UserId.Type>(),
    title: pg.text("title"),
    // Immutable canonical text snapshot for evidence pinning/highlighting (C-05).
    // For non-text sources, this may be empty but must never be mutated in place.
    content: pg.text("content").notNull().default(""),
    contentRich: pg.jsonb("content_rich").$type<string | null>(),
  },
  (t) => [
    // Organization ID index for RLS filtering
    pg.index("document_version_org_id_idx").on(t.organizationId),
    pg.index("document_version_document_idx").on(t.documentId),
    pg.index("document_version_user_idx").on(t.userId),
  ]
);
