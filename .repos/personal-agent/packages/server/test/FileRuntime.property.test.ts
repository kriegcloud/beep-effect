import { NodeServices } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import type { SessionId } from "@template/domain/ids"
import { Effect, Layer } from "effect"
import fc from "fast-check"
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { SandboxRuntime } from "../src/safety/SandboxRuntime.js"
import type { CommandInvocationContext } from "../src/tools/command/CommandTypes.js"
import { FileHooks } from "../src/tools/file/FileHooks.js"
import { FilePathPolicy } from "../src/tools/file/FilePathPolicy.js"
import { FileReadTracker } from "../src/tools/file/FileReadTracker.js"
import { FileRuntime } from "../src/tools/file/FileRuntime.js"
import { cleanupTextFixture, makeTextFixture } from "./TestTextFixtures.js"

const defaultContext: CommandInvocationContext = {
  source: "cli",
  sessionId: "session:file-runtime-property" as SessionId
}

const makeLayer = () => {
  const filePathPolicyLayer = FilePathPolicy.layer.pipe(
    Layer.provide(NodeServices.layer)
  )
  return FileRuntime.layer.pipe(
    Layer.provide(FileHooks.layer),
    Layer.provide(FileReadTracker.layer),
    Layer.provide(filePathPolicyLayer),
    Layer.provide(SandboxRuntime.layer),
    Layer.provide(NodeServices.layer)
  )
}

describe("FileRuntime property tests", () => {
  it("always rejects traversal read paths outside workspace", async () => {
    const layer = makeLayer()

    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 6 }),
        fc.stringMatching(/^[a-zA-Z0-9_-]{1,12}$/),
        async (depth, segment) => {
          const traversal = `${"../".repeat(depth)}${segment}.txt`
          const error = await Effect.runPromise(
            Effect.gen(function*() {
              const runtime = yield* FileRuntime
              return yield* runtime.read({
                context: defaultContext,
                path: traversal
              }).pipe(Effect.flip)
            }).pipe(
              Effect.provide(layer)
            )
          )
          expect(error._tag).toBe("FileWorkspaceViolation")
        }
      ),
      { numRuns: 60 }
    )
  })

  it("unique edits replace exactly one span", async () => {
    const layer = makeLayer()

    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[a-z]{0,20}$/),
        fc.stringMatching(/^[a-z]{0,20}$/),
        fc.stringMatching(/^[a-z]{0,20}$/),
        async (prefix, suffix, replacement) => {
          const fixture = makeTextFixture("file-runtime-prop-unique")
          const relativePath = fixture.relative("unique.txt")
          const absolutePath = fixture.absolute("unique.txt")
          const token = "TOKEN_UNIQUE"
          const original = `${prefix}${token}${suffix}`
          writeFileSync(absolutePath, original, "utf8")

          try {
            await Effect.runPromise(
              Effect.gen(function*() {
                const runtime = yield* FileRuntime
                yield* runtime.edit({
                  context: defaultContext,
                  request: {
                    path: relativePath,
                    oldString: token,
                    newString: replacement
                  }
                })
              }).pipe(
                Effect.provide(layer)
              )
            )

            const next = readFileSync(absolutePath, "utf8")
            expect(next).toBe(`${prefix}${replacement}${suffix}`)
          } finally {
            cleanupTextFixture(fixture)
          }
        }
      ),
      { numRuns: 45 }
    )
  })

  it("non-unique edits fail with FileEditAmbiguous", async () => {
    const layer = makeLayer()

    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[a-z]{0,12}$/),
        async (separator) => {
          const fixture = makeTextFixture("file-runtime-prop-ambiguous")
          const relativePath = fixture.relative("ambiguous.txt")
          const absolutePath = fixture.absolute("ambiguous.txt")
          writeFileSync(absolutePath, `TOKEN${separator}TOKEN`, "utf8")

          try {
            const error = await Effect.runPromise(
              Effect.gen(function*() {
                const runtime = yield* FileRuntime
                return yield* runtime.edit({
                  context: defaultContext,
                  request: {
                    path: relativePath,
                    oldString: "TOKEN",
                    newString: "patched"
                  }
                }).pipe(Effect.flip)
              }).pipe(
                Effect.provide(layer)
              )
            )
            expect(error._tag).toBe("FileEditAmbiguous")
          } finally {
            cleanupTextFixture(fixture)
          }
        }
      ),
      { numRuns: 35 }
    )
  })

  it("write/read roundtrips preserve bytes", async () => {
    const layer = makeLayer()

    await fc.assert(
      fc.asyncProperty(
        fc.string({ maxLength: 200 }),
        async (payload) => {
          const fixture = makeTextFixture("file-runtime-prop-roundtrip")
          const relativePath = fixture.relative("roundtrip.txt")

          try {
            await Effect.runPromise(
              Effect.gen(function*() {
                const runtime = yield* FileRuntime
                yield* runtime.write({
                  context: defaultContext,
                  request: {
                    path: relativePath,
                    content: payload
                  }
                })

                const read = yield* runtime.read({
                  context: defaultContext,
                  path: relativePath
                })
                expect(read.content).toBe(payload)
              }).pipe(
                Effect.provide(layer)
              )
            )
          } finally {
            cleanupTextFixture(fixture)
          }
        }
      ),
      { numRuns: 35 }
    )
  })

  it("repeated writes leave no .tmp artifacts behind", async () => {
    const layer = makeLayer()

    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.string({ maxLength: 80 }), { minLength: 1, maxLength: 6 }),
        async (payloads) => {
          const fixture = makeTextFixture("file-runtime-prop-temp-cleanup")
          const relativePath = fixture.relative("cleanup.txt")

          try {
            await Effect.runPromise(
              Effect.gen(function*() {
                const runtime = yield* FileRuntime
                for (const payload of payloads) {
                  yield* runtime.write({
                    context: defaultContext,
                    request: {
                      path: relativePath,
                      content: payload
                    }
                  })
                }
              }).pipe(
                Effect.provide(layer)
              )
            )

            const leftovers = readdirSync(fixture.root).filter((entry) => entry.endsWith(".tmp"))
            expect(leftovers).toHaveLength(0)
          } finally {
            cleanupTextFixture(fixture)
          }
        }
      ),
      { numRuns: 25 }
    )
  })
})
