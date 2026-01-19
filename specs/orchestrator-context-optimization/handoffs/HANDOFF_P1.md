# Phase 1 Handoff: Design

**Date**: 2026-01-18
**From**: Phase 0 (Analysis)
**To**: Phase 1 (Design)
**Status**: Ready for implementation

---

## Phase 0 Summary

Phase 0 analyzed the current state of orchestrator context management in the beep-effect monorepo. The analysis covered:

1. **Existing orchestrator prompts** - Audited all `*ORCHESTRATOR_PROMPT*.md` files
2. **SPEC_CREATION_GUIDE gaps** - Identified missing delegation guidance
3. **Agent capabilities** - Created comprehensive capability matrix
4. **KGI context issues** - Documented specific context exhaustion patterns

### Key Findings

| Finding | Impact | Addressed In |
|---------|--------|--------------|
| Orchestrators lack explicit delegation rules | Context exhaustion | Task 1.1 |
| No phase size constraints | Unbounded phases | Task 1.2 |
| No context budget protocol | Reactive checkpointing | Task 1.3 |
| Missing orchestrator template | Inconsistent prompts | Task 1.4 |

### Analysis Artifacts Created

| Artifact | Location | Status |
|----------|----------|--------|
| Orchestrator Prompt Audit | `outputs/orchestrator-audit.md` | Pending |
| Spec Guide Gaps | `outputs/spec-guide-gaps.md` | Pending |
| Agent Capability Matrix | `outputs/agent-matrix.md` | Pending |
| KGI Context Analysis | `outputs/kgi-context-analysis.md` | Pending |

**Note**: Phase 0 artifacts may be created during Phase 1 if P0 was not fully executed.

---

## Phase 1 Objectives

1. **Define mandatory delegation rules** - Clear matrix of task-to-agent assignments
2. **Establish phase sizing constraints** - Hard limits and split triggers
3. **Create context budget protocol** - Zone system with checkpoint triggers
4. **Design orchestrator prompt template** - Standard template for all specs

---

## Tasks with Delegation Assignments

| Task | Description | Delegate To | Output |
|------|-------------|-------------|--------|
| 1.1 | Define delegation rules | `doc-writer` | `outputs/delegation-rules-draft.md` |
| 1.2 | Establish phase sizing guidelines | `doc-writer` | `outputs/phase-sizing-guidelines.md` |
| 1.3 | Create context budget protocol | `doc-writer` | `outputs/context-budget-protocol.md` |
| 1.4 | Design orchestrator prompt template | `doc-writer` | `templates/ORCHESTRATOR_PROMPT.template.md` |

**Note**: While doc-writer can draft these documents, the orchestrator should synthesize and refine based on P0 findings.

---

## Design Specifications

### Task 1.1: Delegation Rules

**Purpose**: Define explicit rules for when orchestrators MUST delegate to sub-agents.

**Required Elements**:

1. **Mandatory Delegation Matrix**
   ```
   | Task Type | Delegate To | Never Do Directly |
   |-----------|-------------|-------------------|
   | Code exploration (>3 files) | codebase-researcher | Sequential Glob/Read |
   | Effect documentation | mcp-researcher | Manual doc search |
   | Source code | effect-code-writer | Writing .ts files |
   | Test code | test-writer | Writing .test.ts |
   | Architecture check | architecture-pattern-enforcer | Layer validation |
   | Documentation | doc-writer | README/AGENTS.md |
   | Error fixing | package-error-fixer | Manual fixes |
   ```

2. **Delegation Trigger Rules**
   - Task requires > 3 file reads
   - Task requires > 5 tool calls
   - Task involves code generation
   - Task involves test generation
   - Task requires broad search

3. **Orchestrator Allowed Actions**
   - Read 1-3 small files
   - Make 1-5 coordination tool calls
   - Synthesize sub-agent outputs
   - Create handoff documents
   - Update REFLECTION_LOG.md

---

### Task 1.2: Phase Sizing Guidelines

**Purpose**: Define constraints to prevent context exhaustion from unbounded phases.

**Required Elements**:

1. **Hard Limits**
   | Metric | Maximum | Recommended |
   |--------|---------|-------------|
   | Work items per phase | 7 | 5-6 |
   | Sub-agent delegations | 10 | 6-8 |
   | Direct tool calls | 20 | 10-15 |
   | Sessions per phase | 2 | 1 |

2. **Work Item Classification**
   - Small: 1-2 tool calls, 0-1 delegations
   - Medium: 3-5 tool calls, 2-3 delegations
   - Large: 6+ tool calls, 4+ delegations

3. **Phase Split Triggers**
   - 8+ work items → MUST split
   - 3+ Large items → MUST split
   - > 2 sessions estimated → MUST split

4. **Split Naming**: P[N]a, P[N]b, P[N]c

---

### Task 1.3: Context Budget Protocol

**Purpose**: Define tracking mechanism and checkpoint triggers.

**Required Elements**:

1. **Zone System**
   | Zone | Direct Calls | File Reads | Delegations | Action |
   |------|--------------|------------|-------------|--------|
   | Green | 0-10 | 0-2 | 0-5 | Continue |
   | Yellow | 11-15 | 3-4 | 6-8 | Assess |
   | Red | 16+ | 5+ | 9+ | STOP |

2. **Yellow Zone Protocol**
   - Assess remaining work (< 30% vs > 30%)
   - If < 30% → continue cautiously
   - If > 30% → create checkpoint

3. **Red Zone Protocol**
   - STOP immediately
   - Create `HANDOFF_P[N]_CHECKPOINT.md`
   - Document: completed, in-progress, remaining
   - Continue in new session or hand off

4. **Checkpoint Triggers** (any one)
   - 15+ direct tool calls
   - 4+ large file reads
   - 3 major sub-tasks completed
   - "Context pressure" feeling

---

### Task 1.4: Orchestrator Prompt Template

**Purpose**: Standard template ensuring consistent context management.

**Required Sections**:

1. **Role Definition**
   ```
   ## Your Role: COORDINATOR, NOT EXECUTOR

   You are orchestrating Phase [N] of [SPEC_NAME]. Your job is to:
   - PLAN task breakdown
   - DELEGATE all research and implementation
   - SYNTHESIZE sub-agent outputs
   - CHECKPOINT proactively
   ```

2. **Critical Prohibitions**
   ```
   **CRITICAL**: You MUST NOT:
   - Read > 3 files directly
   - Write any source code
   - Search documentation manually
   - Fix errors manually
   ```

3. **Delegation Matrix** (embedded)

4. **Context Budget Tracker**
   ```
   ## Context Budget
   - Direct tool calls: [0/20 max]
   - Large file reads: [0/5 max]
   - Sub-agent delegations: [0/10 max]

   **Checkpoint when any metric reaches 75%**
   ```

5. **Work Items** (max 7, with agent assignments)

6. **Verification Commands**

7. **Success Criteria**

8. **Next Steps** (handoff creation)

---

## Reference Files

| Purpose | Path | Notes |
|---------|------|-------|
| Spec guide to update | `specs/SPEC_CREATION_GUIDE.md` | Add delegation section |
| Handoff standards | `specs/HANDOFF_STANDARDS.md` | Add context budget section |
| Agent definitions | `.claude/agents/*.md` | Reference for matrix |
| Existing orchestrator | `specs/knowledge-graph-integration/handoffs/*.md` | Example patterns |
| P0 handoff | `handoffs/HANDOFF_P0.md` | Initial context |
| Agent prompts | `AGENT_PROMPTS.md` | Sub-agent prompt templates |
| Rubrics | `RUBRICS.md` | Evaluation criteria |

---

## Expected Outputs

| Output | Description | Location |
|--------|-------------|----------|
| Delegation rules draft | Formal delegation matrix and rules | `outputs/delegation-rules-draft.md` |
| Phase sizing guidelines | Size constraints and split triggers | `outputs/phase-sizing-guidelines.md` |
| Context budget protocol | Zone system and checkpoint protocol | `outputs/context-budget-protocol.md` |
| Orchestrator template | Standard template with all sections | `templates/ORCHESTRATOR_PROMPT.template.md` |

---

## Success Criteria

Phase 1 is complete when:
- [ ] Delegation rules are clear and unambiguous
- [ ] Phase sizing constraints are defined with hard limits
- [ ] Context budget protocol has zone system and triggers
- [ ] Orchestrator template includes all required sections
- [ ] All 4 output files exist
- [ ] Designs are ready for Phase 2 implementation
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings
- [ ] `handoffs/HANDOFF_P2.md` created
- [ ] `handoffs/P2_ORCHESTRATOR_PROMPT.md` created

---

## Context Budget Guidance

**This phase should**:
- Use 1-4 sub-agent delegations (doc-writer for drafts)
- Have ~10 direct tool calls for synthesis and refinement
- Stay in Green Zone throughout

**Checkpoint if**:
- More than 15 direct tool calls accumulate
- Designs require extensive iteration
- Approaching Yellow Zone on any metric

---

## Notes for Implementer

1. **Use P0 artifacts** if available - they inform design decisions
2. **Keep designs practical** - rules should be easy to follow
3. **Include examples** - abstract rules need concrete illustrations
4. **Consider edge cases** - what if a phase naturally needs 8 items?
5. **Design for real usage** - these rules will be used in production specs
