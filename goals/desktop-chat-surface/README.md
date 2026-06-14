# Desktop Chat Surface

## Status

Lifecycle: `active` (blocked until `rich-text-foundation` and
`workspace-thread-domain` close)

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Ship the control plane's command surface E2E in `apps/professional-desktop`:
streamed block turns, edit-as-branch, cancel-in-flight, PGlite persistence,
UsageRecord capture — agents-slice turn kernel serving both the Anthropic
streaming implementation and the deterministic fixture agent.

Graduated from
[`explorations/agent-chat-interface`](../../explorations/agent-chat-interface/README.md).

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/desktop-chat-surface/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`research/`](./research/) - supporting research, if present.
6. [`history/`](./history/) - evidence and closeouts, if present.

## Current Phase

Blocked — do not start until both dependency packets close. Then P0
Research: proof-repo kernel/atoms/packaging read-through.

## Latest Evidence

Not started.

## Notes

- Named follow-ons after this packet (from the exploration MAP):
  `acp-chat-binding`, `proposal-blocks`, attachment/table blocks,
  `thread-pdf-export`.
- Branch UX is Claude-style version selector; the LibreChat fork-tree is a
  documented anti-pattern (see exploration RESEARCH.md).
