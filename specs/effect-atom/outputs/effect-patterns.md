# Effect Patterns Research: State Management & React Integration

**Research Date**: 2026-01-14
**Focus**: Effect-based state management philosophy and React integration patterns

---

## 1. Effect Service + React Bridge Patterns

### Context Provider Pattern (Most Common)

The primary pattern for bridging Effect services to React:

```tsx
// 1. Create Effect Runtime at app root
import { ManagedRuntime, Layer } from "effect"

const AppLive = Layer.mergeAll(
  DatabaseLive,
  AuthServiceLive,
  ApiClientLive,
)

const runtime = ManagedRuntime.make(AppLive)

// 2. Expose via React Context
const RuntimeContext = React.createContext<typeof runtime>(null!)

function RuntimeProvider({ children }) {
  const runtimeRef = React.useRef(runtime)

  React.useEffect(() => {
    return () => {
      void runtimeRef.current.dispose()
    }
  }, [])

  return (
    <RuntimeContext.Provider value={runtimeRef.current}>
      {children}
    </RuntimeContext.Provider>
  )
}

// 3. Custom hook for consuming
function useRuntime() {
  return React.useContext(RuntimeContext)
}

function useEffectQuery<A, E>(effect: Effect.Effect<A, E, AppServices>) {
  const runtime = useRuntime()
  const [state, setState] = React.useState<Result<A, E>>(Result.initial())

  React.useEffect(() => {
    runtime.runPromise(effect)
      .then(a => setState(Result.success(a)))
      .catch(e => setState(Result.failure(e)))
  }, [effect, runtime])

  return state
}
```

### Effect-RPC Pattern (For Remote Services)

```typescript
// Client-server communication via @effect/rpc
import * as Rpc from "@effect/rpc"
import * as HttpClient from "@effect/platform/HttpClient"

// Define RPC schema
const UserRouter = Rpc.make({
  getUser: Rpc.schema({
    input: S.Struct({ id: S.String }),
    output: S.Struct({ name: S.String, email: S.String })
  })
})

// Server: resolver runs in Effect Runtime
const resolver = Rpc.toHandler(UserRouter, {
  getUser: ({ id }) =>
    Effect.gen(function* () {
      const db = yield* Database
      return yield* db.users.findById(id)
    })
})

// Client: wrap RPC calls
const client = Rpc.make(UserRouter, {
  client: HttpClient.fetchOk
})

// React hook
function useUser(id: string) {
  const [user, setUser] = React.useState(null)

  React.useEffect(() => {
    client.getUser({ id })
      .pipe(Effect.runPromise)
      .then(setUser)
  }, [id])

  return user
}
```

---

## 2. State Management Philosophy

### Effect's Core Approach

**Immutable by Default**:
```typescript
// State changes via Ref.update, returning new Effect
const counter = yield* Ref.make(0)
yield* Ref.update(counter, n => n + 1) // Returns Effect, doesn't mutate
```

**Explicit Dependencies**:
```typescript
// Services declared via Context.Tag
class Logger extends Context.Tag("Logger")<Logger, {
  log: (msg: string) => Effect.Effect<void>
}>() {}

const program = Effect.gen(function* () {
  const logger = yield* Logger // Explicit dependency
  yield* logger.log("Hello")
})
```

**Lazy Evaluation**:
```typescript
// Effects describe computations, don't execute until run
const computation = Effect.gen(function* () {
  yield* Effect.sleep("1 second")
  return 42
})
// Nothing happens yet...

Effect.runPromise(computation) // Now it executes
```

**Composable**:
```typescript
// State effects compose with other effects
const fetchWithRetry = pipe(
  fetchData,
  Effect.retry({ times: 3 }),
  Effect.timeout("5 seconds"),
  Effect.tap(data => logService.info(`Fetched: ${data}`))
)
```

### Why @effect-atom Exists

The fundamental tension: **React needs reactive primitives (useState/useReducer), Effect provides computational purity**

1. **Bridges Effect services to reactive UI**:
   - React components re-render on state changes
   - Effect services are computational pipelines
   - @effect-atom provides reactive subscriptions over Effect values

2. **Manages Effect Runtime lifecycle**:
   - React components mount/unmount unpredictably
   - Effect Runtimes need explicit disposal
   - @effect-atom handles Runtime creation/disposal in component lifecycle

3. **Subscription patterns**:
   - Converts Effect Streams/SubscriptionRefs into React state
   - Automatic cleanup on unmount
   - Efficient re-renders (only when values change)

4. **Type-safe access**:
   - Exposes Effect services to React with full type safety
   - Service dependencies visible in types
   - Compile-time verification of requirements

---

## 3. Integration Considerations

### Layer Composition

```typescript
// Effect layers compose naturally
const AppLive = Layer.mergeAll(
  DatabaseLive,
  AuthServiceLive,
  ApiClientLive,
)

// Provide to runtime once
const runtime = ManagedRuntime.make(AppLive)

// All effects can access these services
const program = Effect.gen(function* () {
  const db = yield* Database
  const auth = yield* AuthService
  const api = yield* ApiClient
  // Use all services...
})
```

### Runtime Lifecycle

```tsx
// Create runtime once at app boundary
const runtime = ManagedRuntime.make(AppLive)

// Provide to React tree
function App() {
  return (
    <RuntimeProvider runtime={runtime}>
      <YourApp />
    </RuntimeProvider>
  )
}

// Dispose on unmount
React.useEffect(() => {
  return () => {
    void runtime.dispose()
  }
}, [])

// AVOID: Creating per-component runtimes (expensive!)
function BadComponent() {
  // DON'T DO THIS
  const runtime = React.useMemo(() => ManagedRuntime.make(ServiceLive), [])
}
```

### Error Handling

```typescript
// Effect failures flow to React via promises
const result = await runtime.runPromise(
  Effect.gen(function* () {
    const data = yield* fetchData
    if (!data) {
      return yield* Effect.fail(new NotFoundError())
    }
    return data
  })
)

// Use Effect.either for explicit error handling
const either = await runtime.runPromise(
  Effect.either(riskyOperation)
)

if (Either.isLeft(either)) {
  // Handle error
  console.error(either.left)
} else {
  // Use success value
  return either.right
}

// React Error Boundaries catch unhandled failures
class EffectErrorBoundary extends React.Component {
  componentDidCatch(error) {
    if (error instanceof EffectError) {
      // Log to telemetry
    }
  }
}
```

---

## 4. Critical Patterns for @effect-atom

### Atom as Effect Service Bridge

Atoms should wrap Effect services, not replace them:

```typescript
// CORRECT: Atom wraps Effect service
const sessionAtom = runtime.atom(
  Effect.gen(function* () {
    const sessionService = yield* SessionService
    return yield* sessionService.getCurrentSession()
  })
)

// WRONG: Atom replaces Effect logic
const sessionAtom = Atom.make(async () => {
  const response = await fetch('/api/session')
  return response.json()
})
```

### Ref-backed Atoms

Use Effect's `Ref.make()` in services, expose via atom hook:

```typescript
// Effect service with Ref
const CounterService = Effect.gen(function* () {
  const counter = yield* Ref.make(0)

  return {
    get: Ref.get(counter),
    increment: Ref.update(counter, n => n + 1),
    decrement: Ref.update(counter, n => n - 1),
  }
})

// Atom exposes reactive access
const counterAtom = runtime.atom(
  Effect.gen(function* () {
    const service = yield* CounterService
    return yield* service.get
  })
)
```

### Stream Subscriptions

Convert `Stream.subscribe()` to React state via atom:

```typescript
// Effect Stream of events
const eventsStream = Stream.unwrap(
  Effect.gen(function* () {
    const api = yield* EventsApi
    return api.subscribe()
  })
)

// Atom for latest event
const latestEventAtom = runtime.atom(
  Stream.runLast(eventsStream)
)

// Atom for all events (accumulated)
const allEventsAtom = Atom.make((get) => {
  const [events, setEvents] = React.useState<Event[]>([])

  get.stream(eventsStream).pipe(
    Stream.tap(event =>
      Effect.sync(() => setEvents(prev => [...prev, event]))
    ),
    Stream.runDrain
  )

  return events
})
```

### Scope Management

Atoms handle Scope creation/disposal automatically:

```typescript
// Effect with resource that needs cleanup
const connectionAtom = runtime.atom(
  Effect.gen(function* () {
    const connection = yield* Effect.acquireRelease(
      WebSocket.connect("ws://..."),
      (conn) => conn.close()
    )
    return connection
  })
)

// When atom unmounts, connection is closed automatically
// No manual cleanup needed in components
```

---

## 5. Architectural Principles

### @effect-atom Should:

- **Be a thin React adapter** over Effect services
- **Handle Runtime lifecycle** automatically
- **Provide reactive primitives** (useState-like API)
- **Support Layer composition** for service dependencies
- **Integrate with Result type** for async state

### @effect-atom Should NOT:

- **Replace Effect's core state primitives** (Ref, Stream)
- **Encourage bypassing Effect services**
- **Create per-component runtimes**
- **Hide Effect's type system**

---

## 6. Comparison with Other State Libraries

| Feature            | @effect-atom | Jotai     | Zustand   | Redux      |
|--------------------|--------------|-----------|-----------|------------|
| Effect integration | Native       | None      | None      | None       |
| Runtime required   | Yes          | No        | No        | Store      |
| Type-safe errors   | Yes (Result) | No        | No        | No         |
| Service injection  | Layers       | Context   | None      | Middleware |
| Async handling     | Effect       | Promise   | Promise   | Thunks     |
| Subscriptions      | Automatic    | Automatic | Selector  | Selector   |
| SSR support        | Via Layer    | Provider  | Hydration | Provider   |

---

## 7. Summary

The @effect-atom library exists to bridge the gap between Effect's computational model and React's reactive needs:

1. **Effect provides**: Pure computations, explicit dependencies, resource safety, composability
2. **React needs**: Reactive state, automatic re-renders, component lifecycle integration
3. **@effect-atom bridges**: Wraps Effect services in reactive atoms, handles lifecycle, provides hooks

The key insight is that @effect-atom is NOT a replacement for Effect's state primitives—it's an adapter that exposes them to React's rendering model while preserving Effect's guarantees.

For the beep-effect codebase, this means:
- Use Effect services for business logic
- Use @effect-atom to expose state to React
- Use Layers for dependency composition
- Use Result type for async state representation
