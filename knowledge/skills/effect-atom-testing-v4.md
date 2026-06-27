---
name: effect-atom-testing-v4
description: "Effect Atom v4 testing patterns with AtomRegistry, fake timers, service mocking, and React integration. Use when writing tests for atoms, Atom.fn, Atom.pull, runtime.atom, or React components that use atoms in Effect v4. Triggers on atom test files, AtomRegistry.make, Atom.initialValue, Layer.mock with atoms, vitest.useFakeTimers with atoms, effect/unstable/reactivity test."
---

# Effect Atom Testing (v4)

Testing patterns for `effect/unstable/reactivity` atoms and `@effect/atom-react` hooks.

## Test Setup

```ts
import {
  addEqualityTesters,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vitest,
} from "@effect/vitest";
import { AsyncResult, Atom, AtomRegistry } from "effect/unstable/reactivity";

addEqualityTesters();

describe("MyAtoms", () => {
  beforeEach(() => {
    vitest.useFakeTimers();
  });
  afterEach(() => {
    vitest.useRealTimers();
  });
});
```

- `addEqualityTesters()`: called once at module level. Makes
  `expect().toEqual()` work with Effect's `Equal` (e.g.,
  `AsyncResult.success(123)`)
- `vitest.useFakeTimers()` / `vitest.useRealTimers()`: use these for registry timers and idle TTL behavior
- `TestClock` is still useful for Effect time inside `it.effect` tests, especially for stream timing and delayed Effects
- Fresh `AtomRegistry.make()` per test. Never share registries between
  tests

## AtomRegistry Per Test

```ts
it("reads atom value", () => {
  const counter = Atom.make(0);
  const r = AtomRegistry.make();
  expect(r.get(counter)).toEqual(0);
  r.set(counter, 5);
  expect(r.get(counter)).toEqual(5);
});
```

Mount the atom when the test depends on lifecycle, subscription, or ongoing
execution, especially for streams and long running atoms:

```ts
const unmount = r.mount(atom);
// ...test...
unmount();
```

## Flushing Async Operations

### `await vitest.advanceTimersByTimeAsync(0)`

Flush microtasks + scheduled tasks. Use for most atom async operations:

```ts
r.mount(myEffectAtom);
await vitest.advanceTimersByTimeAsync(0);
const result = r.get(myEffectAtom);
expect(AsyncResult.isSuccess(result)).toBe(true);
```

### `await vitest.advanceTimersByTimeAsync(ms)`

Advance time. Use for `Effect.delay`, `Effect.sleep`, debounce, idleTTL:

```ts
const delayed = Atom.make(
  Effect.succeed(1).pipe(Effect.delay(100)),
  { initialValue: 0 },
).pipe(Atom.keepAlive);
const r = AtomRegistry.make();
expect(r.get(delayed)).toEqual(AsyncResult.success(0));

await vitest.advanceTimersByTimeAsync(100);
expect(r.get(delayed)).toEqual(AsyncResult.success(1));
```

### `await Effect.runPromise(Effect.yieldNow)`

Flush Effect fiber queue. Use after opening latches or when fibers need to
process interruptions:

```ts
latch.openUnsafe();
await Effect.runPromise(Effect.yieldNow);
```

### `await new Promise((resolve) => resolve(null))`

Microtask flush. Often combined with timer advancement for idleTTL:

```ts
await new Promise((resolve) => resolve(null));
await vitest.advanceTimersByTimeAsync(10000);
```

## The Api Service Pattern

For application code, it is often more ergonomic to define a local `Api`
service per atom module instead of wiring a large generated client directly.
Treat this as a design pattern for clarity and test ergonomics, not as a
limitation of Effect itself.

Define a local `Api` service per atom module:

**Production code:**

```ts
class Api extends ServiceMap.Service<Api, {
  readonly getTodos: () => Effect.Effect<ReadonlyArray<Todo>>;
  readonly upsertTodo: (payload: UpsertTodoPayload) => Effect.Effect<Todo>;
  readonly deleteTodo: (payload: DeleteTodoPayload) => Effect.Effect<void>;
}>()("@myapp/atoms/todos/Api", {
  make: Effect.gen(function*() {
    const rpc = yield* AppRpcClient;
    return {
      getTodos: () => rpc.todos.findAll(),
      upsertTodo: (payload) => rpc.todos.upsert(payload),
      deleteTodo: (payload) => rpc.todos.remove(payload),
    };
  }),
}) {
  static layer = Layer.effect(this, this.make).pipe(
    Layer.provide(AppRpcClient.layer),
  );
}

const runtime = Atom.runtime(Layer.mergeAll(Api.layer, EventStream.layer));

export const todosAtom = runtime.atom(
  Effect.gen(function*() {
    const api = yield* Api;
    return yield* api.getTodos();
  }),
);
```

**Test mock:**

```ts
const makeApiMock = (options?: {
  getTodosResponse?: ReadonlyArray<Todo>;
  shouldFail?: boolean;
}) => {
  const calls: Array<{ method: string; args: unknown; }> = [];

  const layer = Layer.mock(Api)({
    getTodos: () => {
      calls.push({ method: "getTodos", args: {} });
      if (options?.shouldFail) return Effect.dieMessage("API failed");
      return Effect.succeed(options?.getTodosResponse ?? []);
    },
    upsertTodo: (payload) => {
      calls.push({ method: "upsertTodo", args: payload });
      return Effect.succeed(createTestTodo());
    },
    deleteTodo: (payload) => {
      calls.push({ method: "deleteTodo", args: payload });
      return Effect.void;
    },
  });

  return { layer, calls };
};
```

The `calls` array acts as a spy/recorder. Assert both atom state AND API
calls.

## Layer Injection via AtomRegistry

Replace production layers with test layers using `Atom.initialValue`:

```ts
const makeTestLayer = (options?: Parameters<typeof makeApiMock>[0]) => {
  const { layer: apiLayer, calls: apiCalls } = makeApiMock(options);
  const { layer: eventStreamLayer, emitEvent } = makeEventStreamMock();
  const testLayer = Layer.mergeAll(apiLayer, eventStreamLayer);
  return { testLayer, apiCalls, emitEvent };
};

it("fetches todos on mount", async () => {
  const { testLayer } = makeTestLayer({
    getTodosResponse: [createTestTodo()],
  });

  const r = AtomRegistry.make({
    initialValues: [Atom.initialValue(runtime.layer, testLayer)],
  });

  r.mount(todosAtom);
  await vitest.advanceTimersByTimeAsync(0);

  const result = r.get(todosAtom);
  expect(AsyncResult.isSuccess(result)).toBe(true);
  if (AsyncResult.isSuccess(result)) {
    expect(result.value).toHaveLength(1);
  }
});
```

`Atom.initialValue(runtime.layer, testLayer)` replaces the runtime's layer
atom with the test layer, swapping all service implementations.

### Multiple Runtimes

When atoms depend on multiple runtimes (from different modules):

```ts
const r = AtomRegistry.make({
  initialValues: [
    Atom.initialValue(runtime.layer, testLayer),
    Atom.initialValue(otherRuntime.layer, otherTestLayer),
  ],
});
```

## Test Data Factories

```ts
const TEST_TODO_ID_1 = "00000000-0000-0000-0000-000000000010" as TodoId;

const createTestTodo = (
  overrides: Partial<{
    id: TodoId;
    title: string;
    completed: boolean;
  }> = {},
): Todo =>
  new Todo({
    id: overrides.id ?? TEST_TODO_ID_1,
    title: overrides.title ?? "Buy groceries",
    completed: overrides.completed ?? false,
    updatedAt: DateTime.unsafeNow(),
  });
```

## Testing Atom.fn

```ts
it("calls API and returns result", async () => {
  const count = Atom.fn((n: number) => Effect.succeed(n + 1));
  const r = AtomRegistry.make();

  expect(r.get(count)).toEqual(AsyncResult.initial());

  r.set(count, 1);
  expect(r.get(count)).toEqual(AsyncResult.success(2));
});
```

### Concurrent Atom.fn with Latches

```ts
it("handles concurrent calls", async () => {
  const latches: Array<Latch.Latch> = [];
  let done = 0;
  const count = Atom.fn((_: number) => {
    const latch = Latch.makeUnsafe();
    latches.push(latch);
    return latch.await.pipe(Effect.tap(() => done++));
  }, { concurrent: true });

  const r = AtomRegistry.make();
  r.mount(count);
  r.set(count, 1);
  r.set(count, 2);
  r.set(count, 3);
  expect(latches).toHaveLength(3);
  expect(done).toBe(0);

  latches.forEach((l) => l.openUnsafe());
  await Effect.runPromise(Effect.yieldNow);
  expect(done).toBe(3);
  expect(r.get(count)).toEqual(AsyncResult.success(undefined));
});
```

## Testing Stream-Based Atoms

```ts
it("processes stream values", async () => {
  const atom = Atom.make(
    Stream.range(0, 2).pipe(Stream.tap(() => Effect.sleep(50))),
  );
  const r = AtomRegistry.make();
  const unmount = r.mount(atom);

  expect(r.get(atom).waiting).toBe(true);
  expect(AsyncResult.isInitial(r.get(atom))).toBe(true);

  await vitest.advanceTimersByTimeAsync(50);
  expect(AsyncResult.isSuccess(r.get(atom))).toBe(true);
  expect(r.get(atom).value).toBe(0);

  await vitest.advanceTimersByTimeAsync(50);
  expect(r.get(atom).value).toBe(1);

  await vitest.advanceTimersByTimeAsync(50);
  expect(r.get(atom).value).toBe(2);
  expect(r.get(atom).waiting).toBe(false);

  unmount();
});
```

## Testing Event Streams

Mock `EventStream` with a controllable emit callback:

```ts
const makeEventStreamMock = () => {
  let queue: Queue.Queue<MyEvent, Cause.Done> | null = null;

  const layer = Layer.mock(EventStream)({
    changes: Stream.callback<MyEvent>((q) =>
      Effect.sync(() => {
        queue = q;
      })
    ),
    publish: (event) => Effect.sync(() => true),
  });

  const emitEvent = (event: MyEvent) => {
    if (queue) Queue.offerUnsafe(queue, event);
  };

  return { layer, emitEvent };
};
```

Usage:

```ts
it("reacts to real-time events", async () => {
  const { layer, emitEvent } = makeEventStreamMock();
  const r = AtomRegistry.make({
    initialValues: [Atom.initialValue(runtime.layer, layer)],
  });
  r.mount(myAtom);
  await vitest.advanceTimersByTimeAsync(0);

  emitEvent({ _tag: "ItemCreated", item: createTestItem() });
  await vitest.advanceTimersByTimeAsync(0);

  const result = r.get(myAtom);
  expect(AsyncResult.isSuccess(result)).toBe(true);
});
```

## Testing Optimistic Updates

```ts
it("shows optimistic value before API completes", async () => {
  const { testLayer } = makeTestLayer({ updateDelayMs: 100 });
  const r = AtomRegistry.make({
    initialValues: [Atom.initialValue(runtime.layer, testLayer)],
  });

  r.mount(dataAtom);
  r.mount(updateAtom);
  await vitest.advanceTimersByTimeAsync(0);

  r.set(updateAtom, { value: "optimistic" });

  expect(r.get(dataAtom).value).toBe("optimistic");

  await vitest.advanceTimersByTimeAsync(100);
  expect(r.get(dataAtom).value).toBe("server-confirmed");
});

it("rolls back on failure", async () => {
  const { testLayer } = makeTestLayer({ shouldFail: true });
  const r = AtomRegistry.make({
    initialValues: [Atom.initialValue(runtime.layer, testLayer)],
  });

  r.mount(dataAtom);
  r.mount(updateAtom);
  await vitest.advanceTimersByTimeAsync(0);

  const original = r.get(dataAtom).value;

  r.set(updateAtom, { value: "optimistic" });
  await vitest.advanceTimersByTimeAsync(0);

  expect(r.get(dataAtom).value).toEqual(original);
});
```

## Testing Interruption / Cancellation

```ts
it("cancels running effect", async () => {
  const r = AtomRegistry.make();
  const atom = Atom.fn(() => Effect.never);
  r.mount(atom);

  r.set(atom, void 0);
  expect(r.get(atom).waiting).toBe(true);

  r.set(atom, Atom.Interrupt);
  await Effect.runPromise(Effect.yieldNow);

  expect(AsyncResult.isInterrupted(r.get(atom))).toBe(true);
});
```

## Testing Error States

```ts
it("preserves previous success on failure", async () => {
  const count = Atom.fn((i: number) => i === 1 ? Effect.fail("fail") : Effect.succeed(i));
  const r = AtomRegistry.make();

  r.set(count, 0);
  expect(AsyncResult.isSuccess(r.get(count))).toBe(true);

  r.set(count, 1);
  const result = r.get(count);
  expect(AsyncResult.isFailure(result)).toBe(true);

  const prev = AsyncResult.value(result);
  expect(Option.isSome(prev)).toBe(true);
  expect(prev.value).toBe(0);
});
```

## Testing idleTTL

```ts
it("disposes atom after idle timeout", async () => {
  const atom = Atom.make(0).pipe(Atom.setIdleTTL(5000));
  const r = AtomRegistry.make();

  r.set(atom, 10);
  expect(r.get(atom)).toBe(10);

  await new Promise((resolve) => resolve(null));
  await vitest.advanceTimersByTimeAsync(5000);

  expect(r.get(atom)).toBe(0);
});
```

## Testing Scoped Effects (Finalizers)

```ts
it("runs finalizers when atom effect is re-invoked", async () => {
  let finalized = 0;
  const count = Atom.fn((n: number) =>
    Effect.succeed(n + 1).pipe(
      Effect.zipLeft(
        Effect.addFinalizer(() =>
          Effect.sync(() => {
            finalized++;
          })
        ),
      ),
    )
  ).pipe(Atom.keepAlive);
  const r = AtomRegistry.make();

  r.set(count, 1);
  expect(r.get(count)).toEqual(AsyncResult.success(2));
  expect(finalized).toBe(0);

  r.set(count, 2);
  await new Promise((resolve) => resolve(null));
  expect(finalized).toBe(1);
});
```

## Mutable Refs for Changing Mock Behavior Mid-Test

```ts
it("handles changing behavior between runs", async () => {
  const failingRef: { current: boolean; } = { current: false };
  const { testLayer } = makeTestLayer({ failingRef });
  const r = AtomRegistry.make({
    initialValues: [Atom.initialValue(runtime.layer, testLayer)],
  });

  r.set(runAtom, input);
  await vitest.advanceTimersByTimeAsync(0);
  expect(AsyncResult.isSuccess(r.get(runAtom))).toBe(true);

  failingRef.current = true;

  r.set(runAtom, input);
  await vitest.advanceTimersByTimeAsync(0);
  expect(AsyncResult.isFailure(r.get(runAtom))).toBe(true);
});
```

## React Integration Tests

### Simple Rendering

```ts
import { useAtomValue } from "@effect/atom-react";
import { render, screen } from "@testing-library/react";

test("reads atom value", () => {
  const atom = Atom.make(42);

  function TestComponent() {
    const value = useAtomValue(atom);
    return <div data-testid="value">{value}</div>;
  }

  render(<TestComponent />);
  expect(screen.getByTestId("value")).toHaveTextContent("42");
});
```

### Mutations with AtomRegistry Context

```ts
import { RegistryContext } from "@effect/atom-react";
import { act, render, screen, waitFor } from "@testing-library/react";

test("updates when atom changes", async () => {
  const atom = Atom.make("initial");
  const registry = AtomRegistry.make();

  function TestComponent() {
    const value = useAtomValue(atom);
    return <div data-testid="value">{value}</div>;
  }

  render(
    <RegistryContext.Provider value={registry}>
      <TestComponent />
    </RegistryContext.Provider>,
  );

  expect(screen.getByTestId("value")).toHaveTextContent("initial");

  act(() => {
    registry.set(atom, "updated");
  });

  await waitFor(() => {
    expect(screen.getByTestId("value")).toHaveTextContent("updated");
  });
});
```

### RegistryProvider with initialValues

For component tests using runtime atoms:

```ts
import { RegistryProvider } from "@effect/atom-react";

render(
  <RegistryProvider
    initialValues={[
      Atom.initialValue(runtime.layer, testLayer),
      Atom.initialValue(dataAtom, AsyncResult.success(testData)),
      Atom.initialValue(configAtom, testConfig),
    ]}
  >
    <ComponentUnderTest />
  </RegistryProvider>,
);
```

- Seed `AsyncResult.success(...)` values directly to bypass async fetching

### Suspense Testing

```ts
import { useAtomSuspense } from "@effect/atom-react";
import { Suspense } from "react";

test("suspends on initial state", () => {
  const atom = Atom.make(Effect.never);

  function TestComponent() {
    const result = useAtomSuspense(atom);
    return <div>{result.value}</div>;
  }

  render(
    <Suspense fallback={<div data-testid="loading">Loading</div>}>
      <TestComponent />
    </Suspense>,
  );

  expect(screen.getByTestId("loading")).toBeInTheDocument();
});
```

## HttpClient Mocking

```ts
const makeHttpClientMock = (options?: { shouldFail?: boolean; }) => {
  const calls: Array<{ url: string; }> = [];

  const mockClient = HttpClient.make((request) => {
    calls.push({ url: request.url });
    if (options?.shouldFail) {
      return Effect.fail(
        new HttpClientError.StatusCodeError({
          request,
          response: HttpClientResponse.fromWeb(request, new Response(null, { status: 500 })),
        }),
      );
    }
    return Effect.succeed(HttpClientResponse.fromWeb(request, new Response(null, { status: 200 })));
  });

  return { layer: Layer.succeed(HttpClient.HttpClient, mockClient), calls };
};
```

## Quick Reference

| What               | How                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------- |
| Flush async        | `await vitest.advanceTimersByTimeAsync(0)`                                            |
| Advance time       | `await vitest.advanceTimersByTimeAsync(ms)`                                           |
| Flush fibers       | `await Effect.runPromise(Effect.yieldNow)`                                            |
| Flush microtasks   | `await new Promise((r) => r(null))`                                                   |
| Mock services      | `Layer.mock(Api)({ method: () => Effect.succeed(...) })`                              |
| Inject test layer  | `AtomRegistry.make({ initialValues: [Atom.initialValue(runtime.layer, testLayer)] })` |
| Interrupt atom     | `r.set(atom, Atom.Interrupt)`                                                         |
| Reset atom         | `r.set(atom, Atom.Reset)`                                                             |
| Spy on calls       | `const calls: Array<{method, args}> = []` in mock                                     |
| Seed atom data     | `Atom.initialValue(dataAtom, AsyncResult.success(value))`                             |
| Equality in vitest | `addEqualityTesters()` at module level                                                |
