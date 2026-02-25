---
name: effect-v4-imports
description: >
  Focused import hygiene for Effect v4 migrations. Use for root import preference,
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
- Prefer root imports from `"effect"` for other stable modules.
- Keep `effect/unstable/*` usage deliberate and local.

3. Migration bans:
- No `@effect/schema` in v4 codepaths.
- No v3 Context-tag APIs.
