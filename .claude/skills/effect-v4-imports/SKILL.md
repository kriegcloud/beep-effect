---
name: effect-v4-imports
description: >
  Focused import hygiene for Effect v4 migrations. Use for namespace-first helper
  module imports,
  A/O/P/R/S aliases, and migration of deprecated package paths.
version: 0.1.0
status: active
---

# Effect v4 Imports (Focused)

1. Required aliases:
- `effect/Array` -> `A`
- `effect/Option` -> `O`
- `effect/Predicate` -> `P`
- `effect/Record` -> `R`
- `effect/Schema` -> `S`

2. Stable module policy:
- Prefer dedicated namespace imports for helper/data modules:
  - `effect/String` -> `Str`
  - `effect/Equal` -> `Eq`
  - `effect/Boolean` -> `Bool`
- Reserve root imports from `"effect"` for core combinators/types like `Effect`, `Match`, `pipe`, and `flow`.
- Keep `effect/unstable/*` usage deliberate and local.
- For data/time helpers prefer Effect modules over native APIs.

3. Migration bans:
- No `@effect/schema` in v4 codepaths.
- No v3 Context-tag APIs.
- No `node:fs` / `node:path` imports in Effect-first domain logic.
- No `JSON.parse` / `JSON.stringify` for typed boundaries; use `S.decodeUnknown*` and `S.encode*`.
