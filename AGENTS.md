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
- TrustGraph is the primary durable repository knowledge base for this repo.
- Default TrustGraph parameters for repo knowledge and context retrieval: `collection="beep-effect"`, `user="trustgraph"`, `flow_id="default"`.
- Prefer the repo-local helpers when useful:
  - `bun run trustgraph:status`
  - `bun run trustgraph:sync-curated`
  - `bun run trustgraph:context -- --prompt "<text>"`
  - `bun run codex:hook:session-start`
- Keep `graphiti-memory` as a fallback for prior-session recall and legacy/effect-v4 knowledge graph workflows.
- Graphiti memory MCP startup gotcha: the server expects `group_ids` as a list. If the tool wrapper exposes `group_ids` as `string`, pass a JSON array literal string containing `beep-dev` instead of the plain string `beep-dev`.
- When the user asks questions on differences between effect v3 and effect v4, prefer the `effect-v4` skill and only reach for `graphiti-memory` when the legacy graph adds useful historical context.
