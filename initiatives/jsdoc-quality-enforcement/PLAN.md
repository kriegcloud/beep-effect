# JSDoc Quality Enforcement Plan

## Current Plan

V1 is implemented as a report-only quality workflow:

- `@beep/repo-cli` owns `beep docgen quality`, scope selection, report writing,
  and advisory remediation packets.
- `@beep/repo-docgen` remains deterministic and supplies parsing and required
  documentation policy.
- Source-file ts-morph evidence and `@beep/repo-utils/TSMorph` content hashing
  enrich review subjects after package and source selection; diagnostics and
  related-symbol fields are present in the schema but remain follow-up
  enrichment when unavailable.
- `.patterns/jsdoc-documentation.md` and all `jsdoc-annotation-specialist`
  skill copies carry the whole-block usefulness and universal `@example`
  policy.
- [ops/manifest.json](./ops/manifest.json) remains the machine-readable packet
  index.

## Phase Posture

| Phase | Status | Purpose | Output |
|---|---|---|---|
| P0 | Complete | Bootstrap initiative packet. | `README.md`, `SPEC.md`, `PLAN.md`, `research/`, `history/outputs/`, `ops/manifest.json` |
| P1 | Complete | Run parallel research lanes. | Curated reports in `research/` |
| P2 | Complete | Synthesize cross-lane findings. | `research/synthesis-and-recommendations.md` |
| P3 | Complete | Challenge the implementation direction. | `grill-with-docs` decision plan |
| P4 | Complete | Implement report-only V1 quality workflow. | `beep docgen quality`, tests, guidance updates |
| P5 | Complete | Evaluate enforcement readiness. | `research/enforcement-readiness-eval.md`, compact summary artifact |
| P6 | Pending | Harden before any enforcement. | Runtime bounds, re-export policy, type-only example policy, opt-in warning proposal |

## V1 Implementation Changes

- Added a `Docgen/internal/Quality` subsystem with quality scope modes,
  score modes, subject evidence, reviews, summaries, JSON/Markdown rendering,
  and remediation packet output.
- Added `beep docgen quality` with `--package`, `--changed-files`, `--all`,
  `--json`, `--score codex`, and `--output`.
- Added focused `@beep/repo-cli` tests for rich subject extraction, advisory
  findings, report rendering, remediation packets, and report-only command
  behavior.
- Updated JSDoc pattern and skill guidance to reject low-value examples such as
  result-silencing examples.

## Future Work

- Bound package-local report runtime before proposing any blocking threshold.
- Decide re-export/barrel documentation policy before gating namespace export
  findings.
- Decide type-only example usefulness policy before gating observable-result
  findings on type exports.
- Decide whether advisory packets should grow into guided Codex remediation
  execution after packet sizing and prioritization are improved.
- Revisit local/Qwen workers only behind an eval-only mode with measured
  precision and cost.
- Consider package opt-in warning mode before changed-files-only blocking after
  P6 hardening proves stable signal.
