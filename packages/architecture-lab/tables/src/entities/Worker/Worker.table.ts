/**
 * Worker table mapping.
 *
 * @packageDocumentation
 * @category tables
 * @since 0.0.0
 */

import * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker";
import { EntityTable } from "@beep/drizzle";
import { Result } from "effect";
import * as S from "effect/Schema";

/**
 * Worker persistence projection.
 *
 * @example
 * ```ts
 * import { workerTable } from "@beep/architecture-lab-tables/entities/Worker"
 *
 * console.log(workerTable)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const workerTable = EntityTable.pgTableFrom(DomainWorker.Worker);

/**
 * Worker persistence table name.
 *
 * @example
 * ```ts
 * import { WORKER_TABLE_NAME } from "@beep/architecture-lab-tables/entities/Worker"
 *
 * console.log(WORKER_TABLE_NAME)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const WORKER_TABLE_NAME = workerTable.definition.tableName;

/**
 * Selected Worker row.
 *
 * @example
 * ```ts
 * import type { WorkerRow } from "@beep/architecture-lab-tables/entities/Worker"
 *
 * const value = {} as WorkerRow
 * console.log(value)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export type WorkerRow = typeof workerTable.$inferSelect;

/**
 * Insertable Worker row.
 *
 * @example
 * ```ts
 * import type { WorkerInsert } from "@beep/architecture-lab-tables/entities/Worker"
 *
 * const value = {} as WorkerInsert
 * console.log(value)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export type WorkerInsert = typeof workerTable.$inferInsert;

const encodeWorker = S.encodeResult(DomainWorker.Worker);
const decodeWorker = S.decodeUnknownResult(DomainWorker.Worker);

/**
 * Convert a Worker entity to its persistence row shape.
 *
 * @example
 * ```ts
 * import { toWorkerInsert } from "@beep/architecture-lab-tables/entities/Worker"
 *
 * console.log(toWorkerInsert)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const toWorkerInsert = (worker: DomainWorker.Worker): WorkerInsert => Result.getOrThrow(encodeWorker(worker));

/**
 * Convert a selected persistence row into a Worker entity.
 *
 * @example
 * ```ts
 * import { fromWorkerRow } from "@beep/architecture-lab-tables/entities/Worker"
 *
 * console.log(fromWorkerRow)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const fromWorkerRow = (row: WorkerRow): DomainWorker.Worker => Result.getOrThrow(decodeWorker(row));
