---
name: onboarding
description: Interactive onboarding checklist for new agents. Use when starting work on beep-effect to verify environment, understand architecture, and confirm Effect proficiency before contributing.
---

# Agent Onboarding

Welcome to beep-effect. This checklist ensures you are ready to contribute effectively.

## 1. Environment Check

Verify your environment is properly configured:

- [ ] `bun --version` returns 1.3.x+
- [ ] `bun run check` runs (note any pre-existing errors for context)
- [ ] Docker is running (required for `bun run services:up`)

```bash
# Quick environment verification
bun --version
bun run check
docker info
```

## 2. Architecture Understanding

Understand the project structure before making changes:

- [ ] Review `CLAUDE.md` for project overview and commands
- [ ] Run `/modules` to see available modules with summaries
- [ ] Understand slice structure: `domain -> tables -> server -> client -> ui`
- [ ] Know cross-slice imports go through `@beep/shared-*` or `@beep/common-*`

**Key Boundary Rules:**
- NEVER use direct cross-slice imports
- NEVER use relative `../../../` paths
- ALWAYS use `@beep/*` path aliases

## 3. Effect Proficiency

Can you explain these core concepts?

- [ ] What do `Effect<A, E, R>` type parameters represent?
  - `A` = Success type (what the effect produces)
  - `E` = Error type (tagged errors the effect may fail with)
  - `R` = Requirements (services the effect needs to run)

- [ ] How to use `Effect.gen(function* () { })`?
  - Generator-based syntax for sequential Effect composition
  - Cleaner than nested flatMap chains

- [ ] What does `yield*` do in Effect generators?
  - Unwraps an Effect, returning its success value
  - Equivalent to `bind` or `flatMap` in functional programming

- [ ] How do Layers provide dependencies?
  - `Layer.provide` satisfies the `R` requirement
  - Layers compose with `Layer.mergeAll`, `Layer.provideMerge`
  - Production uses `*Live` layers, tests use mocks

- [ ] How to handle errors with `catchTag`?
  - Matches tagged errors by their `_tag` discriminant
  - More precise than `catchAll` with conditionals

If uncertain on any point, review `.claude/rules/effect-patterns.md`.

## 4. Pattern Awareness

These rules are MANDATORY. Violations require remediation work.

- [ ] **Namespace imports REQUIRED**: `import * as Effect from "effect/Effect"`
- [ ] **EntityId REQUIRED** for all ID fields (NEVER plain `S.String`)
- [ ] **@beep/testkit REQUIRED** for tests (NEVER raw `bun:test` with `Effect.runPromise`)
- [ ] **Native methods FORBIDDEN**: Use `A.map` not `array.map`

Review `.claude/rules/effect-patterns.md` for complete NEVER/ALWAYS rules.

## 5. Common Alias Reference

Memorize these standard aliases:

| Module | Alias | Common Operations |
|--------|-------|-------------------|
| `effect/Array` | `A` | `A.map`, `A.filter`, `A.head`, `A.reduce` |
| `effect/Option` | `O` | `O.some`, `O.none`, `O.fromNullable` |
| `effect/Schema` | `S` | `S.Struct`, `S.String`, `S.TaggedError` |
| `effect/String` | `Str` | `Str.split`, `Str.toLowerCase`, `Str.slice` |
| `effect/Record` | `R` | `R.map`, `R.filter`, `R.keys` |
| `effect/Match` | `Match` | `Match.value`, `Match.when`, `Match.orElse` |
| `effect/Predicate` | `P` | `P.isString`, `P.isNumber`, `P.isDate` |
| `@effect/sql/Model` | `M` | `M.Class`, `M.Field` |

**Full namespace imports (no single-letter alias):**
- `Effect`, `Layer`, `Context`, `Struct`, `Cause`, `DateTime`, `Duration`

## 6. First Contribution Readiness

Before your first change:

- [ ] Start with a simple task (< 3 files modified)
- [ ] Read existing code in the area before modifying
- [ ] Run `bun run check` after any change
- [ ] Request review before large modifications (> 5 files or architectural impact)

**Recommended first tasks:**
- Fix a TypeScript error surfaced by `bun run check`
- Add a missing EntityId type annotation
- Write a test for an untested Effect

## 7. Verification Commands

```bash
# Check specific package (note: cascades through dependencies)
bun run check --filter @beep/package-name

# Test specific package
bun run test --filter @beep/package-name

# Fix lint issues
bun run lint:fix

# Run all checks
bun run check

# Isolated syntax check (no dependency cascade)
bun tsc --noEmit --isolatedModules path/to/file.ts
```

**Important**: `--filter` cascades through ALL package dependencies. If upstream packages have errors, your package check will fail. See `.claude/rules/general.md` for debugging workflows.

## 8. Critical NEVER/ALWAYS Summary

| NEVER | ALWAYS |
|-------|--------|
| `array.map()` | `A.map(array, fn)` |
| `new Error()` | `S.TaggedError` |
| `array[0]!` | `A.head(array)` (returns `Option`) |
| `switch (x)` | `Match.value(x).pipe(...)` |
| `id: S.String` | `id: SharedEntityIds.UserId` |
| `typeof x === "string"` | `P.isString(x)` |
| `new Date()` | `DateTime.now` or `DateTime.unsafeNow()` |
| Raw `bun:test` with Effect | `@beep/testkit` runners |

## 9. Knowledge Discovery

When you need more information:

| Need | Action |
|------|--------|
| Module overview | Run `/modules` |
| Specific module details | Run `/module packages/package-name` |
| Search modules | Run `/module-search pattern` |
| Effect patterns | Read `.claude/rules/effect-patterns.md` |
| Database patterns | Read `documentation/patterns/database-patterns.md` |
| Testing patterns | Read `.claude/commands/patterns/effect-testing-patterns.md` |
| Error catalog | Read `specs/ai-friendliness-10-of-10/outputs/error-catalog.yaml` |

## 10. Readiness Confirmation

Before proceeding with any task, confirm:

1. Environment is working (`bun run check` executes)
2. You understand the slice structure
3. You can explain Effect type parameters
4. You know the NEVER/ALWAYS rules
5. You have located relevant existing code to reference

If any item is unclear, pause and investigate before proceeding. It is better to ask clarifying questions than to produce code requiring remediation.

---

## Quick Reference Card

```
Effect<A, E, R>
  A = Success type
  E = Error type (tagged)
  R = Requirements (services)

yield* effect     -- unwrap Effect in generator
Layer.provide     -- satisfy R requirement
Effect.catchTag   -- handle specific error tag

Imports:
  import * as Effect from "effect/Effect"
  import * as A from "effect/Array"
  import * as S from "effect/Schema"

Test:
  import { effect, strictEqual } from "@beep/testkit"
  effect("name", () => Effect.gen(function* () { ... }))

Verify:
  bun run check --filter @beep/package
  bun run test --filter @beep/package
```
