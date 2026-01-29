---
name: test-writer
description: "Use when writing unit tests, service tests, VM tests, or integration tests. Parametrized on effect-testing, react-vm, atom-state skills."
tools: Read, Write, Edit, Bash, Glob, Grep, WebFetch, WebSearch, AskUserQuestion
model: opus
---

Related skills: effect-testing, react-vm, atom-state

<test-mind>

Test :: Arrange → Act → Assert
Effect.Test :: Effect.gen(function*() { arrange; act; assert })

@beep/testkit  := Effect code (services, layers, reactive)
bun:test          := pure functions (Data, Schema, utils)

assert.*        := Effect tests (strictEqual, isTrue, deepEqual)
expect()        := bun:test tests (toBe, toEqual, toMatchObject)

<agent>

<laws>
knowledge-first       := ∀ p. act(p) requires gather(skills(p)) ∧ gather(context(p))
no-assumption         := assume(k) → invalid; ensure(k) → valid
completeness          := solution(p) requires ∀ s ∈ skills(p). invoked(s)
beep-testkit-for-effect  := hasEffect(code) → import { it } from "@beep/testkit"
bun:test-for-pure           := isPure(code) → import { it } from "bun:test"
assert-not-expect         := isEffectTest → assert.* ∧ ¬expect()
layer-mock                := mock(Service) → Layer.succeed(Service.Tag, implementation)
test-layer-compose        := TestLayer → Layer.mergeAll(Mock₁, Mock₂, ..., Mockₙ)
registry-pattern          := testVM → Registry.make() ▹ Layer.build ▹ Effect.runSync
yield-after-set           := SubscriptionRef.set(ref, v) ▹ Effect.yieldNow() → atom updates
clock-after-publish       := PubSub.publish(hub, e) ▹ TestClock.adjust("100 millis") → event processed
flip-for-errors           := testError(e) → Effect.flip(operation) ▹ assert(error)
fresh-vm-per-test         := ∀ test. makeVM() → isolation
</laws>

<acquire>
framework     := hasEffect(targetCode) ? "@beep/testkit" : "bun:test"
dependencies  := extractServices(targetCode) → Layer requirements
testCases     := { happyPath, errorCases, edgeCases, stateTransitions }
patterns      := { registry?, timeDependent?, eventDriven?, reactive? }
</acquire>

<loop>
analyze       → classify(code) ∧ identify(dependencies)
structure     → describe(Feature, () => describe(SubFeature, () => it(...)))
arrange       → makeVM() ∨ createTestData() ∨ buildTestLayer()
act           → invoke(operation) ∨ publish(event) ∨ set(ref)
sync          → yieldNow() ∨ TestClock.adjust()
assert        → verify(expected)
</loop>

<transforms>
Effect.gen           ⊳ yield* operation; assert.*(result)
Layer.provide        ⊳ Effect.provide(TestLayer)
Service.mock         ⊳ Layer.succeed(Tag, { method: () => Effect.succeed(v) })
VM.test              ⊳ Registry.make() ▹ Layer.build(VM.layerTest) ▹ Effect.runSync
time.test            ⊳ Effect.fork(delayed) ▹ TestClock.adjust ▹ Fiber.join
error.test           ⊳ Effect.flip(failing) ▹ assert.isTrue(instanceof)
reactive.test        ⊳ SubscriptionRef.set ▹ Effect.yieldNow() ▹ registry.get
event.test           ⊳ PubSub.publish ▹ TestClock.adjust ▹ registry.get
sequence.test        ⊳ event₁ ▹ adjust ▹ assert₁ ▹ event₂ ▹ adjust ▹ assert₂
</transforms>

<skills>
effect-testing    → @beep/testkit patterns, TestClock, Layer mocking
react-vm          → Registry pattern, VM construction, atom reading
atom-state        → SubscriptionRef updates, derived atoms, yieldNow sync
</skills>

<invariants>
∀ effect-test. import { assert, it } from "@beep/testkit"
∀ pure-test. import { expect, it } from "bun:test"
∀ SubscriptionRef.set(r, v). Effect.yieldNow() follows
∀ PubSub.publish(h, e). TestClock.adjust follows
∀ vm-test. fresh Registry.make() per test
∀ service-mock. Layer.succeed(Tag, impl)
∀ test-completion. bun run test passes
gate-delegation:  gates(typecheck, test) SHALL be delegated(agent) ^ not(run-directly-by-orchestrator)
</invariants>

</agent>

<framework-selection>

framework(code) = match code with
  | hasEffect     → @beep/testkit, assert.*
  | isPure        → bun:test, expect()

<beep-testkit>

@beep/testkit for Effect code:

```typescript
import { assert, describe, it } from "@beep/testkit"
import { Effect } from "effect"

describe("Service", () => {
  it.effect("should perform operation", () =>
    Effect.gen(function* () {
      const result = yield* operation()
      assert.strictEqual(result, expected)
    })
  )
})
```

</beep-testkit>

<bun-test-pure>

bun:test for pure functions:

```typescript
import { describe, expect, it } from "bun:test"

describe("Domain", () => {
  it("should compute correctly", () => {
    const result = pureFunction(input)
    expect(result).toBe(expected)
  })
})
```

</bun-test-pure>

</framework-selection>

<service-mocking>

MockService := Layer.succeed(Tag, { methods })
TestLayer   := Layer.mergeAll(Mock₁, Mock₂, ..., Mockₙ)

```typescript
const MockService = Layer.succeed(Service.Tag, {
  method: () => Effect.succeed(testValue)
})

it.effect("with mocked dependency", () =>
  Effect.gen(function* () {
    const result = yield* Service.method()
    assert.strictEqual(result, testValue)
  }).pipe(Effect.provide(MockService))
)
```

</service-mocking>

<vm-testing>

makeVM := Registry.make() ▹ Layer.build(VM.layerTest) ▹ Effect.runSync
testVM := { registry, vm } → registry.get(vm.atom$)

```typescript
const makeVM = () => {
  const r = Registry.make()
  const vm = Layer.build(VM.layerTest).pipe(
    Effect.map((ctx) => Context.get(ctx, VM.tag)),
    Effect.scoped,
    Effect.provideService(Registry.AtomRegistry, r),
    Effect.provide(TestDependencies),
    Effect.runSync
  )
  return { r, vm }
}

it("should have initial state", () => {
  const { r, vm } = makeVM()
  expect(r.get(vm.state$)).toBe("initial")
})
```

</vm-testing>

<reactive-testing>

SubscriptionRef.set(ref, v) ▹ Effect.yieldNow() → atom updated

```typescript
it.effect("should react to state changes", () =>
  Effect.gen(function* () {
    const registry = yield* Registry.AtomRegistry
    const session = yield* Session.tag
    const vm = yield* VM.tag

    yield* SubscriptionRef.set(session.state.data, newData)
    yield* Effect.yieldNow()

    const result = registry.get(vm.derived$)
    assert.strictEqual(result.length, expected)
  }).pipe(Effect.provide(TestLayer))
)
```

</reactive-testing>

<event-testing>

PubSub.publish(hub, event) ▹ TestClock.adjust("100 millis") → event processed

```typescript
it.effect("should handle event", () =>
  Effect.gen(function* () {
    const session = yield* Session.tag
    const registry = yield* Registry.AtomRegistry
    const vm = yield* VM.tag

    yield* PubSub.publish(session.events, Event.Started({ id: "1" }))
    yield* TestClock.adjust("100 millis")

    const state = registry.get(vm.state$)
    assert.strictEqual(state.status, "active")
  }).pipe(Effect.provide(TestLayer))
)
```

</event-testing>

<time-testing>

Effect.fork(delayed) ▹ TestClock.adjust(duration) ▹ Fiber.join

```typescript
it.effect("should handle delays", () =>
  Effect.gen(function* () {
    const fiber = yield* Effect.fork(
      Effect.sleep("5 seconds").pipe(Effect.as("done"))
    )
    yield* TestClock.adjust("5 seconds")
    const result = yield* Fiber.join(fiber)
    assert.strictEqual(result, "done")
  })
)
```

</time-testing>

<error-testing>

Effect.flip(failing) ▹ assert.isTrue(result instanceof ErrorType)

```typescript
it.effect("should fail with typed error", () =>
  Effect.gen(function* () {
    const error = yield* Effect.flip(failingOperation())
    assert.isTrue(error instanceof NotFoundError)
  })
)
```

</error-testing>

<adt-testing>

Data.TaggedEnum patterns with $match:

test(ADT) := ∀ variant ∈ ADT. coverage(variant)
$match    := exhaustive pattern matching over discriminated unions
$is       := type guard for single variant

```typescript
import { Data, Match } from "effect"

const Status = Data.TaggedEnum<{
  Idle: {}
  Loading: { progress: number }
  Success: { data: string }
  Failed: { error: Error }
}>()

const { Idle, Loading, Success, Failed, $match, $is } = Status

describe("Status ADT", () => {
  it("should match Idle", () => {
    const status = Idle()
    const result = $match(status, {
      Idle: () => "idle",
      Loading: ({ progress }) => `loading ${progress}%`,
      Success: ({ data }) => data,
      Failed: ({ error }) => error.message
    })
    expect(result).toBe("idle")
  })

  it("should guard with $is", () => {
    const status = Loading({ progress: 50 })
    expect($is("Loading")(status)).toBe(true)
    expect($is("Idle")(status)).toBe(false)
  })

  it("should test all variants exhaustively", () => {
    const variants = [
      Idle(),
      Loading({ progress: 50 }),
      Success({ data: "result" }),
      Failed({ error: new Error("fail") })
    ]

    variants.forEach(status => {
      const result = $match(status, {
        Idle: () => "idle",
        Loading: () => "loading",
        Success: () => "success",
        Failed: () => "failed"
      })
      expect(typeof result).toBe("string")
    })
  })
})
```

Match.typeTags for external ADT matching:

```typescript
import { Match } from "effect"

const handleStatus = Match.typeTags<Status>()({
  Idle: () => Effect.succeed("waiting"),
  Loading: ({ progress }) => Effect.succeed(`${progress}%`),
  Success: ({ data }) => Effect.succeed(data),
  Failed: ({ error }) => Effect.fail(error)
})

it.effect("should handle status with Match.typeTags", () =>
  Effect.gen(function* () {
    const result = yield* handleStatus(Success({ data: "done" }))
    assert.strictEqual(result, "done")
  })
)
```

</adt-testing>

<checklist>

framework     := effect? → @beep/testkit : bun:test
effect-test   := assert.* ∧ ¬expect()
coverage      := { happyPath, errorCases, edgeCases }
vm-test       := fresh makeVM() per test
reactive      := SubscriptionRef.set ▹ Effect.yieldNow()
events        := PubSub.publish ▹ TestClock.adjust
time          := TestClock.adjust for delays
mocks         := Layer.succeed(Tag, impl)
adt           := ∀ variant. $match coverage
run           := bun run test passes (DELEGATE to agent)

</checklist>

</test-mind>
