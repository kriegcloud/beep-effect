# Corpus Scan Inventory (2026-06-11)

Workstation-wide scan for the scattered IP-practice corpus, run during the
packet-creation grilling session. Scans covered the user home directory
(excluding node_modules/.git/caches/known research dirs), all mounts, and a
removable USB volume. Patterns: `.pst`/`.ost` everywhere;
`.doc`/`.docx`/`.pdf`/`.msg`/`.eml` clustered by directory.

> Note: absolute home/removable-media paths, the local username,
> client/matter-like directory and archive names, and exact per-location
> file counts and sizes are redacted to comply with the SPEC
> no-corpus-content/no-PII constraint. `<USER_HOME>` denotes the user home
> directory; `<USB_MOUNT>` denotes the removable-media mount; `<matter-N>`,
> `<archive-N>.pst`, and `<recovery-dir>` denote redacted corpus-side names;
> `<N>`/`<SIZE>` denote redacted counts/sizes. The concrete values live in
> the 2026-06-11 session transcript outside the repo.

## Source Locations

| # | Location | Contents | Size | Risk / notes |
| --- | --- | --- | --- | --- |
| 1 | `<USB_MOUNT>/<matter-emails>/` | a year-series of Inbox/Sent PSTs | `<SIZE>` | **Removable USB stick, no second copy. Salvage first.** |
| 2 | `<USER_HOME>/Documents/<matter-emails>/` | `<archive-2>.pst` | `<SIZE>` | Expected exact duplicate of a USB year |
| 3 | `<USER_HOME>/Documents/<recovery-dir>/` | `<archive-1>.pst` | `<SIZE>` | Recycle-bin recovery dir name; candidate for a missing late-year Sent archive |
| 4 | `<USER_HOME>/<corpus-root>/<matter-1>/` | `<N>` files across docx/txt/doc/html/png/pdf/jpg/gif/xlsx/rtf/zip; plus an `$I`/`$R` recycle-bin PST pair and `source/<archive-1>.pst` | `<SIZE>` | Windows Recycle-Bin `$I`/`$R` naming throughout — original filenames lost but recoverable from `$I` metadata |
| 5 | `<USER_HOME>/<corpus-root>/<matter-2-cad-workspace>/` | Patent application PDFs, USPTO/Google Patents assets, CAD prompt workspace | `<SIZE>` | Active workspace of `goals/agentic-cad-patent-tooling`. Catalog-only copy; leave original in place. |

## Key Findings

- **Year-series gaps**: the USB set is missing an early-year Inbox and a
  late-year Sent archive. The recycle-bin-recovered PSTs (#3, and the `$R`
  PST inside #4) are the leading candidates for those gaps. Confirm by PST
  internal metadata during P1/P2.
- **`$I`/`$R` semantics** (Windows Recycle Bin): `$I*` files are small
  metadata records carrying the original absolute path, file size, and
  deletion timestamp; `$R*` files are the actual content. Pairing them
  restores real filenames/paths for the recovered documents in #4 —
  this de-risks the Organization phase substantially.
- **Known duplicate sets going in**: `<archive-2>.pst` (#1 vs #2);
  `<archive-1>.pst` (#3 vs `#4/source/` vs possibly the `$R` PST pair).
- **Not corpus** (checked and excluded): several unrelated `Documents/`
  subdirectories (website assets, logos, an unrelated app, and tax records).
  Ontology-research strays found and routed to
  `goals/ip-law-knowledge-graph/research/ontology-grounding-corpus.md`.
- **No PSTs found anywhere else**: scans of all standard mounts and the user
  home tree surfaced no additional email archives beyond the locations above.

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
