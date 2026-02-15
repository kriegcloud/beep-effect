# P1 Orchestrator Prompt: enron-knowledge-demo-integration

You are the orchestrator for `specs/pending/enron-knowledge-demo-integration/`.

Goal: Wire knowledge-demo to real Enron extraction, GraphRAG, and LLM meeting prep via runtime RPC

Start from:

- `handoffs/HANDOFF_P1.md` (context + constraints)

Context-budget rule: if you hit Yellow/Red zones per `specs/_guide/HANDOFF_STANDARDS.md`, STOP and create a checkpoint handoff + next prompt rather than pushing through.

## Step 0: Delegate (If Available)

If `AGENT_PROMPTS.md` exists, use it to delegate Discovery/Evaluation tasks to sub-agents, then integrate their outputs.

## Step 1: Discovery

Write `outputs/codebase-context.md`:

- affected files/packages
- current patterns to follow
- dependencies and consumers
- existing tests and expectations

## Step 2: Plan

Write `outputs/remediation-plan.md`:

- incremental steps with checkpoints
- risks + mitigations
- test strategy

## Step 3: Implement (Iterate)

Follow the plan in small, reviewable diffs. Keep `bun run lint`, `bun run check`, and `bun run test` green.

## Step 4: Reflect

Update `REFLECTION_LOG.md` with what worked, what didn’t, and prompt refinements.
