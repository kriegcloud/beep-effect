# @beep/config Agent Guide

## Purpose & Fit

- Shared-kernel typed config contracts and vocabulary deliberately agreed on
  across slices.
- This package is currently scaffolded around `VERSION`; add config surfaces
  only when multiple slices share the same configuration semantics.

## Surface Map

| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | `VERSION` | Current package entry point. |
| future `/public` | browser-safe config contracts | Client-safe only. |
| future `/server` and `/secrets` | server-only config contracts | Keep secrets redacted and off browser-safe surfaces. |
| future `/layer` and `/test` | config resolution and fixtures | Server/runtime or test-only. |

## Add Here

- Shared Effect `Config` declarations, schemas, services, key namespaces, and
  defaults tied to those declarations.
- Shared public, server, secret, layer, and test config surfaces when they have
  real content.

## Keep Out

- Global config registries, driver config, broad constants, environment-only
  helpers, product ports, and domain behavior.

## Laws

- Client code may consume only `/public` config surfaces.
- Config may reuse shared domain vocabulary; domain must never import config or
  read from `ConfigProvider`.
- Required subpaths are names to use when the role exists, not placeholder files.

## Verifications

- `bunx turbo run check --filter=@beep/config`
- `bunx turbo run test --filter=@beep/config`
- `bunx turbo run lint --filter=@beep/config`
