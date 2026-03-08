import { NodeServices } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import type { AgentId, SessionId } from "@template/domain/ids"
import { Effect, Layer } from "effect"
import { readFileSync, writeFileSync } from "node:fs"
import type { CommandInvocationContext } from "../src/tools/command/CommandTypes.js"
import { FileHookError } from "../src/tools/file/FileErrors.js"
import { FileHooks, type FileHook } from "../src/tools/file/FileHooks.js"
import { FilePathPolicy } from "../src/tools/file/FilePathPolicy.js"
import { FileReadTracker } from "../src/tools/file/FileReadTracker.js"
import { FileRuntime } from "../src/tools/file/FileRuntime.js"
import { SandboxRuntime } from "../src/safety/SandboxRuntime.js"
import { cleanupTextFixture, makeTextFixture } from "./TestTextFixtures.js"

const defaultContext: CommandInvocationContext = {
  source: "cli",
  sessionId: "session:file-runtime" as SessionId
}

const sensitiveSources: ReadonlyArray<CommandInvocationContext["source"]> = [
  "tool",
  "checkpoint_replay",
  "schedule",
  "integration"
]

const makeRuntimeLayer = (hooks?: ReadonlyArray<FileHook>) => {
  const fileHooksLayer = hooks === undefined
    ? FileHooks.layer
    : FileHooks.fromHooks(hooks)
  const filePathPolicyLayer = FilePathPolicy.layer.pipe(
    Layer.provide(NodeServices.layer)
  )
  const fileReadTrackerLayer = FileReadTracker.layer

  return FileRuntime.layer.pipe(
    Layer.provide(fileHooksLayer),
    Layer.provide(fileReadTrackerLayer),
    Layer.provide(filePathPolicyLayer),
    Layer.provide(SandboxRuntime.layer),
    Layer.provide(NodeServices.layer)
  )
}

describe("FileRuntime", () => {
  it.effect("reads files and runs before/after hooks in order", () => {
    const fixture = makeTextFixture("file-runtime-read")
    const relativePath = fixture.relative("sample.txt")
    const absolutePath = fixture.absolute("sample.txt")
    const order: Array<string> = []

    writeFileSync(absolutePath, "hello runtime", "utf8")

    return Effect.gen(function*() {
      const runtime = yield* FileRuntime
      const result = yield* runtime.read({
        context: defaultContext,
        path: relativePath
      })

      expect(result.content).toBe("hello runtime")
      expect(order).toEqual(["before", "after"])
    }).pipe(
      Effect.provide(makeRuntimeLayer([
        {
          id: "before-read",
          beforeRead: () =>
            Effect.sync(() => {
              order.push("before")
            })
        },
        {
          id: "after-read",
          afterRead: () =>
            Effect.sync(() => {
              order.push("after")
            })
        }
      ])),
      Effect.ensuring(
        Effect.sync(() => {
          cleanupTextFixture(fixture)
        })
      )
    )
  })

  it.effect("returns FileNotFound for missing reads", () =>
    Effect.gen(function*() {
      const runtime = yield* FileRuntime
      const error = yield* runtime.read({
        context: defaultContext,
        path: `tmp/file-runtime-missing-${crypto.randomUUID()}.txt`
      }).pipe(Effect.flip)
      expect(error._tag).toBe("FileNotFound")
    }).pipe(
      Effect.provide(makeRuntimeLayer())
    )
  )

  it.effect("rejects read paths outside workspace", () =>
    Effect.gen(function*() {
      const runtime = yield* FileRuntime
      const error = yield* runtime.read({
        context: defaultContext,
        path: "../outside.txt"
      }).pipe(Effect.flip)
      expect(error._tag).toBe("FileWorkspaceViolation")
    }).pipe(
      Effect.provide(makeRuntimeLayer())
    )
  )

  it.effect("rejects stale writes after tracked reads", () => {
    const fixture = makeTextFixture("file-runtime-stale")
    const relativePath = fixture.relative("stale.txt")
    const absolutePath = fixture.absolute("stale.txt")

    writeFileSync(absolutePath, "initial", "utf8")

    return Effect.gen(function*() {
      const runtime = yield* FileRuntime

      yield* runtime.read({
        context: defaultContext,
        path: relativePath
      })

      writeFileSync(absolutePath, "changed externally", "utf8")

      const error = yield* runtime.write({
        context: defaultContext,
        request: {
          path: relativePath,
          content: "new-runtime-content"
        }
      }).pipe(Effect.flip)

      expect(error._tag).toBe("FileStaleRead")
    }).pipe(
      Effect.provide(makeRuntimeLayer()),
      Effect.ensuring(
        Effect.sync(() => {
          cleanupTextFixture(fixture)
        })
      )
    )
  })

  it.effect("allows untracked writes and records bytes written", () => {
    const fixture = makeTextFixture("file-runtime-write")
    const relativePath = fixture.relative("write.txt")
    const absolutePath = fixture.absolute("write.txt")

    return Effect.gen(function*() {
      const runtime = yield* FileRuntime
      const result = yield* runtime.write({
        context: defaultContext,
        request: {
          path: relativePath,
          content: "write from runtime"
        }
      })

      expect(result.bytesWritten).toBeGreaterThan(0)
      expect(readFileSync(absolutePath, "utf8")).toBe("write from runtime")
    }).pipe(
      Effect.provide(makeRuntimeLayer()),
      Effect.ensuring(
        Effect.sync(() => {
          cleanupTextFixture(fixture)
        })
      )
    )
  })

  it.effect("maps beforeWrite hook failures to FileHookRejected", () => {
    const fixture = makeTextFixture("file-runtime-hook-reject")
    const relativePath = fixture.relative("hook.txt")

    return Effect.gen(function*() {
      const runtime = yield* FileRuntime
      const error = yield* runtime.write({
        context: defaultContext,
        request: {
          path: relativePath,
          content: "blocked"
        }
      }).pipe(Effect.flip)

      expect(error._tag).toBe("FileHookRejected")
      if (error._tag === "FileHookRejected") {
        expect(error.hookId).toBe("reject-all")
      }
    }).pipe(
      Effect.provide(makeRuntimeLayer([
        {
          id: "reject-all",
          beforeWrite: () =>
            Effect.fail(
              new FileHookError({
                reason: "blocked by test hook"
              })
            )
        }
      ])),
      Effect.ensuring(
        Effect.sync(() => {
          cleanupTextFixture(fixture)
        })
      )
    )
  })

  it.effect("edits files with a unique match and returns unified diff", () => {
    const fixture = makeTextFixture("file-runtime-edit")
    const relativePath = fixture.relative("edit.txt")
    const absolutePath = fixture.absolute("edit.txt")

    writeFileSync(absolutePath, "hello world\n", "utf8")

    return Effect.gen(function*() {
      const runtime = yield* FileRuntime
      const result = yield* runtime.edit({
        context: defaultContext,
        request: {
          path: relativePath,
          oldString: "hello world",
          newString: "hello effect"
        }
      })

      expect(result.diff).toContain("--- a/")
      expect(readFileSync(absolutePath, "utf8")).toContain("hello effect")
    }).pipe(
      Effect.provide(makeRuntimeLayer()),
      Effect.ensuring(
        Effect.sync(() => {
          cleanupTextFixture(fixture)
        })
      )
    )
  })

  it.effect("rejects ambiguous and missing edit targets", () => {
    const fixture = makeTextFixture("file-runtime-edit-failures")
    const ambiguousRelativePath = fixture.relative("ambiguous.txt")
    const ambiguousAbsolutePath = fixture.absolute("ambiguous.txt")
    const missingRelativePath = fixture.relative("missing.txt")
    const missingAbsolutePath = fixture.absolute("missing.txt")

    writeFileSync(ambiguousAbsolutePath, "token\nmiddle\ntoken\n", "utf8")
    writeFileSync(missingAbsolutePath, "another file", "utf8")

    return Effect.gen(function*() {
      const runtime = yield* FileRuntime

      const ambiguous = yield* runtime.edit({
        context: defaultContext,
        request: {
          path: ambiguousRelativePath,
          oldString: "token",
          newString: "patched"
        }
      }).pipe(Effect.flip)
      expect(ambiguous._tag).toBe("FileEditAmbiguous")

      const missing = yield* runtime.edit({
        context: defaultContext,
        request: {
          path: missingRelativePath,
          oldString: "not-here",
          newString: "patched"
        }
      }).pipe(Effect.flip)
      expect(missing._tag).toBe("FileEditNotFound")
    }).pipe(
      Effect.provide(makeRuntimeLayer()),
      Effect.ensuring(
        Effect.sync(() => {
          cleanupTextFixture(fixture)
        })
      )
    )
  })

  for (const source of sensitiveSources) {
    it.effect(`requires sandbox context for sensitive file source=${source}`, () =>
      Effect.gen(function*() {
        const runtime = yield* FileRuntime
        const error = yield* runtime.read({
          context: {
            source,
            agentId: "agent:file-runtime-test" as AgentId
          },
          path: `tmp/file-runtime-missing-${crypto.randomUUID()}.txt`
        }).pipe(Effect.flip)
        expect(error._tag).toBe("SandboxViolation")
      }).pipe(
        Effect.provide(makeRuntimeLayer())
      ))
  }

  for (const source of sensitiveSources) {
    it(`allows sensitive file source=${source} when inside sandbox context`, async () => {
      const fixture = makeTextFixture("file-runtime-sandbox")
      const relativePath = fixture.relative("sandbox.txt")
      const absolutePath = fixture.absolute("sandbox.txt")
      writeFileSync(absolutePath, "sandboxed", "utf8")

      try {
        await Effect.runPromise(
          Effect.gen(function*() {
            const runtime = yield* FileRuntime
            const sandboxRuntime = yield* SandboxRuntime
            const result = yield* sandboxRuntime.enter(
              "agent:file-runtime-test" as AgentId,
              runtime.read({
                context: {
                  source,
                  agentId: "agent:file-runtime-test" as AgentId
                },
                path: relativePath
              })
            )

            expect(result.content).toBe("sandboxed")
          }).pipe(
            Effect.provide(
              Layer.mergeAll(
                makeRuntimeLayer(),
                SandboxRuntime.layer
              )
            )
          )
        )
      } finally {
        cleanupTextFixture(fixture)
      }
    })
  }
})
