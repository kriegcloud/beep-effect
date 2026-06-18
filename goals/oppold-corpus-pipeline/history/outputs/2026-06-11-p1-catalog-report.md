# P1 Catalog & Exact Dedupe Run Report (2026-06-11)

## Outcome

`bun run beep corpus catalog --corpus-root <CORPUS_ROOT>`
built the DuckDB catalog, exact-duplicate report, and `$I`/`$R`
name-restoration manifest. All provenance records validated against the
`CorpusProvenanceRecord` schema.

> Note: corpus paths, archive names, restored original paths, deletion
> timestamps, and exact counts are redacted to comply with the SPEC
> no-corpus-content/no-PII constraint. `<CORPUS_ROOT>` denotes the
> outside-repo corpus root; `<N>`/`<BYTES>` denote redacted counts/sizes;
> `<archive-N>.pst`, `<matter-workspace>`, and `<restored-path>` denote
> redacted corpus-side names. The machine-readable values live in the
> outside-repo catalog surfaces only.

## Implementation

New `beep corpus` command family (P1 slice) in
`packages/tooling/tool/cli/src/commands/Corpus/` following the Files command
structure: `Corpus.command.ts`, `Corpus.schemas.ts`, `Corpus.service.ts`,
`Corpus.recyclebin.ts`, `Corpus.errors.ts`. Catalog runs on `@beep/duckdb`
(`DuckDb.makeNodeLayer`); manifests decode/encode through `effect/Schema`
classes. The `$I` parser supports recycle-bin metadata v1 (Vista–8.1) and v2
(Windows 10+); tests use synthetic fixtures only
(`packages/tooling/tool/cli/test/corpus-command.test.ts`, 6 tests passing,
including an end-to-end synthetic-corpus catalog run). Package gates green:
`TURBO_FORCE=1 bunx turbo run check lint --filter=@beep/repo-cli`.

## Catalog Surfaces (outside the repo)

- `<CORPUS_ROOT>/catalog/corpus.duckdb` — tables `corpus_source_files`
  (`digest` + `artifact_id` per file), `corpus_restorations`, view
  `corpus_duplicate_sets`. Row counts kept corpus-side.
- `<CORPUS_ROOT>/catalog/restoration-manifest.jsonl` — restoration records.
- `<CORPUS_ROOT>/catalog/reports/duplicate-sets.json` — full duplicate-set
  report (kept corpus-side; member file names may carry client information).
- `<CORPUS_ROOT>/catalog/reports/catalog-summary.json` — aggregate counts.

## Summary Counts

Exact source-file counts, byte totals, distinct-digest counts, and
duplicate-set tallies are redacted; they live in the outside-repo
`catalog-summary.json` only. Shape: source files `<N>`, total bytes
`<BYTES>`, distinct digests `<N>`, duplicate sets `<N>`, redundant copies
`<N>`, redundant bytes `<BYTES>`, `$I`/`$R` matched pairs `<N>`, `$I`
without `$R` `<N>`, `$R` without `$I` `<N>`.

## Key Findings

1. **Largest-archive triplet confirmed.** The largest duplicate set
   (`<BYTES>`, 3 copies) is a recycle-bin `$R` content file equal to the
   `source/<archive-1>.pst` copy and a separate recovery-dir copy. The paired
   `$I` metadata restores the original Windows path (`<restored-path>`),
   deleted at `<timestamp>`. One logical archive, three physical copies.
2. **`<archive-2>.pst` is NOT an exact duplicate** (contrary to the
   packet's going-in assumption): the USB copy and the
   `<CORPUS_ROOT>`-side copy have different sizes and different digests.
   *Amended during P4:* the smaller copy hashed byte-identical to the leading
   bytes of the USB original — it is a truncated partial copy (interrupted
   transfer), unreadable by libpff (index node referenced past EOF). The USB
   archive is authoritative and exported `<N>` messages in P2.
3. **Recycle-bin restoration covers all `$I` files**: nearly all matched to
   `$R` content with restored original names/paths (all v2 format, original
   paths redacted as `<restored-path>`); the single unmatched `$I` is a
   deleted empty directory (0 bytes). A small number of `$R` content files
   have no `$I` metadata and keep unknown names.
4. **Most duplicate bulk is recycle-bin PDF copies and repeated email
   attachments** (per-message export signature images, duplicated attachment
   PDFs), not unique work product.

## Provenance Manifest Amendment (P0 correction)

`corpus catalog` schema validation surfaced a batch of provenance records
whose `sha256` field began with a literal `\` — the GNU coreutils
`sha256sum` escape marker emitted when a file name contains a backslash
(some files under a per-message export `.../Attachments/` tree contain
literal `\x3b`/`\x26` sequences in their names). The digests themselves were
correct. Fix applied:

- Each affected copy AND its origin file re-hashed via Node crypto; all
  stripped digests matched both (`originVerified` for every record).
- `raw/provenance.jsonl` rewritten with corrected fields; pre-fix manifest
  archived at `<CORPUS_ROOT>/logs/provenance.jsonl.pre-escape-fix`.
- `ops/salvage.sh` patched to strip the escape marker in future runs.

## Open Questions Carried to P2

- Confirm whether `<archive-1>.pst` is the missing late-year Sent archive
  (PST internal date range during extraction).
- Locate the missing early-year Inbox content (possibly within an adjacent
  year PST).
- Diff the two `<archive-2>.pst` snapshots at message level.
