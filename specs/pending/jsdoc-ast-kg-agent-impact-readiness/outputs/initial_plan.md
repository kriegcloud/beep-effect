# Initial Plan

## Status

PENDING

## Goal

Establish whether JSDoc-enriched AST KG should be promoted as a production-grade coding-agent capability in this repository.

## Plan Summary

1. Run PRE phase to modularize `kg.ts` and integrate Claude benchmark execution through `@beep/ai-sdk`.
2. Freeze objective gates before additional implementation claims.
3. Harden retrieval reliability and fallback guarantees.
4. Improve semantic signal quality through governance and measured coverage.
5. Run live four-way ablation benchmark.
6. Make explicit rollout decision from evidence.

## Phase Deliverables

- PRE: `p-pre-kg-cli-refactor-and-ai-sdk.md`
- P0: `p0-baseline-and-gates.md`
- P1: `p1-jsdoc-governance.md`
- P2: `p2-retrieval-reliability.md`
- P3: `p3-semantic-coverage.md`
- P4: `p4-ablation-benchmark.md`
- P5: `p5-rollout-decision.md`

## Locked Defaults

1. Baseline structure retrieval remains deterministic AST-backed.
2. Semantic JSDoc edges are additive and confidence-weighted.
3. Fallback path is mandatory for retrieval failures.
4. Promotion requires live ablation evidence.
5. Claude benchmark backend runs through `@beep/ai-sdk`.
