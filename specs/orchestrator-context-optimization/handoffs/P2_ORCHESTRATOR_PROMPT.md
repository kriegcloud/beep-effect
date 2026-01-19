# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 (Implementation) implementation.

---

## Prompt

You are implementing Phase 2 (Implementation) of the Orchestrator Context Optimization spec.

### Your Role: COORDINATOR, NOT EXECUTOR

Your job is to:
- **PLAN** task breakdown and delegation assignments
- **DELEGATE** all documentation updates to doc-writer agents
- **SYNTHESIZE** updates into cohesive integration
- **CHECKPOINT** proactively before context stress

**CRITICAL - You MUST NOT**:
- Read more than 3 files directly (delegate to codebase-researcher)
- Write documentation directly (delegate to doc-writer)
- Make extensive edits manually (delegate to doc-writer)

### Context from Phase 1

Phase 1 (Design) created 4 design documents:
1. **Delegation Rules** (`outputs/delegation-rules-draft.md`) - Mandatory matrix, trigger rules, anti-patterns
2. **Phase Sizing Guidelines** (`outputs/phase-sizing-guidelines.md`) - Hard limits, complexity scoring
3. **Context Budget Protocol** (`outputs/context-budget-protocol.md`) - Zone system, checkpoint triggers
4. **Orchestrator Prompt Template** (`templates/ORCHESTRATOR_PROMPT.template.md`) - Standard template

Key design decisions:
- Zone system: Green (0-10/0-2/0-5), Yellow (11-15/3-4/6-8), Red (16+/5+/9+)
- Phase limits: Max 7 items, max 10 delegations, max 20 tool calls
- Mandatory delegation: >3 files → delegate, >5 tool calls → delegate

### Phase Objectives

1. Integrate delegation rules into SPEC_CREATION_GUIDE.md
2. Integrate phase sizing constraints into SPEC_CREATION_GUIDE.md
3. Add context budget protocol to HANDOFF_STANDARDS.md
4. Validate integration coherence

### Work Items (Max 7)

| # | Task | Delegate To | Output | Size |
|---|------|-------------|--------|------|
| 1 | Add delegation rules section to SPEC_CREATION_GUIDE | `doc-writer` | Updated file | M |
| 2 | Add phase sizing section to SPEC_CREATION_GUIDE | `doc-writer` | Updated file | M |
| 3 | Add anti-patterns 11-13 to SPEC_CREATION_GUIDE | `doc-writer` | Updated file | S |
| 4 | Add context budget protocol to HANDOFF_STANDARDS | `doc-writer` | Updated file | M |
| 5 | Add checkpoint section to HANDOFF_STANDARDS | `doc-writer` | Updated file | M |
| 6 | Verify integration coherence | Manual | Report | S |

**Complexity Score**: 11 points (Yellow zone - acceptable with care)

### Mandatory Delegation Matrix

| Task Type | Delegate To | Never Do Directly |
|-----------|-------------|-------------------|
| Code exploration (>3 files) | `codebase-researcher` | Sequential Glob/Read |
| Documentation updates | `doc-writer` | Direct edits |
| Content integration | `doc-writer` | Manual merging |

### Context Budget Tracker

| Metric | Current | Limit | Zone |
|--------|---------|-------|------|
| Direct tool calls | 0 | 20 | Green |
| Large file reads | 0 | 5 | Green |
| Sub-agent delegations | 0 | 10 | Green |

**Checkpoint when any metric reaches 75%**

### Checkpoint Protocol

**Yellow Zone (75% of any limit)**:
1. Assess remaining work (<30% or >30%)
2. If <30%: continue cautiously
3. If >30%: create checkpoint NOW

**Red Zone (100% of any limit)**:
1. STOP immediately
2. Create `handoffs/HANDOFF_P2_CHECKPOINT.md`
3. Do NOT attempt to finish

### Reference Files

| Purpose | Path |
|---------|------|
| Delegation rules source | `specs/orchestrator-context-optimization/outputs/delegation-rules-draft.md` |
| Phase sizing source | `specs/orchestrator-context-optimization/outputs/phase-sizing-guidelines.md` |
| Context budget source | `specs/orchestrator-context-optimization/outputs/context-budget-protocol.md` |
| Target: Spec guide | `specs/SPEC_CREATION_GUIDE.md` |
| Target: Handoff standards | `specs/HANDOFF_STANDARDS.md` |
| Agent prompts | `specs/orchestrator-context-optimization/AGENT_PROMPTS.md` |
| Previous handoff | `specs/orchestrator-context-optimization/handoffs/HANDOFF_P2.md` |

### Expected Outputs

| Output | Description | Location |
|--------|-------------|----------|
| Updated SPEC_CREATION_GUIDE | Delegation rules, phase sizing, anti-patterns | `specs/SPEC_CREATION_GUIDE.md` |
| Updated HANDOFF_STANDARDS | Context budget, checkpoints | `specs/HANDOFF_STANDARDS.md` |

### Verification Commands

```bash
# Check files were updated
git diff specs/SPEC_CREATION_GUIDE.md
git diff specs/HANDOFF_STANDARDS.md

# Verify section headers exist
grep -n "Delegation Rules" specs/SPEC_CREATION_GUIDE.md
grep -n "Phase Sizing" specs/SPEC_CREATION_GUIDE.md
grep -n "Context Budget" specs/HANDOFF_STANDARDS.md
```

### Success Criteria

Phase 2 is complete when:
- [ ] SPEC_CREATION_GUIDE.md has "Orchestrator Delegation Rules" section
- [ ] SPEC_CREATION_GUIDE.md has "Phase Sizing Constraints" section
- [ ] SPEC_CREATION_GUIDE.md has anti-patterns 11, 12, 13
- [ ] HANDOFF_STANDARDS.md has "Context Budget Protocol" section
- [ ] HANDOFF_STANDARDS.md has "Intra-Phase Checkpoints" section
- [ ] All updates integrate coherently with existing content
- [ ] REFLECTION_LOG.md updated with Phase 2 learnings
- [ ] `handoffs/HANDOFF_P3.md` created
- [ ] `handoffs/P3_ORCHESTRATOR_PROMPT.md` created

### Handoff Creation

After completing all work items:

1. **Update REFLECTION_LOG.md** with:
   - What worked in Phase 2
   - Integration challenges encountered
   - Context budget metrics

2. **Create HANDOFF_P3.md** with:
   - Phase 2 accomplishments
   - Updated file summaries
   - Context for Phase 3 (Validation)

3. **Create P3_ORCHESTRATOR_PROMPT.md**

### Troubleshooting

**Doc-writer returns incomplete update**:
- Specify exact insertion point in prompt
- Provide surrounding context for style matching
- Consider splitting into smaller update chunks

**Integration seems inconsistent**:
- Read source document structure first
- Match existing formatting patterns
- Request doc-writer to maintain style

**Approaching Yellow Zone**:
- Verify remaining tasks can be delegated
- Consider checkpointing before large updates
- Defer non-essential verification to Phase 3

---

## Task-Specific Prompts

Use these prompts from `AGENT_PROMPTS.md` for each delegation:

### Task 2.1: Delegation Rules Section

Delegate to doc-writer with prompt from AGENT_PROMPTS.md Task 2.1.

Key content to integrate:
- Mandatory delegation matrix (from delegation-rules-draft.md)
- Delegation trigger rules
- Orchestrator allowed actions

Insert location: After "## Agent-Phase Mapping" section.

### Task 2.2: Phase Sizing Section

Delegate to doc-writer with prompt from AGENT_PROMPTS.md.

Key content to integrate:
- Hard limits table (from phase-sizing-guidelines.md)
- Phase split triggers
- Complexity scoring

Insert location: After "## Standard Spec Structure" section.

### Task 2.3: Anti-Patterns Addition

Delegate to doc-writer with prompt from AGENT_PROMPTS.md.

Add three new anti-patterns:
- #11: Orchestrator Doing Research Directly
- #12: Unbounded Phase Sizes
- #13: Late Context Checkpoints

Insert location: In "## Anti-Patterns" section.

### Task 2.4: Context Budget Protocol

Delegate to doc-writer with prompt from AGENT_PROMPTS.md Task 2.2.

Key content to integrate:
- Budget tracking table (from context-budget-protocol.md)
- Zone response protocol
- Checkpoint trigger events

Insert location: Before "## Mandatory Requirements" section.

### Task 2.5: Checkpoint Section

Delegate to doc-writer with prompt from AGENT_PROMPTS.md.

Key content to integrate:
- When to use intra-phase checkpoints
- Checkpoint file format
- Recovery protocol

Insert location: After existing content.

### Task 2.6: Verification

Manual task - verify:
- New sections follow existing document style
- No contradictions with existing content
- Cross-references are accurate
- All specified content is present
