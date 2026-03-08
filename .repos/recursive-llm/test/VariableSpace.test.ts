import { describe, expect, test } from "bun:test"
import { Effect, Ref } from "effect"
import type { VariableSnapshot } from "../src/CallContext"
import { makeVariableSpace } from "../src/VariableSpace"
import type { SandboxInstance } from "../src/Sandbox"

const makeSandbox = (): SandboxInstance => {
  const vars = new Map<string, unknown>()

  return {
    execute: () => Effect.succeed(""),
    setVariable: (name, value) => Effect.sync(() => {
      vars.set(name, value)
    }),
    getVariable: (name) => Effect.succeed(vars.get(name)),
    listVariables: () =>
      Effect.succeed(
        Array.from(vars.entries()).map(([name, value]) => ({
          name,
          type: value === null ? "null" : Array.isArray(value) ? "array" : typeof value,
          ...(typeof value === "string" ? { size: value.length } : {}),
          preview: String(value)
        }))
      )
  }
}

describe("VariableSpace", () => {
  test("inject, injectAll and read work through sandbox", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function*() {
        const sandbox = makeSandbox()
        const snapshotRef = yield* Ref.make<VariableSnapshot>({
          variables: [],
          snapshotIteration: 0,
          syncedAtMs: Date.now()
        })
        const iterationRef = yield* Ref.make(0)
        const vars = makeVariableSpace(sandbox, snapshotRef, iterationRef)

        yield* vars.inject("a", 1)
        yield* vars.injectAll({ b: "two", c: true })
        const a = yield* vars.read("a")
        const b = yield* vars.read("b")
        const c = yield* vars.read("c")
        return { a, b, c }
      })
    )

    expect(result).toEqual({ a: 1, b: "two", c: true })
  })

  test("sync refreshes snapshot with current iteration", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function*() {
        const sandbox = makeSandbox()
        const snapshotRef = yield* Ref.make<VariableSnapshot>({
          variables: [],
          snapshotIteration: 0,
          syncedAtMs: Date.now()
        })
        const iterationRef = yield* Ref.make(3)
        const vars = makeVariableSpace(sandbox, snapshotRef, iterationRef)

        yield* vars.injectAll({ alpha: "hello", beta: 42 })
        const synced = yield* vars.sync
        const cached = yield* vars.cached
        return { synced, cached }
      })
    )

    expect(result.synced.snapshotIteration).toBe(3)
    expect(result.synced.variables.map((v) => v.name).sort()).toEqual(["alpha", "beta"])
    expect(result.cached).toEqual(result.synced)
  })
})
