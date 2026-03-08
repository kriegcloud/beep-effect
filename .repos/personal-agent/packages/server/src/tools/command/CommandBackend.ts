import { Effect, Layer, ServiceMap } from "effect"
import {
  CommandBackendUnavailable,
  type CommandExecutionError
} from "./CommandErrors.js"
import type { CommandPlan, CommandResult } from "./CommandTypes.js"

export interface CommandBackendService {
  readonly executePlan: (
    plan: CommandPlan
  ) => Effect.Effect<CommandResult, CommandExecutionError>
}

export class CommandBackend extends ServiceMap.Service<CommandBackend>()(
  "server/tools/command/CommandBackend",
  {
    make: Effect.succeed((() => {
      const executePlan: CommandBackendService["executePlan"] = (_plan) =>
        Effect.fail(
          new CommandBackendUnavailable({
            reason: "command backend not configured"
          })
        )

      return {
        executePlan
      } satisfies CommandBackendService
    })())
  }
) {
  static layer = Layer.effect(this, this.make)

  static fromExecution = (
    executePlan: CommandBackendService["executePlan"]
  ): Layer.Layer<CommandBackend> =>
    Layer.succeed(this, {
      executePlan
    } satisfies CommandBackendService)
}
