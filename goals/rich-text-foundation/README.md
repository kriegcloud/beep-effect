# Rich Text Foundation

## Status

Lifecycle: `completed-retained`

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

Complete. Both packages landed (`@beep/lexical-schema`, `@beep/editor`), the
codec lossiness profile is locked and documented, the Storybook fixture-turn
proof passes, and full Yeet verification is green.

## Latest Evidence

[`history/2026-06-13-verification-closeout.md`](./history/2026-06-13-verification-closeout.md)
- `bun run beep yeet verify` succeeded; verdict
`.beep/yeet/runs/beep_editor-15abc31b98cb/verdict.json` records
`fallow-advisory-feedback` and `full:pre-push` passed. Direct Storybook browser
proof also passed for `editor-viewer` and `editor-composer`.

Implementation details remain in
[`history/2026-06-12-implementation-evidence.md`](./history/2026-06-12-implementation-evidence.md):
schema tests 14/14, dtslint 32/32 vs Lexical 0.45, headless editor round-trip
1/1, and Storybook assistant-turn proof in Chromium.

## Notes

- The `@beep/md` move to `packages/foundation/modeling/md` already landed
  (PR #240) — cite it, don't redo it.
- Sibling packet `workspace-thread-domain` is independent; both feed
  `desktop-chat-surface`.
