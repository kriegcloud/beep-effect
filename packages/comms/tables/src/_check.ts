/**
 * Type verification file for Comms tables
 *
 * This file ensures compile-time alignment between domain models
 * and Drizzle table definitions. Add type assertions here when you
 * create real entities to verify model/table schema alignment.
 *
 * @example
 * ```ts
 * import type { MyEntity } from "@beep/comms-domain/entities";
 * import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
 * import type * as tables from "./schema";
 *
 * export const _checkSelectMyEntity: typeof MyEntity.Model.select.Encoded =
 *   {} as InferSelectModel<typeof tables.myEntity>;
 * ```
 *
 * @module comms-tables/_check
 * @since 0.1.0
 */

import type { Entities } from "@beep/comms-domain";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
// Add type verification checks when you create real entities
// See JSDoc example above for the pattern to use
import type * as DbSchema from "./schema";

export const _checkSelectEmailTemplate: typeof Entities.EmailTemplate.Model.select.Encoded = {} as InferSelectModel<
  typeof DbSchema.emailTemplate
>;

export const _checkInsertEmailTemplate: typeof Entities.EmailTemplate.Model.insert.Encoded = {} as InferInsertModel<
  typeof DbSchema.emailTemplate
>;
