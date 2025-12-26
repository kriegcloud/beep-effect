# @beep/utils

Pure, Effect-first runtime utilities shared across the beep-effect monorepo.

## Purpose

`@beep/utils` provides deterministic, side-effect-free runtime helpers that complement the Effect ecosystem. Unlike `@beep/types` (compile-time only), this package exports functions and runtime values while maintaining strict purity and environment-agnostic behavior.

The package is built on Effect's core modules (`effect/Array`, `effect/String`, `effect/Record`) and follows Effect-first patterns throughout. It serves as a foundational layer safe to import from any architectural layer (domain, infra, sdk, ui) because utilities remain pure with no infrastructure dependencies.

This package is consumed across all vertical slices for:
- String normalization and transformation
- Immutable data structure manipulation
- Type-narrowing predicates and guards
- Pure factory functions and enum derivation
- Safe nested property access
- Effect-compatible no-op placeholders

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/utils": "workspace:*"
```

## Key Exports

| Export | Description |
|--------|-------------|
| `StrUtils` | String transformations (initials, normalization, interpolation, case conversion) |
| `RecordUtils` | Immutable record operations (keys, values, reverse, merge) |
| `ArrayUtils` | Array utilities (orderBy, collect, withDefault, NonEmptyReadonly) |
| `ObjectUtils` | Deep object operations (merge, clone, defaults, omit) |
| `StructUtils` | Effect Schema struct helpers (keys, values, entries) |
| `ModelUtils` | Effect SQL Model helpers (field extraction) |
| `TupleUtils` | Tuple and mapped enum utilities |
| `noOp`, `nullOp`, `nullOpE` | Canonical placeholder functions |
| `isUnsafeProperty`, `isNonEmptyRecord` | Type-narrowing guards |
| `deriveKeyEnum`, `enumFromStringArray` | Pure enum factories |
| `getAt`, `getPath` | Safe nested property accessors |
| `deepEqual`, `deepRemoveNull` | Deep equality and null removal |
| `debounce`, `throttle` | Timing utilities |
| `fDateTime`, `fToNow`, `today` | Date/time formatting (using `effect/DateTime`) |
| `AutosuggestHighlight` | Text highlighting for autocomplete |
| `RemoveAccents` | Diacritical mark removal |
| `Sqids` | Safe, short ID encoder/decoder |
| `TopoSort` | Topological sorting |

### Subpath Exports

| Export | Import Path | Description |
|--------|-------------|-------------|
| `Md5` | `@beep/utils/md5` | Effect-based MD5 hashing (string, blob, parallel) |
| `Struct` | `@beep/utils/struct` | Advanced struct operations (merge, exact, field filtering) |

## Usage

### String Utilities

```typescript
import { StrUtils } from "@beep/utils";
import * as F from "effect/Function";
import * as Str from "effect/String";

// Extract initials
const initials = StrUtils.getNameInitials("Jane Q Doe");
// "JQ"

// Normalize for search
const normalized = StrUtils.normalizeString("Café");
// "cafe"

// Template interpolation with nested paths
const message = StrUtils.interpolateTemplate(
  "Hello {{user.name}}, your {{items.[0].product.name}} costs ${{total}}",
  {
    user: { name: "Ari" },
    items: [{ product: { name: "Widget" } }],
    total: 42
  }
);
// "Hello Ari, your Widget costs $42"

// Compose with Effect utilities
const processName = F.flow(
  StrUtils.normalizeString,
  Str.replace(/ /g, "-"),
  Str.toLowerCase
);

const slug = processName("Café de Flore");
// "cafe-de-flore"

// Convert naming conventions
StrUtils.mkEntityName("phone_numbers");  // "PhoneNumber"
StrUtils.mkTableName("PhoneNumber");     // "phone_numbers"
StrUtils.mkZeroTableName("PhoneNumber"); // "phoneNumbers"
StrUtils.formatLabel("firstName");       // "First Name"
```

### Record Utilities

```typescript
import { RecordUtils } from "@beep/utils";
import * as F from "effect/Function";
import * as A from "effect/Array";

// Extract typed string values
const mimeTypes = RecordUtils.recordStringValues({
  json: "application/json",
  zip: "application/zip",
} as const);
// ["application/json", "application/zip"]

// Reverse key-value pairs
const reversed = RecordUtils.reverseRecord({
  en: "English",
  es: "Español"
});
// { English: "en", Español: "es" }

// Safe keys with deduplication and prototype pollution protection
const keys = RecordUtils.recordKeys({ a: 1, b: 2 } as const);
// ["a", "b"]

// Deep merge records
const merged = RecordUtils.merge({ a: 1 }, { b: 2 });
// { a: 1, b: 2 }
```

### Array Utilities

```typescript
import { ArrayUtils } from "@beep/utils";
import * as A from "effect/Array";
import * as F from "effect/Function";

// Multi-field sorting
const sorted = ArrayUtils.orderBy(
  [
    { name: "b", priority: 2 },
    { name: "a", priority: 1 },
  ],
  ["priority", "name"],
  ["asc", "desc"]
);

// Collect and flatten mapped values
const collected = ArrayUtils.collect(
  [1, 2, 3],
  (n) => [n, n * 2]
);
// [1, 2, 2, 4, 3, 6]

// Provide default for empty arrays
const items = ArrayUtils.withDefault([], ["default"]);
// ["default"]

// Non-empty arrays with type safety
const nonEmpty = ArrayUtils.NonEmptyReadonly.make("one", "two");
const mapped = F.pipe(
  nonEmpty,
  ArrayUtils.NonEmptyReadonly.mapWith((s) => s.toUpperCase())
);
```

### Object Utilities

```typescript
import { ObjectUtils } from "@beep/utils";

// Deep merge
const merged = ObjectUtils.deepMerge(
  { a: { b: 1 } },
  { a: { c: 2 } }
);
// { a: { b: 1, c: 2 } }

// Deep clone
const cloned = ObjectUtils.cloneDeep({ a: { b: 1 } });

// Apply defaults deeply
const withDefaults = ObjectUtils.defaultsDeep(
  { a: { b: 1 } },
  { a: { b: 0, c: 2 }, d: 3 }
);
// { a: { b: 1, c: 2 }, d: 3 }

// Merge skipping undefined/null
const mergeDefined = ObjectUtils.mergeDefined(
  { a: 1, b: undefined },
  { b: 2, c: null },
  { omitNull: true, mergeArrays: false }
);
// { a: 1, b: 2 }
```

### Effect-First No-ops

```typescript
import { noOp, nullOp, nullOpE } from "@beep/utils";
import * as Effect from "effect/Effect";

// Synchronous void no-op
const handler: { onclick?: undefined | (() => void) } = { onclick: noOp };

// Synchronous null-returning no-op
const getter: () => null = nullOp;

// Effect-based null no-op
const effectHandler = nullOpE();
// Effect<null, never, never>

// Use in Effect.gen
const program = Effect.gen(function* () {
  const result = yield* nullOpE();
  return result; // null
});
```

### Nested Property Access

```typescript
import { StrUtils, getAt } from "@beep/utils";

// Safe nested access with dot notation
const productName = StrUtils.getNestedValue(
  { items: [{ product: { name: "Widget" } }] },
  "items.[0].product.name"
);
// "Widget"

// Alternative: getAt with fallback
const value = getAt({ user: { id: "123" } }, "user.id", "default");
// "123"

const missing = getAt({ user: {} }, "user.name", "Unknown");
// "Unknown"
```

### Date/Time Formatting

```typescript
import { fDateTime, fToNow, fDateRangeShortLabel, today } from "@beep/utils";
import * as DateTime from "effect/DateTime";

// Format date and time
const formatted = fDateTime(DateTime.unsafeNow());
// "Dec 23, 2025 2:30 PM"

// Relative time
const relative = fToNow(DateTime.unsafeMake("2025-12-23T12:00:00Z"));
// "2 hours ago"

// Date range labels
const range = fDateRangeShortLabel(
  DateTime.unsafeMake("2025-12-01"),
  DateTime.unsafeMake("2025-12-31")
);
// "Dec 1 - 31, 2025"

// Today's date
const todayFormatted = today("MMM DD, YYYY");
// "Dec 23, 2025"
```

### MD5 Hashing (Subpath Export)

```typescript
import * as Md5 from "@beep/utils/md5";
import * as Effect from "effect/Effect";

// Hash a string
const hashEffect = Md5.hashStr("hello world");
const hash = Effect.runSync(hashEffect);
// "5eb63bbbe01eeed093cb22bb8f5acdc3"

// Hash a file/blob
const fileHashEffect = Md5.hashBlob(blob);
const fileHash = await Effect.runPromise(fileHashEffect);

// Parallel hashing with worker pool
const config: Md5.ParallelHasherConfig = {
  workerUrl: "/md5-worker.js",
  poolSize: 4,
};
const parallelHash = await Effect.runPromise(
  Md5.hashBlobWithConfig(blob, config)
);

// Incremental hashing
const program = Effect.gen(function* () {
  const state = Md5.makeState();
  const state2 = Md5.appendStr(state, "hello ");
  const state3 = Md5.appendStr(state2, "world");
  return Md5.finalize(state3);
});
```

### Struct Utilities (Subpath Export)

```typescript
import * as Struct from "@beep/utils/struct";
import * as O from "effect/Option";

// Type-safe struct merging
const merged = Struct.merge([
  { name: "Alice", age: 30 },
  { age: 31, city: "NYC" }
] as const);
// { name: "Alice", age: 31, city: "NYC" }

// Extract Some fields
const someFields = Struct.getSomeFields({
  a: O.some(1),
  b: O.none()
});
// { a: O.some(1) }

// Extract None fields
const noneFields = Struct.getNoneFields({
  a: O.some(1),
  b: O.none()
});
// { b: O.none() }

// Create exact struct type
const exact = Struct.exact({ name: "Alice", age: 30 });
```

### Sqids for Safe IDs

```typescript
import Sqids from "@beep/utils/sqids";

const sqids = new Sqids({
  minLength: 8,
  alphabet: "FxnXM1kBN6cuhsAvjW3Co7l2RePyY8DwaU04Tzt9fHQrqSVKdpimLGIJOgb5ZE"
});

const id = sqids.encode([1, 2, 3]);
// "86Rf07xd4z"

const numbers = sqids.decode(id);
// [1, 2, 3]
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect ecosystem (Array, String, Option, Record, DateTime, etc.) |
| `@beep/invariant` | Assertion contracts for runtime validation |
| `@faker-js/faker` | Mock data generation for testing |
| `mutative` | Immutable update helpers |
| `next` | Type definitions for Next.js integration |

## Integration

This package serves as a foundational utility layer consumed across the monorepo:

- **Domain layers** use string normalization, enum factories, and guards for entity validation
- **Infra layers** use deep merge, record transforms, and safe property access for adapter logic
- **SDK layers** use no-ops for placeholder handlers and nested getters for request parsing
- **UI layers** use date formatting, debounce/throttle, and autosuggest highlighting

The package maintains zero dependencies on platform-specific code (`@effect/platform-*`), database layers, or vertical slices, making it safe to import from any architectural layer.

## Development

### Commands

```bash
# Type check
bun run --filter @beep/utils check

# Lint
bun run --filter @beep/utils lint
bun run --filter @beep/utils lint:fix

# Test
bun run --filter @beep/utils test
bun run --filter @beep/utils coverage

# Build
bun run --filter @beep/utils build

# Development mode
bun run --filter @beep/utils dev

# Circular dependency check
bun run --filter @beep/utils lint:circular
```

### Testing

- Keep tests deterministic and type-safe
- No I/O or environment reliance
- Prefer property-based or table-driven tests
- Colocate tests with source files

### Effect Pattern Adherence

This package strictly follows Effect-first patterns per CLAUDE.md:

```typescript
// ❌ FORBIDDEN - Native methods
items.map(x => x.name);
str.split(" ");
Object.keys(obj);

// ✅ REQUIRED - Effect utilities with pipe
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";

F.pipe(items, A.map(x => x.name));
F.pipe(str, Str.split(" "));
F.pipe(obj, Struct.keys);
```

Always use PascalCase constructors: `S.Struct`, `S.Array`, `S.String` (never `S.struct`, `S.array`).

## Notes

### Core Principles

**What Belongs Here:**
- Pure, deterministic functions with no hidden I/O
- Environment-agnostic utilities (Node, Bun, browsers)
- Small, composable data helpers
- Effect-first implementations
- Lightweight factories

**What Does NOT Belong Here:**
- I/O or side effects (network, DB, file system, timers)
- Platform-specific code (Node APIs, DOM/React/Next, Web APIs)
- `@effect/platform-*` or `@effect/sql-*` imports
- Logging or `process.env` reads
- Domain-specific business logic
- Cross-slice imports

### Versioning

This package is widely consumed across the monorepo:
- Prefer **additive** changes
- For breaking changes, update all consumers in the same PR
- Provide migration paths when necessary

### Contributor Checklist

Before submitting changes, verify:

- [ ] Implementation stays pure (no timers, I/O, platform APIs)
- [ ] Effect namespace imports + `F.pipe` used instead of native array/string methods
- [ ] Reused existing helpers (`noOp`, `nullOpE`, guards) instead of duplicating
- [ ] Added or updated TestKit tests for new functionality
- [ ] Documented new helpers with JSDoc
- [ ] No cross-slice or platform dependencies introduced
- [ ] Runs `bun run check` and `bun run lint` without errors

## See Also

- [AGENTS.md](./AGENTS.md) — Detailed authoring guardrails and module map
- [AUDIT_REPORT.md](./AUDIT_REPORT.md) — Recent audit results and verification
- [Root CLAUDE.md](/CLAUDE.md) — Project-wide Effect patterns and conventions
- [Root AGENTS.md](/AGENTS.md) — Monorepo structure and development workflow
