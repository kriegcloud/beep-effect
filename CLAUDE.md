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
- `docs/` is tracked authored documentation (see `docs/README.md`); the docgen
  aggregate lands in gitignored `docs/generated/`, and `docs/_internal/` is
  private and must never be committed (public repo).
- `explorations/` is the fuzzy front end (capture → research → align → shape →
  decompose → graduate), driven by the `/explore` skill; crystallized work
  graduates into `goals/` packets and `docs/product/` prose (see
  `explorations/README.md`).
- Before recreating shared helpers, schemas, utilities, models, or known symbols,
  search the source with ripgrep (e.g. `rg "export (const|function|class) Name"`)
  and the package barrels (`packages/*/*/*/src/index.ts`), or use the
  `repo-symbol-discovery` skill. Reuse what exists instead of duplicating it.
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
