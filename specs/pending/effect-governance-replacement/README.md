# Effect Governance Replacement

## Status

**P4 VERIFIED - STAGED CUTOVER**

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

- [RESEARCH.md](./RESEARCH.md) - P0 exploration and research baseline
- [VALIDATED_OPTIONS.md](./VALIDATED_OPTIONS.md) - P1 validated shortlist and parity review
- [PLANNING.md](./PLANNING.md) - P2 ranked implementation plan
- [EXECUTION.md](./EXECUTION.md) - P3 implementation record
- [VERIFICATION.md](./VERIFICATION.md) - P4 parity, performance, and steering evidence

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
- [outputs/grill-log.md](./outputs/grill-log.md) - locked decisions from the design grill
- [outputs/parity-matrix.md](./outputs/parity-matrix.md) - current and proposed Effect-governance surface map
- [outputs/steering-eval-corpus.md](./outputs/steering-eval-corpus.md) - fixed steering evaluation corpus and rubric
- [outputs/candidate-scorecard.md](./outputs/candidate-scorecard.md) - candidate ranking scratchpad
- [outputs/codex-plan-mode-prompt.md](./outputs/codex-plan-mode-prompt.md) - fresh-session bootstrap prompt

## Purpose

### Problem

The repo currently uses ESLint-based `beep-laws` as a specialized Effect governance lane. That lane is valuable, but it is also a performance bottleneck and a steering bottleneck:

- it slows the quality pipeline relative to package-local Biome checks
- it centralizes governance in one heavier lane
- it does not by itself guarantee that agents discover the flattest or most idiomatic Effect or schema-first solutions early enough

### Primary Objective

Replace the Effect-specific `beep-laws` / ESLint governance lane with a faster multi-surface steering system that improves default agent idiomaticity.

The replacement target is the Effect-specific lane only. The current JSDoc and TSDoc governance lane is secondary and is in scope only when it directly supports the primary replacement objective.

### Success Conditions

Any full-replacement claim must be supported by evidence in three buckets:

1. parity against the current Effect-specific governance surface
2. measurable performance improvement in local and or CI execution
3. better default agent steering on a fixed evaluation corpus

### Allowed Outcomes

This package does not force full replacement at all costs. Evidence may support one of three honest outcomes:

- full replacement
- staged cutover
- no-go yet

## Scope Boundaries

### In Scope

- the current Effect-specific governance surface under [../../../tooling/configs/src/eslint/ESLintConfig.ts](../../../tooling/configs/src/eslint/ESLintConfig.ts)
- the current rule fixtures under [../../../tooling/configs/test/eslint-rules.test.ts](../../../tooling/configs/test/eslint-rules.test.ts)
- the root lint and CI wiring under [../../../package.json](../../../package.json) and [../../../.github/workflows/check.yml](../../../.github/workflows/check.yml)
- repo-local agent steering surfaces such as `.claude/hooks`, `.codex`, skills, repo-memory, and deterministic index infrastructure
- the external reference repo at `/home/elpresidank/YeeBois/dev/biome-effect-linting-rules`
- official or primary-source internet research when needed to validate capability or performance claims

### Out Of Scope Unless Directly Required

- a general-purpose agent-governance redesign for the whole repo
- unrelated CI simplification work
- JSDoc or TSDoc replacement as a standalone project
- broad productized knowledge-graph work that does not materially support the replacement decision

## Phase Model

| Phase | Intent | Mutating Authority | Primary Output |
|---|---|---|---|
| P0 | exploration and research | spec package only | [RESEARCH.md](./RESEARCH.md) |
| P1 | validate and narrow candidates | spec package only | [VALIDATED_OPTIONS.md](./VALIDATED_OPTIONS.md) |
| P2 | produce the ranked implementation plan | spec package only | [PLANNING.md](./PLANNING.md) |
| P3 | implement the chosen path | repo behavior allowed | [EXECUTION.md](./EXECUTION.md) |
| P4 | verify parity, performance, and steering | repo behavior allowed only when required for verification fixes routed back to P3 | [VERIFICATION.md](./VERIFICATION.md) |

Early-phase rule:

- P0, P1, and P2 are read-only with respect to production code, CI wiring, and lint behavior outside this spec package
- P3 is the first phase allowed to mutate repo behavior

Implementation rule:

- P3 implements the top-ranked replacement path plus only the supporting glue required for that path
- P3 does not build multiple competing primary paths in one wave

Validation rule:

- P1 must lock the fixed steering evaluation corpus and initial parity matrix
- P4 must reuse that exact corpus instead of inventing new examples late

## Phase Exit Gates

Do not advance `active_phase` in [outputs/manifest.json](./outputs/manifest.json) until the current phase satisfies its exit gate.

### P0 Exit Gate

- [RESEARCH.md](./RESEARCH.md) grounds the current Effect-specific governance surface in live repo files
- candidate mechanisms are grouped by deployment surface
- [outputs/parity-matrix.md](./outputs/parity-matrix.md) is initialized from the live rule surface
- [outputs/steering-eval-corpus.md](./outputs/steering-eval-corpus.md) contains a credible draft corpus
- [outputs/candidate-scorecard.md](./outputs/candidate-scorecard.md) contains at least a provisional candidate set

### P1 Exit Gate

- [VALIDATED_OPTIONS.md](./VALIDATED_OPTIONS.md) narrows the field to a credible shortlist
- the steering evaluation corpus is locked rather than left as a draft
- the parity matrix compares the current rules one by one
- rejected options are explicitly rejected
- remaining unknowns are explicit enough for P2 to plan around

### P2 Exit Gate

- [PLANNING.md](./PLANNING.md) names one primary path
- the ranked plan uses explicit effectiveness scoring rather than prose-only preference
- migration and rollback posture are explicit
- the Effect-lane plan is kept separate from any JSDoc or TSDoc follow-up
- P3 can execute without reopening broad strategy questions

### P3 Exit Gate

- [EXECUTION.md](./EXECUTION.md) records the implemented path and the concrete repo changes
- command, hook, CI, and rule-surface changes are recorded explicitly
- dropped or deferred coverage is explicit
- no second competing primary path was partially implemented
- residual risk is concrete enough for P4 to audit

### P4 Exit Gate

- [VERIFICATION.md](./VERIFICATION.md) contains parity evidence
- [VERIFICATION.md](./VERIFICATION.md) contains performance evidence
- [VERIFICATION.md](./VERIFICATION.md) contains steering evidence on the locked corpus
- the verdict is one of `full replacement`, `staged cutover`, or `no-go yet`
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
- [../../../.github/workflows/check.yml](../../../.github/workflows/check.yml)
- [../../../tooling/configs/src/eslint/ESLintConfig.ts](../../../tooling/configs/src/eslint/ESLintConfig.ts)
- [../../../tooling/configs/src/eslint/EffectImportStyleRule.ts](../../../tooling/configs/src/eslint/EffectImportStyleRule.ts)
- [../../../tooling/configs/src/eslint/NoNativeRuntimeRule.ts](../../../tooling/configs/src/eslint/NoNativeRuntimeRule.ts)
- [../../../tooling/configs/src/eslint/SchemaFirstRule.ts](../../../tooling/configs/src/eslint/SchemaFirstRule.ts)
- [../../../tooling/configs/src/eslint/TerseEffectStyleRule.ts](../../../tooling/configs/src/eslint/TerseEffectStyleRule.ts)
- [../../../tooling/configs/test/eslint-rules.test.ts](../../../tooling/configs/test/eslint-rules.test.ts)
- [../../../.claude/hooks/README.md](../../../.claude/hooks/README.md)
- [../../../.codex/config.toml](../../../.codex/config.toml)
- [../../../.codex/agents/README.md](../../../.codex/agents/README.md)
- [../../../packages/repo-memory/runtime/src/indexing/TypeScriptIndexer.ts](../../../packages/repo-memory/runtime/src/indexing/TypeScriptIndexer.ts)
- [../../../packages/repo-memory/store/src/RepoSymbolStore.ts](../../../packages/repo-memory/store/src/RepoSymbolStore.ts)
- `/home/elpresidank/YeeBois/dev/biome-effect-linting-rules/README.md`
- `/home/elpresidank/YeeBois/dev/biome-effect-linting-rules/ROADMAP.md`

## Evaluation Contract

### Current Effect-Specific Governance Surface

The parity matrix must at minimum track:

- `effect-import-style`
- `no-native-runtime`
- `schema-first`
- `terse-effect-style`

### Fixed Evidence Buckets For P4

- parity against the current Effect-specific governance surface
- performance improvement relative to the current lane
- steering improvement on the fixed evaluation corpus

### Replacement Ranking Criteria

The ranked plan in P2 must score candidates against:

- default-path steering strength
- parity potential
- performance upside
- operational complexity
- maintenance burden
- migration risk
- generalizability as a secondary criterion rather than the primary one

## Session Resume Checklist

1. Read [outputs/manifest.json](./outputs/manifest.json) first.
2. Read [outputs/grill-log.md](./outputs/grill-log.md) to avoid reopening locked decisions.
3. Read [QUICK_START.md](./QUICK_START.md) and the active phase assets from the manifest.
4. Read the active handoff and the active orchestrator prompt.
5. Use the delegation kit under [prompts/README.md](./prompts/README.md) when parallel research or validation would materially help.
6. Update the active phase artifact plus the manifest before ending the session.

## Package Maintenance Rules

- Update the manifest whenever phase status, routing, tracked outputs, or locked assumptions change.
- Append new locked decisions to [outputs/grill-log.md](./outputs/grill-log.md) instead of scattering them through prose.
- If a phase intentionally changes scope, record that change in the active artifact and the manifest in the same pass.
