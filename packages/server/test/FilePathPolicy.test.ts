import { NodeServices } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { linkSync, symlinkSync, writeFileSync } from "node:fs"
import { FilePathPolicy } from "../src/tools/file/FilePathPolicy.js"
import { cleanupTextFixture, makeTextFixture } from "./TestTextFixtures.js"

const makeLayer = () =>
  FilePathPolicy.layer.pipe(
    Layer.provide(NodeServices.layer)
  )

describe("FilePathPolicy", () => {
  it.effect("rejects lexical traversal outside workspace", () =>
    Effect.gen(function*() {
      const policy = yield* FilePathPolicy
      const error = yield* policy.resolveForRead("../outside.txt").pipe(Effect.flip)
      expect(error._tag).toBe("FileWorkspaceViolation")
    }).pipe(
      Effect.provide(makeLayer())
    )
  )

  it.effect("rejects canonical alias escape through symlink", () => {
    const fixture = makeTextFixture("file-path-policy-canonical")
    const relativePath = fixture.relative("escape", "target.txt")

    return Effect.gen(function*() {
      symlinkSync("/tmp", fixture.absolute("escape"), "dir")

      const policy = yield* FilePathPolicy
      const error = yield* policy.resolveForRead(relativePath).pipe(Effect.flip)
      expect(error._tag).toBe("FileWorkspaceViolation")
    }).pipe(
      Effect.provide(makeLayer()),
      Effect.ensuring(
        Effect.sync(() => {
          cleanupTextFixture(fixture)
        })
      )
    )
  })

  it.effect("rejects broken final symlink that points outside workspace", () => {
    const fixture = makeTextFixture("file-path-policy-broken-link")
    const relativePath = fixture.relative("broken.txt")
    const outsideTarget = `/tmp/nonexistent-${crypto.randomUUID()}`

    return Effect.gen(function*() {
      symlinkSync(outsideTarget, fixture.absolute("broken.txt"), "file")

      const policy = yield* FilePathPolicy
      const error = yield* policy.resolveForWrite(relativePath).pipe(Effect.flip)
      expect(error._tag).toBe("FileWorkspaceViolation")
    }).pipe(
      Effect.provide(makeLayer()),
      Effect.ensuring(
        Effect.sync(() => {
          cleanupTextFixture(fixture)
        })
      )
    )
  })

  it.effect("rejects symlink hop escaping outside workspace", () => {
    const fixture = makeTextFixture("file-path-policy-hop")
    const relativePath = fixture.relative("hop", "file.txt")

    return Effect.gen(function*() {
      symlinkSync("/tmp", fixture.absolute("hop"), "dir")

      const policy = yield* FilePathPolicy
      const error = yield* policy.resolveForEdit(relativePath).pipe(Effect.flip)
      expect(error._tag).toBe("FileWorkspaceViolation")
    }).pipe(
      Effect.provide(makeLayer()),
      Effect.ensuring(
        Effect.sync(() => {
          cleanupTextFixture(fixture)
        })
      )
    )
  })

  it.effect("rejects hardlinked targets for mutation paths", () => {
    const fixture = makeTextFixture("file-path-policy-hardlink")
    const originalPath = fixture.absolute("original.txt")
    const hardlinkPath = fixture.absolute("hardlink.txt")
    const relativePath = fixture.relative("hardlink.txt")

    return Effect.gen(function*() {
      writeFileSync(originalPath, "linked")
      linkSync(originalPath, hardlinkPath)

      const policy = yield* FilePathPolicy
      const error = yield* policy.resolveForWrite(relativePath).pipe(Effect.flip)
      expect(error._tag).toBe("FileWorkspaceViolation")
    }).pipe(
      Effect.provide(makeLayer()),
      Effect.ensuring(
        Effect.sync(() => {
          cleanupTextFixture(fixture)
        })
      )
    )
  })
})
