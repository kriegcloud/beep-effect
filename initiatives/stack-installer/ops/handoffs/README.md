# Stack Installer Handoffs

This directory holds agent-operable handoff material for the stack installer
initiative.

## Handoffs

- [HANDOFF_P0_BOOTSTRAP.md](./HANDOFF_P0_BOOTSTRAP.md) - archived bootstrap
  prompt that created the packet.
- [HANDOFF_P1_DISCORD_MANUAL.md](./HANDOFF_P1_DISCORD_MANUAL.md) - P1
  Discord vertical, Manual Mode runbook plus post-proof PR readiness review
  gate.
- [HANDOFF_P2_AI_MODE.md](./HANDOFF_P2_AI_MODE.md) - P2 AI Mode parity stub.
- [HANDOFF_P3_RECOVERY.md](./HANDOFF_P3_RECOVERY.md) - P3 recovery proof
  stub.
- [HANDOFF_P4_PORTABILITY.md](./HANDOFF_P4_PORTABILITY.md) - P4 portability
  proof stub.
- [HANDOFF_FRESH_REVIEW.md](./HANDOFF_FRESH_REVIEW.md) - fresh-eyes review
  stub before continuing a later phase.
- [HANDOFF_V1_RELEASE.md](./HANDOFF_V1_RELEASE.md) - P5 distribution and V1
  release stub.

## Operating Rule

Every implementation session should read `../manifest.json`, `../../SPEC.md`,
and `../../PLAN.md` first. Phase outputs belong under `history/outputs/`; do
not let generated notes accumulate at the initiative root.

## Proof Transfer Helper

- [../proof-upload-server.mjs](../proof-upload-server.mjs) - temporary
  token-gated tailnet upload receiver for P1 proof bundles when Taildrop is
  unavailable. It accepts only the approved macOS and Windows bundle names and
  logs upload outcomes with tokens redacted.
- [../start-proof-upload-window.mjs](../start-proof-upload-window.mjs) -
  coordinator helper that rotates a private upload token, writes ignored
  operator commands, and starts the proof upload server.
- [../start-proof-watch-window.mjs](../start-proof-watch-window.mjs) -
  coordinator helper that starts a detached private-log `p1:proof:watch`
  process for long transfer windows.
- [../proof-upload-status.mjs](../proof-upload-status.mjs) - coordinator
  status helper for upload server health, file permissions, returned bundles,
  platform artifact directories, detached watcher state, and token-leak
  indicators.
