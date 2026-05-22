# P1 PRD Deferrals

Date: 2026-05-21

The P1/P2 bootstrap intentionally implements only the smallest runnable
architecture-safe shell. The following PRD_REFERENCE capabilities remain
deferred for later phases.

## Deferred Product Capabilities

- `Defer:EditorCanvas`: full visual editor, pan/zoom canvas, selection model,
  alignment guides, layered rendering, and rich node placement.
- `Defer:ToolbarParity`: full editing toolbar, style controls, asset panels,
  keyboard shortcut matrix, and command history UI.
- `Defer:AIGeneration`: prompt-to-image/video, model routing, provider
  selection, generation queue, prompt templates, and safety/moderation flow.
- `Defer:AssetLibrary`: reusable asset browser, imports, tagging, previews, and
  asset lifecycle management.
- `Defer:AdvancedFilters`: PRD-grade filters, search, metadata facets, and
  scene/project organization workflows.
- `Defer:ExportFormats`: PNG/JPEG/SVG/video/project export flows and export
  preset management.
- `Defer:Collaboration`: real-time collaboration, presence, comments, sharing,
  permissions, and remote sync.
- `Defer:RecoverySync`: autosave, crash recovery, conflict resolution,
  background sync, and version restore.
- `Defer:VectorBackend`: vector database, semantic retrieval, embeddings, and
  provider-backed search.
- `Defer:DurableStorage`: Postgres-backed project persistence and migrations.
- `Defer:Distribution`: signing, notarization, installers, auto-update, and
  platform release automation.

## Bootstrap Replacement Surface

P1/P2 provides a deliberate replacement surface for the first proof:

- app-local scene state,
- explicit Tauri command surface,
- local JSON save/load,
- schema/use-case/domain-backed browser/test command path,
- focused quality gates and evidence.

Each deferred item should be promoted through a later goal phase with its own
architecture review before implementation.
