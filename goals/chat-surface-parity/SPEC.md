# Chat Surface Parity Spec

## Objective

Bring the desktop chat surface to **full feature parity** with the
`effect-lexical-chat` POC, closing the gaps the prior `desktop-chat-surface`
port left behind: the dropped observability/devtooling/UX affordances, the
streamed-block validation+repair loop, and the richer block vocabulary
(mermaid, tables, youtube). The atom architecture is already at parity — this
packet does **not** re-do it.

Depends on: `goals/desktop-chat-surface` (closed, `completed-retained`). The
chat surface, turn kernel, `ChatRpcs`, agents-client atoms, and PGlite
persistence it shipped are the substrate this packet extends.

Provenance: graduated from `explorations/agent-chat-interface`. Tables were a
named follow-on in that exploration's MAP. Proof-repo reference (read-only):
`/home/elpresidank/YeeBois/projects/effect-lexical-chat/` (effect catalog
`4.0.0-beta.79`; our repo is on `4.0.0-beta.83` — re-validate API drift).

## Background: the parity audit

An exhaustive POC→port diff (see
[`research/2026-06-15-poc-parity-audit.md`](./research/2026-06-15-poc-parity-audit.md))
classified every divergence into three buckets. This SPEC acts only on the
**in-scope** bucket; the other two are fixed constraints.

### Already at parity — DO NOT touch

`AtomRpc.Service` + `Atom.family` queries + `runtime.fn` mutations + `Atom.kvs`
drafts (our `packages/agents/client/src/Chat.atoms.ts` is a near-verbatim port
of the POC `src/atoms.ts`); `scanChunk` block extraction + its property tests;
`ExecutionPlan` retry (4-attempt exponential backoff, `preventFallbackOnPartialStream`);
client OTLP layer + client-span-context-on-rpc-envelope; stop/interrupt cleanup
via `AtomRegistry`; optimistic edit-truncation; scroll-to-bottom; Ctrl+Enter
submit; composer draft autosave/restore.

### Intentional divergences — PRESERVE (non-goals; must NOT revert to POC)

- `@beep/md` `Document` model is the content representation, **not** Lexical-native state.
- Turn-grouped timeline (not the POC's flat message list); Thread/Workspace domain (not Conversation).
- PGlite + Drizzle (not sqlite-bun); fixture-vs-Anthropic kernel split.
- `ChatActionError` boundary translation (`09-errors-across-boundaries.md`) — internal detail dies at the boundary.
- Client OTLP base-URL via runtime-origin detection (vite-free, NodeNext/Tauri-safe) — superior to the POC's `import.meta.env.VITE_OTLP_URL`.
- **No-partial-row on cancel/error** (LOCKED): cancel/error leaves only the user row. The POC persists partial assistant content; we do not, and this packet keeps it that way.
- Features we already have that the POC lacks: `CostRollup`, edit-branch version selector, `UsageRecord` capture. Keep them.

## Locked decisions

1. **Mermaid representation** = the existing `@beep/md` `Pre` code node with
   `language="mermaid"` (already JSON-safe; no new foundation node). Rendered by
   a language-aware decorator in `@beep/editor` using the `mermaid` lib.
   Mermaid is therefore *not* a dedicated md/lexical node.
2. **Partial persist** = keep ours (no partial assistant row on cancel/error).

## Source Hierarchy

1. User objective that created this packet (full POC parity).
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. Governing standards (`standards/ARCHITECTURE.md`;
   `standards/architecture/{01,03,05,06,07,08,09,12}-*.md`).
4. This `SPEC.md`. 5. `PLAN.md`. 6. `GOAL.md`. 7. `research/`, `ops/`, `history/`.

Higher sources outrank lower when they conflict.

## Target Surfaces

- `apps/professional-desktop` — sidecar runtime `src/runtime/Observability.ts`
  + `Layer.ts`, app entry `src/main.tsx`, chat orchestrator
  `src/chat/ChatOrchestrator.ts`, chat UI `src/chat/ui/*`, `docker/grafana/`.
- `packages/agents/*` — kernel + `AssistantTurn/*` (server), `AssistantContent`
  + `BlockToMd` (domain), repair port error (use-cases), atoms/error-state (client).
- `packages/drivers/anthropic/*` — one-shot repair call + Haiku model option.
- `packages/foundation/modeling/md` + `packages/foundation/modeling/lexical`
  + `packages/foundation/ui-system/editor` — new table + youtube nodes (mermaid reuses `Pre`).
- `packages/foundation/capability/observability` — reused (DevTools), not modified.

## In-scope work (normative; see PLAN.md for phasing + file touch-points)

### Observability, devtooling & UX gaps
- Sidecar **Effect DevTools** layer, `DEVTOOLS`-gated, composing the existing
  `@beep/observability/server` `layerFilteredDevTools` (compose the capability;
  do NOT hand-roll `effect/unstable/devtools` `DevTools.layer()` in the app).
- App-local **`RegistryProvider`** mirroring `apps/oip-web/src/runtime/OipAtomProvider.tsx`, wrapping the app root.
- **Error toasts** for failed turns via the existing `@beep/ui` sonner — surfaced
  from the app/UI layer (NOT from `@beep/agents-client`, which must not import `@beep/ui`).
- **Turn-lifecycle metrics** in the orchestrator: turns-total, turn-failures, turn-duration, blocks-streamed. (No partial-persist metric — N/A by the locked contract.)
- **Title derivation** from the first user message (set-if-empty).
- Provisioned **Grafana chat dashboard**.

### Block validation + repair loop
- Driver one-shot repair (`LanguageModel.generateText`, Haiku via per-call model option, own 2-attempt `ExecutionPlan`) + driver-internal `RepairError`.
- Port error `BlockRepairFailed` (use-cases, `/server` export only).
- Server adapter `attemptBlockRepair` (validate → repair → re-validate → emit/drop), error translation, repair metric, repair span; port the POC `IssueReport`.
- Orchestrator repair tail; `BlockRepairFailed` → `ChatActionError` at the handler.
- Invalid blocks are repaired instead of silently dropped.

### Rich blocks
- **Mermaid**: lift to `Pre[language="mermaid"]`; server-side source validator; `@beep/editor` diagram decorator; render in streaming + viewer.
- **Table**: new `Table`/`TableRow`/`TableCell` across `@beep/md` + lexical + editor; `TableBlock` + `BlockToMd` lift; arity validator; render.
- **YouTube**: dedicated embed node across `@beep/md` + lexical + editor (DecoratorNode); `YouTubeBlock` + lift + 11-char video-id validator; render.
- Re-add mermaid/table/youtube guidance to the kernel system prompt.
- Re-add `Checked*Block` sync codec filters so the provider rejects bad turns mid-stream.

## Doctrine risk (binding)

Adding `Table`/`Youtube` nodes to `@beep/md` and `@beep/editor` changes a
**shared foundation contract** consumed by other surfaces (notably the
`apps/oip-web` editor). Per `07-non-slice-families.md` these are foundation
additions, not chat-local. The implementing session MUST: treat them as
foundation work, add round-trip + JSON-boundary tests at the foundation level,
and verify no regression in other editor consumers. Mermaid avoids this by
reusing `Pre`.

## Acceptance Criteria

- [ ] Sidecar exposes Effect DevTools when `DEVTOOLS=true` (via `@beep/observability/server`); OTLP unchanged.
- [ ] App wraps the root in an app-local `RegistryProvider`; failed turns surface a toast.
- [ ] Turn-lifecycle metrics emit; a Grafana chat dashboard is provisioned; threads get derived titles.
- [ ] Invalid streamed blocks are repaired (Haiku) instead of dropped; repair metric + span emit; `BlockRepairFailed` dies at the handler as `ChatActionError`.
- [ ] Mermaid (`Pre[language=mermaid]`), table, and youtube blocks stream, validate, persist as `@beep/md`, and render in both the streaming view and the read-only viewer.
- [ ] New foundation nodes have Md↔Lexical round-trip + JSON-boundary tests; no regression in other `@beep/editor` consumers.
- [ ] No-partial-row-on-cancel contract preserved; intentional divergences untouched.
- [ ] Repo quality gates pass; no unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/chat-surface-parity/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/chat-surface-parity/ops/manifest.json` | Passes |
| Whitespace | `git diff --check -- goals/chat-surface-parity` | Passes |
| Quality gates | `bun run beep yeet verify` (real CI lanes BEFORE the PR) | Green |
| Foundation round-trips | new-node Md↔Lexical + JSON-boundary tests | Green |
| Repair contract | fixture invalid→repaired contract test + driver test | Green |
| E2E proof | real-LLM run rendering+persisting mermaid/table/youtube, recorded in `history/` | All steps pass |

## Stop Conditions

- Required source files are missing or materially contradictory.
- A foundation node addition would regress another editor consumer.
- The implementation would exceed named parity scope.
- The no-partial-row contract is challenged by a parity change.
- The same blocker repeats after reasonable investigation.
- The dependency packet (`desktop-chat-surface`) is not closed.

## Decision Log

- 2026-06-15: Scope = **full feature parity** (user-selected over "accidental gaps only" and "gaps + repair only").
- 2026-06-15: Mermaid = `Pre[language="mermaid"]` (not a dedicated node).
- 2026-06-15: Keep no-partial-row-on-cancel (do not adopt the POC's partial persist).
- Inherited from `explorations/agent-chat-interface/DECISIONS.md` (2026-06-12):
  version-selector branching, UsageRecord at finalization, thread content exempt from gating.

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| None | N/A | N/A | N/A | N/A |
