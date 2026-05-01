# Effect v4 Idioms And Evidence

This file maps recommended v4 coding idioms to concrete evidence in `effect-smol` source and tests.

## 1) Services: `Context.Service` And `Context.Reference`

Recommended idiom:
- Define services with `Context.Service`.
- Access dependencies in `Effect.gen` via `yield* Service`.
- Use `Context.Reference` / `References.*` for runtime-local defaults.

Evidence:
- Source: `packages/effect/src/Context.ts`
- Source: `packages/effect/src/References.ts`
- Tests: `packages/effect/test/Effect.test.ts` (`Context.Service`, `gen with context`)

## 2) Layers: Explicit Construction, Explicit Wiring

Recommended idiom:
- Build layers explicitly with `Layer.effect`, `Layer.sync`, `Layer.succeed`.
- Compose dependencies with `Layer.provide`.
- Use `Effect.provide(layer)` at boundaries.

Evidence:
- Source: `packages/effect/src/Layer.ts`
- Source: `packages/effect/src/Effect.ts` (`provide` with `{ local?: boolean }`)
- Tests: `packages/effect/test/Effect.test.ts` (`provide` memoization behavior)

## 3) Error Recovery: `catch`, `catchCause`, `catchFilter`, Reason-Aware APIs

Recommended idiom:
- Default to `Effect.catch` for recoverable channel errors.
- Use `catchCause` for full cause inspection.
- Use `catchReason` / `catchReasons` for nested tagged error reasons.

Evidence:
- Source: `packages/effect/src/Effect.ts` (exports for `catch*` family)
- Tests: `packages/effect/test/Effect.test.ts` (`catchReason`, `catchReasons`)

## 4) Forking: Child vs Detached, Explicit Join/Await

Recommended idiom:
- Use `Effect.forkChild` for supervised child fibers.
- Use `Effect.forkDetach` for daemon-like detached fibers.
- Join explicitly with `Fiber.join` or observe with `Fiber.await`.

Evidence:
- Source: `packages/effect/src/Effect.ts` (`forkChild`, `forkDetach`, `forkIn`, `forkScoped`)
- Tests: `packages/effect/test/Effect.test.ts` (fork supervision semantics)

## 5) Yieldable Discipline

Recommended idiom:
- In generators, `yield*` values implementing `Yieldable`.
- For combinators requiring `Effect`, call `.asEffect()` when value is only `Yieldable`.
- Do not treat `Ref`/`Deferred`/`Fiber` as effects.

Evidence:
- Source: `packages/effect/src/Effect.ts` (`Yieldable`, `gen` signatures)
- Source: `packages/effect/src/Option.ts`, `Result.ts`, `Config.ts` (Yieldable implementations)
- Tests: `packages/effect/test/Effect.test.ts` (`fromOption`/`fromResult` yieldable tests)

## 6) Cause Handling: Flat Reasons

Recommended idiom:
- Inspect `cause.reasons` with `Cause.isFailReason`, `Cause.isDieReason`, `Cause.isInterruptReason`.
- Use `Cause.combine` to merge causes.
- Prefer `findErrorOption` if Option shape is needed.

Evidence:
- Source: `packages/effect/src/Cause.ts` (flat model + helpers)

## 7) Scope Provision

Recommended idiom:
- Use `Scope.provide(scope)(effect)` / `Scope.provide(effect, scope)`.
- Replace any `Scope.extend` usage.

Evidence:
- Source: `packages/effect/src/Scope.ts`
- Tests: `packages/effect/test/Scope.test.ts`, `Effect.test.ts` (scope/fork interactions)

## 8) Equality Defaults And Opt-Out

Recommended idiom:
- Assume structural equality for common data structures.
- Opt out only where identity semantics are required.

Evidence:
- Source: `packages/effect/src/Equal.ts` (`equals`, `asEquivalence`, `byReference`, `byReferenceUnsafe`)
- Tests: `packages/effect/test/Equal.test.ts` (`byReference` suites)

## 9) Runtime Keep-Alive And Main Entry

Recommended idiom:
- Core runtime handles keep-alive for suspended async fibers.
- Prefer platform `runMain` for signal/exit wiring.

Evidence:
- Source: `packages/effect/src/internal/effect.ts` (reference-counted keep-alive timer)
- Source: `packages/effect/src/Runtime.ts` (`makeRunMain`, `defaultTeardown`)

## 10) Unstable Module Policy

Recommended idiom:
- Treat `effect/unstable/*` as intentionally unstable.
- When used, annotate risk and avoid overclaiming long-term compatibility.

Evidence:
- Source: `packages/effect/package.json` export map (`./unstable/*`)
- Docs: `MIGRATION.md` unstable module section

## Verification Commands

```bash
# core v4 symbols
rg -n "export const (catch|catchCause|catchFilter|forkChild|forkDetach|provide)" packages/effect/src/Effect.ts
rg -n "export const Service|export const Reference" packages/effect/src/Context.ts
rg -n "interface Cause|type Reason|reasons:" packages/effect/src/Cause.ts

# behavior-oriented tests
rg -n "describe\(\"catchReason\"|describe\(\"catchReasons\"|describe\(\"provide\"|forkDetach|forkChild" packages/effect/test/Effect.test.ts
rg -n "describe\(\"byReference\"|describe\(\"byReferenceUnsafe\"" packages/effect/test/Equal.test.ts
```
