# Synthesis Review: Effect-Atom Claude Code Skill Guide

**Review Date**: 2026-01-14
**Document Reviewed**: `specs/effect-atom/outputs/SYNTHESIS.md`
**Reviewer**: Claude Code Agent

---

## 1. Summary

**Overall Assessment**: **NEEDS_FIXES**

The synthesis document is comprehensive and provides valuable guidance for developers transitioning from Jotai to effect-atom. However, there are several inaccuracies, hallucinated APIs, and missing critical details that need correction before use as a Claude Code skill reference.

**Severity Breakdown**:
- Critical Issues: 4
- Moderate Issues: 6
- Minor Issues: 3

---

## 2. Verified Claims

The following claims were verified against the library source at `./tmp/effect-atom`:

### Accurate API Surface

1. **Core Exports from `@effect-atom/atom`** - Verified correct:
   - `Atom.make` - Creates atoms (line 375-396 in Atom.ts)
   - `Atom.readable` - Creates read-only atoms (line 333-343)
   - `Atom.writable` - Creates writable atoms (line 349-361)
   - `Atom.family` - Parameterized atom factory (line 1324-1359)
   - `Atom.context` - Creates runtime factory (line 652-706)
   - `Atom.defaultMemoMap` - Default memoization map (line 712-715)
   - `Atom.map` - Derive atoms (line 1512-1523)
   - `Atom.searchParam` - URL search parameter atom (line 1842-1891)
   - `Atom.pull` - Stream chunk pulling (line 1209-1220)
   - `Atom.fn` - Function atom (line 1071-1093)
   - `Atom.batch` - Batched updates (line 1736)

2. **React Hooks from `@effect-atom/atom-react`** - Verified correct:
   - `useAtomValue` - Read atom value (line 87-97 in Hooks.ts)
   - `useAtomSet` - Get setter (line 149-169)
   - `useAtom` - Combined value and setter (line 187-207)
   - `useAtomRefresh` - Get refresh function (line 175-181)
   - `useAtomSuspense` - Suspense integration (line 257-270)
   - `useAtomSubscribe` - Subscribe to changes (line 276-286)
   - `useAtomMount` - Mount atom (line 140-143)
   - `useAtomInitialValues` - Set initial values (line 68-81)
   - `useAtomRef` - Reference access (line 292-296)

3. **Registry Module** - Verified correct:
   - `Registry.make` - Creates registry (line 61-68 in Registry.ts)
   - `Registry.layer` - Effect Layer (line 107)
   - `Registry.AtomRegistry` - Context.Tag (line 74-77)

4. **Result Type** - Verified correct:
   - `Result.Result<A, E>` - Discriminated union type (line 25)
   - `Result.initial()` - Create initial state (line 161-166)
   - `Result.success()` - Create success state (line 188-198)
   - `Result.failure()` - Create failure state (line 227-240)
   - `Result.isInitial` - Type guard (line 148)
   - `Result.isSuccess` - Type guard (line 182)
   - `Result.isFailure` - Type guard (line 214)
   - `Result.fromExit` - Convert from Exit (line 120-122)
   - `Result.waiting` - Mark as waiting (line 288-300)
   - `Result.builder` - Pattern matching builder (line 593-598)

5. **Context API** - Verified correct (line 108-140 in Atom.ts):
   - `get(atom)` - Read another atom
   - `get.result(atom)` - Get Result from effectful atom
   - `get.mount(atom)` - Ensure atom is active
   - `get.refresh(atom)` - Trigger recomputation
   - `get.setSelf(value)` - Update self value
   - `get.addFinalizer(fn)` - Register cleanup
   - `get.stream(atom)` - Create stream of changes
   - `get.subscribe(atom, fn)` - Listen to changes
   - `get.registry` - Access registry

6. **Provider Components** - Verified correct:
   - `RegistryContext` - React context (line 22-25 in RegistryContext.ts)
   - `RegistryProvider` - Provider component (line 31-64)
   - `scheduleTask` - Scheduler integration (line 14-16)

### Accurate Conceptual Claims

1. Effect-first philosophy - Atoms are Effect programs
2. Explicit runtime requirement - `makeAtomRuntime()` needed
3. SubscriptionRef internals - Library uses Effect's SubscriptionRef
4. Result type pattern - Async atoms return `Result<A, E>`
5. Separate hooks for read/write - `useAtomValue` and `useAtomSet`
6. Layer composition for service injection - Verified in usage patterns

---

## 3. Issues Found

### Critical Issues

#### Issue 1: Hallucinated `Atom.runtime` Export

**Location**: Section 2, "Runtime Creation" table

**Claim**:
```typescript
| `Atom.runtime` | `(layer: Layer<R, E>) => AtomRuntime<R, E>` | Create runtime from single Layer |
```

**Reality**: There is no standalone `Atom.runtime` function that takes a Layer directly. The actual export `Atom.runtime` (line 721-724 in Atom.ts) is a **pre-created RuntimeFactory** using `defaultMemoMap`:

```typescript
export const runtime: RuntimeFactory = globalValue(
  "@effect-atom/atom/Atom/defaultContext",
  () => context({ memoMap: defaultMemoMap })
)
```

**Correction**:
- `Atom.runtime` is a `RuntimeFactory` instance (the default factory), not a function that takes a Layer
- To create a runtime from a Layer, use `Atom.context({ memoMap }).call(layer)` or `Atom.runtime(layer)`

---

#### Issue 2: Incorrect `makeAtomRuntime` Function

**Location**: Sections 4, 5, 6 - Multiple references to `makeAtomRuntime()`

**Claim**: The synthesis repeatedly refers to `makeAtomRuntime()` as if it's an export from the library.

**Reality**: `makeAtomRuntime` is **not an export from `@effect-atom/atom`**. Looking at the actual beep-effect codebase pattern:

```typescript
// This is a LOCAL definition in beep-effect, not a library export
export const makeAtomRuntime = Atom.context({
  memoMap: Atom.defaultMemoMap,
});
```

**Correction**: The synthesis should clarify that:
- `Atom.context()` is the library function that creates a `RuntimeFactory`
- `makeAtomRuntime` is a local variable name used in beep-effect, not a library export
- The correct pattern is `const runtime = Atom.context({ memoMap: Atom.defaultMemoMap })`

---

#### Issue 3: Missing `AtomRef` Module Export

**Location**: Section 2, Core API Reference

**Issue**: The library exports `AtomRef` module but it's not documented in the synthesis.

**Reality**: From `packages/atom/src/index.ts`:
```typescript
export * as AtomRef from "./AtomRef.js"
```

And the React bindings include `useAtomRef`, `useAtomRefProp`, `useAtomRefPropValue` hooks (lines 292-310 in Hooks.ts).

**Correction**: Add `AtomRef` module to the API reference section.

---

#### Issue 4: Missing `Hydration` Module Export

**Location**: Section 2, Core API Reference

**Issue**: The library exports `Hydration` module for SSR support but it's not documented.

**Reality**: From `packages/atom/src/index.ts`:
```typescript
export * as Hydration from "./Hydration.js"
```

**Correction**: Document the `Hydration` module for SSR use cases.

---

### Moderate Issues

#### Issue 5: Incorrect Signature for `runtime.fn`

**Location**: Section 2, "Runtime Creation" table

**Claim**:
```typescript
| `runtime.fn` | `<Args, A, E, R>(fn: (...args: Args) => Effect<A, E, R>) => FunctionAtom` |
```

**Reality**: The actual signature (from RuntimeProto, line 210-218) is more complex:
```typescript
readonly fn: {
  <Arg>(): <E, A>(fn: (arg: Arg, get: FnContext) => Effect<...>) => AtomResultFn<Arg, A, E | ER>
  <E, A, Arg = void>(fn: (arg: Arg, get: FnContext) => Effect<...>) => AtomResultFn<Arg, A, E | ER>
  // Also supports Stream return type
}
```

Key differences:
- Takes `(arg: Arg, get: FnContext)` not `(...args: Args)`
- Returns `AtomResultFn<Arg, A, E>` not `FunctionAtom`
- Supports curried form `fn<Arg>()(effect)` for type inference

**Correction**: Update the signature to reflect the actual API.

---

#### Issue 6: `Result.builder` Return Type Incorrect

**Location**: Section 2, "Result Type" table

**Claim**:
```typescript
| `Result.builder<R>()` | `<R>() => Builder<R>` | Pattern matching builder |
```

**Reality**: The actual signature (line 593-598 in Result.ts) is:
```typescript
export const builder = <A extends Result<any, any>>(self: A): Builder<...>
```

It takes a `Result` value, not a type parameter.

**Correction**:
```typescript
| `Result.builder(result)` | `<A extends Result<any, any>>(self: A) => Builder<...>` | Pattern matching builder |
```

---

#### Issue 7: Missing `runtime.atom` Method Details

**Location**: Section 2, "Runtime Creation" table

**Claim**: The signature shown is simplified.

**Reality**: `runtime.atom` (from RuntimeProto.atom, line 198-207) has multiple overloads supporting:
- Effect with initialValue option
- Stream with initialValue option
- Function that returns Effect or Stream

**Correction**: Document the full overloaded signatures.

---

#### Issue 8: Incorrect `runtime.addGlobalLayer` Description

**Location**: Section 2, "Runtime Creation" table

**Claim**:
```typescript
| `runtime.addGlobalLayer` | `<R, E>(layer: Layer<R, E>) => void` | Add layer to all runtimes created by factory |
```

**Reality**: This is on the `RuntimeFactory` interface (line 637), not on an individual runtime. The synthesis conflates `AtomRuntime` with `RuntimeFactory`.

**Correction**: Clarify that `addGlobalLayer` is a method on `RuntimeFactory` (returned by `Atom.context()`), not on individual `AtomRuntime` instances.

---

#### Issue 9: Missing Important Atom Combinators

**Location**: Section 2, Atom Creation table

**Missing APIs**:
- `Atom.keepAlive` - Prevent cleanup (line 1413-1417)
- `Atom.autoDispose` - Revert keepAlive (line 1428-1432)
- `Atom.setIdleTTL` - Configure idle timeout (line 157-171)
- `Atom.withLabel` - Add debugging label (line 1451-1461)
- `Atom.debounce` - Debounce atom updates (line 1551-1576)
- `Atom.optimistic` - Optimistic updates (line 1582-1670)
- `Atom.withFallback` - Provide fallback for Result atoms (line 1365-1407)
- `Atom.transform` - Transform atom read function (line 1479-1506)
- `Atom.mapResult` - Map over Result success value (line 1529-1545)
- `Atom.windowFocusSignal` - Window focus tracking (line 1746-1758)
- `Atom.refreshOnWindowFocus` - Refresh on window focus (line 1776-1778)
- `Atom.kvs` - KeyValueStore backed atom (line 1788-1828)
- `Atom.subscriptionRef` - Create from SubscriptionRef (line 879-901)
- `Atom.subscribable` - Create from Subscribable (line 911-952)
- `Atom.fnSync` - Synchronous function atom (line 993-1035)
- `Atom.toStream` - Convert atom to Stream (line 1924-1925)
- `Atom.get` - Effect to get atom value (line 1938-1939)
- `Atom.set` - Effect to set atom value (line 1960-1967)
- `Atom.serializable` - Add serialization support (line 2036-2057)
- `Atom.withServerValue` - Override server-side value (line 2071-2081)

**Correction**: Add these to the API reference or at least mention their existence.

---

#### Issue 10: Incorrect Jotai Comparison - `atomFamily` Import

**Location**: Section 4, "Import Differences" table

**Claim**:
```
| **Utilities import** | `import { atomFamily, atomWithStorage } from 'jotai/utils'` |
```

**Reality**: Jotai's `atomFamily` is from `jotai/utils`, but the comparison is misleading because effect-atom's `Atom.family` has different semantics (uses WeakRef + FinalizationRegistry for memory management, line 1324-1359).

**Correction**: Note the semantic difference, not just the import path difference.

---

### Minor Issues

#### Issue 11: Missing `useAtomRefProp` and `useAtomRefPropValue` Hooks

**Location**: Section 2, "React Hooks" table

**Issue**: These hooks exist (lines 302-310 in Hooks.ts) but are not documented.

---

#### Issue 12: Incomplete `WriteContext` API

**Location**: Section 2, "Atom Context API" table

**Claim**: Write context has `ctx.refreshSelf()`.

**Reality**: The actual `WriteContext` interface (line 146-151 in Atom.ts) is:
```typescript
export interface WriteContext<A> {
  get<T>(this: WriteContext<A>, atom: Atom<T>): T
  refreshSelf(this: WriteContext<A>): void
  setSelf(this: WriteContext<A>, a: A): void
  set<R, W>(this: WriteContext<A>, atom: Writable<R, W>, value: W): void
}
```

This is correct, but the `Context` interface (read context) also has `refreshSelf` (line 121), which could cause confusion.

---

#### Issue 13: Missing `AtomRpc` and `AtomHttpApi` Modules

**Location**: Section 2

**Issue**: The library exports these modules but they're not documented:
```typescript
export * as AtomHttpApi from "./AtomHttpApi.js"
export * as AtomRpc from "./AtomRpc.js"
```

These provide Effect Platform integration for HTTP APIs and RPC.

---

## 4. Missing Content

### Critical Missing Content

1. **`AtomRef` Module**: Complete module for imperative atom references, useful for integration with non-React code.

2. **`Hydration` Module**: SSR hydration support - critical for Next.js applications in beep-effect.

3. **`AtomRpc` and `AtomHttpApi` Modules**: Effect Platform integration modules that may be useful for the beep-effect codebase.

4. **Serialization Support**: `Atom.serializable()`, `Atom.withServerValue()`, and related SSR patterns.

5. **`Atom.Reset` and `Atom.Interrupt` Symbols**: Used for controlling function atoms (line 1047-1065).

### Important Missing Patterns

1. **Promise Mode in `useAtomSet`**: The hook supports `mode: "promise" | "promiseExit"` options (line 149-169 in Hooks.ts) for awaiting async atom completion.

2. **`Atom.optimistic` Pattern**: Built-in optimistic update support (line 1582-1670).

3. **`Atom.withFallback` Pattern**: Composing atoms with fallback values (line 1365-1407).

4. **`Atom.kvs` Pattern**: KeyValueStore-backed persistent atoms.

5. **`Atom.windowFocusSignal` and `refreshOnWindowFocus`**: Automatic refresh on window focus patterns.

---

## 5. Recommendations

### High Priority

1. **Fix `makeAtomRuntime` References**: Replace all references with the correct `Atom.context()` pattern and clarify that `makeAtomRuntime` is a beep-effect local name.

2. **Fix `Atom.runtime` Description**: Clarify it's a pre-created `RuntimeFactory` using default settings, not a function that takes a Layer.

3. **Add `AtomRef` and `Hydration` Modules**: These are important for SSR and imperative integration.

4. **Fix `runtime.fn` Signature**: The actual API is significantly different from documented.

### Medium Priority

5. **Document Missing Combinators**: Add `Atom.keepAlive`, `Atom.autoDispose`, `Atom.debounce`, `Atom.optimistic`, `Atom.withFallback`, etc.

6. **Add Promise Mode to Hooks**: Document the `mode` option in `useAtomSet` and `useAtom`.

7. **Clarify RuntimeFactory vs AtomRuntime**: The synthesis conflates these. `Atom.context()` returns `RuntimeFactory`, calling it with a Layer returns `AtomRuntime`.

### Low Priority

8. **Add `useAtomRefProp` and `useAtomRefPropValue` Hooks**: Complete hook documentation.

9. **Document `AtomRpc` and `AtomHttpApi`**: May be useful for advanced integrations.

10. **Add More Edge Case Patterns**: Document `Atom.Reset`, `Atom.Interrupt`, `FnContext` interface.

---

## 6. Conclusion

The synthesis document provides a solid foundation for understanding effect-atom but contains several inaccuracies that could mislead developers. The most critical issue is the confusion around `makeAtomRuntime` (a beep-effect local name) vs `Atom.context()` (the actual library export). The `runtime.fn` signature and `Atom.runtime` description also need correction.

After addressing the issues listed above, the document will serve as an excellent Claude Code skill reference for guiding developers from Jotai patterns to correct effect-atom usage.
