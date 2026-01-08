# Pattern Compliance Remediation: Discovery & Planning Session

## Context

You are working in the `beep-effect` monorepo, an Effect-first TypeScript codebase with strict coding standards. The codebase has documented forbidden patterns in:

- `/AGENTS.md` - Root agent instructions
- `/documentation/EFFECT_PATTERNS.md` - Comprehensive pattern rules
- `/.claude/skills/forbidden-patterns.md` - Quick reference

A prior audit identified ~317 pattern violations. Your task is to produce an **exhaustive, line-accurate inventory** of all violations and create orchestration documentation for remediation.

## Your Deliverables

Create two files in `/specs/pattern-remediation/`:

1. **`PLAN.md`** - Checklist of every violation with file:line references
2. **`ORCHESTRATION_PROMPT.md`** - Instructions for executing the remediation

---

## Phase 1: Discovery

### Violation Categories to Search

Search the following directories for violations:
- `packages/*/src/**/*.ts`
- `apps/*/src/**/*.ts`

**Exclude** from analysis:
- `node_modules/`
- `*.test.ts` files (lower priority, note but don't prioritize)
- `*.d.ts` files
- Generated files

### 1.1 CRITICAL Violations

#### Native Array Methods

```bash
# Find .map() not preceded by A.map or pipe
grep -rn "\.map(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "A\.map" | grep -v "node_modules"

# Find .filter()
grep -rn "\.filter(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "A\.filter" | grep -v "node_modules"

# Find .forEach()
grep -rn "\.forEach(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "A\.forEach" | grep -v "node_modules"

# Find .find()
grep -rn "\.find(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "A\.findFirst" | grep -v "node_modules"

# Find .reduce()
grep -rn "\.reduce(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "A\.reduce" | grep -v "node_modules"

# Find .some() / .every()
grep -rn "\.some(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "A\.some" | grep -v "node_modules"
grep -rn "\.every(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "A\.every" | grep -v "node_modules"

# Find Array.from()
grep -rn "Array\.from(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "node_modules"
```

#### Native String Methods

```bash
# Find native string methods
grep -rn "\.split(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "Str\.split" | grep -v "node_modules"
grep -rn "\.trim(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "Str\.trim" | grep -v "node_modules"
grep -rn "\.toLowerCase(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "Str\.toLowerCase" | grep -v "node_modules"
grep -rn "\.toUpperCase(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "Str\.toUpperCase" | grep -v "node_modules"
grep -rn "\.startsWith(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "Str\.startsWith" | grep -v "node_modules"
grep -rn "\.endsWith(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "Str\.endsWith" | grep -v "node_modules"
grep -rn "\.includes(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "Str\.includes" | grep -v "node_modules"
```

### 1.2 HIGH Violations

#### Native Date Usage

```bash
grep -rn "new Date(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "node_modules"
grep -rn "Date\.now(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "node_modules"
```

#### Switch Statements

```bash
grep -rn "switch\s*(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "node_modules"
```

#### Bare typeof/instanceof

```bash
grep -rn "typeof.*===" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "node_modules"
grep -rn "instanceof" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "node_modules"
```

### 1.3 MEDIUM Violations

#### Object.keys/values/entries

```bash
grep -rn "Object\.keys(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "node_modules"
grep -rn "Object\.values(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "node_modules"
grep -rn "Object\.entries(" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "node_modules"
```

#### Inline No-ops

```bash
grep -rn "() => null" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "node_modules"
grep -rn "() => {}" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "node_modules"
```

### 1.4 Type Safety Violations

```bash
grep -rn ": any" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "node_modules" | grep -v "\.d\.ts"
grep -rn "as any" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "node_modules"
grep -rn "@ts-ignore" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "node_modules"
grep -rn "@ts-expect-error" packages/*/src/**/*.ts apps/*/src/**/*.ts 2>/dev/null | grep -v "node_modules"
```

---

## Phase 1.5: Determine Package Processing Order

Use the `topo-sort` CLI command to determine the optimal order for processing packages:

```bash
bun run beep topo-sort
```

### What topo-sort Does

The command outputs all `@beep/*` packages in **topological order**, with packages that have **fewer dependencies listed first** (leaf packages). This uses Kahn's algorithm to ensure:

1. Dependencies are always processed before their dependents
2. Circular dependencies are detected and reported
3. Output is deterministic (alphabetically sorted within each tier)

### Example Output

```
Analyzing workspace dependencies...

Found 45 packages in topological order:

@beep/types
@beep/invariant
@beep/identity
@beep/utils
@beep/schema
@beep/contract
@beep/shared-domain
@beep/iam-domain
...
@beep/runtime-server
@beep/web
```

### Pattern Remediation vs Structure Refactoring

**Pattern remediation is more flexible than structure refactoring:**

- **Pattern fixes** (`.map()` → `A.map()`) are internal code changes
- They don't change exports, file names, or import paths
- Each package can be fixed and validated independently
- Order matters less - any order works

**Structure refactoring** (renaming files/directories) requires reverse topological order because renamed exports break consumers.

### Recommended Order for Pattern Remediation

For consistency with structure-standardization and to establish patterns early:

**Process from BOTTOM to TOP of topo-sort (reverse order):**

1. **Consumer packages first** (e.g., `@beep/web`)
   - Can reference correct patterns in provider packages
   - Validation passes immediately after fixes
   - No risk since internal changes don't affect exports

2. **Provider packages later** (e.g., `@beep/types`)
   - By the time you reach them, you've established muscle memory
   - Consistent approach across both specs

### Integrating with PLAN.md

When generating PLAN.md, **use reverse topo-sort order** (same as structure-standardization):

```markdown
## Execution Order (Reverse Topological)

Process packages in this order (consumers first):

1. @beep/web (many deps) - 8 violations
2. @beep/runtime-server - 5 violations
3. @beep/iam-ui - 12 violations
...
N. @beep/types (0 deps) - 3 violations
```

This maintains consistency with structure-standardization and allows each package to pass validation immediately after fixes.

---

## Phase 2: Create PLAN.md

### Required Structure

The PLAN.md file must follow this structure:

```
# Pattern Compliance Remediation Plan

> Generated: [DATE]
> Total Violations: [COUNT]
> Estimated Effort: [X packages, Y files]

## Summary by Category

| Category | Count | Severity | Effort |
|----------|-------|----------|--------|
| Native Array Methods | X | CRITICAL | High |
| Native String Methods | X | CRITICAL | Medium |
| Native Date | X | HIGH | Low |
| Switch Statements | X | HIGH | Medium |
| Type Safety | X | CRITICAL | Variable |
| Object Methods | X | MEDIUM | Low |
| Inline No-ops | X | MEDIUM | Low |

## Summary by Package

| Package | Violations | Priority |
|---------|------------|----------|
| @beep/shared-server | X | P1 |
| @beep/documents-server | X | P1 |
| ... | ... | ... |

---

## Violations by Package

### @beep/[package-name]

#### Required Import Additions

Add these imports if not present:
- import * as A from "effect/Array"
- import * as F from "effect/Function"
- import * as Str from "effect/String"
- etc.

#### Native Array Methods (X violations)

- [ ] `packages/[path]/src/[file].ts:123` - `.map()` → `A.map`
  - Current: `items.map((x) => x.id)`
  - Fix: `F.pipe(items, A.map((x) => x.id))`

- [ ] `packages/[path]/src/[file].ts:456` - `.filter()` → `A.filter`
  - Current: `items.filter((x) => x.active)`
  - Fix: `F.pipe(items, A.filter((x) => x.active))`

#### Switch Statements (X violations)

- [ ] `packages/[path]/src/[file].ts:789` - `switch` → `Match.value`
  - Current: `switch (status) { ... }`
  - Fix: `Match.value(status).pipe(Match.when(...), Match.exhaustive)`

[Continue for all packages and all violation types...]
```

### PLAN.md Requirements

1. **Every violation must have a checkbox** `- [ ]`
2. **Every violation must include exact file:line** format
3. **Every violation must show current code snippet** (1-3 lines)
4. **Every violation must show the required fix pattern**
5. **Group by package, then by violation category**
6. **Order packages by violation count (most violations first)**
7. **Include import additions needed at top of each package section**

---

## Phase 3: Create ORCHESTRATION_PROMPT.md

See the companion file `ORCHESTRATION_TEMPLATE.md` for the required structure of the orchestration prompt.

---

## Execution Instructions

1. **Create directory**: `mkdir -p specs/pattern-remediation`
2. **Run all grep commands** in Phase 1 - capture output
3. **Parse results** - extract file:line:content for each violation
4. **Deduplicate** - some patterns may match multiple rules
5. **Verify each violation** - read the actual line to confirm it's a real violation (not a false positive)
6. **Generate PLAN.md** following the structure above
7. **Generate ORCHESTRATION_PROMPT.md** following the template
8. **Report summary** to user with total counts

## False Positive Handling

Some grep matches are NOT violations:
- `.map()` on a `HashMap` is correct (it's Effect's HashMap)
- `.filter()` in a comment or string literal
- `new Date()` when interfacing with external APIs that require native Date
- `typeof` in type guard functions that return `P.Refinement`
- String methods on template literal results for logging

Read the actual code context before including in PLAN.md. When uncertain, include it but add a `[VERIFY]` tag.

## Output

When complete, report:
1. Total violations found (categorized)
2. Packages ordered by violation count
3. Estimated remediation effort
4. Any ambiguous cases requiring human review
