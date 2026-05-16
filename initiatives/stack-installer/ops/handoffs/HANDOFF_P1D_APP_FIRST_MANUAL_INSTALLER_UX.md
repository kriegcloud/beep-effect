# Handoff P1D - App-First Manual Installer UX

Status: stub.

## Mission

Make the Tauri app the primary operator surface for the next milestone and
prove one real dependency repair action end to end.

For this milestone, the first real action is Linux-first Bun repair for an
existing Bun install owned by `installer-dependencies`.

## Required Startup

- Read `../../SPEC.md`.
- Read `../../PLAN.md`.
- Read `../manifest.json`.
- Read `../../history/outputs/p1-pr-readiness-review.md`.
- Read `../../history/outputs/p1-completion-audit.md`.

## Scope Guardrails

- Keep the mutation owned by installer slice contracts and server
  implementation, not app-local shell glue.
- Keep the required Bun version in installer-owned config, not app-local
  repo metadata reads.
- Keep the UX approval-first.
- Keep this milestone Linux-first for proof staging.
- Do not broaden this milestone into first-time Bun bootstrap.
- Do not start P2 AI Mode work from this handoff.

Full prompt to be authored in the dedicated P1D implementation lane.
