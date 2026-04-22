/**
 * Shared table column constructors.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { sql } from "drizzle-orm";
import * as sqlite from "drizzle-orm/sqlite-core";
import type { DefaultColumns } from "./columns.js";

type SharedGlobalColumns = Omit<DefaultColumns, "id">;
type AuditColumns = Pick<SharedGlobalColumns, "createdAt" | "updatedAt" | "deletedAt">;
type UserTrackingColumns = Pick<SharedGlobalColumns, "createdBy" | "updatedBy" | "deletedBy">;

/**
 * SQLite expression yielding the current UTC epoch time in milliseconds.
 *
 * @example
 * ```ts
 * import { Common } from "@beep/shared-tables"
 *
 * const expression = Common.sqlNowMillis
 *
 * void expression
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const sqlNowMillis = sql`(strftime('%s', 'now') * 1000) + (strftime('%f', 'now') - strftime('%S', 'now')) * 1000`;

/**
 * Create the standard audit columns for shared tables.
 *
 * @example
 * ```ts
 * import { Common } from "@beep/shared-tables"
 *
 * const auditColumns = Common.makeAuditColumns()
 *
 * void auditColumns
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const makeAuditColumns = () =>
  ({
    createdAt: sqlite.integer("created_at", { mode: "number" }).notNull().default(sqlNowMillis),
    updatedAt: sqlite
      .integer("updated_at", { mode: "number" })
      .notNull()
      .default(sqlNowMillis)
      .$onUpdateFn(() => sqlNowMillis),
    deletedAt: sqlite.integer("deleted_at", { mode: "number" }),
  }) satisfies AuditColumns;

/**
 * Create the standard actor-tracking columns for shared tables.
 *
 * @example
 * ```ts
 * import { Common } from "@beep/shared-tables"
 *
 * const userColumns = Common.makeUserTrackingColumns()
 *
 * void userColumns
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const makeUserTrackingColumns = () =>
  ({
    createdBy: sqlite.text("created_by").default("app"),
    updatedBy: sqlite.text("updated_by").default("app"),
    deletedBy: sqlite.text("deleted_by"),
  }) satisfies UserTrackingColumns;

/**
 * Create the standard shared global columns injected into every table.
 *
 * @example
 * ```ts
 * import { Common } from "@beep/shared-tables"
 *
 * const globalColumns = Common.makeGlobalColumns()
 *
 * void globalColumns
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const makeGlobalColumns = () =>
  ({
    ...makeAuditColumns(),
    ...makeUserTrackingColumns(),
    version: sqlite
      .integer("version", { mode: "number" })
      .notNull()
      .default(1)
      .$onUpdateFn(() => sql`version + 1`),
    source: sqlite.text("source"),
  }) satisfies SharedGlobalColumns;
