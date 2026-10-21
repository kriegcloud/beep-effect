# Cheap-gate triage after integration

The initial collected tier failed four of 18 lanes. Parent owns the tier inbox
row and will rerun the collected tier after the targeted repairs. No gate
threshold, baseline, suppression or policy changed.

| Lane | Attribution | Repair / current evidence |
| --- | --- | --- |
| observability:catalog-check | introduced generated drift | Canonical catalog write regenerated the DOCX shard; canonical check passed with 120 shards and zero drift. |
| lint:effect-imports-markdown | environment-only ignored stale generated docs | Zero tracked files existed under the 9 MiB `scratchpad/.jsdoc-loop/generated-docs` cache, and `git check-ignore` confirmed the directory is ignored. Preserved it by moving to `~/.cache/beep/security-findings-2026-10-20/jsdoc-generated-docs`. Specific markdown gate now passes. |
| fallow:audit | three introduced complexity findings | DOCX outer parsing closure cognitive 13, SAX open-tag callback CRAP 31.6, claim dependent traversal cognitive 13. Extracted XML relationship discovery and one-part parsing into local cohesive closures; removed redundant pending-set guard because pending is already filtered. Made one-parent bounded chain extension a local operation with early returns. Final audit passes with zero introduced findings. |
| fallow:health | same introduced complexity findings | Final health rerun passes with findingCount 0 and exitStatus 0. The first remediation rerun saw two remaining findings before the second simplification; retained its failed receipt. |

The Fallow audit also lists `writeNearSolidJpegBorder` in the sibling-owned
CLI test as inherited-adjacent (`introduced:false`), nonblocking. It was
left untouched. No unrelated source was changed.

Both refactors preserve the resource limits, per-invocation budget state,
charge-before-copy behavior, UTF-8 validation, XML target lookup semantics and
repacked archive boundary. No span name changed. The first refactoring pass
passed 39 DOCX and 28 claim tests and full package verification for both; a
second full verification of the final simplified functions passed: DOCX audit 7.1s / docgen 2.7s; law-domain audit 8.4s / docgen 9.4s.

Receipts in ignored packet `raw/`:

- `cheap-gates.log`: initial full collected failure.
- `cheap-effect-markdown-rerun.log`: passing specific markdown command.
- `cheap-fallow-audit-rerun.log`: first remediation audit, two findings remain.
- `cheap-fallow-audit-rerun-2.log`: passing final audit, introduced 0, inherited-adjacent 1.
- `cheap-fallow-health-rerun.log`: first remediation health, two findings remain.
- `cheap-fallow-health-rerun-2.log`: final health rerun.
- `cloud-proof-verify-{doc-text,law-domain}-final-2.log`: final package reruns.

Recovery for the generated docs cache: move the preserved directory back to
`scratchpad/.jsdoc-loop/generated-docs`; doing so restores the local stale
markdown scan failures until that historical output is regenerated.
