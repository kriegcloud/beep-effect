# @beep/client Agent Guide

## Purpose & Fit

- Shared-kernel client boundary for browser-safe adapters, state, and service
  contracts shared across slices.
- This package is currently scaffolded around `VERSION`; new exports must be
  browser-safe and tied to shared product semantics.

## Surface Map

| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | `VERSION` | Current package entry point. |
| future client modules | services, atoms, state machines, form models | Browser-safe shared product behavior only. |

## Add Here

- Browser-safe shared client services, state machines, atoms, form models, and
  adapters over shared use-case public contracts.

## Keep Out

- Server config, secrets, server-only facades, live Layers, direct driver
  imports, runtime infrastructure, product-agnostic UI primitives, and
  slice-private client behavior.

## Laws

- Import shared use-case contracts only through client-safe/public surfaces when
  those surfaces exist.
- Import shared config only through `/public` when config subpaths exist.
- Keep UI behavior behind client services/state rather than direct use-case
  orchestration.

## Verifications

- `bunx turbo run check --filter=@beep/client`
- `bunx turbo run test --filter=@beep/client`
- `bunx turbo run lint --filter=@beep/client`
