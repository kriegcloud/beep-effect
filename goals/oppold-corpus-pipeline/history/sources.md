# Source Inventory

## Authority order for this packet

1. The 2026-06-11 grilling session decisions (`history/decision-log.md`).
2. `SPEC.md` (normative contract).
3. `research/corpus-scan-inventory.md` (verified scan findings).
4. Upstream packets referenced below.

## Data sources (outside the repo)

See `research/corpus-scan-inventory.md` for the authoritative five-location
table, formats, sizes, and risks. Headline: 26 PSTs (26 GB) on the ESD-USB
stick; recycle-bin-recovered PSTs in `~/Documents/$RE5ARTA/` and
`~/data-home/Oppold_IP_Law/`; ~8.3k `$I`/`$R`-named recovered documents.

## Repo sources

- `standards/ARCHITECTURE.md` + `standards/architecture/03-driver-boundaries.md`,
  `07-non-slice-families.md` — driver neutrality and family routing for
  `drivers/libpff`, `drivers/tika`, `drivers/uspto`, CLI tooling.
- `packages/foundation/capability/file-processing/src/*` — manifest and
  artifact contracts this pipeline must reuse.
- `packages/tooling/tool/cli/src/commands/Files/*` — command pattern for
  `beep corpus`.
- `goals/agentic-professional-runtime/SPEC.md` — data-outside-repo rule,
  systems-of-record posture, the NEXT-lane roadmap slot this corpus feeds.
- `goals/ip-law-knowledge-graph/` — downstream consumer; its
  `research/ontology-grounding-corpus.md` carries the ontology grounding
  added in the same session.
- `goals/agentic-cad-patent-tooling/` — owns the Precision Planting CAD
  workspace this packet only catalogs.

## External references

- USPTO Open Data Portal (P4 enrichment APIs).
- libpff / `pffexport` tooling (P2 PST extraction).
- Apache Tika (P2 document text/metadata extraction).
- Research corpus at `/home/elpresidank/YeeBois/ontology_research/` —
  background for downstream packets; explicitly not processed by this
  pipeline.
