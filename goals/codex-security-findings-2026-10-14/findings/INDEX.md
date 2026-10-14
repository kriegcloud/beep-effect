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
| [CSF-003](./CSF-003.md) | Medium | captured | Draft edits can bypass the outbox send expectation guard | _pending P2_ |
| [CSF-004](./CSF-004.md) | Medium | repair implemented | Crafted attachment names persistently block mail tagging | mail attachment filing |
| [CSF-005](./CSF-005.md) | Medium | repair implemented | Boundary\-date emails can crash the docket intake service | docket Graph calendar adapter |
| [CSF-006](./CSF-006.md) | Low | repair implemented | Review checkpoints expose mail content through permissive files | docket intake file store |
| [CSF-007](./CSF-007.md) | Low | repair implemented | Mail\-tagging state can be readable by other local users | mail-tagging state and lock |
| [CSF-008](./CSF-008.md) | Low | repair implemented | Job\-log ANSI filter can reconstruct terminal control sequences | gh-fix-ci job-log inspector |
| [CSF-009](./CSF-009.md) | Low | repair implemented | Tesseract file\-list input bypasses the corpus read boundary | corpus OCR raster intake |
| [CSF-010](./CSF-010.md) | Low | repair implemented | Mail attachment names inject terminal controls during intake | drawing intake terminal summary |
| [CSF-011](./CSF-011.md) | Low | repair implemented | Source checkout preloads can forge signed pilot evidence | signed cache pilot supervisor |
| [CSF-012](./CSF-012.md) | Low | captured | Hook resolver executes code from an untrusted current checkout | _pending P2_ |
| [CSF-013](./CSF-013.md) | Low | captured | Aliased packages bypass the exact\-version Bun audit ignore guard | _pending P2_ |
| [CSF-014](./CSF-014.md) | Low | repair implemented | Backdated commits bypass the new merge review window | Yeet REST merge review window |
| [CSF-015](./CSF-015.md) | Low | captured | Address substring parsing bypasses attachment sender restrictions | _pending P2_ |
| [CSF-016](./CSF-016.md) | Low | captured | Publisher PDF discovery bypasses internal\-source restrictions | _pending P2_ |
| [CSF-017](./CSF-017.md) | Low | captured | Correspondent parser allows CPU\-exhausting regex backtracking | _pending P2_ |
| [CSF-018](./CSF-018.md) | Informational | captured | Backslash filenames escape scorer staging and enable code execution | _pending P2_ |
| [CSF-019](./CSF-019.md) | Informational | captured | Repository\-controlled ignore globs can hang Graft via ReDoS | _pending P2_ |
| [CSF-020](./CSF-020.md) | Informational | captured | Adoption writes outside the packet through directory symlinks | _pending P2_ |
| [CSF-021](./CSF-021.md) | Informational | captured | Predictable codemod staging paths allow symlink file overwrite | _pending P2_ |
| [CSF-022](./CSF-022.md) | Informational | captured | Quadratic overlap enumeration enables drawing\-spec denial of service | _pending P2_ |
| [CSF-023](./CSF-023.md) | Informational | captured | Intake inspector can leak document bytes to the hosted relay | _pending P2_ |
| [CSF-024](./CSF-024.md) | Informational | captured | New line\-value locator permits repository\-triggered ReDoS | _pending P2_ |
| [CSF-025](./CSF-025.md) | Informational | captured | Artifact upload allows command execution through zip filenames | _pending P2_ |
| [CSF-026](./CSF-026.md) | Informational | captured | Event deletion permits traversal to other Graph resources | _pending P2_ |
| [CSF-027](./CSF-027.md) | Informational | captured | Bootstrap executes unverified op during status logging | _pending P2_ |
| [CSF-028](./CSF-028.md) | Informational | captured | Staging cleanup can delete data through a symlinked goals root | _pending P2_ |
| [CSF-029](./CSF-029.md) | Informational | captured | Model report symlinks can overwrite operator files | _pending P2_ |
| [CSF-030](./CSF-030.md) | Informational | captured | Quadratic regex permits denial of service in OA recognition | _pending P2_ |
| [CSF-031](./CSF-031.md) | Informational | captured | Undo can delete calendar entries verified after planning | _pending P2_ |
| [CSF-032](./CSF-032.md) | Informational | repair implemented | Boundary\-date input can repeatedly abort docket intake polls | docket reminder ladder |
| [CSF-033](./CSF-033.md) | Informational | captured | New Bash grants bypass the Beep\-only log access restriction | _pending P2_ |
| [CSF-034](./CSF-034.md) | Informational | captured | Crafted PDF font graphs cause exponential validation work | _pending P2_ |
| [CSF-035](./CSF-035.md) | Informational | captured | Historical citations cause unbounded repository archive copies | _pending P2_ |
| [CSF-036](./CSF-036.md) | Informational | captured | Unsafe shell quoting in PR\-title recovery commands | _pending P2_ |
| [CSF-037](./CSF-037.md) | Informational | captured | Checkout\-root swaps bypass residue\-reap containment | _pending P2_ |
| [CSF-038](./CSF-038.md) | Informational | captured | Font metadata can inject executable generated TypeScript | _pending P2_ |
| [CSF-039](./CSF-039.md) | Informational | captured | Corpus resume follows output symlinks outside its root | _pending P2_ |
| [CSF-040](./CSF-040.md) | Informational | captured | Cursor shell deny guard can be bypassed with pathname globs | _pending P2_ |
| [CSF-041](./CSF-041.md) | Informational | captured | Unnormalized sensitivity labels bypass memory access checks | _pending P2_ |
| [CSF-042](./CSF-042.md) | Informational | captured | Departed terminal shells bypass retirement write detection | _pending P2_ |
| [CSF-043](./CSF-043.md) | Informational | captured | Size\-only Box conflicts can falsely complete pending filings | _pending P2_ |
| [CSF-044](./CSF-044.md) | Informational | captured | Unvalidated Fallow sidecars can block the tmpfs janitor | _pending P2_ |
| [CSF-045](./CSF-045.md) | Informational | captured | Chunked uploads commit swapped sources before checking integrity | _pending P2_ |
| [CSF-046](./CSF-046.md) | Informational | captured | Review round writes follow symlinks outside the corpus root | _pending P2_ |
| [CSF-047](./CSF-047.md) | Informational | captured | Provenance outputs follow symlinks outside the corpus root | _pending P2_ |

## Closeout Mapping

- `remediate` or `already-fixed` -> close as `Fixed` after merge and merged-revision verification.
- Strictly proven invalid -> close as `False positive` with evidence recorded.
- Preserve the complete `commit:` identity in every receipt; never strip its namespace.
- Before P2 verdicts, obtain Validation, Evidence, and Attack-path analysis from each finding detail.
- Record missing detail evidence explicitly and hold unsupported verdicts; the CSV contains Summary only.
- Accepted risk / `Won't fix` does not satisfy this packet's completion gate.
