import { DateTimeFromDate, DateTimeInsertFromDate, DateTimeUpdateFromDate } from "@beep/schema/sql/common";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { SharedEntityIds } from "./EntityIds";

const OptionFromDateTime = (params?: { description?: string }) => M.FieldOption(DateTimeFromDate(params));

/**
 * Audit columns optimized for PostgreSQL timestamp with timezone:
 * - createdAt: Auto-set on insert, omitted from updates
 * - updatedAt: Auto-set on both insert and update operations
 * - deletedAt: Optional field for soft delete functionality
 */
export const auditColumns = {
  createdAt: DateTimeInsertFromDate(),
  updatedAt: DateTimeUpdateFromDate(),
  deletedAt: OptionFromDateTime(),
} as const;

export const userTrackingColumns = {
  createdBy: M.FieldOption(S.String),
  updatedBy: M.FieldOption(S.String),
  deletedBy: M.FieldOption(S.String),
} as const;

export const globalColumns = {
  ...auditColumns,
  ...userTrackingColumns,
  // Optimistic locking
  version: M.FieldOption(S.Int.pipe(S.greaterThanOrEqualTo(1))),
  // Optional: Enhanced traceability
  source: M.FieldOption(S.String),
} as const;

export const defaultColumns = {
  ...globalColumns,
  organizationId: SharedEntityIds.OrganizationId,
} as const;

export { DateTimeFromDate, DateTimeInsertFromDate, DateTimeUpdateFromDate };
