# Verification Checklist

Readiness gates for AI agents working in beep-effect. Complete each gate before proceeding.

---

## Gate 1: Environment

Verify your development environment is correctly configured.

### Checklist

- [ ] **Bun version**: `bun --version` returns `1.3.x` or higher
- [ ] **Docker running**: `docker info` executes without error
- [ ] **Dependencies installed**: `bun install` completes successfully
- [ ] **Services available**: `bun run services:up` starts PostgreSQL and Redis
- [ ] **Baseline established**: `bun run check` runs (note any pre-existing errors)

### Verification Commands

```bash
# Run all checks
bun --version
docker info > /dev/null 2>&1 && echo "OK: Docker running" || echo "FAIL: Docker not running"
bun install
bun run services:up
bun run check
```

### Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `bun: command not found` | Bun not installed | Install from https://bun.sh |
| `Cannot connect to Docker daemon` | Docker not running | Start Docker Desktop |
| `ECONNREFUSED` on db commands | Services not running | Run `bun run services:up` first |
| Port 5432/6379 already in use | Conflicting services | Stop other Postgres/Redis instances |

---

## Gate 2: Effect Understanding

Verify you understand Effect fundamentals used throughout the codebase.

### Checklist

- [ ] **Can explain Effect signature**: `Effect<Success, Error, Requirements>` - what each parameter means
- [ ] **Can explain yield***: Binds an Effect, extracting its success value (like await for Promises)
- [ ] **Can explain Layer**: Provides services (dependency injection mechanism)
- [ ] **Can explain pipe**: Transforms data through a sequence of functions left-to-right
- [ ] **Can identify tagged errors**: Classes extending `S.TaggedError<T>()("Tag", { fields })`

### Self-Assessment

Answer these questions:

1. What does `yield* Effect.fail(new MyError())` do?
   - Answer: Fails the current Effect with MyError, short-circuits execution

2. What does `Effect<string, NetworkError, HttpClient>` mean?
   - Answer: Effect that succeeds with string, can fail with NetworkError, requires HttpClient service

3. What is the difference between `Effect.provide` and `Layer.provide`?
   - Answer: Effect.provide gives a Layer to an Effect; Layer.provide composes Layers together

4. How do you access a service inside Effect.gen?
   - Answer: `const service = yield* MyServiceTag;`

### Minimum Competency

If you cannot answer all 4 questions, read:
- `.claude/skills/layer-design/SKILL.md`
- `.claude/skills/service-implementation/SKILL.md`

---

## Gate 3: Pattern Awareness

Verify you know the required code patterns for this codebase.

### Checklist

- [ ] **Namespace imports required**: `import * as S from "effect/Schema"` (not `import { Schema }`)
- [ ] **PascalCase Schema constructors**: `S.Struct`, `S.String`, `S.Number` (not lowercase)
- [ ] **EntityId required for IDs**: Never use `S.String` for entity ID fields
- [ ] **Effect array utilities**: Use `A.map()`, `A.filter()` (not `array.map()`, `array.filter()`)
- [ ] **@beep/testkit for tests**: Never use `bun:test` with `Effect.runPromise`
- [ ] **@beep/* path aliases**: Never use relative `../../../` imports

### Pattern Recognition Test

Identify what is WRONG in each snippet:

**Snippet 1:**
```typescript
import { Schema } from "effect";
const User = Schema.struct({ name: Schema.string });
```
- Error 1: Named import instead of namespace (`import * as S from "effect/Schema"`)
- Error 2: Lowercase constructors (`S.struct` -> `S.Struct`, `S.string` -> `S.String`)

**Snippet 2:**
```typescript
export class Member extends M.Class<Member>("Member")({
  id: S.String,
  userId: S.String,
}) {}
```
- Error: Using `S.String` for IDs instead of branded EntityIds

**Snippet 3:**
```typescript
const names = users.map(u => u.name).filter(n => n.length > 0);
```
- Error: Using native array methods instead of `A.map()` and `A.filter()`

**Snippet 4:**
```typescript
import { test } from "bun:test";
test("works", async () => {
  await Effect.runPromise(myEffect);
});
```
- Error: Using bun:test instead of `@beep/testkit`

### Minimum Competency

If you cannot identify all errors, re-read:
- `.claude/rules/effect-patterns.md`
- `.claude/rules/code-standards.md`

---

## Gate 4: Tool Proficiency

Verify you can use the project tools effectively.

### Checklist

- [ ] **Can run filtered checks**: `bun run check --filter @beep/package-name`
- [ ] **Can run filtered tests**: `bun run test --filter @beep/package-name`
- [ ] **Can fix lint errors**: `bun run lint:fix`
- [ ] **Can isolate type check**: `bun tsc --noEmit --isolatedModules path/to/file.ts`
- [ ] **Can interpret Turborepo cascade**: Know that `--filter` checks dependencies too

### Verification Exercise

Run these commands and verify they work:

```bash
# 1. Check a specific package (use any existing package)
bun run check --filter @beep/shared-domain

# 2. Run tests for a package
bun run test --filter @beep/testkit

# 3. Lint the codebase
bun run lint

# 4. Fix lint issues
bun run lint:fix
```

### Understanding Turborepo Cascade

When you run:
```bash
bun run check --filter @beep/iam-tables
```

Turborepo will:
1. Find all dependencies of `@beep/iam-tables`
2. Type-check `@beep/iam-domain` first (dependency)
3. Type-check `@beep/shared-domain` (transitive dependency)
4. Type-check `@beep/iam-tables` last

**Implication**: Errors in output may be from upstream packages, not your code.

**How to identify source**: Look at the file path in the error:
```
packages/iam/domain/src/Member.ts(42,5): error TS2322
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
This tells you the package with the error
```

---

## Gate 5: Architecture Comprehension

Verify you understand the codebase structure.

### Checklist

- [ ] **Know slice structure**: `domain -> tables -> server -> client -> ui`
- [ ] **Know import boundaries**: Cross-slice only via `packages/shared/*` or `packages/common/*`
- [ ] **Know path aliases**: All imports use `@beep/*` prefix
- [ ] **Know EntityId locations**: Which EntityIds come from which packages
- [ ] **Know test file location**: Tests go in `./test/` mirroring `./src/` structure

### Slice Dependency Quiz

Which import is WRONG?

```typescript
// In packages/iam/server/src/MemberService.ts

// A
import { Member } from "@beep/iam-domain";

// B
import { DocumentsEntityIds } from "@beep/documents-domain";

// C
import { SharedEntityIds } from "@beep/shared-domain";

// D
import { Member } from "../../../domain/src/Member";
```

**Answers**:
- A: CORRECT - same slice, different layer
- B: WRONG - cross-slice import not through shared
- C: CORRECT - using shared package
- D: WRONG - relative path instead of `@beep/*` alias

---

## Final Readiness Assessment

Complete all gates before starting work.

### Gate Summary

| Gate | Topic | Status |
|------|-------|--------|
| 1 | Environment | [ ] Passed |
| 2 | Effect Understanding | [ ] Passed |
| 3 | Pattern Awareness | [ ] Passed |
| 4 | Tool Proficiency | [ ] Passed |
| 5 | Architecture Comprehension | [ ] Passed |

### Ready to Contribute

When all gates are passed:

1. Read `.claude/onboarding/first-contribution.md` for step-by-step implementation guide
2. Select a simple task (< 3 files, single package)
3. Follow existing patterns exactly
4. Verify after each change
5. Run full verification before submitting

### Not Ready?

If you cannot pass a gate:

| Failed Gate | Action |
|-------------|--------|
| Environment | Fix setup issues before proceeding |
| Effect Understanding | Read skill files in `.claude/skills/` |
| Pattern Awareness | Re-read `.claude/rules/effect-patterns.md` |
| Tool Proficiency | Practice commands until comfortable |
| Architecture | Study `documentation/PACKAGE_STRUCTURE.md` |

---

## Quick Reference: Common Errors

These are the most frequent errors new agents encounter:

| Error ID | Pattern | Fix |
|----------|---------|-----|
| SCH_001 | `Property 'struct' does not exist` | Use PascalCase: `S.Struct` |
| EID_001 | `Type 'string' is not assignable to '...Id.Type'` | Use EntityId, not S.String |
| SVC_001 | `Service X is not provided` | Add Layer.provide() |
| IMP_001 | `Cannot find module '@beep/...'` | Check path alias in tsconfig |
| TEST_001 | Test timeout or Effect.runPromise | Use @beep/testkit |

For complete error catalog, see:
`specs/ai-friendliness-10-of-10/outputs/error-catalog.yaml`
