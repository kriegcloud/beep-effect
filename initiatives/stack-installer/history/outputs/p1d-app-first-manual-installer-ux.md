# P1D App-First Manual Installer UX

Status: completed on Linux.

This file records the completed Linux-first `P1D` proof after the `P1C`
closure pass. Full P1 remains open until the real Windows proof is returned
and audited, but the app-first Bun repair milestone is now complete.

P1D for this milestone is intentionally repair-only:

- the Tauri app was the primary operator surface
- the Linux-first proof target was an existing Bun install that was present but
  older than the required version
- the real host mutation was approval-first Bun repair via `bun upgrade`
- the required Bun version is owned by installer configuration, not app-local
  repo metadata reads
- the proof record captures the before/after validation state, the app-first
  flow, and the visible repair result

## Observed Before State

- Repo-required Bun version: `1.3.14`
- Detected Bun version before repair: `1.3.11`
- App state before repair: `repair-required`
- Repair action: explicit operator click on `Approve Repair` in the Tauri app

## Real Mutation

- The Tauri window called the installer-owned repair flow rather than app-local
  shell glue.
- The repair request required explicit approval.
- The executed repair command was `bun upgrade`.

## Observed After State

- `bun --version` now reports `1.3.14`
- `.bun-version` resolves to `1.3.14`
- `package.json` `packageManager` resolves to `bun@1.3.14`
- The same app validation spine now reports `healthy`

## UX Result

- While repair is running, the primary action switches to `Repairing Bun`.
- The app shows `Repair in progress` immediately after approval.
- After repair succeeds, the action switches to `Already Healthy`.
- The healthy state explains that no repair action is available because Bun now
  satisfies the required version.

## Verification

- `bun run --filter @beep/stack-installer test`
- `bun run --filter @beep/stack-installer check`
- `cd apps/stack-installer && bun run build`
- `cd apps/stack-installer/src-tauri && cargo check`
