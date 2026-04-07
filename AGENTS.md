# Agent Guide

## Mission

Build and maintain features with effect first development.

## Rules

- Use schema first domain models.
- Prefer typed errors and tagged unions.
- Prefer effect modules over native helpers.
- Prefer tersest equivalent helper forms when behavior is unchanged: direct helper refs over trivial lambdas, `flow(...)` for passthrough `pipe(...)` callbacks, and shared thunk helpers when already in scope.
- Prefer named schema building blocks, derived `S.is(...)` guards, and `LiteralKit` internal domains over ad-hoc predicate helpers.
- Keep service boundaries explicit.
- Keep repo quality commands green.
- `graphiti-memory` is the primary durable repository knowledge base for this repo.
- Prefer the repo-local helpers when useful:
  - `bun run codex:hook:session-start`
  - `bun run graphiti:proxy`
  - `bun run graphiti:proxy:ensure`
- If `graphiti-memory` is unavailable in-session, fall back to repo-local docs, code search, and the checked-in `.codex` and `.claude` guidance.
- Graphiti memory MCP startup gotcha: the server expects `group_ids` as a list. If the tool wrapper exposes `group_ids` as `string`, pass a JSON array literal string containing `beep-dev` instead of the plain string `beep-dev`.
- When the user asks questions on differences between effect v3 and effect v4, prefer the `effect-v4` skill and only reach for `graphiti-memory` when the legacy graph adds useful historical context.
- When working with shadcn in this monorepo, treat the editor app as the app workspace and the shared UI package as the shared base package. Prefer the shadcn skill and the shadcn MCP server for registry discovery and installs.
- When answering MUI questions, prefer the `mui-mcp` server: call `useMuiDocs` first, then call `fetchDocs` only with URLs returned from the MUI docs responses until you have the needed context.
