# Stack Installer

## Status

Active

## Overview

This initiative defines the AI Stack installer and manager for non-technical
lawyers and financial advisors who want Claude or Codex working safely on a
fresh machine without learning terminal workflows. The product is both a
first-run setup flow and an ongoing manager for repair, channel-add, credential
rotation, and validation.

V1 is intentionally narrow: macOS and Windows parity, Linux best-effort, one
Discord channel, subscription-first provider auth, 1Password as the secret bus,
and an approval-first UI. The terminal remains plumbing; the daily-driver
surface is Claude Desktop or Codex Desktop plus one OpenClaw channel as a
secondary path.

P0 creates the initiative packet only. Tauri code, installer slice packages,
verb registry implementation, MCP execution, skill generation, and product UI
remain future phase work.

## Read This First

- [SPEC.md](./SPEC.md) - authoritative contract
- [PLAN.md](./PLAN.md) - phase plan and gate criteria
- [ops/manifest.json](./ops/manifest.json) - machine-readable phase, surface,
  and proof tracking
- [ops/handoffs](./ops/handoffs) - agent-operable handoffs
- [history/outputs/p0-current-state.md](./history/outputs/p0-current-state.md)
  - completed P0 decision record and dependency inventory
- [research/README.md](./research/README.md) - research index
- [research/verb-registry-schema-sketch.md](./research/verb-registry-schema-sketch.md)
  - future registry schema questions
- [research/tauri-2-architecture.md](./research/tauri-2-architecture.md) -
  future Tauri 2 app-shell research

## Current Progress

- P0 is complete: the packet exists, locked decisions are recorded, the
  corrected installer slice topology is named, and the manifest points to P1.
- P1 is pending: Discord vertical, Manual Mode, with fresh-OS proof on macOS
  and Windows.
- P2 is pending: AI Mode parity across Claude and Codex with byte-identical
  manifest output modulo timestamps.
- P3 is pending: recovery proof from salted-broken-state machines.
- P4 is pending: portability proof from exported manifest on Machine A to
  imported validator suite on Machine B.
- P5 is pending: distribution readiness with signed binaries, updates,
  opt-in telemetry, crash reporting, feedback, and target CI.

## Completion Standard

This initiative is done only when all are true:

- [ ] P1 Discord Manual Mode fresh-OS macOS proof is recorded.
- [ ] P1 Discord Manual Mode fresh-OS Windows proof is recorded.
- [ ] P2 AI Mode parity is recorded for Claude and Codex with a
  byte-identical-manifest gate modulo timestamps.
- [ ] P3 recovery scenarios prove repair for wrong Node version, invalid
  Discord token, and missing 1Password reference.
- [ ] P4 portability proves macOS export to Windows-WSL import with validators
  green without re-running setup.
- [ ] P5 distribution readiness proves signed macOS and Windows binaries,
  auto-update, opt-in telemetry, crash reporting, feedback, and CI builds.
