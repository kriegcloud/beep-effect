/**
 * MergeHistory table definition for Knowledge slice
 *
 * Stores entity merge audit records for provenance tracking.
 * Records source entity, target entity, merge reason, confidence, and approver.
 *
 * @module knowledge-tables/tables/merge-history
 * @since 0.1.0
 */

import { KnowledgeEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import { OrgTable } from "@beep/shared-tables";
import { datetime } from "@beep/shared-tables/columns";
import * as pg from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm/sql";

/**
 * MergeHistory table for the knowledge slice.
 *
 * Tracks entity merge decisions with full audit trail metadata.
 * Records source entity, target entity, merge reason, confidence, and approver.
 *
 * @since 0.1.0
 * @category tables
 */
export const mergeHistory = OrgTable.make(KnowledgeEntityIds.MergeHistoryId)(
  {
    // Source entity being merged
    sourceEntityId: pg.text("source_entity_id").notNull().$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),

    // Target canonical entity
    targetEntityId: pg.text("target_entity_id").notNull().$type<KnowledgeEntityIds.KnowledgeEntityId.Type>(),

    // Merge reason: "embedding_similarity" | "manual_override" | "text_exact_match"
    mergeReason: pg.text("merge_reason").notNull(),

    // Similarity confidence (0-1)
    confidence: pg.real("confidence").notNull(),

    // User who approved merge (null for automatic)
    mergedBy: pg.text("merged_by").$type<SharedEntityIds.UserId.Type>(),

    // When merge occurred
    mergedAt: datetime("merged_at").notNull().default(sql`now()`),
  },
  (t) => [
    // Organization ID index for RLS filtering
    pg.index("merge_history_organization_id_idx").on(t.organizationId),

    // Target entity index for finding merge history
    pg.index("merge_history_target_entity_id_idx").on(t.targetEntityId),

    // Source entity index for reverse lookups
    pg.index("merge_history_source_entity_id_idx").on(t.sourceEntityId),

    // Compound index for finding all merges in an organization
    pg.index("merge_history_org_target_idx").on(t.organizationId, t.targetEntityId),
  ]
);
