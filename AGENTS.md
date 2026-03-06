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

I'm migrating my codebase from v3 to v4 where services are declared with `Context.Tag` plus `Effect.Service` and wired through
layers with `Layer`, while error handling uses `Effect.catchAll` and `Effect.catchSome` and some code yields `Deferred` values directly. In v4
we’re seeing multiple breaking changes:
ServiceMap.Service replaces service construction, Context module is gone or reworked, Effect.catchAll→Effect.catch,
catchSome→catchFilter, and Deferred no longer extends Effect (so await style changed).
Can you give me a migration strategy that minimizes behavior regressions? I want a concrete order of operations for:

- converting service definitions + layer composition without breaking dependency resolution or causing duplicate service instances,
- preserving typed error handling so domain errors are recovered and defects still fail fast,
- updating all `Deferred` usages that relied on `Yieldable` or implicit await behavior,
- and keeping runtime context and `FiberRef` behavior stable during rollout.
  Please call out the v3 docs equivalents and the exact v4 replacements, and call out any hidden pitfalls.
