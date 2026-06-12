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

P0 Research — inspect the proof repo's `shared/lexical-schema.ts` and
`shared/assistant-schema.ts`, the `@beep/ui` editor-00 substrate, and run the
Md ↔ Lexical lossiness check before locking the codec profile.

## Latest Evidence

Not started.

## Notes

- The `@beep/md` move to `packages/foundation/modeling/md` already landed
  (PR #240) — cite it, don't redo it.
- Sibling packet `workspace-thread-domain` is independent; both feed
  `desktop-chat-surface`.
