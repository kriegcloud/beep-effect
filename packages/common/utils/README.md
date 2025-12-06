# @beep/utils

Pure, Effect-first runtime utilities shared across the beep-effect monorepo.

## Overview

`@beep/utils` provides a comprehensive collection of deterministic, side-effect-free runtime helpers that complement the Effect ecosystem. Unlike `@beep/types` (compile-time only), this package exports functions and runtime values, but maintains strict purity and environment-agnostic behavior.

The utilities are built on top of Effect's core modules (`effect/Array`, `effect/String`, `effect/Record`, etc.) and follow Effect-first patterns throughout.

## Core Principles

### What Belongs Here

- **Pure, deterministic functions** that operate on inputs and return outputs with no hidden I/O
- **Environment-agnostic utilities** that run identically in Node, Bun, and browsers
- **Small, composable data helpers** for string normalization, record transforms, type-narrowing guards
- **Effect-first implementations** using `effect/Array`, `effect/String`, `effect/Option`, etc.
- **Lightweight factories** that remain pure (e.g., enum derivation)

### What Does NOT Belong Here

- **No I/O or side effects**: no network, DB, file system, timers, or global mutation
- **No platform-specific code**: avoid Node APIs (fs, path, process), DOM/React/Next, Web APIs
- **No `@effect/platform-*`** or `@effect/sql-*` imports
- **No logging** and no `process.env` reads
- **No domain-specific logic**: business logic belongs in the owning slice (`S/domain` or `S/application`)
- **No cross-slice imports**: do not depend on `@beep/iam-*`, `@beep/documents-*`, etc.

## Package Architecture

### Architectural Fit

- **Vertical Slice + Hexagonal**: Safe to import from any layer (`domain`, `application`, `api`, `db`, `ui`) because utilities are pure and environment-agnostic
- **No upward dependencies**: Never pulls in infrastructure concerns; reusable by the most constrained layers
- **Path alias**: Import as `@beep/utils` (configured in `tsconfig.base.jsonc`)

### Related Packages

- **`@beep/types`** — Compile-time only helpers (no runtime). Prefer placing type aliases there.
- **`@beep/invariant`** — Assertion contracts and tagged error schemas
- **`@beep/errors/*`** — Error types and helpers (server/client/shared)

## Module Structure

### Data Utilities

#### `StrUtils` — String Transformations
Pure string utilities built on `effect/String`:

- `getNameInitials(name)` — Extract up to two initials from a name (e.g., "Ada Lovelace" → "AL")
- `normalizeString(str)` — Remove diacritics, lowercase, normalize for search/comparison
- `kebabCase(value)` — Convert any identifier style to kebab-case
- `stripMessageFormatting(message)` — Remove lightweight markdown formatting
- `interpolateTemplate(template, data)` — Replace `{{path.to.value}}` placeholders with data
- `getNestedValue(obj, path)` — Safe nested value extraction with dot/bracket notation
- `applyPrefix(prefix)` / `applySuffix(suffix)` — Type-preserving prefix/suffix application
- `mapApplyPrefix(prefix)` / `mapApplySuffix(suffix)` — Map prefix/suffix across literal arrays
- `pluralize(word)` / `singularize(word)` — English noun inflection
- `mkEntityName(tableName)` — Convert table names to PascalCase entity names
- `mkTableName(entityName)` — Convert entity names to snake_case table names
- `mkZeroTableName(entityName)` — Convert to camelCase plural for Zero schema
- `mkEntityType(tableName)` — Generate lowercase entity type identifiers
- `mkUrlParamName(entityName)` — Generate camelCase URL parameter names
- `formatLabel(fieldName)` — Convert identifiers to human-readable labels

#### `RecordUtils` — Record Operations
Immutable record manipulation using `effect/Record`:

- `recordKeys(record)` — Deduplicated keys with prototype pollution protection
- `recordStringValues(record)` — Extract typed string values from const records
- `reverseRecord(obj)` — Swap keys and values
- `merge(target, source)` — Deep merge with unsafe property protection

#### `ArrayUtils` — Array Operations
Array utilities built on `effect/Array`:

- `orderBy(items, keys, directions)` — Multi-field sorting
- `collect(items, fn)` — Collect and flatten mapped values
- `withDefault(items, defaultValue)` — Provide default for empty arrays
- `NonEmptyReadonly.make(...items)` — Create non-empty readonly arrays
- `NonEmptyReadonly.mapWith(fn)` — Type-safe mapping for non-empty arrays

#### `ObjectUtils` — Object Manipulation
Deep object operations:

- `deepMerge(obj1, obj2)` — Recursive deep merge
- `cloneDeep(obj)` — Deep clone objects
- `defaultsDeep(obj, defaults)` — Apply defaults deeply
- `mergeDefined(obj1, obj2)` — Merge skipping undefined values
- `omit(obj, keys)` / `omitBy(obj, predicate)` — Selective omission

#### `StructUtils` — Struct Operations
Effect Schema struct helpers:

- `structKeys(struct)` — Extract struct keys
- `structValues(struct)` — Extract struct values
- `structEntries(struct)` — Get struct entries

#### `TupleUtils` — Tuple Operations
Tuple and mapped enum utilities:

- `makeMappedEnum(...tuples)` — Create mapped enums from tuple arrays

#### `ModelUtils` — Effect SQL Model Helpers
Helpers for `@effect/sql/Model`:

- `modelFieldKeys(table)` — Extract field keys from model tables

### Binary Data

- `arrayBufferToBlob(buffer)` — Convert ArrayBuffer to Blob
- `arrayBufferToUint8Array(buffer)` — Convert ArrayBuffer to Uint8Array
- `uint8arrayToArrayBuffer(uint8)` — Convert Uint8Array to ArrayBuffer

### Guards & Predicates

Type-narrowing predicates:

- `isUnsafeProperty(key)` — Detect prototype pollution properties (`__proto__`, etc.)
- `isNonEmptyRecord(record)` — Type guard for non-empty records

### Getters

Safe property accessors:

- `getAt(obj, path)` — Nested property access with dot notation
- `getPath(obj, path)` — Object path utilities

### Factories

Pure factory functions:

- `deriveKeyEnum(obj)` — Derive key-based enums from objects
- `enumFromStringArray(...values)` — Create enums from string arrays
- `valuesFromEnum(enumObj)` — Extract values from enum objects

### No-ops

Canonical placeholder functions (required across the repo):

- `noOp()` — Synchronous void no-op
- `nullOp()` — Synchronous null-returning no-op
- `asyncNoOp()` — Async void no-op
- `asyncNullOp()` — Async null-returning no-op
- `nullOpE()` — Effect-based null-returning no-op

### Timing

Browser-compatible timing helpers:

- `debounce(fn, delay)` — Debounce function execution
- `throttle(fn, delay)` — Throttle function execution

### Text Processing

- `AutosuggestHighlight.match(text, query)` — Highlight matching text for autocomplete
- `AutosuggestHighlight.parse(text, matches)` — Parse match results for rendering
- `RemoveAccents.removeAccents(text)` — Strip diacritical marks
- `dedent` — Template literal dedentation

### Advanced Utilities

- `TopoSort` — Topological sorting implementation
- `Sqids` — Safe, short ID encoder/decoder with blocklist support
- `constLiteral(value)` — Preserve literal type inference
- `deepEqual(a, b)` — Deep equality comparison
- `deepRemoveNull(obj)` — Remove null values from nested structures
- `mergeDefined(obj1, obj2)` — Merge objects preserving defined values
- `removeReadonly(value)` — Type-safe readonly escape hatch
- `randomHexString(length)` — Generate random hex strings
- `fToNow(date)` — Format time relative to now

### Sync Utilities

Adapter sync status types:

- `AdapterSyncItem` — Type for adapter sync items
- Sync status types (`synced`, `syncing`, `error`, etc.)

## Usage Examples

### String Utilities

```typescript
import { StrUtils } from "@beep/utils";

// Extract initials
const initials = StrUtils.getNameInitials("Jane Q Doe");
// "JQ"

// Normalize for search
const normalized = StrUtils.normalizeString("Café");
// "cafe"

// Template interpolation
const message = StrUtils.interpolateTemplate(
  "Hello {{user.name}}, your {{items.[0].product.name}} costs ${{total}}",
  {
    user: { name: "Ari" },
    items: [{ product: { name: "Widget" } }],
    total: 42
  }
);
// "Hello Ari, your Widget costs $42"

// Convert table names
StrUtils.mkEntityName("phone_numbers");  // "PhoneNumber"
StrUtils.mkTableName("PhoneNumber");     // "phone_numbers"
```

### Record Utilities

```typescript
import { RecordUtils } from "@beep/utils";

// Extract typed values
const mimeTypes = RecordUtils.recordStringValues({
  json: "application/json",
  zip: "application/zip",
} as const);
// ["application/json", "application/zip"]

// Reverse record
const reversed = RecordUtils.reverseRecord({
  en: "English",
  es: "Español"
});
// { English: "en", Español: "es" }

// Safe keys with deduplication
const keys = RecordUtils.recordKeys({ a: 1, b: 2 } as const);
// ["a", "b"]
```

### Array Utilities

```typescript
import { ArrayUtils } from "@beep/utils";

// Multi-field sorting
const sorted = ArrayUtils.orderBy(
  [
    { name: "b", priority: 2 },
    { name: "a", priority: 1 },
  ],
  ["priority", "name"],
  ["asc", "desc"]
);

// Non-empty arrays
const nonEmpty = ArrayUtils.NonEmptyReadonly.make("one", "two");
```

### Effect-First Patterns

```typescript
import * as Utils from "@beep/utils";
import * as F from "effect/Function";
import * as Str from "effect/String";

// Compose Effect utilities with @beep/utils
const processName = F.flow(
  Utils.StrUtils.normalizeString,
  Str.replace(/ /g, "-"),
  Str.toLowerCase
);

const slug = processName("Café de Flore");
// "cafe-de-flore"

// Safe nested access
const productName = Utils.StrUtils.getNestedValue(
  { items: [{ product: { name: "Widget" } }] },
  "items.[0].product.name"
);
// "Widget"
```

### No-ops and Placeholders

```typescript
import { noOp, nullOp, nullOpE } from "@beep/utils";
import * as Effect from "effect/Effect";

// Synchronous no-op
const handler: { onclick?: () => void } = { onclick: noOp };

// Effect-based no-op
const effectHandler = nullOpE();
// Effect<null, never, never>
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

## Effect Pattern Adherence

This package strictly follows Effect-first patterns:

### Import Conventions

```typescript
// Namespace imports for Effect modules
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
```

### No Native Methods

```typescript
// ❌ FORBIDDEN
items.map(x => x.name);
str.split(" ");
Object.keys(obj);

// ✅ REQUIRED
F.pipe(items, A.map(x => x.name));
F.pipe(str, Str.split(" "));
F.pipe(obj, Struct.keys);
```

### Uppercase Constructors

Always use PascalCase: `S.Struct`, `S.Array`, `S.String` (never `S.struct`, `S.array`).

## Development

### Commands

```bash
# Build
bun run build

# Type check
bun run check

# Lint
bun run lint
bun run lint:fix

# Test
bun run test
bun run coverage

# Circular dependency check
bun run lint:circular
```

### Testing

- Keep tests deterministic and type-safe
- No I/O or environment reliance
- Prefer property-based or table-driven tests
- Colocate tests with source files

## Versioning

This package is widely consumed across the monorepo:

- Prefer **additive** changes
- For breaking changes, update all consumers in the same PR
- Provide migration paths when necessary

## Contributor Checklist

Before submitting changes, verify:

- [ ] Implementation stays pure (no timers, I/O, platform APIs)
- [ ] Effect namespace imports + `F.pipe` used instead of native array/string methods
- [ ] Reused existing helpers (`noOp`, `nullOpE`, guards) instead of duplicating
- [ ] Added or updated Vitest tests for new functionality
- [ ] Documented new helpers with JSDoc
- [ ] No cross-slice or platform dependencies introduced
- [ ] Runs `bun run check` and `bun run lint` without errors

## See Also

- [AGENTS.md](./AGENTS.md) — Detailed authoring guardrails and usage snapshots
- [Root CLAUDE.md](../../CLAUDE.md) — Project-wide Effect patterns and conventions
- [Root AGENTS.md](../../AGENTS.md) — Monorepo structure and development workflow
