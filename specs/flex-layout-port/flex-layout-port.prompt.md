---
name: flex-layout-port-review
version: 2
created: 2026-01-10T14:30:00Z
updated: 2026-01-10T15:45:00Z
iterations: 1
role: orchestrator
---

# FlexLayout Port Review & Quality Audit - Orchestration Prompt

## Context

You are an **orchestration agent** coordinating a comprehensive review of the `flexlayout-react` library port to Effect-first patterns in the `beep-effect` monorepo. Your role is to **deploy sub-agents**, **collect reports**, and **synthesize findings**—NOT to implement fixes yourself.

### Current State

- **Original Source**: `/home/elpresidank/YeeBois/projects/beep-effect/tmp/FlexLayout/src/` (PascalCase naming)
- **Port Target**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/ui/ui/src/flex-layout/` (kebab-case naming)
- **Port Status**: Near completion but contains unsafe types, type assertions, non-exhaustive matches, native Map usage, and Option anti-patterns

### Repository Standards

The beep-effect repository enforces strict Effect-first patterns documented in:
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/rules/effect-patterns.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/EFFECT_PATTERNS.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/CLAUDE.md`

---

## Objective

Execute a **two-phase review** of the FlexLayout port:

### Phase 1: Port Progress Review
Identify features and capabilities from the original library that have not yet been ported or are incomplete.

### Phase 2: Code Quality Audit
Identify repository pattern violations, unsafe types, type assertions, and anti-patterns in the current port.

---

## Role

You are a **meta-orchestrator** with expertise in:
- Multi-agent coordination and context preservation
- Effect-TS ecosystem patterns and conventions
- Code review and static analysis coordination
- Report synthesis and aggregation

**You must NOT directly read, analyze, or fix code.** Deploy sub-agents for all heavy exploration.

---

## Constraints

### Context Preservation Strategies (CRITICAL)

To preserve your context window across this multi-phase operation:

1. **NEVER directly read large files** - deploy sub-agents for all file analysis
2. **Use file-based communication** - sub-agents write markdown reports, you read summaries
3. **Track progress via TodoWrite** - maintain phase/task state externally
4. **Deploy sub-agents in parallel** when tasks are independent
5. **Use incremental synthesis** - aggregate reports progressively, not all at once

### Forbidden Patterns

- NEVER use native `Map`, `Set`, `Array` methods - must use Effect collections (`HashMap`, `MutableHashMap`, `HashSet`, MutableHashSet``, `A.*`)
- NEVER use native string methods - must use `Str.*` from `effect/String`
- NEVER use type assertions (`as`, `as unknown as`) - must use proper type guards or Effect Schema
- NEVER use `O.getOrElse(() => undefined)` - defeats the purpose of Option, use `O.getOrUndefined` instead
- NEVER use `switch` statements - must use `Match.value` from `effect/Match`
- NEVER use `any` or `@ts-ignore`

### Required Patterns

- Namespace imports: `import * as Effect from "effect/Effect"`
- Single-letter aliases: `import * as A from "effect/Array"`, `import * as O from "effect/Option"`
- PascalCase constructors: `S.Struct`, `S.Array`, `S.String` (never lowercase)
- Effect collections: `HashMap`, `HashSet` or `MutableHashMap`, `MutableHashSet` instead of native Map/Set
- Match expressions: `Match.value(x).pipe(Match.tag(...), Match.exhaustive)`

---

## Phase 1: Port Progress Review

### Objective

Compare the original FlexLayout source files against the port to identify:
- Features present in the original but missing in the port
- Incomplete implementations (partial methods, missing logic)
- Behavioral differences between original and port

### File Mapping

#### Core Files (Model & Data Layer)

| Original (PascalCase)                        | Port (kebab-case)                                         | Priority | Status   |
|----------------------------------------------|-----------------------------------------------------------|----------|----------|
| `tmp/FlexLayout/src/Attribute.ts`            | `packages/ui/ui/src/flex-layout/attribute.ts`             | High     | Partial  |
| `tmp/FlexLayout/src/AttributeDefinitions.ts` | `packages/ui/ui/src/flex-layout/attribute-definitions.ts` | High     | Partial  |
| `tmp/FlexLayout/src/DockLocation.ts`         | `packages/ui/ui/src/flex-layout/dock-location.ts`         | High     | Partial  |
| `tmp/FlexLayout/src/DropInfo.ts`             | `packages/ui/ui/src/flex-layout/drop-info.ts`             | Medium   | Partial  |
| `tmp/FlexLayout/src/I18nLabel.ts`            | `packages/ui/ui/src/flex-layout/i18n-label.ts`            | Low      | Complete |
| `tmp/FlexLayout/src/Orientation.ts`          | `packages/ui/ui/src/flex-layout/orientation.ts`           | Low      | Complete |
| `tmp/FlexLayout/src/Rect.ts`                 | `packages/ui/ui/src/flex-layout/rect.ts`                  | Medium   | Complete |
| `tmp/FlexLayout/src/Types.ts`                | `packages/ui/ui/src/flex-layout/types.ts`                 | Low      | Complete |
| `tmp/FlexLayout/src/index.ts`                | `packages/ui/ui/src/flex-layout/index.ts`                 | Low      | Partial  |

#### Model Files

| Original (PascalCase)                      | Port (kebab-case)                                          | Priority | Status   |
|--------------------------------------------|------------------------------------------------------------|----------|----------|
| `tmp/FlexLayout/src/model/Action.ts`       | `packages/ui/ui/src/flex-layout/model/action.model.ts`     | Medium   | Complete |
| `tmp/FlexLayout/src/model/Actions.ts`      | `packages/ui/ui/src/flex-layout/model/actions.model.ts`    | High     | Partial  |
| `tmp/FlexLayout/src/model/BorderNode.ts`   | `packages/ui/ui/src/flex-layout/model/border-node.ts`      | High     | Partial  |
| `tmp/FlexLayout/src/model/BorderSet.ts`    | `packages/ui/ui/src/flex-layout/model/border-set.ts`       | High     | Partial  |
| `tmp/FlexLayout/src/model/Model.ts`        | `packages/ui/ui/src/flex-layout/model/model.ts`            | Critical | Partial  |
| `tmp/FlexLayout/src/model/Node.ts`         | `packages/ui/ui/src/flex-layout/model/node.ts`             | Critical | Partial  |
| `tmp/FlexLayout/src/model/RowNode.ts`      | `packages/ui/ui/src/flex-layout/model/row-node.ts`         | High     | Partial  |
| `tmp/FlexLayout/src/model/TabNode.ts`      | `packages/ui/ui/src/flex-layout/model/tab-node.ts`         | High     | Partial  |
| `tmp/FlexLayout/src/model/TabSetNode.ts`   | `packages/ui/ui/src/flex-layout/model/tab-set-node.ts`     | High     | Partial  |
| `tmp/FlexLayout/src/model/Utils.ts`        | `packages/ui/ui/src/flex-layout/model/utils.ts`            | Low      | Partial  |
| `tmp/FlexLayout/src/model/ICloseType.ts`   | `packages/ui/ui/src/flex-layout/model/close-type.model.ts` | Low      | Complete |
| `tmp/FlexLayout/src/model/IJsonModel.ts`   | `packages/ui/ui/src/flex-layout/model/json.model.ts`       | Medium   | Complete |
| `tmp/FlexLayout/src/model/IDraggable.ts`   | `packages/ui/ui/src/flex-layout/model/draggable.ts`        | Medium   | Partial  |
| `tmp/FlexLayout/src/model/IDropTarget.ts`  | `packages/ui/ui/src/flex-layout/model/drop-target.ts`      | Medium   | Partial  |
| `tmp/FlexLayout/src/model/LayoutWindow.ts` | `packages/ui/ui/src/flex-layout/model/layout-window.ts`    | Medium   | Partial  |

#### View Files (React Components - Deprioritized for Phase 1)

| Original (PascalCase)                         | Port (kebab-case)                                           | Priority | Status  |
|-----------------------------------------------|-------------------------------------------------------------|----------|---------|
| `tmp/FlexLayout/src/view/BorderButton.tsx`    | `packages/ui/ui/src/flex-layout/view/border-button.tsx`     | Low      | Partial |
| `tmp/FlexLayout/src/view/BorderTab.tsx`       | `packages/ui/ui/src/flex-layout/view/border-tab.tsx`        | Low      | Partial |
| `tmp/FlexLayout/src/view/BorderTabSet.tsx`    | `packages/ui/ui/src/flex-layout/view/border-tab-set.tsx`    | Low      | Partial |
| `tmp/FlexLayout/src/view/DragContainer.tsx`   | `packages/ui/ui/src/flex-layout/view/drag-container.tsx`    | Low      | Partial |
| `tmp/FlexLayout/src/view/ErrorBoundary.tsx`   | `packages/ui/ui/src/flex-layout/view/error-boundary.tsx`    | Low      | Partial |
| `tmp/FlexLayout/src/view/Icons.tsx`           | `packages/ui/ui/src/flex-layout/view/icons.tsx`             | Low      | Partial |
| `tmp/FlexLayout/src/view/Layout.tsx`          | `packages/ui/ui/src/flex-layout/view/layout.tsx`            | Medium   | Partial |
| `tmp/FlexLayout/src/view/Overlay.tsx`         | `packages/ui/ui/src/flex-layout/view/overlay.tsx`           | Low      | Partial |
| `tmp/FlexLayout/src/view/PopoutWindow.tsx`    | `packages/ui/ui/src/flex-layout/view/popout-window.tsx`     | Low      | Partial |
| `tmp/FlexLayout/src/view/PopupMenu.tsx`       | `packages/ui/ui/src/flex-layout/view/popup-menu.tsx`        | Low      | Partial |
| `tmp/FlexLayout/src/view/Row.tsx`             | `packages/ui/ui/src/flex-layout/view/row.tsx`               | Low      | Partial |
| `tmp/FlexLayout/src/view/SizeTracker.tsx`     | `packages/ui/ui/src/flex-layout/view/size-tracker.tsx`      | Low      | Partial |
| `tmp/FlexLayout/src/view/Splitter.tsx`        | `packages/ui/ui/src/flex-layout/view/splitter.tsx`          | Low      | Partial |
| `tmp/FlexLayout/src/view/Tab.tsx`             | `packages/ui/ui/src/flex-layout/view/tab.tsx`               | Low      | Partial |
| `tmp/FlexLayout/src/view/TabButton.tsx`       | `packages/ui/ui/src/flex-layout/view/tab-button.tsx`        | Low      | Partial |
| `tmp/FlexLayout/src/view/TabButtonStamp.tsx`  | `packages/ui/ui/src/flex-layout/view/tab-button-stamp.tsx`  | Low      | Partial |
| `tmp/FlexLayout/src/view/TabOverflowHook.tsx` | `packages/ui/ui/src/flex-layout/view/tab-overflow-hook.tsx` | Low      | Partial |
| `tmp/FlexLayout/src/view/TabSet.tsx`          | `packages/ui/ui/src/flex-layout/view/tab-set.tsx`           | Medium   | Partial |
| `tmp/FlexLayout/src/view/Utils.tsx`           | `packages/ui/ui/src/flex-layout/view/utils.tsx`             | Low      | Partial |

**Note**: View files (React components) are deprioritized in Phase 1 because the focus is on model/data layer completeness. View files still undergo Phase 2 code quality audits, but Phase 1 feature completeness analysis can be deferred if time is limited.

### Sub-Agent Deployment Strategy

Deploy **parallel sub-agents** (5-8 concurrent) grouped by file priority:

#### Batch 1: Critical Model Files (Deploy First)
Create sub-agents for:
- `model/Model.ts` comparison
- `model/Node.ts` comparison

#### Batch 2: High Priority Core Files (Deploy in Parallel)
Create sub-agents for:
- `model/BorderNode.ts` comparison
- `model/TabNode.ts` comparison
- `model/TabSetNode.ts` comparison
- `model/RowNode.ts` comparison
- `model/Actions.ts` comparison

#### Batch 3: Medium Priority Support Files (Deploy in Parallel)
Create sub-agents for:
- `Attribute.ts` comparison
- `DockLocation.ts` comparison
- `Rect.ts` comparison
- `model/json.model.ts` comparison

#### Batch 4: Low Priority Utility Files (Deploy Last)
Create sub-agents for remaining files

### Sub-Agent Prompt Template

Use this template for each port-progress sub-agent:

```markdown
# Port Progress Analysis: <filename>

## Task
Compare the original FlexLayout source file with its port to identify missing features and incomplete implementations.

## Files to Analyze
- **Original**: /home/elpresidank/YeeBois/projects/beep-effect/tmp/FlexLayout/src/<PascalCaseFilename>
- **Port**: /home/elpresidank/YeeBois/projects/beep-effect/packages/ui/ui/src/flex-layout/<kebab-case-filename>

## Analysis Checklist

For each file pair, document:

1. **Methods/Functions**
   - [ ] List all public methods in the original
   - [ ] Identify which methods are present in the port
   - [ ] Identify which methods are missing from the port
   - [ ] For present methods, verify complete logic porting (not just stubs)

2. **Properties/Fields**
   - [ ] List all class properties/fields in the original
   - [ ] Verify all properties are present in the port
   - [ ] Check for behavioral differences (e.g., mutable vs immutable)

3. **Static Members**
   - [ ] List all static methods/properties in the original
   - [ ] Verify all static members are present in the port

4. **Dependencies & Imports**
   - [ ] Identify external dependencies in the original
   - [ ] Verify dependencies are correctly mapped in the port

5. **Complex Logic**
   - [ ] Identify complex algorithms or calculations
   - [ ] Verify logic is fully ported (not simplified or stubbed)

6. **Edge Cases**
   - [ ] Note any special case handling in the original
   - [ ] Check if edge cases are preserved in the port

## Completion Criteria

Classify file status using these criteria:

- **Complete** (100%): All methods, properties, and logic from original are present and fully implemented in port
- **Partial** (50-99%): Most features ported but some methods missing or incompletely implemented
- **Incomplete** (1-49%): File exists but significant features are missing or stubbed
- **Missing** (0%): Port file doesn't exist or is empty

## Output Format

Create a markdown report at:
`/home/elpresidank/YeeBois/projects/beep-effect/specs/flex-layout-port/port-progress-reports/<kebab-filename>-progress.md`

Structure:
```markdown
# Port Progress: <filename>

## Summary
- **Status**: [Complete / Incomplete / Partial]
- **Completion %**: XX%
- **Critical Issues**: X

## Original File Analysis
- Total public methods: X
- Total properties: X
- Total static members: X
- Lines of code: ~X

## Port File Analysis
- Ported methods: X/X
- Ported properties: X/X
- Ported static members: X/X
- Lines of code: ~X

## Missing Features
### Missing Methods
| Method Name | Signature | Purpose | Priority |
|-------------|-----------|---------|----------|
| `methodName` | `(args) => ReturnType` | Brief description | High/Medium/Low |

### Missing Properties
| Property | Type | Purpose | Priority |
|----------|------|---------|----------|
| `propName` | `Type` | Brief description | High/Medium/Low |

### Incomplete Implementations
| Method/Feature | Issue | Impact |
|----------------|-------|--------|
| `methodName` | Missing logic for X | Description |

## Behavioral Differences
- **Original**: Describe behavior in original
- **Port**: Describe behavior in port
- **Impact**: Assessment of impact

## Recommendations
1. Priority 1 (Critical): Features that must be ported
2. Priority 2 (High): Features that should be ported
3. Priority 3 (Medium): Features that could be ported
4. Priority 4 (Low): Optional features

## Notes
Additional observations or context.
```
```

### Synthesis Sub-Agent

After ALL port-progress sub-agents complete, deploy a **synthesis sub-agent**:

```markdown
# Port Progress Synthesis

## Task
Aggregate all port-progress reports into a single comprehensive document.

## Context Preservation Strategy
To avoid context exhaustion when reading 20+ reports:

1. **Read summaries first**: Use `Read` with `limit: 30` to extract just the Summary section from each report
2. **Aggregate incrementally**: Build statistics table progressively, not all at once
3. **Extract critical findings only**: Focus on "Critical" and "High Priority" issues, defer low priority
4. **Use structured data**: Convert findings to tables/lists immediately to compress context

## Input Files
Read all files in: `/home/elpresidank/YeeBois/projects/beep-effect/specs/flex-layout-port/port-progress-reports/`

## Output
Create: `/home/elpresidank/YeeBois/projects/beep-effect/specs/flex-layout-port/port-progress.md`

## Structure

```markdown
# FlexLayout Port Progress Report

**Generated**: <ISO timestamp>
**Total Files Analyzed**: X

## Executive Summary
- **Overall Completion**: XX%
- **Complete Files**: X
- **Incomplete Files**: X
- **Critical Missing Features**: X
- **High Priority Missing Features**: X

## File-by-File Status

| File | Status | Completion | Critical Issues |
|------|--------|------------|-----------------|
| ... | ... | XX% | X |

## Critical Missing Features (Across All Files)

### 1. <Feature Category>
**Impact**: High/Medium/Low
**Affected Files**: List of files

Description of missing feature and its importance.

**Recommendation**: Specific action to take

## High Priority Missing Features

[Similar structure]

## Medium Priority Missing Features

[Similar structure]

## Low Priority Features

[Similar structure]

## Recommendations

### Immediate Actions (Critical)
1. Port feature X in file Y
2. Complete implementation Z in file W

### Short-term Actions (High Priority)
1. ...

### Long-term Actions (Medium/Low Priority)
1. ...

## Appendix: Detailed Reports
Links to individual file reports in `port-progress-reports/`
```
```

---

## Phase 2: Code Quality Audit

### Objective

Review the **current port code** (not the original) to identify:
- Type assertions and unsafe type casts
- Non-exhaustive pattern matching
- Native Map/Set usage (should use HashMap/HashSet)
- Option anti-patterns (e.g., `O.getOrElse(() => undefined)`)
- Native array/string method usage (should use Effect utilities)
- Switch statements (should use Match)
- Missing type annotations
- Any other repository convention violations

### Sub-Agent Deployment Strategy

Deploy **parallel sub-agents** (4-6 concurrent) focused on specific anti-pattern categories:

#### Category 1: Type Safety Violations
Sub-agent searches for:
- Type assertions: `as`, `as unknown as`, `as any`
- `@ts-ignore`, `@ts-expect-error` comments
- `any` type usage
- Unchecked casts

**Grep Patterns**:
```bash
# Type assertions
grep -n " as " <file>
grep -n " as unknown" <file>
grep -n " as any" <file>

# Suppression comments
grep -n "@ts-ignore" <file>
grep -n "@ts-expect-error" <file>

# Any type
grep -n ": any" <file>
grep -n "<any>" <file>
```

#### Category 2: Native Collection Usage
Sub-agent searches for:
- `new Map`, `Map.prototype.*` usage
- `new Set`, `Set.prototype.*` usage
- Should use `HashMap` and `HashSet` from Effect

**Grep Patterns**:
```bash
# Native Map usage
grep -n "new Map" <file>
grep -n "Map<" <file>
grep -n "\.set(" <file>
grep -n "\.get(" <file>
grep -n "\.has(" <file>

# Native Set usage
grep -n "new Set" <file>
grep -n "Set<" <file>
grep -n "\.add(" <file>
```

#### Category 3: Native Method Usage
Sub-agent searches for:
- Array method calls: `.map()`, `.filter()`, `.reduce()`, `.find()`, `.forEach()`, `.some()`, `.every()`, `.includes()`, `.indexOf()`, etc.
- String method calls: `.split()`, `.trim()`, `.toLowerCase()`, `.slice()`, `.charAt()`, `.includes()`, `.startsWith()`, `.endsWith()`, `.replace()`, etc.
- Object/Record methods: `Object.keys()`, `Object.values()`, `Object.entries()`, etc.
- Should use `A.*`, `Str.*`, `Struct.*`, and `R.*` from Effect

**Grep Patterns**:
```bash
# Native array methods (look for .method( patterns)
grep -n "\.map(" <file>
grep -n "\.filter(" <file>
grep -n "\.reduce(" <file>
grep -n "\.find(" <file>
grep -n "\.forEach(" <file>
grep -n "\.some(" <file>
grep -n "\.every(" <file>
grep -n "\.includes(" <file>
grep -n "\.indexOf(" <file>
grep -n "\.push(" <file>
grep -n "\.pop(" <file>
grep -n "\.shift(" <file>
grep -n "\.unshift(" <file>
grep -n "\.splice(" <file>
grep -n "\.sort(" <file>
grep -n "\.reverse(" <file>
grep -n "\.join(" <file>
grep -n "\.concat(" <file>
grep -n "\.slice(" <file>
grep -n "Array\.from(" <file>
grep -n "Array\.isArray(" <file>

# Native string methods
grep -n "\.split(" <file>
grep -n "\.trim(" <file>
grep -n "\.toLowerCase(" <file>
grep -n "\.toUpperCase(" <file>
grep -n "\.charAt(" <file>
grep -n "\.charCodeAt(" <file>
grep -n "\.substring(" <file>
grep -n "\.substr(" <file>
grep -n "\.startsWith(" <file>
grep -n "\.endsWith(" <file>
grep -n "\.replace(" <file>
grep -n "\.replaceAll(" <file>
grep -n "\.match(" <file>
grep -n "\.search(" <file>
grep -n "\.padStart(" <file>
grep -n "\.padEnd(" <file>

# Native Object/Record methods
grep -n "Object\.keys(" <file>
grep -n "Object\.values(" <file>
grep -n "Object\.entries(" <file>
grep -n "Object\.assign(" <file>
grep -n "Object\.fromEntries(" <file>
```

#### Category 4: Pattern Matching & Control Flow
Sub-agent searches for:
- `switch` statements (should use `Match.value`)
- Long `if-else` chains (should use `Match.when`)
- Non-exhaustive discriminated union handling

**Grep Patterns**:
```bash
# Switch statements
grep -n "switch (" <file>
grep -n "switch(" <file>

# Potential discriminated unions without Match
grep -n "\._tag" <file>
grep -n "\.type ===" <file>
```

#### Category 5: Option Anti-patterns
Sub-agent searches for:
- `O.getOrElse(() => undefined)` (defeats Option purpose, use `O.getOrUndefined`)
- `O.getOrElse(() => null)` (defeats Option purpose, use `O.getOrNull`)
- Unnecessary Option wrapping/unwrapping
- Improper None handling

**Grep Patterns**:
```bash
# Option anti-patterns
grep -n "getOrElse.*undefined" <file>
grep -n "getOrElse.*null" <file>
grep -n "O.getOrElse" <file>  # Review all usages

# Check for proper alternatives
grep -n "O.getOrUndefined" <file>
grep -n "O.getOrNull" <file>
```

#### Category 6: Repository Convention Violations
Sub-agent searches for:
- Missing import namespace patterns (`import * as A from "effect/Array"`)
- Incorrect Schema constructor casing (lowercase instead of PascalCase)
- Missing JSDoc annotations for public APIs
- Missing identity annotations (`$I` pattern)
- Direct imports instead of namespace imports (e.g., `import { map } from "effect/Array"`)
- Missing `"use client"` directives in React components (if needed)

**Grep Patterns**:
```bash
# Check for proper Effect imports (should be namespace imports)
grep -n "^import.*from.*effect" <file>
grep -n "^import \* as" <file>

# Check for direct named imports from Effect (violations)
grep -n "^import {.*} from \"effect" <file>

# Check for lowercase Schema constructors (violations)
grep -n "S\.struct" <file>
grep -n "S\.array" <file>
grep -n "S\.string" <file>
grep -n "S\.number" <file>
grep -n "S\.boolean" <file>
grep -n "S\.literal" <file>
grep -n "S\.union" <file>
grep -n "S\.optional" <file>

# Check for identity pattern usage
grep -n "\$I\`" <file>
grep -n "\$UiId" <file>

# Check for JSDoc comments (should exist for public APIs)
grep -n "/\*\*" <file>

# Check for "use client" directive in .tsx files
grep -n "\"use client\"" <file>
grep -n "'use client'" <file>

# Check for proper annotations on schemas
grep -n "\.annotations\(" <file>
```

### Sub-Agent Prompt Template

Use this template for each code-quality sub-agent:

```markdown
# Code Quality Audit: <category>

## Task
Search the FlexLayout port for violations of the **<category>** pattern.

## Scope
Analyze all files in: `/home/elpresidank/YeeBois/projects/beep-effect/packages/ui/ui/src/flex-layout/`

## Search Patterns

[Specific patterns for this category - see category descriptions above]

## Analysis Method

1. Use Grep tool with appropriate patterns to find violations
2. For each match, read the file to understand context
3. Verify it's a true violation (not a false positive)
4. Document exact location and recommended fix

## Output Format

Create a markdown report at:
`/home/elpresidank/YeeBois/projects/beep-effect/specs/flex-layout-port/port-code-quality/<category>-violations.md`

Structure:
```markdown
# Code Quality: <Category> Violations

**Generated**: <ISO timestamp>
**Files Analyzed**: X
**Violations Found**: X

## Summary
- **Critical Violations**: X (blocking)
- **High Priority Violations**: X (should fix)
- **Medium Priority Violations**: X (nice to fix)

## Violation Checklist

### Critical Violations

#### File: `<relative/path/to/file.ts>`
- [ ] **Line X**: `<code snippet>`
  - **Violation**: <Description of what's wrong>
  - **Why it matters**: <Impact/risk explanation>
  - **Fix**: <Recommended correction>
  - **Pattern**: <Link to .claude/rules or docs if applicable>

- [ ] **Line Y**: ...

#### File: `<another/file.ts>`
...

### High Priority Violations
[Same structure]

### Medium Priority Violations
[Same structure]

## Statistics by File

| File | Critical | High | Medium | Total |
|------|----------|------|--------|-------|
| `file.ts` | X | X | X | X |

## Recommendations

### Immediate Fixes (Critical)
1. Fix X in file Y at line Z
2. ...

### Short-term Fixes (High Priority)
1. ...

### Long-term Improvements (Medium Priority)
1. ...

## Notes
Additional observations about patterns or systemic issues.
```
```

### Synthesis Sub-Agent

After ALL code-quality sub-agents complete, deploy a **synthesis sub-agent**:

```markdown
# Code Quality Synthesis

## Task
Aggregate all code-quality reports into a single comprehensive document.

## Context Preservation Strategy
With 6 category reports to aggregate:

1. **Read violation counts first**: Extract just the Summary section from each report
2. **Build statistics table**: Aggregate counts before reading detailed violations
3. **Prioritize critical violations**: Read full details only for Critical/High priority violations
4. **Identify systemic patterns**: Look for recurring violations across categories to avoid duplication

## Input Files
Read all files in: `/home/elpresidank/YeeBois/projects/beep-effect/specs/flex-layout-port/port-code-quality/`

## Output
Create: `/home/elpresidank/YeeBois/projects/beep-effect/specs/flex-layout-port/code-quality.md`

## Structure

```markdown
# FlexLayout Port Code Quality Report

**Generated**: <ISO timestamp>
**Categories Analyzed**: X
**Total Violations**: X

## Executive Summary

### Overall Health
- **Critical Violations**: X (must fix before merge)
- **High Priority Violations**: X (should fix)
- **Medium Priority Violations**: X (nice to have)

### Violation Breakdown by Category

| Category | Critical | High | Medium | Total |
|----------|----------|------|--------|-------|
| Type Safety | X | X | X | X |
| Native Collections | X | X | X | X |
| Native Methods | X | X | X | X |
| Pattern Matching | X | X | X | X |
| Option Anti-patterns | X | X | X | X |
| Repository Conventions | X | X | X | X |
| **TOTAL** | **X** | **X** | **X** | **X** |

## Critical Issues (MUST FIX)

### 1. <Issue Title>
**Category**: <Category>
**Severity**: Critical
**Affected Files**: X files

**Description**: Explanation of the systemic issue

**Locations**:
- `file.ts:123` - specific violation
- `file.ts:456` - specific violation

**Recommended Fix**: General strategy for fixing this issue

---

## High Priority Issues (SHOULD FIX)

[Similar structure]

## Medium Priority Issues (NICE TO FIX)

[Similar structure]

## Systemic Patterns

Identify recurring patterns across multiple files:

### Pattern 1: <Description>
- **Frequency**: X occurrences across X files
- **Root Cause**: Why this pattern exists
- **Impact**: Technical debt / maintainability concern
- **Solution Strategy**: How to fix systematically

## File-Level Summary

| File | Critical | High | Medium | Total | Status |
|------|----------|------|--------|-------|--------|
| `file.ts` | X | X | X | X | Needs Work / Acceptable |

## Recommendations

### Phase 1: Blocking Issues (Before Merge)
1. Fix all Critical violations in X files
2. Address systemic pattern Y

### Phase 2: Quality Improvements (Post-Merge)
1. Address High priority violations
2. Refactor pattern Z

### Phase 3: Refinement (Future Sprint)
1. Address Medium priority violations
2. Improve code documentation

## Appendix: Detailed Reports
Links to individual category reports in `port-code-quality/`
```
```

---

## Resources

### Repository Documentation
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/rules/effect-patterns.md` - Effect import and pattern rules
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/EFFECT_PATTERNS.md` - Comprehensive Effect patterns guide
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/ui/ui/CLAUDE.md` - UI package specific conventions
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/ui/ui/src/flex-layout/MIGRATION_HANDOFF.md` - Port context and patterns

### Original Library
- `/home/elpresidank/YeeBois/projects/beep-effect/tmp/FlexLayout/src/` - Original TypeScript source

### Port Target
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/ui/ui/src/flex-layout/` - Effect-first port

### Completed Examples (Reference)
- `packages/ui/ui/src/flex-layout/rect.ts` - Good example of S.Class with methods
- `packages/ui/ui/src/flex-layout/model/json.model.ts` - Complex schemas with recursive types
- `packages/ui/ui/src/flex-layout/types.ts` - Constant objects with `as const`

---

## Output Specification

### Directory Structure

```
specs/flex-layout-port/
├── flex-layout-port.original.md          # Original user prompt (DONE)
├── flex-layout-port.prompt.md            # This refined prompt
├── port-progress-reports/                # Phase 1 sub-agent reports
│   ├── attribute-progress.md
│   ├── dock-location-progress.md
│   ├── model-model-progress.md
│   ├── ... (one per file pair)
├── port-code-quality/                    # Phase 2 sub-agent reports
│   ├── type-safety-violations.md
│   ├── native-collections-violations.md
│   ├── native-methods-violations.md
│   ├── pattern-matching-violations.md
│   ├── option-antipatterns-violations.md
│   └── repository-conventions-violations.md
├── port-progress.md                      # Phase 1 synthesis (FINAL)
└── code-quality.md                       # Phase 2 synthesis (FINAL)
```

### Final Deliverables

1. **Phase 1 Complete**: `port-progress.md` exists with comprehensive summary
2. **Phase 2 Complete**: `code-quality.md` exists with comprehensive summary
3. **All Sub-Agent Reports**: Individual reports in respective directories

---

## Execution Workflow

### Pre-Flight Checklist
- [ ] Confirm TodoWrite tool is available for phase tracking
- [ ] Verify access to Grep tool for code search
- [ ] Verify access to Read tool for file analysis
- [ ] Confirm sub-agent spawning capability

### Phase 1 Execution

1. **Initialize Phase 1 in TodoWrite**
   ```
   Phase 1: Port Progress Review
   ├─ Batch 1: Critical Model Files (in_progress)
   ├─ Batch 2: High Priority Files (pending)
   ├─ Batch 3: Medium Priority Files (pending)
   ├─ Batch 4: Low Priority Files (pending)
   └─ Synthesis (pending)
   ```

2. **Deploy Batch 1 Sub-Agents** (Critical files, sequential or small parallel)
   - Wait for completion of critical files before proceeding

3. **Deploy Batch 2 Sub-Agents** (High priority, parallel)
   - Launch 5-8 concurrent sub-agents

4. **Deploy Batch 3 Sub-Agents** (Medium priority, parallel)
   - Launch remaining medium priority files

5. **Deploy Batch 4 Sub-Agents** (Low priority, parallel or serial)

6. **Verify All Reports Generated**
   - Check `port-progress-reports/` directory
   - Confirm one report per file pair

7. **Deploy Synthesis Sub-Agent**
   - Reads all reports
   - Generates `port-progress.md`

8. **Mark Phase 1 Complete in TodoWrite**

### Phase 2 Execution

1. **Initialize Phase 2 in TodoWrite**
   ```
   Phase 2: Code Quality Audit
   ├─ Category 1: Type Safety (in_progress)
   ├─ Category 2: Native Collections (pending)
   ├─ Category 3: Native Methods (pending)
   ├─ Category 4: Pattern Matching (pending)
   ├─ Category 5: Option Anti-patterns (pending)
   ├─ Category 6: Repository Conventions (pending)
   └─ Synthesis (pending)
   ```

2. **Deploy Code Quality Sub-Agents** (Parallel, 6 concurrent)
   - One sub-agent per category
   - Each sub-agent uses Grep extensively

3. **Monitor Sub-Agent Progress**
   - Sub-agents should complete independently
   - No dependencies between categories

4. **Verify All Reports Generated**
   - Check `port-code-quality/` directory
   - Confirm one report per category

5. **Deploy Synthesis Sub-Agent**
   - Reads all category reports
   - Generates `code-quality.md`

6. **Mark Phase 2 Complete in TodoWrite**

### Final Steps

1. **Review Both Synthesis Documents**
   - `port-progress.md` - Feature completeness
   - `code-quality.md` - Code quality issues

2. **Generate Executive Summary** (in TodoWrite or separate report)
   - Overall port health
   - Critical blockers
   - Recommended next steps

3. **Present Findings to User**
   - Link to both synthesis documents
   - Highlight critical findings
   - Provide actionable recommendations

---

## Verification Checklist

### Phase 1 Verification
- [ ] All file pairs analyzed (check file mapping table)
- [ ] All individual reports generated in `port-progress-reports/`
- [ ] `port-progress.md` synthesizes all reports accurately
- [ ] Executive summary provides clear completion percentage
- [ ] Missing features are prioritized (Critical/High/Medium/Low)
- [ ] Recommendations are specific and actionable

### Phase 2 Verification
- [ ] All 6 categories analyzed
- [ ] All individual reports generated in `port-code-quality/`
- [ ] `code-quality.md` synthesizes all category reports
- [ ] Executive summary includes total violation counts
- [ ] Violations include exact file paths and line numbers
- [ ] Each violation has a recommended fix
- [ ] Systemic patterns identified across files

### Overall Verification
- [ ] No context window exhaustion (used sub-agents effectively)
- [ ] TodoWrite maintained accurate phase tracking
- [ ] All reports follow consistent format
- [ ] Both synthesis documents are comprehensive and readable
- [ ] Findings are prioritized appropriately

---

## Critical Rules

1. **Never Directly Analyze Large Files**: Deploy sub-agents for all file reading and analysis
2. **Preserve Context**: Use TodoWrite and file-based communication exclusively
3. **Parallel When Possible**: Launch independent sub-agents concurrently
4. **Specific Violations Only**: Every violation must include file path and line number
5. **Actionable Recommendations**: Every issue must have a concrete fix suggestion
6. **Respect Repository Patterns**: Reference `.claude/rules` and `documentation/` for conventions
7. **Synthesis is Summary**: Synthesis documents aggregate findings, not analyze code directly

---

## Metadata

### Research Sources

**Repository Standards**:
- `.claude/rules/effect-patterns.md` - Import conventions, native method ban, Effect patterns
- `documentation/EFFECT_PATTERNS.md` - Comprehensive Effect development guide
- `packages/ui/ui/CLAUDE.md` - UI package conventions and gotchas

**Port Context**:
- `packages/ui/ui/src/flex-layout/MIGRATION_HANDOFF.md` - Port patterns and lessons learned

**Reference Implementations**:
- `packages/ui/ui/src/flex-layout/rect.ts` - S.Class pattern
- `packages/ui/ui/src/flex-layout/model/json.model.ts` - Recursive schemas
- `packages/ui/ui/src/flex-layout/types.ts` - Constant objects

### Refinement History

| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial draft | N/A          |
| 1         | - Incomplete file mapping table (missing view files, AttributeDefinitions, index.ts)<br>- Missing Status column in file mappings<br>- Incomplete grep patterns for Category 3 (native methods)<br>- Incomplete grep patterns for Category 6 (conventions)<br>- No detection of direct named imports from Effect<br>- Missing Object/Record method detection | - Added complete file mapping with all 43 files (9 core, 15 model, 19 view)<br>- Added Status column showing Complete/Partial for each file<br>- Expanded Category 3 grep patterns: added 25+ array/string/object methods<br>- Expanded Category 6 grep patterns: added direct import detection, lowercase constructor checks, JSDoc detection<br>- Organized file mapping into three sections (Core, Model, View) for clarity<br>- Enhanced documentation for each grep pattern category |
