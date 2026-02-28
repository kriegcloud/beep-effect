# Master Orchestration

## Phase State Machine

```text
P0 -> P1 -> P2 -> P3 -> P4 -> P5 -> P6
```

No phase is complete until:

1. Declared outputs exist.
2. Exit gate checks pass.
3. Next-phase handoff pair exists.

## P0: Scaffolding + Source Contract Freeze

Deliverables:

1. Full canonical spec structure.
2. Source-of-truth contract document.
3. Current-state audit of scaffold and policies.
4. Locked benchmark protocol.

Exit gate:

1. `HANDOFF_P1.md` and `P1_ORCHESTRATOR_PROMPT.md` created.
2. Handoff includes Working/Episodic/Semantic/Procedural sections.

## P1: Harness Hardening

Work items:

1. Replace `node:fs` and `node:path` usage under `tooling/agent-eval/src/**` with `effect/FileSystem` + `effect/Path`.
2. Provide `NodeFileSystem.layer` + `NodePath.layer` at CLI runtime boundary only.
3. Replace nested imperative loop execution with deterministic run matrix + `Effect.forEach`.
4. Preserve existing schemas, extend only required additions.
5. Remove tracked `tooling/agent-eval/dist/tsconfig.tsbuildinfo`.
6. Replace native `Error` usage in `tooling/*/src` with `S.TaggedErrorClass` typed errors.
7. Add hard lint gate forbidding `new Error` / `throw new Error` in `tooling/*/src`.

Exit gate:

1. `tooling/agent-eval` passes `check`, `lint`, `test`, and `docgen`.
2. `bun run lint:tooling-tagged-errors` passes.

## P2: Real Benchmark Execution Layer

Work items:

1. Hybrid mode: weekly live runs + local dry-run mode.
2. Initial model pins: `gpt-5.2`, `claude-sonnet-4-6`.
3. Invocation contracts:
   - `codex exec --json`
   - `claude -p --output-format json`
4. Default disposable worktree isolation per run.
5. Condition semantics enforced for `current`, `minimal`, `adaptive`, `adaptive_kg`.

Exit gate:

1. Baseline A/B (`current` vs `minimal`) artifacts produced with measured deltas.

## P3: Adaptive Overlay + Skill Enforcement

Work items:

1. Keep immutable core in `AGENTS.md` + `standards/effect-laws-v1.md`.
2. Use task-aware overlays from `.agents/policies`.
3. Deterministically cap active skills to 3.
4. Remove broad always-on fanout.

Exit gate:

1. `adaptive` beats `current`, or reduces wrong-API incidents with no safety regression.

## P4: Effect v4 Reliability Layer

Work items:

1. Build correction index from local migration + KG sources only.
2. Expand detector categories: v3 symbol, wrong module path, removed/renamed API.
3. Generate preflight correction packet before run execution.
4. Critical incidents hard-fail success logic.

Exit gate:

1. Wrong-API incidents track toward 70% reduction target.

## P5: KG Closed Loop

Work items:

1. Enforce run-level failure ontology.
2. Post-run ingestion to Graphiti `beep-dev` as structured episodes.
3. Pre-run retrieval query from prompt + touched paths + failure signature.
4. Packet bounds with dedupe and strict caps.
5. Controlled comparison: `adaptive` vs `adaptive_kg`.

Exit gate:

1. `adaptive_kg` shows measurable lift or incident reduction.

## P6: Console + Playbook + Promotion Lock

Work items:

1. Build minimal reliability console in `apps/web`.
2. Publish `docs/agent-reliability-playbook.md`.
3. Enforce promotion rule with benchmark evidence or strategic exception log.

Exit gate:

1. Day-90 scorecard completed against all success criteria.
