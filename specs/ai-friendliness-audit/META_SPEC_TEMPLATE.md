# Meta-Specification: Self-Improving Spec Pattern

> A template for creating systematic, self-improving specifications that learn from each execution phase.

---

## Timeline: ai-friendliness-audit Evolution

This spec evolved through 4 distinct phases over ~1 hour:

```
17:21 ─┬─ PHASE 0: SCAFFOLDING
       ├─ AGENT_PROMPTS.md (622 lines) ─ Specialized agent prompts
       ├─ QUICK_START.md (153 lines) ─ 5-minute getting started
       ├─ RUBRICS.md (345 lines) ─ Scoring criteria
       │
17:24 ─├─ templates/
       │  ├─ audit-context.template.md (181 lines)
       │  ├─ evaluation-report.template.md (279 lines)
       │  └─ remediation-plan.template.md (282 lines)
       │
17:30 ─├─ MASTER_ORCHESTRATION.md (611 lines) ─ Full workflow
       └─ README.md (149 lines) ─ Overview and entry point

17:34 ─┬─ PHASE 1: DISCOVERY
       └─ outputs/audit-context.md (224 lines) ─ Codebase mapping

17:39 ─┬─ PHASE 2: EVALUATION
       └─ outputs/evaluation-report.md (255 lines) ─ Scored findings

17:51 ─┬─ PHASE 3: SYNTHESIS
       ├─ REMEDIATION_ORCHESTRATOR_PROMPT.md (315 lines) ─ Execution prompt
       ├─ outputs/remediation-plan.md (451 lines) ─ Prioritized actions
       └─ REFLECTION_LOG.md (288 lines) ─ Methodology learnings

18:06 ─┬─ PHASE 4+: ITERATIVE HANDOFFS
       ├─ HANDOFF_P2.md (399 lines) ─ P1→P2 transition
       ├─ P2_ORCHESTRATOR_PROMPT.md (267 lines) ─ P2 execution
       ├─ HANDOFF_P3.md (444 lines) ─ P2→P3 transition
       └─ P3_ORCHESTRATOR_PROMPT.md (290 lines) ─ P3 execution
```

**Total: 17 files, 4,778 lines (excluding templates)**

---

## The Self-Improving Pattern

### Core Insight

Each phase produces **two outputs**:
1. **Work Product** — The deliverable (report, plan, code)
2. **Process Learning** — Improvements to the methodology itself

This creates a flywheel where **every execution improves future executions**.

### Pattern Structure

```
specs/[SPEC_NAME]/
├── README.md                    # Entry point, overview
├── QUICK_START.md               # 5-min getting started
├── MASTER_ORCHESTRATION.md      # Full workflow with checkpoints
├── AGENT_PROMPTS.md             # Specialized sub-agent prompts
├── RUBRICS.md                   # Scoring/evaluation criteria
├── REFLECTION_LOG.md            # Cumulative learnings
├── templates/                   # Output templates
│   ├── context.template.md
│   ├── evaluation.template.md
│   └── plan.template.md
├── outputs/                     # Phase outputs
│   ├── context.md
│   ├── evaluation.md
│   └── plan.md
└── handoffs/                    # Iterative execution
    ├── HANDOFF_P1.md
    ├── P1_ORCHESTRATOR_PROMPT.md
    ├── HANDOFF_P2.md
    ├── P2_ORCHESTRATOR_PROMPT.md
    └── ...
```

---

## Phase Definitions

### Phase 0: Scaffolding (One-time setup)

**Purpose**: Create the specification framework.

**Files created**:
| File | Purpose | Lines (target) |
|------|---------|----------------|
| README.md | Entry point, overview | 100-150 |
| QUICK_START.md | 5-min getting started | 100-150 |
| MASTER_ORCHESTRATION.md | Full workflow | 400-600 |
| AGENT_PROMPTS.md | Sub-agent prompts | 400-600 |
| RUBRICS.md | Evaluation criteria | 200-400 |
| templates/*.md | Output structure | 150-300 each |

**Self-reflection**: None (setup only).

---

### Phase 1: Discovery (Read-only analysis)

**Purpose**: Gather context, map the problem space.

**Inputs**: Codebase, existing documentation
**Outputs**: `outputs/context.md`

**Self-reflection questions**:
- What detection methods worked? Which failed?
- What false positives appeared?
- What codebase-specific patterns emerged?

---

### Phase 2: Evaluation (Scored assessment)

**Purpose**: Apply rubrics, generate scored findings.

**Inputs**: Context from Phase 1
**Outputs**: `outputs/evaluation.md`

**Self-reflection questions**:
- Were rubric thresholds appropriate?
- Did sampling provide representative data?
- What evidence verification techniques worked?

---

### Phase 3: Synthesis (Prioritized planning)

**Purpose**: Generate actionable remediation plan.

**Inputs**: Evaluation from Phase 2
**Outputs**:
- `outputs/plan.md`
- `REMEDIATION_ORCHESTRATOR_PROMPT.md`
- `REFLECTION_LOG.md` (initial entry)

**Self-reflection questions**:
- Are action items specific enough to execute?
- Did impact/effort prioritization surface the right order?
- What "violations" were actually intentional design?

---

### Phase 4+: Iterative Execution (Repeated)

**Purpose**: Execute plan in phases, capturing learnings.

**Pattern per iteration**:
1. Execute phase with `P[N]_ORCHESTRATOR_PROMPT.md`
2. Capture results and learnings
3. Generate `HANDOFF_P[N+1].md` with:
   - What was accomplished
   - What worked well
   - What needed adjustment
   - Improved prompts for next phase
4. Generate `P[N+1]_ORCHESTRATOR_PROMPT.md`

**Files per iteration**:
| File | Purpose |
|------|---------|
| `HANDOFF_P[N].md` | Transition document with learnings |
| `P[N]_ORCHESTRATOR_PROMPT.md` | Execution prompt for phase |

---

## Handoff Document Structure

Every handoff document follows this structure:

```markdown
# [Spec Name] Handoff — P[N] Phase

## Session Summary: P[N-1] Completed
| Metric | Before | After | Status |

## Lessons Learned
### What Worked Well
### What Needed Adjustment
### Prompt Improvements

## Remaining Work: P[N] Items
[Prioritized task list with sub-agent prompts]

## Improved Sub-Agent Prompts
[Updated prompts incorporating learnings]

## P[N] Orchestrator Prompt
[Ready-to-use prompt for next session]

## Verification Commands
## Success Criteria
## Notes for Next Agent
```

---

## Orchestrator Prompt Structure

Every orchestrator prompt follows this structure:

```markdown
# [Spec Name] P[N] Orchestrator

## Critical Orchestration Rules
1. NEVER write code directly
2. PRESERVE context window
3. [Phase-specific rules]

## Context from P[N-1] Completion
| Metric | Start | End | Target |

## P[N] Tasks to Execute
### Task 1: [Name]
**Sub-agent prompt**: [Full prompt]

### Task 2: [Name]
**Sub-agent prompt**: [Full prompt]

## Execution Protocol
[Step-by-step instructions]

## Success Criteria
## Verification Commands
```

---

## Reflection Log Structure

The reflection log accumulates learnings across all phases:

```markdown
# [Spec Name]: Reflection Log

## Reflection Protocol
[Template for entries]

## Reflection Entries
### YYYY-MM-DD - Phase X.Y Reflection
#### What Worked
#### What Didn't Work
#### Methodology Improvements
#### Prompt Refinements
#### Codebase-Specific Insights

## Accumulated Improvements
### MASTER_ORCHESTRATION.md Updates
### RUBRICS.md Updates
### AGENT_PROMPTS.md Updates

## Lessons Learned Summary
### Top 3 Most Valuable Techniques
### Top 3 Wasted Efforts
### Recommended Changes for Next Audit
```

---

## Key Principles

### 1. English Feedback Loops

Generate diagnostic explanations, not just scores:

```markdown
BAD:  "Documentation score: 3/5"
GOOD: "Documentation score: 3/5 — 65% of exports have JSDoc, but
       critical infrastructure (Policy.ts, DataAccess.layer.ts) lacks
       @example blocks. Agents struggle to compose layers correctly."
```

### 2. Progressive Disclosure

Layer documentation hierarchically:

```
Root CLAUDE.md (< 100 lines) → Links to docs/
Package AGENTS.md (< 50 lines) → Specific guidance
Claude Skills (< 150 lines each) → Detailed patterns
```

### 3. Self-Reflection at Checkpoints

After every phase:
- What worked? (Keep doing)
- What failed? (Stop doing)
- What to add? (Start doing)

### 4. Improved Prompts in Handoffs

Every handoff includes refined prompts based on learnings:

```markdown
**Original instruction**: "Score 1-5 using rubrics"
**Problem**: Agents scored without evidence verification
**Refined instruction**: "Score 1-5 using rubrics, then verify
                          top 5 violations against actual source"
```

### 5. Parallel Where Possible, Sequential Where Necessary

- **Parallel**: Independent analysis agents
- **Sequential**: Tasks with dependencies (skills before pattern fixes)

---

## Creating a New Spec

### Step 1: Scaffold the Structure

```bash
mkdir -p specs/[SPEC_NAME]/{templates,outputs,handoffs}

# Create core files
touch specs/[SPEC_NAME]/{README,QUICK_START,MASTER_ORCHESTRATION,AGENT_PROMPTS,RUBRICS,REFLECTION_LOG}.md
touch specs/[SPEC_NAME]/templates/{context,evaluation,plan}.template.md
```

### Step 2: Define the Problem Space

In `README.md`:
- Purpose and scope
- Success criteria
- Expected outputs

### Step 3: Design the Workflow

In `MASTER_ORCHESTRATION.md`:
- Phase definitions
- Self-reflection checkpoints
- Agent coordination strategy

### Step 4: Create Rubrics

In `RUBRICS.md`:
- Evaluation dimensions
- Scoring thresholds
- Evidence requirements

### Step 5: Write Agent Prompts

In `AGENT_PROMPTS.md`:
- Specialized prompts for each task type
- Input/output contracts
- Coordination rules

### Step 6: Execute and Iterate

1. Run Phase 1 (Discovery)
2. Reflect and log learnings
3. Run Phase 2 (Evaluation)
4. Reflect and log learnings
5. Run Phase 3 (Synthesis)
6. Generate handoff for Phase 4+
7. Continue iterating...

---

## Metrics to Track

| Metric | Purpose |
|--------|---------|
| Files created per phase | Productivity measure |
| Lines per handoff | Complexity of learnings |
| Prompt refinements per phase | Learning velocity |
| Time per phase | Efficiency baseline |
| Success criteria hit rate | Effectiveness measure |

---

## Anti-Patterns to Avoid

### 1. Monolithic Orchestration
❌ One giant prompt for everything
✅ Separate orchestration, agent prompts, and execution

### 2. No Self-Reflection
❌ Execute without capturing learnings
✅ Log what worked/failed after every phase

### 3. Static Prompts
❌ Same prompts across phases
✅ Refine prompts based on learnings

### 4. Lost Context
❌ Start each session fresh
✅ Handoff documents preserve full context

### 5. Unbounded Phases
❌ "Fix all violations" with no scope
✅ Specific package/file scope per phase
