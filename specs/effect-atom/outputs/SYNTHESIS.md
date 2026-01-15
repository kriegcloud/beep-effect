# Effect-Atom Synthesis: Comprehensive Claude Code Skill Guide

**Synthesis Date**: 2026-01-14
**Purpose**: Complete reference for creating a Claude Code skill that helps developers avoid Jotai patterns when using @effect-atom/atom-react
**Sources**: External research, library analysis, runtime patterns, Effect integration research

---

## 1. Library Overview

### What is @effect-atom/atom-react?

`@effect-atom/atom-react` is an Effect-native state management library that brings reactive atoms to React applications with full Effect runtime integration. It consists of two packages:

1. **`@effect-atom/atom`** - Core atom primitives, runtime factory, and registry
2. **`@effect-atom/atom-react`** - React bindings (hooks, provider, context)

**Current Version**: 0.19.0 (NPM)
**Maintainer**: Tim Smart (@tim-smart)
**Repository**: https://github.com/tim-smart/effect-atom

### Why It Exists

The library bridges the gap between Effect's computational model and React's reactive needs:

| Effect Provides                | React Needs           | @effect-atom Bridges                        |
|--------------------------------|-----------------------|---------------------------------------------|
| Pure computations              | Reactive state        | Atoms as SubscriptionRef wrappers           |
| Explicit dependencies (Layers) | Component state       | Runtime-backed atoms with service injection |
| Resource safety (Scope)        | Lifecycle integration | Automatic cleanup on unmount                |
| Lazy evaluation                | Automatic re-renders  | Subscription-based updates                  |
| Streams/Refs                   | useState-like API     | Result type + reactive hooks                |

### Key Architectural Decisions

1. **Effect-First Philosophy**: Atoms are Effect programs, not plain JavaScript values
2. **Explicit Runtime**: Requires `makeAtomRuntime()` with Layer composition (unlike Jotai's implicit runtime)
3. **SubscriptionRef Internals**: Uses Effect's `SubscriptionRef` for efficient reactive state
4. **Result Type Pattern**: Async atoms return `Result<A, E>` (Initial/Success/Failure) instead of Promise states
5. **Service Integration**: Deep integration with Effect's Context.Tag and Layer system
6. **Separation of Concerns**: Separate hooks for read (`useAtomValue`) and write (`useAtomSet`)

---

## 2. Core API Reference

### Atom Creation (from `@effect-atom/atom`)

| Export             | Signature                                                | Description                                            |
|--------------------|----------------------------------------------------------|--------------------------------------------------------|
| `Atom.make`        | `<A>(init: A \| (get: Context) => A) => Atom<A>`         | Create read-only atom (most common)                    |
| `Atom.readable`    | `<A>(read: (get) => A) => Atom<A>`                       | Explicit read-only atom (alias for clarity)            |
| `Atom.writable`    | `<A>(read, write) => WritableAtom<A>`                    | Create mutable atom with read/write functions          |
| `Atom.family`      | `<K, A>(fn: (key: K) => Atom<A>) => (key: K) => Atom<A>` | Parameterized atom factory (like React.memo for atoms) |
| `Atom.map`         | `<A, B>(atom, fn) => Atom<B>`                            | Derive new atom from existing atom                     |
| `Atom.searchParam` | `(key, options) => Atom`                                 | URL search parameter atom                              |
| `Atom.pull`        | `(atom) => PullAtom`                                     | Stream chunk pulling                                   |

### Runtime Creation

| Export                   | Signature                                                                 | Description                                  |
|--------------------------|---------------------------------------------------------------------------|----------------------------------------------|
| `Atom.context`           | `(options: { memoMap: Layer.MemoMap }) => RuntimeFactory`                 | Create runtime factory (most common)         |
| `Atom.runtime`           | `(layer: Layer<R, E>) => AtomRuntime<R, E>`                               | Create runtime from single Layer             |
| `Atom.defaultMemoMap`    | `Layer.MemoMap`                                                           | Default memoization map for layer caching    |
| `runtime.addGlobalLayer` | `<R, E>(layer: Layer<R, E>) => void`                                      | Add layer to all runtimes created by factory |
| `runtime.atom`           | `<A, E, R>(effect: Effect<A, E, R>) => Atom<Result<A, E>>`                | Create Effect-backed atom                    |
| `runtime.fn`             | `<Args, A, E, R>(fn: (...args: Args) => Effect<A, E, R>) => FunctionAtom` | Create function atom for side effects        |

### Atom Context API

| Method                    | Available In  | Description                     |
|---------------------------|---------------|---------------------------------|
| `get(atom)`               | Read context  | Synchronously read another atom |
| `get.result(atom)`        | Read context  | Get Result from effectful atom  |
| `get.mount(atom)`         | Read context  | Ensure atom is active           |
| `get.refresh(atom)`       | Read context  | Trigger recomputation           |
| `get.setSelf(value)`      | Read context  | Update self value               |
| `get.addFinalizer(fn)`    | Read context  | Register cleanup                |
| `get.stream(atom)`        | Read context  | Create stream of changes        |
| `get.subscribe(atom, fn)` | Read context  | Listen to changes               |
| `get.registry`            | Read context  | Access registry directly        |
| `ctx.get(atom)`           | Write context | Read atom value                 |
| `ctx.setSelf(value)`      | Write context | Write to self                   |
| `ctx.set(atom, value)`    | Write context | Write to another atom           |
| `ctx.refreshSelf()`       | Write context | Trigger recomputation           |

### React Hooks (from `@effect-atom/atom-react`)

| Hook                   | Signature                                        | Use Case                                  |
|------------------------|--------------------------------------------------|-------------------------------------------|
| `useAtomValue`         | `<A>(atom: Atom<A>) => A`                        | Read-only access (most common)            |
| `useAtomSet`           | `<A>(atom: WritableAtom<A>, opts?) => Setter<A>` | Write-only access                         |
| `useAtom`              | `<A>(atom: Atom<A>, opts?) => [A, Setter<A>]`    | Combined read/write (similar to useState) |
| `useAtomRefresh`       | `<A>(atom: Atom<A>) => () => void`               | Get refresh function                      |
| `useAtomSuspense`      | `<A>(atom: Atom<A>, opts?) => A`                 | Suspense integration                      |
| `useAtomSubscribe`     | `<A>(atom, fn, opts?) => void`                   | Subscribe to changes without re-render    |
| `useAtomMount`         | `<A>(atom: Atom<A>) => void`                     | Manually mount atom (keeps alive)         |
| `useAtomInitialValues` | `(pairs: [Atom, Value][]) => void`               | Set initial values for atoms              |
| `useAtomRef`           | `<A>(atomRef: AtomRef<A>) => A`                  | Reference access pattern                  |

### React Context & Provider

| Export             | Type                        | Description                             |
|--------------------|-----------------------------|-----------------------------------------|
| `RegistryContext`  | `React.Context<Registry>`   | Registry context (consumed by hooks)    |
| `RegistryProvider` | `React.FC<ProviderOptions>` | Provider component (**REQUIRED**)       |
| `scheduleTask`     | `(fn: () => void) => void`  | Scheduler integration (batched updates) |

### Registry Module (from `@effect-atom/atom`)

| Export                            | Description                          |
|-----------------------------------|--------------------------------------|
| `Registry.make(options)`          | Create registry instance             |
| `Registry.layer`                  | Effect Layer for DI                  |
| `Registry.AtomRegistry`           | Context.Tag for dependency injection |
| `registry.get<A>(atom)`           | Get current value synchronously      |
| `registry.set<A>(atom, value)`    | Set atom value                       |
| `registry.subscribe<A>(atom, fn)` | Subscribe to changes                 |
| `registry.mount<A>(atom)`         | Activate atom (returns dispose fn)   |
| `registry.refresh<A>(atom)`       | Recompute atom                       |

### Result Type (from `@effect-atom/atom`)

| Export                     | Type/Signature                                 | Description                         |
|----------------------------|------------------------------------------------|-------------------------------------|
| `Result.Result<A, E>`      | `Initial \| Success<A> \| Failure<E>`          | Discriminated union for async state |
| `Result.initial()`         | `() => Initial`                                | Create initial state                |
| `Result.success<A>(value)` | `<A>(value: A) => Success<A>`                  | Create success state                |
| `Result.failure<E>(cause)` | `<E>(cause: Cause<E>) => Failure<E>`           | Create failure state                |
| `Result.isInitial(r)`      | `(r) => r is Initial`                          | Type guard                          |
| `Result.isSuccess(r)`      | `(r) => r is Success<A>`                       | Type guard                          |
| `Result.isFailure(r)`      | `(r) => r is Failure<E>`                       | Type guard                          |
| `Result.builder<R>()`      | `<R>() => Builder<R>`                          | Pattern matching builder            |
| `Result.fromExit(exit)`    | `<A, E>(exit: Exit<A, E>) => Result<A, E>`     | Convert from Effect.Exit            |
| `Result.waiting(result)`   | `<A, E>(result: Result<A, E>) => Result<A, E>` | Mark as waiting (loading state)     |

---

## 3. Codebase Usage Patterns (beep-effect)

### Pattern 1: Simple State Atom

**Use Case**: Local component state without external dependencies

```typescript
// packages/shared/client/src/atom/files/atoms/selectedFiles.atom.ts
export const selectedFilesAtom = Atom.make({
  folderIds: A.empty<FolderId.Type>(),
  fileIds: A.empty<FileId.Type>(),
});

export const activeUploadsAtom = Atom.make<ReadonlyArray<ActiveUpload>>(A.empty());
```

**Component Usage**:
```tsx
function FileList() {
  const selected = useAtomValue(selectedFilesAtom);
  return <div>Selected: {selected.fileIds.length}</div>;
}
```

### Pattern 2: Writable Cache with Optimistic Updates

**Use Case**: Remote data with client-side optimistic mutations

```typescript
// packages/shared/client/src/atom/files/atoms/files.atom.ts
export const filesAtom = Atom.writable(
  (get) => {
    get.mount(filesEventStreamAtom); // Subscribe to SSE events
    return get(remoteAtom);
  },
  (ctx, update: FileCacheUpdate) => {
    const current = ctx.get(filesAtom);
    if (current._tag !== "Success") return;

    const nextValue = Match.type<FileCacheUpdate>().pipe(
      Match.tagsExhaustive({
        DeleteFolders: (update) => ({
          ...current.value,
          folders: F.pipe(
            current.value.folders,
            A.filter((f) => !A.contains(update.folderIds, f.id))
          ),
        }),
        AddFile: (update) => ({
          ...current.value,
          files: A.append(current.value.files, update.file),
        }),
        MoveFiles: (update) => ({
          ...current.value,
          files: F.pipe(
            current.value.files,
            A.map((f) =>
              A.contains(update.fileIds, f.id)
                ? { ...f, folderId: update.targetFolderId }
                : f
            )
          ),
        }),
      })
    );
    ctx.setSelf(Result.success(nextValue(update)));
  }
);
```

**Component Usage**:
```tsx
function FileGrid() {
  const filesResult = useAtomValue(filesAtom);

  if (filesResult._tag === "Initial") return <Spinner />;
  if (filesResult._tag === "Failure") return <Error cause={filesResult.cause} />;

  return filesResult.value.files.map(f => <FileCard key={f.id} file={f} />);
}
```

### Pattern 3: Function Atoms for Side Effects

**Use Case**: Actions that mutate state imperatively

```typescript
// packages/shared/client/src/atom/files/atoms/toggleFileSelection.atom.ts
export const toggleFileSelectionAtom = runtime.fn(
  Effect.fnUntraced(function* (fileId: FileId.Type) {
    const registry = yield* Registry.AtomRegistry;
    const current = registry.get(selectedFilesAtom);
    registry.set(selectedFilesAtom, {
      ...current,
      fileIds: A.contains(current.fileIds, fileId)
        ? A.filter(current.fileIds, (id) => id !== fileId)
        : A.append(current.fileIds, fileId),
    });
  })
);
```

**Component Usage**:
```tsx
function FileCard({ file }) {
  const toggleSelection = useAtomSet(toggleFileSelectionAtom);

  return (
    <div onClick={() => toggleSelection(file.id)}>
      {file.name}
    </div>
  );
}
```

### Pattern 4: State Machine Atoms

**Use Case**: Complex async workflows with multiple states

```typescript
// packages/shared/client/src/atom/files/atoms/upload.atom.ts
export const uploadAtom = Atom.family((uploadId: string) =>
  runtime.fn((input: UploadInput) => makeUploadStream(uploadId, input))
);

const makeUploadStream = (uploadId: string, input: UploadInput) => {
  const transition = (state: UploadState) =>
    Effect.gen(function* () {
      return yield* Match.value(state).pipe(
        Match.tag("Idle", (state) =>
          Effect.gen(function* () {
            const compressed = yield* compressImage(state.input.file);
            return UploadState.Compressing({ ...state, compressed });
          })
        ),
        Match.tag("Compressing", (state) =>
          Effect.gen(function* () {
            const uploadUrl = yield* getPresignedUrl(state.compressed);
            return UploadState.Uploading({ ...state, uploadUrl });
          })
        ),
        Match.tag("Uploading", (state) =>
          Effect.gen(function* () {
            yield* uploadToS3(state.uploadUrl, state.compressed);
            return UploadState.Syncing({ ...state });
          })
        ),
        Match.tag("Syncing", (state) =>
          Effect.gen(function* () {
            yield* syncWithServer(uploadId);
            return UploadState.Done({ ...state });
          })
        ),
        Match.tag("Done", () => Effect.fail("COMPLETE")),
        Match.exhaustive
      );
    });

  return Stream.unfoldEffect(UploadState.Idle({ input }), transition);
};
```

**Component Usage**:
```tsx
function UploadProgress({ uploadId, file }) {
  const uploadFn = useAtomSet(uploadAtom(uploadId));
  const [state, setState] = React.useState(null);

  React.useEffect(() => {
    uploadFn(file).pipe(
      Stream.runForEach(setState),
      Effect.runPromise
    );
  }, [uploadId, file]);

  return <ProgressBar state={state} />;
}
```

### Pattern 5: Event Stream Integration

**Use Case**: Server-Sent Events (SSE) or WebSocket updates

```typescript
// packages/shared/client/src/atom/files/atoms/filesEventStream.atom.ts
export const filesEventStreamAtom = makeEventStreamAtom({
  runtime,
  identifier: "Files",
  predicate: S.is(Events.Event),
  handler: (event: Events.Event.Type) =>
    Effect.gen(function* () {
      const registry = yield* Registry.AtomRegistry;
      registry.set(
        filesAtom,
        AddFile({ file: event.file, folderId: event.file.folderId })
      );
    }),
});
```

**Component Usage**:
```typescript
function EventStreamListener() {
  useAtomMount(filesEventStreamAtom); // Keep alive during component lifetime
  return null;
}
```

### Pattern 6: Browser Event Listeners

**Use Case**: DOM events (hashchange, resize, etc.)

```typescript
// packages/shared/client/src/atom/location.atom.ts
export const hashAtom = Atom.make<O.Option<string>>((get) => {
  function onHashChange() {
    get.setSelf(getHash());
  }

  window.addEventListener("hashchange", onHashChange);
  get.addFinalizer(() => {
    window.removeEventListener("hashchange", onHashChange);
  });

  return getHash();
});
```

**Component Usage**:
```tsx
function RouteDisplay() {
  const hash = useAtomValue(hashAtom);
  return <div>Current route: {O.getOrElse(hash, () => "/")}</div>;
}
```

### Pattern 7: Module-Specific Runtime

**Use Case**: Scoped atoms with module-specific services

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

**Usage**:
```typescript
// All atoms in files module use this runtime
const filesAtom = runtime.atom(Effect.gen(function* () {
  const api = yield* FilesApi;
  return yield* api.fetchFiles();
}));
```

---

## 4. CRITICAL: Jotai vs effect-atom Comparison Table

This is the **most important section** for the Claude Code skill. Every difference is a potential mistake developers will make.

### Import Differences

| Aspect               | Jotai (WRONG)                                               | effect-atom (CORRECT)                                                         |
|----------------------|-------------------------------------------------------------|-------------------------------------------------------------------------------|
| **Core import**      | `import { atom, useAtom } from 'jotai'`                     | `import { Atom } from '@effect-atom/atom'`                                    |
| **Hooks import**     | `import { useAtom, useSetAtom, useAtomValue } from 'jotai'` | `import { useAtomValue, useAtomSet, useAtom } from '@effect-atom/atom-react'` |
| **Provider import**  | `import { Provider } from 'jotai'`                          | `import { RegistryProvider } from '@effect-atom/atom-react'`                  |
| **Utilities import** | `import { atomFamily, atomWithStorage } from 'jotai/utils'` | No utilities package; use `Atom.family`, `Atom.searchParam`                   |

### Atom Creation

| Feature            | Jotai (WRONG)                                          | effect-atom (CORRECT)                                                     |
|--------------------|--------------------------------------------------------|---------------------------------------------------------------------------|
| **Basic atom**     | `const a = atom(0)`                                    | `const a = Atom.make(0)`                                                  |
| **Read-only atom** | `const a = atom((get) => get(b) * 2)`                  | `const a = Atom.make((get) => get(b) * 2)`                                |
| **Writable atom**  | `const a = atom(null, (get, set, arg) => set(b, arg))` | `const a = Atom.writable((get) => get(b), (ctx, arg) => ctx.set(b, arg))` |
| **Async atom**     | `const a = atom(async (get) => fetch(...))`            | `const a = runtime.atom(Effect.gen(function* () { yield* fetchEffect }))` |
| **Atom family**    | `const family = atomFamily((id) => atom(id))`          | `const family = Atom.family((id) => Atom.make(id))`                       |

### Hook Usage

| Hook            | Jotai (WRONG)                                     | effect-atom (CORRECT)                                                       |
|-----------------|---------------------------------------------------|-----------------------------------------------------------------------------|
| **Read value**  | `const value = useAtomValue(atom)`                | `const value = useAtomValue(atom)` ✅ (same name, different import!)         |
| **Write value** | `const setValue = useSetAtom(atom)`               | `const setValue = useAtomSet(atom)` (note: `useAtomSet`, not `useSetAtom`)  |
| **Combined**    | `const [value, setValue] = useAtom(atom)`         | `const [value, setValue] = useAtom(atom)` ✅ (same API, different behavior!) |
| **Refresh**     | `const refresh = useAtom(atom)[1]` (via write fn) | `const refresh = useAtomRefresh(atom)` (dedicated hook)                     |

### Provider Setup

| Aspect                   | Jotai (WRONG)                       | effect-atom (CORRECT)                                           |
|--------------------------|-------------------------------------|-----------------------------------------------------------------|
| **Provider requirement** | Optional (only for SSR/scoping)     | **REQUIRED** - RegistryProvider                                 |
| **Provider name**        | `<Provider>`                        | `<RegistryProvider>`                                            |
| **Provider props**       | `<Provider store={store}>`          | `<RegistryProvider initialValues={[...]} defaultIdleTTL={400}>` |
| **Multiple providers**   | `<Provider>` nesting creates scopes | `<RegistryProvider>` nesting creates separate registries        |

### Runtime Concept

| Aspect                  | Jotai (WRONG)              | effect-atom (CORRECT)                                  |
|-------------------------|----------------------------|--------------------------------------------------------|
| **Runtime existence**   | No runtime concept         | **REQUIRED** - `makeAtomRuntime()`                     |
| **Runtime creation**    | N/A                        | `const runtime = makeAtomRuntime(Layer.mergeAll(...))` |
| **Global layer**        | N/A                        | `runtime.addGlobalLayer(MyServiceLayer)`               |
| **Effect-backed atoms** | N/A (uses Promises)        | `runtime.atom(Effect.gen(...))`                        |
| **Function atoms**      | N/A (use write-only atoms) | `runtime.fn(Effect.gen(...))`                          |

### Derived Atoms

| Pattern                    | Jotai (WRONG)                                    | effect-atom (CORRECT)                                                           |
|----------------------------|--------------------------------------------------|---------------------------------------------------------------------------------|
| **Simple derivation**      | `atom((get) => get(a) + get(b))`                 | `Atom.make((get) => get(a) + get(b))`                                           |
| **Async derivation**       | `atom(async (get) => await fetch(get(url)))`     | `runtime.atom(Effect.gen(function* () { yield* fetchEffect(yield* urlAtom) }))` |
| **Conditional derivation** | `atom((get) => get(enabled) ? get(data) : null)` | `Atom.make((get) => get(enabled) ? get(data) : null)`                           |
| **Map atom**               | `atom((get) => get(a).map(x => x * 2))`          | `Atom.map(a, (x) => x * 2)`                                                     |

### Async State Handling

| Aspect            | Jotai (WRONG)                               | effect-atom (CORRECT)                        |
|-------------------|---------------------------------------------|----------------------------------------------|
| **Async type**    | `Promise<A>` (throws on rejection)          | `Result<A, E>` (discriminated union)         |
| **Loading state** | Use Suspense or `atom.status === 'loading'` | `result._tag === "Initial"`                  |
| **Success state** | Promise resolves to value                   | `result._tag === "Success"` → `result.value` |
| **Error state**   | Promise rejects                             | `result._tag === "Failure"` → `result.cause` |
| **Suspense**      | `<Suspense>` with async atom                | `useAtomSuspense(atom)` hook                 |

### Write Patterns

| Pattern           | Jotai (WRONG)                                             | effect-atom (CORRECT)                                                            |
|-------------------|-----------------------------------------------------------|----------------------------------------------------------------------------------|
| **Set value**     | `set(atom, newValue)`                                     | `ctx.setSelf(newValue)` (inside writable) or `registry.set(atom, newValue)`      |
| **Update value**  | `set(atom, (prev) => prev + 1)`                           | `ctx.setSelf(ctx.get(selfAtom) + 1)`                                             |
| **Side effect**   | `atom(null, (get, set) => { doSideEffect(); set(a, x) })` | `runtime.fn(Effect.gen(function* () { yield* sideEffect; registry.set(a, x) }))` |
| **Batch updates** | `batch(() => { set(a, 1); set(b, 2); })`                  | Updates are automatically batched via `scheduleTask`                             |

### Context & Dependencies

| Aspect                     | Jotai (WRONG)                   | effect-atom (CORRECT)                                |
|----------------------------|---------------------------------|------------------------------------------------------|
| **Service injection**      | React Context or props drilling | Effect Layers via runtime                            |
| **Dependency declaration** | Implicit (runtime resolution)   | Explicit (`Effect<A, E, R>` types show requirements) |
| **Mocking for tests**      | Mock Provider store             | Mock Layers via `Layer.succeed(...)`                 |

### Lifecycle & Cleanup

| Aspect         | Jotai (WRONG)                             | effect-atom (CORRECT)                               |
|----------------|-------------------------------------------|-----------------------------------------------------|
| **Cleanup**    | `atom.onMount = (set) => () => cleanup()` | `get.addFinalizer(() => cleanup())`                 |
| **Keep alive** | Store atom reference                      | `useAtomMount(atom)` or `Atom.keepAlive`            |
| **Scope**      | No scope concept                          | Effect Scope handles resource cleanup automatically |

### Naming Gotchas

| Name           | Jotai                   | effect-atom             | Notes                                     |
|----------------|-------------------------|-------------------------|-------------------------------------------|
| `useAtom`      | `[value, setter]` tuple | `[value, setter]` tuple | **Same API, different imports!**          |
| `useAtomValue` | Read-only               | Read-only               | **Same name, different package!**         |
| `useSetAtom`   | Write-only              | N/A                     | **effect-atom uses `useAtomSet` instead** |
| `atom()`       | Function                | N/A                     | **effect-atom uses `Atom.make()`**        |
| `Provider`     | Jotai provider          | N/A                     | **effect-atom uses `RegistryProvider`**   |

### Error Handling

| Pattern            | Jotai (WRONG)                                                   | effect-atom (CORRECT)                               |
|--------------------|-----------------------------------------------------------------|-----------------------------------------------------|
| **Try/catch**      | `atom(async () => { try { await fetch() } catch (e) { ... } })` | Use Effect error channel: `Effect.catchAll(...)`    |
| **Error boundary** | `<ErrorBoundary>` catches Promise rejection                     | `<ErrorBoundary>` catches unhandled Effect failures |
| **Typed errors**   | No typed errors (any rejection)                                 | Effect's error channel: `Effect<A, E, R>`           |
| **Retry logic**    | Manual retry in async function                                  | `Effect.retry({ times: 3 })`                        |

### Testing

| Aspect            | Jotai (WRONG)                                         | effect-atom (CORRECT)                                           |
|-------------------|-------------------------------------------------------|-----------------------------------------------------------------|
| **Mock provider** | `<Provider initialValues={[[atom, value]]}>`          | `<RegistryProvider initialValues={[[atom, value]]}>`            |
| **Mock services** | Mock React Context                                    | Mock Effect Layers: `Layer.succeed(Service, mockImpl)`          |
| **Test reads**    | `const store = createStore(); store.get(atom)`        | `const registry = Registry.make({}); registry.get(atom)`        |
| **Test writes**   | `const store = createStore(); store.set(atom, value)` | `const registry = Registry.make({}); registry.set(atom, value)` |

---

## 5. Effect Integration Patterns

### Layer Composition

**Best Practice**: Compose all services into a single runtime at app root

```typescript
// packages/runtime/client/src/runtime.ts
export const makeAtomRuntime = Atom.context({
  memoMap: Atom.defaultMemoMap,
});

const clientRuntimeLayer = Layer.mergeAll(
  Registry.layer,              // REQUIRED for atom registry
  HttpClientLive,
  ObservabilityLive,
  NetworkMonitorLive,
  WorkerClientLive,
  BrowserKeyValueStore.layerLocalStorage,
  GeoLocationLive
);

makeAtomRuntime.addGlobalLayer(clientRuntimeLayer);
export const clientRuntime = ManagedRuntime.make(clientRuntimeLayer);
```

**Provider Setup**:

```tsx
function App() {
  return (
    <RuntimeProvider runtime={clientRuntime}>
      <RegistryProvider>
        <YourApp />
      </RegistryProvider>
    </RuntimeProvider>
  );
}
```

### Service Injection into Atoms

**Pattern**: Access Effect services inside atom definitions

```tsx
// Session atom backed by SessionService
const sessionAtom = runtime.atom(
  Effect.gen(function* () {
    const sessionService = yield* SessionService;
    return yield* sessionService.getCurrentSession();
  })
);

// Component usage
function UserProfile() {
  const sessionResult = useAtomValue(sessionAtom);

  if (sessionResult._tag === "Success") {
    return <div>Welcome, {sessionResult.value.user.name}</div>;
  }

  return <LoginPrompt />;
}
```

### Stream Integration

**Pattern 1: Stream of values**

```typescript
const eventsAtom = runtime.atom(
  Stream.unwrap(
    Effect.gen(function* () {
      const api = yield* EventsApi;
      return api.subscribe(); // Returns Stream<Event, E>
    })
  ).pipe(Stream.runLast) // Get latest value only
);
```

**Pattern 2: Accumulated events**

```typescript
const allEventsAtom = Atom.make((get) => {
  const eventsStream = get.stream(eventsAtom);
  const [events, setEvents] = React.useState<Event[]>([]);

  eventsStream.pipe(
    Stream.tap(event =>
      Effect.sync(() => setEvents((prev) => [...prev, event]))
    ),
    Stream.runDrain
  );

  return events;
});
```

### Scope Management

**Automatic Cleanup**: Atoms handle Effect Scope lifecycle automatically

```typescript
const websocketAtom = runtime.atom(
  Effect.gen(function* () {
    const connection = yield* Effect.acquireRelease(
      WebSocket.connect("ws://..."),
      (conn) => Effect.sync(() => conn.close())
    );
    return connection;
  })
);

// When atom unmounts, connection is closed automatically
// No manual cleanup needed in components!
```

### Result Type Pattern

**Discriminated Union for Async State**:

```tsx
const dataAtom = runtime.atom(fetchDataEffect);

function DataDisplay() {
  const result = useAtomValue(dataAtom);

  return Match.value(result).pipe(
    Match.tag("Initial", () => <Spinner />),
    Match.tag("Success", ({ value }) => <DataGrid data={value} />),
    Match.tag("Failure", ({ cause }) => <ErrorDisplay cause={cause} />),
    Match.exhaustive
  );
}
```

---

## 6. Skill Content Recommendations

### Skill Triggers (when to activate)

The skill should activate when detecting any of these patterns:

1. **Import Patterns**:
   - `import { atom, useAtom } from 'jotai'`
   - `import { atomFamily } from 'jotai/utils'`
   - `import { Provider } from 'jotai'`

2. **Atom Creation Patterns**:
   - `atom(initialValue)`
   - `atom((get) => ...)`
   - `atom(async (get) => ...)`
   - `atomFamily((param) => ...)`

3. **Hook Usage**:
   - `useSetAtom(...)` (correct form: `useAtomSet`)
   - `useAtom(...)` from jotai package

4. **Questions/Phrases**:
   - "How do I use atoms in this project?"
   - "Create a jotai atom"
   - "Import atom from jotai"
   - "Set up atom provider"

### Forbidden Patterns to Warn About

| Forbidden Pattern                     | Why It's Wrong            | Correct Replacement                               |
|---------------------------------------|---------------------------|---------------------------------------------------|
| `import { atom } from 'jotai'`        | Wrong library             | `import { Atom } from '@effect-atom/atom'`        |
| `atom(0)`                             | Jotai syntax              | `Atom.make(0)`                                    |
| `useSetAtom(atom)`                    | Wrong hook name           | `useAtomSet(atom)`                                |
| `atom(async (get) => ...)`            | Promise-based async       | `runtime.atom(Effect.gen(...))`                   |
| `<Provider>` without RegistryProvider | Missing required provider | `<RegistryProvider>`                              |
| `atom(null, (get, set) => ...)`       | Jotai write pattern       | `Atom.writable(read, write)` or `runtime.fn(...)` |
| `useAtom(atom)` from jotai            | Wrong package             | `useAtom(atom)` from `@effect-atom/atom-react`    |
| No runtime setup                      | Missing runtime           | `makeAtomRuntime(Layer.mergeAll(...))`            |

### Correct Patterns to Suggest

#### Basic Atom Setup

```tsx
// 1. Import correctly
import { Atom } from "@effect-atom/atom";
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";

// 2. Create atom
const countAtom = Atom.make(0);

// 3. Use in component
function Counter() {
  const count = useAtomValue(countAtom);
  const setCount = useAtomSet(countAtom);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

#### Runtime Setup with Services

```tsx
// 1. Create runtime with layers
import { Atom } from "@effect-atom/atom";
import * as Layer from "effect/Layer";

const runtime = makeAtomRuntime(
  Layer.mergeAll(
    MyService.layer,
    AnotherService.layer
  )
);

// 2. Create Effect-backed atom
const dataAtom = runtime.atom(
  Effect.gen(function* () {
    const service = yield* MyService;
    return yield* service.fetchData();
  })
);

// 3. Use with Result pattern
function DataDisplay() {
  const result = useAtomValue(dataAtom);

  if (result._tag === "Initial") return <Spinner />;
  if (result._tag === "Failure") return <Error />;

  return <Data value={result.value} />;
}
```

#### Provider Setup

```tsx
import { RegistryProvider } from "@effect-atom/atom-react";

function App() {
  return (
    <RegistryProvider defaultIdleTTL={400}>
      <YourApp />
    </RegistryProvider>
  );
}
```

### Example Skill Responses

**User**: "Create a jotai atom for user state"

**Skill Response**:
```
⚠️ This project uses @effect-atom, not jotai. While the APIs look similar, they are different libraries.

Here's the correct pattern:

```tsx
import { Atom } from "@effect-atom/atom";
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";

// Create atom
const userAtom = Atom.make<User | null>(null);

// Use in component
function UserProfile() {
  const user = useAtomValue(userAtom);
  const setUser = useAtomSet(userAtom);

  return user ? <Profile user={user} /> : <Login onLogin={setUser} />;
}
```

If you need to fetch user from a service:

```tsx
const runtime = makeAtomRuntime(UserService.layer);

const userAtom = runtime.atom(
  Effect.gen(function* () {
    const service = yield* UserService;
    return yield* service.getCurrentUser();
  })
);

// Result type handling
function UserProfile() {
  const result = useAtomValue(userAtom);

  if (result._tag === "Success") {
    return <Profile user={result.value} />;
  }

  return <Login />;
}
```
```

**User**: "How do I use useSetAtom?"

**Skill Response**:
```
⚠️ effect-atom uses `useAtomSet` (not `useSetAtom`).

```typescript
import { useAtomSet } from "@effect-atom/atom-react";

const setCount = useAtomSet(countAtom);
```

For side effects with services, use function atoms:

```tsx
const saveUserAtom = runtime.fn(
  Effect.gen(function* (user: User) {
    const api = yield* UserApi;
    return yield* api.saveUser(user);
  })
);

function SaveButton() {
  const saveUser = useAtomSet(saveUserAtom);

  return <button onClick={() => saveUser(currentUser)}>Save</button>;
}
```
```

### Documentation to Reference

The skill should point developers to:

1. **beep-effect examples**:
   - `packages/shared/client/src/atom/files/` - Comprehensive real-world usage
   - `packages/iam/client/src/clients/session/session.atoms.ts` - Session management pattern
   - `packages/runtime/client/src/runtime.ts` - Runtime setup pattern

2. **Library documentation**:
   - https://github.com/tim-smart/effect-atom
   - https://www.npmjs.com/package/@effect-atom/atom-react

3. **Effect documentation**:
   - https://effect.website - Core Effect patterns
   - Layer composition, service injection, error handling

---

## 7. Summary & Critical Insights

### Three Critical Rules

1. **NEVER use jotai imports** - This project uses `@effect-atom/atom` and `@effect-atom/atom-react`
2. **ALWAYS create runtime** - `makeAtomRuntime()` is required before creating Effect-backed atoms
3. **ALWAYS handle Result type** - Async atoms return `Result<A, E>`, not bare values

### Key Differences at a Glance

| | Jotai | effect-atom |
|---|-------|-------------|
| **Philosophy** | Minimal, Promise-based | Effect-first, service-oriented |
| **Runtime** | Implicit | Explicit (required) |
| **Async** | `async/await` | Effect computations |
| **Errors** | Promise rejections | Typed error channel |
| **Dependencies** | Context/props | Layers |
| **State type** | `Promise<A>` | `Result<A, E>` |
| **Cleanup** | Manual | Automatic via Scope |

### When to Use Which Pattern

| Scenario | Pattern |
|----------|---------|
| Simple local state | `Atom.make(initialValue)` |
| Remote data with cache | `Atom.writable(read, write)` |
| Side effects | `runtime.fn(Effect.gen(...))` |
| Service-backed state | `runtime.atom(Effect.gen(...))` |
| Event streams | `makeEventStreamAtom(...)` |
| State machine | `Atom.family` + `Stream.unfoldEffect` |
| Browser events | `Atom.make((get) => { get.addFinalizer(...) })` |

### The Most Common Mistake

**Copying jotai examples into an effect-atom project.**

This fails because:
- Different import paths
- Different atom creation syntax
- Missing runtime setup
- Different async handling (Promise vs Effect)
- Different provider requirements

The skill's primary job is to catch this early and redirect to correct patterns.

---

**End of Synthesis**

This document synthesizes all research into a comprehensive reference for building a Claude Code skill that prevents jotai/effect-atom confusion and guides developers to correct patterns in the beep-effect codebase.
