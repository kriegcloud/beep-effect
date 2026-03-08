import type { AgentId, MemoryItemId, SessionId, TurnId } from "@template/domain/ids"
import type {
  Instant,
  ListFilters,
  MemoryForgetFilters,
  MemoryItemRecord,
  MemoryItemRow,
  MemoryPort,
  MemorySearchResult,
  RetrieveFilters
} from "@template/domain/ports"
import type { MemoryScope, MemorySource, MemoryTier, SensitivityLevel } from "@template/domain/status"
import { DEFAULT_MEMORY_SEARCH_LIMIT, DEFAULT_SENSITIVITY_LEVEL } from "@template/domain/system-defaults"
import { Effect, Layer, Schema, ServiceMap } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { sqlCursor, sqlInstant, sqlInstantNullable } from "./persistence/SqlCodecs.js"

// --- Cursor codec via Schema ---

const CursorJsonCodec = Schema.fromJsonString(
  Schema.Struct({ createdAt: Schema.String, rowid: Schema.Int })
)
const cursor = sqlCursor(CursorJsonCodec)

interface StoreInput {
  readonly tier: MemoryTier
  readonly scope: MemoryScope
  readonly source: MemorySource
  readonly content: string
  readonly metadataJson?: string | null
  readonly generatedByTurnId?: string | null
  readonly sessionId?: string | null
  readonly sensitivity?: SensitivityLevel
}

export class MemoryPortSqlite extends ServiceMap.Service<MemoryPortSqlite>()(
  "server/MemoryPortSqlite",
  {
    make: Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient

      const search: MemoryPort["search"] = (agentId, query) =>
        Effect.gen(function*() {
          const conditions: Array<string> = [`agent_id = '${escapeSql(agentId)}'`]

          if (query.tier) conditions.push(`tier = '${escapeSql(query.tier)}'`)
          if (query.scope) conditions.push(`scope = '${escapeSql(query.scope)}'`)
          if (query.source) conditions.push(`source = '${escapeSql(query.source)}'`)

          if (query.query && query.query.trim().length > 0) {
            const escaped = query.query.replace(/%/g, "\\%").replace(/_/g, "\\_")
            conditions.push(`content LIKE '%${escapeSql(escaped)}%' ESCAPE '\\'`)
          }

          const cursorVal = query.cursor ? cursor.decode(query.cursor) : null
          if (cursorVal !== null) {
            const op = query.sort === "CreatedAsc" ? ">" : "<"
            conditions.push(
              `(created_at ${op} '${escapeSql(cursorVal.createdAt)}' OR (created_at = '${
                escapeSql(cursorVal.createdAt)
              }' AND rowid ${op} ${cursorVal.rowid}))`
            )
          }

          const whereClause = conditions.join(" AND ")
          const orderBy = query.sort === "CreatedAsc"
            ? "created_at ASC, rowid ASC"
            : "created_at DESC, rowid DESC"
          const limit = query.limit ?? DEFAULT_MEMORY_SEARCH_LIMIT

          // Count total matching (without cursor/limit)
          const countConditions = conditions.filter((c) => !c.startsWith("(created_at"))
          const countWhere = countConditions.join(" AND ")
          const countResult = yield* sql`
            SELECT COUNT(*) as cnt FROM memory_items
            WHERE ${sql.unsafe(countWhere)}
          `.unprepared
          const totalCount = Number(countResult[0]?.cnt ?? 0)

          // Fetch page
          const rows = yield* sql`
            SELECT rowid, memory_item_id, agent_id, tier, scope, source,
                   content, metadata_json, generated_by_turn_id,
                   session_id, sensitivity, was_generated_by, was_attributed_to,
                   governed_by_retention, last_access_time, created_at, updated_at
            FROM memory_items
            WHERE ${sql.unsafe(whereClause)}
            ORDER BY ${sql.unsafe(orderBy)}
            LIMIT ${limit}
          `.unprepared

          const items = rows.map(parseSearchRow)
          const nextCursor = rows.length === limit
            ? cursor.encode({ createdAt: rows[rows.length - 1].created_at as string, rowid: Number(rows[rows.length - 1].rowid) })
            : null

          return { items, cursor: nextCursor, totalCount } as MemorySearchResult
        }).pipe(Effect.tapDefect(Effect.logError), Effect.orDie)

      const encode = (
        agentId: AgentId,
        items: ReadonlyArray<StoreInput>,
        now: Instant
      ): Effect.Effect<ReadonlyArray<MemoryItemId>> =>
        Effect.gen(function*() {
          const nowStr = sqlInstant.encode(now)
          const ids: Array<MemoryItemId> = []

          for (const item of items) {
            const id = `memory:${crypto.randomUUID()}` as MemoryItemId
            ids.push(id)

            yield* sql`
              INSERT INTO memory_items (
                memory_item_id, agent_id, tier, scope, source,
                content, metadata_json, generated_by_turn_id, session_id,
                sensitivity, was_generated_by, was_attributed_to,
                governed_by_retention, last_access_time, created_at, updated_at
              ) VALUES (
                ${id}, ${agentId}, ${item.tier}, ${item.scope}, ${item.source},
                ${item.content}, ${item.metadataJson ?? null},
                ${item.generatedByTurnId ?? null}, ${item.sessionId ?? null},
                ${item.sensitivity ?? DEFAULT_SENSITIVITY_LEVEL}, ${agentId}, ${agentId},
                ${null}, ${null}, ${nowStr}, ${nowStr}
              )
            `.unprepared
          }

          return ids
        }).pipe(Effect.tapDefect(Effect.logError), Effect.orDie)

      const retrieve = (
        agentId: AgentId,
        filters: RetrieveFilters
      ): Effect.Effect<ReadonlyArray<MemoryItemRow>> =>
        Effect.gen(function*() {
          const { limit, query, scope, tier } = filters
          const conditions = [`m.agent_id = '${agentId}'`]
          if (tier) conditions.push(`m.tier = '${tier}'`)
          if (scope) conditions.push(`m.scope = '${scope}'`)
          const whereClause = conditions.join(" AND ")

          if (query && query.trim().length > 0) {
            const sanitizedQuery = sanitizeFts5Query(query)
            if (sanitizedQuery.length === 0) {
              // No usable search terms after sanitization — fall through to non-FTS path
              const rows = yield* sql`
                SELECT memory_item_id, agent_id, tier, scope, source,
                       content, metadata_json, generated_by_turn_id,
                       session_id, sensitivity, was_generated_by,
                       was_attributed_to, governed_by_retention,
                       last_access_time, created_at, updated_at
                FROM memory_items m
                WHERE ${sql.unsafe(whereClause)}
                ORDER BY created_at DESC
                LIMIT ${limit}
              `.unprepared
              return rows.map(parseRow)
            }
            const rows = yield* sql`
              SELECT m.memory_item_id, m.agent_id, m.tier, m.scope, m.source,
                     m.content, m.metadata_json, m.generated_by_turn_id,
                     m.session_id, m.sensitivity, m.was_generated_by,
                     m.was_attributed_to, m.governed_by_retention,
                     m.last_access_time, m.created_at, m.updated_at
              FROM memory_items m
              JOIN memory_items_fts f ON m.rowid = f.rowid
              WHERE f.memory_items_fts MATCH ${sanitizedQuery}
                AND ${sql.unsafe(whereClause)}
              ORDER BY f.rank
              LIMIT ${limit}
            `.unprepared
            return rows.map(parseRow)
          }

          const rows = yield* sql`
            SELECT memory_item_id, agent_id, tier, scope, source,
                   content, metadata_json, generated_by_turn_id,
                   session_id, sensitivity, was_generated_by,
                   was_attributed_to, governed_by_retention,
                   last_access_time, created_at, updated_at
            FROM memory_items m
            WHERE ${sql.unsafe(whereClause)}
            ORDER BY created_at DESC
            LIMIT ${limit}
          `.unprepared
          return rows.map(parseRow)
        }).pipe(Effect.tapDefect(Effect.logError), Effect.orDie)

      const forget = (
        agentId: AgentId,
        filters: MemoryForgetFilters
      ): Effect.Effect<number> =>
        Effect.gen(function*() {
          const hasFilter = filters.cutoffDate !== undefined
            || filters.scope !== undefined
            || (filters.itemIds !== undefined && filters.itemIds.length > 0)

          if (!hasFilter) {
            return 0
          }

          const conditions = [`agent_id = '${agentId}'`]
          if (filters.cutoffDate) {
            conditions.push(`created_at < '${sqlInstant.encode(filters.cutoffDate)}'`)
          }
          if (filters.scope) {
            conditions.push(`scope = '${escapeSql(filters.scope)}'`)
          }
          if (filters.itemIds && filters.itemIds.length > 0) {
            const idList = filters.itemIds.map((id) => `'${escapeSql(id)}'`).join(",")
            conditions.push(`memory_item_id IN (${idList})`)
          }
          const whereClause = conditions.join(" AND ")

          const countResult = yield* sql`
            SELECT COUNT(*) as cnt FROM memory_items WHERE ${sql.unsafe(whereClause)}
          `.unprepared
          const count = Number(countResult[0]?.cnt ?? 0)

          if (count > 0) {
            yield* sql`
              DELETE FROM memory_items WHERE ${sql.unsafe(whereClause)}
            `.unprepared
          }

          return count
        }).pipe(Effect.tapDefect(Effect.logError), Effect.orDie)

      const listAll = (
        agentId: AgentId,
        filters: ListFilters
      ): Effect.Effect<ReadonlyArray<MemoryItemRow>> =>
        Effect.gen(function*() {
          const conditions = [`agent_id = '${agentId}'`]
          if (filters.tier) conditions.push(`tier = '${filters.tier}'`)
          if (filters.scope) conditions.push(`scope = '${filters.scope}'`)
          const whereClause = conditions.join(" AND ")

          const rows = yield* sql`
            SELECT memory_item_id, agent_id, tier, scope, source,
                   content, metadata_json, generated_by_turn_id,
                   session_id, sensitivity, was_generated_by,
                   was_attributed_to, governed_by_retention,
                   last_access_time, created_at, updated_at
            FROM memory_items
            WHERE ${sql.unsafe(whereClause)}
            ORDER BY created_at DESC
            LIMIT ${filters.limit}
          `.unprepared
          return rows.map(parseRow)
        }).pipe(Effect.tapDefect(Effect.logError), Effect.orDie)

      return { search, encode, retrieve, forget, listAll } as const
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}

const parseSearchRow = (row: any): MemoryItemRecord => ({
  memoryItemId: row.memory_item_id as MemoryItemId,
  agentId: row.agent_id as AgentId,
  tier: row.tier as MemoryTier,
  scope: row.scope as MemoryScope,
  source: row.source as MemorySource,
  content: row.content as string,
  metadataJson: row.metadata_json as string | null,
  generatedByTurnId: row.generated_by_turn_id as TurnId | null,
  sessionId: row.session_id as SessionId | null,
  sensitivity: row.sensitivity as SensitivityLevel,
  wasGeneratedBy: row.was_generated_by as AgentId | null,
  wasAttributedTo: row.was_attributed_to as AgentId | null,
  governedByRetention: row.governed_by_retention as string | null,
  lastAccessTime: sqlInstantNullable.decode(row.last_access_time as string | null),
  createdAt: sqlInstant.decode(row.created_at),
  updatedAt: sqlInstant.decode(row.updated_at)
})

const parseRow = (row: any): MemoryItemRow => parseSearchRow(row)

const escapeSql = (value: string): string => value.replace(/'/g, "''")

/** Sanitize user input for FTS5 MATCH by quoting each word as a literal term
 *  joined with OR so any matching term produces a result.
 *  Strips punctuation and FTS5 operators, then wraps each remaining word in
 *  double quotes so characters like commas, colons, and parentheses are safe. */
const sanitizeFts5Query = (input: string): string =>
  input
    .replace(/[^\w\s]/g, " ") // strip non-word, non-space chars
    .split(/\s+/) // split on whitespace
    .map((w) => w.trim())
    .filter((w) => w.length > 0)
    .map((w) => `"${w}"`) // quote each term for FTS5
    .join(" OR ")
