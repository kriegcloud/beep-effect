# Phase 0 Orchestrator Prompt

Copy-paste this prompt to start Phase 0 (Analysis) implementation.

---

## Prompt

You are implementing Phase 0 (Analysis) of the Orchestrator Context Optimization spec.

### Your Role: COORDINATOR, NOT EXECUTOR

Your job is to:
- **DELEGATE** research tasks to specialized sub-agents
- **SYNTHESIZE** their outputs into actionable findings
- **CHECKPOINT** proactively before context stress

**CRITICAL - You MUST NOT**:
- Read more than 3 files directly (delegate to `codebase-researcher`)
- Perform broad grep/glob searches manually (delegate)
- Write source code directly (not applicable to this spec)

### Context

This spec addresses orchestrator context exhaustion in multi-phase specifications. The goal is to define delegation rules, phase constraints, and context budget protocols.

Phase 0 analyzes the current state to identify anti-patterns and gaps.

### Your Mission

Create 4 analysis outputs by delegating to appropriate agents:

1. **Orchestrator Prompt Audit** → Delegate to `codebase-researcher`
2. **SPEC_CREATION_GUIDE Gaps** → Manual read (1 file, focused analysis)
3. **Agent Capability Matrix** → Delegate to `codebase-researcher`
4. **KGI Context Analysis** → Delegate to `reflector` OR manual if no reflection log

### Task 1: Orchestrator Prompt Audit

**Delegate to**: `codebase-researcher`

**Prompt to use**:
```
Analyze all orchestrator prompts in specs/*/handoffs/*ORCHESTRATOR_PROMPT*.md

For each prompt found, extract:
1. Does it instruct delegation to sub-agents? (Y/N with evidence)
2. Does it define phase size constraints? (Y/N)
3. Does it mention context checkpointing? (Y/N)
4. What tasks does it ask the orchestrator to do DIRECTLY?

Output format: Markdown report with summary stats and detailed per-prompt analysis.
```

**Output**: `specs/orchestrator-context-optimization/outputs/orchestrator-audit.md`

### Task 2: SPEC_CREATION_GUIDE Gaps (Manual)

Read `specs/SPEC_CREATION_GUIDE.md` and document:
- Where does it mention sub-agent delegation? (quote sections)
- Where does it allow orchestrators to do work directly? (quote sections)
- What phase sizing guidance exists? (quote or note absence)
- What checkpoint triggers are defined? (quote or note absence)

**Output**: `specs/orchestrator-context-optimization/outputs/spec-guide-gaps.md`

### Task 3: Agent Capability Matrix

**Delegate to**: `codebase-researcher`

**Prompt to use**:
```
Analyze all agent definitions in .claude/agents/*.md

Create a capability matrix with columns:
| Agent | Primary Capability | Tools | Writes Files | Typical Use Case |

Also categorize agents into:
- Research (read-only)
- Execution (writes files)
- Validation (reviews/audits)

Include delegation recommendations for common task types.
```

**Output**: `specs/orchestrator-context-optimization/outputs/agent-matrix.md`

### Task 4: KGI Context Analysis

Check if `specs/knowledge-graph-integration/REFLECTION_LOG.md` has entries.

**If entries exist**: Delegate to `reflector` agent to analyze for context-related patterns.

**If no entries**: Manually analyze:
- `specs/knowledge-graph-integration/MASTER_ORCHESTRATION.md` - count work items per phase
- `specs/knowledge-graph-integration/handoffs/P0_ORCHESTRATOR_PROMPT.md` - identify inline work instructions
- Estimate context consumption per phase

**Output**: `specs/orchestrator-context-optimization/outputs/kgi-context-analysis.md`

### Context Budget Tracking

Track your metrics as you work:
- Direct tool calls: [target: < 10]
- Sub-agent delegations: [target: 2-4]
- Large file reads: [target: 1-2]

**Checkpoint if you reach 15 direct tool calls**.

### Verification

After creating all outputs:
```bash
ls specs/orchestrator-context-optimization/outputs/
# Should show: orchestrator-audit.md, spec-guide-gaps.md, agent-matrix.md, kgi-context-analysis.md
```

### Success Criteria

- [ ] `outputs/orchestrator-audit.md` identifies anti-patterns in existing prompts
- [ ] `outputs/spec-guide-gaps.md` documents missing delegation guidance
- [ ] `outputs/agent-matrix.md` provides complete capability reference
- [ ] `outputs/kgi-context-analysis.md` documents context issues in large spec
- [ ] `REFLECTION_LOG.md` updated with Phase 0 learnings
- [ ] `handoffs/HANDOFF_P1.md` created
- [ ] `handoffs/P1_ORCHESTRATOR_PROMPT.md` created

### Handoff Document

Read full context in: `specs/orchestrator-context-optimization/handoffs/HANDOFF_P0.md`

### Next Phase

After completing Phase 0:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P1.md` (design phase context)
3. Create `handoffs/P1_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)

Phase 1 covers **Design**: defining delegation rules, phase constraints, and context budget protocol.
