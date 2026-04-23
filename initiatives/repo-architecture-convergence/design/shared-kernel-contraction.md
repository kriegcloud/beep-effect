# Shared-Kernel Contraction

## Goal

Bring `packages/shared/*` back into alignment with the DDD shared-kernel rules
in the architecture standard.

## Current Risk

The checked-in repo already shows the failure mode the standard warns about:

- `shared/server` is technical Effect/Drizzle integration
- `shared/tables` is SQLite/Drizzle-oriented table substrate
- `shared/client` and `shared/ui` are placeholders with almost no durable
  shared-kernel behavior
- `shared/providers/firecrawl` is a driver in all but name

That makes `shared` ambiguous. Once `shared` is ambiguous, every later slice
decision gets harder and temporary migration exceptions start to look normal.

## Retention Rules

The default retained shared-kernel homes are:

- `shared/domain`
- `shared/config`

`shared/use-cases` is a high-bar exception only. It is allowed solely for a
narrow cross-slice sidecar control-plane contract if `repo-memory` and `editor`
both still need that contract after the protocol split.

Everything else needs deletion or extraction.

## Committed Decisions

| Current package | Decision | Committed destination |
|---|---|---|
| `shared/domain` | retain only deliberate shared-kernel language | stay in `packages/shared/domain`; move generic helpers to `foundation/*` |
| `shared/config` | retain only shared config vocabulary and canonical subpaths | stay in `packages/shared/config` |
| `shared/use-cases` | provisional keep only for the split `runtime/protocol` control-plane subset | `packages/shared/use-cases` publishing `@beep/shared-use-cases/public`; no broader exception is pre-approved |
| `shared/server` | delete after extraction | `packages/drivers/drizzle` |
| `shared/tables` | delete after split audit | `packages/drivers/drizzle` first; `packages/foundation/modeling/table-modeling` only for proven engine-neutral survivors |
| `shared/client` | default delete | no retained shared-kernel package unless new evidence appears |
| `shared/ui` | default delete | no retained shared-kernel package unless new evidence appears |
| `shared/providers/firecrawl` | move out of shared | `packages/drivers/firecrawl` |

## `shared/use-cases` Guardrail

If `shared/use-cases` survives, it stays narrow:

- allowed: shared bootstrap payloads, shared control-plane DTOs, shared
  boundary errors, and shared client-safe facade contracts
- forbidden: repo-memory run contracts, editor-specific document contracts,
  driver imports, live layers, workflows, process managers, schedulers, or
  generic technical substrate

This means `shared/use-cases` is not a new horizontal runtime family. It is a
small shared contract package or it does not exist.

## Pre-Slice Closures

The following close before slice implementation begins:

1. `shared/server -> drivers/drizzle`
2. `shared/tables -> drivers/drizzle` with a named extraction target for any
   engine-neutral survivors
3. `shared/client` and `shared/ui` default-delete status
4. `shared/providers/firecrawl -> drivers/firecrawl`

## Post-Slice Confirmation

The final `shared/use-cases` verdict waits until after `repo-memory` and
`editor` both cut over. At that point the program must choose one of two
outcomes:

1. retain `packages/shared/use-cases` because a narrow shared sidecar
   control-plane contract is still real and still architecture-legal
2. delete `packages/shared/use-cases` because the remaining contracts are now
   slice-owned

No third option is allowed. The shared kernel does not keep a speculative
`use-cases` package "just in case."

## Exit Condition

This design area is complete when `shared` is once again legible as deliberate
shared-kernel language rather than a compatibility bucket for technical code,
placeholders, or legacy roots.
