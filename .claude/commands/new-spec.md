# New Spec Creation - beep-effect codebase

## Purpose

Create a new specification using the agent-assisted, self-improving workflow. This skill guides you through complexity assessment, structure selection, and phase planning.

---

## When to Use

Use this skill when:
- Creating a new specification for a multi-session task
- Planning a feature that requires research, design, and implementation phases
- Building something that benefits from specialized agent coordination
- Working on tasks that will generate reusable patterns

**Do NOT use for:**
- Simple bug fixes (use standard workflow)
- Single-session tasks (create inline TODO list instead)
- Documentation-only changes (use `doc-writer` agent directly)

---

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          /new-spec WORKFLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. ASSESS: Calculate complexity score using factor/weight formula          │
│         ↓                                                                   │
│  2. STRUCTURE: Choose simple/medium/complex based on score thresholds       │
│         ↓                                                                   │
│  3. SCAFFOLD: Generate files via CLI command                                │
│         ↓                                                                   │
│  4. PLAN: Map agents to phases using Phase-Agent Matrix                     │
│         ↓                                                                   │
│  5. EXECUTE: Begin Phase 0 (Scaffolding) with doc-writer                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Complexity Assessment

Before creating a spec, estimate complexity using this formula:

### Factor/Weight Table

| Factor | Weight | Scale | How to Assess |
|--------|--------|-------|---------------|
| Phase Count | 2 | 1-10 | How many distinct phases? (research, design, implement, test) |
| Agent Diversity | 3 | 1-5 | How many different agents needed? |
| Cross-Package | 4 | 0-5 | How many packages outside the main domain? |
| External Dependencies | 3 | 0-5 | External APIs, services, libraries? |
| Uncertainty | 5 | 1-5 | Novel patterns? Unclear requirements? |
| Research Required | 2 | 0-5 | Need to research best practices? |

### Calculation Formula

```
Complexity = (Phases × 2) + (Agents × 3) + (CrossPkg × 4) + (ExtDeps × 3) + (Uncertainty × 5) + (Research × 2)
```

### Threshold Classification

| Score | Complexity | Structure | Checkpoint Frequency |
|-------|------------|-----------|---------------------|
| 0-20 | Simple | README + REFLECTION_LOG | Per-phase |
| 21-40 | Medium | + QUICK_START, outputs/, handoffs/ | Per-phase + mid-phase |
| 41-60 | High | + MASTER_ORCHESTRATION, AGENT_PROMPTS | Per-task |
| 61+ | Critical | + RUBRICS, extensive templates | Continuous |

### Example Calculation

**Spec**: Adding authentication to a new app

```
Phase Count:       4 phases (research, design, implement, test) × 2 = 8
Agent Diversity:   3 agents (web-researcher, code-reviewer, test-writer) × 3 = 9
Cross-Package:     2 (iam-*, shared/auth) × 4 = 8
External Deps:     1 (better-auth) × 3 = 3
Uncertainty:       2 (known patterns) × 5 = 10
Research Required: 2 (better-auth docs) × 2 = 4
────────────────────────────────────────
Total Score:                          42 → High Complexity
```

---

## Step 2: Generate Structure

Use the CLI command to scaffold the spec:

```bash
# Simple spec (score 0-20)
bun run repo-cli bootstrap-spec -n SPEC_NAME -d "Description" -c simple

# Medium spec (score 21-40)
bun run repo-cli bootstrap-spec -n SPEC_NAME -d "Description" -c medium

# Complex spec (score 41+)
bun run repo-cli bootstrap-spec -n SPEC_NAME -d "Description" -c complex

# Preview without creating files
bun run repo-cli bootstrap-spec -n SPEC_NAME -d "Description" --dry-run
```

### Structure by Complexity

| Level | Files Created |
|-------|---------------|
| `simple` | README.md, REFLECTION_LOG.md |
| `medium` | + QUICK_START.md, outputs/, handoffs/ |
| `complex` | + MASTER_ORCHESTRATION.md, AGENT_PROMPTS.md, RUBRICS.md, templates/ |

---

## Step 3: Plan Agent Phases

After scaffolding, plan which agents to use in each phase:

### Phase-Agent Matrix

| Phase | Agent | Capability | Purpose |
|-------|-------|------------|---------|
| **0: Scaffolding** | `doc-writer` | write-files | Create README, structure |
| **0: Scaffolding** | `architecture-pattern-enforcer` | write-reports | Validate structure |
| **1: Discovery** | `codebase-researcher` | read-only | Explore relevant code |
| **1: Discovery** | `mcp-researcher` | read-only | Effect documentation |
| **1: Discovery** | `web-researcher` | read-only | External research |
| **2: Evaluation** | `code-reviewer` | write-reports | Guideline compliance |
| **2: Evaluation** | `architecture-pattern-enforcer` | write-reports | Architecture validation |
| **3: Synthesis** | `reflector` | write-reports | Prompt improvement |
| **3: Synthesis** | `doc-writer` | write-files | Generate docs |
| **4+: Iteration** | `test-writer` | write-files | Create tests |
| **4+: Iteration** | `code-observability-writer` | write-files | Add logging/tracing |
| **4+: Iteration** | `package-error-fixer` | write-files | Fix type/lint errors |

### Agent Selection Quick Guide

**Need information?** → `codebase-researcher`, `mcp-researcher`, `web-researcher`
**Need a report?** → `code-reviewer`, `architecture-pattern-enforcer`, `reflector`
**Need files created?** → `doc-writer`, `test-writer`, `effect-code-writer`

---

## Step 4: Context Engineering

For multi-session specs, follow the tiered memory model for handoffs:

### Token Budget by Memory Type

| Memory Type | Token Budget | Content Type |
|-------------|--------------|--------------|
| **Working** | ≤2,000 | Current tasks, success criteria, blocking issues |
| **Episodic** | ≤1,000 | Previous phase summaries, key decisions |
| **Semantic** | ≤500 | Project constants, tech stack (only if non-obvious) |
| **Procedural** | Links only | Documentation references (no inline content) |
| **Total** | **≤4,000** | Well under context degradation threshold |

### Handoff File Requirements

At the end of EVERY phase, create BOTH:

1. **`HANDOFF_P[N+1].md`** - Full context document
2. **`P[N+1]_ORCHESTRATOR_PROMPT.md`** - Copy-paste prompt for next session

**A phase is NOT complete until BOTH files exist.**

See [HANDOFF_STANDARDS.md](../../specs/_guide/HANDOFF_STANDARDS.md) for templates.

---

## Step 5: Pattern Extraction

As you complete phases, extract reusable patterns:

### Phase Completion Prompt

At the end of EVERY phase, ask:

> "What patterns from this phase should become skills?"

### Quality Scoring Threshold

| Score | Destination |
|-------|-------------|
| 90-102 | Create skill in `.claude/skills/` |
| 75-89 | Add to `specs/_guide/PATTERN_REGISTRY.md` |
| 50-74 | Keep in spec-local REFLECTION_LOG |
| 0-49 | Iterate in spec |

---

## Quick Start Example

**User**: "Create a spec for adding multi-org support to the IAM system"

**Workflow**:

1. **Assess complexity**:
   ```
   Phases: 5 × 2 = 10
   Agents: 4 × 3 = 12
   Cross-Package: 3 × 4 = 12
   External Deps: 0 × 3 = 0
   Uncertainty: 4 × 5 = 20
   Research: 3 × 2 = 6
   Total: 60 → High Complexity
   ```

2. **Scaffold**:
   ```bash
   bun run repo-cli bootstrap-spec -n multi-org-iam -d "Multi-organization support for IAM system" -c complex
   ```

3. **Plan phases**:
   - Phase 0: `doc-writer` scaffolds README
   - Phase 1: `codebase-researcher` explores existing IAM, `web-researcher` researches multi-tenancy patterns
   - Phase 2: `code-reviewer` validates against guidelines
   - Phase 3: `reflector` synthesizes findings, `doc-writer` creates MASTER_ORCHESTRATION
   - Phase 4+: `effect-code-writer`, `test-writer`, `package-error-fixer`

4. **Begin Phase 0**:
   ```
   Use doc-writer agent to create README.md for specs/multi-org-iam/
   following the Standard Spec Structure from specs/_guide/README.md.
   ```

---

## Reference Documentation

| Document | Purpose |
|----------|---------|
| [Spec Guide](../../specs/_guide/README.md) | Complete workflow reference with structure template |
| [HANDOFF_STANDARDS](../../specs/_guide/HANDOFF_STANDARDS.md) | Handoff file requirements |
| [PATTERN_REGISTRY](../../specs/_guide/PATTERN_REGISTRY.md) | Reusable patterns extracted from specs |
| [llms.txt](../../specs/_guide/llms.txt) | AI-readable spec index |
| [agents/README.md](../../specs/agents/README.md) | Specialized agent specifications |

---

## Common Mistakes

### 1. Skipping Complexity Assessment
**Wrong**: "I'll just use complex for everything to be safe"
**Right**: Calculate score - simple specs with complex structure add unnecessary overhead

### 2. Missing Orchestrator Prompts
**Wrong**: Creating only HANDOFF_P[N].md
**Right**: Create BOTH handoff files - the orchestrator prompt is how you start the next session

### 3. Context Hoarding
**Wrong**: Including full history of all phases in every handoff
**Right**: Use rolling summary (~200 tokens) + phase-specific working context

### 4. Not Extracting Patterns
**Wrong**: Completing spec without capturing reusable learnings
**Right**: Ask "What patterns should become skills?" after every phase

### 5. Orchestrator Doing Research
**Wrong**: Orchestrator runs 20+ Glob/Read/Grep calls
**Right**: Delegate to `codebase-researcher` - it returns a summary, preserving context

---

## Verification Checklist

After creating a new spec:

- [ ] Complexity score calculated and documented
- [ ] CLI command executed with correct complexity flag
- [ ] README.md follows specs/_guide/README.md structure
- [ ] REFLECTION_LOG.md exists (even if empty)
- [ ] Phase plan created with agent assignments
- [ ] For medium+ specs: handoffs/ directory exists
- [ ] Entry added to `specs/README.md` table
