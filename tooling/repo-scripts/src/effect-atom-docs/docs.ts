export const EFFECT_ATOM_DOCS = [
  {
    name: "BASIC_USAGE.md",
    content: `# @effect-atom/atom

A reactive state management library for Effect.

## Installation

If you are using React:

\`\`\`bash
pnpm add @effect-atom/atom-react
\`\`\`

## Creating a Counter with Atom

Let's create a simple Counter component, which will increment a number when you click a button.

We will use \`Atom.make\` to create our Atom, which is a reactive state container.

We can then use the \`useAtomValue\` & \`useAtomSet\` hooks to read and update the value
of the Atom.

\`\`\`tsx
import { Atom, useAtomValue, useAtomSet } from "@effect-atom/atom-react"

const countAtom = Atom.make(0).pipe(
  // By default, the Atom will be reset when no longer used.
  // This is useful for cleaning up resources when the component unmounts.
  //
  // If you want to keep the value, you can use \`Atom.keepAlive\`.
  //
  Atom.keepAlive,
)

function App() {
  return (
    <div>
      <Counter />
      <br />
      <CounterButton />
    </div>
  )
}

function Counter() {
  const count = useAtomValue(countAtom)
  return <h1>{count}</h1>
}

function CounterButton() {
  const setCount = useAtomSet(countAtom)
  return (
    <button onClick={() => setCount((count) => count + 1)}>Increment</button>
  )
}
\`\`\`

## Derived State

You can create derived state from an Atom in a couple of ways.

\`\`\`ts
import { Atom } from "@effect-atom/atom-react"

const countAtom = Atom.make(0)

// You can use the \`get\` function to get the value of another Atom.
//
// The type of \`get\` is \`Atom.Context\`, which also has a bunch of other methods
// on it to manage Atom's.
//
const doubleCountAtom = Atom.make((get) => get(countAtom) * 2)

// You can also use the \`Atom.map\` function to create a derived Atom.
const tripleCountAtom = Atom.map(countAtom, (count) => count * 3)
\`\`\`

## Working with Effects

You can also pass effects to the \`Atom.make\` function.

When working with effectful Atom's, you will get back a \`Result\` type.

You can see all the ways to work with \`Result\` here: https://tim-smart.github.io/effect-atom/atom/Result.ts.html

\`\`\`ts
import { Atom, Result } from "@effect-atom/atom-react"

const countAtom: Atom<Result<number>> = Atom.make(Effect.succeed(0))

// You can also pass a function to get access to the \`Atom.Context\`
//
// \`get.result\` can be used in Effect's to get the value of an Atom<Result>.
const resultWithContextAtom: Atom<Result<number>> = Atom.make(
  Effect.fnUntraced(function* (get: Atom.Context) {
    const count = yield* get.result(countAtom)
    return count + 1
  }),
)
\`\`\`

## Working with scoped Effects

All Atom's that use effects are provided with a \`Scope\`, so you can add finalizers
that will be run when the Atom is no longer used.

\`\`\`ts
import { Atom } from "@effect-atom/atom-react"
import { Effect } from "effect"

export const resultAtom = Atom.make(
  Effect.gen(function* () {
    // Add a finalizer to the \`Scope\` for this Atom
    // It will run when the Atom is rebuilt or no longer needed
    yield* Effect.addFinalizer(() => Effect.log("finalizer"))
    return "hello"
  }),
)
\`\`\`

## Working with Effect Services / Layer's

\`\`\`ts
import { Atom } from "@effect-atom/atom-react"
import { Effect } from "effect"

class Users extends Effect.Service<Users>()("app/Users", {
  effect: Effect.gen(function* () {
    const getAll = Effect.succeed([
      { id: "1", name: "Alice" },
      { id: "2", name: "Bob" },
      { id: "3", name: "Charlie" },
    ])
    return { getAll } as const
  }),
}) {}

// Create a AtomRuntime from a Layer
const runtimeAtom: Atom.AtomRuntime<Users, never> = Atom.runtime(Users.Default)

// You can then use the AtomRuntime to make Atom's that use the services from the Layer
export const usersAtom = runtimeAtom.atom(
  Effect.gen(function* () {
    const users = yield* Users
    return yield* users.getAll
  }),
)
\`\`\`

## Adding global Layers to AtomRuntime's

This is useful for setting up Tracer's, Logger's, ConfigProvider's, etc.

\`\`\`ts
import { Atom } from "@effect-atom/atom-react"
import { ConfigProvider, Layer } from "effect"

Atom.runtime.addGlobalLayer(
  Layer.setConfigProvider(ConfigProvider.fromJson(import.meta.env)),
)
\`\`\`

## Working with Stream's

\`\`\`tsx
import { Result, Atom, useAtom } from "@effect-atom/atom-react"
import { Cause, Schedule, Stream } from "effect"

// This will be a simple Atom that emits a incrementing number every second.
//
// Atom.make will give back the latest value of a Stream as a Result
export const countAtom: Atom.Atom<Result.Result<number>> = Atom.make(
  Stream.fromSchedule(Schedule.spaced(1000)),
)

// You can use Atom.pull to create a specialized Atom that will pull from a Stream
// one chunk at a time.
//
// This is useful for infinite scrolling or paginated data.
//
// With a \`AtomRuntime\`, you can use \`runtimeAtom.pull\` to create a pull Atom.
export const countPullAtom: Atom.Writable<
  Atom.PullResult<number>,
  void
> = Atom.pull(Stream.make(1, 2, 3, 4, 5))

// Here is a component that uses countPullAtom to display the numbers in a list.
//
// You can use \`useAtom\` to both read the value of an Atom and gain access to the
// setter function.
//
// Each time the setter function is called, it will pull a new chunk of data
// from the Stream, and append it to the list.
export function CountPullAtomComponent() {
  const [result, pull] = useAtom(countPullAtom)

  return Result.match(result, {
    onInitial: () => <div>Loading...</div>,
    onFailure: (error) => <div>Error: {Cause.pretty(error.cause)}</div>,
    onSuccess: (success) => (
      <div>
        <ul>
          {success.value.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <button onClick={() => pull()}>Load more</button>
        {success.waiting ? <p>Loading more...</p> : <p>Loaded chunk</p>}
      </div>
    ),
  })
}
\`\`\`

## Working with sets of Atom's

\`\`\`ts
import { Atom } from "@effect-atom/atom-react"
import { Effect } from "effect"

class Users extends Effect.Service<Users>()("app/Users", {
  effect: Effect.gen(function* () {
    const findById = (id: string) => Effect.succeed({ id, name: "John Doe" })
    return { findById } as const
  }),
}) {}

// Create a AtomRuntime from a Layer
const runtimeAtom: Atom.AtomRuntime<Users, never> = Atom.runtime(Users.Default)

// Atom's work by reference, so we need to use Atom.family to dynamically create a
// set of Atom's from a key.
//
// Atom.family will ensure that we get a stable reference to the Atom for each key.
//
export const userAtom = Atom.family((id: string) =>
  runtimeAtom.atom(
    Effect.gen(function* () {
      const users = yield* Users
      return yield* users.findById(id)
    }),
  ),
)
\`\`\`

## Working with functions

\`\`\`ts
import { Atom, useAtomSet, useAtomSetPromise } from "@effect-atom/atom-react"
import { Effect, Exit } from "effect"

// Create a simple Atom.fn that logs a number
const logAtom = Atom.fn(
  Effect.fnUntraced(function* (arg: number) {
    yield* Effect.log("got arg", arg)
  }),
)

export function LogComponent() {
  // To call the Atom.fn, we need to use the useAtomSet hook
  const logNumber = useAtomSet(logAtom)
  return <button onClick={() => logNumber(42)}>Log 42</button>
}

// You can also use it with Atom.runtime
class Users extends Effect.Service<Users>()("app/Users", {
  succeed: {
    create: (name: string) => Effect.succeed({ id: 1, name }),
  } as const,
}) {}

const runtimeAtom = Atom.runtime(Users.Default)

// Here we are using runtimeAtom.fn to create a function from the Users.create
// method.
export const createUserAtom = runtimeAtom.fn(
  Effect.fnUntraced(function* (name: string) {
    const users = yield* Users
    return yield* users.create(name)
  }),
)

export function CreateUserComponent() {
  // If your function returns a Result, you can use the useAtomSetPromise hook
  const createUser = useAtomSetPromise(createUserAtom)
  return (
    <button
      onClick={async () => {
        const exit = await createUser("John")
        if (Exit.isSuccess(exit)) {
          console.log(exit.value)
        }
      }}
    >
      Log 42
    </button>
  )
}
\`\`\`

## Wrapping an event listener

\`\`\`ts
import { Atom } from "@effect-atom/atom-react"

// This is a simple Atom that will emit the current scroll position of the
// window.
export const scrollYAtom: Atom.Atom<number> = Atom.make((get) => {
  // The handler will use \`get.setSelf\` to update the value of itself
  const onScroll = () => {
    get.setSelf(window.scrollY)
  }
  // We need to use \`get.addFinalizer\` to remove the event listener when the
  // Atom is no longer used.
  window.addEventListener("scroll", onScroll)
  get.addFinalizer(() => window.removeEventListener("scroll", onScroll))

  // Return the current scroll position
  return window.scrollY
})
\`\`\`

## Integration with search params

\`\`\`ts
import { Atom } from "@effect-atom/atom-react"
import { Option, Schema } from "effect"

// Create an Atom that reads and writes to the URL search parameters
export const simpleParamAtom: Atom.Writable<string> = Atom.searchParam("simple")

// You can also use a schema to further parse the value
export const numberParamAtom: Atom.Writable<Option.Option<number>> =
  Atom.searchParam("number", { schema: Schema.NumberFromString })
\`\`\`

## Integration with local storage

\`\`\`ts
import { Atom } from "@effect-atom/atom-react"
import { BrowserKeyValueStore } from "@effect/platform-browser"
import { Schema } from "effect"

// Create an Atom that reads and writes to localStorage.
//
// It uses Schema to define the type of the value stored.
export const flagAtom = Atom.kvs({
  runtime: Atom.runtime(BrowserKeyValueStore.layerLocalStorage),
  key: "flag",
  schema: Schema.Boolean,
  defaultValue: () => false,
})
\`\`\`

## Integration with \`Reactivity\` from \`@effect/experimental\`

\`Reactivity\` is an Effect service that allows you make queries reactive when
mutations happen.

You can use an \`Rx.runtime\` to hook into the \`Reactivity\` service and trigger
\`Atom\` refreshes when mutations happen.

\`\`\`ts
import { Atom } from "@effect-atom/atom-react"
import * as Reactivity from "@effect/experimental/Reactivity"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

const runtimeAtom = Atom.runtime(Layer.empty)

let i = 0
const count = Atom.make(() => i++).pipe(
  // Refresh when the "counter" key changes
  Atom.withReactivity(["counter"]),
  // Or refresh when "counter" or "counter:1" or "counter:2" changes
  Atom.withReactivity({
    counter: [1, 2],
  }),
)

const someMutation = runtimeAtom.fn(
  Effect.fn(function* () {
    yield* Effect.log("Mutating the counter")
  }),
  // Invalidate the "counter" key when the Effect is finished
  { reactivityKeys: ["counter"] },
)

const someMutationManual = runtimeAtom.fn(
  Effect.fn(function* () {
    yield* Effect.log("Mutating the counter again")
    // You can also manually invalidate the "counter" key
    yield* Reactivity.invalidate(["counter"])
  }),
)
\`\`\`

## \`@effect/rpc\` integration

You can use the \`AtomRpc\` module to create an RPC client with integration with
\`effect-atom\`. It offers apis for both queries and mutations.

\`\`\`ts
import {
  AtomRpc,
  Result,
  useAtomSet,
  useAtomValue
} from "@effect-atom/atom-react"
import * as BrowserSocket from "@effect/platform-browser/BrowserSocket"
import { RpcGroup } from "@effect/rpc"
import * as Rpc from "@effect/rpc/Rpc"
import * as RpcClient from "@effect/rpc/RpcClient"
import * as RpcSerialization from "@effect/rpc/RpcSerialization"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"

// Define the RPCs
class Rpcs extends RpcGroup.make(
  Rpc.make("increment"),
  Rpc.make("count", {
    success: Schema.Number
  })
) {}

// Use AtomRpc.Tag to create a special Context.Tag that builds the RPC client
class CountClient extends AtomRpc.Tag<CountClient>()("CountClient", {
  group: Rpcs,
  // Provide a Layer that provides the RpcClient.Protocol
  protocol: RpcClient.layerProtocolSocket({
    retryTransientErrors: true
  }).pipe(
    Layer.provide(BrowserSocket.layerWebSocket("ws://localhost:3000/rpc")),
    Layer.provide(RpcSerialization.layerJson)
  )
}) {}

function SomeComponent() {
  // Use \`CountClient.query\` for readonly queries
  const count = useAtomValue(CountClient.query("count", void 0, {
    // You can also register reactivity keys, which can be used to invalidate
    // the query
    reactivityKeys: ["count"]
  }))

  // Use \`CountClient.mutation\` for mutations
  const increment = useAtomSet(CountClient.mutation("increment"))

  return (
    <div>
      <p>Count: {Result.getOrElse(count, () => 0)}</p>
      <button
        onClick={() =>
          increment({
            payload: void 0,
            // Mutations can also have reactivity keys, which will invalidate
            // the query when the mutation is done.
            reactivityKeys: ["count"]
          })}
      >
        Increment
      </button>
    </div>
  )
}

// Or you can define custom atoms using the \`CountClient.runtime\`
const incrementAtom = CountClient.runtime.fn(Effect.fnUntraced(function*() {
  const client = yield* CountClient // Use the Tag to access the client
  yield* client("increment", void 0)
}))

// Or use it in your Effect services
class MyService extends Effect.Service<MyService>()("MyService", {
  dependencies: [CountClient.layer], // Add the CountClient.layer as a dependency
  scoped: Effect.gen(function*() {
    const client = yield* CountClient // Use the Tag to access the client
    const useClient = () => client("increment", void 0)
    return { useClient } as const
  })
}) {}
\`\`\`

## \`HttpApi\` integration

You can use the \`AtomHttpApi\` module to create an HTTP API client with
integration with \`effect-atom\`. It offers apis for both queries and mutations.

\`\`\`ts
import {
  AtomHttpApi,
  Result,
  useAtomSet,
  useAtomValue
} from "@effect-atom/atom-react"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as HttpApi from "@effect/platform/HttpApi"
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint"
import * as HttpApiGroup from "@effect/platform/HttpApiGroup"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

// Define your api
class Api extends HttpApi.make("api").add(
  HttpApiGroup.make("counter").add(
    HttpApiEndpoint.get("count", "/count").addSuccess(Schema.Number)
  ).add(
    HttpApiEndpoint.post("increment", "/increment")
  )
) {}

// Use AtomHttpApi.Tag to create a special Context.Tag that builds the client
class CountClient extends AtomHttpApi.Tag<CountClient>()("CountClient", {
  api: Api,
  // Provide a Layer that provides the HttpClient
  httpClient: FetchHttpClient.layer,
  baseUrl: "http://localhost:3000"
}) {}

function SomeComponent() {
  // Use \`CountClient.query\` for readonly queries
  const count = useAtomValue(CountClient.query("counter", "count", {
    // You can register reactivity keys, which can be used to invalidate
    // the query
    reactivityKeys: ["count"]
  }))

  // Use \`CountClient.mutation\` for mutations
  const increment = useAtomSet(CountClient.mutation("counter", "increment"))

  return (
    <div>
      <p>Count: {Result.getOrElse(count, () => 0)}</p>
      <button
        onClick={() =>
          increment({
            payload: void 0,
            // Mutations can also have reactivity keys, which will invalidate
            // the query when the mutation is done.
            reactivityKeys: ["count"]
          })}
      >
        Increment
      </button>
    </div>
  )
}

// Or you can define custom atoms using the \`CountClient.runtime\`
const incrementAtom = CountClient.runtime.fn(Effect.fnUntraced(function*() {
  const client = yield* CountClient // Use the Tag to access the client
  yield* client.counter.increment()
}))

// Or use it in your Effect services
class MyService extends Effect.Service<MyService>()("MyService", {
  dependencies: [CountClient.layer], // Add the CountClient.layer as a dependency
  scoped: Effect.gen(function*() {
    const client = yield* CountClient // Use the Tag to access the client
    const useClient = () => client.counter.increment()
    return { useClient } as const
  })
}) {}
\`\`\``,
  },
  {
    name: "useAtomRef.md",
    content: `
# useAtomRef Hook

Subscribe to AtomRef value changes with automatic React updates.

## Signature

\`\`\`typescript
function useAtomRef<A>(ref: AtomRef.ReadonlyRef<A>): A
\`\`\`

## Behavior

- **Subscribes** to AtomRef value changes
- **Triggers re-render** when ref value updates
- **Returns current value** directly
- **Unsubscribes** automatically on component unmount
- Works with **AtomRef** (not regular Atoms)

## Basic Example

\`\`\`typescript
import { AtomRef } from "@effect-atom/atom"
import { useAtomRef } from "@effect-atom/atom-react"

const countRef = AtomRef.make(0)

function Counter() {
  const count = useAtomRef(countRef)
  
  const increment = () => {
    countRef.value = countRef.value + 1
  }
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  )
}
\`\`\`

## Object State with AtomRef

\`\`\`typescript
interface User {
  name: string
  email: string
  age: number
}

const userRef = AtomRef.make<User>({
  name: "Alice",
  email: "alice@example.com",
  age: 30,
})

function UserProfile() {
  const user = useAtomRef(userRef)
  
  const updateName = (newName: string) => {
    userRef.value = { ...userRef.value, name: newName }
  }
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <input
        value={user.name}
        onChange={(e) => updateName(e.target.value)}
      />
    </div>
  )
}
\`\`\`

## Multiple Components Subscribing

\`\`\`typescript
const stateRef = AtomRef.make({ count: 0, message: "" })

function CountDisplay() {
  const state = useAtomRef(stateRef)
  return <div>Count: {state.count}</div>
}

function MessageDisplay() {
  const state = useAtomRef(stateRef)
  return <div>Message: {state.message}</div>
}

function Controls() {
  const state = useAtomRef(stateRef)
  
  const increment = () => {
    stateRef.value = { ...state, count: state.count + 1 }
  }
  
  return <button onClick={increment}>Increment</button>
}

// All components stay synchronized
\`\`\`

## When to Use useAtomRef

**Use when**:
- Working with **AtomRef** instead of regular Atoms
- Need direct reference-based updates
- Want fine-grained property updates (combine with \`useAtomRefProp\`)

**Don't use when**:
- Working with regular \`Atom<A>\` (use \`useAtomValue\` instead)
- Need Effect integration (use regular Atoms with \`Atom.fn\`)
- Building complex state management (regular Atoms are more powerful)

## Difference: AtomRef vs Atom

\`\`\`typescript
// AtomRef - Direct value access
const countRef = AtomRef.make(0)
countRef.value = 5 // Direct assignment
const current = countRef.value // Direct read

// Atom - Effect-based
const countAtom = Atom.make(0)
// Update through registry
Registry.set(registry, countAtom, 5)
// Read through Effect or hooks
\`\`\`

## See Also

- \`useAtomRefProp\` - Get ref to object property
- \`useAtomRefPropValue\` - Get value of object property
- \`AtomRef\` - Reference-based atom API
- \`useAtomValue\` - For regular Atoms (not AtomRefs)
    `,
  },
  {
    name: "useAtomRefProp.md",
    content: `
# useAtomRefProp Hook

Get a ref to a specific property of an AtomRef object.

## Signature

\`\`\`typescript
function useAtomRefProp<A, K extends keyof A>(
  ref: AtomRef<A>,
  prop: K
): AtomRef<A[K]>
\`\`\`

## Behavior

- **Returns** a new AtomRef pointing to a specific property
- **Memoized** (stable reference unless ref or prop changes)
- **Reactive** - Updates when parent ref property changes
- **Type-safe** - TypeScript ensures property exists

## Basic Example - Form Fields

\`\`\`typescript
import { AtomRef } from "@effect-atom/atom"
import { useAtomRefProp, useAtomRef } from "@effect-atom/atom-react"

interface FormData {
  name: string
  email: string
  age: number
}

const formRef = AtomRef.make<FormData>({
  name: "",
  email: "",
  age: 0,
})

function NameInput() {
  // Get ref to just the name property
  const nameRef = useAtomRefProp(formRef, "name")
  const name = useAtomRef(nameRef)
  
  return (
    <input
      value={name}
      onChange={(e) => {
        nameRef.value = e.target.value
      }}
      placeholder="Name"
    />
  )
}

function EmailInput() {
  // Get ref to just the email property
  const emailRef = useAtomRefProp(formRef, "email")
  const email = useAtomRef(emailRef)
  
  return (
    <input
      value={email}
      onChange={(e) => {
        emailRef.value = e.target.value
      }}
      placeholder="Email"
    />
  )
}

function UserForm() {
  return (
    <form>
      <NameInput />
      <EmailInput />
    </form>
  )
}
\`\`\`

## Nested Property Access

\`\`\`typescript
interface AppState {
  user: {
    profile: {
      name: string
      avatar: string
    }
    settings: {
      theme: string
      notifications: boolean
    }
  }
  ui: {
    sidebar: boolean
    modal: string | null
  }
}

const appStateRef = AtomRef.make<AppState>(/* initial state */)

function ThemeToggle() {
  // Access nested settings
  const settingsRef = useAtomRefProp(appStateRef, "user")
  // Note: For deeply nested access, you'd chain refs or use property paths
  
  const settings = useAtomRef(settingsRef)
  
  return (
    <button onClick={() => {
      settingsRef.value = {
        ...settings,
        settings: {
          ...settings.settings,
          theme: settings.settings.theme === "light" ? "dark" : "light"
        }
      }
    }}>
      Toggle Theme
    </button>
  )
}
\`\`\`

## Multiple Property Refs

\`\`\`typescript
interface Dashboard {
  stats: StatsData
  charts: ChartData
  filters: FilterData
}

const dashboardRef = AtomRef.make<Dashboard>(initialDashboard)

function DashboardStats() {
  const statsRef = useAtomRefProp(dashboardRef, "stats")
  const stats = useAtomRef(statsRef)
  
  return <div>{/* render stats */}</div>
}

function DashboardCharts() {
  const chartsRef = useAtomRefProp(dashboardRef, "charts")
  const charts = useAtomRef(chartsRef)
  
  return <div>{/* render charts */}</div>
}

function DashboardFilters() {
  const filtersRef = useAtomRefProp(dashboardRef, "filters")
  const filters = useAtomRef(filtersRef)
  
  const updateFilter = (key: string, value: any) => {
    filtersRef.value = { ...filters, [key]: value }
  }
  
  return <div>{/* render filters */}</div>
}
\`\`\`

## When to Use useAtomRefProp

**Use when**:
- Working with **object-based AtomRefs**
- Need to pass **specific properties** to child components
- Want **type-safe property access**
- Building modular components that work with parts of state
- Optimizing re-renders by subscribing to specific properties

**Don't use when**:
- Working with regular Atoms (use derived atoms instead)
- Property access doesn't need reactivity
- Accessing primitive AtomRefs (no properties to access)

## Comparison: Full Ref vs Property Ref

\`\`\`typescript
// ❌ Passing full ref - child re-renders on any property change
function UserForm() {
  return <NameInput formRef={formRef} />
}

function NameInput({ formRef }: { formRef: AtomRef<FormData> }) {
  const form = useAtomRef(formRef)
  // Re-renders when email or age change, even though we only use name!
  
  return <input value={form.name} onChange={...} />
}

// ✅ Passing property ref - child only re-renders when that property changes
function UserForm() {
  return <NameInput formRef={formRef} />
}

function NameInput({ formRef }: { formRef: AtomRef<FormData> }) {
  const nameRef = useAtomRefProp(formRef, "name")
  const name = useAtomRef(nameRef)
  // Only re-renders when name changes!
  
  return <input value={name} onChange={...} />
}
\`\`\`

## See Also

- \`useAtomRef\` - Subscribe to AtomRef value
- \`useAtomRefPropValue\` - Get property value directly (combines this + useAtomRef)
- \`AtomRef\` - Reference-based atom API
- \`RegistryProvider\` - Providing atom registry to component tree
    `,
  },
  {
    name: "useAtomRefPropValue.md",
    content: `
# useAtomRefPropValue Hook

Get the value of a specific property from an AtomRef object (convenience hook).

## Signature

\`\`\`typescript
function useAtomRefPropValue<A, K extends keyof A>(
  ref: AtomRef<A>,
  prop: K
): A[K]
\`\`\`

## Behavior

- **Returns** the value of a specific property
- **Subscribes** to property changes
- **Triggers re-render** when property value changes
- **Convenience hook** - equivalent to \`useAtomRef(useAtomRefProp(ref, prop))\`
- **Type-safe** - TypeScript ensures property exists

## Basic Example

\`\`\`typescript
import { AtomRef } from "@effect-atom/atom"
import { useAtomRefPropValue } from "@effect-atom/atom-react"

interface User {
  name: string
  email: string
  age: number
}

const userRef = AtomRef.make<User>({
  name: "Alice",
  email: "alice@example.com",
  age: 30,
})

function UserName() {
  // Get just the name property value
  const name = useAtomRefPropValue(userRef, "name")
  
  return <h1>{name}</h1>
}

function UserEmail() {
  // Get just the email property value
  const email = useAtomRefPropValue(userRef, "email")
  
  return <p>{email}</p>
}
\`\`\`

## Form Inputs

\`\`\`typescript
interface FormData {
  username: string
  password: string
  rememberMe: boolean
}

const formRef = AtomRef.make<FormData>({
  username: "",
  password: "",
  rememberMe: false,
})

function UsernameInput() {
  const username = useAtomRefPropValue(formRef, "username")
  
  return (
    <input
      type="text"
      value={username}
      onChange={(e) => {
        // Update the property through the parent ref
        formRef.value = { ...formRef.value, username: e.target.value }
      }}
    />
  )
}

function PasswordInput() {
  const password = useAtomRefPropValue(formRef, "password")
  
  return (
    <input
      type="password"
      value={password}
      onChange={(e) => {
        formRef.value = { ...formRef.value, password: e.target.value }
      }}
    />
  )
}

function RememberMeCheckbox() {
  const rememberMe = useAtomRefPropValue(formRef, "rememberMe")
  
  return (
    <label>
      <input
        type="checkbox"
        checked={rememberMe}
        onChange={(e) => {
          formRef.value = { ...formRef.value, rememberMe: e.target.checked }
        }}
      />
      Remember me
    </label>
  )
}
\`\`\`

## Optimized Re-renders

\`\`\`typescript
interface AppState {
  user: User
  cart: Cart
  notifications: Array<Notification>
}

const appStateRef = AtomRef.make<AppState>(initialState)

// This component only re-renders when user changes
function UserSection() {
  const user = useAtomRefPropValue(appStateRef, "user")
  return <div>{user.name}</div>
}

// This component only re-renders when cart changes
function CartSection() {
  const cart = useAtomRefPropValue(appStateRef, "cart")
  return <div>Items: {cart.items.length}</div>
}

// This component only re-renders when notifications change
function NotificationsSection() {
  const notifications = useAtomRefPropValue(appStateRef, "notifications")
  return <div>Notifications: {notifications.length}</div>
}
\`\`\`

## Comparison: useAtomRefPropValue vs useAtomRef

\`\`\`typescript
// Using useAtomRef + useAtomRefProp (verbose)
function NameDisplay() {
  const nameRef = useAtomRefProp(userRef, "name")
  const name = useAtomRef(nameRef)
  
  return <div>{name}</div>
}

// Using useAtomRefPropValue (concise)
function NameDisplay() {
  const name = useAtomRefPropValue(userRef, "name")
  
  return <div>{name}</div>
}
\`\`\`

## Accessing Nested Properties

\`\`\`typescript
interface Config {
  api: {
    baseUrl: string
    timeout: number
  }
  features: {
    analytics: boolean
    darkMode: boolean
  }
}

const configRef = AtomRef.make<Config>(defaultConfig)

function ApiSettings() {
  // Get the entire api object
  const api = useAtomRefPropValue(configRef, "api")
  
  return (
    <div>
      <p>Base URL: {api.baseUrl}</p>
      <p>Timeout: {api.timeout}ms</p>
    </div>
  )
}

function FeatureToggles() {
  // Get the entire features object
  const features = useAtomRefPropValue(configRef, "features")
  
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={features.analytics}
          onChange={(e) => {
            configRef.value = {
              ...configRef.value,
              features: { ...features, analytics: e.target.checked }
            }
          }}
        />
        Analytics
      </label>
    </div>
  )
}
\`\`\`

## When to Use useAtomRefPropValue

**Use when**:
- You need to **display** a specific property value
- Want to **optimize re-renders** (only when specific property changes)
- Prefer **concise syntax** over \`useAtomRef(useAtomRefProp(...))\`
- Building modular components focused on specific properties

**Don't use when**:
- You need the property **ref** (not just value) - use \`useAtomRefProp\`
- Working with entire AtomRef value - use \`useAtomRef\`
- Working with regular Atoms - use \`useAtomValue\`

## Registry Context

\`\`\`typescript
import { RegistryProvider } from "@effect-atom/atom-react"

function App() {
  return (
    <RegistryProvider>
      <UserName />
      <UserEmail />
    </RegistryProvider>
  )
}
\`\`\`

## See Also

- \`useAtomRef\` - Subscribe to full AtomRef value
- \`useAtomRefProp\` - Get ref to property (not just value)
- \`AtomRef\` - Reference-based atom API
- \`useAtomValue\` - For regular Atoms
    `,
  },
  {
    name: "useAtomInitialValues.md",
    content: `
# useAtomInitialValues Hook

Set initial values for multiple atoms (useful for SSR hydration and testing).

## Signature

\`\`\`typescript
function useAtomInitialValues(
  initialValues: Iterable<readonly [Atom<any>, any]>
): void
\`\`\`

## Behavior

- **Sets initial values** for atoms on first render
- **Only sets once** per atom (subsequent calls are ignored)
- **No return value** (void)
- **Use cases**:
  - SSR hydration (restore server-side state)
  - Testing (pre-populate atoms)
  - Default values for computed atoms
  - Initial app state setup

## Basic Example - SSR Hydration

\`\`\`typescript
import { Atom } from "@effect-atom/atom-react"
import { useAtomInitialValues, useAtomValue } from "@effect-atom/atom-react"

const userAtom = Atom.make<User | null>(null)
const settingsAtom = Atom.make<Settings>({ theme: "light" })

function App({ serverData }: { serverData: ServerData }) {
  // Hydrate atoms with server-rendered values
  useAtomInitialValues([
    [userAtom, serverData.user],
    [settingsAtom, serverData.settings],
  ])
  
  return (
    <div>
      <UserProfile />
      <SettingsPanel />
    </div>
  )
}

function UserProfile() {
  const user = useAtomValue(userAtom)
  return <div>{user?.name}</div>
}
\`\`\`

## Testing Setup

\`\`\`typescript
import { render } from "@testing-library/react"

const countAtom = Atom.make(0)
const nameAtom = Atom.make("")

function TestWrapper({ children }: { children: React.ReactNode }) {
  // Pre-populate atoms for testing
  useAtomInitialValues([
    [countAtom, 100],
    [nameAtom, "Test User"],
  ])
  
  return <>{children}</>
}

describe("MyComponent", () => {
  it("should render with initial values", () => {
    const { getByText } = render(
      <RegistryProvider>
        <TestWrapper>
          <MyComponent />
        </TestWrapper>
      </RegistryProvider>
    )
    
    expect(getByText("100")).toBeInTheDocument()
    expect(getByText("Test User")).toBeInTheDocument()
  })
})
\`\`\`

## SSR with Next.js

\`\`\`typescript
// pages/index.tsx
import type { GetServerSideProps } from "next"

const userAtom = Atom.make<User | null>(null)
const postsAtom = Atom.make<Array<Post>>([])

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Fetch data on server
  const user = await fetchUser(context.req.cookies.sessionId)
  const posts = await fetchPosts()
  
  return {
    props: {
      initialAtomValues: [
        [userAtom, user],
        [postsAtom, posts],
      ],
    },
  }
}

export default function HomePage({ initialAtomValues }: HomePageProps) {
  // Hydrate atoms with server data
  useAtomInitialValues(initialAtomValues)
  
  return (
    <div>
      <UserHeader />
      <PostsList />
    </div>
  )
}
\`\`\`

## Default Values for Derived Atoms

\`\`\`typescript
const apiDataAtom = Atom.fn(/* fetch from API */)
const cacheAtom = Atom.make<CachedData | null>(null)

function App() {
  // Try to use cached data initially
  const cachedData = localStorage.getItem("cached-data")
  
  if (cachedData) {
    useAtomInitialValues([
      [cacheAtom, JSON.parse(cachedData)],
    ])
  }
  
  return <div>{/* app content */}</div>
}
\`\`\`

## Multiple Component Mounts

\`\`\`typescript
// Initial values are only set once, even if multiple components call useAtomInitialValues

function ComponentA() {
  useAtomInitialValues([[countAtom, 100]]) // Sets to 100
  const count = useAtomValue(countAtom)
  return <div>A: {count}</div>
}

function ComponentB() {
  useAtomInitialValues([[countAtom, 200]]) // Ignored - already set by ComponentA
  const count = useAtomValue(countAtom)
  return <div>B: {count}</div> // Will show 100, not 200
}

function App() {
  return (
    <>
      <ComponentA />
      <ComponentB />
    </>
  )
}
\`\`\`

## With Map/Object Conversion

\`\`\`typescript
interface HydrationData {
  user: User
  settings: Settings
  notifications: Array<Notification>
}

function App({ hydrationData }: { hydrationData: HydrationData }) {
  // Convert object to atom-value pairs
  const initialValues: Array<[Atom<any>, any]> = [
    [userAtom, hydrationData.user],
    [settingsAtom, hydrationData.settings],
    [notificationsAtom, hydrationData.notifications],
  ]
  
  useAtomInitialValues(initialValues)
  
  return <div>{/* app content */}</div>
}
\`\`\`

## Dynamic Initial Values

\`\`\`typescript
function App() {
  const queryParams = new URLSearchParams(window.location.search)
  
  // Set initial values from URL query params
  useAtomInitialValues([
    [searchQueryAtom, queryParams.get("q") || ""],
    [filterAtom, queryParams.get("filter") || "all"],
    [sortAtom, queryParams.get("sort") || "recent"],
  ])
  
  return <SearchPage />
}
\`\`\`

## When to Use useAtomInitialValues

**Use when**:
- **SSR hydration** - Restore server-rendered state on client
- **Testing** - Pre-populate atoms with test data
- **URL state** - Initialize from query parameters
- **Cached data** - Restore from localStorage/IndexedDB
- **Default values** - Set defaults for multiple atoms at once

**Don't use when**:
- Setting values after initial render (use \`useAtomSet\` or \`useAtom\`)
- Values change frequently (just use regular state updates)
- Only setting one atom (use \`Atom.make(initialValue)\` instead)

## Important Notes

1. **One-time only**: Initial values are set only once per atom. Subsequent calls with the same atom are ignored.

2. **Runs during render**: This hook runs synchronously during render, not in useEffect.

3. **Per-registry**: Initial values are tracked per Registry instance (useful for isolated test contexts).

4. **Type safety**: The tuple type ensures the value matches the atom's type.

5. **Order matters**: If multiple components call this hook, the first mounted component wins.

## Comparison: useAtomInitialValues vs Atom.make

\`\`\`typescript
// ✅ Static default - use Atom.make
const countAtom = Atom.make(0) // Simple, direct

// ✅ Dynamic default from props - use useAtomInitialValues
function App({ initialCount }: { initialCount: number }) {
  useAtomInitialValues([[countAtom, initialCount]])
  return <Counter />
}

// ❌ Don't use useAtomInitialValues for static defaults
function App() {
  useAtomInitialValues([[countAtom, 0]]) // Unnecessary
  return <Counter />
}
\`\`\`

## Registry Context

\`\`\`typescript
import { RegistryProvider } from "@effect-atom/atom-react"

function App({ serverData }: { serverData: ServerData }) {
  return (
    <RegistryProvider>
      <AppWithInitialValues serverData={serverData} />
    </RegistryProvider>
  )
}

function AppWithInitialValues({ serverData }: { serverData: ServerData }) {
  useAtomInitialValues([
    [userAtom, serverData.user],
    [settingsAtom, serverData.settings],
  ])
  
  return <div>{/* content */}</div>
}
\`\`\`

## See Also

- \`Atom.make\` - Creating atoms with static default values
- \`useAtom\` - Reading and updating atom values
- \`RegistryProvider\` - Providing atom registry to component tree
- \`Registry.set\` - Programmatically setting atom values outside React
    `,
  },
  {
    name: "useAtomSubscribe.md",
    content: `
# useAtomSubscribe Hook

Subscribe to atom value changes with a callback function (for side effects).

## Signature

\`\`\`typescript
function useAtomSubscribe<A>(
  atom: Atom<A>,
  callback: (value: A) => void,
  options?: { readonly immediate?: boolean }
): void
\`\`\`

## Behavior

- **Subscribes** to atom value changes
- **Calls callback** whenever atom value changes
- **No return value** (void)
- **No re-render** (doesn't subscribe for rendering)
- **Cleanup** automatically on component unmount
- **immediate option**: Call callback immediately with current value on mount

## Basic Example - Logging Changes

\`\`\`typescript
import { Atom } from "@effect-atom/atom-react"
import { useAtomSubscribe, useAtom } from "@effect-atom/atom-react"

const countAtom = Atom.make(0)

function Counter() {
  const [count, setCount] = useAtom(countAtom)
  
  // Log to console whenever count changes
  useAtomSubscribe(countAtom, (newCount) => {
    console.log("Count changed to:", newCount)
  })
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}
\`\`\`

## Side Effects - Local Storage Sync

\`\`\`typescript
const userPreferencesAtom = Atom.make({
  theme: "light",
  fontSize: 14,
  language: "en",
})

function App() {
  // Sync preferences to localStorage whenever they change
  useAtomSubscribe(userPreferencesAtom, (prefs) => {
    localStorage.setItem("user-preferences", JSON.stringify(prefs))
  })
  
  return <div>{/* app content */}</div>
}
\`\`\`

## With immediate Option

\`\`\`typescript
function AnalyticsTracker() {
  const [currentPage, setCurrentPage] = useAtom(pageAtom)
  
  // Track page views - call immediately on mount
  useAtomSubscribe(
    pageAtom,
    (page) => {
      analytics.track("page_view", { page })
    },
    { immediate: true } // Calls callback with current value on mount
  )
  
  return <div>{/* content */}</div>
}
\`\`\`

## Document Title Sync

\`\`\`typescript
const pageTitleAtom = Atom.make("Home")

function App() {
  // Update document title when atom changes
  useAtomSubscribe(pageTitleAtom, (title) => {
    document.title = \`\${title} - My App\`
  }, { immediate: true })
  
  return <div>{/* app content */}</div>
}
\`\`\`

## WebSocket Send

\`\`\`typescript
const messageAtom = Atom.make<string | null>(null)

function ChatRoom({ socket }: { socket: WebSocket }) {
  // Send messages to websocket when atom updates
  useAtomSubscribe(messageAtom, (message) => {
    if (message && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "message", text: message }))
    }
  })
  
  return <div>{/* chat UI */}</div>
}
\`\`\`

## Multiple Subscriptions

\`\`\`typescript
function MultiTracker() {
  // Track multiple atoms with different callbacks
  useAtomSubscribe(userAtom, (user) => {
    analytics.identify(user.id)
  })
  
  useAtomSubscribe(eventAtom, (event) => {
    analytics.track(event.name, event.properties)
  })
  
  useAtomSubscribe(errorAtom, (error) => {
    errorReporting.capture(error)
  })
  
  return null
}
\`\`\`

## Browser API Integration

\`\`\`typescript
const themeAtom = Atom.make<"light" | "dark">("light")

function ThemeSync() {
  // Sync theme to document class
  useAtomSubscribe(
    themeAtom,
    (theme) => {
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(theme)
    },
    { immediate: true }
  )
  
  return null
}
\`\`\`

## Debounced Side Effects

\`\`\`typescript
const searchQueryAtom = Atom.make("")

function SearchSync() {
  // Debounce analytics tracking
  useAtomSubscribe(searchQueryAtom, (query) => {
    const timeoutId = setTimeout(() => {
      if (query.length > 2) {
        analytics.track("search", { query })
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  })
  
  return null
}
\`\`\`

## Comparison: useAtomSubscribe vs useAtomValue

\`\`\`typescript
// ❌ Using useAtomValue for side effects - causes re-renders
function Logger() {
  const count = useAtomValue(countAtom)
  
  // This component re-renders on every count change
  React.useEffect(() => {
    console.log("Count:", count)
  }, [count])
  
  return null // Doesn't render anything but still re-renders!
}

// ✅ Using useAtomSubscribe - no re-renders
function Logger() {
  useAtomSubscribe(countAtom, (count) => {
    console.log("Count:", count)
  })
  
  return null // Never re-renders
}
\`\`\`

## When to Use useAtomSubscribe

**Use when**:
- Performing **side effects** in response to atom changes
- Syncing to external systems (localStorage, analytics, websockets)
- Updating browser APIs (document.title, classList, etc.)
- Logging or debugging
- You **don't need to render** the atom value

**Don't use when**:
- You need to **display** the value (use \`useAtomValue\` or \`useAtom\`)
- Side effect should happen on user action, not atom change (use event handlers)
- You're creating derived state (use \`Atom.fn\` for derived atoms)

## Important Notes

1. **No re-render**: This hook doesn't cause component re-renders when atom changes. It only runs the callback.

2. **Stable callback**: For best performance, memoize the callback with \`useCallback\` if it has dependencies.

3. **Cleanup**: The subscription is automatically cleaned up when the component unmounts.

4. **immediate option**: When \`true\`, calls the callback immediately with the current atom value on mount (in addition to future changes).

5. **Effect dependencies**: The subscription re-subscribes if atom or callback reference changes.

## Registry Context

\`\`\`typescript
import { RegistryProvider } from "@effect-atom/atom-react"

function App() {
  return (
    <RegistryProvider>
      <Logger />
      <ThemeSync />
      <AnalyticsTracker />
    </RegistryProvider>
  )
}
\`\`\`

## See Also

- \`useAtomValue\` - Subscribe and render the value
- \`useAtom\` - Subscribe, render, and update the value
- \`Atom.fn\` - Create derived atoms for computed state (better than subscriptions for derived values)
- \`RegistryProvider\` - Providing atom registry to component tree
    `,
  },
  {
    name: "useAtomSuspense.md",
    content: `
# useAtomSuspense Hook

Suspense-aware access to Result atoms with declarative loading and error handling.

## Signature

\`\`\`typescript
function useAtomSuspense<A, E, IncludeFailure extends boolean = false>(
  atom: Atom<Result<A, E>>,
  options?: {
    readonly suspendOnWaiting?: boolean | undefined
    readonly includeFailure?: IncludeFailure | undefined
  }
): Result.Success<A, E> | (IncludeFailure extends true ? Result.Failure<A, E> : never)
\`\`\`

## Behavior

- **Suspends** while atom is in \`Result.Waiting\` state (unless \`suspendOnWaiting: false\`)
- **Throws error** on \`Result.Failure\` (caught by Error Boundary, unless \`includeFailure: true\`)
- **Returns unwrapped value** directly (no Result wrapper)
- Works with **React Suspense boundaries** for loading UI
- Works with **Error Boundaries** for error UI

## Basic Example with Suspense

\`\`\`typescript
import { Atom } from "@effect-atom/atom-react"
import { useAtomSuspense } from "@effect-atom/atom-react"
import { Effect } from "effect"
import React from "react"

// Create effectful atom that returns Result
const userAtom = Atom.fn(
  Effect.gen(function* () {
    yield* Effect.sleep("1 second")
    const response = yield* Effect.tryPromise(() => 
      fetch("/api/user").then(r => r.json())
    )
    return response
  })
)

function UserProfile() {
  // Suspends during loading, unwraps success value
  const user = useAtomSuspense(userAtom)
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}

function App() {
  return (
    <React.Suspense fallback={<div>Loading user...</div>}>
      <UserProfile />
    </React.Suspense>
  )
}
\`\`\`

## With Error Boundary

\`\`\`typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false, error: undefined }
  
  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  return (
    <ErrorBoundary>
      <React.Suspense fallback="Loading...">
        <UserProfile />
      </React.Suspense>
    </ErrorBoundary>
  )
}
\`\`\`

## With Options - No Suspend

\`\`\`typescript
function OptionalUserProfile() {
  // Don't suspend on waiting, return undefined if not loaded
  const user = useAtomSuspense(userAtom, {
    suspendOnWaiting: false,
  })
  
  if (!user) {
    return <div>Loading...</div>
  }
  
  return <div>{user.name}</div>
}
\`\`\`

## With Options - Include Failure

\`\`\`typescript
import { Result } from "effect"

function UserProfileWithErrorHandling() {
  // Return failure instead of throwing
  const result = useAtomSuspense(userAtom, {
    includeFailure: true,
  })
  
  if (Result.isFailure(result)) {
    return (
      <div>
        <p>Error: {Cause.pretty(result.cause)}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }
  
  // result is Result.Success<User>
  return <div>{result.value.name}</div>
}
\`\`\`

## Multiple Atoms with Suspense

\`\`\`typescript
const userAtom = Atom.fn(/* fetch user */)
const postsAtom = Atom.fn(/* fetch posts */)
const commentsAtom = Atom.fn(/* fetch comments */)

function Dashboard() {
  // All three atoms can suspend
  const user = useAtomSuspense(userAtom)
  const posts = useAtomSuspense(postsAtom)
  const comments = useAtomSuspense(commentsAtom)
  
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <h2>Posts: {posts.length}</h2>
      <h3>Comments: {comments.length}</h3>
    </div>
  )
}

function App() {
  return (
    // Single Suspense boundary for all atoms
    <React.Suspense fallback="Loading dashboard...">
      <Dashboard />
    </React.Suspense>
  )
}
\`\`\`

## Nested Suspense Boundaries

\`\`\`typescript
function App() {
  return (
    <div>
      {/* Critical data - show loading immediately */}
      <React.Suspense fallback="Loading user...">
        <UserHeader />
      </React.Suspense>
      
      {/* Non-critical data - can load independently */}
      <React.Suspense fallback="Loading posts...">
        <PostsList />
      </React.Suspense>
      
      <React.Suspense fallback="Loading comments...">
        <CommentsList />
      </React.Suspense>
    </div>
  )
}

function UserHeader() {
  const user = useAtomSuspense(userAtom)
  return <h1>{user.name}</h1>
}

function PostsList() {
  const posts = useAtomSuspense(postsAtom)
  return <div>{/* render posts */}</div>
}
\`\`\`

## With Refresh

\`\`\`typescript
import { useAtomRefresh } from "@effect-atom/atom-react"

function UserProfile() {
  const user = useAtomSuspense(userAtom)
  const refresh = useAtomRefresh(userAtom)
  
  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={refresh}>Refresh User</button>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <React.Suspense fallback="Loading...">
        <UserProfile />
      </React.Suspense>
    </ErrorBoundary>
  )
}
\`\`\`

## Comparison: useAtomSuspense vs useAtomValue

\`\`\`typescript
// With useAtomValue - Manual Result handling
function UserProfileManual() {
  const userResult = useAtomValue(userAtom)
  
  if (Result.isWaiting(userResult)) {
    return <div>Loading...</div>
  }
  
  if (Result.isFailure(userResult)) {
    return <div>Error: {Cause.pretty(userResult.cause)}</div>
  }
  
  const user = Result.getOrThrow(userResult)
  return <div>{user.name}</div>
}

// With useAtomSuspense - Declarative boundaries
function UserProfileSuspense() {
  const user = useAtomSuspense(userAtom)
  // No manual Result handling needed!
  return <div>{user.name}</div>
}

function App() {
  return (
    <ErrorBoundary>
      <React.Suspense fallback="Loading...">
        <UserProfileSuspense />
      </React.Suspense>
    </ErrorBoundary>
  )
}
\`\`\`

## When to Use useAtomSuspense

**Use when**:
- Working with **Result atoms** (atoms that can be in Waiting/Failure/Success states)
- You want **declarative** loading and error UI (Suspense + Error Boundaries)
- You prefer React's built-in error handling mechanisms
- Building apps with multiple async data sources
- You want to avoid manual Result state checking

**Don't use when**:
- Atom doesn't return Result type (use \`useAtomValue\` instead)
- You need **custom** loading/error UI logic (use \`useAtomValue\` with manual Result handling)
- You want fine-grained control over error recovery
- Working with non-async atoms

## Important Notes

1. **Result atoms only**: This hook is specifically designed for atoms that return \`Result<A, E>\`. For other atoms, use \`useAtomValue\`.

2. **Error Boundary required**: Unless you use \`includeFailure: true\`, you **must** wrap with an Error Boundary to catch thrown errors.

3. **Suspense Boundary required**: Unless you use \`suspendOnWaiting: false\`, you **must** wrap with React.Suspense to catch the suspension.

4. **Automatic unwrapping**: The hook returns the unwrapped success value, not the Result wrapper.

5. **Type safety**: TypeScript correctly infers the return type based on options (e.g., with \`includeFailure: true\`, return type includes Failure).

## Registry Context

\`\`\`typescript
import { RegistryProvider } from "@effect-atom/atom-react"

function App() {
  return (
    <RegistryProvider>
      <ErrorBoundary>
        <React.Suspense fallback="Loading...">
          <UserProfile />
        </React.Suspense>
      </ErrorBoundary>
    </RegistryProvider>
  )
}
\`\`\`

## See Also

- \`useAtomValue\` - For non-Result atoms or manual Result handling
- \`Atom.fn\` - Creating effectful atoms that return Results
- \`Result\` - Effect's Result type for representing async states
- React Suspense - https://react.dev/reference/react/Suspense
- React Error Boundaries - https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
    `,
  },
  {
    name: "useAtomRefresh.md",
    content: `
# useAtomRefresh Hook

Get a function to manually refresh (re-evaluate) an atom's value.

## Signature

\`\`\`typescript
function useAtomRefresh<A>(atom: Atom<A>): () => void
\`\`\`

## Behavior

- Returns **refresh function** that re-evaluates the atom
- **Mounts** the atom automatically
- **Stable reference** (uses React.useCallback internally)
- Triggers **all subscribers** to re-render with new value
- Most useful with **effectful atoms** (created with Atom.fn)

## Basic Example - Manual Refetch

\`\`\`typescript
import { Atom } from "@effect-atom/atom-react"
import { useAtomRefresh, useAtomValue } from "@effect-atom/atom-react"
import { Effect } from "effect"

// Effectful atom that fetches data
const userAtom = Atom.fn(
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise(() =>
      fetch("/api/user").then((r) => r.json())
    )
    return response
  })
)

function UserProfile() {
  const user = useAtomValue(userAtom)
  const refresh = useAtomRefresh(userAtom)
  
  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={refresh}>
        Refresh
      </button>
    </div>
  )
}
\`\`\`

## Retry After Error

\`\`\`typescript
import { Result } from "effect"

const dataAtom = Atom.fn(
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise(() =>
      fetch("/api/data").then((r) => r.json())
    )
    return response
  })
)

function DataDisplay() {
  const dataResult = useAtomValue(dataAtom)
  const refresh = useAtomRefresh(dataAtom)
  
  if (Result.isFailure(dataResult)) {
    return (
      <div>
        <p>Error loading data</p>
        <button onClick={refresh}>Retry</button>
      </div>
    )
  }
  
  const data = Result.getOrThrow(dataResult)
  return <div>{JSON.stringify(data)}</div>
}
\`\`\`

## Pull-to-Refresh Pattern

\`\`\`typescript
const newsAtom = Atom.fn(
  Effect.gen(function* () {
    const articles = yield* Effect.tryPromise(() =>
      fetch("/api/news").then((r) => r.json())
    )
    return articles
  })
)

function NewsFeed() {
  const news = useAtomValue(newsAtom)
  const refresh = useAtomRefresh(newsAtom)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  
  const handleRefresh = async () => {
    setIsRefreshing(true)
    refresh()
    // Wait a bit for the refresh to complete
    setTimeout(() => setIsRefreshing(false), 1000)
  }
  
  return (
    <div>
      <button onClick={handleRefresh} disabled={isRefreshing}>
        {isRefreshing ? "Refreshing..." : "Pull to Refresh"}
      </button>
      <div>
        {news.map((article) => (
          <article key={article.id}>{article.title}</article>
        ))}
      </div>
    </div>
  )
}
\`\`\`

## Polling with Manual Refresh

\`\`\`typescript
const statusAtom = Atom.fn(
  Effect.gen(function* () {
    const status = yield* Effect.tryPromise(() =>
      fetch("/api/status").then((r) => r.json())
    )
    return status
  })
)

function StatusMonitor() {
  const status = useAtomValue(statusAtom)
  const refresh = useAtomRefresh(statusAtom)
  
  // Auto-refresh every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(refresh, 30000)
    return () => clearInterval(interval)
  }, [refresh])
  
  return (
    <div>
      <div>Status: {status.state}</div>
      <button onClick={refresh}>Check Now</button>
    </div>
  )
}
\`\`\`

## Multiple Atoms Refresh

\`\`\`typescript
const userAtom = Atom.fn(/* fetch user */)
const notificationsAtom = Atom.fn(/* fetch notifications */)
const settingsAtom = Atom.fn(/* fetch settings */)

function RefreshAllButton() {
  const refreshUser = useAtomRefresh(userAtom)
  const refreshNotifications = useAtomRefresh(notificationsAtom)
  const refreshSettings = useAtomRefresh(settingsAtom)
  
  const refreshAll = () => {
    refreshUser()
    refreshNotifications()
    refreshSettings()
  }
  
  return <button onClick={refreshAll}>Refresh All Data</button>
}
\`\`\`

## With Loading State

\`\`\`typescript
function DataViewer() {
  const data = useAtomValue(dataAtom)
  const refresh = useAtomRefresh(dataAtom)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  
  const handleRefresh = () => {
    setIsRefreshing(true)
    refresh()
    
    // Reset loading state after a delay
    // In production, you'd track the actual atom state
    setTimeout(() => setIsRefreshing(false), 500)
  }
  
  return (
    <div>
      <div className="data-content">
        {data.map((item) => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>
      <button 
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={isRefreshing ? "loading" : ""}
      >
        {isRefreshing ? "⟳ Refreshing..." : "Refresh"}
      </button>
    </div>
  )
}
\`\`\`

## Refresh on Event

\`\`\`typescript
function DataGrid() {
  const data = useAtomValue(dataAtom)
  const refresh = useAtomRefresh(dataAtom)
  
  // Refresh when window regains focus
  React.useEffect(() => {
    const handleFocus = () => refresh()
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [refresh])
  
  // Refresh when user comes back online
  React.useEffect(() => {
    const handleOnline = () => refresh()
    window.addEventListener("online", handleOnline)
    return () => window.removeEventListener("online", handleOnline)
  }, [refresh])
  
  return <div>{/* render data */}</div>
}
\`\`\`

## Conditional Refresh

\`\`\`typescript
function ConditionalRefresh() {
  const data = useAtomValue(dataAtom)
  const refresh = useAtomRefresh(dataAtom)
  
  const handleAction = () => {
    // Only refresh if data is stale
    const now = Date.now()
    const dataAge = now - data.timestamp
    
    if (dataAge > 60000) { // Older than 1 minute
      refresh()
    }
  }
  
  return <button onClick={handleAction}>Refresh if Stale</button>
}
\`\`\`

## When to Use useAtomRefresh

**Use when**:
- Manual refetch of data (refresh button)
- Retry after errors
- Pull-to-refresh patterns
- Polling/interval-based updates
- Refresh on specific events (focus, online, etc.)
- Force reload after mutations

**Don't use when**:
- Atom has no side effects (plain \`Atom.make\` - refresh does nothing)
- You need automatic reactivity (use derived atoms instead)
- You want to change the value directly (use \`useAtomSet\` or \`useAtom\`)

## Important Notes

1. **Effectful atoms only**: Refresh is most useful with \`Atom.fn\` (effectful atoms). For static atoms (\`Atom.make\`), refresh doesn't trigger re-evaluation.

2. **Stable reference**: The returned function has a stable reference (won't cause unnecessary re-renders when used as a dependency).

3. **Async behavior**: Refresh triggers the effect but returns immediately (void). The atom updates asynchronously.

4. **All subscribers update**: When you refresh an atom, **all** components using that atom will re-render with the new value.

## Registry Context

\`\`\`typescript
import { RegistryProvider } from "@effect-atom/atom-react"

function App() {
  return (
    <RegistryProvider>
      <UserProfile />
      <RefreshAllButton />
    </RegistryProvider>
  )
}
\`\`\`

## See Also

- \`useAtomValue\` - Subscribe to atom value (read-only)
- \`useAtomMount\` - Mount atom without getting refresh function
- \`Atom.fn\` - Creating effectful atoms that can be refreshed
- \`RegistryProvider\` - Providing atom registry to component tree
    `,
  },
  {
    name: "useAtomSet.md",
    content: `
# useAtomSet Hook

Get only the setter function for an atom without subscribing to its value.

## Signature

\`\`\`typescript
function useAtomSet<R, W>(
  atom: Writable<R, W>
): (value: W | ((value: R) => W)) => void
\`\`\`

## Behavior

- Returns **only the setter function** (no value)
- **Does not subscribe** to atom value changes
- **No re-renders** when atom value changes
- **More efficient** than \`useAtom\` when you don't need the current value
- **Functional updates**: Supports \`(prev) => next\` pattern
- Mounts the atom automatically

## Basic Example - Action Dispatcher

\`\`\`typescript
import { Atom } from "@effect-atom/atom-react"
import { useAtomSet, useAtomValue } from "@effect-atom/atom-react"

const countAtom = Atom.make(0)

// This component only updates, doesn't read
function IncrementButton() {
  // No re-render when count changes (efficient!)
  const setCount = useAtomSet(countAtom)
  
  return (
    <button onClick={() => setCount((prev) => prev + 1)}>
      Increment
    </button>
  )
}

// This component only reads
function CountDisplay() {
  const count = useAtomValue(countAtom)
  return <div>Count: {count}</div>
}

function App() {
  return (
    <>
      <CountDisplay />
      <IncrementButton />
    </>
  )
}
\`\`\`

## Comparison: useAtomSet vs useAtom

\`\`\`typescript
// ❌ Using useAtom - causes unnecessary re-renders
function ResetButton() {
  const [count, setCount] = useAtom(countAtom)
  // This component re-renders every time count changes,
  // even though it doesn't use the value!
  
  return <button onClick={() => setCount(0)}>Reset</button>
}

// ✅ Using useAtomSet - no unnecessary re-renders
function ResetButton() {
  const setCount = useAtomSet(countAtom)
  // This component never re-renders from count changes
  // Much more efficient!
  
  return <button onClick={() => setCount(0)}>Reset</button>
}
\`\`\`

## Event Handlers

\`\`\`typescript
const todoListAtom = Atom.make<Array<Todo>>([])

function AddTodoForm() {
  const [text, setText] = React.useState("")
  const setTodos = useAtomSet(todoListAtom)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Add new todo using functional update
    setTodos((todos) => [
      ...todos,
      { id: Date.now(), text, completed: false }
    ])
    
    setText("")
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="New todo..."
      />
      <button type="submit">Add</button>
    </form>
  )
}
\`\`\`

## Multiple Action Buttons

\`\`\`typescript
const cartAtom = Atom.make<Array<CartItem>>([])

function CartActions() {
  const setCart = useAtomSet(cartAtom)
  
  return (
    <div>
      <button onClick={() => setCart([])}>
        Clear Cart
      </button>
      <button onClick={() => setCart((items) => 
        items.filter(item => item.quantity > 0)
      )}>
        Remove Empty Items
      </button>
      <button onClick={() => setCart((items) =>
        items.map(item => ({ ...item, quantity: item.quantity * 2 }))
      )}>
        Double Quantities
      </button>
    </div>
  )
}
\`\`\`

## With useCallback for Stable References

\`\`\`typescript
function TodoItem({ todo }: { todo: Todo }) {
  const setTodos = useAtomSet(todoListAtom)
  
  // Create stable callback reference
  const toggleTodo = React.useCallback(() => {
    setTodos((todos) =>
      todos.map((t) =>
        t.id === todo.id ? { ...t, completed: !t.completed } : t
      )
    )
  }, [todo.id, setTodos])
  
  const deleteTodo = React.useCallback(() => {
    setTodos((todos) => todos.filter((t) => t.id !== todo.id))
  }, [todo.id, setTodos])
  
  return (
    <div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={toggleTodo}
      />
      <span>{todo.text}</span>
      <button onClick={deleteTodo}>Delete</button>
    </div>
  )
}
\`\`\`

## Dispatching Complex Actions

\`\`\`typescript
const appStateAtom = Atom.make({
  user: null,
  notifications: [],
  settings: {}
})

function LoginButton() {
  const setAppState = useAtomSet(appStateAtom)
  
  const handleLogin = async () => {
    const user = await loginUser()
    
    // Update only the user field
    setAppState((state) => ({
      ...state,
      user,
    }))
  }
  
  return <button onClick={handleLogin}>Login</button>
}

function NotificationBanner() {
  const setAppState = useAtomSet(appStateAtom)
  
  const dismissNotification = (id: string) => {
    setAppState((state) => ({
      ...state,
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  }
  
  return <div>...</div>
}
\`\`\`

## When to Use useAtomSet

**Use when**:
- You only need to **write** to the atom, not read it
- Component doesn't display atom value
- You want to **avoid re-renders** from atom changes
- Creating action dispatchers or event handlers
- Performance optimization for write-heavy components

**Don't use when**:
- You need to **read** the atom value (use \`useAtomValue\` or \`useAtom\`)
- You need both read and write in same component (use \`useAtom\`)
- The performance gain is negligible (premature optimization)

## Performance Impact

\`\`\`typescript
// ❌ Bad: 100 buttons all re-render when count changes
function ButtonGrid() {
  return (
    <>
      {Array.from({ length: 100 }).map((_, i) => (
        <ButtonWithUseAtom key={i} />
      ))}
    </>
  )
}

function ButtonWithUseAtom() {
  const [, setCount] = useAtom(countAtom) // Re-renders on every count change!
  return <button onClick={() => setCount((n) => n + 1)}>+1</button>
}

// ✅ Good: 100 buttons never re-render
function ButtonGrid() {
  return (
    <>
      {Array.from({ length: 100 }).map((_, i) => (
        <ButtonWithUseAtomSet key={i} />
      ))}
    </>
  )
}

function ButtonWithUseAtomSet() {
  const setCount = useAtomSet(countAtom) // Never re-renders!
  return <button onClick={() => setCount((n) => n + 1)}>+1</button>
}
\`\`\`

## Registry Context

\`\`\`typescript
import { RegistryProvider } from "@effect-atom/atom-react"

function App() {
  return (
    <RegistryProvider>
      <CountDisplay />
      <IncrementButton />
      <ResetButton />
    </RegistryProvider>
  )
}
\`\`\`

## See Also

- \`useAtom\` - For read-write access (subscribes to value)
- \`useAtomValue\` - For read-only access
- \`Atom.make\` - Creating writable atoms
- \`RegistryProvider\` - Providing atom registry to component tree
    `,
  },
  {
    name: "useAtomMount.md",
    content: `
# useAtomMount Hook

Mount an atom to ensure its subscription is active.

## Signature

\`\`\`typescript
function useAtomMount<A>(atom: Atom<A>): void
\`\`\`

## Behavior

- **Mounts** the atom on component mount
- **Unmounts** the atom on component unmount
- **No return value** (void)
- **Use cases**:
  - Pre-load data before it's needed
  - Ensure effectful atoms start executing
  - Keep atom alive even if not directly consumed
  - Initialize background processes

## Basic Example - Pre-loading Data

\`\`\`typescript
import { Atom } from "@effect-atom/atom-react"
import { useAtomMount, useAtomValue } from "@effect-atom/atom-react"
import { Effect } from "effect"

// Effectful atom that fetches user data
const userAtom = Atom.fn(
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise(() => 
      fetch("/api/user").then(r => r.json())
    )
    return response
  })
)

// Component that mounts the atom to start loading
function UserDataLoader() {
  // Start loading immediately when component mounts
  useAtomMount(userAtom)
  return null // No UI needed
}

// Component that consumes the data
function UserProfile() {
  const user = useAtomValue(userAtom)
  return <div>{user.name}</div>
}

function App() {
  return (
    <React.Suspense fallback="Loading...">
      {/* Start loading early */}
      <UserDataLoader />
      {/* Display when ready */}
      <UserProfile />
    </React.Suspense>
  )
}
\`\`\`

## Ensuring Effectful Atom Execution

\`\`\`typescript
import { Effect, Stream } from "effect"

// Atom with side effects (e.g., websocket connection)
const notificationsAtom = Atom.fn(
  Effect.gen(function* () {
    // Open websocket connection
    const ws = yield* Effect.tryPromise(() => 
      new Promise((resolve) => {
        const socket = new WebSocket("wss://api.example.com/notifications")
        socket.onopen = () => resolve(socket)
      })
    )
    
    // Return stream of notifications
    return ws
  })
)

function NotificationListener() {
  // Mount the atom to establish the connection
  // even if no component is actively using it yet
  useAtomMount(notificationsAtom)
  return null
}

function App() {
  return (
    <>
      <NotificationListener />
      <MainContent />
    </>
  )
}
\`\`\`

## Background Process Example

\`\`\`typescript
// Atom that syncs data periodically
const syncAtom = Atom.fn(
  Effect.gen(function* () {
    // Sync every 5 seconds
    yield* Effect.repeat(
      Effect.gen(function* () {
        const data = yield* fetchLocalData()
        yield* syncToServer(data)
      }),
      Schedule.spaced("5 seconds")
    )
  })
)

function DataSyncManager() {
  // Keep sync process running while component is mounted
  useAtomMount(syncAtom)
  
  return (
    <div className="sync-status">
      Background sync active
    </div>
  )
}
\`\`\`

## Multiple Atoms

\`\`\`typescript
// Pre-load multiple resources
function AppDataLoader() {
  useAtomMount(userAtom)
  useAtomMount(settingsAtom)
  useAtomMount(notificationsAtom)
  
  return <div>Loading app data...</div>
}
\`\`\`

## Conditional Mounting

\`\`\`typescript
function ConditionalLoader({ shouldLoad }: { shouldLoad: boolean }) {
  // Only mount if condition is true
  if (shouldLoad) {
    useAtomMount(dataAtom)
  }
  
  return null
}

// Note: This works but prefer using separate components
// for cleaner conditional rendering
function ConditionalLoaderBetter({ shouldLoad }: { shouldLoad: boolean }) {
  return shouldLoad ? <DataLoader /> : null
}

function DataLoader() {
  useAtomMount(dataAtom)
  return null
}
\`\`\`

## When to Use useAtomMount

**Use when**:
- Pre-loading data before a route/component is shown
- Establishing long-lived connections (websockets, etc.)
- Running background processes
- Ensuring an atom's effects run independent of value consumption

**Don't use when**:
- You need the atom's value (use \`useAtomValue\` instead)
- You need to update the atom (use \`useAtom\` instead)
- The atom has no side effects and isn't consumed elsewhere (unnecessary)

## Registry Context

\`\`\`typescript
import { RegistryProvider } from "@effect-atom/atom-react"

function App() {
  return (
    <RegistryProvider>
      <UserDataLoader />
      <UserProfile />
    </RegistryProvider>
  )
}
\`\`\`

## See Also

- \`useAtomValue\` - Subscribe to atom value (read-only)
- \`useAtom\` - Subscribe and update atom value (read-write)
- \`Atom.fn\` - Creating effectful atoms
- \`RegistryProvider\` - Providing atom registry to component tree
    `,
  },
  {
    name: "useAtom.md",
    content: `
# useAtom Hook

Read and write access to writable atoms with React state management.

## Signature

\`\`\`typescript
function useAtom<R, W>(
  atom: Writable<R, W>
): readonly [R, (value: W | ((value: R) => W)) => void]
\`\`\`

## Behavior

- Returns \`[value, setValue]\` tuple (similar to React's useState)
- **setValue** updates atom in registry
- **Functional updates**: setValue accepts a value or updater function
- Triggers **re-render** for all subscribed components
- **Subscribes** on mount, **unsubscribes** on unmount
- Only works with **writable atoms** (created with Atom.make)

## Basic Counter Example

\`\`\`typescript
import { Atom } from "@effect-atom/atom-react"
import { useAtom } from "@effect-atom/atom-react"

const countAtom = Atom.make(0)

function Counter() {
  const [count, setCount] = useAtom(countAtom)
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
      <button onClick={() => setCount(0)}>
        Reset
      </button>
    </div>
  )
}
\`\`\`

## Functional Updates

\`\`\`typescript
function Counter() {
  const [count, setCount] = useAtom(countAtom)
  
  return (
    <div>
      <p>Count: {count}</p>
      {/* Use functional update to avoid stale closure */}
      <button onClick={() => setCount((prev) => prev + 1)}>
        Increment
      </button>
      <button onClick={() => setCount((prev) => prev * 2)}>
        Double
      </button>
    </div>
  )
}
\`\`\`

## Form State Example

\`\`\`typescript
const nameAtom = Atom.make("")
const emailAtom = Atom.make("")

function UserForm() {
  const [name, setName] = useAtom(nameAtom)
  const [email, setEmail] = useAtom(emailAtom)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ name, email })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button type="submit">Submit</button>
    </form>
  )
}
\`\`\`

## Multiple Components Subscribing

\`\`\`typescript
const cartItemsAtom = Atom.make<Array<CartItem>>([])

// Component 1: Display only
function CartCount() {
  const [items] = useAtom(cartItemsAtom)
  return <div>Items: {items.length}</div>
}

// Component 2: Add items
function AddToCart({ product }: { product: Product }) {
  const [items, setItems] = useAtom(cartItemsAtom)
  
  const addItem = () => {
    setItems([...items, { id: product.id, quantity: 1 }])
  }
  
  return <button onClick={addItem}>Add to Cart</button>
}

// Component 3: Clear cart
function ClearCart() {
  const [, setItems] = useAtom(cartItemsAtom)
  return <button onClick={() => setItems([])}>Clear Cart</button>
}

// All components stay synchronized automatically
\`\`\`

## Registry Context

\`\`\`typescript
import { RegistryProvider } from "@effect-atom/atom-react"

function App() {
  return (
    <RegistryProvider>
      <CartCount />
      <AddToCart product={product} />
      <ClearCart />
    </RegistryProvider>
  )
}
\`\`\`

## See Also

- \`useAtomValue\` - For read-only access (more efficient if you don't need to update)
- \`useAtomSet\` - Get only the setter function (no subscription to value)
- \`Atom.make\` - Creating writable atoms
- \`RegistryProvider\` - Providing atom registry to component tree
    `,
  },
  {
    name: "useAtomValue.md",
    content: `
# useAtomValue Hook

Subscribe to atom values with automatic React updates (read-only access).

## Signature

\`\`\`typescript
function useAtomValue<A>(atom: Atom<A>): A
function useAtomValue<A, B>(atom: Atom<A>, f: (_: A) => B): B
\`\`\`

## Behavior

- **Subscribes** to atom value changes
- **Triggers re-render** when atom updates
- **Suspends** during async atom loading (React Suspense integration)
- **Throws errors** by default (caught by React Error Boundary)
- **Unsubscribes** automatically on component unmount
- **Transform function**: Optional second parameter to transform value before returning

## Basic Example

\`\`\`typescript
import { Atom } from "@effect-atom/atom-react"
import { useAtomValue } from "@effect-atom/atom-react"

const countAtom = Atom.make(0)

function Counter() {
  const count = useAtomValue(countAtom)
  return <div>Count: {count}</div>
}
\`\`\`

## With Transform Function

\`\`\`typescript
function DisplayDouble() {
  // Subscribe with transform function
  const doubled = useAtomValue(countAtom, (n) => n * 2)
  return <div>Doubled: {doubled}</div>
}
\`\`\`

## With React Suspense

\`\`\`typescript
import { Effect } from "effect"

// Create async atom
const userAtom = Atom.fn(
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise(() => 
      fetch("/api/user").then(r => r.json())
    )
    return response
  })
)

function UserProfile() {
  // useAtomValue will suspend while loading
  const user = useAtomValue(userAtom)
  return <div>{user.name}</div>
}

function App() {
  return (
    <React.Suspense fallback="Loading...">
      <UserProfile />
    </React.Suspense>
  )
}
\`\`\`

## Registry Context

\`\`\`typescript
import { RegistryProvider } from "@effect-atom/atom-react"

function App() {
  return (
    <RegistryProvider>
      <Counter />
    </RegistryProvider>
  )
}
\`\`\`

## See Also

- \`useAtom\` - For read-write access to atoms
- \`useAtomSuspense\` - For explicit Suspense control with Result atoms
- \`Atom.fn\` - Creating effectful atoms
- \`RegistryProvider\` - Providing atom registry to component tree
    `,
  },
  {
    name: "atom-react-optimistic.md",
    content: `
# Optimistic Updates Pattern

Update UI immediately while syncing in the background, with automatic rollback on errors.

## Complete Example

\`\`\`typescript
import { Atom } from "@effect-atom/atom-react"
import { useAtomValue, useAtom, RegistryProvider } from "@effect-atom/atom-react"
import { Effect, Schema, ManagedRuntime } from "effect"
import React from "react"

interface Todo {
  id: number
  text: string
  completed: boolean
}

// Service for API operations
export class TodoService extends Effect.Service<TodoService>()("TodoService", {
  dependencies: [],
  
  scoped: Effect.gen(function* () {
    const create = Effect.fn("TodoService.create")(function* (text: string) {
      // Simulate network delay
      yield* Effect.sleep("500 millis")
      
      // Simulate API call
      const todo = yield* Effect.tryPromise(() =>
        fetch("/api/todos", {
          method: "POST",
          body: JSON.stringify({ text }),
        }).then((r) => r.json())
      )
      
      return todo
    })
    
    const toggle = Effect.fn("TodoService.toggle")(function* (id: number) {
      yield* Effect.sleep("300 millis")
      
      return yield* Effect.tryPromise(() =>
        fetch(\`/api/todos/\${id}/toggle\`, { method: "POST" }).then((r) => r.json())
      )
    })
    
    return { create, toggle } as const
  }),
}) {}

// Atoms
const todosAtom = Atom.make<Array<Todo>>([])

// Optimistic add function
const addTodoOptimistic = (text: string) =>
  Effect.gen(function* () {
    const todoService = yield* TodoService
    const tempId = Date.now()
    const tempTodo = { id: tempId, text, completed: false }
    
    // 1. Optimistic update - update UI immediately
    yield* Atom.update(todosAtom, (todos) => [...todos, tempTodo])
    
    // 2. Background save
    const savedTodo = yield* todoService.create(text).pipe(
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          // 3. Rollback on error
          yield* Atom.update(todosAtom, (todos) =>
            todos.filter((t) => t.id !== tempId)
          )
          yield* Effect.logError("Failed to create todo", { error })
          return yield* Effect.fail(error)
        })
      )
    )
    
    // 4. Replace temp with real ID
    yield* Atom.update(todosAtom, (todos) =>
      todos.map((t) => (t.id === tempId ? savedTodo : t))
    )
  })

// Optimistic toggle function
const toggleTodoOptimistic = (id: number) =>
  Effect.gen(function* () {
    const todoService = yield* TodoService
    
    // Store original state for rollback
    const todos = yield* Atom.get(todosAtom)
    const originalTodo = todos.find((t) => t.id === id)
    
    if (!originalTodo) {
      return yield* Effect.fail("Todo not found")
    }
    
    // 1. Optimistic update
    yield* Atom.update(todosAtom, (todos) =>
      todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
    
    // 2. Background save
    yield* todoService.toggle(id).pipe(
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          // 3. Rollback on error
          yield* Atom.update(todosAtom, (todos) =>
            todos.map((t) => (t.id === id ? originalTodo : t))
          )
          yield* Effect.logError("Failed to toggle todo", { error })
          return yield* Effect.fail(error)
        })
      )
    )
  })

// Components
function TodoList() {
  const todos = useAtomValue(todosAtom)
  
  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  )
}

function TodoItem({ todo }: { todo: Todo }) {
  const runtime = React.useContext(RuntimeContext) // Get runtime from context
  
  const handleToggle = () => {
    // Fire and forget - UI already updated optimistically
    ManagedRuntime.runPromise(runtime)(toggleTodoOptimistic(todo.id))
  }
  
  return (
    <div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
      />
      <span style={{ textDecoration: todo.completed ? "line-through" : "none" }}>
        {todo.text}
      </span>
    </div>
  )
}

function AddTodoForm() {
  const [text, setText] = React.useState("")
  const runtime = React.useContext(RuntimeContext)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Fire and forget
    ManagedRuntime.runPromise(runtime)(addTodoOptimistic(text))
    setText("") // Clear input immediately
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="New todo..."
      />
      <button type="submit">Add</button>
    </form>
  )
}

function App() {
  const runtime = React.useMemo(
    () => ManagedRuntime.make(TodoService.Default),
    []
  )
  
  return (
    <RuntimeContext.Provider value={runtime}>
      <RegistryProvider runtime={runtime}>
        <div>
          <h1>Optimistic Todo App</h1>
          <AddTodoForm />
          <TodoList />
        </div>
      </RegistryProvider>
    </RuntimeContext.Provider>
  )
}

const RuntimeContext = React.createContext<ManagedRuntime.ManagedRuntime<TodoService, never>>(null!)

export default App
\`\`\`

## Key Concepts

### 1. Optimistic Update Flow

\`\`\`typescript
// 1. Update UI immediately
yield* Atom.update(atom, optimisticValue)

// 2. Try to sync with server
const result = yield* service.save().pipe(
  Effect.catchAll((error) => {
    // 3. Rollback on error
    yield* Atom.update(atom, originalValue)
    return yield* Effect.fail(error)
  })
)

// 4. Replace with server response
yield* Atom.update(atom, result)
\`\`\`

### 2. Temporary IDs

\`\`\`typescript
const tempId = Date.now() // Temporary ID
const tempTodo = { id: tempId, text, completed: false }

// Add with temp ID
yield* Atom.update(todos, [...todos, tempTodo])

// Replace with real ID from server
yield* Atom.update(todos, todos.map(t => 
  t.id === tempId ? savedTodo : t
))
\`\`\`

### 3. Rollback Strategy

\`\`\`typescript
// Store original for rollback
const original = yield* Atom.get(atom)

// Optimistic update
yield* Atom.update(atom, newValue)

// Rollback on error
yield* service.save().pipe(
  Effect.catchAll(() => Atom.set(atom, original))
)
\`\`\`

### 4. Fire-and-Forget Pattern

\`\`\`typescript
const handleClick = () => {
  // Don't await - UI already updated
  ManagedRuntime.runPromise(runtime)(optimisticOperation())
}
\`\`\`

## When to Use Optimistic Updates

**Use when**:
- Network latency would make UI feel slow
- High confidence operation will succeed (e.g., marking todo complete)
- User expects immediate feedback
- Rollback is acceptable if operation fails

**Don't use when**:
- Operation has critical side effects (payments, deletions)
- Rollback would be confusing to users
- Server validation is complex
- Data integrity is critical

## See Also

- \`Atom.update\` - Updating atoms functionally
- \`Effect.catchAll\` - Error handling with rollback
- \`ManagedRuntime\` - Running effects from React
    `,
  },
  {
    name: "atom-react-ssr.md",
    content: `
# SSR Hydration Pattern

Server-side rendering with state serialization and client-side hydration.

## Complete Example

\`\`\`typescript
import { Atom, Registry } from "@effect-atom/atom"
import { RegistryProvider } from "@effect-atom/atom-react"
import { Effect } from "effect"
import { renderToString } from "react-dom/server"

interface User {
  id: number
  name: string
  email: string
}

interface ServerData {
  user: User
  posts: Array<Post>
}

// Atoms
const userAtom = Atom.make<User | null>(null)
const postsAtom = Atom.make<Array<Post>>([])

// Server-side rendering
async function renderServer(userId: number): Promise<string> {
  const registry = Registry.make()
  
  // 1. Fetch data on server
  const user = await Effect.runPromise(
    fetchUser(userId)
  )
  
  const posts = await Effect.runPromise(
    fetchPosts(userId)
  )
  
  // 2. Populate registry
  Registry.set(registry, userAtom, user)
  Registry.set(registry, postsAtom, posts)
  
  // 3. Serialize state
  const hydrationData = {
    user,
    posts,
  }
  
  // 4. Render app to HTML
  const html = renderToString(
    <RegistryProvider registry={registry}>
      <App />
    </RegistryProvider>
  )
  
  // 5. Embed state in HTML
  return \`
    <!DOCTYPE html>
    <html>
      <head><title>SSR App</title></head>
      <body>
        <div id="root">\${html}</div>
        <script id="__HYDRATION_DATA__" type="application/json">
          \${JSON.stringify(hydrationData)}
        </script>
        <script src="/bundle.js"></script>
      </body>
    </html>
  \`
}

// Client-side hydration
function App() {
  // 1. Get hydration data from script tag
  const hydrationData = React.useMemo(() => {
    if (typeof window === "undefined") return null
    
    const script = document.getElementById("__HYDRATION_DATA__")
    if (!script) return null
    
    return JSON.parse(script.textContent || "{}")
  }, [])
  
  // 2. Set initial values from server
  if (hydrationData) {
    useAtomInitialValues([
      [userAtom, hydrationData.user],
      [postsAtom, hydrationData.posts],
    ])
  }
  
  return (
    <div>
      <UserProfile />
      <PostsList />
    </div>
  )
}

function UserProfile() {
  const user = useAtomValue(userAtom)
  
  if (!user) {
    return <div>No user</div>
  }
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}

function PostsList() {
  const posts = useAtomValue(postsAtom)
  
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}

// Client entry point
const root = ReactDOM.hydrateRoot(
  document.getElementById("root")!,
  <React.StrictMode>
    <RegistryProvider>
      <App />
    </RegistryProvider>
  </React.StrictMode>
)
\`\`\`

## With Next.js

\`\`\`typescript
// pages/user/[id].tsx
import type { GetServerSideProps } from "next"
import { useAtomInitialValues } from "@effect-atom/atom-react"

const userAtom = Atom.make<User | null>(null)
const postsAtom = Atom.make<Array<Post>>([])

export const getServerSideProps: GetServerSideProps = async (context) => {
  const userId = parseInt(context.params?.id as string)
  
  // Fetch on server
  const user = await Effect.runPromise(fetchUser(userId))
  const posts = await Effect.runPromise(fetchPosts(userId))
  
  return {
    props: {
      hydrationData: {
        user,
        posts,
      },
    },
  }
}

export default function UserPage({ hydrationData }: UserPageProps) {
  // Hydrate atoms
  useAtomInitialValues([
    [userAtom, hydrationData.user],
    [postsAtom, hydrationData.posts],
  ])
  
  return (
    <div>
      <UserProfile />
      <PostsList />
    </div>
  )
}
\`\`\`

## With Remix

\`\`\`typescript
// routes/user.$id.tsx
import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

const userAtom = Atom.make<User | null>(null)

export async function loader({ params }: LoaderFunctionArgs) {
  const user = await Effect.runPromise(
    fetchUser(parseInt(params.id!))
  )
  
  return json({ user })
}

export default function UserRoute() {
  const { user } = useLoaderData<typeof loader>()
  
  // Hydrate atom with loader data
  useAtomInitialValues([[userAtom, user]])
  
  return <UserProfile />
}
\`\`\`

## Advanced: Selective Hydration

\`\`\`typescript
// Only hydrate if data is fresh
function App({ serverData, timestamp }: AppProps) {
  const dataAge = Date.now() - timestamp
  const shouldHydrate = dataAge < 60000 // Less than 1 minute old
  
  if (shouldHydrate) {
    useAtomInitialValues([
      [userAtom, serverData.user],
      [postsAtom, serverData.posts],
    ])
  }
  
  return <div>{/* app */}</div>
}
\`\`\`

## Custom Serialization

\`\`\`typescript
// Server: Serialize with custom logic
function serializeAtomState(registry: Registry): HydrationData {
  const user = Registry.get(registry, userAtom)
  const settings = Registry.get(registry, settingsAtom)
  
  return {
    version: "1.0",
    timestamp: Date.now(),
    atoms: {
      user,
      settings: {
        ...settings,
        // Exclude sensitive data
        apiKey: undefined,
      },
    },
  }
}

// Client: Deserialize
function deserializeAtomState(data: HydrationData) {
  if (data.version !== "1.0") {
    console.warn("Hydration data version mismatch")
    return []
  }
  
  return [
    [userAtom, data.atoms.user],
    [settingsAtom, data.atoms.settings],
  ]
}

function App({ hydrationData }: AppProps) {
  const initialValues = deserializeAtomState(hydrationData)
  useAtomInitialValues(initialValues)
  
  return <div>{/* app */}</div>
}
\`\`\`

## Progressive Enhancement

\`\`\`typescript
function App({ serverData }: AppProps) {
  const isClient = typeof window !== "undefined"
  
  // Hydrate on client
  if (isClient && serverData) {
    useAtomInitialValues([
      [userAtom, serverData.user],
    ])
  }
  
  // On server or no data: show loading
  const user = useAtomValue(userAtom)
  
  if (!user) {
    return <div>Loading...</div>
  }
  
  return <UserProfile user={user} />
}
\`\`\`

## Best Practices

### 1. Serialize Only What's Needed

\`\`\`typescript
// ✅ Good: Only serialize displayed data
const hydrationData = {
  user,
  recentPosts: posts.slice(0, 10), // First 10 only
}

// ❌ Bad: Serialize everything
const hydrationData = {
  user,
  posts, // Could be thousands of items
  comments, // Not needed initially
  analytics, // Shouldn't be serialized
}
\`\`\`

### 2. Version Your Hydration Data

\`\`\`typescript
const hydrationData = {
  version: "2.0",
  timestamp: Date.now(),
  data: { /* ... */ },
}

// Client validates version
if (hydrationData.version !== EXPECTED_VERSION) {
  // Skip hydration or migrate
}
\`\`\`

### 3. Handle Missing Data

\`\`\`typescript
function App({ serverData }: AppProps) {
  // Safely handle missing data
  if (serverData?.user) {
    useAtomInitialValues([[userAtom, serverData.user]])
  }
  
  return <UserProfile />
}
\`\`\`

## Performance Tips

1. **Minimize hydration payload** - Only send data visible above the fold
2. **Lazy load** remaining data - Fetch additional data client-side as needed
3. **Cache on server** - Reuse fetched data for multiple requests
4. **Stream responses** - Send HTML first, then hydration data

## See Also

- \`useAtomInitialValues\` - Setting initial atom values
- \`Registry.get\` / \`Registry.set\` - Direct registry manipulation
- \`RegistryProvider\` - Providing registry to component tree
- Next.js SSR - https://nextjs.org/docs/basic-features/data-fetching
    `,
  },
  {
    name: "atom-react-effectful.md",
    content: `
# Effectful Atoms with Services

Integrate Effect services with atom-react for async data fetching and business logic.

## Complete Example

\`\`\`typescript
import { Atom } from "@effect-atom/atom-react"
import { useAtomValue, useAtom, RegistryProvider } from "@effect-atom/atom-react"
import { Effect, Schema, Layer, ManagedRuntime } from "effect"
import React from "react"

// 1. Define domain model
export class User extends Schema.Class<User>("User")({
  id: Schema.Number,
  name: Schema.String,
  email: Schema.String,
}) {}

// 2. Define service error
export class UserServiceError extends Schema.TaggedError<UserServiceError>(
  "UserServiceError"
)({
  cause: Schema.optional(Schema.Defect),
  message: Schema.String,
}) {}

// 3. Define service
export class UserService extends Effect.Service<UserService>()("UserService", {
  dependencies: [],
  
  scoped: Effect.gen(function* () {
    const getUser = Effect.fn("UserService.getUser")(function* (userId: number) {
      yield* Effect.annotateCurrentSpan({ userId })
      
      // Simulate API call
      yield* Effect.sleep("1 second")
      
      const user = yield* Effect.tryPromise({
        try: () => fetch(\`/api/users/\${userId}\`).then((r) => r.json()),
        catch: (cause) => new UserServiceError({ 
          cause, 
          message: "Failed to fetch user" 
        }),
      })
      
      yield* Effect.logInfo("User fetched", { userId })
      
      return user
    })
    
    return { getUser } as const
  }),
}) {}

// 4. Create atoms
const userIdAtom = Atom.make(1)

const userAtom = Atom.fn(
  Effect.gen(function* () {
    const userId = yield* Atom.get(userIdAtom)
    const userService = yield* UserService
    
    // Fetch user using service
    return yield* userService.getUser(userId)
  })
)

// 5. React components
function UserProfile() {
  const user = useAtomValue(userAtom)
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}

function UserSelector() {
  const [userId, setUserId] = useAtom(userIdAtom)
  
  return (
    <div>
      <button onClick={() => setUserId(userId - 1)} disabled={userId <= 1}>
        Previous
      </button>
      <span>User ID: {userId}</span>
      <button onClick={() => setUserId(userId + 1)}>
        Next
      </button>
    </div>
  )
}

// 6. App with runtime
function App() {
  const runtime = React.useMemo(
    () => ManagedRuntime.make(UserService.Default),
    []
  )
  
  return (
    <RegistryProvider runtime={runtime}>
      <React.Suspense fallback="Loading user...">
        <div>
          <h1>User Viewer</h1>
          <UserSelector />
          <UserProfile />
        </div>
      </React.Suspense>
    </RegistryProvider>
  )
}

export default App
\`\`\`

## Key Concepts Demonstrated

### 1. Effect Services in Atoms

\`\`\`typescript
const userAtom = Atom.fn(
  Effect.gen(function* () {
    const userService = yield* UserService
    // Access any Effect service in atom
  })
)
\`\`\`

- **yield* ServiceName** accesses services
- Services must be provided via runtime
- Full Effect capabilities in atoms

### 2. ManagedRuntime Provision

\`\`\`typescript
const runtime = React.useMemo(
  () => ManagedRuntime.make(UserService.Default),
  []
)

<RegistryProvider runtime={runtime}>
  {/* components */}
</RegistryProvider>
\`\`\`

- **ManagedRuntime** handles service lifecycle
- **useMemo** ensures stable runtime reference
- **RegistryProvider** accepts runtime prop

### 3. Reactive Dependencies

\`\`\`typescript
const userAtom = Atom.fn(
  Effect.gen(function* () {
    const userId = yield* Atom.get(userIdAtom) // Reactive dependency
    const userService = yield* UserService
    
    // Refetches when userIdAtom changes
    return yield* userService.getUser(userId)
  })
)
\`\`\`

- Atom automatically refetches when \`userIdAtom\` changes
- No manual refresh needed
- Declarative reactivity

### 4. Suspense Integration

\`\`\`typescript
<React.Suspense fallback="Loading...">
  <UserProfile />
</React.Suspense>
\`\`\`

- Effectful atoms suspend while loading
- React Suspense handles loading state
- No manual loading state needed

## More Examples

### Multiple Services

\`\`\`typescript
export class PostService extends Effect.Service<PostService>()("PostService", {
  dependencies: [],
  scoped: Effect.gen(function* () {
    const getPosts = Effect.fn("PostService.getPosts")(function* (userId: number) {
      const posts = yield* Effect.tryPromise(() =>
        fetch(\`/api/users/\${userId}/posts\`).then((r) => r.json())
      )
      return posts
    })
    
    return { getPosts } as const
  }),
}) {}

const postsAtom = Atom.fn(
  Effect.gen(function* () {
    const userId = yield* Atom.get(userIdAtom)
    const postService = yield* PostService
    
    return yield* postService.getPosts(userId)
  })
)

function App() {
  const runtime = React.useMemo(
    () => ManagedRuntime.make(
      Layer.mergeAll(UserService.Default, PostService.Default)
    ),
    []
  )
  
  return (
    <RegistryProvider runtime={runtime}>
      <UserProfile />
      <PostsList />
    </RegistryProvider>
  )
}
\`\`\`

### With Error Handling

\`\`\`typescript
const userAtom = Atom.fn(
  Effect.gen(function* () {
    const userId = yield* Atom.get(userIdAtom)
    const userService = yield* UserService
    
    return yield* userService.getUser(userId).pipe(
      Effect.catchTag("UserServiceError", (error) =>
        Effect.gen(function* () {
          yield* Effect.logError("Failed to fetch user", { error })
          // Return default user on error
          return { id: userId, name: "Unknown", email: "" }
        })
      )
    )
  })
)
\`\`\`

### Combining Multiple Atoms and Services

\`\`\`typescript
const userIdAtom = Atom.make(1)
const includePostsAtom = Atom.make(true)

const userData Atom = Atom.fn(
  Effect.gen(function* () {
    const userId = yield* Atom.get(userIdAtom)
    const includePosts = yield* Atom.get(includePostsAtom)
    
    const userService = yield* UserService
    const user = yield* userService.getUser(userId)
    
    if (!includePosts) {
      return { user, posts: [] }
    }
    
    const postService = yield* PostService
    const posts = yield* postService.getPosts(userId)
    
    return { user, posts }
  })
)
\`\`\`

### With Caching Service

\`\`\`typescript
export class CacheService extends Effect.Service<CacheService>()("CacheService", {
  dependencies: [],
  scoped: Effect.gen(function* () {
    const cache = new Map<string, any>()
    
    const get = Effect.fn("CacheService.get")(function* (key: string) {
      return cache.get(key)
    })
    
    const set = Effect.fn("CacheService.set")(function* (key: string, value: any) {
      cache.set(key, value)
    })
    
    return { get, set } as const
  }),
}) {}

const cachedUserAtom = Atom.fn(
  Effect.gen(function* () {
    const userId = yield* Atom.get(userIdAtom)
    const cache = yield* CacheService
    const userService = yield* UserService
    
    const cacheKey = \`user-\${userId}\`
    const cached = yield* cache.get(cacheKey)
    
    if (cached) {
      yield* Effect.logInfo("Cache hit", { userId })
      return cached
    }
    
    const user = yield* userService.getUser(userId)
    yield* cache.set(cacheKey, user)
    
    return user
  })
)
\`\`\`

## Architecture Pattern

\`\`\`
┌─────────────────────────────────────────┐
│         RegistryProvider                │
│  ┌───────────────────────────────────┐  │
│  │   ManagedRuntime                  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Services Layer             │  │  │
│  │  │  - UserService              │  │  │
│  │  │  - PostService              │  │  │
│  │  │  - CacheService             │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Atoms (can access services):          │
│  - userAtom → UserService              │
│  - postsAtom → PostService             │
│  - cachedUserAtom → CacheService       │
└─────────────────────────────────────────┘
\`\`\`

## Best Practices

### 1. Memoize Runtime

\`\`\`typescript
// ✅ Good: Memoize runtime
const runtime = React.useMemo(
  () => ManagedRuntime.make(ServicesLayer),
  []
)

// ❌ Bad: Creates new runtime every render
const runtime = ManagedRuntime.make(ServicesLayer)
\`\`\`

### 2. Use Effect.gen in Atoms

\`\`\`typescript
// ✅ Good: Effect.gen for async atoms
const userAtom = Atom.fn(
  Effect.gen(function* () {
    const service = yield* UserService
    return yield* service.getUser(123)
  })
)

// ❌ Don't use async/await in atoms
const badAtom = Atom.fn(async () => {
  // This won't work properly
})
\`\`\`

### 3. Error Boundaries

\`\`\`typescript
<ErrorBoundary>
  <React.Suspense fallback="Loading...">
    <UserProfile />
  </React.Suspense>
</ErrorBoundary>
\`\`\`

Always wrap effectful atoms with Error Boundary to catch failures.

## Testing

\`\`\`typescript
import { describe, it, assert } from "@effect/vitest"
import { Layer } from "effect"

const MockUserService = Layer.succeed(UserService, {
  getUser: (id) => Effect.succeed({ id, name: "Test User", email: "test@example.com" })
})

describe("UserProfile", () => {
  it.scoped("should render user", () =>
    Effect.gen(function* () {
      const runtime = yield* ManagedRuntime.make(MockUserService)
      const registry = Registry.make()
      
      const { getByText } = render(
        <RegistryProvider registry={registry} runtime={runtime}>
          <React.Suspense fallback="Loading...">
            <UserProfile />
          </React.Suspense>
        </RegistryProvider>
      )
      
      await waitFor(() => {
        expect(getByText("Test User")).toBeInTheDocument()
      })
    })
  )
})
\`\`\`

## See Also

- \`ManagedRuntime\` - Effect runtime with resource management
- \`Effect.Service\` - Defining services
- \`Layer.mergeAll\` - Combining service layers
- \`effect://guide/atom-react/services\` - Services integration guide
    `,
  },
  {
    name: "atom-react-derived.md",
    content: `
# Derived Atoms Example

Compute derived state using Effect.gen for automatic recomputation.

## Complete Example - Todo Filtering

\`\`\`typescript
import { Atom } from "@effect-atom/atom-react"
import { useAtomValue, useAtom, RegistryProvider } from "@effect-atom/atom-react"
import { Effect } from "effect"
import React from "react"

interface Todo {
  id: number
  text: string
  completed: boolean
}

// Base atoms
const todosAtom = Atom.make<Array<Todo>>([
  { id: 1, text: "Learn Effect", completed: true },
  { id: 2, text: "Learn atom-react", completed: false },
  { id: 3, text: "Build app", completed: false },
])

const filterAtom = Atom.make<"all" | "active" | "completed">("all")

// Derived atom using Effect
const filteredTodosAtom = Atom.fn(
  Effect.gen(function* () {
    const todos = yield* Atom.get(todosAtom)
    const filter = yield* Atom.get(filterAtom)
    
    switch (filter) {
      case "active":
        return todos.filter((t) => !t.completed)
      case "completed":
        return todos.filter((t) => t.completed)
      default:
        return todos
    }
  })
)

// Another derived atom - count stats
const statsAtom = Atom.fn(
  Effect.gen(function* () {
    const todos = yield* Atom.get(todosAtom)
    
    return {
      total: todos.length,
      active: todos.filter((t) => !t.completed).length,
      completed: todos.filter((t) => t.completed).length,
    }
  })
)

function TodoList() {
  const todos = useAtomValue(filteredTodosAtom)
  
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <TodoItem todo={todo} />
        </li>
      ))}
    </ul>
  )
}

function TodoItem({ todo }: { todo: Todo }) {
  const [todos, setTodos] = useAtom(todosAtom)
  
  const toggleComplete = () => {
    setTodos(
      todos.map((t) =>
        t.id === todo.id ? { ...t, completed: !t.completed } : t
      )
    )
  }
  
  return (
    <div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={toggleComplete}
      />
      <span style={{ textDecoration: todo.completed ? "line-through" : "none" }}>
        {todo.text}
      </span>
    </div>
  )
}

function FilterControls() {
  const [filter, setFilter] = useAtom(filterAtom)
  
  return (
    <div>
      <button
        onClick={() => setFilter("all")}
        style={{ fontWeight: filter === "all" ? "bold" : "normal" }}
      >
        All
      </button>
      <button
        onClick={() => setFilter("active")}
        style={{ fontWeight: filter === "active" ? "bold" : "normal" }}
      >
        Active
      </button>
      <button
        onClick={() => setFilter("completed")}
        style={{ fontWeight: filter === "completed" ? "bold" : "normal" }}
      >
        Completed
      </button>
    </div>
  )
}

function Stats() {
  const stats = useAtomValue(statsAtom)
  
  return (
    <div>
      <p>Total: {stats.total}</p>
      <p>Active: {stats.active}</p>
      <p>Completed: {stats.completed}</p>
    </div>
  )
}

function App() {
  return (
    <RegistryProvider>
      <div>
        <h1>Todo App with Derived Atoms</h1>
        <Stats />
        <FilterControls />
        <TodoList />
      </div>
    </RegistryProvider>
  )
}

export default App
\`\`\`

## Key Concepts Demonstrated

### 1. Derived Atoms with Atom.fn

\`\`\`typescript
const filteredTodosAtom = Atom.fn(
  Effect.gen(function* () {
    const todos = yield* Atom.get(todosAtom)
    const filter = yield* Atom.get(filterAtom)
    
    // Compute derived value
    return todos.filter(/* ... */)
  })
)
\`\`\`

- **Atom.fn** creates a derived atom from an Effect
- **Atom.get** reads other atoms inside the Effect
- **Automatic recomputation** when dependencies change
- **Pure computation** - no side effects

### 2. Multiple Dependencies

\`\`\`typescript
const filteredTodosAtom = Atom.fn(
  Effect.gen(function* () {
    const todos = yield* Atom.get(todosAtom)     // Dependency 1
    const filter = yield* Atom.get(filterAtom)   // Dependency 2
    
    // Recomputes when EITHER dependency changes
    return computeFiltered(todos, filter)
  })
)
\`\`\`

The derived atom automatically tracks all dependencies and recomputes only when needed.

### 3. Computed Statistics

\`\`\`typescript
const statsAtom = Atom.fn(
  Effect.gen(function* () {
    const todos = yield* Atom.get(todosAtom)
    
    return {
      total: todos.length,
      active: todos.filter((t) => !t.completed).length,
      completed: todos.filter((t) => t.completed).length,
    }
  })
)
\`\`\`

- **Single source of truth**: \`todosAtom\`
- **Multiple derived values**: stats computed from base atom
- **Efficient**: Only recomputes when \`todosAtom\` changes

### 4. No Manual Subscriptions Needed

\`\`\`typescript
// ❌ Manual subscription approach (don't do this)
const [filteredTodos, setFilteredTodos] = React.useState([])

React.useEffect(() => {
  const todos = getTodos()
  const filter = getFilter()
  setFilteredTodos(todos.filter(/* ... */))
}, [todos, filter])

// ✅ Derived atom approach (automatic)
const filteredTodosAtom = Atom.fn(/* Effect.gen */)
const filtered = useAtomValue(filteredTodosAtom)
\`\`\`

## More Examples

### Shopping Cart Total

\`\`\`typescript
interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

const cartAtom = Atom.make<Array<CartItem>>([])

const cartTotalAtom = Atom.fn(
  Effect.gen(function* () {
    const items = yield* Atom.get(cartAtom)
    
    return items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  })
)

function CartTotal() {
  const total = useAtomValue(cartTotalAtom)
  
  return (
    <div>
      <h3>Total: \${total.toFixed(2)}</h3>
    </div>
  )
}
\`\`\`

### Form Validation

\`\`\`typescript
const emailAtom = Atom.make("")
const passwordAtom = Atom.make("")

const isValidAtom = Atom.fn(
  Effect.gen(function* () {
    const email = yield* Atom.get(emailAtom)
    const password = yield* Atom.get(passwordAtom)
    
    const emailValid = email.includes("@")
    const passwordValid = password.length >= 8
    
    return {
      isValid: emailValid && passwordValid,
      errors: {
        email: emailValid ? null : "Invalid email",
        password: passwordValid ? null : "Password too short",
      },
    }
  })
)

function SubmitButton() {
  const validation = useAtomValue(isValidAtom)
  
  return (
    <button disabled={!validation.isValid}>
      Submit
    </button>
  )
}
\`\`\`

### Search Results

\`\`\`typescript
const itemsAtom = Atom.make<Array<Item>>([/* items */])
const searchQueryAtom = Atom.make("")

const searchResultsAtom = Atom.fn(
  Effect.gen(function* () {
    const items = yield* Atom.get(itemsAtom)
    const query = yield* Atom.get(searchQueryAtom)
    
    if (!query) return items
    
    const lowerQuery = query.toLowerCase()
    return items.filter((item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery)
    )
  })
)

function SearchResults() {
  const results = useAtomValue(searchResultsAtom)
  
  return (
    <div>
      <p>Found {results.length} results</p>
      {results.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
\`\`\`

### Chained Derived Atoms

\`\`\`typescript
const numbersAtom = Atom.make([1, 2, 3, 4, 5])

// First level: squared values
const squaredAtom = Atom.fn(
  Effect.gen(function* () {
    const numbers = yield* Atom.get(numbersAtom)
    return numbers.map((n) => n * n)
  })
)

// Second level: sum of squared values
const sumOfSquaresAtom = Atom.fn(
  Effect.gen(function* () {
    const squared = yield* Atom.get(squaredAtom)
    return squared.reduce((sum, n) => sum + n, 0)
  })
)

function Results() {
  const numbers = useAtomValue(numbersAtom)
  const squared = useAtomValue(squaredAtom)
  const sum = useAtomValue(sumOfSquaresAtom)
  
  return (
    <div>
      <p>Numbers: {numbers.join(", ")}</p>
      <p>Squared: {squared.join(", ")}</p>
      <p>Sum of squares: {sum}</p>
    </div>
  )
}
\`\`\`

## Performance Characteristics

### Automatic Memoization

\`\`\`typescript
const expensiveAtom = Atom.fn(
  Effect.gen(function* () {
    const data = yield* Atom.get(dataAtom)
    
    // This expensive computation only runs when dataAtom changes
    return expensiveComputation(data)
  })
)
\`\`\`

- Derived atoms **cache** their computed value
- Recomputation only happens when **dependencies change**
- Multiple components can subscribe without redundant computation

### Dependency Tracking

\`\`\`typescript
const derivedAtom = Atom.fn(
  Effect.gen(function* () {
    const a = yield* Atom.get(atomA)
    const b = yield* Atom.get(atomB)
    
    // Automatically recomputes when atomA OR atomB changes
    // Does NOT recompute when atomC changes (not a dependency)
    return a + b
  })
)
\`\`\`

## Best Practices

### 1. Keep Derived Atoms Pure

\`\`\`typescript
// ✅ Good: Pure computation
const doubleAtom = Atom.fn(
  Effect.gen(function* () {
    const count = yield* Atom.get(countAtom)
    return count * 2
  })
)

// ❌ Bad: Side effects in derived atom
const badAtom = Atom.fn(
  Effect.gen(function* () {
    const count = yield* Atom.get(countAtom)
    console.log("Count:", count) // Side effect!
    return count * 2
  })
)
\`\`\`

### 2. Use Appropriate Granularity

\`\`\`typescript
// ✅ Good: One derived atom per concept
const activeCountAtom = Atom.fn(/* compute active count */)
const completedCountAtom = Atom.fn(/* compute completed count */)

// ❌ Less ideal: One giant derived atom
const allStatsAtom = Atom.fn(/* compute everything at once */)
\`\`\`

### 3. Avoid Circular Dependencies

\`\`\`typescript
// ❌ Circular dependency (will cause issues)
const atomA = Atom.fn(
  Effect.gen(function* () {
    const b = yield* Atom.get(atomB) // Depends on B
    return b + 1
  })
)

const atomB = Atom.fn(
  Effect.gen(function* () {
    const a = yield* Atom.get(atomA) // Depends on A - CIRCULAR!
    return a + 1
  })
)
\`\`\`

## When to Use Derived Atoms

**Use when**:
- Computing values from other atoms
- Filtering, mapping, or reducing data
- Validation or form state computation
- Complex calculations that should be memoized

**Don't use when**:
- Fetching data from APIs (use effectful atoms instead)
- Performing side effects (use \`useAtomSubscribe\`)
- Value doesn't depend on other atoms (use regular state)

## See Also

- \`Atom.fn\` - Creating derived atoms
- \`Atom.get\` - Reading atoms inside Effects
- \`useAtomValue\` - Subscribing to derived atoms
- \`effect://example/atom-react/effectful\` - Async atoms with services
    `,
  },
  {
    name: "atom-react-basic.md",
    content: `
# Basic atom-react Example

A simple counter application demonstrating fundamental atom-react concepts.

## Complete Example

\`\`\`typescript
import { Atom } from "@effect-atom/atom-react"
import { 
  useAtomValue, 
  useAtom, 
  RegistryProvider 
} from "@effect-atom/atom-react"
import React from "react"

// 1. Define atom
const countAtom = Atom.make(0)

// 2. Read-only component
function DisplayCount() {
  const count = useAtomValue(countAtom)
  return (
    <div className="display">
      <h2>Current Count: {count}</h2>
      <p>This component only reads the value</p>
    </div>
  )
}

// 3. Read-write component
function Controls() {
  const [count, setCount] = useAtom(countAtom)
  
  return (
    <div className="controls">
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
      <button onClick={() => setCount(count * 2)}>
        Double
      </button>
      <button onClick={() => setCount(0)}>
        Reset
      </button>
      <p>Current: {count}</p>
    </div>
  )
}

// 4. Multiple displays (stay synchronized)
function SecondaryDisplay() {
  const count = useAtomValue(countAtom)
  return <small>Also displaying: {count}</small>
}

// 5. App with registry provider
function App() {
  return (
    <RegistryProvider>
      <div className="app">
        <h1>atom-react Counter</h1>
        <DisplayCount />
        <Controls />
        <SecondaryDisplay />
      </div>
    </RegistryProvider>
  )
}

export default App
\`\`\`

## Key Concepts Demonstrated

### 1. Atom Definition

\`\`\`typescript
const countAtom = Atom.make(0)
\`\`\`

- **Atom.make** creates a writable atom
- Initial value: \`0\`
- Type is inferred: \`Atom<number>\`

### 2. Read-Only Access (useAtomValue)

\`\`\`typescript
const count = useAtomValue(countAtom)
\`\`\`

- **Subscribes** to atom changes
- **No ability to update** (read-only)
- **Re-renders** when atom value changes
- More efficient than \`useAtom\` if you don't need to update

### 3. Read-Write Access (useAtom)

\`\`\`typescript
const [count, setCount] = useAtom(countAtom)
\`\`\`

- **Returns tuple**: \`[value, setValue]\`
- Similar to React's \`useState\`
- Can **read and write** the atom
- **Re-renders** when atom value changes

### 4. Component Synchronization

All components subscribing to the same atom stay synchronized automatically:
- \`DisplayCount\` shows the value
- \`Controls\` shows and updates the value
- \`SecondaryDisplay\` shows the value

All update instantly when \`setCount\` is called.

### 5. Registry Provider

\`\`\`typescript
<RegistryProvider>
  <App />
</RegistryProvider>
\`\`\`

- **Required** wrapper for atom-react components
- Provides **atom registry** to component tree
- Stores and manages atom state

## Running This Example

### Installation

\`\`\`bash
npm install @effect-atom/atom @effect-atom/atom-react effect
\`\`\`

### File Structure

\`\`\`
src/
  App.tsx        # This example
  index.tsx      # Entry point
\`\`\`

### index.tsx

\`\`\`typescript
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
\`\`\`

## Variations

### With TypeScript Types

\`\`\`typescript
type Count = number

const countAtom: Atom<Count> = Atom.make<Count>(0)
\`\`\`

### With Multiple Atoms

\`\`\`typescript
const countAtom = Atom.make(0)
const stepAtom = Atom.make(1)

function Controls() {
  const [count, setCount] = useAtom(countAtom)
  const [step, setStep] = useAtom(stepAtom)
  
  return (
    <>
      <button onClick={() => setCount(count + step)}>
        Increment by {step}
      </button>
      <input 
        type="number" 
        value={step} 
        onChange={(e) => setStep(Number(e.target.value))}
      />
    </>
  )
}
\`\`\`

### With Derived State

\`\`\`typescript
import { Effect } from "effect"

const countAtom = Atom.make(0)

// Derived atom using Effect
const doubleAtom = Atom.fn(
  Effect.gen(function* () {
    const count = yield* Atom.get(countAtom)
    return count * 2
  })
)

function DisplayDouble() {
  const doubled = useAtomValue(doubleAtom)
  return <div>Doubled: {doubled}</div>
}
\`\`\`

### With Functional Updates

\`\`\`typescript
function Controls() {
  const [count, setCount] = useAtom(countAtom)
  
  return (
    <>
      {/* Functional update - safer for closures */}
      <button onClick={() => setCount((prev) => prev + 1)}>
        Increment
      </button>
      
      {/* Direct value update */}
      <button onClick={() => setCount(0)}>
        Reset
      </button>
    </>
  )
}
\`\`\`

## Architecture Patterns

### Separation of Concerns

\`\`\`typescript
// ✅ Good: Separate display from controls
function App() {
  return (
    <>
      <CountDisplay />  {/* Read-only */}
      <CountControls /> {/* Write-only or read-write */}
    </>
  )
}

// ❌ Less ideal: Everything in one component
function App() {
  const [count, setCount] = useAtom(countAtom)
  return (
    <div>
      <div>{count}</div>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}
\`\`\`

### Performance Optimization

\`\`\`typescript
// If a component only updates, use useAtomSet (no re-renders)
import { useAtomSet } from "@effect-atom/atom-react"

function IncrementButton() {
  const setCount = useAtomSet(countAtom)
  
  return (
    <button onClick={() => setCount((n) => n + 1)}>
      Increment
    </button>
  )
}
\`\`\`

## Common Patterns

### Multiple Atoms for Complex State

\`\`\`typescript
const nameAtom = Atom.make("")
const emailAtom = Atom.make("")
const ageAtom = Atom.make(0)

function UserForm() {
  const [name, setName] = useAtom(nameAtom)
  const [email, setEmail] = useAtom(emailAtom)
  const [age, setAge] = useAtom(ageAtom)
  
  const handleSubmit = () => {
    console.log({ name, email, age })
  }
  
  return <form>{/* inputs */}</form>
}
\`\`\`

### Shared State Across Components

\`\`\`typescript
// Component tree:
// App
//   ├─ Header (displays count)
//   ├─ Sidebar (displays count)
//   └─ Main (updates count)
//
// All three components stay synchronized automatically

const countAtom = Atom.make(0)

function Header() {
  const count = useAtomValue(countAtom)
  return <header>Count: {count}</header>
}

function Sidebar() {
  const count = useAtomValue(countAtom)
  return <aside>Total: {count}</aside>
}

function Main() {
  const [count, setCount] = useAtom(countAtom)
  return (
    <main>
      <button onClick={() => setCount(count + 1)}>+</button>
    </main>
  )
}

function App() {
  return (
    <RegistryProvider>
      <Header />
      <Sidebar />
      <Main />
    </RegistryProvider>
  )
}
\`\`\`

## Next Steps

After mastering this basic example:
1. See \`effect://example/atom-react/derived\` - Derived atoms with computed values
2. See \`effect://example/atom-react/effectful\` - Async atoms with Effect services
3. See \`effect://example/atom-react/optimistic\` - Optimistic updates pattern
4. See \`effect://guide/atom-react/testing\` - Testing atom-react components

## See Also

- \`useAtomValue\` - Hook reference
- \`useAtom\` - Hook reference
- \`Atom.make\` - Creating atoms
- \`RegistryProvider\` - Registry context
    `,
  },
  {
    name: "atom-react-services.md",
    content: `
# atom-react + Effect Services Integration

Complete guide for integrating Effect services with atom-react applications.

## Basic Integration

\`\`\`typescript
import { Atom } from "@effect-atom/atom-react"
import { RegistryProvider, useAtomValue } from "@effect-atom/atom-react"
import { Effect, ManagedRuntime, Layer } from "effect"
import React from "react"

// 1. Define service
export class UserService extends Effect.Service<UserService>()("UserService", {
  dependencies: [],
  
  scoped: Effect.gen(function* () {
    const getUser = Effect.fn("UserService.getUser")(function* (userId: number) {
      const user = yield* Effect.tryPromise(() =>
        fetch(\`/api/users/\${userId}\`).then((r) => r.json())
      )
      return user
    })
    
    return { getUser } as const
  }),
}) {}

// 2. Create effectful atom using service
const userIdAtom = Atom.make(1)

const userAtom = Atom.fn(
  Effect.gen(function* () {
    const userId = yield* Atom.get(userIdAtom)
    const userService = yield* UserService
    
    return yield* userService.getUser(userId)
  })
)

// 3. Provide runtime to RegistryProvider
function App() {
  const runtime = React.useMemo(
    () => ManagedRuntime.make(UserService.Default),
    []
  )
  
  return (
    <RegistryProvider runtime={runtime}>
      <React.Suspense fallback="Loading...">
        <UserProfile />
      </React.Suspense>
    </RegistryProvider>
  )
}

function UserProfile() {
  const user = useAtomValue(userAtom)
  return <div>{user.name}</div>
}
\`\`\`

## Multiple Services

\`\`\`typescript
export class PostService extends Effect.Service<PostService>()("PostService", {
  dependencies: [UserService.Default],
  
  scoped: Effect.gen(function* () {
    const userService = yield* UserService
    
    const getPosts = Effect.fn("PostService.getPosts")(function* (userId: number) {
      // Can use other services
      const user = yield* userService.getUser(userId)
      
      const posts = yield* Effect.tryPromise(() =>
        fetch(\`/api/users/\${user.id}/posts\`).then((r) => r.json())
      )
      
      return posts
    })
    
    return { getPosts } as const
  }),
}) {}

// Combine layers
const AppLayer = Layer.mergeAll(
  UserService.Default,
  PostService.Default
)

function App() {
  const runtime = React.useMemo(
    () => ManagedRuntime.make(AppLayer),
    []
  )
  
  return (
    <RegistryProvider runtime={runtime}>
      <UserProfile />
      <PostsList />
    </RegistryProvider>
  )
}
\`\`\`

## Service Lifecycle

\`\`\`typescript
export class DatabaseService extends Effect.Service<DatabaseService>()("DatabaseService", {
  dependencies: [],
  
  scoped: Effect.gen(function* () {
    // Setup: runs once when service is created
    const connection = yield* Effect.tryPromise(() => 
      connectToDatabase()
    )
    
    yield* Effect.logInfo("Database connected")
    
    // Cleanup: runs when runtime is disposed
    yield* Effect.addFinalizer(() =>
      Effect.gen(function* () {
        yield* Effect.tryPromise(() => connection.close())
        yield* Effect.logInfo("Database disconnected")
      })
    )
    
    const query = Effect.fn("DatabaseService.query")(function* (sql: string) {
      return yield* Effect.tryPromise(() => connection.query(sql))
    })
    
    return { query } as const
  }),
}) {}

function App() {
  const runtime = React.useMemo(
    () => ManagedRuntime.make(DatabaseService.Default),
    []
  )
  
  // Cleanup happens when component unmounts
  React.useEffect(() => {
    return () => {
      ManagedRuntime.dispose(runtime)
    }
  }, [runtime])
  
  return <RegistryProvider runtime={runtime}>{/* ... */}</RegistryProvider>
}
\`\`\`

## Error Boundaries

\`\`\`typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false, error: undefined }
  
  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error("Error boundary caught:", error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      )
    }
    
    return this.props.children
  }
}

function App() {
  return (
    <RegistryProvider runtime={runtime}>
      <ErrorBoundary>
        <React.Suspense fallback="Loading...">
          <UserProfile />
        </React.Suspense>
      </ErrorBoundary>
    </RegistryProvider>
  )
}
\`\`\`

## Service Configuration

\`\`\`typescript
interface Config {
  apiUrl: string
  timeout: number
}

export class ConfigService extends Effect.Service<ConfigService>()("ConfigService", {
  dependencies: [],
  
  scoped: Effect.gen(function* () {
    return {
      apiUrl: "https://api.example.com",
      timeout: 5000,
    } as const
  }),
}) {}

export class ApiService extends Effect.Service<ApiService>()("ApiService", {
  dependencies: [ConfigService.Default],
  
  scoped: Effect.gen(function* () {
    const config = yield* ConfigService
    
    const fetch = Effect.fn("ApiService.fetch")(function* (path: string) {
      const url = \`\${config.apiUrl}\${path}\`
      
      return yield* Effect.tryPromise({
        try: () => fetch(url).then((r) => r.json()),
        catch: (e) => new ApiError({ cause: e }),
      }).pipe(
        Effect.timeout(\`\${config.timeout} millis\`)
      )
    })
    
    return { fetch } as const
  }),
}) {}
\`\`\`

## Custom Runtime Context

\`\`\`typescript
// Create typed runtime context
const RuntimeContext = React.createContext<
  ManagedRuntime.ManagedRuntime<UserService | PostService, never>
>(null!)

function useRuntime() {
  const runtime = React.useContext(RuntimeContext)
  if (!runtime) {
    throw new Error("useRuntime must be used within RuntimeProvider")
  }
  return runtime
}

function RuntimeProvider({ children }: { children: React.ReactNode }) {
  const runtime = React.useMemo(
    () => ManagedRuntime.make(
      Layer.mergeAll(UserService.Default, PostService.Default)
    ),
    []
  )
  
  React.useEffect(() => {
    return () => ManagedRuntime.dispose(runtime)
  }, [runtime])
  
  return (
    <RuntimeContext.Provider value={runtime}>
      <RegistryProvider runtime={runtime}>
        {children}
      </RegistryProvider>
    </RuntimeContext.Provider>
  )
}

// Usage
function MyComponent() {
  const runtime = useRuntime()
  
  const handleAction = () => {
    ManagedRuntime.runPromise(runtime)(someEffect)
  }
  
  return <button onClick={handleAction}>Action</button>
}
\`\`\`

## Best Practices

### 1. Single Runtime per App

\`\`\`typescript
// ✅ Good: One runtime at app root
function App() {
  const runtime = React.useMemo(() => ManagedRuntime.make(AppLayer), [])
  
  return (
    <RegistryProvider runtime={runtime}>
      {/* all components */}
    </RegistryProvider>
  )
}

// ❌ Bad: Multiple runtimes
function ComponentA() {
  const runtime = ManagedRuntime.make(ServiceA.Default) // Don't do this
  return <div>{/* ... */}</div>
}
\`\`\`

### 2. Memoize Runtime

\`\`\`typescript
// ✅ Good
const runtime = React.useMemo(() => ManagedRuntime.make(layer), [])

// ❌ Bad - creates new runtime every render
const runtime = ManagedRuntime.make(layer)
\`\`\`

### 3. Cleanup Runtime

\`\`\`typescript
React.useEffect(() => {
  return () => {
    ManagedRuntime.dispose(runtime)
  }
}, [runtime])
\`\`\`

### 4. Use Effect.Service Pattern

\`\`\`typescript
// ✅ Good: Effect.Service class
export class UserService extends Effect.Service<UserService>()("UserService", {
  scoped: Effect.gen(function* () {
    const getUser = Effect.fn("UserService.getUser")(function* (id) {
      // ...
    })
    return { getUser } as const
  }),
}) {}

// ❌ Don't use Context.Tag directly for new services
export class UserService extends Context.Tag("UserService")<...>() {}
\`\`\`

## See Also

- \`ManagedRuntime\` - Effect runtime with resource management
- \`Effect.Service\` - Defining services
- \`Layer.mergeAll\` - Combining service layers
- \`effect://example/atom-react/effectful\` - Effectful atoms example
    `,
  },
] as const;
