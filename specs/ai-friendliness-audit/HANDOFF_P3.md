# AI-Friendliness Remediation Handoff — P3 Phase

> Handoff document for continuing AI-friendliness improvements after P2 completion.
> Date: 2026-01-06

---

## Session Summary: P2 Completed

### What Was Accomplished

| Fix | Before | After | Status |
|-----|--------|-------|--------|
| Claude Skills | 0 | 5 (691 lines) | ✅ Complete |
| Phase A violations | ~80 | ~0 | ✅ Complete |
| @example JSDoc | 0 | 5 functions | ✅ Complete |

**Skills created in `.claude/skills/`:**
- `forbidden-patterns.md` (141 lines) — Native patterns → Effect replacements
- `effect-imports.md` (120 lines) — Namespace imports, aliases
- `datetime-patterns.md` (143 lines) — DateTime API usage
- `match-patterns.md` (138 lines) — Match.value, Match.tag, Predicate
- `collection-patterns.md` (149 lines) — HashMap, HashSet, Array utilities

**Pattern fixes applied:**
- `errors.ts:133` — `.split()` → `Str.split()`
- `errors.ts:165-166` — `.trim()` → `Str.trim()`
- `errors.ts:287-292` — `.split().slice().forEach()` → `F.pipe(Str.split, A.take, A.forEach)`
- `errors.ts:293` — `.split().length` → `F.pipe(Str.split, A.length)`

**@example JSDoc added:**
- `DataAccess.layer.ts` — `layer` export
- `Persistence.layer.ts` — `layer` export
- `Policy.ts` — `all`, `any`, `permission` functions

**Score improvement:** 3.4/5 → ~3.7/5 (estimated)

---

## Lessons Learned

### What Worked Well

1. **Sequential skills-first approach** — Creating skills before pattern fixes ensured agents had reference material. The dependency ordering paid off.

2. **Precise scope in pattern fix prompt** — Limiting to `packages/documents/server/` and `packages/shared/server/` prevented the agent from wandering. Specific package filters in type check commands (`--filter=@beep/shared-server`) sped up verification.

3. **Checking existing imports before adding** — The reminder to check for existing aliases (Arr vs A, F vs Function) prevented import conflicts.

4. **Skipping intentional native patterns** — The instruction to skip infrastructure adapters (pg driver internals, external library callbacks) was correct. These are legitimate edge cases.

5. **Parallel task execution for independent work** — Running @example JSDoc and pattern violations in parallel saved significant time since they touched different files.

### What Needed Adjustment

1. **Phase A was mostly clean** — P1 had already fixed most Phase A violations. Detection commands found only 5 remaining issues in `errors.ts`. Future phases should run detection first to estimate actual work.

2. **Output verification commands need refinement** — The grep patterns for detecting violations had false positives (Effect.map, A.map counted as violations). Better exclusion patterns needed:
   ```bash
   # Better pattern - excludes Effect patterns
   grep -rn "\.map(" path --include="*.ts" | grep -v "Effect\.map\|A\.map\|Arr\.map\|Stream\.map\|HashMap\.map\|Option\.map"
   ```

3. **@example prompts need function signature context** — The agent had to read files to understand signatures. Pre-providing key signatures in the prompt would speed this up.

### Prompt Improvements for P3

1. **Run detection FIRST, then plan fixes** — Add: "Before making any changes, run detection commands and report actual violation counts. Skip phases with <5 violations."

2. **Better exclusion patterns** — Update grep patterns to exclude all legitimate Effect `.map()` variants.

3. **Batch by file, not by violation type** — When fixing multiple violations in one file, fix all types in that file before moving to the next. Reduces file re-reads.

4. **Include function signatures for @example** — When requesting JSDoc additions, include the function signature in the prompt to avoid file reads.

---

## Remaining Work: P3 Items

### 3.1 Fix Phase B Pattern Violations

**Scope:** `packages/shared/client/`, `packages/shared/domain/`
**Estimated violations:** ~60

**Detection commands:**
```bash
# Native .map() (excluding Effect patterns)
grep -rn "\.map(" packages/shared/client packages/shared/domain --include="*.ts" | \
  grep -v "Effect\.map\|A\.map\|Arr\.map\|Stream\.map\|HashMap\.map\|Option\.map\|O\.map" | wc -l

# Native Date
grep -rn "new Date(" packages/shared/client packages/shared/domain --include="*.ts" | wc -l

# Switch statements
grep -rn "switch\s*(" packages/shared/client packages/shared/domain --include="*.ts" | wc -l

# Native string methods
grep -rn "\.split(\|\.trim(\|\.toLowerCase(" packages/shared/client packages/shared/domain --include="*.ts" | \
  grep -v "Str\." | wc -l
```

---

### 3.2 Fix Phase C Pattern Violations

**Scope:** `packages/iam/*/src/`, `packages/*/ui/src/`
**Estimated violations:** ~100

**Note:** UI packages may have legitimate React patterns that use native methods. Be selective.

---

### 3.3 Normalize Directory Naming

**Current → Target:**
```
packages/shared/tables/src/Table/     → packages/shared/tables/src/table/
packages/shared/tables/src/OrgTable/  → packages/shared/tables/src/org-table/
packages/_internal/db-admin/src/Db/   → packages/_internal/db-admin/src/db/
```

**Approach:**
1. Use `git mv` to preserve history
2. Update all imports referencing old paths
3. Run type check to verify no broken imports

---

### 3.4 Enable Missing Biome Rules

**File:** `biome.jsonc`

**Changes:**
```jsonc
{
  "linter": {
    "rules": {
      "correctness": {
        "noDebugger": "error"  // Currently: off
      },
      "suspicious": {
        "noExplicitAny": "error"  // Currently: warn
      }
    }
  }
}
```

**After enabling:** Run `bun run lint` to identify violations, then fix or suppress with explanatory comments.

---

### 3.5 Add Missing README.md Files

**Files to create:**
1. `packages/shared/domain/README.md`
2. `packages/common/schema/README.md`
3. `packages/runtime/server/README.md`

**Template from existing:** Use `packages/iam/domain/README.md` as reference.

---

### 3.6 Fix Phase D Pattern Violations (Optional)

**Scope:** `packages/common/*/src/`, `packages/runtime/*/src/`
**Estimated violations:** ~67

**Lower priority** — common/* and runtime/* are more stable, less frequently modified.

---

## Improved Sub-Agent Prompts

### Pattern Violation Fixer (P3 Version)

```
You are responsible for fixing Effect pattern violations in the beep-effect monorepo.

PHASE: [B/C/D]
SCOPE: [specific directories]

STEP 1 - DETECTION (run first, report counts):
Run these commands and report actual violation counts before proceeding:

grep -rn "\.map(" [SCOPE] --include="*.ts" | \
  grep -v "Effect\.map\|A\.map\|Arr\.map\|Stream\.map\|HashMap\.map\|Option\.map\|O\.map" | wc -l

grep -rn "new Date(" [SCOPE] --include="*.ts" | wc -l
grep -rn "switch\s*(" [SCOPE] --include="*.ts" | wc -l
grep -rn "\.split(\|\.trim(\|\.toLowerCase(" [SCOPE] --include="*.ts" | grep -v "Str\." | wc -l

If total violations <5, report "Phase clean" and stop.

STEP 2 - FIXING (batch by file):
For each file with violations:
1. Read the file once
2. Check existing imports at top — note aliases (A vs Arr, F vs Function)
3. Fix ALL violations in that file before moving to next file
4. Add missing imports using existing alias style

CRITICAL RULES:
- Skip legitimate native usage in: external library callbacks, pg driver adapters, React event handlers
- For switches >50 lines: extract handler functions first
- Type Match.tag handlers as: `(state: UnionType & { readonly _tag: 'Case' })`

STEP 3 - VERIFY:
Run: bun run check --filter=@beep/[PACKAGE_NAME]

OUTPUT:
- Detection counts per type
- Files modified with line counts
- Violations fixed per type
- Skipped violations with reasons
- Type check result (pass/fail)
```

---

### Directory Renamer

```
You are responsible for normalizing directory names from PascalCase to kebab-case.

DIRECTORIES TO RENAME:
1. packages/shared/tables/src/Table/ → packages/shared/tables/src/table/
2. packages/shared/tables/src/OrgTable/ → packages/shared/tables/src/org-table/
3. packages/_internal/db-admin/src/Db/ → packages/_internal/db-admin/src/db/

FOR EACH DIRECTORY:
1. List all files that import from the old path:
   grep -rn "from.*Table/" packages --include="*.ts"

2. Rename using git mv (preserves history):
   git mv packages/shared/tables/src/Table packages/shared/tables/src/table

3. Update all imports in affected files:
   - Change import paths from "/Table/" to "/table/"
   - Use Edit tool for each file

4. Verify with type check:
   bun run check --filter=@beep/shared-tables

OUTPUT: List of directories renamed, files with updated imports, type check result.
```

---

### README Creator

```
You are responsible for creating README.md files for packages missing them.

FILES TO CREATE:
1. packages/shared/domain/README.md
2. packages/common/schema/README.md
3. packages/runtime/server/README.md

TEMPLATE (read packages/iam/domain/README.md first):

```markdown
# @beep/PACKAGE_NAME

DESCRIPTION from package.json

## Installation

```bash
bun add @beep/PACKAGE_NAME
```

## Usage

[2-3 practical examples showing main exports]

## API Reference

### Core Exports

[List main exports from src/index.ts with brief descriptions]

## Related Packages

[List packages that depend on this or that this depends on]
```

FOR EACH FILE:
1. Read package.json for name, description
2. Read src/index.ts for exports
3. Create README with accurate content
4. Do NOT invent features — only document what exists

OUTPUT: List of README files created with paths.
```

---

### Biome Rules Updater

```
You are responsible for enabling stricter Biome linting rules.

FILE TO UPDATE: biome.jsonc

CHANGES:
1. Set noDebugger from "off" to "error"
2. Set noExplicitAny from "warn" to "error"

AFTER UPDATING:
1. Run: bun run lint 2>&1 | head -100
2. Identify files with new violations
3. For each violation:
   - If fixable with type annotation: fix it
   - If requires significant refactor: add suppression comment explaining why
4. Run: bun run lint to verify clean

OUTPUT:
- Rules changed
- Violations found
- Fixes applied
- Suppressions added with reasons
```

---

## P3 Orchestrator Prompt

Save this for the next session:

```
You are the AI-Friendliness Remediation Orchestrator for the beep-effect monorepo, continuing from P2 completion.

## Context
- P1 COMPLETE: CLAUDE.md 93 lines, 42 AGENTS.md files, 10 pattern violations fixed
- P2 COMPLETE: 5 Claude Skills, Phase A violations fixed, 5 @example JSDoc added
- Current estimated score: 3.7/5
- Target after P3: 4.0/5

## Read First
- specs/ai-friendliness-audit/HANDOFF_P3.md — This handoff document

## P3 Tasks (Priority Order)

### Task 1: Detect Phase B/C Violation Counts
Launch: general-purpose agent
Action: Run detection commands only, report counts
Decision: Skip phases with <5 violations

### Task 2: Fix Phase B Pattern Violations
Scope: packages/shared/client/, packages/shared/domain/
Est: ~60 violations

### Task 3: Fix Phase C Pattern Violations
Scope: packages/iam/*/src/, packages/*/ui/src/
Est: ~100 violations

### Task 4: Normalize Directory Naming
Scope: Table/ → table/, OrgTable/ → org-table/, Db/ → db/
Requires: git mv + import updates

### Task 5: Enable Biome Rules
File: biome.jsonc
Changes: noDebugger=error, noExplicitAny=error

### Task 6: Create Missing README.md Files
Files: shared/domain, common/schema, runtime/server

## Execution Protocol

1. Launch Task 1 first (detection) — determines if Tasks 2/3 needed
2. Based on counts:
   - Phase B >5 violations → Launch Task 2
   - Phase C >5 violations → Launch Task 3
   - Either phase <5 → Skip that task
3. Launch Tasks 4, 5, 6 in parallel (independent)
4. Verify with:
   - ls packages/shared/tables/src/ (should show lowercase dirs)
   - bun run lint (should pass)
   - ls packages/shared/domain/README.md packages/common/schema/README.md packages/runtime/server/README.md
5. Run final check: bun run check && bun run lint

## Success Criteria
- Phase B+C violations reduced to <20 total
- Directory names normalized
- Biome rules enabled with clean lint
- 3 README.md files created
- bun run check passes
- Estimated score: 4.0/5
```

---

## Verification Commands

Run after P3 completion:

```bash
# Pattern violations remaining (all phases)
grep -rn "\.map(" packages/*/src --include="*.ts" | \
  grep -v "Effect\.map\|A\.map\|Arr\.map\|Stream\.map\|HashMap\.map\|O\.map" | wc -l

# Directory names (should be lowercase)
ls packages/shared/tables/src/
ls packages/_internal/db-admin/src/

# Biome lint (should pass)
bun run lint

# README files exist
ls packages/shared/domain/README.md
ls packages/common/schema/README.md
ls packages/runtime/server/README.md

# Full check
bun run check
```

---

## File Locations

| Document | Path |
|----------|------|
| This handoff | specs/ai-friendliness-audit/HANDOFF_P3.md |
| P3 orchestrator | specs/ai-friendliness-audit/P3_ORCHESTRATOR_PROMPT.md |
| P2 handoff | specs/ai-friendliness-audit/HANDOFF_P2.md |
| Remediation plan | specs/ai-friendliness-audit/outputs/remediation-plan.md |
| Claude Skills | .claude/skills/*.md |

---

## Notes for Next Agent

1. **Detection before action** — Run grep counts first. P2 showed Phase A was mostly clean; same may be true for B/C.

2. **UI packages have React patterns** — `packages/*/ui/` files may legitimately use native methods in React callbacks. Be selective about what to fix.

3. **git mv preserves history** — Always use `git mv` for directory renames, not manual move.

4. **noExplicitAny may surface many issues** — Enabling this rule might reveal numerous `any` usages. Prioritize shared/* and runtime/* fixes; suppress others with TODO comments.

5. **README accuracy** — Only document what actually exists in the package. Read src/index.ts before writing.

6. **Phase D is optional** — If time permits, tackle common/* and runtime/* violations. Lower priority than B/C.
