# Error Pattern Catalog

Generated: 2026-02-04
Total patterns: 45

## TypeScript Errors

### TS001: Implicit any in generics
**Symptom:** Type inference fails silently, resulting in `any` type
**Wrong:**
```typescript
const result = someGenericFn()  // Implicit any
const value = map.get(key)!     // Non-null assertion
```
**Correct:**
```typescript
const result = someGenericFn<ExpectedType>()
const value = O.fromNullable(map.get(key))  // Use Option
```
**Source:** `.claude/rules/effect-patterns.md:325-340`

---

### TS002: Using @ts-ignore or unchecked casts
**Symptom:** TypeScript errors suppressed, leading to runtime failures
**Wrong:**
```typescript
// @ts-ignore
const value = data as any
const user = {} as User  // Unchecked cast
```
**Correct:**
```typescript
const value = S.decodeUnknown(UserSchema)(data)
const user = yield* Effect.try(() => parseUser(raw))
```
**Source:** `.claude/rules/general.md:5`

---

### TS003: Missing .$type<>() on table columns
**Symptom:** Type-unsafe joins, mixing different entity ID types compiles successfully but causes runtime bugs
**Wrong:**
```typescript
export const entityTable = Table.make(KnowledgeEntityIds.EntityId)({
  ontologyId: pg.text("ontology_id").notNull(),  // Missing .$type<>()
  documentId: pg.text("document_id"),
});
```
**Correct:**
```typescript
export const entityTable = Table.make(KnowledgeEntityIds.EntityId)({
  ontologyId: pg.text("ontology_id").notNull()
    .$type<KnowledgeEntityIds.OntologyId.Type>(),
  documentId: pg.text("document_id")
    .$type<DocumentsEntityIds.DocumentId.Type>(),
});
```
**Source:** `.claude/rules/effect-patterns.md:165-173`, `documentation/patterns/database-patterns.md:126-187`

---

### TS004: Type import vs value import confusion
**Symptom:** Cannot use imported schema in Request schema definitions
**Wrong:**
```typescript
import { type SharedEntityIds } from "@beep/shared-domain";
// Then: SharedEntityIds.OrganizationId  // Error: type-only import
```
**Correct:**
```typescript
import { SharedEntityIds } from "@beep/shared-domain";
// Now works in Request schema definitions
```
**Source:** `specs/knowledge-repo-sqlschema-refactor/REFLECTION_LOG.md:386`

---

## Effect Errors

### EFF001: Missing yield* in Effect.gen
**Symptom:** Effect not executed, returns Effect object instead of result
**Wrong:**
```typescript
Effect.gen(function* () {
  const result = someEffect();  // Missing yield*
  return result;
});
```
**Correct:**
```typescript
Effect.gen(function* () {
  const result = yield* someEffect();
  return result;
});
```
**Source:** `specs/e2e-testkit-migration/REFLECTION_LOG.md:471`

---

### EFF002: Effect.fn vs Effect.gen confusion in tests
**Symptom:** Test function returns Effect instead of executing it
**Wrong:**
```typescript
Effect.fn(function* () {
  // Effect.fn returns a function, not an Effect!
}).pipe(Effect.provide(TestLayer))
```
**Correct:**
```typescript
effect("test name", () =>
  Effect.gen(function* () {
    const result = yield* someEffect();
  }).pipe(Effect.provide(TestLayer))
);
```
**Source:** `specs/knowledge-completion/REFLECTION_LOG.md:295-320`

---

### EFF003: Using Effect.runPromise in tests
**Symptom:** Tests use manual Effect execution instead of testkit runners
**Wrong:**
```typescript
import { test } from "bun:test";
test("wrong", async () => {
  await Effect.gen(function* () {
    const result = yield* someEffect();
  }).pipe(Effect.provide(TestLayer), Effect.runPromise);  // FORBIDDEN!
});
```
**Correct:**
```typescript
import { effect, layer } from "@beep/testkit";
effect("test name", () =>
  Effect.gen(function* () {
    const result = yield* someEffect();
  }).pipe(Effect.provide(TestLayer))
);
```
**Source:** `.claude/rules/effect-patterns.md:625-639`, `.claude/rules/general.md:68-71`

---

### EFF004: Double LanguageModel reference
**Symptom:** Service injection fails with unclear error
**Wrong:**
```typescript
const model = yield* LanguageModel;  // Wrong - LanguageModel is namespace
```
**Correct:**
```typescript
const model = yield* LanguageModel.LanguageModel;  // First is namespace, second is class/tag
```
**Source:** `specs/knowledge-completion/REFLECTION_LOG.md:219`

---

### EFF005: Using native Error constructors
**Symptom:** Untyped errors, no tag for catchTag, unclear error handling
**Wrong:**
```typescript
new Error("Something went wrong")
Effect.die(new Error("Fatal"))
throw new Error("Bad input")
```
**Correct:**
```typescript
export class MyError extends S.TaggedError<MyError>()("MyError", {
  message: S.String,
}) {}
Effect.fail(new MyError({ message: "Something went wrong" }))
```
**Source:** `.claude/rules/effect-patterns.md:309-322`

---

### EFF006: S.TaggedError signature wrong
**Symptom:** TypeScript error on schema definition
**Wrong:**
```typescript
S.TaggedError<T>("Tag")({ fields })  // Wrong parentheses
```
**Correct:**
```typescript
S.TaggedError<T>()("Tag", { fields })  // Empty parens before tag string
```
**Source:** `specs/knowledge-completion/REFLECTION_LOG.md:392`

---

### EFF007: ParseError not caught in SqlSchema operations
**Symptom:** Unhandled ParseError causes Effect to crash
**Wrong:**
```typescript
const findByIds = (...) =>
  findByIdsSchema({ ids: [...ids], organizationId }).pipe(
    Effect.mapError(DatabaseError.$match),
  );
```
**Correct:**
```typescript
const findByIds = (...) =>
  findByIdsSchema({ ids: [...ids], organizationId }).pipe(
    Effect.catchTag("ParseError", (e) => Effect.die(e)),
    Effect.mapError(DatabaseError.$match),
  );
```
**Source:** `specs/knowledge-repo-sqlschema-refactor/REFLECTION_LOG.md:55-57`

---

### EFF008: Layer not provided for service
**Symptom:** Runtime error - service not found
**Wrong:**
```typescript
const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  // No layer provided!
});
```
**Correct:**
```typescript
const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
}).pipe(Effect.provide(BunFileSystem.layer));
```
**Source:** `documentation/EFFECT_PATTERNS.md:317-338`

---

### EFF009: Using A.replicate with 0
**Symptom:** Unexpected single element array instead of empty
**Wrong:**
```typescript
A.replicate("..", 0)  // Returns [".."] instead of []!
```
**Correct:**
```typescript
depth === 0 ? [] : A.replicate("..", depth)  // Explicit check
```
**Source:** `specs/tsconfig-sync-command/REFLECTION_LOG.md:175-176`

---

## Schema Errors

### SCH001: Using lowercase S.struct/S.array
**Symptom:** Schema functions don't exist (lowercase was old API)
**Wrong:**
```typescript
S.struct({ name: S.string })
S.array(S.number)
S.string
```
**Correct:**
```typescript
S.Struct({ name: S.String })
S.Array(S.Number)
S.String
```
**Source:** `.claude/rules/effect-patterns.md:59-64`

---

### SCH002: Plain S.String for entity IDs
**Symptom:** Type safety lost, wrong ID types can be passed
**Wrong:**
```typescript
export class Member extends M.Class<Member>("Member")({
  id: S.String,
  userId: S.String,
  organizationId: S.String,
}) {}
```
**Correct:**
```typescript
export class Member extends M.Class<Member>("Member")({
  id: IamEntityIds.MemberId,
  userId: SharedEntityIds.UserId,
  organizationId: SharedEntityIds.OrganizationId,
}) {}
```
**Source:** `.claude/rules/effect-patterns.md:127-148`, `.claude/rules/effect-patterns.md:360-381`

---

### SCH003: Type casting for EntityIds
**Symptom:** Bypasses validation, allows invalid IDs
**Wrong:**
```typescript
const badId = "" as SharedEntityIds.UserId.Type;  // No validation!
```
**Correct:**
```typescript
const goodId = SharedEntityIds.UserId.make(stringValue);  // Validates format
```
**Source:** `.claude/rules/effect-patterns.md:214-221`

---

### SCH004: S.optional with default argument (wrong API)
**Symptom:** TypeScript error - S.optional doesn't take default
**Wrong:**
```typescript
S.optional(S.String, { default: () => "" })  // Invalid!
```
**Correct:**
```typescript
BS.toOptionalWithDefault(S.String)("")  // Or use BS.BoolWithDefault for booleans
```
**Source:** `specs/knowledge-completion/REFLECTION_LOG.md:358-359`

---

### SCH005: Deprecated BS pattern
**Symptom:** Using internal implementation instead of public API
**Wrong:**
```typescript
BS.toOptionalWithDefault(S.Boolean, false)  // Deprecated!
```
**Correct:**
```typescript
BS.BoolWithDefault(false)  // Modern helper
```
**Source:** `.claude/rules/effect-patterns.md:433-442`

---

### SCH006: generateObject with positional arguments
**Symptom:** @effect/ai API error
**Wrong:**
```typescript
model.generateObject(prompt, MySchema)  // Positional args
```
**Correct:**
```typescript
model.generateObject({
  prompt,
  schema: MySchema,
  objectName: "MyOutput"  // Optional but helpful
})
```
**Source:** `specs/knowledge-completion/REFLECTION_LOG.md:209-215`, `specs/knowledge-completion/REFLECTION_LOG.md:265-266`

---

### SCH007: Role literal type without as const
**Symptom:** TypeScript infers string instead of literal union
**Wrong:**
```typescript
Prompt.make([
  { role: "system", content: systemPrompt },  // role: string
])
```
**Correct:**
```typescript
Prompt.make([
  { role: "system" as const, content: systemPrompt },  // role: "system"
])
```
**Source:** `specs/knowledge-completion/REFLECTION_LOG.md:201-206`

---

## Native Method Errors

### NAT001: Using native array methods
**Symptom:** Breaks Effect conventions, loses type safety
**Wrong:**
```typescript
array.map(x => x + 1)
array.filter(x => x > 0)
array.sort()
array.reduce((acc, x) => acc + x, 0)
```
**Correct:**
```typescript
A.map(array, x => x + 1)
A.filter(array, x => x > 0)
A.sort(array, Order.number)
A.reduce(array, 0, (acc, x) => acc + x)
```
**Source:** `.claude/rules/effect-patterns.md:89-105`, `documentation/EFFECT_PATTERNS.md:53-66`

---

### NAT002: Using native string methods
**Symptom:** Inconsistent with Effect patterns
**Wrong:**
```typescript
str.split(",")
str.toLowerCase()
str.trim()
```
**Correct:**
```typescript
Str.split(str, ",")
Str.toLowerCase(str)
Str.trim(str)
```
**Source:** `.claude/rules/effect-patterns.md:266-286`, `documentation/EFFECT_PATTERNS.md:70-84`

---

### NAT003: Using native Date
**Symptom:** Mutable, error-prone, timezone issues
**Wrong:**
```typescript
new Date()
new Date("2025-01-15")
date.setDate(date.getDate() + 1)  // Mutation!
```
**Correct:**
```typescript
DateTime.unsafeNow()
DateTime.unsafeMake("2025-01-15")
DateTime.add(date, { days: 1 })  // Immutable
```
**Source:** `documentation/EFFECT_PATTERNS.md:133-175`

---

### NAT004: Using switch statements
**Symptom:** Not exhaustive, no type narrowing
**Wrong:**
```typescript
switch (status) {
  case "active": return "✓";
  default: return "?";  // Not type-safe!
}
```
**Correct:**
```typescript
Match.value(status).pipe(
  Match.when("active", () => "✓"),
  Match.exhaustive  // Compile error if cases missing!
)
```
**Source:** `.claude/rules/effect-patterns.md:340-358`, `documentation/EFFECT_PATTERNS.md:179-235`

---

### NAT005: Using typeof/instanceof
**Symptom:** Less type-safe, inconsistent with Effect patterns
**Wrong:**
```typescript
if (typeof value === "string") { ... }
if (value instanceof Date) { ... }
```
**Correct:**
```typescript
if (P.isString(value)) { ... }
if (P.isDate(value)) { ... }
```
**Source:** `.claude/rules/effect-patterns.md:382-391`

---

### NAT006: Using Node.js fs module
**Symptom:** Callback-based, unsafe error handling, not testable
**Wrong:**
```typescript
import * as fs from "node:fs";
const exists = fs.existsSync(path);
const content = fs.readFileSync(path, "utf-8");
```
**Correct:**
```typescript
import { FileSystem } from "@effect/platform";
const fs = yield* FileSystem.FileSystem;
const exists = yield* fs.exists(path);
const content = yield* fs.readFileString(path);
```
**Source:** `.claude/rules/effect-patterns.md:511-526`, `documentation/EFFECT_PATTERNS.md:284-356`

---

### NAT007: effect/String gaps - no Str.replace() or regex split
**Symptom:** Using Effect String module for unsupported operations
**Wrong:**
```typescript
Str.replace(text, /regex/, "replacement")  // NOT available
Str.split(str, /regex/)  // Only string delimiters supported
```
**Correct:**
```typescript
text.replace(/regex/, "replacement")  // Keep native for regex
str.split(/regex/).map(...)  // Native split + A.fromIterable()
```
**Source:** `specs/lexical-utils-effect-refactor/REFLECTION_LOG.md:49-51`, `specs/lexical-utils-effect-refactor/REFLECTION_LOG.md:466-470`

---

## Biome/Lint Errors

### LINT001: Unused imports
**Symptom:** Biome error, increased bundle size
**Wrong:**
```typescript
import { Effect, Layer, Context } from "effect";  // Context unused
```
**Correct:**
```typescript
import { Effect, Layer } from "effect";
// Or run: bun run lint:fix
```
**Source:** Standard Biome rules

---

### LINT002: Wrong import style
**Symptom:** Named import instead of namespace import
**Wrong:**
```typescript
import { Effect, gen, pipe } from "effect";
```
**Correct:**
```typescript
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
```
**Source:** `.claude/rules/effect-patterns.md:6-13`

---

## Turborepo Errors

### TURBO001: Cascading check failures
**Symptom:** `bun run check --filter @beep/package` fails on upstream package errors
**Wrong approach:**
```bash
# Assumes failure is in target package
bun run check --filter @beep/iam-tables
# Error in @beep/iam-domain appears but user fixes wrong package
```
**Correct approach:**
```bash
# 1. Identify actual error source in output
# packages/iam/domain/src/file.ts(42,5): error TS2322
#          ^^^^^^^ This is the failing package

# 2. Fix upstream first
bun run check --filter @beep/iam-domain

# 3. Then verify downstream
bun run check --filter @beep/iam-tables
```
**Source:** `.claude/rules/general.md:97-138`, `documentation/patterns/database-patterns.md:620-738`

---

### TURBO002: Isolated syntax check needed
**Symptom:** Need to verify file compiles without upstream issues
**Wrong:**
```bash
bun run check --filter @beep/package  # Includes all dependencies
```
**Correct:**
```bash
bun tsc --noEmit path/to/file.ts  # Isolated check
```
**Source:** `.claude/rules/general.md:128-131`

---

## Architecture Errors

### ARCH001: Direct cross-slice imports
**Symptom:** Coupling between slices, circular dependency risk
**Wrong:**
```typescript
// In packages/documents/server/
import { MemberRepo } from "@beep/iam-server";  // Cross-slice!
```
**Correct:**
```typescript
// Use shared interfaces or events
import { UserId } from "@beep/shared-domain";
```
**Source:** `.claude/rules/general.md:13-15`

---

### ARCH002: Relative path imports (../../..)
**Symptom:** Fragile imports, refactoring breaks
**Wrong:**
```typescript
import { Schema } from "../../../shared/domain/src/schema";
```
**Correct:**
```typescript
import { Schema } from "@beep/shared-domain";
```
**Source:** `.claude/rules/general.md:14`

---

### ARCH003: Environment access via process.env
**Symptom:** Untyped, no validation, runtime errors
**Wrong:**
```typescript
const apiKey = process.env.API_KEY;  // string | undefined
```
**Correct:**
```typescript
import { Env } from "@beep/env";
const apiKey = yield* Env.get("API_KEY");  // Typed and validated
```
**Source:** `.claude/rules/general.md:40-42`

---

### ARCH004: Incomplete domain models
**Symptom:** _check.ts passes but domain missing fields that table has
**Wrong:**
```typescript
// Domain model missing fields
class Embedding extends M.Class<Embedding>("Embedding")({
  ...makeFields(EmbeddingId, {
    embedding: S.Array(S.Number),  // Missing model, metadata, etc.
  }),
}) {}
// _check.ts PASSES even though domain is incomplete!
```
**Correct:**
```typescript
// Domain model defines ALL table fields
class Embedding extends M.Class<Embedding>("Embedding")({
  ...makeFields(EmbeddingId, {
    documentChunkId: DocumentChunkId,
    embedding: S.Array(S.Number),
    model: S.String,
    metadata: BS.FieldOptionOmittable(S.Record(...)),
  }),
}) {}
```
**Source:** `documentation/patterns/database-patterns.md:266-292`

---

## Testing Errors

### TEST001: Tests not in ./test directory
**Symptom:** Inconsistent test organization
**Wrong:**
```
packages/example/
├── src/
│   └── UserService.ts
│   └── UserService.test.ts  # Wrong location!
```
**Correct:**
```
packages/example/
├── src/
│   └── UserService.ts
└── test/
    └── UserService.test.ts  # Correct location
```
**Source:** `.claude/rules/effect-patterns.md:645`

---

### TEST002: Missing path alias in test imports
**Symptom:** Brittle relative imports in tests
**Wrong:**
```typescript
import { UserService } from "../src/UserService";
```
**Correct:**
```typescript
import { UserService } from "@beep/package-name/UserService";
```
**Source:** `.claude/rules/general.md:80`

---

### TEST003: Option fields using undefined instead of O.none()
**Symptom:** Type mismatch in mock data
**Wrong:**
```typescript
const mockData = {
  optionalField: undefined,  // Wrong for Option<T>
};
```
**Correct:**
```typescript
const mockData = {
  optionalField: O.none(),  // Correct for Option<T>
};
```
**Source:** `specs/knowledge-completion/REFLECTION_LOG.md:327-328`

---

### TEST004: Missing timeout for database tests
**Symptom:** Tests timeout with default duration
**Wrong:**
```typescript
layer(TestLayer)("DB tests", (it) => {
  it.effect("test", () => Effect.gen(...));
});
```
**Correct:**
```typescript
layer(TestLayer, { timeout: Duration.seconds(60) })("DB tests", (it) => {
  it.effect("test", () => Effect.gen(...));
});
```
**Source:** `specs/rls-implementation/REFLECTION_LOG.md:173-181`

---

## Database Errors

### DB001: SET LOCAL vs SET for RLS
**Symptom:** Session variable not persisting across queries in connection pool
**Wrong:**
```typescript
yield* sql`SET LOCAL app.current_org_id = ${orgId}`;  // Transaction-scoped only
```
**Correct:**
```typescript
const escapeOrgId = (id: string) => id.replace(/'/g, "''");
yield* sql.unsafe(`SET app.current_org_id = '${escapeOrgId(orgId)}'`);  // Session-scoped
```
**Source:** `specs/rls-implementation/REFLECTION_LOG.md:564-585`

---

### DB002: Parameterized SET queries
**Symptom:** PostgreSQL syntax error with $1
**Wrong:**
```typescript
yield* sql`SET app.current_org_id = ${orgId}`;  // Error: syntax error at or near "$1"
```
**Correct:**
```typescript
yield* sql.unsafe(`SET app.current_org_id = '${escapeOrgId(orgId)}'`);
```
**Source:** `specs/rls-implementation/REFLECTION_LOG.md:587-589`

---

### DB003: ReadonlyArray to SqlSchema
**Symptom:** Schema expects mutable array
**Wrong:**
```typescript
findByIdsSchema({ ids: readonlyIds, ... })  // ReadonlyArray not accepted
```
**Correct:**
```typescript
findByIdsSchema({ ids: [...readonlyIds], ... })  // Spread to mutable
```
**Source:** `specs/knowledge-repo-sqlschema-refactor/REFLECTION_LOG.md:231-232`

---

### DB004: PostgreSQL count returns string
**Symptom:** count is string "42" not number 42
**Wrong:**
```typescript
class CountResult extends S.Class<CountResult>("CountResult")({
  count: S.Number,  // Wrong - PostgreSQL returns string
}) {}
```
**Correct:**
```typescript
class CountResult extends S.Class<CountResult>("CountResult")({
  count: S.String,
}) {}
// Then: Number.parseInt(result.count, 10)
```
**Source:** `specs/knowledge-repo-sqlschema-refactor/REFLECTION_LOG.md:197-198`

---

## Stream/Async Errors

### STREAM001: Stream.fromAsyncIterable missing error handler
**Symptom:** Runtime error - missing required argument
**Wrong:**
```typescript
Stream.fromAsyncIterable(asyncGenerator())  // Missing error handler!
```
**Correct:**
```typescript
Stream.fromAsyncIterable(asyncGenerator(), (e) => new ProcessingError({ cause: e }))
```
**Source:** `specs/lexical-utils-effect-refactor/REFLECTION_LOG.md:52`

---

### STREAM002: Stream.runCollect returns Chunk
**Symptom:** Type error when expecting Array
**Wrong:**
```typescript
const results: Array<T> = yield* Stream.runCollect(stream);  // Type error!
```
**Correct:**
```typescript
const chunk = yield* Stream.runCollect(stream);
const results = A.fromIterable(chunk);  // Convert to Array
```
**Source:** `specs/lexical-utils-effect-refactor/REFLECTION_LOG.md:54`

---

### STREAM003: MutableHashSet.forEach doesn't exist
**Symptom:** Method not found error
**Wrong:**
```typescript
MutableHashSet.forEach(set, (item) => ...);  // NOT available!
```
**Correct:**
```typescript
for (const item of set) { ... }  // Native for...of is acceptable exception
```
**Source:** `specs/lexical-utils-effect-refactor/REFLECTION_LOG.md:260`, `specs/lexical-utils-effect-refactor/REFLECTION_LOG.md:470`

---

## Summary by Category

| Category | Count |
|----------|-------|
| TypeScript Errors | 4 |
| Effect Errors | 9 |
| Schema Errors | 7 |
| Native Method Errors | 7 |
| Biome/Lint Errors | 2 |
| Turborepo Errors | 2 |
| Architecture Errors | 4 |
| Testing Errors | 4 |
| Database Errors | 4 |
| Stream/Async Errors | 3 |
| **TOTAL** | **45** |
