# SQL Codecs & Projection Layer Design

**Date:** 2026-03-03
**Status:** Approved

## Problem

The 13 `*PortSqlite.ts` files in `packages/server/src/` each duplicate the same codec boilerplate:

- **10+ copies** of `InstantFromSqlString` / `decodeSqlInstant` / `encodeSqlInstant`
- **4 divergent wrapper variants** for nullable/required DateTime helpers
- **7 independent** `Schema.fromJsonString(...)` + sync encode/decode pairs for JSON-in-column fields
- **50+ branded ID** `as` casts at the SQL boundary
- **20 row-decode functions** with inconsistent naming (`decodeRow`, `parseRow`, `toRecord`)
- **1 cursor codec** in MemoryPortSqlite that could be reusable

Some files also use `DateTime.formatIso` for encoding while others use `Schema.encodeSync`, creating a silent asymmetry.

## Solution

A shared `SqlCodecs` module that consolidates duplicated SQL codec primitives, plus an idiomatic `Schema.decodeTo` + `Transformation.transform` pattern for row-to-domain mapping.

### Module: `packages/server/src/persistence/SqlCodecs.ts`

#### Instant codecs

Replace all 10+ copies with a single pair:

```typescript
import { Schema } from "effect"
import type { DateTime } from "effect"
import * as Transformation from "effect/SchemaTransformation"

type Instant = DateTime.Utc

const InstantFromSqlString = Schema.DateTimeUtcFromString
const _decode = Schema.decodeUnknownSync(InstantFromSqlString)
const _encode = Schema.encodeSync(InstantFromSqlString)

export const sqlInstant = {
  decode: (value: string): Instant => _decode(value),
  encode: (instant: Instant): string => _encode(instant),
} as const

export const sqlInstantNullable = {
  decode: (v: string | null): Instant | null =>
    v === null ? null : _decode(v),
  encode: (v: Instant | null): string | null =>
    v === null ? null : _encode(v),
} as const
```

#### JSON-in-column factory

Replace per-file `Schema.fromJsonString` + sync pairs:

```typescript
export const sqlJsonColumn = <A, I>(schema: Schema.Schema<A, I>) => {
  const codec = Schema.fromJsonString(schema)
  return {
    codec,
    decode: Schema.decodeUnknownSync(codec),
    encode: Schema.encodeSync(codec),
  } as const
}
```

#### Cursor codec factory

Extracted from MemoryPortSqlite, generalized:

```typescript
export const sqlCursor = <T extends Record<string, unknown>>(
  schema: Schema.Schema<T, string>
) => ({
  encode: (fields: T): string =>
    Buffer.from(Schema.encodeSync(schema)(fields)).toString("base64url"),
  decode: (cursor: string): T | null =>
    Option.getOrNull(
      Schema.decodeOption(schema)(
        Buffer.from(cursor, "base64url").toString("utf8")
      )
    ),
})
```

#### Row transform re-export

```typescript
export { Transformation }
export const rowTransform = Transformation.transform
```

### Consumer pattern

Each port file defines a `RowSchema` (snake_case, raw SQL types) and a `DomainSchema` (camelCase, branded IDs, `DateTime.Utc`), then connects them via `Schema.decodeTo`:

```typescript
import { sqlInstant, sqlInstantNullable, sqlJsonColumn, rowTransform } from "../persistence/SqlCodecs.js"

const contentBlocksJson = sqlJsonColumn(Schema.Array(ContentBlockSchema))

const FromRow = RowSchema.pipe(
  Schema.decodeTo(DomainSchema, rowTransform({
    decode: (row) => ({
      turnId: row.turn_id as TurnId,
      contentBlocks: contentBlocksJson.decode(row.content_blocks_json),
      createdAt: sqlInstant.decode(row.created_at),
      lastAccessTime: sqlInstantNullable.decode(row.last_access_time),
    }),
    encode: (item) => ({
      turn_id: item.turnId,
      content_blocks_json: contentBlocksJson.encode(item.contentBlocks),
      created_at: sqlInstant.encode(item.createdAt),
      last_access_time: sqlInstantNullable.encode(item.lastAccessTime),
    }),
  }))
)
```

## Migration Plan

### Phase 1: Extract SqlCodecs (no breaking changes)

Create the shared module. No existing code changes.

### Phase 2: Migrate port files (one commit per file)

Each migration replaces local codec declarations with SqlCodecs imports. Each is independently testable.

| Order | File | Instant copies | JSON codecs | Notes |
|-------|------|:-:|:-:|---|
| 1 | `MemoryPortSqlite.ts` | 2 | 1 (cursor) | Also extract cursor helpers |
| 2 | `SessionTurnPortSqlite.ts` | 3 | 1 (ContentBlocks) | Largest decode function |
| 3 | `ChannelPortSqlite.ts` | 2 | 3 | Most JSON-in-column codecs |
| 4 | `GovernancePortSqlite.ts` | 2 | 0 | Has raw JSON.parse to fix |
| 5 | `SchedulePortSqlite.ts` | 4 | 0 | Most wrapper variants |
| 6 | `AgentStatePortSqlite.ts` | 2 | 0 | |
| 7 | `CheckpointPortSqlite.ts` | 2 | 0 | |
| 8 | `IntegrationPortSqlite.ts` | 2 | 1 | |
| 9 | `CompactionCheckpointPortSqlite.ts` | 2 | 0 | |
| 10 | `CompactionRunStatePortSqlite.ts` | 1 | 0 | Fixes DateTime.formatIso asymmetry |
| 11 | `SessionArtifactPortSqlite.ts` | 1 | 0 | Decode only |
| 12 | `SessionMetricsPortSqlite.ts` | 1 | 0 | Fixes DateTime.formatIso asymmetry |

### Phase 3 (optional): Adopt Schema.decodeTo pattern

Replace manual `decodeRow` functions with `RowSchema.pipe(Schema.decodeTo(...))` pipelines. Can be done incrementally per file, not required in Phase 2.

## Design Decisions

- **Object namespaces (`sqlInstant.decode`) over plain functions** -- Groups related encode/decode as a pair, makes imports cleaner, avoids name collisions.
- **Factory for JSON-in-column** -- Different ports wrap different schemas, so a factory (`sqlJsonColumn(schema)`) is more useful than a fixed codec.
- **Branded IDs stay as `as` casts** -- Creating Schema-level branded codecs for each of 19 ID types would be more ceremony than value. The `as` cast at the SQL boundary is explicit and type-safe enough.
- **Schema.decodeTo + Transformation.transform over manual functions** -- Provides bidirectional codec (decode + encode), composable with other Schema operations, idiomatic Effect v4.
- **Cursor factory is generic** -- Takes any Schema, not tied to MemoryPort's specific cursor shape.

## Future: Projection Layer (Phase 2+)

This module is the **foundation** for a broader projection layer. Once SQL codecs are consolidated, the next targets are:

1. **ContentBlock projections** -- `toPromptText`, `toMarkdown`, `toSqlJson` in one module
2. **TurnRecord projections** -- Unify `renderTurn`, `toMessageText`, JSONL event rendering
3. **MemoryItemRecord projections** -- Format for tool results, TUI display, search results
