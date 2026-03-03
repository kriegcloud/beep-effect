# Initial Plan: repo-whitepaper-docset-canonical

## Objective

Create a canonical spec that orchestrates production of a comprehensive, human-readable 12-document corpus suitable as the primary reference base for greenfield white-paper drafting.

## Canonical Pattern Summary

1. Canonical package shape: `README.md`, `QUICK_START.md`, `MASTER_ORCHESTRATION.md`, `RUBRICS.md`, `REFLECTION_LOG.md`, `outputs/`, `handoffs/`.
2. `README.md` is normative and contains status metadata, scope/non-goals, ADR locks, phase model, risks, tests, assumptions, and exit conditions.
3. `MASTER_ORCHESTRATION.md` is the phase state machine.
4. `RUBRICS.md` defines phase pass/fail criteria plus cross-cutting lock integrity.

## Source Corpus Summary

- `tooling/repo-utils/src/JSDoc/*`: canonical JSDoc modeling surface with 113 tag definitions and 113 typed tag-value variants.
- `specs/pending/repo-codegraph-canonical/*`: canonical phase/gate orchestration and lock-style pattern.
- `specs/pending/repo-codegraph-jsdoc/*`: exploratory architecture synthesis for fibration, NLP, reasoning, and contracts.
- `.repos/beep-effect/packages/knowledge/_docs`: broad strategic and operational knowledge corpus.

## Locked Decisions

1. Freeze document count at `X = 12`.
2. Enforce single primary ownership per topic.
3. Enforce source-to-claim traceability for normative claims.
4. Promote phases only on rubric pass.
5. Escalate conflicts through explicit registers; never silently merge contradictions.

## Phase Plan Snapshot

1. `P0`: bootstrap canonical package.
2. `P1`: inventory sources and harvest facts.
3. `P2`: normalize concepts and taxonomy.
4. `P3`: freeze D01-D12 blueprints and ownership.
5. `P4`: draft D01-D08.
6. `P5`: draft D09-D12.
7. `P6`: run consistency/completeness/quality gates.
8. `P7`: publish starter kit and handoff.

## Success Conditions

1. All P0-P7 artifacts exist and pass rubrics.
2. D01-D12 are complete, non-duplicative, and evidence-linked.
3. Starter kit enables white-paper outline generation without additional corpus discovery.

## Known Reliability Note

`specs/pending/repo-codegraph-jsdoc/outputs/validate-jsdoc-exhaustiveness.mjs` currently references imports with a path mismatch relative to `outputs/jsdoc-exhaustiveness-audit/`. This must be tracked in conflict/risk artifacts and cited in D11/D12 when relevant.
