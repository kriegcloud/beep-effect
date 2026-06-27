---
name: effect-atom-v4
description: "Effect Atom v4 patterns for React state management. Use when working with effect/unstable/reactivity, atoms, AtomRegistry, useAtomValue, useAtom, Atom.family, runtime.atom, derived atoms, persistent storage. Triggers on Atom.make, Atom.writable, Atom.kvs, useAtomSuspense, AsyncResult, BrowserKeyValueStore, effect/unstable/reactivity."
---

# Effect Atom (v4)

Reactive state management for React, built on Effect.

## Imports

```ts
import { AsyncResult, Atom, AtomRegistry, Reactivity } from "effect/unstable/reactivity";

import {
  RegistryContext,
  RegistryProvider,
  useAtom,
  useAtomMount,
  useAtomRefresh,
  useAtomSet,
  useAtomSubscribe,
  useAtomSuspense,
  useAtomValue,
} from "@effect/atom-react";
```

Individual module imports also work:

```ts
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult";
import * as Atom from "effect/unstable/reactivity/Atom";
import * as AtomRegistry from "effect/unstable/reactivity/AtomRegistry";
```

## Core Atom Creation

### `Atom.make`

```ts
Atom.make<A>(initialValue: A): Writable<A>
Atom.make<A>(create: (get: Context) => A): Atom<A>
Atom.make<A, E>(effect: Effect<A, E>): Atom<AsyncResult<A, E>>
Atom.make<A, E>(stream: Stream<A, E>): Atom<AsyncResult<A, E | Cause.NoSuchElementError>>
```

```ts
const counter = Atom.make(0);

const doubled = Atom.make((get) => get(counter) * 2);

const user = Atom.make(
  Effect.promise(() => fetch("/api/user").then((r) => r.json())),
);

const data = Atom.make(fetchData, { initialValue: [] });
```

Effect and Stream atoms return `AsyncResult<A, E>` which has states:
`Initial`, `Success`, `Failure`. The `waiting` field indicates async
activity.

**Effect atoms**: `waiting = true` while running, `waiting = false` when
complete.

**Stream atoms**:

- `waiting = true` + `Success`: stream is still producing values
- `waiting = false` + `Success`: stream completed
- `Failure` with `NoSuchElementError`: stream completed without emitting

### `AsyncResult.builder`

Fluent API for rendering async result states:

```ts
AsyncResult.builder(result)
  .onInitial(() => <p>Loading...</p>)
  .onSuccess((value, { waiting }) => (
    <div>
      <p>{value.name}</p>
      {waiting && <Spinner />}
    </div>
  ))
  .onFailure((cause) => <p>Error: {Cause.pretty(cause)}</p>)
  .render();
```

Methods:

- `onInitial(f)`: handle `Initial` state
- `onSuccess((value, result) => ...)`: handle `Success`, second arg has `waiting` flag
- `onFailure((cause, result) => ...)`: handle `Failure`
- `onWaiting(f)`: handle any state where `waiting = true`
- `onInitialOrWaiting(f)`: handle `Initial` OR `waiting = true`
- `onErrorTag(tag, f)`: narrow error by `_tag`
- `onErrorIf(predicate, f)`: narrow error by predicate
- `onError(f)`: handle all errors (vs defects)
- `onDefect(f)`: handle defects specifically
- `render()`: finalize (returns `null` for unhandled, throws on unhandled `Failure`)
- `orNull()`: finalize (returns `null` for unhandled, including `Failure`)
- `orElse(() => fallback)`: finalize with fallback for unhandled

## `Atom.family`

Parameterized atoms with caching. Uses `WeakRef` + `FinalizationRegistry`
for GC when available, falls back to `MutableHashMap`.

```ts
const countByKey = Atom.family((key: string) => Atom.make(0));
countByKey("a"); // Atom for key "a"
countByKey("a"); // Same atom instance (cached)

const userById = Atom.family((id: string) =>
  Atom.make(Effect.promise(() => fetch(`/api/users/${id}`).then((r) => r.json())))
);
```

**Compound keys with `Data.Class`** for deep equality:

```ts
class UserQuery extends Data.Class<{
  id: string;
  includeProfile: boolean;
}> {}

const userAtom = Atom.family((query: UserQuery) =>
  Atom.make(fetchUser(query.id, query.includeProfile))
);

userAtom(new UserQuery({ id: "1", includeProfile: true }));
userAtom(new UserQuery({ id: "1", includeProfile: true })); // Same atom
```

## `runtime.atom` & `runtime.fn`

Atoms that depend on Effect services:

```ts
const appRuntime = Atom.runtime(HttpClient.layer);

const users = appRuntime.atom(
  Effect.gen(function*() {
    const http = yield* HttpClient.HttpClient;
    return yield* http.get("/api/users").pipe(HttpClientResponse.json);
  }),
);

const createUser = appRuntime.fn<{ name: string; }>()(
  Effect.fn(function*(input, get) {
    const http = yield* HttpClient.HttpClient;
    return yield* http.post("/api/users", { body: input });
  }),
);
```

`runtime.atom` waits for the runtime to be ready. If the Layer fails, all
dependent atoms get the error.

### `runtime.fn(..., { reactivityKeys })` and `Atom.withReactivity`

Use reactivity keys to invalidate related query atoms after mutations:

```ts
const runtime = Atom.runtime(Api.layer);

const todosAtom = runtime.atom(fetchTodos).pipe(
  Atom.withReactivity(["todos"]),
);

const createTodo = runtime.fn<{ title: string; }>()(
  Effect.fn(function*(input) {
    const api = yield* Api;
    return yield* api.createTodo(input);
  }),
  { reactivityKeys: ["todos"] },
);
```

You can also invalidate keys manually inside Effects:

```ts
yield * Reactivity.invalidate(["todos"]);
```

`Atom.withReactivity(keys)` refreshes atoms whenever those keys are invalidated.

## `Atom.fn`

Effectful function atoms. Each `set` triggers the function:

```ts
const increment = Atom.fn((n: number, get) => Effect.succeed(get(counter) + n));

registry.set(increment, 5);
```

In React:

```ts
const run = useAtomSet(increment);
run(5);

const run = useAtomSet(increment, { mode: "promise" });
const result = await run(5);
```

Options:

- `concurrent: false` (default): new calls interrupt in-progress ones
- `concurrent: true`: calls run in parallel
- `initialValue`: starting value instead of `Initial`

Curried form for explicit arg typing:

```ts
const increment = Atom.fn<number>()((n, get) => Effect.succeed(get(counter) + n));
```

### `Atom.fnSync`

Synchronous version. Returns `Writable<Option<A>, Arg>` or
`Writable<A, Arg>` with `initialValue`:

```ts
const format = Atom.fnSync((input: string) => input.toUpperCase());
```

## `Atom.pull`

Stream-based pagination and infinite scroll:

```ts
const itemsAtom = Atom.pull(Stream.make(1, 2, 3, 4, 5));

const [result, pull] = useAtom(itemsAtom);

AsyncResult.builder(result)
  .onInitial(() => <p>Loading...</p>)
  .onFailure((cause) => <p>Error: {Cause.pretty(cause)}</p>)
  .onSuccess(({ items, done }, { waiting }) => (
    <div>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
      {!done && <button onClick={() => pull()}>Load more</button>}
      {waiting && <p>Loading...</p>}
    </div>
  ))
  .render();
```

**Pagination with `Stream.paginate`**:

```ts
const paginatedTodos = runtime.pull((get) => {
  const query = get(searchInput$);

  return Stream.paginate(null as string | null, (cursor) =>
    Effect.gen(function*() {
      const api = yield* Api;
      const page = yield* api.getTodos({ query, cursor });

      return [page.items, Option.fromNullable(page.nextCursor)] as const;
    })).pipe(Stream.flattenIterables);
});
```

How it works:

1. First mount pulls first chunk, `result.waiting` is true
2. `pull()` (set with void) pulls next chunk, items accumulate
3. `result.value.done === true` means stream exhausted
4. `registry.refresh(atom)` restarts stream from beginning
5. `Failure` with `NoSuchElementError` means stream produced no items

Options:

- `disableAccumulation: true`: only show current chunk

## Derived Atoms

### `Atom.writable`

Derived atom with custom setter:

```ts
const userAtom = (() => {
  const remote = runtime.atom(fetchUser);

  return Atom.writable(
    (get) => get(remote),
    (ctx, update: UserUpdate) => {
      ctx.setSelf(update);
    },
    (refresh) => refresh(remote),
  );
})();
```

**With `Data.TaggedEnum` for write actions**:

```ts
type CacheAction = Data.TaggedEnum<{
  Set: { value: User; };
  Optimistic: { value: User; };
  Invalidate: {};
}>;
const CacheAction = Data.taggedEnum<CacheAction>();

const userAtom = (() => {
  const remote = runtime.atom(fetchUser);

  return Atom.writable(
    (get) => get(remote),
    (ctx, action: CacheAction) => {
      switch (action._tag) {
        case "Set":
          ctx.setSelf(AsyncResult.success(action.value));
          break;
        case "Invalidate":
          ctx.refreshSelf();
          break;
      }
    },
    (refresh) => refresh(remote),
  );
})();
```

### `Atom.readable`

Read-only derived:

```ts
const fullName = Atom.readable((get) => {
  const user = get(userAtom);
  return `${user.firstName} ${user.lastName}`;
});
```

Prefer `Atom.readable` for read only derived atoms. It deduplicates with
`Object.is`, so primitives and stable references avoid unnecessary updates.

## Context: `get()` vs `get.result()`

### `get(atom)` subscribes reactively

```ts
const derived = Atom.make((get) => {
  const value = get(baseAtom);
  return value * 2;
});
```

The derived atom re-runs whenever `baseAtom` changes.

### `get.result(atom)` reads once as Effect

```ts
const outer = Atom.fn(
  Effect.fn(function*(_, get) {
    const user = yield* get.result(userAtom);
    const data = yield* get.result(dataAtom, { suspendOnWaiting: true });
    return { user, data };
  }),
);
```

`get.result(atom)` returns an Effect that resolves the current value. In
normal derived atom contexts it still tracks the dependency. For a one shot
non tracking read, use `get.resultOnce(atom)`. With
`{ suspendOnWaiting: true }`, the Effect suspends until loading completes.

### `get.refresh(atom)`

Force refetch of an atom dependency:

```ts
const refreshable = Atom.make((get) => {
  get.refresh(remoteAtom);
  return get(remoteAtom);
});
```

## Atom Lifecycle

### `Atom.withFallback`

Use a fallback async atom while the primary atom is still `Initial`:

```ts
const remoteUser = runtime.atom(fetchUser);
const cachedUser = Atom.kvs({
  runtime: Atom.runtime(BrowserKeyValueStore.layerLocalStorage),
  key: "@myapp/user",
  schema: User,
  mode: "async",
});

const userAtom = remoteUser.pipe(Atom.withFallback(cachedUser));
```

### `Atom.keepAlive`

Prevent disposal when all subscribers disconnect:

```ts
const counter = Atom.make(0).pipe(Atom.keepAlive);
```

### `Atom.setIdleTTL`

Dispose after N time with no subscribers:

```ts
const cached = Atom.make(fetchExpensiveData).pipe(
  Atom.setIdleTTL("30 seconds"),
);
```

### `Atom.autoDispose`

Explicitly revert `keepAlive` behavior:

```ts
const temporary = Atom.make(fetchExpensiveData).pipe(
  Atom.keepAlive,
  Atom.autoDispose,
);
```

### `Atom.debounce`

Delay propagating value changes:

```ts
const searchInput = Atom.make("");
const searchInput$ = searchInput.pipe(Atom.debounce("300 millis"));
```

### `Atom.withRefresh`

Periodic refresh for query style atoms:

```ts
const metricsAtom = runtime.atom(fetchMetrics).pipe(
  Atom.withRefresh("30 seconds"),
);
```

### `Atom.makeRefreshOnSignal` and `Atom.refreshOnWindowFocus`

Refresh an atom when another signal atom changes:

```ts
const refetchSignal = Atom.make(0);

const reportAtom = runtime.atom(fetchReport).pipe(
  Atom.makeRefreshOnSignal(refetchSignal),
);

registry.update(refetchSignal, (n) => n + 1);
```

For browser focus refresh:

```ts
const reportAtom = runtime.atom(fetchReport).pipe(
  Atom.refreshOnWindowFocus,
);
```

### `Atom.swr`

Stale while revalidate behavior for async atoms:

```ts
const usersAtom = runtime.atom(fetchUsers).pipe(
  Atom.swr({
    staleTime: "30 seconds",
    revalidateOnMount: true,
    revalidateOnFocus: true,
    focusSignal: Atom.windowFocusSignal,
  }),
);
```

How it works:

- stale reads keep the previous success value while refresh runs
- `registry.refresh(atom)` is forceful even when the value is still fresh
- `revalidateOnFocus: true` refreshes only when the data is stale
- `revalidateOnFocus: "always"` refreshes on every focus signal
- waiting results are not auto revalidated again

**Reactive fetching pattern**:

```ts
const searchInput = Atom.make("");
const searchInput$ = searchInput.pipe(Atom.debounce("300 millis"));

const todosAtom = runtime.atom((get) => {
  const query = get(searchInput$).trim();
  if (query.length <= 3) return Effect.succeed([]);

  return Effect.gen(function*() {
    const api = yield* Api;
    return yield* api.searchTodos(query);
  });
});
```

### `Atom.Interrupt` & `Atom.Reset`

```ts
registry.set(longRunningFn, Atom.Interrupt);
registry.set(fnAtom, Atom.Reset);
```

## `Atom.kvs`

Persistent atom backed by a KeyValueStore:

```ts
import * as BrowserKeyValueStore from "@effect/platform-browser/BrowserKeyValueStore";

const themeAtom = Atom.kvs({
  runtime: Atom.runtime(BrowserKeyValueStore.layerLocalStorage),
  key: "@myapp/theme",
  schema: Schema.Literal("light", "dark"),
  defaultValue: () => "light" as const,
});
```

Options:

- `runtime`: AtomRuntime with KeyValueStore service
- `key`: unique storage key (convention: prefix with `@appname/`)
- `schema`: Effect Schema for serialization/validation
- `defaultValue`: lazy function returning default value
- `mode: "async"`: returns `AsyncResult` instead of syncing immediately

## `Atom.subscriptionRef`

Bridge live `SubscriptionRef` state into atoms:

```ts
const connectedUsersRef = yield * SubscriptionRef.make(0);
const connectedUsersAtom = Atom.subscriptionRef(connectedUsersRef);

registry.get(connectedUsersAtom);
registry.set(connectedUsersAtom, 5);
```

Writes to the atom write through to the underlying `SubscriptionRef`.

## `Atom.searchParam`

URL search parameter atom with optional Schema encoding:

```ts
const page = Atom.searchParam("page", {
  schema: Schema.NumberFromString,
});
```

With a schema, this returns `Option.Option<A>`. The schema must be synchronous
and context free.

## Optimistic Updates

```ts
const todos = Atom.make(fetchTodos);
const optimisticTodos = todos.pipe(Atom.optimistic);

const addTodo = optimisticTodos.pipe(
  Atom.optimisticFn({
    reducer: (current, newTodo: Todo) => [...current, newTodo],
    fn: Atom.fn(Effect.fn(function*(todo) {
      yield* saveTodo(todo);
    })),
  }),
);
```

How it works:

1. **Optimistic phase**: `reducer` applies immediately, UI updates
2. **Commit phase**: when Effect completes, source atom refreshes
3. **Rollback**: on error, optimistic value discarded, source value shown

You can also provide a function form to emit intermediate optimistic updates:

```ts
const addTodo = optimisticTodos.pipe(
  Atom.optimisticFn({
    reducer: (current, text: string) => [...current, { id: "temp", text }],
    fn: (set) =>
      Atom.fn<string>()((text) =>
        Effect.gen(function*() {
          set([{ id: "temp", text: `${text}...` }]);
          yield* saveTodo(text);
        })
      ),
  }),
);
```

This still rolls back on failure.

## React Hooks

### `useAtomValue`

```ts
const count = useAtomValue(counter);
const doubled = useAtomValue(counter, (n) => n * 2);
```

### `useAtom`

```ts
const [count, setCount] = useAtom(counter);
```

### `useAtomSet`

```ts
const run = useAtomSet(createUserFn, { mode: "promise" });
const user = await run({ name: "John" });
```

Modes:

- `"value"` (default): returns void, fire-and-forget
- `"promise"`: returns promise resolving to success value
- `"promiseExit"`: returns promise resolving to `Exit<A, E>`

### `useAtomMount`

```ts
useAtomMount(backgroundSyncAtom);
```

### `useAtomSuspense`

```ts
function UserProfile() {
  const result = useAtomSuspense(userAtom);
  return <div>{result.value.name}</div>;
}

function UserProfileStrict() {
  const result = useAtomSuspense(userAtom, { suspendOnWaiting: true });
  return <div>{result.value.name}</div>;
}

<Suspense fallback={<Loading />}>
  <UserProfile />
</Suspense>;
```

Options:

- Default: suspends only on `Initial` state
- `{ suspendOnWaiting: true }`: also suspends while `waiting === true`
- `{ includeFailure: true }`: returns `Failure` instead of throwing

### `useAtomSubscribe`

```ts
useAtomSubscribe(
  userAtom,
  (user) => console.log("User changed:", user),
  { immediate: true },
);
```

### `useAtomRefresh`

```ts
const refresh = useAtomRefresh(dataAtom);
// later: refresh()
```

## ScopedAtom

Provider-scoped atom instances. Each `<Provider>` creates a fresh atom
via the factory:

```ts
import * as ScopedAtom from "@effect/atom-react/ScopedAtom";

const Counter = ScopedAtom.make(() => Atom.make(0));

function App() {
  return (
    <Counter.Provider>
      <MyComponent />
    </Counter.Provider>
  );
}

function MyComponent() {
  const [count, setCount] = useAtom(Counter.use());
  return <button onClick={() => setCount((n) => n + 1)}>{count}</button>;
}
```

## AtomRegistry

### Setup

```ts
function App() {
  return (
    <RegistryProvider defaultIdleTTL={5000}>
      <YourApp />
    </RegistryProvider>
  );
}
```

### Direct usage

```ts
const registry = AtomRegistry.make();

registry.get(atom);
registry.set(writableAtom, newValue);
const unmount = registry.mount(atom);
registry.refresh(atom);
```

### Batching

```ts
Atom.batch(() => {
  registry.set(state1, newVal1);
  registry.set(state2, newVal2);
});
```

## Quick Reference

| Import                                              | Package                                         |
| --------------------------------------------------- | ----------------------------------------------- |
| `Atom`, `AsyncResult`, `AtomRegistry`, `Reactivity` | `effect/unstable/reactivity`                    |
| `useAtomValue`, `useAtom`, `RegistryProvider`       | `@effect/atom-react`                            |
| `HydrationBoundary`                                 | `@effect/atom-react`                            |
| `ScopedAtom`                                        | `@effect/atom-react/ScopedAtom`                 |
| `BrowserKeyValueStore`                              | `@effect/platform-browser/BrowserKeyValueStore` |
| `addEqualityTesters`                                | `@effect/vitest`                                |
