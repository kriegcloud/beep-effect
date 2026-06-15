# Chat Surface Parity Plan

## Status

Status: `planned`. Dependency `goals/desktop-chat-surface` is closed
(`completed-retained`), so this packet is unblocked and ready for a `/goal`
session.

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Research | pending | Re-validate the parity audit against current `main` + the POC (it may have drifted); confirm file paths and API surfaces. | Audit confirmed; any drift recorded in `history/`. |
| P1 Observability & UX gaps | pending | Land the low-risk dropped affordances (DevTools, RegistryProvider, toasts, turn metrics, title derivation, Grafana dashboard). No foundation changes. | Acceptance criteria for the obs/UX bucket met; gates green. |
| P2 Block repair loop | pending | Repair invalid streamed blocks (Haiku) across driver→server→handler instead of dropping them. | Repair contract test + driver test green; repair metric/span emit. |
| P3 Rich blocks | pending | Add mermaid (reuse `Pre`), table, and youtube blocks end-to-end (schema→lift→validate→render). | New nodes round-trip; render in streaming + viewer; no other-consumer regression. |
| P4 Verify & close | pending | Full verification (real CI lanes + real-LLM E2E), changesets, regenerated artifacts, reflection. | `yeet verify` green before PR; closeout reflection exists. |

## P1 — Observability, devtooling & UX gaps (no foundation changes)

1. **Sidecar Effect DevTools** — `apps/professional-desktop/src/runtime/Observability.ts`:
   add a `DEVTOOLS`-gated layer composing `@beep/observability/server`
   `layerFilteredDevTools({ url, shouldPublish })`; `Layer.mergeAll` it with the
   existing OTLP layer. Compose the existing capability — do NOT hand-roll
   `effect/unstable/devtools` `DevTools.layer()` in the app.
2. **App `RegistryProvider`** — new app-local atom provider mirroring
   `apps/oip-web/src/runtime/OipAtomProvider.tsx` (RegistryProvider +
   `useAtomMount` of the browser runtime); wrap the root in
   `apps/professional-desktop/src/main.tsx` (currently only `AppThemeProvider`).
3. **Error toasts** — surface `runTurnAtom` failures via the existing
   `@beep/ui` sonner. Layering: `@beep/agents-client` must NOT import `@beep/ui`.
   Expose the turn error as observable atom state (read the `runTurnAtom`
   `AsyncResult` failure, or add a dedicated error atom) and fire the toast from
   the app/UI layer; mount `<Toaster/>` in the app shell.
4. **Turn-lifecycle metrics** — in `apps/professional-desktop/src/chat/ChatOrchestrator.ts`
   `streamAndPersist`: `agents_chat_turns_total`, `agents_chat_turn_failures_total`,
   `agents_chat_turn_duration` (histogram), `agents_chat_blocks_streamed_total`.
   No partial-persist metric (N/A by the locked no-partial-row contract).
5. **Title derivation** — derive a thread title from the first user message
   (`documentToPlainText` first line, ~64 chars), set-if-empty; touch
   `ChatOrchestrator` + the workspace `ThreadStore`.
6. **Grafana chat dashboard** — `docker/grafana/chat-dashboard.json` +
   provisioning (turns, perceived latency, blocks, errors), mirroring the POC.

## P2 — Block validation + repair loop (driver → server → handler)

- **Driver** — `packages/drivers/anthropic/src/Anthropic.repair.ts`:
  `repairInvalidBlock(slice, { model })` via one-shot
  `LanguageModel.generateText()` (not `streamText`), Haiku via
  `AnthropicLanguageModelOptions.make({ model: "claude-haiku-4-5" })`, own
  2-attempt `ExecutionPlan`. Driver-internal `RepairError` in `Anthropic.errors.ts`.
- **Port error** — `BlockRepairFailed` in
  `packages/agents/use-cases/src/processes/AssistantTurn/AssistantTurn.repair-errors.ts`,
  exported from the `/server` subpath only.
- **Server adapter** — `packages/agents/server/src/AssistantTurn/BlockRepair.ts`:
  `attemptBlockRepair(indexed)` = validate → on-fail call driver repair →
  re-validate → emit repaired / drop+log; translate `RepairError` →
  `BlockRepairFailed`; metric `agents_assistant_turn_blocks_repaired_total{outcome}`;
  span `agents.assistant_turn.block_repair`. Port the POC `IssueReport` to build
  the repair prompt context. Today invalid blocks are dropped in
  `AnthropicTurnKernel.routeBlock` — repair slots between validation and drop.
- **Handler** — attach the repair tail in `ChatOrchestrator.streamAndPersist`;
  translate `BlockRepairFailed` → `ChatActionError` at the boundary.
- The repair codec must decode the FULL `AssistantBlock` union (including the
  P3 rich blocks once they exist).

## P3 — Rich blocks (foundation-touching)

- **P3a Mermaid (low)** — represent as `Pre[language="mermaid"]` (LOCKED). Server
  validator for the mermaid source (port `MermaidValidator`: mermaid + happy-dom,
  or a lighter parse). `@beep/editor` language-aware decorator renders the
  diagram via the `mermaid` lib (new dep; `ArtifactRefNode` is the `DecoratorNode`
  template). Render in `chat/ui/StreamingBlocks.tsx` + the read-only viewer.
- **P3b Table (high)** — new `Table`/`TableRow`/`TableCell` schema classes in
  `packages/foundation/modeling/md/src/Md.model.ts` (+ the `Block` union); lexical
  `TableNode` in `packages/foundation/modeling/lexical/src/Lexical.model.ts` +
  bidirectional codec in `Lexical.codec.ts` (evaluate `@lexical/table`); register
  in `@beep/editor` `nodes.ts`. `TableBlock` in `AssistantContent` + `BlockToMd`
  lift; server arity validator; render in streaming + viewer.
- **P3c YouTube (medium)** — dedicated embed node: `@beep/md` node, lexical
  `YoutubeNode` (DecoratorNode), `@beep/editor` iframe decorator; `YouTubeBlock`
  + lift + 11-char video-id validator; render in streaming + viewer.
- **System prompt** — re-add mermaid/table/youtube authoring guidance in the
  kernel system prompt.
- **Codec checks** — re-add the POC's `Checked*Block` sync filters (mermaid
  header token, table arity, youtube id) at the structured-output codec so the
  provider rejects malformed turns mid-stream.

## P4 — Verify & close

- Property/round-trip tests for each new md/lexical node (Md→Lexical→Md +
  JSON-boundary, mirroring the `desktop-chat-surface` finalize-bug regression).
- Repair: fixture contract test (invalid → repaired) + a driver test.
- Update fixture-agent contract tests for the new block types; real-LLM E2E over
  the wire (render + persist mermaid/table/youtube), recorded in `history/`.
- **Quality gates**: run the REAL CI lanes + `bun run beep yeet verify` BEFORE
  the PR (prior-packet lesson — per-package green ≠ aggregate CI green). Add
  changesets for every touched lib. Regenerate generated artifacts (fallow
  boundaries, repo-exports catalog, docgen) since new packages/deps land.
- Reflection (P4 closeout).

## P4 Closeout Checklist

Before marking the packet closed (`status` → `completed-retained` / `complete`):

1. Write a closeout reflection via the `/reflect` skill to
   `history/reflections/<YYYY-MM-DD>-<agent>.md`. Critique tooling,
   implementation, and the goal/prompt. Its YAML frontmatter must validate
   against `ReflectionFrontmatter`.
2. Run `bun run beep lint reflection-artifacts` (this packet has
   `reflectionRequired: true`).
3. Update `README.md` (status, latest evidence) and `ops/manifest.json` phase
   statuses + `initiative.status`.

## Execution Notes

- Preserve unrelated worktree changes; keep `SPEC.md` normative.
- Foundation work (md/lexical/editor) is shared — verify other editor consumers
  (e.g. `apps/oip-web`) still pass.
- Real-LLM verification needs an Anthropic key (env-or-`op read`); CI relies on
  the fixture agent only.
- Phases are independently shippable; P1 can land as its own PR before P2/P3.

## Verification Commands

```sh
test "$(wc -m < goals/chat-surface-parity/GOAL.md)" -le 4000
jq . goals/chat-surface-parity/ops/manifest.json
rg -n "chat-surface-parity|GOAL.md|agentLaunchers|packetAnchorDocument" goals/chat-surface-parity
git diff --check -- goals/chat-surface-parity
```
