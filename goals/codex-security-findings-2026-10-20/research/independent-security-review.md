# Independent source review: security remediation

Reviewed the shared dirty diff against HEAD
`426d494b3433ccddf797a2d896984f1ad23c81ad` on 2026-10-20. This was an
independent read-only code review; no source edits, test reruns, installs,
publication, or finding-status changes were performed. The report itself is
the sole authored deliverable. There is no invented confidence score.

## Actionable introduced findings

None identified in the reviewed surfaces. This does not erase the original
Cloud findings, establish exploit impossibility, replace existing regression
proof, or establish hosted/merged-revision qualification.

## Reviewed paths and reasoning

- `apps/practice-review-hub/src/Config.ts:43`: required redacted application
  token, 32–256-character constraint, no CLI secret flag, forbidden JSON
  encoding. `src/runtime/Layer.ts:48`: authentication checks an independently
  supplied Authorization value before accepting the allow-listed proxy login;
  exact bytes, length guard, constant-time equal-length comparison. The
  layer/server caller propagates the required credential at lines 110 and 158.
  Existing regression/config test additions cover missing/wrong credentials,
  forged identity, successful routing and error redaction. No new route bypass
  was found in this construction.
- `apps/practice-review-hub/deploy/practice-review-hub.service:29` and
  `docs/runbooks/practice-review-hub.md:61`: the unit resolves the configured
  secret reference through op; the runbook describes protected server/client
  provisioning and startup failure when absent. The removal listener now
  matches the example HTTPS port. Rollback explicitly keeps pre-fix code
  stopped. This review did not provision credentials or exercise Tailscale.
- `packages/drivers/doc-text/src/DocText.service.ts:164`: the DOCX preflight
  charges actual streamed inflated bytes, entry count and aggregate XML
  events/depth, then passes a reconstructed archive to Mammoth. Duplicate and
  normalized ZIP-name aliases are rejected; local data rather than a conflicting
  central directory defines the reconstructed input. Small compressed pushes
  limit transient inflate output before accounting. XML is decoded in the same
  UTF-8 interpretation as Mammoth and DTDs fail closed.
- `packages/drivers/doc-text/src/DocText.service.ts:230`: reviewed the six
  relationship-targeted XML families and non-XML-extension discovery against
  the installed Mammoth `lib/docx/docx-reader.js`, `office-xml-reader.js`,
  `relationships-reader.js` and XML namespace reader. Mammoth consumes main,
  styles, numbering, footnotes, endnotes and comments; the preflight covers
  these families. Its target concatenation/one-leading-slash removal matches
  Mammoth's exact ZIP lookup, and `.rels` files receive validation. The
  existing authored regressions exercise custom targets and malformed/deep
  XML. No concrete unvalidated Mammoth XML input was identified.
- `packages/drivers/pdf-tools/src/internal/structure.ts:190`: the shared
  128-candidate count is spent before decoding the overlapping header windows
  or parsing candidate objects; it includes both marker families and markers
  in arbitrary stream bytes. `headerBefore` at line 206 retains one regex
  match instead of an array. Limit exhaustion throws a typed parse failure.
  Marker-dense otherwise valid files can now be rejected by design; this
  source review does not claim a broad PDF compatibility corpus result.
- `packages/law-practice/domain/src/values/ClaimElement/Antecedent.policy.ts:173`:
  recursive traversal shares one invocation budget and depth cap. It charges
  copied path/array work before allocation, and failed reservations consume
  the remainder. Lines 473–487 replace incomplete enumeration or term results
  with explicit `chain-work-limit` abstention. A fresh policy invocation gets
  its own budget at line 457. No path that resets the budget per tree or accepts
  an incomplete successful verdict was identified. Large ordinary claim sets
  may now abstain; the original semantic/positive regressions remain necessary.
- `packages/tooling/tool/cli/src/commands/Files/internal/MatchPerson.worker-service.ts:66`:
  the changed exact pins match the Python report's actual CPU/ROCm runtime
  identities. The equality/family check at lines 699–715 and existing HIP,
  architecture and single-device checks at lines 682–687 retain the prior
  fail-closed contract. The generated Python lock and manifest retain mutually
  exclusive cohorts and replace the old triton provider with triton-rocm.
  No guard loosening or new model/weight source was introduced in this diff.
- `vendor/rust/glib-0.18.5/src/variant_iter.rs:120`: the C output pointer is now
  mutable and passed by mutable reference. Both application manifest patches
  select this single source with their correct relative paths. Reviewed the
  provenance/maintenance docs and retained regression additions; no invented
  version or modified-tree checksum is used to suppress version-based alerts.
  Application source and GTK ABI remain unchanged by the narrow backport.

## Proof boundaries retained

Read `cloud-proof.md`, `dependabot-python.md`, `dependabot-rust.md`, and
`dependabot-fixtures-proof.md`; their command results belong to the original
proof lanes and were not reproduced by this reviewer. Python proof includes
native CPU/ROCm identities and synthetic graph execution, not pinned real-model
face quality or full worker real-photo inference. Rust proof includes optimized
iterator tests and locked production-feature builds/library tests, not a live
application shell or updater network exercise. Fixture proof retains its
compiler/canary compatibility blocker separately from passing parser tests.

`PENDING-PROOF.md` still contains authoring-time hold text; later released-hold
receipts supersede that text. The parent owns reconciling packet lifecycle and
proof status. No review statement here claims GitHub graph ingestion,
automatic Dependabot closure, Cloud finding closure, PR readiness or merge.
