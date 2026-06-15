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

P1 Implement complete; P2 Verify + P3 Close in progress. The full stack is built
and verified: agents-slice turn kernel (Anthropic + deterministic fixture behind
one `AgentTurnKernel`), `scanChunk` + property test, md-aligned block schema +
`@beep/md` lift, workspace persistence + `ThreadTimeline` (PGlite integration
test), `ChatRpcs` + `agents-client` atoms (AtomRegistry interrupt cleanup), the
app-level fixture **contract test** (full flow + cancel-leaves-no-partial-row +
UsageRecord-at-finalization), real UsageRecord persistence + `usage_record`
migration (PGlite integration test), chat UI, app-local `runtime/Layer.ts`, and a
bun sidecar that **boots + serves rpc + migrates PGlite in this environment**;
Tauri packaging bun-compiles + `cargo check` passes. Reflection written + passing.

Two items remain: (1) `bun run beep yeet verify` is blocked solely by the pilot
`fallow:audit` lane flagging the new packages' standard test/config boilerplate
as `introduced` duplication (+ one proven-scanner complexity) — a tooling-gap
needing a repo-wide baseline decision, not a feature defect (every other lane is
green; `fallow:dead-code` was driven to green). (2) The real-LLM E2E + full
`tauri build` bundle need an Anthropic key + a dev-machine bundle run (the
fixture path is keyless).

## Latest Evidence

- [`history/2026-06-14-implementation-progress.md`](./history/2026-06-14-implementation-progress.md)
  — increments 1–6b verified green; sidecar boots + serves + migrates here;
  `cargo check` + bun-compile pass; `fallow:dead-code` green; sole `yeet verify`
  blocker = pilot `fallow:audit` convention-duplication.
- [`history/2026-06-14-e2e-fixture-browser.md`](./history/2026-06-14-e2e-fixture-browser.md)
  — keyless fixture-mode **browser E2E**: app renders, create thread + user
  message persist across reload, assistant turn **streams block-by-block** as
  structured rich text, Stop control renders. One localized bug: the assistant
  turn does not finalize/persist in the live streaming transport (fix-direction
  recorded; a live-transport integration test is the follow-on).
- [`history/reflections/2026-06-14-claude.md`](./history/reflections/2026-06-14-claude.md)
  — closeout reflection (`reflection-artifacts` lint passes).
- [`research/2026-06-14-port-findings.md`](./research/2026-06-14-port-findings.md)
  — P0 port findings.

## Notes

- Named follow-ons after this packet (from the exploration MAP):
  `acp-chat-binding`, `proposal-blocks`, attachment/table blocks,
  `thread-pdf-export`.
- Branch UX is Claude-style version selector; the LibreChat fork-tree is a
  documented anti-pattern (see exploration RESEARCH.md).
