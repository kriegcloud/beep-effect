# Corpus Scan Inventory (2026-06-11)

Workstation-wide scan for the scattered Oppold IP practice corpus, run during
the packet-creation grilling session. Scans covered `/home/elpresidank`
(excluding node_modules/.git/caches/known research dirs), all mounts, and
`/run/media/elpresidank/ESD-USB`. Patterns: `.pst`/`.ost` everywhere;
`.doc`/`.docx`/`.pdf`/`.msg`/`.eml` clustered by directory.

## Source Locations

| # | Location | Contents | Size | Risk / notes |
| --- | --- | --- | --- | --- |
| 1 | `/run/media/elpresidank/ESD-USB/LH_Emails/` | 26 PSTs: `LH_Inbox_2002–2015`, `LH_Sent_2002–2014` | 26 GB | **Removable USB stick, no second copy. Salvage first.** |
| 2 | `/home/elpresidank/Documents/LH_Emails/` | `LH_Inbox_2011.pst` | 1.1 GB | Expected exact duplicate of USB year |
| 3 | `/home/elpresidank/Documents/$RE5ARTA/` | `Sent_Emails.pst` | 284 MB | Recycle-bin recovery dir name; candidate for missing `Sent_2015` |
| 4 | `/home/elpresidank/data-home/Oppold_IP_Law/` | 8,294 files: 2,575 docx, 2,497 txt, 1,215 doc, 792 html, 453 png, 441 pdf, 220 jpg, 32 gif, 21 xlsx, 17 rtf, 13 zip; plus `$I0SFKGS.pst`/`$R0SFKGS.pst` pair and `source/Sent_Emails.pst` | 2.8 GB | Windows Recycle-Bin `$I`/`$R` naming throughout — original filenames lost but recoverable from `$I` metadata |
| 5 | `/home/elpresidank/data-home/Precision Planting Seed Firmer Adam CAD Package/` | Patent application PDFs, USPTO/Google Patents assets, CAD prompt workspace | small | Active workspace of `goals/agentic-cad-patent-tooling`. Catalog-only copy; leave original in place. |

## Key Findings

- **Year-series gaps**: the USB set is missing `LH_Inbox_2009` and
  `LH_Sent_2015`. The recycle-bin-recovered PSTs (#3, and the `$R0SFKGS.pst`
  inside #4) are the leading candidates for those gaps. Confirm by PST
  internal metadata during P1/P2.
- **`$I`/`$R` semantics** (Windows Recycle Bin): `$I*` files are small
  metadata records carrying the original absolute path, file size, and
  deletion timestamp; `$R*` files are the actual content. Pairing them
  restores real filenames/paths for the ~8k recovered documents in #4 —
  this de-risks the Organization phase substantially.
- **Known duplicate sets going in**: `LH_Inbox_2011.pst` (#1 vs #2);
  `Sent_Emails.pst` (#3 vs `#4/source/` vs possibly the `$R0SFKGS.pst`
  pair).
- **Not corpus** (checked and excluded): `~/Documents/OP_IP_LAW` (website
  assets), `~/Documents/OIP_ASSETS` (logos), `~/Documents/e2_planetscale`,
  `~/Documents/Taxes`. Ontology-research strays found and routed to
  `goals/ip-law-knowledge-graph/research/ontology-grounding-corpus.md`:
  `~/Documents/patentlego-ontology/`,
  `~/Documents/Research_sources_for_a_Palantir-style_IP_Law_ontology.md`.
- **No PSTs found anywhere else**: scans of `/home`, `/srv`, `/opt`, `/mnt`,
  `/media`, and other mounts surfaced no additional email archives beyond
  the locations above.

## Repo Capability Baseline (at packet creation)

| Component | State | Gap for this packet |
| --- | --- | --- |
| `foundation/capability/file-processing` | Production-ready schemas: `ArtifactId` (`artifact:${sha256}`), `ContentDigest`, `ProcessRunManifest`, `SourceProcessingRecord`, `ChildArtifactRecord`, `deriveArtifactId` | None — reuse as-is |
| `packages/tooling/tool/cli` Files command | Long-running pipeline precedent: engine strategy selection (Tika/Libpff/Test), progress reporting, run.json + sources.jsonl + failures.jsonl output | Add `corpus` command family on same pattern |
| `drivers/libpff` | Scaffold: detects `.pst`, synthetic export only | Real extraction (pffexport subprocess engine) |
| `drivers/tika` | Scaffold: text for text-native formats only; no real Tika invocation | Real Tika for doc/docx/pdf/rtf + metadata |
| `drivers/duckdb` | Production-ready Effect service: query/run/transactions/Parquet export | Catalog schema (sources/artifacts/dedup tables) |
| `drivers/box` | Streaming upload/download ready | Out of scope here (later runtime phase) |
| `@beep/schema` Sha256 | `Sha256Hex`, `Sha256HexFromBytes`, `computeSha256Hex` | Streaming hash for multi-GB PSTs may be needed |
| `drivers/uspto` | Does not exist | New driver (P4) |

## Provenance

Scan commands and raw outputs are preserved in the 2026-06-11 session
transcript; the tables above are the verified summary. Re-run posture: the
`find`-based scans are cheap and repeatable; re-verify location sizes before
P0 since sources may drift until salvage completes.
