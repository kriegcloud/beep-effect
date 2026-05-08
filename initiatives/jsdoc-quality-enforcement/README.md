# JSDoc Quality Enforcement

## Status

Bootstrap

## Overview

This initiative is a research-first packet for improving repo enforcement and
agent alignment around useful JSDoc on exported symbols, especially meaningful
`@example` tags.

The packet exists to collect synthesized research before committing to an
implementation plan. It should not be treated as approval to build the proposed
agentic scoring or remediation pipeline yet.

## Read This First

- [SPEC.md](./SPEC.md) - canonical bootstrap contract
- [PLAN.md](./PLAN.md) - current research posture
- [research/](./research) - synthesized research reports from agents
- [history/outputs/](./history/outputs) - preserved raw or generated outputs
- [ops/manifest.json](./ops/manifest.json) - machine-readable packet index

## Operating Rules

- Keep implementation details provisional until research is synthesized.
- Place curated research reports in `research/`.
- Place raw agent outputs, transcripts, or generated evidence in
  `history/outputs/` only when they need to be preserved.
- Promote any durable repo decision into the relevant standard, package doc,
  skill, pattern, or future implementation spec rather than treating this
  packet as permanent doctrine.
