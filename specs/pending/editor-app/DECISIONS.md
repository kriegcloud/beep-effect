# Editor App Decisions

## Locked Decisions

### 1. Canonical document model
Use an `app-owned AST`.

The editor runtime owns a block-tree document schema that is independent of Lexical and independent of Markdown. This is the canonical model from which other formats derive.

### 2. Storage posture
Use `workspace files + derived DB`.

The canonical page documents live as app-owned JSON files in the workspace. Query-heavy derived state belongs in a local database and can be rebuilt when needed.

### 3. Document shape
Use a `block tree`.

Pages are structured as nested block nodes instead of flat text blobs so the app can support rich editing, links, embeddings, and future projection targets.

### 4. Identity model
Use `stable id + path slug`.

Each page has a stable internal identifier and a user-facing slug/path. Internal links resolve against the stable id so renames do not destroy graph integrity.

### 5. Markdown posture
Use `import/export only`.

Markdown is important for interoperability, but it is not the runtime source of truth because it cannot safely preserve all future editor semantics.

### 6. Runtime ownership
Use an `Effect-first sidecar`.

The Bun + Effect sidecar owns workspace semantics, persistence, import/export, indexing, revision history, and future local services. Rust stays minimal and shell-oriented.

### 7. App boundary
Build a `parallel desktop app`.

`apps/editor-app` should be a separate Tauri app beside `apps/desktop`, with its own protocol, client, and runtime packages so repo-memory work remains isolated.

### 8. Workspace model
Use an `app-owned workspace`.

The editor should manage its own workspace layout rather than treating arbitrary user folders as the canonical live storage boundary in v0.

### 9. Sync posture
Target `single-user now, multi-device later`.

V0 keeps conflict resolution and remote sync out of scope, but the persistence model should leave room for future revision-based sync.

### 10. Export posture
Ship `JSON + Markdown` in v1.

The long-term goal is transformation into JSON, DOCX, Markdown, PDF, and more. V1 only needs JSON and Markdown to prove the canonical model and export boundary.

### 11. Import posture
Ship `Markdown page/folder import` in v1.

Import is a bootstrap interoperability feature, not evidence that Markdown is canonical.

### 12. Knowledge primitives
V1 includes `page links + backlinks`.

The first knowledge features are lightweight graph semantics over page references, not databases or collaboration.

### 13. Discovery surface
V1 focuses on `full-text search + backlinks`.

Search and graph discovery should be part of the architecture from the start even if the first UI is intentionally small.

### 14. Revision posture
Keep a `local revision log`.

The sidecar should record immutable local revisions so page changes are inspectable and so later sync does not require a storage rewrite.

### 15. Package strategy
Create the `parallel core stack now`.

The new app should not piggyback on repo-memory packages beyond shared infra patterns. It gets its own protocol/client/runtime/editor layers now.

### 16. Existing `packages/editor`
Make it `engine-agnostic`.

The existing package becomes the canonical editor domain home, while Lexical-specific logic moves into `packages/editor-lexical`.

### 17. Module posture
Keep `internal modularity only` in v0.

V0 may be internally modular, but it should not commit to a public plugin SDK yet.

## Reference Repos That Matter Most
- `moldable`: strongest Lexical/editor-UX donor
- `comet`: strongest local-first and revision direction
- `lokus`: strongest longer-term extensibility and module direction
- `char`: strongest Tauri/native shell patterns

These are evidence sources, not blueprints to copy wholesale.
