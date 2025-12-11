# Implementation Prompt Template

Template for the compiled prompt file generated after research synthesis. This prompt is designed to be used by a separate Claude instance for implementation.

## Template Structure

```markdown
---
task: <research-task>
generated: <ISO timestamp>
research_agents: <count>
synthesis_confidence: high|medium|low
---

# <Task Name> - Implementation Prompt

## Mission

[1-3 sentences describing the core implementation objective]

**Success Criteria:**
1. [Measurable outcome 1]
2. [Measurable outcome 2]
3. [Measurable outcome 3]

## Context from Research

### Codebase Analysis
[Summary of existing patterns, file structure, and current state]

**Key Files Identified:**
- `path/to/file1.ts` - [brief description]
- `path/to/file2.ts` - [brief description]
- `path/to/file3.ts` - [brief description]

**Existing Patterns:**
- [Pattern 1]: [where it's used, how it works]
- [Pattern 2]: [where it's used, how it works]

### Package Guidelines
[Consolidated constraints from AGENTS.md files]

**From `packages/X/AGENTS.md`:**
- [Guideline 1]
- [Guideline 2]

**From `packages/Y/AGENTS.md`:**
- [Guideline 1]
- [Guideline 2]

### Effect Patterns
[Effect-specific approaches identified during research]

**Recommended APIs:**
- `Effect.gen` for [use case]
- `Layer.provide` for [use case]
- `Schema.TaggedError` for [use case]

**Code Pattern:**
```typescript
// Example of recommended approach
const examplePattern = Effect.gen(function* () {
  // ...
});
```

### Architecture Insights
[Architectural patterns and boundaries identified]

**Layer Structure:**
```
[domain] → [tables] → [infra] → [sdk] → [ui]
```

**Boundary Rules:**
- [Rule 1]
- [Rule 2]

## Implementation Strategy

### Phase 1: [Phase Name]
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Output:** [What this phase produces]

### Phase 2: [Phase Name]
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Output:** [What this phase produces]

### Phase 3: [Phase Name]
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Output:** [What this phase produces]

## Constraints & Conventions

### Forbidden Patterns
- [ ] No `async/await` - use `Effect.gen`
- [ ] No native Array methods - use `A.map`, `A.filter`
- [ ] No native String methods - use `Str.*`
- [ ] No `new Date()` - use `DateTime.*`
- [ ] No `switch` statements - use `Match.value`
- [ ] No `try/catch` - use `Effect.tryPromise`
- [ ] No relative imports across packages - use `@beep/*`

### Required Patterns
- [ ] Use `Schema.TaggedError` for all errors
- [ ] Use namespace imports (`import * as X from "effect/X"`)
- [ ] Use PascalCase constructors (`S.Struct`, not `S.struct`)
- [ ] Use `@beep/utils` no-ops (`nullOp`, `noOp`, `nullOpE`)
- [ ] Follow vertical slice layering (domain → tables → infra → sdk)

### Import Conventions
```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as F from "effect/Function";
```

## Resources

### Files to Read First
1. `path/to/primary/file.ts` - [why this is important]
2. `path/to/secondary/file.ts` - [why this is important]
3. `path/to/reference/file.ts` - [example to follow]

### AGENTS.md Files
- `packages/relevant/AGENTS.md`
- `packages/other/AGENTS.md`

### Effect Documentation
- [Topic 1] - use `effect_docs_search` with query "[query]"
- [Topic 2] - use `effect_docs_search` with query "[query]"

### External Resources
- [Resource 1](url) - [description]
- [Resource 2](url) - [description]

## Verification Checklist

### Type Safety
- [ ] `bun run check` passes
- [ ] No `any` types introduced
- [ ] All Effect errors properly typed

### Code Quality
- [ ] `bun run lint` passes
- [ ] Follows Effect import conventions
- [ ] No forbidden patterns used

### Functionality
- [ ] [Feature requirement 1]
- [ ] [Feature requirement 2]
- [ ] [Feature requirement 3]

### Tests (if applicable)
- [ ] `bun run test` passes
- [ ] New functionality has test coverage
- [ ] Edge cases covered

---

## Research Appendix

### Agent Summaries

#### Agent 1: Codebase Auditor
**Status:** [completed/partial/failed]
**Key Findings:**
- [Finding 1]
- [Finding 2]

#### Agent 2: Effect Researcher
**Status:** [completed/partial/failed]
**Key Findings:**
- [Finding 1]
- [Finding 2]

#### Agent 3: AGENTS.md Scanner
**Status:** [completed/partial/failed]
**Key Findings:**
- [Finding 1]
- [Finding 2]

[... more agents as applicable]

### Files Discovered

#### Domain Layer
- `packages/X/domain/src/Entity.ts`
- `packages/X/domain/src/ValueObject.ts`

#### Infrastructure Layer
- `packages/X/infra/src/Repository.ts`
- `packages/X/infra/src/Service.ts`

#### Tables Layer
- `packages/X/tables/src/schema.ts`

### External Resources Consulted
- [Resource 1](url) - [what was learned]
- [Resource 2](url) - [what was learned]

### Research Gaps
[Any areas where research was incomplete or inconclusive]

- [Gap 1]: [what's missing, why it matters]
- [Gap 2]: [what's missing, why it matters]
```

## Template Usage Guidelines

### Frontmatter Fields

| Field | Description |
|-------|-------------|
| `task` | Kebab-case identifier matching research task |
| `generated` | ISO 8601 timestamp of generation |
| `research_agents` | Number of agents deployed |
| `synthesis_confidence` | Subjective quality rating |

### Confidence Levels

| Level | Criteria |
|-------|----------|
| `high` | All agents successful, no conflicts, comprehensive coverage |
| `medium` | Most agents successful, minor gaps, some conflicts resolved |
| `low` | Agent failures, significant gaps, unresolved conflicts |

### Section Requirements

| Section | Required | Notes |
|---------|----------|-------|
| Mission | Yes | Must have measurable success criteria |
| Context | Yes | Must include actual file paths |
| Implementation Strategy | Yes | Must have phases with steps |
| Constraints | Yes | Must include both forbidden and required |
| Resources | Yes | Must include files to read first |
| Verification | Yes | Must include type and lint checks |
| Appendix | Yes | Must document all agent findings |

### Best Practices

1. **Be specific**: Use actual file paths, not "relevant files"
2. **Be actionable**: Steps should be concrete actions
3. **Be complete**: Include all constraints, don't assume knowledge
4. **Be honest**: Note gaps and uncertainties in appendix
5. **Be organized**: Follow the template structure consistently
