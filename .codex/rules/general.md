# General Project Rules

## Code Quality

- NEVER use `any`, `@ts-ignore`, or unchecked casts
- ALWAYS validate external data with `@beep/schema`
- ALWAYS run `bun run lint:fix` before committing
- Use Effect testing utilities from `@beep/testkit`
- Use `Effect.log*` with structured objects for logging

### Code Quality Examples

**Avoid `any`, use Schema.decode:**
```typescript
// FORBIDDEN
const data = response.json() as any;

// REQUIRED
import * as S from "effect/Schema";
const UserSchema = S.Struct({ id: S.String, name: S.String });
const data = yield* S.decodeUnknown(UserSchema)(response.json());
```

**Structured logging:**
```typescript
// FORBIDDEN
console.log("User created:", userId);

// REQUIRED
Effect.logInfo("User created").pipe(
  Effect.annotateLogs({ userId, action: "create" })
);
```

## Architecture Boundaries

- NEVER use direct cross-slice imports
- NEVER use relative `../../../` paths
- ALWAYS use `@beep/*` path aliases
- Cross-slice imports ONLY through `packages/shared/*` or `packages/common/*`

### Architecture Examples

**Cross-slice imports:**
```typescript
// FORBIDDEN - Direct cross-slice import
import { Member } from "@beep/iam-domain";  // From calendar package

// REQUIRED - Import through shared
import { UserId } from "@beep/shared-domain";
```

**Slice layer direction (domain → tables → server → client → ui):**
```typescript
// FORBIDDEN - UI importing from server
import { UserRepo } from "@beep/iam-server";  // In ui package

// REQUIRED - UI imports from client
import { UserContract } from "@beep/iam-client";  // In ui package
```

## Slice Structure

Each vertical slice follows this dependency order:
```
domain -> tables -> server -> client -> ui
```

## Commands Reference

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

## Environment & Secrets

- NEVER access `process.env` directly in application code
- ALWAYS use the `@beep/env` package for typed environment access
- NEVER commit `.env` files or secrets to version control
- Use `dotenvx` for environment management

### Environment Examples

```typescript
// FORBIDDEN
const apiKey = process.env.API_KEY;

// REQUIRED
import { ServerEnv } from "@beep/env";
const config = yield* ServerEnv;
const apiKey = config.API_KEY;
```

## Testing

### Test Commands

- `bun run test` — Run all tests
- `bun run test --filter=@beep/package` — Run tests for specific package

### Test Framework - MANDATORY

ALWAYS use `@beep/testkit` for all Effect-based tests. NEVER use raw `bun:test` with manual `Effect.runPromise`.

```typescript
// REQUIRED - @beep/testkit
import { effect, layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";

effect("test name", () =>
  Effect.gen(function* () {
    const result = yield* someEffect();
    strictEqual(result, expected);
  })
);

// FORBIDDEN - bun:test with Effect.runPromise
import { test } from "bun:test";
test("test name", async () => {
  await Effect.runPromise(Effect.gen(...)); // WRONG!
});
```

See `.claude/rules/effect-patterns.md` Testing section for complete patterns.

### Test File Organization

- Place test files in `./test` directory mirroring `./src` structure
- NEVER place tests inline with source files
- Use path aliases (`@beep/*`) instead of relative imports in tests

**Example**:
```
packages/example/
├── src/services/UserService.ts
└── test/services/UserService.test.ts  # Mirrors src structure
```

See `.claude/commands/patterns/effect-testing-patterns.md` for comprehensive testing patterns.

## Git / Worktree Hygiene (Non-Blocking)

Non-clean worktrees are normal in this repo (multiple agents may work in parallel on the same branch).

- Do **not** treat `git status` showing changes as a blocker.
- Do **not** ask to revert unrelated changes by default. Proceed with your scoped changes.
- Only require a clean worktree for operations that strictly need it (e.g. some codemods, `git subtree`, history rewriting).
- Never run destructive git commands (`git reset --hard`, `git clean -fdx`, etc.) unless explicitly requested.

## Turborepo Verification Behavior

**IMPORTANT**: Turborepo's `--filter` flag cascades through ALL package dependencies.

When running `bun run check --filter @beep/package`:
1. Turborepo resolves ALL dependencies of `@beep/package`
2. Type-checks dependencies FIRST (in dependency order)
3. Type-checks the target package LAST
4. Reports errors from ANY package in the dependency chain

**Implication**: If `@beep/iam-tables` depends on `@beep/iam-domain`, errors in the domain package will cause tables verification to fail, even if the tables code is correct.

**Debugging Failed Checks**:
```bash
# If cascading check fails, isolate the error source:

# 1. Check if error is in upstream dependency
bun run check --filter @beep/upstream-package

# 2. Or use isolated syntax check (no dependency resolution)
bun tsc --noEmit path/to/file.ts
```

**Fix errors in dependency order**: Always resolve upstream package errors before downstream packages.

### Isolating Changes from Pre-existing Errors

When `bun run check --filter @beep/package` fails due to upstream package errors unrelated to your changes:

**1. Identify the actual error source:**
```bash
# Errors in upstream dependencies appear FIRST in output
# Look for package path in error messages:
# packages/upstream/domain/src/file.ts(42,5): error TS2322
#          ^^^^^^^^ This is the failing package
```

**2. Verify your changes in isolation:**
```bash
# Syntax-only check (no dependency resolution or type checking)
bun tsc --noEmit --isolatedModules path/to/your/file.ts
```

**3. Document known issues:**
If upstream errors are pre-existing/unrelated to your changes, note this in your PR description and proceed with local isolated verification. Focus on ensuring your new code is syntactically correct and logically sound.

See [documentation/patterns/database-patterns.md](../../documentation/patterns/database-patterns.md#turborepo-verification-cascading) for detailed debugging workflows.

## Documentation

| Document                           | Purpose                   |
|------------------------------------|---------------------------|
| `README.md`                        | Onboarding & summary      |
| `documentation/`                   | Internal contributor docs |
| `documentation/patterns/`          | Implementation recipes    |
| `documentation/EFFECT_PATTERNS.md` | Effect-specific patterns  |
| `specs/`                           | Specification library     |
