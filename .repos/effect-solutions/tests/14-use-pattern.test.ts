import { describe, it } from "@effect/vitest"
import { assertTrue, strictEqual } from "@effect/vitest/utils"
import { Effect, Either, Layer, pipe, Schema } from "effect"

describe("14-use-pattern", () => {
  class FileSystemError extends Schema.TaggedError<FileSystemError>()("FileSystemError", {
    cause: Schema.optional(Schema.Unknown),
  }) {}

  interface MockFs {
    readFile: (path: string) => Promise<string>
    writeFile: (path: string, content: string) => Promise<void>
    readdir: (path: string) => Promise<string[]>
  }

  const createMockFs = () => {
    const files = new Map<string, string>([
      ["config.json", '{"port": 3000}'],
      ["data.txt", "hello world"],
    ])

    return {
      readFile: async (path: string) => {
        const content = files.get(path)
        if (!content) throw new Error(`ENOENT: ${path}`)
        return content
      },
      writeFile: async (path: string, content: string) => {
        files.set(path, content)
      },
      readdir: async () => Array.from(files.keys()),
    } satisfies MockFs
  }

  class FileSystem extends Effect.Service<FileSystem>()("FileSystem", {
    effect: Effect.gen(function* () {
      const mockFs = createMockFs()

      const use = <A>(fn: (fs: MockFs, signal: AbortSignal) => Promise<A>): Effect.Effect<A, FileSystemError> =>
        Effect.tryPromise({
          try: (signal) => fn(mockFs, signal),
          catch: (cause) => new FileSystemError({ cause }),
        })

      return { use } as const
    }),
  }) {
    static readonly Test = Layer.succeed(
      FileSystem,
      FileSystem.make({
        use: (fn) => {
          const mockFs = createMockFs()

          return Effect.tryPromise({
            try: (signal) => fn(mockFs, signal),
            catch: (cause) => new FileSystemError({ cause }),
          })
        },
      }),
    )
  }

  describe("use pattern", () => {
    it.effect("wraps Promise-based APIs in Effect", () =>
      pipe(
        Effect.gen(function* () {
          const fileSystem = yield* FileSystem

          const content = yield* fileSystem.use((fs) => fs.readFile("config.json"))

          strictEqual(content, '{"port": 3000}')
        }),
        Effect.provide(FileSystem.Default),
      ),
    )

    it.effect("provides AbortSignal for cancellation support", () =>
      pipe(
        Effect.gen(function* () {
          const fileSystem = yield* FileSystem

          let signalReceived = false

          const content = yield* fileSystem.use(async (fs, signal) => {
            signalReceived = signal instanceof AbortSignal

            return fs.readFile("data.txt")
          })

          assertTrue(signalReceived)
          strictEqual(content, "hello world")
        }),
        Effect.provide(FileSystem.Default),
      ),
    )

    it.effect("wraps errors in tagged error type", () =>
      pipe(
        Effect.gen(function* () {
          const fileSystem = yield* FileSystem

          const result = yield* pipe(
            fileSystem.use((fs) => fs.readFile("nonexistent.txt")),
            Effect.either,
          )

          assertTrue(Either.isLeft(result))

          if (Either.isLeft(result)) {
            strictEqual(result.left._tag, "FileSystemError")
          }
        }),
        Effect.provide(FileSystem.Default),
      ),
    )

    it.effect("supports write operations", () =>
      pipe(
        Effect.gen(function* () {
          const fileSystem = yield* FileSystem

          yield* fileSystem.use((fs) => fs.writeFile("new-file.txt", "new content"))

          const content = yield* fileSystem.use((fs) => fs.readFile("new-file.txt"))

          strictEqual(content, "new content")
        }),
        Effect.provide(FileSystem.Default),
      ),
    )
  })

  describe("Test layer", () => {
    it.effect("uses test layer with in-memory storage", () =>
      pipe(
        Effect.gen(function* () {
          const fileSystem = yield* FileSystem

          const content = yield* fileSystem.use((fs) => fs.readFile("config.json"))

          strictEqual(content, '{"port": 3000}')
        }),
        Effect.provide(FileSystem.Test),
      ),
    )
  })
})
