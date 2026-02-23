import { KnowledgeEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import { datetime } from "@beep/shared-tables/columns";
import * as pg from "drizzle-orm/pg-core";

export const mergeHistory = OrgTable.make(KnowledgeEntityIds.MergeHistoryId)(
  {
    sourceEntityId: pg.text("source_entity_id").notNull().$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),
    targetEntityId: pg.text("target_entity_id").notNull().$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),
    mergeReason: pg
      .text("merge_reason")
      .notNull()
      .$type<"embedding_similarity" | "manual_override" | "text_exact_match">(),
    confidence: pg.real("confidence").notNull(),
    mergedBy: pg.text("merged_by").$type<SharedEntityIds.UserId.Type>(),
    mergedAt: datetime("merged_at").notNull(),
  },
  (t) => [
    pg.index("merge_history_organization_id_idx").on(t.organizationId),
    pg.index("merge_history_target_entity_id_idx").on(t.targetEntityId),
    pg.index("merge_history_source_entity_id_idx").on(t.sourceEntityId),
    pg.index("merge_history_org_target_idx").on(t.organizationId, t.targetEntityId),
  ]
);
