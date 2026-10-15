# Design Figure Review Loop

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Answer the attorney's 2026-10-10 review of the live matter's eight design-figure sheets with a
round-2 set that meets every markup item, and give `beep drawings` a review loop beside sign-off:
mailbox intake into the corpus root and review rounds keyed to the sheet-set hash they reviewed.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/design-figure-review-loop/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - review items F1-F10 and T1-T3, phases, PR lanes.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`research/SOURCES.md`](./research/SOURCES.md) - provenance ledger (review mail, USPTO Guide editions, rules).
6. [`research/OPPORTUNITIES.md`](./research/OPPORTUNITIES.md) - friction receipts.
7. [`research/label-glyphs.md`](./research/label-glyphs.md) - vendored label-glyph recipe, source hashes, licence handling (P2).
8. [`../design-figure-generation/`](../design-figure-generation/) - predecessor (completed-retained): pipeline contract and sign-off rules.
9. [`../../explorations/patent-drawing-pipeline/`](../../explorations/patent-drawing-pipeline/) - source exploration (re-graduated 2026-10-13).

## Current Phase

P0-P4 merged (#1644, #1648, #1671; the round-1 review threads of #1671 and main's docgen/JSDoc reds
cleared in #1704). The attorney holds the round-2 shaded set (sent 2026-10-14 07:55Z) and has not
replied; his per-sheet review page (tailnet, one sheet at a time, SPEC decision 2026-10-14) is gated
and goes live with the next approved set. P10 is in progress: a sequential five-model adversarial review loop (Codex gpt-6-astra, Grok
4.7, Claude Fable 5.1, Kimi K3 on the synthetic twin, Claude Opus 5.5, each at top effort, each
given the earlier reports) over the merged pipeline's render, judged by the session, dry when a full
pass yields no new accepted finding; the harness lands as `beep drawings critics`; the research digest
on deterministic USPTO validation is in `research/uspto-validation-research.md`. Next: P11 verified
sheet-level checks, P12 cited rules registry, P13 seeded-defect mutation suite, P14 stroke-intent
sidecar (SPEC Decision Log rows of 2026-10-14). Loop 3 (#1816, 2026-10-15) adds the `two-point`
pictorial for the 2026-10-15 revision of F1 (the matter set now uses it), one
`rsvg-convert` run per sheet set with a strict-inflate stream check, measured critic packs, and a Grok
seat fallback when its strict sandbox cannot start on the host. Loop 4 (lane `drawings-loop-4`, pass 3) measures
the room of areas glimpsed through an opening and counts every skipped one, opens outline pairs printed closer than
0.7 mm, lights two-point views on their picture plane, and cuts redrawn bands back to their taper; the measured room
only rescues areas the ordinary plan leaves bare (R4-08), and O-02 and O-04 are deferred P2 follow-ups. Open with the attorney: the bottom-edge question (Q7)
and the overlay's edge extent; PR-K (embedded label text) and PR-L (edge emphasis, corrugation) pending.

## Latest Evidence

Not started. Round-1 facts carried in: the attorney marked up the unshaded set (PDF sha256 prefix
17e086a2), not the signable shaded set (227efb7a); both hashes are in the predecessor's
[live-matter evidence record](../design-figure-generation/history/live-matter/evidence.json).

## Notes

- Live matter material (spec, generator, renders, markup PDFs, questions draft) lives only under
  `BEEP_OPPOLD_CORPUS_ROOT`; the repo carries generic fixtures and hashes.
- Packet prose stays generic about the live article.
- Outbound round-2 mail goes through the outbox draft and is sent only after explicit approval in
  chat.
