import { Effect, Layer } from "effect"
import * as nodeFs from "node:fs"
import * as os from "node:os"
import * as nodePath from "node:path"
import { SandboxFactory } from "../../src/Sandbox"

export interface FakeSandboxMetrics {
  createCalls: number
  executeCalls: number
  readonly snippets: Array<string>
}

export const makeFakeSandboxFactoryLayer = (
  metrics?: FakeSandboxMetrics,
  options?: { executeHandler?: (code: string, vars: Map<string, unknown>) => string }
): Layer.Layer<SandboxFactory> =>
  Layer.succeed(
    SandboxFactory,
    SandboxFactory.of({
      create: (_options) => {
        if (metrics) {
          metrics.createCalls += 1
        }

        const vars = new Map<string, unknown>()
        const workDir = nodeFs.mkdtempSync(nodePath.join(os.tmpdir(), "rlm-fake-sandbox-"))

        return Effect.succeed({
          workDir,
          execute: Effect.fn("FakeSandbox.execute")(function*(code: string) {
            metrics?.snippets.push(code)
            if (metrics) {
              metrics.executeCalls += 1
            }
            if (options?.executeHandler) {
              return options.executeHandler(code, vars)
            }
            return `executed:${code.length}`
          }),
          setVariable: Effect.fn("FakeSandbox.setVariable")(function*(name: string, value: unknown) {
            vars.set(name, value)
          }),
          getVariable: Effect.fn("FakeSandbox.getVariable")(function*(name: string) {
            return vars.get(name)
          }),
          listVariables: Effect.fn("FakeSandbox.listVariables")(function*() {
            return Array.from(vars.entries()).map(([name, value]) => ({
              name,
              type: value === null ? "null" : typeof value,
              ...(typeof value === "string" ? { size: value.length } : {}),
              preview: typeof value === "string"
                ? (value.length > 200 ? value.slice(0, 200) + "..." : value)
                : String(value)
            }))
          })
        })
      }
    })
  )
