import type { IamEntityIds } from "@beep/shared-domain";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import { datetime } from "@beep/shared-tables/columns";
import * as pg from "drizzle-orm/pg-core";

export const emailThread = OrgTable.make(KnowledgeEntityIds.EmailThreadId)(
  {
    providerAccountId: pg.text("provider_account_id").notNull().$type<IamEntityIds.AccountId.Type>(),
    sourceType: pg.text("source_type").notNull().default("gmail").$type<"gmail">(),
    sourceThreadId: pg.text("source_thread_id").notNull(),
    subject: pg.text("subject"),
    participants: pg.text("participants").array(),
    dateRangeEarliest: datetime("date_range_earliest"),
    dateRangeLatest: datetime("date_range_latest"),
    lastSyncedAt: datetime("last_synced_at"),
  },
  (t) => [
    pg.index("email_thread_organization_id_idx").on(t.organizationId),
    pg.index("email_thread_provider_account_id_idx").on(t.providerAccountId),
    pg.index("email_thread_source_thread_id_idx").on(t.sourceThreadId),
    pg
      .uniqueIndex("email_thread_org_provider_source_thread_uidx")
      .on(t.organizationId, t.providerAccountId, t.sourceThreadId),
  ]
);

