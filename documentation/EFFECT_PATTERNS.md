# Effect Patterns

This document contains the Effect-first development patterns and critical rules for the beep-effect codebase.

---

## Effect-First Development

- No `async/await` or bare Promises in application code
- Use `Effect.gen`, `Effect.fn`, `Effect.tryPromise` with tagged errors
- Errors via `Schema.TaggedError` from `effect/Schema`
- Collections via Effect utilities (`Array`, `Option`, `HashMap`)

### `Effect.fn` Boundary Rule (REQUIRED)

For named, reusable effectful helpers (especially service/workflow boundaries), use `Effect.fn("Name")` instead of raw `Effect.gen`.

```typescript
// REQUIRED - named reusable helper with explicit cause handling
const emitProgress = Effect.fn("ExtractionWorkflow.emitProgress")(
  function* (stream: ProgressStream, value: ProgressEvent) {
    yield* stream.offer(value);
  },
  Effect.catchAllCause((cause) =>
    Effect.logWarning("progress emission failed").pipe(
      Effect.annotateLogs({ cause })
    )
  )
);
```

```typescript
// ALLOWED - local inline orchestration only
const program = Effect.gen(function* () {
  const service = yield* MyService;
  return yield* service.run();
});
```

Use this rule when all are true:
- The function is reused or exported.
- The function has a stable semantic name.
- The function needs a consistent error/cause boundary.

---

## Import Conventions

```typescript
// Namespace imports for Effect modules
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
import * as Struct from "effect/Struct";
import * as Cause from "effect/Cause";

// Single-letter aliases for frequently used modules
import * as A from "effect/Array";
import * as BI from "effect/BigInt";
import * as Num from "effect/Number";
import * as P from "effect/Predicate";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as M from "@effect/sql/Model";
import * as B from "effect/Brand";
import * as Bool from "effect/Boolean";
import * as AST from "effect/SchemaAST";
import * as DateTime from "effect/DateTime";
import * as Match from "effect/Match";
```

### Uppercase Constructors

Always use PascalCase exports: `S.Struct`, `S.Array`, `S.String` (never `S.struct`, `S.array`).

---

## Critical Rules

### Schema Class Conventions (REQUIRED)

When defining a named, reusable data model (especially anything crossing a boundary like DB rows, external API payloads, RPC payloads), prefer `S.Class` over `S.Struct`.

- Use `S.Class` directly as the type (do not duplicate with a separate `interface`).
- Prefer `S.TaggedClass` / `S.TaggedError` over `S.TaggedStruct` for ADTs and typed errors.
- Do not name schema classes with a `*Schema` suffix. Use domain names (e.g. `EmailMetadata`, not `EmailMetadataSchema`).
- If a model has nested object properties (e.g. `dateRange`), break nested shapes into their own `S.Class` rather than using an inline `S.Struct`.
- For `S.optionalWith(S.Array(...))` defaults, prefer `A.empty<T>` (e.g. `default: A.empty<string>`), not `() => []`.
- Never convert service contracts (the shapes used in `Context.Tag(...)`) into schema classes.

```typescript
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { BS } from "@beep/schema";
import { $SomeSliceId } from "@beep/identity/packages";

const $I = $SomeSliceId.create("path/to/module");

export class DateRange extends S.Class<DateRange>($I`DateRange`)(
  {
    earliest: BS.DateTimeUtcFromAllAcceptable,
    latest: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("DateRange", { description: "UTC date range (earliest/latest) used to bound a time window." })
) {}

export class ThreadContext extends S.Class<ThreadContext>($I`ThreadContext`)(
  {
    threadId: S.String,
    subject: S.String,
    participants: S.optionalWith(S.Array(S.String), { default: A.empty<string> }),
    dateRange: DateRange,
  },
  $I.annotations("ThreadContext", { description: "Message thread context used for prompting and attribution." })
) {}

export class EmailMetadata extends S.Class<EmailMetadata>($I`EmailMetadata`)(
  {
    from: S.String,
    to: S.optionalWith(S.Array(S.String), { default: A.empty<string> }),
    cc: S.optionalWith(S.Array(S.String), { default: A.empty<string> }),
    date: S.optionalWith(S.OptionFromSelf(BS.DateTimeUtcFromAllAcceptable), { default: O.none<DateTime.Utc> }),
    threadId: S.String,
    labels: S.optionalWith(S.Array(S.String), { default: A.empty<string> }),
  },
  $I.annotations("EmailMetadata", { description: "Email metadata extracted from headers and used for downstream logic." })
) {}
```

### Schema Identifiers & Annotations (REQUIRED)

Use `@beep/identity/packages` TaggedComposer conventions to keep schema IDs and annotations canonical.

- Always define `$I` at the top of the module: `const $I = $PackageId.create("relative/path/to/module")`.
- Always prefer `$I\`Identifier\`` for schema identifiers where supported.
- Always attach annotations via `$I.annotations("Identifier", { description: "..." })`.

```typescript
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/MyErrors");

export class MyError extends S.TaggedError<MyError>($I`MyError`)(
  "MyError",
  { message: S.String },
  $I.annotations("MyError", { description: "Failure emitted by the domain." })
) {}
```

### Prefer BS.StringLiteralKit (REQUIRED)

Prefer `BS.StringLiteralKit` over `S.Literal` for string-literal enums and tags (reusability, composition with `.toTagged(...).composer(...)`, and consistent annotation patterns).

```typescript
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

export class Status extends BS.StringLiteralKit("open", "closed") {}

export const makeTicket = Status.toTagged("status").composer({
  id: S.String,
  title: S.String,
});
```

### Allowed Exceptions (MUST Document In-Code)

Exceptions are allowed, but must be explicit with a short comment explaining why:

- Keep an anonymous `S.Struct(...)` when it is truly one-off and local (not exported), and turning it into a named `S.Class` would add churn without reuse.
- Keep a TypeScript `interface` when runtime schema validation is not realistic (external AST nodes, function/method contracts, generic helpers).
- Use `S.Literal(...)` only when `BS.StringLiteralKit` cannot be used without changing semantics.

Use a consistent comment form:

```ts
// exception(schema-model): <reason, and what would break/change if refactored>
```

### NEVER Use Native Array Methods

```typescript
// FORBIDDEN
items.map((item) => item.name);
items.filter((item) => item.active);
Array.from(iterable);

// REQUIRED - Effect Array utilities with pipe
F.pipe(items, A.map((item) => item.name));
F.pipe(items, A.filter((item) => item.active));
F.pipe(iterable, A.fromIterable);
```

**Required Effect Array methods**: `A.map`, `A.filter`, `A.forEach`, `A.findFirst`, `A.findLast`, `A.some`, `A.every`, `A.reduce`, `A.groupBy`, `A.partition`, `A.fromIterable`, `A.head`, `A.tail`, `A.get`

---

### NEVER Use Native String Methods

```typescript
// FORBIDDEN
str.charAt(0).toUpperCase();
str.split(" ");
str.trim();

// REQUIRED - Effect String utilities
F.pipe(str, Str.charAt(0), Str.toUpperCase);
F.pipe(str, Str.split(" "));
F.pipe(str, Str.trim);
```

**Required Effect String methods**: `Str.charAt`, `Str.slice`, `Str.indexOf`, `Str.includes`, `Str.startsWith`, `Str.endsWith`, `Str.toUpperCase`, `Str.toLowerCase`, `Str.capitalize`, `Str.trim`, `Str.split`, `Str.replace`, `Str.match`, `Str.isEmpty`, `Str.isNonEmpty`

---

### Use Effect Struct & Record Utilities

```typescript
// REQUIRED
F.pipe(obj, Struct.keys);        // not Object.keys(obj)
F.pipe(obj, R.values);           // not Object.values(obj)
F.pipe(obj, R.map(fn));          // not manual iteration
```

---

### Use Effect Collections

```typescript
// HashMap instead of Map
import * as HashMap from "effect/HashMap";
HashMap.empty<string, number>();
F.pipe(hashMap, HashMap.set(key, value));
F.pipe(hashMap, HashMap.get(key)); // returns Option<V>

// HashSet instead of Set
import * as HashSet from "effect/HashSet";
HashSet.empty<string>();
F.pipe(hashSet, HashSet.add(value));
```

---

### Use @beep/utils No-ops

```typescript
import { nullOp, noOp, nullOpE } from "@beep/utils";

// REQUIRED
nullOp      // instead of () => null
noOp        // instead of () => {}
nullOpE     // instead of () => Effect.succeed(null)

// NEVER use async no-ops
// async () => null  -> use nullOpE
```

---

### NEVER Use Native Date

The native `Date` object is mutable, error-prone, and lacks timezone safety. Use `effect/DateTime` instead.

```typescript
import * as DateTime from "effect/DateTime";

// FORBIDDEN - Native Date
new Date();
new Date("2025-01-15");
date.setDate(date.getDate() + 1);  // Mutation!
date.getMonth() + 1;               // 0-indexed months
date.toISOString();

// REQUIRED - Effect DateTime (immutable, type-safe)
DateTime.unsafeNow();                              // Current time (Utc)
yield* DateTime.now;                               // In Effect context
DateTime.unsafeMake("2025-01-15");                 // From string
DateTime.make("2025-01-15");                       // Returns Option<Utc>
DateTime.add(date, { days: 1 });                   // Immutable arithmetic
DateTime.add(date, { months: 1, days: -5 });       // Combined adjustments
DateTime.formatIso(date);                          // ISO string
DateTime.format(date, { dateStyle: "medium" });    // Localized formatting
```

**Key DateTime operations**:
- **Creation**: `DateTime.unsafeNow`, `DateTime.now`, `DateTime.unsafeMake`, `DateTime.make`
- **Arithmetic**: `DateTime.add`, `DateTime.subtract` (immutable, handles edge cases)
- **Comparison**: `DateTime.lessThan`, `DateTime.greaterThan`, `DateTime.between`, `DateTime.distance`
- **Formatting**: `DateTime.formatIso`, `DateTime.format`, `DateTime.formatUtc`
- **Timezones**: `DateTime.makeZoned`, `DateTime.withZone`, `DateTime.toUtc`
- **Parts**: `DateTime.toParts`, `DateTime.getPartUtc`

```typescript
// FORBIDDEN - Manual timezone handling
new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
const offset = date.getTimezoneOffset();

// REQUIRED - Effect DateTime timezones
const zoned = DateTime.makeZoned(date, { timeZone: "America/New_York" });
DateTime.withZone(utcDate, "Europe/Rome");
DateTime.toUtc(zonedDate);
```

---

### NEVER Use Switch Statements or Long If-Else Chains

Use `effect/Match` for exhaustive pattern matching and `effect/Predicate` for type guards.

```typescript
import * as Match from "effect/Match";
import * as P from "effect/Predicate";

// FORBIDDEN - switch statements
switch (response._tag) {
  case "loading":
    return "Loading...";
  case "success":
    return `Found ${response.data.length} items`;
  case "error":
    return `Error: ${response.error}`;
  default:
    return "Unknown";  // Not type-safe!
}

// REQUIRED - Match.exhaustive for discriminated unions
const result = Match.value(response).pipe(
  Match.tag("loading", () => "Loading..."),
  Match.tag("success", (r) => `Found ${r.data.length} items`),
  Match.tag("error", (r) => `Error: ${r.error}`),
  Match.exhaustive  // Compile error if cases missing!
);
```

```typescript
// FORBIDDEN - long if-else chains
if (typeof value === "string") {
  return `String: ${value}`;
} else if (typeof value === "number") {
  return `Number: ${value}`;
} else if (Array.isArray(value)) {
  return `Array: ${value.length}`;
} else {
  return "Unknown";
}

// REQUIRED - Match with predicates
const result = Match.value(value).pipe(
  Match.when(P.isString, (s) => `String: ${s}`),
  Match.when(P.isNumber, (n) => `Number: ${n}`),
  Match.when(P.isArray, (a) => `Array: ${a.length}`),
  Match.orElse(() => "Unknown")
);
```

**Match patterns**:
- `Match.value(x)` - Start matching on a value
- `Match.type<T>()` - Start matching on a type (for reusable matchers)
- `Match.tag("tagName", fn)` - Match discriminated unions by `_tag`
- `Match.when(predicate, fn)` - Match with custom predicate
- `Match.exhaustive` - Compile error if not all cases handled
- `Match.orElse(fn)` - Fallback handler (use sparingly)
- `Match.option` - Returns `Option<A>` instead of throwing

---

### Predicate Guards

Replace `typeof` and `instanceof` with Effect Predicate:

```typescript
// FORBIDDEN - bare typeof/instanceof
typeof x === "string"
x instanceof Date
Array.isArray(x)
x && typeof x === "object" && "name" in x

// REQUIRED - Effect Predicate
P.isString(x)
P.isDate(x)
P.isArray(x)
P.hasProperty(x, "name")
P.isTagged("success")(x)  // For discriminated unions
```

**Predicate composition**:

```typescript
// FORBIDDEN - manual boolean logic
if (x > 0 && x < 100 && x % 2 === 0) { ... }

// REQUIRED - composed predicates
const isValidRange = P.and(
  Num.greaterThan(0),
  Num.lessThan(100)
);
const isValidEven = P.and(isValidRange, (n: number) => n % 2 === 0);

if (isValidEven(x)) { ... }

// Or with Match
Match.value(x).pipe(
  Match.when(isValidEven, (n) => `Valid: ${n}`),
  Match.orElse(() => "Invalid")
);
```

**Required Predicate methods**: `P.isString`, `P.isNumber`, `P.isBoolean`, `P.isObject`, `P.isArray`, `P.isNull`, `P.isUndefined`, `P.isNullable`, `P.isNotNull`, `P.isNotUndefined`, `P.isNotNullable`, `P.hasProperty`, `P.isTagged`, `P.and`, `P.or`, `P.not`, `P.struct`

---

### NEVER Use Node.js fs Module

Node.js file system APIs are callback-based or synchronous with unsafe error handling. Use `@effect/platform` FileSystem service instead.

```typescript
import { FileSystem } from "@effect/platform";

// FORBIDDEN - Node.js fs module
import * as fs from "node:fs";
const exists = fs.existsSync(path);
const content = fs.readFileSync(path, "utf-8");
fs.writeFileSync(path, data);
fs.mkdirSync(path, { recursive: true });

// FORBIDDEN - Wrapping Node.js fs in Effect.try
const exists = yield* Effect.try(() => fs.existsSync(path));

// REQUIRED - Effect FileSystem service
const fs = yield* FileSystem.FileSystem;
const exists = yield* fs.exists(path);
const content = yield* fs.readFileString(path);
yield* fs.writeFileString(path, data);
yield* fs.makeDirectory(path, { recursive: true });
```

**Key FileSystem operations**:
- **Existence**: `fs.exists(path)` - Returns `Effect<boolean>`
- **Reading**: `fs.readFileString(path)`, `fs.readFile(path)` - Returns `Effect<string | Uint8Array>`
- **Writing**: `fs.writeFileString(path, content)`, `fs.writeFile(path, data)`
- **Directories**: `fs.makeDirectory(path, { recursive: true })`, `fs.readDirectory(path)`
- **Info**: `fs.stat(path)`, `fs.access(path)`
- **Removal**: `fs.remove(path, { recursive: true })`

**Layer composition for Bun runtime**:

```typescript
import { BunContext, BunFileSystem } from "@effect/platform-bun";
import { FileSystem } from "@effect/platform";

export const BootstrapSpecLive = Layer.mergeAll(
  BunFileSystem.layer,  // Provides FileSystem.FileSystem service
  RepoUtils.layer,
  ConsoleLogger.layer
);

// In handler
export const bootstrapSpecHandler = (input: BootstrapSpecInput) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const exists = yield* fs.exists(specPath);
    // ...
  }).pipe(
    Effect.provide(BootstrapSpecLive)
  );
```

**Error handling patterns**:

```typescript
// Handle specific file system errors
const content = yield* fs.readFileString(path).pipe(
  Effect.catchTag("SystemError", (error) =>
    new FileNotFoundError({ path, cause: error })
  )
);

// Check existence safely
const exists = yield* fs.exists(path).pipe(
  Effect.catchTag("SystemError", () => Effect.succeed(false))
);
```

**Reference implementation**: See `tooling/cli/src/commands/create-slice/handler.ts` for canonical file system patterns in CLI commands.

### Yieldable Error Rule (REQUIRED)

Do not wrap yieldable tagged errors in `Effect.fail(...)`.

```typescript
// FORBIDDEN for Schema.TaggedError / yieldable errors
Effect.fail(new MyTaggedError({ message: "..." }))

// REQUIRED in generators
yield* new MyTaggedError({ message: "..." })

// ALLOWED when returning an Effect value
const failed: Effect.Effect<never, MyTaggedError> = new MyTaggedError({ message: "..." })
```

This avoids `@effect/language-service` warning:
`effect(unnecessaryFailYieldableError)`.
