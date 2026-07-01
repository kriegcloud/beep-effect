# Workspace Thread Domain

## Status

Lifecycle: `completed-retained`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Implement the runtime spine's conversation model — Thread/Turn/Message in the
workspace slice on local-first PGlite — plus the `@beep/anthropic` driver,
the legacy `agent-capability` → `agents` slice rename, and the epistemic
`UsageRecord` path. Sibling of
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

Complete. Workspace Thread / Turn / Message entities and tables landed with a
PGlite-proven db-admin migration, `@beep/anthropic` exists, the legacy
`agent-capability` packages were renamed to `agents`, the epistemic
`UsageRecord` append path is implemented, and full Yeet verification is green.

## Latest Evidence

- 2026-06-13:
  [`history/2026-06-13-verification-closeout.md`](./history/2026-06-13-verification-closeout.md)
  records the final `bun run beep yeet verify` success; verdict
  `.beep/yeet/runs/beep_editor-15abc31b98cb/verdict.json` reports
  `outcome: "success"` with `fallow-advisory-feedback` and `full:pre-push`
  passed.
- 2026-06-13:
  [`history/2026-06-13-pglite-smoke.md`](./history/2026-06-13-pglite-smoke.md)
  records a passing `BEEP_TEST_DATABASE_DRIVER=pglite-testcontainers bun run
  --cwd packages/_internal/db-admin test:integration` proof.
- 2026-06-13:
  [`history/2026-06-13-workspace-thread-entities.md`](./history/2026-06-13-workspace-thread-entities.md)
  records the Thread / Turn / Message entity/table implementation, db-admin
  migration, and PGlite branch round-trip proof.
- 2026-06-13:
  [`history/2026-06-13-anthropic-driver.md`](./history/2026-06-13-anthropic-driver.md)
  records the `@beep/anthropic` driver implementation and focused package
  verification.
- 2026-06-13:
  [`history/2026-06-13-agents-rename.md`](./history/2026-06-13-agents-rename.md)
  records the legacy `agent-capability` → `agents` rename and focused
  dependent verification.
- 2026-06-13:
  [`history/2026-06-13-usage-record.md`](./history/2026-06-13-usage-record.md)
  records the epistemic `UsageRecord` attribution model and turn-finalization
  append path proof.

## Notes

- The PGlite migration smoke is deliberately the **first** implementation
  task — it de-risks the whole storage decision.
- The legacy `agent-capability` → `agents` rename includes proposing the
  `goals/agentic-professional-runtime/SPEC.md` slice-table amendment in the
  same PR.
- 2026-06-29: gold-intake research note added at
  research/gold-intake-conversation-branching.md (see for Turn sibling-variant
  branchIndex conversation branching); provenance ledger at
  [`research/SOURCES.md`](./research/SOURCES.md) (nugget -> upstream repo +
  license, external research, in-repo bricks).
