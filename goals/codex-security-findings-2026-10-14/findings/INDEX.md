# Codex Security Findings Index (2026-10-14)

Captured from the authenticated Security Cloud findings view for
`kriegcloud/beep-effect` on 2026-10-14 through the summary-only signed-in CSV export.
Captured summaries remain ignored under `raw/`; tracked records omit signed URLs,
auth values, email addresses, and raw local paths.

## Severity Summary

| Severity | Count |
| --- | ---: |
| Medium | 5 |
| Low | 12 |
| Informational | 30 |

## Findings

| ID | Severity | Status | Title | Owner area |
| --- | --- | --- | --- | --- |
| [CSF-001](./CSF-001.md) | Medium | repair implemented | Crafted review counts can crash Yeet closeout and monitoring | Yeet review body parsing |
| [CSF-002](./CSF-002.md) | Medium | repair implemented | Credential\-bank regex enables small\-input denial of service | canonical credential pattern bank |
| [CSF-003](./CSF-003.md) | Medium | repair implemented | Draft edits can bypass the outbox send expectation guard | M365 outbox draft sending |
| [CSF-004](./CSF-004.md) | Medium | repair implemented | Crafted attachment names persistently block mail tagging | mail attachment filing |
| [CSF-005](./CSF-005.md) | Medium | repair implemented | Boundary\-date emails can crash the docket intake service | docket Graph calendar adapter |
| [CSF-006](./CSF-006.md) | Low | repair implemented | Review checkpoints expose mail content through permissive files | docket intake file store |
| [CSF-007](./CSF-007.md) | Low | repair implemented | Mail\-tagging state can be readable by other local users | mail-tagging state and lock |
| [CSF-008](./CSF-008.md) | Low | repair implemented | Job\-log ANSI filter can reconstruct terminal control sequences | gh-fix-ci job-log inspector |
| [CSF-009](./CSF-009.md) | Low | repair implemented | Tesseract file\-list input bypasses the corpus read boundary | corpus OCR raster intake |
| [CSF-010](./CSF-010.md) | Low | repair implemented | Mail attachment names inject terminal controls during intake | drawing intake terminal summary |
| [CSF-011](./CSF-011.md) | Low | repair implemented | Source checkout preloads can forge signed pilot evidence | signed cache pilot supervisor |
| [CSF-012](./CSF-012.md) | Low | repair implemented | Hook resolver executes code from an untrusted current checkout | Claude hook executable root |
| [CSF-013](./CSF-013.md) | Low | repair implemented | Aliased packages bypass the exact\-version Bun audit ignore guard | Bun audit OSV override selection |
| [CSF-014](./CSF-014.md) | Low | repair implemented | Backdated commits bypass the new merge review window | Yeet REST merge review window |
| [CSF-015](./CSF-015.md) | Low | repair implemented | Address substring parsing bypasses attachment sender restrictions | mail sender address normalization |
| [CSF-016](./CSF-016.md) | Low | captured | Publisher PDF discovery bypasses internal\-source restrictions | _pending P2_ |
| [CSF-017](./CSF-017.md) | Low | repair implemented | Correspondent parser allows CPU\-exhausting regex backtracking | practice KG correspondent parser |
| [CSF-018](./CSF-018.md) | Informational | repair implemented | Backslash filenames escape scorer staging and enable code execution | agent effectiveness law-lane staging |
| [CSF-019](./CSF-019.md) | Informational | repair implemented | Repository\-controlled ignore globs can hang Graft via ReDoS | Graft deep-ignore patch |
| [CSF-020](./CSF-020.md) | Informational | repair implemented | Adoption writes outside the packet through directory symlinks | goal adoption materializer |
| [CSF-021](./CSF-021.md) | Informational | captured | Predictable codemod staging paths allow symlink file overwrite | _pending P2_ |
| [CSF-022](./CSF-022.md) | Informational | captured | Quadratic overlap enumeration enables drawing\-spec denial of service | _pending P2_ |
| [CSF-023](./CSF-023.md) | Informational | captured | Intake inspector can leak document bytes to the hosted relay | _pending P2_ |
| [CSF-024](./CSF-024.md) | Informational | repair implemented | New line\-value locator permits repository\-triggered ReDoS | Models locator parsing |
| [CSF-025](./CSF-025.md) | Informational | already fixed | Artifact upload allows command execution through zip filenames | scratchpad artifact archive command |
| [CSF-026](./CSF-026.md) | Informational | repair implemented | Event deletion permits traversal to other Graph resources | M365 Graph path segment schema |
| [CSF-027](./CSF-027.md) | Informational | repair implemented | Bootstrap executes unverified op during status logging | cloud bootstrap 1Password status |
| [CSF-028](./CSF-028.md) | Informational | repair implemented | Staging cleanup can delete data through a symlinked goals root | goal bootstrap staging sweep |
| [CSF-029](./CSF-029.md) | Informational | repair implemented | Model report symlinks can overwrite operator files | models report writer |
| [CSF-030](./CSF-030.md) | Informational | repair implemented | Quadratic regex permits denial of service in OA recognition | office action text recognizer |
| [CSF-031](./CSF-031.md) | Informational | captured | Undo can delete calendar entries verified after planning | _pending P2_ |
| [CSF-032](./CSF-032.md) | Informational | repair implemented | Boundary\-date input can repeatedly abort docket intake polls | docket reminder ladder |
| [CSF-033](./CSF-033.md) | Informational | repair implemented | New Bash grants bypass the Beep\-only log access restriction | Claude Bash permission allowlist |
| [CSF-034](./CSF-034.md) | Informational | repair implemented | Crafted PDF font graphs cause exponential validation work | PDF font structure inspector |
| [CSF-035](./CSF-035.md) | Informational | repair implemented | Historical citations cause unbounded repository archive copies | Knowledge doctor historical citations |
| [CSF-036](./CSF-036.md) | Informational | repair implemented | Unsafe shell quoting in PR\-title recovery commands | Yeet PR title recovery |
| [CSF-037](./CSF-037.md) | Informational | repair implemented | Checkout\-root swaps bypass residue\-reap containment | Repository residue cleanup |
| [CSF-038](./CSF-038.md) | Informational | repair implemented | Font metadata can inject executable generated TypeScript | Technical drawing glyph generator |
| [CSF-039](./CSF-039.md) | Informational | captured | Corpus resume follows output symlinks outside its root | _pending P2_ |
| [CSF-040](./CSF-040.md) | Informational | repair implemented | Cursor shell deny guard can be bypassed with pathname globs | Cursor shell guard |
| [CSF-041](./CSF-041.md) | Informational | captured | Unnormalized sensitivity labels bypass memory access checks | _pending P2_ |
| [CSF-042](./CSF-042.md) | Informational | captured | Departed terminal shells bypass retirement write detection | _pending P2_ |
| [CSF-043](./CSF-043.md) | Informational | repair implemented | Size\-only Box conflicts can falsely complete pending filings | Mail attachment filing reconciliation |
| [CSF-044](./CSF-044.md) | Informational | repair implemented | Unvalidated Fallow sidecars can block the tmpfs janitor | Tmpfs Fallow cache janitor |
| [CSF-045](./CSF-045.md) | Informational | captured | Chunked uploads commit swapped sources before checking integrity | _pending P2_ |
| [CSF-046](./CSF-046.md) | Informational | repair implemented | Review round writes follow symlinks outside the corpus root | Drawing review round storage |
| [CSF-047](./CSF-047.md) | Informational | repair implemented | Provenance outputs follow symlinks outside the corpus root | Corpus provenance output |

## Closeout Mapping

- `remediate` or `already-fixed` -> close as `Fixed` after merge and merged-revision verification.
- Strictly proven invalid -> close as `False positive` with evidence recorded.
- Preserve the complete `commit:` identity in every receipt; never strip its namespace.
- Before P2 verdicts, obtain Validation, Evidence, and Attack-path analysis from each finding detail.
- Record missing detail evidence explicitly and hold unsupported verdicts; the CSV contains Summary only.
- Accepted risk / `Won't fix` does not satisfy this packet's completion gate.
