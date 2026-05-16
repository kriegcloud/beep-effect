# P1D App-First Manual Installer UX

Status: pending.

This file records evidence for the active next execution lane after the P1C
closure pass. Full P1 remains open until the real Windows proof is returned and
audited, but P1D now proceeds as the next milestone on Linux.

P1D for this milestone is intentionally repair-only:

- the Tauri app is the primary operator surface
- the Linux-first proof target is an existing Bun install that is present but
  older than the required version
- the real host mutation is approval-first Bun repair via `bun upgrade`
- the required Bun version is owned by installer configuration, not app-local
  repo metadata reads
- proof artifacts must capture before/after validation, the app-first flow,
  and the visible repair result
