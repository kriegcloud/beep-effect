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

## Project Overview

`beep-effect` is a Bun-managed monorepo delivering a full-stack Effect application. It combines `apps/web` (Next.js 15 +
React 19), `apps/server` (Effect Platform runtime), and `apps/mcp` (MCP tooling) atop vertical slices in
`packages/iam/*`, `packages/files/*`, and shared foundations under `packages/shared/*`, `packages/core/*`, and
`packages/common/*`. Architecture details live in `README.md``, `docs/patterns/`, and
`docs/PRODUCTION_CHECKLIST.md`.

## Package Agent Guides

- `packages/ui-core/AGENTS.md` — authoritative reference for the design tokens, MUI overrides, and settings pipeline that power `@beep/ui` and downstream apps.
- `packages/ui/AGENTS.md` — orientation for the composite React component library consuming `ui-core`, MUI, shadcn, and Tailwind stacks.
- `packages/common/utils/AGENTS.md` — guardrails, Effect collection/string reminders, and toolcall shortcuts for the pure runtime helper suite (`@beep/utils`) relied on across slices.
- `packages/common/types/AGENTS.md` — compile-time type idioms, zero-runtime constraints, and Schema doc references for `@beep/types`.
- `packages/common/schema/AGENTS.md` — canonical Effect schema toolkit covering EntityId factories, kits, JSON Schema normalization, and downstream usage snapshots.
- `packages/common/invariant/AGENTS.md` — assertion contract, tagged error schema cues, and debugger notes for `@beep/invariant`.
- `packages/common/errors/AGENTS.md` — logging & telemetry playbook for `@beep/errors`, including env-driven logger layers, accumulation helpers, and span/metric instrumentation recipes.
- `packages/common/constants/AGENTS.md` — schema-backed enums, locale + asset generators, and path-builder safety guidelines tailored for `@beep/constants` consumers across env loaders and UI manifests.
- `packages/common/contract/AGENTS.md` — Effect-first contract runtime reference covering `Contract`, `ContractKit`, `ContractError`, continuations, and lift service ergonomics.
- `packages/core/env/AGENTS.md` — server/client env loaders, redacted secret guardrails, and usage snapshots that anchor runtime telemetry and auth surfaces.
- `packages/core/email/AGENTS.md` — Resend service wiring, React Email rendering safeguards, and authentication flow recipes tying IAM payloads to transport.
- `packages/shared/domain/AGENTS.md` — shared-kernel reference for entity ids/models, ManualCache, policy combinators, and PathBuilder-powered routing recipes used across IAM and Files slices.
- `packages/shared/tables/AGENTS.md` — shared Postgres table factories, audit defaults, and multi-tenant recipes that keep IAM/files schemas aligned with domain entities.
- `packages/core/db/AGENTS.md` — Postgres Layer orchestration, repo factories with `DbError` mapping, Bun SQL adapters, and Zero mutator bridging patterns for infrastructure slices.
- `packages/_internal/db-admin/AGENTS.md` — migration warehouse outlining admin schema exports, Drizzle CLI workflows, and Pg Testcontainer harnesses for slice-wide validation.
- `packages/files/domain/AGENTS.md` — files domain value-objects guide covering signature registries, EXIF schemas, size formatters, and Effect-first upload helpers.
- `packages/files/infra/AGENTS.md` — Files slice infrastructure map covering `FilesDb`, repo layers, and S3 `StorageService` conventions for apps and test harnesses.
- `packages/iam/tables/AGENTS.md` — IAM Drizzle schema reference covering tenant-aware tables, domain-driven enums, relations, and Better Auth adapter touchpoints.
- `packages/iam/infra/AGENTS.md` — Better Auth service wiring, IAM repo bundle guardrails, and Layer assembly patterns tying `IamConfig` + `IamDb` into downstream runtimes.
- `packages/iam/ui/AGENTS.md` — IAM React flow guide covering runtime runners, schema-backed forms, recaptcha, and social provider UX guardrails.
- `packages/iam/domain/AGENTS.md` — IAM entity model inventory, schema-kit guardrails, usage snapshots, and Effect-first recipes for working with `Entities.*` across repos, tables, and tests.
- `packages/iam/sdk/AGENTS.md` — Better Auth handler playbook covering AuthCallback sanitization, semaphore guards, instrumentation wiring, and usage references across `apps/web` and IAM UI clients.
- `packages/runtime/client/AGENTS.md` — client-side ManagedRuntime assembly, TanStack Query injection, and worker RPC guardrails for App Router surfaces.
- `packages/runtime/server/AGENTS.md` — ManagedRuntime assembly for server hosts, observability layer wiring, `runServerPromise*` helpers, and live usage references from Next.js entry points.
- `tooling/testkit/AGENTS.md` — Bun-first Effect testing harness guide covering Layer sharing, flaky retry scaffolds, and assertion shims for Option/Either/Exit-heavy suites.
- `tooling/repo-scripts/AGENTS.md` — repo maintenance CLI playbook detailing bootstrap/env generators, Iconify registry workflows, and schema-backed asset/locales tooling with Effect layering tips.
- `tooling/utils/AGENTS.md` — repository automation toolkit guide detailing FsUtils/RepoUtils layers, workspace + tsconfig schema guardrails, and script usage snapshots.

## Development Commands

- **Preferred Invocation** Always use root scripts (wired with `dotenvx`). Example: `bun run dev`, `bun run build`,
  `bun run lint`. If a task needs a one-off CLI, prefer `bunx <binary>`.
- **Essential Scripts**
    - `bun run dev` — orchestrated dev surfaces via Turbo
    - `bun run build` — workspace builds through `bunx turbo`
    - `bun run check` — type check aggregation; use for preflight
    - `bun run lint` / `bun run lint:fix` — Biome lint and autofix
    - `bun run test` — Vitest workspace suite
- **Database & Infra**
    - `bun run services:up` — start Postgres/Redis/Grafana stack (Docker)
    - `bun run db:generate` — regenerate Drizzle types
    - `bun run db:migrate` / `bun run db:push` — apply schema changes
    - `bun run db:studio` — open Drizzle Studio
    - `bun run db:exec` — shell into Postgres container
- **Do Not Auto-Start** Never launch long-running dev or infra commands on behalf of the user. Provide the command and
  wait for confirmation/results.

## Technology Stack

- **Core Philosophy** Effect-first functional architecture, dependency injection via Layers, strongly typed runtime
  schemas.
- **Frontend** Next.js 15 App Router, React 19, `@effect/platform-browser`, TanStack Query.
- **Backend** `@effect/platform-node` (migrating to Bun runtime), `@effect/rpc`, `@effect/sql-pg` with Drizzle. Better
  Auth provides authentication with Redis persistence.
- **Cross-Cutting** `@effect/opentelemetry` telemetry, Grafana OTLP collector (`docker-compose.yml`), AWS S3 for file
  storage, Stripe & Dub integrations via IAM infra adapters.

## Architecture & Boundaries

- **Vertical Slices** Follow the `domain -> application -> infra -> ui/sdk` layering inside `packages/iam/*` and
  `packages/files/*`. Application ports live in `application`, adapters in `infra`, UI in `ui`/`apps/web`.
- **Shared Foundations**
    - `packages/shared/*` for cross-slice entities/tables.
    - `packages/common/*` for utilities, schemas, errors, invariants.
    - `packages/core/*` for runtime infrastructure (DB, env, email).
- **Apps Layer** Use `@beep/iam-application` facades, not infra implementations. `apps/web` composes runtime Layers (see
  `apps/web/src/runtime`), `apps/server` hosts server runtime, `apps/mcp` exposes MCP tooling.
- **Path Aliases** Defined in `tsconfig.base.json`. Respect slice boundaries; no direct cross-slice imports.

## Effect Patterns & Coding Guidelines

- **Effect-First** No async/await or bare Promises in application code. Use `Effect.gen`, `Effect.fn`,
  `Effect.tryPromise` with tagged errors (`effect/Schema` `Schema.TaggedError`).
- **Tagged Errors & Logging** Keep prod logs JSON structured (see `docs/PRODUCTION_CHECKLIST.md`). Leverage
  `Effect.log*` with structured objects. Avoid `instanceof` guards; error channels are typed.
- **Collections** Prefer Effect collection modules (`Array`, `Option`, `HashMap`, etc.). When interacting with
  arrays/strings, default to Effect utilities to align with slice conventions.
- **Ports & Layers** Define ports in application layer, implement adapters in infra. Compose Layers at the app
  boundary (`apps/web/src/runtime`, `packages/runtime/server`).
- **Imports** Use absolute aliases (`@beep/...`) instead of relative traversals.
- **Props Handling** Follow slice conventions: destructure props inside component bodies, maintain Option suffix (
  `fooOpt`).

## Code Quality & Style

- **Formatting** Biome config lives in `biome.jsonc`. Run `bun run lint:fix` before handing work back.
- **Type Safety** No `any`, `@ts-ignore`, or unchecked casts. Validate external data with schemas from
  `@beep/common/schema`.
- **Testing**
    - Unit tests colocated in package directories. Use Vitest via `bun run test` or targeted Turbo pipelines.
    - Integration/E2E at app layer (`apps/web`, `apps/server`). Prefer exercising application use cases via ports.
- **Observability** Ensure instrumentation via `@effect/opentelemetry` layers. Runtimes set OTLP endpoints from
  `packages/core/env`.

## Operational Notes

- **Secrets & Config** All configuration flows through `packages/core/env/src/server.ts` and `client.ts` using Effect
  Config. Use `Redacted<string>` for sensitive values.
- **Migrations** Schema definitions reside in `packages/*/tables` and Drizzle SQL under `packages/_internal/db-admin`.
  After editing tables, regenerate types and apply migrations.
- **File Pipeline** Shared file identities live in `packages/shared/domain`; slice-specific workflows in
  `packages/files/*`. See `@prompt.md` for upload specs.
- **Production Posture** Follow `docs/PRODUCTION_CHECKLIST.md` for logging levels, environment flags, and deployment
  readiness.

## Workflow for AI Agents

- **Ask for Intent** Clarify the user’s target before editing. Favour incremental diffs via `apply_patch`.
- **Verify Before Claiming Done** If you modify code, request the user run `bun run check` or relevant targeted command;
  avoid auto-running expensive commands unless necessary and approved.
- **Respect Tooling Updates** Bun scripts wrap `bunx turbo` with `dotenvx`. If PATH issues arise, prepend
  `direnv exec .`.
- **Documentation** Keep architecture docs aligned; update `docs/patterns/`` when introducing new
  patterns.

## Tool Call Reference

- **Directory overview** Prefer `jetbrains__list_directory_tree` with `projectPath: "/home/elpresidank/YeeBois/projects/beep-effect"` over ad-hoc `ls`; adjust `maxDepth` instead of chaining shell commands.
- **Inspect files** Use `jetbrains__get_file_text_by_path` (always pass `projectPath`) or `jetbrains__open_file_in_editor`; avoid shell `cat`.
- **Search** Reach for `jetbrains__search_in_files_by_text` / `jetbrains__search_in_files_by_regex` or `jetbrains__find_files_by_name_keyword` before launching external grep; when shell is mandatory, prefer `rg`.
- **Edits** Default to `apply_patch` for single-file diffs (respect grammar, no parallel tool calls). For deterministic replacements, lean on `jetbrains__replace_text_in_file`; reserve `jetbrains__create_new_file` for new artifacts.
- **Commands** Run scripts through `jetbrains__execute_terminal_command` with the repo `projectPath`; when falling back to `shell`, wrap commands as `["bash", "-lc", "<command>"]` and always provide `workdir`.
- **Docs & APIs** Use `mui-mcp__useMuiDocs` for MUI references (after selecting the correct version). For other libraries, call `context7__resolve-library-id` followed by `context7__get-library-docs`. Reach for `npm-sentinel__npmLatest` / `npm-sentinel__npmTrends` when package intel is required.
- **Plans & tracking** Invoke `update_plan` for multi-step work (never single-step) and refresh statuses after completing each step.
- **Verification** Capture selective test output via `jetbrains__execute_terminal_command`; summarize results instead of pasting full logs.

## CRITICAL RULES

### Effect Module import patterns

always import effect modules whether the are from core-effect `effect` or supporting libraries `@effect/*` using
namespace imports.

- `import * as Effect from "effect/Effect`
- `import type * as SqlClient from "@effect/sql/SqlClient";`
  Effect modules which should use single letter or truncated namespace imports
- `effect/Array` as `import * as A from "effect/Array";`
- `effect/Function` as `import * as F from "effect/Function";`
- `effect/Option` as `import * as O from "effect/Option";`
- `effect/Record` as `import * as R from "effect/Record";`
- `effect/String` as `import * as Str from "effect/String";`
- `@effect/sql/Model` as `import * as M from "@effect/sql/Model";`
- `effect/Schema` as `import * as S from "effect/Schema";`
- `effect/SchemaAST` as `import * as AST from "effect/SchemaAST"`
- `effect/Brand` as `import * as B from "effect/Brand";`
- **Uppercase constructors** Always prefer the PascalCase constructor exports provided by Effect modules (for example `S.Struct`, `S.Array`, `S.String`). Do not use legacy lowercase aliases such as `S.struct` or `S.array`.

### Effect Array Utilities - NEVER USE NATIVE ARRAY METHODS

**⚠️ ABSOLUTELY FORBIDDEN ⚠️ - Native Array Methods:**

- **NEVER use `.map()`, `.filter()`, `.forEach()`, `.find()`, `.some()`, `.every()`, `.reduce()` on arrays**
- **NEVER use `Array.from()`, `Array.isArray()`, or any native Array static methods**
- **NEVER use `for...of`, `for...in`, or traditional `for` loops for array iteration**

**✅ REQUIRED PATTERN - Always Use `pipe(array, A.method(...))`:**

```typescript
// ❌ FORBIDDEN - Native array methods
items.map((item) => item.name);
items.filter((item) => item.active);
items.forEach((item) => console.log(item));
items.find((item) => item.id === targetId);
Array.from(iterable);

// ✅ REQUIRED - Effect Array utilities with pipe
F.pipe(
  items,
  A.map((item) => item.name)
);
F.pipe(
  items,
  A.filter((item) => item.active)
);
F.pipe(
  items,
  A.forEach((item) => Effect.log(item))
);
F.pipe(
  items,
  A.findFirst((item) => item.id === targetId)
);
F.pipe(iterable, A.fromIterable);
```

**Use Effect's Array utilities for ALL array operations - no exceptions:**

- **Business logic transformations**: Always `pipe(array, Array.method(...))`
- **JSX rendering**: Always `pipe(array, Array.map(...))` in JSX
- **Data processing**: All API responses, database results use the same pattern
- **Any array manipulation**: Grouping, sorting, filtering - all use Effect's Array utilities
- **Type definitions and interfaces**: When working with ASTs or object properties that are arrays

**Key Effect Array Methods to Use:**
always import as `import * as A from "effect/Array";`

- `A.map()` - Transform each element
- `A.filter()` - Filter elements by predicate
- `A.forEach()` - Side effects for each element
- `A.findFirst()` - Find first matching element (returns `Option`)
- `A.findLast()` - Find last matching element (returns `Option`)
- `A.some()` - Test if any element matches
- `A.every()` - Test if all elements match
- `A.reduce()` - Reduce array to single value
- `A.groupBy()` - Group elements by key
- `A.partition()` - Split array into two based on predicate
- `A.fromIterable()` - Convert iterable to array
- `A.head()` - Get first element (returns `Option`)
- `A.tail()` - Get all but first element (returns `Option`)
- `A.get()` - Safe array access by index (returns `Option`)

**This ensures consistency across ALL array operations in the codebase - no exceptions allowed.**

## CRITICAL RULE: Effect String Utilities - NEVER USE NATIVE STRING METHODS

**⚠️ ABSOLUTELY FORBIDDEN ⚠️ - Native String Methods:**

- **NEVER use `.charAt()`, `.slice()`, `.substring()`, `.indexOf()`, `.includes()`, `.startsWith()`, `.endsWith()` on
  strings**
- **NEVER use `.toUpperCase()`, `.toLowerCase()`, `.trim()`, `.split()`, `.replace()` on strings**
- **NEVER use `.match()`, `.search()`, `.padStart()`, `.padEnd()` on strings**
- **NEVER use template literal string manipulation without Effect String utilities**

**✅ REQUIRED PATTERN - Always Use Effect's String utilities:**
import `effect/Function` as `import * as F from "effect/Function";`
import `effect/String` as `import * as Str from "effect/String";`

```typescript
import * as Str from "effect/String";
import * as F from "effect/Function";
// ❌ FORBIDDEN - Native string methods
const result = str.charAt(0).toUpperCase() + str.slice(1);
const isValid = str.endsWith("s");
const parts = str.split(" ");
const trimmed = str.trim();
const replaced = str.replace(/old/g, "new");
```
```ts
// ✅ REQUIRED - Effect String utilities
const result = F.pipe(
  str,
  Str.charAt(0),
  Str.toUpperCase,
  (firstChar) => `${firstChar}${F.pipe(str, Str.slice(1))}`
);
const isValid = F.pipe(str, Str.endsWith("s"));
const parts = F.pipe(str, Str.split(" "));
const trimmed = F.pipe(str, Str.trim);
const replaced = F.pipe(str, Str.replace(/old/g, "new"));
```

**Key Effect String Methods to Use:**

- always import `effect/String` module as `import * as Str from "effect/String";`
- `Str.charAt()` - Get character at index
- `Str.slice()` - Extract substring
- `Str.substring()` - Extract substring (alternative)
- `Str.indexOf()` - Find index of substring
- `Str.includes()` - Check if string contains substring
- `Str.startsWith()` - Check if string starts with substring
- `Str.endsWith()` - Check if string ends with substring
- `Str.toUpperCase()` - Convert to uppercase
- `Str.toLowerCase()` - Convert to lowercase
- `Str.capitalize()` - Capitalize first letter
- `Str.trim()` - Remove whitespace
- `Str.split()` - Split string into array
- `Str.replace()` - Replace substring
- `Str.match()` - Match against regex
- `Str.isEmpty()` - Check if string is empty
- `Str.isNonEmpty()` - Check if string is not empty

**String manipulation must ALWAYS use Effect's String utilities with pipe - no exceptions allowed.**

- **Use Effect's Struct & Record utilities instead of native Object methods**
    - Prefer: `F.pipe(obj, Struct.keys)` instead of `Object.keys(obj)`
    - Prefer: `F.pipe(obj, Record.values)` instead of `Object.values(obj)`
    - Prefer: `F.pipe(obj, Struct.entries)` instead of `Object.entries(obj)`
    - Prefer: `F.pipe(obj, Record.map((value) => transform(value)))` instead of manual object iteration
    -
    - Use Effect's Record utilities for all object manipulation and transformation
- **Use Effect's collection utilities instead of native JavaScript collections**
    - **HashMap instead of Map**: Prefer `HashMap.empty()`, `HashMap.set()`, `HashMap.get()`, `HashMap.fromIterable()`
    - Import: `import * as HashMap from "effect/HashMap"`
    - Prefer: `HashMap.empty<string, number>()` instead of `new Map<string, number>()`
    - Prefer: `F.pipe(hashMap, HashMap.set(key, value))` instead of `map.set(key, value)`
    - Prefer: `F.pipe(hashMap, HashMap.get(key))` instead of `map.get(key)` (returns `Option<V>`)
    - Prefer: `HashMap.fromIterable(pairs)` instead of `new Map(pairs)`
    - **HashSet instead of Set**: Prefer `HashSet.empty()`, `HashSet.add()`, `HashSet.has()`, `HashSet.fromIterable()`
        - Import: `import * as HashSet from "effect/HashSet"`
        - Prefer: `HashSet.empty<string>()` instead of `new Set<string>()`
        - Prefer: `F.pipe(hashSet, HashSet.add(value))` instead of `set.add(value)`
        - Prefer: `F.pipe(hashSet, HashSet.has(value))` instead of `set.has(value)`
        - Prefer: `HashSet.fromIterable(values)` instead of `new Set(values)`
    - **For mutable state**: Use `Ref.make()` with immutable collections for Effect-based state management
        - Pattern: `const cacheRef = Ref.make(HashMap.empty<K, V>())`
        - Update: `yield* Ref.update(cacheRef, (cache) => pipe(cache, HashMap.set(key, value)))`
- **Use no-op utilities from `@beep/utils` instead of inline functions**
    - Prefer: `nullOp` instead of `() => null`
    - Prefer: `noOp` instead of `() => {}`
    - Prefer: `nullOpE` instead of `() => Effect.succeed(null)`
    - **NEVER use async no-ops**: Use `nullOpE` instead of `async () => null` or `async () => {}`
- **Use string utilities from `@beep/utils` for text transformations**
    - **`pluralize(word: string)`**: Converts singular words to plural (handles irregular plurals like "person" → "
      people")
    - **`singularize(word: string)`**: Converts plural words to singular (handles irregular singulars like "people" → "
      person")
    - **`mkEntityName`**: Converts table name to entity name (people → Person, addresses → Address)
    - **`mkTableName`**: Converts entity name to table name (Person → people, Address → addresses)
    - **`mkZeroTableName`**: Converts entity name to Zero schema table name (Person → people, PhoneNumber →
      phoneNumbers)
    - **`mkEntityType`**: Converts table name to entity type for IDs (people → person, phone_numbers → phonenumber)
    - **`mkUrlParamName`**: Converts entity name to URL parameter name (Person → personId, PhoneNumber → phoneNumberId)
    - **Examples**:
        - **Prefer**: `singularize("Groups")` → "Group" instead of manual string manipulation
        - **Prefer**: `pluralize("Person")` → "People" instead of adding "s"
        - **Prefer**: `mkEntityName("phone_numbers")` → "PhoneNumber" instead of manual case conversion
        - These utilities handle complex English pluralization rules and irregular cases automatically

## Key References

- `README.md` — onboarding & summary
- `docs/patterns/` — implementation recipes
- `turbo.json` — pipeline graph
- `package.json#workspaces` — workspace layout
- `tsconfig.base.json` — path aliases
