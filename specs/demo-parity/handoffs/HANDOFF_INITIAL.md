# Demo Parity Handoff - Initial Session

> **Status**: READY TO START
> **Date**: 2026-01-10
> **Phase**: P0 - Research

## Mission

Achieve **100% feature parity** between the legacy FlexLayout demo (`tmp/FlexLayout/demo/`) and the Effect-ported demo (`apps/todox/src/app/demo/page.tsx`).

## Your Role

You are an **orchestration agent**. You coordinate sub-agents to preserve your context window.

### Critical Rules

1. **NEVER write code directly** - Delegate ALL implementation to sub-agents via Task tool
2. **NEVER read large files directly** - Delegate file exploration to sub-agents
3. **Compress all results** - Summarize sub-agent outputs before storing
4. **Monitor context** - If you reach 50% context, create a handoff immediately
5. **Sequential phases** - Complete each phase fully before proceeding

## Getting Started

### Step 1: Verify Prerequisites

Before starting research, ensure the legacy demo is accessible:

```bash
# In a separate terminal
cd tmp/FlexLayout
npm install
npm run dev
# Should be running at http://localhost:5173/
```

### Step 2: Read the Spec

Read these files to understand the full spec:
1. `specs/demo-parity/README.md` - Overview and success criteria
2. `specs/demo-parity/ORCHESTRATION_PROMPT.md` - Detailed execution instructions
3. `specs/demo-parity/CONTEXT.md` - Technical context (reference as needed)
4. `specs/demo-parity/AGENT_PROMPTS.md` - Sub-agent prompt templates

### Step 3: Begin Research Phase

Deploy **all 5 researcher agents in parallel** using multiple Task calls in a single message. The prompts are in `ORCHESTRATION_PROMPT.md` under "Phase 0: Research".

## Phase Overview

| Phase | Description | Deliverable |
|-------|-------------|-------------|
| P0 | Research | 5 reports + master synthesis |
| P1 | Planning | Implementation checklist |
| P2+ | Implementation | Working demo features |

## Researcher Agents to Deploy

Deploy these **in parallel** (single message with 5 Task calls):

1. **UI/UX Features** - Playwright exploration of legacy demo
2. **Component Factory** - Analyze demo component system
3. **Model/Actions** - Compare action system legacy vs port
4. **View/Styling** - Analyze view layer and themes
5. **Gap Analysis** - Current port completeness

## After Research Completes

1. Wait for all 5 researchers to return
2. Deploy a **synthesis agent** to create master-research-report.md
3. Request user approval before proceeding to Planning (P1)

## Files to Create During P0

| File | Created By |
|------|------------|
| `research-reports/01-uiux-features.md` | Researcher 1 |
| `research-reports/02-component-factory.md` | Researcher 2 |
| `research-reports/03-model-actions.md` | Researcher 3 |
| `research-reports/04-view-styling.md` | Researcher 4 |
| `research-reports/05-gap-analysis.md` | Researcher 5 |
| `outputs/master-research-report.md` | Synthesizer |

## Context Exhaustion Protocol

If you reach 50% context capacity:

1. STOP current work
2. Create `handoffs/HANDOFF_P[CURRENT].md` with:
   - All completed work
   - Current task state
   - Remaining tasks with prompts
   - Full context for resume
3. Output the handoff file path so a new agent can continue

## Success Criteria for P0

- [ ] All 5 researcher reports exist in `research-reports/`
- [ ] Master research report exists in `outputs/master-research-report.md`
- [ ] `outputs/progress.md` updated with P0 completion status
- [ ] User approval received to proceed to P1

## Entry Point

Start execution by reading `specs/demo-parity/ORCHESTRATION_PROMPT.md` and deploying the 5 researcher agents in parallel.

---

*Created: 2026-01-10*
