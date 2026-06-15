# POC → Port Parity Audit (2026-06-15)

Exhaustive diff of the `effect-lexical-chat` POC against our shipped desktop
chat surface, classifying every divergence so the implementing session starts
from evidence rather than re-deriving it. **Re-validate before editing** — the
POC and our `main` may drift; line numbers are from 2026-06-15.

- POC: `/home/elpresidank/YeeBois/projects/effect-lexical-chat/` (effect `4.0.0-beta.79`)
- Ours: `/home/elpresidank/YeeBois/projects/beep-effect/` (effect `4.0.0-beta.83`)

Classification: **GREEN** already at parity · **BLUE** intentional (preserve) ·
**GAP** accidental omission to fix · **SCOPE** deliberate v1 cut now in-scope.

## Headline finding: the atom layer is already at parity

The original request assumed our chat state was hand-rolled and didn't use
`AtomRpc`/`Atom.family`/`Atom.runtime`. **It does** — our
`packages/agents/client/src/Chat.atoms.ts` is a near-verbatim port of the POC's
`src/atoms.ts`:

| Primitive | POC `src/atoms.ts` | Ours `Chat.atoms.ts` |
| --- | --- | --- |
| `AtomRpc.Service` | `:25` | `:70` |
| `Atom.family` + `ChatClient.query` | `:57` | `:101`, `:142` |
| `ChatClient.runtime.fn` mutations | `:64`, `:186` | `:159`, `:404` |
| `Atom.runtime` + `Atom.kvs` drafts | `:80`, `:83` | `:175`, `:190` |
| `Reactivity.mutation` + interrupt cleanup | `:212`, `:241` | `:430`, `:460` |
| `addGlobalLayer(ClientObservabilityLive)` + metrics | `:23`, `:134` | `:54`, `:288` |

They differ only in domain naming (`threadId`/`Document` vs
`conversationId`/`SerializedEditorState`). **No atom rework is in scope.**

## Bucket 1 — Observability / devtooling / UX (GAP)

| Gap | POC | Ours | Fix |
| --- | --- | --- | --- |
| Sidecar Effect DevTools | `server/Observability.ts:31-39` `DEVTOOLS`-gated `DevTools.layer()` merged with OTLP | `apps/professional-desktop/src/runtime/Observability.ts` OTLP-only | compose existing `@beep/observability/server` `layerFilteredDevTools` |
| App `RegistryProvider` | `src/main.tsx:39` | absent (`apps/professional-desktop/src/main.tsx` has only `AppThemeProvider`) | mirror `apps/oip-web/src/runtime/OipAtomProvider.tsx` |
| Error toasts | `services/Toasts.ts` + `runTurnAtom` `toasts.show("error",…)` | silent `Effect.logError` only | wire `@beep/ui` sonner (`packages/foundation/ui-system/ui/src/components/sonner.tsx`) from the UI layer |
| Turn-lifecycle metrics | `Handlers.ts:9-30` (turns/failures/duration/blocks/partial-persist) | only `agents_assistant_turn_blocks_total` (`AnthropicTurnKernel.ts:39-42`) | add counters/timers in `ChatOrchestrator.streamAndPersist` |
| Title derivation | `Handlers.ts:35-39` derive from first message | none (user-supplied) | derive set-if-empty in orchestrator + ThreadStore |
| Grafana chat dashboard | `docker-compose.yml` + provisioned `chat-dashboard.json` | LGTM present, no provisioned dashboard | add `docker/grafana/chat-dashboard.json` |

`@beep/observability/server` `layerFilteredDevTools({ url, shouldPublish })` is
at `packages/foundation/capability/observability/src/server/DevTools.ts`;
imported via `@beep/observability/server` (package.json exports). Effect DevTools
is server-only — no client/atom devtools needed; client stays OTLP.

**Layering constraint:** `@beep/agents-client` must NOT import `@beep/ui`
(client→ui is forbidden). Expose the turn error as observable atom state and
fire the sonner toast from the app/UI layer (which may import `@beep/ui`).

## Bucket 2 — Block validation + repair loop (SCOPE → in)

POC has a Haiku-backed repair loop; ours drops invalid blocks (logged):
- POC: `server/BlockRepair.ts` (batched Haiku repair, `REPAIR_MODEL="claude-haiku-4-5"`, 2 attempts), `server/BlockValidation.ts`, `server/IssueReport.ts`.
- Ours: `AnthropicTurnKernel.ts:63-74` `routeBlock` validates via `decodeSlice` (`:55`); invalid → `logInfo` + metric `invalid` + `Result.fail` (dropped). No repair.

Placement (per `03-driver-boundaries.md` + `09-errors-across-boundaries.md`):
- **Driver** `packages/drivers/anthropic/src/Anthropic.repair.ts`: `repairInvalidBlock(slice, { model })` via a one-shot repair call (⚠ see review-corrections #2: the POC uses `streamText`-consume-whole, NOT `generateText`, to dodge a non-streaming `tool_use` decode bug still present at beta.83 — settle in P0); Haiku via `AnthropicLanguageModelOptions.make({ model: "claude-haiku-4-5" })` — model override is supported (`Anthropic.service.ts:57-66`, config `Anthropic.config.ts:159-169`); own 2-attempt `ExecutionPlan` (default is 4-attempt exponential, `Anthropic.service.ts:102-123`). Driver-internal `RepairError`.
- **Port error** `BlockRepairFailed` in `packages/agents/use-cases/.../AssistantTurn/AssistantTurn.repair-errors.ts`, `/server` export only.
- **Server adapter** `packages/agents/server/src/AssistantTurn/BlockRepair.ts`: `attemptBlockRepair` (validate→repair→re-validate→emit/drop); `RepairError`→`BlockRepairFailed`; metric `agents_assistant_turn_blocks_repaired_total{outcome}`; span `agents.assistant_turn.block_repair` (child of the kernel span; domain attrs only — driver span carries technical attrs).
- **Handler** `apps/professional-desktop/src/chat/ChatOrchestrator.ts` `streamAndPersist` (`:188-236`): attach repair tail; `BlockRepairFailed`→`ChatActionError`.

Structured-output codec path: `assistantBlockOutput` / `assistantOutput` via
`AnthropicStructuredOutput.toCodecAnthropic` (`AnthropicTurnCodec.ts:34,51`).
Repair decodes the full `AssistantContent` envelope then validates each block.

## Bucket 3 — Rich blocks (SCOPE → in)

POC has mermaid/table/youtube blocks (schema + validators + Lexical nodes +
renderers); our v1 vocabulary is paragraph/heading/quote/list/code only
(`AssistantContent.ts`, `Turn.AssistantBlock` union `:290`).

**Content-model mapping verdict** (`@beep/md` is `packages/foundation/modeling/md/src/Md.model.ts`):
- `@beep/md` has NO table node and NO embed/decorator node; it is CommonMark+GFM-tasks. Block union `:1516`.
- The `Pre` code node HAS a `language: Option<string>` field (`:1408-1456`, encoded `string|null`, JSON-safe) → **mermaid = `Pre[language="mermaid"]`** (LOCKED; no new foundation node).
- `A` link (`:415`) and `Img` (`:475`) exist; no table; no video/iframe.

| Rich block | Strategy | Effort |
| --- | --- | --- |
| Mermaid | reuse `Pre[language="mermaid"]`; render via language-aware decorator + `mermaid` lib | low |
| Table | NEW `Table`/`Row`/`Cell` across `@beep/md` + lexical + editor (evaluate `@lexical/table`) | high |
| YouTube | NEW dedicated decorator node across `@beep/md` + lexical + editor | medium |

End-to-end touch-points per new block: `AssistantContent.ts` (union) →
`BlockToMd.ts` lift (`:77-102`) → `@beep/md/Md.model.ts` (if new md node) →
`@beep/lexical-schema/Lexical.model.ts` + `Lexical.codec.ts` (bidirectional) →
`@beep/editor/nodes.ts` registration (+ a `DecoratorNode` for custom render;
template = `packages/foundation/ui-system/editor/src/artifact-ref-node.tsx`) →
`chat/ui/StreamingBlocks.tsx` + the read-only viewer.

Renderer path: `@beep/md` Document → `Lexical.codec.documentToEditorState` →
`SerializedEditorState` JSON → `EditorViewer`/`EditorComposer` (LexicalComposer
with registered nodes). `mermaid` is a new render-time dep in `@beep/editor`.

Also re-add: mermaid/table/youtube guidance in the kernel system prompt
(`AnthropicTurnKernel.ts`), and the `Checked*Block` sync codec filters (mermaid
header, table arity, youtube 11-char id) so the provider rejects bad turns
mid-stream.

## Intentional divergences — PRESERVE (BLUE; do not revert)

- `@beep/md` Document model (not Lexical-native); turn-grouped timeline (not flat); Thread/Workspace (not Conversation); PGlite+Drizzle (not sqlite-bun); fixture/anthropic kernel split.
- `ChatActionError` boundary translation (`09-errors-across-boundaries.md`).
- Client OTLP via runtime-origin detection (`ClientObservability.ts:38-50`) — vite-free, Tauri/NodeNext-safe; superior to the POC's `import.meta.env.VITE_OTLP_URL`.
- **No-partial-row on cancel/error** (LOCKED) — `ChatOrchestrator` persists only on `Stream.onEnd` (success); the POC persists partials on `onExit`. Keep ours.
- Already at parity: `scanChunk` + property tests; `ExecutionPlan` retry; stop/interrupt cleanup; optimistic edit-truncation; scroll-to-bottom; Ctrl+Enter; draft autosave.
- Ours, ahead of the POC: `CostRollup`, edit-branch version selector, `UsageRecord` capture.

## Locked decisions (2026-06-15)

1. Scope = **full feature parity** (chosen over "accidental gaps only" and "gaps + repair only").
2. Mermaid = `Pre[language="mermaid"]` (not a dedicated node).
3. Keep no-partial-row-on-cancel (do not adopt the POC's partial persist).

## Doctrine risk

Table/youtube nodes change a **shared foundation contract** (`@beep/md`,
`@beep/lexical-schema`, `@beep/editor`). `@beep/md` is broadly consumed (agents-*,
workspace-*, `@beep/repo-cli`, lexical-schema); `@beep/editor` today has a single
consumer (`apps/professional-desktop`) — NOT `apps/oip-web`, which imports none of
md/lexical/editor (see review-corrections #1). Per `07-non-slice-families.md` treat
them as foundation additions: foundation-level round-trip + JSON-boundary tests,
and verify no regression in the `@beep/md`/`@beep/lexical-schema` consumers.
Mermaid avoids this by reusing `Pre`.

## Review corrections (2026-06-15)

A multi-agent review (5 dimensions, adversarially verified against the repo)
produced these corrections, now folded into SPEC/PLAN/GOAL/README/manifest:

1. **oip-web is not an editor consumer** — the doctrine-risk above originally
   named `apps/oip-web`, but it imports none of `@beep/md`/`@beep/lexical-schema`/
   `@beep/editor`. `@beep/editor`'s only consumer is `apps/professional-desktop`.
   (oip-web IS the correct mirror for the RegistryProvider pattern — that stands.)
2. **Repair call shape is a landmine** — the POC deliberately uses `streamText`
   (consume-whole), not `generateText`, because the non-streaming path maps
   tool_use `caller → toolId: undefined` and fails the response Part schema; still
   reproduces at our `beta.83` (`@effect/ai-anthropic/dist/AnthropicLanguageModel.js:965`).
   P0 gate 1 settles it (POC `server/BlockRepair.ts:98-103`).
3. **`@beep/agents-use-cases/server` subpath does not exist yet** — exports are
   `.`/`/public`/`/proof`/`/test`. Scaffold `/server` before placing
   `BlockRepairFailed` (copy `architecture-lab/use-cases` or `workspace/use-cases`).
   `TurnGenerationError` currently sits on `/public`.
4. **Repair contract reconciled** — a block still invalid after the attempts is
   dropped+logged (repair is otherwise infallible, like the POC); only a failed
   repair *call* becomes `BlockRepairFailed` → `ChatActionError`. The turn never
   fails because one block was unrepairable.
5. **Title derivation is not zero-foundation** — `Thread.title` is a required
   `S.NonEmptyString` with no store mutation (sidebar hardcodes `"New thread"`);
   set-if-empty needs a new `ThreadStore.setTitleIfEmpty` mutation (+ repo + RPC +
   atom) or a nullable-title migration (stop-listed). P0 gate 2. (`documentToPlainText`
   DOES exist at `ChatOrchestrator.ts:92` — an earlier doubt was refuted.)
6. **Mermaid validator/filter re-authored, not ported** — with mermaid as
   `CodeBlock[language="mermaid"]`, the `CheckedMermaidBlock` filter + semantic
   validator key off `language`/`block.code`, not the POC's dedicated
   `MermaidBlock.source`. Table/youtube `Checked*Block` port faithfully.
7. **Two render paths** — `StreamingBlocks.tsx` renders raw `Turn.AssistantBlock`
   with no Lexical decode, so the `@beep/editor` decorator covers only the
   read-only viewer; each rich block also needs a streaming-view render branch
   (the `mermaid` dep lands in ~2 places).

Not reproduced this pass (API outage): the dedicated `accuracy` + `conventions`
review dimensions plus a few verifiers hit transient 529s — re-run that slice when
the API recovers. The packet self-check (GOAL ≤4000, manifest JSON, whitespace,
reflection-artifacts) passed independently.
