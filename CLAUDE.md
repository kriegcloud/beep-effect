# Claude Guide

## Mission
Ship reliable code with effect first and schema first patterns.

## Rules
- Keep changes focused and testable.
- Prefer service composition over global state.
- Prefer match helpers over conditional chains.
- Prefer dedicated helper modules such as the `String` and `Equal` modules from `effect`; keep root `effect` imports for core combinators.
- Prefer tersest equivalent helper forms when behavior is unchanged: direct helper refs over trivial lambdas, `flow(...)` for passthrough `pipe(...)` callbacks, and shared thunk helpers when already in scope.
- In `packages/**/{test,dtslint}/**/*.{ts,tsx}`, import package source through `@beep/*` package aliases instead of relative paths into any workspace `src/`; keep relatives only for local helpers, fixtures, snapshots, and other non-`src` test files.
- Apply schema defaults when safe.
- Keep quality gates passing.
- For local docgen edit loops, prefer `bun run docgen:local`; reserve
  `bun run docgen` for the explicit full repo docgen proof.
- Before recreating shared helpers, schemas, utilities, models, or known symbols,
  search `standards/repo-exports.catalog.md` or
  `standards/repo-exports.catalog.jsonc`; refresh with
  `bun run repo-exports:catalog` and verify with
  `bun run repo-exports:catalog:check`.
- Repo export catalog generation is shard-backed. Package-local
  `.beep/repo-exports/catalog.shard.jsonc` files are tracked generated
  artifacts, while the root `standards/repo-exports.catalog.{jsonc,md}` remains
  the compatibility lookup surface. Use `bun run repo-exports:catalog:full`
  only for an explicit full-scan fallback proof.
- Yeet is the canonical repo-quality operator path. Use the `yeet` skill and
  `bun run beep yeet repair`, `bun run beep yeet verify`,
  `bun run beep yeet publish --message "..."`, and
  `bun run beep yeet monitor` for End-to-End Green: repair, proof, commit,
  push, PR checks, review closeout, and merge readiness.
- Yeet fast-plus-monitor is opt-in only: `bun run beep yeet publish --fast
  --monitor --message "..."` is PR-branch guarded. Use the normal
  `publish --message` path by default, and keep `bun run audit:github pre-push`
  as the explicit full local fallback for secrets, security, SAST, Nix, or any
  lane that needs manual proof outside Yeet.

## Prompt-cache discipline
Claude Code auto-caches the stable conversation prefix (system prompt, tool
definitions, this file, skills, prior turns); cache reads cost ~0.1x input and
expire after a ~5-minute idle TTL. Preserve hit rates:
- Keep the MCP/tool surface stable within a session. Adding, removing, or
  reconnecting MCP servers (Graphiti and friends) changes the cached tool block
  and forces a full cache miss next turn — settle `.mcp.json` and enabled tools
  before working, not mid-task.
- Treat always-loaded files as the cache prefix: batch edits to this file,
  `.claude/skills/*` frontmatter, and settings instead of tweaking them
  repeatedly mid-session, and keep them lean. Durable cross-session knowledge
  belongs in file-memory (`memory/`) or Graphiti, not here.
- Front-load stable context; let volatile, per-task detail arrive later in the
  conversation rather than in always-loaded files.
- Each subagent starts with a cold context window. For related follow-ups,
  continue an existing agent via `SendMessage` rather than spawning a fresh one,
  and avoid idle gaps over ~5 minutes that let the cache expire.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
