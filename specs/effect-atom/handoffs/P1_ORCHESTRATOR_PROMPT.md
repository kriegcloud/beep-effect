# P1 Orchestrator Prompt: Create Effect-Atom Skill

## Task

Create a Claude Code skill file at `.claude/skills/effect-atom.md` that prevents confusion between `@effect-atom/atom-react` and `jotai`.

## Context

The beep-effect codebase uses `@effect-atom/atom-react` for reactive state management. Claude frequently misapplies jotai patterns due to similar naming. This skill must explicitly differentiate the two libraries and guide to correct patterns.

## Pre-Implementation Reading

Before writing the skill, read these files in order:

1. **Corrections first**: `specs/effect-atom/outputs/synthesis-review.md` - Critical fixes needed
2. **Import fix**: `specs/effect-atom/outputs/architecture-review.md` - Package import correction
3. **Main reference**: `specs/effect-atom/outputs/SYNTHESIS.md` - API documentation (apply corrections!)
4. **Real patterns**:
   - `packages/shared/client/src/atom/files/runtime.ts`
   - `packages/shared/client/src/atom/files/atoms/files.atom.ts`
   - `packages/shared/client/src/atom/location.atom.ts`

## Skill File Template

Create `.claude/skills/effect-atom.md` with this structure:

```markdown
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
makeAtomRuntime.addGlobalLayer(clientRuntimeLayer);

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

| Jotai Pattern (WRONG)           | Why It Fails         | effect-atom Pattern (CORRECT)                            |
|---------------------------------|----------------------|----------------------------------------------------------|
| `import { atom } from 'jotai'`  | Wrong library        | `import { Atom } from '@effect-atom/atom-react'`         |
| `const a = atom(0)`             | Jotai syntax         | `const a = Atom.make(0)`                                 |
| `const [val, set] = useAtom(a)` | Jotai hook pattern   | `const val = useAtomValue(a); const set = useAtomSet(a)` |
| `atom((get) => get(other) * 2)` | Jotai derived syntax | `Atom.make((get) => get(other) * 2)`                     |
| `atom(async (get) => ...)`      | Jotai async          | `runtime.atom(Effect.gen(...))`                          |
| No Provider needed              | Jotai is implicit    | `RegistryProvider` is REQUIRED                           |

## Required: effect-atom Patterns

### Simple State Atom

```typescript
import { Atom } from "@effect-atom/atom-react";

export const selectedFilesAtom = Atom.make({
  folderIds: [] as FolderId[],
  fileIds: [] as FileId[],
});
```

### Writable Atom with Optimistic Updates

```typescript
import { Atom, Result } from "@effect-atom/atom-react";
import * as Match from "effect/Match";

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
        AddFile: (u) => ({ ...current.value, files: [...current.value.files, u.file] }),
        DeleteFiles: (u) => ({ ...current.value, files: current.value.files.filter(f => !u.ids.includes(f.id)) }),
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
  Effect.fnUntraced(function* (fileId: FileId) {
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

// Create runtime factory with services
const runtime = Atom.context({ memoMap: Atom.defaultMemoMap });
runtime.addGlobalLayer(Layer.mergeAll(
  FilesApi.layer,
  BrowserHttpClient.layerXMLHttpRequest,
));

// Create atom backed by Effect
const filesAtom = runtime.atom(
  Effect.gen(function* () {
    const api = yield* FilesApi.Service;
    return yield* api.list();
  })
);
```

## API Quick Reference

### Atom Creation

| Function                     | Description                |
|------------------------------|----------------------------|
| `Atom.make(initial)`         | Create read-only atom      |
| `Atom.writable(read, write)` | Create read-write atom     |
| `Atom.family(fn)`            | Parameterized atom factory |
| `Atom.context(options)`      | Create RuntimeFactory      |
| `Atom.runtime`               | Default RuntimeFactory     |
| `Atom.map(atom, fn)`         | Derive from atom           |

### React Hooks

| Hook                    | Return        | Description     |
|-------------------------|---------------|-----------------|
| `useAtomValue(atom)`    | `A`           | Read atom value |
| `useAtomSet(atom)`      | `(A) => void` | Get setter      |
| `useAtom(atom)`         | `[A, Setter]` | Combined        |
| `useAtomMount(atom)`    | `void`        | Keep atom alive |
| `useAtomSuspense(atom)` | `A`           | With Suspense   |

### Result Type

| Method                | Description                         |
|-----------------------|-------------------------------------|
| `Result.isInitial(r)` | Check if not yet computed           |
| `Result.isSuccess(r)` | Check if successful                 |
| `Result.isFailure(r)` | Check if failed                     |
| `result._tag`         | "Initial" \| "Success" \| "Failure" |
| `result.value`        | Success value (when Success)        |
| `result.cause`        | Failure cause (when Failure)        |

## Component Usage

```tsx
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";

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
```

## Verification Steps

After creating the skill:

1. **Check file location**: `.claude/skills/effect-atom.md` exists
2. **Verify imports**: All code uses `@effect-atom/atom-react`
3. **Test activation**: Open a `.tsx` file, ask about atoms
4. **Test correction**: Provide jotai code, expect correction

## Success Criteria

- [ ] Skill file created at correct location
- [ ] All imports use `@effect-atom/atom-react`
- [ ] Jotai patterns marked as FORBIDDEN with table
- [ ] effect-atom patterns marked as REQUIRED with examples
- [ ] Critical Rules section is prominent and clear
- [ ] Real beep-effect code examples included
- [ ] Result type handling documented
- [ ] Component usage example included
