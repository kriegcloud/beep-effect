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
| P6 | Complete | Harden before any enforcement. | Schema v2 package status, bounded JSON/report runtime, re-export/type-only policy, capped packets |

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

## P6 Hardening Changes

- Bumped quality reports to schema v2 with package status, duration, timeout,
  error, and omitted-packet metadata.
- Kept re-export declarations as export graph edges instead of
  symbol-quality subjects.
- Accepted type-level evidence as useful `@example` content for type-only
  exports while still flagging value examples that only silence results.
- Ranked and capped Codex advisory remediation packets at 25 per run by
  default, with `--packet-limit` for explicit overrides.
- Bounded large JSON report rendering so schema-heavy packages emit reports
  instead of stalling in pretty-formatting.

## Future Work

- Run a post-P6 report sample before proposing any blocking threshold.
- Consider package opt-in warning mode before changed-files-only blocking after
  P6 hardening proves stable signal in routine use.
- Decide whether advisory packets should grow into guided Codex remediation
  execution after capped packet batches are reviewed in real remediation work.
- Revisit local/Qwen workers only behind an eval-only mode with measured
  precision and cost.
