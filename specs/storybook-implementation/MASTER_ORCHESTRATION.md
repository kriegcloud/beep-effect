# Master Orchestration Guide

> Complete workflow for orchestrating Storybook implementation across 5 phases.

---

## Critical Orchestrator Rules

### You Are NOT Allowed To:

1. **Read source files directly** - Delegate to `codebase-researcher`
   - VIOLATION: Using `Read` tool on `packages/ui/**/*.tsx`
   - VIOLATION: Using `Glob` or `Grep` on source directories
2. **Write any code** - Delegate to `effect-code-writer`
   - VIOLATION: Using `Write` or `Edit` on `.ts`, `.tsx`, `.json` files
3. **Run tests** - Delegate to `test-writer`
   - VIOLATION: Using `Bash` with `bun test` commands
4. **Debug errors** - Delegate to `package-error-fixer`
   - VIOLATION: Manually analyzing error output and editing files
5. **Search web/docs** - Delegate to `web-researcher` or `mcp-researcher`
   - VIOLATION: Using `WebSearch` or `WebFetch` directly
6. **Make more than 5 direct tool calls** per phase
   - ALLOWED tools: `Read` (outputs only), `Write` (handoffs only), `Task` (sub-agents)
   - Count: Task launches do NOT count toward the 5-call limit
7. **Hold context beyond 4,000 tokens** per handoff
   - Estimate: ~4 tokens per word
   - Check: `wc -w handoffs/HANDOFF_P*.md | awk '{print $1 * 4}'`

### You ARE Allowed To:

1. Read `outputs/*.md` summaries (max 3 files per decision)
   - ONLY files in `specs/storybook-implementation/outputs/`
   - NOT source code files
2. Launch sub-agents with prompts from `AGENT_PROMPTS.md`
   - Use `Task` tool with appropriate `subagent_type`
   - Launch in parallel when tasks are independent
3. Synthesize sub-agent outputs into decisions
   - Compress to ≤100 words per output
   - Extract: key findings, decisions, blockers only
4. Create handoff documents in `handoffs/`
   - HANDOFF_P[N].md - context document
   - P[N]_ORCHESTRATOR_PROMPT.md - copy-paste prompt
5. Update `REFLECTION_LOG.md` with phase learnings
   - Use observation → insight → action format
   - Include prompt refinements
6. Ask clarifying questions via `AskUserQuestion` tool

### Violation Detection

If you find yourself doing any of these, STOP and delegate:

| Action | You're Doing | Delegate To |
|--------|--------------|-------------|
| `Read packages/ui/...` | Reading source | `codebase-researcher` |
| `Grep "component"` | Searching code | `codebase-researcher` |
| `WebSearch "storybook"` | External research | `web-researcher` |
| `Write *.tsx` | Writing code | `effect-code-writer` |
| `Bash "bun test"` | Running tests | `test-writer` |
| Analyzing TypeScript errors | Debugging | `package-error-fixer` |

---

## Phase 1: Research

**Objective**: Gather complete context about packages, existing patterns, and external best practices.

### Orchestrator Actions

1. **Launch codebase-researcher** (parallel):
   - Prompt: Use template from `AGENT_PROMPTS.md#codebase-researcher-p1`
   - Output: `outputs/codebase-context.md`

2. **Launch web-researcher** (parallel):
   - Prompt: Use template from `AGENT_PROMPTS.md#web-researcher-p1`
   - Output: `outputs/external-research.md`

3. **Launch codebase-researcher** (after step 1):
   - Prompt: Use template from `AGENT_PROMPTS.md#component-inventory`
   - Output: `outputs/component-inventory.md`

4. **Synthesize**: Read all 3 outputs, identify gaps, risks, patterns

5. **Create Handoff**:
   - Write `handoffs/HANDOFF_P2.md` with research synthesis
   - Write `handoffs/P2_ORCHESTRATOR_PROMPT.md`

6. **Update Reflection**: Add Phase 1 entry to `REFLECTION_LOG.md`

### Exit Criteria

- [ ] `outputs/codebase-context.md` exists (≤500 lines)
- [ ] `outputs/external-research.md` exists (≤300 lines)
- [ ] `outputs/component-inventory.md` exists with component list
- [ ] `REFLECTION_LOG.md` updated
- [ ] Both P2 handoff files created

---

## Phase 2: Design

**Objective**: Design Storybook architecture, addon selection, and theme integration.

### Orchestrator Actions

1. **Read P1 Outputs**: Skim `outputs/codebase-context.md`, `outputs/external-research.md`

2. **Launch architecture-pattern-enforcer**:
   - Prompt: Use template from `AGENT_PROMPTS.md#architecture-p2`
   - Output: `outputs/architecture-design.md`

3. **Launch doc-writer** (after step 2):
   - Prompt: Use template from `AGENT_PROMPTS.md#addon-selection`
   - Output: `outputs/addon-selection.md`

4. **Launch doc-writer**:
   - Prompt: Use template from `AGENT_PROMPTS.md#theme-integration-plan`
   - Output: `outputs/theme-integration-plan.md`

5. **Synthesize**: Combine architecture, addons, and theme into cohesive design

6. **Create Handoff**:
   - Write `handoffs/HANDOFF_P3.md`
   - Write `handoffs/P3_ORCHESTRATOR_PROMPT.md`

7. **Update Reflection**: Add Phase 2 entry

### Exit Criteria

- [ ] `outputs/architecture-design.md` exists
- [ ] `outputs/addon-selection.md` exists
- [ ] `outputs/theme-integration-plan.md` exists
- [ ] `REFLECTION_LOG.md` updated
- [ ] Both P3 handoff files created

---

## Phase 3: Planning

**Objective**: Create detailed implementation plan with ordered tasks.

### Orchestrator Actions

1. **Read P2 Outputs**: Skim all design documents

2. **Launch doc-writer**:
   - Prompt: Use template from `AGENT_PROMPTS.md#implementation-plan`
   - Output: `outputs/implementation-plan.md`

3. **Launch doc-writer**:
   - Prompt: Use template from `AGENT_PROMPTS.md#directory-structure`
   - Output: `outputs/directory-structure.md`

4. **Launch reflector**:
   - Prompt: Use template from `AGENT_PROMPTS.md#rubric-generation`
   - Output: Update `RUBRICS.md`

5. **Validate Plan**: Ensure ≤7 work items per implementation sub-phase

6. **Create Handoff**:
   - Write `handoffs/HANDOFF_P4.md`
   - Write `handoffs/P4_ORCHESTRATOR_PROMPT.md`

7. **Update Reflection**: Add Phase 3 entry

### Exit Criteria

- [ ] `outputs/implementation-plan.md` exists with ≤7 items per sub-phase
- [ ] `outputs/directory-structure.md` exists
- [ ] `RUBRICS.md` contains evaluation criteria
- [ ] `REFLECTION_LOG.md` updated
- [ ] Both P4 handoff files created

---

## Phase 4: Implementation

**Objective**: Execute implementation plan. This phase may span 2-3 sessions.

### Sub-Phase 4a: Foundation Setup

1. **Launch effect-code-writer**:
   - Prompt: Use template from `AGENT_PROMPTS.md#storybook-config`
   - Creates: `.storybook/main.ts`, `.storybook/preview.tsx`

2. **Launch effect-code-writer**:
   - Prompt: Use template from `AGENT_PROMPTS.md#theme-decorator`
   - Creates: `.storybook/decorators/theme-decorator.tsx`

3. **Launch package-error-fixer** (if errors):
   - Prompt: Fix any build/type errors in Storybook config

4. **Verify**: Storybook dev server starts

### Sub-Phase 4b: Package Stories

1. **Launch effect-code-writer** (for @beep/ui):
   - Prompt: Use template from `AGENT_PROMPTS.md#ui-stories`
   - Creates: `packages/ui/ui/src/**/*.stories.tsx`

2. **Launch effect-code-writer** (for @beep/ui-editor):
   - Prompt: Use template from `AGENT_PROMPTS.md#editor-stories`
   - Creates: `packages/ui/editor/src/**/*.stories.tsx`

3. **Launch package-error-fixer** (if errors):
   - Fix story compilation issues

4. **Verify**: Stories render in Storybook

### Sub-Phase 4c: Theme Integration

1. **Launch effect-code-writer**:
   - Prompt: Use template from `AGENT_PROMPTS.md#theme-toggle`
   - Implements light/dark mode switching

2. **Launch effect-code-writer**:
   - Prompt: Use template from `AGENT_PROMPTS.md#css-integration`
   - Configures Tailwind + MUI CSS processing

3. **Verify**: Theme switching works for all components

### Exit Criteria (Phase 4 Overall)

- [ ] Storybook dev server runs without errors
- [ ] Light/dark mode toggle functional
- [ ] ≥5 stories per package
- [ ] MUI components render correctly
- [ ] shadcn components render correctly
- [ ] `REFLECTION_LOG.md` updated after each sub-phase
- [ ] Both P5 handoff files created

---

## Phase 5: Verification & Testing

**Objective**: Validate implementation, establish baselines, document CI integration.

### Orchestrator Actions

1. **Launch code-reviewer**:
   - Prompt: Use template from `AGENT_PROMPTS.md#code-review-p5`
   - Output: `outputs/code-review.md`

2. **Launch test-writer**:
   - Prompt: Use template from `AGENT_PROMPTS.md#story-tests`
   - Creates: Story interaction tests

3. **Launch doc-writer**:
   - Prompt: Use template from `AGENT_PROMPTS.md#ci-documentation`
   - Output: `outputs/ci-integration.md`

4. **Generate Verification Report**:
   - Synthesize all outputs into `outputs/verification-report.md`

5. **Update Reflection**: Add final Phase 5 entry

6. **Close Spec**: Update README.md status to COMPLETE

### Exit Criteria

- [ ] `outputs/code-review.md` shows no high-severity issues
- [ ] `outputs/verification-report.md` confirms all success criteria
- [ ] `outputs/ci-integration.md` documents CI workflow
- [ ] Story tests pass
- [ ] `REFLECTION_LOG.md` complete
- [ ] README.md status updated to COMPLETE

---

## Handoff Template Structure

### HANDOFF_P[N].md (Context Document)

```markdown
# Handoff: Phase [N] → Phase [N+1]

## Phase [N-1] Summary
[What was accomplished - 2-3 sentences]

## Key Learnings Applied
[Bullet list of insights from previous phases]

## Phase [N] Objectives
[What needs to be accomplished]

## Critical Patterns
[Code examples, gotchas, constraints]

## Reference Files
[List of files to consult]

## Verification Steps
[Commands to run]

## Success Criteria
- [ ] Checklist items
```

### P[N]_ORCHESTRATOR_PROMPT.md (Launch Prompt)

```markdown
# Phase [N] Orchestrator Prompt

Copy-paste this prompt to start Phase [N].

---

You are orchestrating Phase [N] of the storybook-implementation spec.

## Your Role
YOU ARE AN ORCHESTRATOR. You NEVER write code or read source files directly.
You ONLY launch sub-agents, read their compressed outputs, and synthesize.

## Context
[Brief context from previous phases - ≤200 words]

## Your Mission
[3-5 specific objectives]

## Sub-Agent Launches
[Ordered list of agents to launch with prompt references]

## Output Requirements
- Update `REFLECTION_LOG.md`
- Create `handoffs/HANDOFF_P[N+1].md`
- Create `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md`

## Read Full Context
`specs/storybook-implementation/handoffs/HANDOFF_P[N].md`
```

---

## Context Compression Rules

When reading sub-agent outputs:

1. **Extract only**: Key findings, decisions, blockers
2. **Discard**: Verbose explanations, code samples (reference file paths instead)
3. **Compress to**: ≤100 words per output file
4. **Format as**: Bullet points, not prose

When creating handoffs:

1. **Working memory**: Current tasks, blockers only
2. **Episodic memory**: One-sentence phase summaries
3. **Semantic memory**: Only non-obvious constants
4. **Procedural memory**: Links to docs, not inline content

---

## Error Recovery Protocol

If a sub-agent fails or produces incomplete output:

1. **Do NOT retry more than once**
2. **Log the failure** in REFLECTION_LOG.md
3. **Ask the user** via AskUserQuestion with specific options:
   - Retry with modified prompt
   - Skip this task and proceed
   - Pause spec for manual intervention

If an implementation sub-phase has >3 errors:

1. **Split the sub-phase** into smaller chunks
2. **Create intermediate handoff** (e.g., HANDOFF_P4a.md)
3. **Resume in new session** with fresh context
