# Handoff P2 - AI Mode Parity

Status: stub.

## Mission

Implement AI Mode parity across Claude and Codex using the same manifest,
validation spine, approval UI, and slice-owned verb registry contracts as P1.
Do not start this handoff until P1D app-first Manual Installer UX is complete.

## Required Startup

- Read `../../SPEC.md`.
- Read `../../PLAN.md`.
- Read `../manifest.json`.
- Read `../../history/outputs/p0-current-state.md`.
- Read `../../history/outputs/p1-discord-vertical-manual.md`.

## Stop Conditions

- Stop if Claude and Codex diverge in user-facing flow.
- Stop if AI Mode writes a different manifest shape than Manual Mode.
- Stop if MCP executor code moves out of `apps/stack-installer` runtime
  adapter ownership.
- Stop if skill or consent copy is not generated from registry source.

Full prompt to be authored when P1 closes.
