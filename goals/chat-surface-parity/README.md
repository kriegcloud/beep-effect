# Chat Surface Parity

## Status

Lifecycle: `planned` — ready for a `/goal` session. Dependency
`goals/desktop-chat-surface` is closed (`completed-retained`), so this packet is
unblocked.

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Bring `apps/professional-desktop`'s chat surface to **full feature parity** with
the `effect-lexical-chat` POC. The prior `desktop-chat-surface` packet shipped
the surface (atoms, turn kernel, `ChatRpcs`, PGlite persistence) but a POC→port
audit found three buckets of dropped parity:

1. **Observability/devtooling/UX** — sidecar Effect DevTools, app
   `RegistryProvider`, error toasts, turn-lifecycle metrics, title derivation,
   a provisioned Grafana dashboard.
2. **Block validation + repair loop** — invalid streamed blocks are repaired
   (Haiku) instead of silently dropped.
3. **Rich blocks** — mermaid (as `Pre[language="mermaid"]`), tables, and youtube
   embeds, end-to-end through `@beep/md` + `@beep/editor`.

The atom architecture (`AtomRpc`/`Atom.family`/`runtime.fn`) is **already at
parity** — our `Chat.atoms.ts` is a near-verbatim port of the POC. This packet
does not redo it.

Graduated from
[`explorations/agent-chat-interface`](../../explorations/agent-chat-interface/README.md);
extends the closed
[`goals/desktop-chat-surface`](../desktop-chat-surface/README.md). Tables were a
named follow-on in that exploration's MAP.

## Launch

```text
/goal follow the instructions in goals/chat-surface-parity/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` is the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) — compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) — normative source of truth.
3. [`PLAN.md`](./PLAN.md) — phased execution plan (P0–P4) + file touch-points.
4. [`research/2026-06-15-poc-parity-audit.md`](./research/2026-06-15-poc-parity-audit.md)
   — the classified POC→port divergence audit (evidence to start from).
5. [`ops/manifest.json`](./ops/manifest.json) — machine-readable routing.

## Scope Summary

- **In:** the three buckets above, across `apps/professional-desktop`,
  `packages/agents/*`, `packages/drivers/anthropic`, and the foundation
  `modeling/md` + `modeling/lexical` + `ui-system/editor` packages.
- **Out / preserve (must not revert):** `@beep/md` Document model, turn-grouped
  timeline, PGlite, fixture/anthropic kernel split, `ChatActionError` boundary,
  runtime-origin OTLP detection, and the **no-partial-row-on-cancel** contract.
  Keep our extras the POC lacks (`CostRollup`, version selector, `UsageRecord`).

## Locked Decisions

- **Mermaid** = the existing `@beep/md` `Pre` code node with
  `language="mermaid"` (no new foundation node), rendered by a language-aware
  `@beep/editor` decorator.
- **Partial persist** = keep ours (no partial assistant row on cancel/error).

## Doctrine Risk

Adding table/youtube nodes to `@beep/md` and `@beep/editor` changes a **shared
foundation contract** consumed by other surfaces (e.g. `apps/oip-web`). Treat
these as foundation additions with round-trip + JSON-boundary tests, and verify
no regression in other editor consumers. Mermaid avoids this (reuses `Pre`).

## Outcome

TBD — populated at P4 close by the implementing session.

## Notes

- Phases are independently shippable; P1 (obs/UX) is low-risk and can land as its
  own PR before P2 (repair) and P3 (rich blocks).
- Run the real CI lanes + `bun run beep yeet verify` BEFORE the PR (lesson from
  the `desktop-chat-surface` closeout: per-package green ≠ aggregate CI green).
- Named follow-ons after this packet (from the exploration MAP):
  `acp-chat-binding`, `proposal-blocks`, `thread-pdf-export`.
