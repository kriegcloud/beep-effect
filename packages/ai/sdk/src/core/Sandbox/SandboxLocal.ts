import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { SandboxService, type ExecResult } from "./SandboxService.js"
import { SandboxError } from "./SandboxError.js"
import { QuerySupervisor } from "../QuerySupervisor.js"

const mapError = (operation: string, cause: unknown) =>
  SandboxError.make({
    message: `local sandbox ${operation} failed`,
    operation,
    provider: "local",
    cause
  })

const make = Effect.gen(function*() {
  const supervisor = yield* QuerySupervisor

  // Uses array-form spawn (no shell interpretation) to prevent command injection.
  // Matches existing pattern in src/Diagnose.ts:93.
  const exec = Effect.fn("SandboxLocal.exec")(
    (command: string, args?: ReadonlyArray<string>) =>
      Effect.tryPromise({
        try: async () => {
          const cmd = args ? [command, ...args] : [command]
          const result = Bun.spawnSync({ cmd })
          return {
            stdout: result.stdout.toString(),
            stderr: result.stderr.toString(),
            exitCode: result.exitCode
          } satisfies ExecResult
        },
        catch: (cause) => mapError("exec", cause)
      })
  )

  const writeFile = Effect.fn("SandboxLocal.writeFile")(
    (path: string, content: string) =>
      Effect.tryPromise({
        try: () => Bun.write(path, content),
        catch: (cause) => mapError("writeFile", cause)
      }).pipe(Effect.asVoid)
  )

  const readFile = Effect.fn("SandboxLocal.readFile")(
    (path: string) =>
      Effect.tryPromise({
        try: () => Bun.file(path).text(),
        catch: (cause) => mapError("readFile", cause)
      })
  )

  const runAgent = Effect.fn("SandboxLocal.runAgent")(
    (prompt: string, options?: import("../Schema/Options.js").Options) =>
      supervisor.submit(prompt, options).pipe(
        Effect.mapError((cause) => mapError("runAgent", cause))
      )
  )

  // INVARIANT: isolated MUST be false for the local layer.
  // The QuerySupervisor's dispatchQuery checks `isolated === true` before
  // routing to SandboxService.runAgent. If this were true, it would create
  // an infinite loop: supervisor.submit -> dispatchQuery -> runAgent -> supervisor.submit -> ...
  // The `isolated: false` guard breaks this cycle. Do NOT change this
  // without also changing the supervisor dispatch logic.
  return SandboxService.of({
    provider: "local",
    isolated: false,
    exec,
    writeFile,
    readFile,
    runAgent,
    destroy: Effect.void
  })
})

export const layerLocal: Layer.Layer<SandboxService, never, QuerySupervisor> =
  Layer.effect(SandboxService, make)
