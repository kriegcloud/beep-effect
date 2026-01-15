# Atom Module Analysis: Library Source & Codebase Usage

**Analysis Date**: 2026-01-14
**Library Source**: `./tmp/effect-atom`
**Codebase Target**: `packages/shared/client/src/atom/*`

---

## 1. Library API Surface (`@effect-atom/atom`)

### Core Exports from `packages/atom/src/index.ts`

```typescript
export * as Atom from "./Atom.js"
export * as AtomHttpApi from "./AtomHttpApi.js"
export * as AtomRpc from "./AtomRpc.js"
export * as Registry from "./Registry.js"
export * as Result from "./Result.js"
```

### Atom Module Exports

| Export                | Type                                                     | Description                    |
|-----------------------|----------------------------------------------------------|--------------------------------|
| `Atom.make`           | `<A>(init: A \| (get: Context) => A) => Atom<A>`         | Create read-only atom          |
| `Atom.readable`       | `<A>(read: (get) => A) => Atom<A>`                       | Explicit read-only atom        |
| `Atom.writable`       | `<A>(read, write) => WritableAtom<A>`                    | Read-write atom                |
| `Atom.family`         | `<K, A>(fn: (key: K) => Atom<A>) => (key: K) => Atom<A>` | Parameterized factory          |
| `Atom.context`        | `(options) => RuntimeFactory`                            | Create runtime factory         |
| `Atom.runtime`        | `(layer) => AtomRuntime<R, E>`                           | Create runtime from Layer      |
| `Atom.fn`             | `(effect: Effect) => FunctionAtom`                       | Side effect atom               |
| `Atom.keepAlive`      | `Symbol`                                                 | Prevent cleanup when unmounted |
| `Atom.map`            | `<A, B>(atom, fn) => Atom<B>`                            | Derive atoms                   |
| `Atom.searchParam`    | `(key, options) => Atom`                                 | URL search parameter atom      |
| `Atom.pull`           | `(atom) => PullAtom`                                     | Stream chunk pulling           |
| `Atom.setIdleTTL`     | `(atom, ttl) => void`                                    | Configure idle timeout         |
| `Atom.defaultMemoMap` | `Layer.MemoMap`                                          | Default memoization map        |

### Registry Module Exports

| Export                  | Type                           | Description                  |
|-------------------------|--------------------------------|------------------------------|
| `Registry.make`         | `(options) => Registry`        | Create registry              |
| `Registry.layer`        | `Layer<AtomRegistry>`          | Effect Layer for DI          |
| `Registry.AtomRegistry` | `Context.Tag`                  | Tag for dependency injection |
| `registry.get`          | `<A>(atom) => A`               | Get current value            |
| `registry.set`          | `<A>(atom, value) => void`     | Set atom value               |
| `registry.subscribe`    | `<A>(atom, fn) => Unsubscribe` | Subscribe to changes         |
| `registry.mount`        | `<A>(atom) => Dispose`         | Activate atom                |
| `registry.refresh`      | `<A>(atom) => void`            | Recompute atom               |

### Result Module Exports

| Export                | Type                                  | Description              |
|-----------------------|---------------------------------------|--------------------------|
| `Result.Result<A, E>` | `Initial \| Success<A> \| Failure<E>` | Discriminated union      |
| `Result.initial`      | `() => Initial`                       | Create initial state     |
| `Result.success`      | `<A>(value: A) => Success<A>`         | Create success state     |
| `Result.failure`      | `<E>(cause: Cause<E>) => Failure<E>`  | Create failure state     |
| `Result.isInitial`    | `(r) => boolean`                      | Type guard               |
| `Result.isSuccess`    | `(r) => boolean`                      | Type guard               |
| `Result.isFailure`    | `(r) => boolean`                      | Type guard               |
| `Result.builder`      | `<R>() => Builder<R>`                 | Pattern matching builder |
| `Result.fromExit`     | `<A, E>(exit) => Result<A, E>`        | Convert from Effect.Exit |
| `Result.waiting`      | `<A, E>(result) => Result<A, E>`      | Mark as waiting          |

---

## 2. React Integration (`@effect-atom/atom-react`)

### Exports from `packages/atom-react/src/index.ts`

```typescript
export * from "./Hooks.js"
export * from "./RegistryContext.js"
```

### Hooks Exports

| Hook                   | Signature                                        | Description        |
|------------------------|--------------------------------------------------|--------------------|
| `useAtomValue`         | `<A>(atom: Atom<A>) => A`                        | Read atom value    |
| `useAtomSet`           | `<A>(atom: WritableAtom<A>, opts?) => Setter<A>` | Get setter         |
| `useAtom`              | `<A>(atom: Atom<A>, opts?) => [A, Setter<A>]`    | Combined           |
| `useAtomRefresh`       | `<A>(atom: Atom<A>) => () => void`               | Get refresh fn     |
| `useAtomSuspense`      | `<A>(atom: Atom<A>, opts?) => A`                 | Suspense mode      |
| `useAtomSubscribe`     | `<A>(atom, fn, opts?) => void`                   | Subscribe          |
| `useAtomMount`         | `<A>(atom: Atom<A>) => void`                     | Mount atom         |
| `useAtomInitialValues` | `(pairs) => void`                                | Set initial values |
| `useAtomRef`           | `<A>(atomRef: AtomRef<A>) => A`                  | Reference access   |

### Context Exports

| Export             | Type                        | Description           |
|--------------------|-----------------------------|-----------------------|
| `RegistryContext`  | `React.Context<Registry>`   | Registry context      |
| `RegistryProvider` | `React.FC<ProviderOptions>` | Provider component    |
| `scheduleTask`     | `(fn) => void`              | Scheduler integration |

---

## 3. Codebase Atom Definitions

### Directory Structure

```
packages/shared/client/src/atom/
├── index.ts              # Re-exports
├── captcha.atom.ts       # ReCaptcha token state
├── location.atom.ts      # URL hash state
└── files/
    ├── index.ts          # Re-exports
    ├── runtime.ts        # Files module runtime
    ├── types.ts          # Shared types
    └── atoms/
        ├── index.ts
        ├── files.atom.ts           # Main files cache
        ├── selectedFiles.atom.ts   # Selection state
        ├── activeUploads.atom.ts   # Upload tracking
        ├── startUpload.atom.ts     # Upload initiation
        ├── upload.atom.ts          # Upload state machine
        ├── cancelUpload.atom.ts    # Upload cancellation
        ├── deleteFiles.atom.ts     # File deletion
        ├── moveFiles.atom.ts       # File movement
        ├── createFolderAtom.ts     # Folder creation
        ├── toggleFileSelection.atom.ts
        ├── toggleFolderSelection.atom.ts
        ├── clearSelection.atom.ts
        ├── filesEventStream.atom.ts  # SSE events
        └── event-stream.atom.tsx     # Event stream component
```

### Files Module Runtime

```typescript
// runtime.ts
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

---

## 4. Key Usage Patterns

### Pattern 1: Simple State Atom

```typescript
// selectedFiles.atom.ts
export const selectedFilesAtom = Atom.make({
  folderIds: A.empty<SharedEntityIds.FolderId.Type>(),
  fileIds: A.empty<SharedEntityIds.FileId.Type>(),
});

export const activeUploadsAtom = Atom.make<ReadonlyArray<ActiveUpload>>(A.empty());
```

### Pattern 2: Writable Cache with Optimistic Updates

```typescript
// files.atom.ts
export const filesAtom = Atom.writable(
  (get) => {
    get.mount(filesEventStreamAtom); // Subscribe to events
    return get(remoteAtom);
  },
  (ctx, update: FileCacheUpdate) => {
    const current = ctx.get(filesAtom);
    if (current._tag !== "Success") return;

    const nextValue = Match.type<FileCacheUpdate>().pipe(
      Match.tagsExhaustive({
        DeleteFolders: (update) => ({ /* new state */ }),
        AddFile: (update) => ({ /* new state */ }),
        MoveFiles: (update) => ({ /* new state */ }),
        // ... other cases
      })
    );
    ctx.setSelf(Result.success(nextValue(update)));
  }
);
```

### Pattern 3: Function Atoms for Side Effects

```typescript
// toggleFileSelection.atom.ts
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

### Pattern 4: Complex State Machine Atoms

```typescript
// upload.atom.ts
export const uploadAtom = Atom.family((uploadId: string) =>
  runtime.fn((input: UploadInput) => makeUploadStream(uploadId, input))
);

// State machine via Stream
const transition = (state: UploadState) =>
  Effect.gen(function* () {
    return yield* Match.value(state).pipe(
      Match.tag("Idle", handleIdle),
      Match.tag("Compressing", handleCompressing),
      Match.tag("Uploading", handleUploading),
      Match.tag("Syncing", handleSyncing),
      Match.tag("Done", handleDone),
      Match.exhaustive
    );
  });

return Stream.unfoldEffect(UploadState.Idle({ input }), transition);
```

### Pattern 5: Event Stream Integration

```typescript
// filesEventStream.atom.ts
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

### Pattern 6: Event Listener Atoms

```typescript
// location.atom.ts
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

---

## 5. Atom Context API

### Read Context (`get` parameter)

| Method                    | Description                     |
|---------------------------|---------------------------------|
| `get(atom)`               | Synchronously read another atom |
| `get.result(atom)`        | Get Result from effectful atom  |
| `get.mount(atom)`         | Ensure atom is active           |
| `get.refresh(atom)`       | Trigger recomputation           |
| `get.setSelf(value)`      | Update self value               |
| `get.addFinalizer(fn)`    | Register cleanup                |
| `get.stream(atom)`        | Create stream of changes        |
| `get.subscribe(atom, fn)` | Listen to changes               |
| `get.registry`            | Access registry directly        |

### Write Context (`ctx` parameter)

| Method                 | Description           |
|------------------------|-----------------------|
| `ctx.get(atom)`        | Read atom value       |
| `ctx.setSelf(value)`   | Write to self         |
| `ctx.set(atom, value)` | Write to another atom |
| `ctx.refreshSelf()`    | Trigger recomputation |

---

## 6. Jotai Confusion Points

### Critical Differences

| Aspect        | Jotai Pattern (WRONG)             | effect-atom Pattern (CORRECT)                                        |
|---------------|-----------------------------------|----------------------------------------------------------------------|
| Atom creation | `atom(0)`                         | `Atom.make(0)`                                                       |
| Hook import   | `import { useAtom } from 'jotai'` | `import { useAtomValue, useAtomSet } from '@effect-atom/atom-react'` |
| Read value    | `const [val] = useAtom(a)`        | `const val = useAtomValue(a)`                                        |
| Write value   | `const [, set] = useAtom(a)`      | `const set = useAtomSet(a)`                                          |
| Derived atoms | `atom((get) => get(a) * 2)`       | `Atom.make((get) => get(a) * 2)`                                     |
| Async atoms   | `atom(async (get) => ...)`        | `runtime.atom(Effect.gen(...))`                                      |
| Provider      | Optional `<Provider>`             | Required `<RegistryProvider>`                                        |
| Runtime       | None                              | `Atom.context()` / `Atom.runtime()`                                  |

### API Names That Look Similar But Work Differently

1. **`useAtom`**: Jotai returns `[value, setter]`, effect-atom also does BUT requires different setup
2. **`atom`** vs **`Atom.make`**: Function name vs namespace method
3. **Provider**: Jotai's is optional, effect-atom's is required
4. **Derived atoms**: Similar syntax but effect-atom uses Effect for async

---

## 7. Component Consumption Patterns

```tsx
// Read only
function FileList() {
  const files = useAtomValue(filesAtom);
  return files.value.rootFiles.map(f => <div>{f.name}</div>);
}

// Write only
function DeleteButton() {
  const deleteFiles = useAtomSet(deleteFilesAtom);
  return <button onClick={() => deleteFiles()}>Delete</button>;
}

// Combined (similar to jotai but effect-atom)
function Counter() {
  const [count, setCount] = useAtom(countAtom);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// With Suspense
function FileListSuspense() {
  const files = useAtomSuspense(filesAtom);
  return files.rootFiles.map(f => <div>{f.name}</div>);
}
```
