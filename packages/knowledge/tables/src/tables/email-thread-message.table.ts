import type { DocumentsEntityIds, IamEntityIds } from "@beep/shared-domain";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import { datetime } from "@beep/shared-tables/columns";
import * as pg from "drizzle-orm/pg-core";
import { emailThread } from "./email-thread.table";

export const emailThreadMessage = OrgTable.make(KnowledgeEntityIds.EmailThreadMessageId)(
  {
    threadId: pg
      .text("thread_id")
      .notNull()
      .references(() => emailThread.id, { onDelete: "cascade" })
      .$type<KnowledgeEntityIds.EmailThreadId.Type>(),

    providerAccountId: pg.text("provider_account_id").notNull().$type<IamEntityIds.AccountId.Type>(),
    sourceId: pg.text("source_id").notNull(),

    documentId: pg.text("document_id").notNull().$type<DocumentsEntityIds.DocumentId.Type>(),

    sourceInternalDate: datetime("source_internal_date"),
    sourceHistoryId: pg.text("source_history_id"),
    sourceHash: pg.text("source_hash"),

    // Stable, monotonic sequence number assigned at first sighting. Never renumbered.
    ingestSeq: pg.bigint("ingest_seq", { mode: "number" }).notNull(),

    // Deterministic sort key for chronological display. Example: `${epochMs}:${sourceId}`.
    sortKey: pg.text("sort_key").notNull(),
  },
  (t) => [
    pg.index("email_thread_message_organization_id_idx").on(t.organizationId),
    pg.index("email_thread_message_thread_id_idx").on(t.threadId),
    pg.index("email_thread_message_provider_account_id_idx").on(t.providerAccountId),
    pg.index("email_thread_message_source_id_idx").on(t.sourceId),
    pg.index("email_thread_message_document_id_idx").on(t.documentId),
    pg.index("email_thread_message_thread_sort_key_idx").on(t.threadId, t.sortKey),
    pg
      .uniqueIndex("email_thread_message_org_provider_source_uidx")
      .on(t.organizationId, t.providerAccountId, t.sourceId),
  ]
);
