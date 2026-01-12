# Spec Creation Guide

> Agent-assisted workflow for creating and maintaining self-improving specifications.

---

## Overview

This guide describes how to create specifications using the specialized agents in `.claude/agents/`. Each phase of spec creation is enhanced by purpose-built agents that handle research, validation, documentation, and continuous improvement.

**Key Principle**: Specs are living documents. The specialized agents form a continuous improvement loop where each execution refines both the deliverable AND the methodology.

---

## Agent-Phase Mapping

> **Reference**: See `.claude/agents-manifest.yaml` for complete agent capabilities.

### Agent Capability Legend

| Capability | Meaning | Example Agents |
|------------|---------|----------------|
| **read-only** | Informs orchestrator, produces NO artifacts | `codebase-researcher`, `mcp-researcher` |
| **write-reports** | Produces markdown reports in `outputs/` | `code-reviewer`, `reflector` |
| **write-files** | Creates/modifies source files | `doc-writer`, `test-writer` |

### Phase-Agent Matrix

| Phase | Agent | Capability | Output |
|-------|-------|------------|--------|
| **0: Scaffolding** | `doc-writer` | **write-files** | Creates README.md, structure files |
| **0: Scaffolding** | `architecture-pattern-enforcer` | write-reports | `outputs/structure-review.md` |
| **1: Discovery** | `codebase-researcher` | read-only | *Informs orchestrator only* |
| **1: Discovery** | `mcp-researcher` | read-only | *Informs orchestrator only* |
| **1: Discovery** | `web-researcher` | read-only | *Informs orchestrator only* |
| **2: Evaluation** | `code-reviewer` | write-reports | `outputs/guideline-review.md` |
| **2: Evaluation** | `architecture-pattern-enforcer` | write-reports | `outputs/architecture-review.md` |
| **2: Evaluation** | `spec-reviewer` | write-reports | `outputs/spec-review.md` |
| **3: Synthesis** | `reflector` | write-reports | `outputs/meta-reflection-*.md` |
| **3: Synthesis** | `doc-writer` | **write-files** | Creates MASTER_ORCHESTRATION.md, plans |
| **4+: Iteration** | `test-writer` | **write-files** | Creates `*.test.ts` files |
| **4+: Iteration** | `code-observability-writer` | **write-files** | Modifies source with logging/tracing |
| **4+: Iteration** | `package-error-fixer` | **write-files** | Fixes type/build/lint errors |

### Quick Selection Guide

**Need a report/artifact?** Use agents with `write-reports` or `write-files` capability:
- Reports: `code-reviewer`, `architecture-pattern-enforcer`, `reflector`, `spec-reviewer`
- Documentation: `doc-writer`, `agents-md-updater`, `readme-updater`
- Code/Tests: `test-writer`, `code-observability-writer`, `jsdoc-fixer`

**Need information only?** Use `read-only` agents:
- Codebase: `codebase-researcher`
- Effect docs: `mcp-researcher`, `effect-schema-expert`
- External: `web-researcher`

---

## Phase 0: Scaffolding

### Purpose
Create the specification framework with proper structure.

### Agent Tasks

#### Task 0.1: Generate Spec Structure (doc-writer)

```
Use the doc-writer agent to create initial spec structure.

Target: specs/[SPEC_NAME]/
Required files:
- README.md (100-150 lines) - Entry point
- REFLECTION_LOG.md - Empty, ready for learnings
- templates/ directory - If output templates needed
- outputs/ directory - For phase artifacts

Follow META_SPEC_TEMPLATE structure from specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md
```

#### Task 0.2: Validate Structure (architecture-pattern-enforcer)

```
Use the architecture-pattern-enforcer agent to validate spec structure.

Check:
- README.md exists and follows template
- REFLECTION_LOG.md exists
- Directory structure matches META_SPEC_TEMPLATE
- No orphaned files outside standard structure
```

### Output Checklist
- [ ] `specs/[SPEC_NAME]/README.md` created
- [ ] `specs/[SPEC_NAME]/REFLECTION_LOG.md` created
- [ ] Directory structure validated

---

## Phase 1: Discovery

### Purpose
Gather context and map the problem space. **Read-only analysis.**

### Agent Tasks

#### Task 1.1: Codebase Exploration (codebase-researcher)

```
Use the codebase-researcher agent to systematically explore relevant code.

Research questions:
1. What existing patterns relate to this spec?
2. What files/packages will be affected?
3. What dependencies exist?
4. What test patterns are in place?

Output: outputs/codebase-context.md
```

#### Task 1.2: Effect Documentation Research (mcp-researcher)

For specs involving Effect patterns:

```
Use the mcp-researcher agent to research Effect documentation.

Search topics based on spec domain:
- Effect patterns relevant to the spec
- Schema definitions needed
- Layer composition approaches
- Error handling patterns

Output: outputs/effect-research.md
```

#### Task 1.3: External Research (web-researcher)

For specs requiring external context:

```
Use the web-researcher agent to research external sources.

Research topics:
- Best practices for [domain]
- Prior art and implementations
- Common pitfalls to avoid

Output: outputs/external-research.md
```

### Self-Reflection Checkpoint

After Phase 1, answer:
- What detection methods worked? Which failed?
- What codebase-specific patterns emerged?
- What research gaps remain?

Log to `REFLECTION_LOG.md`.

### Output Checklist
- [ ] `outputs/codebase-context.md` generated
- [ ] `outputs/effect-research.md` generated (if applicable)
- [ ] `outputs/external-research.md` generated (if applicable)
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings

---

## Phase 2: Evaluation

### Purpose
Apply rubrics and generate scored findings.

### Agent Tasks

#### Task 2.1: Guideline Review (code-reviewer)

```
Use the code-reviewer agent to evaluate against repository guidelines.

Check against:
- Effect patterns (.claude/rules/effect-patterns.md)
- Architecture boundaries (.claude/rules/general.md)
- Code quality standards

Output: outputs/guideline-review.md
```

#### Task 2.2: Structure Validation (architecture-pattern-enforcer)

```
Use the architecture-pattern-enforcer agent to validate architecture.

Validate:
- Layer dependency order (domain -> tables -> server -> client -> ui)
- Cross-slice import restrictions
- Path alias usage (@beep/*)
- Module organization

Output: outputs/architecture-review.md
```

### Self-Reflection Checkpoint

After Phase 2, answer:
- Were rubric thresholds appropriate?
- Did sampling provide representative data?
- What evidence verification techniques worked?

Log to `REFLECTION_LOG.md`.

### Output Checklist
- [ ] `outputs/guideline-review.md` generated
- [ ] `outputs/architecture-review.md` generated
- [ ] Scored evaluation complete
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings

---

## Phase 3: Synthesis

### Purpose
Generate actionable plans and improve methodology.

### Agent Tasks

#### Task 3.1: Prompt Improvement (reflector)

```
Use the reflector agent to analyze REFLECTION_LOG and improve prompts.

Input: REFLECTION_LOG.md entries from Phase 1-2
Output:
- Pattern analysis
- Prompt refinements
- Anti-pattern warnings
- Methodology improvements

Apply improvements to:
- README.md (if prompts need refinement)
- AGENT_PROMPTS.md (if using sub-agents)
- Handoff templates
```

#### Task 3.2: Documentation Generation (doc-writer)

```
Use the doc-writer agent to generate final documentation.

Generate:
- MASTER_ORCHESTRATION.md (for complex specs)
- AGENT_PROMPTS.md (if multiple sub-agents)
- RUBRICS.md (if evaluation criteria needed)
- templates/*.template.md (output templates)

Ensure all documentation follows:
- Effect patterns in code examples
- Namespace imports (import * as)
- No async/await
```

#### Task 3.3: Create Remediation Plan

Based on Phase 2 evaluation, generate:
- `outputs/remediation-plan.md` - Prioritized actions
- `HANDOFF_P1.md` - First iteration handoff

### Output Checklist
- [ ] Prompts improved based on reflector analysis
- [ ] Documentation generated by doc-writer
- [ ] `outputs/remediation-plan.md` created
- [ ] `HANDOFF_P1.md` created
- [ ] `REFLECTION_LOG.md` updated with Phase 3 learnings

---

## Phase 4+: Iterative Execution

### Purpose
Execute plan in phases, continuously improving.

### Agent Tasks

#### Task 4.1: Execute Phase Tasks

Use appropriate agents based on task type:
- **Code changes**: Manual or with test-writer for tests
- **Documentation**: doc-writer
- **Observability**: code-observability-writer

#### Task 4.2: Validate Changes (test-writer)

```
Use the test-writer agent to create validation tests.

For each significant change:
- Unit tests for new functions
- Integration tests for new layers
- Property-based tests for schemas

Follow @beep/testkit patterns (effect, layer, scoped helpers).
```

#### Task 4.3: Add Observability (code-observability-writer)

For production code:

```
Use the code-observability-writer agent to add instrumentation.

Add:
- Effect.log* calls with structured objects
- Schema.TaggedError for error types
- Span annotations for tracing

Follow patterns in documentation/EFFECT_PATTERNS.md.
```

#### Task 4.4: Reflect and Handoff (reflector)

At end of each iteration:

```
Use the reflector agent to generate handoff.

Input: Current REFLECTION_LOG.md, phase results
Output: HANDOFF_P[N+1].md containing:
- What was accomplished
- What worked well
- What needed adjustment
- Improved prompts for next phase
- P[N+1]_ORCHESTRATOR_PROMPT.md
```

### Iteration Loop

```
┌─────────────────────────────────────────────────────┐
│                  ITERATION LOOP                     │
├─────────────────────────────────────────────────────┤
│  1. Execute tasks from P[N]_ORCHESTRATOR_PROMPT.md  │
│  2. Run tests (test-writer validates)               │
│  3. Update REFLECTION_LOG.md                        │
│  4. Use reflector to generate HANDOFF_P[N+1].md     │
│  5. If work remains, go to step 1 with P[N+1]       │
└─────────────────────────────────────────────────────┘
```

---

## Quick Reference: Agent Summaries

> **Critical**: Agents are categorized by OUTPUT CAPABILITY. Choose based on what you need produced.

### Read-Only Agents (No Output Files)

These agents INFORM the orchestrator but produce NO persistent artifacts.
Use when you need information to make decisions, not reports.

| Agent | Primary Use | Key Tools |
|-------|-------------|-----------|
| **codebase-researcher** | Systematic code exploration | Glob, Grep, Read |
| **mcp-researcher** | Effect documentation lookup | effect_docs_search, get_effect_doc |
| **web-researcher** | External best practices research | WebSearch, WebFetch |
| **effect-schema-expert** | Schema pattern guidance | Glob, Grep, Read, effect_docs |
| **effect-predicate-master** | Predicate utilities | Glob, Grep, Read, effect_docs |

### Report-Producing Agents (Write to outputs/)

These agents PRODUCE markdown reports in `outputs/` directories.
Use when you need documented findings, audits, or reviews.

| Agent | Primary Use | Output Location |
|-------|-------------|-----------------|
| **reflector** | Meta-reflection, pattern extraction | `outputs/meta-reflection-*.md` |
| **code-reviewer** | Guideline violation reports | `outputs/guideline-review.md` |
| **architecture-pattern-enforcer** | Architecture audit reports | `outputs/architecture-review.md` |
| **spec-reviewer** | Spec quality assessment | `outputs/spec-review.md` |
| **tsconfig-auditor** | TypeScript config audit | `outputs/tsconfig-audit.md` |

### File-Modifying Agents (Write Source Files)

These agents CREATE or MODIFY source files (code, docs, tests).
Use when you need actual file changes, not just reports.

| Agent | Primary Use | Output Type |
|-------|-------------|-------------|
| **doc-writer** | README, AGENTS.md, JSDoc | Documentation files |
| **test-writer** | Effect-first tests with @beep/testkit | `*.test.ts` files |
| **code-observability-writer** | Logging, tracing, metrics | Source modifications |
| **jsdoc-fixer** | JSDoc comment compliance | Source modifications |
| **package-error-fixer** | Type/build/lint error fixes | Source modifications |
| **agents-md-updater** | AGENTS.md maintenance | Documentation files |
| **readme-updater** | README.md maintenance | Documentation files |
| **prompt-refiner** | Agent prompt improvements | Agent definition files |

---

## Standard Spec Structure

```
specs/[SPEC_NAME]/
├── README.md                    # Entry point (100-150 lines)
├── REFLECTION_LOG.md            # Cumulative learnings (required)
├── QUICK_START.md               # 5-min getting started (optional)
├── MASTER_ORCHESTRATION.md      # Full workflow (complex specs)
├── AGENT_PROMPTS.md             # Sub-agent prompts (complex specs)
├── RUBRICS.md                   # Evaluation criteria (if applicable)
├── templates/                   # Output templates
│   ├── context.template.md
│   ├── evaluation.template.md
│   └── plan.template.md
├── outputs/                     # Phase artifacts
│   ├── codebase-context.md
│   ├── evaluation.md
│   └── remediation-plan.md
└── handoffs/                    # Iteration documents
    ├── HANDOFF_P1.md
    ├── P1_ORCHESTRATOR_PROMPT.md
    └── ...
```

---

## Creating a New Spec

### Option 1: CLI Command (Recommended)

The fastest way to create a new spec is using the `bootstrap-spec` CLI command:

```bash
# Create medium-complexity spec (default)
bun run beep bootstrap-spec -n my-feature -d "Feature description"

# Create simple spec (README + REFLECTION_LOG only)
bun run beep bootstrap-spec -n quick-fix -d "Bug fix" -c simple

# Create complex spec (full orchestration structure)
bun run beep bootstrap-spec -n major-refactor -d "API redesign" -c complex

# Preview changes without creating files
bun run beep bootstrap-spec -n my-feature -d "Feature description" --dry-run
```

**Complexity Levels:**

| Level | Files Created | Use Case |
|-------|---------------|----------|
| `simple` | README.md, REFLECTION_LOG.md | Quick fixes, 1 session |
| `medium` | + QUICK_START.md, outputs/, handoffs/ | Standard specs, 2-3 sessions |
| `complex` | + MASTER_ORCHESTRATION.md, AGENT_PROMPTS.md, RUBRICS.md, templates/, handoffs/ | Major initiatives, 4+ sessions |

**Note**: Handoff documents (`handoffs/`) are recommended for any multi-session work (medium and complex specs) to preserve context between sessions. Single-session (simple) specs do not require handoffs.

### Option 2: Manual Initialization

For more control, initialize structure manually:

```bash
# Create directories
mkdir -p specs/[SPEC_NAME]/{templates,outputs,handoffs}

# Create required files
touch specs/[SPEC_NAME]/README.md
touch specs/[SPEC_NAME]/REFLECTION_LOG.md
```

### Step 2: Scaffold with doc-writer

```
Launch doc-writer agent:

"Create initial README.md for specs/[SPEC_NAME]/ following META_SPEC_TEMPLATE.
Include:
- Purpose and scope
- Success criteria
- Expected outputs
- Phase overview"
```

### Step 3: Validate with architecture-pattern-enforcer

```
Launch architecture-pattern-enforcer agent:

"Validate specs/[SPEC_NAME]/ structure against META_SPEC_TEMPLATE.
Check all required files exist and follow conventions."
```

### Step 4: Execute Phases

Follow Phase 1-4+ workflow above, using appropriate agents at each phase.

---

## Auditing Existing Specs

### Audit Task (codebase-researcher)

```
Launch codebase-researcher agent:

"Audit all spec folders in specs/ directory.
For each spec:
1. List current files
2. Check for required README.md and REFLECTION_LOG.md
3. Identify missing standard files
4. Classify complexity: Simple / Medium / Complex

Output: specs/outputs/SPEC_AUDIT_REPORT.md"
```

### Remediation Task (doc-writer)

For specs missing required files:

```
Launch doc-writer agent:

"Create missing files for specs/[SPEC_NAME]/:
- README.md if missing (use META_SPEC_TEMPLATE)
- REFLECTION_LOG.md if missing (empty template)
- QUICK_START.md if medium+ complexity"
```

---

## Success Criteria

A spec is complete when:

- [ ] README.md exists and follows template
- [ ] REFLECTION_LOG.md exists (even if minimal)
- [ ] All code examples use Effect patterns
- [ ] Complex specs have handoff mechanism
- [ ] Agents have been used for each applicable phase
- [ ] Final reflector pass has improved prompts

---

## Anti-Patterns

### 1. Manual Everything
**Wrong**: Writing all documentation manually without agents
**Right**: Use doc-writer for structure, reflector for improvement

### 2. Skipping Reflection
**Wrong**: Execute phases without logging learnings
**Right**: Update REFLECTION_LOG.md after every phase

### 3. Static Prompts
**Wrong**: Same prompts regardless of learnings
**Right**: Use reflector to continuously improve prompts

### 4. Agent Overload
**Wrong**: Using every agent for every task
**Right**: Match agents to phase needs (see Agent-Phase Mapping)

### 5. No Validation
**Wrong**: Trust output without verification
**Right**: Use architecture-pattern-enforcer and code-reviewer

### 6. Misunderstanding CLI vs Skill Architecture
**Wrong**: Treating CLI commands and Skills as parallel alternatives
- "Option 1: Use CLI" vs "Option 2: Use Skill"
- Assuming both are user-facing tools
- Designing Skills to duplicate CLI functionality

**Right**: Skills orchestrate and may invoke CLI commands
- **CLI commands** are developer-facing automation (deterministic file generation)
- **Skills** are AI agent guidance layers (interactive workflow orchestration)
- Skills MAY invoke CLI commands as one step in multi-phase workflows
- Skills provide context gathering, validation, agent recommendations beyond CLI scope

**Decision Matrix**:
- **When developer manually creates spec** → Use CLI command directly
- **When AI agent orchestrates spec creation** → Skill guides workflow and may invoke CLI
- **When automation script needed** → CLI command
- **When interactive guidance needed** → Skill

**Example**: The `spec-bootstrapper` spec delivers both:
- CLI: `bun run beep bootstrap-spec -n name -d desc` (file generation)
- Skill: `/new-spec` (gathers context, validates, recommends complexity, invokes CLI, suggests next steps)

### 7. Effect Pattern Violations in Spec Code Examples
**Wrong**: Using Node.js APIs wrapped in `Effect.try()` in spec documentation
```typescript
// Wrong - in MASTER_ORCHESTRATION.md
const exists = yield* Effect.try(() => fs.existsSync(path));
```

**Right**: Using Effect platform services in all code examples
```typescript
// Right - in MASTER_ORCHESTRATION.md
const fs = yield* FileSystem.FileSystem;
const exists = yield* fs.exists(path);
```

**Critical**: All code examples in specs MUST follow Effect patterns documented in `documentation/EFFECT_PATTERNS.md`. Cross-reference existing working implementations (like `create-slice/handler.ts`) when writing spec code examples.

### 8. Template Variable Inconsistencies
**Wrong**: Documenting template variables in spec synthesis reports without auditing actual template file usage

**Right**:
1. Audit ALL template files to extract actual `{{variable}}` usage
2. Only document variables that are ACTUALLY used
3. If mentioning case variants (SpecName, SPEC_NAME), show where/how they're used
4. Keep variable set minimal - avoid over-engineering unused variants

**Lesson**: Template variable documentation in synthesis reports must match reality in template files, or implementation will fail.

### 9. Missing Decision Frameworks
**Wrong**: Defining user-facing options (like complexity levels: simple/medium/complex) without decision criteria

**Right**: Provide concrete heuristics for every user-facing choice:
- Number of sessions (1 / 2-3 / 4+)
- Number of files affected (< 5 / 5-15 / 15+)
- Number of agents needed (1 / 2-3 / 4+)
- Example use cases per option
- Decision matrix or checklist

**Lesson**: Users cannot choose wisely without concrete criteria. "Moderate complexity" is not actionable; "2-3 sessions, 5-15 files, multiple agents" is actionable.

---

## Related Documentation

- [META_SPEC_TEMPLATE](ai-friendliness-audit/META_SPEC_TEMPLATE.md) - Core pattern reference
- [Agent Specifications](agents/README.md) - All specialized agents
- [Agent Handoffs](agents/handoffs/) - Ready-to-use agent prompts
- [EFFECT_PATTERNS](../documentation/EFFECT_PATTERNS.md) - Code patterns
