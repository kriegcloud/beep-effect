# Reference: Project Context (goals/explorations) & Packet Conventions

Read-only synthesis (2026-06-20). Establishes what neighboring packets already own
(so this packet does not duplicate them) and the goals-packet conventions.

## Packet conventions

Scaffold from `goals/_template/`. Canonical layout:

```
goals/<slug>/
  README.md   SPEC.md   PLAN.md   GOAL.md
  ops/manifest.json            (schemaVersion initiative-manifest/v1)
  research/                    (source-backed exploration)
  history/                     (evidence, closeouts)
  history/reflections/         (per-session reflections; _TEMPLATE.md)
```

- `SPEC.md` is the normative contract (`packetAnchorDocument`). `PLAN.md` is the
  mutable phase plan (P0 Research → P1 Implement → P2 Verify → P3 Close).
  `GOAL.md` is the compact `/goal` launcher (≤4000 chars; target 3500).
- `ops/manifest.json`: `initiative.{id,title,status,packetAnchorDocument}`,
  `lifecycle`, `executionCapable`, `reflectionRequired`, `agentLaunchers`
  (codex-goal), `phases`, `verificationCommands`, `stopConditions`.
- Lifecycle: `active | paused | reference | completed-retained | removed`
  (declared in README + manifest; not encoded in dir names).
- Enforcement: `bun run beep lint reflection-artifacts` (packets with
  `reflectionRequired: true`, or completed status, must carry a schema-valid
  `history/reflections/<YYYY-MM-DD>-<agent>.md`); `jq .` manifest; `wc -m` GOAL;
  `git diff --check`.

## Relationship map

- **chat-surface-parity** (`completed-retained`): brought the desktop chat surface
  to POC parity (DevTools sidecar, RegistryProvider, error toasts, turn metrics,
  block validation/repair, mermaid/table/youtube blocks). Owns the **display/
  render** side. The seed `research/additional_items/USER_PROMPT_INITIAL.md` grew
  beyond parity and is graduated here.
- **desktop-chat-surface** (`completed-retained`, PR #243): the chat substrate —
  streaming turn kernel, md-aligned block schema, workspace persistence +
  ThreadTimeline, `ChatRpcs`, `agents-client` atoms, app-local `runtime/Layer.ts`,
  bun sidecar. Owns the chat input *wiring* (current basic Composer). Non-goals
  excluded attachment/table blocks and input-UX enrichment. This packet extends
  that substrate.
- **agentic-professional-runtime** (`active`): product authority — local-first
  agentic runtime for the IP solo-practice vertical, slice topology, governance
  (candidate-write/ApprovalGate). Thread content is exempt from candidate gating
  (conversational turns are authoritative record). Not where UI/theming live.
- **rich-text-foundation** (`completed-retained`): created `@beep/lexical-schema`
  + `@beep/editor`, proven in Storybook. Locked: **no `@lobehub/editor`
  dependency**; v1 block scope = md-core + artifact-ref; **mention/slash are
  composer affordances, not persisted blocks.** This packet builds ON TOP of
  `EditorComposer`; do not fork a parallel editor or block vocabulary.
- **workspace-thread-domain** (`completed-retained`): Thread/Turn/Message entities
  + tables, PGlite, `@beep/anthropic` driver, `UsageRecord`. Edit-as-branch via
  `Turn.parentTurnId` already modeled. This packet doesn't touch these entities
  (except the optional attachment-payload extension on `SendTurnRequest`).
- **pandoc-ast-foundation** (`active`): `@beep/pandoc-ast` doc interchange — no
  editor UI, no chat input, no theming. Unrelated except shared `@beep/md`.
- **explorations/agent-chat-interface** (`graduated`): origin of the chat packets;
  `DECISIONS.md` locked "build custom, lobehub demoted to reference." A richer
  composer + light/dark were not named follow-ons — they came via the seed brief.
- **explorations/atlas-synthesis** (`active`, research): baseline-context
  synthesis; `synthesis/10-current-chat-runtime.md` notes the chat surface is a
  "learning vehicle"/"proving ground." Not a blocker.

## What this packet must NOT duplicate

- `@beep/editor` / `@beep/lexical-schema` node vocabulary (rich-text-foundation).
- Chat substrate atoms / `runTurnAtom` / draft / edit-as-branch contract
  (desktop-chat-surface) — preserve it.
- Block render/stream/viewer/repair/observability (chat-surface-parity).
- Theme primitives in `@beep/ui` — reuse, don't fork.

## Where this packet cleanly sits

A two-lane enrichment the completed chain deferred: (A) green-workbench light/dark
wiring app-local in `apps/professional-desktop`; (B) feature-flagged composer
mechanism added to `@beep/editor` + app-local assembly. Provenance: seed =
`research/seed/USER_PROMPT_INITIAL.md`; upstream = `explorations/agent-chat-interface`.
