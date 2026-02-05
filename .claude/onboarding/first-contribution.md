# First Contribution Guide

Step-by-step guide for AI agents making their first contribution to beep-effect.

## Phase 1: Environment Verification

Before writing any code, verify your environment is ready.

### 1.1 Check Bun Version

```bash
bun --version
```

**Expected**: `1.3.x` or higher

**If missing or outdated**: Install from https://bun.sh

### 1.2 Check Docker Status

```bash
docker info > /dev/null 2>&1 && echo "Docker running" || echo "Docker NOT running"
```

**Expected**: `Docker running`

**If not running**: Start Docker Desktop or the docker daemon before proceeding.

### 1.3 Install Dependencies

```bash
bun install
```

**Expected**: Clean install with no errors.

### 1.4 Start Services

```bash
bun run services:up
```

**Expected**: PostgreSQL and Redis containers start. Wait ~10 seconds for services to be healthy.

### 1.5 Run Baseline Check

```bash
bun run check
```

**Purpose**: Establish what errors exist BEFORE your changes. Note any pre-existing errors - they are not your responsibility to fix unless explicitly requested.

---

## Phase 2: Architecture Understanding

### 2.1 Read Core Documentation

Read these files in order:

1. `CLAUDE.md` - Project overview, commands, rules
2. `.claude/rules/effect-patterns.md` - Effect-specific patterns (critical)
3. `.claude/rules/general.md` - Code quality requirements

### 2.2 Understand Effect Basics

If you see `Effect.gen(function* () { ... })`, here is what it means:

```typescript
// Effect<Success, Error, Requirements>
// - Success: What the effect produces on success
// - Error: What errors can occur (tagged errors)
// - Requirements: What services are needed (via Context.Tag)

const myEffect = Effect.gen(function* () {
  // yield* binds an Effect, extracting its success value
  // Similar to await in async/await, but for Effect
  const service = yield* MyService;
  const result = yield* service.doSomething();
  return result;
});
```

**Key concepts**:
- `yield*` = "await" for Effects (extracts success value)
- `Effect.fail(error)` = return early with error
- `Effect.succeed(value)` = wrap value in Effect
- `Layer` = provides services (dependency injection)

### 2.3 Understand Import Conventions

This codebase requires namespace imports with specific aliases:

```typescript
// Required pattern - namespace imports
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";        // S for Schema
import * as A from "effect/Array";          // A for Array
import * as O from "effect/Option";         // O for Option
import * as Str from "effect/String";       // Str for String

// FORBIDDEN - named imports
import { Effect, Schema } from "effect";    // Wrong!
import { map, filter } from "effect/Array"; // Wrong!
```

### 2.4 Understand Slice Architecture

Each feature is organized as a vertical slice:

```
domain -> tables -> server -> client -> ui
```

**Package naming**:
- `@beep/{slice}-domain` - Domain models, EntityIds, business logic
- `@beep/{slice}-tables` - Database tables, Drizzle schema
- `@beep/{slice}-server` - Server-side services, repositories
- `@beep/{slice}-client` - Client contracts, API handlers
- `@beep/{slice}-ui` - React components

**Import rule**: Cross-slice imports ONLY through `packages/shared/*` or `packages/common/*`.

---

## Phase 3: Task Selection

### 3.1 What Qualifies as a "Simple" First Task

Good first tasks:
- Modify < 3 files
- Stay within one package
- Have clear, unambiguous requirements
- Follow existing patterns (copy-paste friendly)

Examples:
- Add a field to an existing domain model
- Add a new column to an existing table
- Create a new endpoint following existing patterns
- Fix a type error in one file

### 3.2 Red Flags (Complex Tasks)

Avoid these for your first contribution:
- Cross-slice changes (touching multiple slices)
- New slice creation (requires coordinated setup)
- Layer composition changes (deep Effect knowledge needed)
- Database migrations (requires running services)
- Changes to shared packages (affects many consumers)

### 3.3 Before Starting

1. Read existing code in the target package
2. Find a similar implementation to reference
3. Identify the exact files you will modify
4. Understand what imports you will need

---

## Phase 4: Implementation

### 4.1 Follow Existing Patterns

Before writing new code:
1. Find a similar existing implementation
2. Copy the structure exactly
3. Modify only what is necessary

Example - adding a domain model:

```typescript
// Find existing model in same package
// packages/iam/domain/src/Member.ts (example)

// Copy the pattern exactly
import * as S from "effect/Schema";
import * as M from "@effect/sql/Model";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";

export class YourModel extends M.Class<YourModel>("YourModel")({
  id: IamEntityIds.YourModelId,  // Use EntityId, NOT S.String
  organizationId: SharedEntityIds.OrganizationId,
  name: S.String,
  // ... your fields
}) {}
```

### 4.2 Make Small, Focused Changes

- Change one thing at a time
- Verify after each change
- Do not refactor unrelated code

### 4.3 Run Verification After Each Change

```bash
# Check the specific package you modified
bun run check --filter @beep/package-name

# Run tests for the package
bun run test --filter @beep/package-name

# Fix linting issues
bun run lint:fix
```

---

## Phase 5: Verification

### 5.1 Full Verification Sequence

```bash
# 1. Type check your package
bun run check --filter @beep/package-name

# 2. Run package tests
bun run test --filter @beep/package-name

# 3. Fix any lint errors
bun run lint:fix

# 4. Verify lint is clean
bun run lint
```

### 5.2 Interpreting Turborepo Errors

When `bun run check --filter @beep/package` fails, errors may come from upstream dependencies.

**Identify the source**:
```
packages/iam/domain/src/Member.ts(42,5): error TS2322
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
This path tells you which package has the error
```

**If error is in YOUR files**: Fix it.

**If error is in UPSTREAM package**: This is a pre-existing error. Note it and proceed with isolated verification:

```bash
# Verify your specific file compiles
bun tsc --noEmit --isolatedModules path/to/your/file.ts
```

### 5.3 Common Error Messages

| Error | Meaning | Fix |
|-------|---------|-----|
| `Property 'struct' does not exist` | Using lowercase S.struct | Use `S.Struct` (PascalCase) |
| `Type 'string' is not assignable to type '...Id.Type'` | Using S.String for ID | Use EntityId from `@beep/shared-domain` |
| `Service X is not provided` | Missing Layer | Add Layer.provide() |
| `Cannot find module '@beep/...'` | Wrong import path | Check tsconfig path aliases |

---

## Phase 6: Top 5 Pitfalls to Avoid

### 1. Using Lowercase Schema Constructors

```typescript
// WRONG
S.struct({ name: S.string })

// CORRECT
S.Struct({ name: S.String })
```

### 2. Using Plain S.String for Entity IDs

```typescript
// WRONG
id: S.String

// CORRECT
id: IamEntityIds.MemberId
userId: SharedEntityIds.UserId
```

### 3. Using Native Array Methods

```typescript
// WRONG
array.map(x => x + 1)
array.filter(x => x > 0)

// CORRECT
import * as A from "effect/Array";
A.map(array, x => x + 1)
A.filter(array, x => x > 0)
```

### 4. Not Running Checks After Changes

Always run:
```bash
bun run check --filter @beep/package-name
```

After EVERY change. Do not batch changes and check only at the end.

### 5. Using bun:test Instead of @beep/testkit

```typescript
// WRONG
import { test } from "bun:test";
test("name", async () => {
  await Effect.runPromise(...);
});

// CORRECT
import { effect, strictEqual } from "@beep/testkit";
effect("name", () =>
  Effect.gen(function* () {
    const result = yield* someEffect();
    strictEqual(result, expected);
  })
);
```

---

## Quick Reference Card

### Commands

| Action | Command |
|--------|---------|
| Install | `bun install` |
| Start services | `bun run services:up` |
| Type check all | `bun run check` |
| Type check one package | `bun run check --filter @beep/package` |
| Test all | `bun run test` |
| Test one package | `bun run test --filter @beep/package` |
| Lint fix | `bun run lint:fix` |

### Import Aliases

| Module | Alias |
|--------|-------|
| effect/Schema | S |
| effect/Array | A |
| effect/Option | O |
| effect/String | Str |
| effect/Number | Num |
| effect/Record | R |
| effect/Predicate | P |
| effect/Function | F |
| effect/Boolean | Bool |
| effect/Match | Match |
| @effect/sql/Model | M |

### EntityId Packages

| Slice | Import |
|-------|--------|
| Shared | `SharedEntityIds` from `@beep/shared-domain` |
| IAM | `IamEntityIds` from `@beep/shared-domain` |
| Documents | `DocumentsEntityIds` from `@beep/shared-domain` |
| Knowledge | `KnowledgeEntityIds` from `@beep/knowledge-domain` |
| Calendar | `CalendarEntityIds` from `@beep/shared-domain` |

---

## Checklist Before Submitting

- [ ] `bun run check --filter @beep/package-name` passes (or only has pre-existing upstream errors)
- [ ] `bun run test --filter @beep/package-name` passes
- [ ] `bun run lint` shows no new errors
- [ ] Used PascalCase Schema constructors (S.Struct, S.String)
- [ ] Used EntityIds for ID fields (not S.String)
- [ ] Used namespace imports (import * as X from)
- [ ] Used @beep/testkit for tests (not bun:test)
- [ ] Used Effect array utilities (A.map, not array.map)
