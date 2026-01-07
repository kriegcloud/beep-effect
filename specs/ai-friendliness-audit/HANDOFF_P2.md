# AI-Friendliness Remediation Handoff — P2 Phase

> Handoff document for continuing AI-friendliness improvements after P1 completion.
> Date: 2026-01-06

---

## Session Summary: P1 Completed

### What Was Accomplished

| Fix | Before | After | Status |
|-----|--------|-------|--------|
| CLAUDE.md reduction | 562 lines | 93 lines | ✅ Complete |
| AGENTS.md creation | 31 files | 42 files | ✅ Complete |
| Pattern violations fixed | 0 | 10 | ✅ Complete |

**Files created:**
- `documentation/EFFECT_PATTERNS.md` (280 lines) — Extracted Effect patterns
- `documentation/PACKAGE_STRUCTURE.md` (112 lines) — Package tree + agent guides
- 11 new AGENTS.md files in customization/, comms/, shared/env/

**Pattern fixes applied:**
1. `Discussion.handlers.ts:54-60` — Native `.map()` → `F.pipe(A.map())`
2. `PgClient.ts:171` — Native `.map()` → `Arr.map()`
3. `errors.ts:168` — `.split().map()` → `Str.split()` + `A.map()`
4. `UploadSession.repo.ts:40` — `new Date()` → `DateTime.make()`
5. `server.ts:228` — `new Date()` → `DateTime.unsafeNow()`
6. `formatter.ts:158` — switch → `Match.exhaustive`
7. `upload.atom.ts:36-268` — Large switch → `Match.tag()` with handlers
8. `PgClient.ts:416` — switch → `Match.exhaustive`
9. `format-time.ts:325` — switch → `Match.exhaustive`

**Score improvement:** 3.0/5 → ~3.4/5 (estimated)

---

## Lessons Learned

### What Worked Well

1. **Parallel sub-agent execution** — Launching 3 agents simultaneously cut total time significantly. The Task tool with `run_in_background: true` is essential.

2. **Template-based AGENTS.md creation** — Using `packages/iam/domain/AGENTS.md` as a template ensured consistency. The agent correctly read each package's `src/index.ts` and `package.json` to populate Surface Maps.

3. **Specific fix instructions** — Providing exact file paths with line numbers (e.g., `PgClient.ts:171`) eliminated search time and ambiguity.

4. **Type validation after fixes** — Running `bun run check` caught issues immediately, particularly with the `upload.atom.ts` refactor which needed type annotation fixes.

### What Needed Adjustment

1. **Large switch refactors** — The `upload.atom.ts` fix (200+ line switch) required extracting handler functions first. Direct in-place Match.tag replacement would have been unmaintainable.

2. **Type inference with Match.tag** — When using `Match.tag()` with Effect's Schema-based tagged unions, handler function parameters needed explicit typing like `(state: UploadState & { readonly _tag: "Idle" })` rather than `typeof UploadState.Idle.Type`.

3. **Import additions** — Sub-agents sometimes forgot to add required imports (`F`, `Match`, `A`, `Str`). The prompt should explicitly list all imports to add.

4. **`Arr` vs `A` aliases** — Some files use `Arr` for Array, others use `A`. The agent needs to check existing imports before adding new ones.

### Prompt Improvements Identified

1. **Be explicit about import checking** — Add: "First check existing imports. Use the existing alias if one exists (e.g., `Arr` vs `A`)."

2. **Handle large switches differently** — Add: "For switch statements >50 lines, extract handler functions first, then use Match.tag()."

3. **Specify type annotation patterns** — Add: "For Match.tag handlers, type parameters as `(state: UnionType & { readonly _tag: 'CaseName' })`."

---

## Remaining Work: P2 Items

### 2.1 Create Claude Skills (5 Skills)

**NOT STARTED** — These need to be created in `.claude/skills/` directory.

| Skill | Content Source | Priority |
|-------|----------------|----------|
| `forbidden-patterns` | Critical Rules from old CLAUDE.md | High |
| `effect-patterns` | Import conventions + composition | High |
| `datetime-patterns` | DateTime usage patterns | Medium |
| `match-predicate-patterns` | Match + Predicate patterns | Medium |
| `collection-utilities` | HashMap, HashSet, Array utilities | Medium |

**Recommendation:** Create skills from the newly extracted `documentation/EFFECT_PATTERNS.md`.

---

### 2.2 Fix Remaining Pattern Violations (~307)

**Phased approach from remediation plan:**

| Phase | Packages | Est. Violations | Scope |
|-------|----------|-----------------|-------|
| A | documents/server, shared/server | ~80 | Server-side patterns |
| B | shared/client, shared/domain | ~60 | Client + domain |
| C | iam/*, ui/* | ~100 | Auth + UI layers |
| D | common/*, runtime/* | ~67 | Utilities + runtime |

**Detection commands:**
```bash
# Native .map() usage
grep -rn "\.map(" packages/*/src --include="*.ts" | grep -v "A\.map\|Arr\.map\|HashMap\.map" | wc -l

# Native Date usage
grep -rn "new Date(" packages/*/src --include="*.ts" | wc -l

# Switch statements
grep -rn "switch\s*(" packages/*/src --include="*.ts" | wc -l

# Native string methods (incomplete check)
grep -rn "\.split(\|\.trim(\|\.toLowerCase(" packages/*/src --include="*.ts" | grep -v "Str\." | wc -l
```

---

### 2.3 Add @example to Critical Infrastructure

**NOT STARTED** — High-value JSDoc additions:

| File | Function/Export | Example Needed |
|------|-----------------|----------------|
| `runtime/server/src/DataAccess.layer.ts` | Layer export | Layer composition |
| `runtime/server/src/Persistence.layer.ts` | Service wiring | Service pattern |
| `shared/domain/src/Policy.ts:139-182` | `Policy.all`, `Policy.any` | Combinator usage |

---

### 2.4 Test Coverage Enforcement

**NOT STARTED** — Currently many packages have only `Dummy.test.ts` placeholders.

**Actions needed:**
1. Add coverage thresholds to Vitest config
2. Replace Dummy.test.ts with minimal real tests
3. Target: 60% line coverage, 50% branch coverage

---

## Remaining Work: P3 Items (Quick Wins)

### 3.1 Normalize Directory Naming

| Current | Target |
|---------|--------|
| `packages/shared/tables/src/Table/` | `packages/shared/tables/src/table/` |
| `packages/shared/tables/src/OrgTable/` | `packages/shared/tables/src/org-table/` |
| `packages/_internal/db-admin/src/Db/` | `packages/_internal/db-admin/src/db/` |

### 3.2 Enable Missing Biome Rules

**File:** `biome.jsonc`
- Change `noDebugger` from `off` to `error`
- Change `noExplicitAny` from `warn` to `error`

### 3.3 Add Missing README.md Files

- `packages/shared/domain/README.md`
- `packages/common/schema/README.md`
- `packages/runtime/server/README.md`

---

## Improved Sub-Agent Prompts

### Pattern Violation Fixer (Improved)

```
You are responsible for fixing Effect pattern violations in the beep-effect monorepo.

CRITICAL RULES:
1. ALWAYS check existing imports first. If the file uses `Arr` for Array, use `Arr`. If it uses `A`, use `A`.
2. For switch statements >50 lines, extract handler functions first, then use Match.tag().
3. When typing Match.tag handlers, use: `(state: UnionType & { readonly _tag: 'CaseName' })`
4. Run type check after EACH file modification to catch issues early.

FIXES TO APPLY:
[List specific files with line numbers and before/after examples]

FOR EACH FIX:
1. Read 50 lines around the violation to understand context
2. Check existing imports at top of file — note aliases used (A vs Arr, F vs Function, etc.)
3. Add missing imports ONLY if not already present, using the same alias style
4. For small switches (<50 lines): Convert inline to Match.value/Match.tag
5. For large switches (>50 lines): Extract handler functions, then use Match.tag
6. Apply the fix preserving surrounding logic
7. Run: `bun run check --filter=@beep/PACKAGE_NAME` to verify

OUTPUT: List all fixes applied with file:line references and any issues encountered.
```

---

### AGENTS.md Creator (Improved)

```
You are responsible for creating AGENTS.md files following the established template.

TEMPLATE: Read /packages/iam/domain/AGENTS.md first as your template

FILES TO CREATE:
[List of file paths]

FOR EACH FILE:
1. Read the package's src/index.ts to understand exports
2. Read package.json for name, description, and dependencies
3. Identify the package layer (client/domain/server/tables/ui)
4. Create AGENTS.md with these sections:

   ## Structure:
   ```
   # @beep/PACKAGE_NAME — Agent Guide

   ## Purpose & Fit
   [2-3 sentences: what this package does, where it fits in the architecture]

   ## Surface Map
   [Bullet list of ACTUAL exports from index.ts — not placeholders]
   [If package is scaffold/empty, note: "(Scaffold) — awaiting implementation"]

   ## Usage Snapshots
   [2-3 common usage patterns for this package]

   ## Authoring Guardrails
   [Layer-specific rules: client=contracts, domain=entities, server=repos, tables=schemas, ui=components]

   ## Quick Recipes
   [1-2 code examples if applicable, skip for scaffolds]

   ## Verifications
   - `bun run check --filter @beep/PACKAGE_NAME`
   - `bun run lint --filter @beep/PACKAGE_NAME`
   - `bun run test --filter @beep/PACKAGE_NAME`

   ## Contributor Checklist
   [5-7 actionable items specific to this layer]
   ```

5. Adapt guardrails to the layer:
   - **client**: Contract patterns, "use client" directives, TanStack Query
   - **domain**: Entity models, makeFields, modelKit, Symbol.for naming
   - **server**: Repo.make, Layer composition, Effect for async
   - **tables**: Table.make factory, foreign keys, indexes
   - **ui**: React 19 patterns, MUI/Tailwind, accessibility

OUTPUT: Confirm each file created with path.
```

---

### Claude Skills Creator (New)

```
You are responsible for creating Claude Skills from existing documentation.

SKILLS TO CREATE:
1. forbidden-patterns — Extract from documentation/EFFECT_PATTERNS.md "Critical Rules" section
2. effect-patterns — Import conventions + Effect.gen/Layer patterns
3. datetime-patterns — DateTime creation, arithmetic, formatting, timezones
4. match-predicate-patterns — Match.value, Match.tag, Predicate composition
5. collection-utilities — HashMap, HashSet, Array/Record/Struct utilities

FOR EACH SKILL:
1. Create file at `.claude/skills/SKILL_NAME.md`
2. Include:
   - Purpose statement
   - When to invoke (keywords that trigger this skill)
   - Forbidden patterns (what NOT to do)
   - Required patterns (what TO do)
   - Code examples with before/after
3. Keep each skill <200 lines for quick loading

SKILL FORMAT:
```markdown
# SKILL_NAME

## When to Use
Invoke this skill when you see: [keywords/patterns]

## Forbidden Patterns
[Code blocks showing what NOT to do]

## Required Patterns
[Code blocks showing correct approach]

## Examples
[2-3 practical examples]
```

OUTPUT: List skills created with line counts.
```

---

## P2 Orchestrator Prompt

Save this as the prompt for the next session:

```
You are the AI-Friendliness Remediation Orchestrator for the beep-effect monorepo, continuing from P1 completion.

## Context
- P1 is COMPLETE: CLAUDE.md reduced to 93 lines, 42 AGENTS.md files, 10 pattern violations fixed
- Current estimated score: 3.4/5
- Target after P2: 4.0/5

## Read First
- `specs/ai-friendliness-audit/HANDOFF_P2.md` — This handoff document
- `specs/ai-friendliness-audit/outputs/remediation-plan.md` — Full plan

## P2 Tasks (Priority Order)

### Task 1: Create Claude Skills (5 skills)
Launch: `subagent_type: general-purpose`
Source: `documentation/EFFECT_PATTERNS.md`
Target: `.claude/skills/`

### Task 2: Fix Pattern Violations Phase A
Launch: `subagent_type: general-purpose`
Scope: `packages/documents/server/`, `packages/shared/server/`
Est: ~80 violations

### Task 3: Add @example JSDoc
Launch: `subagent_type: general-purpose`
Files:
- `runtime/server/src/DataAccess.layer.ts`
- `runtime/server/src/Persistence.layer.ts`
- `shared/domain/src/Policy.ts:139-182`

## Execution Protocol

1. Read handoff document fully
2. Launch Task 1 (Skills) first — other tasks depend on skill availability
3. Launch Tasks 2-3 in parallel after Task 1 completes
4. Verify with:
   ```bash
   ls -la .claude/skills/
   grep -rn "\.map(" packages/documents/server packages/shared/server --include="*.ts" | grep -v "A\.map\|Arr\.map" | wc -l
   ```

## Improved Sub-Agent Prompts
Use the improved prompts from HANDOFF_P2.md section "Improved Sub-Agent Prompts"

## Success Criteria
- 5 Claude Skills created in `.claude/skills/`
- Pattern violations in Phase A packages reduced to <10
- @example blocks added to 3 critical infrastructure files
- `bun run check` passes
```

---

## Verification Commands

Run after P2 completion:

```bash
# Skills created
ls -la .claude/skills/

# Pattern violations remaining (Phase A scope)
grep -rn "\.map(" packages/documents/server packages/shared/server --include="*.ts" | grep -v "A\.map\|Arr\.map" | wc -l

# Native Date remaining
grep -rn "new Date(" packages/*/src --include="*.ts" | wc -l

# Switch statements remaining
grep -rn "switch\s*(" packages/*/src --include="*.ts" | wc -l

# JSDoc coverage (using CLI)
bun run beep docgen analyze -p @beep/shared-server
bun run beep docgen analyze -p @beep/documents-server

# Overall health
bun run check
bun run lint
```

---

## File Locations

| Document | Path |
|----------|------|
| This handoff | `specs/ai-friendliness-audit/HANDOFF_P2.md` |
| Remediation plan | `specs/ai-friendliness-audit/outputs/remediation-plan.md` |
| Evaluation report | `specs/ai-friendliness-audit/outputs/evaluation-report.md` |
| Effect patterns | `documentation/EFFECT_PATTERNS.md` |
| Package structure | `documentation/PACKAGE_STRUCTURE.md` |
| Reduced CLAUDE.md | `CLAUDE.md` |

---

## Notes for Next Agent

1. **Skills directory may not exist** — Create `.claude/skills/` if needed
2. **Pattern violations are spread across many files** — Use grep to identify, then batch by file
3. **Type check is slow** — Consider running per-package: `bun run check --filter=@beep/PACKAGE`
4. **Some violations are intentional** — Infrastructure code (pg driver adapters) may legitimately use native methods
5. **Match.exhaustive requires all cases** — If a union type has many variants, Match.orElse may be acceptable for "other" cases
