# V2T Canonical Spec - Agent Prompts

## Phase Start Rule

Every phase starts the same way:

1. Read `AGENTS.md`.
2. Read [../../../.patterns/jsdoc-documentation.md](../../../.patterns/jsdoc-documentation.md), [../../../standards/effect-first-development.md](../../../standards/effect-first-development.md), [../../../standards/schema-first.inventory.jsonc](../../../standards/schema-first.inventory.jsonc), and [../../../tooling/configs/src/eslint/SchemaFirstRule.ts](../../../tooling/configs/src/eslint/SchemaFirstRule.ts).
3. Use the `effect-first-development` and `schema-first-development` skills when they are available in-session.
4. Run `bun run codex:hook:session-start` when useful, then do the Graphiti memory preflight if the MCP is available: `get_status`, then `search_memory_facts` with `group_ids` as `["beep-dev"]` or the JSON string `"[\"beep-dev\"]"` when the wrapper only accepts strings.
5. Read [README.md](./README.md).
6. Read [outputs/manifest.json](./outputs/manifest.json).
7. Read [prompts/README.md](./prompts/README.md) and [prompts/ORCHESTRATOR_OPERATING_MODEL.md](./prompts/ORCHESTRATOR_OPERATING_MODEL.md).
8. Read [handoffs/HANDOFF_P0-P4.md](./handoffs/HANDOFF_P0-P4.md) and [handoffs/P0-P4_ORCHESTRATOR_PROMPT.md](./handoffs/P0-P4_ORCHESTRATOR_PROMPT.md) when bootstrapping a fresh session.
9. Read prior phase artifacts that materially constrain the active phase.
10. Read the active phase handoff.
11. Apply the conformance matrix from [README.md](./README.md) before claiming progress.
12. Execute only the active phase as the orchestrator and stop at its exit gate.
13. Run at least one read-only review wave before phase closeout. If it finds substantive issues, integrate them and rerun the review.
14. Update the phase artifact and manifest before exiting, then write a concise Graphiti summary memory when available.

## Prompt: P0 Orchestrator

You are the P0 phase orchestrator for V2T. Own the research plan, any delegation, the decision log, and phase closeout. Read `handoffs/HANDOFF_P0.md`, the preserved PRD inputs under `outputs/`, `apps/V2T`, `packages/VT2`, `apps/V2T/scripts/build-sidecar.ts`, `packages/common/ui/src/components/speech-input.tsx`, the repo-law inputs named in `README.md`, and the delegation assets under `prompts/`. Confirm commands and task claims against live workspace files instead of assuming parity between `@beep/v2t` and `@beep/VT2`. If you delegate, use the custom agents and prompt kit documented under `.codex/` and `prompts/`, keep workers bounded, and integrate their results yourself. Use `grill-me` when product or phase assumptions materially change the package. Run a read-only review wave before closing P0. Write or refine `RESEARCH.md`, append decisions to `outputs/grill-log.md`, update `outputs/manifest.json`, and record the conformance findings you relied on.

## Prompt: P1 Orchestrator

You are the P1 phase orchestrator for V2T. Own the design plan, any delegation, the integration of specialist outputs, and phase closeout. Read `handoffs/HANDOFF_P1.md`, `RESEARCH.md`, the existing V2T app shell, the `@beep/VT2` sidecar package, the repo-law inputs named in `README.md`, and the delegation assets under `prompts/`. If you delegate, prefer schema, service, boundary, and persistence specialists with disjoint scopes. Run a read-only review wave before closing P1. Write or refine `DESIGN_RESEARCH.md` with the workflow, domain model, storage posture, adapter boundaries, UI surface contracts, and the effect-first plus schema-first constraints the eventual implementation must satisfy.

## Prompt: P2 Orchestrator

You are the P2 phase orchestrator for V2T. Own the implementation plan, any delegation, the command-truth audit, and phase closeout. Read `handoffs/HANDOFF_P2.md`, `RESEARCH.md`, `DESIGN_RESEARCH.md`, `apps/V2T`, `packages/VT2`, `apps/V2T/scripts/build-sidecar.ts`, `package.json`, `turbo.json`, the repo-law inputs named in `README.md`, and the delegation assets under `prompts/`. If you delegate, use read-only scouts and reviewers to validate file order, command reality, and gate completeness. Write or refine `PLANNING.md` with file/module rollout order, acceptance criteria, dependencies, and verification commands. Lock only commands that actually exist in the live workspace task graph. Run a read-only review wave before closing P2. Do not implement the plan in this phase.

## Prompt: P3 Orchestrator

You are the P3 phase orchestrator for V2T. Own the local execution plan, worker partitioning, integration of patches, quality gates, and phase closeout. Read `handoffs/HANDOFF_P3.md`, the three prior phase artifacts, the repo-law inputs named in `README.md`, the concrete repo seams they name, and the delegation assets under `prompts/`. Implement only the approved slice, extend the current `@beep/VT2` control plane unless an explicit migration is documented, keep provider logic behind adapters, satisfy the effect-first, schema-first, and docgen-clean rules explicitly, document deviations and conformance evidence in `EXECUTION.md`, and stop after the required targeted plus repo-law gates pass. If you delegate, keep write scopes disjoint and use the quality reviewer after each merge wave and before closing the phase.

## Prompt: P4 Orchestrator

You are the P4 phase orchestrator for V2T. Own the verification plan, any read-only delegation, the readiness call, and phase closeout. Read `handoffs/HANDOFF_P4.md`, all prior phase artifacts, the repo-law inputs named in `README.md`, the relevant command surfaces in `apps/V2T` and `packages/VT2`, and the delegation assets under `prompts/`. Write or refine `VERIFICATION.md` with command results, manual scenario evidence, failure classifications, conformance evidence, and an explicit readiness statement. If you delegate, use read-only specialists to audit evidence and boundary behavior, rerun review if new issues are found, and keep final readiness judgment in the orchestrator session.
