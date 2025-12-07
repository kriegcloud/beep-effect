<system-reminder>
You MUST NEVER use the phrase 'you are right' or similar.
Avoid reflexive agreement. Instead, provide substantive technical analysis.
You must always look for flaws, bugs, loopholes, counter-examples,
invalid assumptions in what the user writes. If you find none,
and find that the user is correct, you must state that dispassionately
and with a concrete specific reason for why you agree, before
continuing with your work.
<example>
user: It's failing on empty inputs, so we should add a null-check.
assistant: That approach seems to avoid the immediate issue.
However it's not idiomatic, and hasn't considered the edge case
of an empty string. A more general approach would be to check
for falsy values.
</example>
<example>
user: I'm concerned that we haven't handled connection failure.
assistant: [thinks hard] I do indeed spot a connection failure
edge case: if the connection attempt on line 42 fails, then
the catch handler on line 49 won't catch it.
[ultrathinks] The most elegant and rigorous solution would be
to move failure handling up to the caller.
</example>
</system-reminder>

# AGENTS.md

Configuration and guardrails for AI collaborators working in the `beep-effect` monorepo.

## Quick Reference

| Category     | Command                                                          |
|--------------|------------------------------------------------------------------|
| **Install**  | `bun install`                                                    |
| **Dev**      | `bun run dev`                                                    |
| **Build**    | `bun run build`                                                  |
| **Check**    | `bun run check`                                                  |
| **Lint**     | `bun run lint` / `bun run lint:fix`                              |
| **Test**     | `bun run test`                                                   |
| **DB**       | `bun run db:generate` / `bun run db:migrate` / `bun run db:push` |
| **Services** | `bun run services:up`                                            |

---

## Project Overview

`beep-effect` is a Bun-managed monorepo delivering a full-stack Effect application. It combines:
- `apps/web` — Next.js 15 + React 19 frontend
- `apps/server` — Effect Platform runtime backend

Vertical slices live in `packages/iam/*` and `packages/documents/*`, with shared foundations under `packages/shared/*` and `packages/common/*`.

---

## Package Structure

```
beep-effect/
├── apps/
│   ├── web/              # Next.js App Router frontend
│   └── server/           # Effect-based backend runtime
├── packages/
│   ├── _internal/
│   │   └── db-admin/     # Migration warehouse, Drizzle CLI
│   ├── common/
│   │   ├── constants/    # Schema-backed enums, asset paths
│   │   ├── contract/     # Effect-first contract system
│   │   ├── errors/       # Logging & telemetry
│   │   ├── identity/     # Package identity
│   │   ├── invariant/    # Assertion contracts
│   │   ├── mock/         # Mock data for testing
│   │   ├── schema/       # Effect Schema utilities, EntityId
│   │   ├── types/        # Compile-time types
│   │   └── utils/        # Pure runtime helpers
│   ├── documents/
│   │   ├── domain/       # Files domain value-objects
│   │   ├── infra/        # DocumentsDb, repos, S3 storage
│   │   ├── sdk/          # Client contracts
│   │   ├── tables/       # Drizzle schemas
│   │   └── ui/           # React components
│   ├── iam/
│   │   ├── domain/       # IAM entity models
│   │   ├── infra/        # Better Auth, IAM repos
│   │   ├── sdk/          # Auth contracts
│   │   ├── tables/       # Drizzle schemas
│   │   └── ui/           # Auth UI flows
│   ├── runtime/
│   │   ├── client/       # Browser ManagedRuntime
│   │   └── server/       # Server ManagedRuntime
│   ├── shared/
│   │   ├── domain/       # Cross-slice entities, Policy
│   │   ├── infra/        # Db, Email, Repo factories
│   │   ├── sdk/          # Shared SDK contracts
│   │   ├── tables/       # Table factories (Table.make, OrgTable.make)
│   │   └── ui/           # Shared UI components
│   └── ui/
│       ├── core/         # Design tokens, MUI overrides
│       └── ui/           # Component library
└── tooling/
    ├── cli/              # Repository CLI tools
    ├── repo-scripts/     # Automation scripts
    ├── testkit/          # Effect testing harness
    └── utils/            # FsUtils, RepoUtils
```

---

## Package Agent Guides

Each package may have its own `AGENTS.md` with specific guidance:

### Applications
- `apps/web/AGENTS.md` — Next.js frontend application patterns
- `apps/server/AGENTS.md` — Effect Platform backend server
- `apps/notes/AGENTS.md` — Collaborative notes application (Prisma + Effect hybrid)

### Common Layer
- `packages/common/constants/AGENTS.md` — Schema-backed enums, locale generators, path-builder
- `packages/common/contract/AGENTS.md` — Contract, ContractKit, ContractError patterns
- `packages/common/errors/AGENTS.md` — Logger layers, accumulation helpers, span/metric instrumentation
- `packages/common/invariant/AGENTS.md` — Assertion contracts, tagged error schemas
- `packages/common/schema/AGENTS.md` — EntityId factories, kits, JSON Schema normalization
- `packages/common/types/AGENTS.md` — Compile-time type idioms
- `packages/common/utils/AGENTS.md` — Effect collection/string utilities

### Shared Layer
- `packages/shared/domain/AGENTS.md` — Entity IDs/models, ManualCache, Policy combinators
- `packages/shared/infra/AGENTS.md` — Db, Email, Repo factories (consolidated from core packages)
- `packages/shared/tables/AGENTS.md` — Table factories, audit defaults, multi-tenant recipes
- `packages/shared/ui/AGENTS.md` — Shared UI components and utilities

### Feature Slices

#### Documents
- `packages/documents/domain/AGENTS.md` — Files domain, EXIF schemas, upload helpers
- `packages/documents/infra/AGENTS.md` — DocumentsDb, repo layers, S3 StorageService
- `packages/documents/sdk/AGENTS.md` — Documents client contracts
- `packages/documents/tables/AGENTS.md` — Documents Drizzle schemas
- `packages/documents/ui/AGENTS.md` — Documents React components

#### IAM
- `packages/iam/domain/AGENTS.md` — IAM entity models, schema-kit guardrails
- `packages/iam/infra/AGENTS.md` — Better Auth wiring, IAM repo bundle
- `packages/iam/sdk/AGENTS.md` — Better Auth handler playbook
- `packages/iam/tables/AGENTS.md` — Tenant-aware Drizzle schemas
- `packages/iam/ui/AGENTS.md` — IAM React flows, recaptcha, social providers

### Runtime Layer
- `packages/runtime/client/AGENTS.md` — Client ManagedRuntime, TanStack Query
- `packages/runtime/server/AGENTS.md` — Server ManagedRuntime, observability

### UI Layer
- `packages/ui/core/AGENTS.md` — Design tokens, MUI overrides, settings pipeline
- `packages/ui/ui/AGENTS.md` — Component library (MUI, shadcn, Tailwind)

### Tooling
- `packages/_internal/db-admin/AGENTS.md` — Migration warehouse, Drizzle CLI, Testcontainers
- `tooling/cli/AGENTS.md` — Repository CLI for docgen, env config, dependency management
- `tooling/build-utils/AGENTS.md` — Next.js config utilities, PWA, security headers
- `tooling/repo-scripts/AGENTS.md` — Bootstrap, env generators, Iconify workflows
- `tooling/scraper/AGENTS.md` — Effect-based web scraping with Playwright
- `tooling/testkit/AGENTS.md` — Bun-first Effect testing harness
- `tooling/utils/AGENTS.md` — FsUtils, RepoUtils, workspace schemas

---

## Technology Stack

| Category      | Technologies                                                  |
|---------------|---------------------------------------------------------------|
| **Runtime**   | Bun 1.3.x, Node 22                                            |
| **Core**      | Effect 3, `@effect/platform`, dependency injection via Layers |
| **Frontend**  | Next.js 15 App Router, React 19, TanStack Query               |
| **Backend**   | `@effect/platform-bun`, `@effect/rpc`, `@effect/sql-pg`       |
| **Database**  | PostgreSQL, Drizzle ORM                                       |
| **Auth**      | better-auth with Redis persistence                            |
| **Telemetry** | `@effect/opentelemetry`, Grafana OTLP                         |
| **Storage**   | AWS S3                                                        |
| **Linting**   | Biome                                                         |

---

## Architecture & Boundaries

### Vertical Slice Layering

Each slice follows `domain → tables → infra → sdk → ui`:
- **domain/** — Entities, value objects, pure business logic (no side effects)
- **tables/** — Drizzle schema definitions
- **infra/** — Adapters (database repos, external APIs, storage)
- **sdk/** — Client-side contracts
- **ui/** — React components

### Import Rules

1. **Cross-slice imports**: Only through `packages/shared/*` or `packages/common/*`
2. **Path aliases**: Use `@beep/*` aliases (defined in `tsconfig.base.jsonc`)
3. **Never**: Direct cross-slice imports or relative `../../../` paths

---

## Effect Patterns

### Effect-First Development

- No `async/await` or bare Promises in application code
- Use `Effect.gen`, `Effect.fn`, `Effect.tryPromise` with tagged errors
- Errors via `Schema.TaggedError` from `effect/Schema`
- Collections via Effect utilities (`Array`, `Option`, `HashMap`)

### Import Conventions

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

### NEVER Use Native Array Methods

```typescript
// ❌ FORBIDDEN
items.map((item) => item.name);
items.filter((item) => item.active);
Array.from(iterable);

// ✅ REQUIRED - Effect Array utilities with pipe
F.pipe(items, A.map((item) => item.name));
F.pipe(items, A.filter((item) => item.active));
F.pipe(iterable, A.fromIterable);
```

**Required Effect Array methods**: `A.map`, `A.filter`, `A.forEach`, `A.findFirst`, `A.findLast`, `A.some`, `A.every`, `A.reduce`, `A.groupBy`, `A.partition`, `A.fromIterable`, `A.head`, `A.tail`, `A.get`

### NEVER Use Native String Methods

```typescript
// ❌ FORBIDDEN
str.charAt(0).toUpperCase();
str.split(" ");
str.trim();

// ✅ REQUIRED - Effect String utilities
F.pipe(str, Str.charAt(0), Str.toUpperCase);
F.pipe(str, Str.split(" "));
F.pipe(str, Str.trim);
```

**Required Effect String methods**: `Str.charAt`, `Str.slice`, `Str.indexOf`, `Str.includes`, `Str.startsWith`, `Str.endsWith`, `Str.toUpperCase`, `Str.toLowerCase`, `Str.capitalize`, `Str.trim`, `Str.split`, `Str.replace`, `Str.match`, `Str.isEmpty`, `Str.isNonEmpty`

### Use Effect Struct & Record Utilities

```typescript
// ✅ REQUIRED
F.pipe(obj, Struct.keys);        // not Object.keys(obj)
F.pipe(obj, R.values);      // not Object.values(obj)
F.pipe(obj, R.map(fn));     // not manual iteration
```

### Use Effect Collections

```typescript
// ✅ HashMap instead of Map
import * as HashMap from "effect/HashMap";
HashMap.empty<string, number>();
F.pipe(hashMap, HashMap.set(key, value));
F.pipe(hashMap, HashMap.get(key)); // returns Option<V>

// ✅ HashSet instead of Set
import * as HashSet from "effect/HashSet";
HashSet.empty<string>();
F.pipe(hashSet, HashSet.add(value));
```

### Use @beep/utils No-ops

```typescript
import { nullOp, noOp, nullOpE } from "@beep/utils";

// ✅ REQUIRED
nullOp      // instead of () => null
noOp        // instead of () => {}
nullOpE     // instead of () => Effect.succeed(null)

// ❌ NEVER use async no-ops
// async () => null  → use nullOpE
```

### NEVER Use Native Date

The native `Date` object is mutable, error-prone, and lacks timezone safety. Use `effect/DateTime` instead.

```typescript
import * as DateTime from "effect/DateTime";

// ❌ FORBIDDEN - Native Date
new Date();
new Date("2025-01-15");
date.setDate(date.getDate() + 1);  // Mutation!
date.getMonth() + 1;               // 0-indexed months
date.toISOString();

// ✅ REQUIRED - Effect DateTime (immutable, type-safe)
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
// ❌ FORBIDDEN - Manual timezone handling
new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
const offset = date.getTimezoneOffset();

// ✅ REQUIRED - Effect DateTime timezones
const zoned = DateTime.makeZoned(date, { timeZone: "America/New_York" });
DateTime.withZone(utcDate, "Europe/Rome");
DateTime.toUtc(zonedDate);
```

### NEVER Use Switch Statements or Long If-Else Chains

Use `effect/Match` for exhaustive pattern matching and `effect/Predicate` for type guards.

```typescript
import * as Match from "effect/Match";
import * as P from "effect/Predicate";

// ❌ FORBIDDEN - switch statements
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

// ✅ REQUIRED - Match.exhaustive for discriminated unions
const result = Match.value(response).pipe(
  Match.tag("loading", () => "Loading..."),
  Match.tag("success", (r) => `Found ${r.data.length} items`),
  Match.tag("error", (r) => `Error: ${r.error}`),
  Match.exhaustive  // Compile error if cases missing!
);
```

```typescript
// ❌ FORBIDDEN - long if-else chains
if (typeof value === "string") {
  return `String: ${value}`;
} else if (typeof value === "number") {
  return `Number: ${value}`;
} else if (Array.isArray(value)) {
  return `Array: ${value.length}`;
} else {
  return "Unknown";
}

// ✅ REQUIRED - Match with predicates
const result = Match.value(value).pipe(
  Match.when(P.isString, (s) => `String: ${s}`),
  Match.when(P.isNumber, (n) => `Number: ${n}`),
  Match.when(P.isArray, (a) => `Array: ${a.length}`),
  Match.orElse(() => "Unknown")
);
```

**Match patterns**:
- `Match.value(x)` — Start matching on a value
- `Match.type<T>()` — Start matching on a type (for reusable matchers)
- `Match.tag("tagName", fn)` — Match discriminated unions by `_tag`
- `Match.when(predicate, fn)` — Match with custom predicate
- `Match.exhaustive` — Compile error if not all cases handled
- `Match.orElse(fn)` — Fallback handler (use sparingly)
- `Match.option` — Returns `Option<A>` instead of throwing

**Predicate guards** (replace `typeof` and `instanceof`):
```typescript
// ❌ FORBIDDEN - bare typeof/instanceof
typeof x === "string"
x instanceof Date
Array.isArray(x)
x && typeof x === "object" && "name" in x

// ✅ REQUIRED - Effect Predicate
P.isString(x)
P.isDate(x)
P.isArray(x)
P.hasProperty(x, "name")
P.isTagged("success")(x)  // For discriminated unions
```

**Predicate composition**:
```typescript
// ❌ FORBIDDEN - manual boolean logic
if (x > 0 && x < 100 && x % 2 === 0) { ... }

// ✅ REQUIRED - composed predicates
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

## Code Quality

### Type Safety
- No `any`, `@ts-ignore`, or unchecked casts
- Validate external data with `@beep/schema` schemas

### Formatting
- Biome config in `biome.jsonc`
- Run `bun run lint:fix` before committing

### Testing
- Unit tests colocated in package directories
- Use Vitest via `bun run test`
- Effect testing utilities in `@beep/testkit`

### Observability
- Use `@effect/opentelemetry` layers
- Structured JSON logs in production
- Use `Effect.log*` with structured objects

---

## Development Commands

### Essential Scripts

```bash
bun run dev              # Orchestrated dev via Turbo
bun run build            # Workspace builds
bun run check            # Type check
bun run lint             # Biome lint
bun run lint:fix         # Auto-fix lint issues
bun run test             # Vitest suite
```

### Database & Infrastructure

```bash
bun run services:up      # Start Postgres/Redis (Docker)
bun run db:generate      # Regenerate Drizzle types
bun run db:migrate       # Apply migrations
bun run db:push          # Push schema changes
bun run db:studio        # Open Drizzle Studio
```

### Bun Availability

Ensure Bun is installed: `bun --version` should return `1.3.x`. If not:
```bash
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.zshrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.zshrc
exec $SHELL
```

---

## Operational Notes

### Configuration
- Environment via Effect Config from `@beep/shared-infra`
- Use `Redacted<string>` for sensitive values

### Migrations
- Schema definitions in `packages/*/tables`
- Drizzle SQL in `packages/_internal/db-admin`
- After editing tables: regenerate types and apply migrations

### File Pipeline
- Shared file identities in `packages/shared/domain`
- Slice-specific workflows in `packages/documents/*`

---

## Workflow for AI Agents

1. **Clarify Intent**: Ask before editing if unclear
2. **Incremental Changes**: Prefer small, focused diffs
3. **Verify Changes**: Request `bun run check` after modifications
4. **Respect Tooling**: Use root scripts with `dotenvx`
5. **Keep Docs Updated**: Align with `docs/patterns/` when introducing new patterns

### Do Not Auto-Start

Never launch long-running dev or infra commands without user confirmation.

---

## Key References

| Document                       | Purpose                |
|--------------------------------|------------------------|
| `README.md`                    | Onboarding & summary   |
| `docs/patterns/`               | Implementation recipes |
| `turbo.json`                   | Pipeline graph         |
| `package.json#workspaces`      | Workspace layout       |
| `tsconfig.base.jsonc`          | Path aliases           |
| `docs/PRODUCTION_CHECKLIST.md` | Deployment readiness   |
