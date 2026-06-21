# Chat Input & Green Workbench Theming

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Give `apps/professional-desktop` a green "workbench" light/dark theme (with a
persisted toggle and the existing `@beep/ui` green orb glow) and a lobehub-style,
feature-flagged Lexical chat input (fixed formatting toolbar, `/` commands, `@`
mentions, attachments, plain-Enter-to-send), with the placeholder/cursor bug
fixed — generic mechanism in `@beep/editor`, product meaning injected by the app.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/chat-input-and-theming/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
5. [`research/`](./research/) - reference reports, deep-research, Chrome map,
   palette, and the original seed brief under [`research/seed/`](./research/seed/).
6. [`history/`](./history/) - evidence and closeouts, if present.

## Current Phase

P0 Research **complete** — `research/` holds the reference reports
(`references/`), the green-workbench `palette.md`, the live `chrome-feature-map.md`,
and the adversarially-verified `deep-research-lexical-chat-composer.md`. Next
concrete action: begin P1 implementation per `PLAN.md` (run via the `/goal`
launcher).

## Latest Evidence

P0 research corpus under [`research/`](./research/) — notably
[`deep-research-lexical-chat-composer.md`](./research/deep-research-lexical-chat-composer.md)
(24/25 claims verified) and [`palette.md`](./research/palette.md). Implementation
evidence: `Not started`.

## Notes

- **Seed:** `research/seed/USER_PROMPT_INITIAL.md` (+ `assets/` PNGs) is the
  original user brief, graduated out of `goals/chat-surface-parity/research/`.
- **Upstream exploration:** `explorations/agent-chat-interface` (locked the
  "build custom, `@lobehub/editor` is reference-only" decision).
- **Sibling completed packets (do not re-open):** `rich-text-foundation`
  (`@beep/editor` + `@beep/lexical-schema`), `desktop-chat-surface` (chat
  substrate/atoms), `chat-surface-parity` (block render/stream/viewer).
- **Closest prior art to port from:** `~/YeeBois/projects/effect-lexical-chat`
  (Atom.family keyed by `LexicalEditor`; draft `Atom.kvs`). Live deploy is a
  behavioral/visual reference.
- **Theme references:** trustgraph `workbench-ui` port + `palette.json`
  (green dark); `apps/oip-web` (parchment light).
