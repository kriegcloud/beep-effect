# VM Layer Pattern Demo - Todo App

A demonstration of the **VM Layer Pattern** using Effect, Effect Atom, and shadcn UI. This pattern treats View Models as Effect Layers, creating a clean, testable, and composable architecture for React applications.

## Features

- ✅ Add, complete, and remove todos
- ✅ Persistent storage (localStorage)
- ✅ Fine-grained reactivity with Effect Atom
- ✅ Type-safe dependency injection with Effect Layers
- ✅ Clean separation of concerns (Services → VM → UI)

## Architecture

### Layer Hierarchy

```
Application
├── Platform Layer: KeyValueStore
│   └── BrowserKeyValueStore (localStorage)
├── VM Layer: TodoVM
│   ├── Pure functions (TodoItem module)
│   ├── Atoms (fine-grained reactive state)
│   ├── Derived atoms (computed values)
│   └── Actions (Atom.fn/fnSync)
└── UI Layer: React components
    └── useAtomValue + useAtomSet hooks
```

### Key Files

#### 1. **Data Model** (`lib/features/todos/TodoItem.ts`)
- `Todo`: Schema.Struct for type-safe serialization
- `TodoItem`: Interface for reactive todo item with atoms
- `fromTodo`: Pure function to create TodoItem from Todo data
- Clean separation between data (Todo) and UI state (TodoItem)

#### 2. **View Model** (`lib/features/todos/`)
- **TodoVM.ts**: Context Tag interface defining the VM contract
  - State atoms: `todos$`, `newTodoText$`
  - Derived atoms: `totalCount$`, `completedCount$`, `statusDisplay$`
  - Actions: `addTodo$`, `clearCompleted$`, `updateNewTodoText$`

- **TodoVMLayer.ts**: Layer implementation
  - Uses KeyValueStore directly (no intermediate service)
  - Pure functions from TodoItem module
  - Schema-based encoding/decoding for type safety
  - Actions wrapped in `Atom.fn` (async) or `Atom.fnSync` (sync)
  - Depends on `KeyValueStore` and `AtomRegistry`

#### 3. **React Components** (`components/TodoList.tsx`)
- Uses `useAtomValue` for reactive subscriptions
- Uses `useAtomSet` for action invocations
- Clean, compositional component structure

#### 4. **Runtime** (`app/runtime.ts`)
- Composes all layers: `TodoVMLayer` + `Registry.layer` + `BrowserKeyValueStore.layerLocalStorage`
- Provides Effect context to React
- `useVM` hook for accessing services

## Key Patterns

### 1. Fine-Grained Reactive Primitives

```typescript
// Bad: Coarse updates
interface BadVM {
  state: { name: string; email: string; age: number };
}

// Good: Fine-grained atoms
interface GoodVM {
  name$: Atom.Writable<string>;
  email$: Atom.Writable<string>;
  age$: Atom.Writable<number>;
}
```

### 2. Effect-Based Atom Operations

```typescript
// Use Atom.get/set/update instead of registry directly
const addTodo$ = Atom.fn(() =>
  Effect.gen(function* () {
    const text = yield* Atom.get(newTodoText$);
    yield* Atom.update(todos$, current => [...current, newItem]);
    yield* Atom.set(newTodoText$, "");
  })
);
```

### 3. Actions as Atoms

```typescript
// VM Layer: Wrap actions in Atom.fn/fnSync
const updateText$ = Atom.fnSync((text: string, get) => {
  // sync operation
});

// React: Use useAtomSet
const updateText = useAtomSet(vm.updateText$);
onChange={(e) => updateText(e.target.value)}
```

### 4. Type-Safe Action Signatures

```typescript
// Atom.fnSync for sync operations with params
updateNewTodoText$: Atom.Writable<Option.Option<void>, string>

// Atom.fn for async operations (returns Result)
addTodo$: Atom.AtomResultFn<void, void, never>
```

## Running the App

```bash
# Install dependencies
bun install

# Development
bun run dev

# Build
bun run build

# Start production server
bun run start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Technology Stack

- **Next.js 16** - React framework with App Router
- **Effect** - Typed functional effect system
- **Effect Atom** - Fine-grained reactivity
- **shadcn/ui** - Beautiful, accessible components
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type safety

## Project Structure

```
vmtest/
├── app/
│   ├── page.tsx              # Root page component
│   └── runtime.ts            # Effect context & layer composition
├── components/
│   ├── ui/                   # shadcn UI components
│   └── TodoList.tsx          # Todo list component
├── lib/
│   └── features/
│       └── todos/
│           ├── TodoItem.ts   # Data model & pure functions
│           ├── TodoVM.ts     # VM interface
│           └── TodoVMLayer.ts # VM implementation
└── .context/
    └── effect-atom/          # Effect Atom submodule (reference)
```

## Refactoring Patterns Applied

### 1. Direct Platform Module Usage
Instead of wrapping KeyValueStore in a custom service, we use it directly:

```typescript
// ❌ Before: Custom service wrapper
export class TodoStorageService extends Context.Tag(...)
export const TodoStorageServiceLive = Layer.succeed(...)

// ✅ After: Direct KeyValueStore usage
const store = yield* KeyValueStore.KeyValueStore
yield* store.get(STORAGE_KEY)
```

### 2. Schema-Based Serialization
Type-safe encoding/decoding with Effect Schema:

```typescript
export const Todo = Schema.Struct({
  id: Schema.String,
  text: Schema.String,
  completed: Schema.Boolean
});

const decoded = yield* Schema.decodeUnknown(Schema.Array(Todo))(json);
const encoded = yield* Schema.encode(Schema.Array(Todo))(todos);
```

### 3. Pure Functions for Construction
TodoItem construction is a pure function, not embedded in the layer:

```typescript
// Pure function in TodoItem module
export const fromTodo = (
  todo: Todo,
  onToggle: (id: string) => Effect.Effect<void>,
  onRemove: (id: string) => Effect.Effect<void>
): TodoItem => ({ ... })

// Used in layer
const createTodoItem = (todo: TodoItem.Todo) =>
  TodoItem.fromTodo(todo, handleToggle, handleRemove);
```

## Benefits of VM Layer Pattern

1. **True Dependency Injection**: VMs declare dependencies through Effect system
2. **Composability**: VMs compose like Layers - vertically and horizontally
3. **Testability**: Swap implementations without mocking
4. **Type Safety**: Dependencies tracked in type system
5. **Fine-Grained Reactivity**: Atoms provide surgical updates
6. **Clean Boundaries**: UI cannot access services directly
7. **Direct Platform Usage**: Leverage @effect/platform modules without wrappers
8. **Schema-Driven**: Type-safe serialization with automatic validation

## Learning Resources

- [Effect Documentation](https://effect.website)
- [Effect Atom](https://github.com/Effect-TS/atom)
- [VM Layer Pattern Guide](./EFFECT_ATOM_REFACTORING.md)
