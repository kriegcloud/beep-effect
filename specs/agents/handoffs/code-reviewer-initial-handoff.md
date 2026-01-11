# Code Reviewer Agent — Initial Handoff

> **Priority**: Tier 3 (Quality)
> **Spec Location**: `specs/agents/code-reviewer/README.md`
> **Target Output**: `.claude/agents/code-reviewer.md` (400-500 lines)

---

## Mission

Create the **code-reviewer** agent — a quality enforcement specialist that reviews code against repository guidelines, Effect patterns, and architectural constraints. Generates actionable review reports with specific fix suggestions.

---

## Critical Constraints

1. **NEVER use `async/await`** — All examples must use `Effect.gen`
2. **NEVER use native array/string methods** — Use `A.map`, `Str.split`, etc.
3. **NEVER use named imports from Effect** — Use `import * as Effect from "effect/Effect"`
4. **Agent definition must be 400-500 lines**
5. **All reviews must include file:line references**
6. **All issues must include before/after fix examples**

---

## Phase 1: Research (Read-Only)

### Task 1.1: Compile Complete Rules List

**Read and extract rules from**:
- `/home/elpresidank/YeeBois/projects/beep-effect/CLAUDE.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/rules/effect-patterns.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/rules/general.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/rules/behavioral.md`

**Create a consolidated rules checklist**:

```markdown
## Effect Pattern Rules (HIGH)
- [ ] Namespace imports only
- [ ] Correct aliases (S, A, O, etc.)
- [ ] No async/await
- [ ] No native array/string methods
- [ ] PascalCase Schema constructors

## Architecture Rules (HIGH)
- [ ] No cross-slice imports
- [ ] Layer order respected
- [ ] @beep/* path aliases only
- [ ] No ../../../ relative paths

## Type Safety Rules (MEDIUM)
- [ ] No `any` type
- [ ] No @ts-ignore
- [ ] No unchecked casts

## Documentation Rules (LOW)
- [ ] JSDoc on public exports
- [ ] @example blocks
- [ ] @category and @since tags
```

### Task 1.2: Study Effect Pattern Details

**Read**:
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/EFFECT_PATTERNS.md`

**Extract**:
- Complete alias table
- Forbidden patterns with examples
- Required patterns with examples

### Task 1.3: Understand Architecture Boundaries

**Read**:
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/PACKAGE_STRUCTURE.md`

**Map**:
- Vertical slices and their packages
- Layer dependency chain
- Shared/common package access rules

### Task 1.4: Sample Existing Code for Anti-Patterns

**Run Grep searches**:
```
# Find potential async/await violations
grep -r "async \|await " packages/

# Find potential any usage
grep -r ": any\|as any" packages/

# Find potential native method usage
grep -r "\.map(\|\.filter(\|\.split(" packages/
```

### Output: `specs/agents/code-reviewer/outputs/research-findings.md`

```markdown
# Code Reviewer Research Findings

## Complete Rules Checklist
[Consolidated from all sources]

## Effect Pattern Reference
[Aliases, forbidden, required]

## Architecture Boundary Map
[Slices, layers, allowed imports]

## Common Violations Found
[Anti-patterns discovered in codebase]

## Review Category Weights
| Category | Severity | Examples |
|----------|----------|----------|
```

---

## Phase 2: Design

### Task 2.1: Design Review Methodology

1. **Scope Definition**
   - Single file vs package-wide
   - Review focus (all rules vs specific category)

2. **Static Analysis**
   - Grep patterns for common violations
   - Import graph analysis
   - Type checking integration

3. **Issue Classification**
   - Severity (HIGH/MEDIUM/LOW)
   - Category (Effect/Architecture/Types/Docs)
   - Auto-fixable vs manual review

4. **Fix Generation**
   - Before/after code examples
   - File:line references
   - Explanation of why it's wrong

### Task 2.2: Define Output Format

```markdown
# Code Review: [File/Package Name]

## Summary
| Category | Issues | Severity |
|----------|--------|----------|
| Effect Patterns | N | HIGH |
| Architecture | N | HIGH |
| Type Safety | N | MEDIUM |
| Documentation | N | LOW |

**Overall Status**: PASS / NEEDS_WORK / CRITICAL

## Issues

### Issue 1: [Title]
**Severity**: HIGH
**Category**: Effect Patterns
**Location**: `src/services/UserService.ts:42`

**Problem**:
```typescript
// Current code
const users = await userRepo.findAll()
```

**Why it's wrong**: Uses async/await instead of Effect.gen pattern.

**Fix**:
```typescript
// Corrected code
const users = yield* userRepo.findAll()
```

### Issue 2: [Title]
...

## Recommendations
[Overall improvement suggestions]

## Auto-Fix Script
[If applicable, bash/script to fix simple issues]
```

### Task 2.3: Create Severity Guidelines

```markdown
## Severity Definitions

### HIGH — Must Fix
- Effect pattern violations (wrong imports, async/await)
- Cross-slice import violations
- Type safety issues (any, ts-ignore)

### MEDIUM — Should Fix
- Native method usage
- Missing error handling
- Suboptimal patterns

### LOW — Nice to Have
- Missing documentation
- Style inconsistencies
- Minor optimizations
```

### Output: `specs/agents/code-reviewer/outputs/agent-design.md`

---

## Phase 3: Create

### Task 3.1: Write Agent Definition

Create `.claude/agents/code-reviewer.md`:

```markdown
---
description: Code review agent for enforcing repository guidelines and Effect patterns
tools: [Read, Grep, Glob]
---

# Code Reviewer Agent

[Purpose statement]

## Review Categories

### Effect Patterns (HIGH)
[Rules and detection patterns]

### Architecture (HIGH)
[Boundary rules and detection]

### Type Safety (MEDIUM)
[Type rules and detection]

### Documentation (LOW)
[Doc rules and detection]

## Methodology

### Step 1: Scope the Review
[How to bound the review]

### Step 2: Run Detection Patterns
[Grep patterns for violations]

### Step 3: Classify Issues
[Severity and category assignment]

### Step 4: Generate Fixes
[Before/after examples]

## Detection Patterns

### Effect Import Violations
```
grep -E "import \{ .* \} from ['\"]effect"
```

### Async/Await Usage
```
grep -E "async |await "
```

### Native Method Usage
```
grep -E "\.(map|filter|reduce|split|join)\("
```

## Output Format
[Structure with examples]

## Examples
[Sample review and output]
```

### Task 3.2: Include Complete Grep Pattern Library

```markdown
## Grep Detection Patterns

### Effect Patterns
| Violation | Pattern |
|-----------|---------|
| Named imports | `import \{ .* \} from ['\"]effect` |
| async/await | `async \|await ` |
| Native methods | `\.(map\|filter\|reduce)\(` |
| Lowercase Schema | `S\.struct\|S\.array` |

### Architecture
| Violation | Pattern |
|-----------|---------|
| Cross-slice | `from "@beep/(iam\|documents)` in wrong slice |
| Relative paths | `from ["']\.\.\/\.\.\/` |

### Types
| Violation | Pattern |
|-----------|---------|
| any type | `: any\|as any` |
| ts-ignore | `@ts-ignore\|@ts-expect-error` |
```

---

## Phase 4: Validate

### Verification Commands

```bash
# Check file exists and length
ls -lh .claude/agents/code-reviewer.md
wc -l .claude/agents/code-reviewer.md

# Verify no async/await in agent itself
grep -i "async\|await" .claude/agents/code-reviewer.md && echo "FAIL" || echo "PASS"

# Verify references to rules files
grep -E "CLAUDE.md|effect-patterns|general.md" .claude/agents/code-reviewer.md

# Verify grep pattern library
grep -c "grep" .claude/agents/code-reviewer.md
```

### Success Criteria

- [ ] Agent definition at `.claude/agents/code-reviewer.md`
- [ ] Length is 400-500 lines
- [ ] Covers all rule categories
- [ ] Includes grep detection patterns
- [ ] Includes severity guidelines
- [ ] Output format has file:line references
- [ ] Tested with sample code review

---

## Ready-to-Use Orchestrator Prompt

```
You are executing the code-reviewer agent creation spec.

Your goal: Create `.claude/agents/code-reviewer.md` (400-500 lines) — a code review agent for enforcing repository guidelines.

CRITICAL RULES:
1. All examples MUST use Effect patterns (no async/await)
2. Include file:line references for all issues
3. Include before/after fix examples

PHASE 1 - Research:
1. Read CLAUDE.md, .claude/rules/*.md — extract all rules
2. Read documentation/EFFECT_PATTERNS.md — Effect specifics
3. Read documentation/PACKAGE_STRUCTURE.md — architecture
4. Run grep patterns to find common violations in codebase
5. Output to specs/agents/code-reviewer/outputs/research-findings.md

PHASE 2 - Design:
1. Create consolidated rules checklist
2. Design review methodology
3. Create grep pattern library
4. Define severity guidelines
5. Output to specs/agents/code-reviewer/outputs/agent-design.md

PHASE 3 - Create:
1. Write .claude/agents/code-reviewer.md
2. Include detection patterns
3. Include severity guidelines
4. Test with sample file review

PHASE 4 - Validate:
1. Run verification commands
2. Update REFLECTION_LOG.md

Begin with Phase 1.
```
