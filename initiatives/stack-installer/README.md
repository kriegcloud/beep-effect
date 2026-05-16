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

P0 created the initiative packet only. P1A added the runnable dry-run spine:
package contracts, deterministic manifest snapshot, `@beep/ui` web shell, and
a minimal Tauri 2 bridge. The P1 live Manual Mode harness is now implemented:
driver packages validate 1Password, provider auth, host commands, and Discord
liveness, and the app exposes Tauri and CLI proof capture commands. Fresh-OS
macOS and Windows proof artifacts plus a post-proof PR readiness review are
still required before P1 can close.

## Read This First

- [SPEC.md](./SPEC.md) - authoritative contract
- [PLAN.md](./PLAN.md) - phase plan and gate criteria
- [ops/manifest.json](./ops/manifest.json) - machine-readable phase, surface,
  and proof tracking
- [ops/handoffs](./ops/handoffs) - agent-operable handoffs
- [history/outputs/p0-current-state.md](./history/outputs/p0-current-state.md)
  - completed P0 decision record and dependency inventory
- [history/outputs/p1a-runnable-spine.md](./history/outputs/p1a-runnable-spine.md)
  - P1A dry-run package/app proof
- [history/outputs/p1-discord-vertical-manual.md](./history/outputs/p1-discord-vertical-manual.md)
  - P1 live harness status and remaining fresh-machine proof
- [history/outputs/p1-completion-audit.md](./history/outputs/p1-completion-audit.md)
  - current prompt-to-artifact completion audit for the active P1 goal
- [history/outputs/p1-pr-readiness-review.md](./history/outputs/p1-pr-readiness-review.md)
  - pending post-proof quality review and fix-loop record
- [ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md](./ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md)
  - user-operated macOS and Windows proof runbook
- [ops/handoffs/GOAL_P1_MACOS_PROOF.md](./ops/handoffs/GOAL_P1_MACOS_PROOF.md)
  - short `/goal` indirection target for the buddy MacBook Pro proof run
- [research/README.md](./research/README.md) - research index
- [research/verb-registry-schema-sketch.md](./research/verb-registry-schema-sketch.md)
  - future registry schema questions
- [research/tauri-2-architecture.md](./research/tauri-2-architecture.md) -
  future Tauri 2 app-shell research

## Current Progress

- P0 is complete: the packet exists, locked decisions are recorded, the
  corrected installer slice topology is named, and the manifest points to P1.
- P1A is complete: the dry-run package spine and Stack Installer web shell
  exist, validate 1Password-reference-only inputs, compose slice-owned verb
  contracts, and render a deterministic manifest preview.
- P1 live harness is implemented: app-local proof composition, Tauri command,
  CLI artifact capture/audit, and live driver-backed validators exist. P1
  remains open until fresh-OS proof on macOS and Windows is recorded and the
  PR readiness review/fix loop returns zero required blockers or explicit
  waivers.
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
- [ ] P1 PR readiness review/fix loop is recorded with zero required blockers
  or explicit waivers.
- [ ] P2 AI Mode parity is recorded for Claude and Codex with a
  byte-identical-manifest gate modulo timestamps.
- [ ] P3 recovery scenarios prove repair for wrong Node version, invalid
  Discord token, and missing 1Password reference.
- [ ] P4 portability proves macOS export to Windows-WSL import with validators
  green without re-running setup.
- [ ] P5 distribution readiness proves signed macOS and Windows binaries,
  auto-update, opt-in telemetry, crash reporting, feedback, and CI builds.
