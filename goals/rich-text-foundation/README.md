# Rich Text Foundation

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Give the repo one canonical rich-text pipeline as foundation substrate:
`@beep/md` AST ↔ `@beep/lexical-schema` (schema-first Lexical serialized
state + codecs) ↔ `@beep/editor` (React editor kit). Prerequisite packet for
`desktop-chat-surface`.

Graduated from
[`explorations/agent-chat-interface`](../../explorations/agent-chat-interface/README.md).

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/rich-text-foundation/GOAL.md
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

P2 Verify → P3 Close — both packages landed (`@beep/lexical-schema`,
`@beep/editor`), the codec lossiness profile is locked and documented, and
the storybook fixture-turn proof passes; full repo quality gates running.

## Latest Evidence

[`history/2026-06-12-implementation-evidence.md`](./history/2026-06-12-implementation-evidence.md)
— schema tests 12/12, dtslint 32/32 vs lexical 0.45, headless editor
round-trip 1/1, storybook play tests 464/464 incl.
`Editor/EditorViewer > Assistant Turn` (chromium).

## Notes

- The `@beep/md` move to `packages/foundation/modeling/md` already landed
  (PR #240) — cite it, don't redo it.
- Sibling packet `workspace-thread-domain` is independent; both feed
  `desktop-chat-surface`.
