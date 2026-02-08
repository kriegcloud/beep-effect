---
trigger: always
description: Enforce Effect repository patterns across TypeScript sources.
globs:
  - packages/**/src/**/*.ts
  - packages/**/src/**/*.tsx
  - apps/**/src/**/*.ts
  - apps/**/src/**/*.tsx
  - tooling/**/src/**/*.ts
---

# Effect Patterns

## Namespace Imports (REQUIRED)

ALWAYS use namespace imports for Effect modules:

```typescript
// Core Effect modules - full namespace
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as Struct from "effect/Struct";
import * as Cause from "effect/Cause";
```

## Single-Letter Aliases (REQUIRED)

Use abbreviated aliases for frequently used modules:

```typescript
import * as A from "effect/Array";
import * as BI from "effect/BigInt";
import * as Num from "effect/Number";
import * as P from "effect/Predicate";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as B from "effect/Brand";
import * as Bool from "effect/Boolean";
import * as AST from "effect/SchemaAST";
import * as DateTime from "effect/DateTime";
import * as Match from "effect/Match";
import * as M from "@effect/sql/Model";
```

## PascalCase Constructors (REQUIRED)

ALWAYS use PascalCase exports from Schema and other modules:

```typescript
// REQUIRED - PascalCase constructors
S.Struct({ name: S.String })
S.Array(S.Number)
S.String
S.Number
S.Boolean
S.Literal("active", "inactive")
S.Union(S.String, S.Number)
```

NEVER use lowercase constructors:

```typescript
// FORBIDDEN
S.struct({ name: S.string })  // Wrong!
S.array(S.number)              // Wrong!
```

## Alias Reference Table

| Module             | Alias      |
|--------------------|------------|
| effect/Array       | A          |
| effect/BigInt      | BI         |
| effect/Number      | Num        |
| effect/Predicate   | P          |
| effect/Function    | F          |
| effect/Option      | O          |
| effect/Record      | R          |
| effect/Schema      | S          |
| effect/String      | Str        |
| effect/Brand       | B          |
| effect/Boolean     | Bool       |
| effect/SchemaAST   | AST        |
| effect/DateTime    | DateTime   |
| effect/Match       | Match      |
| @effect/sql/Model  | M          |

## Native Method Ban

NEVER use native JavaScript array/string methods. Route ALL operations through Effect utilities:

```typescript
// FORBIDDEN
array.map(x => x + 1)
string.split(",")
array.filter(x => x > 0)

// REQUIRED
A.map(array, x => x + 1)
Str.split(string, ",")
A.filter(array, x => x > 0)
```

## Schema Type Selection

ALWAYS choose the correct Effect Schema type based on the runtime value:

| Runtime Value | Effect Schema | Example |
|---------------|---------------|---------|
| JavaScript `Date` object | `S.Date` | `createdAt: S.Date` |
| ISO 8601 string | `S.DateFromString` | `timestamp: S.DateFromString` |
| `string \| undefined` | `S.optional(S.String)` | `nickname: S.optional(S.String)` |
| `string \| null \| undefined` | `S.optionalWith(S.String, { nullable: true })` | `ipAddress: S.optionalWith(S.String, { nullable: true })` |
| User credential (password, API key) | `S.Redacted(S.String)` | `password: S.Redacted(S.String)` |
| Server-generated token | `S.String` | `sessionToken: S.String` |

**Key Decisions:**

- Use `S.Date` when working with JavaScript Date objects in memory
- Use `S.DateFromString` when receiving ISO 8601 strings from APIs or JSON
- Use `S.optional` for values that may be `undefined`
- Use `S.optionalWith({ nullable: true })` for values that may be `null` OR `undefined`
- Use `S.Redacted` for user-provided credentials to suppress logging
- Use plain `S.String` for server-generated tokens (already protected)

## EntityId Usage (MANDATORY)

ALWAYS use branded EntityIds from `@beep/shared-domain` for ID fields. NEVER use plain `S.String`.

### Domain Models

```typescript
// REQUIRED
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";

export class Member extends M.Class<Member>("Member")({
  id: IamEntityIds.MemberId,
  userId: SharedEntityIds.UserId,
  organizationId: SharedEntityIds.OrganizationId,
  // ...
}) {}
```

```typescript
// FORBIDDEN
export class Member extends M.Class<Member>("Member")({
  id: S.String,  // Missing branded EntityId!
  userId: S.String,  // Missing branded EntityId!
}) {}
```

### Table Columns

ALWAYS add `.$type<EntityId.Type>()` to table columns referencing entity IDs:

```typescript
// REQUIRED
import { KnowledgeEntityIds } from "@beep/knowledge-domain";

export const entityTable = Table.make(KnowledgeEntityIds.EntityId)({
  ontologyId: pg.text("ontology_id").notNull()
    .$type<KnowledgeEntityIds.OntologyId.Type>(),
  documentId: pg.text("document_id")
    .$type<DocumentsEntityIds.DocumentId.Type>(),
});
```

```typescript
// FORBIDDEN - Missing .$type<>() causes type-unsafe joins
ontologyId: pg.text("ontology_id").notNull(),
documentId: pg.text("document_id"),
```

**Why**: Without `.$type<>()`, TypeScript cannot prevent mixing different entity ID types in joins, leading to runtime bugs.

### Client Schemas

ALWAYS use branded EntityIds in client contract schemas:

```typescript
// REQUIRED
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    userId: SharedEntityIds.UserId,
    organizationId: SharedEntityIds.OrganizationId,
  },
  formValuesAnnotation({
    userId: "",
    organizationId: "",
  })
) {}
```

### EntityId Creation and Validation

Use EntityId schema methods for creation and validation:

```typescript
import { SharedEntityIds, IamEntityIds } from "@beep/shared-domain";

// Create a new ID (generates UUID with proper prefix)
const newOrgId = SharedEntityIds.OrganizationId.create();
// Result: "shared_organization__<uuid>"

// Validate a plain string as an entity ID
const validatedId = SharedEntityIds.OrganizationId.make("shared_organization__abc123");
// Throws if format is invalid

// Check if a value is a valid EntityId
if (SharedEntityIds.OrganizationId.is(someString)) {
  // someString is typed as OrganizationId.Type
}
```

**NEVER use type casting for EntityIds:**

```typescript
// FORBIDDEN - Type casting bypasses validation
const badId = "" as SharedEntityIds.UserId.Type;

// REQUIRED - Use schema methods
const goodId = SharedEntityIds.UserId.make(stringValue);
```

### Transformation Schemas

When mapping external API responses (Better Auth, third-party APIs) to domain entities, ALWAYS create transformation schemas:

```typescript
// REQUIRED - Transform external API response to domain entity
export const DomainMemberFromBetterAuthMember = S.transformOrFail(
  BetterAuthMemberSchema,
  DomainMember.Model,
  {
    strict: true,
    decode: Effect.fn(function* (betterAuthMember, _options, ast) {
      if (!IamEntityIds.MemberId.is(betterAuthMember.id)) {
        return yield* ParseResult.fail(
          new ParseResult.Type(ast, betterAuthMember.id, "Invalid member ID format")
        );
      }
      // ... rest of transformation
    }),
  }
);
```

**Why**: External APIs return plain strings. Transformation schemas validate format before accepting into domain layer.

### EntityId Quick Reference

| Slice | Import | Available IDs |
|-------|--------|---------------|
| Shared | `SharedEntityIds` from `@beep/shared-domain` | `UserId`, `OrganizationId`, `TeamId`, `SessionId`, `FileId`, `FolderId` |
| IAM | `IamEntityIds` from `@beep/shared-domain` | `MemberId`, `RoleId`, `PermissionId`, `InvitationId`, `ApiKeyId` |
| Documents | `DocumentsEntityIds` from `@beep/shared-domain` | `DocumentId`, `DocumentVersionId`, `CommentId` |
| Knowledge | `KnowledgeEntityIds` from `@beep/knowledge-domain` | `EntityId`, `OntologyId`, `RelationId`, `SameAsLinkId` |
| Calendar | `CalendarEntityIds` from `@beep/shared-domain` | `EventId`, `AvailabilityId`, `RecurrenceId` |

## NEVER Patterns (FORBIDDEN)

These patterns are FORBIDDEN and will cause remediation work:

### 1. NEVER use native JavaScript collections/methods

```typescript
// FORBIDDEN - Native methods
array.map(x => x + 1)
array.filter(x => x > 0)
array.sort()
array.reduce((acc, x) => acc + x, 0)
array.length === 0
string.toLowerCase()
string.toUpperCase()
string.slice(0, 5)
string.split(",")
Object.entries(obj)
Object.keys(obj)
new Set([1, 2, 3])
new Map([["a", 1]])
new Date()
Date.now()

// REQUIRED - Effect utilities
import * as A from "effect/Array";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import * as MutableHashSet from "effect/MutableHashSet";
import * as MutableHashMap from "effect/MutableHashMap";
import * as DateTime from "effect/DateTime";
import * as Order from "effect/Order";

A.map(array, x => x + 1)
A.filter(array, x => x > 0)
A.sort(array, Order.number)
A.reduce(array, 0, (acc, x) => acc + x)
A.isEmptyReadonlyArray(array)
Str.toLowerCase(string)
Str.toUpperCase(string)
Str.slice(string, 0, 5)
Str.split(string, ",")
Struct.entries(obj)
Struct.keys(obj)
MutableHashSet.make(1, 2, 3)
MutableHashMap.make(["a", 1])
DateTime.now
DateTime.unsafeNow()
```

### 2. NEVER use native Error constructors

```typescript
// FORBIDDEN
new Error("Something went wrong")
Effect.die(new Error("Fatal"))
throw new Error("Bad input")

// REQUIRED - Use tagged errors
export class MyError extends S.TaggedError<MyError>()("MyError", {
  message: S.String,
}) {}

Effect.fail(new MyError({ message: "Something went wrong" }))
```

### 3. NEVER use non-null assertions

```typescript
// FORBIDDEN
const value = map.get(key)!
const first = array[0]!
const element = document.getElementById("foo")!

// REQUIRED - Use Option
import * as O from "effect/Option";

const value = O.fromNullable(map.get(key))
const first = A.head(array)  // Returns Option<T>
```

### 4. NEVER use switch statements

```typescript
// FORBIDDEN
switch (status) {
  case "active": return "✓";
  case "inactive": return "✗";
  default: return "?";
}

// REQUIRED - Use Match
import * as Match from "effect/Match";

Match.value(status).pipe(
  Match.when("active", () => "✓"),
  Match.when("inactive", () => "✗"),
  Match.orElse(() => "?")
)
```

### 5. NEVER use plain strings for entity IDs

```typescript
// FORBIDDEN - Domain models
id: S.String
userId: S.String
organizationId: S.String

// FORBIDDEN - Table columns
pg.text("user_id").notNull()
pg.text("organization_id")

// REQUIRED - Domain models
id: SharedEntityIds.UserId
userId: SharedEntityIds.UserId
organizationId: SharedEntityIds.OrganizationId

// REQUIRED - Table columns
pg.text("user_id").notNull().$type<SharedEntityIds.UserId.Type>()
pg.text("organization_id").$type<SharedEntityIds.OrganizationId.Type>()
```

### 6. NEVER use typeof/instanceof for type narrowing

```typescript
// FORBIDDEN
if (typeof value === "string") { ... }
if (value instanceof Date) { ... }

// REQUIRED - Use Effect predicates
import * as P from "effect/Predicate";

if (P.isString(value)) { ... }
if (P.isDate(value)) { ... }
```

## BS Helper Reference (@beep/schema)

The `@beep/schema` package (imported as `BS`) provides specialized helpers for common schema patterns. ALWAYS prefer BS helpers over manual schema composition when available.

### Helper Quick Reference

```typescript
import { BS } from "@beep/schema";

// Boolean with default value
BS.BoolWithDefault(false)                    // Defaults to false if undefined

// Optional fields (omitted when undefined)
BS.FieldOptionOmittable(S.String)            // Optional field, omitted in output when undefined

// Sensitive + Optional (suppresses logging)
BS.FieldSensitiveOptionOmittable(S.String)   // Optional sensitive field, never logged

// DateTime helpers
BS.DateTimeUtcFromAllAcceptable              // DateTime accepting multiple input formats

// Validated primitives
BS.EmailBase                                 // Email validation schema
BS.NonEmptyString                            // Non-empty string validation
```

### Helper Selection Guide

| Use Case | BS Helper | Example |
|----------|-----------|---------|
| Boolean field with default | `BS.BoolWithDefault(value)` | `isActive: BS.BoolWithDefault(true)` |
| Optional non-sensitive field | `BS.FieldOptionOmittable(schema)` | `nickname: BS.FieldOptionOmittable(S.String)` |
| Optional sensitive field | `BS.FieldSensitiveOptionOmittable(schema)` | `apiKey: BS.FieldSensitiveOptionOmittable(S.String)` |
| DateTime from any format | `BS.DateTimeUtcFromAllAcceptable` | `timestamp: BS.DateTimeUtcFromAllAcceptable` |
| Email validation | `BS.EmailBase` | `email: BS.EmailBase` |
| Non-empty string | `BS.NonEmptyString` | `username: BS.NonEmptyString` |

**Common Mistakes:**

```typescript
// WRONG - Using deprecated pattern
const Schema = S.Struct({
  enabled: BS.toOptionalWithDefault(S.Boolean, false)  // Deprecated!
});

// CORRECT - Using modern BS helper
const Schema = S.Struct({
  enabled: BS.BoolWithDefault(false)
});
```

## Sensitive Field Guidelines

ALWAYS use sensitive field wrappers for data that could enable impersonation or system compromise if leaked through logs or error messages.

### When to Mark Fields as Sensitive

**ALWAYS mark as sensitive:**

```typescript
// User credentials
password: BS.FieldSensitiveOptionOmittable(S.String)
hashedPassword: BS.FieldSensitiveOptionOmittable(S.String)
apiKey: BS.FieldSensitiveOptionOmittable(S.String)
apiSecret: BS.FieldSensitiveOptionOmittable(S.String)

// OAuth tokens
accessToken: BS.FieldSensitiveOptionOmittable(S.String)
refreshToken: BS.FieldSensitiveOptionOmittable(S.String)
idToken: BS.FieldSensitiveOptionOmittable(S.String)

// Session & authentication tokens
sessionToken: BS.FieldSensitiveOptionOmittable(S.String)
csrfToken: BS.FieldSensitiveOptionOmittable(S.String)

// Private keys & secrets
privateKey: BS.FieldSensitiveOptionOmittable(S.String)
signingSecret: BS.FieldSensitiveOptionOmittable(S.String)
encryptionKey: BS.FieldSensitiveOptionOmittable(S.String)
```

**NEVER mark as sensitive (unnecessary overhead):**

```typescript
// Server-generated UUIDs/IDs - no security value in hiding
id: S.String
userId: S.String

// Timestamps - public metadata
createdAt: S.Date
updatedAt: S.Date

// Public identifiers - meant to be shared
email: BS.EmailBase
username: S.String
organizationId: S.String

// Non-sensitive enums/literals
status: S.Literal("active", "inactive")
role: S.Literal("admin", "member")
```

### Decision Criteria

Ask: "If this value appeared in application logs, could an attacker use it to:"
- Impersonate a user or system?
- Access protected resources?
- Decrypt sensitive data?
- Bypass authentication or authorization?

If **YES** to any → Mark as sensitive.
If **NO** to all → Regular field.

## FileSystem Service (REQUIRED)

NEVER use Node.js fs module. ALWAYS use Effect FileSystem service from @effect/platform:

```typescript
// FORBIDDEN - Node.js fs
import * as fs from "node:fs";
const exists = fs.existsSync(path);
const content = fs.readFileSync(path, "utf-8");

// FORBIDDEN - Wrapping Node.js fs in Effect.try
const exists = yield* Effect.try(() => fs.existsSync(path));

// REQUIRED - Effect FileSystem service
import { FileSystem } from "@effect/platform";
const fs = yield* FileSystem.FileSystem;
const exists = yield* fs.exists(path);
const content = yield* fs.readFileString(path);
```

**Key operations**:
- `fs.exists(path)` - Check existence
- `fs.readFileString(path)` - Read text file
- `fs.writeFileString(path, content)` - Write text file
- `fs.makeDirectory(path, { recursive: true })` - Create directory
- `fs.readDirectory(path)` - List directory contents

**Layer composition** (Bun runtime):
```typescript
import { BunFileSystem } from "@effect/platform-bun";

export const MyCommandLive = Layer.mergeAll(
  BunFileSystem.layer,  // Provides FileSystem.FileSystem service
  // ... other layers
);
```

Reference: `tooling/cli/src/commands/create-slice/handler.ts` for canonical patterns.

## Factory Encoding Behavior

When using `createHandler` factory (or similar factories), understand the encoding/decoding flow:

The factory automatically:
1. **Encodes** payload using `payloadSchema` (converts Date → ISO string, etc.)
2. Passes **encoded** value to `execute` function
3. Checks for `response.error`
4. **Decodes** `response.data` using `successSchema`
5. Notifies `$sessionSignal` if `mutatesSession: true`

**Critical Rule**: The `execute` function receives the ENCODED payload, not the original input.

```typescript
// CORRECT - execute receives encoded payload
const Handler = createHandler({
  domain: "sign-in",
  feature: "email",
  execute: (encoded) => client.signIn.email(encoded),  // encoded is post-schema-encoding
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});

// WRONG - manual encoding or transformation
const Handler = createHandler({
  domain: "sign-in",
  feature: "email",
  execute: (encoded) => client.signIn.email({ token: encoded.token }),  // WRONG - redundant field extraction
  successSchema: Contract.Success,
  payloadSchema: Contract.Payload,
  mutatesSession: true,
});
```

**Why This Matters**: Schema transformations (like `S.DateFromString`, `S.Redacted`) happen BEFORE `execute` is called. The encoded value is already in the correct wire format.

## Testing (REQUIRED)

ALWAYS use `@beep/testkit` for Effect-based tests. NEVER use raw `bun:test` with manual `Effect.runPromise`.

### Test Runner Selection

| Runner | Use Case | Example |
|--------|----------|---------|
| `effect()` | Standard Effect tests with TestClock/TestRandom | Unit tests, time-dependent tests |
| `scoped()` | Tests with resource management (acquireRelease) | Tests with cleanup, spies, temp files |
| `live()` | Pure logic without test services | Tests needing real Clock/Random |
| `layer()` | Shared expensive resources across tests | Database tests, integration tests |

### Correct Pattern (REQUIRED)

```typescript
import { effect, layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";

// Unit test
effect("computes result", () =>
  Effect.gen(function* () {
    const result = yield* someEffect();
    strictEqual(result, expected);
  })
);

// Integration test with shared Layer
layer(TestLayer, { timeout: Duration.seconds(60) })("suite name", (it) => {
  it.effect("test name", () =>
    Effect.gen(function* () {
      const repo = yield* MemberRepo;
      const result = yield* repo.findAll();
      strictEqual(result.length, 0);
    })
  );
});
```

### FORBIDDEN Pattern

```typescript
// NEVER use bun:test with Effect.runPromise
import { test } from "bun:test";

test("wrong", async () => {
  await Effect.gen(function* () {
    const result = yield* someEffect();
  }).pipe(Effect.provide(TestLayer), Effect.runPromise);  // FORBIDDEN!
});

// NEVER use Effect.runSync in tests
test("also wrong", () => {
  const result = Effect.runSync(myEffect);  // FORBIDDEN!
});
```

### Test File Organization

- Tests MUST be in `./test` directory, NEVER inline with source files
- Mirror source structure: `src/foo/Bar.ts` → `test/foo/Bar.test.ts`
- Use path aliases: `@beep/package-name/module` (NOT `../src/module`)

### Documentation References

- **Quick Reference**: This section
- **Comprehensive Patterns**: `.claude/commands/patterns/effect-testing-patterns.md`
- **API Reference**: `tooling/testkit/README.md`
- **Usage Examples**: `tooling/testkit/AGENTS.md`

---

## Reference Documentation

For comprehensive patterns beyond this quick reference, consult these detailed guides:

| Topic | Detailed Documentation | Purpose |
|-------|------------------------|---------|
| **Testing** | `.claude/commands/patterns/effect-testing-patterns.md` | Comprehensive test patterns, runner selection, Layer management |
| **Testing API** | `tooling/testkit/README.md` | Complete testkit API reference with examples |
| **Database** | `documentation/patterns/database-patterns.md` | Slice creation, foreign keys, table patterns, verification |
| **Effect Docs** | Use `mcp-researcher` agent | Official Effect documentation via MCP |

**Usage**: When rules provide quick syntax reference, these documents provide:
- Complete worked examples
- Decision frameworks (when to use X vs Y)
- Common pitfalls and anti-patterns
- Integration patterns with other systems
