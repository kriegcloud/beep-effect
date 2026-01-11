# Reflector Research Findings

> Phase 1 Research Output for the Reflector Agent Specification

---

## Reflection Log Structure

Analysis of `specs/ai-friendliness-audit/REFLECTION_LOG.md` revealed a consistent entry format:

### Entry Template
```markdown
## YYYY-MM-DD - [Phase/Task] Reflection

### What Worked
- [Specific technique or approach that was effective]
- [Tool or command that produced useful results]

### What Didn't Work
- [Approach that failed or was inefficient]
- [False positives or misleading results]

### Methodology Improvements
- [ ] [Specific change to make to MASTER_ORCHESTRATION.md]
- [ ] [New rubric criteria for RUBRICS.md]
- [ ] [Agent prompt adjustment for AGENT_PROMPTS.md]

### Prompt Refinements
**Original instruction**: [quote from spec]
**Problem**: [why it didn't work well]
**Refined instruction**: [improved version]

### Codebase-Specific Insights
- [Pattern unique to beep-effect that affects audit]
- [Unexpected structure or convention discovered]
```

### Accumulated Improvements Section
The log includes tracking tables for validated improvements:

| Category | Format |
|----------|--------|
| File Updates | `Entry Date | Section | Change | Status (PENDING/APPLIED)` |
| Grep Patterns | Before/After pattern comparisons |
| False Positives | Patterns that look like violations but aren't |

### Lessons Learned Summary
- **Top 3 Most Valuable Techniques** — what to keep doing
- **Top 3 Wasted Efforts** — what to stop doing
- **Recommended Changes** — actionable next steps

---

## META_SPEC_TEMPLATE Patterns

The meta-spec template reveals the **self-improving pattern** structure:

### Core Insight
Every phase produces two outputs:
1. **Work Product** — The deliverable (report, plan, code)
2. **Process Learning** — Improvements to the methodology itself

### Phase Definitions
| Phase | Purpose | Self-Reflection Focus |
|-------|---------|----------------------|
| Phase 0: Scaffolding | Create spec framework | None (setup only) |
| Phase 1: Discovery | Read-only analysis | Detection methods, false positives |
| Phase 2: Evaluation | Scored assessment | Rubric thresholds, sampling |
| Phase 3: Synthesis | Prioritized planning | Actionability, intent verification |
| Phase 4+: Iteration | Execute and handoff | Per-phase learnings |

### Handoff Document Structure
```markdown
# [Spec Name] Handoff — P[N] Phase

## Session Summary: P[N-1] Completed
| Metric | Before | After | Status |

## Lessons Learned
### What Worked Well
### What Needed Adjustment
### Prompt Improvements

## Remaining Work: P[N] Items
## Improved Sub-Agent Prompts
## Verification Commands
## Success Criteria
```

---

## Agent Template Requirements

From `.claude/agents/templates/agents-md-template.md`:

### Required Frontmatter
```yaml
---
name: agent-name
description: |
  Multi-line description with examples showing when to use the agent.

  Examples:
  <example>
  Context: ...
  user: "..."
  assistant: "..."
  <Task tool call>
  </example>
model: sonnet  # Optional, defaults to sonnet
---
```

### Required Sections
1. **Purpose Statement** — What the agent does
2. **Methodology** — Step-by-step approach
3. **Knowledge Sources** — File paths and what they provide
4. **Output Format** — Exact structure of deliverables
5. **Examples** — Sample invocations and outputs
6. **Critical Rules** — Non-negotiable constraints

### Anti-Patterns to Avoid
| Anti-Pattern | Correct Approach |
|--------------|------------------|
| MCP tool shortcuts in docs | Remove entirely |
| `async/await` in examples | Use `Effect.gen` |
| Native array methods | Use `A.map`, `A.filter` |
| Named Effect imports | Use `import * as Effect` |
| Vague documentation | Specific, contextual docs |
| Invalid cross-references | Validate paths before inclusion |

---

## Reference Agent Patterns

### effect-researcher.md Structure (381 lines)

**Methodology Pattern**:
1. **Phase 1: Understand the Problem** — Parse request, identify patterns
2. **Phase 2: Deep Dive Research** — Search docs, explore source, cross-reference
3. **Phase 3: Synthesize Optimal Solution** — Apply Effect philosophy

**Knowledge Sources**:
- Effect Documentation via MCP tools
- Core Effect source code (`node_modules/effect/src/`)
- @effect ecosystem packages
- @effect-aws, @effect-atom packages

**Output Formats**:
1. Optimized Prompt (markdown file with sections)
2. Refactored Code (before/after with explanation)
3. Research Report (executive summary → implementation → trade-offs)

**Critical Rules Pattern**:
```markdown
## Critical Rules

1. **Always search docs first** - Use the MCP tool before making recommendations
2. **Verify patterns in source** - Check actual implementations
3. **Complete examples** - Never show partial code
4. **No async/await** - All async through Effect
...
```

### prompt-refiner.md Structure (407 lines)

**Workflow Phases**:
1. Parse & Initialize — Extract spec name, save original
2. Exploration — Parallel sub-agents gather context
3. Initial Refinement — Transform using COSTAR+CRISPE framework
4. Review Loop — Critic evaluation + fix application (max 3 iterations)
5. Finalization — Summary and next steps

**Parallel Agent Pattern**:
```markdown
Launch **parallel** sub-agents to gather context:

#### Agent 1: Codebase Explorer
#### Agent 2: AGENTS.md Collector
#### Agent 3: Effect Researcher
```

**Review Loop Checklists**:
- Prompt Engineering Quality (8 criteria)
- Repository Alignment (5 criteria)
- Clarity & Precision (4 criteria)

**Issue Classification**:
- HIGH: Must fix — causes incorrect execution
- MEDIUM: Should fix — reduces clarity
- LOW: Could fix — minor improvements

---

## Key Decisions for Phase 2

### 1. Parsing Strategy
How will the reflector identify and extract entries from REFLECTION_LOG.md?
- Option A: Regex-based section parsing
- Option B: Markdown AST parsing
- **Decision needed**: Regex is simpler but less robust

### 2. Pattern Detection Algorithm
What constitutes a "pattern" across multiple entries?
- Similar "What Worked" items across phases
- Recurring "Prompt Refinements" themes
- Repeated "Methodology Improvements"
- **Decision needed**: Threshold for pattern (2+ occurrences?)

### 3. Output Format
What should the meta-reflection produce?
- Pattern Analysis (recurring successes/failures)
- Prompt Refinements (before/after improvements)
- Documentation Updates (CLAUDE.md, AGENTS.md changes)
- **Decision needed**: Include cumulative learnings from prior meta-reflections?

### 4. Knowledge Source Scope
Which REFLECTION_LOG files should the agent analyze?
- All specs: `specs/*/REFLECTION_LOG.md`
- Specific spec (user-provided)
- Most recent N specs
- **Decision needed**: Default behavior vs user specification

### 5. Integration Points
How does the reflector integrate with the handoff workflow?
- Called after Phase 3 Synthesis
- Called during Phase 4+ handoffs
- Standalone analysis tool
- **Decision needed**: All of the above?

---

## Summary

The reflector agent should:

1. **Parse** REFLECTION_LOG.md files using the documented entry structure
2. **Identify patterns** across What Worked/What Didn't Work sections
3. **Extract prompt refinements** with before/after comparisons
4. **Generate documentation updates** for CLAUDE.md and AGENTS.md
5. **Produce meta-reflections** that synthesize cumulative learnings

The agent should follow the template structure with:
- YAML frontmatter with description and examples
- Multi-phase methodology (similar to effect-researcher)
- Explicit output format specification
- Critical rules preventing anti-patterns
- ~300-400 lines total
