---
paths:
  - "**/*.tsx"
  - "**/*.ts"
---

# Effect Atom React Patterns (@effect-atom/atom-react)

This skill teaches correct usage of `@effect-atom/atom-react` in the beep-effect codebase.

**CRITICAL**: This is NOT jotai. Despite similar naming, these are completely different libraries.

## When to Use

Activate when the user:
- Creates atoms, reactive state, or state management code
- Mentions jotai, useAtom, or atom-related patterns
- Works in files under `**/atom/**` or `**/atoms/**`
- Creates derived, async, or service-backed state

## Critical Rules

### Rule 1: Import ONLY from @effect-atom/atom-react

```typescript
// CORRECT - All imports from one package
import { Atom, useAtomValue, useAtomSet, Registry, Result } from "@effect-atom/atom-react";

// WRONG - This package exists but is NOT used in beep-effect
import { Atom } from "@effect-atom/atom";

// WRONG - This is a different library entirely
import { atom, useAtom } from "jotai";
```

### Rule 2: Atom.context() Creates RuntimeFactory

```typescript
// The library function is Atom.context(), not makeAtomRuntime
const runtime = Atom.context({ memoMap: Atom.defaultMemoMap });

// beep-effect names this makeAtomRuntime locally:
export const makeAtomRuntime = Atom.context({ memoMap: Atom.defaultMemoMap });

// Create module-specific runtimes from the factory:
const filesRuntime = makeAtomRuntime(Layer.mergeAll(FilesApi.layer, /* ... */ ));
```

### Rule 3: Atom.runtime is Pre-Created (NOT a Function)

```typescript
// Atom.runtime is already a RuntimeFactory instance (using default settings)
// Use it directly to create runtimes:
const myRuntime = Atom.runtime(MyServiceLayer);

// NOT: Atom.runtime((layer) => ...) - this is wrong
```

## Forbidden: Jotai Patterns

| Jotai Pattern (WRONG)           | Why It Fails         | effect-atom Pattern (CORRECT)                            |
|---------------------------------|----------------------|----------------------------------------------------------|
| `import { atom } from 'jotai'`  | Wrong library        | `import { Atom } from '@effect-atom/atom-react'`         |
| `const a = atom(0)`             | Jotai syntax         | `const a = Atom.make(0)`                                 |
| `const [val, set] = useAtom(a)` | Jotai hook pattern   | `const val = useAtomValue(a); const set = useAtomSet(a)` |
| `atom((get) => get(other) * 2)` | Jotai derived syntax | `Atom.make((get) => get(other) * 2)`                     |
| `atom(async (get) => ...)`      | Jotai async          | `runtime.atom(Effect.gen(...))`                          |
| `useSetAtom(atom)`              | Wrong hook name      | `useAtomSet(atom)`                                       |
| No Provider needed              | Jotai is implicit    | `RegistryProvider` is REQUIRED                           |

## Choosing the Right Atom Type

Use this decision tree to select the correct atom pattern:

```
Need to store state?
├── Simple value, no dependencies → Atom.make(initialValue)
├── Derived from other atoms (sync) → Atom.make((get) => ...)
├── Need custom write logic → Atom.writable(read, write)
└── Need Effect/services?
    ├── One-shot data fetch → runtime.atom(Effect.gen(...))
    ├── Streaming/real-time data → runtime.atom(Stream.unwrap(...))
    └── Action/mutation (no return) → runtime.fn(Effect.fnUntraced(...))
```

| Atom Type | Use When | Returns |
|-----------|----------|---------|
| `Atom.make(value)` | Simple state storage | `T` |
| `Atom.make((get) => ...)` | Derived/computed values | `T` |
| `Atom.writable(read, write)` | Need custom setter logic, optimistic updates | `T` |
| `runtime.atom(Effect)` | Async data fetch with services | `Result<T>` |
| `runtime.atom(Stream)` | Real-time/streaming data | `Result<T>` |
| `runtime.fn(Effect)` | Actions, mutations, side effects | `(args) => Promise<T>` |

### Key Distinctions

**runtime.atom(Effect) vs runtime.atom(Stream)**:
```typescript
// Effect: Runs ONCE, returns single value
const userAtom = runtime.atom(
  Effect.gen(function* () {
    const api = yield* UserApi.Service;
    return yield* api.getCurrentUser(); // Fetches once
  })
);

// Stream: Continuous updates, use for real-time data
const messagesAtom = runtime.atom(
  Stream.unwrap(
    Effect.gen(function* () {
      const ws = yield* WebSocketService;
      return ws.messages; // Stream of messages
    })
  )
);
```

**runtime.fn vs Atom.writable**:
```typescript
// runtime.fn: For actions that call services
const deleteFileAtom = runtime.fn(
  Effect.fnUntraced(function* (fileId: string) {
    const api = yield* FilesApi.Service;
    yield* api.delete(fileId);
    // Update local state after
    const registry = yield* Registry.AtomRegistry;
    registry.set(filesAtom, Result.success(/* updated */));
  })
);

// Atom.writable: For local state transformations (no services)
const sortedFilesAtom = Atom.writable(
  (get) => get(filesAtom),
  (ctx, sortOrder: "asc" | "desc") => {
    const current = ctx.get(filesAtom);
    if (current._tag !== "Success") return;
    ctx.setSelf(Result.success(sortFiles(current.value, sortOrder)));
  }
);
```

## Required: effect-atom Patterns

### Simple State Atom

```typescript
import { Atom } from "@effect-atom/atom-react";
import * as A from "effect/Array";

export const selectedFilesAtom = Atom.make({
  folderIds: A.empty<FolderId.Type>(),
  fileIds: A.empty<FileId.Type>(),
});
```

### Writable Atom with Optimistic Updates

```typescript
import { Atom, Result } from "@effect-atom/atom-react";
import * as Match from "effect/Match";
import * as A from "effect/Array";

export const filesAtom = Atom.writable(
  (get) => {
    get.mount(filesEventStreamAtom); // Subscribe to events
    return get(remoteFilesAtom);
  },
  (ctx, update: FileCacheUpdate) => {
    const current = ctx.get(filesAtom);
    if (current._tag !== "Success") return;

    const nextValue = Match.type<FileCacheUpdate>().pipe(
      Match.tagsExhaustive({
        AddFile: (u) => ({ ...current.value, files: A.append(current.value.files, u.file) }),
        DeleteFiles: (u) => ({
          ...current.value,
          files: A.filter(current.value.files, (f) => !A.contains(u.ids, f.id)),
        }),
      })
    );
    ctx.setSelf(Result.success(nextValue(update)));
  }
);
```

### Function Atom for Side Effects

```typescript
import { Atom, Registry } from "@effect-atom/atom-react";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";

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

### Event Listener Atom with Cleanup

```typescript
import { Atom } from "@effect-atom/atom-react";
import * as O from "effect/Option";

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

### Runtime-Backed Atom with Services

```typescript
import { Atom } from "@effect-atom/atom-react";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";

// In beep-effect, makeAtomRuntime is imported from @beep/runtime-client
import { makeAtomRuntime } from "@beep/runtime-client";

// Create module-specific runtime with services
const runtime = makeAtomRuntime(
  Layer.mergeAll(
    FilesApi.layer,
    BrowserHttpClient.layerXMLHttpRequest,
    FilesEventStream.layer,
  )
);

// Create atom backed by Effect
const filesAtom = runtime.atom(
  Stream.unwrap(
    Effect.gen(function* () {
      const api = yield* FilesApi.Service;
      return api.list();
    })
  )
);
```

## API Quick Reference

### Atom Creation

| Function                     | Description                                     |
|------------------------------|-------------------------------------------------|
| `Atom.make(initial)`         | Create atom with initial value or read function |
| `Atom.writable(read, write)` | Create read-write atom                          |
| `Atom.family(fn)`            | Parameterized atom factory                      |
| `Atom.context(options)`      | Create RuntimeFactory                           |
| `Atom.runtime`               | Default RuntimeFactory (pre-created)            |
| `Atom.map(atom, fn)`         | Derive from atom                                |

### React Hooks

| Hook                    | Return        | Description          |
|-------------------------|---------------|----------------------|
| `useAtomValue(atom)`    | `A`           | Read atom value      |
| `useAtomSet(atom)`      | `(A) => void` | Get setter           |
| `useAtom(atom)`         | `[A, Setter]` | Combined read/write  |
| `useAtomMount(atom)`    | `void`        | Keep atom alive      |
| `useAtomSuspense(atom)` | `A`           | With Suspense        |
| `useAtomRefresh(atom)`  | `() => void`  | Get refresh function |

### Atom Context API (inside read function)

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

### Write Context API (inside writable write function)

| Method                 | Description           |
|------------------------|-----------------------|
| `ctx.get(atom)`        | Read atom value       |
| `ctx.setSelf(value)`   | Write to self         |
| `ctx.set(atom, value)` | Write to another atom |
| `ctx.refreshSelf()`    | Trigger recomputation |

### Result Type

| Method                  | Description                               |
|-------------------------|-------------------------------------------|
| `Result.isInitial(r)`   | Check if not yet computed                 |
| `Result.isSuccess(r)`   | Check if successful                       |
| `Result.isFailure(r)`   | Check if failed                           |
| `result._tag`           | `"Initial"` \| `"Success"` \| `"Failure"` |
| `result.value`          | Success value (when Success)              |
| `result.cause`          | Failure cause (when Failure)              |
| `Result.success(value)` | Create success result                     |
| `Result.failure(cause)` | Create failure result                     |
| `Result.initial()`      | Create initial result                     |

## Component Usage

```tsx
import { useAtomValue, useAtomSet, RegistryProvider } from "@effect-atom/atom-react";

// Provider is REQUIRED at app root
function App() {
  return (
    <RegistryProvider>
      <FileList />
    </RegistryProvider>
  );
}

function FileList() {
  const filesResult = useAtomValue(filesAtom);
  const toggleSelection = useAtomSet(toggleFileSelectionAtom);

  if (filesResult._tag === "Initial") return <Spinner />;
  if (filesResult._tag === "Failure") return <Error cause={filesResult.cause} />;

  return (
    <ul>
      {filesResult.value.files.map(file => (
        <li key={file.id} onClick={() => toggleSelection(file.id)}>
          {file.name}
        </li>
      ))}
    </ul>
  );
}
```

## Atom Lifecycle and Dependencies

### get() vs get.mount() - Critical Difference

```typescript
// get(atom) - Creates dependency, atom deactivates when no subscribers
const derivedAtom = Atom.make((get) => {
  const value = get(sourceAtom); // Dependency: derivedAtom recomputes when sourceAtom changes
  return value * 2;             // BUT: sourceAtom may deactivate if derivedAtom unmounts
});

// get.mount(atom) - Keeps atom ALWAYS active, even with no subscribers
const aggregatorAtom = Atom.make((get) => {
  get.mount(eventStreamAtom);   // eventStreamAtom stays active as long as aggregatorAtom exists
  return get(processedDataAtom);
});
```

**When to use `get.mount()`**:
- Event streams that should keep running
- WebSocket connections that shouldn't disconnect
- Background sync processes
- Any atom whose side effects must persist

### Atom Activation Rules

1. **Atom activates** when first subscriber connects (component mounts with `useAtomValue`)
2. **Atom deactivates** when last subscriber disconnects (all components unmount)
3. **Finalizers run** on deactivation (`get.addFinalizer()`)
4. **State resets** on reactivation (atom re-runs its read function)

```typescript
// Atom with lifecycle awareness
export const connectionAtom = Atom.make((get) => {
  console.log("Connection atom activated");

  const ws = new WebSocket(url);

  get.addFinalizer(() => {
    console.log("Connection atom deactivating");
    ws.close(); // Cleanup on deactivation
  });

  return ws;
});
```

## Combining Multiple Atoms

### Waiting for Multiple Async Atoms

```typescript
// Derive from multiple Result atoms
const dashboardAtom = Atom.make((get) => {
  const usersResult = get(usersAtom);
  const filesResult = get(filesAtom);
  const statsResult = get(statsAtom);

  // All must succeed
  if (usersResult._tag !== "Success") return usersResult;
  if (filesResult._tag !== "Success") return filesResult;
  if (statsResult._tag !== "Success") return statsResult;

  return Result.success({
    users: usersResult.value,
    files: filesResult.value,
    stats: statsResult.value,
  });
});

// In component - shows loading until ALL are ready
function Dashboard() {
  const result = useAtomValue(dashboardAtom);

  if (result._tag === "Initial") return <Loading />;
  if (result._tag === "Failure") return <Error cause={result.cause} />;

  const { users, files, stats } = result.value;
  // ...
}
```

### Refreshing Multiple Atoms

```typescript
const refreshAllAtom = runtime.fn(
  Effect.fnUntraced(function* () {
    const registry = yield* Registry.AtomRegistry;

    // Refresh multiple atoms in parallel
    registry.refresh(usersAtom);
    registry.refresh(filesAtom);
    registry.refresh(statsAtom);
  })
);
```

## Typing Atoms

### Generic Atom Patterns

```typescript
// Typed atom factory
function createEntityAtom<T extends { id: string }>(
  fetchEffect: Effect.Effect<Array<T>, Error, ApiService>
) {
  return runtime.atom(fetchEffect);
}

// Usage
const usersAtom = createEntityAtom(UserApi.list());
const filesAtom = createEntityAtom(FilesApi.list());
```

### Atom Family with Types

```typescript
// Properly typed family
const entityDetailAtom = Atom.family(<T extends string>(id: T) =>
  runtime.atom(
    Effect.gen(function* () {
      const api = yield* EntityApi.Service;
      return yield* api.getById(id);
    })
  )
);

// Type is inferred
const detail = useAtomValue(entityDetailAtom("user-123")); // Result<EntityDetail>
```

## Atom Family Memory Management

Atom families cache their instances. Without cleanup, this can leak memory:

```typescript
// Family creates cached atoms per key
const itemAtomFamily = Atom.family((id: string) =>
  runtime.atom(Effect.gen(function* () {
    const api = yield* ItemApi.Service;
    return yield* api.getById(id);
  }))
);

// After navigating through 1000 items, you have 1000 cached atoms!

// Solution: Manually cleanup when no longer needed
const cleanupItemAtom = runtime.fn(
  Effect.fnUntraced(function* (id: string) {
    const registry = yield* Registry.AtomRegistry;
    // Remove from family cache when item is deleted or page navigates away
    itemAtomFamily.remove(id);
  })
);
```

## Common Pitfalls

### Pitfall 1: Creating Atoms Inside React Components

Atoms MUST be created at module scope, NOT inside React components or hooks. Creating atoms inside components creates new atom instances on every render.

```typescript
// WRONG - Creates new atom on every render
function MyComponent() {
  const myAtom = Atom.make(0); // BAD: new atom instance each render
  const value = useAtomValue(myAtom);
  return <div>{value}</div>;
}

// WRONG - Creating atoms inside useEffect
function MyComponent() {
  useEffect(() => {
    const dynamicAtom = Atom.make(someValue); // BAD: atom lost on unmount
  }, []);
}

// WRONG - Creating atoms inside React context providers
function MyProvider({ children }) {
  const contextAtom = Atom.make(initialState); // BAD: recreated on re-render
  return <Context.Provider value={contextAtom}>{children}</Context.Provider>;
}

// CORRECT - Atoms at module scope
const myAtom = Atom.make(0);

function MyComponent() {
  const value = useAtomValue(myAtom);
  return <div>{value}</div>;
}

// CORRECT - Use Atom.family for parameterized atoms
const itemAtomFamily = Atom.family((id: string) => Atom.make({ id, loaded: false }));

function ItemComponent({ id }: { id: string }) {
  const item = useAtomValue(itemAtomFamily(id)); // OK: family handles memoization
  return <div>{item.id}</div>;
}
```

### Pitfall 2: Runtime Atoms Must Be Module-Scoped

Runtime-backed atoms (`runtime.atom()`, `runtime.fn()`) must also be created at module scope:

```typescript
// WRONG - Runtime atom inside component
function MyComponent() {
  const dataAtom = runtime.atom(Effect.gen(function* () {
    // ...
  })); // BAD: new atom each render
}

// CORRECT - Module scope
const dataAtom = runtime.atom(
  Effect.gen(function* () {
    const api = yield* MyApi.Service;
    return yield* api.getData();
  })
);

function MyComponent() {
  const result = useAtomValue(dataAtom);
  // ...
}
```

### Pitfall 3: Forgetting RegistryProvider

Unlike jotai which works without a provider, effect-atom REQUIRES `RegistryProvider`:

```tsx
// WRONG - No provider, atoms won't work
function App() {
  return <MyComponent />;
}

// CORRECT - Provider wraps app
function App() {
  return (
    <RegistryProvider>
      <MyComponent />
    </RegistryProvider>
  );
}
```

### Pitfall 4: Using get() Outside Read Context

The `get` function is only available inside atom read functions:

```typescript
// WRONG - get() outside atom context
const value = get(someAtom); // Error: get is not defined

// CORRECT - get() inside atom read function
const derivedAtom = Atom.make((get) => {
  const value = get(someAtom);
  return value * 2;
});

// CORRECT - registry.get() for imperative access
const myFnAtom = runtime.fn(
  Effect.fnUntraced(function* () {
    const registry = yield* Registry.AtomRegistry;
    const value = registry.get(someAtom);
    // ...
  })
);
```

### Pitfall 5: Result Handling

Runtime atoms return `Result` types, not raw values:

```typescript
// WRONG - Treating result as direct value
function MyComponent() {
  const data = useAtomValue(dataAtom);
  return <div>{data.name}</div>; // Error: data might be Initial or Failure
}

// CORRECT - Handle all Result states
function MyComponent() {
  const result = useAtomValue(dataAtom);

  if (Result.isInitial(result)) return <Spinner />;
  if (Result.isFailure(result)) return <Error cause={result.cause} />;

  return <div>{result.value.name}</div>;
}

// CORRECT - Use Suspense for cleaner handling
function MyComponent() {
  const data = useAtomSuspense(dataAtom); // Suspends until Success
  return <div>{data.name}</div>;
}
```

### Pitfall 6: Confusing get() with get.mount()

```typescript
// WRONG - Using get() for event streams (may disconnect)
const processedEventsAtom = Atom.make((get) => {
  const events = get(eventStreamAtom); // BAD: stream may stop when this unmounts
  return processEvents(events);
});

// CORRECT - Use get.mount() to keep stream alive
const processedEventsAtom = Atom.make((get) => {
  get.mount(eventStreamAtom); // GOOD: stream stays active
  const events = get(eventStreamAtom);
  return processEvents(events);
});
```

### Pitfall 7: Forgetting to Refresh After Mutations

```typescript
// WRONG - Data is stale after mutation
const deleteFileAtom = runtime.fn(
  Effect.fnUntraced(function* (fileId: string) {
    const api = yield* FilesApi.Service;
    yield* api.delete(fileId);
    // filesAtom still shows deleted file!
  })
);

// CORRECT - Refresh or update local state
const deleteFileAtom = runtime.fn(
  Effect.fnUntraced(function* (fileId: string) {
    const api = yield* FilesApi.Service;
    yield* api.delete(fileId);

    // Option 1: Refresh from server
    const registry = yield* Registry.AtomRegistry;
    registry.refresh(filesAtom);

    // Option 2: Optimistically update local state
    const current = registry.get(filesAtom);
    if (current._tag === "Success") {
      registry.set(filesAtom, Result.success(
        A.filter(current.value, f => f.id !== fileId)
      ));
    }
  })
);
```

### Pitfall 8: Circular Dependencies

```typescript
// WRONG - Circular dependency causes infinite loop
const atomA = Atom.make((get) => get(atomB) + 1);
const atomB = Atom.make((get) => get(atomA) + 1); // INFINITE LOOP!

// CORRECT - Break the cycle with a base atom
const baseAtom = Atom.make(0);
const atomA = Atom.make((get) => get(baseAtom) + 1);
const atomB = Atom.make((get) => get(baseAtom) + 2);
```

### Pitfall 9: Blocking in Read Functions

```typescript
// WRONG - Async/blocking in Atom.make read function
const badAtom = Atom.make(async (get) => {
  const response = await fetch('/api/data'); // WRONG: Atom.make doesn't handle async
  return response.json();
});

// CORRECT - Use runtime.atom for async operations
const goodAtom = runtime.atom(
  Effect.gen(function* () {
    const http = yield* HttpClient.HttpClient;
    const response = yield* http.get('/api/data');
    return yield* response.json;
  })
);
```

## Testing Atoms

### Unit Testing Simple Atoms

```typescript
import { Atom, Registry } from "@effect-atom/atom-react";
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";

// Test simple atom
effect("counter atom increments", () =>
  Effect.gen(function* () {
    const registry = Registry.make();

    // Get initial value
    const initial = registry.get(counterAtom);
    strictEqual(initial, 0);

    // Set new value
    registry.set(counterAtom, 1);
    strictEqual(registry.get(counterAtom), 1);
  })
);
```

### Testing Runtime Atoms with Services

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

// Create test layer with mock service
const TestFilesApi = Layer.succeed(FilesApi.Service, {
  list: () => Effect.succeed([{ id: "1", name: "test.txt" }]),
  delete: (id) => Effect.succeed(void 0),
});

// Test with mocked services
effect("files atom loads data", () =>
  Effect.gen(function* () {
    // Create runtime with test layer
    const testRuntime = makeAtomRuntime(TestFilesApi);
    const testFilesAtom = testRuntime.atom(
      Effect.gen(function* () {
        const api = yield* FilesApi.Service;
        return yield* api.list();
      })
    );

    const registry = Registry.make();

    // Wait for atom to resolve
    yield* Effect.sleep("100 millis");

    const result = registry.get(testFilesAtom);
    strictEqual(result._tag, "Success");
    strictEqual(result.value.length, 1);
  })
);
```

### Testing Components with Atoms

```tsx
import { render, screen } from "@testing-library/react";
import { RegistryProvider } from "@effect-atom/atom-react";

// Wrap component in provider for tests
function renderWithAtoms(ui: React.ReactElement) {
  return render(
    <RegistryProvider>
      {ui}
    </RegistryProvider>
  );
}

test("FileList shows files", async () => {
  renderWithAtoms(<FileList />);

  // Wait for loading to complete
  await screen.findByText("test.txt");
});
```

## Codebase Reference Files

For real-world patterns, see these files in the beep-effect codebase:

- **Runtime setup**: `packages/shared/client/src/atom/files/runtime.ts`
- **Writable atom with Result handling**: `packages/shared/client/src/atom/files/atoms/files.atom.ts`
- **Event listener with cleanup**: `packages/shared/client/src/atom/location.atom.ts`
- **Selected state atom**: `packages/shared/client/src/atom/files/atoms/selectedFiles.atom.ts`
- **Runtime factory definition**: `packages/runtime/client/src/runtime.ts`
