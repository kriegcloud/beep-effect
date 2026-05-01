# Effect v4 Review Checklist

Use this checklist for migrations, PR audits, or compatibility reviews.

## A) Fast Legacy API Scan

Run:

```bash
rg -n "Context\.Tag|Context\.GenericTag|Effect\.Tag\(|Effect\.Service\(|FiberRef\.|Scope\.extend|catchAll|catchSome|forkDaemon|fork\(|Equal\.equivalence" .
```

Pass criteria:
- No unresolved legacy references in production code.
- Any doc examples marked as v3 explicitly.

## B) Service And Layer Correctness

Checks:
1. Services use `Context.Service` / `Context.Reference`.
2. Layers are explicit (`Layer.effect|sync|succeed`) and dependency wiring is explicit.
3. No hidden assumptions from v3 auto-generated `.Default` layers.

## C) Error Handling Correctness

Checks:
1. Uses `Effect.catch*` v4 variants.
2. `catchReason/catchReasons` only where tagged parent error has `reason` field.
3. No claim that defects are handled by normal error-channel catches unless `catchDefect`/`catchCause` is used.

## D) Fiber And Scope Correctness

Checks:
1. `forkChild` vs `forkDetach` is intentional and documented.
2. `startImmediately` / `uninterruptible` options are used deliberately.
3. `Scope.provide` replaces `Scope.extend`.
4. Join/await semantics are explicit where needed.

## E) Yieldable Correctness

Checks:
1. Generator `yield*` usage is valid.
2. Non-Effect `Yieldable` values use `.asEffect()` when passed to combinators.
3. `Ref` / `Deferred` / `Fiber` usage calls module functions (`get`, `await`, `join`).

## F) Behavioral Risk Checks

Checks:
1. Shared memoization across `Effect.provide` calls is understood.
2. `{ local: true }` or `Layer.fresh` used for isolation-sensitive cases.
3. Runtime lifecycle assumptions account for keep-alive + platform `runMain` responsibilities.
4. Cause handling assumes flat reasons, not recursive structure.
5. Equality assumptions match structural default in v4.

## G) Evidence Requirement

For each non-trivial claim, attach at least one of:
- A source path under `packages/effect/src`
- A test path under `packages/effect/test`
- A migration doc path under `migration/*.md`

## H) Standard Output Shape

When reporting findings, use this order:

1. Blocking incompatibilities.
2. Behavioral regressions/risks.
3. Missing tests.
4. Minor style/idiom drift.
5. Open questions (explicitly mark uncertainty).

Keep outputs deterministic:
- Same issue list order for same inputs.
- Stable severity labels.
- Stable file references.
