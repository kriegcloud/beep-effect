import * as Cause from "effect/Cause"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"

export interface PlaygroundHeader {
  readonly icon: string
  readonly moduleImportPath: string
  readonly exportName: string
  readonly exportKind: string
}

export interface PlaygroundExample {
  readonly title: string
  readonly description: string
  readonly run: Effect.Effect<void, unknown>
}

export interface PlaygroundProgramOptions extends PlaygroundHeader {
  readonly summary: string
  readonly sourceExample: string
  readonly bunContext: { readonly layer?: unknown }
  readonly examples: ReadonlyArray<PlaygroundExample>
}

export type AttemptResult<A> =
  | { readonly _tag: "Right"; readonly value: A }
  | { readonly _tag: "Left"; readonly error: unknown }

const separator = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

const toDisplayString = (value: unknown): string => {
  try {
    return String(value)
  } catch {
    return "<?>"
  }
}

export const formatUnknown = (value: unknown): string => {
  try {
    if (value === undefined) {
      return "undefined"
    }
    if (typeof value === "function") {
      const source = value.toString().replace(/\s+/g, " ").slice(0, 220)
      const suffix = value.toString().length > 220 ? "..." : ""
      const name = value.name.length === 0 ? "anonymous" : value.name
      return `[Function ${name}] ${source}${suffix}`
    }
    if (typeof value === "string") {
      return value
    }
    return JSON.stringify(value, null, 2)
  } catch {
    return toDisplayString(value)
  }
}

export const readNamedExport = (
  moduleRecord: Record<string, unknown>,
  exportName: string
): unknown => moduleRecord[exportName]

export const logHeader = ({
  icon,
  moduleImportPath,
  exportName,
  exportKind
}: PlaygroundHeader): Effect.Effect<void> =>
  Effect.gen(function* () {
    yield* Console.log(`\n${separator}`)
    yield* Console.log(`${icon} ${moduleImportPath}.${exportName}`)
    yield* Console.log(`Kind: ${exportKind}`)
    yield* Console.log(separator)
  })

export const logSummary = (summary: string): Effect.Effect<void> =>
  Console.log(`\n📝 Overview\n${summary}`)

export const logSourceExample = (sourceExample: string): Effect.Effect<void> =>
  sourceExample.length === 0
    ? Console.log("\n📚 Source JSDoc Example\n(no inline example found)")
    : Console.log(`\n📚 Source JSDoc Example\n${sourceExample}`)

export const logBunContextLayer = (
  bunContext: { readonly layer?: unknown }
): Effect.Effect<void> =>
  Console.log(`\n🧱 BunContext layer detected: ${toDisplayString("layer" in bunContext)}`)

export const logCompletion = (
  moduleImportPath: string,
  exportName: string
): Effect.Effect<void> =>
  Console.log(`\n✅ Demo complete for ${moduleImportPath}.${exportName}`)

export const logExampleHeader = (
  index: number,
  title: string,
  description: string
): Effect.Effect<void> =>
  Effect.gen(function* () {
    yield* Console.log(`\n${separator}`)
    yield* Console.log(`📘 Example ${index}: ${title}`)
    yield* Console.log(`🧭 ${description}`)
    yield* Console.log(separator)
  })

export const runExamples = (
  examples: ReadonlyArray<PlaygroundExample>
): Effect.Effect<void> =>
  Effect.gen(function* () {
    for (let index = 0; index < examples.length; index++) {
      const example = examples[index]
      if (example === undefined) {
        continue
      }

      yield* logExampleHeader(index + 1, example.title, example.description)

      const exit = yield* Effect.exit(example.run)
      if (exit._tag === "Success") {
        yield* Console.log("✅ Example completed")
      } else {
        yield* Console.log("⚠️ Example failed (continuing)")
        yield* Console.log(Cause.pretty(exit.cause))
      }
    }
  })

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

export const inspectNamedExport = (params: {
  readonly moduleRecord: Record<string, unknown>
  readonly exportName: string
}): Effect.Effect<void> =>
  Effect.gen(function* () {
    const moduleKeys = Object.keys(params.moduleRecord)
    const target = readNamedExport(params.moduleRecord, params.exportName)

    yield* Console.log(`📦 Module export count: ${moduleKeys.length}`)
    yield* Console.log(`🔬 Runtime typeof target: ${typeof target}`)
    yield* Console.log(`📄 Runtime preview:\n${formatUnknown(target)}`)
  })

export const probeNamedExportFunction = (params: {
  readonly moduleRecord: Record<string, unknown>
  readonly exportName: string
}): Effect.Effect<void> =>
  Effect.gen(function* () {
    const target = readNamedExport(params.moduleRecord, params.exportName)
    if (typeof target !== "function") {
      return yield* Console.log("ℹ️ Target is not callable; skipped invocation probe.")
    }

    const invocation = yield* attemptThunk(() => (target as (...args: ReadonlyArray<unknown>) => unknown)())
    if (invocation._tag === "Right") {
      yield* Console.log(`✅ Invocation succeeded:\n${formatUnknown(invocation.value)}`)
    } else {
      yield* Console.log("ℹ️ Invocation failed (often expected for parameterized APIs).")
      yield* Console.log(`   ${toDisplayString(invocation.error)}`)
    }
  })

export const probeNamedExportConstructor = (params: {
  readonly moduleRecord: Record<string, unknown>
  readonly exportName: string
}): Effect.Effect<void> =>
  Effect.gen(function* () {
    const target = readNamedExport(params.moduleRecord, params.exportName)
    if (typeof target !== "function") {
      return yield* Console.log("ℹ️ Target is not constructable; skipped constructor probe.")
    }

    const constructor = target as (...args: ReadonlyArray<unknown>) => unknown
    const construction = yield* attemptThunk(() => Reflect.construct(constructor, []))
    if (construction._tag === "Right") {
      yield* Console.log(`✅ Construction succeeded:\n${formatUnknown(construction.value)}`)
    } else {
      yield* Console.log("ℹ️ Construction failed (often expected when args are required).")
      yield* Console.log(`   ${toDisplayString(construction.error)}`)
    }
  })

export const inspectTypeLikeExport = (params: {
  readonly moduleRecord: Record<string, unknown>
  readonly exportName: string
}): Effect.Effect<void> =>
  Effect.gen(function* () {
    const keys = Object.keys(params.moduleRecord)
    const appearsAtRuntime = keys.includes(params.exportName)
    const preview = keys.slice(0, 12).join(", ")

    yield* Console.log(`📦 Runtime export count: ${keys.length}`)
    yield* Console.log(`🧬 Type exports are erased at runtime.`)
    yield* Console.log(`🔍 "${params.exportName}" visible at runtime: ${appearsAtRuntime ? "yes" : "no"}`)
    yield* Console.log(`📚 Sample runtime keys: ${preview.length === 0 ? "(none)" : preview}`)
  })

export const createPlaygroundProgram = (
  options: PlaygroundProgramOptions
): Effect.Effect<void> =>
  Effect.gen(function* () {
    yield* logHeader(options)
    yield* logSummary(options.summary)
    yield* logSourceExample(options.sourceExample)
    yield* runExamples(options.examples)
    yield* logBunContextLayer(options.bunContext)
    yield* logCompletion(options.moduleImportPath, options.exportName)
  }).pipe(reportProgramError)

export const reportProgramError = <A, E, R>(
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R> =>
  effect.pipe(
    Effect.catch((error) =>
      Effect.gen(function* () {
        const msg = toDisplayString(error)
        yield* Console.log(`\n💥 Program failed: ${msg}`)
        const cause = Cause.fail(error)
        yield* Console.log(`\n🔍 Error details: ${Cause.pretty(cause)}`)
        return yield* Effect.fail(error)
      })
    )
  )
