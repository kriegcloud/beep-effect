import type { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { WorkspacesEntityIds } from "@beep/shared-domain";
import { OrgTable, user } from "@beep/shared-tables";
import { datetime } from "@beep/shared-tables/columns";
import * as pg from "drizzle-orm/pg-core";
import { document } from "./document.table";

export const documentSource = OrgTable.make(WorkspacesEntityIds.DocumentSourceId)(
  {
    documentId: pg
      .text("document_id")
      .notNull()
      .references(() => document.id, { onDelete: "cascade" })
      .$type<WorkspacesEntityIds.DocumentId.Type>(),
    userId: pg
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .$type<SharedEntityIds.UserId.Type>(),

    // Cross-slice boundary safety: store IAM `account.id` as a typed string (no FK).
    providerAccountId: pg.text("provider_account_id").notNull().$type<IamEntityIds.AccountId.Type>(),

    sourceType: pg.text("source_type").notNull(),
    sourceId: pg.text("source_id").notNull(),

    sourceThreadId: pg.text("source_thread_id"),
    sourceUri: pg.text("source_uri"),
    sourceInternalDate: datetime("source_internal_date"),
    sourceHistoryId: pg.text("source_history_id"),

    // sha256(canonicalJson({ title, content })) where `content` is the exact persisted string used for highlighting.
    sourceHash: pg.text("source_hash").notNull(),
  },
  (t) => [
    pg.index("document_source_org_id_idx").on(t.organizationId),
    pg.index("document_source_document_id_idx").on(t.documentId),
    pg.index("document_source_user_id_idx").on(t.userId),
    pg.index("document_source_provider_account_id_idx").on(t.providerAccountId),
    pg.index("document_source_thread_id_idx").on(t.sourceThreadId),
    // D-07 strict unique forever (tombstone + resurrect): do NOT make this partial on deleted_at.
    pg
      .uniqueIndex("document_source_org_provider_source_uidx")
      .on(t.organizationId, t.providerAccountId, t.sourceType, t.sourceId),
  ]
);
