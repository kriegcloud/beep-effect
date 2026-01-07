# AI-Friendliness Remediation Orchestrator

You are the orchestration agent responsible for applying the top 3 immediate fixes (P1) from the AI-Friendliness Audit of the beep-effect monorepo. Your role is STRICTLY orchestration - you must delegate ALL implementation work to sub-agents.

## Critical Orchestration Rules

1. **NEVER write code directly** - Always use the Task tool to spawn sub-agents
2. **PRESERVE your context window** - Do not read large files; let sub-agents do that
3. **RUN AGENTS IN PARALLEL** - Launch all 3 fix agents in a single message with multiple Task tool calls
4. **MONITOR and CONSOLIDATE** - Use TaskOutput to collect results, then summarize

---

## Available CLI Tools (@beep/repo-cli)

The monorepo has a CLI at `tooling/cli/` with useful commands for documentation tasks:

### Documentation Generation Commands

```bash
# AI-powered JSDoc fixing - runs parallel agents to fix JSDoc issues
bun run beep docgen agents [-p <package>] [--parallel <n>] [--dry-run] [--durable]

# Analyze JSDoc coverage with agent-actionable output
bun run beep docgen analyze -p <package> [--fix-mode]

# Full docgen pipeline
bun run beep docgen init      # Initialize docgen for a package
bun run beep docgen generate  # Generate documentation
bun run beep docgen status    # Check documentation status
```

### Slice Creation (Note: Gap Identified)

```bash
# Creates vertical slice with 5 packages (client, domain, server, tables, ui)
bun run beep create-slice -n <name> -d "<description>"
```

**IMPORTANT**: The `create-slice` command does NOT generate AGENTS.md files. This is a gap - AGENTS.md files must be created manually for new slices.

## The 3 Parallel Fixes to Apply

### Fix 1: Reduce CLAUDE.md to <100 lines

**Current state**: 562 lines with embedded code examples and rules
**Target**: ~90 lines focused on navigation and critical rules

**Sub-agent task**:
1. Read current `/CLAUDE.md`
2. Extract these sections to `documentation/EFFECT_PATTERNS.md`:
   - "Critical Rules" section (lines ~280-493, all the NEVER use native Array/String/Date/Match content)
   - "Import Conventions" code examples
3. Extract "Package Structure" tree (lines ~30-80) to `documentation/PACKAGE_STRUCTURE.md`
4. Rewrite CLAUDE.md keeping only:
   - system-reminder opening (24 lines)
   - Quick Reference commands table (11 lines)
   - 2-line Project Overview with link to docs/
   - Technology Stack table (12 lines)
   - Architecture & Boundaries summary (10 lines)
   - Code Quality condensed (5 lines)
   - Workflow for AI Agents (10 lines)
   - Key References (9 lines)
   - NEW: "For detailed Effect patterns, see `documentation/EFFECT_PATTERNS.md`" link
5. Verify final line count < 100

---

### Fix 2: Create 11 Missing AGENTS.md Files

> **Note**: The `create-slice` CLI command does NOT generate AGENTS.md files, so these must be created manually. Consider filing a feature request to add AGENTS.md generation to `create-slice`.

**Files to create** (use `packages/iam/domain/AGENTS.md` as template):

```
packages/customization/client/AGENTS.md
packages/customization/domain/AGENTS.md
packages/customization/server/AGENTS.md
packages/customization/tables/AGENTS.md
packages/customization/ui/AGENTS.md
packages/comms/client/AGENTS.md
packages/comms/domain/AGENTS.md
packages/comms/server/AGENTS.md
packages/comms/tables/AGENTS.md
packages/comms/ui/AGENTS.md
packages/shared/env/AGENTS.md
```

**Sub-agent task**:
1. Read `packages/iam/domain/AGENTS.md` as template
2. For each missing file:
   - Read the package's `src/index.ts` to understand exports
   - Read `package.json` for dependencies and purpose
   - Create AGENTS.md with:
     - Purpose & Fit (adapted to package)
     - Surface Map (actual exports from index.ts)
     - Authoring Guardrails (standard Effect patterns)
     - Contributor Checklist
3. Verify all 11 files created

---

### Fix 3: Fix Top 10 Pattern Violations

**Violations to fix**:

| # | File | Line | Current | Fix |
|---|------|------|---------|-----|
| 1 | `packages/documents/server/src/handlers/Discussion.handlers.ts` | 54-56 | `discussions.map(...)` | `F.pipe(discussions, A.map(...))` |
| 2 | `packages/documents/server/src/handlers/Discussion.handlers.ts` | 56 | `discussion.comments.map(...)` | `F.pipe(discussion.comments, A.map(...))` |
| 3 | `packages/shared/server/src/factories/db-client/pg/PgClient.ts` | 171 | `result.map(...)` | `F.pipe(result, A.map(...))` |
| 4 | `packages/shared/server/src/factories/db-client/pg/errors.ts` | 166 | `paramsStr.split(",").map(...)` | `F.pipe(Str.split(paramsStr, ","), A.map(...))` |
| 5 | `packages/shared/server/src/db/repos/UploadSession.repo.ts` | 40 | `new Date(value)` | Use `DateTime.make` with fallback |
| 6 | `packages/common/errors/src/server.ts` | 228 | `new Date()` | `DateTime.unsafeNow()` + `DateTime.formatIso()` |
| 7 | `packages/shared/server/src/factories/db-client/pg/formatter.ts` | 158 | `switch(type)` | `Match.value(type).pipe(...)` |
| 8 | `packages/shared/client/src/atom/files/atoms/upload.atom.ts` | 36 | `switch(state._tag)` | `Match.value(state).pipe(Match.tag(...))` |
| 9 | `packages/shared/server/src/factories/db-client/pg/PgClient.ts` | 415 | `switch(type.kind)` | `Match.value(type.kind).pipe(...)` |
| 10 | `packages/common/utils/src/format-time.ts` | 324 | `switch(unit)` | `Match.value(unit).pipe(...)` |

**Sub-agent task**:
1. For each file, read the surrounding context (20 lines before/after)
2. Apply the fix using proper Effect patterns:
   - Add imports if needed: `import * as A from "effect/Array"`, `import * as F from "effect/Function"`, `import * as Match from "effect/Match"`, `import * as DateTime from "effect/DateTime"`
   - Replace native patterns with Effect equivalents
3. Verify each file still type-checks: `bun run check --filter=@beep/PACKAGE_NAME`

---

## Execution Protocol

### Step 1: Launch All 3 Agents in Parallel

Send a SINGLE message with THREE Task tool calls:

```
<Task tool call 1: CLAUDE.md reducer agent>
<Task tool call 2: AGENTS.md creator agent>
<Task tool call 3: Pattern violation fixer agent>
```

Use `run_in_background: true` for all three.

### Step 2: Monitor Progress

Use `TaskOutput` with `block: false` to check status periodically.

### Step 3: Collect Results

When all complete, use `TaskOutput` with `block: true` to get final outputs.

### Step 4: Consolidate and Report

Create summary showing:
- Files created/modified
- Line count changes
- Any errors encountered
- Verification commands to run

---

## Sub-Agent Prompts

### Agent 1: CLAUDE.md Reducer

```
You are responsible for reducing /CLAUDE.md from 562 lines to <100 lines.

TASK:
1. Read /CLAUDE.md completely
2. Create /documentation/EFFECT_PATTERNS.md with extracted content:
   - All "Critical Rules" content (native Array/String/Date/Match sections)
   - All code examples showing Effect patterns
   - Import conventions table
3. Create /documentation/PACKAGE_STRUCTURE.md with the package structure tree
4. Rewrite /CLAUDE.md keeping ONLY:
   - system-reminder opening block
   - Quick Reference commands table
   - 2-line project overview + link to documentation/PACKAGE_STRUCTURE.md
   - Technology Stack table
   - Architecture & Boundaries (condensed to 10 lines)
   - Code Quality (5 lines)
   - Workflow for AI Agents
   - Key References
   - NEW section: "## Effect Patterns\nSee documentation/EFFECT_PATTERNS.md for detailed patterns."
5. Run: wc -l CLAUDE.md (must be <100)

OUTPUT: Report files created/modified with line counts.
```

### Agent 2: AGENTS.md Creator

```
You are responsible for creating 11 missing AGENTS.md files.

TEMPLATE: Read /packages/iam/domain/AGENTS.md first

FILES TO CREATE:
- packages/customization/client/AGENTS.md
- packages/customization/domain/AGENTS.md
- packages/customization/server/AGENTS.md
- packages/customization/tables/AGENTS.md
- packages/customization/ui/AGENTS.md
- packages/comms/client/AGENTS.md
- packages/comms/domain/AGENTS.md
- packages/comms/server/AGENTS.md
- packages/comms/tables/AGENTS.md
- packages/comms/ui/AGENTS.md
- packages/shared/env/AGENTS.md

FOR EACH FILE:
1. Read the package's src/index.ts to understand exports
2. Read package.json for name and dependencies
3. Create AGENTS.md following template structure:
   - # AGENTS.md — @beep/PACKAGE_NAME
   - ## Purpose & Fit
   - ## Surface Map (list actual exports)
   - ## Authoring Guardrails
   - ## Contributor Checklist

OUTPUT: List all 11 files created with confirmation.
```

### Agent 3: Pattern Violation Fixer

```
You are responsible for fixing 10 Effect pattern violations.

FIXES TO APPLY:

1. packages/documents/server/src/handlers/Discussion.handlers.ts:54-56
   - Replace: discussions.map((discussion) => ...)
   - With: F.pipe(discussions, A.map((discussion) => ...))
   - Also fix nested: discussion.comments.map(...)

2. packages/shared/server/src/factories/db-client/pg/PgClient.ts:171
   - Replace: result.map((r) => r.rows ?? [])
   - With: F.pipe(result, A.map((r) => r.rows ?? []))

3. packages/shared/server/src/factories/db-client/pg/errors.ts:166
   - Replace: paramsStr.split(",").map((p) => p.trim())
   - With: F.pipe(paramsStr, Str.split(","), A.map(Str.trim))

4. packages/shared/server/src/db/repos/UploadSession.repo.ts:40
   - Replace: return new Date(value)
   - With: return F.pipe(DateTime.make(value), O.getOrElse(() => DateTime.unsafeNow()), DateTime.toDate)

5. packages/common/errors/src/server.ts:228
   - Replace: (opts.date ?? new Date()).toISOString()
   - With: DateTime.formatIso(opts.date ? DateTime.unsafeMake(opts.date) : DateTime.unsafeNow())

6-10. Convert switch statements to Match.value patterns in:
   - formatter.ts:158, upload.atom.ts:36, PgClient.ts:415, format-time.ts:324

FOR EACH FIX:
1. Read 30 lines around the violation
2. Add missing imports at top of file
3. Apply the fix preserving surrounding logic
4. Verify syntax is correct

OUTPUT: List all 10 fixes applied with file:line references.
```

---

## Verification Commands (Run After All Agents Complete)

```bash
# Verify CLAUDE.md reduction
wc -l CLAUDE.md  # Should be <100

# Verify new docs exist
ls -la documentation/EFFECT_PATTERNS.md documentation/PACKAGE_STRUCTURE.md

# Verify AGENTS.md files created
find packages -name "AGENTS.md" | wc -l  # Should be 42 (was 31)

# Type check affected packages
bun run check --filter=@beep/documents-server
bun run check --filter=@beep/shared-server
bun run check --filter=@beep/errors
bun run check --filter=@beep/utils

# Check JSDoc coverage for affected packages (using docgen CLI)
bun run beep docgen analyze -p @beep/documents-server
bun run beep docgen analyze -p @beep/shared-server
```

---

## Context from Audit

**Audit outputs location**: `specs/ai-friendliness-audit/outputs/`
- `audit-context.md` - Discovery findings
- `evaluation-report.md` - Dimension scores
- `remediation-plan.md` - Full prioritized plan

**Current scores**:
- Documentation: 3.5/5
- Structure: 3.0/5
- Patterns: 2.0/5 (317 violations)
- Tooling: 4.5/5
- AI Instructions: 2.0/5 (562 line CLAUDE.md)
- **Overall: 3.0/5**

**Target after P1 fixes**:
- CLAUDE.md: 562 → <100 lines
- AGENTS.md coverage: 73.8% → 100%
- Pattern violations: 317 → 307 (10 fixed)
- **Expected score improvement: 3.0 → 3.4/5**

---

## Begin Orchestration

Launch all 3 agents now using the Task tool with `run_in_background: true`. Send a SINGLE message with all 3 Task tool calls to maximize parallelism.
