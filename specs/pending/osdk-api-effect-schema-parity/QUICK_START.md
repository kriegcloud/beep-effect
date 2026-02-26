# Quick Start

## What this package does
Defines a phase-by-phase, implementation-ready execution plan to deliver full stable and gated unstable parity from `@osdk/api` into `@beep/ontology` using Effect Schema-first design.

## Step 1: Run required discovery commands
1. `bun run beep docs laws`
2. `bun run beep docs skills`
3. `bun run beep docs policies`

## Step 2: Validate Graphiti proxy before fan-out
1. `curl -fsS http://127.0.0.1:8123/healthz`
2. If unavailable, continue and report: `graphiti-memory skipped: proxy unavailable`

## Step 3: Read in order
1. `README.md`
2. `MASTER_ORCHESTRATION.md`
3. `handoffs/HANDOFF_P0.md`
4. `handoffs/P0_ORCHESTRATOR_PROMPT.md`

## Step 4: Execute phases in order
`P0 -> P1 -> P2 -> P3 -> P4 -> P5 -> P6 -> P7`

Do not skip gates between phases.

## Step 5: Keep outputs and handoffs in sync
For each phase:
1. Write outputs in the phase output directory.
2. Update `outputs/manifest.json`.
3. Author next phase handoff and orchestrator prompt.

## Done condition
Implementation-ready completion is achieved when P7 verification gates pass and all required artifacts are present.
