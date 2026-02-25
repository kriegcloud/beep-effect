---
name: effect-v4-services
description: >
  Focused service construction for Effect v4. Use when implementing ServiceMap.Service,
  Layer.effect composition, and replacing Context.Tag style APIs.
version: 0.1.0
status: active
---

# Effect v4 Services (Focused)

1. Service class shape:
- Use `import { $PackageNameId } from "@beep/identity/packages"; const $I = $PackageNameId.create("relative/path/to/file"); class X extends ServiceMap.Service<X, Shape>()($I\`X\`) {}`.
- Do not use `Context.Tag` or `Context.GenericTag`.
- Keep service error channels typed (`S.TaggedErrorClass`), not native `Error`.

2. Layer wiring:
- Use `Layer.effect(Service, constructorEffect)`.
- Keep dependencies explicit at the composition boundary.
- Avoid `try/catch` in service setup flows; prefer `Effect.try*` and `Effect.catchTag`.

3. Consumption:
- Prefer `yield* Service` in effectful handlers.
- Keep service interfaces small and test-first.
- Return `Option` for optional values; avoid nullable/null-assertion patterns.
