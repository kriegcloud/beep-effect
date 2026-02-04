import { FileSystem } from "@effect/platform"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { ExtractionCache, FileSystemExtractionCacheLive } from "../../src/Service/ExtractionCache.js"

const makeTestFS = (data: Map<string, string>) =>
  FileSystem.FileSystem.of({
    exists: (path) => Effect.succeed(data.has(path)),
    readFileString: (path) => Effect.succeed(data.get(path) ?? ""),
    writeFileString: (path, content) =>
      Effect.sync(() => {
        data.set(path, content)
      }),
    makeDirectory: () => Effect.void,
    remove: () => Effect.sync(() => data.clear()),

    // Stubs
    access: () => Effect.void,
    copy: () => Effect.void,
    copyFile: () => Effect.void,
    chmod: () => Effect.void,
    chown: () => Effect.void,
    link: () => Effect.void,
    open: () => Effect.die("Unimplemented"),
    readDirectory: () => Effect.succeed([]),
    readFile: () => Effect.die("Unimplemented"),
    realPath: (path) => Effect.succeed(path),
    rename: () => Effect.void,
    stat: () => Effect.die("Unimplemented"),
    symlink: () => Effect.void,
    truncate: () => Effect.void,
    utimes: () => Effect.void,
    writeFile: () => Effect.void,
    watch: () => Effect.die("Unimplemented"),
    makeTempDirectory: () => Effect.die("Unimplemented"),
    makeTempDirectoryScoped: () => Effect.die("Unimplemented"),
    makeTempFile: () => Effect.die("Unimplemented"),
    makeTempFileScoped: () => Effect.die("Unimplemented"),
    readLink: () => Effect.die("Unimplemented"),
    sink: () => Effect.die("Unimplemented"),
    stream: () => Effect.die("Unimplemented")
  })

describe("Extraction Cache", () => {
  it.effect("writes and reads back results", () =>
    Effect.gen(function*() {
      const cache = yield* ExtractionCache
      const key = "test-key"
      const result = {
        entities: [],
        relations: [],
        metadata: {
          computedAt: "2024-01-01T00:00:00.000Z",
          model: "test",
          temperature: 0,
          computedIn: 100
        }
      }

      // Write
      yield* cache.set(key, result)

      // Read
      const cached = yield* cache.get(key)
      expect(cached).toEqual(result)
    }).pipe(
      Effect.provide(FileSystemExtractionCacheLive("/tmp/test-cache")),
      Effect.provide(Layer.succeed(FileSystem.FileSystem, makeTestFS(new Map())))
    ))

  it.effect("returns null for miss", () =>
    Effect.gen(function*() {
      const cache = yield* ExtractionCache
      const result = yield* cache.get("non-existent")
      expect(result).toBeNull()
    }).pipe(
      Effect.provide(FileSystemExtractionCacheLive("/tmp/test-cache")),
      Effect.provide(Layer.succeed(FileSystem.FileSystem, makeTestFS(new Map())))
    ))
})
