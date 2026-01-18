/**
 * Type verification file for Knowledge tables
 *
 * This file ensures compile-time alignment between domain models
 * and Drizzle table definitions. Add type assertions here when you
 * create real entities to verify model/table schema alignment.
 *
 * @example
 * ```ts
 * import type { MyEntity } from "@beep/knowledge-domain/entities";
 * import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
 * import type * as tables from "./schema";
 *
 * export const _checkSelectMyEntity: typeof MyEntity.Model.select.Encoded =
 *   {} as InferSelectModel<typeof tables.myEntity>;
 * ```
 *
 * @module knowledge-tables/_check
 * @since 0.1.0
 */

// Add type verification checks when you create real entities
// See JSDoc example above for the pattern to use
export {};
