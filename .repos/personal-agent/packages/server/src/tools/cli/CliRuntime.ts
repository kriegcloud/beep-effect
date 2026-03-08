import { Effect, Layer, ServiceMap } from "effect"
import {
  CliRuntimeUnavailable,
  type CliRuntimeError
} from "./CliErrors.js"
import type { CliRunRequest, CliRunResult } from "./CliTypes.js"

export interface CliRuntimeService {
  readonly run: (
    request: CliRunRequest
  ) => Effect.Effect<CliRunResult, CliRuntimeError>
}

export class CliRuntime extends ServiceMap.Service<CliRuntime>()(
  "server/tools/cli/CliRuntime",
  {
    make: Effect.succeed((() => {
      const run: CliRuntimeService["run"] = (_request) =>
        Effect.fail(
          new CliRuntimeUnavailable({
            reason: "cli runtime not configured"
          })
        )

      return {
        run
      } satisfies CliRuntimeService
    })())
  }
) {
  static layer = Layer.effect(this, this.make)

  static fromExecution = (
    run: CliRuntimeService["run"]
  ): Layer.Layer<CliRuntime> =>
    Layer.succeed(this, {
      run
    } satisfies CliRuntimeService)
}
