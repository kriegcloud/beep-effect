---
name: custom-datetime-alignment
version: 2
created: 2024-12-24T12:00:00.000Z
iterations: 1
---

# Custom DateTime Alignment - Refined Prompt

## Context

The `beep-effect` monorepo uses Effect Schema for domain models and Drizzle ORM for database tables. A type mismatch exists between:

- **Domain Layer**: `BS.DateTimeUtcFromAllAcceptable` schema with encoded type `string | number | Date | DateTime.Utc`
- **Database Layer**: Drizzle's `pg.timestamp(..., { mode: "string" })` expecting `string | SQL<unknown> | Placeholder<string, any> | null | undefined`

This mismatch causes TypeScript compilation errors when inserting encoded domain payloads into Drizzle tables, as demonstrated in `packages/iam/server/src/adapters/repos/User.repo.ts:42-46`:

```typescript
// Type error: property banExpires incompatible
// Type 'string | number | Date | DateTime.Utc' is not assignable to type
// 'string | SQL<unknown> | Placeholder<string, any> | null | undefined'
client.insert(DbSchema.user).values(encodedPayload)
```

**Codebase Structure:**
- Custom column types live in `packages/shared/tables/src/columns/`
- Existing reference pattern: `bytea.ts` using Drizzle's `customType`
- 13 table files across 3 packages use `pg.timestamp` (21 total columns)
- 8 domain models use `DateTimeUtcFromAllAcceptable`

## Objective

Create a custom Drizzle column type that bridges the type gap between Effect Schema's `DateTimeUtcFromAllAcceptable` encoded type and PostgreSQL's timestamp storage, enabling seamless domain-to-database type flow.

**Success Criteria:**
1. `packages/shared/tables/src/columns/custom-datetime.ts` exports a working `datetime` custom column
2. The column accepts `string | number | Date | DateTime.Utc` as input types
3. The column stores values as `timestamp with time zone` in PostgreSQL
4. All 13 table files are updated to use the new column instead of `pg.timestamp`
5. `bun run check` passes with no type errors
6. The type error in `User.repo.ts` is resolved

## Role

You are an Effect TypeScript expert implementing a custom Drizzle column type. You have deep knowledge of:
- Effect Schema transformations (`S.transform`, `S.transformOrFail`)
- Effect DateTime module (`DateTime.formatIso`, `DateTime.make`, `DateTime.isDateTime`)
- Drizzle ORM custom types (`customType` from `drizzle-orm/pg-core`)
- The beep-effect codebase conventions and patterns

## Constraints

### Required Patterns (from AGENTS.md)

```typescript
// Effect namespace imports - MANDATORY
import * as DateTime from "effect/DateTime";
import * as S from "effect/Schema";
import * as F from "effect/Function";
import * as O from "effect/Option";

// Drizzle import
import { customType } from "drizzle-orm/pg-core";
```

### Forbidden Patterns

- ❌ `async/await` or bare Promises
- ❌ Native `Array.prototype.*` methods (use `A.map`, `A.filter`, etc.)
- ❌ Native `String.prototype.*` methods (use `Str.*`)
- ❌ Native `new Date()` constructor in application code (use `DateTime.*`)
- ❌ `any` type assertions or `@ts-ignore`

**Exception for Driver Functions**: In `toDriver()` and `fromDriver()`, you may use `new Date()` for converting numeric timestamps to Date objects, as this is the boundary layer between Effect and the database driver. This is consistent with how `DateTime.toDateUtc()` returns a native `Date` object.

### Technical Constraints

1. **PostgreSQL Type**: Must use `timestamp with time zone` (not plain `timestamp`)
2. **Mode**: Column must behave like `mode: "string"` (return ISO strings from DB)
3. **Drizzle Modifiers**: Must support `.defaultNow()`, `.$defaultFn()`, `.$onUpdateFn()`, `.notNull()`
4. **Sync Operations**: Use `S.encodeSync` / `S.decodeSync` in driver functions (explained below)
5. **Error Handling**: Invalid inputs throw `ParseError` from `effect/ParseResult`

### Why Synchronous Operations?

Drizzle's `customType` API expects synchronous `toDriver` and `fromDriver` functions because:
1. They run in the query builder context (not an async Effect runtime)
2. Validation errors must throw immediately for Drizzle to catch them
3. The functions are called during query construction, not execution

This is why we use `S.encodeSync` instead of `S.encode` with Effect runtime.

### Error Handling Pattern

When `S.encodeSync` encounters invalid input, it throws a `ParseError` from `effect/ParseResult`. This is the expected behavior - Drizzle's customType catches synchronous throws for validation failures.

```typescript
import { ParseError } from "effect/ParseResult";

toDriver(value: string | number | Date | DateTime.Utc): string {
  // S.encodeSync throws ParseError automatically on invalid input
  // No try/catch needed - let Drizzle handle the validation error
  return S.encodeSync(DateTimeToIsoStringSchema)(value);
}
```

### Type Alignment

The custom column generic must be:
```typescript
customType<{
  data: string | number | Date | DateTime.Utc;
  driverData: string;
}>
```

### Edge Cases to Handle

| Input | Expected Behavior |
|-------|------------------|
| Valid ISO string `"2024-12-24T12:00:00.000Z"` | Pass through as-is (validated) |
| Empty string `""` | Throw `ParseError` |
| Invalid string `"not-a-date"` | Throw `ParseError` |
| Unix timestamp `0` | Convert to `"1970-01-01T00:00:00.000Z"` |
| Negative timestamp `-1000` | Convert to valid ISO string |
| Native `Date` object | Convert via `DateTime.fromDate` → `formatIso` |
| `DateTime.Utc` instance | Convert via `DateTime.formatIso` |
| `null` | Allow for nullable columns (Drizzle handles) |

## Resources

### Files to Read (Before Implementation)

| File | Purpose |
|------|---------|
| `packages/shared/tables/src/columns/bytea.ts` | Reference `customType` pattern |
| `packages/shared/tables/src/columns/index.ts` | Barrel export pattern |
| `packages/shared/tables/src/common.ts` | Audit column patterns, `utcNow` helper |
| `packages/common/schema/src/primitives/temporal/dates/date-time.ts:195-228` | `DateTimeUtcFromAllAcceptable` definition |
| `packages/iam/server/src/adapters/repos/User.repo.ts:39-54` | Type error demonstration |

### Files to Modify

**Implementation (1 file):**
- `packages/shared/tables/src/columns/custom-datetime.ts` - Create the custom column

**Barrel Export (1 file):**
- `packages/shared/tables/src/columns/index.ts` - Export the new column

**Table Updates (13 files):**

| Package | Files |
|---------|-------|
| `packages/shared/tables/src/tables/` | `user.table.ts`, `session.table.ts`, `upload-session.table.ts` |
| `packages/shared/tables/src/` | `common.ts` (audit columns) |
| `packages/iam/tables/src/tables/` | `account.table.ts`, `apiKey.table.ts`, `deviceCodes.table.ts`, `invitation.table.ts`, `jwks.table.ts`, `member.table.ts`, `oauthAccessToken.table.ts`, `subscription.table.ts`, `verification.table.ts` |

### Documentation to Consult

- Effect DateTime: `mcp__effect_docs__effect_docs_search` with query "DateTime formatIso make isDateTime"
- Effect Schema transforms: `mcp__effect_docs__effect_docs_search` with query "Schema transform encodeSync decodeSync"

## Output Specification

### Deliverable 1: Custom Column Implementation

File: `packages/shared/tables/src/columns/custom-datetime.ts`

**Required Schema Definition:**

```typescript
import { customType } from "drizzle-orm/pg-core";
import * as S from "effect/Schema";
import * as DateTime from "effect/DateTime";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Match from "effect/Match";

/**
 * Schema that accepts DateTimeUtcFromAllAcceptable encoded types
 * and transforms them to ISO string format for database storage.
 *
 * Input types: string | number | Date | DateTime.Utc
 * Output type: string (ISO 8601 format)
 */
const DateTimeToIsoString = S.transform(
  S.Union(S.String, S.Number, S.DateFromSelf, S.DateTimeUtcFromSelf),
  S.String,
  {
    strict: true,
    decode: (input) =>
      Match.value(input).pipe(
        Match.when(DateTime.isDateTime, (dt) => DateTime.formatIso(dt)),
        Match.when((v): v is Date => v instanceof Date, (d) =>
          F.pipe(
            DateTime.fromDate(d),
            DateTime.formatIso
          )
        ),
        Match.when(S.is(S.Number), (n) =>
          F.pipe(
            DateTime.unsafeMake(n),
            DateTime.formatIso
          )
        ),
        Match.when(S.is(S.String), (str) =>
          F.pipe(
            DateTime.make(str),
            O.map(DateTime.formatIso),
            O.getOrThrowWith(() => new Error(`Invalid datetime string: ${str}`))
          )
        ),
        Match.exhaustive
      ),
    encode: F.identity,
  }
);

/**
 * Custom datetime column that accepts Effect Schema's DateTimeUtcFromAllAcceptable
 * encoded types and stores as PostgreSQL timestamp with time zone.
 *
 * @example
 * ```typescript
 * import { datetime } from "@beep/shared-tables/columns";
 *
 * export const myTable = pgTable("my_table", {
 *   expiresAt: datetime("expires_at"),
 *   createdAt: datetime("created_at").defaultNow().notNull(),
 * });
 * ```
 */
export const datetime = customType<{
  data: string | number | Date | DateTime.Utc;
  driverData: string;
}>({
  dataType() {
    return "timestamp with time zone";
  },
  toDriver(value: string | number | Date | DateTime.Utc): string {
    return S.encodeSync(DateTimeToIsoString)(value);
  },
  fromDriver(value: string): string {
    // Return as string for mode: "string" compatibility
    return value;
  },
});

// Export the input type for external use
export type DateTimeInput = string | number | Date | DateTime.Utc;
```

### Deliverable 2: Updated Table Files

Each table file should replace:
```typescript
// Before
import * as pg from "drizzle-orm/pg-core";
// ...
pg.timestamp("column_name", { withTimezone: true, mode: "string" })

// After
import { datetime } from "@beep/shared-tables/columns";
// or for IAM/Documents packages:
import { datetime } from "../../../shared/tables/src/columns";
// ...
datetime("column_name")
```

**Migration Order** (to avoid cascading type errors):
1. Create `custom-datetime.ts`
2. Export from `columns/index.ts`
3. Update `common.ts` audit columns (most referenced)
4. Update shared/tables files
5. Update iam/tables files
6. Update documents/tables files (if any)
7. Run `bun run check` to verify

### Deliverable 3: Verification

Run and confirm passing:
```bash
bun run check    # Type checking
bun run lint     # Biome lint
bun run build    # Compilation
```

## Examples

### Example 1: Custom Column Definition Pattern (from bytea.ts)

```typescript
import { customType } from "drizzle-orm/pg-core";

export const bytea = customType<{ data: Uint8Array; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
  toDriver(value: Uint8Array): Buffer {
    return Buffer.from(value);
  },
  fromDriver(value: Buffer): Uint8Array {
    return new Uint8Array(value);
  },
});
```

### Example 2: Expected datetime Column Usage

```typescript
// In table definition
import * as pg from "drizzle-orm/pg-core";
import { datetime } from "@beep/shared-tables/columns";

export const userTable = pg.pgTable("user", {
  id: pg.uuid("id").primaryKey(),
  banExpires: datetime("ban_expires"),  // Accepts string | number | Date | DateTime.Utc
  createdAt: datetime("created_at").defaultNow().notNull(),
});

// In repository - now type-safe
const encodedPayload = yield* S.encode(InsertUserPayload)(payload);
// encodedPayload.banExpires is string | number | Date | DateTime.Utc
// datetime column accepts this directly - no type error!
client.insert(DbSchema.user).values(encodedPayload);
```

### Example 3: toDriver/fromDriver Implementation Pattern

```typescript
// CORRECT: Synchronous operations in driver functions
toDriver(value: string | number | Date | DateTime.Utc): string {
  // S.encodeSync throws ParseError on invalid input
  return S.encodeSync(DateTimeToIsoString)(value);
}

fromDriver(value: string): string {
  // Return as-is for mode: "string" behavior
  // Drizzle sends ISO strings from PostgreSQL
  return value;
}
```

### Example 4: Column Modifier Compatibility

```typescript
// All Drizzle modifiers work with datetime column:
datetime("created_at").defaultNow().notNull()     // SQL now() default
datetime("updated_at").$onUpdateFn(() => {        // Client-side update
  return DateTime.formatIso(DateTime.unsafeNow());
})
datetime("expires_at")                             // Nullable by default
```

## Verification Checklist

### Implementation Quality
- [ ] Custom column uses `customType` from `drizzle-orm/pg-core`
- [ ] Generic types correctly specify `data` and `driverData` types
- [ ] `dataType()` returns `"timestamp with time zone"`
- [ ] `toDriver()` converts all union cases to ISO string using `S.encodeSync`
- [ ] `fromDriver()` returns string (for mode: "string" compatibility)
- [ ] Schema uses `S.transform` with synchronous decode/encode functions
- [ ] Uses `Match.exhaustive` for type-safe union handling
- [ ] Comprehensive JSDoc with usage examples

### Codebase Integration
- [ ] Exported from `packages/shared/tables/src/columns/index.ts`
- [ ] All 13 table files updated to use `datetime` column
- [ ] `common.ts` audit columns updated
- [ ] Import statements use Effect namespace conventions
- [ ] No forbidden patterns used (except allowed Date in driver layer)

### Validation
- [ ] `bun run check` passes
- [ ] `bun run lint` passes
- [ ] `bun run build` passes
- [ ] Type error in `User.repo.ts` is resolved
- [ ] `bun run db:generate` succeeds (run after modifying table schemas to regenerate types)

### Type Inference Verification
- [ ] IntelliSense shows correct types when hovering over `datetime("column_name")`
- [ ] Type of `encodedPayload.banExpires` is assignable to `datetime` column input
- [ ] No type widening to `any` in column definition

---

## Metadata

### Research Sources

**Files Explored:**
- `packages/iam/server/src/adapters/repos/User.repo.ts` - Type error demonstration
- `packages/shared/tables/src/columns/bytea.ts` - customType pattern
- `packages/shared/tables/src/columns/index.ts` - Barrel exports
- `packages/shared/tables/src/common.ts` - Audit columns, utcNow helper
- `packages/common/schema/src/primitives/temporal/dates/date-time.ts` - DateTimeUtcFromAllAcceptable
- `packages/shared/tables/src/tables/user.table.ts` - Table pattern
- All 13 table files with pg.timestamp usage

**Documentation Referenced:**
- Effect DateTime module patterns
- Effect Schema transform, encodeSync, decodeSync
- Effect Match for exhaustive pattern matching
- Drizzle ORM customType API

**AGENTS.md Files Consulted:**
- `packages/shared/tables/AGENTS.md`
- `packages/shared/server/AGENTS.md`
- `packages/iam/tables/AGENTS.md`
- `packages/iam/server/AGENTS.md`
- `packages/documents/tables/AGENTS.md`
- `packages/common/schema/AGENTS.md`

### Refinement History

| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0 | Initial | N/A |
| 1 | 3 HIGH, 4 MEDIUM/LOW | Removed async Example 3, added sync pattern; Fixed native Date violations with DateTime methods; Added explicit error handling section; Added concrete schema definition; Standardized DateTime.Utc capitalization; Added complete imports to examples; Clarified db:generate qualifier; Added edge cases table; Added migration order; Added type inference verification |
