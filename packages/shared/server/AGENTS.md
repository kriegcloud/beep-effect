# @beep/server Agent Guide

## Purpose & Fit

- Shared-kernel server boundary for cross-slice product semantics that must
  remain server-only and driver-neutral.
- This package is currently scaffolded around `VERSION`; new exports must not
  make shared a runtime or adapter bucket.

## Surface Map

| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | `VERSION` | Current package entry point. |
| future server modules | server-only shared product helpers | No drivers, concrete adapters, or global Layers. |

## Add Here

- Server-only shared product helpers and contracts that are intentionally shared
  across slices and cannot live in a client-safe contract surface.

## Keep Out

- Driver-backed repositories, external SDK wrappers, handlers, transports,
  workflows, schedulers, process managers, global Layers, and slice-private
  server behavior.

## Laws

- Do not import drivers or product slices.
- Do not aggregate many slices into one runtime surface.
- Keep live implementations in concrete slice server packages unless the shared
  product contract genuinely requires a shared server-only helper.

## Verifications

- `bunx turbo run check --filter=@beep/server`
- `bunx turbo run test --filter=@beep/server`
- `bunx turbo run lint --filter=@beep/server`
