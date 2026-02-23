# Onboarding Friction Analysis

Generated: 2026-02-04

## Executive Summary

- **Total friction points identified**: 47
- **Critical blockers**: 8
- **Time to productivity estimate**: 4-8 hours (assuming Effect proficiency) / 20+ hours (without Effect knowledge)

The beep-effect repository has excellent technical documentation but significant onboarding gaps for new AI agents. The primary issues are:

1. **Zero ai-context.md files** - 0% module discovery coverage despite 62+ packages
2. **Effect knowledge assumed everywhere** - No "Effect for beginners" content
3. **Hidden dependency ordering** - `services:up` mentioned but not explained as prerequisite
4. **Formal notation without worked examples** - Mathematical specs without runnable code

---

## Assumed Knowledge Gaps

### Effect Framework (Critical)

| Concept | Where Used | Explanation Provided | Impact |
|---------|------------|---------------------|--------|
| **Effect.gen pattern** | Every service, repo, handler | None in CLAUDE.md | Critical - blocks understanding all code |
| **yield* syntax** | Every Effect.gen block | None | Critical - syntax looks unfamiliar |
| **Layer composition** | All service wiring | Skill exists but not linked from CLAUDE.md | High |
| **Context.Tag** | Service definitions | Brief mention in skills | High |
| **Schema.TaggedStruct** | All domain models | References in rules, no tutorial | High |
| **pipe/flow composition** | Every file | Only formal notation in meta-thinking.md | Medium |
| **Effect<S, E, R> signature** | Type signatures | Never explained | High |
| **TaggedError pattern** | Error handling | Rules say "use it", no tutorial | Medium |

**Gap Analysis**: CLAUDE.md references Effect patterns extensively but never explains:
- Why `Effect.gen(function* () { ... })` instead of `async/await`
- What `yield*` does (bind from Effect monad)
- How to read `Effect<Success, Error, Requirements>` type signatures
- When to use Layer.effect vs Layer.scoped vs Layer.succeed

### Single-Letter Aliases (Critical)

The rules mandate:
```typescript
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
```

But a new agent seeing `A.map`, `O.some`, `S.Struct` has no immediate reference table. The alias table exists in `.claude/rules/effect-patterns.md:39-54` but is not prominently linked.

**Missing**: A quick-reference cheatsheet at the top of CLAUDE.md for these aliases.

### EntityId System (High Impact)

| Aspect | Documented | Gap |
|--------|------------|-----|
| What EntityIds are | Partial (README.md) | Why branded types matter |
| How to create them | Yes in effect-patterns.md | Not in CLAUDE.md |
| When to use which ID | Partial table exists | Decision framework missing |
| Transformation from external APIs | Yes in effect-patterns.md | Complex, needs worked example |

**Gap**: A new agent seeing `SharedEntityIds.UserId.Type` vs `SharedEntityIds.UserId` vs `SharedEntityIds.UserId.make()` has no clear guidance on which to use where.

### Project-Specific Patterns

| Pattern | Assumed Knowledge | Missing |
|---------|-------------------|---------|
| `OrgTable.make` | Tenant isolation importance | Why multi-tenant matters |
| `Table.make` | Audit column purpose | When to use which factory |
| `DbRepo.make` | Repository pattern | How to construct queries |
| `@beep/*` path aliases | Monorepo imports | Where aliases are defined |
| Vertical slice architecture | Clean architecture | Why domain -> tables -> server -> client -> ui |
| `BS.*` helpers from `@beep/schema` | Schema composition | When to use BS vs raw S |

---

## Missing Getting-Started Paths

### "I want to add a new feature"

**Current state**: Must read multiple files in unclear order.

**Missing**: Step-by-step guide showing:
1. Which slice to add to
2. How to create domain model
3. How to add table
4. How to create repository
5. How to expose via server
6. How to consume in client
7. How to build UI

**Files involved** (currently scattered):
- `CLAUDE.md` - Commands only
- `.claude/rules/effect-patterns.md` - Patterns
- `.claude/skills/domain-modeling/SKILL.md` - Domain models
- `.claude/skills/layer-design/SKILL.md` - Layers
- `specs/_guide/README.md` - Spec workflow (not feature workflow)

### "I want to fix a bug"

**Current state**: No debugging guide.

**Missing**:
- How to run tests for a specific package
- How to interpret Turborepo cascade errors (documented in general.md but not prominent)
- How to use `bun run check --filter` vs `bun tsc --noEmit`
- How to trace Effect errors (no debugging skill)

### "I want to understand this package"

**Current state**: 0% ai-context.md coverage.

**Impact**: Critical. The `/modules` command returns nothing useful because no packages have discovery metadata.

**Missing**: ai-context.md files for all 62+ packages providing:
- Purpose summary
- Key exports
- Example usage
- Dependencies
- Common tasks

### "I want to run the project locally"

**Current state**: README.md has Quick Start section but incomplete.

**Implicit prerequisites NOT documented**:
1. Docker must be installed and running
2. `services:up` must complete before `db:migrate`
3. Redis/Postgres ports must not conflict
4. `.env` file must be created (dotenvx mentioned but no template)

**Missing**: Pre-flight checklist for local development.

---

## Hidden Dependencies

### 1. Environment Setup

| Prerequisite | Mentioned | Explained How |
|--------------|-----------|---------------|
| Bun 1.3.x | Yes | No install instructions |
| Node 22 | Yes | Why both needed? |
| Docker | No | Assumed but not stated |
| PostgreSQL (via docker) | Implicit | Only via services:up |
| Redis (via docker) | Implicit | Only via services:up |
| `.env` file | `@beep/env` mentioned | No template or example |

### 2. Command Ordering

**Hidden dependency chain**:
```
1. Docker running        (not documented)
2. bun install           (documented)
3. bun run services:up   (documented but not as prerequisite)
4. Wait for services     (not documented - timing)
5. bun run db:migrate    (documented)
6. bun run dev           (documented)
```

The README shows this order but doesn't explain:
- What happens if you skip services:up?
- How to verify services are healthy?
- What ports are used?

### 3. Turborepo Understanding

**Assumed knowledge**:
- `--filter` cascades through dependencies
- Errors can come from upstream packages
- How to isolate your changes from pre-existing errors

**Documented**: Yes, in `.claude/rules/general.md:76-99`, but:
- Not prominent in CLAUDE.md
- No troubleshooting flowchart
- No common error → solution mapping

### 4. Better Auth Setup

Mentioned as auth solution but no guide for:
- How auth is initialized
- Where auth config lives
- How to test authenticated endpoints

---

## Documentation Gaps

### Dead Links / Missing Files

| File | References | Status |
|------|------------|--------|
| `CLAUDE.md:103` | `docs/` (generated API docs) | Directory exists, content varies |
| Multiple AGENTS.md | `ai-context.md` files | **0% exist** |

### Formal Notation Without Examples

**Location**: `.claude/rules/meta-thinking.md` and `.claude/rules/code-standards.md`

```
a |> f |> g |> h  ≡  pipe(a, f, g, h)
f ∘ g ∘ h         ≡  flow(f, g, h)
```

**Problem**: Mathematical notation is precise but provides no runnable code showing:
- Actual import statements
- Real-world usage context
- How to debug when it doesn't work

**Another example from code-standards.md**:
```
nested-loops        → pipe(∘)
conditionals        → Match.typeTags(ADT) ∨ $match
domain-types        := Schema.TaggedStruct
```

A new agent has no idea what `pipe(∘)` means in practice.

---

## Recommendations

### Quick Wins (< 1 hour each)

1. **Add Effect Quick Reference to CLAUDE.md** (30 min)
   - Add 10-line "Effect Basics" section at top
   - Include yield* explanation
   - Link to layer-design skill

2. **Document services:up prerequisite** (15 min)
   - Add "Prerequisites" section to Quick Reference
   - State Docker requirement explicitly

3. **Create alias cheatsheet** (20 min)
   - Move alias table from effect-patterns.md to CLAUDE.md
   - Add to Quick Reference section

4. **Add troubleshooting table** (30 min)
   - Common errors and solutions
   - Turborepo cascade debugging

5. **Link to key skills from CLAUDE.md** (15 min)
   - layer-design, service-implementation, domain-modeling
   - Currently buried in `.claude/skills/`

### Medium Effort (1-4 hours each)

1. **Create QUICK_START.md at repo root** (2 hours)
   - Pre-flight checklist
   - Step-by-step local setup
   - First feature walkthrough
   - Verification commands

2. **Create "Effect for This Codebase" guide** (3 hours)
   - Effect.gen pattern with full example
   - Service creation walkthrough
   - Layer composition basics
   - Error handling patterns
   - When to use which construct

3. **Generate ai-context.md for top 10 packages** (4 hours)
   - @beep/shared-domain
   - @beep/shared-server
   - @beep/shared-tables
   - @beep/iam-client
   - @beep/iam-server
   - @beep/testkit
   - @beep/schema
   - @beep/errors
   - @beep/utils
   - @beep/env

4. **Add worked examples to formal notation** (2 hours)
   - For each rule in code-standards.md
   - Show before/after with real code

5. **Create debugging skill/guide** (2 hours)
   - How to trace Effect failures
   - How to interpret Turborepo errors
   - How to isolate package issues

### Major Effort (> 4 hours)

1. **Full ai-context.md coverage** (16-24 hours)
   - All 62+ packages
   - Consistent format
   - Verified accuracy
   - `/modules` command functional

2. **Interactive onboarding system** (8-12 hours)
   - Skill-based checklist
   - Progress tracking
   - Validation gates

3. **Error pattern catalog** (8-12 hours)
   - 50+ patterns
   - YAML format
   - Safe/unsafe fix classification
   - Auto-fix hooks

---

## Priority Matrix

| Priority | Item | Impact | Effort |
|----------|------|--------|--------|
| **P0** | Document Docker/services:up prerequisite | Critical | 15 min |
| **P0** | Add Effect.gen explanation to CLAUDE.md | Critical | 30 min |
| **P1** | Create QUICK_START.md | High | 2 hours |
| **P1** | Alias cheatsheet in CLAUDE.md | High | 20 min |
| **P1** | Top 10 ai-context.md files | High | 4 hours |
| **P2** | Effect for This Codebase guide | Medium | 3 hours |
| **P2** | Worked examples for formal notation | Medium | 2 hours |
| **P2** | Debugging guide | Medium | 2 hours |
| **P3** | Full ai-context.md coverage | Medium | 16-24 hours |
| **P3** | Error pattern catalog | Medium | 8-12 hours |
| **P4** | Interactive onboarding | Low | 8-12 hours |

---

## Verification Checklist

After implementing recommendations, verify:

- [ ] New agent can run `bun run dev` in < 10 minutes
- [ ] Effect.gen pattern is explained before first use
- [ ] yield* syntax has English explanation
- [ ] Alias table is visible without scrolling in CLAUDE.md
- [ ] services:up is documented as required step
- [ ] `/modules` returns useful results (after ai-context.md)
- [ ] At least one "add a feature" walkthrough exists
- [ ] Turborepo cascade errors are explained with solution
- [ ] EntityId decision matrix exists

---

## Key Insight

The critical path for AI agent onboarding is:

1. Document hidden prerequisites (Docker, services:up)
2. Explain Effect basics (Effect.gen, yield*, Layers)
3. Create ai-context.md for module discovery
4. Add worked examples to abstract rules
