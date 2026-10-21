# DOCX round-two review repair

Reviews: [4333365292](https://github.com/beep-effect/beep-effect/pull/1930#discussion_r4333365292)
and [4333365298](https://github.com/beep-effect/beep-effect/pull/1930#discussion_r4333365298).
Both compatibility findings are valid. The previous preflight charged every
archive member against 8 MiB, including media, and charged all XML/rels against
50,000 SAX events, including metadata Mammoth never reads.

## Reproduction evidence

The prior preflight was actually executed from an isolated copy of published
HEAD `e3c548ea5839cd468c95f8e77bb2c0524205c647`. Its service/error source was
unchanged except for an extra export exposing the private preflight to the
ignored local probe. The source archive and live checkout were not reverted.

- The generated 20-page-segment, run-heavy main XML (841,453 bytes) failed with
  internal `input-limit` before Mammoth.
- The corresponding 60-page-segment XML (2,524,133 bytes) also failed with
  `input-limit`.
- A small main document plus 10 MiB of embedded media failed with `input-limit`.

These are measured prior-preflight failures, not merely limit accounting.
The page controls use explicit page breaks; Office pagination/rendering was not
measured. Final public-engine controls execute complete Mammoth extraction and
retain their expected text. The final media control is stronger than the prior
probe: it includes a main-document drawing with `a:blip r:embed="photo1"`, a
matching image relationship and PNG content type pointing at the 10 MiB member.
Raw extraction succeeds after that member is omitted from the repack.

Evidence: ignored `raw/docx-round2-prior-source-controls.log`; isolated probe and
source revision under `.beep/docx-round2-baseline/`. The earlier filename
`raw/docx-round2-baseline-reproduction.log` is a transitional run of the NEW
implementation against OLD rejection assertions (10 expected-to-change test
failures); it is not prior-implementation evidence.

## Final bounds and exact part selection

| Boundary | Final policy |
| --- | --- |
| Source bytes | 20 MiB, unchanged |
| Local ZIP entries | 512, unchanged; all names validated |
| Actual expanded consumed XML/rels | `min(operation.maxMaterializedBytes, 8 MiB)`, unchanged byte ceiling |
| XML events | `max(1, min(1,000,000, floor(effectiveXmlBytes / 8)))`, shared across consumed parts |
| XML nesting | 128, unchanged |
| Compressed push size | 1,024 bytes, unchanged |
| Relationship selection storage | At most six fixed type/target pairs per consumed relationship part |

First inventory all local ZIP members and reject duplicates, leading slashes,
backslashes, repeated slashes and dot-segment aliases. Do not start any inflater
at inventory time. fflate's deferred `UnzipFile.start()` retains compressed
source chunks; their bytes remain bounded by the 20 MiB input ceiling. The
installed fflate implementation replays the same bounded chunks when a selected
part starts, so each actual output chunk is charged before retention even when
ZIP uncompressed-size declarations are forged. Ignored members never start an
inflater and never enter the rebuilt archive.

Selection mirrors installed Mammoth `lib/docx/docx-reader.js`: read
`[Content_Types].xml` and `_rels/.rels`, choose the first existing main-document
target or `word/document.xml`, read that main part's relationships, then choose
comments/endnotes/footnotes/numbering/styles targets or their conventional
fallback paths. Read the relationships of main/comments/endnotes/footnotes as
Mammoth does. Cache each part once. At most twelve distinct metadata/content
parts can be selected by these fixed steps; there is no unbounded relationship
traversal. XML/rels used only for themes, settings, fontTable and arbitrary
unconsumed paths are excluded regardless of extension.

Target joining retains Mammoth's literal semantics: reset the base for an
absolute target and strip exactly one leading slash; do not normalize dot
segments, percent escapes or repeated slashes. Custom and truly extensionless
main/styles targets are explicitly covered. Relationship elements use the OPC
namespace and direct-child position; target type matching follows Mammoth's
fixed transitional relationship URIs.

Independent review identified quadratic accumulation in the intermediate
relationship-target arrays. The final implementation retains only the first
EXISTING target for each of six relevant fixed types, since inventory already
knows all member names. It ignores arbitrary types before Record writes. Thus
Record size stays at six, repeated types do not append/copy arrays, and missing
targets cannot displace a later first-existing target. The regression uses
30,000 alternating repeated styles/arbitrary types, missing-first and later
existing targets; the later target contains a DTD and must remain unconsumed.

The stored repack contains only validated, actually consumed XML/rels, preserving
protection against inconsistent central-directory selection. Strict UTF-8/BOM
handling, DTD rejection, depth limits, actual expansion accounting and typed
failure mapping remain. Original source bytes are unchanged. This operation is
raw text extraction: Mammoth constructs image handles, but the installed
body-reader stores a lazy `docxFile.read` callback and raw-text conversion never
invokes it. Referenced media can safely be omitted from this temporary repack;
this policy is not a general-purpose DOCX rendering/archive export policy.

## Final proof and attribution

Focused suite passed after the main repair (41 tests). Additional extensionless
and dense-relationship controls were then added. Final Node/V8 run passed
**44 tests across two files** in 34.84s, including live integration. Existing
huge XML, aggregate nodes, oversized attributes, DTD/depth, declared-length
understatement, central-directory mismatch, duplicate/path-alias, UTF-16,
custom/absolute/percent-literal targets, and truncated-stream regressions pass.

Canonical package verification passed on the final relationship repair:
`bun run beep quality package-verify @beep/doc-text`, exit 0; audit 16.2s and
docgen 4.8s. Canonical package test checker and root scoped Oxlint passed.
Global Effect/Vitest passed with zero introduced findings (1,546 files; 190
resolved against the existing ratchet). Global schema-first also passed with zero introduced findings and a clean
parity ratchet; no baseline or policy was lowered.

Node/V8 package coverage: statements 93.93%, branches 90.27%, functions 88.63%,
lines 95.80%. Changed service: statements 93.63%, branches 90.14%, functions
88.09%, lines 95.55%. No coverage setting or floor changed. Coverage JSON is
retained at `~/.cache/beep/docx-round2-node-coverage/`.

Introduced proof defects were repaired: the new text-length assertion initially
ignored optional `result.text` (TS18048), then its Option-based repair lacked an
import (TS2304). These are local test errors, not inherited source failures.
The final package audit passes; parent retains acknowledgment of
`local-shard-1cdbfebd1986` through the actual combined fix commit. No inbox
acknowledgment, commit or publication was performed by this lane.

Final ignored logs use the `raw/docx-round2-` prefix: `package-verify.log`,
`test-checker.log`, `node-coverage.log`, `schema-first.log`,
`effect-vitest.log`, `oxlint.log`, `format.log`, and `prior-source-controls.log`.
The final change scope is `src/DocText.service.ts`,
`test/DocText.service.test.ts` inside doc-text and this report. Parent owns
packet manifest/SPEC/CSF-003/WORKING-STATE reconciliation and the single round-two
push. Reversal is the inverse of this review wave; it reinstates the previous
media/node compatibility rejection while retaining its security bounds.

## Final Fallow gate repair

A later global Fallow audit found an introduced complexity gate in the SAX
`opentag` callback: cyclomatic 12 / CRAP 43.1. The earlier package, schema and
Vitest checks did not cover this separate gate. Moved first-existing-target
recording into the local `rememberTarget(type, target)` responsibility helper.
The callback retains node/depth charging, namespace/direct-child checks and
attribute presence checks; the helper retains the same fixed six-type filter,
first-existing ordering and complete-inventory membership check. No state,
limits, relationship selection or extraction behavior changed.

Requalification after that source edit:

- Global `bun run beep quality fallow audit --check --base origin/main --out
  .beep/fallow/docx-round2-final-audit.json --quiet`: exit 0; introduced findings
  zero, inherited-adjacent findings one. The remaining advisory is the existing
  JPEG-border test helper; it was not changed. No Fallow baseline changed.
- Canonical doc-text package verifier: exit 0, audit 21.1s, docgen 5.0s.
- Root scoped Oxlint: exit 0.
- Scoped whitespace check: passed.

Final logs: ignored `raw/docx-round2-fallow.log`,
`raw/docx-round2-fallow-package-verify.log`, and
`raw/docx-round2-fallow-oxlint.log`. The prior Node/V8 percentages above were
measured before this behavior-preserving helper extraction; full package
build/check/tests/lint/docgen were rerun afterward. The parent continues to own
the one combined push and all inbox acknowledgments.

## Frozen-source final Node/V8 receipt

Repeated the same Node/V8 coverage command once after the final helper extraction,
with no intervening source edits: exit 0, **44 tests passed across two files** in
29.05s. Final package coverage is 94.01% statements, 90.27% branches, 88.88%
functions and 95.86% lines. Final `DocText.service.ts` coverage is 93.71%
statements, 90.14% branches, 88.37% functions and 95.62% lines.

The actual final log is ignored `raw/docx-round2-final-node-coverage.log`;
JSON coverage is retained at `~/.cache/beep/docx-round2-final-node-coverage/`.
These metrics supersede the pre-extraction coverage receipt above. No broader
checks, source changes, baseline updates or publication ran during this final
bounded request. The doc-text source and tests are frozen for the parent wave.
