# Agent Guide

## Mission

Build and maintain features with effect first development.

## Rules

- Use schema first domain models.
- Prefer typed errors and tagged unions.
- Prefer effect modules over native helpers.
- Prefer tersest equivalent helper forms when behavior is unchanged: direct helper refs over trivial lambdas, `flow(...)` for passthrough `pipe(...)` callbacks, and shared thunk helpers when already in scope.
- Prefer named schema building blocks, derived `S.is(...)` guards, and `LiteralKit` internal domains over ad-hoc predicate helpers.
- Do not add `as const` to inline array literals passed directly to `LiteralKit(...)`; `LiteralKit` uses const type parameters already.
- In `packages/**/{test,dtslint}/**/*.{ts,tsx}`, import package source through `@beep/*` package aliases instead of relative paths into any workspace `src/`; keep relatives only for local helpers, fixtures, snapshots, and other non-`src` test files.
- Keep service boundaries explicit.
- Keep repo quality commands green.
- For local docgen edit loops, prefer `bun run docgen:local`. It plans from
  `origin/main...HEAD` plus dirty/untracked files, runs bounded package-scoped
  docgen through Turbo, and aggregates only selected packages. Use
  `bun run docgen` when the full repo docgen proof is required.
- Before recreating a shared helper, schema, utility, model, or known symbol,
  search live package source and public barrels first. Prefer targeted source
  searches such as:
  `rg -n "export (const|function|class|type|interface) .*<symbol-or-intent>" packages --glob '**/src/**/*.{ts,tsx}' --glob '!**/*.test.ts' --glob '!**/*.test.tsx'`
  and barrel searches such as:
  `rg -n "<symbol-or-intent>" packages --glob '**/src/index.ts'`.
  Use the `repo-symbol-discovery` skill when a broader symbol lookup is useful.
- The old generated repo export catalog at `standards/repo-exports.catalog.*` is
  retired; do not look for it, refresh it, or use repo-export catalog commands as
  a default discovery or proof step.
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
- Use `bun run beep architecture` for canonical slice, concept, role, and
  architecture proof generation instead of hand-authoring boilerplate.
- For architecture concepts, use the canonical `--domain-kind` archetypes:
  `aggregates` for full slice concepts, `entities` for persisted domain
  entities, and `values` for domain-only value objects.
- `graphiti-memory` is the primary durable repository knowledge base for this repo.
- Agent MCP clients should use the repo-owned queue proxy endpoint
  `http://localhost:8123/mcp`; `http://localhost:8000/mcp` is the backing
  Graphiti service upstream.
- Prefer the repo-local helpers when useful:
  - `bun run graphiti:proxy`
  - `bun run graphiti:proxy:ensure`
- If `graphiti-memory` is unavailable in-session, fall back to repo-local docs,
  code search, and the checked-in `AGENTS.md` / `CLAUDE.md` guidance.
- Prefer `get_status`, narrow `get_episodes`, and scoped
  `search_memory_facts` calls with small result limits over broad startup
  searches.
- Graphiti memory MCP startup gotcha: the server expects `group_ids` as a list. If the tool wrapper exposes `group_ids` as `string`, pass a JSON array literal string containing `beep_dev` instead of the plain string `beep_dev`.
- When the user asks questions on differences between effect v3 and effect v4, prefer the `effect-v4` skill and only reach for `graphiti-memory` when the legacy graph adds useful historical context.
- When working with shadcn in this monorepo, treat the editor app as the app workspace and the shared UI package as the shared base package. Prefer the shadcn skill and the shadcn MCP server for registry discovery and installs.
- When answering MUI questions, prefer the `mui-mcp` server: call `useMuiDocs` first, then call `fetchDocs` only with URLs returned from the MUI docs responses until you have the needed context.
