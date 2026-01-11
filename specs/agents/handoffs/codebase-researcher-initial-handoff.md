# Codebase Researcher Agent — Initial Handoff

> **Priority**: Tier 1 (Foundation)
> **Spec Location**: `specs/agents/codebase-researcher/README.md`
> **Target Output**: `.claude/agents/codebase-researcher.md` (350-450 lines)

---

## Mission

Create the **codebase-researcher** agent — a systematic exploration specialist that maps dependencies, identifies existing patterns, and provides architectural context. This agent is foundational: it enables informed implementation by understanding what already exists.

---

## Critical Constraints

1. **NEVER use `async/await`** — All examples must use `Effect.gen`
2. **NEVER use native array/string methods** — Use `A.map`, `Str.split`, etc.
3. **NEVER use named imports from Effect** — Use `import * as Effect from "effect/Effect"`
4. **Agent definition must be 350-450 lines**
5. **All file references must be validated before inclusion**
6. **Focus on Glob and Grep tool patterns**

---

## Phase 1: Research (Read-Only)

Execute these research tasks **before** designing the agent:

### Task 1.1: Study Package Structure

**Read**:
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/PACKAGE_STRUCTURE.md`

**Extract**:
- Vertical slice structure (iam, documents, comms, customization)
- Layer dependency order (domain -> tables -> server -> client -> ui)
- Package naming conventions

### Task 1.2: Analyze Existing AGENTS.md Files

**Explore via Glob**:
```
Glob pattern: "packages/**/AGENTS.md"
```

**Sample 3-5 well-documented packages** and extract:
- How they document their role
- Key exports format
- Integration point patterns

### Task 1.3: Study Import Analysis Techniques

**Run Grep patterns**:
```
# Find all imports from @beep/*
Grep pattern: "from \"@beep/"

# Find cross-slice imports (potential violations)
Grep pattern: "@beep/iam" in packages/documents/
Grep pattern: "@beep/documents" in packages/iam/
```

**Document**:
- Effective grep patterns for import analysis
- How to detect cross-slice violations
- Layer boundary enforcement

### Task 1.4: Review Agent Template

**Read**:
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/templates/agents-md-template.md`

### Output: `specs/agents/codebase-researcher/outputs/research-findings.md`

```markdown
# Codebase Researcher Research Findings

## Package Structure Insights
[Vertical slices, layers, naming]

## AGENTS.md Patterns
[What good AGENTS.md files contain]

## Import Analysis Techniques
[Grep patterns that work]

## Exploration Methodology
[How to systematically explore unknown code]
```

---

## Phase 2: Design

### Task 2.1: Design Exploration Methodology

Define the step-by-step process for codebase exploration:
1. **Discover** — Find relevant files via glob
2. **Analyze** — Map imports and dependencies
3. **Identify** — Extract patterns from implementations
4. **Map** — Document architectural boundaries

### Task 2.2: Define Output Format

```markdown
# Codebase Research: [Feature/Task Name]

## Relevant Files
| File | Purpose | Dependencies |
|------|---------|--------------|

## Existing Patterns
### Pattern: [Name]
**Location**: [file:line]
**Usage**:
```typescript
[Code example from codebase]
```

## Architectural Boundaries
[Package boundaries, layer constraints]

## Import Graph
[Visual or textual representation]

## Recommendations
[Which patterns to follow, which to avoid]
```

### Task 2.3: Document Tool Usage

| Tool | Purpose | Example |
|------|---------|---------|
| Glob | Find files by pattern | `**/*.service.ts` |
| Grep | Find content patterns | `from "@beep/` |
| Read | Extract code sections | Specific file paths |

### Output: `specs/agents/codebase-researcher/outputs/agent-design.md`

---

## Phase 3: Create

### Task 3.1: Write Agent Definition

Create `.claude/agents/codebase-researcher.md`:

```markdown
---
description: Systematic codebase exploration agent for mapping dependencies and identifying patterns
tools: [Glob, Grep, Read]
---

# Codebase Researcher Agent

[Purpose statement]

## Methodology

### Step 1: Scope Definition
[How to bound the exploration]

### Step 2: File Discovery
[Glob patterns and strategies]

### Step 3: Import Analysis
[Grep patterns for dependencies]

### Step 4: Pattern Extraction
[How to identify reusable patterns]

### Step 5: Boundary Mapping
[Documenting architectural constraints]

## Knowledge Sources
[File paths and what they provide]

## Output Format
[Exact structure]

## Examples
[Sample exploration and output]
```

### Task 3.2: Include Glob Pattern Library

Document common glob patterns:
```
# Service files
**/*.service.ts

# Repository files
**/*.repo.ts

# Domain entities
packages/*/domain/src/entities/**/*.ts

# Layer-specific
packages/*/server/src/**/*.ts
packages/*/client/src/**/*.ts
```

### Task 3.3: Include Grep Pattern Library

```
# All Effect imports
import \* as .* from "effect/

# Cross-slice imports (violations)
from "@beep/(iam|documents|comms|customization)-

# Layer pattern
/domain/|/tables/|/server/|/client/|/ui/
```

---

## Phase 4: Validate

### Verification Commands

```bash
# Check file exists and length
ls -lh .claude/agents/codebase-researcher.md
wc -l .claude/agents/codebase-researcher.md

# Verify no async/await
grep -i "async\|await" .claude/agents/codebase-researcher.md && echo "FAIL" || echo "PASS"

# Verify tool references
grep -E "Glob|Grep|Read" .claude/agents/codebase-researcher.md
```

### Success Criteria

- [ ] Agent definition at `.claude/agents/codebase-researcher.md`
- [ ] Length is 350-450 lines
- [ ] Follows template structure with frontmatter
- [ ] Includes glob pattern library
- [ ] Includes grep pattern library
- [ ] No async/await in examples
- [ ] Documents vertical slice structure
- [ ] Tested with sample exploration task

---

## Handoff Notes

After completing Phase 4:
1. Update `specs/agents/codebase-researcher/REFLECTION_LOG.md` with learnings
2. Note any glob/grep patterns that proved especially useful
3. Document any architectural insights discovered

---

## Ready-to-Use Orchestrator Prompt

```
You are executing the codebase-researcher agent creation spec.

Your goal: Create `.claude/agents/codebase-researcher.md` (350-450 lines) — a systematic exploration agent for mapping codebases.

CRITICAL RULES:
1. NEVER write code directly — orchestrate via sub-agents
2. PRESERVE context window — summarize findings
3. VALIDATE all file references

PHASE 1 - Research:
1. Read documentation/PACKAGE_STRUCTURE.md — understand architecture
2. Glob packages/**/AGENTS.md — sample 3-5 good examples
3. Run grep patterns to understand import analysis techniques
4. Read .claude/agents/templates/agents-md-template.md
5. Output to specs/agents/codebase-researcher/outputs/research-findings.md

PHASE 2 - Design:
1. Design exploration methodology (Discover -> Analyze -> Identify -> Map)
2. Define output format with examples
3. Create glob and grep pattern libraries
4. Output to specs/agents/codebase-researcher/outputs/agent-design.md

PHASE 3 - Create:
1. Write .claude/agents/codebase-researcher.md
2. Include pattern libraries
3. Test with sample exploration (e.g., "How does IAM authentication work?")

PHASE 4 - Validate:
1. Run verification commands
2. Update REFLECTION_LOG.md

Begin with Phase 1, Task 1.1.
```
