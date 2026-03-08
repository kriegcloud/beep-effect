import { describe, expect, it } from "@effect/vitest"
import { DateTime, Effect } from "effect"
import { FileReadTracker } from "../src/tools/file/FileReadTracker.js"

const instant = (input: string) => DateTime.fromDateUnsafe(new Date(input))

describe("FileReadTracker", () => {
  it.effect("stores reads per scope and preserves isolation", () =>
    Effect.gen(function*() {
      const tracker = yield* FileReadTracker
      const sharedPath = "/workspace/file.txt"

      yield* tracker.recordRead("scope:a", {
        canonicalPath: sharedPath,
        stamp: { modTimeMs: 10, sizeBytes: 3 },
        readAt: instant("2026-02-28T00:00:00.000Z")
      })
      yield* tracker.recordRead("scope:b", {
        canonicalPath: sharedPath,
        stamp: { modTimeMs: 20, sizeBytes: 4 },
        readAt: instant("2026-02-28T00:01:00.000Z")
      })

      const scopeA = yield* tracker.getLastRead("scope:a", sharedPath)
      const scopeB = yield* tracker.getLastRead("scope:b", sharedPath)

      expect(scopeA?.stamp.modTimeMs).toBe(10)
      expect(scopeB?.stamp.modTimeMs).toBe(20)
    }).pipe(
      Effect.provide(FileReadTracker.layer)
    )
  )

  it.effect("overwrites existing read state for the same scope/path", () =>
    Effect.gen(function*() {
      const tracker = yield* FileReadTracker
      const targetPath = "/workspace/overwrite.txt"

      yield* tracker.recordRead("scope:a", {
        canonicalPath: targetPath,
        stamp: { modTimeMs: 1, sizeBytes: 1 },
        readAt: instant("2026-02-28T00:00:00.000Z")
      })
      yield* tracker.recordRead("scope:a", {
        canonicalPath: targetPath,
        stamp: { modTimeMs: 2, sizeBytes: 2 },
        readAt: instant("2026-02-28T00:02:00.000Z")
      })

      const current = yield* tracker.getLastRead("scope:a", targetPath)
      expect(current?.stamp.modTimeMs).toBe(2)
      expect(current?.stamp.sizeBytes).toBe(2)
    }).pipe(
      Effect.provide(FileReadTracker.layer)
    )
  )

  it.effect("clears state for one scope only", () =>
    Effect.gen(function*() {
      const tracker = yield* FileReadTracker
      const targetPath = "/workspace/clear.txt"

      yield* tracker.recordRead("scope:a", {
        canonicalPath: targetPath,
        stamp: { modTimeMs: 5, sizeBytes: 7 },
        readAt: instant("2026-02-28T00:05:00.000Z")
      })
      yield* tracker.recordRead("scope:b", {
        canonicalPath: targetPath,
        stamp: { modTimeMs: 6, sizeBytes: 8 },
        readAt: instant("2026-02-28T00:06:00.000Z")
      })

      yield* tracker.clearScope("scope:a")

      const scopeA = yield* tracker.getLastRead("scope:a", targetPath)
      const scopeB = yield* tracker.getLastRead("scope:b", targetPath)

      expect(scopeA).toBeNull()
      expect(scopeB?.stamp.modTimeMs).toBe(6)
    }).pipe(
      Effect.provide(FileReadTracker.layer)
    )
  )
})
