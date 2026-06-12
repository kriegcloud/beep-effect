# Workspace Thread Domain

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Implement the runtime spine's conversation model — Thread/Turn/Message in the
workspace slice on local-first PGlite — plus the `@beep/anthropic` driver,
the `agents` slice rename, and the epistemic `UsageRecord` path. Sibling of
`rich-text-foundation`; both feed `desktop-chat-surface`.

Graduated from
[`explorations/agent-chat-interface`](../../explorations/agent-chat-interface/README.md).

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/workspace-thread-domain/GOAL.md
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

P0 Research — read `data-model-shared-core.md` entity specs, the Organization
model/table pattern, and run the PGlite migration smoke proof before any
entity work.

## Latest Evidence

Not started.

## Notes

- The PGlite migration smoke is deliberately the **first** implementation
  task — it de-risks the whole storage decision.
- The `agents` rename includes proposing the
  `goals/agentic-professional-runtime/SPEC.md` slice-table amendment in the
  same PR.
