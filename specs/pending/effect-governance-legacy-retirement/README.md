# Effect Governance Legacy Retirement

## Status

**P4 VERIFIED - FULL RETIREMENT**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-04-15
- **Updated:** 2026-04-15

## Quick Navigation

### Root

- [README.md](./README.md) - operator guide and package contract
- [QUICK_START.md](./QUICK_START.md) - fresh-session phase routing
- [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) - condensed per-phase orchestrator prompts
- [REFLECTION_LOG.md](./REFLECTION_LOG.md) - package-maintenance notes

### Phase Artifacts

- [RESEARCH.md](./RESEARCH.md) - P0 live inventory and retirement research
- [VALIDATED_OPTIONS.md](./VALIDATED_OPTIONS.md) - P1 validated retirement shortlist
- [PLANNING.md](./PLANNING.md) - P2 ranked implementation plan
- [EXECUTION.md](./EXECUTION.md) - P3 implementation record
- [VERIFICATION.md](./VERIFICATION.md) - P4 retirement, dependency, and safety evidence

### Handoffs

- [handoffs/README.md](./handoffs/README.md) - handoff index
- [handoffs/HANDOFF_P0-P4.md](./handoffs/HANDOFF_P0-P4.md) - cross-phase overview handoff
- [handoffs/P0-P4_ORCHESTRATOR_PROMPT.md](./handoffs/P0-P4_ORCHESTRATOR_PROMPT.md) - combined phase router prompt
- [handoffs/HANDOFF_P0.md](./handoffs/HANDOFF_P0.md)
- [handoffs/HANDOFF_P1.md](./handoffs/HANDOFF_P1.md)
- [handoffs/HANDOFF_P2.md](./handoffs/HANDOFF_P2.md)
- [handoffs/HANDOFF_P3.md](./handoffs/HANDOFF_P3.md)
- [handoffs/HANDOFF_P4.md](./handoffs/HANDOFF_P4.md)
- [handoffs/P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md)
- [handoffs/P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md)
- [handoffs/P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md)
- [handoffs/P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md)
- [handoffs/P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md)

### Delegation Assets

- [prompts/README.md](./prompts/README.md) - delegation kit index
- [prompts/ORCHESTRATOR_OPERATING_MODEL.md](./prompts/ORCHESTRATOR_OPERATING_MODEL.md) - orchestrator rules
- [prompts/GRAPHITI_MEMORY_PROTOCOL.md](./prompts/GRAPHITI_MEMORY_PROTOCOL.md) - Graphiti recall and writeback contract
- [prompts/SUBAGENT_OUTPUT_CONTRACT.md](./prompts/SUBAGENT_OUTPUT_CONTRACT.md) - required worker return format
- [prompts/PHASE_DELEGATION_PROMPTS.md](./prompts/PHASE_DELEGATION_PROMPTS.md) - ready-to-paste worker prompt fills

### Durable Tracking

- [outputs/manifest.json](./outputs/manifest.json) - machine-routable phase and file contract
- [outputs/grill-log.md](./outputs/grill-log.md) - locked package-shape decisions
- [outputs/legacy-surface-inventory.md](./outputs/legacy-surface-inventory.md) - live inventory of legacy Effect-lane surfaces
- [outputs/removal-matrix.md](./outputs/removal-matrix.md) - per-surface remove or retain hypotheses
- [outputs/dependency-cut-map.md](./outputs/dependency-cut-map.md) - package and command dependency edges
- [outputs/candidate-scorecard.md](./outputs/candidate-scorecard.md) - retirement option ranking scratchpad
- [outputs/codex-plan-mode-prompt.md](./outputs/codex-plan-mode-prompt.md) - fresh-session bootstrap prompt

## Purpose

### Problem

`lint:effect-governance` is now the authoritative Effect-governance lane. The previous package proved that the repo no longer needs `lint:effect-laws` as its blocking Effect-specific governance surface.

The repo still carries a meaningful amount of legacy Effect-law infrastructure:

- root rollback scripts and Turbo metadata for `lint:effect-laws`
- the `beep-laws` ESLint rule implementations and their legacy fixture suite
- one repo-local parity runner in `tooling/cli` that still instantiates `eslint/Linter`
- package, docs, and trust surfaces that still mention the old lane

That leftover surface may still be acceptable if it is the smallest honest compatibility shim. It may also now be safe to retire most or all of it. This package exists to make that call explicitly.

### Primary Objective

Retire the remaining legacy Effect-specific `lint:effect-laws` or `beep-laws` or effect-lane ESLint surface now that `lint:effect-governance` is authoritative, while keeping the JSDoc and TSDoc lane separate and intact.

### Secondary Objective

Remove `eslint` from the Effect lane where feasible. This does **not** require full repo-wide ESLint removal if the JSDoc or TSDoc lane still depends on it.

### Success Conditions

Any `full retirement` claim must be supported by evidence in four buckets:

1. explicit inventory of the remaining legacy Effect-lane surface
2. retirement or justified retention of each inventoried surface
3. JSDoc or TSDoc lane safety after the retirement changes
4. dependency or performance or operational simplification relative to the current state

### Allowed Outcomes

This package does not force deletion at all costs. Evidence may support one of three honest outcomes:

- `full retirement`
- `minimal shim retained`
- `no-go yet`

## Scope Boundaries

### In Scope

- root command, config, and CI wiring for `lint:effect-laws`, `lint:effect-laws:strict`, `lint:jsdoc`, and `eslint.config.mjs`
- `@beep/repo-configs` ESLint exports, custom rule modules, allowlist support, and legacy tests
- `@beep/repo-cli` Effect-law command surfaces that still depend on ESLint internals
- docs, handoffs, and trust guidance that still refer to the retired Effect-law lane
- dependency edges that keep ESLint in the Effect lane
- the completed replacement package under [../effect-governance-replacement](../effect-governance-replacement)

### Out Of Scope Unless Directly Required

- proving again that `lint:effect-governance` is the authoritative Effect-governance lane
- unrelated repo-wide ESLint redesign
- replacing the JSDoc or TSDoc lane as a standalone project
- broad package-structure cleanup not required for the retirement decision

## Phase Model

| Phase | Intent | Mutating Authority | Primary Output |
|---|---|---|---|
| P0 | inventory and research the remaining legacy surface | spec package only | [RESEARCH.md](./RESEARCH.md) |
| P1 | validate the inventory and narrow retirement options | spec package only | [VALIDATED_OPTIONS.md](./VALIDATED_OPTIONS.md) |
| P2 | produce the ranked retirement plan | spec package only | [PLANNING.md](./PLANNING.md) |
| P3 | implement the chosen retirement path | repo behavior allowed | [EXECUTION.md](./EXECUTION.md) |
| P4 | verify retirement, docs-lane safety, and dependency simplification | repo behavior allowed only when required for verification fixes routed back to P3 | [VERIFICATION.md](./VERIFICATION.md) |

Early-phase rule:

- P0, P1, and P2 are read-only with respect to production code, CI wiring, and dependency manifests outside this spec package
- P3 is the first phase allowed to mutate repo behavior

Implementation rule:

- P3 implements one retirement posture only
- P3 does not opportunistically mix `full retirement` and `minimal shim retained` in the same wave without an explicit P2 decision

Validation rule:

- P1 must lock the live inventory and the remove-or-retain matrix
- P4 must verify against that locked matrix instead of inventing new targets late

## Phase Exit Gates

Do not advance `active_phase` in [outputs/manifest.json](./outputs/manifest.json) until the current phase satisfies its exit gate.

### P0 Exit Gate

- [RESEARCH.md](./RESEARCH.md) grounds the remaining legacy Effect-lane surface in live repo files
- [outputs/legacy-surface-inventory.md](./outputs/legacy-surface-inventory.md) is initialized from live repo reality
- [outputs/removal-matrix.md](./outputs/removal-matrix.md) contains an initial per-surface hypothesis
- [outputs/dependency-cut-map.md](./outputs/dependency-cut-map.md) maps the main dependency edges
- [outputs/candidate-scorecard.md](./outputs/candidate-scorecard.md) contains at least a provisional option set

### P1 Exit Gate

- [VALIDATED_OPTIONS.md](./VALIDATED_OPTIONS.md) narrows the field to a credible shortlist
- the inventory is locked rather than treated as a draft
- the remove-or-retain matrix covers the current legacy surface one by one
- weak options are explicitly rejected
- remaining unknowns are explicit enough for P2 to plan around

### P2 Exit Gate

- [PLANNING.md](./PLANNING.md) names one primary retirement path
- the ranked plan uses explicit scoring rather than prose-only preference
- migration, rollback, and retained-exception posture are explicit
- the Effect-lane retirement plan is kept separate from any future JSDoc or TSDoc redesign
- P3 can execute without reopening broad strategy questions

### P3 Exit Gate

- [EXECUTION.md](./EXECUTION.md) records the implemented retirement path and the concrete repo changes
- removed surfaces, retained shims, and rewrites are recorded explicitly
- dependency manifest changes are explicit
- docs or trust-surface updates are explicit
- residual risk is concrete enough for P4 to audit

### P4 Exit Gate

- [VERIFICATION.md](./VERIFICATION.md) contains retirement evidence against the locked matrix
- [VERIFICATION.md](./VERIFICATION.md) contains docs-lane safety evidence
- [VERIFICATION.md](./VERIFICATION.md) contains dependency or performance or operational evidence
- the verdict is one of `full retirement`, `minimal shim retained`, or `no-go yet`
- any issues requiring fixes are routed back to P3 explicitly

## Source-Of-Truth Order

Disagreement is resolved in this order:

1. live repo law and repo reality
2. [outputs/manifest.json](./outputs/manifest.json) for routing, phase, and tracked artifacts
3. this README for operator guidance that must not contradict repo law or the manifest
4. phase artifacts in order: `RESEARCH.md`, `VALIDATED_OPTIONS.md`, `PLANNING.md`, `EXECUTION.md`, `VERIFICATION.md`
5. handoffs and orchestrator prompts
6. scratch outputs under `outputs/`

## Mandatory Inputs

Every phase in this package must treat these as required inputs:

- `AGENTS.md`
- [../../../package.json](../../../package.json)
- [../../../turbo.json](../../../turbo.json)
- [../../../eslint.config.mjs](../../../eslint.config.mjs)
- [../../../.github/workflows/check.yml](../../../.github/workflows/check.yml)
- [../../../tooling/configs/package.json](../../../tooling/configs/package.json)
- [../../../tooling/configs/src/index.ts](../../../tooling/configs/src/index.ts)
- [../../../tooling/configs/src/eslint/DocsESLintConfig.ts](../../../tooling/configs/src/eslint/DocsESLintConfig.ts)
- [../../../tooling/configs/src/eslint/EffectLawsAllowlist.ts](../../../tooling/configs/src/eslint/EffectLawsAllowlist.ts)
- [../../../tooling/configs/src/eslint/NoNativeRuntimeHotspots.ts](../../../tooling/configs/src/eslint/NoNativeRuntimeHotspots.ts)
- [../../../tooling/configs/src/eslint/RequireCategoryTagRule.ts](../../../tooling/configs/src/eslint/RequireCategoryTagRule.ts)
- [../../../tooling/configs/test/docs-eslint-config.test.ts](../../../tooling/configs/test/docs-eslint-config.test.ts)
- [../../../tooling/configs/test/effect-first-regressions.test.ts](../../../tooling/configs/test/effect-first-regressions.test.ts)
- [../../../tooling/cli/package.json](../../../tooling/cli/package.json)
- [../../../tooling/cli/src/commands/Laws/NoNativeRuntime.ts](../../../tooling/cli/src/commands/Laws/NoNativeRuntime.ts)
- [../../../tooling/cli/src/commands/Docs.ts](../../../tooling/cli/src/commands/Docs.ts)
- [../../../tooling/cli/src/commands/Laws/AllowlistCheck.ts](../../../tooling/cli/src/commands/Laws/AllowlistCheck.ts)
- [../../../.claude/hooks/agent-init/index.ts](../../../.claude/hooks/agent-init/index.ts)
- [../../../.claude/hooks/skill-suggester/index.ts](../../../.claude/hooks/skill-suggester/index.ts)
- [../effect-governance-replacement/outputs/manifest.json](../effect-governance-replacement/outputs/manifest.json)
- [../effect-governance-replacement/EXECUTION.md](../effect-governance-replacement/EXECUTION.md)
- [../effect-governance-replacement/VERIFICATION.md](../effect-governance-replacement/VERIFICATION.md)

## Evaluation Contract

### Legacy Surface Questions

For each legacy surface, the package must answer:

1. is this surface still on the critical path for the Effect lane
2. if yes, should it be rewritten, split, renamed, or intentionally retained
3. if no, can it be deleted now without harming the JSDoc or TSDoc lane
4. if retention is necessary, is the retained shim the smallest honest surface

### Verification Questions

P4 must answer:

- is the legacy Effect-law lane truly retired from the Effect-governance path
- if a shim remains, is it explicit, minimal, and justified
- did the JSDoc or TSDoc lane remain intact
- did the repo become simpler or faster or easier to reason about as a result
