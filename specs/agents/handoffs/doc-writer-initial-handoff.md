# Doc Writer Agent — Initial Handoff

> **Priority**: Tier 4 (Writers)
> **Spec Location**: `specs/agents/doc-writer/README.md`
> **Target Output**: `.claude/agents/doc-writer.md` (400-500 lines)

---

## Mission

Create the **doc-writer** agent — a documentation specialist that writes JSDoc comments and markdown documentation following repository standards. Ensures docgen compliance and maintains consistent documentation quality.

---

## Critical Constraints

1. **NEVER use `async/await`** — All examples must use `Effect.gen`
2. **NEVER use native array/string methods** — Use `A.map`, `Str.split`, etc.
3. **Agent definition must be 400-500 lines**
4. **All JSDoc must include**: `@example`, `@category`, `@since`
5. **All examples must follow Effect patterns**

---

## Phase 1: Research (Read-Only)

### Task 1.1: Study Docgen Standards

**Read**:
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/cli/docgen/DOCGEN_AGENTS.md` (if exists)

**Glob for docgen configs**:
```
**/docgen.json
```

**Extract**:
- Configuration format
- Token tracking behavior
- Output structure

### Task 1.2: Sample Well-Documented Packages

**Find packages with good documentation**:
```bash
# Find files with @example tags
grep -l "@example" packages/**/*.ts | head -10
```

**Sample 3-5 well-documented files** and extract:
- JSDoc structure
- @example format
- @category organization
- @since versioning

### Task 1.3: Study README Patterns

**Glob**:
```
packages/**/README.md
```

**Sample 3-5 good READMEs** and extract:
- Common sections
- Code example format
- Integration point documentation

### Task 1.4: Study AGENTS.md Patterns

**Read**:
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/templates/agents-md-template.md`

**Sample existing AGENTS.md files**:
```
packages/**/AGENTS.md
```

### Task 1.5: Review Existing Doc Agents

**Read**:
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/jsdoc-fixer.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/readme-updater.md`

### Output: `specs/agents/doc-writer/outputs/research-findings.md`

```markdown
# Doc Writer Research Findings

## Docgen Configuration
[Format and options]

## JSDoc Standards

### Required Tags
- @example (REQUIRED)
- @category (REQUIRED)
- @since (REQUIRED)

### Tag Format
@example
```typescript
import * as Effect from "effect/Effect"
// Example code
```

@category Queries
@since 1.0.0

## README Structure
[Common sections from samples]

## AGENTS.md Structure
[Template requirements]

## Existing Agent Patterns
[What jsdoc-fixer and readme-updater do well]
```

---

## Phase 2: Design

### Task 2.1: Design JSDoc Template

```typescript
/**
 * Brief description of what the function/class does.
 *
 * More detailed explanation if needed. Can span multiple lines
 * and include context about when to use this.
 *
 * @category CategoryName
 * @since 1.0.0
 * @example
 * import * as Effect from "effect/Effect"
 * import { FunctionName } from "@beep/package-name"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* FunctionName({ input: "value" })
 *   return result
 * })
 */
```

### Task 2.2: Design README Template

```markdown
# @beep/package-name

Brief description of the package purpose.

## Overview

What this package provides and its role in the architecture.

## Installation

```bash
bun add @beep/package-name
```

## Key Exports

| Export | Description |
|--------|-------------|
| `ExportName` | What it does |

## Usage

### Common Pattern

```typescript
import * as Effect from "effect/Effect"
import { Service } from "@beep/package-name"

const program = Effect.gen(function* () {
  const service = yield* Service
  return yield* service.method()
})
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/other` | Why needed |

## See Also

- [Related Package](../other/README.md)
```

### Task 2.3: Design AGENTS.md Template

```markdown
# @beep/package-name

Agent guidance for this package.

## Overview

Package purpose and architectural context.

## Key Exports

| Export | Description |
|--------|-------------|
| `ExportName` | What it does |

## Usage Patterns

### Pattern Name

```typescript
import * as Effect from "effect/Effect"
// Example
```

## Integration Points

- **Consumed by**: Which packages use this
- **Depends on**: What this package needs
```

### Task 2.4: Define Category Conventions

```markdown
## Category Conventions

| Category | Use For |
|----------|---------|
| Constructors | Factory functions, create* methods |
| Queries | Read operations, find*, get* |
| Mutations | Write operations, create*, update*, delete* |
| Transformations | map, filter, transform operations |
| Type Guards | is*, has* predicates |
| Utilities | Helper functions |
| Errors | Error classes |
| Services | Effect services and layers |
```

### Output: `specs/agents/doc-writer/outputs/agent-design.md`

---

## Phase 3: Create

### Task 3.1: Write Agent Definition

Create `.claude/agents/doc-writer.md`:

```markdown
---
description: Documentation writer agent for JSDoc, README, and AGENTS.md following repository standards
tools: [Read, Edit, Write, Glob]
---

# Doc Writer Agent

[Purpose statement]

## Documentation Standards

### Required JSDoc Tags
[List with examples]

### Category Conventions
[Table of categories]

### Effect Pattern Requirements
[Code example format]

## Templates

### JSDoc Template
[Complete template]

### README Template
[Complete template]

### AGENTS.md Template
[Complete template]

## Methodology

### Step 1: Analyze Existing Docs
[Understand current state]

### Step 2: Identify Gaps
[Missing docs, outdated content]

### Step 3: Generate Documentation
[Apply templates]

### Step 4: Validate Compliance
[Check required tags, Effect patterns]

## Output Format
[What the agent produces]

## Examples
[Before/after documentation]
```

### Task 3.2: Include Complete Templates

All three templates (JSDoc, README, AGENTS.md) with full structure.

### Task 3.3: Include Validation Checklist

```markdown
## Documentation Validation Checklist

### JSDoc
- [ ] Has @example tag
- [ ] Has @category tag
- [ ] Has @since tag
- [ ] Example uses Effect.gen
- [ ] Example uses namespace imports
- [ ] No async/await in example

### README
- [ ] Has Overview section
- [ ] Has Usage section with code
- [ ] Code uses Effect patterns
- [ ] Dependencies table present
- [ ] See Also links valid

### AGENTS.md
- [ ] Follows template structure
- [ ] No stale package references
- [ ] No MCP tool shortcuts
- [ ] Code uses Effect patterns
```

---

## Phase 4: Validate

### Verification Commands

```bash
# Check file exists and length
ls -lh .claude/agents/doc-writer.md
wc -l .claude/agents/doc-writer.md

# Verify no async/await
grep -i "async\|await" .claude/agents/doc-writer.md && echo "FAIL" || echo "PASS"

# Verify JSDoc tag mentions
grep -E "@example|@category|@since" .claude/agents/doc-writer.md

# Verify templates present
grep -E "README Template|AGENTS.md Template|JSDoc Template" .claude/agents/doc-writer.md
```

### Success Criteria

- [ ] Agent definition at `.claude/agents/doc-writer.md`
- [ ] Length is 400-500 lines
- [ ] Includes JSDoc template with required tags
- [ ] Includes README template
- [ ] Includes AGENTS.md template
- [ ] All examples use Effect patterns
- [ ] Includes validation checklist
- [ ] Tested with sample documentation task

---

## Ready-to-Use Orchestrator Prompt

```
You are executing the doc-writer agent creation spec.

Your goal: Create `.claude/agents/doc-writer.md` (400-500 lines) — a documentation writer agent.

CRITICAL RULES:
1. All examples MUST use Effect patterns
2. JSDoc MUST include @example, @category, @since
3. No async/await in any examples

PHASE 1 - Research:
1. Read docgen documentation if exists
2. Glob for docgen.json configs
3. Sample well-documented packages (grep @example)
4. Sample README.md files
5. Read jsdoc-fixer.md and readme-updater.md
6. Output to specs/agents/doc-writer/outputs/research-findings.md

PHASE 2 - Design:
1. Create JSDoc template with required tags
2. Create README template
3. Create AGENTS.md template
4. Define category conventions
5. Output to specs/agents/doc-writer/outputs/agent-design.md

PHASE 3 - Create:
1. Write .claude/agents/doc-writer.md
2. Include all templates
3. Include validation checklist
4. Test with sample documentation task

PHASE 4 - Validate:
1. Run verification commands
2. Update REFLECTION_LOG.md

Begin with Phase 1.
```
