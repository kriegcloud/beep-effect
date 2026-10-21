# Deferred proof queue

This was the pre-merge proof plan. The #1928 hold is now released; current
results are recorded in WORKING-STATE.md, cloud-proof.md and the dependency
proof reports. Hosted, merged-revision and exact-ID closure receipts remain
pending. Commands below are plans, not passing results by themselves.

Nothing in this queue has executed. The operator holds verification, quality
checks and publication until PR #1928 is confirmed merged. The parent owns
main integration and must wait for source workers to hand off before changing
Git state.

## Integration first

1. Confirm #1928 is merged and record its merge revision.
2. Preserve the current edits, new packet and ignored private evidence with a
   recoverable route; fetch and merge origin/main into this feature branch.
3. Reconcile any overlapping main repairs rather than duplicating them.
4. Regenerate the dependency lockfile for the DOCX dependency changes.
5. Load the Yeet workflow and run proof through the repository quality route.

## Focused behavior coverage

| Finding | Package | Regression surface |
| --- | --- | --- |
| CSF-001 | @beep/practice-review-hub | Hub.test.ts; Config.test.ts |
| CSF-002 | @beep/pdf-tools | PdfTools.service.test.ts |
| CSF-003 | @beep/doc-text | DocText.service.test.ts |
| CSF-004 | runbook | matching installation/removal HTTPS port; safe rollback |
| CSF-005 | @beep/repo-ai-metrics | config-snapshot-bounds.test.ts |
| CSF-006 | @beep/repo-cli | accounts-usage.test.ts |
| CSF-007 | @beep/palantiri | Redaction.test.ts |
| CSF-008 | @beep/law-practice-domain | ClaimElement.rules.test.ts |

Run meaningful targeted regressions and existing positive controls before
claiming a fix. Attribute failures as introduced, inherited, unrelated or
environment-only; use main's consolidated repairs for inherited failures.
Then run `bun run beep quality package-verify <package>` for each affected
package above and capture the actual results. The pending source drafts are
not passing proof, and source-only peer review does not replace execution.

## Publication and closure

Reconcile packet JSON, dispositions, final verdicts, changed files and proof
receipts. Complete Yeet repair and publish a single intentional PR. Follow
required hosted checks, review closure and review-window gates. Only after
merge and merged-revision proof may the exact eight Cloud IDs be closed.
Verify final Cloud state separately from PR mergeability, and retain the
reflection and completed-retained packet state through closeout.

## Additional Dependabot proof

- Fixtures: all lockfile parser/integration readers, negative/version-gate
  cases, byte-preservation inventory and scratchpad package verification.
- Python: supported uv resolution for CPU/ROCm extras, urllib3 and pytest;
  numerical tests, native ROCm import/device/forward pass in isolation, and
  MatchPerson provenance/portability checks. Official wheel metadata does not
  substitute for native runtime proof. Inspect disk availability before the
  approximately 6.23 GB ROCm wheel download.
- Rust: regenerate both Cargo locks using supported Cargo operations, confirm
  shared patched GLib with no vulnerable registry duplicate, targeted fixed
  rustls/serde_with versions, production-feature build and release-mode
  VariantStrIter regressions. Preserve licenses and upstream patch receipts.
- After combined-PR merge: refresh all 104 captured alert IDs and GitHub graph
  state. Record automatic fixed statuses or exact evidence-backed supported
  closure separately; no source draft is an alert-closure receipt.
