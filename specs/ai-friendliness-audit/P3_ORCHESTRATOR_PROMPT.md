# AI-Friendliness P3 Remediation Orchestrator

You are the orchestration agent responsible for applying P3 fixes from the AI-Friendliness Audit of the beep-effect monorepo. P1 and P2 are complete — this session focuses on remaining pattern violations, directory normalization, Biome rules, and README files.

## Critical Orchestration Rules

1. **NEVER write code directly** — Always use the Task tool to spawn sub-agents
2. **PRESERVE your context window** — Do not read large files; let sub-agents do that
3. **DETECT BEFORE FIXING** — Run violation counts first; skip phases with <5 violations
4. **PARALLELIZE INDEPENDENT TASKS** — Directory rename, Biome rules, and READMEs are independent

---

## Context from P1+P2 Completion

| Metric | P1 Start | P2 End | P3 Target |
|--------|----------|--------|-----------|
| CLAUDE.md lines | 562 | 93 | 93 (done) |
| AGENTS.md count | 31 | 42 | 42 (done) |
| Claude Skills | 0 | 5 | 5 (done) |
| Phase A violations | ~80 | ~0 | ~0 (done) |
| Phase B violations | ~60 | ~60 | <10 |
| Phase C violations | ~100 | ~100 | <20 |
| Directory naming | PascalCase | PascalCase | kebab-case |
| Biome strictness | warn | warn | error |
| README coverage | partial | partial | +3 files |
| Overall score | 3.0/5 | ~3.7/5 | 4.0/5 |

---

## P3 Tasks to Execute

### Task 1: Detection (RUN FIRST)

Get violation counts before planning fixes.

**Sub-agent prompt:**
```
You are responsible for detecting Effect pattern violations in Phase B and C packages.

Run these detection commands and report the counts:

PHASE B (shared/client, shared/domain):
grep -rn "\.map(" packages/shared/client packages/shared/domain --include="*.ts" | \
  grep -v "Effect\.map\|A\.map\|Arr\.map\|Stream\.map\|HashMap\.map\|O\.map" | wc -l
grep -rn "new Date(" packages/shared/client packages/shared/domain --include="*.ts" | wc -l
grep -rn "switch\s*(" packages/shared/client packages/shared/domain --include="*.ts" | wc -l

PHASE C (iam/*, ui/*):
grep -rn "\.map(" packages/iam packages/*/ui --include="*.ts" | \
  grep -v "Effect\.map\|A\.map\|Arr\.map\|Stream\.map\|HashMap\.map\|O\.map" | wc -l
grep -rn "new Date(" packages/iam packages/*/ui --include="*.ts" | wc -l
grep -rn "switch\s*(" packages/iam packages/*/ui --include="*.ts" | wc -l

OUTPUT: Table with Phase, Violation Type, Count. Include recommendation on which phases to fix.
```

---

### Task 2: Fix Phase B Pattern Violations

Launch ONLY if Task 1 shows >5 violations.

**Sub-agent prompt:**
```
You are responsible for fixing Effect pattern violations in Phase B packages.

SCOPE: packages/shared/client/src/, packages/shared/domain/src/

STEP 1 - DETECTION (confirm counts):
Report actual file locations with violations using:
grep -rn "\.map(" [SCOPE] --include="*.ts" | grep -v "Effect\.map\|A\.map\|Arr\.map\|Stream\.map"

STEP 2 - FIXING (batch by file):
For each file with violations:
1. Read the file once
2. Check existing imports — note aliases (A vs Arr, F vs Function)
3. Fix ALL violations in that file before moving to next
4. Add missing imports using existing alias style

CRITICAL RULES:
- Skip: external library callbacks, React event handlers
- For switches >50 lines: extract handler functions first
- Type Match.tag handlers as: (state: UnionType & { readonly _tag: 'Case' })

STEP 3 - VERIFY:
bun run check --filter=@beep/shared-client --filter=@beep/shared-domain

OUTPUT: Files modified, violations fixed per type, skipped violations, type check result.
```

---

### Task 3: Fix Phase C Pattern Violations

Launch ONLY if Task 1 shows >5 violations.

**Sub-agent prompt:**
```
You are responsible for fixing Effect pattern violations in Phase C packages.

SCOPE: packages/iam/*/src/, packages/*/ui/src/

IMPORTANT: UI packages contain React code. Skip these legitimate patterns:
- React event handlers: onClick={(e) => e.target.value.trim()}
- Array.from() on DOM collections
- Native .map() inside JSX expressions for rendering lists (use Effect A.map only for data transformation)

STEP 1 - DETECTION:
Report actual violations (excluding React patterns).

STEP 2 - FIXING (batch by file):
Focus on:
- Server packages (iam/server) — these should use Effect patterns
- Domain packages (iam/domain) — these should use Effect patterns
- UI data transformation (before render) — convert to Effect patterns

Skip:
- UI rendering logic inside JSX
- Event handler callbacks

STEP 3 - VERIFY:
bun run check --filter=@beep/iam-server --filter=@beep/iam-domain

OUTPUT: Files modified, violations fixed per type, skipped violations, type check result.
```

---

### Task 4: Normalize Directory Naming

Launch in PARALLEL with Tasks 5 & 6.

**Sub-agent prompt:**
```
You are responsible for normalizing directory names from PascalCase to kebab-case.

DIRECTORIES TO RENAME:
1. packages/shared/tables/src/Table/ → packages/shared/tables/src/table/
2. packages/shared/tables/src/OrgTable/ → packages/shared/tables/src/org-table/
3. packages/_internal/db-admin/src/Db/ → packages/_internal/db-admin/src/db/

FOR EACH DIRECTORY:
1. Check if directory exists: ls [path]
2. Find files importing from old path:
   grep -rn "from.*[directory name]/" packages --include="*.ts"
3. Rename using git mv:
   git mv [old path] [new path]
4. Update imports in all affected files using Edit tool
5. Verify: bun run check --filter=@beep/shared-tables

If directory doesn't exist, report and skip.

OUTPUT: Directories renamed, files with updated imports, type check result.
```

---

### Task 5: Enable Biome Rules

Launch in PARALLEL with Tasks 4 & 6.

**Sub-agent prompt:**
```
You are responsible for enabling stricter Biome linting rules.

FILE TO UPDATE: biome.jsonc

CHANGES NEEDED:
1. Find noDebugger rule, change from "off" to "error"
2. Find noExplicitAny rule, change from "warn" to "error"

AFTER UPDATING:
1. Run: bun run lint 2>&1 | head -200
2. Count violations per type
3. For noDebugger violations: remove the debugger statements
4. For noExplicitAny violations:
   - If type is obvious from context: add explicit type
   - If requires significant refactor: add biome-ignore comment with TODO

5. Re-run: bun run lint to verify

OUTPUT: Rules changed, violations found, fixes applied, remaining suppressions.
```

---

### Task 6: Create Missing README.md Files

Launch in PARALLEL with Tasks 4 & 5.

**Sub-agent prompt:**
```
You are responsible for creating README.md files for packages missing them.

FILES TO CREATE:
1. packages/shared/domain/README.md
2. packages/common/schema/README.md
3. packages/runtime/server/README.md

FIRST: Read packages/iam/domain/README.md for template style.

FOR EACH README:
1. Read package.json for name and description
2. Read src/index.ts for exports
3. Create README with:
   - Package name and description
   - Installation command
   - 2-3 usage examples (based on actual exports)
   - Core exports list
   - Related packages

Do NOT invent features. Only document what actually exists.

OUTPUT: Files created with paths and line counts.
```

---

## Execution Protocol

### Step 1: Launch Detection Task
Send ONE Task tool call for Task 1 (detection).
Wait for completion with TaskOutput.

### Step 2: Evaluate Detection Results
Based on counts:
- Phase B >5 violations → Include Task 2
- Phase C >5 violations → Include Task 3
- <5 violations → Skip that phase

### Step 3: Launch Remaining Tasks in Parallel
Send a SINGLE message with multiple Task tool calls:
- Task 2 (if needed)
- Task 3 (if needed)
- Task 4 (directory naming)
- Task 5 (Biome rules)
- Task 6 (README files)

Use run_in_background: true for all.

### Step 4: Collect Results
Use TaskOutput to collect all results.

### Step 5: Final Verification
Run:
```bash
# Pattern violations remaining
grep -rn "\.map(" packages/*/src --include="*.ts" | \
  grep -v "Effect\.map\|A\.map\|Arr\.map\|Stream\.map\|HashMap\.map\|O\.map" | wc -l

# Directory names
ls packages/shared/tables/src/
ls packages/_internal/db-admin/src/

# Lint check
bun run lint | tail -5

# README files
ls packages/shared/domain/README.md packages/common/schema/README.md packages/runtime/server/README.md

# Full check
bun run check
```

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Phase B+C violations | <20 total |
| Directories normalized | 3 renamed |
| Biome rules | noDebugger=error, noExplicitAny=error |
| README files created | 3 files |
| Type check | Passes |
| Lint check | Passes |
| Estimated score | 4.0/5 |

---

## Handoff Location

Full context and lessons learned: specs/ai-friendliness-audit/HANDOFF_P3.md

---

## Begin Orchestration

Read the handoff document first, then launch Task 1 (detection).
