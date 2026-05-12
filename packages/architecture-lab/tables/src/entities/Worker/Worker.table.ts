/**
 * Worker table mapping.
 *
 * @packageDocumentation
 * @category tables
 * @since 0.1.0
 */

import * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker";
import { EntityTable } from "@beep/drizzle";
import * as S from "effect/Schema";

/**
 * Worker persistence projection.
 *
 * @category tables
 * @since 0.1.0
 */
export const workerTable = EntityTable.pgTableFrom(DomainWorker.Worker);

/**
 * Worker persistence table name.
 *
 * @category tables
 * @since 0.1.0
 */
export const WORKER_TABLE_NAME = workerTable.definition.tableName;

/**
 * Selected Worker row.
 *
 * @category tables
 * @since 0.1.0
 */
export type WorkerRow = typeof workerTable.$inferSelect;

/**
 * Insertable Worker row.
 *
 * @category tables
 * @since 0.1.0
 */
export type WorkerInsert = typeof workerTable.$inferInsert;

const encodeWorker = S.encodeSync(DomainWorker.Worker);
const decodeWorker = S.decodeUnknownSync(DomainWorker.Worker);

/**
 * Convert a Worker entity to its persistence row shape.
 *
 * @category tables
 * @since 0.1.0
 */
export const toWorkerInsert = (worker: DomainWorker.Worker): WorkerInsert => encodeWorker(worker);

/**
 * Convert a selected persistence row into a Worker entity.
 *
 * @category tables
 * @since 0.1.0
 */
export const fromWorkerRow = (row: WorkerRow): DomainWorker.Worker => decodeWorker(row);
