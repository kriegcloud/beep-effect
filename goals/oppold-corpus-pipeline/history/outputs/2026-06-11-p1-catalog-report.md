# P1 Catalog & Exact Dedupe Run Report (2026-06-11)

## Outcome

`bun run beep corpus catalog --corpus-root /home/elpresidank/data-home/oppold-corpus`
built the DuckDB catalog, exact-duplicate report, and `$I`/`$R`
name-restoration manifest. All 8,438 provenance records validated against the
`CorpusProvenanceRecord` schema.

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

- `oppold-corpus/catalog/corpus.duckdb` — tables `corpus_source_files`
  (8,438 rows, `digest` + `artifact_id` per file), `corpus_restorations`
  (284 rows), view `corpus_duplicate_sets` (290 rows).
- `oppold-corpus/catalog/restoration-manifest.jsonl` — 284 records.
- `oppold-corpus/catalog/reports/duplicate-sets.json` — full duplicate-set
  report (kept corpus-side; member file names may carry client information).
- `oppold-corpus/catalog/reports/catalog-summary.json` — counts below.

## Summary Counts

| Metric | Value |
| --- | --- |
| Source files | 8,438 |
| Total bytes | 31,687,534,556 |
| Distinct digests | 7,330 |
| Duplicate sets | 290 |
| Redundant copies | 1,108 |
| Redundant bytes | 677,638,251 |
| `$I`/`$R` matched pairs | 251 |
| `$I` without `$R` | 1 |
| `$R` without `$I` | 32 |

## Key Findings

1. **`Sent_Emails.pst` triplet confirmed.** The largest duplicate set
   (312,886,272 bytes, 3 copies) is `data-home-oppold-ip-law/$R0SFKGS.pst` =
   `data-home-oppold-ip-law/source/Sent_Emails.pst` =
   `documents-re5arta/Sent_Emails.pst`. The paired `$I0SFKGS.pst` restores the
   original path `H:\Oppold_IP_Law\Emails\Sent_Emails.pst`, deleted
   2026-05-29T18:33:12Z. One logical archive, three physical copies.
2. **`LH_Inbox_2011.pst` is NOT an exact duplicate** (contrary to the
   packet's going-in assumption): the USB copy is 2,431,607,808 bytes and
   `~/Documents/LH_Emails/LH_Inbox_2011.pst` is 1,135,607,808 bytes with a
   different digest. *Amended during P4:* the Documents copy hashed
   byte-identical to the first 1,135,607,808 bytes of the USB original — it
   is a truncated partial copy (interrupted transfer), unreadable by libpff
   (index node referenced at offset 2.41 GB past EOF). The USB archive is
   authoritative and exported 10,438 messages in P2.
3. **Recycle-bin restoration covers all 252 `$I` files**: 251 matched to
   `$R` content with restored original names/paths (all v2 format, original
   paths under `H:\Oppold_IP_Law\...`); the single unmatched `$I` is a
   deleted empty directory (`H:\Oppold_IP_Law\Emails\New folder`, 0 bytes).
   32 `$R` content files have no `$I` metadata and keep unknown names.
4. **Most duplicate bulk is recycle-bin PDF copies and repeated email
   attachments** (`Sent_Emails.export/.../image00N.png` signature images,
   duplicated attachment PDFs), not unique work product.

## Provenance Manifest Amendment (P0 correction)

`corpus catalog` schema validation surfaced 15 provenance records whose
`sha256` field began with a literal `\` — the GNU coreutils `sha256sum`
escape marker emitted when a file name contains a backslash (15 files under
`Sent_Emails.export/.../Attachments/` contain literal `\x3b`/`\x26`
sequences in their names). The digests themselves were correct. Fix applied:

- Each affected copy AND its origin file re-hashed via Node crypto; all 15
  stripped digests matched both (`fixed=15 originVerified=15`).
- `raw/provenance.jsonl` rewritten with corrected fields; pre-fix manifest
  archived at `oppold-corpus/logs/provenance.jsonl.pre-escape-fix`.
- `ops/salvage.sh` patched to strip the escape marker in future runs.

## Open Questions Carried to P2

- Confirm whether `Sent_Emails.pst` is the missing `LH_Sent_2015` (PST
  internal date range during extraction).
- Locate `LH_Inbox_2009` content (possibly within an adjacent year PST).
- Diff the two `LH_Inbox_2011` snapshots at message level.
