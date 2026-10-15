# Review Verdict Envelope

## Status

Lifecycle: `completed-retained`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Give every producer that needs the attorney's judgement (practice-kg answers, claim findings,
office-action analyses, drawings, classifications, draft text) one review envelope: a
`ReviewItem` / `SourceRef` / `VerdictRow` schema in `@beep/law-practice-domain`, `ReviewQueue`
and `VerdictProjector` services in `@beep/law-practice-use-cases` that turn claim-finding
verdicts into epistemic `ClaimDisposition` projections, and the spike evidence that decides whether the
review queue gets a pane in the desktop Code tab. The pane itself is built by the
`practice-claude-mod` owner from a written amendment this goal delivers.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/review-verdict-envelope/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan (P0 evidence → P5 close).
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`research/SOURCES.md`](./research/SOURCES.md) - provenance ledger.
6. [`history/`](./history/) - spike report, evidence, and closeouts.

Source exploration:
[`explorations/attorney-review-workspace`](../../explorations/attorney-review-workspace/README.md)
— read its [`BRIEF.md`](../../explorations/attorney-review-workspace/BRIEF.md),
[`MAP.md`](../../explorations/attorney-review-workspace/MAP.md) and
[`DECISIONS.md`](../../explorations/attorney-review-workspace/DECISIONS.md) for the why. The
amendment for the plugin owner is
[`research/AMENDMENT-practice-claude-mod.md`](../../explorations/attorney-review-workspace/research/AMENDMENT-practice-claude-mod.md)
in the exploration.

Related work:

- `goals/practice-claude-mod` (from the `claude-mods-law-practice` exploration, PR #1711): the
  plugin that receives the review-queue phase. Owned by another session; never edited here.
- [`explorations/claim-element-graph`](../../explorations/claim-element-graph/README.md): the
  first producer; its findings become `claim-finding` review items.
- [`goals/epistemic-claim-lifecycle-gate`](../epistemic-claim-lifecycle-gate/README.md): owner of
  the epistemic slice that `ClaimDisposition` belongs to.
- Earlier review attempts this goal replaces: [`goals/practice-kg-mcp`](../practice-kg-mcp/),
  [`goals/practice-document-identification`](../practice-document-identification/),
  [`goals/design-figure-review-loop`](../design-figure-review-loop/).

## Current Phase

Closed (`completed-retained`). P0–P5 are complete; the PR that carries P0–P2 also carries
the closeout. The in-app Claude for Word run stays with the operator and blocks nothing.

## Latest Evidence

- **P0:** [`history/spikes-2026-10-14.md`](./history/spikes-2026-10-14.md).
  - S1 (pane docks, resizes and highlights) and S3 (the Box text read) are GO on the Linux desktop
    Code tab; the operator waived the Windows run.
  - S2: page images are legible.
  - S3b: whole Box pages exceed the desktop Svg cap, so producers ship crops.
  - S4: no selection reads, so notes are typed.
  - S6: Reply and side chat exist on selection.
  - S8: links open the external browser at `#page=N`.
  - Word check: documented; an in-app run on the attorney's workstation is pending with the
    operator.
- **P1:**
  - `SourceRef` with `TextQuote` and a page-checked `crop`;
  - the `ReviewItem` tagged union (six kinds, `claim-finding.claimId`);
  - `VerdictRow` (`batchId`, `recordedAt`, a batch-scoped lock);
  - in `@beep/law-practice-domain`, with tests in `test/ReviewVerdict.test.ts`.
- **P2:**
  - `ReviewQueue` (serialized writes, batch-scoped lock, `VerdictBatchLockedError`) and
    `VerdictProjector` (pure; `ClaimDispositionProjection` in `VerdictProjector.schemas.ts`), in
    `@beep/law-practice-use-cases`;
  - S5 round trip in `test/ReviewVerdict.roundtrip.test.ts`, including a cross-batch tie and a
    property test against an independent model.
- **P3:** the amendment was delivered to the `practice-claude-mod` owner, who applied it in their
  packet as D15 (the gated P1b review queue) and D16 (`VerdictRow` mirrors this envelope). The
  text is in
  [`AMENDMENT-practice-claude-mod.md`](../../explorations/attorney-review-workspace/research/AMENDMENT-practice-claude-mod.md),
  updated through PR #1712 for `batchId`, `recordedAt` and the text-read S3 gate.
- **P5:** closeout reflection in
  [`history/reflections/2026-10-14-claude.md`](./history/reflections/2026-10-14-claude.md).

## Notes

- S1 (pane on the Windows desktop) and S3 (Box via `$.mcp.call`) are go/no-go. If S1 fails, the
  amendment becomes the row-only fallback and the exploration reopens at `decompose`; no second
  surface is bought.
- Gated re-entry points stay in the exploration MAP: `drawing-review-pins`,
  `draft-review-in-word`, and a mod-owned side chat.
- Spikes use non-client test files only. Nothing that identifies the attorney, a client, or a
  machine enters this packet.
