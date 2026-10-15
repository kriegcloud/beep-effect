# Claim Element Antecedent Check

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Give every patent claim a span-anchored element tree and run an advisory
§112(b) antecedent-basis and dependency self-check over it. The tree, the pure
decomposer and the checker live in `@beep/law-practice-domain`; the
`ClaimSelfCheck` service lives in `@beep/law-practice-use-cases`. Findings
reach the attorney as `claim-finding` review items, and the checker is
measured on public USPTO claims with a strict structural metric.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/claim-element-antecedent-check/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - phases, dependencies, blockers.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`research/SOURCES.md`](./research/SOURCES.md) - sources this goal needs.
6. [`history/`](./history/) - evidence and closeouts, if present.

Provenance: graduated from
[`explorations/claim-element-graph`](../../explorations/claim-element-graph/README.md)
on 2026-10-14. Read its
[`BRIEF.md`](../../explorations/claim-element-graph/BRIEF.md),
[`DECISIONS.md`](../../explorations/claim-element-graph/DECISIONS.md) and
[`MAP.md`](../../explorations/claim-element-graph/MAP.md) for the shaped pitch,
the rulings and the gated re-entry points.

Sibling goals:

- [`review-verdict-envelope`](../review-verdict-envelope/README.md) - owns
  `ReviewItem` / `VerdictRow`; its P1 schema gates this goal's P3.
- [`patent-document-schema`](../patent-document-schema/README.md) - owns
  `PatentClaim`, which this goal reads and does not change.
- [`epistemic-claim-lifecycle-gate`](../epistemic-claim-lifecycle-gate/README.md) -
  owns `CandidateClaim` and the lifecycle findings enter.
- [`patent-drafting-episode-ledger`](../patent-drafting-episode-ledger/README.md) -
  paused; a later consumer of ordered limitations.

## Current Phase

P2 Implementation + adapter. P0 and P1 are complete.

## Latest Evidence

- **P0:** `values/ClaimElement/` in `@beep/law-practice-domain`, in four files: `ClaimElement.model.ts`,
  `ClaimElement.edge.model.ts`, `ClaimElement.tree.model.ts` (with coherence checks) and
  `AntecedentFinding.model.ts` (each finding carries its `chain`; candidates are distinct). Tests
  are in `test/ClaimElement.test.ts`.
- **P1:**
  - The `ClaimElementDecomposer` and `AntecedentPolicy` function types.
  - The `ClaimSelfCheck` `Context.Service` (`check`, `checkPublished`, `candidates`), with
    per-claim `undecomposed` failures.
  - The `UsptoClaims` port and the `UsptoClaimsError` / `ClaimSelfCheckError` split.
  - Independent review found 2 P1 and 7 P2 issues. All are applied or recorded in the SPEC
    Decision Log.
  - `package-verify` passes for `@beep/law-practice-domain` and `@beep/law-practice-use-cases`.
    The repo-wide docgen run is left to hosted Docgen on the publish PR.

## Notes

- Binding order: schema, then `Context.Service` contract, then implementation.
- Findings are advisory. Nothing blocks a draft.
- Fixtures are public USPTO record only. NC-licensed data stays outside the
  repo.
- If the deterministic floor measures badly, the goal stops at the measurement.
