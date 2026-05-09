# JSDoc Quality Enforcement

## Status

V1 implemented; P5 enforcement-readiness eval complete

## Overview

This initiative improves repo enforcement and agent alignment around useful
JSDoc on exported symbols, especially meaningful `@example` tags.

V1 adds a report-only `beep docgen quality` workflow owned by `@beep/repo-cli`.
It extracts deterministic quality subjects with `@beep/repo-docgen` parsing and
required-tag policy, enriches them with source-file ts-morph evidence and
`@beep/repo-utils` content hashing, scores the whole JSDoc block with typed
findings, and emits bounded advisory Codex remediation packets. Diagnostics and
related-symbol fields are reserved for follow-up enrichment when unavailable.
The command is not a blocking gate.

## Read This First

- [SPEC.md](./SPEC.md) - canonical bootstrap contract
- [PLAN.md](./PLAN.md) - implementation posture and follow-up plan
- [research/](./research) - synthesized research reports from agents
- [history/outputs/](./history/outputs) - preserved raw or generated outputs
- [ops/manifest.json](./ops/manifest.json) - machine-readable packet index

## Operating Rules

- Treat V1 quality findings as advisory report output only.
- Do not add blocking enforcement until the P6 hardening items from
  [research/enforcement-readiness-eval.md](./research/enforcement-readiness-eval.md)
  are resolved.
- Keep `@example` universal for exported symbols; do not invent exception
  categories in remediation work.
- Place curated future evaluation reports in `research/`.
- Place raw agent outputs, transcripts, or generated evidence in
  `history/outputs/` only when they need to be preserved.
- Promote any durable repo decision into the relevant standard, package doc,
  skill, pattern, or future implementation spec rather than treating this
  packet as permanent doctrine.
