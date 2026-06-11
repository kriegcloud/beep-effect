# Oppold Corpus Pipeline

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Salvage, consolidate, dedupe, name-restore, extract, organize, and
USPTO-enrich the scattered 25-year Oppold IP practice corpus into a single
governed home (`/home/elpresidank/data-home/oppold-corpus/`) with a DuckDB
catalog and `@beep/file-processing` manifests, so the runtime ingestion lane
and the IP-law knowledge graph have a clean, provenance-tracked substrate to
consume.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/oppold-corpus-pipeline/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`research/corpus-scan-inventory.md`](./research/corpus-scan-inventory.md) - the 2026-06-11 workstation scan: source locations, formats, risks, repo capability.
6. [`history/`](./history/) - decision log and source inventory.

## Current Phase

P2 Extraction. P0+P1 completed 2026-06-11: all five sources salvaged
(8,438 files, 31.7 GB, SHA-256 verified, zero errors); DuckDB catalog built
via the new `beep corpus catalog` command (7,330 distinct digests, 290
duplicate sets, 677 MB redundant); `$I`/`$R` restoration manifest covers all
252 `$I` files (251 matched). `Sent_Emails.pst` triplet confirmed;
`LH_Inbox_2011.pst` copies turned out to be distinct snapshots, not
duplicates.

## Latest Evidence

[`history/outputs/2026-06-11-p1-catalog-report.md`](./history/outputs/2026-06-11-p1-catalog-report.md)
(P1 catalog run report). Earlier:
[`history/outputs/2026-06-11-p0-salvage-report.md`](./history/outputs/2026-06-11-p0-salvage-report.md)
(P0 salvage run report),
[`research/corpus-scan-inventory.md`](./research/corpus-scan-inventory.md)
(2026-06-11 scan).

## Related Packets

- `goals/agentic-professional-runtime` — this corpus feeds its NEXT roadmap
  lane (corpus ingestion → epistemic claims); the runtime packet owns
  epistemic ingestion, not this one.
- `goals/ip-law-knowledge-graph` — consumes the organized corpus; its
  ontology grounding research now includes the corpus-adjacent sources (see
  its `research/ontology-grounding-corpus.md`).
- `goals/agentic-cad-patent-tooling` — the Precision Planting CAD package
  directory is its active workspace; this packet catalogs a copy and leaves
  the original in place.

## Notes

- The largest source (26 PSTs, 26 GB) lives on the `ESD-USB` stick — treat
  salvage as urgent; avoid unnecessary reads of that media before P0.
- `LH_Inbox_2009` and `LH_Sent_2015` are absent from the USB year series;
  the recycle-bin-recovered PSTs (`$RE5ARTA/Sent_Emails.pst`,
  `Oppold_IP_Law/$R0SFKGS.pst`) are the leading candidates — confirm in P1.
- Real corpus data never enters this repository (runtime SPEC rule); packet
  evidence is manifests, reports, and counts only.
