/**
 * Shared table column key metadata.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import type { ColumnBuilderBase } from "drizzle-orm";

/**
 * Canonical shared-table column keys injected by the table factory.
 *
 * @example
 * ```ts
 * import { defaultColumnKeys } from "@beep/shared-tables"
 *
 * const firstKey = defaultColumnKeys[0]
 *
 * void firstKey
 * ```
 *
 * @since 0.0.0
 * @category constants
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
 * @example
 * ```ts
 * import type { DefaultColumnKey } from "@beep/shared-tables"
 *
 * const key: DefaultColumnKey = "createdAt"
 *
 * void key
 * ```
 *
 * @since 0.0.0
 * @category types
 */
export type DefaultColumnKey = (typeof defaultColumnKeys)[number];

/**
 * Structural type describing the injected shared table columns.
 *
 * @example
 * ```ts
 * import type { DefaultColumns } from "@beep/shared-tables"
 *
 * const getIdColumn = (columns: DefaultColumns) => columns.id
 *
 * void getIdColumn
 * ```
 *
 * @since 0.0.0
 * @category types
 */
export type DefaultColumns = Readonly<Record<DefaultColumnKey, ColumnBuilderBase>>;
