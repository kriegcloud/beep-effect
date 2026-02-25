# Quick Start

## What this package gives you
A decision-complete P0 launch packet for AST KG + JSDoc semantic enrichment on Graphiti, hardened against gaps identified from [outputs/initial_plan.md](./outputs/initial_plan.md).

## Step 1: Required discovery commands
Run these first in repo root:
1. `bun run beep docs laws`
2. `bun run beep docs skills`
3. `bun run beep docs policies`

## Step 2: Read in order
1. [README.md](./README.md)
2. [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md)
3. [handoffs/HANDOFF_P0.md](./handoffs/HANDOFF_P0.md)
4. [outputs/p0-research/gap-closure-against-initial-plan.md](./outputs/p0-research/gap-closure-against-initial-plan.md)
5. [outputs/p0-research/landscape-comparison.md](./outputs/p0-research/landscape-comparison.md)
6. [outputs/p0-research/reuse-vs-build-matrix.md](./outputs/p0-research/reuse-vs-build-matrix.md)
7. [outputs/p0-research/constraints-and-gaps.md](./outputs/p0-research/constraints-and-gaps.md)

## Step 3: Confirm lock set
Validate these are unchanged before implementation:
1. Five locked defaults from README.
2. Seven locked interface contracts from README.

## Step 4: Start P1 execution
Use these prompt files:
1. [handoffs/P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md)
2. [handoffs/P1_RESEARCH_AGENT_PROMPT.md](./handoffs/P1_RESEARCH_AGENT_PROMPT.md)
3. [handoffs/P1_REUSE_AUDIT_AGENT_PROMPT.md](./handoffs/P1_REUSE_AUDIT_AGENT_PROMPT.md)

## Step 5: Verify package hygiene
1. `bun run agents:pathless:check`
2. `rg --files specs/pending/agentic-codebase-ast-kg-enriched-with-jsdoc`

## Done condition
Proceed only when all required P0 files exist and [handoffs/HANDOFF_P0.md](./handoffs/HANDOFF_P0.md) checklist is fully checked.
