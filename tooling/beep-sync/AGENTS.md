# @beep/beep-sync Agent Guide

## Purpose and Fit
- Scaffold for unified AI tooling sync runtime and POC fixtures.

## Surface Map
| Module | Key exports | Notes |
| --- | --- | --- |
| `src/index.ts` | `scaffoldVersion`, runtime helpers | Shared runtime helpers and fixture operations |
| `src/bin.ts` | `beep-sync` CLI entry | Command dispatch and CLI output contract |

## Authoring Guardrails
- Follow repository root AGENTS instructions first.
- Keep this package deterministic for fixture-driven behavior and outputs.
- Prefer adding fixture-driven tests before broad runtime rewrites.
- Use Effect-first APIs and avoid ad-hoc native helpers when Effect equivalents exist.

## Verifications
- `bun run check`
- `bun run test`
- `bun run lint`
