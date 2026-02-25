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
- Use `class X extends ServiceMap.Service<X, Shape>()("@id") {}`.
- Do not use `Context.Tag` or `Context.GenericTag`.

2. Layer wiring:
- Use `Layer.effect(Service, constructorEffect)`.
- Keep dependencies explicit at the composition boundary.

3. Consumption:
- Prefer `yield* Service` in effectful handlers.
- Keep service interfaces small and test-first.
