# External Research: @effect-atom/atom-react

**Research Date**: 2026-01-14
**Library Version**: 0.19.0 (latest on NPM)
**Maintainer**: Tim Smart (@tim-smart)

---

## Executive Summary

`@effect-atom/atom-react` is an Effect-native state management library that brings reactive atoms to React applications with full Effect runtime integration. Unlike jotai (which inspired its API surface), this library is built from the ground up using Effect primitives, requiring an Effect runtime and providing deep integration with Effect's type system, error handling, and dependency injection.

**Key Insight**: This is NOT a jotai wrapper—it's a ground-up Effect implementation that happens to use similar naming conventions for familiarity.

---

## 1. Core Concepts

### What is effect-atom?

`effect-atom` is a state management library that provides reactive atoms for React applications, deeply integrated with the Effect ecosystem. It consists of two packages:

1. **`@effect-atom/atom`** - Core atom primitives and runtime
2. **`@effect-atom/atom-react`** - React bindings and hooks

### Fundamental Architecture

**Atoms are Effect Values**:
```typescript
// An atom is an Effect that produces a value
const countAtom = Atom.make(0)
// Type: Effect<Atom<number>, never, never>
```

**Runtime Requirement**:
Unlike jotai, effect-atom requires an explicit Effect runtime:
```typescript
const runtime = makeAtomRuntime(Effect.runSync)
// Must be provided via AtomProvider
```

**Subscription Model**:
Atoms use Effect's `SubscriptionRef` internally, providing:
- Automatic dependency tracking
- Efficient re-renders (only when atom values change)
- Integration with Effect's fiber system
- Built-in memory management via fiber cleanup

---

## 2. Primary Exports

### From `@effect-atom/atom-react`

#### Context & Provider

| Export             | Type                        | Purpose                                   |
|--------------------|-----------------------------|-------------------------------------------|
| `RegistryContext`  | `React.Context<Registry>`   | Context for accessing atom registry       |
| `RegistryProvider` | `React.FC<ProviderOptions>` | Provider component for injecting registry |

#### Hooks

| Hook               | Signature                                          | Purpose                                     |
|--------------------|----------------------------------------------------|---------------------------------------------|
| `useAtomValue`     | `<A>(atom: Atom<A>) => A`                          | Subscribe to atom value, triggers re-render |
| `useAtomSet`       | `<A>(atom: WritableAtom<A>) => (value: A) => void` | Get setter function                         |
| `useAtom`          | `<A>(atom: Atom<A>) => [A, Setter<A>]`             | Combined value and setter                   |
| `useAtomRefresh`   | `<A>(atom: Atom<A>) => () => void`                 | Get refresh function                        |
| `useAtomSuspense`  | `<A>(atom: Atom<A>) => A`                          | Suspense integration                        |
| `useAtomSubscribe` | `<A>(atom: Atom<A>, fn) => void`                   | Subscribe to changes                        |
| `useAtomMount`     | `<A>(atom: Atom<A>) => void`                       | Manually mount atom                         |

### From `@effect-atom/atom` (Core)

| Export          | Type                                                     | Purpose                               |
|-----------------|----------------------------------------------------------|---------------------------------------|
| `Atom.make`     | `<A>(initial: A \| (get) => A) => Atom<A>`               | Create read-only atom                 |
| `Atom.writable` | `<A>(read, write) => WritableAtom<A>`                    | Create mutable atom                   |
| `Atom.family`   | `<K, V>(fn: (key: K) => Atom<V>) => (key: K) => Atom<V>` | Parameterized atom factory            |
| `Atom.context`  | `(options) => RuntimeFactory`                            | Create runtime factory                |
| `Atom.runtime`  | `(layer) => AtomRuntime`                                 | Create runtime from Layer             |
| `Atom.fn`       | `(effect) => FunctionAtom`                               | Create function atom for side effects |

---

## 3. Usage Patterns

### Basic Setup

#### 1. Create Runtime with Layers
```typescript
import { Atom } from "@effect-atom/atom"
import { Layer } from "effect"

const runtime = Atom.context({ memoMap: Atom.defaultMemoMap })
runtime.addGlobalLayer(MyServiceLayer)
```

#### 2. Create Atoms
```typescript
// Simple atom
const countAtom = Atom.make(0)

// Writable atom with read/write functions
const userAtom = Atom.writable(
  (get) => get(remoteUserAtom),
  (ctx, update) => ctx.setSelf(update)
)

// Function atom for side effects
const fetchUserAtom = runtime.fn(
  Effect.gen(function* () {
    const api = yield* UserApi
    return yield* api.fetchUser()
  })
)
```

#### 3. Use in Components
```tsx
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react"

function Counter() {
  const count = useAtomValue(countAtom)
  const setCount = useAtomSet(countAtom)

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

---

## 4. Effect Integration

### Deep Runtime Integration

**1. Layer Composition**:
```typescript
const runtime = Atom.context({ memoMap: Atom.defaultMemoMap })
runtime.addGlobalLayer(
  Layer.mergeAll(
    HttpClient.layer,
    AuthService.layer,
    DatabaseService.layer,
  )
)
```

**2. Service-Backed Atoms**:
```typescript
const sessionAtom = runtime.atom(
  Effect.gen(function* () {
    const sessionService = yield* SessionService
    return yield* sessionService.getCurrentSession()
  })
)
```

**3. Stream Integration**:
```typescript
const eventsAtom = runtime.atom(
  Stream.unwrap(
    Effect.gen(function* () {
      const api = yield* EventsApi
      return api.subscribe()
    })
  )
)
```

---

## 5. Critical Differences from Jotai

### API Surface Differences

| Feature           | Jotai                                     | effect-atom                              |
|-------------------|-------------------------------------------|------------------------------------------|
| **Atom Creation** | `atom(initialValue)`                      | `Atom.make(initialValue)`                |
| **Runtime**       | Implicit (Provider optional)              | **REQUIRED** - explicit runtime/registry |
| **Read Hook**     | `useAtom(atom)` returns `[value, setter]` | `useAtomValue(atom)` returns value only  |
| **Write Hook**    | Part of `useAtom` tuple                   | `useAtomSet(atom)` - separate hook       |
| **Derived Atoms** | `atom((get) => get(other) * 2)`           | `Atom.make((get) => get(other) * 2)`     |
| **Async Atoms**   | `atom(async (get) => ...)`                | `runtime.atom(Effect.gen(...))`          |
| **Families**      | `atomFamily((param) => atom(...))`        | `Atom.family((param) => Atom.make(...))` |

### Fundamental Architectural Differences

#### 1. **Effect-First Philosophy**
**Jotai**: Atoms are plain JavaScript values with optional async
```typescript
// Jotai - Promise-based
const userAtom = atom(async (get) => {
  const response = await fetch(`/api/users/${get(userIdAtom)}`)
  return response.json()
})
```

**effect-atom**: Atoms are Effect programs
```typescript
// effect-atom - Effect-based
const userAtom = runtime.atom(
  Effect.gen(function* () {
    const api = yield* UserApi
    const id = yield* Effect.sync(() => userId)
    return yield* api.fetchUser(id)
  })
)
```

#### 2. **Runtime Requirements**
**Jotai**: Runtime is implicit
```tsx
// Jotai - works without Provider
function App() {
  return <Counter /> // Just works
}
```

**effect-atom**: Runtime is REQUIRED
```tsx
// effect-atom - MUST have registry context
function App() {
  return (
    <RegistryProvider>
      <Counter />
    </RegistryProvider>
  )
}
```

#### 3. **Result Type Pattern**
**Jotai**: Uses standard Promise states (pending/resolved/rejected)

**effect-atom**: Uses `Result<A, E>` discriminated union
```typescript
Result.Initial     // Not yet computed
Result.Success<A>  // Successfully computed
Result.Failure<E>  // Failed with error
```

#### 4. **Hook Return Values**
**Jotai**: `useAtom` returns tuple
```typescript
const [count, setCount] = useAtom(countAtom)
```

**effect-atom**: Separate hooks for read/write
```typescript
const count = useAtomValue(countAtom)
const setCount = useAtomSet(countAtom)
// OR combined:
const [count, setCount] = useAtom(countAtom)
```

---

## 6. When to Use effect-atom vs Jotai

### Use effect-atom if:
- Already using Effect in your application
- Need service dependency injection in state
- Want type-safe error handling in state derivation
- Building complex async workflows with retries/timeouts
- Need testable state logic with Layer mocking
- Want integration with Effect's observability

### Use Jotai if:
- Simpler state management needs
- Not using Effect ecosystem
- Want minimal bundle size
- Prefer Promise-based async
- Need mature ecosystem with more resources
- Want implicit runtime (less boilerplate)

---

## 7. Conclusion

`@effect-atom/atom-react` is a **purpose-built state management solution for Effect-based React applications**. While it shares some API naming with jotai for familiarity, it is architecturally distinct—built from the ground up using Effect primitives.

**Key Takeaway**: This is not a wrapper or alternative to jotai; it's an Effect-native solution that happens to use similar hook names. The fundamental difference lies in the execution model: jotai uses imperative JavaScript with Promises, while effect-atom uses declarative Effect programs with full type-safe error handling and dependency injection.

---

## References

- **GitHub**: https://github.com/tim-smart/effect-atom
- **NPM**: https://www.npmjs.com/package/@effect-atom/atom-react
- **Effect Ecosystem**: https://effect.website
