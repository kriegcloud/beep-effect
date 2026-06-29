# Epistemic Claim Lifecycle Gate

## Status

Lifecycle: `completed-retained`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Make the epistemic boundary reusable and product-agnostic: graduate the
epistemic slice from domain-only to minimum-viable (domain + use-cases +
server) by shipping the full `ClaimLifecycle` state machine
(`candidate -> shape_valid -> consistency_checked -> admitted`), the SHACL-gate
mechanism, the projection-as-pure-function (in-memory, rebuilt from authority),
and the ported v3 `EvidenceSpan` char-offset primitive on `Evidence`. Zero
IP-law vocabulary lives here. This is the reusable half of the rung-0
office-action review loop and **must be built first**.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/epistemic-claim-lifecycle-gate/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan (P0 -> P3).
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`research/`](./research/) - supporting research, if present.
6. [`history/`](./history/) - evidence and closeouts, if present.

Provenance: decomposed in
[`explorations/atlas-synthesis/MAP.md`](../../explorations/atlas-synthesis/MAP.md)
(Packet A). Product authority:
[`goals/agentic-professional-runtime/SPEC.md`](../agentic-professional-runtime/SPEC.md).
Referenced, never merged: `goals/ip-law-knowledge-graph`,
`goals/oppold-corpus-pipeline`. Consumed downstream by
`law-practice-office-action-spike` via this slice's public surface only.

## Current Phase

`P3 Verify / close` — complete. The slice is graduated to minimum-viable
(domain + use-cases + server): the four-state `ClaimLifecycle` machine + transition
value object + typed errors, the ported v3 `EvidenceSpan` char-offset primitive on
`Evidence` (jsonb value object), the `ClaimGate` composing the bounded SHACL engine,
the pure rebuildable `ClaimProjection`, and the thin `EpistemicServerLive` Layer. All
four phases passed their gates in binding order.

## Latest Evidence

`2026-06-17` — All phases complete, zero IP-law vocabulary. `bun run check` green for
`@beep/epistemic-domain`, `@beep/epistemic-use-cases`, and `@beep/epistemic-server`;
11 epistemic tests pass (`bunx turbo run test --filter '@beep/epistemic-*'`):
admit + advance (`candidate -> shape_valid`), reject + no-advance carrying a
`ClaimGateViolation` (projected from a SHACL `ShaclValidationViolation`), and a
referentially-equal `ClaimProjection` rebuild.
`bun run config-sync:check` reports no drift; the closeout reflection at
[`history/reflections/2026-06-17-claude.md`](./history/reflections/2026-06-17-claude.md)
passes `bun run beep lint reflection-artifacts` (blocking_findings=0). The
`@beep/schema` Bun-runtime baseline is untouched (no source changes there).

## Notes

- BINDING SEQUENCING (no exceptions): schema (P0) -> service contract (P1) ->
  implementation (P2) -> verify (P3). Forbidden anti-pattern: writing loose
  helpers first and composing them into a `Context.Service` at the end.
  Role-suffix order: `.model.ts`/`.errors.ts` -> `.ports.ts`/`.service.ts` ->
  `.repo.ts`.
- FEDERATION INVARIANT (bake in at the type level): epistemic authority is
  single-owner/local; the projection is a read-only pure function rebuilt from
  authority and can never perform a central write.
- Acceptance gates on **no NEW** `@beep/schema` Bun-runtime test failures, not
  full green (see the Bun-runtime baseline).
- Verified on disk: `ClaimLifecycle` is today `LiteralKit(["candidate"])`;
  `Evidence` carries only `artifactFixtureKey`/`spanFixtureKey` (two string
  refs) — the four states and char-offsets are genuinely net-new.
- 2026-06-29: gold-intake research note added at research/gold-intake-claim-gate-shacl.md (see for SHACL non-blocking warnings + source-span provenance on gate results and a deterministic weighted-scoring/dealbreaker tier; additive only, packet stays completed-retained).
