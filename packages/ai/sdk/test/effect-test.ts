import * as Cause from "effect/Cause"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as Fiber from "effect/Fiber"
import * as Logger from "effect/Logger"
import * as TestContext from "effect/TestContext"
import * as TestServices from "effect/TestServices"

const testLayers = [
  TestContext.TestContext,
  Logger.remove(Logger.defaultLogger)
] as const

export const runEffect = <A, E>(effect: Effect.Effect<A, E>) =>
  Effect.runPromise(
    Effect.gen(function*() {
      const exitFiber = yield* Effect.fork(Effect.exit(effect))
      const exit = yield* Fiber.join(exitFiber)
      if (Exit.isSuccess(exit)) return exit.value
      if (Cause.isInterruptedOnly(exit.cause)) {
        return yield* Effect.die(new Error("All fibers interrupted without errors."))
      }
      const errors = Cause.prettyErrors(exit.cause)
      for (let i = 1; i < errors.length; i++) {
        yield* Effect.logError(errors[i])
      }
      return yield* Effect.die(errors[0])
    }).pipe(Effect.provide(testLayers))
  )

export const runEffectLive = <A, E>(effect: Effect.Effect<A, E>) =>
  runEffect(TestServices.provideLive(effect))
