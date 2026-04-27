# @beep/use-cases Agent Guide

## Purpose & Fit

- Contract-only shared-kernel application surface for cross-slice commands,
  queries, DTOs, ports, facades, protocols, and actionable application errors.
- This package is currently scaffolded around `VERSION`; new exports must remain
  driver-neutral contracts.

## Surface Map

| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | `VERSION` | Current package entry point. |
| future `/public` | commands, queries, DTOs, protocols, client-safe errors | Browser-safe contract surface. |
| future `/server` | product ports and server-only facades | No implementations or live Layers. |
| future `/test` | fixtures and test helpers | Contract testing only. |

## Add Here

- Cross-slice commands, queries, DTOs, protocol declarations, product ports,
  facade contracts, and actionable application errors.

## Keep Out

- Workflows, process managers, schedulers, handlers, concrete adapters,
  transports, command clients, persistence, driver imports, and live Layers.

## Laws

- Keep `/public` browser-safe.
- Keep `/server` server-only but contract-only.
- Put live implementations in the owning slice's server or client boundary, not
  this package.

## Verifications

- `bunx turbo run check --filter=@beep/use-cases`
- `bunx turbo run test --filter=@beep/use-cases`
- `bunx turbo run lint --filter=@beep/use-cases`
