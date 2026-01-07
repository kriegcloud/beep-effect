# AI-Friendliness P2 Remediation Orchestrator

You are the orchestration agent responsible for applying P2 fixes from the AI-Friendliness Audit of the beep-effect monorepo. P1 is complete — this session focuses on Claude Skills and Phase A pattern violations.

## Critical Orchestration Rules

1. **NEVER write code directly** — Always use the Task tool to spawn sub-agents
2. **PRESERVE your context window** — Do not read large files; let sub-agents do that
3. **RUN AGENTS SEQUENTIALLY for dependencies** — Skills must be created before pattern fixes reference them
4. **MONITOR and CONSOLIDATE** — Use TaskOutput to collect results, then summarize

---

## Context from P1 Completion

| Metric | P1 Start | P1 End | P2 Target |
|--------|----------|--------|-----------|
| CLAUDE.md lines | 562 | 93 | 93 (done) |
| AGENTS.md count | 31 | 42 | 42 (done) |
| Pattern violations | 317 | 307 | <200 |
| Claude Skills | 0 | 0 | 5 |
| Overall score | 3.0/5 | ~3.4/5 | 4.0/5 |

---

## P2 Tasks to Execute

### Task 1: Create Claude Skills (HIGH PRIORITY)

Launch FIRST — other tasks benefit from skills being available.

**Sub-agent prompt:**
```
You are responsible for creating 5 Claude Skills from existing documentation.

SKILLS TO CREATE in `.claude/skills/` directory (create directory if needed):

1. **forbidden-patterns.md** — What NOT to do
   Source: documentation/EFFECT_PATTERNS.md "Critical Rules" sections
   Content: Native Array/String/Date/Switch patterns and their Effect replacements

2. **effect-imports.md** — Standard import conventions
   Source: documentation/EFFECT_PATTERNS.md "Import Conventions" section
   Content: Namespace imports, single-letter aliases, uppercase constructors

3. **datetime-patterns.md** — DateTime usage
   Source: documentation/EFFECT_PATTERNS.md "NEVER Use Native Date" section
   Content: Creation, arithmetic, comparison, formatting, timezones

4. **match-patterns.md** — Pattern matching
   Source: documentation/EFFECT_PATTERNS.md "NEVER Use Switch Statements" section
   Content: Match.value, Match.tag, Match.exhaustive, Predicate guards

5. **collection-patterns.md** — Collections
   Source: documentation/EFFECT_PATTERNS.md "Use Effect Collections" section
   Content: HashMap, HashSet, Array/Record/Struct utilities

FOR EACH SKILL:
1. Read source section from documentation/EFFECT_PATTERNS.md
2. Create file in .claude/skills/ (create directory first: mkdir -p .claude/skills)
3. Format as:
   ```markdown
   # SKILL_NAME

   ## When to Use
   [Trigger conditions]

   ## Forbidden
   [Code showing what NOT to do]

   ## Required
   [Code showing correct approach]

   ## Examples
   [Practical usage]
   ```
4. Keep each skill <150 lines

OUTPUT: List all 5 skills created with paths and line counts.
```

---

### Task 2: Fix Phase A Pattern Violations

Launch AFTER Task 1 completes.

**Scope:** `packages/documents/server/`, `packages/shared/server/`
**Estimated violations:** ~80

**Sub-agent prompt:**
```
You are responsible for fixing Effect pattern violations in Phase A packages.

SCOPE: Only these directories:
- packages/documents/server/src/
- packages/shared/server/src/

DETECTION: First run these to identify violations:
1. grep -rn "\.map(" packages/documents/server packages/shared/server --include="*.ts" | grep -v "A\.map\|Arr\.map\|HashMap\.map"
2. grep -rn "new Date(" packages/documents/server packages/shared/server --include="*.ts"
3. grep -rn "switch\s*(" packages/documents/server packages/shared/server --include="*.ts"
4. grep -rn "\.split(\|\.trim(\|\.toLowerCase(" packages/documents/server packages/shared/server --include="*.ts" | grep -v "Str\."

CRITICAL RULES:
1. Check existing imports FIRST — use same alias style (Arr vs A, F vs Function)
2. For switches >50 lines: Extract handler functions, then use Match.tag
3. Type Match.tag handlers as: `(state: UnionType & { readonly _tag: 'Case' })`
4. Skip infrastructure adapters that legitimately need native methods (e.g., pg driver internals)
5. Run `bun run check --filter=@beep/documents-server --filter=@beep/shared-server` after batch of fixes

FIX PRIORITY:
1. Native .map() calls (most common)
2. Native Date usage
3. Switch statements
4. Native string methods

FOR EACH FILE:
1. Read 50 lines around violation
2. Check imports
3. Add missing imports with correct alias
4. Apply fix
5. Move to next violation in same file before switching files

OUTPUT: Summary of files modified, violations fixed per type, any skipped violations with reason.
```

---

### Task 3: Add @example JSDoc

Launch in PARALLEL with Task 2.

**Sub-agent prompt:**
```
You are responsible for adding @example JSDoc blocks to critical infrastructure files.

FILES TO UPDATE:

1. **packages/runtime/server/src/DataAccess.layer.ts**
   - Find the main Layer export
   - Add @example showing layer composition pattern
   - Example should demonstrate how to provide this layer to a program

2. **packages/runtime/server/src/Persistence.layer.ts**
   - Find the main service/layer export
   - Add @example showing service wiring
   - Example should show dependency injection pattern

3. **packages/shared/domain/src/Policy.ts**
   - Find Policy.all (around line 139)
   - Find Policy.any (around line 155)
   - Find Policy.check (around line 170)
   - Add @example to each showing combinator usage

EXAMPLE FORMAT:
```typescript
/**
 * Combines multiple policies, requiring ALL to pass.
 *
 * @example
 * ```typescript
 * import { Policy } from "@beep/shared-domain";
 *
 * const canEditDocument = Policy.all(
 *   Policy.permission("documents:edit"),
 *   Policy.ownerOf(document),
 *   Policy.notArchived(document)
 * );
 *
 * // Usage in Effect
 * yield* Policy.check(canEditDocument, context);
 * ```
 */
```

FOR EACH FILE:
1. Read the file to understand existing documentation style
2. Identify exports that need @example
3. Add practical, runnable examples
4. Ensure examples match actual function signatures

OUTPUT: List files updated with functions that received @example blocks.
```

---

## Execution Protocol

### Step 1: Launch Task 1 (Skills)

Send a SINGLE message with ONE Task tool call for skills creation.
Use `run_in_background: true`.

### Step 2: Wait for Task 1 Completion

Use `TaskOutput` with `block: true` to wait for skills.

### Step 3: Launch Tasks 2 & 3 in Parallel

Send a SINGLE message with TWO Task tool calls:
- Task 2: Pattern violations
- Task 3: JSDoc @example

Both with `run_in_background: true`.

### Step 4: Collect Results

When both complete, use `TaskOutput` to get final outputs.

### Step 5: Verify and Report

Run verification commands:
```bash
ls -la .claude/skills/
grep -rn "\.map(" packages/documents/server packages/shared/server --include="*.ts" | grep -v "A\.map\|Arr\.map" | wc -l
bun run check
```

Create summary showing:
- Skills created
- Violations fixed
- @examples added
- Any issues encountered

---

## Verification Commands

```bash
# Skills created
ls -la .claude/skills/
wc -l .claude/skills/*.md

# Pattern violations remaining (Phase A)
grep -rn "\.map(" packages/documents/server packages/shared/server --include="*.ts" | grep -v "A\.map\|Arr\.map" | wc -l

# Type check
bun run check --filter=@beep/documents-server --filter=@beep/shared-server

# Full build
bun run build
```

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Claude Skills in .claude/skills/ | 5 files |
| Phase A violations remaining | <10 |
| @example blocks added | 5+ functions |
| Type check | Passes |
| Estimated score improvement | 3.4 → 3.7/5 |

---

## Handoff Location

Full context and lessons learned: `specs/ai-friendliness-audit/HANDOFF_P2.md`

---

## Begin Orchestration

Read the handoff document first, then launch Task 1 (Skills creation).
