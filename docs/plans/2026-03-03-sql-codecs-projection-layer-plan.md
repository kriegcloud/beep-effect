# SQL Codecs Projection Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract duplicated SQL codec boilerplate from 13 PortSqlite files into a shared `SqlCodecs` module, then migrate port files to use it.

**Architecture:** A shared `persistence/SqlCodecs.ts` module exports instant codecs, a JSON-in-column factory, and a cursor factory. Port files replace local codec declarations with imports. Uses `Transformation.transform` from `effect/SchemaTransformation` for the row-transform pattern (optional per-file adoption).

**Tech Stack:** Effect v4 Schema, `effect/SchemaTransformation`, `@effect/vitest`

---

### Task 1: Create SqlCodecs Module

**Files:**
- Create: `packages/server/src/persistence/SqlCodecs.ts`

**Step 1: Write the module**

```typescript
// packages/server/src/persistence/SqlCodecs.ts
import { Option, Schema } from "effect"
import type { DateTime } from "effect"
import * as Transformation from "effect/SchemaTransformation"

type Instant = DateTime.Utc

// ── Instant codecs ──
// Replaces 10+ copies of InstantFromSqlString / decodeSqlInstant / encodeSqlInstant

const InstantFromSqlString = Schema.DateTimeUtcFromString
const _decodeInstant = Schema.decodeUnknownSync(InstantFromSqlString)
const _encodeInstant = Schema.encodeSync(InstantFromSqlString)

/** Decode/encode a required (non-nullable) SQL TEXT column to/from DateTime.Utc */
export const sqlInstant = {
  decode: (value: string): Instant => _decodeInstant(value),
  encode: (instant: Instant): string => _encodeInstant(instant),
} as const

/** Decode/encode a nullable SQL TEXT column to/from DateTime.Utc | null */
export const sqlInstantNullable = {
  decode: (value: string | null): Instant | null =>
    value === null ? null : _decodeInstant(value),
  encode: (instant: Instant | null): string | null =>
    instant === null ? null : _encodeInstant(instant),
} as const

// ── JSON-in-column factory ──
// Replaces per-file Schema.fromJsonString + decodeUnknownSync/encodeSync pairs

/** Create decode/encode pair for a JSON string stored in a SQLite TEXT column. */
export const sqlJsonColumn = <A, I>(schema: Schema.Schema<A, I>) => {
  const codec = Schema.fromJsonString(schema)
  return {
    codec,
    decode: Schema.decodeUnknownSync(codec),
    encode: Schema.encodeSync(codec),
  } as const
}

// ── Cursor factory ──
// Extracted from MemoryPortSqlite, generalized for any cursor shape

/** Create base64url cursor encode/decode for keyset pagination. */
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

// ── Row transform re-export ──
// Standardized pattern: RowSchema.pipe(Schema.decodeTo(DomainSchema, rowTransform({ decode, encode })))

export { Transformation }
export const rowTransform = Transformation.transform
```

**Step 2: Verify module compiles**

Run: `cd packages/server && bun run check:noEmit` (or `tsc --noEmit -p tsconfig.src.json`)
Expected: PASS (no type errors)

**Step 3: Commit**

```bash
git add packages/server/src/persistence/SqlCodecs.ts
git commit -m "feat: add shared SqlCodecs module for SQL codec consolidation"
```

---

### Task 2: Test SqlCodecs

**Files:**
- Create: `packages/server/test/SqlCodecs.test.ts`

**Step 1: Write the tests**

```typescript
// packages/server/test/SqlCodecs.test.ts
import { describe, expect, it } from "@effect/vitest"
import { DateTime, Option, Schema } from "effect"
import fc from "fast-check"
import { sqlCursor, sqlInstant, sqlInstantNullable, sqlJsonColumn } from "../src/persistence/SqlCodecs.js"

describe("sqlInstant", () => {
  it("decode parses ISO string to DateTime.Utc", () => {
    const result = sqlInstant.decode("2026-01-15T10:30:00.000Z")
    expect(DateTime.formatIso(result)).toBe("2026-01-15T10:30:00.000Z")
  })

  it("encode formats DateTime.Utc to ISO string", () => {
    const instant = DateTime.fromDateUnsafe(new Date("2026-01-15T10:30:00.000Z"))
    const result = sqlInstant.encode(instant)
    expect(result).toBe("2026-01-15T10:30:00.000Z")
  })

  it("round-trips: encode(decode(s)) === s for valid ISO strings", () => {
    const iso = "2026-06-15T08:00:00.000Z"
    expect(sqlInstant.encode(sqlInstant.decode(iso))).toBe(iso)
  })

  it("decode throws on invalid input", () => {
    expect(() => sqlInstant.decode("not-a-date")).toThrow()
  })
})

describe("sqlInstantNullable", () => {
  it("decode returns null for null input", () => {
    expect(sqlInstantNullable.decode(null)).toBeNull()
  })

  it("encode returns null for null input", () => {
    expect(sqlInstantNullable.encode(null)).toBeNull()
  })

  it("decode parses non-null string", () => {
    const result = sqlInstantNullable.decode("2026-01-15T10:30:00.000Z")
    expect(result).not.toBeNull()
    expect(DateTime.formatIso(result!)).toBe("2026-01-15T10:30:00.000Z")
  })

  it("encode formats non-null DateTime", () => {
    const instant = DateTime.fromDateUnsafe(new Date("2026-01-15T10:30:00.000Z"))
    expect(sqlInstantNullable.encode(instant)).toBe("2026-01-15T10:30:00.000Z")
  })
})

describe("sqlJsonColumn", () => {
  const Tags = sqlJsonColumn(Schema.Array(Schema.String))

  it("decode parses JSON string to typed array", () => {
    const result = Tags.decode('["a","b","c"]')
    expect(result).toEqual(["a", "b", "c"])
  })

  it("encode serializes typed array to JSON string", () => {
    const result = Tags.encode(["x", "y"])
    expect(result).toBe('["x","y"]')
  })

  it("round-trips: encode(decode(s)) produces equivalent JSON", () => {
    const input = '["alpha","beta"]'
    expect(JSON.parse(Tags.encode(Tags.decode(input)))).toEqual(JSON.parse(input))
  })

  it("decode throws on invalid JSON", () => {
    expect(() => Tags.decode("not-json")).toThrow()
  })

  it("decode throws on wrong shape", () => {
    expect(() => Tags.decode('{"not":"an-array"}')).toThrow()
  })
})

describe("sqlCursor", () => {
  const CursorSchema = Schema.fromJsonString(
    Schema.Struct({ createdAt: Schema.String, rowid: Schema.Int })
  )
  const cursor = sqlCursor(CursorSchema)

  it("encode produces base64url string", () => {
    const result = cursor.encode({ createdAt: "2026-01-01T00:00:00Z", rowid: 42 })
    expect(typeof result).toBe("string")
    expect(result.length).toBeGreaterThan(0)
  })

  it("round-trips: decode(encode(x)) === x", () => {
    const input = { createdAt: "2026-01-01T00:00:00Z", rowid: 42 }
    const encoded = cursor.encode(input)
    const decoded = cursor.decode(encoded)
    expect(decoded).toEqual(input)
  })

  it("decode returns null for garbage input", () => {
    expect(cursor.decode("not-valid-base64!!!")).toBeNull()
    expect(cursor.decode("")).toBeNull()
  })

  it("decode returns null for valid base64 but wrong shape", () => {
    const badJson = Buffer.from('{"wrong":"shape"}').toString("base64url")
    expect(cursor.decode(badJson)).toBeNull()
  })

  it("property: arbitrary cursors round-trip", () => {
    const CursorData = Schema.Struct({ createdAt: Schema.String, rowid: Schema.Int })
    const arb = Schema.toArbitrary(CursorData) as fc.Arbitrary<{
      readonly createdAt: string
      readonly rowid: number
    }>

    fc.assert(
      fc.property(arb, (data) => {
        const encoded = cursor.encode(data)
        const decoded = cursor.decode(encoded)
        expect(decoded).not.toBeNull()
        expect(decoded!.createdAt).toBe(data.createdAt)
        expect(decoded!.rowid).toBe(data.rowid)
      }),
      { numRuns: 200 }
    )
  })

  it("property: random strings never crash decode", () => {
    fc.assert(
      fc.property(fc.string(), (randomString) => {
        const decoded = cursor.decode(randomString)
        if (decoded !== null) {
          expect(typeof decoded.createdAt).toBe("string")
          expect(Number.isInteger(decoded.rowid)).toBe(true)
        }
      }),
      { numRuns: 500 }
    )
  })
})
```

**Step 2: Run tests to verify they pass**

Run: `cd packages/server && bun run test -- test/SqlCodecs.test.ts`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add packages/server/test/SqlCodecs.test.ts
git commit -m "test: add SqlCodecs unit and property tests"
```

---

### Task 3: Migrate MemoryPortSqlite

**Files:**
- Modify: `packages/server/src/MemoryPortSqlite.ts` (lines 17-18, 22-27, 265-296)
- Test: `packages/server/test/MemoryPortSqlite.test.ts` (existing — run to verify no regression)

**Step 1: Replace local codec declarations with SqlCodecs imports**

At the top of the file, replace:
```typescript
const InstantFromSqlString = Schema.DateTimeUtcFromString
const decodeSqlInstant = Schema.decodeUnknownSync(InstantFromSqlString)
```

And the cursor section:
```typescript
const CursorSchema = Schema.Struct({
  createdAt: Schema.String,
  rowid: Schema.Int
})
const CursorFromJsonString = Schema.fromJsonString(CursorSchema)
```

With imports from SqlCodecs:
```typescript
import { sqlCursor, sqlInstant, sqlInstantNullable } from "./persistence/SqlCodecs.js"

const CursorSchema = Schema.fromJsonString(
  Schema.Struct({ createdAt: Schema.String, rowid: Schema.Int })
)
const cursor = sqlCursor(CursorSchema)
```

**Step 2: Update all call sites in the file**

- `decodeSqlInstant(row.created_at)` → `sqlInstant.decode(row.created_at)` (in `parseSearchRow`, lines 282-283)
- `DateTime.fromDateUnsafe(new Date(row.last_access_time as string))` → `sqlInstant.decode(row.last_access_time as string)` (line 280 — also fixes the ad-hoc DateTime parsing)
- `DateTime.formatIso(now)` → `sqlInstant.encode(now)` (in `encode` method, line ~110)
- `Schema.encodeSync(CursorFromJsonString)(...)` → `cursor.encode(...)` (line 288-289)
- `Schema.decodeOption(CursorFromJsonString)(...)` → inline replaced by `cursor.decode(...)` (lines 291-296)
- Remove the standalone `encodeCursor` and `decodeCursor` functions and use `cursor.encode`/`cursor.decode` at call sites

**Step 3: Run existing tests to verify no regression**

Run: `cd packages/server && bun run test -- test/MemoryPortSqlite.test.ts`
Expected: All tests PASS (identical behavior)

**Step 4: Commit**

```bash
git add packages/server/src/MemoryPortSqlite.ts
git commit -m "refactor: migrate MemoryPortSqlite to shared SqlCodecs"
```

---

### Task 4: Migrate SessionTurnPortSqlite

**Files:**
- Modify: `packages/server/src/SessionTurnPortSqlite.ts` (lines 42-50, 296-329)
- Test: `packages/server/test/SessionTurnPortSqlite.test.ts` (existing)

**Step 1: Replace local codec declarations**

Remove lines 42-50:
```typescript
const ContentBlocksFromJsonString = Schema.fromJsonString(Schema.Array(ContentBlockSchema))
const InstantFromSqlString = Schema.DateTimeUtcFromString
const decodeSessionRowSchema = Schema.decodeUnknownSync(SessionRowSchema)
const decodeTurnRowSchema = Schema.decodeUnknownSync(TurnRowSchema)
const decodeContentBlocksJson = Schema.decodeUnknownSync(ContentBlocksFromJsonString)
const encodeContentBlocksJson = Schema.encodeSync(ContentBlocksFromJsonString)
const decodeSqlInstant = Schema.decodeUnknownSync(InstantFromSqlString)
const encodeSqlInstant = Schema.encodeSync(InstantFromSqlString)
```

Replace with:
```typescript
import { sqlInstant, sqlJsonColumn } from "./persistence/SqlCodecs.js"

const contentBlocksJson = sqlJsonColumn(Schema.Array(ContentBlockSchema))
const decodeSessionRowSchema = Schema.decodeUnknownSync(SessionRowSchema)
const decodeTurnRowSchema = Schema.decodeUnknownSync(TurnRowSchema)
```

**Step 2: Update all call sites**

- `decodeContentBlocksJson(...)` → `contentBlocksJson.decode(...)`
- `encodeContentBlocksJson(...)` → `contentBlocksJson.encode(...)`
- `decodeSqlInstant(...)` → `sqlInstant.decode(...)`
- `encodeSqlInstant(...)` → `sqlInstant.encode(...)`
- Remove `toSqlInstant` and `fromRequiredSqlInstant` wrappers (lines ~327-329) — use `sqlInstant.encode`/`sqlInstant.decode` directly

**Step 3: Run existing tests**

Run: `cd packages/server && bun run test -- test/SessionTurnPortSqlite.test.ts`
Expected: All tests PASS

**Step 4: Commit**

```bash
git add packages/server/src/SessionTurnPortSqlite.ts
git commit -m "refactor: migrate SessionTurnPortSqlite to shared SqlCodecs"
```

---

### Task 5: Migrate ChannelPortSqlite

**Files:**
- Modify: `packages/server/src/ChannelPortSqlite.ts` (lines 35-46)
- Test: `packages/server/test/ChannelPortSqlite.test.ts` (existing)

**Step 1: Replace local codec declarations**

Remove lines 35-46 (6 JSON codec lines + 2 instant lines + their decode/encode pairs). Replace with:
```typescript
import { sqlInstant, sqlInstantNullable, sqlJsonColumn } from "./persistence/SqlCodecs.js"

const capabilitiesJson = sqlJsonColumn(Schema.Array(ChannelCapability))
const modelOverrideJson = sqlJsonColumn(ModelOverrideSchema)
const generationConfigOverrideJson = sqlJsonColumn(GenerationConfigOverrideSchema)
```

**Step 2: Update all call sites**

- `decodeCapabilitiesJson(...)` → `capabilitiesJson.decode(...)`
- `encodeCapabilitiesJson(...)` → `capabilitiesJson.encode(...)`
- `decodeModelOverrideJson(...)` → `modelOverrideJson.decode(...)`
- `encodeModelOverrideJson(...)` → `modelOverrideJson.encode(...)`
- `decodeGenerationConfigOverrideJson(...)` → `generationConfigOverrideJson.decode(...)`
- `encodeGenerationConfigOverrideJson(...)` → `generationConfigOverrideJson.encode(...)`
- `decodeSqlInstant(...)` → `sqlInstant.decode(...)`
- `encodeSqlInstant(...)` → `sqlInstant.encode(...)`
- For nullable timestamps (like `last_turn_at`), use `sqlInstantNullable.decode(...)`

**Step 3: Run existing tests**

Run: `cd packages/server && bun run test -- test/ChannelPortSqlite.test.ts`
Expected: All tests PASS

**Step 4: Commit**

```bash
git add packages/server/src/ChannelPortSqlite.ts
git commit -m "refactor: migrate ChannelPortSqlite to shared SqlCodecs"
```

---

### Task 6: Migrate remaining port files (batch)

Migrate each of the remaining 10 files with the same pattern. Each is a straightforward find-and-replace of local codec declarations with SqlCodecs imports.

**Files (in order):**
1. `GovernancePortSqlite.ts` — Also fix `parseToolDefinitionIds` to use `sqlJsonColumn` instead of raw `JSON.parse`
2. `SchedulePortSqlite.ts` — Remove all 4 wrapper variants (`toRequiredSqlInstant`, `toSqlInstant`, `fromRequiredSqlInstant`, `fromSqlInstant`)
3. `AgentStatePortSqlite.ts` — Remove `fromSqlInstant`/`toSqlInstant` nullable wrappers (use `sqlInstantNullable`)
4. `CheckpointPortSqlite.ts` — Straightforward instant replacement
5. `IntegrationPortSqlite.ts` — Replace `CapabilitiesFromJsonString` with `sqlJsonColumn`
6. `CompactionCheckpointPortSqlite.ts` — Straightforward
7. `CompactionRunStatePortSqlite.ts` — Fixes `DateTime.formatIso` asymmetry
8. `SessionArtifactPortSqlite.ts` — Decode only
9. `SessionMetricsPortSqlite.ts` — Fixes `DateTime.formatIso` asymmetry
10. `ScheduleActionCodec.ts` — Replace `BackgroundActionFromJson` with `sqlJsonColumn`

**For each file:**
1. Replace local `InstantFromSqlString` / `decodeSqlInstant` / `encodeSqlInstant` with import from SqlCodecs
2. Replace local `Schema.fromJsonString` + sync pairs with `sqlJsonColumn`
3. Remove any wrapper functions (`fromSqlInstant`, `toSqlInstant`, etc.)
4. Run the corresponding test file
5. Commit

**Run full test suite after all migrations:**

Run: `cd packages/server && bun run test`
Expected: All tests PASS

**Final commit (if batched):**

```bash
git add packages/server/src/*.ts packages/server/src/persistence/*.ts packages/server/src/scheduler/*.ts
git commit -m "refactor: migrate remaining PortSqlite files to shared SqlCodecs"
```

---

### Task 7: Verify and clean up

**Step 1: Verify no remaining duplication**

Run: `grep -rn "InstantFromSqlString\|const decodeSqlInstant\|const encodeSqlInstant" packages/server/src/ --include="*.ts"`
Expected: Zero matches outside of `SqlCodecs.ts`

**Step 2: Run full test suite**

Run: `cd packages/server && bun run test`
Expected: All tests PASS

**Step 3: Type check**

Run: `cd packages/server && bun run check:noEmit`
Expected: PASS

**Step 4: Final commit if needed**

```bash
git commit -m "chore: verify SqlCodecs migration complete"
```
