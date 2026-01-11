---
name: new-specialized-agents
version: 1
created: 2026-01-10T14:30:00Z
iterations: 0
---

# New Specialized Agents - Refined Prompt

## Context

### Repository State
The `beep-effect` monorepo currently has a spec workflow that operates across multiple sessions with handoffs. The spec pattern is documented in `/home/elpresidank/YeeBois/projects/beep-effect/specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md` and has proven effective through 4 distinct phases, generating 17 files and 4,778 lines of orchestration artifacts.

### Current Spec Structure (from META_SPEC_TEMPLATE.md)
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
The current spec workflow lacks:
1. **Standardized folder structure** - Specs have inconsistent subdirectories and file naming
2. **Specialized sub-agents** - Generic agents aren't optimized for spec-specific phases
3. **Formal phase definitions** - No clear phase boundaries with handoff protocols
4. **Agent output conventions** - Sub-agents don't produce structured reflections
5. **Reflection feedback loops** - No systematic improvement of prompts between phases

## Objective

Design and implement a comprehensive spec workflow enhancement that:

1. **Standardizes spec folder structure** across all specs in `specs/`
2. **Creates 9 specialized sub-agents** optimized for spec workflow phases
3. **Defines 7 formal phases** from initialization through review
4. **Establishes agent output protocols** for reflections and handoffs
5. **Implements reflection feedback loops** for continuous improvement

### Success Criteria
- [ ] Spec folder structure convention documented in `specs/CONVENTIONS.md`
- [ ] 9 new agent definitions created in `.claude/agents/`
- [ ] Each agent has been reviewed by critic agents (up to 3 cycles)
- [ ] Phase breakdown documented with handoff templates
- [ ] Reflection protocol defined with meta-learning capabilities
- [ ] All new agents follow the template in `.claude/agents/templates/agents-md-template.md`
- [ ] Integration with existing `META_SPEC_TEMPLATE.md` pattern
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
- Spec folders without `README.md` and `REFLECTION_LOG.md`
- Cross-references to non-existent files
- MCP tool shortcuts in AGENTS.md files
- Named imports from Effect (`import { Effect }`)
- `async/await` in code examples
- Native array/string methods in examples
- Vague documentation without specific examples

### Required Patterns
- All agent definitions MUST follow `.claude/agents/templates/agents-md-template.md`
- All spec folders MUST have `README.md` and `REFLECTION_LOG.md`
- All code examples MUST use namespace imports and Effect patterns
- All phase definitions MUST include handoff document templates
- All reflection logs MUST follow the protocol from `specs/ai-friendliness-audit/REFLECTION_LOG.md`
- Folder structure MUST align with `META_SPEC_TEMPLATE.md` conventions

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

### Phase 1: Folder Structure Convention (1 file)
**File**: `specs/CONVENTIONS.md` (200-300 lines)

**Structure**:
```markdown
# Spec Folder Structure Conventions

## Standard Structure
[Detailed breakdown of required files and directories]

## File Naming Conventions
[Kebab-case, PascalCase, SCREAMING_SNAKE_CASE rules]

## Subdirectory Purposes
- templates/ - Output templates for each phase
- outputs/ - Generated artifacts from phase execution
- handoffs/ - Inter-phase transition documents
- research/ - Sub-agent research outputs
- reflections/ - Phase-level reflection logs

## Integration with META_SPEC_TEMPLATE.md
[How this extends the existing pattern]

## Migration Guide
[Steps to bring existing specs into compliance]
```

### Phase 2: Agent Definitions (9 files in `.claude/agents/`)

Each agent file MUST follow this structure (from template):
```markdown
---
name: agent-name
description: |
  Brief description of purpose and when to use this agent.

  Examples of usage scenarios.
model: sonnet
---

[Agent expertise statement]

## Your Knowledge Sources
[What documentation, source code, or tools the agent consults]

## Research Methodology
[Step-by-step process for the agent's work]

## Output Formats
[Precise specification of deliverables]

## [Domain-Specific Sections]
[Pattern libraries, idiom references, etc.]

## Workflow
[Execution protocol]

## Critical Rules
[Non-negotiable constraints]

## Output Location
[Where the agent saves its work]
```

**Required Agents**:

1. **`reflector.md`** (300-400 lines)
   - Analyzes sub-agent and orchestrator reflections
   - Identifies patterns in what worked/didn't work
   - Generates improved prompts for next phase
   - Updates repository documentation to prevent recurring issues
   - **Key knowledge**: Reflection log protocol, prompt engineering patterns
   - **Output**: `reflections/phase-N-meta-reflection.md`, updated prompts

2. **`codebase-researcher.md`** (350-450 lines)
   - Performs systematic codebase exploration
   - Maps file dependencies and architecture
   - Identifies relevant patterns and existing implementations
   - **Key knowledge**: Repository structure, import graph analysis, Effect patterns
   - **Output**: `research/codebase-analysis.md`

3. **`web-researcher.md`** (250-350 lines)
   - Searches web for best practices and solutions
   - Cross-references multiple sources
   - Synthesizes findings into actionable recommendations
   - **Key knowledge**: Web search strategies, source validation
   - **Output**: `research/web-research.md`

4. **`mcp-researcher.md`** (300-400 lines)
   - Uses MCP tools to research Effect documentation
   - Queries `mcp__effect_docs__effect_docs_search` for patterns
   - Retrieves detailed docs via `mcp__effect_docs__get_effect_doc`
   - **Key knowledge**: Effect ecosystem, MCP tool usage
   - **Output**: `research/effect-patterns.md`

5. **`code-reviewer.md`** (400-500 lines)
   - Reviews code for repository guideline compliance
   - Checks Effect pattern adherence
   - Validates architecture boundaries
   - Identifies anti-patterns and suggests fixes
   - **Key knowledge**: CLAUDE.md rules, AGENTS.md patterns, Effect idioms
   - **Output**: `outputs/code-review-report.md`

6. **`code-observability-writer.md`** (350-450 lines)
   - Adds `Schema.TaggedError` error definitions
   - Implements `Effect.log*` structured logging
   - Adds tracing spans and metrics
   - Enhances debugging with `Cause` tracking
   - **Key knowledge**: `effect/Cause`, `effect/Logger`, `effect/Metric`, `effect/Tracer`
   - **Output**: Modified source files with observability enhancements

7. **`doc-writer.md`** (400-500 lines)
   - Creates JSDoc comments with `@example`, `@category`, `@since`
   - Writes markdown documentation files
   - Ensures compliance with `docgen` standards
   - **Key knowledge**: `documentation/cli/docgen/`, JSDoc conventions
   - **Output**: Updated source files, markdown docs in `docs/`

8. **`architecture-pattern-enforcer.md`** (450-550 lines)
   - Validates folder structure against conventions
   - Ensures consistent layering (domain -> tables -> infra -> client -> ui)
   - Checks naming conventions
   - Reviews module exports and surface area
   - **Key knowledge**: Package structure, layer dependencies, import boundaries
   - **Output**: `outputs/architecture-audit.md`, proposed restructuring

9. **`test-writer.md`** (500-600 lines)
   - Writes Effect-first unit and integration tests
   - Uses `@beep/testkit` patterns (`effect`, `scoped`, `layer`)
   - Implements property-based tests with `effect/Arbitrary`
   - Controls time with `effect/TestClock`
   - Injects test config with `effect/Config`
   - **Key knowledge**: `tooling/testkit/AGENTS.md`, Effect testing patterns
   - **Output**: `*.test.ts` files adjacent to source

**Agent Research Process**:
For each agent, deploy sub-agents to:
1. Research optimal implementation approach
2. Draft agent definition in markdown
3. Submit to critic agents for review (up to 3 cycles)
4. Incorporate feedback and finalize
5. Save to `.claude/agents/[agent-name].md`

### Phase 3: Phase Breakdown Documentation (1 file + 7 templates)

**File**: `specs/PHASE_DEFINITIONS.md` (400-600 lines)

**Structure**:
```markdown
# Spec Workflow Phase Definitions

## Phase Overview
[7 phases with dependencies and outputs]

## Phase 1: Initialization
**Purpose**: [...]
**Inputs**: Raw prompt
**Outputs**: Spec folder structure, initial research plan
**Duration**: 15-30 minutes
**Handoff Template**: [Link to template]

## Phase 2: Research
[...]

## Phase 3: Planning
[...]

## Phase 4: Boilerplating
[...]

## Phase 5: Implementation
[...]

## Phase 6: Testing (Optional)
[...]

## Phase 7: Review
[...]

## Handoff Protocol
[How to transition between phases]

## Context Preservation
[Best practices for maintaining context across sessions]
```

**Handoff Templates** (7 files in `specs/templates/handoffs/`):
- `phase-1-to-2-handoff.template.md`
- `phase-2-to-3-handoff.template.md`
- `phase-3-to-4-handoff.template.md`
- `phase-4-to-5-handoff.template.md`
- `phase-5-to-6-handoff.template.md`
- `phase-6-to-7-handoff.template.md`
- `phase-7-complete-handoff.template.md`

Each template follows the structure from `META_SPEC_TEMPLATE.md`:
```markdown
# [Spec Name] Handoff — P[N-1] to P[N]

## Session Summary: P[N-1] Completed
| Metric | Before | After | Status |

## Lessons Learned
### What Worked Well
### What Needed Adjustment
### Prompt Improvements

## Remaining Work: P[N] Items
[Prioritized task list]

## Improved Sub-Agent Prompts
[Refined prompts incorporating learnings]

## P[N] Orchestrator Prompt
[Ready-to-use prompt for next session]

## Verification Commands
## Success Criteria
## Notes for Next Agent
```

### Phase 4: Agent Output Protocols (1 file)

**File**: `specs/AGENT_OUTPUT_PROTOCOLS.md` (250-350 lines)

**Structure**:
```markdown
# Agent Output Protocols

## Required Output Files
Every sub-agent MUST produce:
- reflection.md
- summary.md
- initial-prompt.md

## File Locations
[Where each type of output goes in spec folder structure]

## Reflection.md Format
[Template from REFLECTION_LOG.md]

## Summary.md Format
[Brief overview of work completed]

## Initial-Prompt.md Format
[Exact copy of deployment prompt for reproducibility]

## Integration with Phase Handoffs
[How agent outputs feed into handoff documents]
```

### Phase 5: Reflection Protocol Enhancement (1 file)

**File**: `specs/REFLECTION_PROTOCOL.md` (300-400 lines)

**Structure**:
```markdown
# Reflection Protocol

## Purpose
[Self-improving spec methodology]

## Reflection Levels
1. Sub-agent reflections
2. Orchestrator reflections
3. Meta-reflections (by reflector agent)

## Reflection Template
[From REFLECTION_LOG.md with enhancements]

## Meta-Learning Process
[How reflector agent synthesizes improvements]

## Documentation Update Protocol
[When and how to update CLAUDE.md, AGENTS.md, etc.]

## Prompt Evolution Tracking
[Versioning refined prompts]

## Feedback Loop Metrics
[What to measure for continuous improvement]
```

## Examples

### Example Agent Definition (test-writer.md excerpt)
```markdown
---
name: test-writer
description: |
  Effect-first test writer for the beep-effect repository.

  Use this agent when you need to:
  - Write unit tests with Effect.gen patterns
  - Create integration tests with Layer composition
  - Implement property-based tests with effect/Arbitrary
  - Control time in tests with effect/TestClock

  Examples:
  - "Write tests for the UserRepo service"
  - "Add property-based tests for the validation logic"
  - "Create integration tests for the database layer"
model: sonnet
---

You are an expert Effect-TS test writer specializing in the @beep/testkit framework.

## Your Knowledge Sources

### 1. Testkit Infrastructure
Read `/home/elpresidank/YeeBois/projects/beep-effect/tooling/testkit/AGENTS.md` for:
- `effect`, `scoped`, `layer` patterns
- Layer-based test orchestration
- Effect-aware assertions
- Flaky test handling

### 2. Effect Testing Modules
Explore `node_modules/effect/src/` for:
- `Arbitrary.ts` - Property-based test data generation
- `TestClock.ts` - Time control in tests
- `Config.ts` - Test configuration injection

### 3. Repository Test Examples
Search the codebase for `*.test.ts` files to understand:
- Existing test patterns
- Layer composition for integration tests
- Mocking strategies

## Research Methodology

### Phase 1: Understand the Code Under Test
1. Read the source file(s) to be tested
2. Identify:
   - Service dependencies (via Context.Tag)
   - Error types (Schema.TaggedError)
   - Effect return types
   - Side effects requiring mocking

### Phase 2: Design Test Strategy
1. **Unit tests**: Test individual functions in isolation
2. **Integration tests**: Test service composition with real layers
3. **Property tests**: For pure functions with complex logic

### Phase 3: Implement Tests
Use appropriate testkit patterns:
- `effect` for simple Effect tests
- `scoped` for resource cleanup
- `layer` for integration tests with dependencies

## Output Format

```typescript
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as A from "effect/Array"
import { effect, layer } from "@beep/testkit"
import * as Duration from "effect/Duration"

// Unit test example
effect("validates user input", () =>
  Effect.gen(function* () {
    const result = yield* validateUser({ name: "Alice" })
    expect(result).toEqual({ name: "Alice" })
  })
)

// Integration test example
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

## Critical Rules

1. **ALWAYS use namespace imports** - `import * as Effect from "effect/Effect"`
2. **NEVER use async/await** - All async via Effect.gen
3. **Use testkit helpers** - Don't wrap Bun's `it` manually
4. **Layer cleanup** - Let `layer` helper manage memo maps
5. **Type assertions** - Use Effect-aware assertions from testkit
6. **Resource safety** - Use `scoped` for cleanup-requiring resources

## Output Location

Tests go adjacent to source files:
```
src/
  UserRepo.ts
  UserRepo.test.ts  ← Here
```
```

### Example Handoff Template
```markdown
# [Spec Name] Handoff — Phase 3 (Planning) to Phase 4 (Boilerplating)

## Session Summary: Phase 3 Completed

| Metric | Before | After | Status |
|--------|--------|-------|--------|
| Tasks defined | 0 | 47 | ✅ Complete |
| Boilerplate targets identified | 0 | 23 files | ✅ Complete |
| Architecture reviewed | No | Yes | ✅ Complete |

## Lessons Learned

### What Worked Well
- Breaking implementation into atomic tasks (one file per task)
- Identifying all Schema definitions upfront prevented rework
- Grouping tasks by package reduced context switching

### What Needed Adjustment
- Initial task list was too granular (127 tasks → 47 after consolidation)
- Needed explicit "create test stubs" tasks, not just implementation tasks
- Architecture review should happen BEFORE task breakdown, not after

### Prompt Improvements

**Original instruction**: "Create a task list for implementing the spec"
**Problem**: No guidance on task granularity or grouping
**Refined instruction**: "Create a task list with 40-60 tasks, grouped by package and layer. Each task should modify 1-3 files and take 5-15 minutes."

## Remaining Work: Phase 4 Items

### P4.1 - Create Domain Layer Boilerplate (12 tasks)
1. Create `EmailTemplate.model.ts` with Schema definitions
2. Create `EmailTemplateRepo.ts` interface
3. Add error types: `EmailTemplateNotFoundError`, `EmailTemplateValidationError`
4. [...]

### P4.2 - Create Tables Layer Boilerplate (8 tasks)
[...]

### P4.3 - Create Server Layer Boilerplate (15 tasks)
[...]

## Improved Sub-Agent Prompts

### Code-Writer Sub-Agent (Boilerplating)
```markdown
You are creating boilerplate files for the [Spec Name] implementation.

CRITICAL CONSTRAINTS:
- Create ONLY stubs, types, and JSDoc comments
- Do NOT implement business logic (that's Phase 5)
- Every function body should be: `return Effect.dieMessage("Not implemented")`
- Add comprehensive JSDoc with @example blocks
- Include all imports and type signatures

For each file:
1. Read the task description
2. Create the file with complete imports
3. Define types and schemas
4. Write function stubs with JSDoc
5. Ensure the file passes `bun run check`

Example stub:
\`\`\`typescript
/**
 * Retrieves email template by ID.
 *
 * @category Queries
 * @since 1.0.0
 * @example
 * import * as Effect from "effect/Effect"
 * import { EmailTemplateRepo } from "@beep/comms-domain"
 *
 * const program = Effect.gen(function* () {
 *   const repo = yield* EmailTemplateRepo
 *   return yield* repo.findById("template-123")
 * })
 */
export const findById = (id: EmailTemplateId): Effect.Effect<
  EmailTemplate,
  EmailTemplateNotFoundError,
  EmailTemplateRepo
> => Effect.dieMessage("Not implemented")
\`\`\`
```

## P4 Orchestrator Prompt

### Context from Phase 3 Completion
We have a detailed task list with 47 tasks grouped by package and layer. Architecture has been reviewed and approved. All Schema definitions are planned.

### Your Mission
Deploy code-writer sub-agents to create boilerplate files based on the Phase 3 task list. Focus ONLY on creating stubs, types, and documentation. Do NOT implement business logic.

### Execution Protocol
1. For each package (domain, tables, server):
   a. Deploy code-writer with tasks for that package
   b. Verify files pass `bun run check`
   c. Record reflection in `reflections/phase-4-[package].md`
2. After all packages:
   a. Run `bun run lint:fix`
   b. Run `bun run check` for entire monorepo
   c. Generate Phase 4 completion reflection
3. Create `handoffs/HANDOFF_P4_TO_P5.md` with:
   - What was created
   - What worked well
   - Issues encountered
   - Improved prompts for Phase 5

### Success Criteria
- [ ] All 47 tasks completed
- [ ] All files pass `bun run check`
- [ ] All files have JSDoc comments
- [ ] No business logic implemented
- [ ] Phase 4 reflection created
- [ ] Handoff to Phase 5 generated

### Verification Commands
```bash
bun run check
bun run lint
```

## Notes for Next Agent

- The domain layer is the foundation; start there
- Tables layer depends on domain schemas being defined
- Use `Effect.dieMessage` for unimplemented functions, not `Effect.fail`
- Every export needs a JSDoc @example block
- Schema.TaggedError classes need both Encoded and Type defined
```

## Verification Checklist

- [ ] `specs/CONVENTIONS.md` created with folder structure convention
- [ ] All 9 agent files created in `.claude/agents/`
- [ ] Each agent follows template structure from `agents-md-template.md`
- [ ] Each agent has been reviewed by critic agents (3 cycles max)
- [ ] `specs/PHASE_DEFINITIONS.md` created with 7 phase definitions
- [ ] 7 handoff templates created in `specs/templates/handoffs/`
- [ ] `specs/AGENT_OUTPUT_PROTOCOLS.md` created
- [ ] `specs/REFLECTION_PROTOCOL.md` created
- [ ] All code examples use Effect patterns (no async/await, native methods)
- [ ] All agents reference actual repository files (no broken links)
- [ ] Integration with `META_SPEC_TEMPLATE.md` documented
- [ ] `bun run lint` passes
- [ ] `bun run check` passes

---

## Metadata

### Research Sources

**Files Explored**:
- `/home/elpresidank/YeeBois/projects/beep-effect/specs/README.md` - Spec index and current structure
- `/home/elpresidank/YeeBois/projects/beep-effect/specs/SPEC_STANDARDIZATION_PROMPT.md` - Standardization workflow
- `/home/elpresidank/YeeBois/projects/beep-effect/specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md` - Self-improving spec pattern
- `/home/elpresidank/YeeBois/projects/beep-effect/specs/ai-friendliness-audit/REFLECTION_LOG.md` - Reflection protocol
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/templates/agents-md-template.md` - Agent template structure
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/agents/effect-researcher.md` - Example specialized agent
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/EFFECT_PATTERNS.md` - Effect idioms
- `/home/elpresidank/YeeBois/projects/beep-effect/tooling/testkit/AGENTS.md` - Testing infrastructure
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/cli/docgen/DOCGEN_AGENTS.md` - Documentation agents

**Documentation Referenced**:
- Effect documentation via `mcp__effect_docs__*` tools
- META_SPEC_TEMPLATE pattern (self-improving specs)
- Agent template conventions

**Package Guidelines**:
- CLAUDE.md - Repository-wide Effect-first constraints
- AGENTS.md pattern - Package-level documentation standards
- Effect pattern ban list - Native methods, async/await, switch statements

### Refinement History

| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial draft | N/A          |

---

## Critical Implementation Notes

### Phase Breakdown Cost-Benefit Analysis

The original prompt suggested 7 phases. Analysis:

**Phase 1: Initialization** - ✅ KEEP
- **Benefit**: Sets up structure, gathers context, prevents false starts
- **Cost**: 15-30 minutes
- **Verdict**: Essential foundation

**Phase 2: Research** - ✅ KEEP
- **Benefit**: Discovers existing patterns, prevents reinvention
- **Cost**: 20-40 minutes
- **Verdict**: High ROI for complex features

**Phase 3: Planning** - ✅ KEEP
- **Benefit**: Atomic tasks prevent overwhelming later phases
- **Cost**: 15-30 minutes
- **Verdict**: Critical for multi-file implementations

**Phase 4: Boilerplating** - ✅ KEEP
- **Benefit**: TypeScript errors guide implementation, JSDoc prevents misuse
- **Cost**: 30-60 minutes
- **Verdict**: Prevents rework, enforces documentation

**Phase 5: Implementation** - ✅ KEEP
- **Benefit**: Core work happens here
- **Cost**: 1-4 hours depending on spec
- **Verdict**: Non-negotiable

**Phase 6: Testing** - ✅ KEEP (OPTIONAL)
- **Benefit**: Catches bugs early, documents expected behavior
- **Cost**: 30-90 minutes
- **Verdict**: Optional but recommended for domain/server layers

**Phase 7: Review** - ✅ KEEP
- **Benefit**: Ensures alignment with repository standards
- **Cost**: 15-30 minutes
- **Verdict**: Prevents tech debt accumulation

**Total Time**: 2.5 - 7 hours for a complex spec (acceptable for multi-session work)

### Agent Typo Corrections

Original prompt had:
- `recflector` → **`reflector`** ✅
- `code-reviwer` → **`code-reviewer`** ✅

### Folder Structure Refinement

Enhanced subdirectories beyond META_SPEC_TEMPLATE:
- `research/` - Sub-agent research outputs (new)
- `reflections/` - Phase-level reflection logs (new)
- `templates/handoffs/` - Handoff document templates (new)

This separates research artifacts from execution outputs and provides dedicated space for reflection logs.
