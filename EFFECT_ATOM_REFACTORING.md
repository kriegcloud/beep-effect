# Effect Atom Refactoring Analysis

## Summary

The current TodoList component **correctly uses `useAtomValue`** for all atom subscriptions, which is good. However, the VM layer needs refactoring to follow proper Effect Atom patterns for actions/mutations.

## Issues Found

### 1. Actions are Plain Functions Instead of Atom.fn

**Current (Incorrect):**
```typescript
// TodoVMLayer.ts
const updateNewTodoText = (text: string) => {
  registry.set(newTodoText$, text);
};

// TodoList.tsx
onChange={(e) => vm.updateNewTodoText(e.target.value)}
```

**Problem:** Plain functions bypass Effect Atom's reactive system and don't integrate properly with hooks like `useAtomSet`.

**Correct Pattern:**
```typescript
// TodoVMLayer.ts
const updateNewTodoText$ = Atom.fn((text: string) =>
  Effect.sync(() => {
    registry.set(newTodoText$, text);
  })
);

// TodoList.tsx
const updateText = useAtomSet(vm.updateNewTodoText$);
onChange={(e) => updateText(e.target.value)}
```

### 2. TodoItem Actions Not Using Atom.fn

**Current (Incorrect):**
```typescript
return {
  toggleComplete: () => {
    const current = registry.get(completed$);
    registry.set(completed$, !current);
  },
  remove: () => { /* ... */ }
};
```

**Correct Pattern:**
```typescript
const toggleComplete$ = Atom.fn(() =>
  Effect.sync(() => {
    const current = registry.get(completed$);
    registry.set(completed$, !current);
  })
);

return {
  toggleComplete$,
  remove$
};
```

## What's Correct

1. **useAtomValue for all subscriptions** - Component properly subscribes to atoms
2. **Derived atoms** - Correctly using `Atom.make((get) => ...)` pattern
3. **Component structure** - Good composition, no boolean props
4. **Context usage** - Proper use of `useVM` hook to get VM from context

## Required Changes

### Files to Update:

1. **`lib/features/todos/TodoVM.ts`**
   - Change action methods from plain functions to `Atom.Writable` types
   - Suffix action names with `$` to indicate they're atoms

2. **`lib/features/todos/TodoVMLayer.ts`**
   - Wrap all actions in `Atom.fn`
   - Return `Effect.sync` or other Effect for actions
   - Update TodoItem creation to use `Atom.fn` for actions

3. **`components/TodoList.tsx`**
   - Use `useAtomSet` for all actions
   - Replace direct method calls with hook-created functions

## Effect Atom Best Practices

### Reading State
```typescript
// Use useAtomValue for subscriptions
const value = useAtomValue(atom$);

// Can pass a selector for derived values
const doubled = useAtomValue(atom$, (v) => v * 2);
```

### Writing State
```typescript
// For simple state atoms
const setValue = useAtomSet(atom$);
setValue(newValue);
setValue((prev) => prev + 1); // updater function

// For Atom.fn actions
const doAction = useAtomSet(actionAtom$);
doAction(params);

// For async operations that return Result
const create = useAtomSet(createAtom$, { mode: "promiseExit" });
const exit = await create(data);
```

### Creating Actions
```typescript
// Simple sync action
const increment$ = Atom.fn(() =>
  Effect.sync(() => {
    const current = registry.get(count$);
    registry.set(count$, current + 1);
  })
);

// Async action
const fetchData$ = Atom.fn((id: string) =>
  Effect.gen(function* () {
    const service = yield* SomeService;
    const data = yield* service.fetch(id);
    registry.set(dataAtom$, data);
    return data;
  })
);
```

## Migration Path

1. Update VM interface to use `Atom.Writable` for actions
2. Refactor VM layer to use `Atom.fn` for all actions
3. Update component to use `useAtomSet` for all actions
4. Test thoroughly to ensure reactivity works correctly

## Reference Files

- **Current implementation:**
  - `/Users/front_depiction/Desktop/Phosphor/vmtest/components/TodoList.tsx`
  - `/Users/front_depiction/Desktop/Phosphor/vmtest/lib/features/todos/TodoVM.ts`
  - `/Users/front_depiction/Desktop/Phosphor/vmtest/lib/features/todos/TodoVMLayer.ts`

- **Refactored versions:**
  - `/Users/front_depiction/Desktop/Phosphor/vmtest/components/TodoList.final.tsx`
  - `/Users/front_depiction/Desktop/Phosphor/vmtest/lib/features/todos/TodoVM.refactored.ts`
  - `/Users/front_depiction/Desktop/Phosphor/vmtest/lib/features/todos/TodoVMLayer.refactored.ts`

## Compositional Patterns (Already Good)

The component already follows good compositional patterns:

- No boolean props
- Atomic `TodoItemComponent` composes well
- Clear separation of concerns
- Proper namespace imports would be: `import * as TodoList from "./TodoList"`
- State lifted appropriately via VM context

## Next Steps

Apply the refactored patterns to the actual implementation files, or use them as a reference for future VM implementations.
