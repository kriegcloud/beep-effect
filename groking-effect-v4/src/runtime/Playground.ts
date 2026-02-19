import * as Cause from "effect/Cause"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"

export interface PlaygroundHeader {
  readonly icon: string
  readonly moduleImportPath: string
  readonly exportName: string
  readonly exportKind: string
}

export type AttemptResult<A> =
  | { readonly _tag: "Right"; readonly value: A }
  | { readonly _tag: "Left"; readonly error: unknown }

export const formatUnknown = (value: unknown): string => {
  try {
    if (typeof value === "string") {
      return value
    }
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export const logHeader = ({
  icon,
  moduleImportPath,
  exportName,
  exportKind
}: PlaygroundHeader): Effect.Effect<void> =>
  Effect.gen(function* () {
    yield* Console.log("\n┌────────────────────────────────────────────────────────────┐")
    yield* Console.log(`│ ${icon} ${moduleImportPath}.${exportName} (${exportKind})`)
    yield* Console.log("└────────────────────────────────────────────────────────────┘")
  })

export const logSummary = (summary: string): Effect.Effect<void> =>
  Console.log(`\n📝 ${summary}`)

export const logSourceExample = (sourceExample: string): Effect.Effect<void> =>
  sourceExample.length === 0
    ? Effect.void
    : Console.log(`\n📚 Source example:\n${sourceExample}`)

export const logBunContextLayer = (
  bunContext: { readonly layer?: unknown }
): Effect.Effect<void> =>
  Console.log(`🧱 BunContext layer detected: ${String("layer" in bunContext)}`)

export const logCompletion = (
  moduleImportPath: string,
  exportName: string
): Effect.Effect<void> =>
  Console.log(`\n✅ Demo complete for ${moduleImportPath}.${exportName}`)

export const attemptThunk = <A>(
  thunk: () => A
): Effect.Effect<AttemptResult<A>> =>
  Effect.try({
    try: thunk,
    catch: (error) => error
  }).pipe(
    Effect.map((value) => ({ _tag: "Right" as const, value })),
    Effect.catch((error) =>
      Effect.succeed({ _tag: "Left" as const, error })
    )
  )

export const reportProgramError = <A, E, R>(
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R> =>
  effect.pipe(
    Effect.catch((error) =>
      Effect.gen(function* () {
        const msg = String(error)
        yield* Console.log(`\n💥 Program failed: ${msg}`)
        const cause = Cause.fail(error)
        yield* Console.log(`\n🔍 Error details: ${Cause.pretty(cause)}`)
        return yield* Effect.fail(error)
      })
    )
  )
