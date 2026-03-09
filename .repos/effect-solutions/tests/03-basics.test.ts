import { describe, it } from "@effect/vitest"
import { strictEqual } from "@effect/vitest/utils"
import { Effect, Fiber, Schedule, TestClock } from "effect"

describe("03-basics", () => {
  describe("Effect.gen", () => {
    it.effect("sequences effects with yield*", () =>
      Effect.gen(function* () {
        const fetchData = Effect.succeed("raw data")
        const processData = (data: string) => Effect.succeed(data.toUpperCase())

        const program = Effect.gen(function* () {
          const data = yield* fetchData
          yield* Effect.logInfo(`Processing data: ${data}`)
          return yield* processData(data)
        })

        const result = yield* program
        strictEqual(result, "RAW DATA")
      }),
    )

    it.effect("handles multiple yields", () =>
      Effect.gen(function* () {
        const step1 = Effect.succeed(1)
        const step2 = Effect.succeed(2)
        const step3 = Effect.succeed(3)

        const program = Effect.gen(function* () {
          const a = yield* step1
          const b = yield* step2
          const c = yield* step3
          return a + b + c
        })

        const result = yield* program
        strictEqual(result, 6)
      }),
    )
  })

  describe("Effect.fn", () => {
    it.effect("creates named effects with tracing", () =>
      Effect.gen(function* () {
        interface User {
          id: string
          name: string
        }

        const getUser = (_userId: string): Effect.Effect<User> => Effect.succeed({ id: "123", name: "Alice" })

        const processData = (user: User): Effect.Effect<User> =>
          Effect.succeed({ ...user, name: user.name.toUpperCase() })

        const processUser = Effect.fn("processUser")(function* (userId: string) {
          yield* Effect.logInfo(`Processing user ${userId}`)
          const user = yield* getUser(userId)
          return yield* processData(user)
        })

        const result = yield* processUser("123")
        strictEqual(result.name, "ALICE")
        strictEqual(result.id, "123")
      }),
    )

    it.effect("works with parameters", () =>
      Effect.gen(function* () {
        const multiply = Effect.fn("multiply")(function* (a: number, b: number) {
          yield* Effect.logDebug(`Multiplying ${a} * ${b}`)
          return a * b
        })

        const result = yield* multiply(5, 6)
        strictEqual(result, 30)
      }),
    )

    it.effect("preserves effect semantics", () =>
      Effect.gen(function* () {
        const fetchAndDouble = Effect.fn("fetchAndDouble")(function* (value: number) {
          const data = yield* Effect.succeed(value)
          return data * 2
        })

        const result = yield* fetchAndDouble(21)
        strictEqual(result, 42)
      }),
    )
  })

  describe("Effect.gen vs Effect.fn", () => {
    it.effect("Effect.gen for inline programs", () =>
      Effect.gen(function* () {
        // Use Effect.gen for one-off programs
        const program = Effect.gen(function* () {
          const x = yield* Effect.succeed(10)
          const y = yield* Effect.succeed(20)
          return x + y
        })

        const result = yield* program
        strictEqual(result, 30)
      }),
    )

    it.effect("Effect.fn for reusable named functions", () =>
      Effect.gen(function* () {
        // Use Effect.fn for reusable functions with tracing
        const add = Effect.fn("add")(function* (a: number, b: number) {
          yield* Effect.logDebug(`Adding ${a} + ${b}`)
          return a + b
        })

        const result1 = yield* add(5, 10)
        const result2 = yield* add(3, 7)

        strictEqual(result1, 15)
        strictEqual(result2, 10)
      }),
    )
  })

  describe("Pipe for Instrumentation", () => {
    it.effect("adds timeout to effects", () =>
      Effect.gen(function* () {
        const fast = Effect.succeed("done").pipe(Effect.timeout("1 second"))
        const result = yield* fast
        strictEqual(result, "done")
      }),
    )

    it.effect("adds tap for side effects", () =>
      Effect.gen(function* () {
        let logged = false
        const program = Effect.succeed(42).pipe(
          // biome-ignore lint/suspicious/noAssignInExpressions: test side effect
          Effect.tap(() => Effect.sync(() => (logged = true))),
        )
        const result = yield* program
        strictEqual(result, 42)
        strictEqual(logged, true)
      }),
    )

    it.effect("chains multiple instrumentations", () =>
      Effect.gen(function* () {
        const program = Effect.succeed("data").pipe(
          Effect.tap((data) => Effect.logInfo(`Got: ${data}`)),
          Effect.timeout("5 seconds"),
          Effect.withSpan("myOperation"),
        )
        const result = yield* program
        strictEqual(result, "data")
      }),
    )
  })

  describe("Retry and Timeout", () => {
    it.effect("retries on failure with schedule", () =>
      Effect.gen(function* () {
        let attempts = 0
        const flaky = Effect.suspend(() => {
          attempts++
          if (attempts < 3) return Effect.fail("fail" as const)
          return Effect.succeed("success")
        })

        const retryPolicy = Schedule.recurs(5)
        const result = yield* flaky.pipe(Effect.retry(retryPolicy))

        strictEqual(result, "success")
        strictEqual(attempts, 3)
      }),
    )

    it.effect("exponential backoff with max retries", () =>
      Effect.gen(function* () {
        let attempts = 0
        const flaky = Effect.suspend(() => {
          attempts++
          if (attempts < 2) return Effect.fail("fail" as const)
          return Effect.succeed("ok")
        })

        const retryPolicy = Schedule.exponential("1 millis").pipe(Schedule.compose(Schedule.recurs(3)))

        const fiber = yield* flaky.pipe(Effect.retry(retryPolicy), Effect.fork)
        yield* TestClock.adjust("100 millis")
        const result = yield* Fiber.join(fiber)

        strictEqual(result, "ok")
        strictEqual(attempts, 2)
      }),
    )

    it.effect("timeoutFail fails slow effects", () =>
      Effect.gen(function* () {
        const slow = Effect.sleep("1 second").pipe(
          Effect.as("done"),
          Effect.timeoutFail({
            duration: "10 millis",
            onTimeout: () => "timeout" as const,
          }),
        )

        const fiber = yield* slow.pipe(Effect.either, Effect.fork)
        yield* TestClock.adjust("20 millis")
        const result = yield* Fiber.join(fiber)

        strictEqual(result._tag, "Left")
      }),
    )
  })
})
