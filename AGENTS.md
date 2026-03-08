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
- Graphiti memory MCP startup gotcha: the server expects `group_ids` as a list. If the tool wrapper exposes `group_ids` as `string`, pass a JSON array literal string containing `beep-dev` instead of the plain string `beep-dev`.
- When the user asks questions on differences between effect v3 & effect v4 use the `graphiti-memory` & skill, tool
  on the effect v4 knowledge graph.

