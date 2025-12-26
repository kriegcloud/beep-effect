import * as EventSequenceNumber from "../../../EventSequenceNumber/mod.ts";
import { PgDsl } from "../db-schema/mod.ts";
import { table } from "../table-def.ts";

/**
 * STATE DATABASE SYSTEM TABLES
 *
 * ⚠️  SAFE TO CHANGE: State tables are automatically rebuilt from eventlog when schema changes.
 * No need to bump `liveStoreStorageFormatVersion` (uses hash-based migration via PgAst.hash()).
 */

export const SCHEMA_META_TABLE = "__livestore_schema";

/**
 * Tracks schema hashes for user-defined tables to detect schema changes.
 */
export const schemaMetaTable = table({
  name: SCHEMA_META_TABLE,
  columns: {
    tableName: PgDsl.text({ primaryKey: true }),
    schemaHash: PgDsl.integer({ nullable: false }),
    /** ISO date format */
    updatedAt: PgDsl.text({ nullable: false }),
  },
});

export type SchemaMetaRow = typeof schemaMetaTable.Type;

export const SCHEMA_EVENT_DEFS_META_TABLE = "__livestore_schema_event_defs";

/**
 * Tracks schema hashes for event definitions to detect event schema changes.
 */
export const schemaEventDefsMetaTable = table({
  name: SCHEMA_EVENT_DEFS_META_TABLE,
  columns: {
    eventName: PgDsl.text({ primaryKey: true }),
    schemaHash: PgDsl.integer({ nullable: false }),
    /** ISO date format */
    updatedAt: PgDsl.text({ nullable: false }),
  },
});

export type SchemaEventDefsMetaRow = typeof schemaEventDefsMetaTable.Type;

/**
 * Table which stores SQLite changeset blobs which is used for rolling back
 * read-model state during rebasing.
 */
export const SESSION_CHANGESET_META_TABLE = "__livestore_session_changeset";

export const sessionChangesetMetaTable = table({
  name: SESSION_CHANGESET_META_TABLE,
  columns: {
    // TODO bring back primary key
    seqNumGlobal: PgDsl.integer({ schema: EventSequenceNumber.Global.Schema }),
    seqNumClient: PgDsl.integer({ schema: EventSequenceNumber.Client.Schema }),
    seqNumRebaseGeneration: PgDsl.integer({}),
    changeset: PgDsl.blob({ nullable: true }),
    debug: PgDsl.json({ nullable: true }),
  },
  indexes: [{ columns: ["seqNumGlobal", "seqNumClient"], name: "idx_session_changeset_id" }],
});

export type SessionChangesetMetaRow = typeof sessionChangesetMetaTable.Type;

export const stateSystemTables = [schemaMetaTable, schemaEventDefsMetaTable, sessionChangesetMetaTable] as const;

export const isStateSystemTable = (tableName: string) => stateSystemTables.some((_) => _.pgDef.name === tableName);
