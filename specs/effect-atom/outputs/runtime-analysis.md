# Runtime Analysis: makeAtomRuntime & useAtomMount Patterns

**Analysis Date**: 2026-01-14
**Target Files**:
- `packages/runtime/client/src/runtime.ts`
- `packages/runtime/client/src/services/ka-services.ts`
- `./tmp/effect-atom` (library source)

---

## 1. makeAtomRuntime Definition

### Location
`/home/elpresidank/YeeBois/projects/beep-effect/packages/runtime/client/src/runtime.ts`

### Implementation

```typescript
export const makeAtomRuntime = Atom.context({
  memoMap: Atom.defaultMemoMap,
});
makeAtomRuntime.addGlobalLayer(clientRuntimeLayer);
export const clientRuntime = ManagedRuntime.make(clientRuntimeLayer);
```

### Function Signature (from effect-atom library)

```typescript
// From Atom.ts
export const context = (options: {
  memoMap: Layer.MemoMap
}): RuntimeFactory => {
  // Returns a callable factory that:
  // 1. Accepts Layer.Layer instances
  // 2. Returns AtomRuntime<R, E>
}
```

### RuntimeFactory Interface

```typescript
interface RuntimeFactory {
  // Create runtime from a Layer
  <R, E>(layer: Layer.Layer<R, E>): AtomRuntime<R, E>

  // Add layer to all runtimes created by this factory
  addGlobalLayer<R, E>(layer: Layer.Layer<R, E>): void

  // Create atom backed by Effect
  atom<A, E, R>(effect: Effect.Effect<A, E, R>): Atom<Result.Result<A, E>>

  // Create function atom
  fn<Args, A, E, R>(fn: (...args: Args) => Effect.Effect<A, E, R>): FunctionAtom
}
```

### Dependencies

1. **`Atom.defaultMemoMap`**: Layer memoization map for caching layer builds
2. **`clientRuntimeLayer`**: Composed Effect Layer providing all client services
3. **Effect's `ManagedRuntime`**: For lifecycle management

### clientRuntimeLayer Composition

```typescript
// From layer.ts
export const clientRuntimeLayer = Layer.mergeAll(
  Layer.provideMerge(ToasterService.Default, Registry.layer),
  HttpClientLive,
  ObservabilityLive,
  NetworkMonitorLive,
  WorkerClientLive,
  BrowserKeyValueStore.layerLocalStorage,
  GeoLocationLive
).pipe(
  Layer.provide(LogLevelLive),
  Layer.provideMerge(Layer.setConfigProvider(configProvider))
);
```

**Key observation**: `Registry.layer` from effect-atom is explicitly included, making it a critical service dependency.

---

## 2. useAtomMount Pattern

### Usage Location
`/home/elpresidank/YeeBois/projects/beep-effect/packages/runtime/client/src/services/ka-services.ts`

### Implementation

```typescript
const kaRuntime = makeAtomRuntime(WorkerClient.Default);

export const KaServices: React.FC = () => {
  useAtomMount(kaRuntime);
  return null;
};
```

### Hook Implementation (from effect-atom library)

```typescript
// From Hooks.ts
export const useAtomMount = <A>(atom: Atom.Atom<A>): void => {
  const registry = React.useContext(RegistryContext)
  mountAtom(registry, atom)
}

function mountAtom<A>(registry: Registry.Registry, atom: Atom.Atom<A>): void {
  React.useEffect(() => registry.mount(atom), [atom, registry])
}
```

### What it does

1. Retrieves the current Registry from React context
2. Calls `registry.mount(atom)` inside a useEffect
3. Mounting subscribes the atom to the registry and initializes its value
4. Returns a cleanup function that disposes subscriptions

### Integration Pattern

- Runtime passed to `useAtomMount` is a React component (React.FC) that returns null
- Used as a silent initializer for services that don't need to render UI
- Must be placed inside a component tree with access to RegistryContext

---

## 3. Provider Setup Hierarchy

### Base Registry Context (effect-atom library)

```tsx
// From RegistryContext.tsx
export const RegistryContext = React.createContext<Registry.Registry>(
  Registry.make({
    scheduleTask,
    defaultIdleTTL: 400
  })
)

export const RegistryProvider = (options: {
  readonly children?: React.ReactNode | undefined
  readonly initialValues?: Iterable<readonly [Atom.Atom<any>, any]> | undefined
  readonly scheduleTask?: ((f: () => void) => void) | undefined
  readonly timeoutResolution?: number | undefined
  readonly defaultIdleTTL?: number | undefined
}) => {
  const registry = React.useMemo(
    () => Registry.make({
      scheduleTask: options.scheduleTask ?? scheduleTask,
      timeoutResolution: options.timeoutResolution,
      defaultIdleTTL: options.defaultIdleTTL
    }),
    []
  )

  // Handle initial values
  React.useEffect(() => {
    if (options.initialValues) {
      for (const [atom, value] of options.initialValues) {
        registry.set(atom, value)
      }
    }
  }, [registry, options.initialValues])

  return (
    <RegistryContext.Provider value={registry}>
      {options.children}
    </RegistryContext.Provider>
  )
}
```

### Effect Runtime Provider (beep-effect)

```tsx
// RuntimeProvider - Manages Effect ManagedRuntime lifecycle
export const RuntimeProvider: React.FC<{
  children: React.ReactNode;
  runtime: LiveManagedRuntime;
}> = ({ children, runtime }) => {
  const mountRef = React.useRef(false);

  React.useEffect(() => {
    if (!mountRef.current) {
      mountRef.current = true;
      return constVoid;
    }

    return () => {
      void runtime.dispose();
    };
  }, [runtime]);

  return (
    <RuntimeContext.Provider value={runtime}>
      {children}
    </RuntimeContext.Provider>
  );
};
```

### Top-level Provider (beep-effect)

```tsx
export const BeepProvider: React.FC<BeepProviderProps> = ({ children }) => {
  const runtime: LiveManagedRuntime = React.useMemo(
    () => ManagedRuntime.make(clientRuntimeLayer),
    []
  );

  return (
    <RuntimeProvider runtime={runtime}>
      {children}
    </RuntimeProvider>
  );
};
```

---

## 4. Critical Differences from Jotai

| Aspect                   | Jotai                                   | effect-atom                                   |
|--------------------------|-----------------------------------------|-----------------------------------------------|
| **Runtime concept**      | No runtime; atoms are simple primitives | Atoms wrap Effect Layer for service injection |
| **Provider**             | Optional (only for SSR/isolation)       | **REQUIRED** - RegistryProvider               |
| **Service integration**  | Props drilling or Context API           | Effect Layer composition                      |
| **Initialization**       | Atoms initialize on first read          | Must call `registry.mount()` explicitly       |
| **Effect execution**     | N/A - no effect system                  | Atoms contain Effect.Effect computations      |
| **Lifecycle management** | None - atoms are pure values            | ManagedRuntime handles resource cleanup       |
| **Memoization**          | Simple WeakMap per atom                 | Layer.MemoMap for caching layer builds        |
| **Data fetching**        | Manual async in atom                    | Native Effect integration via Layer           |
| **Error handling**       | Promise rejection                       | `Result<A, E>` with Cause                     |

### Why Jotai Patterns FAIL with effect-atom

```typescript
// WRONG - Jotai pattern
import { atom, useAtom } from 'jotai' // Wrong import!
const countAtom = atom(0) // Wrong creation!
function Counter() {
  const [count, setCount] = useAtom(countAtom) // Will fail!
}

// CORRECT - effect-atom pattern
import { Atom } from '@effect-atom/atom'
import { useAtomValue, useAtomSet } from '@effect-atom/atom-react'
const countAtom = Atom.make(0)
function Counter() {
  const count = useAtomValue(countAtom)
  const setCount = useAtomSet(countAtom)
}
```

---

## 5. Module-Specific Runtime Pattern

### Files Module Example

```typescript
// packages/shared/client/src/atom/files/runtime.ts
export const runtime = makeAtomRuntime(
  Layer.mergeAll(
    FilesApi.layer,
    BrowserHttpClient.layerXMLHttpRequest,
    FilesEventStream.layer,
    FileSync.layer,
    ImageCompressionClient.layer,
    FilePicker.layer,
    UploadRegistry.Default,
  )
);
```

### Session Module Example

```typescript
// packages/iam/client/src/clients/session/session.atoms.ts
const runtime = makeAtomRuntime(SessionService.Default);

const remoteSessionAtom = runtime.atom(SessionService.session);

const sessionAtom = Atom.writable(
  (get: Atom.Context) => get(remoteSessionAtom),
  (_, action: Action) => {
    // Handle session actions
  }
);

export const useSession = () => ({
  sessionResult: useAtomValue(sessionAtom),
});
```

---

## 6. Key Architectural Observations

### Three-Tier Provider Setup

1. **ManagedRuntime (Effect level)**: Created via `BeepProvider`, manages Effect services
2. **RuntimeProvider**: Wraps the tree, provides runtime via Context
3. **RegistryProvider (implicit)**: Created by effect-atom's hooks, manages atom state

### Layer Composition Flow

```
clientRuntimeLayer
    ├── Registry.layer (effect-atom)
    ├── HttpClientLive
    ├── ObservabilityLive
    ├── NetworkMonitorLive
    ├── WorkerClientLive
    ├── BrowserKeyValueStore
    └── GeoLocationLive
```

### Runtime Lifecycle

1. `BeepProvider` creates `ManagedRuntime.make(clientRuntimeLayer)`
2. `RuntimeProvider` provides runtime via Context, handles disposal on unmount
3. Module runtimes (files, session) compose additional layers
4. `useAtomMount` activates service-backed atoms
5. Atoms subscribe to registry, trigger re-renders on changes

---

## 7. Summary

The effect-atom runtime in beep-effect provides sophisticated state management that:

1. **Bridges Effect and React**: Atoms wrap Effect Layers, enabling service injection into component state
2. **Explicit initialization**: Unlike Jotai, atoms must be mounted to start their lifecycles
3. **Resource safety**: ManagedRuntime ensures all Effect services are properly disposed
4. **Memoized builds**: Layer builds are cached via MemoMap to avoid rebuilding identical layers
5. **Hierarchical context**: Registry context supports per-provider atom scoping

The pattern enables powerful abstractions like `useSession()` which seamlessly merges Effect service execution with React component state management.
