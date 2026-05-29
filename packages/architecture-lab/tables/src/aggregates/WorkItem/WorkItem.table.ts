/**
 * WorkItem table mapping.
 *
 * @packageDocumentation
 * @category tables
 * @since 0.0.0
 */

import * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { pipe } from "effect";
import * as O from "effect/Option";
import type * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker";
import type * as DomainWorkPriority from "@beep/architecture-lab-domain/values/WorkPriority";

/**
 * WorkItem persistence table name.
 *
 * @category tables
 * @since 0.0.0
 */
export const WORK_ITEM_TABLE_NAME = "architecture_lab_work_item" as const;

/**
 * WorkItem persistence projection.
 *
 * @category tables
 * @since 0.0.0
 */
export const workItemTable = pgTable(WORK_ITEM_TABLE_NAME, {
  id: text("id").primaryKey().$type<DomainWorkItem.WorkItemId>(),
  title: text("title").notNull().$type<DomainWorkItem.WorkItemTitle>(),
  status: text("status").notNull().$type<DomainWorkItem.WorkItemStatus>(),
  assigneeId: integer("assignee_id").$type<DomainWorker.WorkerId>(),
  priority: text("priority").$type<DomainWorkPriority.WorkPriority>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Selected WorkItem row.
 *
 * @category tables
 * @since 0.0.0
 */
export type WorkItemRow = typeof workItemTable.$inferSelect;

/**
 * Insertable WorkItem row.
 *
 * @category tables
 * @since 0.0.0
 */
export type WorkItemInsert = typeof workItemTable.$inferInsert;

/**
 * Convert a WorkItem aggregate to its persistence row shape.
 *
 * @category tables
 * @since 0.0.0
 */
export const toWorkItemInsert = (workItem: DomainWorkItem.WorkItem): WorkItemInsert => ({
  id: workItem.id,
  title: workItem.title,
  status: workItem.status,
  assigneeId: pipe(workItem.assignee, O.getOrNull),
  priority: pipe(workItem.priority, O.getOrNull),
});

/**
 * Convert a selected persistence row into a WorkItem aggregate.
 *
 * @category tables
 * @since 0.0.0
 */
export const fromWorkItemRow = (row: WorkItemRow): DomainWorkItem.WorkItem =>
  DomainWorkItem.WorkItem.make({
    id: row.id,
    title: row.title,
    status: row.status,
    assignee: O.fromNullishOr(row.assigneeId),
    priority: O.fromNullishOr(row.priority),
  });
