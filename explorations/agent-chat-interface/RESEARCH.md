# Research

## External Landscape

**Status: pending.** Queued sweeps:

- `@lobehub/editor` deep dive: architecture (it is itself Lexical-based —
  kernel/plugin design), license, maintenance cadence, React 19
  compatibility, how its chat-input composes blocks/slash menu/attachments.
- Lexical ecosystem: custom node patterns, serialized-state stability across
  versions, collaboration/branching prior art.
- Chat-input/thread UX comparisons: Notion blocks, Claude/ChatGPT/Grok edit
  flows (seed screenshots in `assets/`), agent-workbench UIs.
- Thread export: PDF generation options (none in repo), model-preferred
  prompt formats (XML for Claude) prior art.

## In-Repo Capability Inventory

Recorded 2026-06-12 from a full stack exploration (graphify + agent sweeps +
doc reads).

### Target surface

- `apps/professional-desktop` — Tauri 2 + React 19 + Vite shell ("Agentic
  Professional Runtime"). Health dashboard only; **no chat UI exists**. One
  Tauri command (`professional_desktop_health`). State pattern:
  `@effect/atom-react` `Atom.family` + tagged-union load state
  (`src/App.tsx`).
- `apps/professional-runtime-proof` — headless contract harness for the v1
  runtime data loop (law-patent-intake scenario, deterministic fixture
  agent).

### Conversation data model

- Thread + Message/Turn are **specified but unimplemented**:
  `goals/agentic-professional-runtime/docs/data-model-shared-core.md` —
  "UI may say 'chat'; the model says `Thread` because branching, replay, and
  sub-agent lineage matter." Turn = messages, tool calls, tool results,
  artifacts, activities. `ThreadTimeline` read model specified (history +
  tool calls + activities + cost rollups).
- `packages/workspace/domain` implements only: Workspace, EmailArtifact,
  ContextPacket, Candidate{Project,Task,Draft}, ApprovalGate,
  ApprovalDecision, CandidateLifecycle. Thread/Turn: NOT FOUND (gap to fill
  at graduation time).

### Editor/UI substrate

- `@beep/ui` (`packages/foundation/ui-system/ui`) already depends on
  **Lexical 0.45** with a starter block:
  `src/components/blocks/editor-00/` (LexicalComposer + RichTextPlugin,
  Heading/Quote/Paragraph/Text nodes, OnChange -> `SerializedEditorState`
  JSON) plus `editor/themes/editor-theme.ts` and
  `editor/editor-ui/content-editable.tsx` — all exported.
- `src/components/conversation.tsx` — Conversation/Content/EmptyState/
  ScrollButton scaffold (use-stick-to-bottom) with Storybook stories.
- ~70 shadcn components, Tailwind v4, MUI, `AppThemeProvider`;
  `apps/storybook` (Storybook 10) for showcase.
- `@lobehub/*` deps: NOT FOUND anywhere in the repo.
- Repo law: generic UI substrate belongs in foundation ui-system;
  `@beep/shared-ui` is cross-slice product semantics only.

### Agent connectivity (what "send" means here)

- `@beep/acp` (`packages/drivers/acp`) — Effect-native Agent Client Protocol
  driver (generated wire schema, `AcpClient`/`AcpAgent`, typed protocol
  errors).
- `@beep/ai-provider-cli` — Claude/Codex CLI capability wrapper.
- Model drivers: `@beep/openai-compat` (chat completion + streaming schemas),
  `@beep/xai`, `@beep/venice-ai`; catalog: `@effect/ai-anthropic|openai|
  openrouter` 4.0.0-beta.79.
- SDK contracts: `GetContextPacket`, `ProposeCandidateOutputSet` in
  `@beep/agent-capability-use-cases/public`.

### Schema & export machinery

- `@beep/schema` (`packages/foundation/modeling/schema`): LiteralKit, tagged
  unions, DomainModel.make/Model.Class, EntityId/$I composers; codecs for
  **Markdown** (micromark + GFM), **Xml** (fast-xml-parser 5.8), Csv, Json,
  Html, Yaml. Thread-to-MD/XML export machinery largely exists.
- PDF export: NOT FOUND (new dependency required if kept in scope).

## Constraints Discovered

- Governance shapes the chat surface: agents read bounded context and propose
  **candidate** writes only; human approval promotes to truth
  (`goals/agentic-professional-runtime/README.md` locked decisions). A chat
  "send" is a governed runtime interaction, not a raw completion call.
- Effect/TypeScript SDK is canonical; MCP is an adapter over it.
- Message editing implies thread **branching** — already doctrine in the data
  model; the editor must not fight it.
- Desktop runtime = Tauri webview, React 19 via repo catalog.
