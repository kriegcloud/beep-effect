# Effect Governance Replacement - P0 Handoff

## Goal

Research the replacement landscape for the current Effect-specific `beep-laws` / ESLint governance lane without changing repo behavior outside this spec package.

## Required Inputs

- `AGENTS.md`
- [../README.md](../README.md)
- [../outputs/manifest.json](../outputs/manifest.json)
- [../outputs/grill-log.md](../outputs/grill-log.md)
- root command and CI surfaces
- current rule implementations and fixtures
- `.claude` hook surfaces
- `.codex` hook and agent surfaces
- `packages/repo-memory` indexing and lookup surfaces
- `/home/elpresidank/YeeBois/dev/biome-effect-linting-rules`

## Deliverables

- [../RESEARCH.md](../RESEARCH.md)
- initialization or expansion of [../outputs/parity-matrix.md](../outputs/parity-matrix.md)
- initialization or expansion of [../outputs/steering-eval-corpus.md](../outputs/steering-eval-corpus.md)
- optional notes in [../outputs/candidate-scorecard.md](../outputs/candidate-scorecard.md)

## Must Answer

- what exactly is the current Effect-specific governance surface
- which candidate replacement surfaces are credible
- which candidates steer by default versus by opt-in
- where the external Biome rule pack is strong or weak
- what additional ideas are worth carrying into P1

## Stop Conditions

- stop if the phase would need to mutate repo behavior outside this package
- stop if current rule coverage cannot be grounded in live files
- stop if a major claim depends on a source that cannot be validated
