import type { ColumnBuilderBase } from "drizzle-orm";

/**
 * Canonical shared-table column keys injected by the table factory.
 *
 * @since 0.0.0
 * @category Constants
 */
export const defaultColumnKeys = [
  "id",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "createdBy",
  "updatedBy",
  "deletedBy",
  "version",
  "source",
] as const;

/**
 * Union of default shared-table column keys.
 *
 * @since 0.0.0
 * @category Types
 */
export type DefaultColumnKey = (typeof defaultColumnKeys)[number];

/**
 * Structural type describing the injected shared table columns.
 *
 * @since 0.0.0
 * @category Types
 */
export type DefaultColumns = Readonly<Record<DefaultColumnKey, ColumnBuilderBase>>;
