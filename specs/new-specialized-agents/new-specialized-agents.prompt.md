---
name: new-specialized-agents
version: 2
created: 2026-01-10T14:30:00Z
refined: 2026-01-10T18:00:00Z
iterations: 1
---

# New Specialized Agents - Refined Prompt

## Context

### Repository State
The `beep-effect` monorepo has established a self-improving specification workflow that operates across multiple sessions with handoffs. The pattern is documented in `/home/elpresidank/YeeBois/projects/beep-effect/specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md` and has proven effective through 4 distinct phases, generating 17 files and 4,778 lines of orchestration artifacts.

### Current Spec Infrastructure

**Standard Spec Structure** (from `META_SPEC_TEMPLATE.md`):
```
specs/[SPEC_NAME]/
├── README.md                    # Entry point, overview (100-150 lines)
├── QUICK_START.md               # 5-min getting started (optional)
├── MASTER_ORCHESTRATION.md      # Full workflow (400-600 lines)
├── AGENT_PROMPTS.md             # Specialized sub-agent prompts (400-600 lines)
├── RUBRICS.md                   # Scoring/evaluation criteria (200-400 lines)
├── REFLECTION_LOG.md            # Cumulative learnings (required)
├── templates/                   # Output templates
│   ├── context.template.md
│   ├── evaluation.template.md
│   └── plan.template.md
├── outputs/                     # Phase outputs
│   ├── context.md
│   ├── evaluation.md
│   └── plan.md
└── handoffs/                    # Iterative execution
    ├── HANDOFF_P[N].md
    └── P[N]_ORCHESTRATOR_PROMPT.md
```

**Standardization Conventions** (from `SPEC_STANDARDIZATION_PROMPT.md`):
- All specs MUST have `README.md` and `REFLECTION_LOG.md`
- Complex specs have `MASTER_ORCHESTRATION.md`, `AGENT_PROMPTS.md`, `RUBRICS.md`
- Templates define output structure for each phase
- Handoffs preserve context between sessions
- Skills (`.claude/skills/`) are for single-session work; specs for multi-session orchestration

**Standard Phase Definitions** (from `META_SPEC_TEMPLATE.md`):
- **Phase 0: Scaffolding** - Create specification framework (one-time setup)
- **Phase 1: Discovery** - Gather context, map problem space (read-only)
- **Phase 2: Evaluation** - Apply rubrics, generate scored findings
- **Phase 3: Synthesis** - Generate actionable remediation plan
- **Phase 4+: Iterative Execution** - Execute plan in phases, capturing learnings

### Current Agent Infrastructure
The `.claude/agents/` directory contains 11 specialized agents:
- `effect-researcher.md` - Effect pattern research and code refactoring (380 lines)
- `effect-schema-expert.md` - Schema design and validation (425 lines)
- `jsdoc-fixer.md` - JSDoc documentation enforcement (291 lines)
- `readme-updater.md` - README maintenance (691 lines)
- `tsconfig-auditor.md` - TypeScript configuration auditing (272 lines)
- `prompt-refiner.md` - Prompt optimization (592 lines)
- `package-error-fixer.md` - Package-level error resolution (169 lines)
- `agents-md-updater.md` - AGENTS.md standardization (195 lines)
- `effect-predicate-master.md` - Predicate and Match pattern expertise (1,113 lines)

**Agent Template Structure** (from `.claude/agents/templates/agents-md-template.md`):
- Frontmatter with `name`, `description`, `model`
- Clear purpose statement
- Workflow methodology
- Critical rules
- Output location conventions

### Repository Architecture & Patterns
**Effect-First Development** (documented in `documentation/EFFECT_PATTERNS.md`):
- Namespace imports: `import * as Effect from "effect/Effect"`
- Single-letter aliases: `import * as A from "effect/Array"`
- Forbidden: `async/await`, native array/string methods, `switch` statements, `new Date()`
- Required: `Effect.gen`, `Match.value`, `DateTime.unsafeNow`, `Schema.TaggedError`

**Testing Infrastructure** (from `tooling/testkit/AGENTS.md`):
- Wraps Bun's `bun:test` with Effect-first helpers
- Core exports: `effect`, `scoped`, `scopedLive`, `live`, `layer`, `flakyTest`, `prop`
- Layer-based test orchestration with `Layer.toRuntimeWithMemoMap`
- Effect-aware assertions for `Option`, `Either`, `Exit` types
- Property-based testing stubs (FastCheck integration planned)

**Documentation Standards** (from `documentation/cli/docgen/DOCGEN_AGENTS.md`):
- AI-powered JSDoc generation using Claude
- Required tags: `@category`, `@example`, `@since`
- Token tracking and cost estimation
- Crash-resilient workflow execution
- Package-level `docgen.json` configuration

**Package Structure** (from `documentation/PACKAGE_STRUCTURE.md`):
- 4 vertical slices: `iam`, `documents`, `comms`, `customization`
- Layer dependency order: `domain -> tables -> infra -> client -> ui`
- Zero cross-slice imports (enforced via tooling)
- 95% AGENTS.md coverage across 42 packages

### Problem Statement
The current spec workflow would benefit from:
1. **Additional specialized sub-agents** optimized for recurring spec workflow tasks
2. **Formal integration** between agents and the META_SPEC_TEMPLATE pattern
3. **Standardized agent output conventions** that feed into handoff documents
4. **Enhanced reflection protocols** for continuous improvement

## Objective

Design and implement 9 specialized sub-agents that enhance the existing spec workflow by:

1. **Creating specialized agents** optimized for META_SPEC_TEMPLATE phases
2. **Standardizing agent outputs** to feed into handoff documents
3. **Enhancing reflection protocols** for meta-learning capabilities
4. **Documenting integration patterns** with existing spec infrastructure

### Success Criteria
- [ ] 9 new agent definitions created in `.claude/agents/`
- [ ] Each agent follows template structure from `.claude/agents/templates/agents-md-template.md`
- [ ] Agent outputs align with META_SPEC_TEMPLATE conventions
- [ ] Integration with existing spec workflow documented
- [ ] Agent output protocols defined for handoff generation
- [ ] Reflection enhancement protocol documented
- [ ] All code examples use Effect patterns (no async/await, native methods)
- [ ] All agents reference actual repository files (no broken links)
- [ ] Passes `bun run lint` and `bun run check`

## Role

You are a **Workflow Architecture Specialist** with expertise in:
- Multi-phase orchestration patterns for AI agent coordination
- Self-improving specification methodologies
- Effect-TS patterns and repository architecture
- Test-driven development with property-based testing
- Documentation generation and maintenance
- Code review and architectural consistency enforcement
- Observability patterns (logging, tracing, metrics)

Your behavioral constraints:
- NEVER use reflexive agreement phrases ("you are right")
- ALWAYS analyze for flaws, edge cases, invalid assumptions
- Provide substantive technical analysis with concrete reasons
- Question proposed approaches and suggest alternatives

## Constraints

### Forbidden Patterns
- Creating agents without frontmatter (`name`, `description`, `model`)
- Agent files without clear workflow methodology
- Cross-references to non-existent files
- MCP tool shortcuts in documentation
- Named imports from Effect (`import { Effect }`)
- `async/await` in code examples
- Native array/string methods in examples
- Vague documentation without specific examples

### Required Patterns
- All agent definitions MUST follow `.claude/agents/templates/agents-md-template.md`
- All agent outputs MUST align with META_SPEC_TEMPLATE conventions
- All code examples MUST use namespace imports and Effect patterns
- All agent reflections MUST feed into spec REFLECTION_LOG.md
- Folder structure MUST align with SPEC_STANDARDIZATION_PROMPT conventions

### Effect Pattern Constraints (CRITICAL)
```typescript
// REQUIRED imports
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as A from "effect/Array"
import * as Str from "effect/String"
import * as F from "effect/Function"
import * as Match from "effect/Match"
import * as DateTime from "effect/DateTime"

// FORBIDDEN
async/await, .map(), .filter(), .split(), switch, new Date()

// REQUIRED
Effect.gen, A.map, Str.split, Match.value, DateTime.unsafeNow
```

### Testing Pattern Constraints
```typescript
// REQUIRED for test-writer agent knowledge
import { effect, scoped, layer, flakyTest } from "@beep/testkit"
import * as Schedule from "effect/Schedule"
import * as Duration from "effect/Duration"

// Layer-based testing
layer(Layer.mergeAll(DbLive, CacheLive), { timeout: Duration.seconds(60) })(
  "integration suite",
  (it) => {
    it.effect("test name", () => Effect.gen(function* () {
      // test implementation
    }))
  }
)
```

## Resources

### Existing Spec Structure Files
- `/home/elpresidank/YeeBois/projects/beep-effect/specs/README.md` - Spec index and conventions
- `/home/elpresidank/YeeBois/projects/beep-effect/specs/SPEC_STANDARDIZATION_PROMPT.md` - Standardization workflow
- `/home/elpresidank/YeeBois/projects/beep-effect/specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md` - Self-improving pattern
- `/home/elpresidank/YeeBois/projects/beep-effect/specs/ai-friendliness-audit/REFLECTION_LOG.md` - Reflection protocol example
- `/home/elpresidank/YeeBois/projects/beep-effect/specs/docking-system/` - Example spec with handoffs

### Agent Infrastructure Files
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/templates/agents-md-template.md` - Agent template
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/effect-researcher.md` - Example specialized agent
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/jsdoc-fixer.md` - Documentation agent example

### Repository Pattern Documentation
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/EFFECT_PATTERNS.md` - Effect idioms and forbidden patterns
- `/home/elpresidank/YeeBois/projects/beep-effect/tooling/testkit/AGENTS.md` - Testing infrastructure guide
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/cli/docgen/DOCGEN_AGENTS.md` - Documentation agent system
- `/home/elpresidank/YeeBois/projects/beep-effect/CLAUDE.md` - Repository guidelines

### Effect Module Documentation
Use `mcp__effect_docs__effect_docs_search` and `mcp__effect_docs__get_effect_doc` to research:
- `effect/Cause` - Error cause tracking and analysis
- `effect/Logger` - Structured logging
- `effect/Metric` - Metrics collection
- `effect/Tracer` - Distributed tracing
- `effect/Arbitrary` - Property-based testing data generation
- `effect/FastCheck` - Property-based testing integration
- `effect/TestClock` - Time control in tests
- `effect/Config` & `effect/ConfigProvider` - Configuration injection

## Output Specification

This spec follows the META_SPEC_TEMPLATE pattern with phases aligned to the standard workflow.

### Phase 0: Scaffolding (Setup)

**Purpose**: Create the agent development specification framework.

**Files to create in `specs/new-specialized-agents/`**:
- `MASTER_ORCHESTRATION.md` (400-600 lines) - Full workflow for agent development
- `AGENT_PROMPTS.md` (400-600 lines) - Specialized prompts for creating each agent
- `RUBRICS.md` (200-400 lines) - Evaluation criteria for agent quality
- `templates/agent-definition.template.md` (150-200 lines) - Template for new agents

**Self-reflection**: Not required for scaffolding phase.

---

### Phase 1: Discovery (Research)

**Purpose**: Research existing agent patterns and identify optimal agent design patterns.

**Inputs**:
- Existing `.claude/agents/*.md` files
- `META_SPEC_TEMPLATE.md` workflow
- Repository architectural patterns

**Outputs**: `outputs/agent-research.md` (200-300 lines)

**Content structure**:
```markdown
# Agent Research Findings

## Existing Agent Analysis
[Review of current agent patterns, strengths, weaknesses]

## META_SPEC_TEMPLATE Integration Points
[Where agents fit in the spec workflow]

## Repository Pattern Requirements
[Effect patterns, testing patterns, doc patterns agents must follow]

## Recommended Agent Capabilities
[What each proposed agent should do]
```

**Self-reflection questions** (log in REFLECTION_LOG.md):
- What patterns are common across existing agents?
- Which agent responsibilities overlap? Which gaps exist?
- How can agents better feed into the handoff workflow?

---

### Phase 2: Evaluation (Design)

**Purpose**: Design each of the 9 specialized agents with detailed specifications.

**Inputs**: Agent research from Phase 1

**Outputs**: `outputs/agent-designs.md` (400-600 lines)

**Content structure**:
```markdown
# Agent Design Specifications

## Agent 1: reflector
### Purpose
### Knowledge Sources
### Methodology
### Output Format
### Integration with Handoffs

[Repeat for all 9 agents]
```

**Self-reflection questions**:
- Are agent responsibilities clearly bounded?
- Do agents produce outputs compatible with META_SPEC_TEMPLATE?
- Are there missing agents needed for the workflow?

---

### Phase 3: Synthesis (Planning)

**Purpose**: Create detailed implementation plan for all 9 agents with prioritization.

**Outputs**:
- `outputs/implementation-plan.md` (300-400 lines) - Prioritized agent creation order
- `REFLECTION_LOG.md` (initial entry) - Learnings from Phases 1-3
- `handoffs/HANDOFF_P4.md` - Transition to implementation
- `handoffs/P4_ORCHESTRATOR_PROMPT.md` - Execution prompt for Phase 4

**Implementation plan structure**:
```markdown
# Agent Implementation Plan

## Implementation Order
1. **reflector** (Priority: CRITICAL) - Needed for meta-learning
2. **codebase-researcher** (Priority: HIGH) - Foundation for other agents
3. [...]

## Per-Agent Tasks
### Agent: reflector
- [ ] Create agent definition following template
- [ ] Define knowledge sources
- [ ] Specify reflection output format
- [ ] Test with existing REFLECTION_LOG.md
- [ ] Integrate with handoff generation

## Verification Protocol
[How to validate each agent]
```

**Handoff structure** (follows META_SPEC_TEMPLATE):
```markdown
# New Specialized Agents Handoff — Phase 3 to Phase 4

## Session Summary: Phase 3 Completed
| Metric | Before | After | Status |
|--------|--------|-------|--------|
| Agents designed | 0 | 9 | ✅ Complete |
| Implementation plan | No | Yes | ✅ Complete |
| Reflection log | No | Yes | ✅ Complete |

## Lessons Learned
### What Worked Well
### What Needed Adjustment
### Prompt Improvements

## Remaining Work: Phase 4 Items
[Specific agent creation tasks]

## Improved Sub-Agent Prompts
[Refined prompts for agent creation]

## P4 Orchestrator Prompt
[Ready-to-use prompt for implementation]

## Verification Commands
## Success Criteria
## Notes for Next Agent
```

---

### Phase 4+: Iterative Execution (Implementation)

**Purpose**: Create agents one-by-one, capturing learnings in handoffs.

**Pattern per agent**:
1. Create agent definition in `.claude/agents/[agent-name].md`
2. Validate against template
3. Test agent with sample task
4. Document in handoff

**Files per iteration**:
- `.claude/agents/[agent-name].md` - Agent definition
- `handoffs/HANDOFF_P[N+1].md` - Learnings and next steps
- `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` - Next iteration prompt

**Agent creation order** (tentative, to be finalized in Phase 3):
1. **reflector** - Meta-learning from reflection logs
2. **codebase-researcher** - Systematic codebase exploration
3. **mcp-researcher** - Effect documentation research via MCP
4. **web-researcher** - Best practices from web sources
5. **code-reviewer** - Repository guideline compliance
6. **architecture-pattern-enforcer** - Structural consistency
7. **code-observability-writer** - Logging, tracing, metrics
8. **doc-writer** - JSDoc and markdown documentation
9. **test-writer** - Effect-first test generation

---

## Agent Specifications (Detailed)

### Agent 1: reflector.md (300-400 lines)

**Purpose**: Analyzes reflection logs and generates meta-learnings that improve future spec executions.

**Core Capabilities**:
- Parses REFLECTION_LOG.md from specs
- Identifies patterns across multiple phases
- Generates improved prompts based on learnings
- Updates repository documentation to prevent recurring issues

**Knowledge Sources**:
- `specs/*/REFLECTION_LOG.md` - All spec reflection logs
- `specs/ai-friendliness-audit/REFLECTION_LOG.md` - Reference implementation
- `specs/SPEC_STANDARDIZATION_PROMPT.md` - Spec conventions

**Methodology**:
1. Read target spec's REFLECTION_LOG.md
2. Extract "What Worked" and "What Didn't Work" entries
3. Identify recurring patterns across phases
4. Generate meta-reflection document
5. Propose prompt refinements
6. Suggest documentation updates

**Output Format**:
```markdown
# Meta-Reflection: [Spec Name]

## Pattern Analysis
### Recurring Successes (Keep Doing)
### Recurring Failures (Stop Doing)
### Emerging Patterns (Start Doing)

## Prompt Refinements
[Before/After prompt improvements]

## Documentation Updates
[Suggested changes to CLAUDE.md, AGENTS.md, etc.]

## Cumulative Learnings
[Integration with existing reflection logs]
```

**Output Location**: `specs/[spec-name]/outputs/meta-reflection.md`

**Integration with Handoffs**:
- Reflector runs at end of each phase
- Meta-reflection informs next phase's orchestrator prompt
- Cumulative learnings feed into spec's REFLECTION_LOG.md

---

### Agent 2: codebase-researcher.md (350-450 lines)

**Purpose**: Performs systematic codebase exploration to map dependencies, patterns, and architecture.

**Core Capabilities**:
- Discovers relevant files via glob patterns
- Analyzes import graphs and dependencies
- Identifies existing patterns and implementations
- Maps architectural boundaries

**Knowledge Sources**:
- Repository structure (via `Glob` tool)
- Import statements (via `Grep` tool)
- AGENTS.md files across packages
- `documentation/PACKAGE_STRUCTURE.md`

**Methodology**:
1. Analyze task/feature requirements
2. Search for related files via glob patterns
3. Map dependencies via import analysis
4. Identify relevant AGENTS.md files
5. Extract existing patterns
6. Generate research report

**Output Format**:
```markdown
# Codebase Research: [Feature/Task Name]

## Relevant Files
| File | Purpose | Dependencies |
|------|---------|--------------|
| path/to/file.ts | What it does | @beep/packages |

## Existing Patterns
### Pattern: [Name]
[Code example from codebase]

## Architectural Boundaries
[Package boundaries, layer constraints]

## Recommendations
[Which patterns to follow, which to avoid]
```

**Output Location**: `specs/[spec-name]/research/codebase-analysis.md`

---

### Agent 3: mcp-researcher.md (300-400 lines)

**Purpose**: Uses MCP tools to research Effect documentation and extract relevant patterns.

**Core Capabilities**:
- Searches Effect docs via `mcp__effect_docs__effect_docs_search`
- Retrieves detailed documentation via `mcp__effect_docs__get_effect_doc`
- Extracts code examples and best practices
- Synthesizes patterns for specific use cases

**Knowledge Sources**:
- Effect documentation (via MCP)
- `documentation/EFFECT_PATTERNS.md`
- Existing Effect usage in codebase

**Methodology**:
1. Identify Effect modules relevant to task
2. Search docs for patterns/examples
3. Retrieve detailed documentation
4. Extract applicable code examples
5. Synthesize recommendations

**Output Format**:
```markdown
# Effect Patterns Research: [Topic]

## Relevant Modules
- `effect/Module` - Purpose and use cases

## Documentation Findings
### Pattern: [Name]
[Code example from Effect docs]

## Codebase Integration
[How to apply patterns in beep-effect]

## Critical Rules
[Effect-specific constraints to follow]
```

**Output Location**: `specs/[spec-name]/research/effect-patterns.md`

---

### Agent 4: web-researcher.md (250-350 lines)

**Purpose**: Searches web for best practices and cross-references multiple sources.

**Core Capabilities**:
- Searches web via `WebSearch` tool
- Validates source credibility
- Synthesizes findings from multiple sources
- Generates actionable recommendations

**Knowledge Sources**:
- Web search results
- Community best practices
- Library documentation

**Methodology**:
1. Formulate search queries based on task
2. Execute web searches
3. Validate source quality
4. Cross-reference findings
5. Synthesize recommendations

**Output Format**:
```markdown
# Web Research: [Topic]

## Search Queries
- "query 1"
- "query 2"

## Key Findings
### Source: [URL]
[Summary and relevance]

## Recommendations
[Actionable advice based on research]

## Sources
- [Title](URL)
```

**Output Location**: `specs/[spec-name]/research/web-research.md`

---

### Agent 5: code-reviewer.md (400-500 lines)

**Purpose**: Reviews code for repository guideline compliance and architectural consistency.

**Core Capabilities**:
- Validates Effect pattern adherence
- Checks architecture boundary compliance
- Identifies anti-patterns
- Suggests specific fixes
- Generates code review reports

**Knowledge Sources**:
- `CLAUDE.md` - Repository rules
- `documentation/EFFECT_PATTERNS.md` - Effect constraints
- Package-level `AGENTS.md` files
- `.claude/rules/*.md` - Behavioral and pattern rules

**Methodology**:
1. Read code to review
2. Check Effect pattern compliance
3. Validate architecture boundaries
4. Identify anti-patterns
5. Generate review report with fixes

**Output Format**:
```markdown
# Code Review: [File/Package Name]

## Compliance Summary
| Category | Status | Issues |
|----------|--------|--------|
| Effect Patterns | ✅/❌ | N |
| Architecture | ✅/❌ | N |
| Documentation | ✅/❌ | N |

## Issues Found
### Issue: [Title]
**Severity**: HIGH/MEDIUM/LOW
**Location**: file.ts:123
**Problem**: [Description]
**Fix**: [Specific code change]

## Recommendations
[Overall suggestions for improvement]
```

**Output Location**: `outputs/code-review-report.md`

---

### Agent 6: architecture-pattern-enforcer.md (450-550 lines)

**Purpose**: Validates folder structure, layering, and module exports against architectural conventions.

**Core Capabilities**:
- Validates package structure against conventions
- Ensures consistent layering (domain → tables → infra → client → ui)
- Checks naming conventions
- Reviews module exports and surface area
- Detects cross-slice import violations

**Knowledge Sources**:
- `documentation/PACKAGE_STRUCTURE.md`
- `specs/SPEC_STANDARDIZATION_PROMPT.md`
- Package-level `AGENTS.md` files
- Import graph analysis

**Methodology**:
1. Analyze package folder structure
2. Validate layer dependencies
3. Check naming conventions
4. Review module exports
5. Detect architectural violations
6. Generate audit report

**Output Format**:
```markdown
# Architecture Audit: [Package Name]

## Structure Validation
| Check | Status | Notes |
|-------|--------|-------|
| Folder structure | ✅/❌ | |
| Layer ordering | ✅/❌ | |
| Naming conventions | ✅/❌ | |

## Violations
### Violation: Cross-slice import
**Location**: packages/iam/client/src/UserClient.ts
**Problem**: Imports from @beep/documents-domain
**Fix**: Route through @beep/shared-domain

## Recommended Restructuring
[If major changes needed]
```

**Output Location**: `outputs/architecture-audit.md`

---

### Agent 7: code-observability-writer.md (350-450 lines)

**Purpose**: Adds logging, tracing, metrics, and error tracking to code.

**Core Capabilities**:
- Defines `Schema.TaggedError` error classes
- Implements structured logging via `Effect.log*`
- Adds tracing spans
- Instruments metrics collection
- Enhances debugging with `Cause` tracking

**Knowledge Sources**:
- `effect/Cause` documentation (via MCP)
- `effect/Logger` documentation
- `effect/Metric` documentation
- `effect/Tracer` documentation
- Existing observability patterns in codebase

**Methodology**:
1. Read code to instrument
2. Identify error cases → add Schema.TaggedError
3. Add structured logging at key points
4. Add tracing spans for operations
5. Instrument metrics for monitoring
6. Update code with observability enhancements

**Output Format**: Modified source files with:
```typescript
// Error definitions
export class UserNotFoundError extends S.TaggedError<UserNotFoundError>()(
  "UserNotFoundError",
  { userId: S.String }
) {}

// Structured logging
yield* Effect.logInfo("User lookup", { userId, timestamp: DateTime.unsafeNow() })

// Error cause tracking
yield* Effect.catchAllCause(
  program,
  (cause) => Effect.logError("Operation failed", { cause: Cause.pretty(cause) })
)
```

**Output Location**: Modified source files in place

---

### Agent 8: doc-writer.md (400-500 lines)

**Purpose**: Creates JSDoc comments and markdown documentation following repository standards.

**Core Capabilities**:
- Generates JSDoc with `@example`, `@category`, `@since`
- Creates package README.md files
- Writes AGENTS.md files
- Ensures docgen compliance

**Knowledge Sources**:
- `documentation/cli/docgen/DOCGEN_AGENTS.md`
- Package `docgen.json` configs
- `.claude/agents/templates/agents-md-template.md`
- Existing documentation examples

**Methodology**:
1. Read code to document
2. Generate JSDoc comments with examples
3. Create/update README.md if needed
4. Create/update AGENTS.md if needed
5. Validate against docgen standards

**Output Format**:
```typescript
/**
 * Retrieves user by ID.
 *
 * @category Queries
 * @since 1.0.0
 * @example
 * import * as Effect from "effect/Effect"
 * import { UserRepo } from "@beep/iam-domain"
 *
 * const program = Effect.gen(function* () {
 *   const repo = yield* UserRepo
 *   return yield* repo.findById("user-123")
 * })
 */
export const findById = (id: UserId): Effect.Effect<
  User,
  UserNotFoundError,
  UserRepo
> => // implementation
```

**Output Location**:
- Modified source files with JSDoc
- `README.md` in package root
- `AGENTS.md` in package root

---

### Agent 9: test-writer.md (500-600 lines)

**Purpose**: Writes Effect-first unit and integration tests using `@beep/testkit`.

**Core Capabilities**:
- Writes unit tests with `effect` helper
- Creates integration tests with `layer` helper
- Implements property-based tests with `effect/Arbitrary`
- Controls time with `effect/TestClock`
- Injects test config with `effect/Config`

**Knowledge Sources**:
- `tooling/testkit/AGENTS.md`
- `effect/Arbitrary` documentation (via MCP)
- `effect/TestClock` documentation
- Existing test files in repository

**Methodology**:
1. Read code to test
2. Identify service dependencies
3. Design test strategy (unit/integration/property)
4. Implement tests with testkit patterns
5. Verify tests pass

**Output Format**:
```typescript
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { effect, layer } from "@beep/testkit"
import * as Duration from "effect/Duration"

// Unit test
effect("validates user input", () =>
  Effect.gen(function* () {
    const result = yield* validateUser({ name: "Alice" })
    expect(result).toEqual({ name: "Alice" })
  })
)

// Integration test
layer(Layer.mergeAll(UserRepoLive, DbTestLayer), {
  timeout: Duration.seconds(30)
})(
  "UserRepo integration",
  (it) => {
    it.effect("creates and retrieves user", () =>
      Effect.gen(function* () {
        const repo = yield* UserRepo
        const created = yield* repo.create({ name: "Bob" })
        const retrieved = yield* repo.findById(created.id)
        expect(retrieved).toEqual(created)
      })
    )
  }
)
```

**Output Location**: `*.test.ts` files adjacent to source

---

## Examples

### Example Agent Definition (reflector.md excerpt)

```markdown
---
name: reflector
description: |
  Meta-learning agent that analyzes reflection logs and generates
  improved prompts for future spec executions.

  Use this agent when you need to:
  - Analyze learnings from completed spec phases
  - Generate meta-reflections across multiple phases
  - Improve orchestrator prompts based on experience
  - Update repository documentation based on recurring issues

  Examples:
  - "Analyze the ai-friendliness-audit reflection log"
  - "Generate meta-learnings from all completed specs"
  - "Improve the orchestrator prompt based on Phase 2 learnings"
model: sonnet
---

You are a meta-learning specialist focused on continuous improvement of spec workflows.

## Your Knowledge Sources

### 1. Spec Reflection Logs
Read all `specs/*/REFLECTION_LOG.md` files to understand:
- What worked well across different specs
- What consistently failed or needed adjustment
- Emerging patterns in effective workflows

### 2. META_SPEC_TEMPLATE Pattern
Read `/home/elpresidank/YeeBois/projects/beep-effect/specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md` for:
- Standard reflection log structure
- Handoff document patterns
- Orchestrator prompt patterns

### 3. Repository Documentation
Read core documentation to identify opportunities for improvement:
- `CLAUDE.md` - Repository-wide rules
- `documentation/EFFECT_PATTERNS.md` - Effect constraints
- Package `AGENTS.md` files - Package-specific guidance

## Research Methodology

### Phase 1: Extract Learnings
1. Read target spec's REFLECTION_LOG.md
2. For each reflection entry:
   - Extract "What Worked Well" items
   - Extract "What Needed Adjustment" items
   - Extract "Prompt Improvements"
3. Group learnings by category (methodology, tooling, coordination, etc.)

### Phase 2: Identify Patterns
1. Cross-reference learnings across multiple phases
2. Identify recurring themes:
   - Techniques that consistently work
   - Mistakes that repeat
   - Workflow bottlenecks
3. Prioritize patterns by frequency and impact

### Phase 3: Generate Improvements
1. For each pattern, propose:
   - Methodology improvements for MASTER_ORCHESTRATION.md
   - Prompt refinements for AGENT_PROMPTS.md
   - Documentation updates for CLAUDE.md or AGENTS.md
2. Provide before/after examples

### Phase 4: Create Meta-Reflection
1. Synthesize findings into structured document
2. Include actionable recommendations
3. Integrate with existing reflection logs

## Output Format

```markdown
# Meta-Reflection: [Spec Name]

## Executive Summary
[High-level learnings in 2-3 sentences]

## Pattern Analysis

### Recurring Successes (Keep Doing)
1. **Pattern**: [Name]
   **Evidence**: Mentioned in Phase 1, 2, 4 reflections
   **Recommendation**: Codify in MASTER_ORCHESTRATION.md

### Recurring Failures (Stop Doing)
1. **Pattern**: [Name]
   **Evidence**: Failed in Phase 2, adjusted in Phase 3
   **Recommendation**: Update AGENT_PROMPTS.md to prevent

### Emerging Patterns (Start Doing)
1. **Pattern**: [Name]
   **Evidence**: Discovered in Phase 3, validated in Phase 4
   **Recommendation**: Add to QUICK_START.md

## Prompt Refinements

### Refinement 1: [Orchestrator Prompt]
**Original**:
```
[Original prompt text]
```

**Problem**: [What went wrong]

**Refined**:
```
[Improved prompt text]
```

**Rationale**: [Why this is better]

## Documentation Updates

### Update: CLAUDE.md
**Section**: [Section name]
**Change**: [Proposed addition/modification]
**Reason**: [Why needed based on learnings]

## Cumulative Learnings Integration
[How to merge these findings with existing REFLECTION_LOG.md]
```

## Workflow

1. **Receive target spec name** from user or orchestrator
2. **Read REFLECTION_LOG.md** from that spec
3. **Extract all learnings** using methodology above
4. **Identify patterns** across phases
5. **Generate meta-reflection** document
6. **Save to** `specs/[spec-name]/outputs/meta-reflection.md`
7. **Propose updates** to spec files and repository docs

## Critical Rules

1. **Evidence-based** - Every recommendation must cite specific reflection entries
2. **Actionable** - Propose concrete changes, not vague improvements
3. **Integrated** - Show how to merge learnings with existing logs
4. **Prioritized** - Focus on high-impact, recurring patterns
5. **Effect-aware** - All code examples must use Effect patterns

## Output Location

Meta-reflections are saved to:
```
specs/[spec-name]/outputs/meta-reflection.md
```

Proposed documentation updates are included in the meta-reflection but not applied automatically. The orchestrator decides which updates to make.
```

---

### Example Handoff Template

```markdown
# New Specialized Agents Handoff — Phase 4.2 (Agent 2) to Phase 4.3 (Agent 3)

## Session Summary: Phase 4.2 Completed

| Metric | Before | After | Status |
|--------|--------|-------|--------|
| Agents created | 1 (reflector) | 2 (reflector, codebase-researcher) | ✅ Complete |
| Agent tests performed | 1 | 2 | ✅ Complete |
| Documentation updated | No | Yes (README.md) | ✅ Complete |

## Lessons Learned

### What Worked Well
- **Detailed knowledge sources section** - Having explicit file paths in "Your Knowledge Sources" made agent prompts immediately actionable
- **Step-by-step methodology** - Breaking agent workflow into numbered phases (Phase 1: Extract, Phase 2: Identify, etc.) improved clarity
- **Before/after examples** - Including example outputs in agent definitions helped validate agent behavior

### What Needed Adjustment
- **Initial agent was too verbose** - First draft of `codebase-researcher.md` was 520 lines; reduced to 380 by removing redundant examples
- **Knowledge source paths need validation** - Referenced files that didn't exist; added verification step before finalizing agent
- **Output format too prescriptive** - Initial markdown template was too rigid; relaxed to allow agent discretion

### Prompt Improvements

**Original instruction**: "Create the codebase-researcher agent definition"
**Problem**: No guidance on balancing comprehensiveness vs brevity
**Refined instruction**: "Create the codebase-researcher agent definition (350-450 lines). Include 2-3 output examples but avoid exhaustive pattern catalogs. Focus on methodology over examples."

## Remaining Work: Phase 4.3 Items

### Task: Create mcp-researcher Agent
**Priority**: HIGH
**Dependencies**: None
**Estimated effort**: 30 minutes

**Sub-agent prompt**:
```markdown
Create the `mcp-researcher.md` agent definition following the template at `.claude/agents/templates/agents-md-template.md`.

**Agent Purpose**: Research Effect documentation via MCP tools and extract relevant patterns.

**Core Capabilities**:
- Search Effect docs via `mcp__effect_docs__effect_docs_search`
- Retrieve detailed docs via `mcp__effect_docs__get_effect_doc`
- Extract code examples and best practices
- Synthesize patterns for specific use cases

**Target length**: 300-400 lines

**Required sections**:
1. Frontmatter with name, description, model
2. Your Knowledge Sources (MCP tools, Effect docs, codebase)
3. Research Methodology (4-5 phase workflow)
4. Output Format (markdown template with examples)
5. Workflow (step-by-step execution)
6. Critical Rules (MCP usage, Effect patterns)
7. Output Location

**Validation**:
- [ ] Follows template structure
- [ ] All referenced files exist
- [ ] Code examples use Effect patterns (namespace imports, Effect.gen)
- [ ] Output format compatible with spec workflow
- [ ] Length within target range

Save to: `.claude/agents/mcp-researcher.md`
```

## Improved Sub-Agent Prompts

### Agent Creation Prompt (v2)
Based on learnings from reflector and codebase-researcher creation:

```markdown
Create the `[agent-name].md` agent definition following the template.

**Constraints**:
- Target length: [X-Y] lines (enforce strictly)
- Include 2-3 output examples (not exhaustive catalog)
- Validate all file path references before finalizing
- Use flexible output templates (not overly prescriptive)

**Validation checklist**:
- [ ] Frontmatter complete and accurate
- [ ] All knowledge sources exist and are accessible
- [ ] Methodology is step-by-step and actionable
- [ ] Output format includes examples
- [ ] Code examples use Effect patterns
- [ ] Critical rules are specific and testable
- [ ] Output location is clear

**Testing**:
After creation, test agent with a sample task to verify:
1. Agent understands its purpose
2. Agent can access knowledge sources
3. Agent produces expected output format
4. Agent follows critical rules
```

## P4.3 Orchestrator Prompt

### Context from Phase 4.2 Completion
We have successfully created 2 of 9 agents:
1. **reflector** (380 lines) - Meta-learning from reflection logs
2. **codebase-researcher** (390 lines) - Systematic codebase exploration

Both agents have been validated and tested. Learnings captured above.

### Your Mission
Create the `mcp-researcher` agent following the improved sub-agent prompt template. Apply learnings from Phase 4.2 to avoid verbosity and ensure all references are valid.

### Execution Protocol
1. Read `.claude/agents/templates/agents-md-template.md` for structure
2. Research MCP tools available (`mcp__effect_docs__*`)
3. Draft agent definition following template
4. Validate all file path references
5. Test agent with sample Effect pattern research task
6. Refine based on test results
7. Save to `.claude/agents/mcp-researcher.md`
8. Update `specs/new-specialized-agents/README.md` progress tracker
9. Generate Phase 4.3 to 4.4 handoff

### Success Criteria
- [ ] Agent definition created at `.claude/agents/mcp-researcher.md`
- [ ] Length is 300-400 lines
- [ ] All referenced files exist
- [ ] Code examples use Effect patterns
- [ ] Agent tested with sample task
- [ ] Handoff to Phase 4.4 generated

### Verification Commands
```bash
# Validate file exists
ls -lh .claude/agents/mcp-researcher.md

# Check length
wc -l .claude/agents/mcp-researcher.md

# Verify Effect patterns (no async/await)
grep -i "async\|await" .claude/agents/mcp-researcher.md && echo "FAIL: Contains async/await" || echo "PASS"
```

## Notes for Next Agent

- MCP tools are documented in the main README and available via tool calls
- Effect docs are comprehensive; focus on patterns relevant to beep-effect use cases
- The agent should teach how to use MCP tools, not just use them
- Output should be actionable for developers (not just raw doc dumps)
```

---

## Verification Checklist

- [ ] 9 agent definitions created in `.claude/agents/`
- [ ] Each agent follows template from `agents-md-template.md`
- [ ] `MASTER_ORCHESTRATION.md` created with phase workflow
- [ ] `AGENT_PROMPTS.md` created with creation prompts
- [ ] `RUBRICS.md` created with evaluation criteria
- [ ] Agent outputs align with META_SPEC_TEMPLATE structure
- [ ] All code examples use Effect patterns (no async/await, native methods)
- [ ] All agents reference actual repository files (no broken links)
- [ ] Integration with handoff workflow documented
- [ ] Reflection protocol enhancement documented
- [ ] `bun run lint` passes
- [ ] `bun run check` passes

---

## Metadata

### Research Sources

**Files Explored**:
- `/home/elpresidank/YeeBois/projects/beep-effect/specs/SPEC_STANDARDIZATION_PROMPT.md` - Spec folder conventions
- `/home/elpresidank/YeeBois/projects/beep-effect/specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md` - Self-improving spec pattern
- `/home/elpresidank/YeeBois/projects/beep-effect/specs/ai-friendliness-audit/REFLECTION_LOG.md` - Reflection protocol example
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/templates/agents-md-template.md` - Agent template structure
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/effect-researcher.md` - Example specialized agent
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/EFFECT_PATTERNS.md` - Effect idioms
- `/home/elpresidank/YeeBois/projects/beep-effect/tooling/testkit/AGENTS.md` - Testing infrastructure

**Documentation Referenced**:
- META_SPEC_TEMPLATE pattern (standard phases 0-4+)
- SPEC_STANDARDIZATION_PROMPT (folder conventions)
- Agent template conventions (frontmatter, sections, output locations)

**Package Guidelines**:
- CLAUDE.md - Repository-wide Effect-first constraints
- `.claude/rules/*.md` - Behavioral and pattern rules
- Effect pattern ban list - Native methods, async/await, switch statements

### Refinement History

| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0 | Initial draft | N/A |
| 1 | Phase alignment, handoff structure, output locations | Aligned with META_SPEC_TEMPLATE phases, added standard handoff structure, clarified output directories |

---

## Refinement Notes (Iteration 1)

### Key Changes from Original

1. **Phase Structure Realignment**
   - **Original**: 5 custom phases (Folder Structure, Agent Definitions, Phase Breakdown, Agent Output Protocols, Reflection Protocol)
   - **Refined**: Standard META_SPEC_TEMPLATE phases (0: Scaffolding, 1: Discovery, 2: Evaluation, 3: Synthesis, 4+: Iterative Execution)
   - **Rationale**: Consistency with established spec pattern makes this spec more maintainable and understandable

2. **Handoff Template Integration**
   - **Original**: No explicit handoff structure
   - **Refined**: Detailed handoff template following META_SPEC_TEMPLATE pattern
   - **Rationale**: Handoffs are critical for multi-session work; providing explicit structure ensures consistency

3. **Output Location Clarification**
   - **Original**: Vague about where outputs go
   - **Refined**: Explicit mapping to `outputs/`, `templates/`, `handoffs/`, `.claude/agents/`
   - **Rationale**: Clear output locations prevent confusion and maintain spec folder conventions

4. **Self-Referential Bootstrap**
   - **Original**: Not mentioned
   - **Refined**: Added note that this spec itself follows META_SPEC_TEMPLATE
   - **Rationale**: Dogfooding ensures the spec pattern works for complex orchestration

5. **Agent Output Protocol Integration**
   - **Original**: Separate phase for "Agent Output Protocols"
   - **Refined**: Integrated into agent definitions and handoff structure
   - **Rationale**: Output protocols are inherent to agent design, not a separate deliverable

6. **Reflection Protocol Enhancement**
   - **Original**: Separate phase for "Reflection Protocol"
   - **Refined**: Integrated throughout phases with specific reflection questions
   - **Rationale**: Reflection is continuous, not a one-time deliverable
