# V2T Canonical Spec - Agent Prompts

## Phase Start Rule

Every phase starts the same way:

1. Run `bun run codex:hook:session-start`.
2. Read [outputs/manifest.json](./outputs/manifest.json) first, then follow `fresh_session_read_order`.
3. Read `AGENTS.md`.
4. Read [../../../.patterns/jsdoc-documentation.md](../../../.patterns/jsdoc-documentation.md), [../../../standards/effect-first-development.md](../../../standards/effect-first-development.md), [../../../standards/schema-first.inventory.jsonc](../../../standards/schema-first.inventory.jsonc), and [../../../tooling/configs/src/eslint/SchemaFirstRule.ts](../../../tooling/configs/src/eslint/SchemaFirstRule.ts).
5. Use the `effect-first-development` and `schema-first-development` skills when they are available in-session.
6. Read [README.md](./README.md), [prompts/README.md](./prompts/README.md), [prompts/ORCHESTRATOR_OPERATING_MODEL.md](./prompts/ORCHESTRATOR_OPERATING_MODEL.md), and [prompts/GRAPHITI_MEMORY_PROTOCOL.md](./prompts/GRAPHITI_MEMORY_PROTOCOL.md).
7. Read [handoffs/HANDOFF_P0-P4.md](./handoffs/HANDOFF_P0-P4.md) and [handoffs/P0-P4_ORCHESTRATOR_PROMPT.md](./handoffs/P0-P4_ORCHESTRATOR_PROMPT.md) when bootstrapping a fresh session.
8. Read prior phase artifacts that materially constrain the active phase.
9. Read the active phase handoff and active phase orchestrator prompt.
10. Apply the conformance matrix from [README.md](./README.md) before claiming progress.
11. Run the Graphiti preflight or fallback exactly as documented in [prompts/GRAPHITI_MEMORY_PROTOCOL.md](./prompts/GRAPHITI_MEMORY_PROTOCOL.md).
12. Execute only the active phase as the orchestrator and stop at its exit gate.
13. Run at least one read-only review wave before phase closeout. If it finds substantive issues, integrate them and rerun review.
14. Update the phase artifact and manifest before exiting, then write back durable Graphiti memory or a session-end progress summary when the phase learned something worth reusing.

## Shared Prompt Packet

Every phase prompt assumes these rules remain active:

- `outputs/manifest.json` is authoritative for the active phase and the active phase asset routing.
- `fresh_session_read_order` inside `outputs/manifest.json` is the canonical startup order after the manifest is open.
- Do not infer the active phase from prose status headings inside individual markdown files.
- When command truth matters, verify the root plus workspace `package.json` and `turbo.json` files instead of trusting stale prose.
- The live app workspace package name is `@beep/v2t`, not the stale uppercase
  app filter.
- Use `bun run --cwd apps/V2T lint` for the default targeted app lint gate.
- Do not replace that default with `turbo run lint --filter=@beep/v2t`
  unless you have explicitly audited the live Turbo graph for the current repo
  state. The present dry-run still expands to the nonexistent
  `@beep/VT2#lint` task.
- Treat the active phase handoff plus active phase orchestrator prompt as the
  shortest authoritative path for the current session. Do not keep rereading
  unrelated phase prompts once the active route is known.
- Require every delegated worker to return the
  [SUBAGENT_OUTPUT_CONTRACT.md](./prompts/SUBAGENT_OUTPUT_CONTRACT.md) format.
- Use [prompts/GRAPHITI_MEMORY_PROTOCOL.md](./prompts/GRAPHITI_MEMORY_PROTOCOL.md) for exact recall, fallback, and writeback behavior instead of improvising Graphiti usage per phase.
- Update `REFLECTION_LOG.md` when package-local routing, operator guidance, or validator behavior changes.
- Append `outputs/grill-log.md` only when a new package-shape decision or default is being locked.
- Stop at the active phase exit gate instead of silently continuing to the next phase.

## Prompt: P0 Orchestrator

You are the P0 phase orchestrator for V2T. Own the research plan, any delegation, the decision log, and phase closeout. Read `handoffs/HANDOFF_P0.md`, the preserved PRD inputs under `outputs/`, `apps/V2T`, `packages/VT2`, `apps/V2T/scripts/build-sidecar.ts`, `packages/common/ui/src/components/speech-input.tsx`, the repo-law inputs named in `README.md`, and the delegation assets under `prompts/`. Confirm commands and task claims against live workspace files instead of assuming parity between `@beep/v2t` and `@beep/VT2`. If you delegate, use the custom agents and prompt kit documented under `.codex/` and `prompts/`, keep workers bounded, and integrate their results yourself. Use `grill-me` when product or phase assumptions materially change the package. Close P0 only after a read-only review wave finds no unresolved substantive issues. Write or refine `RESEARCH.md`, append decisions to `outputs/grill-log.md`, update `outputs/manifest.json`, and record the conformance findings you relied on.

## Prompt: P1 Orchestrator

You are the P1 phase orchestrator for V2T. Own the design plan, any delegation, the integration of specialist outputs, and phase closeout. Read `handoffs/HANDOFF_P1.md`, `RESEARCH.md`, the existing V2T app shell, the `@beep/VT2` sidecar package, the repo-law inputs named in `README.md`, and the delegation assets under `prompts/`. If you delegate, prefer schema, service, persistence, and boundary specialists with disjoint scopes. Close P1 only after a read-only review wave finds no unresolved substantive issues. Write or refine `DESIGN_RESEARCH.md` with the workflow, domain model, storage posture, adapter boundaries, UI surface contracts, and the effect-first plus schema-first constraints the eventual implementation must satisfy.

## Prompt: P2 Orchestrator

You are the P2 phase orchestrator for V2T. Own the implementation plan, any delegation, the command-truth audit, and phase closeout. Read `handoffs/HANDOFF_P2.md`, `RESEARCH.md`, `DESIGN_RESEARCH.md`, `apps/V2T`, `packages/VT2`, `apps/V2T/scripts/build-sidecar.ts`, the root plus workspace `package.json` and `turbo.json` files, the repo-law inputs named in `README.md`, and the delegation assets under `prompts/`. If you delegate, use read-only scouts and reviewers to validate file order, command reality, and gate completeness. Write or refine `PLANNING.md` with file/module rollout order, acceptance criteria, dependencies, and verification commands. Lock only commands that actually exist in the live workspace task graph, including the lowercase `@beep/v2t` package filter and the package-local app lint command. Close P2 only after a read-only review wave finds no unresolved substantive issues. Do not implement the plan in this phase.

## Prompt: P3 Orchestrator

You are the P3 phase orchestrator for V2T. Own the local execution plan, worker partitioning, integration of patches, quality gates, and phase closeout. Read `handoffs/HANDOFF_P3.md`, the three prior phase artifacts, the repo-law inputs named in `README.md`, the concrete repo seams they name, the root plus workspace `package.json` and `turbo.json` files, and the delegation assets under `prompts/`. Implement only the approved slice, extend the current `@beep/VT2` control plane unless an explicit migration is documented, keep provider logic behind adapters, satisfy the effect-first, schema-first, and docgen-clean rules explicitly, document deviations and conformance evidence in `EXECUTION.md`, and stop after the required targeted plus repo-law gates pass. If you delegate, keep write scopes disjoint and use the quality reviewer after each meaningful merge wave and before closing the phase.

## Prompt: P4 Orchestrator

You are the P4 phase orchestrator for V2T. Own the verification plan, any read-only delegation, the readiness call, and phase closeout. Read `handoffs/HANDOFF_P4.md`, all prior phase artifacts, the repo-law inputs named in `README.md`, the relevant command surfaces in `apps/V2T` and `packages/VT2`, the root plus workspace `package.json` and `turbo.json` files, and the delegation assets under `prompts/`. Write or refine `VERIFICATION.md` with command results, manual scenario evidence, failure classifications, conformance evidence, and an explicit readiness statement. If you delegate, use read-only specialists to audit evidence and boundary behavior; keep final readiness judgment in the orchestrator session and close P4 only after the final review wave finds no unresolved substantive issues.
