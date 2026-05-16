# Handoff P1D - App-First Manual Installer UX

Status: completed; next action is Windows proof resume.

## Outcome

The Tauri app became the primary operator surface for the Linux-first `P1D`
proof and completed one real Bun repair action for an existing Bun install
owned by `installer-dependencies`.

## Proof Summary

- Read `../../SPEC.md`.
- Read `../../PLAN.md`.
- Read `../manifest.json`.
- Read `../../history/outputs/p1d-app-first-manual-installer-ux.md`.

Observed proof facts:

- before repair: detected Bun `1.3.11`
- required version: `1.3.14`
- mutation: approval-first `bun upgrade`
- after repair: Bun `1.3.14`
- UI polish landed for both running and already-healthy states

## Next Initiative Step

Resume the remaining Windows proof debt before starting `P2`.

Recommended route:

1. Recreate the local fresh Windows VM from the preserved ISO cache.
2. Resume from `../../history/outputs/p1-pause-handoff-2026-05-14.md`.
3. Run `../../ops/handoffs/HANDOFF_P1_DISCORD_MANUAL.md`.
4. Intake and audit the returned Windows bundle.

## Guardrails Still In Force

- Do not treat completed `P1D` as full `P1` closure.
- Do not start `P2` until the real Windows proof artifact is returned and
  audited.
- Do not re-broaden this milestone into first-time Bun bootstrap.
