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
const filesRuntime = makeAtomRuntime(Layer.mergeAll(FilesApi.layer, ...));
```

### Rule 3: Atom.runtime is Pre-Created (NOT a Function)

```typescript
// Atom.runtime is already a RuntimeFactory instance (using default settings)
// Use it directly to create runtimes:
const myRuntime = Atom.runtime(MyServiceLayer);

// NOT: Atom.runtime((layer) => ...) - this is wrong
```

## Forbidden: Jotai Patterns

| Jotai Pattern (WRONG) | Why It Fails | effect-atom Pattern (CORRECT) |
|-----------------------|--------------|-------------------------------|
| `import { atom } from 'jotai'` | Wrong library | `import { Atom } from '@effect-atom/atom-react'` |
| `const a = atom(0)` | Jotai syntax | `const a = Atom.make(0)` |
| `const [val, set] = useAtom(a)` | Jotai hook pattern | `const val = useAtomValue(a); const set = useAtomSet(a)` |
| `atom((get) => get(other) * 2)` | Jotai derived syntax | `Atom.make((get) => get(other) * 2)` |
| `atom(async (get) => ...)` | Jotai async | `runtime.atom(Effect.gen(...))` |
| `useSetAtom(atom)` | Wrong hook name | `useAtomSet(atom)` |
| No Provider needed | Jotai is implicit | `RegistryProvider` is REQUIRED |

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

| Function | Description |
|----------|-------------|
| `Atom.make(initial)` | Create atom with initial value or read function |
| `Atom.writable(read, write)` | Create read-write atom |
| `Atom.family(fn)` | Parameterized atom factory |
| `Atom.context(options)` | Create RuntimeFactory |
| `Atom.runtime` | Default RuntimeFactory (pre-created) |
| `Atom.map(atom, fn)` | Derive from atom |

### React Hooks

| Hook | Return | Description |
|------|--------|-------------|
| `useAtomValue(atom)` | `A` | Read atom value |
| `useAtomSet(atom)` | `(A) => void` | Get setter |
| `useAtom(atom)` | `[A, Setter]` | Combined read/write |
| `useAtomMount(atom)` | `void` | Keep atom alive |
| `useAtomSuspense(atom)` | `A` | With Suspense |
| `useAtomRefresh(atom)` | `() => void` | Get refresh function |

### Atom Context API (inside read function)

| Method | Description |
|--------|-------------|
| `get(atom)` | Synchronously read another atom |
| `get.result(atom)` | Get Result from effectful atom |
| `get.mount(atom)` | Ensure atom is active |
| `get.refresh(atom)` | Trigger recomputation |
| `get.setSelf(value)` | Update self value |
| `get.addFinalizer(fn)` | Register cleanup |
| `get.stream(atom)` | Create stream of changes |
| `get.subscribe(atom, fn)` | Listen to changes |

### Write Context API (inside writable write function)

| Method | Description |
|--------|-------------|
| `ctx.get(atom)` | Read atom value |
| `ctx.setSelf(value)` | Write to self |
| `ctx.set(atom, value)` | Write to another atom |
| `ctx.refreshSelf()` | Trigger recomputation |

### Result Type

| Method | Description |
|--------|-------------|
| `Result.isInitial(r)` | Check if not yet computed |
| `Result.isSuccess(r)` | Check if successful |
| `Result.isFailure(r)` | Check if failed |
| `result._tag` | `"Initial"` \| `"Success"` \| `"Failure"` |
| `result.value` | Success value (when Success) |
| `result.cause` | Failure cause (when Failure) |
| `Result.success(value)` | Create success result |
| `Result.failure(cause)` | Create failure result |
| `Result.initial()` | Create initial result |

## Component Usage

```typescript
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

## Codebase Reference Files

For real-world patterns, see these files in the beep-effect codebase:

- **Runtime setup**: `packages/shared/client/src/atom/files/runtime.ts`
- **Writable atom with Result handling**: `packages/shared/client/src/atom/files/atoms/files.atom.ts`
- **Event listener with cleanup**: `packages/shared/client/src/atom/location.atom.ts`
- **Selected state atom**: `packages/shared/client/src/atom/files/atoms/selectedFiles.atom.ts`
- **Runtime factory definition**: `packages/runtime/client/src/runtime.ts`
